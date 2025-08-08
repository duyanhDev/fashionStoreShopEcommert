import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Copy,
  ExternalLink,
} from "lucide-react";

const OrderDetailModal = ({ visible, onClose }) => {
  const mockOrderData = {
    _id: "66b3f4a5d8e7c9a1b2c3d4e5",
    orderStatus: "Shipping",
    createdAt: "2025-08-07T14:30:00Z",
    totalAmount: 1250000,
    shippingAddress: "123 Đường ABC, Gia Nghĩa, Đắk Nông",
    items: [
      {
        name: "Áo thun nam cao cấp",
        color: "Đen",
        size: "L",
        quantity: 2,
        price: 450000,
        image: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=Ao+Thun",
      },
      {
        name: "Quần jean nữ skinny",
        color: "Xanh",
        size: "M",
        quantity: 1,
        price: 350000,
        image: "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Quan+Jean",
      },
    ],
  };

  const [trackingSteps, setTrackingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);

  const trackingCode = `JT${Date.now().toString().slice(-8)}`;

  // Fake tracking data
  useEffect(() => {
    const steps = [
      {
        title: "Đơn hàng đã được xác nhận",
        description: "Người bán đã xác nhận đơn hàng",
        time: "14:30 - 07/08/2025",
        status: "completed",
        icon: CheckCircle,
      },
      {
        title: "Đã giao cho đơn vị vận chuyển",
        description: "Đơn hàng đã được giao cho J&T Express",
        time: "16:45 - 07/08/2025",
        status: "completed",
        icon: Package,
      },
      {
        title: "Đang vận chuyển",
        description: "Đơn hàng đang trên đường giao đến bạn",
        time: "08:20 - 08/08/2025",
        status: "current",
        icon: Truck,
      },
      {
        title: "Giao hàng thành công",
        description: "Đơn hàng đã được giao thành công",
        time: "Dự kiến 10:00 - 09/08/2025",
        status: "pending",
        icon: MapPin,
      },
    ];

    setTrackingSteps(steps);
    setCurrentStep(mockOrderData?.orderStatus === "Completed" ? 3 : 2);
  }, [mockOrderData]);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shipping":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Processing":
        return "Chờ xác nhận";
      case "Shipping":
        return "Đang giao";
      case "Delivered":
        return "Chờ giao hàng";
      case "Completed":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopiedTrackingCode(true);
      setTimeout(() => setCopiedTrackingCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết vận chuyển
                </h2>
                <p className="text-gray-600">
                  Mã đơn hàng: #{mockOrderData?._id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-red-50 rounded-2xl p-6 mb-8 border border-orange-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      mockOrderData?.orderStatus
                    )}`}
                  >
                    {getStatusText(mockOrderData?.orderStatus)}
                  </span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-700 font-medium">
                  Đặt hàng lúc:{" "}
                  {new Date(mockOrderData?.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tổng giá trị đơn hàng</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPrice(mockOrderData?.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Interactive Map */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Theo dõi vận chuyển
                  </h3>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-80 rounded-xl relative overflow-hidden border border-gray-200">
                    {/* Grid pattern */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "24px 24px",
                      }}
                    />

                    {/* Route Path */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient
                          id="routeGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 60 280 Q 200 200 350 220 Q 500 240 640 120"
                        stroke="url(#routeGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="8,4"
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Location Points */}
                    <div className="absolute bottom-8 left-12">
                      <div className="relative">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                        <div className="absolute -top-12 -left-8 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                          <div className="font-semibold">Kho hàng</div>
                          <div className="text-gray-300">Đã xuất kho</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-24 right-20">
                      <div className="relative animate-bounce">
                        <div className="w-6 h-6 bg-orange-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute -top-12 -left-12 bg-orange-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                          <div className="font-semibold">Đang giao hàng</div>
                          <div className="text-orange-100">
                            Shipper: Nguyễn Văn A
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-16 right-4">
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-3 border-white shadow-lg"></div>
                        <div className="absolute -top-12 -left-12 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                          <div className="font-semibold">Địa chỉ nhận</div>
                          <div className="text-blue-100">
                            Gia Nghĩa, Đắk Nông
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Animated Truck */}
                    <div className="absolute top-28 right-24 text-3xl animate-pulse">
                      🚚
                    </div>
                  </div>

                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Đang giao đến:</span>
                    </div>
                    <p className="text-orange-800 font-semibold mt-1">
                      {mockOrderData?.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Lịch sử vận chuyển
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {trackingSteps.map((step, index) => {
                      const IconComponent = step.icon;
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";
                      const isPending = step.status === "pending";

                      return (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline Line */}
                          {index < trackingSteps.length - 1 && (
                            <div
                              className={`absolute left-6 top-12 w-0.5 h-8 ${
                                isCompleted ? "bg-green-400" : "bg-gray-200"
                              }`}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                              isCompleted
                                ? "bg-green-100 border-green-400 text-green-600"
                                : isCurrent
                                ? "bg-orange-100 border-orange-400 text-orange-600 animate-pulse"
                                : "bg-gray-100 border-gray-300 text-gray-400"
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-semibold ${
                                isCompleted
                                  ? "text-green-800"
                                  : isCurrent
                                  ? "text-orange-800"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {step.description}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {step.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Shipping Info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Thông tin vận chuyển
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div>
                      <p className="text-blue-800 font-semibold">J&T Express</p>
                      <p className="text-blue-600 text-sm">Đơn vị vận chuyển</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Mã vận đơn:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-blue-600">
                          {trackingCode}
                        </span>
                        <button
                          onClick={copyTrackingCode}
                          className={`p-1.5 rounded-lg transition-colors ${
                            copiedTrackingCode
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Phí vận chuyển:
                      </span>
                      <span className="font-semibold">30.000đ</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Thời gian giao dự kiến:
                      </span>
                      <span className="font-semibold text-green-600">
                        1-2 ngày
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Shipper:
                      </span>
                      <span className="font-semibold">Nguyễn Văn A</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Số điện thoại:
                      </span>
                      <span className="font-semibold text-blue-600">
                        0123.456.789
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-bold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="font-bold text-2xl text-orange-600">
                        {formatPrice(mockOrderData?.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    Sản phẩm ({mockOrderData?.items?.length})
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {mockOrderData?.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              Màu: {item.color}
                            </span>
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              Size: {item.size}
                            </span>
                            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200">
                              SL: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-orange-600">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Đóng
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Liên hệ shipper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
