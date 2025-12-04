import {
  Button,
  Flex,
  Table,
  Card,
  Space,
  Tag,
  Typography,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Tooltip,
  Badge,
  Progress,
  notification,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getVoucherAPI } from "../../service/APIVoucher.js";
import moment from "moment";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom";
import UpdateVoucherModal from "../UpdateVoucherModal/UpdateVoucherModal.jsx";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

const Voucher = () => {
  const { styles } = useStyle();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const fetchApiVoucher = async () => {
    setLoading(true);
    try {
      let res = await getVoucherAPI();
      if (res.data && res.data.EC === 0) {
        setData(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (error) {
      console.log(error);
      api.error({
        message: "Lỗi",
        description: "Không thể tải danh sách voucher",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiVoucher();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status) => {
    return status === "Hiệu lực" ? "success" : "error";
  };

  const getDiscountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "percentage":
      case "phần trăm":
        return "blue";
      case "fixed":
      case "cố định":
        return "green";
      default:
        return "default";
    }
  };

  const getVoucherExpiry = (endDate) => {
    const now = moment();
    const end = moment(endDate);
    const daysLeft = end.diff(now, "days");

    if (daysLeft < 0) return { text: "Đã hết hạn", color: "error" };
    if (daysLeft <= 3) return { text: `${daysLeft} ngày`, color: "warning" };
    if (daysLeft <= 7) return { text: `${daysLeft} ngày`, color: "processing" };
    return { text: `${daysLeft} ngày`, color: "success" };
  };

  const getUsageProgress = (used, limit) => {
    if (!limit) return 0;
    return Math.round((used / limit) * 100);
  };

  const handleEditVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setUpdateModalVisible(true);
  };

  const handleUpdateSuccess = () => {
    fetchApiVoucher();
  };

  const handleUpdateCancel = () => {
    setUpdateModalVisible(false);
    setSelectedVoucher(null);
  };

  const handleViewNavigate = (voucher) => {
    setSelectedVoucher(voucher);
    setUpdateModalVisible(true);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const onSearch = (value) => {
    if (!value || !Array.isArray(originalData)) {
      setData(originalData || []);
    } else {
      const results = originalData.filter(
        (item) =>
          item?.code?.toLowerCase().includes(value.toLowerCase()) ||
          item?.userGroup?.toLowerCase().includes(value.toLowerCase())
      );
      setData(results);
    }
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFilters(value, discountTypeFilter);
  };

  const handleDiscountTypeFilter = (value) => {
    setDiscountTypeFilter(value);
    applyFilters(statusFilter, value);
  };

  const applyFilters = (status, discountType) => {
    let filtered = [...originalData];

    if (status !== "all") {
      const statusValue = status === "active";
      filtered = filtered.filter((item) => item.status === statusValue);
    }

    if (discountType !== "all") {
      filtered = filtered.filter((item) => item.discountType === discountType);
    }

    setData(filtered);
  };

  const dataSource =
    Array.isArray(data) && data.length > 0
      ? data.map((voucher, i) => ({
          key: voucher._id || i,
          id: i + 1,
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          minOrderValue: formatPrice(voucher.minOrderValue),
          startDate: moment(voucher.startDate).format("DD/MM/YYYY"),
          endDate: moment(voucher.endDate).format("DD/MM/YYYY"),
          endDateRaw: voucher.endDate,
          usageLimit: voucher.usageLimit,
          usedCount: voucher.usedCount,
          appliedUsers: voucher.appliedUsers?.length || 0,
          status: voucher.status,
          userGroup: voucher.userGroup,
          originalData: voucher,
        }))
      : [];

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      width: 60,
      align: "center",
      render: (text) => (
        <Text strong className="text-gray-600">
          #{text}
        </Text>
      ),
    },
    {
      title: "Thông tin voucher",
      dataIndex: "voucherInfo",
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TagOutlined className="text-blue-500" />
            <Text strong className="text-lg">
              {record.code}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag
              color={getDiscountTypeColor(record.discountType)}
              icon={
                record.discountType === "percentage" ? (
                  <PercentageOutlined />
                ) : (
                  <DollarOutlined />
                )
              }
            >
              {record.discountType === "percentage" ? "Phần trăm" : "Cố định"}
            </Tag>
            <Tag color="purple">
              {record.discountType === "percentage"
                ? `${record.discountValue}%`
                : formatPrice(record.discountValue)}
            </Tag>
          </div>
          <Text type="secondary" className="text-sm">
            Đơn tối thiểu: {record.minOrderValue}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "dateInfo",
      width: 180,
      render: (_, record) => {
        const expiry = getVoucherExpiry(record.endDateRaw);
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <CalendarOutlined className="text-green-500" />
              <Text>Từ: {record.startDate}</Text>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <CalendarOutlined className="text-red-500" />
              <Text>Đến: {record.endDate}</Text>
            </div>
            <Tag color={expiry.color} size="small">
              Còn {expiry.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Sử dụng",
      dataIndex: "usage",
      width: 150,
      align: "center",
      render: (_, record) => {
        const progress = getUsageProgress(record.usedCount, record.usageLimit);
        return (
          <div className="space-y-2">
            <div className="text-center">
              <Text strong>{record.usedCount}</Text>
              <Text type="secondary">/{record.usageLimit || "∞"}</Text>
            </div>
            <Progress
              percent={progress}
              size="small"
              strokeColor={
                progress > 80
                  ? "#ff4d4f"
                  : progress > 50
                  ? "#faad14"
                  : "#52c41a"
              }
              showInfo={false}
            />
            <div className="text-center">
              <UserOutlined className="text-blue-500 mr-1" />
              <Text className="text-sm">{record.appliedUsers} người dùng</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag
          color={status ? "success" : "error"}
          className="px-3 py-1 font-medium"
        >
          {status ? "Hiệu lực" : "Không hiệu lực"}
        </Tag>
      ),
    },
    {
      title: "Nhóm KH",
      dataIndex: "userGroup",
      width: 120,
      align: "center",
      render: (group) => <Tag color="geekblue">{group || "Tất cả"}</Tag>,
    },
    {
      title: "Hành động",
      key: "operation",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewNavigate(record.originalData)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditVoucher(record.originalData)}
              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Statistics
  const totalVouchers = Array.isArray(data) ? data.length : 0;
  const activeVouchers = Array.isArray(data)
    ? data.filter((v) => v.status).length
    : 0;
  const expiredVouchers = Array.isArray(data)
    ? data.filter((v) => moment(v.endDate).isBefore(moment())).length
    : 0;
  const totalUsage = Array.isArray(data)
    ? data.reduce((sum, v) => sum + (v.usedCount || 0), 0)
    : 0;

  return (
    <div className="w-full space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="text-white m-0">
              Quản lý mã giảm giá
            </Title>
            <Text className="text-purple-100">
              Tạo và quản lý các voucher khuyến mãi cho khách hàng
            </Text>
          </div>
          <GiftOutlined className="text-6xl text-white/20" />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <TagOutlined className="mr-2 text-purple-500" />
                  Tổng voucher
                </span>
              }
              value={totalVouchers}
              valueStyle={{
                color: "#8b5cf6",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <GiftOutlined className="mr-2 text-green-500" />
                  Đang hoạt động
                </span>
              }
              value={activeVouchers}
              valueStyle={{
                color: "#10b981",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <CalendarOutlined className="mr-2 text-red-500" />
                  Đã hết hạn
                </span>
              }
              value={expiredVouchers}
              valueStyle={{
                color: "#ef4444",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <UserOutlined className="mr-2 text-blue-500" />
                  Lượt sử dụng
                </span>
              }
              value={totalUsage}
              valueStyle={{
                color: "#3b82f6",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchApiVoucher}
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md"
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/admin/add-voucher")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-md"
              >
                Thêm voucher
              </Button>

              {hasSelected && (
                <Badge count={selectedRowKeys.length} className="mr-2">
                  <Text className="text-gray-600">
                    Đã chọn {selectedRowKeys.length} voucher
                  </Text>
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
                placeholder="Trạng thái"
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Hiệu lực</Option>
                <Option value="inactive">Không hiệu lực</Option>
              </Select>

              <Select
                value={discountTypeFilter}
                onChange={handleDiscountTypeFilter}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
                placeholder="Loại giảm giá"
              >
                <Option value="all">Tất cả</Option>
                <Option value="percentage">Phần trăm</Option>
                <Option value="fixed">Cố định</Option>
              </Select>

              <Search
                placeholder="Tìm kiếm mã voucher..."
                allowClear
                onSearch={onSearch}
                style={{ width: 300 }}
                size="middle"
                enterButton={<SearchOutlined />}
              />
            </div>
          </div>

          {/* Table */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            className={styles.customTable}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} voucher`,
            }}
            scroll={{ x: 1200 }}
            rowClassName="hover:bg-gray-50"
          />
        </div>
      </Card>

      <UpdateVoucherModal
        visible={updateModalVisible}
        onCancel={handleUpdateCancel}
        onSuccess={handleUpdateSuccess}
        voucherData={selectedVoucher}
      />
    </div>
  );
};

export default Voucher;
