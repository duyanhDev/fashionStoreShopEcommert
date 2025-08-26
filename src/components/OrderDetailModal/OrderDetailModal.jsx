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
import { OrderStatusOneProduct } from "../../service/Oder";

const OrderDetailModal = ({ visible, onClose, id }) => {
  const [OrderData, setOrderData] = useState([]);
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

  // Fake tracking data

  const handlelAPIDetailOrder = async () => {
    try {
      const res = await OrderStatusOneProduct(id);
      if (res && res.data && res.data.EC === 0) {
        setOrderData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handlelAPIDetailOrder();
  }, [id]);

  useEffect(() => {
    const statusOrder = [
      "Processing",
      "Confirmed",
      "Shipping",
      "Delivered",
      "Completed",
    ];
    const currentIndex = statusOrder.indexOf(OrderData?.orderStatus);

    const steps = [
      {
        title: "Đơn hàng đang chờ xác nhận",
        description: "Chờ người bán xác nhận đơn hàng",
        time: "14:30 - 07/08/2025",
        icon: Clock,
      },
      {
        title: "Người bán đã xác nhận",
        description: "Người bán chuẩn bị hàng",
        time: "15:00 - 07/08/2025",
        icon: CheckCircle,
      },
      {
        title: "Đã giao cho đơn vị vận chuyển",
        description: "Đơn hàng đã được giao cho GHN Express",
        time: "16:45 - 07/08/2025",
        icon: Package,
      },
      {
        title: "Đang vận chuyển",
        description: "Đơn hàng đang trên đường giao đến bạn",
        time: "08:20 - 08/08/2025",
        icon: Truck,
      },
      {
        title: "Giao hàng thành công",
        description: "Đơn hàng đã được giao thành công",
        time: "Dự kiến 10:00 - 09/08/2025",
        icon: MapPin,
      },
    ];

    // Gắn trạng thái completed/current/pending
    const updatedSteps = steps.map((step, index) => {
      if (index <= currentIndex) return { ...step, status: "Completed" };
      if (index === currentIndex) return { ...step, status: "current" };
      return { ...step, status: "pending" };
    });

    setTrackingSteps(updatedSteps);
  }, [OrderData]);

  // Delivery points for map visualization
  const getDeliveryPoints = () => {
    const statusOrder = [
      "Processing",
      "Confirmed",
      "Shipping",
      "Delivered",
      "Completed",
    ];
    const currentIndex = statusOrder.indexOf(OrderData?.orderStatus);

    return [
      {
        id: 1,
        title: "Kho hàng",
        subtitle: "Đã xuất kho",
        position: { bottom: 32, left: 60 },
        status: currentIndex >= 1 ? "completed" : "pending",
        time: "15:00",
      },
      {
        id: 2,
        title: "Trung tâm phân loại",
        subtitle: "Đã qua xử lý",
        position: { bottom: 120, left: 180 },
        status:
          currentIndex >= 2
            ? "completed"
            : currentIndex === 1
            ? "current"
            : "pending",
        time: "16:45",
      },
      {
        id: 3,
        title: "Bưu cục địa phương",
        subtitle: "Đang xử lý",
        position: { top: 140, left: 320 },
        status:
          currentIndex >= 3
            ? "completed"
            : currentIndex === 2
            ? "current"
            : "pending",
        time: "08:20",
      },
      {
        id: 4,
        title: "Shipper nhận hàng",
        subtitle: "Đang giao hàng",
        position: { top: 100, right: 120 },
        status:
          currentIndex >= 4
            ? "completed"
            : currentIndex === 3
            ? "current"
            : "pending",
        time: "09:30",
      },
      {
        id: 5,
        title: "Địa chỉ nhận",
        subtitle:
          OrderData?.shippingAddress?.fullAddress || "Địa chỉ giao hàng",
        position: { top: 64, right: 16 },
        status: currentIndex >= 4 ? "completed" : "pending",
        time: "10:00",
      },
    ];
  };

  const getPointColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const getTooltipBg = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "current":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

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
        return "Đơn hàng đang chờ shop xác nhận";
      case "Confirmed":
        return "Người bán đang chuẩn bị hàng";
      case "Shipping":
        return "Đã giao cho shipper/đơn vị vận chuyển";
      case "Delivered":
        return "Đơn hàng đang giao hàng đến bạn";
      case "Completed":
        return "Đơn hàng giao thành công";
      case "Cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const copyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(OrderData.order_code);
      setCopiedTrackingCode(true);
      setTimeout(() => setCopiedTrackingCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (!visible) return null;

  const deliveryPoints = getDeliveryPoints();
  const statusOrder = [
    "Processing",
    "Confirmed",
    "Shipping",
    "Delivered",
    "Completed",
  ];
  const currentIndex = statusOrder.indexOf(OrderData?.orderStatus);

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
                <p className="text-gray-600">Mã đơn hàng: {OrderData._id}</p>
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
                      OrderData?.orderStatus
                    )}`}
                  >
                    {getStatusText(OrderData?.orderStatus)}
                  </span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-700 font-medium">
                  Đặt hàng lúc:{" "}
                  {new Date(OrderData?.createdAt).toLocaleString("vi-VN")}
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

                <div className="p-4">
                  <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 h-96 rounded-xl relative overflow-hidden border-2 border-gray-300 shadow-inner">
                    {/* Map-like terrain pattern */}
                    <div className="absolute inset-0 opacity-40">
                      {/* Road-like grid */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(156,163,175,0.3) 2px, transparent 2px),
                            linear-gradient(90deg, rgba(156,163,175,0.3) 2px, transparent 2px)
                          `,
                          backgroundSize: "40px 40px",
                        }}
                      />

                      {/* Map terrain elements */}
                      <div className="absolute top-8 left-16 w-24 h-16 bg-green-200 rounded-full opacity-60"></div>
                      <div className="absolute bottom-12 right-20 w-20 h-20 bg-blue-200 rounded-full opacity-50"></div>
                      <div className="absolute top-32 right-40 w-16 h-12 bg-yellow-200 rounded opacity-40"></div>
                      <div className="absolute bottom-24 left-32 w-32 h-8 bg-green-300 rounded-full opacity-30"></div>
                    </div>

                    {/* Main delivery route */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient
                          id="completedRoute"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                        <linearGradient
                          id="currentRoute"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#dc2626" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                        <linearGradient
                          id="pendingRoute"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#9ca3af" />
                          <stop offset="100%" stopColor="#d1d5db" />
                        </linearGradient>

                        {/* Road shadow effect */}
                        <filter id="roadShadow">
                          <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="1"
                            floodColor="#000000"
                            floodOpacity="0.2"
                          />
                        </filter>
                      </defs>

                      {/* Main highway route */}
                      <path
                        d="M 80 340 Q 200 280 350 200 Q 480 120 620 80"
                        stroke="#6b7280"
                        strokeWidth="12"
                        fill="none"
                        opacity="0.3"
                        filter="url(#roadShadow)"
                      />

                      {/* Active route segments */}
                      <path
                        d="M 80 340 Q 140 320 200 280"
                        stroke={
                          currentIndex >= 1
                            ? "url(#completedRoute)"
                            : "url(#pendingRoute)"
                        }
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={currentIndex >= 1 ? "0" : "12,8"}
                      />

                      <path
                        d="M 200 280 Q 275 240 350 200"
                        stroke={
                          currentIndex >= 2
                            ? "url(#completedRoute)"
                            : currentIndex === 1
                            ? "url(#currentRoute)"
                            : "url(#pendingRoute)"
                        }
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={currentIndex >= 2 ? "0" : "12,8"}
                        className={currentIndex === 1 ? "animate-pulse" : ""}
                      />

                      <path
                        d="M 350 200 Q 415 160 480 120"
                        stroke={
                          currentIndex >= 3
                            ? "url(#completedRoute)"
                            : currentIndex === 2
                            ? "url(#currentRoute)"
                            : "url(#pendingRoute)"
                        }
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={currentIndex >= 3 ? "0" : "12,8"}
                        className={currentIndex === 2 ? "animate-pulse" : ""}
                      />

                      <path
                        d="M 480 120 Q 550 100 620 80"
                        stroke={
                          currentIndex >= 4
                            ? "url(#completedRoute)"
                            : currentIndex === 3
                            ? "url(#currentRoute)"
                            : "url(#pendingRoute)"
                        }
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={currentIndex >= 4 ? "0" : "12,8"}
                        className={currentIndex === 3 ? "animate-pulse" : ""}
                      />
                    </svg>

                    {/* Realistic location markers */}
                    {deliveryPoints.map((point) => (
                      <div
                        key={point.id}
                        className="absolute group"
                        style={point.position}
                      >
                        <div className="relative">
                          {/* Location pin */}
                          <div
                            className={`relative w-8 h-10 ${
                              point.status === "completed"
                                ? "text-green-500"
                                : point.status === "current"
                                ? "text-red-500 animate-bounce"
                                : "text-gray-400"
                            }`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-full h-full drop-shadow-lg"
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              <circle cx="12" cy="9" r="2.5" fill="white" />
                            </svg>

                            {/* Status indicator */}
                            <div
                              className={`absolute top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${
                                point.status === "completed"
                                  ? "bg-white"
                                  : point.status === "current"
                                  ? "bg-white animate-ping"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          </div>

                          {/* Information card */}
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 px-4 py-3 min-w-max opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 hover:scale-105">
                            <div className="text-center">
                              <div
                                className={`font-bold text-sm ${
                                  point.status === "completed"
                                    ? "text-green-600"
                                    : point.status === "current"
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {point.title}
                              </div>
                              <div className="text-gray-500 text-xs mt-1 max-w-32 truncate">
                                {point.subtitle}
                              </div>
                              <div
                                className={`text-xs mt-2 px-2 py-1 rounded-full ${
                                  point.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : point.status === "current"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {point.time}
                              </div>
                            </div>

                            {/* Arrow pointer */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white"></div>
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-6 border-transparent border-t-gray-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Realistic moving vehicle */}
                    {currentIndex >= 1 && currentIndex <= 4 && (
                      <div
                        className={`absolute transition-all duration-2000 ease-in-out z-10 ${
                          currentIndex === 1
                            ? "bottom-14 left-48"
                            : currentIndex === 2
                            ? "top-48 left-80"
                            : currentIndex === 3
                            ? "top-28 right-40"
                            : "top-20 right-16"
                        }`}
                      >
                        <div className="relative">
                          {/* Vehicle shadow */}
                          <div className="absolute -bottom-1 left-1 w-12 h-6 bg-black opacity-20 rounded-full blur-sm"></div>

                          {/* Delivery truck */}
                          <div
                            className="text-4xl animate-bounce filter drop-shadow-lg"
                            style={{
                              transform:
                                currentIndex <= 2 ? "scaleX(1)" : "scaleX(-1)",
                            }}
                          >
                            🚚
                          </div>

                          {/* Motion lines */}
                          {currentIndex >= 2 && (
                            <div className="absolute top-2 -left-8 opacity-60">
                              <div className="flex space-x-1">
                                <div className="w-2 h-0.5 bg-gray-400 rounded animate-pulse"></div>
                                <div className="w-1 h-0.5 bg-gray-400 rounded animate-pulse delay-100"></div>
                                <div className="w-1 h-0.5 bg-gray-400 rounded animate-pulse delay-200"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivery person (when near destination) */}
                    {currentIndex >= 3 && (
                      <div className="absolute top-16 right-20 z-10">
                        <div className="relative">
                          <div className="text-3xl animate-pulse filter drop-shadow-lg">
                            🏃‍♂️
                          </div>
                          <div className="absolute -bottom-1 left-2 w-8 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
                        </div>
                      </div>
                    )}

                    {/* GPS-like current location indicator */}
                    {currentIndex >= 2 && currentIndex <= 3 && (
                      <div
                        className={`absolute z-20 ${
                          currentIndex === 2
                            ? "top-52 left-84"
                            : "top-32 right-44"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-ping"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Đang giao đến:</span>
                    </div>
                    <p className="text-orange-800 font-semibold mt-1">
                      {OrderData?.shippingAddress?.fullAddress}
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
                      const isCompleted = step.status === "Completed";
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
                      <p className="text-blue-800 font-semibold">
                        {" "}
                        Giao Hàng Nhanh
                      </p>
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
                          {OrderData.order_code}
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
                      <span className="font-semibold">Miễn phí</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Thời gian giao dự kiến:
                      </span>
                      <span className="font-semibold text-green-600">
                        2-3 ngày
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Người đặt
                      </span>
                      <span className="font-semibold">
                        {OrderData?.username}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">
                        Số điện thoại:
                      </span>
                      <span className="font-semibold text-blue-600">
                        0{OrderData?.phone}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-bold text-gray-900">
                        Tổng thanh toán:
                      </span>
                      <span className="font-bold text-2xl text-orange-600">
                        {formatPrice(OrderData?.totalAmount)}
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
                    Sản phẩm ( {OrderData && OrderData?.items?.length})
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {OrderData &&
                      OrderData?.items?.map((item, index) => (
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
