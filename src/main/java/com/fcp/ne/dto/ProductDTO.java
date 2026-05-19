package com.fcp.ne.dto;

public class ProductDTO {

    private int    id;
    private String name;

    public ProductDTO(int id, String name) {
        this.id   = id;
        this.name = name;
    }

    public int    getId()   { return id; }
    public String getName() { return name; }
}