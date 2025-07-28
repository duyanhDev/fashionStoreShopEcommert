import { Flex, Modal, Form, Input, Button, message, Row, Col } from "antd";
import { useState } from "react";
import { CreateSupplierAPI } from "../../../service/Supplier";

const AddManageStore = ({ openResponsive, setOpenResponsive, fetchData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    taxCode: "",
    notes: "",
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await CreateSupplierAPI(values);
      console.log(res);

      if (res?.data?.EC === 0) {
        message.success("Thêm nhà cung cấp thành công!");

        form.resetFields();
        setFormData({
          name: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          website: "",
          taxCode: "",
          notes: "",
        });
        setOpenResponsive(false);
        await fetchData();
      } else {
        message.error(res.data?.EM || "Có lỗi xảy ra!");
      }
    } catch (error) {
      // 👇 Bắt lỗi từ server trả về (ví dụ: 400, 409, v.v.)
      const errMessage =
        error.response?.data?.EM || "Có lỗi xảy ra khi thêm nhà cung cấp!";
      message.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenResponsive(false);
  };

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject(
        new Error("Số điện thoại không hợp lệ (10-11 chữ số)")
      );
    }
    return Promise.resolve();
  };

  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error("Email không hợp lệ"));
    }
    return Promise.resolve();
  };

  const validateWebsite = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(value)) {
      return Promise.reject(new Error("Website không hợp lệ"));
    }
    return Promise.resolve();
  };

  const validateTaxCode = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const taxCodeRegex = /^[0-9]{10,13}$/;
    if (!taxCodeRegex.test(value)) {
      return Promise.reject(
        new Error("Mã số thuế không hợp lệ (10-13 chữ số)")
      );
    }
    return Promise.resolve();
  };

  return (
    <Flex>
      <Modal
        title="Thêm nhà cung cấp mới"
        centered
        open={openResponsive}
        onCancel={handleCancel}
        width={{
          xs: "95%",
          sm: "85%",
          md: "75%",
          lg: "65%",
          xl: "55%",
          xxl: "45%",
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên nhà cung cấp"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên nhà cung cấp!",
                  },
                  { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                  { max: 100, message: "Tên không được vượt quá 100 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Người liên hệ"
                name="contactPerson"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên người liên hệ!",
                  },
                  {
                    min: 2,
                    message: "Tên người liên hệ phải có ít nhất 2 ký tự!",
                  },
                ]}
              >
                <Input placeholder="Nhập tên người liên hệ" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { validator: validatePhone },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ validator: validateEmail }]}
              >
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Website"
                name="website"
                rules={[{ validator: validateWebsite }]}
              >
                <Input
                  placeholder="Nhập website (VD: https://example.com)"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã số thuế"
                name="taxCode"
                rules={[{ validator: validateTaxCode }]}
              >
                <Input placeholder="Nhập mã số thuế" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ!" },
              { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập địa chỉ chi tiết"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Flex justify="end" gap={12}>
              <Button size="large" onClick={handleCancel} disabled={loading}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                Thêm nhà cung cấp
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default AddManageStore;
