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
} from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import "./Home.css";
// Import Swiper styles
import "swiper/css";
import { Pagination, Autoplay } from "swiper/modules";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Clothing from "./Clothing/Clothing";

import SliderComponent from "../Slider/Slider";
import Ao from "./../../assets/Image/Home/Ao.png";
import Quan from "./../../assets/Image/Home/Quan.png";
import Aokhoac from "./../../assets/Image/Home/Aok.png";
import Phukien from "./../../assets/Image/Home/Mu.png";
import logo from "./../../assets/Image/Home/Dosin.png";
import Unisex from "./../../assets/Image/Home/Unisex.png";
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
} from "@heroicons/react/24/outline";

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
      description: "Miễn phí ship toàn quốc cho đơn hàng từ 299K",
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
      style={{ width: "100%", maxWidth: 265.8 }}
      cover={
        <Skeleton.Image active={true} style={{ width: "100%", height: 200 }} />
      }
    >
      <Skeleton active={true} paragraph={{ rows: 3 }} />
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

  return (
    <>
      <SliderComponent />
      {contextHolder}

      <div className="home_doisin">
        {/* Category Section */}
        <div className="flex justify-center items-center mt-8 mb-6">
          <h1 className="responsive-title" data-aos="fade-down-right">
            BẠN ĐANG TÌM KIẾM?
          </h1>
        </div>
        <div className="dosin_home_hc">
          {/* ÁO KHOÁC */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="0"
            tabIndex={0}
            role="button"
            aria-label="Xem ÁO KHOÁC"
          >
            <Link
              className="hc_item"
              to="/unisex?Category=Áo+Khoác&currentPage=1"
            >
              <img
                src={Aokhoac}
                alt="ÁO KHOÁC"
                loading="lazy"
                className="m-auto"
              />
              <span>
                <span>ÁO KHOÁC</span>
                <span>Áo khoác thời trang Nam/Nữ</span>
              </span>
            </Link>
          </div>

          {/* ĐỒ NAM */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="100"
            tabIndex={0}
            role="button"
            aria-label="Xem ĐỒ NAM"
          >
            <Link className="hc_item" to="/male">
              <img src={Ao} alt="ĐỒ NAM" loading="lazy" className="m-auto" />
              <span>
                <span>ĐỒ NAM</span>
                <span>Áo thun, sơ mi, quần dài, sort...</span>
              </span>
            </Link>
          </div>

          {/* ĐỒ NỮ */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="200"
            tabIndex={0}
            role="button"
            aria-label="Xem ĐỒ NỮ"
          >
            <Link className="hc_item" to="/female">
              <img src={Quan} alt="ĐỒ NỮ" loading="lazy" className="m-auto" />
              <span>
                <span>ĐỒ NỮ</span>
                <span>Áo quần, chân váy, đầm, yếm...</span>
              </span>
            </Link>
          </div>

          {/* ĐỒ UNISEX */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="300"
            tabIndex={0}
            role="button"
            aria-label="Xem ĐỒ UNISEX"
          >
            <Link className="hc_item" to="/unisex">
              <img
                src={Unisex}
                alt="ĐỒ UNISEX"
                loading="lazy"
                className="m-auto"
              />
              <span>
                <span>ĐỒ UNISEX</span>
                <span>Áo thun, sơ mi, áo khoác UNISEX</span>
              </span>
            </Link>
          </div>

          {/* PHỤ KIỆN */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="400"
            tabIndex={0}
            role="button"
            aria-label="Xem PHỤ KIỆN"
          >
            <Link
              className="hc_item"
              to="/unisex?Category=Phụ+Kiện&currentPage=1"
            >
              <img
                src={Phukien}
                alt="PHỤ KIỆN"
                loading="lazy"
                className="m-auto"
              />
              <span>
                <span>PHỤ KIỆN</span>
                <span>Balo, túi xách, nón, thắt lưng, ví...</span>
              </span>
            </Link>
          </div>

          {/* #DOSIN */}
          <div
            className="doisin_hc_item fade-in"
            data-aos="zoom-in-up"
            data-aos-delay="500"
            tabIndex={0}
            role="button"
            aria-label="Xem #DOSIN"
          >
            <Link className="hc_item" to="/dosin">
              <img src={logo} alt="#DOSIN" loading="lazy" className="m-auto" />
              <span>
                <span>#DOSIN</span>
                <span>Sản phẩm được TOTODAY đề xuất</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Services Section */}
        <div className="section-padding" data-aos="fade-up">
          <div className="max-w-6xl mx-auto">
            <h2 className="responsive-title">DỊCH VỤ CỦA CHÚNG TÔI</h2>
            <div className="services-grid">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 bg-white"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="text-blue-600 mb-4 flex justify-center">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="section-padding">
          <h1 className="responsive-subtitle ml-4">SẢN PHẨM NỔI BẬT</h1>

          <div className="category_main px-4">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="mySwiper"
              slidesPerView={1}
              spaceBetween={10}
              breakpoints={{
                320: { slidesPerView: 2, spaceBetween: 10 },
                480: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 25 },
                1200: { slidesPerView: 5, spaceBetween: 30 },
              }}
            >
              {loading
                ? [...Array(5)].map((_, index) => (
                    <SwiperSlide key={`skeleton-${index}`}>
                      <SkeletonCard />
                    </SwiperSlide>
                  ))
                : ListProducts &&
                  ListProducts.length > 0 &&
                  ListProducts.map((item) => {
                    return (
                      <SwiperSlide key={item._id} className="w-full">
                        <div className="product-card rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="relative">
                            <img
                              className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                              src={
                                item.variants[0]?.images[0]?.url ||
                                "/placeholder.svg?height=200&width=200" ||
                                "/placeholder.svg"
                              }
                              alt={item.name}
                              loading="lazy"
                            />
                            {typeof item.discount !== "undefined" &&
                              item.discount > 0 && (
                                <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                  -{item.discount || 0}%
                                </span>
                              )}
                            <div className="absolute bottom-2 right-2 flex gap-2">
                              {isProductInWishlist.includes(item._id) ? (
                                <button
                                  className="p-1.5 rounded-full shadow-md bg-green-100"
                                  onClick={() => handleRemoveWishList(item._id)}
                                  aria-label="Xóa khỏi danh sách yêu thích"
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
                              ) : (
                                <button
                                  className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                                  onClick={() => handlAddWishList(item._id)}
                                  aria-label="Thêm vào danh sách yêu thích"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-600"
                                    fill="none"
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
                              )}
                              <button
                                className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div
                            className="p-3 cursor-pointer"
                            onClick={() => handleDetails(item.slug)}
                          >
                            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                              {item.brand}
                            </p>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mt-1">
                              {item.name}
                            </h3>
                            <div className="mt-2 flex items-center justify-between">
                              <div>
                                <span className="text-base font-bold text-red-600">
                                  {formatPrice(
                                    item.discountedPrice ||
                                      item.costPrice ||
                                      item.price
                                  )}
                                </span>
                                {item.discount > 0 && (
                                  <span className="text-xs text-gray-500 line-through ml-2">
                                    {formatPrice(item.costPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Flex className="mt-2">
                              <Rate
                                tooltips={desc}
                                onChange={(value) =>
                                  handleRate(item._id, value)
                                }
                                value={ratings[item._id] || 0}
                                className="text-yellow-400"
                                size="small"
                              />
                            </Flex>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
            </Swiper>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="section-padding bg-gray-50" data-aos="fade-up">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="responsive-title">KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI</h2>
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000 }}
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 25 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <Card className="h-full">
                    <div className="flex items-center mb-4">
                      <Avatar src={testimonial.avatar} size={50} />
                      <div className="ml-3">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <Rate
                      disabled
                      defaultValue={testimonial.rating}
                      className="mb-3"
                      size="small"
                    />
                    <p className="text-gray-700 mb-4">
                      "{testimonial.comment}"
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(testimonial.date).toLocaleDateString("vi-VN")}
                    </p>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Blog Section */}
        <div className="section-padding" data-aos="fade-up">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="responsive-subtitle">TIN TỨC & XU HƯỚNG</h2>
              <Link
                to="/blog"
                className="text-blue-600 hover:text-blue-800 text-sm md:text-base"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {blogPosts.map((post) => (
                <Card
                  key={post.id}
                  hoverable
                  cover={
                    <img
                      alt={post.title}
                      src={post.image || "/placeholder.svg"}
                      className="h-48 object-cover"
                      loading="lazy"
                    />
                  }
                  className="h-full"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div
          className="section-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          data-aos="fade-up"
        >
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ĐĂNG KÝ NHẬN TIN
            </h2>
            <p className="text-lg md:text-xl mb-8">
              Nhận thông tin về sản phẩm mới, ưu đãi đặc biệt và xu hướng thời
              trang
            </p>
            <Form
              form={form}
              onFinish={handleNewsletterSubmit}
              className="newsletter-form"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
                className="flex-1 mb-0"
              >
                <Input
                  placeholder="Nhập email của bạn"
                  size="large"
                  className="rounded-full"
                />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="bg-white text-blue-600 border-white hover:bg-gray-100 rounded-full px-8"
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Brand Partners */}
        <div className="section-padding" data-aos="fade-up">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="responsive-title">THƯƠNG HIỆU ĐỐI TÁC</h2>
            <div className="brands-grid">
              {brands.map((brand, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
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
        <div className="section-padding">
          <h1 className="responsive-subtitle ml-4">TẤT CẢ SẢN PHẨM</h1>
          <Clothing ListProducts={ListProducts} />
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
