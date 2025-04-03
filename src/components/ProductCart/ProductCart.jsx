import { Modal } from "antd";
import { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined, HeartOutlined } from "@ant-design/icons";

const ProductCart = ({
  modalCartOpen,
  setModalCartOpen,
  IdProduct,
  listItems,
  price,
  costPrice,
}) => {
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

  console.log("filterProducts:", filterProducts); // Debug

  return (
    <Modal
      centered
      open={modalCartOpen}
      onCancel={() => {
        setModalCartOpen(false);
        setColor(getDefaultColor(listItems));
        setSelectedImage(0);
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
          <h2 className="text-xl font-semibold mt-2">
            ÁO KHOÁC DÙ UNISEX - TOTODAY
          </h2>
          <p className="text-yellow-500">⭐ 5/5 | SKU: U1AKD06401FBYBA</p>

          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xl font-bold">
              {formatPrice(costPrice)}
            </span>
            <span className="text-gray-400 line-through">
              {formatPrice(price)}
            </span>
            <span className="text-green-600">-19%</span>
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
                    }`}
                    disabled={sizeItem.quantity <= 0} // Vô hiệu hóa nếu hết hàng
                    onClick={() => console.log("xx")}
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
              <button className="px-3 py-1">-</button>
              <span className="px-4">1</span>
              <button className="px-3 py-1">+</button>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="bg-green-500 text-white px-6 py-2 rounded font-semibold">
              MUA NGAY
            </button>
            <button className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">
              THÊM GIỎ HÀNG
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductCart;
