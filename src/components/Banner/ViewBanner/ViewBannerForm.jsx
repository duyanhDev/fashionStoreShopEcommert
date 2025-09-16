import React, { useState, useRef, useEffect } from "react";
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
  Edit,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFindByIdBannerAPI,
  UpdateBannerAPI,
} from "../../../service/APIBanner";
import { notification } from "antd";

const ViewBannerForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    link: "",
    isActive: true,
    position: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(""); // Existing image URL
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [api, contextHolder] = notification.useNotification();

  const navigate = useNavigate();

  const positionOptions = [
    { value: "header", label: "Header - Đầu trang" },
    { value: "sidebar", label: "Sidebar - Thanh bên" },
    { value: "footer", label: "Footer - Cuối trang" },
    { value: "home", label: "Main - Trang chính" },
    { value: "popup", label: "Popup - Cửa sổ bật lên" },
  ];

  // Load initial data
  const loadInitalData = async () => {
    setLoading(true);
    try {
      const res = await getFindByIdBannerAPI(id);

      if (res && res.data && res.data.EC === 0) {
        setFormData({
          title: res.data.data.title || "",
          imageUrl: res.data.data.imageUrl || "",
          link: res.data.data.link || "",
          isActive: res.data.data.isActive || true,
          position: res.data.data.postion || "",
        });
        setImagePreview(res.data.data.imageUrl || null);
        setCurrentImage(res.data.data.imageUrl || "");
        setLoading(false);
        setDataLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setDataLoading(false);
      setErrors((prev) => ({
        ...prev,
        load: "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.",
      }));
    }
  };

  useEffect(() => {
    loadInitalData();
  }, [id]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Không được bỏ trống trường title";
    }

    if (!imageFile && !currentImage) {
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

  // Reset to current image
  const resetToCurrentImage = () => {
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
    if (!formData.title && !imagePreview && !currentImage) {
      setErrors({ preview: "Vui lòng nhập tiêu đề và chọn ảnh để xem trước" });
      return;
    }
    setShowPreview(true);
  };

  // Close preview
  const closePreview = () => {
    navigate("/admin/banner");
  };

  // Get display image
  const getDisplayImage = () => {
    return imagePreview || currentImage;
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mx-auto mb-6">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang tải dữ liệu...
          </h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      {contextHolder}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-200">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Xem chi tiết</h1>
          </div>
          <p className="text-gray-600 mt-4 text-lg">
            Xem thông tin banner của bạn
          </p>
          {id && <p className="text-sm text-gray-500 mt-2">ID: {id}</p>}
        </div>

        {/* Success Message */}

        {/* Load Error */}
        {errors.load && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Lỗi tải dữ liệu</h3>
                <p className="text-red-600">{errors.load}</p>
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

                {!getDisplayImage() ? (
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
                      src={getDisplayImage()}
                      alt="Banner preview"
                      className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-white rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Thay đổi ảnh"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={resetToCurrentImage}
                            className="p-3 bg-yellow-500 rounded-xl text-white hover:bg-yellow-600 transition-colors"
                            title="Khôi phục ảnh gốc"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-3 bg-red-500 rounded-xl text-white hover:bg-red-600 transition-colors"
                          title="Xóa ảnh"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Image Status Indicator */}
                    <div className="absolute top-3 left-3">
                      {imagePreview ? (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Ảnh mới
                        </span>
                      ) : (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Ảnh hiện tại
                        </span>
                      )}
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
                    <option value="" disabled>
                      Chọn vị trí hiển thị...
                    </option>
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

              {/* Preview Error */}
              {errors.preview && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {errors.preview}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                {closePreview && (
                  <button
                    type="button"
                    onClick={closePreview}
                    className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Hủy
                  </button>
                )}

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
                  disabled
                  className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Cập nhật Banner
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
                        Kiểm tra giao diện banner sau khi cập nhật
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
                          {getDisplayImage() ? (
                            <img
                              src={getDisplayImage()}
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

                  {/* Other position previews... (same as create form) */}
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
                            {getDisplayImage() ? (
                              <img
                                src={getDisplayImage()}
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
                </div>

                {/* Banner Info */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-3">
                    Thông tin Banner
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-orange-700">
                        Tiêu đề:
                      </span>
                      <p className="text-orange-900">
                        {formData.title || "Chưa nhập tiêu đề"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-orange-700">
                        Vị trí:
                      </span>
                      <p className="text-orange-900">
                        {positionOptions.find(
                          (p) => p.value === formData.position
                        )?.label || "Chưa chọn vị trí"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-orange-700">
                        Liên kết:
                      </span>
                      <p className="text-blue-600 break-all">
                        {formData.link || "Không có liên kết"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-orange-700">
                        Trạng thái ảnh:
                      </span>
                      <p className="text-orange-900">
                        {imagePreview
                          ? "Đã chọn ảnh mới"
                          : currentImage
                          ? "Sử dụng ảnh hiện tại"
                          : "Chưa có ảnh"}
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
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Cập nhật Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section - Update specific */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-orange-100 rounded-xl w-fit mb-4">
              <Edit className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Cập nhật thông minh
            </h3>
            <p className="text-sm text-gray-600">
              Chỉ cần thay đổi những thông tin cần thiết. Ảnh cũ sẽ được giữ
              nguyên nếu không chọn ảnh mới.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-green-100 rounded-xl w-fit mb-4">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Xem trước trước khi lưu
            </h3>
            <p className="text-sm text-gray-600">
              Sử dụng tính năng xem trước để đảm bảo banner hiển thị đúng như
              mong muốn.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="p-2 bg-blue-100 rounded-xl w-fit mb-4">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Khôi phục dễ dàng
            </h3>
            <p className="text-sm text-gray-600">
              Có thể khôi phục lại ảnh gốc bất cứ lúc nào trước khi lưu thay
              đổi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBannerForm;
