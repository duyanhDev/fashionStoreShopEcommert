import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Link2,
  Type,
  MapPin,
  Image,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { notification } from "antd";
import { CreateBannerAPI } from "../../../service/APIBanner";

const CreateBannerForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    position: "",
  });
  const [api, contextHolder] = notification.useNotification();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  const positionOptions = [
    { value: "header", label: "Header - Đầu trang" },
    { value: "sidebar", label: "Sidebar - Thanh bên" },
    { value: "footer", label: "Footer - Cuối trang" },
    { value: "home", label: "Main - Trang chính" },
    { value: "popup", label: "Popup - Cửa sổ bật lên" },
  ];

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Không được bỏ trống trường title";
    }

    if (!imageFile) {
      newErrors.image = "Vui lòng chọn ảnh để tải lên";
    }

    if (formData.link && !isValidUrl(formData.link)) {
      newErrors.link = "Vui lòng nhập URL hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Vui lòng chọn file ảnh hợp lệ",
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Kích thước ảnh không được vượt quá 5MB",
        }));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (!formData.title && !imagePreview) {
      setErrors({ preview: "Vui lòng nhập tiêu đề và chọn ảnh để xem trước" });
      return;
    }
    setShowPreview(true);
  };

  // Close preview
  const closePreview = () => {
    setShowPreview(false);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await CreateBannerAPI(
        formData.title,
        imageFile,
        formData.link,
        formData.position
      );
      if (res && res.data && res.data.EC === 0) {
        api.success({
          message: "Tạo banner thành công",
          description: "Banner đã được tạo và sẵn sàng hiển thị.",
        });
      }

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({ title: "", link: "", position: "" });
        setImageFile(null);
        setImagePreview(null);
        setSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
    } catch (error) {
      setErrors({ submit: "Có lỗi xảy ra khi tạo banner. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      {contextHolder}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-200">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo Banner Mới</h1>
          </div>
          <p className="text-gray-600 mt-4 text-lg">
            Tạo và quản lý banner hiển thị trên website của bạn
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">
                  Tạo banner thành công!
                </h3>
                <p className="text-green-600">
                  Banner đã được tạo và sẵn sàng hiển thị.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Type className="w-4 h-4 text-blue-500" />
                  Tiêu đề Banner *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề cho banner..."
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      errors.title
                        ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                        : "border-gray-200"
                    }`}
                  />
                  {errors.title && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Image className="w-4 h-4 text-purple-500" />
                  Hình ảnh Banner *
                </label>

                {!imagePreview ? (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 ${
                      errors.image
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          Kéo thả ảnh vào đây hoặc
                        </p>
                        <p className="text-blue-600 font-medium hover:text-blue-700">
                          Nhấn để chọn file
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-white rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {errors.image && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Link and Position Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Link Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Link2 className="w-4 h-4 text-green-500" />
                    Liên kết (URL)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                        errors.link
                          ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    {errors.link && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.link && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.link}
                    </p>
                  )}
                </div>

                {/* Position Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Vị trí hiển thị
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-gray-900"
                  >
                    <option value="">Chọn vị trí hiển thị...</option>
                    {positionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Xem trước
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Đang tạo banner...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Tạo Banner
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Xem trước Banner
                      </h2>
                      <p className="text-gray-600">
                        Kiểm tra giao diện banner trước khi tạo
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closePreview}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                {/* Position Previews */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Vị trí hiển thị:{" "}
                    {positionOptions.find((p) => p.value === formData.position)
                      ?.label || "Chưa chọn vị trí"}
                  </h3>

                  {/* Header Preview */}
                  {(!formData.position || formData.position === "header") && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-2 text-sm font-medium text-gray-600">
                        Preview: Header Banner
                      </div>
                      <div className="p-4 bg-white">
                        <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-2">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Banner preview"
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() =>
                                formData.link &&
                                window.open(formData.link, "_blank")
                              }
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                Chưa có ảnh
                              </p>
                            </div>
                          )}
                        </div>
                        {formData.title && (
                          <h4 className="font-semibold text-gray-800 text-center">
                            {formData.title}
                          </h4>
                        )}
                        {formData.link && (
                          <p className="text-sm text-blue-600 text-center mt-1">
                            {formData.link}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sidebar Preview */}
                  {formData.position === "sidebar" && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-2 text-sm font-medium text-gray-600">
                        Preview: Sidebar Banner
                      </div>
                      <div className="flex">
                        <div className="flex-1 p-4 bg-gray-50">
                          <div className="h-32 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              Nội dung trang web
                            </span>
                          </div>
                        </div>
                        <div className="w-64 p-4 bg-white">
                          <div className="w-full h-40 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-2">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Banner preview"
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={() =>
                                  formData.link &&
                                  window.open(formData.link, "_blank")
                                }
                              />
                            ) : (
                              <div className="text-center">
                                <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                <p className="text-gray-500 text-xs">
                                  Chưa có ảnh
                                </p>
                              </div>
                            )}
                          </div>
                          {formData.title && (
                            <h4 className="font-medium text-gray-800 text-sm text-center">
                              {formData.title}
                            </h4>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Home/Main Preview */}
                  {formData.position === "home" && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-2 text-sm font-medium text-gray-600">
                        Preview: Main Page Banner
                      </div>
                      <div className="p-4 bg-white space-y-4">
                        <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Header</span>
                        </div>
                        <div className="w-full h-48 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Banner preview"
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() =>
                                formData.link &&
                                window.open(formData.link, "_blank")
                              }
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Chưa có ảnh</p>
                            </div>
                          )}
                        </div>
                        {formData.title && (
                          <h4 className="font-bold text-gray-800 text-center text-lg">
                            {formData.title}
                          </h4>
                        )}
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            Nội dung chính
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Preview */}
                  {formData.position === "footer" && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-2 text-sm font-medium text-gray-600">
                        Preview: Footer Banner
                      </div>
                      <div className="p-4 bg-white space-y-4">
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            Nội dung trang web
                          </span>
                        </div>
                        <div className="w-full h-24 bg-gradient-to-r from-gray-100 to-slate-200 rounded-lg flex items-center justify-center">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Banner preview"
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() =>
                                formData.link &&
                                window.open(formData.link, "_blank")
                              }
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-gray-500 text-xs">
                                Chưa có ảnh
                              </p>
                            </div>
                          )}
                        </div>
                        {formData.title && (
                          <h4 className="font-medium text-gray-800 text-center text-sm">
                            {formData.title}
                          </h4>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Popup Preview */}
                  {formData.position === "popup" && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-100 p-2 text-sm font-medium text-gray-600">
                        Preview: Popup Banner
                      </div>
                      <div className="p-4 bg-gray-300 relative min-h-[300px] flex items-center justify-center">
                        <div className="absolute inset-4 bg-white rounded opacity-50"></div>
                        <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
                          <div className="flex justify-end mb-4">
                            <X className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="w-full h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Banner preview"
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={() =>
                                  formData.link &&
                                  window.open(formData.link, "_blank")
                                }
                              />
                            ) : (
                              <div className="text-center">
                                <Image className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-gray-500 text-xs">
                                  Chưa có ảnh
                                </p>
                              </div>
                            )}
                          </div>
                          {formData.title && (
                            <h4 className="font-semibold text-gray-800 text-center mb-2">
                              {formData.title}
                            </h4>
                          )}
                          <div className="flex gap-2">
                            <button className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded text-sm">
                              Đóng
                            </button>
                            <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm">
                              Xem thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Thông tin Banner
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Tiêu đề:
                      </span>
                      <p className="text-gray-800">
                        {formData.title || "Chưa nhập tiêu đề"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Vị trí:</span>
                      <p className="text-gray-800">
                        {positionOptions.find(
                          (p) => p.value === formData.position
                        )?.label || "Chưa chọn vị trí"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">
                        Liên kết:
                      </span>
                      <p className="text-blue-600 break-all">
                        {formData.link || "Không có liên kết"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closePreview}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      closePreview();
                      handleSubmit();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Tạo Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-blue-100 rounded-xl w-fit mb-4">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Kích thước tối ưu
            </h3>
            <p className="text-sm text-gray-600">
              Sử dụng ảnh có kích thước 1200x400px để đảm bảo hiển thị tốt nhất
              trên mọi thiết bị.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-green-100 rounded-xl w-fit mb-4">
              <Link2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Liên kết hiệu quả
            </h3>
            <p className="text-sm text-gray-600">
              Thêm liên kết để tăng tương tác. Đảm bảo URL chính xác và hoạt
              động tốt.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-orange-100 rounded-xl w-fit mb-4">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Vị trí chiến lược
            </h3>
            <p className="text-sm text-gray-600">
              Chọn vị trí hiển thị phù hợp để đạt hiệu quả quảng cáo tối đa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBannerForm;
