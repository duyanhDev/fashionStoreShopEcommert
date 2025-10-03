import { useCallback, useEffect } from "react";
import axios from "./../../untils/axios";
import "./Cart.css";
import {
  Input,
  Select,
  Radio,
  Button,
  Table,
  notification,
  Modal,
  message,
  Card,
  Divider,
  Badge,
  Space,
  Typography,
  Checkbox,
} from "antd";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createOrder } from "../../service/Oder";
import {
  SmileOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  TruckOutlined,
  TagOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import ClipLoader from "react-spinners/ClipLoader";
import { getVoucherAPI } from "../../service/APIVoucher.js";
import moment from "moment";
import { debounce } from "lodash";
import socket from "../../socket";
import { UpdateCartQuantity } from "../../service/Cart.js";

const { Title, Text } = Typography;

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
  const [Name, setName] = useState(user?.name || "");
  const [number, setNumber] = useState(user?.phone || "");
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
  const [discountType, setDiscountType] = useState("");

  const [ghnDistrictId, setGhnDistrictId] = useState("");
  const [ghnWardCode, setGhnWardCode] = useState("");
  const [ghnPickStationId, setGhnPickStationId] = useState(1442);
  const [isCheckSepay, setIsCheckSepay] = useState(false);
  const [qrnUrl, setQrnUrl] = useState("");
  const [orderId, setOrderId] = useState(null);

  const [inputValue, setInputValue] = useState({});
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/[^\d]/g, ""), 10)
        : price;
    if (!numericPrice) return "0đ";
    return numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Giữ nguyên tất cả các hàm xử lý địa chỉ
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
      const newCheckedItems = [];
      const newPriceObj = {};
      const newProductId = [];
      const newItemsId = [];
      const newProducts = [];

      ListCart.items.forEach((item) => {
        const { productId, name, size, quantity, color, totalItemPrice, _id } =
          item;
        const id = productId._id;

        const imageUrl =
          productId.variants.find((product) => product.color === color)
            ?.images[0]?.url || "";

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
      setIsInitialized(true);
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

  const handleMinus = (cartId, currentQuantity) => {
    if (currentQuantity <= 1) return;

    const newQuantity = currentQuantity - 1;
    setInputValue((prev) => ({ ...prev, [cartId]: newQuantity }));

    const cartItem = ListCart.items.find((item) => item._id === cartId);
    if (!cartItem) return;

    const numericPrice =
      typeof cartItem.totalItemPrice === "string"
        ? parseInt(cartItem.totalItemPrice.replace(/[^\d]/g, ""), 10) /
          cartItem.quantity
        : cartItem.totalItemPrice / cartItem.quantity;

    const uniqueKey = `${cartItem.productId._id}-${cartItem.size}-${cartItem.color}`;

    // Cập nhật giá
    setPriceObj((prev) => ({
      ...prev,
      [uniqueKey]: numericPrice * newQuantity,
    }));

    // Cập nhật số lượng trong Products array
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === cartId
          ? {
              ...product,
              quantity: newQuantity,
              price: numericPrice * newQuantity,
            }
          : product
      )
    );

    debouncedUpdate(cartId, newQuantity);
  };

  const handlePlus = (cartId, currentQuantity) => {
    const cartItem = ListCart.items.find((item) => item._id === cartId);
    if (!cartItem) return;

    const variant = cartItem.productId.variants.find(
      (v) => v.color === cartItem.color
    );
    const sizeObj = variant?.sizes.find((s) => s.size === cartItem.size);
    const maxQuantity = sizeObj?.quantity || Infinity;

    const newQuantity = currentQuantity + 1;
    const finalQuantity = Math.min(newQuantity, maxQuantity);

    if (newQuantity > maxQuantity) {
      message.warning(`Số lượng tối đa là ${maxQuantity}!`);
    }

    setInputValue((prev) => ({ ...prev, [cartId]: finalQuantity }));

    const numericPrice =
      typeof cartItem.totalItemPrice === "string"
        ? parseInt(cartItem.totalItemPrice.replace(/[^\d]/g, ""), 10) /
          cartItem.quantity
        : cartItem.totalItemPrice / cartItem.quantity;

    const uniqueKey = `${cartItem.productId._id}-${cartItem.size}-${cartItem.color}`;

    // Cập nhật giá
    setPriceObj((prev) => ({
      ...prev,
      [uniqueKey]: numericPrice * finalQuantity,
    }));

    // Cập nhật số lượng trong Products array
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === cartId
          ? {
              ...product,
              quantity: finalQuantity,
              price: numericPrice * finalQuantity,
            }
          : product
      )
    );

    debouncedUpdate(cartId, finalQuantity);
  };

  const handleInputChange = (cartId, value) => {
    if (value === "" || /^[0-9]*$/.test(value)) {
      setInputValue((prev) => ({ ...prev, [cartId]: value }));
    }

    if (value === "") return;

    const quantity = parseInt(value);
    const cartItem = ListCart.items.find((item) => item._id === cartId);
    const variant = cartItem.productId.variants.find(
      (v) => v.color === cartItem.color
    );
    const sizeObj = variant?.sizes.find((s) => s.size === cartItem.size);
    const maxQuantity = sizeObj?.quantity || Infinity;

    if (quantity === 0) {
      handleRemoveCartProduct(cartId);
      return;
    }

    const finalQuantity = Math.min(quantity, maxQuantity);

    if (quantity > maxQuantity) {
      message.warning(`Số lượng tối đa là ${maxQuantity}!`);
      setInputValue((prev) => ({ ...prev, [cartId]: maxQuantity }));
    }

    const numericPrice =
      typeof cartItem.totalItemPrice === "string"
        ? parseInt(cartItem.totalItemPrice.replace(/[^\d]/g, ""), 10) /
          cartItem.quantity
        : cartItem.totalItemPrice / cartItem.quantity;

    setPriceObj((prev) => ({
      ...prev,
      [`${cartItem.productId._id}-${cartItem.size}-${cartItem.color}`]:
        numericPrice * finalQuantity,
    }));

    debouncedUpdate(cartId, finalQuantity);
  };

  const handleBlur = (cartId, value) => {
    if (value === "" || isNaN(value)) {
      const currentQuantity =
        ListCart.items.find((item) => item._id === cartId)?.quantity || 1;
      setInputValue((prev) => ({ ...prev, [cartId]: currentQuantity }));

      // Cập nhật lại Products array về số lượng gốc
      const cartItem = ListCart.items.find((item) => item._id === cartId);
      if (cartItem) {
        const numericPrice =
          typeof cartItem.totalItemPrice === "string"
            ? parseInt(cartItem.totalItemPrice.replace(/[^\d]/g, ""), 10) /
              cartItem.quantity
            : cartItem.totalItemPrice / cartItem.quantity;

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === cartId
              ? {
                  ...product,
                  quantity: currentQuantity,
                  price: numericPrice * currentQuantity,
                }
              : product
          )
        );
      }

      debouncedUpdate(cartId, currentQuantity);
    }
  };

  const handleUpdateQuantity = useCallback(
    async (cartId, newQuantity) => {
      try {
        const quantityToUpdate =
          newQuantity === "" || isNaN(newQuantity) ? 1 : newQuantity;
        const res = await UpdateCartQuantity(
          ListCart?._id,
          cartId,
          user?._id,
          quantityToUpdate
        );
        if (res.data && res.data.EC === 0) {
          CartListProductsUser();
          setInputValue((prev) => ({ ...prev, [cartId]: quantityToUpdate }));
        } else {
          throw new Error(res.data?.message || "Update failed");
        }
      } catch (error) {
        setLoadingSpin(false);
        console.error("Error updating quantity:", error);
        message.error("Không thể cập nhật số lượng. Vui lòng thử lại!");
        setInputValue((prev) => ({
          ...prev,
          [cartId]:
            ListCart.items.find((item) => item._id === cartId)?.quantity || 1,
        }));
      }
    },
    [ListCart, user?._id, CartListProductsUser]
  );

  const debouncedUpdate = useCallback(
    debounce(handleUpdateQuantity, 100, { leading: false, trailing: true }),
    [handleUpdateQuantity]
  );

  const handleSelectAll = () => {
    const data = ListCart && ListCart.items ? ListCart.items : [];
    const allSelected = checkedItems.length === data?.length;

    if (allSelected) {
      setCheckedItems([]);
      setPriceObj({});
      setProductId([]);
      setProducts([]);
    } else {
      const newCheckedItems = [];
      const newPriceObj = {};
      const newProducts = [];

      data.forEach((item) => {
        const { productId, size, quantity, color, totalItemPrice, _id } = item;
        const id = productId._id;
        const name = productId.name;

        const imageUrl =
          productId.variants.find((variant) => variant.color === color)
            ?.images[0]?.url || "";
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

      const updatedProductId = [...new Set(newProducts.map((p) => p.id))];
      const updatedItemCartId = [...new Set(newProducts.map((p) => p._id))];

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
    imageUrl,
    itemID,
    _id
  ) => {
    const numericPrice =
      typeof price === "string"
        ? parseInt(price.replace(/[^\d]/g, ""), 10)
        : price;
    const uniqueKey = `${id}-${size}-${color}`;

    setCartId(itemID);

    const isCurrentlyChecked = checkedItems.includes(uniqueKey);

    if (isCurrentlyChecked) {
      // Bỏ chọn sản phẩm
      setCheckedItems((prev) => prev.filter((item) => item !== uniqueKey));

      setPriceObj((prev) => {
        const newPriceObj = { ...prev };
        delete newPriceObj[uniqueKey];
        return newPriceObj;
      });

      setProducts((prevProducts) =>
        prevProducts.filter((p) => `${p.id}-${p.size}-${p.color}` !== uniqueKey)
      );
    } else {
      // Chọn sản phẩm
      setCheckedItems((prev) => [...prev, uniqueKey]);

      setPriceObj((prev) => ({
        ...prev,
        [uniqueKey]: numericPrice,
      }));

      setProducts((prevProducts) => [
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
      ]);
    }

    // Cập nhật productId và itemId sau khi thay đổi Products
    setTimeout(() => {
      setProducts((currentProducts) => {
        const updatedProductId = [...new Set(currentProducts.map((p) => p.id))];
        const updatedItemCartId = [
          ...new Set(currentProducts.map((p) => p._id)),
        ];

        setProductId(updatedProductId);
        setidItems(updatedItemCartId);

        return currentProducts;
      });
    }, 0);
  };

  const handleVoucherChange = (
    discountValue,
    voucherId,
    content,
    discountType
  ) => {
    if (selectedVouCher === voucherId) {
      setSelectedVoucher(null);
      setDiscountValue(0);
      setContentvoucher("");
      setidDiscount("");
      setDiscountType("");
    } else {
      setSelectedVoucher(voucherId);
      setDiscountValue(discountValue);
      setContentvoucher(content);
      setidDiscount(voucherId);
      setDiscountType(discountType);
    }
  };

  const totalCheckedPrice = checkedItems.reduce(
    (total, itemId) => total + (priceObj[itemId] || 0),
    0
  );
  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = (discountValue / 100) * totalCheckedPrice;
  } else if (discountType === "fixed") {
    discountAmount = discountValue; // trừ thẳng số tiền
  }

  const finalPrice = Math.round(totalCheckedPrice - discountAmount);
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

      const data = ListCart && ListCart.items ? ListCart.items : [];
      const allProductIdsInCart = [
        ...new Set(data.map((item) => item.productId._id)),
      ];

      const filteredProductIds = allProductIdsInCart.filter((id) => {
        const hasSelected = Products.some((p) => p.id === id);
        return hasSelected;
      });

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

      // dữ liệu gửi GHN
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

      // gọi API GHN
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
        // chạy song song: tạo order + load lại cart
        const [res] = await Promise.all([
          createOrder(
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
            idItems,
            discountType
          ),
          CartListProductsUser(),
        ]);

        setLoadingSpin(false);

        if (res && res.data.EC === 0) {
          // xử lý redirect tuỳ phương thức thanh toán
          if (res.data.paymentMethod === "cod") {
            navigate(`/vnpay_return/${res.data.order_id}`);
          }

          if (res.data.orderUrl) {
            api.open({
              message: "Đặt Hàng",
              description:
                "Chúc mừng quý khách đã đặt hàng thành công tại shop",
              icon: <SmileOutlined style={{ color: "#108ee9" }} />,
            });
            window.location.href = res.data.orderUrl;
          } else if (res.data.vnpUrl) {
            api.open({
              message: "Đặt Hàng",
              description:
                "Chúc mừng quý khách đã đặt hàng thành công tại shop",
              icon: <SmileOutlined style={{ color: "#108ee9" }} />,
            });
            window.location.href = res.data.vnpUrl;
          } else if (res.data.qrCodeUrl) {
            setIsCheckSepay(true);
            setQrnUrl(res.data.qrCodeUrl);
            setOrderId(res.data.orderId);
          } else if (res.data.data?.shortLink) {
            window.location.href = res.data.data.payUrl;
          }
        } else {
          notification.error({
            message: "Lỗi",
            description:
              res?.data.EM || "Tạo đơn hàng trong hệ thống thất bại.",
          });
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

  useEffect(() => {
    if (!orderId) return;

    socket.emit("joinRoom", orderId);

    const handleOrderPaid = (data) => {
      if (data.orderId === orderId && data.status === "paid") {
        setIsCheckSepay(false);
        api.open({
          message: "Đặt Hàng",
          description: "Chúc mừng quý khách đã đặt hàng thành công tại shop",
          icon: <SmileOutlined style={{ color: "#108ee9" }} />,
        });
        navigate(`/vnpay_return/${orderId}`);
      }
    };

    socket.on("orderPaid", handleOrderPaid);

    return () => {
      socket.off("orderPaid", handleOrderPaid);
    };
  }, [orderId]);

  const availableVouchers = voucher?.filter(
    (v) => !v.appliedUsers.some((u) => u.user === user._id)
  );

  const data =
    ListCart && ListCart.items && ListCart.items.length > 0
      ? ListCart.items
      : [];

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <ShoppingCartOutlined className="text-2xl text-blue-600" />
            <Title level={2} className="!mb-0 !text-gray-800">
              Giỏ hàng của bạn
            </Title>
            <Badge count={data.length} showZero className="ml-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product List & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card className="shadow-sm border-0 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Title level={4} className="!mb-0">
                    Sản phẩm ({data.length})
                  </Title>
                </div>
                <Checkbox
                  checked={
                    data.length > 0 &&
                    data.every((item) =>
                      checkedItems.includes(
                        `${item.productId._id}-${item.size}-${item.color}`
                      )
                    )
                  }
                  onChange={handleSelectAll}
                >
                  Chọn tất cả
                </Checkbox>
              </div>

              <div className="space-y-4">
                {data.map((item, index) => {
                  const uniqueKey = `${item.productId._id}-${item.size}-${item.color}`;
                  const isChecked = checkedItems.includes(uniqueKey);
                  const imageUrl =
                    item.productId.variants.find(
                      (variant) => variant.color === item.color
                    )?.images[0]?.url || "";

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isChecked
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isChecked}
                          onChange={() =>
                            handleCheck(
                              item.productId._id,
                              item.productId.name,
                              item.size,
                              inputValue[item._id] !== undefined
                                ? inputValue[item._id]
                                : item.quantity,
                              item.color,
                              item.totalItemPrice,
                              imageUrl,
                              ListCart._id,
                              item._id
                            )
                          }
                        />

                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Title
                            level={5}
                            className="!mb-1 !text-gray-800 truncate"
                          >
                            {item.productId.name}
                          </Title>
                          <div className="flex items-center gap-3 mb-3">
                            <Text className="text-sm text-gray-500">
                              Màu:{" "}
                              <span className="font-medium">{item.color}</span>
                            </Text>
                            <Text className="text-sm text-gray-500">
                              Size:{" "}
                              <span className="font-medium">{item.size}</span>
                            </Text>
                          </div>

                          <div className="block lg:flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() =>
                                  handleMinus(item._id, item.quantity)
                                }
                                disabled={loadingSpin || item.quantity <= 1}
                                className="rounded-lg border-gray-300"
                              />
                              <Input
                                value={
                                  inputValue[item._id] !== undefined
                                    ? inputValue[item._id]
                                    : item.quantity
                                }
                                onChange={(e) =>
                                  handleInputChange(item._id, e.target.value)
                                }
                                onBlur={(e) =>
                                  handleBlur(item._id, e.target.value)
                                }
                                className="w-16 text-center rounded-lg"
                                size="small"
                              />
                              <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                  handlePlus(item._id, item.quantity)
                                }
                                disabled={loadingSpin}
                                className="rounded-lg border-gray-300"
                              />
                            </div>

                            <div className="text-right">
                              <Text className="text-sm text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </Text>
                              <div className="text-lg font-bold text-red-600">
                                {formatPrice(item.totalItemPrice)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-sm border-0 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <HomeOutlined className="text-xl text-blue-600" />
                <Title level={4} className="!mb-0">
                  Thông tin giao hàng
                </Title>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <HomeOutlined className="mr-2" />
                    Họ và tên *
                  </label>
                  <Input
                    placeholder="Nhập họ và tên"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    status={!Name ? "error" : ""}
                    size="large"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneOutlined className="mr-2" />
                    Số điện thoại *
                  </label>
                  <Input
                    placeholder="Nhập số điện thoại"
                    value={number}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        setNumber(value);
                      }
                    }}
                    status={number.length !== 10 ? "error" : ""} // bắt buộc phải đủ 10 số
                    size="large"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MailOutlined className="mr-2" />
                  Email *
                </label>
                <Input
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  status={!email ? "error" : ""}
                  size="large"
                  className="rounded-xl"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvironmentOutlined className="mr-2" />
                  Địa chỉ chi tiết *
                </label>
                <Input
                  placeholder="Số nhà, tên đường..."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  status={!fullAddress ? "error" : ""}
                  size="large"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <Select
                    placeholder="Chọn tỉnh/thành"
                    value={id}
                    onChange={handleProvinceChange}
                    status={!id ? "error" : ""}
                    size="large"
                    className="w-full rounded-xl"
                    options={[
                      {
                        value: "",
                        label: "Chọn Tỉnh/Thành Phố",
                        disabled: true,
                      },
                      ...provine.map((item) => ({
                        value: item.id,
                        label: item.name,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <Select
                    placeholder="Chọn quận/huyện"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    status={!selectedDistrict ? "error" : ""}
                    size="large"
                    className="w-full rounded-xl"
                    options={[
                      { value: "", label: "Chọn Quận/Huyện", disabled: true },
                      ...district.map((item) => ({
                        value: item.id,
                        label: item.name,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã *
                  </label>
                  <Select
                    placeholder="Chọn phường/xã"
                    value={WarnDistrict}
                    onChange={(value, name) => {
                      setSelectedWarnDistrict(value);
                      setWardName(name.label);
                      setGhnWardCode(value);
                    }}
                    status={!WarnDistrict ? "error" : ""}
                    size="large"
                    className="w-full rounded-xl"
                    options={[
                      { value: "", label: "Chọn Phường/Xã", disabled: true },
                      ...warn.map((item) => ({
                        value: item.id,
                        label: item.name,
                      })),
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="shadow-sm border-0 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardOutlined className="text-xl text-blue-600" />
                <Title level={4} className="!mb-0">
                  Phương thức thanh toán
                </Title>
              </div>

              <Radio.Group onChange={onChange} value={value} className="w-full">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <Radio value="ZaloPay">
                      <div className="flex items-center gap-4 ml-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip3_6.png"
                          alt="ZaloPay"
                          className="w-12 h-12"
                        />
                        <div>
                          <Text className="font-semibold">
                            Thanh toán qua ZaloPay
                          </Text>
                          <div className="text-xs text-gray-500 mt-1">
                            Hỗ trợ mọi hình thức thanh toán
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <Radio value="cod">
                      <div className="flex items-center gap-4 ml-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                          alt="COD"
                          className="w-12 h-12"
                        />
                        <div>
                          <Text className="font-semibold">
                            Thanh toán khi nhận hàng
                          </Text>
                          <div className="text-xs text-gray-500 mt-1">
                            Thanh toán bằng tiền mặt
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <Radio value="momo">
                      <div className="flex items-center gap-4 ml-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip1_171.png"
                          alt="MoMo"
                          className="w-12 h-12"
                        />
                        <div>
                          <Text className="font-semibold">Ví MoMo</Text>
                          <div className="text-xs text-gray-500 mt-1">
                            Thanh toán qua ví điện tử MoMo
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <Radio value="sepay">
                      <div className="flex items-center gap-4 ml-2">
                        <img
                          src="https://sepay.vn//assets/img/logo/sepay-blue-154x50.png"
                          alt="Sepay"
                          className="w-12 h-12"
                        />
                        <div>
                          <Text className="font-semibold">Ví Sepay</Text>
                          <div className="text-xs text-gray-500 mt-1">
                            Thanh toán qua ví Sepay
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <Radio value="vnpay">
                      <div className="flex items-center gap-4 ml-2">
                        <img
                          src="https://mcdn.coolmate.me/image/October2024/mceclip0_81.png"
                          alt="VNPay"
                          className="w-12 h-12"
                        />
                        <div>
                          <Text className="font-semibold">
                            Ví điện tử VNPAY
                          </Text>
                          <div className="text-xs text-gray-500 mt-1">
                            Quét QR để thanh toán
                          </div>
                        </div>
                      </div>
                    </Radio>
                  </div>
                </div>
              </Radio.Group>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Vouchers */}
            <Card className="shadow-sm border-0 rounded-2xl sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <TagOutlined className="text-xl text-orange-600" />
                <Title level={4} className="!mb-0">
                  Mã giảm giá
                </Title>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableVouchers && availableVouchers.length > 0 ? (
                  availableVouchers.map((voucher, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedVouCher === voucher._id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                      onClick={() =>
                        handleVoucherChange(
                          voucher.discountValue,
                          voucher._id,
                          voucher.content,
                          voucher.discountType
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                          <GiftOutlined className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-gray-800">
                            {voucher.code}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {voucher.content}
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">
                              Còn {voucher.usageLimit} lượt
                            </span>
                            <span className="text-orange-600 font-medium">
                              HSD:{" "}
                              {moment(voucher.endDate).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                        {selectedVouCher === voucher._id && (
                          <CheckCircleOutlined className="text-orange-500 text-lg" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GiftOutlined className="text-4xl mb-3" />
                    <div>Hiện tại không có mã giảm giá khả dụng</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="shadow-sm border-0 rounded-2xl sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <TruckOutlined className="text-xl text-green-600" />
                <Title level={4} className="!mb-0">
                  Tổng đơn hàng
                </Title>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <Text>Tạm tính ({checkedItems.length} sản phẩm)</Text>
                  <Text className="font-semibold">
                    {formatPrice(totalCheckedPrice)}
                  </Text>
                </div>

                <div className="flex justify-between items-center py-2">
                  <Text>Giảm giá</Text>
                  <Text className="font-semibold text-green-600">
                    -{formatPrice(discountAmount)}
                  </Text>
                </div>

                <div className="flex justify-between items-center py-2">
                  <Text>Phí vận chuyển</Text>
                  <Text className="font-semibold">
                    {finalPrice > 290000 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(35000)
                    )}
                  </Text>
                </div>

                <Divider className="!my-4" />

                <div className="flex justify-between items-center py-2">
                  <Title level={4} className="!mb-0">
                    Tổng cộng
                  </Title>
                  <Title level={4} className="!mb-0 !text-red-600">
                    {formatPrice(
                      finalPrice > 290000 ? finalPrice : finalPrice + 35000
                    )}
                  </Title>
                </div>

                {discountValue > 0 && (
                  <div className="text-center text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                    Bạn đã tiết kiệm được {formatPrice(discountAmount)}
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleOrder}
                  className="h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700"
                  loading={loadingSpin}
                  disabled={checkedItems.length === 0}
                >
                  Đặt hàng ngay
                </Button>

                <div className="text-center text-xs text-gray-500 mt-3">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link
                    to="/dieu-khoan-va-chinh-sach-bao-mat-thong-tin-ca-nhan"
                    className="text-blue-600 hover:underline"
                  >
                    Điều khoản sử dụng
                  </Link>{" "}
                  của chúng tôi
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loadingSpin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <ClipLoader size={50} color="#3B82F6" />
            <div className="mt-4 text-lg font-semibold text-gray-700">
              Đang xử lý đơn hàng...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Vui lòng không thoát khỏi trang
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <CreditCardOutlined className="text-blue-600" />
            <span>Quét mã QR để thanh toán</span>
          </div>
        }
        open={isCheckSepay}
        onCancel={() => setIsCheckSepay(false)}
        footer={null}
        centered
        className="qr-modal"
      >
        <div className="text-center py-4">
          <img src={qrnUrl} alt="QR Code" className="w-64 h-64 mx-auto mb-4" />
          <div className="text-gray-600">
            Sử dụng ứng dụng ngân hàng để quét mã QR
          </div>
        </div>
      </Modal>

      {contextHolder}
    </div>
  );
};

export default CartProducts;
