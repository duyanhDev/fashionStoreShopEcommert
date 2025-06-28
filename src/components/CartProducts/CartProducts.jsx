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
  console.log(user);

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
  const [Name, setName] = useState(user?.name || "");
  const [number, setNumber] = useState(Number(user?.phone) || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [CartId, setCartId] = useState("");
  const [productId, setProductId] = useState([]);
  const [voucher, setVoucher] = useState([]);
  const [contentVoucher, setContentvoucher] = useState("");
  const [idDiscount, setidDiscount] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [selectedVouCher, setSelectedVoucher] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [idItems, setidItems] = useState([]);

  const [ghnDistrictId, setGhnDistrictId] = useState("");
  const [ghnWardCode, setGhnWardCode] = useState("");
  const [ghnPickStationId, setGhnPickStationId] = useState(1442);

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/[^\d]/g, ""), 10)
        : price;
    if (!numericPrice) return "0đ";
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Các hàm xử lý địa chỉ (giữ nguyên)
  const DataProvine = async () => {
    try {
      let api =
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province";
      let res = await axios.get(api, {
        headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
      });
      if (res.data && res.data.data) {
        const dataProvines = res.data.data.map((data) => ({
          id: data.ProvinceID,
          name: data.ProvinceName,
        }));
        SetProvine(dataProvines);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const DistrstData = async () => {
    try {
      let url = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${id}`;
      let res = await axios.get(url, {
        headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
      });
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.DistrictID,
          name: item.DistrictName,
        }));
        setDistrict(data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const WarnData = async () => {
    try {
      let url = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${selectedDistrict}`;
      let res = await axios.get(url, {
        headers: { Token: "6501032d-0b70-11ef-b1d4-92b443b7a897" },
      });
      if (res.data && res.data.data) {
        const data = res.data.data.map((item) => ({
          id: item.WardCode,
          name: item.WardName,
        }));
        setWarn(data);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
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

  useEffect(() => {
    if (
      ListCart &&
      ListCart.items &&
      ListCart.items.length > 0 &&
      !isInitialized
    ) {
      // Tự động chọn tất cả sản phẩm
      const newCheckedItems = [];
      const newPriceObj = {};
      const newProductId = [];
      const newItemsId = [];
      const newProducts = [];

      ListCart.items.forEach((item) => {
        const { productId, name, size, quantity, color, totalItemPrice, _id } =
          item;
        const id = productId._id;
        console.log("check id items", _id);

        const imageUrl = productId.variants[0]?.images[0]?.url;
        const numericPrice =
          typeof totalItemPrice === "string"
            ? parseInt(totalItemPrice.replace(/[^\d]/g, ""), 10)
            : totalItemPrice;
        const uniqueKey = `${id}-${size}-${color}`;

        newCheckedItems.push(uniqueKey);
        newPriceObj[uniqueKey] = numericPrice;
        if (!newProductId.includes(id)) newProductId.push(id);
        if (!newItemsId.includes(_id)) newItemsId.push(_id);
        newProducts.push({
          id,
          name: productId.name,
          quantity,
          size,
          color,
          price: numericPrice,
          imageUrl,
          _id,
        });
      });

      setCartId(ListCart._id);
      setCheckedItems(newCheckedItems);
      setPriceObj(newPriceObj);
      setProductId(newProductId);
      setidItems(newItemsId);
      setProducts(newProducts);
      setIsInitialized(true); // Đánh dấu đã khởi tạo
    }
  }, [ListCart, isInitialized]);

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
    setGhnDistrictId(value);
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
              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
            />
          ),
          name: item.productId.name,
          color: item.color,
          quantity: item.quantity,
          size: item.size,
          price: formatPrice(item.price),
          totalItemPrice: formatPrice(item.totalItemPrice),
          _id: item._id,
        }))
      : [];
  const handleSelectAll = () => {
    const allSelected = checkedItems.length === data?.length;

    if (allSelected) {
      // Bỏ chọn tất cả
      setCheckedItems([]);
      setPriceObj({});
      setProductId([]);
      setProducts([]);
    } else {
      // Chọn tất cả
      const newCheckedItems = [];
      const newPriceObj = {};
      const newProducts = [];

      data.forEach((product) => {
        const { id, name, size, quantity, color, totalItemPrice, images, _id } =
          product;

        const imageUrl = images.props.src;
        const numericPrice =
          typeof totalItemPrice === "string"
            ? parseInt(totalItemPrice.replace(/[^\d]/g, ""), 10)
            : totalItemPrice;
        const uniqueKey = `${id}-${size}-${color}`;

        newCheckedItems.push(uniqueKey);
        newPriceObj[uniqueKey] = numericPrice;
        newProducts.push({
          id,
          name,
          quantity,
          size,
          color,
          price: numericPrice,
          imageUrl,
          _id,
        });
      });

      // Tính lại productId từ danh sách sản phẩm đã chọn
      const updatedProductId = [...new Set(newProducts.map((p) => p.id))];
      const updatedItemCartId = [...new Set(newProducts.map((p) => p._id))];
      console.log(updatedItemCartId);
      setCartId(ListCart._id);
      setCheckedItems(newCheckedItems);
      setPriceObj(newPriceObj);
      setProducts(newProducts);
      setProductId(updatedProductId);
      setidItems(updatedItemCartId);
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
    _id
  ) => {
    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/[^\d]/g, ""), 10)
        : price;
    const imageUrl = images.props.src;
    const uniqueKey = `${id}-${size}-${color}`;

    setCartId(itemID);

    setCheckedItems((prev) => {
      const isChecked = prev.includes(uniqueKey);

      setProducts((prevProducts) => {
        const updatedProducts = isChecked
          ? prevProducts.filter(
              (p) => `${p.id}-${p.size}-${p.color}` !== uniqueKey
            )
          : [
              ...prevProducts,
              {
                id,
                name,
                quantity,
                size,
                color,
                price: numericPrice,
                imageUrl,
                _id,
              },
            ];

        const updatedProductId = [...new Set(updatedProducts.map((p) => p.id))];
        const updatedItemCartId = [
          ...new Set(updatedProducts.map((p) => p._id)),
        ];

        setProductId(updatedProductId);
        setidItems(updatedItemCartId);

        return updatedProducts;
      });

      return isChecked
        ? prev.filter((item) => item !== uniqueKey)
        : [...prev, uniqueKey];
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
  };

  const handleVoucherChange = (discountValue, voucherId, content) => {
    if (selectedVouCher === voucherId) {
      setSelectedVoucher(null);
      setDiscountValue(0);
      setContentvoucher("");
      setidDiscount("");
    } else {
      setSelectedVoucher(voucherId);
      setDiscountValue(discountValue);
      setContentvoucher(content);
      setidDiscount(voucherId);
    }
  };

  const totalCheckedPrice = checkedItems.reduce(
    (total, itemId) => total + (priceObj[itemId] || 0),
    0
  );
  const discountAmount =
    discountValue > 0 ? (discountValue / 100) * totalCheckedPrice : 0;
  const finalPrice = Math.round(totalCheckedPrice - discountAmount);

  // Mobile columns - simplified
  const mobileColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-start gap-3">
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
                record._id
              )
            }
            className="mt-1"
          />
          {record.images}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{record.name}</div>
            <div className="text-xs text-gray-500">
              {record.color} • Size {record.size}
            </div>
            <div className="text-xs text-gray-500">SL: {record.quantity}</div>
            <div className="font-medium text-sm text-blue-600">
              {record.totalItemPrice}
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Desktop columns
  const desktopColumns = [
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
    if (Products.length === 0) {
      notification.error({
        message: "Lỗi đặt hàng",
        description: "Vui lòng chọn ít nhất một sản phẩm để đặt hàng.",
      });
      return;
    }
    try {
      setLoadingSpin(true);

      const formattedItems = Products.map((item) => ({
        ...item,
        productId: item.id,
      }));

      const allProductIdsInCart = [...new Set(data.map((item) => item.id))];

      const filteredProductIds = allProductIdsInCart.filter((id) => {
        const hasSelected = Products.some((p) => p.id === id);
        return hasSelected;
      });

      console.log("Products gửi GHN:", formattedItems);
      console.log("ID sản phẩm cần gửi backend:", filteredProductIds);

      if (
        !Name ||
        !email ||
        !number ||
        !fullAddress ||
        !districtName ||
        !wardName
      ) {
        notification.error({
          message: "Lỗi đặt hàng",
          description: "Vui lòng nhập đầy đủ thông tin trước khi đặt hàng.",
        });
        setLoadingSpin(false);
        return;
      }

      const ghnOrderData = {
        payment_type_id: value === "cod" ? 2 : 1,
        note: "Đơn hàng từ website",
        required_note: "CHOXEMHANGKHONGTHU",
        from_name: "ShopDior",
        from_phone: "0373081693",
        from_address:
          "123 Đường ABC, Phường Phú Lợi, Thành phố Thủ Dầu Một, Bình Dương",
        from_ward_name: "Phường Phú Lợi",
        from_district_name: "Thành phố Thủ Dầu Một",
        from_province_name: "Bình Dương",
        return_phone: "0373081693",
        return_address:
          "123 Đường ABC, Phường Phú Lợi, Thành phố Thủ Dầu Một, Bình Dương",
        return_district_id: 1538,
        return_ward_code: "440109",
        client_order_code: `DH${Date.now()}`,
        to_name: Name,
        to_phone: number,
        to_address: fullAddress,
        to_ward_code: String(ghnWardCode),
        to_district_id: ghnDistrictId,
        cod_amount: finalPrice,
        content: "Sản phẩm mua online",
        weight: 1000,
        length: 10,
        width: 10,
        height: 10,
        pick_station_id: ghnPickStationId,
        service_id: 0,
        service_type_id: 2,
        items: Products.map((item) => ({
          name: item.name || "Sản phẩm",
          code: item.id || `PROD${Date.now()}`,
          quantity: item.quantity || 1,
          price: item.price || finalPrice / Products.length,
          length: item.length || 10,
          width: item.width || 10,
          height: item.height || 10,
          weight: item.weight || 1000,
          category: { level1: "Sản phẩm" },
        })),
      };

      const ghnResponse = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        ghnOrderData,
        {
          headers: {
            Token: "6501032d-0b70-11ef-b1d4-92b443b7a897",
            ShopId: "192215",
            "Content-Type": "application/json",
          },
        }
      );

      if (ghnResponse.data && ghnResponse.data.code === 200) {
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
          filteredProductIds,
          discountValue,
          idDiscount,
          ghnResponse.data.data.order_code,
          idItems
        );

        if (res && res.data.EC === 0) {
          await CartListProductsUser();
          setTimeout(() => {
            setLoadingSpin(false);
            api.open({
              message: "Đặt Hàng",
              description:
                "Chúc mừng quý khách đã đặt hàng thành công tại shop",
              icon: <SmileOutlined style={{ color: "#108ee9" }} />,
            });
            if (res.data.orderUrl) window.location.href = res.data.orderUrl;
            else if (res.data.vnpUrl) window.location.href = res.data.vnpUrl;
            else if (res.data.data.shortLink)
              window.location.href = res.data.data.payUrl;
          }, 3000);
        } else {
          notification.error({
            message: "Lỗi",
            description: res.data.EM || "Tạo đơn hàng trong hệ thống thất bại.",
          });
          setLoadingSpin(false);
        }
      } else {
        notification.error({
          message: "Lỗi GHN",
          description:
            ghnResponse.data.message ||
            "Đặt hàng qua GHN thất bại. Kiểm tra mã địa lý.",
        });
        setLoadingSpin(false);
      }
    } catch (error) {
      setLoadingSpin(false);
      console.error(
        "Order creation failed:",
        error.response?.data || error.message
      );
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng.",
      });
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
    <div className="min-h-screen w-full mt-16 md:mt-28 pb-32 md:pb-24">
      <div className="cart-container px-4 md:px-8 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
              Thông tin đặt hàng
            </h1>

            {/* Name and Phone */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Họ và tên</label>
                <Input
                  placeholder="Nhập họ và tên"
                  onChange={(e) => setName(e.target.value)}
                  value={Name}
                  status={!Name && "error"}
                  size="large"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Số điện thoại</label>
                <Input
                  placeholder="Nhập số điện thoại"
                  type="number"
                  onChange={(e) => setNumber(e.target.value)}
                  value={number}
                  status={!number && "error"}
                  size="large"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Email</label>
              <Input
                placeholder="Nhập email của bạn"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                status={!email && "error"}
                size="large"
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Địa chỉ</label>
              <Input
                placeholder="Nhập địa chỉ của bạn"
                onChange={(e) => setFullAddress(e.target.value)}
                value={fullAddress}
                status={!fullAddress && "error"}
                size="large"
              />

              {/* Location Selects */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Select
                  placeholder="Chọn Tỉnh/Thành Phố"
                  status={!id && "error"}
                  value={id}
                  style={{ flex: 1 }}
                  size="large"
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
                  size="large"
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
                  size="large"
                  options={[
                    { value: "", label: "Chọn Phường/Xã", disabled: true },
                    ...warn.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                  onChange={(value, name) => {
                    setSelectedWarnDistrict(value);
                    setWardName(name.label);
                    setGhnWardCode(value);
                  }}
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-semibold mb-4">
                Hình thức thanh toán
              </h1>
              <Radio.Group onChange={onChange} value={value} className="w-full">
                <div className="space-y-3">
                  <div className="payment-option">
                    <Radio value={"ZaloPay"}>
                      <div className="flex gap-3 items-start">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip3_6.png"
                          alt="ZaloPay"
                          className="w-8 h-8 md:w-11 md:h-11 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm">
                            Thanh toán qua ZaloPay
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-500 text-xs">
                            <span>Hỗ trợ mọi hình thức thanh toán</span>
                            <img
                              src="https://mcdn.coolmate.me/image/October2024/mceclip0_27.png"
                              alt="Payment methods"
                              className="w-32 sm:w-64"
                            />
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="payment-option">
                    <Radio value={"cod"}>
                      <div className="flex gap-3 items-center">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                          alt="COD"
                          className="w-8 h-8 md:w-11 md:h-11"
                        />
                        <p className="font-bold text-sm">
                          Thanh toán khi nhận hàng
                        </p>
                      </div>
                    </Radio>
                  </div>

                  <div className="payment-option">
                    <Radio value={"momo"}>
                      <div className="flex gap-3 items-center">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip1_171.png"
                          alt="MoMo"
                          className="w-8 h-8 md:w-11 md:h-11"
                        />
                        <p className="font-bold text-sm">Ví MoMo</p>
                      </div>
                    </Radio>
                  </div>

                  <div className="payment-option">
                    <Radio value={"vnpay"}>
                      <div className="flex gap-3 items-start">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip0_81.png"
                          alt="VNPay"
                          className="w-8 h-8 md:w-11 md:h-11 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-sm">Ví điện tử VNPAY</p>
                          <span className="text-gray-500 text-xs">
                            Quét QR để thanh toán
                          </span>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </div>
              </Radio.Group>
            </div>
          </div>

          {/* Cart Items Section */}
          <div className="w-full lg:w-1/2">
            {/* Products Table */}
            <div className="mb-6">
              <div className="block md:hidden">
                <Table
                  columns={mobileColumns}
                  dataSource={data}
                  size="small"
                  pagination={{
                    total: data.length,
                    pageSize: 5,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    className: "pagination-custom",
                  }}
                  scroll={{ x: false }}
                />
              </div>
              <div className="hidden md:block">
                <Table
                  columns={desktopColumns}
                  dataSource={data}
                  size="middle"
                  pagination={{
                    total: data.length,
                    pageSize: 5,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    className: "pagination-custom",
                  }}
                  scroll={{ x: 800 }}
                />
              </div>
            </div>

            {/* Vouchers */}
            <div className="voucher-section mb-6">
              <h3 className="text-lg font-semibold mb-3">Mã giảm giá</h3>
              <div className="voucher-container">
                {voucher &&
                  voucher.length > 0 &&
                  voucher.map((voucher, index) => (
                    <label
                      key={index + 1}
                      className="voucher-item"
                      htmlFor={`voucher-${voucher._id}`}
                    >
                      <div className="voucher-content">
                        <div className="voucher-header">
                          <span className="font-bold text-sm">
                            {voucher.code}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            (Còn {voucher.usageLimit})
                          </span>
                        </div>
                        <div className="voucher-description">
                          <span className="text-sm">{voucher.content}</span>
                        </div>
                        <div className="voucher-footer">
                          <span className="text-xs text-gray-500">
                            HSD: {moment(voucher.endDate).format("DD-MM-YYYY")}
                          </span>
                          <span className="text-xs text-blue-600">
                            Điều kiện
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="voucher"
                        id={`voucher-${voucher._id}`}
                        className="voucher-radio"
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
            </div>

            {/* Price Summary */}
            <div className="price-summary">
              <div className="price-row">
                <span className="text-sm font-bold">Tạm tính</span>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {checkedItems.length > 0
                      ? formatPrice(finalPrice)
                      : formatPrice(0)}
                  </p>
                  <i className="text-xs text-gray-500">
                    (tiết kiệm{" "}
                    <span className="text-blue-600">
                      {formatMoney(discountAmount)})
                    </span>
                  </i>
                </div>
              </div>

              <div className="price-row">
                <span className="text-sm font-bold">Giảm giá</span>
                <span className="text-sm">{formatPrice(discountAmount)}</span>
              </div>

              <div className="price-row border-b border-gray-200 pb-3">
                <span className="text-sm font-bold">Phí giao hàng</span>
                <span className="text-sm">Miễn phí</span>
              </div>

              <div className="price-row pt-3">
                <span className="text-sm font-bold">Tổng</span>
                <div className="text-right">
                  <span className="text-sm font-bold">
                    {checkedItems.length > 0
                      ? formatPrice(finalPrice)
                      : formatPrice(0)}
                  </span>
                  <i className="block text-red-500 text-xs mt-1">
                    (Đã giảm 961.000đ trên giá gốc)
                  </i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loadingSpin && (
        <div className="overlay1 fixed flex items-center justify-center">
          <ClipLoader />
        </div>
      )}

      {/* Footer */}
      <div className="footer-checkout">
        <div className="footer-content">
          <div className="footer-payment">
            <div className="payment-display">
              {(() => {
                switch (value) {
                  case "ZaloPay":
                    return (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip3_6.png"
                          alt="ZaloPay"
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                          ZaloPay
                        </span>
                      </div>
                    );
                  case "cod":
                    return (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                          alt="COD"
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                          COD
                        </span>
                      </div>
                    );
                  case "momo":
                    return (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip1_171.png"
                          alt="MoMo"
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                          MoMo
                        </span>
                      </div>
                    );
                  case "vnpay":
                    return (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip0_81.png"
                          alt="VNPay"
                          className="w-8 h-8"
                        />
                        <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                          VNPay
                        </span>
                      </div>
                    );
                  default:
                    return (
                      <span className="text-sm text-gray-500">
                        Chọn phương thức
                      </span>
                    );
                }
              })()}
            </div>

            <div className="voucher-display">
              <span className="text-center text-blue-600 font-medium text-sm">
                {discountValue > 0 ? contentVoucher : "Chưa dùng voucher"}
              </span>
            </div>
          </div>

          <div className="footer-total">
            <div className="total-section">
              <div className="total-text">
                <span className="text-sm">Thành tiền</span>
                <span className="text-lg md:text-xl text-blue-600 font-bold ml-2">
                  {checkedItems.length > 0
                    ? formatPrice(finalPrice)
                    : formatPrice(0)}
                </span>
              </div>
              {discountValue > 0 && (
                <div className="discount-info">
                  <span className="text-xs text-green-500">
                    Đã giảm: {formatPrice(discountAmount)}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="primary"
              className="order-button"
              onClick={handleOrder}
              size="large"
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
