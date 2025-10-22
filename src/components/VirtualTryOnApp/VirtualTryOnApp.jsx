import React, { useState, useEffect } from "react";
import {
  Upload,
  User,
  Shirt,
  ArrowRight,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Modal } from "antd";

const VirtualTryOnApp = ({
  modal2Open,
  setModal2Open,
  clothImage,
  setClothImage,
}) => {
  // Hardcode API key - thay thế bằng API key thực của bạn
  const API_KEY =
    "0266f60071b642af895f37bbfd161efcc59781ba0b8ac63f89a5b532901097a8";

  // State management
  const [modelImage, setModelImage] = useState(null);
  const [lowerClothImage, setLowerClothImage] = useState(null);
  const [clothType, setClothType] = useState("upper");
  const [hdMode, setHdMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("setup"); // setup, processing, completed

  // Preview URLs for uploaded images
  const [modelPreview, setModelPreview] = useState("");
  const [clothPreview, setClothPreview] = useState("");
  const [lowerClothPreview, setLowerClothPreview] = useState("");

  // Set cloth preview when clothImage prop changes
  useEffect(() => {
    if (clothImage) {
      setClothPreview(clothImage);
    }
  }, [clothImage]);

  // Handle file selection with preview
  const handleFileSelect = (file, setFile, setPreview) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  };

  // Convert URL to File object
  const downloadAndConvertToFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error("Error converting URL to file:", error);
      throw error;
    }
  };

  // Create try-on task
  const createTryOnTask = async () => {
    if (!modelImage || !clothImage) {
      setError("Vui lòng tải lên ảnh người mẫu và ảnh quần áo");
      return;
    }

    if (clothType === "combo" && !lowerClothImage) {
      setError("Vui lòng tải lên ảnh quần áo dưới cho combo try-on");
      return;
    }

    setLoading(true);
    setError("");
    setStep("processing");

    try {
      const formData = new FormData();

      // Handle model image
      let modelFile = modelImage;
      if (typeof modelImage === "string") {
        modelFile = await downloadAndConvertToFile(modelImage, "model.jpg");
      }
      formData.append("model_image", modelFile);

      // Handle cloth image
      let clothFile = clothImage;
      if (typeof clothImage === "string") {
        clothFile = await downloadAndConvertToFile(clothImage, "cloth.jpg");
      }
      formData.append("cloth_image", clothFile);

      formData.append("cloth_type", clothType);

      // Handle lower cloth image for combo
      if (clothType === "combo" && lowerClothImage) {
        let lowerClothFile = lowerClothImage;
        if (typeof lowerClothImage === "string") {
          lowerClothFile = await downloadAndConvertToFile(
            lowerClothImage,
            "lower_cloth.jpg"
          );
        }
        formData.append("lower_cloth_image", lowerClothFile);
      }

      if (hdMode) {
        formData.append("hd_mode", "true");
      }

      const response = await fetch(
        "https://platform.fitroom.app/api/tryon/v2/tasks",
        {
          method: "POST",
          headers: {
            "X-API-KEY": API_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setTaskId(data.task_id);

      // Start polling for status
      pollTaskStatus(data.task_id);
    } catch (err) {
      setError(`Lỗi tạo task: ${err.message}`);
      setLoading(false);
      setStep("setup");
    }
  };

  // Poll task status
  const pollTaskStatus = async (id) => {
    try {
      const response = await fetch(
        `https://platform.fitroom.app/api/tryon/v2/tasks/${id}`,
        {
          headers: {
            "X-API-KEY": API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProgress(data.progress || 0);

      if (data.status === "COMPLETED") {
        setResultUrl(data.download_signed_url);
        setLoading(false);
        setStep("completed");
      } else if (data.status === "FAILED") {
        setError(data.error || "Task failed");
        setLoading(false);
        setStep("setup");
      } else {
        // Continue polling
        setTimeout(() => pollTaskStatus(id), 2000);
      }
    } catch (err) {
      setError(`Lỗi kiểm tra trạng thái: ${err.message}`);
      setLoading(false);
      setStep("setup");
    }
  };

  // Reset form
  const resetForm = () => {
    setStep("setup");
    setTaskId(null);
    setProgress(0);
    setResultUrl("");
    setError("");
    setModelImage(null);
    setLowerClothImage(null);
    setModelPreview("");
    setLowerClothPreview("");
    // Keep clothImage and clothPreview from props
  };

  // Close modal and reset
  const closeModal = () => {
    setModal2Open(false);
    resetForm();
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Fitroom Virtual Try-On
          </span>
        </div>
      }
      centered
      open={modal2Open}
      onCancel={closeModal}
      footer={null}
      width={800}
      style={{ maxHeight: "90vh" }}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}
    >
      <div className="space-y-6">
        {/* Setup Step */}
        {step === "setup" && (
          <>
            {/* Clothing Type Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shirt className="mr-2 text-purple-600" size={20} />
                Chọn loại thử đồ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "upper", label: "Áo", icon: "👕" },
                  { value: "lower", label: "Quần", icon: "👖" },
                  { value: "full_set", label: "Toàn thân", icon: "👗" },
                  { value: "combo", label: "Combo", icon: "👔" },
                ].map((type, index) => (
                  <button
                    key={type.index + 1}
                    onClick={() => setClothType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      clothType === type.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className="font-medium text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Model Image */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2 text-blue-600" size={20} />
                  Ảnh người mẫu
                </h3>
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 h-80">
                    {modelPreview ? (
                      <img
                        src={modelPreview}
                        alt="Model preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 mb-2 text-gray-500" />
                        <p className="mb-1 text-sm text-gray-500">
                          Click để tải ảnh lên
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG (tối đa 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelect(
                          e.target.files[0],
                          setModelImage,
                          setModelPreview
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Cloth Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shirt className="mr-2 text-green-600" size={20} />
                  Ảnh quần áo
                </h3>

                {/* Main cloth image */}
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full  border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 relative h-80">
                    {clothPreview ? (
                      <>
                        <img
                          src={clothPreview}
                          alt="Cloth preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {typeof clothImage === "string" && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            Từ sản phẩm
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-6 h-6 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          {clothType === "combo" ? "Ảnh áo" : "Ảnh quần áo"}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        handleFileSelect(
                          e.target.files[0],
                          setClothImage,
                          setClothPreview
                        );
                      }}
                    />
                  </label>

                  {/* Lower cloth image for combo */}
                  {clothType === "combo" && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      {lowerClothPreview ? (
                        <img
                          src={lowerClothPreview}
                          alt="Lower cloth preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Ảnh quần</p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileSelect(
                            e.target.files[0],
                            setLowerClothImage,
                            setLowerClothPreview
                          )
                        }
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Tùy chọn</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Chế độ HD</div>
                  <div className="text-sm text-gray-500">
                    Chất lượng cao hơn nhưng xử lý lâu hơn (~30s)
                  </div>
                </div>
                <button
                  onClick={() => setHdMode(!hdMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hdMode ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hdMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Start Button */}
            <div className="border-t pt-4">
              <button
                onClick={createTryOnTask}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <ArrowRight className="mr-2" size={20} />
                )}
                {loading ? "Đang xử lý..." : "Bắt đầu thử đồ"}
              </button>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="text-center py-8">
            <div className="mb-6">
              <Loader2
                className="animate-spin mx-auto text-purple-600 mb-4"
                size={48}
              />
              <h3 className="text-xl font-semibold mb-2">
                Đang xử lý thử đồ...
              </h3>
              <p className="text-gray-600">Task ID: {taskId}</p>
            </div>

            <div className="mb-6 max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{progress}% hoàn thành</p>
            </div>

            <button
              onClick={closeModal}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        )}

        {/* Completed Step */}
        {step === "completed" && resultUrl && (
          <div className="text-center py-6">
            <div className="mb-6">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Hoàn thành!
              </h3>
              <p className="text-gray-600">Kết quả thử đồ đã sẵn sàng</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={resultUrl}
                  alt="Try-on result"
                  className="max-w-full max-h-80 mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    setError("Không thể tải ảnh kết quả");
                  }}
                />
              </div>

              <div className="flex gap-4 justify-center">
                <a
                  href={resultUrl}
                  download="fitroom-result.jpg"
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="mr-2" size={20} />
                  Tải xuống
                </a>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Thử đồ mới
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <XCircle
              className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div>
              <h4 className="text-red-800 font-medium">Có lỗi xảy ra</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Footer Info */}
      </div>
    </Modal>
  );
};

export default VirtualTryOnApp;
