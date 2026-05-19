package com.fcp.ne.controller;

import com.fcp.ne.dto.FCPresultDTO;
import com.fcp.ne.dto.ProductDTO;
import com.fcp.ne.dto.ProductDetailDTO;
import com.fcp.ne.dto.RecommendDTO;
import com.fcp.ne.mapping.Itemset;
import com.fcp.ne.service.NeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class NEcontroller {
    private NeService neService ;
    public NEcontroller(NeService neService) {
        this.neService = neService;
    }
    @PostMapping("/mining")
    public ResponseEntity<List<Itemset>> miningFcp(
            @RequestParam MultipartFile transactionFile,
            @RequestParam double minSupport) throws IOException {
        List<Itemset> itemsets = neService.runAlgo(transactionFile, minSupport);
        return ResponseEntity.ok(itemsets);
    }



    @GetMapping("/productmap")
    public ResponseEntity<Map<Integer, String>> getProductMap() {
        return ResponseEntity.ok(neService.getProductMap());
    }
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getProducts() {
        return ResponseEntity.ok(neService.getFrequentProducts());
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<RecommendDTO>> recommend(
            @RequestBody List<Integer> basketIds,
            @RequestParam int K) {
        return ResponseEntity.ok(neService.recommend(basketIds, K));
    }

    @GetMapping("/stats")
    public ResponseEntity<FCPresultDTO> getStats() {
        return ResponseEntity.ok(neService.getStats());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDetailDTO> getProductDetail(@PathVariable int id) {
        return ResponseEntity.ok(neService.getProductDetail(id));
    }

}
