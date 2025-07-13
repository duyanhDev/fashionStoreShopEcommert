import { useState } from "react";
import Input from "antd/es/input/Input";
import { Button, message } from "antd";
import { RegisterUser } from "../../service/Auth";
import "./register-styles.css";
const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ImageUpLoad, SetImageUpLoad] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setError("Vui lòng nhập đúng mật khẩu");
    } else {
      setError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (password && e.target.value !== password) {
      setError("Vui lòng nhập đúng mật khẩu");
    } else {
      setError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      SetImageUpLoad(file.name);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

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
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };
  const HandleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      message.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password.length < 6) {
      message.warning("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!validateEmail(email)) {
      message.warning("Email không hợp lệ!");
      return;
    }

    if (password !== confirmPassword) {
      message.warning("Mật khẩu không khớp!");
      return;
    }

    try {
      const res = await RegisterUser(
        username,
        email,
        password,
        selectedImage,
        false
      );

      if (res?.data?.EC === 0) {
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setSelectedImage(null);
        setPreviewUrl(null);
        SetImageUpLoad("");
        message.success("Đăng ký thành công!");

        // Navigate to login or dashboard
      }
    } catch (error) {
      // Truy cập vào lỗi trả về từ backend (nếu có)
      const errorMessage =
        error.response?.data?.EM || "Đăng ký thất bại! Vui lòng thử lại.";

      // Trường hợp email đã tồn tại
      if (error.response?.data?.EC === 1) {
        message.warning(errorMessage);
      } else {
        message.error(errorMessage);
      }

      console.error(error);
    }
  };

  return (
    <div className="register min-h-screen mt-32 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      {/* Main Layout */}
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
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
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Mật khẩu*
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={handlePasswordChange}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nhập lại mật khẩu*
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-green-500"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
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
                        src={previewUrl || "/placeholder.svg"}
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
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-none rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={HandleRegister}
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
    </div>
  );
};

export default RegisterForm;
