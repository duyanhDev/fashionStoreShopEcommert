import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import { getListProductsAPI } from "./service/ApiProduct";

// import required modules

import { useEffect, useRef } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { CartListProduct } from "./service/Cart";
import Footer from "./components/Footer/Footer";
import { UpOutlined } from "@ant-design/icons";
import Message from "./components/Messages/Message";
function App() {
  const { user } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [ListProducts, setListProducts] = useState([]);
  const [ListCart, setListCard] = useState([]);
  const [open, setOpen] = useState(false);
  const Navigate = useNavigate();
  const location = useLocation();
  const hideFooter = location.pathname === "/cart";
  const ListProducsData = async () => {
    try {
      let res = await getListProductsAPI();

      if (res && res.data.EC === 0) {
        setListProducts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    ListProducsData();
  }, []);

  console.log(user);

  const CartListProductsUser = async () => {
    if (!user?._id) {
      // Handle the case where user._id is not available
      setError("User is not authenticated");
      return;
    }

    try {
      const res = await CartListProduct(user._id);
      if (res && res.data && res.data.EC === 0) {
        setListCard(res.data.data);
      } else {
        setError("Failed to fetch cart products");
      }
    } catch (error) {
      console.log(error);
      setError("An error occurred while fetching the cart");
    }
  };

  user &&
    useEffect(() => {
      CartListProductsUser();
    }, [user._id]);

  useEffect(() => {
    const navHeader = document.querySelector(".nav_header");

    const handleScroll = () => {
      if (navHeader) {
        const navHeight = navHeader.offsetHeight;
        const scrolled = window.scrollY;

        setIsVisible(scrolled > navHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="container_nav">
      <div className="nav_header">
        <Header
          user={user}
          ListCart={ListCart}
          CartListProductsUser={CartListProductsUser}
        />
        <div className="nav_menu flex justify-center items-center gap-3">
          <ul className="flex gap-10">
            <li className="product_hover">
              <Link to="/category/unisex" className="">
                Sản phẩm
              </Link>
              <div className="absolute mt-3 w-full hover_item m-auto flex  ">
                <div className="flex flex-1 justify-between  border-r-2  border-black short_fitter ">
                  <div className="ml-4 ">
                    <h1
                      className="text-lg font-bold text-center border-b-2  border-black"
                      onClick={() =>
                        Navigate("category/unisex?currentPage=1&Category=Áo")
                      }
                    >
                      Áo
                    </h1>
                    <div className="">
                      <div>
                        <Link>Tất cả các loại áo</Link>
                      </div>
                      <div>
                        <Link>Áo sơ mi</Link>
                      </div>
                      <div>
                        <Link>Áo thun</Link>
                      </div>
                      <div>
                        <Link>Áo polo</Link>
                      </div>
                      <div>
                        <Link>Áo khoác</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Quần
                    </h1>
                    <div className="">
                      <div>
                        <Link>Tất cả các loại quần</Link>
                      </div>
                      <div>
                        <Link>Quần jeans</Link>
                      </div>
                      <div>
                        <Link>Quần short</Link>
                      </div>
                      <div>
                        <Link>Quần dài</Link>
                      </div>
                      <div>
                        <Link>Quần thể thao</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Giày
                    </h1>
                    <div className="">
                      <div>
                        <Link>Tất cả các loại giày</Link>
                      </div>
                      <div>
                        <Link>Giày sneaker</Link>
                      </div>
                      <div>
                        <Link>Giày thể thao</Link>
                      </div>
                      <div>
                        <Link>Giày sandal </Link>
                      </div>
                      <div>
                        <Link>Giày boot</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 mr-2 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Túi
                    </h1>
                    <div className="">
                      <div>
                        <Link>Tất cả các loại túi</Link>
                      </div>
                      <div>
                        <Link>Giày sneaker</Link>
                      </div>
                      <div>
                        <Link>Giày thể thao</Link>
                      </div>
                      <div>
                        <Link>Giày sandal </Link>
                      </div>
                      <div>
                        <Link>Giày boot</Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1">
                  <div className="image_banner ml-4 mt-3">
                    <div>
                      <img
                        src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-dkmv-ao-thun-nu-phong-rong-in-hinh-mau-trang-ao-thun-nu-white-surfing-tee-dkmv-46824468245.jpg?w=320&h=320&fit=fill&fm=webp"
                        alt="lỗi"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                    <div className="mt-5">
                      <img
                        src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-cotton-nu-don-t-kill-my-vibe-mau-trang-vibration-468312468312.jpg?w=670&h=670&fit=fill&fm=webp"
                        alt="lỗi"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 ml-10">
                    <img
                      src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-unisex-form-rong-nu-mau-trang-dontkill-my-vibe-dkmv-always-smile-tee-white-4468344.jpg?w=670&h=670&fit=fill&fm=webp"
                      alt="lỗi"
                      style={{
                        width: "320px",
                        height: "320px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>

            <li className="product_hover">
              <Link to={"category/male"}>Nam</Link>
              <div className="absolute mt-3 w-full hover_item m-auto flex  ">
                <div className="flex flex-1 justify-between  border-r-2  border-black short_fitter ">
                  <div className="ml-4 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Áo khoác
                    </h1>
                    <div className="">
                      <div>
                        <Link>Tất cả áo khoác</Link>
                      </div>
                      <div>
                        <Link>Áo khoác da</Link>
                      </div>
                      <div>
                        <Link>Áo khoác bomber</Link>
                      </div>
                      <div>
                        <Link>Áo khoác Denimin</Link>
                      </div>
                      <div>
                        <Link>Áo khoác Varsity</Link>
                      </div>
                      <div>
                        <Link>Áo khoác Jacket</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Áo thun
                    </h1>
                    <div className="">
                      <div>
                        <Link>Áo thun không tay</Link>
                      </div>
                      <div>
                        <Link>Áo thun tay dài</Link>
                      </div>
                      <div>
                        <Link>Áo thun tay ngắn</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Áo sơ mi
                    </h1>
                    <div className="">
                      <div>
                        <Link>Áo sơ mi tay ngắn</Link>
                      </div>
                      <div>
                        <Link>Áo sơ mi tay dài</Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 mr-2 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Quần
                    </h1>
                    <div className="">
                      <div>
                        <Link>Quần jean</Link>
                      </div>
                      <div>
                        <Link>Quần ngắn</Link>
                      </div>
                      <div>
                        <Link>Quần dài</Link>
                      </div>
                      <div>
                        <Link>Quần jogger </Link>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 mr-2 ">
                    <h1 className="text-lg font-bold text-center border-b-2  border-black">
                      Giày
                    </h1>
                    <div className="">
                      <div>
                        <Link>Giày sneaker</Link>
                      </div>
                      <div>
                        <Link>Giày thể thao</Link>
                      </div>
                      <div>
                        <Link>Giày cao cổ</Link>
                      </div>
                      <div>
                        <Link>Giày tây</Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1">
                  <div className="image_banner ml-4 mt-3">
                    <div>
                      <img
                        src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-dkmv-ao-thun-nu-phong-rong-in-hinh-mau-trang-ao-thun-nu-white-surfing-tee-dkmv-46824468245.jpg?w=320&h=320&fit=fill&fm=webp"
                        alt="lỗi"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                    <div className="mt-5">
                      <img
                        src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-cotton-nu-don-t-kill-my-vibe-mau-trang-vibration-468312468312.jpg?w=670&h=670&fit=fill&fm=webp"
                        alt="lỗi"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 ml-10">
                    <img
                      src="https://dosi-in.com/file/detailed/468/dosiin-dkmv-ao-thun-unisex-form-rong-nu-mau-trang-dontkill-my-vibe-dkmv-always-smile-tee-white-4468344.jpg?w=670&h=670&fit=fill&fm=webp"
                      alt="lỗi"
                      style={{
                        width: "320px",
                        height: "320px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
            <li className="product_hover">
              <Link to="category/female">Nữ</Link>
            </li>
            <li>
              <Link>Phụ kiện</Link>
            </li>
            <li>
              <Link>Thương hiệu</Link>
            </li>
            <li>
              <Link to="/ranking">Xếp hạng</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="content">
        <Outlet
          context={{ ListProducts, CartListProductsUser, ListCart, user }}
        />
      </div>

      <div className="fixed right-0 bottom-0 mb-24 chat_ai transition-opacity duration-300 z-10">
        <button
          className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors text-wrap"
          onClick={() => Navigate("/ChatAi")}
        >
          AI
        </button>
      </div>

      {user?.isAdmin === false ? (
        <div className="fixed right-0 bottom-14 mb-24 chat_sp transition-opacity duration-300 z-10">
          <button
            className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors text-wrap"
            onClick={() => setOpen((prev) => !prev)}
          >
            CHAT
          </button>
        </div>
      ) : (
        <div></div>
      )}

      {open && (
        <div className="fixed bottom-0 right-0 message_users">
          <Message open={open} setOpen={setOpen} />
        </div>
      )}
      <div
        className={`fixed right-0 bottom-0 mb-7 transition-opacity duration-300 z-10 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
        >
          <UpOutlined className="text-[#fff]" />
        </button>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
