import React, { useState } from "react";
import {
  Wallet,
  Search,
  Gift,
  Percent,
  Clock,
  Tag,
  Copy,
  Check,
  Star,
  Zap,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const UserVoucherWallet = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState("");

  // Mock data vouchers cho user
  const userVouchers = [
    {
      id: "UV001",
      name: "Giảm giá Mùa hè",
      code: "SUMMER2024",
      type: "percentage",
      value: 20,
      status: "available",
      expiryDate: "2024-12-31",
      minOrder: 500000,
      maxDiscount: 200000,
      description: "Giảm 20% tối đa 200K cho đơn hàng từ 500K",
      category: "fashion",
      brand: "Fashion Store",
      isNew: true,
      daysLeft: 15,
    },
    {
      id: "UV002",
      name: "Freeship Toàn quốc",
      code: "FREESHIP50",
      type: "shipping",
      value: 50000,
      status: "available",
      expiryDate: "2024-11-30",
      minOrder: 300000,
      description: "Miễn phí vận chuyển cho đơn hàng từ 300K",
      category: "shipping",
      brand: "All Stores",
      isNew: false,
      daysLeft: 45,
    },
    {
      id: "UV003",
      name: "Voucher VIP 100K",
      code: "VIP100K",
      type: "fixed",
      value: 100000,
      status: "available",
      expiryDate: "2024-12-15",
      minOrder: 1000000,
      description: "Giảm 100K cho đơn hàng từ 1 triệu - Khách VIP",
      category: "premium",
      brand: "Premium Store",
      isNew: false,
      daysLeft: 8,
    },
    {
      id: "UV004",
      name: "Combo Ăn uống",
      code: "FOOD30",
      type: "percentage",
      value: 30,
      status: "available",
      expiryDate: "2024-10-20",
      minOrder: 200000,
      maxDiscount: 100000,
      description: "Giảm 30% tối đa 100K cho đồ ăn & thức uống",
      category: "food",
      brand: "Food Court",
      isNew: true,
      daysLeft: 2,
    },
    {
      id: "UV005",
      name: "Tech Gadgets",
      code: "TECH15",
      type: "percentage",
      value: 15,
      status: "used",
      expiryDate: "2024-08-15",
      minOrder: 800000,
      maxDiscount: 300000,
      description: "Giảm 15% cho thiết bị công nghệ",
      category: "tech",
      brand: "Tech World",
      isNew: false,
      usedDate: "2024-08-10",
    },
    {
      id: "UV006",
      name: "Beauty & Care",
      code: "BEAUTY25",
      type: "percentage",
      value: 25,
      status: "expired",
      expiryDate: "2024-09-01",
      minOrder: 400000,
      maxDiscount: 150000,
      description: "Giảm 25% cho mỹ phẩm & chăm sóc cá nhân",
      category: "beauty",
      brand: "Beauty Store",
      isNew: false,
    },
  ];

  const categories = [
    { id: "all", name: "Tất cả", icon: "🏷️" },
    { id: "fashion", name: "Thời trang", icon: "👕" },
    { id: "food", name: "Ăn uống", icon: "🍕" },
    { id: "tech", name: "Công nghệ", icon: "📱" },
    { id: "beauty", name: "Làm đẹp", icon: "💄" },
    { id: "shipping", name: "Vận chuyển", icon: "🚚" },
    { id: "premium", name: "VIP", icon: "⭐" },
  ];

  // Filter vouchers
  const filteredVouchers = userVouchers.filter((voucher) => {
    const matchesSearch =
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || voucher.status === filterStatus;
    const matchesCategory =
      selectedCategory === "all" || voucher.category === selectedCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const availableVouchers = userVouchers.filter(
    (v) => v.status === "available"
  );
  const expiringSoon = availableVouchers.filter(
    (v) => v.daysLeft && v.daysLeft <= 7
  );

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "used":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "expired":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Có thể dùng";
      case "used":
        return "Đã sử dụng";
      case "expired":
        return "Đã hết hạn";
      default:
        return "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getVoucherIcon = (type) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-5 h-5" />;
      case "fixed":
        return <Tag className="w-5 h-5" />;
      case "shipping":
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "percentage":
        return "from-purple-500 to-pink-500";
      case "fixed":
        return "from-blue-500 to-cyan-500";
      case "shipping":
        return "from-green-500 to-emerald-500";
      default:
        return "from-orange-500 to-red-500";
    }
  };

  return (
    <div className="min-h-screen mt-28 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ví Voucher
            </h1>
            <p className="text-gray-600">Quản lý và sử dụng voucher của bạn</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng voucher</p>
                <p className="text-xl font-bold text-blue-600">
                  {userVouchers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Có thể dùng</p>
                <p className="text-xl font-bold text-green-600">
                  {availableVouchers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Sắp hết hạn</p>
                <p className="text-xl font-bold text-orange-600">
                  {expiringSoon.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Voucher mới</p>
                <p className="text-xl font-bold text-purple-600">
                  {userVouchers.filter((v) => v.isNew).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher sắp hết hạn */}
      {expiringSoon.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6" />
            <h2 className="text-xl font-bold">⚠️ Voucher sắp hết hạn!</h2>
          </div>
          <p className="mb-4 opacity-90">
            Bạn có {expiringSoon.length} voucher sẽ hết hạn trong 7 ngày tới
          </p>
          <div className="flex flex-wrap gap-2">
            {expiringSoon.slice(0, 3).map((voucher) => (
              <span
                key={voucher.id}
                className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium"
              >
                {voucher.name} - {voucher.daysLeft} ngày
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm voucher theo tên, mã hoặc thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-700"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Danh mục:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Trạng thái:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("available")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterStatus === "available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Có thể dùng
            </button>
            <button
              onClick={() => setFilterStatus("used")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterStatus === "used"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã sử dụng
            </button>
            <button
              onClick={() => setFilterStatus("expired")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterStatus === "expired"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã hết hạn
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVouchers.map((voucher) => (
          <div
            key={voucher.id}
            className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden ${
              voucher.status === "available"
                ? "border-purple-200"
                : "border-gray-200"
            }`}
          >
            {/* Voucher Header */}
            <div
              className={`bg-gradient-to-r ${getTypeColor(
                voucher.type
              )} p-6 text-white relative`}
            >
              {voucher.isNew && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  MỚI
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    {getVoucherIcon(voucher.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{voucher.name}</h3>
                    <p className="opacity-90 text-sm">{voucher.brand}</p>
                  </div>
                </div>
              </div>

              {/* Voucher Value */}
              <div className="bg-white bg-opacity-20 p-4 rounded-xl text-center">
                <p className="text-3xl font-bold mb-1">
                  {voucher.type === "percentage"
                    ? `${voucher.value}%`
                    : voucher.type === "shipping"
                    ? "FREE SHIP"
                    : formatCurrency(voucher.value)}
                </p>
                {voucher.maxDiscount && voucher.type === "percentage" && (
                  <p className="text-sm opacity-90">
                    Tối đa {formatCurrency(voucher.maxDiscount)}
                  </p>
                )}
              </div>
            </div>

            {/* Voucher Body */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    voucher.status
                  )}`}
                >
                  {getStatusText(voucher.status)}
                </span>
                {voucher.daysLeft && voucher.status === "available" && (
                  <span
                    className={`text-xs font-medium ${
                      voucher.daysLeft <= 7 ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    Còn {voucher.daysLeft} ngày
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{voucher.description}</p>

              {/* Voucher Code */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mã voucher:</p>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {voucher.code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(voucher.code)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    disabled={voucher.status !== "available"}
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Voucher Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Đơn tối thiểu:</span>
                  <span className="font-medium">
                    {formatCurrency(voucher.minOrder)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hạn sử dụng:</span>
                  <span className="font-medium">
                    {formatDate(voucher.expiryDate)}
                  </span>
                </div>
                {voucher.usedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Đã dùng ngày:</span>
                    <span className="font-medium">
                      {formatDate(voucher.usedDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {voucher.status === "available" && (
                <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Sử dụng ngay
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVouchers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Không tìm thấy voucher
          </h3>
          <p className="text-gray-600 mb-6">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem kết quả khác
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
            Khám phá voucher mới
          </button>
        </div>
      )}
    </div>
  );
};

export default UserVoucherWallet;
