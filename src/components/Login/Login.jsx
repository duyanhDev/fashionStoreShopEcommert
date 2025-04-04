import { FcGoogle } from "react-icons/fc";
import { FaCheckSquare } from "react-icons/fa";
import { Button, notification, Spin, Input } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { LoginAuth, SendverifyOTP, verifyOTP } from "../../service/Auth";
import { login } from "../../redux/actions/Auth";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "../ForgetPassword/ForgetPassword";
import Register from "../Register/Register";
import "./Login.css";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenOTP, setHiddenOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal2Open, setModal2Open] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonText, setButtonText] = useState("Send Code");

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không đúng định dạng";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      api["error"]({
        message: "Lỗi đăng nhập",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập",
      });
      return;
    }

    try {
      let res = await LoginAuth(email, password);
      setIsLoading(true);
      if (res && res.data.EC === 0) {
        setTimeout(async () => {
          dispatch(login(res.data.data.token, res.data.data.user));
          setIsLoading(false);
          navigate("/");
        }, 5000);
      } else {
        api["error"]({
          message: "Lỗi đăng nhập",
          description: res.data.message || "Đăng nhập không thành công",
        });
      }
    } catch (error) {
      setIsLoading(false);
      api["error"]({
        message: "Lỗi đăng nhập",
        description: "Vui lòng nhập đúng tài khoản hoặc mật khẩu",
      });
      console.error("Login error:", error);
    }
  };

  const handleForget = () => {
    setOpen(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handelRegister = () => {
    setModal2Open(true);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:9000/auth/google";
  };

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendcode = async () => {
    try {
      const otpResponse = await SendverifyOTP(email);
      if (otpResponse && otpResponse.status === 200) {
        setIsDisabled(true);
        setTimer(300);
        setButtonText("Resend Code");
        api.success({
          message: "Mã OTP đã được gửi",
          description: "Vui lòng kiểm tra email để nhận mã OTP",
        });
      } else {
        api.error({
          message: "Lỗi gửi OTP",
          description: "Không thể gửi OTP, vui lòng thử lại!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const onVerify = otp.join("");
      const res = await verifyOTP(email, onVerify);
      if (res && res.status === 200 && res.data.success === true) {
        navigate("/");
        setHiddenOTP(false);
      } else {
        api.error({
          message: "Lỗi xác nhận OTP",
          description: res.data.message || "OTP không chính xác",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsDisabled(false);
      setButtonText("Resend Code");
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleChangeOnkeyLogin = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      {contextHolder}
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      )}

      {/* Main Layout */}
      <div className="login-wrapper">
        {/* Left Side - Image */}
        <div className="login-image">
          <img
            src="https://marketplace.canva.com/EAFfT9NH-JU/1/0/1600w/canva-gray-minimalist-fashion-big-sale-banner-TvkdMwoxWP8.jpg"
            alt="Banner"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form">
            <h3 className="login-title">Đăng Nhập</h3>

            {/* Google Login */}
            <button className="google-login-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={24} />
              <span>Đăng nhập với Google</span>
            </button>

            <div className="divider">
              <span>hoặc</span>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Mật Khẩu*</label>
              <Input.Password
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                onKeyDown={(e) => handleChangeOnkeyLogin(e)}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>Lưu mật khẩu</span>
              </label>
              <button className="forgot-password" onClick={handleForget}>
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <Button className="login-btn" onClick={handleLogin}>
              Đăng Nhập
            </Button>

            {/* Register Link */}
            <p className="register-link">
              Chưa có tài khoản?{" "}
              <button onClick={handelRegister}>Đăng ký ngay</button>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {hiddenOTP && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <button
              className="otp-close-btn"
              onClick={() => setHiddenOTP(false)}
            >
              ×
            </button>
            <h3>Nhập mã OTP</h3>
            <p>Chúng tôi đã gửi mã xác nhận đến email của bạn</p>
            <div className="otp-inputs">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
            <button className="otp-verify-btn" onClick={handleSubmit}>
              Xác Nhận
            </button>
            <p className="otp-resend">
              Chưa nhận được mã?{" "}
              <button onClick={handleSendcode} disabled={isDisabled}>
                {isDisabled ? `Gửi lại sau ${formatTime(timer)}` : buttonText}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Forget Password & Register Modals */}
      <ForgetPassword
        open={open}
        loading={loading}
        setOpen={setOpen}
        setLoading={setLoading}
      />
      <Register modal2Open={modal2Open} setModal2Open={setModal2Open} />
    </div>
  );
};

export default LoginForm;
