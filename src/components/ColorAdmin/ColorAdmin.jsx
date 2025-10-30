import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import {
  createColorAPI,
  deleteColorAPI,
  listColorAPI,
  updateColorAPI,
} from "../../service/APIColor";
import { useEffect } from "react";

const ColorAdmin = () => {
  const [colors, setColors] = useState([]);

  // Lấy danh sách type unique từ colors API
  const getUniqueTypes = () => {
    const uniqueTypes = [...new Set(colors.map((color) => color.type))];
    return uniqueTypes.map((type) => ({
      value: type,
      label: type,
    }));
  };

  const fetchAPIColor = async () => {
    try {
      const res = await listColorAPI();
      if (res && res.data && res.data.EC === 0) {
        setColors(res.data.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAPIColor();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [form] = Form.useForm();

  const showModal = (color = null) => {
    setEditingColor(color);
    if (color) {
      form.setFieldsValue(color);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingColor(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    if (editingColor) {
      const res = await updateColorAPI(
        editingColor._id,
        values.value,
        values.title,
        values.type
      );
      if (res && res.data && res.data.EC === 0) {
        message.success("Cập nhật màu thành công!");
        fetchAPIColor();
      } else {
        message.error("Cập nhật không thành công");
      }
    } else {
      const res = await createColorAPI(values.value, values.title, values.type);
      if (res && res.data && res.data.EC === 0) {
        message.success("Thêm màu mới thành công!");
        fetchAPIColor();
      } else {
        message.error("Thêm màu mới không thành công");
      }
    }
    handleCancel();
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteColorAPI(id);
      if (res && res.data && res.data.EC === 0) {
        message.success("Xóa thành công!");
        fetchAPIColor();
      } else {
        message.error("Xóa khôngthành công!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "Màu",
      dataIndex: "value",
      key: "value",
      render: (value) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: value,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
          <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
            {value}
          </span>
        </Space>
      ),
    },
    {
      title: "Tên màu",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colorMap = {
          primary: "blue",
          secondary: "green",
          accent: "orange",
          neutral: "default",
          info: "cyan",
          success: "green",
          warning: "gold",
          error: "red",
        };
        return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa màu này?"
            description="Bạn có chắc chắn muốn xóa màu này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BgColorsOutlined /> Quản Lý Màu Sắc
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Thêm màu mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={colors}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingColor ? "Chỉnh sửa màu" : "Thêm màu mới"}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: "primary" }}
          >
            <Form.Item
              label="Mã màu"
              name="value"
              rules={[
                { required: true, message: "Vui lòng nhập mã màu!" },
                {
                  pattern: /^#[0-9A-Fa-f]{6}$/,
                  message: "Mã màu phải có định dạng #RRGGBB",
                },
              ]}
            >
              <Input placeholder="#FF0000" maxLength={7} />
            </Form.Item>

            <Form.Item
              label="Tên màu"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên màu!" }]}
            >
              <Input placeholder="Nhập tên màu" />
            </Form.Item>

            <Form.Item
              label="Loại màu"
              name="type"
              rules={[{ required: true, message: "Vui lòng nhập loại màu!" }]}
            >
              {editingColor ? (
                // Khi update: hiển thị danh sách type từ API
                <Select placeholder="Chọn loại màu">
                  {getUniqueTypes().map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                // Khi thêm mới: nhập text loại màu
                <Input placeholder="Nhập loại màu (vd: primary, secondary, ...)" />
              )}
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {editingColor ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ColorAdmin;
