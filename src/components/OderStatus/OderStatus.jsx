import {
  Button,
  notification,
  Badge,
  Card,
  Avatar,
  Tag,
  Timeline,
  Divider,
} from "antd";
import "mapbox-gl/dist/mapbox-gl.css";
import "./OderStaus.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  OrderStatusOneProduct,
  updateShippingCancelled,
} from "../../service/Oder";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  EditOutlined,
  SmileOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { FaUser, FaMoneyBill } from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import { FaTruck } from "react-icons/fa";
import FeedBack from "../FeedBack/FeeBack";
import OrderDetailModal from "../OrderDetailModal/OrderDetailModal";
import socket from "../../socket";
import { useOutletContext } from "react-router-dom";
import { addMultipleToCart } from "../../service/Cart";

const OderStatus = () => {
  const param = useParams();
  const [orderStatus, SetOrderStatus] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [data, setData] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [modal2Open, setModal2Open] = useState(false);
  const [visible, setVisible] = useState(false);
  const [OrderId, setOrderId] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { CartListProductsUser } = useOutletContext();

  const Navigate = useNavigate();

  const fetchAPIOrderStatus = async () => {
    try {
      const res = await OrderStatusOneProduct(param.id);
      if (res && res.data && res.data.EC === 0) {
        SetOrderStatus(res.data.data.orderStatus);
        setCreatedAt(res.data.data.createdAt);
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAPIOrderStatus();
  }, [param.id]);

  useEffect(() => {
    socket.on(`order-update-${user?._id}`, (data) => {
      setData(data.data);
    });
    return () => {
      socket.off(`order-update-${user?._id}`);
    };
  }, [user?._id]);

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(",", "."))
        : price;
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const formatPrice1 = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const ModelFeedBack = () => {
    setModal2Open(true);
  };

  const handleAddCart = async (items) => {
    setIsAddingToCart(true);
    try {
      const res = await addMultipleToCart(user._id, items);
      if (res && res.data && res.data.cart) {
        await new Promise((resolve) => {
          api.open({
            message: "Đã thêm vào giỏ hàng",
            description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
            duration: 3,
            onClose: resolve,
          });
        });
        await CartListProductsUser();
        Navigate("/cart");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      api.open({
        message: "Lỗi",
        description:
          "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
        duration: 3,
        type: "error",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const UpdateOderStatusCalled = async (orderStatus) => {
    try {
      let res = await updateShippingCancelled(param.id, orderStatus);
      if (res && res.data && res.data.EC === 0) {
        setData(res.data.data);
        api.open({
          message: "Hủy đơn hàng thành công",
          description: res.data.message,
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDetailsRouter = (id) => {
    setVisible(true);
    setOrderId(id);
  };

  const getStatusConfig = (status) => {
    const configs = {
      Processing: {
        text: "Chờ xác nhận",
        color: "#faad14",
        icon: <ClockCircleOutlined />,
      },
      Confirmed: {
        text: "Đã xác nhận",
        color: "#1890ff",
        icon: <CheckCircleOutlined />,
      },
      Shipping: {
        text: "Đã giao vận chuyển",
        color: "#13c2c2",
        icon: <TruckOutlined />,
      },
      Delivered: {
        text: "Đang giao hàng",
        color: "#722ed1",
        icon: <TruckOutlined />,
      },
      Completed: {
        text: "Hoàn thành",
        color: "#52c41a",
        icon: <CheckCircleOutlined />,
      },
      Cancelled: {
        text: "Đã hủy",
        color: "#ff4d4f",
        icon: <CloseCircleOutlined />,
      },
    };
    return (
      configs[status] || {
        text: "Không xác định",
        color: "#d9d9d9",
        icon: null,
      }
    );
  };

  const statusConfig = getStatusConfig(data.orderStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-6 px-4 sm:px-6 lg:px-8 mt-28">
      {contextHolder}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent flex items-center gap-3">
          <ShoppingCartOutlined className="text-emerald-600" />
          Đơn Hàng Của Tôi
        </h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl rounded-2xl border-0 sticky top-6 bg-white">
            {/* User Profile */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <Avatar
                size={64}
                src={user.avatar}
                className="ring-4 ring-emerald-100"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-lg">
                  {user.name}
                </p>
                <Link
                  to={`/profile/${user.name}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 transition-colors"
                >
                  <EditOutlined />
                  Sửa hồ sơ
                </Link>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all cursor-pointer group">
                <FaUser
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                  size={20}
                />
                <span className="text-gray-700 font-medium">
                  Tài khoản của tôi
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 transition-all cursor-pointer shadow-md">
                <RiBillFill className="text-white" size={20} />
                <span className="text-white font-semibold">Đơn mua</span>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all cursor-pointer group"
                onClick={() => Navigate("/voucher-wallet")}
              >
                <GiftOutlined
                  className="text-emerald-600 group-hover:scale-110 transition-transform"
                  style={{ fontSize: 20 }}
                />
                <span className="text-gray-700 font-medium">Kho Voucher</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {/* Status Tabs */}
          <Card className="shadow-xl rounded-2xl border-0 mb-6 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <div className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0 p-2">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "Processing", label: "Chờ xác nhận" },
                  { key: "Confirmed", label: "Đã xác nhận" },
                  { key: "Shipping", label: "Đang vận chuyển" },
                  { key: "Delivered", label: "Đang giao" },
                  { key: "Completed", label: "Hoàn thành" },
                  { key: "Cancelled", label: "Đã hủy" },
                ].map((tab) => (
                  <div
                    key={tab.key}
                    className={`px-4 py-2 rounded-xl cursor-pointer transition-all whitespace-nowrap text-sm sm:text-base font-medium ${
                      data.orderStatus === tab.key ||
                      (tab.key === "all" && !data.orderStatus)
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600 border border-gray-200"
                    }`}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {statusConfig.icon && (
                  <span style={{ fontSize: 24, color: statusConfig.color }}>
                    {statusConfig.icon}
                  </span>
                )}
                <div>
                  <Tag
                    color={statusConfig.color}
                    className="text-sm font-semibold px-4 py-1 rounded-full"
                  >
                    {statusConfig.text}
                  </Tag>
                  <p className="text-gray-500 text-sm mt-2">
                    Mã đơn: #{data.order_code}
                  </p>
                </div>
              </div>
              <Button
                type="link"
                className="text-emerald-600 font-semibold hover:text-emerald-700"
                onClick={() => handleDetailsRouter(data._id)}
              >
                Xem chi tiết →
              </Button>
            </div>

            {/* Products List */}
            <div className="mt-6 space-y-4">
              {data.items &&
                data.items.length > 0 &&
                data.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-white transition-all cursor-pointer border border-gray-100 hover:border-emerald-200 hover:shadow-md"
                    onClick={() => Navigate(`/product/${item.productId.slug}`)}
                  >
                    <img
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-md mx-auto sm:mx-0 ring-2 ring-gray-100"
                      src={item.image}
                      alt={item.name}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-800 text-lg mb-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-sm text-gray-600">
                        <Tag className="rounded-full bg-emerald-50 border-emerald-200">
                          Màu: {item.color}
                        </Tag>
                        <Tag className="rounded-full bg-emerald-50 border-emerald-200">
                          Size: {item.size}
                        </Tag>
                        <Tag className="rounded-full bg-emerald-50 border-emerald-200">
                          SL: {item.quantity}
                        </Tag>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <Divider />

            {/* Order Summary */}
            <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-emerald-900 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg font-medium">
                  Tổng thanh toán:
                </span>
                <span className="text-3xl font-bold text-white">
                  {data.totalAmount && formatPrice1(data.totalAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              {data.orderStatus === "Completed" && (
                <Button
                  size="large"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  onClick={ModelFeedBack}
                >
                  ⭐ Đánh giá sản phẩm
                </Button>
              )}

              {data.orderStatus === "Cancelled" && (
                <Button
                  size="large"
                  className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0 hover:from-slate-800 hover:to-black font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  onClick={() => handleAddCart(data.items)}
                  loading={isAddingToCart}
                >
                  🛒 {isAddingToCart ? "Đang thêm..." : "Mua lại"}
                </Button>
              )}

              <Button
                size="large"
                className="bg-white text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50 font-semibold shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                💬 Liên hệ người bán
              </Button>

              {data.orderStatus === "Processing" && (
                <Button
                  size="large"
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  onClick={() => UpdateOderStatusCalled("Cancelled")}
                >
                  ❌ Hủy đơn hàng
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <FeedBack
        modal2Open={modal2Open}
        setModal2Open={setModal2Open}
        data={data}
        userid={user?._id}
        setData={setData}
      />
      <OrderDetailModal
        visible={visible}
        id={param.id}
        onClose={() => setVisible(false)}
      />
    </div>
  );
};

export default OderStatus;
