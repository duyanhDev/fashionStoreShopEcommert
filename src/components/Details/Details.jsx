"use client";

import "./Details.css";
import { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Rate, Button, Flex, notification, Image, Avatar } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  ListOneProductAPI,
  ListSlugProductAPI,
  toggleLikeRatingAPI,
} from "../../service/ApiProduct";
import { AddCartAPI } from "../../service/Cart";
import { useSelector } from "react-redux";
import moment from "moment";
import ReactPaginate from "react-paginate";

const Details = () => {
  const [api, contextHolder] = notification.useNotification();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDisscount] = useState("");
  const [pricediscount, setPricedisscount] = useState("");
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [stock, setStock] = useState("");
  const [image, setImage] = useState([]);
  const [sizeCart, SetSizeCart] = useState("");
  const [colorCart, SetcolorCart] = useState("");
  const { CartListProductsUser } = useOutletContext();
  const [checked, setChecked] = useState(false);
  const param = useParams();
  const [SelectedColor, setSelectedColor] = useState("");
  const [SelectedSize, setSelectedSize] = useState("");
  const [CheckSelectedSize, setCheckSelectedSize] = useState(false);
  const [feedback, setFeedBack] = useState([]);
  const [variants, setVariants] = useState([]);
  const ratings = 5;
  const [review, setReivew] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [sumProducts, setSumProducts] = useState(0);
  const [quantityProduct, SetquantityProduct] = useState(0);
  const [count, setCount] = useState(1);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);

  const navigagte = useNavigate();

  const pageCount = Math.ceil(feedback.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentFeedback = feedback
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleIncrment = () => {
    setCount(count + 1);
  };

  const handleDecrements = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const FetchAPIDetaillProuduct = async () => {
    try {
      const res = await ListSlugProductAPI(param.slug);

      if (res && res.data && res.data.EC === 0) {
        const ImagesUrl =
          res.data.data.variants &&
          res.data.data.variants.length > 0 &&
          res.data.data.variants.map((item) => item.images);
        const Color =
          res.data.data.variants &&
          res.data.data.variants.length > 0 &&
          res.data.data.variants.map((item) => item.color);
        const SizeMap =
          res.data.data.variants &&
          res.data.data.variants.length > 0 &&
          res.data.data.variants.map((item) => item.sizes);
        setId(res.data.data._id || "");
        setName(res.data.data.name || "");
        setDescription(res.data.data.description);
        setBrand(res.data.data.brand || "");
        setPrice(res.data.data.price || "");
        setDisscount(res.data.data.discount || "");
        setPricedisscount(res.data.data.discountedPrice || "");
        setStock(res.data.data.stock || "");
        setFeedBack(res.data.data.ratings || []);
        setSumProducts(res.data.data.sold || 0);
        setVariants(res.data.data.variants || []);
        setImage(ImagesUrl || []);
        setColor(Color || []);
        setSize(SizeMap || []);
        SetcolorCart(res.data.data.variants[0]?.color || "");
        setSelectedColor(res.data.data.variants[0]?.color || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    FetchAPIDetaillProuduct();
  }, [param.slug]);

  useEffect(() => {
    if (variants.length > 0 && !SelectedColor) {
      setSelectedColor(variants[0].color);
    }
  }, [variants]);

  const total = pricediscount ? count * pricediscount : count * price;

  const handleSize = (item, quantity) => {
    setSelectedSize(item);
    setCheckSelectedSize(true);
    SetSizeCart(item);
    SetquantityProduct(quantity);
  };

  // Thêm state mới

  // Tạo danh sách tất cả ảnh từ tất cả variants
  const allImages = variants.reduce((acc, variant) => {
    return [
      ...acc,
      ...variant.images.map((img) => ({ ...img, color: variant.color })),
    ];
  }, []);

  // Tìm index của ảnh đầu tiên của màu được chọn trong danh sách tất cả ảnh
  const getFirstImageIndexOfColor = (color) => {
    return allImages.findIndex((img) => img.color === color);
  };

  // Cập nhật handleColor function
  const handleColor = useCallback(
    (item) => {
      setChecked(true);
      setSelectedColor(item);
      SetcolorCart(item);

      // Tìm index của ảnh đầu tiên của màu được chọn
      const firstImageIndex = getFirstImageIndexOfColor(item);
      if (firstImageIndex !== -1) {
        setActiveThumbIndex(firstImageIndex);

        // Reset Swiper với delay để đảm bảo DOM đã cập nhật
        setTimeout(() => {
          if (mainSwiper) {
            mainSwiper.slideTo(firstImageIndex, 300);
            mainSwiper.update();
          }
          if (thumbsSwiper) {
            thumbsSwiper.slideTo(firstImageIndex, 300);
            thumbsSwiper.update();
          }
        }, 100);
      }
    },
    [mainSwiper, thumbsSwiper, allImages]
  );

  // Thêm handler cho thumbnail click
  const handleThumbnailClick = useCallback(
    (index) => {
      setActiveThumbIndex(index);
      if (mainSwiper) {
        mainSwiper.slideTo(index);
      }

      // Cập nhật màu được chọn dựa trên ảnh được click
      const clickedImage = allImages[index];
      if (clickedImage && clickedImage.color !== SelectedColor) {
        setSelectedColor(clickedImage.color);
        SetcolorCart(clickedImage.color);
        setChecked(true);
      }
    },
    [mainSwiper, allImages, SelectedColor]
  );

  // Cập nhật main swiper để sync với thumbnail
  const handleSlideChange = useCallback(
    (swiper) => {
      setActiveThumbIndex(swiper.activeIndex);

      // Cập nhật màu được chọn dựa trên slide hiện tại
      const currentImage = allImages[swiper.activeIndex];
      if (currentImage && currentImage.color !== SelectedColor) {
        setSelectedColor(currentImage.color);
        SetcolorCart(currentImage.color);
        setChecked(true);
      }
    },
    [allImages, SelectedColor]
  );

  const priceShift = discount ? pricediscount : price;

  const handleAddCart = async () => {
    if (!user) {
      api.open({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (!color) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn màu khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (!sizeCart) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn kích thước  khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (quantityProduct < count) {
      api.open({
        message: "Lỗi",
        description:
          "Xin lỗi, số lượng bạn chọn vượt quá hàng có sẵn. Vui lòng điều chỉnh số lượng.",
        duration: 3,
        type: "warning",
      });
      return;
    }
    try {
      const res = await AddCartAPI(
        user._id,
        id,
        count,
        sizeCart,
        colorCart,
        priceShift
      );

      if (res && res.data && res.data.cart) {
        console.log("varients:", variants);

        api.open({
          message: "Đã thêm vào giỏ hàng",
          description: (
            <div className="flex gap-2 p-2 ">
              <img
                src={
                  variants.find(
                    (item) => item.color === colorCart.toLowerCase()
                  )?.images[0]?.url || "/placeholder.svg"
                }
                className="img_cart"
                alt="lỗi"
              />
              <div>
                <h1 className="whitespace-nowrap">{name}</h1>
                <h1>{`${colorCart} / ${sizeCart}`}</h1>
                <h1>{`${pricediscount} / ${price}`}</h1>
              </div>
            </div>
          ),
          duration: 15,
        });
        CartListProductsUser();
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  const TotalRatings =
    feedback &&
    feedback?.reduce((acc, current) => {
      return acc + current.rating;
    }, 0);

  const hanldetoggleLikeRatingAPI = async (ratings) => {
    if (!user) {
      api.open({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập.",
        duration: 3,
        type: "warning",
      });
      return;
    }
    try {
      const res = await toggleLikeRatingAPI(id, ratings, user._id);

      if (res && res.data && res.data.success === true) {
        FetchAPIDetaillProuduct();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const TotalStock = variants
    .map((item) => item.sizes.reduce((acc, size) => acc + size.quantity, 0))
    .reduce((acc, total) => acc + total, 0);

  // Navigation handlers với error handling
  const handleMainPrev = useCallback(() => {
    try {
      if (mainSwiper && !mainSwiper.destroyed) {
        mainSwiper.slidePrev();
      }
    } catch (error) {
      console.error("Error in handleMainPrev:", error);
    }
  }, [mainSwiper]);

  const handleMainNext = useCallback(() => {
    try {
      if (mainSwiper && !mainSwiper.destroyed) {
        mainSwiper.slideNext();
      }
    } catch (error) {
      console.error("Error in handleMainNext:", error);
    }
  }, [mainSwiper]);

  const handleThumbPrev = useCallback(() => {
    try {
      if (thumbsSwiper && !thumbsSwiper.destroyed) {
        thumbsSwiper.slidePrev();
      }
    } catch (error) {
      console.error("Error in handleThumbPrev:", error);
    }
  }, [thumbsSwiper]);

  const handleThumbNext = useCallback(() => {
    try {
      if (thumbsSwiper && !thumbsSwiper.destroyed) {
        thumbsSwiper.slideNext();
      }
    } catch (error) {
      console.error("Error in handleThumbNext:", error);
    }
  }, [thumbsSwiper]);

  const handleAddProduct = async () => {
    if (!user) {
      api.open({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (!color) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn màu khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (!sizeCart) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn kích thước  khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    if (quantityProduct < count) {
      api.open({
        message: "Lỗi",
        description:
          "Xin lỗi, số lượng bạn chọn vượt quá hàng có sẵn. Vui lòng điều chỉnh số lượng.",
        duration: 3,
        type: "warning",
      });
      return;
    }

    try {
      handleAddCart();
      CartListProductsUser();
      setTimeout(() => {
        navigagte(`/cart`);
      }, 2000);
    } catch (error) {
      console.error(error);
      api.open({
        message: "Lỗi",
        description:
          "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
        duration: 3,
        type: "error",
      });
    }
  };

  return (
    <div className="Details ">
      {contextHolder}
      <div className="Details_main flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="sm:w-full md:w-1/2">
          <div className="relative">
            <Swiper
              onSwiper={setMainSwiper}
              onSlideChange={handleSlideChange}
              loop={allImages.length > 1}
              spaceBetween={10}
              navigation={false}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              modules={[FreeMode, Navigation, Thumbs]}
              className="mySwiper2"
              key={`main-all-images`}
            >
              {allImages.map((image, index) => (
                <SwiperSlide key={`all-${index}`}>
                  <Image
                    src={image.url || "/placeholder.svg"}
                    preview={{
                      src: image.url,
                    }}
                    alt={`${name} - ${image.color} - ${index + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={handleMainPrev}
                  className="custom-nav-btn custom-nav-prev"
                  aria-label="Previous image"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleMainNext}
                  className="custom-nav-btn custom-nav-next"
                  aria-label="Next image"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {allImages.length > 0 && (
            <div className="compact-thumbnail-wrapper flex justify-center items-center">
              <Swiper
                onSwiper={setThumbsSwiper}
                loop={false}
                spaceBetween={8}
                slidesPerView="auto"
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="compact-thumbnail-swiper"
                key={`compact-thumb-all-images`}
              >
                {allImages.map((image, index) => (
                  <SwiperSlide
                    key={`compact-thumb-all-${index}`}
                    className="compact-thumbnail-slide"
                  >
                    <div
                      className={`compact-thumbnail-container ${
                        index === activeThumbIndex ? "active" : ""
                      } ${
                        image.color === SelectedColor ? "current-color" : ""
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image.url || "/placeholder.svg"}
                        className="compact-thumbnail-image"
                        alt={`${name} ${image.color} thumbnail ${index + 1}`}
                      />
                      {/* Hiển thị indicator cho màu hiện tại */}
                      {image.color === SelectedColor && (
                        <div className="color-indicator">
                          <div className="color-dot"></div>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 doisi_detail__main">
          <div className="border border-b-2 ">
            <div className="p-4">
              <span className="text-[#484848] font-normal text-sm">
                Thương hiệu :{" "}
              </span>
              <span className="text-pink-gradient uppercase">{brand}</span>
              <div>
                <h1 className="text-[#484848] text-base">{name}</h1>
                <h1 className="text-[#484848] text-base">{description}</h1>
              </div>
            </div>
          </div>

          <div className="border border-b-2">
            <div className="p-4">
              <div className=" flex items-center gap-2">
                <h1 className=" text-3xl text-black">
                  {formatPrice(pricediscount)}
                </h1>
                <span className="text-[#b3b3b3] font-normal text-sm">
                  {discount ? formatPrice(price) : ""}
                </span>
                <span className="text-[#fe252c] font-normal text-sm">
                  {discount ? `${discount}% ` : ""}
                </span>
              </div>
              <h1>
                <Rate disabled value={TotalRatings > 30 ? 5 : 4} />
              </h1>
            </div>
          </div>

          <div className="border border-b-2">
            <div className="p-4">
              <div className="flex items-center gap-1 ">
                <h4 className="font-normal text-sm border-r pr-1">Màu sắc</h4>
                <span className="text-[#b3b3b3] font-normal text-sm">
                  {color.length} màu
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`color-swatch ${
                      SelectedColor === variant.color ? "selected" : ""
                    }`}
                    onClick={() => handleColor(variant.color)}
                  >
                    <img
                      src={variant.images[0]?.url || "/placeholder.svg"}
                      alt={`${name} - ${variant.color}`}
                      className="color-swatch-image"
                    />
                    <div className="color-swatch-overlay">
                      {SelectedColor === variant.color && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="check-icon"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="color-name">{variant.color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-b-2">
            <div className="p-4">
              <div className="flex items-center gap-1">
                <h4 className="font-normal text-sm border-r pr-1">
                  Kích thước
                </h4>
                <span className="text-[#b3b3b3] font-normal text-sm">
                  {size.length}
                </span>
              </div>
              <div className="flex items-center gap-1 m-3 size-selector">
                {SelectedColor &&
                  variants
                    .find((variant) => variant.color === SelectedColor)
                    ?.sizes.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSize(item.size, item.quantity)}
                        disabled={item.quantity === 0}
                        className={`size-button ${
                          sizeCart === item.size ? "selected" : ""
                        } ${item.quantity === 0 ? "disabled" : ""}`}
                      >
                        {item.size} (
                        {item.quantity > 0 ? item.quantity : "Hết hàng"})
                      </button>
                    ))}
              </div>
            </div>
          </div>

          <div className="border border-b-2">
            <div className="p-4">
              <div className="flex items-center gap-1">
                <span className="">Tổng Tiền : {formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 space-y-4">
              {/* Product availability info */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <h4 className="text-gray-500 font-normal text-sm">
                    {TotalStock > 0
                      ? `${TotalStock} sản phẩm có sẵn`
                      : "Đã bán hết"}
                  </h4>
                </div>

                <div className="flex items-center">
                  <h4 className="text-gray-500 font-normal text-sm">
                    {sumProducts} sản phẩm đã bán
                  </h4>
                </div>
              </div>

              {/* Quantity selector and action buttons */}
              {quantityProduct > 0 && (
                <div className="space-y-4">
                  {/* Desktop layout: Horizontal */}
                  <div className="block md:flex items-center gap-x-4">
                    {/* Quantity selector */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-[140px]">
                      <Button
                        className="w-10 h-10 border-none flex items-center justify-center hover:bg-gray-50"
                        style={{ background: "transparent" }}
                        onClick={handleDecrements}
                        disabled={count <= 1}
                      >
                        <MinusOutlined className="text-gray-600" />
                      </Button>

                      <input
                        type="number"
                        min={1}
                        max={quantityProduct}
                        value={count}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (
                            !isNaN(value) &&
                            value >= 1 &&
                            value <= quantityProduct
                          ) {
                            setCount(value);
                          } else if (e.target.value === "") {
                            setCount("");
                          }
                        }}
                        onBlur={() => {
                          if (count === "" || isNaN(count)) setCount(1);
                        }}
                        className="w-12 h-10 text-center border-none outline-none focus:ring-0 border-x border-gray-300 text-base"
                        style={{
                          appearance: "textfield",
                          MozAppearance: "textfield",
                        }}
                      />

                      <Button
                        className="w-10 h-10 border-none flex items-center justify-center hover:bg-gray-50"
                        style={{ background: "transparent" }}
                        onClick={handleIncrment}
                        disabled={count >= quantityProduct}
                      >
                        <PlusOutlined className="text-gray-600" />
                      </Button>
                    </div>

                    {/* Action buttons - Desktop */}
                    <div className="flex flex-1 gap-3 sm:mt-4 md:mt-0">
                      <Button
                        type="primary"
                        size="large"
                        className="flex-1 font-medium"
                        style={{
                          backgroundColor: "#000",
                          borderColor: "#000",
                          height: "40px",
                        }}
                        onClick={handleAddProduct}
                      >
                        Mua ngay
                      </Button>

                      <Button
                        type="primary"
                        size="large"
                        className="flex-1 font-medium"
                        style={{
                          backgroundColor: "#000",
                          borderColor: "#000",
                          height: "40px",
                        }}
                        onClick={handleAddCart}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Out of stock message */}
              {TotalStock <= 0 && (
                <div className="text-center py-4">
                  <p className="text-red-500 font-medium">
                    Sản phẩm hiện đã hết hàng
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="feedback">
        <div className="w-1/5 star ">
          <div className=" ">
            <h1 className="text-center font-bold text-xl">ĐÁNH GIÁ SẢN PHẨM</h1>
          </div>
          <div className="mt-2">
            <h1 className="text-center text-6xl font-bold">5</h1>
          </div>
          <div className="text-center mt-2">
            <Rate disabled value={TotalRatings > 30 ? 5 : 4} size={30} />
          </div>
          <div className="text-center mt-2">
            <p className="text-[#4d4d4d] text-xl italic">
              {feedback && feedback.length} đánh giá
            </p>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-center font-bold text-xl mt-16">PHẢN HỒI</div>
          {currentFeedback &&
            [...currentFeedback]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((item) => {
                return (
                  <div className="comment_users" key={item._id}>
                    <div className="w-full m-4 flex items-center gap-3">
                      {item && (
                        <img
                          className="w-10 h-10 rounded-full"
                          src={
                            item && item.userId.avatar ? (
                              item.userId.avatar
                            ) : (
                              <Avatar>U</Avatar>
                            )
                          }
                          alt="avatar lỗi"
                        />
                      )}

                      {item && (
                        <p className="flex items-center text-neutral-900 font-bold">
                          {item.userId.name}{" "}
                          <span className="ml-2 time_span">
                            {" "}
                            {moment(item.createdAt).format("DD-MM-YY")}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="ml-5">
                      <Rate
                        allowHalf={true}
                        defaultValue={item.rating}
                        disabled
                      />
                    </div>
                    <div className="ml-5 flex gap-2 items-center">
                      <p>{item.review}</p>

                      {item.likes && item.likes.length > 0 ? (
                        <p className="flex items-center gap-1">
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fas"
                            data-icon="heart"
                            className={`svg-inline--fa fa-heart w-5 cursor-pointer ${
                              user?._id && item.likes.includes(user._id)
                                ? "text-[#ed2b48]"
                                : ""
                            }`}
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            onClick={() => hanldetoggleLikeRatingAPI(item._id)}
                          >
                            {user?._id && item.likes.includes(user._id) ? (
                              <path
                                fill="currentColor"
                                d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"
                              ></path>
                            ) : (
                              <path
                                fill="currentColor"
                                d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                              ></path>
                            )}
                          </svg>
                          <span>{item.likes.length}</span>
                        </p>
                      ) : (
                        <p>
                          {" "}
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="far"
                            data-icon="heart"
                            className="svg-inline--fa fa-heart w-5 cursor-pointer"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            onClick={() => hanldetoggleLikeRatingAPI(item._id)}
                          >
                            <path
                              fill="currentColor"
                              d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                            ></path>
                          </svg>
                        </p>
                      )}
                    </div>
                    <div className="feedback_div">
                      {item.images &&
                        item.images.length > 0 &&
                        item.images.map((url, index) => {
                          return (
                            <img
                              className="feedback_images"
                              src={url || "/placeholder.svg"}
                              alt="lỗi"
                              key={index}
                            />
                          );
                        })}
                    </div>
                  </div>
                );
              })}
          <ReactPaginate
            previousLabel={
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="left"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
              </svg>
            }
            nextLabel={
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="right"
                width="16px"
                height="16px"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
              </svg>
            }
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>
      </div>
    </div>
  );
};

export default Details;
