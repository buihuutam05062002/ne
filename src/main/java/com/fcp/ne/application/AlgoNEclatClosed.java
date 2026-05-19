package com.fcp.ne.application;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

public class AlgoNEclatClosed {

    BufferedWriter writer = null;

    private int outputCount;
    private int[] itemsetX;
    private int itemsetXLen;
    private int minSupCount;
    private int numOfFItem;
    private int numOfTrans;

    public int getOutputCount() {
        return outputCount;
    }

    public int getItemsetXLen() {
        return itemsetXLen;
    }

    public int getNumOfFItem() {
        return numOfFItem;
    }

    public int getNumOfTrans() {
        return numOfTrans;
    }

    Item[] itemList;

    private Map<Integer, BitSet> mapItemTIDS;

    private CPStorage cpStorage;

    private long startTimestamp;
    private long endTimestamp;

    static Comparator<Item> comp = (a, b) -> b.count - a.count;

    public void runAlgo(String input, double minsup, String output) throws IOException {
        MemoryLogger.getInstance().reset();

        writer = new BufferedWriter(new FileWriter(output));

        startTimestamp = System.currentTimeMillis();

        run(input, minsup, output, writer);

        writer.close();
        MemoryLogger.getInstance().checkMemory();
        endTimestamp = System.currentTimeMillis();
    }

    // chia de tri
    private void run(String input, double minsup, String output, BufferedWriter writer) throws IOException {
        numOfTrans = 0;
        outputCount = 0;
        Map<Integer, Integer> itemCountMap = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new FileReader(input))) {
            String line;
            while ((line = br.readLine()) != null) {
                numOfTrans++;
                for (String s : line.split(" ")) {
                    int item = Integer.parseInt(s.trim());

                    if (itemCountMap.containsKey(item)) {

                        itemCountMap.put(item, itemCountMap.get(item) + 1);
                    } else {
                        itemCountMap.put(item, 1);
                    }
                }
            }
        } catch (Exception e) {
            System.out.println(e);
        }

        minSupCount = (int) Math.ceil(minsup * numOfTrans);

        Item[] tempItems = new Item[itemCountMap.size()];
        int idx = 0;
        for (Map.Entry<Integer, Integer> entry : itemCountMap.entrySet()) {
            if (entry.getValue() >= minSupCount) {
                tempItems[idx] = new Item();
                tempItems[idx].value = entry.getKey();
                tempItems[idx].count = entry.getValue();
                idx++;
            }
        }
        itemList = Arrays.copyOf(tempItems, idx);
        numOfFItem = itemList.length;
        Arrays.sort(itemList, comp);

        itemsetX = new int[numOfFItem];
        itemsetXLen = 0;

        Map<Integer, Integer> itemToLabel = new HashMap<>(numOfFItem * 2);
        for (int i = 0; i < numOfFItem; i++) {
            itemToLabel.put(itemList[i].value, i);
        }

        mapItemTIDS = new HashMap<>(numOfFItem * 2);
        try (BufferedReader br = new BufferedReader(new FileReader(input))) {
            String line;
            int tid = 1;
            while ((line = br.readLine()) != null) {
                for (String s : line.split(" ")) {
                    int item = Integer.parseInt(s.trim());
                    Integer label = itemToLabel.get(item);
                    if (label != null) {

                        BitSet bitSet = mapItemTIDS.get(label);

                        if (bitSet == null) {
                            bitSet = new BitSet();
                            mapItemTIDS.put(label, bitSet);
                        }

                        bitSet.set(tid);
                    }
                }
                tid++;
            }
        } catch (Exception e) {
            System.out.println(e);
        }

        cpStorage = new CPStorage();

        Node root = new Node();
        root.label = numOfFItem;

        Node lastChild = null;
        for (int i = numOfFItem - 1; i >= 0; i--) {
            Node node = new Node();
            node.label = i;
            node.tidSET = mapItemTIDS.get(i);
            node.count = node.tidSET.cardinality();
            if (root.firstChild == null) {
                root.firstChild = node;
                lastChild = node;
            } else {
                lastChild.next = node;
                lastChild = node;
            }
        }

        Node curNode = root.firstChild;
        root.firstChild = null;
        while (curNode != null) {
            visit(curNode, 1);
            Node next = curNode.next;
            curNode.next = null;
            curNode = next;
        }

    }

    class Item {
        int value;
        int count;
    }

    class Node {
        public int label;
        public Node firstChild;
        public Node next;
        public BitSet tidSET;
        public int count;
    }

    public void visit(Node curNode, int level) throws IOException {
        MemoryLogger.getInstance().checkMemory();
        itemsetX[itemsetXLen++] = curNode.label;

        Node sibling = curNode.next;
        Node lastChild = null;
        int sameCount = 0;

        while (sibling != null) {
            Node child = new Node();

            if (level == 1) {
                if (sibling.tidSET.cardinality() != 0) {
                    child.tidSET = (BitSet) curNode.tidSET.clone();
                    child.tidSET.andNot(sibling.tidSET);
                }
            } else {
                if (curNode.tidSET.cardinality() != 0) {
                    child.tidSET = (BitSet) sibling.tidSET.clone();
                    child.tidSET.andNot(curNode.tidSET);
                }
            }

            child.count = curNode.count - child.tidSET.cardinality();

            if (child.count >= minSupCount) {
                if (curNode.count == child.count) {

                    itemsetX[itemsetXLen++] = sibling.label;
                    sameCount++;
                } else {
                    child.label = sibling.label;
                    child.firstChild = null;
                    child.next = null;
                    if (curNode.firstChild == null) {
                        curNode.firstChild = child;
                        lastChild = child;
                    } else {
                        lastChild.next = child;
                        lastChild = child;
                    }
                }
            }

            sibling = sibling.next;
        }
        MyBitVector itemsetBitVector = new MyBitVector(itemsetX, itemsetXLen);
        if (cpStorage.insertIfClose(itemsetBitVector, curNode.count)) {
            writeItemsetsToFile(curNode.count);
        }
        Node child = curNode.firstChild;
        curNode.firstChild = null;
        while (child != null) {
            visit(child, level + 1);
            Node next = child.next;
            child.next = null;
            child = next;
        }
        itemsetXLen -= (1 + sameCount);
    }

    class MyBitVector {
        static long[] TWO_POWER;

        static {
            TWO_POWER = new long[64];
            for (int i = 0; i < 64; i++)
                TWO_POWER[i] = 1L << i;
        }

        long[] bits;
        public int cardinality;

        public MyBitVector(int[] itemset, int last) {
            bits = new long[(itemset[0] / 64) + 1];
            cardinality = last;
            for (int i = 0; i < last; i++) {
                int item = itemset[i];
                bits[item / 64] |= TWO_POWER[item % 64];
            }
        }

        public boolean isSubSet(MyBitVector q) {
            if (cardinality >= q.cardinality)
                return false;
            for (int i = 0; i < bits.length; i++) {
                if ((bits[i] & (~q.bits[i])) != 0)
                    return false;
            }
            return true;
        }
    }

    class CPStorage {
        public Map<Integer, ArrayList<MyBitVector>> mapSupportMyBitVector = new HashMap<>();

        public boolean insertIfClose(MyBitVector itemsetBitVector, int support) {
            boolean result = true;
            ArrayList<MyBitVector> bitvectorList = mapSupportMyBitVector.get(support);
            if (bitvectorList == null) {
                bitvectorList = new ArrayList<>();
                mapSupportMyBitVector.put(support, bitvectorList);
                bitvectorList.add(itemsetBitVector);
            } else {
                int index = 0;
                for (MyBitVector q : bitvectorList) {
                    if (itemsetBitVector.cardinality >= q.cardinality)
                        break;
                    if (itemsetBitVector.isSubSet(q)) {
                        result = false;
                        break;
                    }
                    index++;
                }
                if (result)
                    bitvectorList.add(index, itemsetBitVector);
            }
            return result;
        }
    }

    private void writeItemsetsToFile(int support) throws IOException {
        StringBuilder buffer = new StringBuilder();
        for (int i = 0; i < itemsetXLen; i++) {
            buffer.append(itemList[itemsetX[i]].value);
            buffer.append(' ');
        }
        buffer.append("#SUP: ").append(support);
        buffer.append("\n");
        writer.write(buffer.toString());
        outputCount++;
    }

    public String printStats() {
        StringBuilder buff = new StringBuilder();
        buff.append("========== NEclatClosed - STATS ============").append("\n");
        buff.append("Total time:  ").append(endTimestamp - startTimestamp).append("  ms").append("\n");
        buff.append("Max memory:  ").append(MemoryLogger.getInstance().getMaxMemory()).append("  MB").append("\n");
        return buff.toString();
    }
}