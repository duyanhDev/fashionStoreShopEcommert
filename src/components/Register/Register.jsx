import { Button, Modal, message } from "antd";
import Input from "antd/es/input/Input";
import { useState } from "react";
import { RegisterUser } from "../../service/Auth";

const Register = ({ modal2Open, setModal2Open }) => {
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
    // Kiểm tra xem các trường đã được nhập chưa
    if (!username || !email || !password || !confirmPassword) {
      message.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Kiểm tra định dạng email
    if (!validateEmail(email)) {
      message.warning("Email không hợp lệ!");
      return;
    }

    // Kiểm tra mật khẩu có khớp không
    if (password !== confirmPassword) {
      message.warning("Mật khẩu không khớp!");
      return;
    }

    // Kiểm tra đã tải lên ảnh chưa

    try {
      let res = await RegisterUser(
        username,
        email,
        password,
        selectedImage,
        false
      );

      console.log(res);
      if (res && res.data && res.data.EC === 0) {
        message.success("Đăng ký thành công!");

        setModal2Open(false); // Đóng modal sau khi đăng ký thành công
      }
    } catch (error) {
      message.error("Đăng ký thất bại! Vui lòng thử lại.");
      console.error(error);
    }
  };
  return (
    <div className="">
      <Modal
        title="ĐĂNG KÝ"
        centered
        open={modal2Open}
        onOk={() => setModal2Open(false)}
        onCancel={() => setModal2Open(false)}
        footer={
          <Button className="" onClick={() => HandleRegister()}>
            Đăng Ký
          </Button>
        }
      >
        <div>
          <label id="email">Email</label>
          <Input
            type="email"
            placeholder="Emaiil"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label id="username">Tên cá nhân</label>
          <Input
            type="text"
            placeholder="Tên cá nhân"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pass">Mật khẩu</label>
          <Input
            type="password"
            id="pass"
            placeholder="Mật khẩu"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div>
          <label htmlFor="confirmpass">Nhập lại mật khẩu</label>
          <Input
            type="password"
            id="confirmpass"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {error === "" && <p style={{ color: "red" }}>{error}</p>}
        </div>

        <div className="max-w-md mx-auto p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Tải lên hình ảnh
            </h2>
            <p className="text-sm text-gray-500">Chọn hoặc kéo thả hình ảnh</p>
          </div>

          <div
            className={`relative border-2 rounded-xl p-4 text-center ${
              isDragging
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-gray-50"
            } transition-all duration-200 ease-in-out`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!previewUrl ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  {/* Image Plus Icon */}
                  <svg
                    className="w-12 h-12 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M12 8v8m-4-4h8" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Kéo thả hình ảnh vào đây hoặc
                  </p>
                  <label className="inline-block">
                    <span className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md">
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
                  className="max-h-48 mx-auto rounded-lg shadow-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  {/* X Icon */}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="mt-3">
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {/* Upload Icon */}
                    <svg
                      className="w-4 h-4 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <path d="M17 8l-5-5-5 5" />
                      <path d="M12 3v12" />
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
                <button
                  className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                  onClick={() => console.log("Upload image:", selectedImage)}
                >
                  Tải lên
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Register;
