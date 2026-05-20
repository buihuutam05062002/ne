package com.fcp.ne.service;

import com.fcp.ne.application.AlgoNEclatClosed;
import com.fcp.ne.dto.FCPresultDTO;
import com.fcp.ne.dto.ProductDTO;
import com.fcp.ne.dto.ProductDetailDTO;
import com.fcp.ne.dto.RecommendDTO;
import com.fcp.ne.mapping.Itemset;
import com.fcp.ne.mapping.ProductMap;
import com.fcp.ne.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NeService {
    private AlgoNEclatClosed algoNEclatClosed = new AlgoNEclatClosed();
    private List<Itemset> itemsets = new ArrayList<>();;
    private Map<Integer, String> productMap;
    private final ProductRepository productRepository;
    public Map<Integer, String> getProductMap() {
        return productMap;
    }

    public NeService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    private static final String OUTPUT_PATH = "src/main/java/com/fcp/ne/dataset/output/output.txt";


    public List<Itemset> runAlgo(MultipartFile multipartFile, double minSup) throws IOException {
        Path saved = Files.createTempFile("", multipartFile.getOriginalFilename());
        multipartFile.transferTo(saved);
        algoNEclatClosed.runAlgo(saved.toString(), minSup, OUTPUT_PATH);
        itemsets = ProductMap.getMappedItemsets(OUTPUT_PATH);

        productMap = productRepository.getProductMap();
        return itemsets;
    }

    public List<ProductDTO> getProducts() {
        return productRepository.getProductMap()
                .entrySet().stream()
                .map(e -> new ProductDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(ProductDTO::getName))
                .collect(Collectors.toList());
    }


    public List<RecommendDTO> recommend(List<Integer> basKet, int k) {
        int n = basKet.size();
        List<RecommendDTO> recommendDTOS = new ArrayList<>();
        for (Itemset itemset : itemsets) {
            List<Integer> items = itemset.getItems();
            if (items.size() != n + 1) {
                continue;
            }
            if (!items.containsAll(basKet)) {
                continue;
            }
            List<Integer> remain = new ArrayList<>(items);
            remain.removeAll(basKet);
            for (Integer id : remain) {
                double support =  itemset.getSupport();
                String name = productMap.get(id);
                recommendDTOS.add(new RecommendDTO(id, name, support));
            }
        }
        if (recommendDTOS.isEmpty() && n > 1) {
            for (int i = n - 1; i >= 0; i--) {
                List<Integer> singleBasket = List.of(basKet.get(i));
                recommendDTOS = recommend(singleBasket, k);
                if (!recommendDTOS.isEmpty()) break;
            }
        }
        Collections.sort(recommendDTOS, (r1, r2) ->
                Double.compare(r2.getSupport(), r1.getSupport()));

        return recommendDTOS.subList(0, Math.min(k, recommendDTOS.size()));
    }

    public FCPresultDTO getStats() {
        return new FCPresultDTO(algoNEclatClosed.getNumOfTrans(), algoNEclatClosed.getNumOfFItem(), algoNEclatClosed.getOutputCount());
    }
    public ProductDetailDTO getProductDetail(int productId) {
        return productRepository.getProductDetail(productId);
    }

}

