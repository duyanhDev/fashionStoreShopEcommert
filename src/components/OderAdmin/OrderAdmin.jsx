import {
  Button,
  Table,
  notification,
  Card,
  Typography,
  Tag,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Breadcrumb,
  Modal,
  Descriptions,
  Spin,
  Empty,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  CheckSquareOutlined,
  DeleteOutlined,
  SmileOutlined,
  ShoppingOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import {
  ListOderProductsAll,
  UpDateOrderProductAPI,
  updateShipping,
  UpDateCompleted,
  updateShippingCancelledAdmin,
  filterOrdersByStatus,
  UpDateConfirmedAPI,
} from "../../service/Oder";
import { useEffect, useState } from "react";
import moment from "moment";
import "./OrderAdmin.css";
import { useSelector } from "react-redux";
import { createStyles } from "antd-style";

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: auto;
            scrollbar-color: #1890ff transparent;
            scrollbar-gutter: stable;
            &::-webkit-scrollbar {
              height: 10px;
              width: 10px;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #1890ff;
              border-radius: 10px;
            }
            &::-webkit-scrollbar-track {
              background-color: #f0f0f0;
            }
          }
        }
      }
    `,
  };
});

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderAdmin = () => {
  const { styles } = useStyle();
  const [api, contextHolder] = notification.useNotification();
  const { user } = useSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState("all"); // Lưu trạng thái lọc, mặc định là "all"
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    delivered: 0,
    shipping: 0,
    confirmed: 0,
    processing: 0,
    cancelled: 0,
  });
  const [visible, setVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20", "50"],
      showTotal: (total, range) =>
        `${range[0]}-${range[1]} trên ${total} đơn hàng`,
    },
  });

  // Map API order statuses to display-friendly text

  const statusDisplayMap = {
    Processing: "Chờ người bán xác nhận",
    Confirmed: "Người bán đang chuẩn bị hàng",
    Shipping: "Đã giao cho shipper/đơn vị vận chuyển",
    Delivered: "Shipper đang giao hàng đến bạn",
    Completed: "Đã giao hàng thành công",
    Cancelled: "Đơn hàng đã bị hủy",
  };

  // Table column definitions
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      width: 60,
      fixed: "left",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <div className="product-name-cell">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "orderStatus",
      width: 200,
      render: (status) => {
        let color = "";
        let icon = null;
        switch (status) {
          case "Chờ người bán xác nhận":
            color = "orange";
            icon = <ShoppingOutlined />;
            break;
          case "Người bán đang chuẩn bị hàng":
            color = "orange";
            icon = <ShoppingOutlined />;
            break;
          case "Đã giao cho shipper/đơn vị vận chuyển":
            color = "blue";
            icon = <ShoppingOutlined />;
            break;
          case "Shipper đang giao hàng đến bạn":
            color = "cyan";
            icon = <CarOutlined />;
            break;
          case "Đã giao hàng thành công":
            color = "green";
            icon = <CheckCircleOutlined />;
            break;
          case "Đã Hủy":
            color = "red";
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color} icon={icon} className="status-tag">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      width: 140,
      sorter: (a, b) => {
        const priceA = parseFloat(a.totalAmount.replace(/[^\d.-]/g, ""));
        const priceB = parseFloat(b.totalAmount.replace(/[^\d.-]/g, ""));
        return priceA - priceB;
      },
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "createdAt",
      width: 120,
    },
    {
      title: "Thao tác",
      dataIndex: "check",
      fixed: "right",
      width: 250,
    },
  ];

  // Format price with thousand separators and currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Fetch all orders from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      let dataProduct = [];
      let totalRecords = 0;

      if (filterStatus === "all") {
        response = await ListOderProductsAll({
          page: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
          sortField: tableParams.sortField,
          sortOrder: tableParams.sortOrder,
        });
      } else {
        response = await filterOrdersByStatus(filterStatus, {
          page: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
        });
      }

      if (response && response.data && response.data.data) {
        dataProduct = response.data.data;
        totalRecords = response.data.total || dataProduct.length;
      } else {
        console.warn("Unexpected API response structure:", response);
        throw new Error("Invalid response structure from API");
      }

      const formattedData = dataProduct.map((item, index) => {
        const shippingAddress = item.shippingAddress || {};
        return {
          key: item._id,
          index:
            (tableParams.pagination.current - 1) *
              tableParams.pagination.pageSize +
            index +
            1,
          name: item.items.map((item) => item.name).join(", "),
          quantity: item.items.map((item) => item.quantity).join(", "),
          size: item.items.map((item) => item.size).join(", "),
          color: item.items.map((item) => item.color).join(", "),
          price: formatPrice(item.items.map((item) => item.price).join(", ")),
          fullAddress: shippingAddress.fullAddress || "",
          city: shippingAddress.city || "",
          district: shippingAddress.district || "",
          ward: shippingAddress.ward || "",
          paymentMethod: item.paymentMethod || "N/A",
          paymentStatus:
            item.paymentStatus === "Completed"
              ? "Đã thanh toán"
              : "Chờ thanh toán",
          orderStatus:
            statusDisplayMap[item.orderStatus] || "Trạng thái không xác định",
          totalAmount: formatPrice(item.totalAmount),
          createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
          check: (
            <Space className="action-buttons-wrapper" size="small">
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                className="btn-action btn-view"
                onClick={() => {
                  setSelectedOrder({
                    name: item.items.map((item) => item.name).join(", "),
                    quantity: item.items
                      .map((item) => item.quantity)
                      .join(", "),
                    size: item.items.map((item) => item.size).join(", "),
                    color: item.items.map((item) => item.color).join(", "),
                    price: formatPrice(
                      item.items.map((item) => item.price).join(", ")
                    ),
                    fullAddress: shippingAddress.fullAddress
                      ? `${shippingAddress.fullAddress}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.city}`
                      : "N/A",
                    paymentMethod: item.paymentMethod || "N/A",
                    paymentStatus:
                      item.paymentStatus === "Completed"
                        ? "Đã thanh toán"
                        : "Chờ thanh toán",
                    orderStatus:
                      statusDisplayMap[item.orderStatus] ||
                      "Trạng thái không xác định",
                    totalAmount: formatPrice(item.totalAmount),
                    createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
                    id: item._id,
                    rawStatus: item.orderStatus,
                  });
                  setVisible(true);
                }}
              >
                Xem chi tiết
              </Button>
              {(() => {
                switch (item.orderStatus) {
                  case "Processing":
                    return (
                      <Button
                        type="primary"
                        size="small"
                        className="btn-action btn-warning"
                        icon={<CheckSquareOutlined />}
                        onClick={() => handleCheckConfirmed(item._id)}
                      >
                        Duyệt
                      </Button>
                    );

                  case "Confirmed":
                    return (
                      <Button
                        type="primary"
                        size="small"
                        className="btn-action btn-warning"
                        icon={<CheckSquareOutlined />}
                        onClick={() => updateShippingOrder(item._id)}
                      >
                        Chờ người bán xác nhận
                      </Button>
                    );
                  case "Shipping":
                    return (
                      <Button
                        type="primary"
                        size="small"
                        className="btn-action btn-info"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleCheckOrder(item._id)}
                      >
                        Giao hàng
                      </Button>
                    );
                  case "Delivered":
                    return (
                      <Button
                        type="primary"
                        size="small"
                        className="btn-action btn-primary"
                        icon={<CarOutlined />}
                        onClick={() =>
                          updateCompleteOrder(item._id, item.totalAmount)
                        }
                      >
                        Hoàn Thành
                      </Button>
                    );

                  case "Completed":
                    return (
                      <Button
                        type="primary"
                        size="small"
                        className="btn-action btn-success"
                        icon={<CheckCircleOutlined />}
                        disabled
                      >
                        Đã giao
                      </Button>
                    );
                  case "Cancelled":
                    return (
                      <Button
                        danger
                        size="small"
                        className="btn-action btn-danger"
                        icon={<CloseCircleOutlined />}
                        disabled
                      >
                        Đã Hủy
                      </Button>
                    );
                  default:
                    return (
                      <Button className="btn-action btn-secondary" size="small">
                        Không xác định
                      </Button>
                    );
                }
              })()}
              {item.orderStatus === "Processing" && (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  className="btn-action btn-cancel"
                  onClick={() => handleCancelOrder(item._id, "Cancelled")}
                >
                  Hủy
                </Button>
              )}
            </Space>
          ),
          rawStatus: item.orderStatus,
        };
      });

      setData(formattedData);
      updateOrderStats(formattedData);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: totalRecords,
          current: tableParams.pagination.current,
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      api.error({
        message: "Lỗi",
        description: `Không thể tải dữ liệu đơn hàng: ${error.message}. Vui lòng thử lại sau.`,
      });
      setData([]);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: 0,
          current: 1,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (value) => {
    try {
      setFilterStatus(value);

      if (filterStatus === value) {
        fetchData();
      }
    } catch (error) {
      setFilterStatus(value);
    }
  };

  // Update order statistics based on fetched data
  const updateOrderStats = (orders) => {
    const stats = {
      total: orders.length,
      completed: orders.filter((order) => order.rawStatus === "Completed")
        .length,
      processing: orders.filter((order) => order.rawStatus === "Processing")
        .length,
      delivered: orders.filter((order) => order.rawStatus === "Delivered")
        .length,
      confirmed: orders.filter((order) => order.rawStatus === "Confirmed")
        .length,
      shipping: orders.filter((order) => order.rawStatus === "Shipping").length,
      cancelled: orders.filter((order) => order.rawStatus === "Cancelled")
        .length,
    };
    setOrderStats(stats);
  };

  // Fetch data when pagination or sorting changes
  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    filterStatus, // Thêm filterStatus để gọi lại fetchData khi trạng thái lọc thay đổi
  ]);
  // Handle table pagination and sorting changes
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: sorter.order,
      sortField: sorter.field,
    });
  };

  // Approve an order (change status to Delivered)

  const handleCheckConfirmed = async (id) => {
    try {
      const response = await UpDateConfirmedAPI(id);
      if (response) {
        api.success({
          message: "Đơn hàng đã được xác nhận",
          description: "Đơn hàng đã người bán xác nhận ",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error checking order:", error);
      api.error({
        message: "Lỗi",
        description: "Không thể duyệt đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  const handleCheckOrder = async (id) => {
    try {
      const response = await UpDateOrderProductAPI(id, {
        orderStatus: "Delivered",
      });
      if (response) {
        api.success({
          message: "Đơn hàng đã được duyệt",
          description: "Đơn hàng đã được xác nhận thành công",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error checking order:", error);
      api.error({
        message: "Lỗi",
        description: "Không thể duyệt đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  // Update order to Shipping status
  const updateShippingOrder = async (id) => {
    try {
      const response = await updateShipping(id);

      if (response && response.message === "Order updated successfully") {
        api.success({
          message: "Đơn hàng đã được cập nhật",
          description: "Đơn hàng đã chuyển sang trạng thái đang giao",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error updating shipping:", error);
      api.error({
        message: "Lỗi",
        description:
          "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  // Complete an order (change status to Completed)
  const updateCompleteOrder = async (id, totalPrice) => {
    try {
      const response = await UpDateCompleted(id, totalPrice);
      if (
        response &&
        response.data &&
        response.data.message === "Order updated successfully"
      ) {
        api.success({
          message: "Đơn hàng đã hoàn thành",
          description: "Đơn hàng đã được giao thành công",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error completing order:", error);
      api.error({
        message: "Lỗi",
        description:
          "Không thể cập nhật trạng thái hoàn thành. Vui lòng thử lại.",
      });
    }
  };

  // Cancel an order
  const handleCancelOrder = async (id, orderStatus) => {
    try {
      const response = await updateShippingCancelledAdmin(id, orderStatus);
      if (response && response.data && response.data.EC === 0) {
        api.success({
          message: "Đơn hàng đã bị hủy",
          description: "Đơn hàng đã được hủy thành công.",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      api.error({
        message: "Lỗi",
        description: "Không thể hủy đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  // tổng doanh thu
  const totalRevenue =
    data && data.length > 0
      ? data.reduce((total, item) => {
          const cleanAmount =
            typeof item.totalAmount === "string"
              ? Number(item.totalAmount.replace(/[^\d]/g, ""))
              : Number(item.totalAmount);
          return total + cleanAmount;
        }, 0)
      : 0;

  // lọc sản phẩm theo trạng thái

  // Sửa handleFilterStatus
  const handleFilterStatus = async (value) => {
    try {
      setFilterStatus(value);
      setLoading(true);
      let formattedData = [];
      let totalRecords = 0;

      if (value === "all") {
        await fetchData();
        return;
      }

      const res = await filterOrdersByStatus(value, {
        page: 1,
        pageSize: tableParams.pagination.pageSize,
      });

      if (res && res.data && res.data.data) {
        formattedData = res.data.data.map((item, index) => {
          const shippingAddress = item.shippingAddress || {};
          return {
            key: item._id,
            index: index + 1,
            name: item.items.map((item) => item.name).join(", "),
            quantity: item.items.map((item) => item.quantity).join(", "),
            size: item.items.map((item) => item.size).join(", "),
            color: item.items.map((item) => item.color).join(", "),
            price: formatPrice(item.items.map((item) => item.price).join(", ")),
            fullAddress: shippingAddress.fullAddress || "",
            city: shippingAddress.city || "",
            district: shippingAddress.district || "",
            ward: shippingAddress.ward || "",
            paymentMethod: item.paymentMethod || "N/A",
            paymentStatus:
              item.paymentStatus === "Completed"
                ? "Đã thanh toán"
                : "Chờ thanh toán",
            orderStatus:
              statusDisplayMap[item.orderStatus] || "Trạng thái không xác định",
            totalAmount: formatPrice(item.totalAmount),
            createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
            check: (
              <Space className="action-buttons-wrapper" size="small">
                <Button
                  type="default"
                  size="small"
                  icon={<EyeOutlined />}
                  className="btn-action btn-view"
                  onClick={() => {
                    setSelectedOrder({
                      name: item.items.map((item) => item.name).join(", "),
                      quantity: item.items
                        .map((item) => item.quantity)
                        .join(", "),
                      size: item.items.map((item) => item.size).join(", "),
                      color: item.items.map((item) => item.color).join(", "),
                      price: formatPrice(
                        item.items.map((item) => item.price).join(", ")
                      ),
                      fullAddress: shippingAddress.fullAddress
                        ? `${shippingAddress.fullAddress}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.city}`
                        : "N/A",
                      paymentMethod: item.paymentMethod || "N/A",
                      paymentStatus:
                        item.paymentStatus === "Completed"
                          ? "Đã thanh toán"
                          : "Chờ thanh toán",
                      orderStatus:
                        statusDisplayMap[item.orderStatus] ||
                        "Trạng thái không xác định",
                      totalAmount: formatPrice(item.totalAmount),
                      createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
                      id: item._id,
                      rawStatus: item.orderStatus,
                    });
                    setVisible(true);
                  }}
                >
                  Xem chi tiết
                </Button>
                {(() => {
                  switch (item.orderStatus) {
                    case "Processing":
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className="btn-action btn-warning"
                          icon={<CheckSquareOutlined />}
                          onClick={() => handleCheckConfirmed(item._id)}
                        >
                          Duyệt
                        </Button>
                      );

                    case "Confirmed":
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className="btn-action btn-warning"
                          icon={<CheckSquareOutlined />}
                          onClick={() => updateShippingOrder(item._id)}
                        >
                          Chờ người bán xác nha
                        </Button>
                      );
                    case "Shipping":
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className="btn-action btn-info"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleCheckOrder(item._id)}
                        >
                          Đang giao
                        </Button>
                      );
                    case "Delivered":
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className="btn-action btn-primary"
                          icon={<CarOutlined />}
                          onClick={() =>
                            updateCompleteOrder(item._id, item.totalAmount)
                          }
                        >
                          Hoàn Thành
                        </Button>
                      );

                    case "Completed":
                      return (
                        <Button
                          type="primary"
                          size="small"
                          className="btn-action btn-success"
                          icon={<CheckCircleOutlined />}
                          disabled
                        >
                          Đã giao
                        </Button>
                      );
                    case "Cancelled":
                      return (
                        <Button
                          danger
                          size="small"
                          className="btn-action btn-danger"
                          icon={<CloseCircleOutlined />}
                          disabled
                        >
                          Đã Hủy
                        </Button>
                      );
                    default:
                      return (
                        <Button
                          className="btn-action btn-secondary"
                          size="small"
                        >
                          Không xác định
                        </Button>
                      );
                  }
                })()}
                {item.orderStatus === "Processing" && (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    className="btn-action btn-cancel"
                    onClick={() => handleCancelOrder(item._id, "Cancelled")}
                  >
                    Hủy
                  </Button>
                )}
              </Space>
            ),
            rawStatus: item.orderStatus,
          };
        });
        totalRecords = res.data.total || formattedData.length;
      }

      setData(formattedData);
      updateOrderStats(formattedData);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          current: 1,
          total: totalRecords,
        },
      });
    } catch (error) {
      console.error("Error filtering status:", error);
      api.error({
        message: "Lỗi",
        description: "Không thể lọc đơn hàng. Vui lòng thử lại.",
      });
      setData([]);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          current: 1,
          total: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="order-admin-container">
      {contextHolder}
      <Breadcrumb className="order-breadcrumb">
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined /> Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item>Quản lý đơn hàng</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="order-admin-header">
        <Row gutter={[24, 24]} align="middle" className="mt-7">
          <Col xs={24} lg={12}>
            <Title level={2}>
              <ShoppingCartOutlined /> Quản lý đơn hàng
            </Title>
          </Col>
          <Col xs={24} lg={12} className="header-actions">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => handleReset("all")}
              className="refresh-button"
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className="order-stats">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card total-card">
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card processing-card">
            <Statistic
              title="Chờ người bán xác nhận"
              value={orderStats.processing}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card processing-card">
            <Statistic
              title="Người bán đang chuẩn bị hàng"
              value={orderStats.confirmed}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card shipping-card">
            <Statistic
              title="Đã giao cho shipper/đơn vị vận chuyển"
              value={orderStats.shipping}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card shipping-card">
            <Statistic
              title="Shipper đang giao hàng đến bạn"
              value={orderStats.delivered}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card completed-card">
            <Statistic
              title="Hoàn thành"
              value={orderStats.completed}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card cancelled-card">
            <Statistic
              className="text-[#ff4d4f]"
              title="Đã Hủy"
              value={orderStats.cancelled}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card cancelled-card">
            <Statistic
              className="text-gray-950 font-bold"
              title="Tổng doanh thu"
              value={formatPrice(totalRevenue)}
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="order-admin-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo tên sản phẩm hoặc địa chỉ"
              prefix={<SearchOutlined />}
              allowClear
              className="search-input"
              onChange={() => {}} // Non-functional: Logic removed as requested
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              className="status-select"
              onChange={handleFilterStatus}
              value={filterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Processing">Chờ xác nhận</Option>
              <Option value="Confirmed">Người bán đang chuẩn bị hàng</Option>
              <Option value="Shipping">
                Đã giao cho shipper/đơn vị vận chuyển
              </Option>
              <Option value="Delivered">Shipper đang giao hàng đến bạn</Option>
              <Option value="Completed">Đã giao hàng thành côn</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} md={7}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              className="date-picker"
              onChange={() => {}} // Non-functional: Logic removed as requested
            />
          </Col>
          <Col xs={24} md={3}>
            <Button
              icon={<FilterOutlined />}
              className="reset-button"
              onClick={() => handleReset("all")} // Non-functional: Logic removed as requested
            >
              Xóa lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="order-admin-table">
        <Spin spinning={loading}>
          {data.length === 0 && !loading ? (
            <Empty
              description="Không tìm thấy đơn hàng"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              rowKey={(record) => record.key}
              dataSource={data}
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
              className={styles.customTable}
              rowClassName={(record) => {
                if (record.orderStatus === "Chờ xác nhận")
                  return "order-row-waiting";
                if (record.orderStatus === "Đơn hàng đã giao thành công")
                  return "order-row-completed";
                if (record.orderStatus === "Đang giao")
                  return "order-row-shipping";
                if (record.orderStatus === "Đã Hủy")
                  return "order-row-cancelled";
                return "";
              }}
              summary={(pageData) => {
                const totalAmount = pageData.reduce((total, item) => {
                  const cleanAmount = Number(
                    item.totalAmount.replace(/[^\d]/g, "")
                  );
                  return total + cleanAmount;
                }, 0);

                return (
                  <Table.Summary.Row className="summary-row">
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>Tổng giá trị đơn hàng hiển thị:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={2}>
                      <Text strong>{formatPrice(totalAmount)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title="Chi tiết đơn hàng"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Đóng
          </Button>,
        ]}
        className="order-detail-modal"
      >
        {selectedOrder && (
          <Descriptions
            bordered
            column={1}
            className="order-detail-descriptions"
          >
            <Descriptions.Item label="Tên sản phẩm">
              {selectedOrder.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Size">
              {selectedOrder.size}
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc">
              {selectedOrder.color}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              {selectedOrder.price}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedOrder.fullAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              <Tag
                color={
                  selectedOrder.paymentStatus === "Đã thanh toán"
                    ? "green"
                    : "gold"
                }
              >
                {selectedOrder.paymentStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái đơn hàng">
              <Tag
                color={
                  selectedOrder.orderStatus === "Chờ xác nhận"
                    ? "orange"
                    : selectedOrder.orderStatus === "Chờ giao hàng"
                    ? "blue"
                    : selectedOrder.orderStatus === "Đang giao"
                    ? "cyan"
                    : selectedOrder.orderStatus ===
                      "Đơn hàng đã giao thành công"
                    ? "green"
                    : "red"
                }
              >
                {selectedOrder.orderStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {selectedOrder.totalAmount}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt hàng">
              {selectedOrder.createdAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrderAdmin;
