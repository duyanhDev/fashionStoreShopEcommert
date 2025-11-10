import { useState, useEffect } from "react";
import {
  Card,
  notification,
  Rate,
  Skeleton,
  Avatar,
  Form,
  Badge,
  Calendar,
} from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import "./Home.css";
// Import Swiper styles
import "swiper/css";
import { Pagination, Autoplay } from "swiper/modules";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Clothing from "./Clothing/Clothing";

import SliderComponent from "../Slider/Slider";
import Ao from "./../../assets/Image/Home/image-ao-thun-1_18_1.avif";
import quan_thun_nam from "./../../assets/Image/Home/quan_thun_nam.avif";
import ao_thun_nu from "./../../assets/Image/Home/image-ao-thun-1_18_8.avif";
import ao_the_thao_nu from "./../../assets/Image/Home/image-ao-thun-1_18_9.avif";
import Phukien from "./../../assets/Image/Home/phu-kien.avif";
import Phukien_nu from "./../../assets/Image/Home/phu_kien_nu.avif";

import ProductCart from "../ProductCart/ProductCart";
import {
  addToWishlistAPI,
  getWishlistAPI,
  RemoveToWishListAPI,
} from "../../service/WishList";
import { useSelector } from "react-redux";
import {
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import EnhancedProductsSection from "../EnhancedProductsSection/EnhancedProductsSection";
import {
  Award,
  Check,
  GiftIcon,
  Heart,
  MapPin,
  ShoppingBag,
  ShoppingCartIcon,
  Star,
} from "lucide-react";
import { getAllBlog, updateViewBlog } from "../../service/Blog";
import FashionBrandPartners from "../FashionBrandPartners/FashionBrandPartners";
import { Helmet } from "react-helmet-async";
const Home = () => {
  const { ListProducts } = useOutletContext();
  const { user } = useSelector((state) => state.auth);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [modalCartOpen, setModalCartOpen] = useState(false);
  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const [WishList, setWishList] = useState([]);
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [blogPosts, SetBlogPosts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);

  const services = [
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: "Miễn phí vận chuyển",
      description:
        "Miễn phí vận chuyển cho đơn hàng từ 299k cho tất cả đơn hàng",
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Bảo hành chất lượng",
      description: "Đổi trả trong 30 ngày nếu có lỗi từ nhà sản xuất",
    },
    {
      icon: <CreditCardIcon className="w-8 h-8" />,
      title: "Thanh toán an toàn",
      description: "Hỗ trợ nhiều hình thức thanh toán bảo mật",
    },
    {
      icon: <PhoneIcon className="w-8 h-8" />,
      title: "Hỗ trợ 24/7",
      description: "Tư vấn và hỗ trợ khách hàng mọi lúc mọi nơi",
    },
    {
      icon: <GiftIcon className="w-8 h-8" />,
      title: "Ưu đãi hấp dẫn",
      description: "Nhận ngay nhiều khuyến mãi và quà tặng độc quyền",
    },
  ];

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDetails = (slug) => {
    navigate(`product/${slug}`);
  };

  const handelModelProductCart = (
    id,
    items,
    price,
    costPrice,
    name,
    discount
  ) => {
    setIdProducts(id);
    setListItems(items);
    setPrice(price);
    setCostPrice(costPrice);
    setModalCartOpen(true);
    setProductname(name);
    setDiscount(discount);
  };

  const handlAddWishList = async (productId) => {
    if (!user) {
      api["error"]({
        message: "Vui lòng đăng nhập",
        description: "Khách hàng đăng nhập mới sử dụng được tính năng này",
      });
      return;
    }
    try {
      const res = await addToWishlistAPI(user?._id, productId);
      if (res && res.data && res.data.EC === 0) {
        api["success"]({
          message: "Đã thêm vào danh sách yêu thích",
          description: res.data.message,
        });
        fetchListWishList();
      }
    } catch (error) {
      api["error"]({
        message: "Sản phẩm đã tồn tại danh sách yêu thích",
        description: "Sản phẩm đã tồn tại danh sách yêu thích",
      });
    }
  };

  const fetchListWishList = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getWishlistAPI(user?._id);

      // Xử lý response
      if (response.data && response.data.EC === 0) {
        setWishList(response.data?.data?.products || []);
      } else {
        setWishList([]); // Danh sách trống - không phải lỗi
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);

      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Redirect to login
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập danh sách này.");
      } else if (error.response?.status === 404) {
        setWishList([]); // User chưa có wishlist - OK
      } else {
        setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishList = async (productId) => {
    try {
      const res = await RemoveToWishListAPI(user?._id, productId);
      if (res && res.data && res.data.EC === 0) {
        api["success"]({
          message: "Đã xóa khỏi danh sách yêu thích",
        });
        fetchListWishList();
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
        description: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
      });
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchListWishList();
    }
  }, [user?._id]);

  const isProductInWishlist = WishList?.map((item) => item.product._id);

  // Get featured products (first 4)
  const featuredProducts =
    ListProducts?.filter((item) => {
      return item.ratings?.reduce((sum, acc) => sum + acc.rating, 0) || 0 >= 5;
    })?.slice(0, 12) || [];

  const feedbackImages =
    ListProducts.length > 0
      ? ListProducts?.flatMap((item) =>
          item?.ratings.filter((rating) => rating.rating === 5)
        )
      : [];

  const fetchApiBlog = async () => {
    try {
      const res = await getAllBlog();

      if (res && res.data && res.data.EC === 0) {
        SetBlogPosts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApiBlog();
  }, []);

  const handleIncreaseView = async (slug) => {
    try {
      const res = await updateViewBlog(slug);
      console.log(res);

      if (res && res.data && res.data.EC === 0) {
        navigate(`/blog/${slug}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const updateSlidesToShow = () => {
      if (window.innerWidth >= 1280) setSlidesToShow(3);
      else if (window.innerWidth >= 768) setSlidesToShow(2);
      else setSlidesToShow(1);
    };

    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % Math.ceil(feedbackImages.length / slidesToShow)
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [feedbackImages.length, slidesToShow]);
  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.ceil(feedbackImages.length / slidesToShow)
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0
        ? Math.ceil(feedbackImages.length / slidesToShow) - 1
        : prev - 1
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };
  return (
    <>
      <SliderComponent />
      {contextHolder}
      <Helmet>
        <title>Shop Quần Áo - Thời Trang Nam Nữ</title>
        <meta
          name="description"
          content="Mua sắm thời trang nam nữ, phụ kiện chính hãng với nhiều ưu đãi hấp dẫn."
        />
        <meta property="og:title" content="Shop Quần Áo - Thời Trang Nam Nữ" />
        <meta
          property="og:description"
          content="Khám phá bộ sưu tập thời trang đa dạng, phù hợp mọi phong cách."
        />
        <meta
          property="og:image"
          content="https://yourdomain.com/og-image.jpg"
        />
        <meta property="og:url" content="https://yourdomain.com" />
      </Helmet>
      <div className="home_doisin">
        {/* Category Section */}
        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                BẠN ĐANG TÌM KIẾM?
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-4">
              {/* ÁO KHOÁC */}
              <div>
                <Link
                  className="block text-center"
                  to="/clothing/male?currentPage=1&care=Áo+thun"
                >
                  <div className="relative mb-4">
                    <img
                      src={Ao}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">
                    Áo thun nam
                  </h3>
                </Link>
              </div>

              {/* ĐỒ NAM */}

              <div>
                <Link
                  className="block text-center"
                  to="/clothing/unisex?care=Quần+Thun&currentPage=1"
                >
                  <div className="relative mb-4">
                    <img
                      src={quan_thun_nam}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">
                    Quần thun nam
                  </h3>
                </Link>
              </div>

              <div>
                <Link
                  className="block text-center"
                  to="/clothing/male?Category=Phụ+Kiện&currentPage=1"
                >
                  <div className="relative mb-4">
                    <img
                      src={Phukien}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    PHỤ KIỆN
                  </h3>
                </Link>
              </div>
              {/* ĐỒ NỮ */}

              <div>
                <Link
                  className="block text-center"
                  to="/clothing/female?currentPage=1&care=Áo+thun"
                >
                  <div className="relative mb-4">
                    <img
                      src={ao_the_thao_nu}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">
                    Áo Thun Nữ
                  </h3>
                </Link>
              </div>
              <div>
                <Link
                  className="block  text-center"
                  to="/clothing/female?currentPage=1&Category=Quần"
                >
                  <div className="relative mb-4">
                    <img
                      src={ao_thun_nu}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    ĐỒ NỮ BRA & LEGGINGS
                  </h3>
                </Link>
              </div>

              {/* ĐỒ UNISEX */}
              <div>
                <Link
                  className="block  text-center"
                  to="clothing/female?currentPage=1&Category=Phụ+Kiện"
                >
                  <div className="relative mb-4">
                    <img
                      src={Phukien_nu}
                      alt="ĐỒ NAM"
                      loading="lazy"
                      width="280"
                      height="380"
                      className=" mx-auto object-contain group-hover:scale-110 transition-transform duration-300 rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">
                    Phụ Kiện Nữ
                  </h3>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className=" py-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                DỊCH VỤ CỦA CHÚNG TÔI
              </h2>
              <p className="text-lg text-white font-bold max-w-2xl mx-auto">
                Cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách
                hàng
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="text-blue-600 mb-6 flex justify-center">
                    {service.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <EnhancedProductsSection ListProducts={ListProducts} />

        <div className="py-16 w-full bg-gradient-to-r from-green-500 to-green-600 rounded-2xl relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-green-300/15 rounded-full blur-3xl"></div>

          <div className="w-full mx-auto px-4 sm:px-2 lg:px-8 relative z-10">
            {/* Enhanced Header */}
            <div className="text-center mb-8 sm:mb-12 relative">
              <div className="inline-flex items-center gap-2 bg-white text-green-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-xl border-2 border-white/50">
                ✨ SẢN PHẨM NỔI BẬT ✨
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-lg">
                SẢN PHẨM NỔI BẬT
              </h2>

              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/90 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-medium px-4 drop-shadow-md">
                Khám phá những sản phẩm được yêu thích nhất với công nghệ tiên
                tiến và chất lượng vượt trội
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 sm:h-5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2 lg:gap-4 xl:gap-4">
                {featuredProducts.map((item, index) => {
                  const isOutOfStock = item.stock === 0;
                  return (
                    <div
                      key={`featured-${index}`}
                      className="group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2"
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                        <div
                          className="aspect-square relative bg-gradient-to-br from-gray-50 via-white to-gray-100"
                          onClick={() => handleDetails(item.slug)}
                        >
                          <img
                            src={
                              item.variants?.[0]?.images?.[0]?.url ||
                              "/placeholder.svg?height=320&width=280"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transform -rotate-12 shadow-xl border-2 border-white/30">
                              SOLD OUT
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-1.5 sm:top-2 lg:top-3 left-1.5 sm:left-2 lg:left-3 flex flex-col gap-1 sm:gap-1.5 lg:gap-2 z-20">
                          {typeof item.discount !== "undefined" &&
                            item.discount > 0 && (
                              <div className="bg-green-600 text-white lg:text-lg font-semibold px-1.5 sm:px-2 sm:text-sm py-0.5 sm:py-1 rounded">
                                -{item.discount}%
                              </div>
                            )}
                          {index < 3 && (
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md sm:rounded-lg shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-200 delay-75">
                              🏆 TOP {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {isProductInWishlist.includes(item._id) ? (
                            <>
                              <button
                                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                onClick={() => handleRemoveWishList(item._id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                              onClick={() => handlAddWishList(item._id)}
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            className="bg-green-600 text-white p-1.5 sm:p-2 rounded-full shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-200"
                            onClick={() =>
                              handelModelProductCart(
                                item._id,
                                item.variants,
                                item.price,
                                item.discountedPrice,
                                item.name,
                                item.discount
                              )
                            }
                          >
                            <svg
                              className="w-3 sm:w-4 h-3 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className="p-2 sm:p-3 lg:p-4 space-y-1.5 sm:space-y-2 lg:space-y-3 cursor-pointer"
                        onClick={() => handleDetails(item.slug)}
                      >
                        {/* Brand Badge */}
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide bg-gradient-to-r from-green-50 to-green-100 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-md sm:rounded-lg border border-green-200">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                          {item.brand}
                        </div>

                        {/* Product Name */}
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-green-600 transition-colors duration-200">
                          {item.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center justify-between py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Rate
                            disabled
                            defaultValue={
                              item.ratings?.length
                                ? item.ratings.reduce(
                                    (total, acc) => total + acc.rating,
                                    0
                                  ) / item.ratings.length
                                : 5
                            }
                            style={{
                              fontSize:
                                window.innerWidth < 640 ? "10px" : "12px",
                            }}
                          />
                          <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                            ({item.ratings.length})
                          </span>
                        </div>

                        {/* Price Section */}
                        <div className="space-y-1 sm:space-y-1.5 lg:space-y-">
                          <div className="flex items-center gap-2">
                            <span className="lg:text-lg sm:text-xs font-semibold text-green-600">
                              {formatPrice(item.discountedPrice || item.price)}
                            </span>
                            {item.discount > 0 && (
                              <span className="lg:text-lg sm:text-xs text-gray-400 line-through">
                                {formatPrice(item.price || item.costPrice)}
                              </span>
                            )}
                          </div>
                          {item.discount > 0 && (
                            <div className="lg:text-lg sm:text-xs text-green-600">
                              Tiết kiệm{" "}
                              {formatPrice(
                                (item.price || item.costPrice) -
                                  (item.discountedPrice || item.costPrice)
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stock Indicator */}
                        {!isOutOfStock && (
                          <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 lg:py-2 rounded-lg border border-gray-200">
                            <div className="relative flex items-center">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                              <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <span>Còn {item.stock} sản phẩm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Customer Testimonials */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Khách Hàng Nói Gì Về
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Chúng Tôi
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Những phản hồi chân thực từ hàng nghìn khách hàng đã tin tưởng
                và mua sắm tại cửa hàng
              </p>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"
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
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Testimonials Container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${
                      currentSlide * (100 / slidesToShow)
                    }%)`,
                  }}
                >
                  {feedbackImages.map((testimonial, index) => (
                    <div
                      key={testimonial._id}
                      className={`flex-shrink-0 px-3 ${
                        slidesToShow === 1
                          ? "w-full"
                          : slidesToShow === 2
                          ? "w-1/2"
                          : "w-1/3"
                      }`}
                    >
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden h-full group hover:-translate-y-1">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>

                          <div className="flex items-center relative z-10">
                            <div className="relative">
                              <img
                                src={testimonial.userId.avatar}
                                alt={testimonial.userId.name}
                                className="w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-lg"
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="ml-4 text-white">
                              <h4 className="font-bold text-lg">
                                {testimonial.userId.name}
                              </h4>
                              <p className="text-blue-100 flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {testimonial?.userId?.address?.city || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 flex flex-col h-64">
                          {/* Product Info */}
                          <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-lg">
                            <ShoppingBag className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                              {testimonial.productName}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center mb-4">
                            <div className="flex space-x-1">
                              {renderStars(testimonial.rating)}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              {testimonial.rating}/5 sao
                            </span>
                          </div>

                          {/* Review */}
                          <div className="flex-1 mb-4">
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                              "{testimonial.review}"
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              {new Date(
                                testimonial.createdAt
                              ).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <Award className="w-3 h-3 mr-1" />
                              Đã mua hàng
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from(
                  { length: Math.ceil(feedbackImages.length / slidesToShow) },
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide
                          ? "bg-blue-500 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  15K+
                </div>
                <div className="text-sm text-gray-600">Khách hàng hài lòng</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Star className="w-8 h-8 text-white fill-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  4.9/5
                </div>
                <div className="text-sm text-gray-600">Điểm đánh giá</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-sm text-gray-600">Tỷ lệ hài lòng</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  5 năm
                </div>
                <div className="text-sm text-gray-600">Đã Hoạt Động</div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-4 sm:px-0 lg:px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  TIN TỨC & XU HƯỚNG
                </h2>
                <p className="text-lg text-gray-600">
                  Cập nhật xu hướng thời trang mới nhất
                </p>
              </div>
              <Link
                to="/blog"
                className="hidden md:flex items-center text-blue-600 hover:text-blue-800 font-semibold"
              >
                Xem tất cả
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts?.slice(0, 3).map((post, index) => (
                <article
                  key={`${post._id}-${index}`}
                  className="cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                  onClick={() => {
                    handleIncreaseView(post.slug);
                  }}
                >
                  <div className="relative overflow-hidden ">
                    <img
                      src={post.img[0]?.url}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {post.regex}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
                        Đọc thêm
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Partners */}
        <FashionBrandPartners />

        {/* All Products */}
        <div className="py-16">
          <div className="w-full mx-auto px-2 sm:px-0 lg:px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                TẤT CẢ SẢN PHẨM
              </h2>
              <p className="text-lg text-gray-600">
                Khám phá toàn bộ bộ sưu tập của chúng tôi
              </p>
            </div>
            <Clothing ListProducts={ListProducts} />
          </div>
        </div>
      </div>

      <ProductCart
        modalCartOpen={modalCartOpen}
        setModalCartOpen={setModalCartOpen}
        IdProduct={IdProduct}
        listItems={listItems}
        price={price}
        costPrice={costPrice}
        productname={productname}
        discount={discount}
      />
    </>
  );
};

export default Home;
