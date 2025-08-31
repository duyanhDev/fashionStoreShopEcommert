import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Flex,
  notification,
  Rate,
  Skeleton,
  Avatar,
  Input,
  Form,
  Badge,
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
import AOS from "aos";
import "aos/dist/aos.css";
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
import { GiftIcon } from "lucide-react";

const Home = () => {
  const { ListProducts } = useOutletContext();
  const { user } = useSelector((state) => state.auth);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const desc = ["terrible", "bad", "normal", "good", "wonderful"];
  const [ratings, setRatings] = useState({});
  const [modalCartOpen, setModalCartOpen] = useState(false);
  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const [WishList, setWishList] = useState([]);
  const [form] = Form.useForm();

  // Sample data for new sections
  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Minh Anh",
      location: "Hà Nội",
      rating: 5,
      comment:
        "Chất lượng sản phẩm rất tốt, giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của DOSIN!",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      date: "2024-12-15",
    },
    {
      id: 2,
      name: "Trần Văn Nam",
      location: "TP.HCM",
      rating: 5,
      comment:
        "Thiết kế đẹp, chất liệu tốt, giá cả hợp lý. Sẽ tiếp tục ủng hộ shop!",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      date: "2024-12-10",
    },
    {
      id: 3,
      name: "Lê Thị Hương",
      location: "Đà Nẵng",
      rating: 5,
      comment:
        "Shop phục vụ tận tình, tư vấn nhiệt tình. Quần áo đẹp và chất lượng cao!",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      date: "2024-12-08",
    },
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Xu hướng thời trang Thu Đông 2024",
      excerpt:
        "Khám phá những xu hướng thời trang hot nhất mùa Thu Đông năm nay với DOSIN",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
      date: "2024-12-01",
      category: "Xu hướng",
    },
    {
      id: 2,
      title: "Cách phối đồ công sở chuyên nghiệp",
      excerpt:
        "Hướng dẫn phối đồ công sở thanh lịch và chuyên nghiệp cho cả nam và nữ",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      date: "2024-11-28",
      category: "Style Tips",
    },
    {
      id: 3,
      title: "Chăm sóc và bảo quản quần áo",
      excerpt:
        "Những mẹo hay giúp quần áo luôn như mới và bền đẹp theo thời gian",
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=250&fit=crop",
      date: "2024-11-25",
      category: "Chăm sóc",
    },
  ];

  const brands = [
    {
      name: "Nike",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
    },
    {
      name: "Adidas",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
    },
    {
      name: "Zara",
      logo: "https://logos-world.net/wp-content/uploads/2020/07/Zara-Logo.png",
    },
    {
      name: "H&M",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png",
    },
    {
      name: "Uniqlo",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Uniqlo-Logo.png",
    },
  ];

  const services = [
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: "Miễn phí vận chuyển",
      description: "Miễn phí ship toàn quốc cho tất cả đơn hàng",
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

  const handleRate = (productId, value) => {
    setRatings((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleNewsletterSubmit = (values) => {
    api.success({
      message: "Đăng ký thành công!",
      description:
        "Cảm ơn bạn đã đăng ký nhận tin từ DOSIN. Chúng tôi sẽ gửi những ưu đãi tốt nhất đến bạn!",
    });
    form.resetFields();
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
      <Skeleton active paragraph={{ rows: 4 }} />
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

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

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
      const res = await getWishlistAPI(user?._id);
      if (res && res.data && res.data.EC === 0) {
        setWishList(res.data.data.products);
      }
    } catch (error) {
      throw new Error("Lỗi lấy danh sách yêu thích");
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
    fetchListWishList();
  }, [user?._id]);

  const isProductInWishlist = WishList?.map((item) => item.product._id);

  // Get featured products (first 4)
  const featuredProducts = ListProducts?.slice(0, 5) || [];

  return (
    <>
      <SliderComponent />
      {contextHolder}

      <div className="home_doisin">
        {/* Category Section */}
        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-4">
            <div className="text-center mb-12">
              <h1
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                data-aos="fade-down-right"
              >
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
        <div
          className=" py-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl"
          data-aos="fade-up"
        >
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
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
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

        {/* Featured Products */}
        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  SẢN PHẨM NỔI BẬT
                </h2>
                <p className="text-lg text-gray-600">
                  Những sản phẩm được yêu thích nhất
                </p>
              </div>
              <Link
                to="/products"
                className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 group"
              >
                Xem tất cả
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(5)].map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {featuredProducts.map((item, index) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                        src={
                          item.variants[0]?.images[0]?.url ||
                          "/placeholder.svg?height=320&width=280"
                        }
                        alt={item.name}
                        loading="lazy"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Discount Badge */}
                      {typeof item.discount !== "undefined" &&
                        item.discount > 0 && (
                          <Badge.Ribbon
                            text={`-${item.discount}%`}
                            color="red"
                            className="ribbon-custom"
                          />
                        )}

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        {isProductInWishlist.includes(item._id) ? (
                          <button
                            className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
                            onClick={() => handleRemoveWishList(item._id)}
                            aria-label="Xóa khỏi danh sách yêu thích"
                          >
                            <HeartSolidIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:text-red-500 transition-all duration-300"
                            onClick={() => handlAddWishList(item._id)}
                            aria-label="Thêm vào danh sách yêu thích"
                          >
                            <HeartIcon className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:text-blue-500 transition-all duration-300"
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
                          aria-label="Thêm vào giỏ hàng"
                        >
                          <ShoppingBagIcon className="w-5 h-5" />
                        </button>

                        <button
                          className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white hover:text-green-500 transition-all duration-300"
                          onClick={() => handleDetails(item.slug)}
                          aria-label="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quick View Button */}
                      <button
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-lg"
                        onClick={() => handleDetails(item.slug)}
                      >
                        Xem nhanh
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-full">
                          {item.brand}
                        </span>
                        <div className="flex items-center">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            4.8
                          </span>
                        </div>
                      </div>

                      <h3
                        className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-300"
                        onClick={() => handleDetails(item.slug)}
                      >
                        {item.name}
                      </h3>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-red-500">
                            {formatPrice(
                              item.discountedPrice ||
                                item.costPrice ||
                                item.price
                            )}
                          </span>
                          {item.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.costPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Rate
                          disabled
                          defaultValue={4.8}
                          className="text-yellow-400 text-sm"
                          allowHalf
                        />
                        <span className="text-sm text-gray-500">
                          (24 đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button for Mobile */}
            <div className="md:hidden text-center mt-8">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
              >
                Xem tất cả sản phẩm
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div
          className="py-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl w-full"
          data-aos="fade-up"
        >
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Những phản hồi chân thực từ khách hàng đã tin tưởng DOSIN
              </p>
            </div>

            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 },
              }}
              className="testimonials-swiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 h-full border border-gray-100">
                    <div className="flex items-center mb-6">
                      <Avatar
                        src={testimonial.avatar}
                        size={60}
                        className="shadow-lg"
                      />
                      <div className="ml-4">
                        <h4 className="font-bold text-lg text-gray-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1 text-blue-500" />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>

                    <Rate
                      disabled
                      defaultValue={testimonial.rating}
                      className="mb-4 text-yellow-400"
                    />

                    <p className="text-gray-700 mb-6 italic leading-relaxed">
                      "{testimonial.comment}"
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                      {new Date(testimonial.date).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Blog Section */}
        <div className="py-16 bg-white" data-aos="fade-up">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-4">
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
              {blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative overflow-hidden">
                    <img
                      alt={post.title}
                      src={post.image || "/placeholder.svg"}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(post.date).toLocaleDateString("vi-VN")}
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`/blog/${post.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                      >
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
        <div className="py-16 bg-gray-50" data-aos="fade-up">
          <div className="w-full mx-auto px-4 sm:px-2 lg:px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                THƯƠNG HIỆU ĐỐI TÁC
              </h2>
              <p className="text-lg text-gray-600">
                Những thương hiệu uy tín mà chúng tôi hợp tác
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {brands.map((brand, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 grayscale hover:grayscale-0 transform hover:scale-105"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <img
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.name}
                    className="max-h-12 object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Products */}
        <div className="py-16 bg-white">
          <div className="w-full mx-auto px-2 sm:px-2 lg:px-4">
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
