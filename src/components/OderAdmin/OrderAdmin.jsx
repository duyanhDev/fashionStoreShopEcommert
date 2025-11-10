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
  Divider,
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
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
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
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import "./OrderAdmin.css";
import { useSelector } from "react-redux";
import { createStyles } from "antd-style";
import { generateInvoicePDF, InvoiceTemplate } from "../InvoiceTemplate";

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
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const invoiceRef = useRef();
  // Enhanced search filters
  const [searchFilters, setSearchFilters] = useState({
    customerName: "",
    productName: "",
    address: "",
    dateRange: null,
  });

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
  const [originalData, setOriginalData] = useState([]);
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

  // Enhanced search functions
  const handleInstantSearch = (value, type) => {
    const newFilters = {
      ...searchFilters,
      [type]: value,
    };

    setSearchFilters(newFilters);

    // Apply all filters
    let filtered = originalData;

    if (newFilters.customerName) {
      filtered = filtered.filter((item) =>
        item.username
          ?.toLowerCase()
          .includes(newFilters.customerName.toLowerCase())
      );
    }

    if (newFilters.productName) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(newFilters.productName.toLowerCase())
      );
    }

    if (newFilters.address) {
      filtered = filtered.filter((item) => {
        const fullAddress = `${item.fullAddress} ${item.ward} ${item.district} ${item.city}`;
        return fullAddress
          .toLowerCase()
          .includes(newFilters.address.toLowerCase());
      });
    }

    if (newFilters.dateRange && newFilters.dateRange.length === 2) {
      const [startDate, endDate] = newFilters.dateRange;
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt, "DD/MM/YYYY");
        return itemDate.isBetween(startDate, endDate, "day", "[]");
      });
    }

    // Apply status filter if not "all"
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.rawStatus === filterStatus);
    }

    const formattedFiltered = filtered.map((item, index) => ({
      ...item,
      index: index + 1,
    }));

    setData(formattedFiltered);
    updateOrderStats(formattedFiltered);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        total: formattedFiltered.length,
      },
    }));
  };

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...searchFilters,
      dateRange: dates,
    };

    setSearchFilters(newFilters);

    let filtered = originalData;

    // Apply all existing filters
    if (newFilters.customerName) {
      filtered = filtered.filter((item) =>
        item.username
          ?.toLowerCase()
          .includes(newFilters.customerName.toLowerCase())
      );
    }

    if (newFilters.productName) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(newFilters.productName.toLowerCase())
      );
    }

    if (newFilters.address) {
      filtered = filtered.filter((item) => {
        const fullAddress = `${item.fullAddress} ${item.ward} ${item.district} ${item.city}`;
        return fullAddress
          .toLowerCase()
          .includes(newFilters.address.toLowerCase());
      });
    }

    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;

      const start = startDate.startOf("day").toDate();
      const end = endDate.endOf("day").toDate();

      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt, "DD/MM/YYYY").toDate();
        return itemDate >= start && itemDate <= end;
      });
    }
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.rawStatus === filterStatus);
    }

    const formattedFiltered = filtered.map((item, index) => ({
      ...item,
      index: index + 1,
    }));

    setData(formattedFiltered);
    updateOrderStats(formattedFiltered);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        total: formattedFiltered.length,
      },
    }));
  };

  const handleResetFilters = () => {
    setSearchFilters({
      customerName: "",
      productName: "",
      address: "",
      dateRange: null,
    });

    setFilterStatus("all");
    setData(originalData);
    updateOrderStats(originalData);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        total: originalData.length,
      },
    }));
  };

  const handlePreviewInvoice = (record) => {
    // Lấy originalItem từ record (chứa data đầy đủ từ API)

    setSelectedInvoice(record.originalItem);
    setIsModalOpen(true);
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
      title: "Tên khách hàng",
      dataIndex: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <div className="product-name-cell">{text}</div>
        </Tooltip>
      ),
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
      width: 300,
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
      width: 350,
    },
    {
      title: "In hóa đơn",
      dataIndex: "orderStatus",
      render: (orderStatus, record) => {
        if (orderStatus !== "Đơn hàng đã bị hủy") {
          return (
            <Button
              className="w-1/2 m-auto flex justify-center items-center"
              onClick={() => handlePreviewInvoice(record)}
            >
              In hóa đơn
            </Button>
          );
        }
      },
      width: 350,
    },
  ];

  // Format price with thousand separators and currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Create action buttons for each order
  const createActionButtons = (item) => (
    <Space className="action-buttons-wrapper" size="small">
      <Button
        type="default"
        size="small"
        icon={<EyeOutlined />}
        className="btn-action btn-view"
        onClick={() => {
          const shippingAddress = item.shippingAddress || {};
          setSelectedOrder({
            username: item.username,
            name: item.items.map((item) => item.name).join(", "),
            quantity: item.items.map((item) => item.quantity).join(", "),
            size: item.items.map((item) => item.size).join(", "),
            color: item.items.map((item) => item.color).join(", "),
            price: formatPrice(item.items.map((item) => item.price).join(", ")),
            fullAddress: shippingAddress.fullAddress
              ? `${shippingAddress.fullAddress}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.city}`
              : "N/A",
            phone: item.phone,
            paymentMethod: item.paymentMethod || "N/A",
            paymentStatus:
              item.paymentStatus === "Completed"
                ? "Đã thanh toán"
                : "Chờ thanh toán",
            orderStatus:
              statusDisplayMap[item.orderStatus] || "Trạng thái không xác định",
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
                onClick={() => updateCompleteOrder(item._id, item.totalAmount)}
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
  );

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
          username: item.username,
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
          check: createActionButtons(item),
          rawStatus: item.orderStatus,
          // Store original item for action buttons
          originalItem: item,
        };
      });

      setData(formattedData);
      setOriginalData(formattedData); // Store original data
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
      setOriginalData([]);
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
      handleResetFilters();
      await fetchData();
    } catch (error) {
      console.error("Error resetting:", error);
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

  // Order action handlers
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

  // Enhanced status filter with search integration
  const handleFilterStatus = async (value) => {
    setFilterStatus(value);

    let filtered = originalData;

    // Apply status filter
    if (value !== "all") {
      filtered = filtered.filter((item) => item.rawStatus === value);
    }

    // Apply existing search filters
    if (searchFilters.customerName) {
      filtered = filtered.filter((item) =>
        item.username
          ?.toLowerCase()
          .includes(searchFilters.customerName.toLowerCase())
      );
    }

    if (searchFilters.productName) {
      filtered = filtered.filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(searchFilters.productName.toLowerCase())
      );
    }

    if (searchFilters.address) {
      filtered = filtered.filter((item) => {
        const fullAddress = `${item.fullAddress} ${item.ward} ${item.district} ${item.city}`;
        return fullAddress
          .toLowerCase()
          .includes(searchFilters.address.toLowerCase());
      });
    }

    if (searchFilters.dateRange && searchFilters.dateRange.length === 2) {
      const [startDate, endDate] = searchFilters.dateRange;
      filtered = filtered.filter((item) => {
        const itemDate = moment(item.createdAt, "DD/MM/YYYY");
        return itemDate.isBetween(startDate, endDate, "day", "[]");
      });
    }

    const formattedFiltered = filtered.map((item, index) => ({
      ...item,
      index: index + 1,
    }));

    setData(formattedFiltered);
    updateOrderStats(formattedFiltered);

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        total: formattedFiltered.length,
      },
    }));
  };

  // Calculate total revenue
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
  const InfoItem = ({ icon, label, value, highlight }) => (
    <div className="info-item">
      <div className="info-label">
        {icon && <span className="info-icon">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={`info-value ${highlight ? "highlight" : ""}`}>
        {value}
      </div>
    </div>
  );
  const getOrderStatusColor = (status) => {
    const colorMap = {
      "Chờ người bán xác nhận": "orange",
      "Người bán đang chuẩn bị hàng": "blue",
      "Đã giao cho shipper/đơn vị vận chuyển": "cyan",
      "Shipper đang giao hàng đến bạn": "purple",
      "Đã giao hàng thành công": "green",
      "Đã hủy": "red",
    };
    return colorMap[status] || "default";
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

      {/* Enhanced Filter Section */}
      <Card className="order-admin-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo tên khách hàng"
              prefix={<SearchOutlined />}
              allowClear
              className="customer-search-input"
              value={searchFilters.customerName}
              onChange={(e) =>
                handleInstantSearch(e.target.value, "customerName")
              }
            />
          </Col>

          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo tên sản phẩm"
              prefix={<SearchOutlined />}
              allowClear
              className="product-search-input"
              value={searchFilters.productName}
              onChange={(e) =>
                handleInstantSearch(e.target.value, "productName")
              }
            />
          </Col>

          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo địa chỉ"
              prefix={<SearchOutlined />}
              allowClear
              className="address-search-input"
              value={searchFilters.address}
              onChange={(e) => handleInstantSearch(e.target.value, "address")}
            />
          </Col>

          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              className="status-select"
              onChange={handleFilterStatus}
              value={filterStatus}
              allowClear
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Processing">Chờ xác nhận</Option>
              <Option value="Confirmed">Người bán đang chuẩn bị hàng</Option>
              <Option value="Shipping">
                Đã giao cho shipper/đơn vị vận chuyển
              </Option>
              <Option value="Delivered">Shipper đang giao hàng đến bạn</Option>
              <Option value="Completed">Đã giao hàng thành công</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              className="date-picker"
              value={searchFilters.dateRange}
              onChange={handleDateRangeChange}
            />
          </Col>

          <Col xs={24} md={6}>
            <Button
              icon={<FilterOutlined />}
              onClick={handleResetFilters}
              style={{ width: "100%" }}
            >
              Xóa tất cả bộ lọc
            </Button>
          </Col>

          <Col xs={24} md={6}>
            <Text strong>
              Hiển thị: {data.length} / {originalData.length} đơn hàng
            </Text>
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
                if (record.orderStatus === "Chờ người bán xác nhận")
                  return "order-row-waiting";
                if (record.orderStatus === "Đã giao hàng thành công")
                  return "order-row-completed";
                if (record.orderStatus === "Shipper đang giao hàng đến bạn")
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

      {/* Order Detail Modal */}
      <Modal
        title={
          <div className="modal-header">
            <ShoppingOutlined className="header-icon" />
            <span>Chi tiết đơn hàng</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setVisible(false)}
            block
          >
            Đóng
          </Button>,
        ]}
        className="order-detail-modal"
        width="90%"
        style={{ maxWidth: "800px", top: 20 }}
      >
        {selectedOrder && (
          <div className="order-content">
            {/* Customer Info Section */}
            <div className="section">
              <h3 className="section-title">
                <UserOutlined /> Thông tin khách hàng
              </h3>
              <div className="section-content">
                <InfoItem
                  icon={<UserOutlined />}
                  label="Tên khách hàng"
                  value={selectedOrder.username}
                />
                <InfoItem
                  icon={<PhoneOutlined />}
                  label="Số điện thoại"
                  value={`0${selectedOrder.phone}`}
                />
                <InfoItem
                  icon={<EnvironmentOutlined />}
                  label="Địa chỉ"
                  value={selectedOrder.fullAddress}
                />
              </div>
            </div>

            <Divider />

            {/* Product Info Section */}
            <div className="section">
              <h3 className="section-title">
                <ShoppingOutlined /> Thông tin sản phẩm
              </h3>
              <div className="section-content">
                <div className="product-card">
                  <div className="product-main">
                    <div className="product-name">{selectedOrder.name}</div>
                    <div className="product-details">
                      <span className="detail-item">
                        Số lượng: <strong>{selectedOrder.quantity}</strong>
                      </span>
                      <span className="detail-item">
                        Size: <strong>{selectedOrder.size}</strong>
                      </span>
                      <span className="detail-item">
                        Màu: <strong>{selectedOrder.color}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="product-price">{selectedOrder.price}</div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Payment & Status Section */}
            <div className="section">
              <h3 className="section-title">
                <CreditCardOutlined /> Thanh toán & Trạng thái
              </h3>
              <div className="section-content">
                <InfoItem
                  icon={<CreditCardOutlined />}
                  label="Phương thức thanh toán"
                  value={selectedOrder.paymentMethod}
                />
                <InfoItem
                  icon={<CheckCircleOutlined />}
                  label="Trạng thái thanh toán"
                  value={
                    <Tag
                      color={
                        selectedOrder.paymentStatus === "Đã thanh toán"
                          ? "green"
                          : "gold"
                      }
                    >
                      {selectedOrder.paymentStatus}
                    </Tag>
                  }
                />
                <InfoItem
                  icon={<ClockCircleOutlined />}
                  label="Trạng thái đơn hàng"
                  value={
                    <Tag color={getOrderStatusColor(selectedOrder.orderStatus)}>
                      {selectedOrder.orderStatus}
                    </Tag>
                  }
                />
                <InfoItem
                  icon={<CalendarOutlined />}
                  label="Ngày đặt hàng"
                  value={selectedOrder.createdAt}
                />
              </div>
            </div>

            <Divider />

            {/* Total Amount */}
            <div className="total-section">
              <div className="total-label">
                <DollarOutlined /> Tổng tiền
              </div>
              <div className="total-amount">{selectedOrder.totalAmount}</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={925}
        style={{ minWidth: "none" }}
        title="Xem Hóa Đơn"
      >
        {selectedInvoice && (
          <div>
            <InvoiceTemplate
              transaction={selectedInvoice}
              isVisible={true}
              ref={invoiceRef}
            />

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <Button
                type="primary"
                onClick={() =>
                  generateInvoicePDF(invoiceRef.current, selectedInvoice)
                }
              >
                In hóa đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderAdmin;
