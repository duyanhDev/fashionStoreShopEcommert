import {
  Flex,
  Modal,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import {
  findOneSupplierAPI,
  updateSupplierAPI,
} from "../../../service/Supplier";

const UpdateSupplierForm = ({ openUpdate, setOpenUpdate, id, fetchData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [supplierData, setSupplierData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    taxCode: "",
    notes: "",
  });

  const fetchDataSupplier = async () => {
    if (!id) return;

    setFetchLoading(true);
    try {
      const res = await findOneSupplierAPI(id);

      if (res && res.data && res.data.EC === 0) {
        const supplier = res.data.data; // Assuming DT contains the supplier data
        const formattedData = {
          name: supplier.name || "",
          contactPerson: supplier.contactPerson || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          website: supplier.website || "",
          taxCode: supplier.taxCode || "",
          notes: supplier.notes || "",
        };
        setSupplierData(formattedData);
      } else {
        message.error("Không thể tải dữ liệu nhà cung cấp");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu nhà cung cấp");
    } finally {
      setFetchLoading(false);
    }
  };

  // Load dữ liệu khi modal mở và có id
  useEffect(() => {
    if (openUpdate && id) {
      fetchDataSupplier();
    }
  }, [openUpdate, id]);

  // Set form values khi có dữ liệu
  useEffect(() => {
    if (
      openUpdate &&
      supplierData &&
      Object.values(supplierData).some((val) => val !== "")
    ) {
      form.setFieldsValue(supplierData);
      setHasChanges(false);
    }
  }, [supplierData, openUpdate, form]);

  // Theo dõi thay đổi trong form
  const handleValuesChange = () => {
    setHasChanges(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await updateSupplierAPI(id, values);

      if (res && res.data && res.data.EC === 0) {
        message.success("Cập nhật nhà cung cấp thành công!");
        setHasChanges(false);
        setOpenUpdate(false);

        // Callback để refresh data ở component cha
        await fetchData();
      } else {
        message.error(
          res?.data?.EM || "Có lỗi xảy ra khi cập nhật nhà cung cấp!"
        );
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      message.error("Có lỗi xảy ra khi cập nhật nhà cung cấp!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: "Xác nhận",
        content: "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?",
        okText: "Đồng ý",
        cancelText: "Hủy",
        onOk: () => {
          form.resetFields();
          setHasChanges(false);
          setSupplierData({
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            website: "",
            taxCode: "",
            notes: "",
          });
          setOpenUpdate(false);
        },
      });
    } else {
      form.resetFields();
      setSupplierData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        taxCode: "",
        notes: "",
      });
      setOpenUpdate(false);
    }
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
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Cập nhật nhà cung cấp</span>
            {supplierData?.name && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#666",
                  fontWeight: "normal",
                }}
              >
                - {supplierData.name}
              </span>
            )}
          </div>
        }
        centered
        open={openUpdate}
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
        destroyOnClose={false}
        maskClosable={false}
      >
        {fetchLoading ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 16, color: "#666" }}>
              Đang tải dữ liệu nhà cung cấp...
            </div>
          </div>
        ) : supplierData &&
          Object.values(supplierData).some((val) => val !== "") ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
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
                  disabled={!hasChanges}
                >
                  {hasChanges ? "Cập nhật" : "Không có thay đổi"}
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        ) : (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#666",
            }}
          >
            Không có dữ liệu nhà cung cấp để cập nhật
          </div>
        )}
      </Modal>
    </Flex>
  );
};

export default UpdateSupplierForm;
