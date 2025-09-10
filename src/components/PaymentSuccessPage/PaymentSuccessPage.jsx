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
  Download,
  Share,
} from "lucide-react";
import { OrderStatusOneProduct } from "../../service/Oder";
import { useParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [orderData, setOrderData] = useState(null);
  const param = useParams();

  const fetchAPIOrderStatus = async () => {
    try {
      const res = await OrderStatusOneProduct(param.id);

      if (res && res.data && res.data.EC === 0) {
        setOrderData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAPIOrderStatus();
  }, [param?._id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Success */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto animate-pulse" />
          </div>
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
                    Đã thanh toán
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Sản phẩm đã mua
                </h3>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Màu: {item.color}
                        </p>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t mt-6 pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span>{formatCurrency(orderData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                  {/* {orderData.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>0</span>
                    </div>
                  )} */}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {formatCurrency(orderData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
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

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-gray-500">Dự kiến giao hàng</p>
                    <p className="font-medium">
                      {" "}
                      Từ 2 đến 3 ngày kể từ hôm nay
                      {/* {formatDate(orderData.estimatedDelivery)} */}
                    </p>
                  </div>
                </div>

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
                  <span>{orderData.phone}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span>
                    {orderData?.userId ? orderData.userId.email : "Unkonw"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-semibold mb-2">Cần hỗ trợ?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về đơn hàng.
              </p>
              <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
