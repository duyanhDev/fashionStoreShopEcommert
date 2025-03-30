# Dosin - Shop bán quần áo trực tuyến

Dosin là một ứng dụng web thương mại điện tử được xây dựng bằng React và Vite, cung cấp trải nghiệm mua sắm quần áo trực tuyến tiện lợi và hiện đại. Dự án tích hợp các tính năng như lọc sản phẩm theo danh mục, giá cả và kích thước, đặt hàng nhanh chóng, quản lý hồ sơ người dùng, cùng với các tiện ích như chat AI và hệ thống voucher hấp dẫn.

Template này sử dụng React kết hợp với Vite, hỗ trợ HMR (Hot Module Replacement) và một số quy tắc ESLint. Hiện tại, có hai plugin chính thức:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) sử dụng [Babel](https://babeljs.io/) cho Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) sử dụng [SWC](https://swc.rs/) cho Fast Refresh

## Cài đặt và chạy dự án

Để chạy dự án trên máy cục bộ, làm theo các bước sau:

1. Clone repository về máy:

git clone <URL-cua-repository>

2. Di chuyển vào thư mục dự án:

   cd ShopDior

3. Cài đặt các thư viện cần thiết:
   npm install
4. Chạy dự án:
   npm run dev

5. Mở trình duyệt và truy cập vào địa chỉ được cung cấp (thường là `http://localhost:5173`).

## Web Images Preview

### 1. Giao diện chính

![Giao diện 1](./images/1.png)  
![Giao diện 2](./images/2.png)  
![Giao diện 3](./images/3.png)  
![Giao diện 4](./images/4.png)  
![Giao diện 5](./images/5.png)

### 2. Chức năng chính

#### Blog

![Blog](./images/blog.png)

#### Chat AI

![Chat AI](./images/chat_ai.png)

#### Đăng ký

![Đăng ký](./images/dangki.png)

#### Chi tiết đơn hàng

![Chi tiết đơn hàng](./images/detailorder.png)

#### Lọc sản phẩm

![Lọc theo danh mục](./images/filter_category.png)  
![Lọc theo giá](./images/filter_price.png)  
![Lọc theo kích thước](./images/filter_size.png)  
![Lọc theo hướng dẫn bảo quản](./images/filter_care.png)

#### Quản lý danh mục (Admin)

![Quản lý danh mục](./images/crud_category.png)

#### Quản lý sản phẩm (Admin)

![Quản lý sản phẩm](./images/crudsanpham.png)

#### Quên mật khẩu

![Quên mật khẩu](./images/forgetpass.png)

#### Hồ sơ người dùng

![Hồ sơ](./images/profile.png)  
![Cập nhật hồ sơ](./images/update_profile.png)

#### Đặt hàng

![Đặt hàng](./images/order.png)

#### Xếp hạng

![Xếp hạng](./images/ranking.png)

#### Voucher

![Voucher](./images/voucher.png)

#### Trang tìm kiếm

![TÌM KIẾM1](./images/search.png)
![TÌM KIẾM2](./images/search2.png)

### Thông báo

![THÔNG BÁO](./images/thongbao.png)

### Tích hợp thanh toán bằng momo

![MOMO](./images/momo.png)

### Tích hợp ví VNPAY

![VNPAY](./images/viVNP.png)

### Tích hợp ví zaloPay

![VNPAY](./images/zalopay.png)

## Công nghệ sử dụng

- **React + Vite**: Framework chính để xây dựng giao diện và tối ưu hiệu suất.
- **ESLint**: Đảm bảo chất lượng mã nguồn.
- **HMR (Hot Module Replacement)**: Hỗ trợ phát triển nhanh với Fast Refresh.

## Ghi chú

- Hình ảnh được lưu trong thư mục `./images/` của repository. Nếu không thấy hình ảnh, hãy kiểm tra xem thư mục này đã được đẩy lên GitHub chưa.
- Dự án hiện tại sử dụng tiếng Việt cho giao diện và tài liệu. Nếu cần hỗ trợ đa ngôn ngữ, hãy liên hệ để được hỗ trợ.
