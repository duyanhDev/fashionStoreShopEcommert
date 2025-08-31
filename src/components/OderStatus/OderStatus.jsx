import { Button, notification } from "antd";

import "mapbox-gl/dist/mapbox-gl.css";
import "./OderStaus.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  OrderStatusOneProduct,
  updateShippingCancelled,
} from "../../service/Oder";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { EditOutlined, SmileOutlined } from "@ant-design/icons";
import { FaUser, FaMoneyBill } from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import { FaTruck } from "react-icons/fa";
import FeedBack from "../FeedBack/FeeBack";
import OrderDetailModal from "../OrderDetailModal/OrderDetailModal";
import socket from "../../socket";

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
  // const description = moment(createdAt).format("DD/MM/YYYY");

  useEffect(() => {
    fetchAPIOrderStatus();
  }, [param.id]);

  useEffect(() => {
    // Lắng nghe sự kiện từ server
    socket.on(`order-update-${user?._id}`, (data) => {
      setData(data.data);
      // alert(data.message);
    });

    return () => {
      socket.off(`order-update-${user?._id}`);
    };
  }, [user?._id]);
  const formatPrice = (price) => {
    // Nếu price là chuỗi, chuyển đổi nó thành một số
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(",", "."))
        : price;

    // Định dạng lại giá trị bằng cách thêm dấu chấm ngăn cách hàng nghìn và thêm "đ"
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const formatPrice1 = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const ModelFeedBack = () => {
    setModal2Open(true);
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
  return (
    <div className="main_order ">
      {contextHolder}
      <div className="main_ranking__status">
        <h1 className="m-auto font-bold text-4xl" style={{ width: "1400px" }}>
          Đơn Mua
        </h1>
      </div>
      <div className="main_stack flex ">
        <div className="item_products ">
          <div className="mt-8 flex gap-2">
            <img
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "fill",
              }}
              src={user.avatar}
            />
            <div>
              <p className="font-semibold">{user.name}</p>
              <Link to={`/profile/${user.name}`}>
                {" "}
                <EditOutlined />
                Sửa hồ sơ
              </Link>
            </div>
          </div>

          <div className="mt-8 ">
            <div>
              <span className="flex gap-2 items-center">
                {" "}
                <FaUser color="brown" /> Tài khoản của tôi
              </span>
            </div>
            <div className="mt-2">
              <span className="flex gap-2 items-center">
                {" "}
                <RiBillFill color="brown" /> Đơn mua
              </span>
            </div>
            <div className="mt-2">
              <span className="flex gap-2 items-center">
                {" "}
                <IoIosNotifications color="brown" /> Thông Báo
              </span>
            </div>

            <div className="mt-2">
              <span className="flex gap-2 items-center">
                {" "}
                <FaMoneyBill color="brown" /> Kho Voucher
              </span>
            </div>
          </div>
        </div>
        <div className="item_products flex-1">
          <div className="mt-3 bg-slate-50 rounded-md cursor-pointer">
            <ul className="flex items-center gap-1 justify-between p-2 main_ul ">
              <li>Tất cả</li>
              <li
                className={`${
                  data.orderStatus === "Processing"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                {" "}
                Chờ người bán xác nhận
              </li>
              <li
                className={`${
                  data.orderStatus === "Confirmed"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                Người bán đang chuẩn bị hàng
              </li>
              <li
                className={`${
                  data.orderStatus === "Shipping"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                Đã giao cho shipper/đơn vị vận chuyển
              </li>
              <li
                className={`${
                  data.orderStatus === "Delivered"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                Đơn hàng đang giao hàng đến bạn
              </li>

              <li
                className={`${
                  data.orderStatus === "Completed"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                Đơn hàng giao thành công
              </li>
              <li
                className={`${
                  data.orderStatus === "Cancelled"
                    ? "text-amber-950 border-b-amber-800 border-b-2"
                    : ""
                }`}
              >
                Đã hủy
              </li>
            </ul>
          </div>

          <div className="mt-3 bg-slate-50 rounded-md cursor-pointer min-h-80 p-3">
            <div className="w-full relative p-3 border-b-2">
              <div className="main_right flex gap-2 items-center  absolute inset-0 float-right justify-end">
                <span className="text-green-500 flex items-center gap-1">
                  {" "}
                  <FaTruck />
                  {(() => {
                    switch (data.orderStatus) {
                      case "Processing":
                        return "Chờ xác nhận";
                      case "Confirmed":
                        return "Đơn hàng bạn đã được xác nhận";
                      case "Shipping":
                        return "Đã giao cho đơn vị vận chuyển";
                      case "Delivered":
                        return "Đang vận chuyển";
                      case "Completed":
                        return "Đơn hàng đã giao thành công";
                      case "Cancelled":
                        return "Đơn hàng đã hủy";
                      default:
                        return "Trạng thái không xác định";
                    }
                  })()}
                </span>
                <span onClick={() => handleDetailsRouter(data._id)}>
                  Xem chi tiết
                </span>
              </div>
            </div>
            <div className="mt-3">
              {data.items &&
                data.items.length > 0 &&
                data.items.map((item) => {
                  return (
                    <div
                      className="flex justify-between mt-2 items-center border-b-2"
                      key={item._id}
                    >
                      <div
                        className="flex gap-2 items-center"
                        onClick={() =>
                          Navigate(`/product/${item.productId.slug}`)
                        }
                      >
                        <img
                          className="w-24 h-24 rounded-full object-cover"
                          src={item.image}
                          alt="lỗi"
                        />
                        <div>
                          <span>{item.name}</span>
                          <span className="text-xs block">
                            Màu: {item.color}
                          </span>

                          <span className="text-xs block">
                            Kích thước: {item.size}
                          </span>
                          <span className="text-xs block">
                            Số lượng: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-amber-900">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-end gap-4">
                <span>Thành tiền:</span>{" "}
                <span className="text-amber-950">
                  {data.totalAmount && formatPrice1(data.totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-4 mt-3">
                {data.orderStatus === "Completed" && (
                  <Button
                    className="bg-amber-800 text-white"
                    onClick={ModelFeedBack}
                  >
                    Đánh giá
                  </Button>
                )}
                {data.orderStatus === "Cancelled" && (
                  <Button
                    className="bg-amber-800 text-white"
                    onClick={() => UpdateOderStatusCalled("Processing")}
                  >
                    Mua lại
                  </Button>
                )}
                <Button className="bg-amber-800 text-white">
                  Liên hệ người bán
                </Button>

                {data.orderStatus === "Cancelled" && (
                  <Button
                    className="bg-amber-800 text-white"
                    onClick={() => UpdateOderStatusCalled("Cancelled")}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <FeedBack
          modal2Open={modal2Open}
          setModal2Open={setModal2Open}
          data={data}
          userid={user?._id}
          setData={setData}
        />
      </div>
      <OrderDetailModal
        visible={visible}
        id={OrderId}
        onClose={() => setVisible(false)}
      />
    </div>
  );
};

export default OderStatus;
