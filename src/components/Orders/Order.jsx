import { Table } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { listOderUserIdAPI } from "../../service/Oder";
import moment from "moment";
const Order = () => {
  const { user } = useOutletContext();
  const [OrderProducts, setOderProducts] = useState([]);
  const navigate = useNavigate();
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: "20%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
    },
    {
      title: "Size",
      dataIndex: "size",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
    },
    {
      title: "Giá",
      dataIndex: "price",
      sorter: (a, b) => {
        // Chuyển giá thành kiểu số để có thể so sánh chính xác
        const priceA = parseFloat(a.price.replace(/[^\d.-]/g, "")); // Loại bỏ các ký tự không phải số
        const priceB = parseFloat(b.price.replace(/[^\d.-]/g, ""));
        return priceA - priceB; // Sắp xếp từ thấp đến cao
      },
      render: (text) => formatPrice(text), // Hiển thị giá theo định dạng bạn muốn
    },
    {
      title: "Địa chỉ",
      dataIndex: "fullAddress",
    },
    {
      title: "Thành phố/Tỉnh",
      dataIndex: "city",
    },
    {
      title: "Quận/Huyện",
      dataIndex: "district",
    },
    {
      title: "Phường/Xã",
      dataIndex: "ward",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "orderStatus",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "createdAt",
    },
    {
      title: "Xem đơn hàng",
      dataIndex: "Check",
    },
  ];
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ"; // Return fallback value if price is not valid
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // "Processing", // Chờ xác nhận
  // "Delivered", // duyêt đơn giao hàng (another state)
  // "Shipping", // Giao hàng thanh công cho bên vận chyuyeenr
  // "Completed", // Đã xong

  const replaceOrderStatus = (value) => {
    switch (value) {
      case "Processing":
        return "Chờ xác nhận";
      case "Delivered":
        return "Chờ giao hàng";
      case "Shipping":
        return "Đang giao hàng";
      case "Completed":
        return "Giao hàng thành công";
      default:
        return "Trạng thái không hợp lệ";
    }
  };

  console.log();

  const dataSource =
    OrderProducts &&
    OrderProducts.length > 0 &&
    OrderProducts.map((item, index) => {
      console.log(item);

      return {
        key: index + 1,
        index: index + 1,
        name: item.items.map((item) => item.name).join(", "), // Joins names into a single string
        quantity: item.items.map((item) => item.quantity).join(", "), // Joins quantities into a single string
        size: item.items.map((item) => item.size).join(", "),
        color: item.items.map((item) => item.color).join(", "),
        price: formatPrice(item.items.map((item) => item.price).join(", ")),
        fullAddress: item.shippingAddress.fullAddress,
        city: item.shippingAddress.city,
        district: item.shippingAddress.district,
        ward: item.shippingAddress.ward,
        paymentMethod: item.paymentMethod,
        paymentStatus:
          item.paymentStatus && item.paymentStatus === "Completed"
            ? "Đã thanh toán"
            : "Chờ thanh toán",
        orderStatus: item.orderStatus && replaceOrderStatus(item.orderStatus),
        totalAmount: formatPrice(item.totalAmount),
        createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
        Check: (
          <p
            className="cursor-pointer"
            onClick={() => handleOrderStatus(item._id)}
          >
            Xem đơn hàng
          </p>
        ),
      };
    });

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  const FetchOrderProducts = async () => {
    try {
      let res = await listOderUserIdAPI(user._id);

      if (res && res.data && res.data.EC === 0) {
        let data = res.data.data.map((item) => {
          return item;
        });
        setOderProducts(data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    FetchOrderProducts();
  }, [user._id]);

  const handleOrderStatus = (id) => {
    navigate(`/orderstatus/${id}`);
  };
  return (
    <div style={{ marginTop: "102px" }}>
      <Table
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
      />
      ;
    </div>
  );
};

export default Order;
