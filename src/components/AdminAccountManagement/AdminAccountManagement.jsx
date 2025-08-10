import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Spin,
} from "antd";
import {
  UserAddOutlined,
  KeyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  UserOutlined,
  LockOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AdminChangleProfileAPI } from "../../service/Auth";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminAccountManagement = () => {
  const [createForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { user } = useSelector((state) => state.auth);
  // Dữ liệu mô tả vai trò
  const roleDescriptions = {
    admin: "Toàn quyền truy cập và quản lý hệ thống",
    manager: "Quản lý nội dung và người dùng trong phạm vi được phân quyền",
    editor: "Tạo và chỉnh sửa nội dung, không có quyền quản lý người dùng",
    user: "Quyền truy cập cơ bản, chỉ xem và sử dụng các tính năng được cho phép",
  };

  // Xử lý tạo tài khoản
  const handleCreateAccount = async (values) => {
    setCreateLoading(true);

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success({
        content: (
          <Space>
            <CheckCircleOutlined className="text-green-500" />
            <span>
              Tài khoản <strong>{values.username}</strong> đã được tạo thành
              công!
            </span>
          </Space>
        ),
        duration: 5,
      });

      createForm.resetFields();
      setSelectedRole("");
    } catch (error) {
      message.error({
        content: (
          <Space>
            <ExclamationCircleOutlined className="text-red-500" />
            <span>Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại!</span>
          </Space>
        ),
        duration: 4,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Xử lý khôi phục mật khẩu
  const handleResetPassword = async (values) => {
    setResetLoading(true);

    try {
      // Giả lập API call
      const res = await AdminChangleProfileAPI(
        values.resetEmail,
        values.newPassword,
        values.adminPassword,
        user.email
      );

      let successMessage = "";
      switch (values.resetMethod) {
        case "email":
          successMessage = `Email khôi phục mật khẩu đã được gửi đến: ${values.resetEmail}`;
          break;
        case "manual":
          successMessage = "Mật khẩu mới đã được cập nhật thành công!";
          break;
        case "temp":
          successMessage = "Mật khẩu tạm thời đã được tạo và gửi qua email!";
          break;
      }

      message.success({
        content: (
          <Space>
            <CheckCircleOutlined className="text-green-500" />
            <span>{successMessage}</span>
          </Space>
        ),
        duration: 5,
      });

      resetForm.resetFields();
      setResetMethod("");
    } catch (error) {
      message.error({
        content: (
          <Space>
            <ExclamationCircleOutlined className="text-red-500" />
            <span>Có lỗi xảy ra khi khôi phục mật khẩu. Vui lòng thử lại!</span>
          </Space>
        ),
        duration: 4,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Validation rules
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập mật khẩu!"));
    }
    if (value.length < 6) {
      return Promise.reject(new Error("Mật khẩu phải có ít nhất 6 ký tự!"));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
    },
  });

  // Xử lý thay đổi vai trò
  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Xử lý thay đổi phương thức reset
  const handleResetMethodChange = (value) => {
    setResetMethod(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
            <SettingOutlined className="text-3xl text-white" />
          </div>
          <Title level={1} className="!text-white !mb-2 !font-light">
            Hệ Thống Quản Lý Admin
          </Title>
          <Text className="text-white/90 text-lg">
            Quản lý tài khoản và khôi phục mật khẩu
          </Text>
        </div>

        <Row gutter={[30, 30]} justify="center" className="max-w-5xl mx-auto">
          {/* Form Tạo Tài Khoản */}
          <Col xs={24} lg={12}>
            <Card
              className="!bg-white/95 !backdrop-blur-lg !rounded-2xl !shadow-2xl !border-none hover:!shadow-3xl transition-all duration-300 hover:-translate-y-1"
              bodyStyle={{ padding: "40px" }}
            >
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <UserAddOutlined className="text-3xl text-white" />
                </div>
                <Title level={3} className="!mb-2 !text-gray-800">
                  Tạo Tài Khoản Mới
                </Title>
                <Text className="text-gray-600">
                  Thêm người dùng mới vào hệ thống
                </Text>
              </div>

              <Form
                form={createForm}
                layout="vertical"
                onFinish={handleCreateAccount}
                requiredMark={false}
                className="space-y-4"
              >
                <Form.Item
                  name="fullName"
                  label={
                    <span className="text-gray-700 font-medium">
                      Họ và tên *
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                    { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nhập họ và tên đầy đủ"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={
                    <span className="text-gray-700 font-medium">Email *</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="example@company.com"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                  />
                </Form.Item>

                <Form.Item
                  name="username"
                  label={
                    <span className="text-gray-700 font-medium">
                      Tên đăng nhập *
                    </span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                    {
                      min: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự!",
                    },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: "Chỉ chấp nhận chữ cái, số và dấu gạch dưới!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nhập tên đăng nhập"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <span className="text-gray-700 font-medium">
                      Mật khẩu *
                    </span>
                  }
                  rules={[{ validator: validatePassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={
                    <span className="text-gray-700 font-medium">
                      Xác nhận mật khẩu *
                    </span>
                  }
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    validateConfirmPassword,
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập lại mật khẩu"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-blue-400 focus:!border-blue-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="role"
                  label={
                    <span className="text-gray-700 font-medium">Vai trò *</span>
                  }
                  rules={[
                    { required: true, message: "Vui lòng chọn vai trò!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn vai trò"
                    size="large"
                    onChange={handleRoleChange}
                    className="!rounded-xl"
                    dropdownClassName="!rounded-xl !shadow-lg"
                  >
                    <Option value="admin">Quản trị viên</Option>
                    <Option value="manager">Quản lý</Option>
                    <Option value="editor">Biên tập viên</Option>
                    <Option value="user">Người dùng</Option>
                  </Select>
                </Form.Item>

                {selectedRole && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                      <Text className="text-blue-700 text-sm">
                        {roleDescriptions[selectedRole]}
                      </Text>
                    </div>
                  </div>
                )}

                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createLoading}
                    size="large"
                    block
                    className="!h-12 !rounded-xl !bg-gradient-to-r !from-blue-500 !to-purple-600 !border-none !font-semibold hover:!shadow-lg transform hover:!-translate-y-0.5 transition-all duration-200"
                    icon={<UserAddOutlined />}
                  >
                    {createLoading ? (
                      <Space>
                        <Spin size="small" />
                        Đang tạo...
                      </Space>
                    ) : (
                      "Tạo Tài Khoản"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Form Khôi Phục Mật Khẩu */}
          <Col xs={24} lg={12}>
            <Card
              className="!bg-white/95 !backdrop-blur-lg !rounded-2xl !shadow-2xl !border-none hover:!shadow-3xl transition-all duration-300 hover:-translate-y-1"
              bodyStyle={{ padding: "40px" }}
            >
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4 shadow-lg">
                  <KeyOutlined className="text-3xl text-white" />
                </div>
                <Title level={3} className="!mb-2 !text-gray-800">
                  Khôi Phục Mật Khẩu
                </Title>
                <Text className="text-gray-600">
                  Đặt lại mật khẩu cho tài khoản người dùng
                </Text>
              </div>

              <Form
                form={resetForm}
                layout="vertical"
                onFinish={handleResetPassword}
                requiredMark={false}
                className="space-y-4"
              >
                <Form.Item
                  name="resetEmail"
                  label={
                    <span className="text-gray-700 font-medium">
                      Email hoặc tên đăng nhập *
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập email hoặc tên đăng nhập!",
                    },
                  ]}
                >
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Nhập email hoặc tên đăng nhập"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-pink-400 focus:!border-pink-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                  />
                </Form.Item>

                <Form.Item
                  name="resetMethod"
                  label={
                    <span className="text-gray-700 font-medium">
                      Phương thức khôi phục *
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phương thức khôi phục!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn phương thức"
                    size="large"
                    onChange={handleResetMethodChange}
                    className="!rounded-xl"
                    dropdownClassName="!rounded-xl !shadow-lg"
                  >
                    <Option value="email">Gửi email khôi phục</Option>
                    <Option value="manual">Đặt mật khẩu mới</Option>
                    <Option value="temp">Tạo mật khẩu tạm thời</Option>
                  </Select>
                </Form.Item>

                {resetMethod === "manual" && (
                  <Form.Item
                    name="newPassword"
                    label={
                      <span className="text-gray-700 font-medium">
                        Mật khẩu mới *
                      </span>
                    }
                    rules={[{ validator: validatePassword }]}
                    className="animate-fade-in"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Nhập mật khẩu mới"
                      size="large"
                      className="!rounded-xl !border-2 !border-gray-200 hover:!border-pink-400 focus:!border-pink-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="adminPassword"
                  label={
                    <span className="text-gray-700 font-medium">
                      Xác thực admin *
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu admin để xác thực!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<SettingOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu admin để xác thực"
                    size="large"
                    className="!rounded-xl !border-2 !border-gray-200 hover:!border-red-400 focus:!border-red-500 !bg-gray-50 focus:!bg-white transition-all duration-200"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={resetLoading}
                    size="large"
                    block
                    className="!h-12 !rounded-xl !bg-gradient-to-r !from-pink-500 !to-red-500 !border-none !font-semibold hover:!shadow-lg transform hover:!-translate-y-0.5 transition-all duration-200"
                    icon={<KeyOutlined />}
                  >
                    {resetLoading ? (
                      <Space>
                        <Spin size="small" />
                        Đang xử lý...
                      </Space>
                    ) : (
                      "Khôi Phục Mật Khẩu"
                    )}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .ant-select-focused .ant-select-selector {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminAccountManagement;
