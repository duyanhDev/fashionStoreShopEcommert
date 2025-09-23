import { useEffect, useState } from "react";
import {
  DeleteUserAPI,
  isAccountUserLockerAPI,
  UserAuth,
} from "../../service/Auth";
import {
  Avatar,
  Button,
  Flex,
  notification,
  Popconfirm,
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
  Switch,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

import socket from "../../socket";

const UsersCustom = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [genderFilter, setGenderFilter] = useState("all");
  const [api, contextHolder] = notification.useNotification();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const fetchAPIUser = async () => {
    setLoading(true);
    try {
      let res = await UserAuth();
      if (res && res.data && res.data.EC === 0) {
        setOriginalData(res.data.data || []);
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      api.error({
        message: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPIUser();
  }, []);

  useEffect(() => {
    socket.on("userDeleted", ({ userId }) => {
      fetchAPIUser();
    });

    return () => {
      socket.off("userDeleted");
    };
  }, []);

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
      case "nam":
        return "blue";
      case "female":
      case "nữ":
        return "pink";
      default:
        return "default";
    }
  };

  const getGenderText = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "nam":
        return "Nam";
      case "nữ":
        return "Nữ";
      default:
        return "Không xác định";
    }
  };

  const getSpendingLevel = (totalPrice) => {
    const price = parseFloat(totalPrice?.replace(/[^\d]/g, "") || 0);
    if (price >= 10000000) return { level: "VIP", color: "gold" };
    if (price >= 5000000) return { level: "Thân thiết", color: "purple" };
    if (price >= 1000000) return { level: "Bạc", color: "default" };
    return { level: "Mới", color: "green" };
  };

  const handleStatusToggle = async (record, checked) => {
    try {
      const res = await isAccountUserLockerAPI(record.id, checked);

      if (res && res.data && res.data.EC === 0) {
        api.success({
          message: "Khóa thành công tài khoản",
          description: res.data.message,
        });
        fetchAPIUser();
      } else {
        api.success({
          message: "Khóa không thành công tài khoản",
          description: res.data.message,
        });
      }
    } catch (error) {}
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      width: 60,
      align: "center",
      render: (text) => (
        <Text strong className="text-gray-600">
          #{text}
        </Text>
      ),
    },
    {
      title: "Thông tin khách hàng",
      dataIndex: "userInfo",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={48}
            src={record.avatarUrl}
            icon={<UserOutlined />}
            className="border-2 border-blue-100 shadow-sm"
          />
          <div>
            <div className="font-semibold text-gray-800">{record.name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
            <Tag
              color={getGenderColor(record.gender)}
              size="small"
              className="mt-1"
            >
              {getGenderText(record.gender)}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isAccountLocked",
      width: 120,
      align: "center",
      render: (isAccountLocked, record) => {
        return (
          <div className="flex flex-col items-center gap-2">
            <Tag
              color={isAccountLocked ? "error" : "success"}
              icon={
                isAccountLocked ? (
                  <LockOutlined style={{ color: "#ff4d4f" }} /> // Tài khoản bị khóa - icon khóa màu đỏ
                ) : (
                  <CheckCircleOutlined style={{ color: "#52c41a" }} /> // Tài khoản mở - icon check màu xanh
                )
              }
              className="px-3 py-1 font-medium"
            >
              {isAccountLocked ? "Đang bị khóa" : "Đang hoạt động"}
            </Tag>
            <Switch
              size="small"
              checked={isAccountLocked}
              onChange={(checked) => handleStatusToggle(record, checked)}
            />
          </div>
        );
      },
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalPrice",
      width: 180,
      align: "right",
      render: (price, record) => {
        const spendingLevel = getSpendingLevel(price);
        return (
          <div className="text-right">
            <div className="font-semibold text-green-600 text-lg">{price}</div>
            <Tag color={spendingLevel.color} size="small">
              {spendingLevel.level}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Hành động",
      dataIndex: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleAdd(record)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
            />
          </Tooltip>
          <Tooltip title="Xóa tài khoản">
            <Popconfirm
              title="Xóa tài khoản khách hàng"
              description={`Bạn có chắc chắn muốn xóa tài khoản ${record.name} không?`}
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    navigate(`/admin/usercustom/${record.id}`);
  };

  const handleDelete = async (record) => {
    if (user.role !== "admin") {
      api.error({
        message: "Không có quyền",
        description: "Bạn không có quyền xóa tài khoản này",
      });
      return;
    }

    try {
      const res = await DeleteUserAPI(record.id);
      if (res && res.data.EC === 0) {
        api.success({
          message: "Thành công",
          description: res.data.message,
        });
      }
    } catch (error) {
      api.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi xóa tài khoản",
      });
    }
  };

  const handleAdd = (record) => {
    // Logic xem chi tiết khách hàng
  };

  const dataUserCustom = Array.isArray(data)
    ? data.filter((users) => {
        const isCustomer = users.role === "customer";
        if (genderFilter === "all") return isCustomer;
        return (
          isCustomer &&
          users.gender?.toLowerCase() === genderFilter.toLowerCase()
        );
      })
    : [];

  const dataSource =
    Array.isArray(dataUserCustom) && dataUserCustom.length > 0
      ? dataUserCustom.map((user, index) => ({
          key: index + 1,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar,
          id: user._id,
          gender: user.gender,
          totalPrice: formatPrice(user.totalPrice),
          isAccountLocked: user.isAccountLocked,
        }))
      : [];

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
          item?.name?.toLowerCase().includes(value.toLowerCase()) ||
          item?.email?.toLowerCase().includes(value.toLowerCase())
      );
      setData(results);
    }
  };

  const handleGenderFilter = (value) => {
    setGenderFilter(value);
  };

  // Statistics
  const totalCustomers = Array.isArray(dataUserCustom)
    ? dataUserCustom.length
    : 0;
  const maleCustomers = Array.isArray(dataUserCustom)
    ? dataUserCustom.filter(
        (u) =>
          u.gender?.toLowerCase() === "male" ||
          u.gender?.toLowerCase() === "nam"
      ).length
    : 0;
  const femaleCustomers = Array.isArray(dataUserCustom)
    ? dataUserCustom.filter(
        (u) =>
          u.gender?.toLowerCase() === "female" ||
          u.gender?.toLowerCase() === "nữ"
      ).length
    : 0;

  const totalSpending = Array.isArray(dataUserCustom)
    ? dataUserCustom.reduce((sum, user) => {
        const price = parseFloat(
          formatPrice(user.totalPrice).replace(/[^\d]/g, "") || 0
        );
        return sum + price;
      }, 0)
    : 0;

  return (
    <div className="w-full space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="text-white m-0">
              Quản lý khách hàng
            </Title>
            <Text className="text-green-100">
              Quản lý thông tin tài khoản và hoạt động mua sắm của khách hàng
            </Text>
          </div>
          <UsergroupAddOutlined className="text-6xl text-white/20" />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <UsergroupAddOutlined className="mr-2 text-blue-500" />
                  Tổng khách hàng
                </span>
              }
              value={totalCustomers}
              valueStyle={{
                color: "#3b82f6",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <UserOutlined className="mr-2 text-blue-600" />
                  Khách hàng nam
                </span>
              }
              value={maleCustomers}
              valueStyle={{
                color: "#2563eb",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <UserOutlined className="mr-2 text-pink-500" />
                  Khách hàng nữ
                </span>
              }
              value={femaleCustomers}
              valueStyle={{
                color: "#ec4899",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <DollarOutlined className="mr-2 text-green-500" />
                  Tổng doanh thu
                </span>
              }
              value={formatPrice(totalSpending)}
              valueStyle={{
                color: "#10b981",
                fontSize: "1.5rem",
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchAPIUser}
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md"
              >
                Làm mới
              </Button>

              {hasSelected && (
                <Badge count={selectedRowKeys.length} className="mr-2">
                  <Text className="text-gray-600">
                    Đã chọn {selectedRowKeys.length} khách hàng
                  </Text>
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select
                value={genderFilter}
                onChange={handleGenderFilter}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả</Option>
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
              </Select>

              <Search
                placeholder="Tìm kiếm theo tên hoặc email..."
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} khách hàng`,
            }}
            className="border rounded-xl"
            rowClassName="hover:bg-gray-50"
            scroll={{ x: 800 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UsersCustom;
