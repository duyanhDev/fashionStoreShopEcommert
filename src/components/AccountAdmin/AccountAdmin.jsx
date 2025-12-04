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
  Table,
  Popconfirm,
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
  PlusOutlined,
  FilterOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

import socket from "../../socket";

const AccountAdmin = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const fetchAPIUser = async () => {
    setLoading(true);
    try {
      let res = await UserAuth();
      if (res && res.data && res.data.EC === 0) {
        setOriginalData(res.data.data);
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
      api.error({
        message: "Lỗi",
        description: "Không thể tải danh sách tài khoản",
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

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "staff":
        return "blue";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <CrownOutlined />;
      case "staff":
        return <SafetyCertificateOutlined />;
      default:
        return <UserOutlined />;
    }
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
        api.error({
          message: "Khóa không thành công tài khoản",
          description: res.data.message,
        });
      }
    } catch (error) {
      api.error({
        message: "Khóa không thành công tài khoản",
        description: "Bạn không thể khóa tài khoản này",
      });
    }
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
      title: "Thông tin tài khoản",
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
            <div className="text-xs text-gray-400 capitalize">
              {record.gender}
            </div>
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
      title: "Quyền hạn",
      dataIndex: "role",
      width: 120,
      align: "center",
      render: (role) => (
        <Tag
          color={getRoleColor(role)}
          icon={getRoleIcon(role)}
          className="px-3 py-1 font-medium"
        >
          {role === "admin" ? "Quản trị viên" : "Nhân viên"}
        </Tag>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalPrice",
      width: 150,
      align: "right",
      render: (price) => (
        <Text strong className="text-green-600">
          {price}
        </Text>
      ),
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
              title="Xóa tài khoản"
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
    navigate(`/admin/usercustom/${record.id}`);
  };

  const dataUserCustom = Array.isArray(data)
    ? data.filter((users) => {
        const isAdminOrStaff = users.role === "admin" || users.role === "staff";
        if (filterRole === "all") return isAdminOrStaff;
        return isAdminOrStaff && users.role === filterRole;
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
          role: user.role,
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

  const handleRoleFilter = (value) => {
    setFilterRole(value);
  };

  // Statistics
  const adminCount = Array.isArray(dataUserCustom)
    ? dataUserCustom.filter((u) => u.role === "admin").length
    : 0;
  const staffCount = Array.isArray(dataUserCustom)
    ? dataUserCustom.filter((u) => u.role === "staff").length
    : 0;
  const totalCount = Array.isArray(dataUserCustom) ? dataUserCustom.length : 0;

  return (
    <div className="w-full space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="text-white m-0">
              Quản lý tài khoản Admin
            </Title>
            <Text className="text-blue-100">
              Quản lý thông tin tài khoản quản trị viên và nhân viên
            </Text>
          </div>
          <TeamOutlined className="text-6xl text-white/20" />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <CrownOutlined className="mr-2 text-red-500" />
                  Quản trị viên
                </span>
              }
              value={adminCount}
              valueStyle={{
                color: "#ef4444",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <SafetyCertificateOutlined className="mr-2 text-blue-500" />
                  Nhân viên
                </span>
              }
              value={staffCount}
              valueStyle={{
                color: "#3b82f6",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  <TeamOutlined className="mr-2 text-green-500" />
                  Tổng cộng
                </span>
              }
              value={totalCount}
              valueStyle={{
                color: "#10b981",
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
                    Đã chọn {selectedRowKeys.length} mục
                  </Text>
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select
                value={filterRole}
                onChange={handleRoleFilter}
                style={{ width: 150 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả</Option>
                <Option value="admin">Quản trị viên</Option>
                <Option value="staff">Nhân viên</Option>
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
                `${range[0]}-${range[1]} của ${total} mục`,
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

export default AccountAdmin;
