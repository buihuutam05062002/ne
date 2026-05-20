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
