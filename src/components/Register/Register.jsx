import { useEffect, useRef, useState, useCallback } from "react";
import Input from "antd/es/input/Input";
import { Button, message, notification } from "antd";
import { useNavigate } from "react-router-dom"; // Thêm import này
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
  const navigate = useNavigate(); // Thay window.location

  // Form states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation states
  const [validationStatus, setValidationStatus] = useState({
    email: { isValid: false, errors: [], requirements: [] },
    username: { isValid: false, errors: [], requirements: [] },
    password: { isValid: false, errors: [], requirements: [] },
    confirmPassword: { isValid: false, errors: [], requirements: [] },
    otp: { isValid: false, errors: [], requirements: [] },
  });
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

  // Validation functions - wrapped with useCallback
  const createEmailRequirements = useCallback((email) => {
    const originalResult = validateEmail(email);

    // Regex kiểm tra email có đuôi domain hợp lệ (ít nhất 2 ký tự sau dấu chấm cuối)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    // Tách phần domain để kiểm tra
    const parts = email.split("@");
    const hasDomain = parts.length === 2;
    const domainParts = hasDomain ? parts[1].split(".") : [];
    const hasValidTLD =
      domainParts.length >= 2 &&
      domainParts[domainParts.length - 1].length >= 2;

    const requirements = [
      { text: "Không được để trống", check: email.trim().length > 0 },
      {
        text: "Phải có định dạng email (@domain)",
        check: hasDomain && parts[0].length > 0,
      },
      {
        text: "Phải có đuôi hợp lệ (.com, .vn, ...)",
        check: emailRegex.test(email) && hasValidTLD,
      },
    ];

    // Cập nhật isValid dựa trên tất cả requirements
    const isValid = requirements.every((req) => req.check);

    return {
      ...originalResult,
      requirements,
      isValid, // Override isValid từ originalResult
      errors: isValid ? [] : ["Email không hợp lệ"],
    };
  }, []);

  const createUsernameRequirements = useCallback((username) => {
    const originalResult = validateUsername(username);
    const requirements = [
      { text: "Không được để trống", check: username.trim().length > 0 },
      {
        text: "Từ 3-50 ký tự",
        check: username.length >= 3 && username.length <= 50,
      },
      {
        text: "Chỉ chứa chữ cái, số, dấu gạch dưới",
        check: /^[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF\s]+$/.test(username),
      },
    ];
    return { ...originalResult, requirements };
  }, []);

  const createPasswordRequirements = useCallback((password) => {
    const originalResult = validatePassword(password);
    const requirements = [
      { text: "Ít nhất 8 ký tự", check: password.length >= 8 },
      { text: "Có ít nhất 1 chữ hoa", check: /[A-Z]/.test(password) },
      { text: "Có ít nhất 1 chữ thường", check: /[a-z]/.test(password) },
      { text: "Có ít nhất 1 số", check: /\d/.test(password) },
      {
        text: "Có ít nhất 1 ký tự đặc biệt",
        check: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
      },
    ];
    return { ...originalResult, requirements };
  }, []);

  const createConfirmPasswordRequirements = useCallback(
    (password, confirmPassword) => {
      const originalResult = validateConfirmPassword(password, confirmPassword);
      const requirements = [
        {
          text: "Không được để trống",
          check: confirmPassword.trim().length > 0,
        },
        {
          text: "Phải trùng với mật khẩu",
          check: password === confirmPassword && password.length > 0,
        },
      ];
      return { ...originalResult, requirements };
    },
    []
  );

  const createOTPRequirements = useCallback((otpString) => {
    const originalResult = validateOTP(otpString);
    const requirements = [
      { text: "Phải có đủ 6 số", check: otpString.length === 6 },
      { text: "Chỉ chứa số", check: /^\d+$/.test(otpString) },
    ];
    return { ...originalResult, requirements };
  }, []);

  const validateField = useCallback(
    (fieldName, value, additionalValue = null) => {
      let result = { isValid: true, errors: [], requirements: [] };

      switch (fieldName) {
        case "email":
          result = createEmailRequirements(value);
          break;
        case "username":
          result = createUsernameRequirements(value);
          break;
        case "password":
          result = createPasswordRequirements(value);
          break;
        case "confirmPassword":
          result = createConfirmPasswordRequirements(
            additionalValue || password,
            value
          );
          break;
        case "otp":
          result = createOTPRequirements(value);
          break;
        default:
          break;
      }

      setValidationStatus((prev) => ({
        ...prev,
        [fieldName]: result,
      }));

      return result.isValid;
    },
    [
      createEmailRequirements,
      createUsernameRequirements,
      createPasswordRequirements,
      createConfirmPasswordRequirements,
      createOTPRequirements,
      password,
    ]
  );

  const validateForm = useCallback(() => {
    const formData = {
      email,
      username,
      password,
      confirmPassword,
    };

    const validation = validateRegistrationForm(formData);

    const newValidationStatus = {};
    Object.entries(validation.validationResults).forEach(([field, result]) => {
      switch (field) {
        case "email":
          newValidationStatus[field] = createEmailRequirements(email);
          break;
        case "username":
          newValidationStatus[field] = createUsernameRequirements(username);
          break;
        case "password":
          newValidationStatus[field] = createPasswordRequirements(password);
          break;
        case "confirmPassword":
          newValidationStatus[field] = createConfirmPasswordRequirements(
            password,
            confirmPassword
          );
          break;
        default:
          newValidationStatus[field] = result;
      }
    });

    setValidationStatus((prev) => ({
      ...prev,
      ...newValidationStatus,
    }));
    setIsFormValid(validation.isValid);

    return validation.isValid;
  }, [
    email,
    username,
    password,
    confirmPassword,
    createEmailRequirements,
    createUsernameRequirements,
    createPasswordRequirements,
    createConfirmPasswordRequirements,
  ]);

  // Event handlers
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
    if (confirmPassword) {
      validateField("confirmPassword", confirmPassword, value);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateField("confirmPassword", value, password);
  };

  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      const allErrors = Object.values(validationStatus)
        .map((status) => status.errors)
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

  const handleOtpChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const otpString = newOtp.join("");
    validateField("otp", otpString);
  };

  const handleKeyDown = (index, e) => {
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
      const res = await verifyOTP(email, otpString, username, password, false);

      if (res?.data?.EC === 0) {
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setOtp(["", "", "", "", "", ""]);

        setValidationStatus({
          email: { isValid: false, errors: [], requirements: [] },
          username: { isValid: false, errors: [], requirements: [] },
          password: { isValid: false, errors: [], requirements: [] },
          confirmPassword: { isValid: false, errors: [], requirements: [] },
          otp: { isValid: false, errors: [], requirements: [] },
        });

        api.success({
          message: "Đăng ký thành công",
          description: "Bạn đã đăng ký thành công tài khoản!",
        });

        setHiddenOTP(false);

        // Thay window.location bằng navigate
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (error) {
      message.error("Xác thực OTP thất bại!");
      console.error(error);
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
      console.error(error);
    }
  };

  // Effects - FIX: Xóa useEffect validation ban đầu
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

  // FIX: Chỉ validate khi user thay đổi input
  useEffect(() => {
    const hasErrors = Object.values(validationStatus).some(
      (status) => status.errors && status.errors.length > 0
    );
    const hasEmptyFields = !email || !username || !password || !confirmPassword;
    setIsFormValid(!hasErrors && !hasEmptyFields);
  }, [validationStatus, email, username, password, confirmPassword]);

  // Helper functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const hasFieldError = (fieldName) => {
    return validationStatus[fieldName]?.errors?.length > 0;
  };

  const RequirementsDisplay = ({ fieldName }) => {
    const status = validationStatus[fieldName];
    if (!status || !status.requirements || status.requirements.length === 0)
      return null;

    return (
      <div className="mt-2.5 space-y-2">
        {status.requirements.map((req, index) => {
          const isChecked = req.check;
          return (
            <div key={index} className="flex items-center text-sm">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0 transition-all duration-200 ${
                  isChecked ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                {isChecked && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`transition-colors duration-200 ${
                  isChecked ? "text-emerald-600 font-medium" : "text-gray-500"
                }`}
              >
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getProgressPercentage = () => {
    const fields = ["email", "username", "password", "confirmPassword"];
    const validCount = fields.filter(
      (field) => validationStatus[field].isValid
    ).length;
    return (validCount / fields.length) * 100;
  };

  return (
    <div className="mt-28 register min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      {contextHolder}

      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 sm:px-10 py-8 sm:py-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                  Đăng Ký Tài Khoản
                </h3>
                <p className="text-emerald-50 text-sm sm:text-base">
                  Tạo tài khoản mới để bắt đầu hành trình của bạn
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl">
                <svg
                  className="w-8 h-8 lg:w-10 lg:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Tiến độ hoàn thành
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left Column */}
              <div className="space-y-5 sm:space-y-6">
                {/* Email */}
                <div>
                  <label className="sm:block text-sm font-semibold text-gray-700 mb-2.5 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
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
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="mail@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      status={hasFieldError("email") ? "error" : ""}
                      className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                        validationStatus.email.isValid && email
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-gray-200"
                      }`}
                    />
                    {validationStatus.email.isValid && email && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-emerald-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <RequirementsDisplay fieldName="email" />
                </div>

                {/* Username */}
                <div>
                  <label className="sm:block text-sm font-semibold text-gray-700 mb-2.5 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Tên cá nhân
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Nhập tên của bạn"
                      value={username}
                      onChange={handleUsernameChange}
                      status={hasFieldError("username") ? "error" : ""}
                      className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                        validationStatus.username.isValid && username
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-gray-200"
                      }`}
                    />
                    {validationStatus.username.isValid && username && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-emerald-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <RequirementsDisplay fieldName="username" />
                </div>

                {/* Password */}
                <div>
                  <label className="sm:block text-sm font-semibold text-gray-700 mb-2.5 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Mật khẩu
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input.Password
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={handlePasswordChange}
                    status={hasFieldError("password") ? "error" : ""}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      validationStatus.password.isValid && password
                        ? "border-emerald-400 bg-emerald-50/50"
                        : "border-gray-200"
                    }`}
                  />
                  <RequirementsDisplay fieldName="password" />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="sm:block text-sm font-semibold text-gray-700 mb-2.5 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Nhập lại mật khẩu
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input.Password
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    status={hasFieldError("confirmPassword") ? "error" : ""}
                    className={`h-12 rounded-xl border-2 transition-all duration-200 ${
                      validationStatus.confirmPassword.isValid &&
                      confirmPassword
                        ? "border-emerald-400 bg-emerald-50/50"
                        : "border-gray-200"
                    }`}
                  />
                  <RequirementsDisplay fieldName="confirmPassword" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5 sm:space-y-6">
                {/* Progress Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Trạng thái các trường
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        name: "email",
                        label: "Email",
                        icon: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                      },
                      {
                        name: "username",
                        label: "Tên cá nhân",
                        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                      },
                      {
                        name: "password",
                        label: "Mật khẩu",
                        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                      },
                      {
                        name: "confirmPassword",
                        label: "Xác nhận",
                        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                      },
                    ].map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/80 backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={field.icon}
                            />
                          </svg>
                          <span className="text-sm text-gray-700 font-medium">
                            {field.label}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            validationStatus[field.name].isValid
                              ? "bg-emerald-500 scale-110"
                              : "bg-gray-300"
                          }`}
                        >
                          {validationStatus[field.name].isValid && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        Bảo mật thông tin
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Thông tin được mã hóa và bảo vệ an toàn
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Mã hóa SSL 256-bit
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Xác thực 2 bước qua email
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tuân thủ tiêu chuẩn bảo mật
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <div className="mt-8">
              <Button
                className={`w-full h-14 text-base ${
                  isFormValid
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    : "bg-gray-400 cursor-not-allowed"
                } border-none rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                onClick={handleRegister}
                disabled={!isFormValid}
              >
                {isFormValid ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Đăng Ký Ngay
                  </span>
                ) : (
                  "Vui lòng hoàn thành thông tin"
                )}
              </Button>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6 text-sm sm:text-base">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 inline-flex items-center"
              >
                Đăng nhập ngay
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {hiddenOTP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-200 group"
              onClick={() => setHiddenOTP(false)}
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
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

            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-emerald-600"
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
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Xác Thực Email
                </h3>
                <p className="text-gray-600 text-sm">
                  Nhập mã OTP gồm 6 số đã được gửi đến
                </p>
                <p className="text-emerald-600 font-semibold text-sm mt-1">
                  {email}
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      hasFieldError("otp")
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                        : value
                        ? "border-emerald-500 bg-emerald-50 focus:border-emerald-600 focus:ring-emerald-100"
                        : "border-gray-300 bg-white focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                ))}
              </div>

              <RequirementsDisplay fieldName="otp" />

              <button
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6 flex items-center justify-center"
                onClick={handleOtpSubmit}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Xác Nhận OTP
              </button>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm mb-2">Chưa nhận được mã?</p>
                <button
                  onClick={handleSendCode}
                  disabled={isDisabled}
                  className={`font-semibold text-sm transition-all duration-200 inline-flex items-center ${
                    isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {isDisabled ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-1.5 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Gửi lại sau {formatTime(timer)}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {buttonText}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
