import { Modal, notification } from "antd";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { LeftOutlined, RightOutlined, HeartOutlined } from "@ant-design/icons";
import "./Style.css";
import { AddCartAPI } from "../../service/Cart";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Check, Minus, Plus } from "lucide-react";
const ProductCart = memo(
  ({
    modalCartOpen,
    setModalCartOpen,
    IdProduct,
    listItems,
    price,
    costPrice,
    productname,
    discount,
  }) => {
    const { user } = useSelector((state) => state.auth);
    const [Size, setSize] = useState("");
    const { CartListProductsUser } = useOutletContext();
    const [count, setCount] = useState(1);
    const [sumProducts, setSumProducts] = useState(0);

    const navigate = useNavigate();

    const [api, contextHolder] = notification.useNotification();
    const getDefaultColor = (items) => {
      if (!items || items.length === 0) return "đen";
      const hasBlack = items.some((item) => item.color === "đen");
      return hasBlack ? "đen" : items[0].color;
    };

    const [selectedImage, setSelectedImage] = useState(0);
    const [color, setColor] = useState(() => getDefaultColor(listItems));

    useEffect(() => {
      setColor(getDefaultColor(listItems));
    }, [listItems]);

    // ✅ memo hóa giá trị giá tiền
    const finalPrice = useMemo(() => {
      if (costPrice) {
        return costPrice * count;
      } else {
        return price * count;
      }
    }, [costPrice, price, count]);

    const images =
      listItems &&
      listItems.length > 0 &&
      listItems.filter((item) => item.color === color);
    const imageUrl =
      images && images.length > 0 && images[selectedImage]?.images[0]?.url
        ? images[selectedImage]?.images[0]?.url
        : "";

    const nextImage = useCallback(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    });

    const prevImage = () => {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    };

    const formatPrice = (price) => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    };

    const fiterColor =
      listItems &&
      listItems.length > 0 &&
      listItems.filter((item) => item.color);

    const filterSize =
      fiterColor &&
      fiterColor.length > 0 &&
      fiterColor.filter((item) => item.color === color);

    const filterProducts =
      filterSize && filterSize.length > 0
        ? filterSize.flatMap((item) => item.sizes)
        : [];

    const plusCount = () => {
      if (sumProducts > count) {
        setCount((prve) => prve + 1);
      }
    };

    const minusCount = () => {
      if (count > 1 && count <= sumProducts) {
        setCount((prve) => prve - 1);
      }
    };

    const handleChangeCount = useCallback(
      (e) => {
        const value = e.target.value;
        if (value === "") {
          setCount(""); // cho phép xóa tạm
        } else {
          const num = parseInt(value);
          if (num >= 1 && num <= sumProducts) {
            setCount(num);
          } else if (num > sumProducts) {
            setCount(sumProducts);
          } else {
            setCount(1);
          }
        }
      },
      [sumProducts]
    );

    const handleOnClickSize = (size, quantity) => {
      setSize((prev) => (prev === size ? "" : size));
      setSumProducts(quantity);
    };

    const handleAddProduct = async () => {
      if (!user) {
        api.open({
          message: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
          duration: 3,
          type: "warning",
        });
        return false;
      }

      if (!Size || !color) {
        api.open({
          message: "Lỗi",
          description:
            "Vui lòng chọn kích thước và màu sắc trước khi thêm vào giỏ hàng.",
          duration: 3,
          type: "warning",
        });
        return false;
      }

      try {
        const res = await AddCartAPI(
          user._id,
          IdProduct,
          count,
          Size,
          color,
          costPrice
        );

        if (res && res.data && res.data.cart) {
          api.open({
            message: "Đã thêm vào giỏ hàng",
            description: (
              <div className="flex gap-2 p-2">
                <img
                  src={images[0]?.images[0]?.url}
                  className="img_cart w-32 h-32"
                  alt="lỗi"
                />
                <div>
                  <h1 className="whitespace-pre-wrap">{productname}</h1>
                  <h1>{`${color} / ${Size}`}</h1>
                  <h1>{`${costPrice} / ${price}`}</h1>
                </div>
              </div>
            ),
            duration: 15,
          });
          setSize("");
          CartListProductsUser();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error adding product to cart:", error);
        api.open({
          message: "Lỗi",
          description:
            "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
          duration: 3,
          type: "error",
        });
        return false;
      }
    };

    const handleOrder = async () => {
      const isSuccess = await handleAddProduct();
      if (isSuccess) {
        navigate("/cart");
      }
    };

    return (
      <Modal
        centered
        open={modalCartOpen}
        onCancel={() => {
          setModalCartOpen(false);
          setColor(getDefaultColor(listItems));
          setSelectedImage(0);
          setCount(1);
        }}
        footer={null}
        width={1200}
        style={{ minHeight: 500 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Image Section */}
          <div className="w-full md:w-2/5">
            <div className="relative">
              <img
                src={imageUrl}
                alt="product"
                className="w-full rounded-md cursor-pointer"
                onClick={nextImage}
              />
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 p-2 rounded-full"
              >
                <LeftOutlined />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 p-2 rounded-full"
              >
                <RightOutlined />
              </button>
            </div>
            <div className="flex mt-2 gap-2">
              {images &&
                images.length > 0 &&
                images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.images[0]?.url}
                    alt="thumb"
                    className={`w-16 h-16 cursor-pointer border ${
                      selectedImage === idx
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full md:w-3/5">
            <span className="bg-orange-200 text-orange-700 text-xs px-2 py-1 rounded">
              #Bán chạy
            </span>
            <h2 className="text-xl font-semibold mt-2">{productname}</h2>
            <p className="text-yellow-500">⭐ 5/5 | SKU: {IdProduct}</p>

            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl font-bold">
                {formatPrice(costPrice)}
              </span>
              <span className="text-gray-400 line-through">
                {formatPrice(price)}
              </span>
              <span className="text-green-600">-{discount}%</span>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Màu sắc</h3>
              <div className="flex gap-3">
                {fiterColor &&
                  fiterColor.map((item, index) => {
                    const colorMap = {
                      đen: "#000000",
                      trắng: "#ffffff",
                      đỏ: "#ef4444",
                      xanh: "#10b981",
                      be: "#d4a574",
                    };
                    const displayColor = colorMap[item.color] || item.color;
                    const isSelected = color === item.color;

                    return (
                      <div
                        key={index}
                        className={`relative w-12 h-12 rounded-xl cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: displayColor,
                          border:
                            item.color === "trắng"
                              ? "2px solid #e5e7eb"
                              : "2px solid transparent",
                        }}
                        onClick={() => setColor(item.color)}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check
                              className={`w-5 h-5 ${
                                item.color === "trắng"
                                  ? "text-gray-700"
                                  : "text-white"
                              }`}
                            />
                          </div>
                        )}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                          {item.color}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3 pt-8">
              <h3 className="text-lg font-semibold text-gray-900">Kích cỡ</h3>
              <div className="grid grid-cols-4 gap-3">
                {filterProducts && filterProducts.length > 0 ? (
                  filterProducts.map((sizeItem, idx) => {
                    const isOutOfStock = sizeItem.quantity <= 0;
                    const isSelected = Size === sizeItem.size;

                    return (
                      <button
                        key={idx}
                        className={`relative p-1 rounded-xl border-2 font-medium transition-all duration-300 ${
                          isOutOfStock
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                        disabled={isOutOfStock}
                        onClick={() =>
                          handleOnClickSize(sizeItem.size, sizeItem.quantity)
                        }
                      >
                        <div className="text-center">
                          <div className="font-semibold">{sizeItem.size}</div>
                          <div className="text-xs mt-1">
                            {isOutOfStock
                              ? "Hết hàng"
                              : `Còn ${sizeItem.quantity}`}
                          </div>
                        </div>
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-4 text-gray-500 text-center py-4">
                    Không có kích cỡ nào
                  </p>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
                  <button
                    className="p-3 hover:bg-gray-100 transition-colors rounded-l-xl"
                    onClick={minusCount}
                    disabled={count <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    className="w-16 text-center outline-none font-semibold"
                    value={count}
                    onChange={handleChangeCount}
                    min={1}
                  />
                  <button
                    className="p-3 hover:bg-gray-100 transition-colors rounded-r-xl"
                    onClick={plusCount}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600">sản phẩm</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold"
                onClick={() => handleOrder()}
              >
                MUA NGAY
              </button>
              <button
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold"
                onClick={handleAddProduct}
              >
                THÊM GIỎ HÀNG
              </button>
              <button
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold"
                disabled
              >
                TỔNG TIỀN : {formatPrice(finalPrice)}
              </button>
            </div>
          </div>
          {contextHolder}
        </div>
      </Modal>
    );
  }
);
export default ProductCart;
