import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  message,
  Row,
  Col,
  Divider,
} from "antd";
import { useState } from "react";
import moment from "moment";
import { createVoucherAPI } from "../../service/APIVoucher.js";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AddVoucher = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState("PERCENTAGE");

  const handleSubmit = async (values) => {
    console.log("Form values:", values);

    setLoading(true);
    try {
      const submitData = {
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
      };

      const formData = {
        code: values.code,
        discountType: values.discountType.toLowerCase(),
        discountValue: values.discountValue,
        minOrderValue: values.minOrderValue || 0,
        startDate: submitData.startDate ? submitData.startDate : null,
        endDate: submitData.endDate ? submitData.endDate : null,
        usageLimit: values.usageLimit || null,
        status: values.status ?? true,
        description: values.description || "",
        userGroup: values.userGroup || "all",
        maxDiscountAmount: values.maxDiscountAmount || null,
      };

      const response = await createVoucherAPI(formData);

      if (response.data && response.data.EC === 0) {
        message.success("Tạo voucher thành công!");
        form.resetFields();
      } else {
        message.error(response.data?.EM || "Tạo voucher thất bại!");
      }
    } catch (error) {
      console.error("Error creating voucher:", error);
      message.error("Đã xảy ra lỗi khi tạo voucher!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
  };

  const validateDateRange = (_, value) => {
    if (!value || !Array.isArray(value) || value.length !== 2) {
      return Promise.reject(new Error("Vui lòng chọn thời gian hiệu lực!"));
    }

    const [startDate, endDate] = value;

    console.log(
      "startDate:",
      startDate?.format("DD/MM/YYYY"),
      "endDate:",
      endDate?.format("DD/MM/YYYY")
    );

    const now = moment().startOf("day");

    if (startDate && startDate.isBefore(now)) {
      return Promise.reject(
        new Error("Ngày bắt đầu không thể là ngày trong quá khứ!")
      );
    }

    if (endDate && startDate && endDate.isBefore(startDate)) {
      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu!"));
    }

    return Promise.resolve();
  };

  const validateDiscountValue = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập giá trị giảm giá!"));
    }

    if (discountType === "PERCENTAGE" && value > 100) {
      return Promise.reject(
        new Error("Phần trăm giảm giá không thể vượt quá 100%!")
      );
    }

    if (value <= 0) {
      return Promise.reject(new Error("Giá trị giảm giá phải lớn hơn 0!"));
    }

    return Promise.resolve();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        discountType: "PERCENTAGE",
        status: true,
        userGroup: "all",
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Mã voucher"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã voucher!" },
              { min: 3, message: "Mã voucher phải có ít nhất 3 ký tự!" },
              { max: 50, message: "Mã voucher không được vượt quá 50 ký tự!" },
              {
                pattern: /^[A-Z0-9_-]+$/,
                message:
                  "Mã voucher chỉ được chứa chữ hoa, số, gạch dưới và gạch ngang!",
              },
            ]}
          >
            <Input
              placeholder="Nhập mã voucher (VD: SUMMER2024)"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Loại giảm giá"
            name="discountType"
            rules={[
              { required: true, message: "Vui lòng chọn loại giảm giá!" },
            ]}
          >
            <Select onChange={setDiscountType}>
              <Option value="PERCENTAGE">Phần trăm (%)</Option>
              <Option value="FIXED">Số tiền cố định (VND)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={`Giá trị giảm giá ${
              discountType === "PERCENTAGE" ? "(%)" : "(VND)"
            }`}
            name="discountValue"
            rules={[{ validator: validateDiscountValue }]}
          >
            <InputNumber
              min={0}
              max={discountType === "PERCENTAGE" ? 100 : undefined}
              style={{ width: "100%" }}
              placeholder={
                discountType === "PERCENTAGE"
                  ? "Nhập phần trăm giảm (0-100)"
                  : "Nhập số tiền giảm"
              }
              formatter={
                discountType === "PERCENTAGE"
                  ? (value) => `${value}%`
                  : (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={
                discountType === "PERCENTAGE"
                  ? (value) => value.replace("%", "")
                  : (value) => value.replace(/\$\s?|(,*)/g, "")
              }
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Giá trị đơn hàng tối thiểu (VND)"
            name="minOrderValue"
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập giá trị tối thiểu"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
      </Row>

      {discountType === "PERCENTAGE" && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số tiền giảm tối đa (VND)"
              name="maxDiscountAmount"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Nhập số tiền giảm tối đa"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Giới hạn số lần sử dụng" name="usageLimit">
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập giới hạn sử dụng"
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item
        label="Thời gian hiệu lực"
        name="dateRange"
        rules={[{ validator: validateDateRange }]}
      >
        <RangePicker
          style={{ width: "100%" }}
          format="DD-MM-YYYY"
          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Nhóm khách hàng áp dụng" name="userGroup">
            <Select>
              <Option value="all">Tất cả khách hàng</Option>
              <Option value="vip">Khách hàng VIP</Option>
              <Option value="newUser">Khách hàng mới</Option>
              <Option value="loyalCustomer">Khách hàng trung thành</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Trạng thái" name="status" valuePropName="checked">
            <Switch
              checkedChildren="Hiệu lực"
              unCheckedChildren="Không hiệu lực"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea
          rows={3}
          placeholder="Nhập mô tả chi tiết về voucher..."
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Divider />

      <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Tạo Voucher
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddVoucher;
