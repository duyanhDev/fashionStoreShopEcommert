import { Modal, notification } from "antd";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Style.css";
import { AddCartAPI } from "../../service/Cart";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";

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

    const [selectedImage, setSelectedImage] = useState(0);

    const getDefaultColor = useCallback((items) => {
      if (!items || items.length === 0) return "đen";
      const hasBlack = items.some((item) => item.color === "đen");
      return hasBlack ? "đen" : items[0].color;
    }, []);

    const [color, setColor] = useState(() => getDefaultColor(listItems));
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
      setColor(getDefaultColor(listItems));
    }, [listItems, getDefaultColor]);

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
    }, [images]);

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
        setCount((prev) => prev + 1);
      }
    };

    const minusCount = () => {
      if (count > 1 && count <= sumProducts) {
        setCount((prev) => prev - 1);
      }
    };

    const handleChangeCount = useCallback(
      (e) => {
        const value = e.target.value;
        if (value === "") {
          setCount("");
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

    const handleAddProduct = useCallback(async () => {
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
                  className="img_cart w-20 sm:w-32 h-20 sm:h-32 object-cover rounded-lg"
                  alt="lỗi"
                />
                <div>
                  <h1 className="whitespace-pre-wrap font-semibold text-sm sm:text-base">
                    {productname}
                  </h1>
                  <h1 className="text-gray-600 text-xs sm:text-sm">{`${color} / ${Size}`}</h1>
                  <h1 className="text-red-500 font-bold text-sm sm:text-base">
                    {formatPrice(costPrice)}
                  </h1>
                </div>
              </div>
            ),
            duration: 15,
          });
          await CartListProductsUser();
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
    }, [
      user,
      Size,
      color,
      IdProduct,
      count,
      costPrice,
      images,
      productname,
      api,
      CartListProductsUser,
    ]);

    const handleOrder = useCallback(async () => {
      const isSuccess = await handleAddProduct();
      if (isSuccess) {
        navigate("/cart");
      }
    }, [handleAddProduct, navigate]);

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
        width="95%"
        style={{ maxWidth: "900px" }}
        closeIcon={
          <div style={{ marginRight: "8px" }} className="sm:mr-4">
            <CloseOutlined className="text-gray-500 hover:text-gray-700 text-base sm:text-lg" />
          </div>
        }
        styles={{
          body: {
            padding: "12px",
            maxHeight: "85vh",
            overflowY: "auto",
            marginTop: "30px",
          },
        }}
        className="product-cart-modal"
      >
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-2 sm:p-4">
          {/* Left: Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-gray-100">
                <img
                  src={imageUrl}
                  alt="product"
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={nextImage}
                />
              </div>

              {images && images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                  >
                    <LeftOutlined className="text-gray-700 text-xs sm:text-sm" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                  >
                    <RightOutlined className="text-gray-700 text-xs sm:text-sm" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/60 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {selectedImage + 1} / {images?.length || 0}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex mt-3 sm:mt-4 gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {images &&
                images.length > 0 &&
                images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-md sm:rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImage === idx
                        ? "ring-2 sm:ring-3 ring-green-500 ring-offset-1 sm:ring-offset-2 scale-105"
                        : "ring-1 ring-gray-200 hover:ring-gray-300"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img
                      src={img.images[0]?.url}
                      alt="thumb"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Header */}
            <div className="space-y-2 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                  🔥 BÁN CHẠY
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  ⭐ 5.0
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {productname}
              </h2>

              <p className="text-xs text-gray-500">SKU: {IdProduct}</p>
            </div>

            {/* Price Section */}
            <div className="py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  {formatPrice(costPrice)}
                </span>
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  -{discount}%
                </span>
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">
                💰 Tiết kiệm {formatPrice(price - costPrice)}
              </p>
            </div>

            {/* Color Selection */}
            <div className="py-3 sm:py-4 space-y-2 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Màu sắc
              </h3>
              <div className="flex gap-2 flex-wrap">
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
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "ring-2 sm:ring-3 ring-green-500 ring-offset-1 sm:ring-offset-2 scale-110 shadow-lg"
                              : "ring-1 sm:ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105"
                          }`}
                          style={{
                            backgroundColor: displayColor,
                          }}
                          onClick={() => setColor(item.color)}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  item.color === "trắng"
                                    ? "text-gray-700"
                                    : "text-white"
                                } drop-shadow-lg`}
                              />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium capitalize ${
                            isSelected
                              ? "text-green-600 font-bold"
                              : "text-gray-600"
                          }`}
                        >
                          {item.color}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="py-3 sm:py-4 space-y-2 sm:space-y-3 border-t border-gray-200">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Kích cỡ
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filterProducts && filterProducts.length > 0 ? (
                  filterProducts.map((sizeItem, idx) => {
                    const isOutOfStock = sizeItem.quantity <= 0;
                    const isSelected = Size === sizeItem.size;

                    return (
                      <button
                        key={idx}
                        className={`relative px-2 sm:px-3 py-2 rounded-md sm:rounded-lg border-2 font-semibold transition-all duration-300 ${
                          isOutOfStock
                            ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-green-500 text-white border-green-500 shadow-lg scale-105"
                            : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:scale-105"
                        }`}
                        disabled={isOutOfStock}
                        onClick={() =>
                          handleOnClickSize(sizeItem.size, sizeItem.quantity)
                        }
                      >
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold">
                            {sizeItem.size}
                          </div>
                          <div className="text-xs mt-0.5 font-normal">
                            {isOutOfStock
                              ? "Hết hàng"
                              : `Còn ${sizeItem.quantity}`}
                          </div>
                        </div>
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-300 rotate-45"></div>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-3 sm:col-span-4 text-gray-500 text-center py-6 sm:py-8 bg-gray-50 rounded-lg sm:rounded-xl text-sm">
                    Không có kích cỡ nào
                  </p>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="py-3 sm:py-4 space-y-2 sm:space-y-3 border-t border-gray-200">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Số lượng
              </h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white shadow-sm">
                  <button
                    className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={minusCount}
                    disabled={count <= 1}
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                  </button>
                  <input
                    type="number"
                    className="w-12 sm:w-16 text-center outline-none font-bold text-sm sm:text-base text-gray-900"
                    value={count}
                    onChange={handleChangeCount}
                    min={1}
                  />
                  <button
                    className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={plusCount}
                    disabled={!sumProducts || count >= sumProducts}
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  {sumProducts > 0 && `(Tối đa: ${sumProducts})`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-3 sm:pt-4 space-y-2 sm:space-y-2.5 border-t-2 border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2.5 sm:p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Tổng tiền:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-green-600">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  onClick={handleOrder}
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  MUA NGAY
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  onClick={handleAddProduct}
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  THÊM VÀO GIỎ
                </button>
              </div>
            </div>
          </div>
          {contextHolder}
        </div>
      </Modal>
    );
  }
);

export default ProductCart;
