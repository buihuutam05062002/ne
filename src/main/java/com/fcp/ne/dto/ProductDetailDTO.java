package com.fcp.ne.dto;

public class ProductDetailDTO {
    private int    id;
    private String name;
    private double price;
    private String color;
    private String size;
    private double weight;
    private String productNumber;
    private String subCategory;
    private String category;
    private String description;


    public ProductDetailDTO(int id, String name, double price, String color, double weight, String size, String productNumber, String subCategory, String category, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.color = color;
        this.weight = weight;
        this.size = size;
        this.productNumber = productNumber;
        this.subCategory = subCategory;
        this.category = category;
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String getColor() {
        return color;
    }

    public String getSize() {
        return size;
    }

    public double getWeight() {
        return weight;
    }

    public String getProductNumber() {
        return productNumber;
    }

    public String getSubCategory() {
        return subCategory;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }
}