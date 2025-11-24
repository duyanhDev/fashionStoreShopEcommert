import { useState, useEffect } from "react";
import {
  CheckCircle,
  Package,
  CreditCard,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { OrderStatusOneProduct } from "../../service/Oder";
import { useParams } from "react-router-dom";
import axios from "axios";

// Utility functions
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN");

// Components
const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
      <p className="text-red-800">{message}</p>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

const OrderItem = ({ item, totalAmount }) => (
  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
    <img
      src={item.image}
      alt={item.name}
      className="h-16 w-16 object-cover rounded-lg"
      onError={(e) => (e.target.src = "/api/placeholder/64/64")}
    />
    <div className="flex-1">
      <h4 className="font-medium text-gray-800">{item.name}</h4>
      <p className="text-sm text-gray-500">Màu: {item.color}</p>
      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-800">
        {formatCurrency(totalAmount)}
      </p>
    </div>
  </div>
);

const PriceBreakdown = ({ totalAmount }) => (
  <div className="border-t mt-6 pt-6">
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Tạm tính</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Phí vận chuyển</span>
        <span>Miễn phí</span>
      </div>
      <div className="border-t pt-2 flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span className="text-green-600">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  </div>
);

const PaymentSuccessPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [leadtimeOrder, setLeadtimeOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const param = useParams();

  // Fetch order status from your API
  const fetchAPIOrderStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await OrderStatusOneProduct(param.id);
      if (res?.data?.EC === 0) {
        setOrderData(res.data.data);
      } else {
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Order fetch error:", err);
      setError("Có lỗi xảy ra khi tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch GHN tracking details
  const fetchDetailOrder = async () => {
    if (!orderData?.order_code) return;
    try {
      setTrackingError(null);
      const res = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail",
        { order_code: orderData.order_code },
        {
          headers: {
            Token: "6501032d-0b70-11ef-b1d4-92b443b7a897",
            "Content-Type": "application/json",
            ShopId: 192215,
          },
        }
      );
      if (res?.data) {
        setLeadtimeOrder(res.data.data);
      }
    } catch (err) {
      console.error("Tracking fetch error:", err.response?.data || err.message);
      setTrackingError("Không thể tải thông tin vận chuyển.");
    }
  };

  useEffect(() => {
    fetchAPIOrderStatus();
  }, [param.id]);

  useEffect(() => {
    if (orderData) fetchDetailOrder();
  }, [orderData]);

  if (loading) return <LoadingSpinner />;
  if (error || !orderData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "Không thể tải thông tin đơn hàng."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  return (
    <div className="min-h-screen mt-24 bg-gradient-to-br from-green-50 to-emerald-50 py-8 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Success */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto animate-pulse mb-4" />
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Thông Tin Đơn Hàng
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-semibold text-lg text-blue-600">
                    {orderData.order_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                  <p className="font-medium">
                    {formatDate(orderData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="font-bold text-xl text-green-600">
                    {formatCurrency(orderData.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {orderData.paymentStatus === "Completed"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Sản phẩm đã mua
                </h3>
                <div className="space-y-4">
                  {orderData.items?.map((item) => (
                    <OrderItem
                      key={item.id}
                      item={item}
                      totalAmount={orderData.totalAmount}
                    />
                  ))}
                </div>
              </div>

              <PriceBreakdown totalAmount={orderData.totalAmount} />
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Thông Tin Thanh Toán
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mã giao dịch</p>
                  <p className="font-medium">{orderData._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Phương thức thanh toán
                  </p>
                  <p className="font-medium">{orderData.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="font-semibold text-gray-800">
                  Thông Tin Giao Hàng
                </h3>
              </div>
              {/* {trackingError && <ErrorMessage message={trackingError} />} */}
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-gray-500">Dự kiến giao hàng</p>
                    <p className="font-medium">
                      {leadtimeOrder?.leadtime_order?.from_estimate_date
                        ? formatDate(
                            leadtimeOrder.leadtime_order.from_estimate_date
                          )
                        : orderData?.createdAt
                        ? `${formatDate(
                            addDays(orderData.createdAt, 2)
                          )} - ${formatDate(addDays(orderData.createdAt, 3))}`
                        : "Đang tải..."}
                    </p>
                  </div>
                </div>
                {leadtimeOrder?.leadtime_order?.to_estimate_date && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-500">
                        Dự kiến kết thúc giao hàng
                      </p>
                      <p className="font-medium">
                        {formatDate(
                          leadtimeOrder.leadtime_order.to_estimate_date
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-gray-500">Địa chỉ giao hàng</p>
                    <p className="font-medium">
                      {orderData.shippingAddress.fullAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Thông Tin Khách Hàng
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">{orderData.username}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span>0{orderData.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{orderData?.userId?.email || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
