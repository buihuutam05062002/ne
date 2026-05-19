package com.fcp.ne.repository;

import com.fcp.ne.dto.ProductDetailDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
@Repository
public class ProductRepository {

    private final JdbcTemplate jdbcTemplate;

    public ProductRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<Integer, String> getProductMap() {
        String sql = "SELECT p.ProductID, p.Name FROM Production.Product p";

        return jdbcTemplate.query(sql, rs -> {
            Map<Integer, String> map = new HashMap<>();
            while (rs.next()) {
                map.put(rs.getInt("ProductID"), rs.getString("Name"));
            }
            return map;
        });
    }

    public ProductDetailDTO getProductDetail(int productId) {
        String sql = """
            SELECT 
                p.ProductID,
                p.Name,
                p.ListPrice,
                p.Color,
                p.Size,
                p.Weight,
                p.ProductNumber,
                ps.Name  AS SubCategory,
                pc.Name  AS Category,
                ISNULL(pd.Description, 'Chưa có mô tả') AS Description
            FROM Production.Product p
            LEFT JOIN Production.ProductSubcategory ps 
                ON p.ProductSubcategoryID = ps.ProductSubcategoryID
            LEFT JOIN Production.ProductCategory pc 
                ON ps.ProductCategoryID = pc.ProductCategoryID
            LEFT JOIN Production.ProductModel pm 
                ON p.ProductModelID = pm.ProductModelID
            LEFT JOIN Production.ProductModelProductDescriptionCulture pmpdc 
                ON pm.ProductModelID = pmpdc.ProductModelID
                AND pmpdc.CultureID = 'en'
            LEFT JOIN Production.ProductDescription pd 
                ON pmpdc.ProductDescriptionID = pd.ProductDescriptionID
            WHERE p.ProductID = ?
        """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new ProductDetailDTO(
                rs.getInt("ProductID"),
                rs.getString("Name"),
                rs.getDouble("ListPrice"),
                rs.getString("Color"),
                rs.getDouble("Weight"),
                rs.getString("Size"),
                rs.getString("ProductNumber"),
                rs.getString("SubCategory"),
                rs.getString("Category"),
                rs.getString("Description")
        ), productId);
    }
}