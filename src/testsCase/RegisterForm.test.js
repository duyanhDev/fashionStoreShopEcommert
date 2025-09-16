// ==================== VALIDATION FUNCTIONS ====================

// 1. Email validation
const validateEmail = (email) => {
  const errors = [];

  // Kiểm tra rỗng
  if (!email || !email.trim()) {
    errors.push("Email không được để trống");
    return { isValid: false, errors };
  }

  // Kiểm tra độ dài
  if (email.length > 254) {
    errors.push("Email không được quá 254 ký tự");
  }

  // Kiểm tra format
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    errors.push("Email không đúng định dạng");
  }

  // Kiểm tra các ký tự đặc biệt
  if (email.includes("..")) {
    errors.push("Email không được chứa hai dấu chấm liên tiếp");
  }

  // Kiểm tra bắt đầu/kết thúc
  if (email.startsWith(".") || email.endsWith(".")) {
    errors.push("Email không được bắt đầu hoặc kết thúc bằng dấu chấm");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 2. Username validation
const validateUsername = (username) => {
  const errors = [];

  // Kiểm tra rỗng
  if (!username || !username.trim()) {
    errors.push("Tên không được để trống");
    return { isValid: false, errors };
  }

  const trimmedUsername = username.trim();

  // Kiểm tra độ dài
  if (trimmedUsername.length < 3) {
    errors.push("Tên phải có ít nhất 3 ký tự");
  }

  if (trimmedUsername.length > 20) {
    errors.push("Tên không được quá 20 ký tự");
  }

  // Kiểm tra ký tự hợp lệ (chỉ cho phép chữ cái, số, dấu gạch dưới, dấu gạch ngang)
  const usernameRegex = /^[a-zA-ZÀ-ỹ0-9_-\s]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    errors.push("Tên chỉ được chứa chữ cái, số, dấu gạch dưới và khoảng trắng");
  }

  // Kiểm tra không được bắt đầu/kết thúc bằng khoảng trắng
  if (username !== trimmedUsername) {
    errors.push("Tên không được bắt đầu hoặc kết thúc bằng khoảng trắng");
  }

  // Kiểm tra không được chứa nhiều khoảng trắng liên tiếp
  if (/\s{2,}/.test(trimmedUsername)) {
    errors.push("Tên không được chứa nhiều khoảng trắng liên tiếp");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 3. Password validation
const validatePassword = (password) => {
  const errors = [];

  // Kiểm tra rỗng
  if (!password) {
    errors.push("Mật khẩu không được để trống");
    return { isValid: false, errors };
  }

  // Kiểm tra độ dài tối thiểu
  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  // Kiểm tra độ dài tối đa
  if (password.length > 128) {
    errors.push("Mật khẩu không được quá 128 ký tự");
  }

  // Kiểm tra chứa ít nhất 1 chữ hoa
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ cái in hoa");
  }

  // Kiểm tra chứa ít nhất 1 chữ thường
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ cái thường");
  }

  // Kiểm tra chứa ít nhất 1 số
  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ số");
  }

  // Kiểm tra chứa ít nhất 1 ký tự đặc biệt
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(
      'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*(),.?":{}|<>)'
    );
  }

  // Kiểm tra không chứa khoảng trắng
  if (/\s/.test(password)) {
    errors.push("Mật khẩu không được chứa khoảng trắng");
  }

  // Kiểm tra không được là những mật khẩu phổ biến
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "12345678",
    "Password1",
    "1234567890",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Mật khẩu quá đơn giản, vui lòng chọn mật khẩu khác");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 4. Confirm password validation
const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];

  // Kiểm tra rỗng
  if (!confirmPassword) {
    errors.push("Vui lòng nhập lại mật khẩu");
    return { isValid: false, errors };
  }

  // Kiểm tra khớp với mật khẩu
  if (password !== confirmPassword) {
    errors.push("Mật khẩu nhập lại không khớp");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 5. Image validation
const validateImage = (file) => {
  const errors = [];

  // Nếu không có file thì không cần validate (vì không bắt buộc)
  if (!file) {
    return { isValid: true, errors };
  }

  // Kiểm tra loại file
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    errors.push("Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)");
  }

  // Kiểm tra kích thước file (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push("Kích thước file không được vượt quá 5MB");
  }

  // Kiểm tra kích thước file tối thiểu (1KB)
  const minSize = 1024;
  if (file.size < minSize) {
    errors.push("File ảnh quá nhỏ, vui lòng chọn file khác");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 6. OTP validation
const validateOTP = (otp) => {
  const errors = [];
  const otpString = Array.isArray(otp) ? otp.join("") : otp;

  // Kiểm tra rỗng
  if (!otpString || otpString.trim() === "") {
    errors.push("Vui lòng nhập mã OTP");
    return { isValid: false, errors };
  }

  // Kiểm tra độ dài
  if (otpString.length !== 6) {
    errors.push("Mã OTP phải có đúng 6 chữ số");
  }

  // Kiểm tra chỉ chứa số
  if (!/^\d+$/.test(otpString)) {
    errors.push("Mã OTP chỉ được chứa số");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== FORM VALIDATION ====================

// Validate toàn bộ form
const validateRegistrationForm = (formData) => {
  const { email, username, password, confirmPassword, image, otp } = formData;
  const validationResults = {};
  let hasErrors = false;

  // Validate từng field
  validationResults.email = validateEmail(email);
  validationResults.username = validateUsername(username);
  validationResults.password = validatePassword(password);
  validationResults.confirmPassword = validateConfirmPassword(
    password,
    confirmPassword
  );
  validationResults.image = validateImage(image);

  if (otp !== undefined) {
    validationResults.otp = validateOTP(otp);
  }

  // Kiểm tra có lỗi không
  Object.values(validationResults).forEach((result) => {
    if (!result.isValid) {
      hasErrors = true;
    }
  });

  return {
    isValid: !hasErrors,
    validationResults,
    getAllErrors: () => {
      const allErrors = [];
      Object.entries(validationResults).forEach(([field, result]) => {
        if (!result.isValid) {
          allErrors.push(...result.errors.map((error) => `${field}: ${error}`));
        }
      });
      return allErrors;
    },
  };
};

// ==================== EXPORT ====================
export {
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
  validateImage,
  validateOTP,
  validateRegistrationForm,
};
