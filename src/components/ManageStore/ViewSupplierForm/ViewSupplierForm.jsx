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
import { findOneSupplierAPI } from "../../../service/Supplier";

const ViewSupplierForm = ({ openView, setOpenView, id }) => {
  const [form] = Form.useForm();
  const [fetchLoading, setFetchLoading] = useState(false);
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
        const supplier = res.data.data;
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

  useEffect(() => {
    if (openView && id) {
      fetchDataSupplier();
    }
  }, [openView, id]);

  useEffect(() => {
    if (
      openView &&
      supplierData &&
      Object.values(supplierData).some((val) => val !== "")
    ) {
      form.setFieldsValue(supplierData);
    }
  }, [supplierData, openView, form]);

  const handleCancel = () => {
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
    setOpenView(false);
  };

  return (
    <Flex>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Thông tin nhà cung cấp</span>
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
        open={openView}
        onCancel={handleCancel}
        width="60%"
        footer={
          <Button size="large" onClick={handleCancel}>
            Đóng
          </Button>
        }
        destroyOnClose={false}
        maskClosable={false}
      >
        {fetchLoading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
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
            autoComplete="off"
            style={{ marginTop: 20 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Tên nhà cung cấp" name="name">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Người liên hệ" name="contactPerson">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Email" name="email">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Website" name="website">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Mã số thuế" name="taxCode">
                  <Input size="large" readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea rows={3} size="large" readOnly />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} size="large" readOnly />
            </Form.Item>
          </Form>
        ) : (
          <div
            style={{ padding: "40px 0", textAlign: "center", color: "#666" }}
          >
            Không có dữ liệu nhà cung cấp để hiển thị
          </div>
        )}
      </Modal>
    </Flex>
  );
};

export default ViewSupplierForm;
