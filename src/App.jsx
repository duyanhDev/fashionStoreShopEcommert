import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BsChatDots } from "react-icons/bs";
import {
  Bot,
  Phone,
  Instagram,
  Facebook,
  ArrowUp,
  X,
  Plus,
} from "lucide-react";
import "./App.css";
import Header from "./components/Header/Header";
// import required modules
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { CartListProduct } from "./service/Cart";
import Footer from "./components/Footer/Footer";
import Message from "./components/Messages/Message";
import { getMessagesList, UpdateIsReadAPI } from "./service/Message";
import { getListProductsAPI } from "./service/ApiProduct";

// Memoize các components con để tránh re-render
const MemoizedHeader = memo(Header);
const MemoizedFooter = memo(Footer);
const MemoizedMessage = memo(Message);

function App() {
  const { user } = useSelector((state) => state.auth);
  const [unread, setUnread] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [ListProducts, setListProducts] = useState([]);
  const [ListCart, setListCard] = useState([]);
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize các giá trị computed
  const hideFooter = useMemo(
    () => location.pathname === "/cart",
    [location.pathname]
  );
  const { pathname } = useLocation();
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  // Memoize scroll to top effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Memoize API calls với useCallback
  const ListProducsData = useCallback(async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data.EC === 0) {
        setListProducts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    ListProducsData();
  }, [ListProducsData]);

  const CartListProductsUser = useCallback(async () => {
    if (!user?._id) {
      return;
    }
    try {
      const res = await CartListProduct(user._id);
      if (res && res.data && res.data.EC === 0) {
        setListCard(res.data.data);
      } else {
        console.log("Failed to fetch cart products");
      }
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      CartListProductsUser();
    }
  }, [user, CartListProductsUser]);

  // Memoize scroll visibility effect
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

  // Memoize event handlers với useCallback
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleChatClick = useCallback(() => {
    if (user?.role === "customer") {
      setOpen((prev) => !prev);
      handelUpdateIsReadMess();
    }
    setIsMenuOpen(false);
  }, [user?.role]);

  const handleAIClick = useCallback(() => {
    navigate("/ChatAi");
    setIsMenuOpen(false);
  }, [navigate, user]);

  const fetchAPIMessasge = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await getMessagesList(user._id);
      if (res && res.EC === 0) {
        setUnread(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchAPIMessasge();
  }, [fetchAPIMessasge]);

  const handelUpdateIsReadMess = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await UpdateIsReadAPI("673017dde4526bd79cc61fa6", user._id);
      if (res) {
        // Handle success
      }
    } catch (error) {
      console.log(error);
    }
  }, [user?._id]);

  // Memoize unread messages calculation
  const unreadMessages = useMemo(() => {
    return unread && unread.length > 0 && unread.filter((item) => !item.isRead);
  }, [unread]);

  // Memoize menu items để tránh re-create mỗi lần render
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        icon: <Bot className="w-5 h-5" />,
        label: "AI Assistant",
        onClick: handleAIClick,
        color:
          "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
        glow: "shadow-green-500/30",
      },
    ];

    const customerItems =
      user?.role === "customer"
        ? [
            {
              icon: (
                <div className="relative">
                  <BsChatDots className="text-white text-xl" />
                  {unreadMessages && unreadMessages.length > 0 ? (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadMessages.length}
                    </span>
                  ) : (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {0}
                    </span>
                  )}
                </div>
              ),
              label: "Chat Support",
              onClick: handleChatClick,
              color:
                "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
              glow: "shadow-emerald-500/30",
            },
          ]
        : [];

    const socialItems = [
      {
        icon: <Phone className="w-5 h-5" />,
        label: "Zalo",
        onClick: () => {
          window.open("https://zalo.me/0123456789", "_blank");
          setIsMenuOpen(false);
        },
        color:
          "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
        glow: "shadow-teal-500/30",
      },
      {
        icon: <Instagram className="w-5 h-5" />,
        label: "Instagram",
        onClick: () => {
          window.open("https://instagram.com/your_instagram", "_blank");
          setIsMenuOpen(false);
        },
        color:
          "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600",
        glow: "shadow-green-500/30",
      },
      {
        icon: <Facebook className="w-5 h-5" />,
        label: "Facebook",
        onClick: () => {
          window.open("https://facebook.com/your_facebook", "_blank");
          setIsMenuOpen(false);
        },
        color:
          "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
        glow: "shadow-emerald-600/30",
      },
    ];

    return [...baseItems, ...customerItems, ...socialItems];
  }, [handleAIClick, handleChatClick, unreadMessages, user?.role]);

  // Memoize outlet context để tránh re-create object
  const outletContext = useMemo(
    () => ({
      ListProducts,
      CartListProductsUser,
      ListCart,
      user,
    }),
    [ListProducts, CartListProductsUser, ListCart, user]
  );

  // Memoize video chat component

  return (
    <div className="container_nav">
      <div className="nav_header">
        <MemoizedHeader
          user={user}
          ListCart={ListCart}
          CartListProductsUser={CartListProductsUser}
        />
        <div className="nav_menu flex justify-center items-center gap-3">
          <ul className="flex gap-10 lg:mt-3">
            {/* Navigation items - memoized để tránh re-render */}
            <li className="">
              <Link to="/unisex" className="">
                Sản phẩm
              </Link>
              <div className="absolute mt-3 w-full hover_item m-auto flex  ">
                <div className="flex flex-1 justify-between  border-r-2  border-black short_fitter ">
                  <div className="ml-4 ">
                    <h1
                      className="text-lg font-bold text-center border-b-2  border-black"
                      onClick={() =>
                        navigate("/unisex?currentPage=1&Category=Áo")
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
            <li className="">
              <Link to={"/male"}>Nam</Link>
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
            <li className="">
              <Link to="/female">Nữ</Link>
            </li>
            <li>
              <Link to="/unisex?Category=Phụ+Kiện&currentPage=1" target="_top">
                Phụ kiện
              </Link>
            </li>
            <li className="name_product_app">
              <Link target="_top">Thương hiệu</Link>
            </li>
            <li className="name_product_app">
              <Link to="/ranking">Xếp hạng</Link>
            </li>
            <li className="name_product_app">
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="content">
        <Outlet context={outletContext} />
      </div>

      <div className="fixed right-6 bottom-6 z-50">
        {/* Menu Items */}
        <div
          className={`absolute bottom-20 right-0 transition-all duration-500 ${
            isMenuOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          }`}
        >
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`mb-4 transform transition-all duration-100 ${
                isMenuOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
              style={{
                transitionDelay: isMenuOpen
                  ? `${index * 100}ms`
                  : `${(menuItems.length - index - 1) * 100}ms`,
              }}
            >
              <div className="flex items-center justify-end group">
                {/* Label */}
                <div className="mr-4 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap transform group-hover:translate-x-0 translate-x-2">
                  {item.label}
                  <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
                {/* Button */}
                <button
                  onClick={item.onClick}
                  className={`relative w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-xl ${item.glow} transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 group-hover:shadow-2xl overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">{item.icon}</div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`relative w-16 h-16 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-green-500/30 transform transition-all duration-500 hover:scale-110 hover:shadow-3xl overflow-hidden group ${
            isMenuOpen ? "rotate-45 scale-110" : "rotate-0 hover:rotate-12"
          }`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-active:scale-100 transition-transform duration-300"></div>
          <div className="relative z-10 transition-transform duration-300">
            {isMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Plus className="w-7 h-7" />
            )}
          </div>
        </button>

        {/* Scroll to Top Button */}
        <div
          className={`absolute -top-20 right-0 transition-all duration-500 ${
            isVisible && !isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={scrollToTop}
            className="w-12 h-12 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700 rounded-xl flex items-center justify-center text-white shadow-xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
          >
            <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed bottom-0 right-0 message_users">
          <MemoizedMessage open={open} setOpen={setOpen} />
        </div>
      )}

      {!hideFooter && <MemoizedFooter />}
    </div>
  );
}

export default App;
