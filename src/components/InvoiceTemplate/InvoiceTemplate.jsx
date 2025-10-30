import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { message } from "antd";
import dayjs from "dayjs";
import { forwardRef } from "react";

import chuki from "./../../assets/chu-ky-ten-anh.jpg";
// Component hiển thị hóa đơn để in
export const InvoiceTemplate = forwardRef(({ transaction }, ref) => {
  if (!transaction) return null;

  console.log(transaction);

  const {
    _id,
    orderId,
    orderCode,
    userId,
    totalAmount,
    discount = 0,
    paymentMethod,
    createdAt,
  } = transaction;

  const subtotal = totalAmount + (discount || 0);
  const tax = Math.round(subtotal * 0.1); // VAT 10% const finalTotal = totalAmount;
  const finalTotal = totalAmount;
  return (
    <div
      ref={ref}
      id="invoice-template"
      style={{
        width: "900px",
        minHeight: "1123px",
        backgroundColor: "white",
        padding: "30px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "3px solid #2563eb",
          paddingBottom: "30px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Logo và thông tin công ty */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "rgb(37,99,235)", // thay vì #2563eb
                marginBottom: "10px",
              }}
            >
              Cửa hàng Duy Anh Shop
            </div>
            <div style={{ color: "#666", fontSize: "12px", lineHeight: "1.8" }}>
              <div>
                <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM
              </div>
              <div>
                <strong>Điện thoại:</strong> (028) 1234 5678
              </div>
              <div>
                <strong>Email:</strong> info@shopmart.vn
              </div>
              <div>
                <strong>Website:</strong> www.shopmart.vn
              </div>
              <div>
                <strong>MST:</strong> 0123456789
              </div>
            </div>
          </div>

          {/* Thông tin hóa đơn */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#dc2626",
                marginBottom: "15px",
              }}
            >
              HÓA ĐƠN BÁN HÀNG
            </div>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "15px",
                borderRadius: "8px",
                minWidth: "250px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong>Số HĐ:</strong> {_id?.slice(-8) || "N/A"}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Ngày:</strong> {dayjs(createdAt).format("DD/MM/YYYY")}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Giờ:</strong> {dayjs(createdAt).format("HH:mm:ss")}
              </div>
              <div>
                <strong>Mã đơn:</strong> {orderCode || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin khách hàng */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px 0",
            color: "#374151",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          THÔNG TIN KHÁCH HÀNG
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Họ tên:</strong> {userId?.name || transaction.username}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Email:</strong> {userId?.email || transaction.email}
            </div>
            <div>
              <strong>Số điện thoại:</strong>{" "}
              {userId?.phone || transaction.phone}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: "8px" }}>
              <strong>Địa chỉ:</strong>{" "}
              {orderId?.shippingAddress.fullAddress ||
                transaction.shippingAddress.fullAddress}
            </div>
            <div>
              <strong>Phương thức TT:</strong>{" "}
              {getPaymentMethodText(paymentMethod)}
            </div>
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div style={{ marginBottom: "30px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#374151", color: "white" }}>
              <th style={tableHeaderStyle}>STT</th>
              <th style={tableHeaderStyle}>Tên sản phẩm</th>
              <th style={tableHeaderStyle}>Số lượng</th>
              <th style={tableHeaderStyle}>Đơn giá</th>
              <th style={tableHeaderStyle}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(orderId?.items?.length
              ? orderId.items
              : transaction?.items || []
            ).map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                {/* Cột STT */}
                <td style={tableCellStyle}>{index + 1}</td>

                {/* Cột tên sản phẩm */}
                <td style={{ ...tableCellStyle, textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {item.name}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Cột số lượng */}
                <td style={tableCellStyle}>{item.quantity || 1}</td>

                {/* Cột đơn giá */}
                <td style={tableCellStyle}>
                  {formatPrice(
                    item.productId?.discountedPrice ||
                      item.discountedPrice ||
                      item.productId?.price ||
                      item.price ||
                      0
                  )}
                </td>

                {/* Cột thành tiền */}
                <td
                  style={{
                    ...tableCellStyle,
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {formatPrice(
                    ((item.productId?.discountedPrice ??
                      item.productId?.price ??
                      item.discountedPrice ??
                      item.price) ||
                      0) * (item.quantity || 1)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng kết */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "25px",
            borderRadius: "12px",
            minWidth: "350px",
            border: "2px solid #e5e7eb",
          }}
        >
          <div style={summaryRowStyle}>
            <span>Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ ...summaryRowStyle, color: "#dc2626" }}>
              <span>Giảm giá:</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div style={summaryRowStyle}>
            <span>Thuế VAT (10%):</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div
            style={{
              ...summaryRowStyle,
              borderTop: "2px solid #374151",
              paddingTop: "15px",
              marginTop: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#dc2626",
            }}
          >
            <span>TỔNG CỘNG:</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* Ghi chú */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#fef7cd",
          borderRadius: "8px",
          border: "1px solid #fbbf24",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#92400e" }}>GHI CHÚ:</h4>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#92400e" }}>
          <li>Hóa đơn này là bằng chứng cho việc mua bán hàng hóa</li>
          <li>Vui lòng kiểm tra kỹ hàng hóa trước khi nhận</li>
          <li>Mọi khiếu nại xin liên hệ trong vòng 7 ngày</li>
        </ul>
      </div>

      {/* Chữ ký */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "50px",
          textAlign: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: "100px" }}>
            NGƯỜI MUA
          </div>
          <div style={{ borderTop: "1px solid #666", paddingTop: "15px" }}>
            (Ký, ghi rõ họ tên)
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: "60px" }}>
            NGƯỜI BÁN
            <img
              src={chuki}
              loading="lazy"
              alt="lỗi chứ kí"
              width={80}
              height={80}
              className="m-auto text-center object-cover"
            />
          </div>

          <div
            style={{
              borderTop: "1px solid #666",
              paddingTop: "15px",
            }}
          >
            Đặng Trịnh Duy Anh
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <div>Cảm ơn quý khách đã mua sắm tại ShopMart!</div>
        <div style={{ marginTop: "5px" }}>
          Hóa đơn được tạo tự động bởi hệ thống -{" "}
          {dayjs().format("DD/MM/YYYY HH:mm:ss")}
        </div>
      </div>
    </div>
  );
});

// Styles cho bảng
const tableHeaderStyle = {
  padding: "15px 10px",
  textAlign: "center",
  fontWeight: "bold",
  borderRight: "1px solid #6b7280",
};

const tableCellStyle = {
  padding: "12px 10px",
  textAlign: "center",
  borderRight: "1px solid #e5e7eb",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "14px",
};

// Helper functions
const formatPrice = (price) => {
  if (!price && price !== 0) return "0đ";
  const numericPrice =
    typeof price === "string"
      ? parseInt(price.replace(/[^\d]/g, ""), 10)
      : price;
  if (isNaN(numericPrice)) return "0đ";
  return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

const getPaymentMethodText = (method) => {
  const texts = {
    vnpay: "VNPay",
    momo: "MoMo",
    cod: "Tiền mặt khi nhận hàng",
    ZaloPay: "ZaloPay",
    credit_card: "Thẻ tín dụng",
    bank_transfer: "Chuyển khoản ngân hàng",
  };
  return texts[method] || method || "Không xác định";
};

// Hàm chính để generate PDF
export const generateInvoicePDF = async (element, transaction) => {
  if (!element) {
    message.error("Không tìm thấy DOM hóa đơn");
    return;
  }
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff", // ép màu nền hợp lệ
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    const fileName = `hoa-don-${
      transaction?._id?.slice(-8) || dayjs().format("YYYYMMDD-HHmmss")
    }.pdf`;
    pdf.save(fileName);

    message.success("Đã tải hóa đơn PDF thành công!");
  } catch (err) {
    console.error("Error generating PDF:", err);
    message.error("Có lỗi xảy ra khi tạo PDF");
  }
};

// Helper function để render HTML string
const renderInvoiceToHTML = (transaction) => {
  const {
    _id,
    orderId,
    userId,
    totalAmount,
    discount = 0,
    paymentMethod,
    createdAt,
  } = transaction;

  const subtotal = totalAmount + (discount || 0);
  const tax = Math.round(subtotal * 0.1);

  const itemsHTML =
    orderId?.items
      ?.map(
        (item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 10px; text-align: center; border-right: 1px solid #e5e7eb;">${
        index + 1
      }</td>
      <td style="padding: 12px 10px; text-align: left; border-right: 1px solid #e5e7eb;">
        <div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
        ${
          item.description
            ? `<div style="font-size: 12px; color: #666;">${item.description}</div>`
            : ""
        }
      </td>
      <td style="padding: 12px 10px; text-align: center; border-right: 1px solid #e5e7eb;">${
        item.quantity || 1
      }</td>
      <td style="padding: 12px 10px; text-align: center; border-right: 1px solid #e5e7eb;">${formatPrice(
        item.price
      )}</td>
      <td style="padding: 12px 10px; text-align: center; font-weight: bold; color: #059669;">${formatPrice(
        (item.price || 0) * (item.quantity || 1)
      )}</td>
    </tr>
  `
      )
      .join("") ||
    `
    <tr>
      <td colspan="5" style="padding: 12px 10px; text-align: center; font-style: italic; color: #666;">Không có sản phẩm</td>
    </tr>
  `;

  return `
    <div style="width: 794px; min-height: 1123px; padding: 40px; background-color: white; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
      <!-- Header -->
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 30px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px;">ShopMart</div>
            <div style="color: #666; font-size: 12px; line-height: 1.8;">
              <div><strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP.HCM</div>
              <div><strong>Điện thoại:</strong> (028) 1234 5678</div>
              <div><strong>Email:</strong> info@shopmart.vn</div>
              <div><strong>Website:</strong> www.shopmart.vn</div>
              <div><strong>MST:</strong> 0123456789</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 15px;">HÓA ĐƠN BÁN HÀNG</div>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; min-width: 250px;">
              <div style="margin-bottom: 8px;"><strong>Số HĐ:</strong> ${
                _id?.slice(-8) || "N/A"
              }</div>
              <div style="margin-bottom: 8px;"><strong>Ngày:</strong> ${dayjs(
                createdAt
              ).format("DD/MM/YYYY")}</div>
              <div style="margin-bottom: 8px;"><strong>Giờ:</strong> ${dayjs(
                createdAt
              ).format("HH:mm:ss")}</div>
              <div><strong>Mã đơn:</strong> ${orderCode}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin khách hàng -->
      <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-weight: bold;">THÔNG TIN KHÁCH HÀNG</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <div style="margin-bottom: 8px;"><strong>Họ tên:</strong> ${
              userId?.name || "N/A"
            }</div>
            <div style="margin-bottom: 8px;"><strong>Email:</strong> ${
              userId?.email || "N/A"
            }</div>
            <div><strong>Số điện thoại:</strong> ${userId?.phone || "N/A"}</div>
          </div>
          <div>
            <div style="margin-bottom: 8px;"><strong>Địa chỉ:</strong> ${
              orderId.shippingAddress?.fullAddress || "N/A"
            }</div>
            <div><strong>Phương thức TT:</strong> ${getPaymentMethodText(
              paymentMethod
            )}</div>
          </div>
        </div>
      </div>

      <!-- Bảng sản phẩm -->
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #374151; color: white;">
              <th style="padding: 15px 10px; text-align: center; font-weight: bold; border-right: 1px solid #6b7280;">STT</th>
              <th style="padding: 15px 10px; text-align: center; font-weight: bold; border-right: 1px solid #6b7280;">Tên sản phẩm</th>
              <th style="padding: 15px 10px; text-align: center; font-weight: bold; border-right: 1px solid #6b7280;">Số lượng</th>
              <th style="padding: 15px 10px; text-align: center; font-weight: bold; border-right: 1px solid #6b7280;">Đơn giá</th>
              <th style="padding: 15px 10px; text-align: center; font-weight: bold; border-right: 1px solid #6b7280;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <!-- Tổng kết -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="background-color: #f9fafb; padding: 25px; border-radius: 12px; min-width: 350px; border: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
            <span>Tạm tính:</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          ${
            discount > 0
              ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #dc2626;">
              <span>Giảm giá:</span>
              <span>-${formatPrice(discount)}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
            <span>Thuế VAT (10%):</span>
            <span>${formatPrice(tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #374151; padding-top: 15px; margin-top: 15px; font-size: 18px; font-weight: bold; color: #dc2626;">
            <span>TỔNG CỘNG:</span>
            <span>${formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Ghi chú -->
      <div style="margin-top: 40px; padding: 20px; background-color: #fef7cd; border-radius: 8px; border: 1px solid #fbbf24;">
        <h4 style="margin: 0 0 10px 0; color: #92400e;">GHI CHÚ:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
          <li>Hóa đơn này là bằng chứng cho việc mua bán hàng hóa</li>
          <li>Vui lòng kiểm tra kỹ hàng hóa trước khi nhận</li>
          <li>Mọi khiếu nại xin liên hệ trong vòng 7 ngày</li>
        </ul>
      </div>

      <!-- Chữ ký -->
      <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center;">
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 60px;">NGƯỜI MUA</div>
          <div style="border-top: 1px solid #666; padding-top: 8px;">(Ký, ghi rõ họ tên)</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 60px;">NGƯỜI BÁN</div>
          <div style="border-top: 1px solid #666; padding-top: 8px;">(Ký, ghi rõ họ tên)</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #666;">
        <div>Cảm ơn quý khách đã mua sắm tại ShopMart!</div>
        <div style="margin-top: 5px;">Hóa đơn được tạo tự động bởi hệ thống - ${dayjs().format(
          "DD/MM/YYYY HH:mm:ss"
        )}</div>
      </div>
    </div>
  `;
};
