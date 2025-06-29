import { Modal, notification } from "antd";
import { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined, HeartOutlined } from "@ant-design/icons";
import "./Style.css";
import { AddCartAPI } from "../../service/Cart";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
const ProductCart = ({
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
  const { CartListProductsUser, ListCart } = useOutletContext();
  const [count, setCount] = useState(1);

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

  const images =
    listItems &&
    listItems.length > 0 &&
    listItems.filter((item) => item.color === color);
  const imageUrl =
    images && images.length > 0 && images[selectedImage]?.images[0]?.url
      ? images[selectedImage]?.images[0]?.url
      : "";

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const fiterColor =
    listItems && listItems.length > 0 && listItems.filter((item) => item.color);

  const filterSize =
    fiterColor &&
    fiterColor.length > 0 &&
    fiterColor.filter((item) => item.color === color);

  const filterProducts =
    filterSize && filterSize.length > 0
      ? filterSize.flatMap((item) => item.sizes)
      : [];

  const plusCount = () => {
    setCount((prve) => prve + 1);
  };

  const minusCount = () => {
    if (count > 1) {
      setCount((prve) => prve - 1);
    }
  };

  const handleChangeCount = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCount(value);
    } else if (e.target.value === "") {
      setCount(""); // Cho phép xóa để nhập lại
    }
  };
  const handleOnClickSize = (size) => {
    setSize((prev) => (prev === size ? "" : size));
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
                className="img_cart"
                alt="lỗi"
              />
              <div>
                <h1 className="whitespace-nowrap">{productname}</h1>
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
        description: "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
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
            <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow">
              <HeartOutlined />
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

          <div className="mt-3">
            <p className="font-semibold">Màu sắc</p>
            <div className="flex gap-2">
              {fiterColor &&
                fiterColor.length > 0 &&
                fiterColor.map((item, index) => {
                  const colorMap = {
                    đen: "#000",
                    trắng: "#fff",
                    đỏ: "red",
                    xanh: "green",
                    be: "beige",
                  };
                  const displayColor = colorMap[item.color] || item.color;

                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 border rounded cursor-pointer flex items-center justify-center ${
                        item.color === "đen"
                          ? "border-white"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: displayColor,
                        boxShadow:
                          item.color === "đen"
                            ? "0px 0px 2px 2px rgba(255,255,255,0.5)"
                            : "",
                      }}
                      onClick={() => setColor(item.color)}
                    >
                      {item.color === "trắng" && (
                        <div className="w-4 h-4 rounded"></div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-3">
            <p className="font-semibold">Kích cỡ</p>
            <div className="flex gap-2">
              {filterProducts && filterProducts.length > 0 ? (
                filterProducts.map((sizeItem, idx) => (
                  <button
                    key={idx}
                    className={`border px-4 py-1 rounded cursor-pointer ${
                      sizeItem.quantity <= 0
                        ? "bg-gray-200 text-gray-500"
                        : "bg-white"
                    } ${Size === sizeItem.size && "active_bg"} `}
                    disabled={sizeItem.quantity <= 0} // Vô hiệu hóa nếu hết hàng
                    onClick={() => handleOnClickSize(sizeItem.size)}
                  >
                    {sizeItem.size}
                    <span className="ml-2">({sizeItem.quantity})</span>
                  </button>
                ))
              ) : (
                <p>Không có kích cỡ nào</p>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="font-semibold">Số lượng</p>
            <div className="flex items-center border rounded w-24">
              <button className="px-3 py-1" onClick={minusCount}>
                -
              </button>
              <input
                type="number"
                className="w-full text-center outline-none"
                value={count}
                onChange={(e) => handleChangeCount(e)}
                min={1} // hoặc giá trị tối thiểu bạn muốn
              />
              <button className="px-3 py-1" onClick={plusCount}>
                +
              </button>
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
              className="bg-gray-500 text-white px-6 py-2 rounded font-semibold"
              onClick={handleAddProduct}
            >
              THÊM GIỎ HÀNG
            </button>
          </div>
        </div>
        {contextHolder}
      </div>
    </Modal>
  );
};

export default ProductCart;
