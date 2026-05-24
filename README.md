# Ứng dụng khai thác hành vi mua hàng của khách hàng và gợi ý sản phẩm dựa trên tập mục phổ biến đóng

> Web application for Frequent Closed Itemset Mining and Product Recommendation

Ứng dụng web triển khai thuật toán **NECLATCLOSED** thuật toán khai thác theo hướng dọc (vertical) dựa trên phủ định để khai thác **Frequent Closed Itemsets (FCI)** từ dữ liệu giao dịch, đồng thời hỗ trợ **gợi ý sản phẩm** dựa trên giỏ hàng hiện tại và sản phẩm được chọn.

## Mục lục

- [Tổng quan hệ thống](#tổng-quan-hệ-thống)
- [Chức năng](#chức-năng)
- [Tech Stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [API Reference](#api-reference)
- [Chiến lược gợi ý](#chiến-lược-gợi-ý)


---

## Tổng quan hệ thống

Hệ thống gồm hai module chính hoạt động liên kết:

1. **Mining Module** Nhận file giao dịch và ngưỡng `minSupport`, thực thi thuật toán NECLATCLOSED, trả về danh sách Frequent Closed Itemsets kèm support.
2. **Recommendation Module** Nhận giỏ hàng hiện tại, đối sánh với kết quả khai thác, trả về danh sách sản phẩm gợi ý có thông tin chi tiết từ cơ sở dữ liệu AdventureWorks2014.

---

## Chức năng

### 1. Frequent Closed Itemset Mining

- Upload file giao dịch định dạng `.txt`
- Thiết lập ngưỡng `minSupport`
- Khai thác tập mục phổ biến đóng
- Hiển thị kết quả: closed itemsets, transactions, thống kê tổng số tập khai thác được, tập phổ biến đóng chỉ 1 itemset
- Sidebar danh sách sản phẩm, các sản phẩm xuất hiện trong kết quả khai thác.

### 2. Product Recommendation

- Hiển thị danh sách sản phẩm từ AdventureWork2024, tìm kiếm theo tên
- Xem thông tin chi tiết sản phẩm
- Nhập giỏ hàng hiện tại
-  Gợi ý các sản phẩm có xu hướng được mua cùng dựa trên độ hỗ trợ, sắp xếp theo support giảm dần 


### 3. Data Utilities

- Sắp xếp kết quả theo support hoặc kích thước itemset
- Lọc dữ liệu theo điều kiện
- Xuất kết quả ra file `.csv`

---

## Tech Stack

| Tầng          | Công nghệ                       |
| ------------- | ------------------------------- |
| Backend       | Java 17, Spring Boot            |
| Thuật toán    | NECLATCLOSED                    |
| Cơ sở dữ liệu | SQL Server — AdventureWorks2014 |
| Frontend      | HTML, CSS, JavaScript (thuần)   |

---

## Cài đặt

### Yêu cầu

| Công cụ    | Phiên bản tối thiểu            |
| ---------- | ------------------------------ |
| Java       | 17+                            |
| Maven      | 3.6+                           |
| SQL Server | Có database AdventureWorks2014 |

### Các bước cài đặt

**Bước 1 Clone repository**

```bash
git clone <repo-url>
cd ne-main
```

**Bước 2 Cấu hình kết nối database**

Mở file `src/main/resources/application.properties` và cập nhật thông tin:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=AdventureWorks2014;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=your_password
```

**Bước 3 Build project**

```bash
mvn clean install
```

**Bước 4 Khởi chạy ứng dụng**

```bash
mvn spring-boot:run
```

Ứng dụng chạy tại `http://localhost:8080`

---

## API Reference

### `POST /mining`

Khai thác Frequent Closed Itemsets từ file giao dịch .txt

---

### `POST /recommend`

Gợi ý sản phẩm dựa trên giỏ hàng hiện tại.

---

### `GET /products`

Trả về danh sách toàn bộ sản phẩm.

---

### `GET /products/{id}`

Trả về thông tin chi tiết của một sản phẩm.

---

### `GET /stats`

Trả về thống kê lần khai thác gần nhất (số transaction, 1-itemsets, fcp).

---

## Chiến lược gợi ý

Quy trình gợi ý dựa trực tiếp trên Frequent Closed Itemsets:

```
Sản phẩm được click chọn, nó sẽ gợi theo sản phẩm đó
nếu có sản phẩm trong giỏ hàng và kèm sản phẩm chọn thì gợi ý dựa trên đó
nếu không có sản phẩm gợi ý thì nó sẽ tự động gợi ý dựa vào sản phẩm được click vào sau cùng..
```

---

---

---

## Tài liệu tham khảo

Aryabarzan, N., & Minaei-Bidgoli, B. (2021). NECLATCLOSED: A vertical algorithm for mining frequent closed itemsets. _Expert Systems With Applications, 174_. <https://doi.org/10.1016/j.eswa.2021.114738>
