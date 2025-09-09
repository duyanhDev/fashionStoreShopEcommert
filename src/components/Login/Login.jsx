import { FcGoogle } from "react-icons/fc";
import { Button, notification, Spin, Input } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { LoginAuth, SendverifyOTP, verifyOTP } from "../../service/Auth";
import { login } from "../../redux/actions/Auth";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "../ForgetPassword/ForgetPassword";

import FacebookLogin from "../FacebookLogin/FacebookLogin";
import "./Login.css";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenOTP, setHiddenOTP] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      api.error({
        message: "Lỗi đăng nhập",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập",
      });
      return;
    }

    setIsLoading(true); // ✅ Bắt đầu loading trước khi gọi API

    try {
      const res = await LoginAuth(email, password);
      console.log(res);

      if (res && res.data.EC === 0) {
        // Đăng nhập thành công
        dispatch(login(res.data.data.token, res.data.data.user));
        localStorage.setItem("token", res.data.data.token);
        navigate("/");
      }
    } catch (error) {
      setIsLoading(false);

      if (error.response && error.response.data) {
        const { EC, message } = error.response.data;

        if (EC === -1) {
          api.error({
            message: "Tài khoản đang bị khóa",
            description: message,
          });
        } else {
          api.error({
            message: "Lỗi đăng nhập",
            description: message || "Đăng nhập không thành công",
          });
        }
      } else {
        api.error({
          message: "Lỗi đăng nhập",
          description: "Không thể kết nối tới máy chủ",
        });
      }
    } finally {
      setIsLoading(false); // ✅ Đảm bảo tắt loading trong mọi trường hợp
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
    navigate("/Register");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:9000/auth/google";
  };
  // App.js hoặc component gốc

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
    <div className="min-h-screen mt-24  flex items-center justify-center p-4">
      {contextHolder}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div class="loader"></div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="w-full max-w-md mx-auto">
        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Đăng Nhập
                </h3>
                <p className="text-gray-600">
                  Nhập thông tin để truy cập tài khoản
                </p>
              </div>

              {/* Google Login */}
              <button
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl py-3 px-4 transition-all duration-200 mb-4 font-medium text-gray-700"
                onClick={handleGoogleLogin}
              >
                <FcGoogle size={24} />
                <span>Đăng nhập với Google</span>
              </button>

              <div className="mb-4">
                <FacebookLogin />
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    hoặc
                  </span>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email*
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 focus:border-green-500"
                  }`}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Mật Khẩu*
                </label>
                <Input.Password
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  onKeyDown={(e) => handleChangeOnkeyLogin(e)}
                  className={`custom-password-input ${
                    errors.password ? "error" : ""
                  }`}
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: errors.password
                      ? "2px solid #fca5a5"
                      : "2px solid #e5e7eb",
                    backgroundColor: errors.password ? "#fef2f2" : "white",
                  }}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">
                    Lưu mật khẩu
                  </span>
                </label>
                <button
                  className="text-sm text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
                  onClick={handleForget}
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Login Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-none rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleLogin}
                loading={isLoading}
              >
                Đăng Nhập
              </Button>

              {/* Register Link */}
              <p className="text-center text-gray-600 mt-6">
                Chưa có tài khoản?{" "}
                <button
                  onClick={handelRegister}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {hiddenOTP && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={() => setHiddenOTP(false)}
            >
              ×
            </button>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Nhập mã OTP
                </h3>
                <p className="text-gray-600">
                  Chúng tôi đã gửi mã xác nhận đến email của bạn
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                ))}
              </div>

              <button
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-4"
                onClick={handleSubmit}
              >
                Xác Nhận
              </button>

              <p className="text-center text-gray-600">
                Chưa nhận được mã?{" "}
                <button
                  onClick={handleSendcode}
                  disabled={isDisabled}
                  className={`font-semibold transition-colors duration-200 ${
                    isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  {isDisabled ? `Gửi lại sau ${formatTime(timer)}` : buttonText}
                </button>
              </p>
            </div>
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
    </div>
  );
};

export default LoginForm;
