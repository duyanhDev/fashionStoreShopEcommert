import { Button, Card, Skeleton } from "antd";
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
const Home = () => {
  const { ListProducts } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  const Image = ListProducts.map((item) => {
    return item.variants.map((product) => product.images[0].url);
  });
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
          {/* <div className="">
          <ul className="flex items-center gap-4">
            <li>ÁO</li>
            <li>QUẦN</li>
            <li>GIÀY</li>
            <li>MŨ</li>
            <li>DÉP</li>
          </ul>
        </div> */}
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
                  console.log(item);

                  return (
                    <SwiperSlide key={item._id} className="w-full">
                      <Card
                        hoverable
                        className="w-full"
                        cover={
                          <div className="hover_children">
                            <img
                              className="w-full h-64 object-cover"
                              alt="example"
                              src={item.variants[0]?.images[0]?.url}
                            />
                          </div>
                        }
                      >
                        <div
                          className="discount"
                          onClick={() => handleDetails(item._id)}
                        >
                          <p className="text-[#111] font-semibold p-1">
                            {item.brand}
                          </p>
                          <div
                            className="item_content"
                            style={{ maxWidth: "200px" }}
                          >
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
                              {item.name}
                            </span>
                          </div>
                          <span className="line-through text-[#222] opacity-60 p-1">
                            {item.discount ? (
                              <span>{formatPrice(item.costPrice)}</span>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="px-3">
                            {item.discountedPrice
                              ? formatPrice(item.discountedPrice)
                              : formatPrice(item.costPrice)}
                          </span>
                        </div>
                      </Card>
                    </SwiperSlide>
                  );
                })}
          </Swiper>
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
