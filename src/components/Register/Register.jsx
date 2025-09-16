import { useEffect, useRef, useState } from "react";
import Input from "antd/es/input/Input";
import { Button, message, notification } from "antd";
import { RegisterUser, SendverifyOTP, verifyOTP } from "../../service/Auth";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateImage,
  validateOTP,
  validateRegistrationForm,
} from "../../testsCase/RegisterForm.test";
import "./register-styles.css";

const RegisterForm = () => {
  // Form states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // OTP states
  const [hiddenOTP, setHiddenOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonText, setButtonText] = useState("Send Code");

  // Refs
  const inputRefs = useRef([]);
  const [api, contextHolder] = notification.useNotification();

  // ==================== VALIDATION FUNCTIONS ====================

  // Real-time validation for individual fields
  const validateField = (fieldName, value, additionalValue = null) => {
    let result = { isValid: true, errors: [] };

    switch (fieldName) {
      case "email":
        result = validateEmail(value);
        break;
      case "username":
        result = validateUsername(value);
        break;
      case "password":
        result = validatePassword(value);
        break;
      case "confirmPassword":
        result = validateConfirmPassword(additionalValue || password, value);
        break;
      case "image":
        result = validateImage(value);
        break;
      case "otp":
        result = validateOTP(value);
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: result.errors,
    }));

    return result.isValid;
  };

  // Validate entire form
  const validateForm = () => {
    const formData = {
      email,
      username,
      password,
      confirmPassword,
      image: selectedImage,
    };

    const validation = validateRegistrationForm(formData);

    // Update all validation errors
    const newErrors = {};
    Object.entries(validation.validationResults).forEach(([field, result]) => {
      newErrors[field] = result.errors;
    });

    setValidationErrors(newErrors);
    setIsFormValid(validation.isValid);

    return validation.isValid;
  };

  // ==================== EVENT HANDLERS ====================

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateField("email", value);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateField("username", value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validateField("password", value);

    // Also re-validate confirm password if it exists
    if (confirmPassword) {
      validateField("confirmPassword", confirmPassword, value);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateField("confirmPassword", value, password);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = validateField("image", file);
      if (isValid) {
        setSelectedImage(file);
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setValidationErrors((prev) => ({
      ...prev,
      image: [],
    }));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];

    if (file) {
      const isValid = validateField("image", file);
      if (isValid) {
        setSelectedImage(file);
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
      }
    }
  };

  // ==================== FORM SUBMISSION ====================

  const handleRegister = async () => {
    // Validate entire form before submission
    const isValid = validateForm();

    if (!isValid) {
      const allErrors = Object.values(validationErrors)
        .flat()
        .filter((error) => error);
      if (allErrors.length > 0) {
        message.error(`Vui lòng sửa các lỗi: ${allErrors[0]}`);
      }
      return;
    }

    try {
      const otpResponse = await SendverifyOTP(email);
      if (otpResponse && otpResponse.status === 200) {
        setHiddenOTP(true);
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
      const errorMessage =
        error.response?.data?.EM || "Đăng ký thất bại! Vui lòng thử lại.";

      if (error.response?.data?.EC === 1) {
        message.warning(errorMessage);
      } else {
        message.error(errorMessage);
      }
    }
  };

  // ==================== OTP HANDLERS ====================

  const handleOtpChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Validate OTP in real-time
    validateField("otp", newOtp);
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpString = otp.join("");
    const isOtpValid = validateField("otp", otpString);

    if (!isOtpValid) {
      message.error("Mã OTP không hợp lệ!");
      return;
    }

    try {
      const res = await verifyOTP(
        email,
        otpString,
        username,
        password,
        selectedImage,
        false
      );

      if (res?.data?.EC === 0) {
        // Reset form
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setSelectedImage(null);
        setPreviewUrl(null);
        setOtp(["", "", "", "", "", ""]);
        setValidationErrors({});

        api.success({
          message: "Đăng ký thành công",
          description: "Bạn đã đăng ký thành công tài khoản!",
        });

        setHiddenOTP(false);
        window.location = "/login";
      }
    } catch (error) {
      message.error("Xác thực OTP thất bại!");
      console.log(error);
    }
  };

  const handleSendCode = async () => {
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
      message.error("Không thể gửi mã OTP!");
      console.log(error);
    }
  };

  // ==================== EFFECTS ====================

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

  // Check form validity on any change
  useEffect(() => {
    const hasErrors = Object.values(validationErrors).some(
      (errors) => errors.length > 0
    );
    const hasEmptyFields = !email || !username || !password || !confirmPassword;
    setIsFormValid(!hasErrors && !hasEmptyFields);
  }, [validationErrors, email, username, password, confirmPassword]);

  // ==================== HELPER FUNCTIONS ====================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName]?.[0] || "";
  };

  const hasFieldError = (fieldName) => {
    return validationErrors[fieldName]?.length > 0;
  };

  // ==================== RENDER ====================

  return (
    <div className="register min-h-screen mt-32 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      {contextHolder}
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng Ký Tài Khoản
              </h3>
              <p className="text-gray-600">Tạo tài khoản mới để bắt đầu</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email*
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    status={hasFieldError("email") ? "error" : ""}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                  {hasFieldError("email") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                {/* Username Input */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Tên cá nhân*
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên của bạn"
                    value={username}
                    onChange={handleUsernameChange}
                    status={hasFieldError("username") ? "error" : ""}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                  {hasFieldError("username") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("username")}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Mật khẩu*
                  </label>
                  <Input.Password
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={handlePasswordChange}
                    status={hasFieldError("password") ? "error" : ""}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                  {hasFieldError("password") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("password")}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nhập lại mật khẩu*
                  </label>
                  <Input.Password
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    status={hasFieldError("confirmPassword") ? "error" : ""}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                  {hasFieldError("confirmPassword") && (
                    <p className="text-red-500 text-sm mt-1">
                      {getFieldError("confirmPassword")}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Ảnh đại diện
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Chọn hoặc kéo thả hình ảnh
                  </p>
                </div>

                <div
                  className={`relative border-2 rounded-xl p-4 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-green-500 bg-green-50 shadow-md"
                      : hasFieldError("image")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!previewUrl ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Kéo thả hình ảnh vào đây hoặc
                        </p>
                        <label className="inline-block">
                          <span className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                            Chọn tệp
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg shadow-lg"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {hasFieldError("image") && (
                  <p className="text-red-500 text-sm mt-1">
                    {getFieldError("image")}
                  </p>
                )}

                {selectedImage && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {selectedImage.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Register Button */}
            <div className="mt-8">
              <Button
                className={`w-full h-12 ${
                  isFormValid
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : "bg-gray-400 cursor-not-allowed"
                } border-none rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                onClick={handleRegister}
                disabled={!isFormValid}
              >
                Đăng Ký
              </Button>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                Đăng nhập ngay
              </a>
            </p>
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
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 ${
                      hasFieldError("otp")
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-green-500"
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  />
                ))}
              </div>

              {hasFieldError("otp") && (
                <p className="text-red-500 text-sm text-center mb-4">
                  {getFieldError("otp")}
                </p>
              )}

              <button
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-4"
                onClick={handleOtpSubmit}
              >
                Xác Nhận
              </button>

              <p className="text-center text-gray-600">
                Chưa nhận được mã?{" "}
                <button
                  onClick={handleSendCode}
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
    </div>
  );
};

export default RegisterForm;
