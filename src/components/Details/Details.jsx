import "./Details.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Rate, Button, notification, Image } from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  getTopSellingProductsByCategoryAPI,
  ListSlugProductAPI,
  toggleLikeRatingAPI,
} from "../../service/ApiProduct";
import { AddCartAPI } from "../../service/Cart";
import { useSelector } from "react-redux";

import ReactPaginate from "react-paginate";
import SizePredictor from "../SizePredictor/SizePredictor";
import VirtualTryOnApp from "../VirtualTryOnApp/VirtualTryOnApp";
import { Helmet } from "react-helmet-async";

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
  const [review, setReivew] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [sumProducts, setSumProducts] = useState(0);
  const [quantityProduct, SetquantityProduct] = useState(0);
  const [count, setCount] = useState(1);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [shift, SetShift] = useState("");
  const [gender, setGender] = useState("");
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const navigagte = useNavigate();
  const [open, setOpen] = useState(false);
  const [filterStar, setFilterStar] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const maxLength = 400;

  const shouldTruncate = description.length > maxLength;
  const displayText = expanded
    ? description
    : shouldTruncate
    ? description.slice(0, maxLength) + "..."
    : description;

  const [clothImage, setClothImage] = useState(null);
  const [modal2Open, setModal2Open] = useState(false);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        const allImages =
          res.data.data.variants?.reduce((acc, variant) => {
            const variantImages = variant.images.map((img) => ({
              ...img,
              color: variant.color,
            }));
            return [...acc, ...variantImages];
          }, []) || [];

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
        setSumProducts(res.data.data.stock || 0);
        setVariants(res.data.data.variants || []);
        setImage(allImages);
        setColor(Color || []);
        setSize(SizeMap || []);
        SetcolorCart(res.data.data.variants[0]?.color || "");
        setSelectedColor(res.data.data.variants[0]?.color || "");
        SetquantityProduct(res.data.data.sold || 0);
        SetShift(res.data.data.category || "");
        setGender(res.data.data.gender || "");
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

  const handleColor = useCallback(
    (item) => {
      setChecked(true);
      setSelectedColor(item);
      SetcolorCart(item);

      const firstImageIndex = image.findIndex((img) => img.color === item);
      if (firstImageIndex !== -1) {
        setActiveThumbIndex(firstImageIndex);
        setClothImage(image[firstImageIndex].url);

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
    [mainSwiper, thumbsSwiper, image]
  );

  const handleSize = (item, quantity) => {
    setSelectedSize(item);
    setCheckSelectedSize(true);
    SetSizeCart(item);
    setSumProducts(quantity);
  };

  const handleThumbnailClick = useCallback(
    (index) => {
      setActiveThumbIndex(index);
      if (mainSwiper) {
        mainSwiper.slideTo(index);
      }

      const clickedImage = image[index];

      if (clickedImage && clickedImage.color !== SelectedColor) {
        setSelectedColor(clickedImage.color);
        SetcolorCart(clickedImage.color);
        setChecked(true);
      }
    },
    [mainSwiper, image, SelectedColor]
  );

  const handleSlideChange = useCallback(
    (swiper) => {
      setActiveThumbIndex(swiper.activeIndex);

      const currentImage = image[swiper.activeIndex];
      if (currentImage && currentImage.color !== SelectedColor) {
        setSelectedColor(currentImage.color);
        SetcolorCart(currentImage.color);
        setChecked(true);
      }
    },
    [image, SelectedColor]
  );

  const priceShift = discount ? pricediscount : price;

  const validateSelection = () => {
    if (!user) {
      api.open({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return false;
    }

    if (!SelectedColor) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn màu khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return false;
    }

    if (!SelectedSize) {
      api.open({
        message: "Lỗi",
        description: "Vui lòng chọn kích thước khi thêm vào giỏ hàng.",
        duration: 3,
        type: "warning",
      });
      return false;
    }

    if (sumProducts < count) {
      api.open({
        message: "Lỗi",
        description:
          "Xin lỗi, số lượng bạn chọn vượt quá hàng có sẵn. Vui lòng điều chỉnh số lượng.",
        duration: 3,
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const handleAddCart = async () => {
    if (!validateSelection() || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      const res = await AddCartAPI(
        user._id,
        id,
        count,
        SelectedSize,
        SelectedColor,
        priceShift
      );

      if (res && res.data && res.data.cart) {
        api.open({
          message: "Đã thêm vào giỏ hàng",
          description: (
            <div className="flex gap-2 p-2">
              <img
                src={
                  variants.find(
                    (item) => item.color === SelectedColor.toLowerCase()
                  )?.images[0]?.url || "/placeholder.svg"
                }
                className="w-12 h-12 object-cover rounded"
                alt="Product"
              />
              <div>
                <h1 className="whitespace-nowrap font-medium">{name}</h1>
                <h1 className="text-sm text-gray-600">{`${SelectedColor} / ${SelectedSize}`}</h1>
                <h1 className="text-sm font-medium">
                  {formatPrice(priceShift)}
                </h1>
              </div>
            </div>
          ),
          duration: 15,
        });
        CartListProductsUser();
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

  const TotalRatings = feedback.length;

  const averageRating =
    TotalRatings > 0
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) / TotalRatings
        ).toFixed(1)
      : 0;

  // Đếm số lượng đánh giá theo số sao
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedback.forEach((item) => {
      counts[item.rating] = (counts[item.rating] || 0) + 1;
    });
    return counts;
  }, [feedback]);

  // Lọc và sắp xếp feedback
  const filteredAndSortedFeedback = useMemo(() => {
    let result = [...feedback];

    // Lọc theo số sao
    if (filterStar > 0) {
      result = result.filter((item) => item.rating === filterStar);
    }

    // Sắp xếp
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    return result;
  }, [feedback, filterStar, sortBy]);

  const pageCount = Math.ceil(filteredAndSortedFeedback.length / itemsPerPage);
  const currentFeedback = filteredAndSortedFeedback.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const toggleLikeRatingAPIHandler = async (ratingId) => {
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
      const res = await toggleLikeRatingAPI(id, ratingId, user._id);

      if (res && res.data && res.data.success === true) {
        FetchAPIDetaillProuduct();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const TotalStock = variants.reduce((total, variant) => {
    return (
      total +
      variant.sizes.reduce((sizeTotal, sizeItem) => {
        return sizeTotal + sizeItem.quantity;
      }, 0)
    );
  }, 0);

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

  const handleBuyNow = async () => {
    if (!validateSelection() || isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      await handleAddCart();
      setTimeout(() => {
        navigagte(`/cart`);
      }, 1500);
    } catch (error) {
      console.error(error);
      api.open({
        message: "Lỗi",
        description:
          "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
        duration: 3,
        type: "error",
      });
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleQuantityInput = (e) => {
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
  };

  const totalPrice = pricediscount ? pricediscount * count : price * count;

  const fetchTopSelling = async () => {
    try {
      const res = await getTopSellingProductsByCategoryAPI(shift._id, gender);

      if (res?.data?.EC === 0) {
        setTopSellingProducts(res.data.data);
      } else {
        console.warn("⚠️ API trả về lỗi logic:", res?.data);
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ API error:", error.response.data);
      } else if (error.request) {
        console.error("❌ Network error:", error.request);
      } else {
        console.error("❌ Unexpected error:", error.message);
      }
    }
  };

  useEffect(() => {
    if (shift?._id && gender) {
      fetchTopSelling();
    }
  }, [shift?._id, gender]);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="mt-28 min-h-screen bg-gradient-to-br from-white via-green-50/20 to-gray-50/30 relative overflow-hidden">
      <Helmet>
        <title>
          {name} | {brand} - Fashion Store
        </title>
        <meta name="description" content={description?.slice(0, 10)} />
        <meta
          name="keywords"
          content={`${name}, ${brand}, thời trang, quần áo`}
        />
        <meta property="og:title" content={name} />
        <meta property="og:description" content={description?.slice(0, 160)} />
        <meta
          property="og:image"
          content={image[0]?.url || "/placeholder.svg"}
        />
        <meta property="og:type" content="product" />
        <meta
          property="og:url"
          content={`https://fashion-store-shop-ecommert.vercel.app/product/${param.slug}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      {contextHolder}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]">
                <Swiper
                  onSwiper={setMainSwiper}
                  spaceBetween={10}
                  navigation={{
                    nextEl: ".swiper-button-next-custom",
                    prevEl: ".swiper-button-prev-custom",
                  }}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="h-full"
                  onSlideChange={handleSlideChange}
                  effect="fade"
                >
                  {image.map((item, index) => (
                    <SwiperSlide key={index}>
                      <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50/30">
                        <Image
                          src={item.url || "/placeholder.svg"}
                          alt={`${name} - ${item.color}`}
                          className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-105"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-50"
                  onClick={handleMainPrev}
                >
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-50"
                  onClick={handleMainNext}
                >
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative">
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                breakpoints={{
                  640: { slidesPerView: 5, spaceBetween: 12 },
                  768: { slidesPerView: 6, spaceBetween: 16 },
                }}
                className="thumbnail-swiper"
              >
                {image.map((item, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        activeThumbIndex === index
                          ? "ring-2 ring-green-500 shadow-lg scale-105"
                          : "hover:shadow-md hover:ring-1 hover:ring-green-300/50"
                      } bg-white shadow-sm`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={`${name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full">
                  {brand}
                </span>
                {discount && (
                  <span className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full animate-pulse">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {name}
              </h1>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Rate
                    disabled
                    value={parseFloat(averageRating)}
                    allowHalf
                    className="text-base"
                  />
                  <span className="text-gray-600 text-sm">
                    ({feedback.length} đánh giá)
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full text-sm">
                  {quantityProduct} đã bán
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl lg:text-4xl font-bold text-green-600">
                  {formatPrice(pricediscount)}
                </span>
                {discount && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              {discount && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-medium text-sm">
                    🎉 Tiết kiệm {formatPrice(price - pricediscount)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Màu sắc</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {color.length} màu
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      SelectedColor === variant.color
                        ? "ring-2 ring-green-500 scale-105 shadow-lg"
                        : "hover:scale-105 hover:shadow-md"
                    }`}
                    onClick={() => handleColor(variant.color)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                      <img
                        src={variant.images[0]?.url || "/placeholder.svg"}
                        alt={`${name} - ${variant.color}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {SelectedColor === variant.color && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs font-medium text-gray-700 mt-1 group-hover:text-green-600 transition-colors capitalize">
                      {variant.color}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {SelectedColor && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Kích thước</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {variants
                    .find((variant) => variant.color === SelectedColor)
                    ?.sizes.map((sizeItem, index) => (
                      <button
                        key={index}
                        className={`py-3 px-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm ${
                          SelectedSize === sizeItem.size
                            ? "bg-green-600 text-white shadow-lg scale-105"
                            : sizeItem.quantity > 0
                            ? "hover:bg-green-50 hover:shadow-md bg-white text-gray-900 border border-gray-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        }`}
                        onClick={() =>
                          sizeItem.quantity > 0 &&
                          handleSize(sizeItem.size, sizeItem.quantity)
                        }
                        disabled={sizeItem.quantity <= 0}
                      >
                        <div>{sizeItem.size}</div>
                        {sizeItem.quantity <= 0 && (
                          <div className="text-xs">Hết</div>
                        )}
                      </button>
                    ))}
                </div>
                <div className="flex sm:flex-col lg:flex-row gap-4">
                  <Button
                    type="primary"
                    onClick={showDrawer}
                    className="h-10 px-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700 hover:scale-105 transform transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      borderColor: "transparent",
                    }}
                  >
                    📏 Hướng dẫn chọn size
                  </Button>

                  <Button
                    type="primary"
                    onClick={() => setModal2Open(true)}
                    className="h-10 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-lg font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 hover:scale-105 transform transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #0d9488)",
                      borderColor: "transparent",
                    }}
                  >
                    🤖 Thử đồ bằng AI
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">Số lượng</h3>
                <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-md">
                  <button
                    onClick={handleDecrements}
                    className="p-2 hover:bg-green-50 transition-all duration-300 disabled:opacity-50"
                    disabled={count <= 1}
                  >
                    <MinusOutlined className="text-gray-600" />
                  </button>
                  <input
                    type="number"
                    value={count}
                    onChange={handleQuantityInput}
                    min="1"
                    max={sumProducts}
                    className="w-16 px-2 py-2 text-center font-bold text-gray-900 bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-300"
                  />
                  <button
                    onClick={handleIncrment}
                    className="p-2 hover:bg-green-50 transition-all duration-300 disabled:opacity-50"
                    disabled={count >= sumProducts}
                  >
                    <PlusOutlined className="text-gray-600" />
                  </button>
                </div>
                {sumProducts > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {sumProducts} có sẵn
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Tổng tiền</h3>
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full shadow-sm">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddCart}
                  loading={isAddingToCart}
                  disabled={
                    TotalStock <= 0 ||
                    !SelectedColor ||
                    !SelectedSize ||
                    isAddingToCart
                  }
                  className="flex-1 h-12 font-semibold rounded-lg bg-green-600 border-0 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>
                <Button
                  size="large"
                  onClick={handleBuyNow}
                  loading={isBuyingNow}
                  disabled={
                    TotalStock <= 0 ||
                    !SelectedColor ||
                    !SelectedSize ||
                    isBuyingNow
                  }
                  className="flex-1 h-12 font-semibold rounded-lg text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl bg-white"
                >
                  {isBuyingNow ? "Đang xử lý..." : "Mua ngay"}
                </Button>
              </div>

              {TotalStock <= 0 && (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-medium">
                    ⚠️ Sản phẩm hiện đã hết hàng
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mô tả sản phẩm */}
        <div className="bg-white rounded-xl p-5 shadow-lg mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full"></span>
            Mô tả sản phẩm
          </h3>
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: displayText }}
          />
          {shouldTruncate && (
            <Button
              className="text-center m-auto flex justify-center mt-3 text-green-500"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Rút gọn" : "Xem thêm"}
            </Button>
          )}
        </div>

        {/* Sản phẩm gợi ý */}
        {topSellingProducts.length > 0 && (
          <div className="mt-16 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                Sản phẩm gợi ý
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
              </h2>
              <p className="text-gray-600">
                Những sản phẩm tương tự mà bạn có thể quan tâm
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSellingProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.variants[0]?.images[0]?.url || ""}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.discount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        -{product.discount}%
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(product.discountedPrice)}
                        </span>
                        {product.discount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {product.discount && (
                        <p className="text-xs text-green-700">
                          Tiết kiệm{" "}
                          {formatPrice(product.price - product.discountedPrice)}
                        </p>
                      )}
                    </div>

                    <button
                      className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                      onClick={() => navigagte(`/product/${product.slug}`)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phần đánh giá sản phẩm */}
        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Đánh giá sản phẩm
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Điểm trung bình */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {averageRating}
                  </div>
                  <Rate
                    disabled
                    value={parseFloat(averageRating)}
                    allowHalf
                    className="text-xl mb-2"
                  />
                  <p className="text-gray-600 font-medium">
                    {TotalRatings} đánh giá
                  </p>
                </div>

                {/* Biểu đồ sao */}
                <div className="w-full md:w-96 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium text-gray-700">
                          {star}
                        </span>
                        <span className="text-yellow-500">★</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-500"
                          style={{
                            width: `${
                              TotalRatings > 0
                                ? (starCounts[star] / TotalRatings) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {starCounts[star]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bộ lọc và sắp xếp */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Lọc theo sao */}
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 mb-3">
                  <FilterOutlined className="text-gray-600" />
                  <span className="font-semibold text-gray-700">Lọc theo:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setFilterStar(0);
                      setCurrentPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filterStar === 0
                        ? "bg-green-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setFilterStar(star);
                        setCurrentPage(0);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                        filterStar === star
                          ? "bg-green-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {star} <span className="text-yellow-400">★</span>
                      <span className="text-xs">({starCounts[star]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sắp xếp */}
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-700">Sắp xếp:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Đánh giá cao nhất</option>
                  <option value="lowest">Đánh giá thấp nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danh sách đánh giá */}
          <div className="space-y-4">
            {currentFeedback.length > 0 ? (
              currentFeedback.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {item.userId.avatar ? (
                        <img
                          className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-green-100"
                          src={item.userId.avatar}
                          alt="User avatar"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-lg">
                            {item.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {item.userId.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <Rate
                          allowHalf
                          defaultValue={item.rating}
                          disabled
                          className="text-base"
                        />
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {item.review}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLikeRatingAPIHandler(item._id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-green-50 transition-all duration-300 group"
                        >
                          {user?._id && item.likes.includes(user._id) ? (
                            <HeartFilled className="text-green-500 text-lg group-hover:scale-125 transition-transform" />
                          ) : (
                            <HeartOutlined className="text-gray-400 text-lg group-hover:scale-125 transition-transform" />
                          )}
                          <span className="text-sm font-medium text-gray-600">
                            {item.likes.length}
                          </span>
                        </button>
                      </div>

                      {/* Replies */}
                      {item.replies && item.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {item.replies.map((reply, index) => (
                            <div
                              key={index}
                              className="bg-green-50 rounded-lg p-4 ml-4 border-l-4 border-green-500"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <img
                                  className="w-8 h-8 rounded-full"
                                  src="https://www.coolmate.me/images/logo-circle.svg"
                                  alt="Dosiin"
                                />
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900">
                                    Phản hồi từ Dosiin
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-700 ml-11">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-500 text-lg">
                  Không có đánh giá nào phù hợp với bộ lọc
                </p>
              </div>
            )}
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="flex justify-center mt-6">
              <ReactPaginate
                previousLabel="‹"
                nextLabel="›"
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName="flex items-center gap-2 select-none"
                pageClassName="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer font-medium transition-all 
                   bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900 shadow-sm"
                activeClassName="bg-green-600 text-white shadow-md scale-110"
                previousClassName="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer font-bold 
                       bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm"
                nextClassName="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer font-bold 
                   bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </div>
      <SizePredictor
        open={open}
        onClose={onClose}
        productId={id}
        shift={shift}
      />
      <VirtualTryOnApp
        modal2Open={modal2Open}
        setModal2Open={setModal2Open}
        clothImage={clothImage}
        setClothImage={setClothImage}
      />
    </div>
  );
};

export default Details;
