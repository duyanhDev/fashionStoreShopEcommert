import {
  Table,
  Button,
  Tag,
  Typography,
  Tooltip,
  Card,
  Row,
  Col,
  Input,
  Select,
  Space,
  DatePicker,
  message,
  Popconfirm,
  Modal,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  DollarOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  ExportOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./Transactions.css";
import { getRevenueAPI } from "../../service/APITransaction";
import { generateInvoicePDF, InvoiceTemplate } from "../InvoiceTemplate";

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Transactions = () => {
  const [dataTransactions, setDataTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const invoiceRef = useRef();

  const pageSize = 10;
  const hasSelected = selectedRowKeys.length > 0;
  const navigate = useNavigate();

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRevenueAPI();

      if (res && res.data && res.data.EC === 0) {
        // Loại bỏ setTimeout không cần thiết
        if (res.data.data) {
          const processedTransactions = res.data.data.map(
            (transaction, index) => ({
              key: transaction._id,
              index: index + 1,
              transactionInfo: (
                <div className="space-y-1">
                  <Text strong className="text-gray-900 text-sm block">
                    {transaction.orderId?._id || "N/A"}
                  </Text>
                  <Text className="text-gray-500 text-xs block">
                    {dayjs(transaction.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              ),
              customer: (
                <div className="space-y-1">
                  <Text strong className="text-gray-900 text-sm block">
                    {truncateText(transaction?.userId?.name || "N/A", 20)}
                  </Text>
                  <Text className="text-gray-500 text-xs block">
                    {truncateText(transaction?.userId?.email || "N/A", 25)}
                  </Text>
                </div>
              ),
              products: (
                <div className="max-w-[150px]">
                  <Text className="text-gray-700 text-sm">
                    {transaction?.orderId?.items?.map((item, idx) => (
                      <span key={idx}>
                        {item.name}
                        {idx < transaction.orderId.items.length - 1 ? ", " : ""}
                      </span>
                    )) || "N/A"}
                  </Text>
                  <div className="text-xs text-gray-500 mt-1">
                    {transaction?.orderId?.items?.length || 0} sản phẩm
                  </div>
                </div>
              ),
              amount: (
                <div className="text-right">
                  <Text strong className="text-green-600 text-sm block">
                    {formatPrice(transaction.totalAmount)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    Giảm: {formatPrice(transaction.discount || 0)}
                  </Text>
                </div>
              ),
              paymentMethod: (
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <Text className="text-sm">
                    {getPaymentMethodText(transaction.paymentMethod)}
                  </Text>
                </div>
              ),
              orderStatus: (
                <Tag
                  color={getStatusColor(transaction.orderId?.orderStatus)}
                  className="px-3 py-1 text-xs rounded-full font-medium text-wrap text-center"
                >
                  {getStatusText(transaction.orderId?.orderStatus)}
                </Tag>
              ),
              action: (
                <Space size="small">
                  <Tooltip title="Xem chi tiết">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewInvoice(transaction)}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </Tooltip>
                  <Tooltip title="In hóa đơn">
                    <Button
                      size="small"
                      icon={<PrinterOutlined />}
                      onClick={() => handlePreviewInvoice(transaction)} // ✅ gọi hàm in // ✅ gọi hàm in(transaction)}
                      className="bg-green-500 hover:bg-green-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </Tooltip>
                  {transaction.orderId?.orderStatus === "Completed" && (
                    <Popconfirm
                      title="Hoàn tiền"
                      description={`Bạn có chắc chắn muốn hoàn tiền cho giao dịch "${transaction._id}" không?`}
                      onConfirm={() => handleRefund(transaction._id)}
                      okText="Hoàn tiền"
                      cancelText="Hủy"
                    >
                      <Tooltip title="Hoàn tiền">
                        <Button
                          size="small"
                          icon={<RiseOutlined />}
                          className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        />
                      </Tooltip>
                    </Popconfirm>
                  )}
                </Space>
              ),
              rawTransaction: transaction,
              // Thêm các fields để search
              customerName: transaction?.userId?.name || "",
              email: transaction?.userId?.email || "",
              productName:
                transaction?.orderId?.items
                  ?.map((item) => item.name)
                  .join(", ") || "",
              status: transaction.orderId?.orderStatus,
              createdAt: transaction.createdAt,
              totalAmount: transaction.totalAmount || 0,
            })
          );

          setDataTransactions(processedTransactions);
          setFilteredTransactions(processedTransactions);
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const statusColors = {
      Completed: "success",
      Processing: "warning",
      Confirmed: "processing",
      Shipping: "processing",
      Delivered: "success",
      Cancelled: "error",
      refunded: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Processing":
        return "Đơn hàng đang chờ shop xác nhận";
      case "Confirmed":
        return "Người bán đang chuẩn bị hàng";
      case "Shipping":
        return "Đã giao cho shipper/đơn vị vận chuyển";
      case "Delivered":
        return "Đơn hàng đang giao hàng đến bạn";
      case "Completed":
        return "Đơn hàng giao thành công";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      vnpay: <WalletOutlined />,
      momo: <WalletOutlined />,
      cod: <WalletOutlined />,
      ZaloPay: <WalletOutlined />,
      credit_card: <CreditCardOutlined />,
      bank_transfer: <BankOutlined />,
    };
    return icons[method] || <CreditCardOutlined />;
  };

  const getPaymentMethodText = (method) => {
    const texts = {
      vnpay: "VNPay",
      momo: "MoMo",
      cod: "Tiền mặt",
      ZaloPay: "ZaloPay",
      credit_card: "Thẻ tín dụng",
      bank_transfer: "Chuyển khoản",
    };
    return texts[method] || method;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0đ";
    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/[^\d]/g, ""), 10)
        : price;
    if (isNaN(numericPrice)) return "0đ";
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewTransaction = (id) => {
    navigate(`/admin/transactions/${id}`);
  };

  const handleRefund = async (transactionId) => {
    try {
      // Simulate API call for refund
      message.success("Đã khởi tạo quy trình hoàn tiền");
      // Refresh data after refund
      fetchData();
    } catch (error) {
      console.error("Error processing refund:", error);
      message.error("Không thể hoàn tiền");
    }
  };

  // Statistics calculations - sửa lại để tính toán đúng
  const totalTransactions = filteredTransactions.length;
  const completedTransactions = filteredTransactions.filter(
    (t) => t.status === "Completed"
  ).length;
  const pendingTransactions = filteredTransactions.filter(
    (t) => t.status === "Processing"
  ).length;
  const totalRevenue = filteredTransactions
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const avgOrderValue =
    completedTransactions > 0
      ? Math.round(totalRevenue / completedTransactions)
      : 0;

  // Filter transactions - sửa lại logic filter
  const applyFilters = () => {
    let filtered = [...dataTransactions];

    // 1. Lọc theo từ khóa (searchTerm)
    if (searchTerm && searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((txn) => {
        const customerName = txn.customerName
          ? txn.customerName.toLowerCase()
          : "";
        const productName = txn.productName
          ? txn.productName.toLowerCase()
          : "";
        const email = txn.email ? txn.email.toLowerCase() : "";

        return (
          customerName.includes(keyword) ||
          productName.includes(keyword) ||
          email.includes(keyword)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.rawTransaction?.paymentMethod === paymentMethodFilter
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((transaction) => {
        const transactionDate = dayjs(transaction.createdAt);
        return (
          transactionDate.isAfter(startDate.startOf("day")) &&
          transactionDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    // Period filter
    if (periodFilter !== "all") {
      const now = dayjs();
      filtered = filtered.filter((transaction) => {
        const transactionDate = dayjs(transaction.createdAt);
        switch (periodFilter) {
          case "today":
            return transactionDate.isSame(now, "day");
          case "week":
            return transactionDate.isAfter(now.subtract(7, "days"));
          case "month":
            return transactionDate.isSame(now, "month");
          case "quarter":
            return transactionDate.isSame(now, "quarter");
          case "year":
            return transactionDate.isSame(now, "year");
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [
    searchTerm,
    statusFilter,
    paymentMethodFilter,
    dateRange,
    periodFilter,
    dataTransactions,
  ]);

  const handlePreviewInvoice = (transaction) => {
    console.log(transaction);

    setSelectedInvoice(transaction);
    setIsModalOpen(true);
  };

  // Hàm xử lý in hóa đơn
  const handlePrintInvoice = async (transaction) => {
    console.log(transaction);

    setPrintLoading(true);
    try {
      await generateInvoicePDF(transaction);
    } catch (error) {
      console.error("Error printing invoice:", error);
    } finally {
      setPrintLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      align: "center",
      render: (text) => (
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
          {text}
        </div>
      ),
    },
    {
      title: "Mã Giao Dịch",
      dataIndex: "transactionInfo",
      key: "transactionInfo",
      width: 140,
    },
    {
      title: "Khách Hàng",
      dataIndex: "customer",
      key: "customer",
      width: 180,
    },
    {
      title: "Sản Phẩm",
      dataIndex: "products",
      key: "products",
      width: 160,
      responsive: ["md"],
    },
    {
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
    },
    {
      title: "Phương Thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      responsive: ["lg"],
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 100,
    },
    {
      title: "Hành Động",
      dataIndex: "action",
      key: "action",
      width: 100,
      fixed: "right",
    },
  ];

  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    trend,
    prefix = "",
  }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <div className="flex items-center mt-1">
              {trend && (
                <div
                  className={`flex items-center mr-2 ${
                    trend > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend > 0 ? <RiseOutlined /> : <FallOutlined />}
                  <span className="text-xs ml-1">{Math.abs(trend)}%</span>
                </div>
              )}
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const TransactionCard = ({ transaction }) => (
    <Card
      className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden group"
      bodyStyle={{ padding: "20px" }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>{transaction.transactionInfo}</div>
          {transaction.orderStatus}
        </div>

        {/* Customer Info */}
        <div className="mb-4">{transaction.customer}</div>

        {/* Products */}
        <div className="mb-4">{transaction.products}</div>

        {/* Amount and Payment */}
        <div className="flex items-center justify-between mb-4">
          {transaction.amount}
          <div className="text-right">{transaction.paymentMethod}</div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100">
          {transaction.action}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản Lý Doanh Thu
              </h1>
              <p className="text-gray-600">
                Theo dõi và quản lý tất cả giao dịch trong hệ thống
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Space wrap>
                <Button
                  icon={<ExportOutlined />}
                  size="large"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Xuất Excel
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  size="large"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 border-0 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Tải Báo Cáo
                </Button>
              </Space>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={FileTextOutlined}
                title="Tổng Giao Dịch"
                value={totalTransactions}
                subtitle="giao dịch"
                trend={12}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={DollarOutlined}
                title="Tổng Doanh Thu"
                value={formatPrice(totalRevenue).replace("đ", "")}
                prefix=""
                subtitle="VND"
                trend={8}
                color="bg-gradient-to-r from-green-500 to-green-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={TrophyOutlined}
                title="Hoàn Thành"
                value={completedTransactions}
                subtitle={`${
                  totalTransactions > 0
                    ? Math.round(
                        (completedTransactions / totalTransactions) * 100
                      )
                    : 0
                }% tổng số`}
                trend={5}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={ShoppingCartOutlined}
                title="Giá Trị TB"
                value={formatPrice(avgOrderValue).replace("đ", "")}
                prefix=""
                subtitle="VND/đơn"
                trend={-2}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
              />
            </Col>
          </Row>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Search Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 max-w-md">
                <Search
                  placeholder="Tìm kiếm giao dịch, khách hàng..."
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-3 flex-wrap">
                <Button.Group>
                  <Button
                    icon={<UnorderedListOutlined />}
                    size="large"
                    type={viewMode === "table" ? "primary" : "default"}
                    onClick={() => setViewMode("table")}
                  />
                  <Button
                    icon={<AppstoreOutlined />}
                    size="large"
                    type={viewMode === "grid" ? "primary" : "default"}
                    onClick={() => setViewMode("grid")}
                  />
                </Button.Group>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center space-x-3 flex-wrap">
                <Select
                  value={periodFilter}
                  onChange={setPeriodFilter}
                  size="large"
                  style={{ width: 120 }}
                  placeholder="Thời gian"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="today">Hôm nay</Option>
                  <Option value="week">Tuần này</Option>
                  <Option value="month">Tháng này</Option>
                  <Option value="quarter">Quý này</Option>
                  <Option value="year">Năm này</Option>
                </Select>

                <RangePicker
                  size="large"
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  style={{ width: 280 }}
                />

                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  size="large"
                  style={{ width: 130 }}
                  placeholder="Trạng thái"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Completed">Hoàn thành</Option>
                  <Option value="Processing">Đang xử lý</Option>
                  <Option value="Cancelled">Đã hủy</Option>
                </Select>

                <Select
                  value={paymentMethodFilter}
                  onChange={setPaymentMethodFilter}
                  size="large"
                  style={{ width: 150 }}
                  placeholder="Phương thức"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="vnpay">VNPay</Option>
                  <Option value="momo">MoMo</Option>
                  <Option value="cod">Tiền mặt</Option>
                  <Option value="ZaloPay">ZaloPay</Option>
                </Select>
              </div>
            </div>

            {/* Selection Actions Row */}
            {hasSelected && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Text className="text-blue-700">
                  Đã chọn <strong>{selectedRowKeys.length}</strong> giao dịch
                </Text>
                <Space>
                  <Button type="primary" className="shadow-md">
                    Xuất đã chọn
                  </Button>
                  <Button
                    onClick={() => setSelectedRowKeys([])}
                    className="shadow-md"
                  >
                    Hủy chọn
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {viewMode === "table" ? (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: onSelectChange,
              }}
              dataSource={paginatedData}
              columns={columns}
              scroll={{ x: 1200 }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredTransactions.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong ${total} giao dịch`,
                className: "mt-6",
              }}
              loading={loading}
              rowClassName="hover:bg-blue-50 transition-colors duration-200"
            />
          </Card>
        ) : (
          <div>
            <Row gutter={[16, 16]}>
              {paginatedData.map((transaction) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={transaction.key}>
                  <TransactionCard transaction={transaction} />
                </Col>
              ))}
            </Row>

            {/* Grid Pagination */}
            {filteredTransactions.length > pageSize && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-center space-x-6">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-6 py-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-sm"
                    >
                      Trước
                    </Button>
                    <span className="text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                      Trang {currentPage} /{" "}
                      {Math.ceil(filteredTransactions.length / pageSize)}
                    </span>
                    <Button
                      disabled={
                        currentPage >=
                        Math.ceil(filteredTransactions.length / pageSize)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-6 py-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-sm"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && !loading && (
          <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-gray-400 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextOutlined
                  style={{ fontSize: "3rem" }}
                  className="text-white"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ||
              statusFilter !== "all" ||
              paymentMethodFilter !== "all" ||
              dateRange.length > 0
                ? "Không tìm thấy giao dịch"
                : "Chưa có giao dịch nào"}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm ||
              statusFilter !== "all" ||
              paymentMethodFilter !== "all" ||
              dateRange.length > 0
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Các giao dịch sẽ xuất hiện tại đây khi có đơn hàng mới"}
            </p>
          </Card>
        )}
      </div>

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

export default Transactions;
