import { Button, Card, Flex, Rate, Skeleton } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import "./Home.css";
// Import Swiper styles
import "swiper/css";
import { Pagination } from "swiper/modules";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Clothing from "./Clothing/Clothing";
import { useState, useEffect } from "react";
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

const Home = () => {
  const { ListProducts } = useOutletContext();
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

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const SkeletonCard = () => (
    <Card
      style={{ width: 265.8 }}
      cover={
        <Skeleton.Image active={true} style={{ width: "100%", height: 200 }} />
      }
    >
      <Skeleton active={true} paragraph={{ rows: 3 }} />
    </Card>
  );

  const handleDetails = (id) => {
    navigate(`product/${id}`);
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
      duration: 1000, // Thời gian hiệu ứng (ms)
      once: true, // Hiệu ứng chỉ chạy một lần khi scroll
    });
  }, []);

  return (
    <>
      <SliderComponent />
      <div className="m-auto  home_doisin">
        <div className="flex justify-center m-auto items-center mt-8 ">
          <div className="title_line relative w-10  "></div>
          <h1 className="text-2xl font-bold" data-aos="fade-down-right">
            BẠN ĐANG TÌM KIẾM?
          </h1>
          <div className="title_line relative w-10  "></div>
        </div>
        <div className="dosin_home_hc flex flex-wrap  items-center gap-2 mt-4">
          <div
            className="doisin_hc_item flex flex-col items-center justify-center cursor-pointer"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img
                className="max-w-full h-auto text-center m-auto"
                src={Aokhoac}
                alt="Aokhoac"
              />

              <span className="">
                <span className="block font-semibold text-[#003644] ">
                  ÁO KHOÁC
                </span>
                <span className="">Áo khoác thời trang Nam/Nữ</span>
              </span>
            </Link>
          </div>
          <div
            className="doisin_hc_item flex flex-col items-center justify-center"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img className="max-w-full h-auto text-center m-auto" src={Ao} />
              <span className="">
                <span className="block font-semibold text-[#003644]">
                  ĐỒ NAM
                </span>
                <span className="">Áo thun, sơ mi, quần dài, sort...</span>
              </span>
            </Link>
          </div>
          <div
            className="doisin_hc_item flex flex-col items-center justify-center"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img
                className="max-w-full h-auto text-center m-auto"
                src={Quan}
                alt="Quần"
              />
              <span className="">
                <span className="block font-semibold text-[#003644]">
                  ĐỒ NỮ
                </span>
                <span className="">Áo quần, chân váy, đầm, yếm...</span>
              </span>
            </Link>
          </div>
          <div
            className="doisin_hc_item flex flex-col items-center justify-center"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img
                className="max-w-full h-auto text-center m-auto"
                src={Unisex}
                alt="Unisex"
              />
              <span className="">
                <span className="block font-semibold text-[#003644]">
                  ĐỒ UNISEX
                </span>
                <span className="">Áo thun, sơ mi, áo khoác UNISEX</span>
              </span>
            </Link>
          </div>
          <div
            className="doisin_hc_item flex flex-col items-center justify-center"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img
                className="max-w-full h-auto text-center m-auto"
                src={Phukien}
                alt="Unisex"
              />
              <span className="">
                <span className="block font-semibold text-[#003644]">
                  PHỤ KIỆN
                </span>
                <span className="">Balo, túi xách, nón, thắt lưng, ví...</span>
              </span>
            </Link>
          </div>
          <div
            className="doisin_hc_item flex flex-col items-center justify-center"
            data-aos="zoom-in-up"
          >
            <Link className="text-center hc_item">
              <img
                className="max-w-full h-auto text-center m-auto"
                src={logo}
                alt="Unisex"
              />
              <span className="">
                <span className="block font-semibold text-[#003644]">
                  #DOSIN
                </span>
                <span className="">
                  <span className="hc-desc">Sản phẩm được TOTODAY đề xuất</span>
                  .
                </span>
              </span>
            </Link>
          </div>
        </div>
        <div className="m-3">
          <h1 className=" text-xl font-bold h1_main">SẢN PHẨM NỔI BẬT</h1>
        </div>
        <div className="flex gap-5 mx-4 category_main">
          <Swiper
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
            className="mySwiper"
            // Default configuration for larger screens
            slidesPerView={5}
            spaceBetween={30}
            breakpoints={{
              // Default is for largest screen
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
              },
              // Tablet
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              // Mobile landscape
              576: {
                slidesPerView: 2,
                spaceBetween: 5,
              },
              // Mobile portrait
              320: {
                slidesPerView: 2,
                spaceBetween: 5,
              },
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
                              "/default-image.jpg"
                            }
                            alt={item.name}
                          />
                          {typeof item.discount !== "undefined" && (
                            <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                              -{item.discount || 0}%
                            </span>
                          )}
                          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100">
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
                          className="p-3"
                          onClick={() => handleDetails(item._id)}
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
                                <span className="text-xs  text-gray-500 line-through ml-2">
                                  {formatPrice(item.costPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Flex className="mt-2">
                            <Rate
                              tooltips={desc}
                              onChange={(value) => handleRate(item._id, value)}
                              value={ratings[item._id] || 0}
                              className="text-yellow-400"
                            />
                          </Flex>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
          </Swiper>
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
        </div>
        <div className=" mt-4">
          <h1 className="ml-4 mt-3 text-xl font-bold">TẤT CẢ SẢN PHẨM</h1>
          <Clothing ListProducts={ListProducts} />
        </div>
      </div>
    </>
  );
};

export default Home;
