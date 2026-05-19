package com.fcp.ne.dto;

public class RecommendDTO {
    private Integer productId;
    private String name;
    private Double support;

    public RecommendDTO(Integer productId, String name, Double support) {
        this.productId = productId;
        this.name = name;
        this.support = support;
    }

    public String getName() {
        return name;
    }

    public Integer getProductId() {
        return productId;
    }

    public Double getSupport() {
        return support;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("RecommendDTO{");
        sb.append("productId=").append(productId);
        sb.append(", name='").append(name).append('\'');
        sb.append(", support=").append(support);
        sb.append('}');
        return sb.toString();
    }
}
