import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, EyeOff, Lock, ArrowLeft, Check, X } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";
import { checkRestToken, ResetPassword } from "../../service/Auth";
import { useLocation, useNavigate } from "react-router-dom";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized ValidationRule component
const ValidationRule = React.memo(({ isValid, text }) => (
  <div
    className={`flex items-center mb-2 text-sm transition-colors duration-200 ${
      isValid ? "text-green-600" : "text-red-600"
    }`}
  >
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold mr-2 transition-all duration-200 ${
        isValid ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {isValid ? <Check size={10} /> : <X size={10} />}
    </div>
    {text}
  </div>
));

// Memoized PasswordInput component
const PasswordInput = React.memo(
  ({
    id,
    label,
    placeholder,
    value,
    onChange,
    showPassword,
    onToggleVisibility,
    error,
    success,
  }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
          <X size={16} className="mr-1 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 text-sm text-green-600 flex items-center animate-fadeIn">
          <Check size={16} className="mr-1 flex-shrink-0" />
          {success}
        </div>
      )}
    </div>
  )
);

// Memoized StrengthMeter component
const StrengthMeter = React.memo(({ level }) => {
  const config = useMemo(() => {
    switch (level) {
      case 1:
        return {
          color: "bg-red-500",
          width: "w-1/3",
          label: "Yếu",
          textColor: "text-red-600",
        };
      case 2:
        return {
          color: "bg-yellow-500",
          width: "w-2/3",
          label: "Trung bình",
          textColor: "text-yellow-600",
        };
      case 3:
        return {
          color: "bg-green-500",
          width: "w-full",
          label: "Mạnh",
          textColor: "text-green-600",
        };
      default:
        return {
          color: "bg-gray-300",
          width: "w-0",
          label: "",
          textColor: "text-gray-400",
        };
    }
  }, [level]);

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Độ mạnh mật khẩu</span>
        <span
          className={`text-xs font-medium transition-colors duration-300 ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${config.color} ${config.width}`}
        ></div>
      </div>
    </div>
  );
});

const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  // Mock token for demo - replace with actual implementation

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    special: false,
    match: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [strengthLevel, setStrengthLevel] = useState(0);
  const [tokenValid, setTokenValid] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  // Debounced values to reduce validation frequency
  const debouncedNewPassword = useDebounce(formData.newPassword, 300);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 300);

  // Memoized validation functions
  const validatePassword = useCallback((password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      special: /[@#$%&*!]/.test(password),
    };
  }, []);

  const calculateStrength = useCallback((password, rules) => {
    if (password.length === 0) return 0;
    const validRules = Object.values(rules).filter((rule) => rule).length;

    if (validRules <= 1) return 1;
    if (validRules === 2) return 2;
    return 3;
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await checkRestToken(token);
        if (res.data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
          setMessage(res.data.message);
        }
      } catch (err) {
        setStatus("invalid");
        setMessage("Token không hợp lệ hoặc đã hết hạn");
      }
    };

    if (token) checkToken();
  }, [token]);

  // Check token validity on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Token không hợp lệ hoặc đã hết hạn");
    } else {
      setTokenValid(true);
    }
  }, [token]);

  // Optimized validation effect with debounced values
  useEffect(() => {
    const rules = validatePassword(debouncedNewPassword);
    const strength = calculateStrength(debouncedNewPassword, rules);

    setValidation((prev) => {
      const newValidation = {
        ...rules,
        match:
          debouncedConfirmPassword !== "" &&
          debouncedNewPassword === debouncedConfirmPassword,
      };

      // Only update if values actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newValidation)) {
        return newValidation;
      }
      return prev;
    });

    setStrengthLevel((prevStrength) => {
      return prevStrength !== strength ? strength : prevStrength;
    });
  }, [
    debouncedNewPassword,
    debouncedConfirmPassword,
    validatePassword,
    calculateStrength,
  ]);

  // Memoized handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear error when user types
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return (
      validation.length &&
      validation.uppercase &&
      validation.special &&
      validation.match
    );
  }, [validation]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid || isLoading) return;

      setIsLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error("Token không hợp lệ");
        }

        const res = await ResetPassword(token, formData.newPassword);
        // Mock successful response for demo

        if (res?.data?.EC === 0) {
          // Success
          alert("Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.");
          setFormData({ newPassword: "", confirmPassword: "" });
          // navigate('/login'); // Uncomment when using real router
        } else {
          throw new Error(res?.data?.EM || "Có lỗi xảy ra");
        }
      } catch (error) {
        console.error("Reset password error:", error);
        setError(error.message || "Có lỗi xảy ra, vui lòng thử lại");
      } finally {
        setIsLoading(false);
      }
    },
    [isFormValid, isLoading, token, formData.newPassword]
  );

  const goBack = useCallback(() => {
    // navigate('/login'); // Uncomment when using real router
    alert("Chuyển về trang đăng nhập...");
  }, []);

  // Loading state for token validation
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang kiểm tra token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <X className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Token Không Hợp Lệ
          </h1>
          <p className="text-gray-600 mb-4">
            Token đã hết hạn hoặc không tồn tại
          </p>
          <button
            onClick={goBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Quay về đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-4 mt-32">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-center uppercase">Lấy lại mật khẩu</h2>
        {status === "invalid" && (
          <div
            style={{
              textAlign: "center",
              marginTop: "10px",
              background: "pink",
            }}
          >
            <p style={{ color: "red", fontWeight: "bold" }}>
              Link khôi phục mật khẩu không đúng hoặc đã hết hạn sử dụng!
            </p>
          </div>
        )}
        {/* Header */}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600">
              <X size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {/* New Password Input */}
          <div>
            <PasswordInput
              id="newPassword"
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={formData.newPassword}
              onChange={(value) => handleInputChange("newPassword", value)}
              showPassword={showPassword.newPassword}
              onToggleVisibility={() => togglePasswordVisibility("newPassword")}
            />

            {/* Strength Meter */}
            <StrengthMeter level={strengthLevel} />

            {/* Validation Rules */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Mật khẩu phải chứa:
              </h4>
              <ValidationRule
                isValid={validation.length}
                text="Ít nhất 8 ký tự"
              />
              <ValidationRule
                isValid={validation.uppercase}
                text="Ít nhất 1 chữ hoa (A-Z)"
              />
              <ValidationRule
                isValid={validation.special}
                text="Ít nhất 1 ký tự đặc biệt (@, #, $, %, &, *, !)"
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange("confirmPassword", value)}
            showPassword={showPassword.confirmPassword}
            onToggleVisibility={() =>
              togglePasswordVisibility("confirmPassword")
            }
            error={
              formData.confirmPassword && !validation.match
                ? "Mật khẩu xác nhận không khớp"
                : null
            }
            success={
              formData.confirmPassword && validation.match
                ? "Mật khẩu khớp"
                : null
            }
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              isFormValid && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:-translate-y-1 hover:shadow-xl active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang cập nhật...
              </div>
            ) : (
              "Cập Nhật Mật Khẩu"
            )}
          </button>
        </div>
        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={goBack}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center hover:underline transition-colors mx-auto"
          >
            <ArrowLeft size={16} className="mr-1" />
            Quay lại đăng nhập
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordForm;
