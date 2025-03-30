import { useState } from "react";
import { Button, Modal, Form, Input, notification } from "antd";
import "./Forgetpassword.css";
import { Forgotpassword } from "../../service/Auth";

const ForgetPassword = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [api, contextHolder] = notification.useNotification();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Validator custom cho email
  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Email là bắt buộc!"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error("Email không hợp lệ!"));
    }
    return Promise.resolve();
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const res = await Forgotpassword(email);
      console.log(res);
      setOpen(false);
      api["success"]({
        message: "Lấy lại mật khẩu",
        description:
          "Bạn đã lấy lại mật khẩu thành công , xin hãy check lại email của bạn !!",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Modal
        title={<p>Quên Mật Khẩu</p>}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="item_forget"
      >
        <Form
          name="forget-password"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
          // Nếu bạn dùng custom validator, không cần khai báo validateMessages ở đây
          // validateMessages={{
          //   required: "${label} is required!",
          //   types: {
          //     email: "${label} is not a valid email!",
          //   },
          // }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ validator: validateEmail }]}
          >
            <Input value={email} onChange={handleEmailChange} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
        {contextHolder}
      </Modal>
    </div>
  );
};

export default ForgetPassword;
