import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { listOderUserIdAPI } from "../../service/Oder";
import moment from "moment";
import {
  Table,
  Card,
  Tag,
  Button,
  Typography,
  Space,
  Input,
  Empty,
  Avatar,
  Skeleton,
  Badge,
  Divider,
  Tooltip,
  ConfigProvider,
  Segmented,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import "./Order.css";
import { Search } from "lucide-react";

const { Title, Text } = Typography;

const Order = () => {
  const { user } = useOutletContext();
  const [orderProducts, setOrderProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const navigate = useNavigate();
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
    },
  });

  const handleTableChange = (pagination) => {
    setTableParams({
      ...tableParams,
      pagination,
    });
  };
  // Format giá tiền với định dạng Việt Nam
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ";
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Chuyển đổi trạng thái đơn hàng sang tiếng Việt và gán màu tương ứng
  const getOrderStatusInfo = (status) => {
    switch (status) {
      case "Processing":
        return {
          text: "Chờ xác nhận",
          color: "#d48806",
          bgColor: "#fff7e6",
          icon: <ClockCircleOutlined />,
        };
      case "Confirmed":
        return {
          text: "Đã Xác nhận",
          color: "#389e0d",
          bgColor: "#f6ffed",
          icon: <CheckCircleOutlined />,
        };
      case "Delivered":
        return {
          text: "Chờ giao hàng",
          color: "#0958d9",
          bgColor: "#e6f4ff",
          icon: <ShoppingOutlined />,
        };
      case "Shipping":
        return {
          text: "Đang giao hàng",
          color: "#531dab",
          bgColor: "#f0f5ff",
          icon: <ShoppingCartOutlined />,
        };
      case "Completed":
        return {
          text: "Giao hàng thành công",
          color: "#389e0d",
          bgColor: "#f6ffed",
          icon: <CheckCircleOutlined />,
        };
      case "Cancelled":
        return {
          text: "Đơn hàng đã hủy",
          color: "#ff4d4f",
          bgColor: "#fff1f0",
          icon: <CheckCircleOutlined />,
        };
      default:
        return {
          text: "Trạng thái không hợp lệ",
          color: "#8c8c8c",
          bgColor: "#f5f5f5",
          icon: <ClockCircleOutlined />,
        };
    }
  };

  // Phân nhóm đơn hàng theo trạng thái
  const getOrderStats = () => {
    const stats = {
      total: orderProducts.length,
      processing: 0,
      delivered: 0,
      shipping: 0,
      completed: 0,
    };

    orderProducts.forEach((order) => {
      switch (order.orderStatus) {
        case "Processing":
          stats.processing++;
          break;
        case "Delivered":
          stats.delivered++;
          break;
        case "Shipping":
          stats.shipping++;
          break;
        case "Completed":
          stats.completed++;
          break;
        default:
          break;
      }
    });

    return stats;
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      width: 120,
      render: (id) => (
        <Text strong ellipsis style={{ color: "#0958d9" }}>
          {`#${id.substring(0, 8)}`}
        </Text>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      ellipsis: { showTitle: false },
      render: (name, record) => (
        <Space size="middle">
          <Avatar
            shape="square"
            size={40}
            icon={<ShoppingOutlined />}
            style={{
              backgroundColor: "#f5f5f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
          <Space direction="vertical" size={2}>
            <Tooltip title={name}>
              <Text strong ellipsis style={{ maxWidth: 250 }}>
                {name}
              </Text>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.quantity} sản phẩm
            </Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Thông tin",
      dataIndex: "info",
      responsive: ["md"],
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text type="secondary">
            <CalendarOutlined style={{ marginRight: 6 }} />
            {record.createdAt}
          </Text>
          <Text type="secondary">
            <DollarOutlined style={{ marginRight: 6 }} />
            {record.paymentMethod}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      align: "right",
      sorter: (a, b) => {
        const priceA = parseFloat(a.totalAmount.replace(/[^\d.-]/g, ""));
        const priceB = parseFloat(b.totalAmount.replace(/[^\d.-]/g, ""));
        return priceA - priceB;
      },
      render: (amount) => (
        <Text strong style={{ fontSize: 15, color: "#a8071a" }}>
          {amount}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      align: "center",
      filters: [
        { text: "Chờ xác nhận", value: "Chờ xác nhận" },
        { text: "Chờ giao hàng", value: "Chờ giao hàng" },
        { text: "Đang giao hàng", value: "Đang giao hàng" },
        { text: "Giao hàng thành công", value: "Giao hàng thành công" },
      ],
      onFilter: (value, record) => record.orderStatus.indexOf(value) === 0,
      render: (_, record) => (
        <Tag
          icon={record.statusIcon}
          style={{
            borderRadius: 12,
            padding: "4px 10px",
            border: "1px solid",
            borderColor: record.statusColor,
            backgroundColor: record.statusBgColor,
            color: record.statusColor,
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {record.orderStatus}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleOrderStatus(record.id)}
            style={{ color: "#0958d9", fontWeight: 500 }}
          >
            Chi tiết
          </Button>
          <Button
            icon={<Search />}
            onClick={() =>
              window.open(
                `https://tracking.ghn.dev/?order_code=${record.order_code}`,
                "_blank" // mở tab mới
              )
            }
            style={{ color: "#0958d9", fontWeight: 500 }}
          >
            Tra cứu
          </Button>
        </div>
      ),
    },
  ];

  // Format dữ liệu cho bảng
  const formatOrderData = (orders) => {
    if (!orders || orders.length === 0) return [];

    return orders.map((item, index) => {
      const statusInfo = getOrderStatusInfo(item.orderStatus);

      return {
        key: index + 1,
        id: item._id,
        index: index + 1,
        name: item.items.map((product) => product.name).join(", "),
        quantity: item.items.reduce(
          (total, product) => total + product.quantity,
          0
        ),
        order_code: item.order_code,
        size: item.items.map((product) => product.size).join(", "),
        color: item.items.map((product) => product.color).join(", "),
        price: formatPrice(
          item.items.map((product) => product.price).join(", ")
        ),
        fullAddress: item.shippingAddress.fullAddress,
        city: item.shippingAddress.city,
        district: item.shippingAddress.district,
        ward: item.shippingAddress.ward,
        paymentMethod: item.paymentMethod,
        paymentStatus:
          item.paymentStatus === "Completed"
            ? "Đã thanh toán"
            : "Chờ thanh toán",
        orderStatus: statusInfo.text,
        statusColor: statusInfo.color,
        statusBgColor: statusInfo.bgColor,
        statusIcon: statusInfo.icon,
        totalAmount: formatPrice(item.totalAmount),
        createdAt: moment(item.createdAt).format("DD/MM/YYYY"),
        createdAtRaw: item.createdAt,
      };
    });
  };

  // Lấy danh sách đơn hàng
  const fetchOrderProducts = async () => {
    setLoading(true);
    try {
      const res = await listOderUserIdAPI(user._id);
      if (res && res.data && res.data.EC === 0) {
        setOrderProducts(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchOrderProducts();
    }
  }, [user]);

  // Xử lý khi click vào xem chi tiết đơn hàng
  const handleOrderStatus = (id) => {
    navigate(`/orderstatus/${id}`);
  };

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const getFilteredData = () => {
    const formattedData = formatOrderData(orderProducts);

    let filteredData = formattedData;
    if (searchText) {
      filteredData = formattedData.filter(
        (order) =>
          order.name.toLowerCase().includes(searchText.toLowerCase()) ||
          order.totalAmount.toLowerCase().includes(searchText.toLowerCase()) ||
          order.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== "Tất cả") {
      filteredData = filteredData.filter(
        (order) => order.orderStatus === filterStatus
      );
    }

    return filteredData;
  };

  const stats = getOrderStats();
  const orderStatusOptions = [
    "Tất cả",
    "Chờ xác nhận",
    "Chờ giao hàng",
    "Đang giao hàng",
    "Giao hàng thành công",
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 6,
          colorPrimary: "#0958d9",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          colorText: "#1a1a1a",
          colorTextSecondary: "#595959",
        },
      }}
    >
      <div className="order-container">
        <Card className="order-header-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} className="order-title">
                Đơn hàng của tôi
              </Title>
              <Text className="order-subtitle">
                Theo dõi và quản lý đơn hàng của bạn một cách dễ dàng
              </Text>
            </Col>
            <Col xs={24} md={12}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Tổng đơn"
                    value={stats.total}
                    valueStyle={{ color: "#0958d9", fontWeight: 500 }}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Chờ xác nhận"
                    value={stats.processing}
                    valueStyle={{ color: "#d48806", fontWeight: 500 }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Đang giao"
                    value={stats.shipping + stats.delivered}
                    valueStyle={{ color: "#531dab", fontWeight: 500 }}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Hoàn thành"
                    value={stats.completed}
                    valueStyle={{ color: "#389e0d", fontWeight: 500 }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Card className="order-content-card">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div className="order-filter-bar">
              <Space align="center">
                <FilterOutlined />
                <Text strong>Lọc theo trạng thái</Text>
              </Space>
              <Input
                placeholder="Tìm kiếm mã đơn, sản phẩm..."
                prefix={<SearchOutlined />}
                allowClear
                className="order-search-input"
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <Segmented
              options={orderStatusOptions.map((status) => {
                const statusInfo =
                  status === "Chờ xác nhận"
                    ? getOrderStatusInfo("Processing")
                    : status === "Chờ giao hàng"
                    ? getOrderStatusInfo("Delivered")
                    : status === "Đang giao hàng"
                    ? getOrderStatusInfo("Shipping")
                    : status === "Giao hàng thành công"
                    ? getOrderStatusInfo("Completed")
                    : {
                        text: status,
                        color: "#0958d9",
                        bgColor: "#e6f4ff",
                        icon: <ShoppingOutlined />,
                      };

                const count =
                  status === "Tất cả"
                    ? stats.total
                    : status === "Chờ xác nhận"
                    ? stats.processing
                    : status === "Chờ giao hàng"
                    ? stats.delivered
                    : status === "Đang giao hàng"
                    ? stats.shipping
                    : status === "Giao hàng thành công"
                    ? stats.completed
                    : 0;

                return {
                  label: (
                    <Space size={6}>
                      <span>{status}</span>
                      <Badge
                        count={count}
                        style={{
                          backgroundColor: statusInfo.color,
                          fontSize: 10,
                        }}
                      />
                    </Space>
                  ),
                  value: status,
                };
              })}
              value={filterStatus}
              onChange={setFilterStatus}
              className="order-segmented"
              block
            />

            <Divider />

            {loading ? (
              <div className="order-skeleton">
                <Skeleton
                  active
                  avatar={{ shape: "square", size: 40 }}
                  paragraph={{ rows: 2 }}
                />
                <Divider />
                <Skeleton
                  active
                  avatar={{ shape: "square", size: 40 }}
                  paragraph={{ rows: 2 }}
                />
                <Divider />
                <Skeleton
                  active
                  avatar={{ shape: "square", size: 40 }}
                  paragraph={{ rows: 2 }}
                />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowClassName={(record) =>
                  `order-row order-${record.orderStatus
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`
                }
                pagination={{
                  ...tableParams.pagination,
                  showSizeChanger: true,
                  pageSizeOptions: ["5", "10", "20", "50", "100"],
                  showTotal: (total) => `Tổng ${total} đơn hàng`,
                  onShowSizeChange: (current, size) => {
                    setTableParams({
                      ...tableParams,
                      pagination: {
                        ...tableParams.pagination,
                        current: 1,
                        pageSize: size,
                      },
                    });
                  },
                  itemRender: (page, type, originalElement) => {
                    if (type === "page") {
                      return (
                        <Button
                          size="small"
                          shape="circle"
                          style={{
                            border: "none",
                            background:
                              originalElement.props?.className?.includes(
                                "ant-pagination-item-active"
                              )
                                ? "#0958d9"
                                : "transparent",
                            color: originalElement.props?.className?.includes(
                              "ant-pagination-item-active"
                            )
                              ? "#fff"
                              : "#595959",
                          }}
                        >
                          {page}
                        </Button>
                      );
                    }
                    if (type === "prev" || type === "next") {
                      return (
                        <Button
                          size="small"
                          shape="circle"
                          style={{ border: "none" }}
                        >
                          {originalElement}
                        </Button>
                      );
                    }
                    return originalElement;
                  },
                }}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Space direction="vertical" align="center">
                          <Text strong style={{ fontSize: 16 }}>
                            Không có đơn hàng
                          </Text>
                          <Text type="secondary">
                            Hãy mua sắm để tạo đơn hàng mới
                          </Text>
                          <Button
                            type="primary"
                            shape="round"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => navigate("/product")}
                          >
                            Mua sắm ngay
                          </Button>
                        </Space>
                      }
                      style={{ padding: "60px 0" }}
                    />
                  ),
                }}
                scroll={{ x: 800 }}
              />
            )}
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Order;
