import "./Blog.css";
import main_pc from "./../../assets/Image/main-pc.png";
import concept from "../../assets/Image/concept-el-1.svg";
import lion from "../../assets/Image/gryffindor.svg";
import snake from "../../assets/Image/slytherin.svg";
import concept3 from "../../assets/Image/concept-el-3.svg";
import soi from "../../assets/Image/hufflepuff.svg";
import daibang from "../../assets/Image/ravenclaw.svg";
import content from "../../assets/Image/badge-2.webp";
import { useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useRef } from "react";
const Blog = () => {
  const { user, ListProducts } = useOutletContext();
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  const ProductBestSale =
    ListProducts &&
    ListProducts.length > 0 &&
    ListProducts.filter((item) => item.sold > 2100);

  return (
    <div className="main_blog">
      <div className="relative group overflow-hidden">
        {/* Hình ảnh */}
        <img
          src={main_pc}
          alt="Harry Potter"
          className="w-full transition-transform duration-500 group-hover:scale-110"
        />

        {/* Lớp overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-500"></div>

        {/* Nội dung hiển thị khi hover */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <h1 className="text-2xl font-bold">GIỚI THIỆU</h1>
          <p className="text-sm mt-2">
            Khám phá thế giới phép thuật của OWNDAYS x Harry Potter
          </p>
        </div>
      </div>

      <div className="w-full h-full mt-20">
        <div className="m-auto text-center flex justify-center items-center ">
          <img src={concept} alt="lion" className="w-1/4" />
        </div>
        <div className="w-1/2 m-auto text-center flex justify-between items-center gap-10 ">
          <img src={lion} alt="lion" />
          <div className="text-white mt-2">
            <h1>Trải nghiệm thế giới kỳ diệu của DoisinIn</h1>
            <h2 className="Text_h2 ">
              Bắt đầu cuộc hành trình thú vị cùng bộ sưu tập Quần áo, Giày và
              Phụ kiện DoisinIn x OWNDAYS. Bộ sưu tập giới hạn này mang đến
              nhiều thiết kế độc đáo, sử dụng chất liệu cao cấp như cotton
              thoáng mát và da bền bỉ, tôn vinh phong cách thời trang hiện đại
              lấy cảm hứng từ thế giới phép thuật. Mỗi mẫu quần áo và giày trong
              bộ sưu tập đều mang dấu ấn đặc trưng, từ áo hoodie ấm áp, áo thun
              cá tính đến giày sneakers năng động. Các chi tiết như biểu tượng
              bảo bối tử thần Deathly Hallows, hình ảnh cây đũa phép, chổi bay
              hay đồng hồ Time-Turner của Hermione được thể hiện tinh tế, tạo
              nên một phong cách thời trang đậm chất huyền bí và cá tính.
            </h2>
          </div>
          <img src={snake} alt="lion" />
        </div>

        <div className="w-1/2 m-auto text-center flex justify-center items-center gap-10">
          <Link className="l-hp__btn-inner" to="/">
            <i>T</i>
            <i>ấ</i>
            <i>t</i>
            <i>&nbsp;</i>
            <i>c</i>
            <i>ả</i>
            <i>&nbsp;</i>
            <i>m</i>
            <i>ó</i>
            <i>n</i>
            <i>&nbsp;</i>
            <i>đ</i>
            <i>ồ</i>
          </Link>
        </div>
        <div className="w-1/2 m-auto flex justify-between items-center">
          <img src={soi} alt="sói" />
          <div className="mt-16">
            <img src={concept3} alt="cúp" />
          </div>
          <img src={daibang} alt="sói" />
        </div>
        <div className="mt-40 w-1/2 m-auto">
          <h2 className="l-hp__title">
            <span>Best Seller</span>
          </h2>
          <div className="w-full grid grid-cols-3 gap-4">
            {ProductBestSale &&
              ProductBestSale.length > 0 &&
              ProductBestSale.map((item, index) => {
                return (
                  <div className="card h-80  w-full">
                    <div className="content_blog">
                      <div className="back">
                        <div className="back-content">
                          <div className="-m-2">
                            <div className="img mt-12px px-3">
                              <img
                                className="w-full h-auto object-cover"
                                src={
                                  item.variants[0]?.images[0]?.url ||
                                  "default-image-url"
                                }
                              />
                            </div>
                          </div>

                          <strong className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] block">
                            {item.name}
                          </strong>
                        </div>
                      </div>
                      <div className="front">
                        <div className="img">
                          <img src={item.variants[0]?.images[0]?.url} />
                          <div className="circle"></div>
                          <div className="circle" id="right"></div>
                          <div className="circle" id="bottom"></div>
                        </div>

                        <div className="front-content">
                          <small className="badge">Pasta</small>
                          <div className="description">
                            <div className="title">
                              <p className="title">
                                <strong className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] block">
                                  {item.name}
                                </strong>
                              </p>
                            </div>
                            <p className="card-footer">
                              {formatPrice(item.costPrice)} &nbsp; | &nbsp;{" "}
                              {item.discount}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="w-full flex  justify-between gap-2 mt-20">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          className="mySwiper flex-grow basis-[60%]"
        >
          <SwiperSlide className="main_image ">
            <img
              src="https://media3.coolmate.me/cdn-cgi/image/width=1800,height=1200,quality=80,format=auto/uploads/March2025/Active_women_1.jpg"
              alt="loi"
              className="h-full object-cover"
            />
          </SwiperSlide>
          <SwiperSlide className="main_image ">
            <img
              src="https://pos.nvncdn.com/d0f3ca-7136/album/albumCT/20231222_OLXAhETY.jpg"
              alt="loi"
              className="h-full object-contain"
            />
          </SwiperSlide>

          <div className="autoplay-progress" slot="container-end">
            <svg viewBox="0 0 48 48" ref={progressCircle}>
              <circle cx="24" cy="24" r="20"></circle>
            </svg>
            <span ref={progressContent}></span>
          </div>
        </Swiper>

        <div className="flex-grow basis-[40%] m-auto">
          <div className="flex  justify-center items-center gap-2">
            <img src={content} className="w-32 h-32" alt="gioi thieu" />
            <h1 className="text-4xl font-bold text-[#f9c967]">Dosiin là ai?</h1>
          </div>
          <p className="text-center p-4 text-white font-bold  p_text">
            Một Website bán đồ thời trang Online cho tất cả giới tính nhưng toàn
            bị chê chưa có tính thời trang trong thiết kế? Một Startup ứng dụng
            công nghệ để thay đổi ngành thời trang truyền thống theo hướng D2C
            Online, mang lại sự tiện lợi và tiết kiệm hơn cho các đấng mày râu
            ,chị em? Một Thương Hiệu đồ thời trang cho nam giới ,phụ nữ , hướng
            tới các sản phẩm tối giản, tập trung vào chất liệu và sự bền vững:
            Substainable Fashion? ? Một doanh nghiệp bán hàng Online đầu tiên
            tại Việt Nam có chính sách kỳ quặc: cho phép khách hàng đổi trả sản
            phẩm tới 60 ngày kể cả đã qua sử dụng? Một "Zappos" của Việt Nam khi
            đứng ra cam kết hài lòng 100% cho khách hàng mua sắm Online bằng 11
            điều cụ thể? Một Startup nguồn lực hạn chế đã có chương trình
            Care&Share đóng góp cho hoạt động từ thiện ý nghĩa? Một Startup mới
            3 năm tuổi còn gặp nhiều khó khăn mà đi xây dựng Văn Hóa Doanh
            Nghiệp?
          </p>
        </div>
      </div>

      <div className="w-full flex items-center justify-between gap-4 mt-16 px-14">
        <div className="w-1/2">
          <h1 className="text-white text-2xl font-bold ">VĂN HÓA DOSIIN</h1>
          <div>
            <span className="text-white text_span-title">
              Ở DOSIIN, văn hóa không chỉ là một bộ tài liệu, mà đó là "cẩm
              nang" và "quy tắc ứng xử" cho tất cả nhân viên của DOSIIN bất kể
              ai, và bất kể vị trí gì. DOSIIN coi việc xây dựng Văn Hóa là một
              phần quan trọng trong việc xây dựng doanh nghiệp phát triển mạnh
              và bền vững. 10 điều về Văn Hóa DOSIIN được coi là "bộ luật
              DOSIIN" định hướng cho mọi hành vi và tính cách của con người
              DOSIIN.
            </span>
          </div>
        </div>

        <div className="text-white w-1/2">
          <img
            className="w-full h-auto"
            src="https://media3.coolmate.me/cdn-cgi/image/quality=80,format=auto/uploads/October2023/mceclip0_65.png"
            alt="lỗis"
          />
        </div>
      </div>
    </div>
  );
};

export default Blog;
