import { Button, Result } from "antd";

const VNpay = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Thanh toán thành công!
        </h2>

        {/* VNPay Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/api/placeholder/120/40"
            alt="VNPay Logo"
            className="h-10"
          />
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã thanh toán qua Ví VNPay. Đơn hàng của bạn sẽ được vận
          chuyển trong 1-3 ngày tới.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Mã đơn hàng: #123456789</p>
            <p className="mb-2">Thời gian: {new Date().toLocaleString()}</p>
            <p>Trạng thái: Đã xác nhận</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            onClick={() => (window.location.href = "/")}
          >
            Về trang chủ
          </Button>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2"
            onClick={() => (window.location.href = "/shop")}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VNpay;
