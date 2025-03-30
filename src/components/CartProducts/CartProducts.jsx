import { useEffect } from "react";
import axios from "./../../untils/axios";
import "./Cart.css";
import { Input, Select, Radio, Button, Table, notification } from "antd";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createOrder } from "../../service/Oder";
import { SmileOutlined } from "@ant-design/icons";
import ClipLoader from "react-spinners/ClipLoader";
import { getVoucherAPI } from "../../service/APIVoucher,js";
import moment from "moment";

const CartProducts = ({}) => {
  const { ListCart, user, CartListProductsUser } = useOutletContext();

  const [loadingSpin, setLoadingSpin] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [value, setValue] = useState("cod");
  const [provine, SetProvine] = useState([]);
  const [district, setDistrict] = useState([]);
  const [warn, setWarn] = useState([]);
  const [id, SetId] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [WarnDistrict, setSelectedWarnDistrict] = useState("");
  const [priceObj, setPriceObj] = useState({});
  const [Products, setProducts] = useState([]);
  const [Name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [CartId, setCartId] = useState("");
  const [productId, setProductId] = useState([]);
  const [voucher, setVoucher] = useState([]);
  const [contentVoucher, setContentvoucher] = useState("");
  const [idDiscount, setidDiscount] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [selectedVouCher, setSelectedVoucher] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(",", "."))
        : price;
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Các hàm xử lý địa chỉ (giữ nguyên)
  const DataProvine = async () => {
    try {
      let api = "https://esgoo.net/api-tinhthanh/1/0.htm";
      let res = await axios.get(api);
      if (res.data && res.data.data) {
        const dataProvines = res.data.data.map((data) => ({
          id: data.id,
          name: data.name,
        }));
        SetProvine(dataProvines);
      }
    } catch (error) {}
  };

  const DistrstData = async () => {
    try {
      let url = `https://esgoo.net/api-tinhthanh/2/${id}.htm`;
      let res = await axios.get(url);
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.id,
          name: item.full_name,
        }));
        setDistrict(data);
      }
    } catch (error) {}
  };

  const WarnData = async () => {
    try {
      let url = `https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`;
      let res = await axios.get(url);
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.id,
          name: item.full_name,
        }));
        setWarn(data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    DataProvine();
  }, []);

  useEffect(() => {
    DistrstData();
  }, [id]);

  useEffect(() => {
    WarnData();
  }, [selectedDistrict]);

  const handleProvinceChange = (value, name) => {
    SetId(value);
    setDistrict([]);
    setSelectedDistrict("");
    setSelectedWarnDistrict("");
    setCity(name.label);
    setWarn([]);
  };

  const handleDistrictChange = (value, name) => {
    setSelectedDistrict(value);
    setDistrictName(name.label);
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const data =
    ListCart && ListCart.items && ListCart.items.length > 0
      ? ListCart.items.map((item, index) => ({
          key: index + 1,
          id: item.productId._id,
          images: (
            <img
              src={item.productId.variants[0]?.images[0]?.url}
              alt="Product"
              style={{ width: "50px", height: "50px" }}
            />
          ),
          name: item.productId.name,
          color: item.color,
          quantity: item.quantity,
          size: item.size,
          price: formatPrice(item.price),
          totalItemPrice: item.totalItemPrice + "đ",
        }))
      : [];

  const handleSelectAll = () => {
    const allSelected = checkedItems.length === data?.length;
    if (allSelected) {
      setCheckedItems([]);
      setPriceObj({});
      setProductId([]);
      setCartId("");
    } else {
      data.forEach((product) => {
        const { id, name, size, quantity, color, totalItemPrice, images } =
          product;
        const imageUrl = images.props.src;
        const numericPrice =
          typeof totalItemPrice === "string"
            ? parseFloat(
                totalItemPrice.replace(/[^\d,.-]/g, "").replace(",", ".")
              )
            : totalItemPrice;
        const uniqueKey = `${id}-${size}-${color}`;

        setCartId(ListCart._id);
        setProductId((prev) => [...new Set([...prev, id])]);
        setProducts((prevState) => {
          const existingProductIndex = prevState.findIndex(
            (p) => p.id === id && p.size === size && p.color === color
          );
          if (existingProductIndex !== -1) {
            return prevState.map((p, index) =>
              index === existingProductIndex
                ? {
                    ...p,
                    name,
                    size,
                    quantity,
                    color,
                    price: numericPrice,
                    imageUrl,
                  }
                : p
            );
          }
          return [
            ...prevState,
            { id, name, quantity, size, color, price: numericPrice, imageUrl },
          ];
        });
        setPriceObj((prev) => ({ ...prev, [uniqueKey]: numericPrice }));
        setCheckedItems((prev) => [...new Set([...prev, uniqueKey])]);
      });
    }
  };

  const handleCheck = (
    id,
    name,
    size,
    quantity,
    color,
    price,
    images,
    itemID,
    productId
  ) => {
    const numericPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^\d,.-]/g, "").replace(",", "."))
        : price;
    const imageUrl = images.props.src;
    const uniqueKey = `${id}-${size}-${color}`;

    setProductId((prev) =>
      prev.includes(productId)
        ? prev.filter((item) => item !== productId)
        : [...prev, productId]
    );
    setCartId(itemID);
    setProducts((prevState) => {
      const existingProductIndex = prevState.findIndex(
        (p) => p.id === id && p.size === size && p.color === color
      );
      if (existingProductIndex !== -1) {
        return prevState.map((p, index) =>
          index === existingProductIndex
            ? {
                ...p,
                name,
                size,
                quantity,
                color,
                price: numericPrice,
                imageUrl,
              }
            : p
        );
      }
      return [
        ...prevState,
        { id, name, quantity, size, color, price: numericPrice, imageUrl },
      ];
    });
    setPriceObj((prev) => {
      const newPriceObj = { ...prev };
      if (newPriceObj[uniqueKey]) {
        delete newPriceObj[uniqueKey];
      } else {
        newPriceObj[uniqueKey] = numericPrice;
      }
      return newPriceObj;
    });
    setCheckedItems((prev) =>
      prev.includes(uniqueKey)
        ? prev.filter((item) => item !== uniqueKey)
        : [...prev, uniqueKey]
    );
  };

  // Hàm xử lý chọn/bỏ chọn voucher

  const handleVoucherChange = (discountValue, voucherId, content) => {
    console.log("Trước khi thay đổi:", { selectedVouCher, voucherId });
    if (selectedVouCher === voucherId) {
      // Bỏ chọn voucher
      setSelectedVoucher(null);
      setDiscountValue(0);
      setContentvoucher("");
      setidDiscount("");
    } else {
      // Chọn voucher mới
      setSelectedVoucher(voucherId);
      setDiscountValue(discountValue);
      setContentvoucher(content);
      setidDiscount(voucherId);
    }
  };

  // Debug state thay đổi

  const totalCheckedPrice = checkedItems.reduce(
    (total, itemId) => total + (priceObj[itemId] || 0),
    0
  );
  const discountAmount =
    discountValue > 0 ? (discountValue / 100) * totalCheckedPrice : 0;
  const finalPrice = totalCheckedPrice - discountAmount;

  const columns = [
    { title: "Hình Ảnh", dataIndex: "images", key: "images" },
    { title: "Tên Sản Phẩm", dataIndex: "name", key: "name" },
    { title: "Màu", dataIndex: "color", key: "color" },
    { title: "Số Lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Giá từng sản phẩm", dataIndex: "price", key: "price" },
    { title: "Tổng tiền", dataIndex: "totalItemPrice", key: "totalItemPrice" },
    {
      title: (
        <input
          type="checkbox"
          checked={
            data.length > 0 &&
            data.every((item) =>
              checkedItems.includes(`${item.id}-${item.size}-${item.color}`)
            )
          }
          onChange={handleSelectAll}
        />
      ),
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <input
          type="checkbox"
          checked={checkedItems.includes(
            `${record.id}-${record.size}-${record.color}`
          )}
          onChange={() =>
            handleCheck(
              record.id,
              record.name,
              record.size,
              record.quantity,
              record.color,
              record.totalItemPrice,
              record.images,
              ListCart._id,
              record.id
            )
          }
        />
      ),
    },
  ];

  const handleOrder = async () => {
    try {
      setLoadingSpin(true);
      const formattedItems = Products.map((item) => ({
        ...item,
        productId: item.id,
      }));
      if (
        !Name ||
        !email ||
        !number ||
        !fullAddress ||
        !district ||
        !wardName
      ) {
        notification.error({
          message: "Lỗi đặt hàng",
          description: "Vui lòng nhập đầy đủ thông tin trước khi đặt hàng.",
        });
        setLoadingSpin(false);
        return;
      }
      let res = await createOrder(
        user._id,
        Name,
        number,
        formattedItems,
        fullAddress,
        city,
        districtName,
        wardName,
        value,
        email,
        CartId,
        productId,
        discountValue,
        idDiscount
      );
      if (res && res.data.EC === 0) {
        await CartListProductsUser();
        setTimeout(() => {
          setLoadingSpin(false);
          api.open({
            message: "Đặt Hàng",
            description: "Chúc mừng quý khách đã đặt hàng thành công tại shop",
            icon: <SmileOutlined style={{ color: "#108ee9" }} />,
          });
          if (res.data.orderUrl) window.location.href = res.data.orderUrl;
          else if (res.data.vnpUrl) window.location.href = res.data.vnpUrl;
          else if (res.data.data.shortLink)
            window.location.href = res.data.data.payUrl;
        }, 3000);
      }
    } catch (error) {
      setLoadingSpin(false);
      console.error("Order creation failed:", error);
    }
  };

  const fetchApiVoucher = async () => {
    try {
      let res = await getVoucherAPI();
      if (res.data && res.data.EC === 0) {
        setVoucher(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApiVoucher();
  }, []);

  function formatMoney(amount) {
    return (amount / 1000).toLocaleString() + "k";
  }

  return (
    <div className="min-h-screen w-full mt-28">
      <div className="cart flex justify-between">
        <div className="w-1/2">
          <h1 className="text-3xl font-semibold">Thông tin đặt hàng</h1>
          <div className="mt-4 gap-4 flex items-center">
            <div className="w-2/3">
              <label className="text-sm">Họ và tên</label>
              <Input
                placeholder="Nhập họ và tên"
                onChange={(e) => setName(e.target.value)}
                value={Name}
                status={!Name && "error"}
              />
            </div>
            <div className="w-1/3">
              <label className="text-sm">Số điện thoại</label>
              <Input
                placeholder="Nhập số điện thoại"
                type="number"
                onChange={(e) => setNumber(e.target.value)}
                value={number}
                status={!number && "error"}
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="text-sm">Email</label>
            <Input
              placeholder="Nhập email của bạn"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              status={!email && "error"}
            />
          </div>
          <div className="mt-2">
            <label className="text-sm">Địa chỉ</label>
            <Input
              placeholder="Nhập địa chỉ của bạn"
              onChange={(e) => setFullAddress(e.target.value)}
              value={fullAddress}
              status={!fullAddress && "error"}
            />
            <div className="mt-2 flex gap-2">
              <Select
                placeholder="Chọn Tỉnh/Thành Phố"
                status={!id && "error"}
                value={id}
                style={{ flex: 1 }}
                options={[
                  { value: "", label: "Chọn Tỉnh/Thành Phố", disabled: true },
                  ...provine.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
                onChange={handleProvinceChange}
              />
              <Select
                placeholder="Chọn Quận/Huyện"
                style={{ flex: 1 }}
                value={selectedDistrict}
                status={!selectedDistrict && "error"}
                options={[
                  { value: "", label: "Chọn Quận/Huyện", disabled: true },
                  ...district.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })),
                ]}
                onChange={handleDistrictChange}
              />
              <Select
                placeholder="Chọn Phường/Xã"
                style={{ flex: 1 }}
                value={WarnDistrict}
                status={!WarnDistrict && "error"}
                options={[
                  { value: "", label: "Chọn Phường/Xã", disabled: true },
                  ...warn.map((item) => ({ value: item.id, label: item.name })),
                ]}
                onChange={(value, name) => {
                  setSelectedWarnDistrict(value);
                  setWardName(name.label);
                }}
              />
            </div>
          </div>
          <div className="mt-5">
            <h1 className="text-3xl font-semibold">Hình thức thanh toán</h1>
            <div className="mt-3">
              <Radio.Group onChange={onChange} value={value} className="w-full">
                <div className="h-50 pay">
                  <Radio value={"ZaloPay"}>
                    <div className="flex gap-3">
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip3_6.png"
                        alt="ZaloPay"
                        className="w-11 h-full"
                      />
                      <div>
                        <p className="font-bold text-sm">
                          Thanh toán qua ZaloPay
                        </p>
                        <span className="flex w-full gap-3 text-[#737373]">
                          Hỗ trợ mọi hình thức thanh toán
                          <img
                            src="https://mcdn.coolmate.me/image/October2024/mceclip0_27.png"
                            alt="Payment methods"
                            className="w-64"
                          />
                        </span>
                      </div>
                    </div>
                  </Radio>
                </div>
                <div className="h-50 pay">
                  <Radio value={"cod"}>
                    <div className="flex gap-3 items-center">
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                        alt="COD"
                        className="w-11 h-full"
                      />
                      <p className="font-bold text-sm">
                        Thanh toán khi nhận hàng
                      </p>
                    </div>
                  </Radio>
                </div>
                <div className="h-50 pay">
                  <Radio value={"momo"}>
                    <div className="flex gap-3 items-center">
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip1_171.png"
                        alt="MoMo"
                        className="w-11 h-full"
                      />
                      <p className="font-bold text-sm">Ví MoMo</p>
                    </div>
                  </Radio>
                </div>
                <div className="h-50 pay">
                  <Radio value={"vnpay"}>
                    <div className="flex gap-3">
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip0_81.png"
                        alt="VNPay"
                        className="w-11 h-full"
                      />
                      <div>
                        <p className="font-bold text-sm">Ví điện tử VNPAY</p>
                        <span className="flex w-full gap-3 text-[#737373]">
                          Quét QR để thanh toán
                        </span>
                      </div>
                    </div>
                  </Radio>
                </div>
              </Radio.Group>
            </div>
          </div>
        </div>
        {loadingSpin && (
          <div className="overlay1 fixed flex items-center justify-center">
            <ClipLoader />
          </div>
        )}
        <div className="w-1/2 h-full">
          <Table
            columns={columns}
            dataSource={data}
            size="middle"
            pagination={{
              total: data.length,
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              className: "pagination-custom",
            }}
          />
          <div className="voucher relative top-70 right-0 flex gap-2 overflow-x-auto whitespace-nowrap">
            {voucher &&
              voucher.length > 0 &&
              voucher.map((voucher, index) => (
                <label
                  key={index + 1}
                  className="flex items-center justify-between w-80 h-32 bg-[#f1f1f1] shrink-0 border border-gray-300 rounded-md px-3 cursor-pointer"
                  htmlFor={`voucher-${voucher._id}`}
                >
                  <div className="flex-1 py-5">
                    <span className="font-bold text-sm">{voucher.code}</span>
                    <i className="text-sm font-medium">
                      {" "}
                      (Còn {voucher.usageLimit})
                    </i>
                    <div>
                      <span className="whitespace-pre-wrap text-sm">
                        {voucher.content}
                      </span>
                    </div>
                    <div className="flex justify-between mt-4">
                      <span className="text-sm">
                        HSD: {moment(voucher.endDate).format("DD-MM-YYYY")}
                      </span>
                      <span className="text-sm">Điều kiện</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="voucher"
                    id={`voucher-${voucher._id}`}
                    className="w-5 h-5"
                    checked={selectedVouCher === voucher._id}
                    onClick={() =>
                      handleVoucherChange(
                        voucher.discountValue,
                        voucher._id,
                        voucher.content
                      )
                    }
                  />
                </label>
              ))}
          </div>

          <div className="voucher_item_price border-t-2">
            <div className=" voucher_item_price_1 flex justify-between items-center ">
              <span className="text-sm font-bold">Tạm tính</span>
              <div className="">
                <p className="text-right text-sm font-bold">
                  {checkedItems.length > 0
                    ? formatPrice(finalPrice)
                    : formatPrice(0)}{" "}
                </p>
                <i>
                  (tiết kiệm{" "}
                  <span className="text-[#2f5acf] text-sm">
                    {formatMoney(discountAmount)})
                  </span>
                </i>
              </div>
            </div>
            <div className="voucher_item_price_1 flex justify-between items-center">
              <span className="text-sm font-bold">Giảm giá</span>
              <span className="text-sm ">{formatPrice(discountAmount)}</span>
            </div>
            <div className="voucher_item_price_1 flex justify-between items-center border-b-2 py-3">
              <span className="text-sm font-bold">Phí giao hàng</span>
              <span className="text-sm ">Miễn phí</span>
            </div>
            <div className="voucher_item_price_1 flex justify-between items-center">
              <span className="text-sm font-bold">Tổng</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-right">
                  {" "}
                  {checkedItems.length > 0
                    ? formatPrice(finalPrice)
                    : formatPrice(0)}{" "}
                </span>{" "}
                <i className="block text-red-500 text-xs">
                  (Đã giảm 961.000đ trên giá gốc)
                </i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer w-full flex">
        <div className="flex flex-1 cart_1 justify-between items-center">
          <div className="flex items-center justify-center flex-1 border-r-2 border-r-[#333]">
            <span className="text-center">
              {(() => {
                switch (value) {
                  case "ZaloPay":
                    return (
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip3_6.png"
                        alt="ZaloPay"
                        className="w-11 h-full"
                      />
                    );
                  case "cod":
                    return (
                      <div className="flex gap-3 items-center">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                          alt="COD"
                          className="w-11 h-full"
                        />
                        <p className="font-bold text-sm text-[#2F5ACF]">
                          COD thanh toán khi nhận hàng
                        </p>
                      </div>
                    );
                  case "momo":
                    return (
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip1_171.png"
                        alt="MoMo"
                        className="w-11 h-full"
                      />
                    );
                  case "vnpay":
                    return (
                      <img
                        src="https://mcdn.coolmate.me/image/October2024/mceclip0_81.png"
                        alt="VNPay"
                        className="w-11 h-full"
                      />
                    );
                  default:
                    return "Chọn phương thức thanh toán";
                }
              })()}
            </span>
          </div>
          <div className="flex flex-1 justify-center w-full">
            <span className="text-center text-[#2F5ACF] font-bold">
              {discountValue > 0 ? contentVoucher : "Chưa dùng voucher"}
            </span>
          </div>
        </div>
        <div className="flex flex-1 cart_2 justify-center items-center gap-3">
          <div>
            <span>Thành tiền </span>

            <span className="text-xl text-[#2F5ACF] font-bold ml-2">
              {checkedItems.length > 0
                ? formatPrice(finalPrice)
                : formatPrice(0)}
            </span>
            {discountValue > 0 && (
              <div className="text-center">
                <span className="text-sm text-green-500">
                  Đã giảm: {formatPrice(discountAmount)}
                </span>
              </div>
            )}
          </div>
          <div>
            <Button
              type="dark"
              className="h-8 p-5 border-none bg-gray-800 text-[#fff] rounded-2xl hover:bg-gray-700 transition"
              onClick={handleOrder}
            >
              ĐẶT HÀNG
            </Button>
          </div>
        </div>
      </div>
      {contextHolder}
    </div>
  );
};

export default CartProducts;
