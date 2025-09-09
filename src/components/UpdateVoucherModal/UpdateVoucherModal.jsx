import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  message,
} from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import { updateVoucherAPI } from "../../service/APIVoucher.js";

const { Option } = Select;
const { RangePicker } = DatePicker;

const UpdateVoucherModal = ({ visible, onCancel, onSuccess, voucherData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && voucherData) {
      // Set form values when modal opens
      form.setFieldsValue({
        code: voucherData.code,
        discountType: voucherData.discountType,
        discountValue: voucherData.discountValue,
        minOrderValue: voucherData.minOrderValue,
        dateRange: [moment(voucherData.startDate), moment(voucherData.endDate)],
        usageLimit: voucherData.usageLimit,
        status: voucherData.status,
        userGroup: voucherData.userGroup,
      });
    }
  }, [visible, voucherData, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
      };
      delete submitData.dateRange;

      const res = await updateVoucherAPI(voucherData._id, submitData);

      if (res.data && res.data.EC === 0) {
        message.success("Cập nhật voucher thành công!");
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(res.data?.EM || "Có lỗi xảy ra khi cập nhật voucher");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      message.error("Có lỗi xảy ra khi cập nhật voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Cập nhật Voucher"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          discountType: "percentage",
          status: true,
          userGroup: "all",
        }}
      >
        <Form.Item
          name="code"
          label="Mã voucher"
          rules={[
            { required: true, message: "Vui lòng nhập mã voucher!" },
            { min: 3, message: "Mã voucher phải có ít nhất 3 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập mã voucher" />
        </Form.Item>

        <Form.Item
          name="discountType"
          label="Loại giảm giá"
          rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
        >
          <Select placeholder="Chọn loại giảm giá">
            <Option value="percentage">Phần trăm (%)</Option>
            <Option value="fixed">Số tiền cố định (VND)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discountValue"
          label="Giá trị giảm giá"
          rules={[
            { required: true, message: "Vui lòng nhập giá trị giảm giá!" },
            {
              validator: (_, value) => {
                if (value <= 0) {
                  return Promise.reject(
                    new Error("Giá trị giảm giá phải lớn hơn 0!")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Nhập giá trị giảm giá"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="minOrderValue"
          label="Giá trị đơn hàng tối thiểu"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập giá trị đơn hàng tối thiểu!",
            },
            {
              validator: (_, value) => {
                if (value < 0) {
                  return Promise.reject(
                    new Error("Giá trị đơn hàng tối thiểu không được âm!")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="Nhập giá trị đơn hàng tối thiểu"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian hiệu lực"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian hiệu lực!" },
            {
              validator: (_, value) => {
                if (value && value[0] && value[1]) {
                  if (value[0].isSameOrAfter(value[1])) {
                    return Promise.reject(
                      new Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!")
                    );
                  }
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <RangePicker
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          />
        </Form.Item>

        <Form.Item
          name="usageLimit"
          label="Giới hạn sử dụng"
          rules={[
            { required: true, message: "Vui lòng nhập giới hạn sử dụng!" },
            {
              validator: (_, value) => {
                if (value <= 0) {
                  return Promise.reject(
                    new Error("Giới hạn sử dụng phải lớn hơn 0!")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Nhập giới hạn sử dụng"
          />
        </Form.Item>

        <Form.Item
          name="userGroup"
          label="Nhóm khách hàng"
          rules={[
            { required: true, message: "Vui lòng chọn nhóm khách hàng!" },
          ]}
        >
          <Select placeholder="Chọn nhóm khách hàng">
            <Option value="all">Tất cả khách hàng</Option>
            <Option value="vip">Khách hàng VIP</Option>
            <Option value="newUser">Khách hàng mới</Option>
            <Option value="loyal">Khách hàng thân thiết</Option>
          </Select>
        </Form.Item>

        <Form.Item name="status" label="Trạng thái" valuePropName="checked">
          <Switch
            checkedChildren="Hiệu lực"
            unCheckedChildren="Không hiệu lực"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none"
            >
              Cập nhật
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateVoucherModal;
