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
  Image,
  notification,
  Modal,
  Switch,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import moment from "moment";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom";
import {
  CheckIsActiveBannerAPI,
  DeleteBannerAPI,
  getListBannerAPI,
} from "../../service/APIBanner";
import axios from "axios";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

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

const Banner = () => {
  const { styles } = useStyle();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const fetchApiBanner = async () => {
    setLoading(true);
    try {
      let res = await getListBannerAPI();
      if (res.data && res.data.EC === 0) {
        setData(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (error) {
      console.log(error);
      api.error({
        message: "Lỗi",
        description: "Không thể tải danh sách banner",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiBanner();
  }, []);

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getPositionColor = (position) => {
    switch (position?.toLowerCase()) {
      case "home":
        return "blue";
      case "sidebar":
        return "green";
      case "top":
        return "orange";
      case "bottom":
        return "purple";
      default:
        return "default";
    }
  };

  const getPositionText = (position) => {
    switch (position?.toLowerCase()) {
      case "home":
        return "Trang chủ";
      case "sidebar":
        return "Thanh bên";
      case "top":
        return "Đầu trang";
      case "bottom":
        return "Cuối trang";
      default:
        return position;
    }
  };

  const handleEditBanner = (banner) => {
    navigate(`/admin/update-banner/${banner._id}`);
  };

  const handleUpdateSuccess = () => {
    fetchApiBanner();
  };

  const handleUpdateCancel = () => {
    setUpdateModalVisible(false);
    setSelectedBanner(null);
  };

  const handleViewNavigate = (id) => {
    navigate(`/admin/banner/${id}`);
  };

  const handleDeleteBanner = async (banner) => {
    confirm({
      title: "Xác nhận xóa banner",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa banner "${banner.title}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await DeleteBannerAPI(banner._id);

          if (res && res.data && res.data.EC === 0) {
            api.success({
              message: "Thành công",
              description: "Đã xóa banner thành công",
            });
            fetchApiBanner(); // Cập nhật lại danh sách banner
          } else {
            api.error({
              message: "Thất bại",
              description: res?.data?.EM || "Xóa banner không thành công",
            });
          }
        } catch (error) {
          console.error("Error deleting banner:", error);
          api.error({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi xóa banner",
          });
        }
      },
    });
  };

  const handleStatusToggle = async (banner, checked) => {
    try {
      // Replace with actual API call to update status

      const res = await CheckIsActiveBannerAPI(banner._id, checked);

      if (res && res.data && res.data.success === true) {
        api.success({
          message: "Thành công",
          description: `Đã ${checked ? "kích hoạt" : "tắt"} banner`,
        });
      }

      fetchApiBanner();
    } catch (error) {
      api.error({
        message: "Lỗi",
        description: "Không thể cập nhật trạng thái banner",
      });
    }
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
          item?.title?.toLowerCase().includes(value.toLowerCase()) ||
          item?.postion?.toLowerCase().includes(value.toLowerCase())
      );
      setData(results);
    }
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFilters(value, positionFilter);
  };

  const handlePositionFilter = (value) => {
    setPositionFilter(value);
    applyFilters(statusFilter, value);
  };

  const applyFilters = (status, position) => {
    let filtered = [...originalData];

    if (status !== "all") {
      const statusValue = status === "active";
      filtered = filtered.filter((item) => item.isActive === statusValue);
    }

    if (position !== "all") {
      filtered = filtered.filter((item) => item.postion === position);
    }

    setData(filtered);
  };

  const dataSource =
    Array.isArray(data) && data.length > 0
      ? data.map((banner, i) => ({
          key: banner._id || i,
          id: i + 1,
          title: banner.title,
          imageUrl: banner.imageUrl,
          link: banner.link,
          postion: banner.postion,
          isActive: banner.isActive,
          createdAt: moment(banner.createdAt).format("DD/MM/YYYY HH:mm"),
          updatedAt: moment(banner.updatedAt).format("DD/MM/YYYY HH:mm"),
          originalData: banner,
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
      title: "Thông tin banner",
      dataIndex: "bannerInfo",
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PictureOutlined className="text-blue-500" />
            <Text strong className="text-lg">
              {record.title}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={record.imageUrl}
              alt={record.title}
              width={80}
              height={40}
              style={{ objectFit: "cover", borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN/..."
            />
          </div>
          {record.link && (
            <div className="flex items-center gap-1 text-sm">
              <LinkOutlined className="text-green-500" />
              <Text type="secondary" className="truncate max-w-xs">
                {record.link}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "postion",
      width: 120,
      align: "center",
      render: (position) => (
        <Tag color={getPositionColor(position)} icon={<EnvironmentOutlined />}>
          {getPositionText(position)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      align: "center",
      render: (isActive, record) => (
        <div className="flex flex-col items-center gap-2">
          <Tag
            color={isActive ? "success" : "error"}
            icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            className="px-3 py-1 font-medium"
          >
            {isActive ? "Hiển thị" : "Ẩn"}
          </Tag>
          <Switch
            size="small"
            checked={isActive}
            onChange={(checked) =>
              handleStatusToggle(record.originalData, checked)
            }
          />
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "timeInfo",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1 text-sm">
          <div>
            <Text type="secondary">Tạo: </Text>
            <Text>{record.createdAt}</Text>
          </div>
          <div>
            <Text type="secondary">Cập nhật: </Text>
            <Text>{record.updatedAt}</Text>
          </div>
        </div>
      ),
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
              onClick={() => handleViewNavigate(record.key)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditBanner(record.originalData)}
              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteBanner(record.originalData)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Statistics
  const totalBanners = Array.isArray(data) ? data.length : 0;
  const activeBanners = Array.isArray(data)
    ? data.filter((b) => b.isActive).length
    : 0;
  const inactiveBanners = totalBanners - activeBanners;
  const homePageBanners = Array.isArray(data)
    ? data.filter((b) => b.postion === "home").length
    : 0;

  return (
    <div className="w-full space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="text-white m-0">
              Quản lý Banner
            </Title>
            <Text className="text-blue-100">
              Tạo và quản lý các banner hiển thị trên website
            </Text>
          </div>
          <PictureOutlined className="text-6xl text-white/20" />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <PictureOutlined className="mr-2 text-blue-500" />
                  Tổng banner
                </span>
              }
              value={totalBanners}
              valueStyle={{
                color: "#3b82f6",
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
                  <CheckCircleOutlined className="mr-2 text-green-500" />
                  Đang hiển thị
                </span>
              }
              value={activeBanners}
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
                  <CloseCircleOutlined className="mr-2 text-red-500" />
                  Đang ẩn
                </span>
              }
              value={inactiveBanners}
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
                  <EnvironmentOutlined className="mr-2 text-purple-500" />
                  Trang chủ
                </span>
              }
              value={homePageBanners}
              valueStyle={{
                color: "#8b5cf6",
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
                onClick={fetchApiBanner}
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md"
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/admin/add-banner")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-md"
              >
                Thêm banner
              </Button>

              {hasSelected && (
                <Badge count={selectedRowKeys.length} className="mr-2">
                  <Text className="text-gray-600">
                    Đã chọn {selectedRowKeys.length} banner
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
                <Option value="active">Hiển thị</Option>
                <Option value="inactive">Ẩn</Option>
              </Select>

              <Select
                value={positionFilter}
                onChange={handlePositionFilter}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
                placeholder="Vị trí"
              >
                <Option value="all">Tất cả vị trí</Option>
                <Option value="home">Trang chủ</Option>
                <Option value="sidebar">Thanh bên</Option>
                <Option value="top">Đầu trang</Option>
                <Option value="bottom">Cuối trang</Option>
              </Select>

              <Search
                placeholder="Tìm kiếm banner..."
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
                `${range[0]}-${range[1]} của ${total} banner`,
            }}
            scroll={{ x: 1200 }}
            rowClassName="hover:bg-gray-50"
          />
        </div>
      </Card>
    </div>
  );
};

export default Banner;
