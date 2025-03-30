import { Button, Table, notification } from "antd";
import {
  CheckSquareOutlined,
  DeleteOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  ListOderProductsAll,
  OrderStatusOneProduct,
  UpDateCompleted,
  UpDateOrderProductAPI,
  updateShipping,
} from "../../service/Oder";
import { useEffect, useState } from "react";
import moment from "moment";
import "./OrderAdmin.css";
import { useSelector } from "react-redux";
const OrderAdmin = () => {
  const [api, contextHolder] = notification.useNotification();
  const { user } = useSelector((state) => state.auth);
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
      title: "Duyệt đơn hàng",
      dataIndex: "check",
    },
  ];

  const getRandomuserParams = (params) => ({
    results: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  });
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ"; // Return fallback value if price is not valid
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };
  // Function to fetch data

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = getRandomuserParams(tableParams);
      if (tableParams.sortField) {
        params.sortField = tableParams.sortField;
        params.sortOrder = tableParams.sortOrder;
      }
      const res = await ListOderProductsAll(params);
      console.log(res);

      if (res) {
        const dataProduct = res.data.data.map((item, index) => {
          return {
            key: index + 1,
            index: index + 1,
            name: item.items.map((item) => item.name).join(", "),
            quantity: item.items.map((item) => item.quantity).join(", "),
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
            orderStatus: (() => {
              switch (item.orderStatus) {
                case "Processing":
                  return "Chờ xác nhận";
                case "Delivered":
                  return "Chờ giao hàng";
                case "Shipping":
                  return "Đang giao";
                case "Completed":
                  return "Đơn hàng đã giao thành công";
                default:
                  return "Trạng thái không xác định";
              }
            })(),
            totalAmount: formatPrice(item.totalAmount),
            createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
            check: (
              <div className="flex g-4 items-center">
                {(() => {
                  switch (item.orderStatus) {
                    case "Processing":
                      return (
                        <Button
                          className="btn btn-warning"
                          onClick={() => handleCheckOrder(item._id)}
                        >
                          Chờ xác nhận
                        </Button>
                      );
                    case "Delivered":
                      return (
                        <Button
                          className="btn btn-primary"
                          onClick={() => updateShippingOrder(item._id)}
                        >
                          Chờ giao hàng
                        </Button>
                      );
                    case "Shipping":
                      return (
                        <Button
                          className="btn btn-info"
                          onClick={() =>
                            updateCompleteOrder(item._id, item.totalAmount)
                          }
                        >
                          Đang giao
                        </Button>
                      );
                    case "Completed":
                      return (
                        <Button className="btn btn-success">Hoàn thành</Button>
                      );
                    default:
                      return (
                        <Button className="btn btn-secondary">
                          Trạng thái không xác định
                        </Button>
                      );
                  }
                })()}

                {item.orderStatus && item.orderStatus === "Processing" && (
                  <Button>Hủy</Button>
                )}
              </div>
            ),
          };
        });

        setData(dataProduct);

        setTableParams({
          pagination: {
            ...tableParams.pagination,
            total: res.data.data.length,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Optionally, show a notification for the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
  ]);

  // Handle table changes (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // Reset data when page size changes
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  console.log(data);

  const handleCheckOrder = async (id) => {
    try {
      let res = await UpDateOrderProductAPI(id);
      if (res) {
        api.open({
          message: "Đơn hàng đã được duyệt",
          description: "Đơn hàng đã được giao thành công",
          icon: (
            <SmileOutlined
              style={{
                color: "#108ee9",
              }}
            />
          ),
        });
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateShippingOrder = async (id) => {
    try {
      let res = await updateShipping(id);

      if (res && res.message === "Order updated successfully") {
        api.open({
          message: "Đơn hàng đã được duyệt",
          description: "Đơn hàng đã được xác nhận thành công",
          icon: (
            <SmileOutlined
              style={{
                color: "#108ee9",
              }}
            />
          ),
        });

        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateCompleteOrder = async (id, totalPrice) => {
    try {
      let res = await UpDateCompleted(id, totalPrice);
      console.log(res);
      if (
        res &&
        res.data &&
        res.data.message === "Order updated successfully"
      ) {
        api.open({
          message: "Đơn hàng đã được duyệt",
          description: "Đơn hàng của bạn đã được đơn vị giao thành công",
          icon: (
            <SmileOutlined
              style={{
                color: "#108ee9",
              }}
            />
          ),
        });
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {contextHolder}
      <Table
        columns={columns}
        rowKey={(record) => record.id} // Adjust rowKey to match your data structure
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default OrderAdmin;
