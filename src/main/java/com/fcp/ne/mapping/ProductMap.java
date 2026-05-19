package com.fcp.ne.mapping;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class ProductMap {

    public static Map<Integer, String> mapProduct(String dataMap) throws IOException {
        Map<Integer, String> products = new HashMap<>();

        BufferedReader br = new BufferedReader(new FileReader(dataMap));

        String line;

        while ((line = br.readLine()) != null) {
            String part[] = line.split("\\s+", 2);
            products.put(Integer.parseInt(part[0]), part[1]);
        }
        br.close();

        return products;
    }

    public static void writeItemsetsMaptoFile(String input, String output, String dataMap) throws IOException {
        StringBuilder buffer = new StringBuilder();
        BufferedWriter writer = new BufferedWriter(new FileWriter(output));

        Map<Integer, String> products = mapProduct(dataMap);

        BufferedReader br = new BufferedReader(new FileReader(input));

        String line;
        while ((line = br.readLine()) != null) {
            String parts[] = line.split("#SUP:");

            String itemsPart = parts[0].trim();
            String supPart = parts[1].trim();

            String[] items = itemsPart.split("\\s+");

            int support = Integer.parseInt(supPart);

            for (int i = 0; i < items.length; i++) {
                buffer.append(products.get(Integer.parseInt(items[i])));
                if (i < items.length - 1) {
                    buffer.append(" ");
                }
            }
            buffer.append(" #SUP: ").append(support);
            buffer.append("\n");
        }
        br.close();
        writer.write(buffer.toString());
        writer.close();
    }

    public static List<Itemset> getMappedItemsets(String input) throws IOException {
        List<Itemset> itemsets = new ArrayList<>();
        BufferedReader br = new BufferedReader(new FileReader(input));
        String line;
        while ((line = br.readLine()) != null) {
            String[] parts = line.split("#SUP:");
            String[] items = parts[0].trim().split("\\s+");
            int support = Integer.parseInt(parts[1].trim());

            List<Integer> itemIds = new ArrayList<>();
            for (String item : items) {
                itemIds.add(Integer.parseInt(item));
            }
            itemsets.add(new Itemset(itemIds, support));
        }
        br.close();
        return itemsets;
    }
}
