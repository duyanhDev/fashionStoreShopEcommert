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
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import EnhancedProductsSection from "../EnhancedProductsSection/EnhancedProductsSection";
import {
  Award,
  Check,
  GiftIcon,
  Heart,
  MapPin,
  ShoppingBag,
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

  const SkeletonCard = () => (
    <Card
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      cover={<Skeleton.Image active style={{ width: "100%", height: 200 }} />}
    >
      <Skeleton active paragraph={{ rows: 5 }} />
    </Card>
  );

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
    })?.slice(0, 5) || [];

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
        SetBlogPosts(res.data.data); // dữ liệu hiển thị mặc định
        // tạo danh mục (nếu cần unique)
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);

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

        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-4 sm:px-0 lg:px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  SẢN PHẨM NỔI BẬT
                </h2>
                <p className="text-lg text-gray-600">
                  Những sản phẩm được yêu thích nhất
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {[...Array(5)].map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {featuredProducts.map((item, index) => {
                  const isOutOfStock = item.stock === 0;
                  return (
                    <div
                      key={`featured-${index}`}
                      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                      onClick={() => handleDetails(item.slug)}
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden">
                        <div className="aspect-square relative bg-gray-50 cursor-pointer">
                          <img
                            src={
                              item.variants?.[0]?.images?.[0]?.url ||
                              "/placeholder.svg?height=320&width=280"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg transform rotate-12 shadow-lg">
                              SOLD OUT
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
                          {typeof item.discount !== "undefined" &&
                            item.discount > 0 && (
                              <div className="bg-green-600 text-white lg:text-lg font-semibold px-1.5 sm:px-2 sm:text-sm py-0.5 sm:py-1 rounded">
                                -{item.discount}%
                              </div>
                            )}
                          {index < 3 && (
                            <div className="bg-black text-white lg:text-lg sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                              TOP {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {isProductInWishlist.includes(item._id) ? (
                            <button
                              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveWishList(item._id);
                              }}
                            >
                              <HeartSolidIcon className="h-4 w-4 text-green-600" />
                            </button>
                          ) : (
                            <button
                              className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlAddWishList(item._id);
                              }}
                            >
                              <HeartIcon className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          <button
                            className="bg-green-600 text-white p-1.5 sm:p-2 rounded-full shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handelModelProductCart(
                                item._id,
                                item.variants,
                                item.price,
                                item.discountedPrice,
                                item.name,
                                item.discount
                              );
                            }}
                          >
                            <ShoppingBagIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                          <button
                            className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDetails(item.slug);
                            }}
                          >
                            <EyeIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="space-y-1">
                          <div className="lg:text-lg sm:text-xs font-medium text-green-600 uppercase tracking-wide">
                            {item.brand}
                          </div>
                          <h3
                            className="font-medium text-gray-900 line-clamp-2 lg:text-lg sm:text-xs leading-tight hover:text-green-600 transition-colors duration-200 cursor-pointer
                            whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {item.name}
                          </h3>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-between">
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
                            style={{ fontSize: "12px" }}
                          />
                          <span className="text-sm text-gray-500">
                            ({item.ratings.length} đánh giá)
                          </span>
                        </div>

                        {/* Price */}
                        <div className="space-y-1">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All Button for Mobile */}
            <div className="md:hidden text-center mt-8">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Xem tất cả sản phẩm
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
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
                                {testimonial.userId.address.city}
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
                              <Calendar className="w-3 h-3 mr-1" />
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
                <div className="text-sm text-gray-600">Kinh nghiệm</div>
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
              {blogPosts.slice(0, 3).map((post, index) => (
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
