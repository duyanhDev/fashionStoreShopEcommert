import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import {
  IoSearch,
  IoNotificationsOutline,
  IoCartOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import {
  Dropdown,
  Button,
  Drawer,
  Modal,
  message,
  Badge,
  notification,
} from "antd";
import { LogoutOutlined, WalletOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout, Search as SearchAction } from "../../redux/actions/Auth";
import { useEffect, useState, useCallback } from "react";
import { RemoveCartOnePorduct, UpdateCartQuantity } from "../../service/Cart";
import ClipLoader from "react-spinners/ClipLoader";
import {
  AllReadNotifications,
  DeleteAllNotificationsAPI,
  FetcDataNocatifions,
  UpdateDataNocatifions,
} from "../../service/ApiNocatifions";
import Search from "../SearchProducts/Search";
import { searchProductsByNameAPI } from "../../service/ApiProduct";
import { HiShoppingBag } from "react-icons/hi";
import { MdDeleteForever, MdOutlineVolunteerActivism } from "react-icons/md";
import { debounce } from "lodash";

import {
  FaBookReader,
  FaCartArrowDown,
  FaRegListAlt,
  FaRegUserCircle,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";
import Logo from "./../../assets/Image/Home/logo.png";
import NavigationMenu from "../NavigationMenu/NavigationMenu";

const Header = ({ user, ListCart, CartListProductsUser, setListCard }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const page = 1;
  const [open, setOpen] = useState(false);
  const [showHiden, setShowHiden] = useState(false);
  const [openSerch, setOpenSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState();
  const [loadingSpin, setLoadingSpin] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [DataNotifications, setDataNotifications] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [totalPage, setTotalPage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [inputValue, setInputValue] = useState({}); // Local state for input values

  const [api, contextHolder] = notification.useNotification();
  const handleLogOut = async () => {
    localStorage.removeItem("token");
    setListCard([]);
    dispatch(logout());
    navigate("/login");
  };

  const showLoading = () => {
    setOpen(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const itemStyle = {
    minWidth: 200,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const items = [
    {
      key: "user-name",
      label: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <span className="font-semibold text-gray-900">
            {user?.name || "My name"}
          </span>
        </div>
      ),
      disabled: true,
      style: { ...itemStyle, padding: "12px 16px" },
    },
    { type: "divider" },
    {
      key: "profile",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <FaRegUserCircle size={16} className="text-white" />
        </div>
      ),
      label: (
        <span className="text-gray-700 font-medium">Thông tin tài khoản</span>
      ),
      onClick: () => {
        navigate(`/profile/${user?.name || ""}`);
        setMobileMenuOpen(false);
      },
      style: { ...itemStyle, padding: "12px 16px" },
    },
    ...(user
      ? [
          {
            key: "orders",
            icon: (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FaRegListAlt size={16} className="text-white" />
              </div>
            ),
            label: (
              <span className="text-gray-700 font-medium">
                Đơn hàng của tôi
              </span>
            ),
            onClick: () => {
              navigate("/order");
              setMobileMenuOpen(false);
            },
            style: { ...itemStyle, padding: "12px 16px" },
          },
        ]
      : []),
    { type: "divider" },
    ...(user?.role === "admin" || user?.role === "staff"
      ? [
          {
            key: "admin",
            icon: (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <RiAdminLine size={16} className="text-white" />
              </div>
            ),
            label: (
              <span className="text-gray-700 font-medium">Quản trị viên</span>
            ),
            onClick: () => {
              navigate("/admin");
              setMobileMenuOpen(false);
            },
            style: { ...itemStyle, padding: "12px 16px" },
          },
          { type: "divider" },
        ]
      : []),
    {
      key: "settings",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
          <WalletOutlined size={16} className="text-white" />
        </div>
      ),
      label: <span className="text-gray-700 font-medium">Ví Voucher</span>,
      onClick: () => {
        navigate("/voucher-wallet");
        setMobileMenuOpen(false);
      },
      style: { ...itemStyle, padding: "12px 16px" },
    },
    {
      key: "settings",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
          <MdOutlineVolunteerActivism size={16} className="text-white" />
        </div>
      ),
      label: (
        <span className="text-gray-700 font-medium">Danh sách yêu thích</span>
      ),
      onClick: () => {
        navigate("/wishlist");
        setMobileMenuOpen(false);
      },
      style: { ...itemStyle, padding: "12px 16px" },
    },
    {
      key: "auth",
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
          <LogoutOutlined className="text-white text-sm" />
        </div>
      ),
      label: (
        <span className="text-gray-700 font-medium">
          {user?.name ? "Đăng Xuất" : "Đăng Nhập"}
        </span>
      ),
      onClick: handleLogOut,
      style: { ...itemStyle, padding: "12px 16px" },
    },
  ].filter(Boolean);

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ";
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const handleRemoveCartProduct = async (id) => {
    try {
      setLoadingSpin(true);
      const res = await RemoveCartOnePorduct(ListCart._id, id, user._id);

      if (res && res.data) {
        setTimeout(() => {
          setLoadingSpin(false);
          CartListProductsUser();
          message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        }, 1000);
      } else {
        throw new Error(res.data?.message || "Remove failed");
      }
    } catch (error) {
      setLoadingSpin(false);
      console.error("Error in handleRemoveCartProduct:", error);
      message.error("Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

  const handlePay = () => {
    setLoadingCart(true);
    try {
      setOpen(false);
      const timer = setTimeout(() => {
        setLoadingCart(false);
      }, 1000);
      navigate("cart");
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in handlePay:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowNocations = () => {
    setShowHiden(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const FetchDataNocatifionsAPI = async () => {
    try {
      let res = await FetcDataNocatifions(user._id);
      if (res && res.data && res.data.EC === 0) {
        setDataNotifications(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      FetchDataNocatifionsAPI();
    }
  }, [user]);

  const handleReadsNocations = async () => {
    setShowHiden(true);
    setLoading(true);
    try {
      const res = await AllReadNotifications(user._id);

      if (res && res.data && res.data.EC === 0) {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        FetchDataNocatifionsAPI();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNocations = async () => {
    setShowHiden(true);
    setLoading(true);
    try {
      const res = await DeleteAllNotificationsAPI(user._id);

      if (res && res.data && res.data.EC === 0) {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        FetchDataNocatifionsAPI();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 30) {
      return `${diffInDays} ngày trước`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} tháng trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  }

  const handleBtnNocafition = async (id, orderId) => {
    try {
      navigate(`/orderstatus/${orderId}`);
      let res = await UpdateDataNocatifions(id);
      if (res && res.data && res.data.EC === 0) {
        FetchDataNocatifionsAPI();
        setShowHiden(false);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const handleSearchProducts = () => {
    setOpenSearch(true);
    setShowSearch(true);
  };

  const handleChangeInput = (e) => {
    const value = e.target.value;

    if (value.length > 32) {
      api.warning({
        message: `Bạn không nên nhập quá 32 kí tự  `,
        description: "Không được nhập quá 32 ký tự",
      });
      setKeywordSearch("");
    } else {
      setKeywordSearch(value);
      setShowSearch(true);
    }
  };

  const FetchSearhProductsAPI = async (keyword = keywordSearch) => {
    try {
      const res = await searchProductsByNameAPI(keyword, page);
      if (res && res.data && res.data.EC === 0) {
        setData(res.data.data);
        setTotalPage(res.data.totalPages);
        setShowSearch(false);
      } else {
        setData([]);
        setShowSearch(true); // hiện thông báo không tìm thấy
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setData([]);
      setShowSearch(true);
    }
  };

  // ✅ debounce cho phần nhập gõ chữ
  const debouncedFetchSearch = useCallback(
    debounce((keyword) => {
      if (keyword.trim()) {
        FetchSearhProductsAPI(keyword);
      } else {
        setData([]);
        setTotalPage(0);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetchSearch(keywordSearch);
    return () => debouncedFetchSearch.cancel();
  }, [keywordSearch, debouncedFetchSearch]);

  const btnHandleChangeSearch = async () => {
    setOpenSearch(false);
    const keyword = keywordSearch.trim();

    if (!keyword) {
      message.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    // Gọi API trực tiếp khi bấm nút
    await FetchSearhProductsAPI(keyword);

    navigate(`search?q=${keyword}`);
    dispatch(SearchAction(data, totalPage));
    setSearchVisible(false);
    setKeywordSearch("");
  };

  const unreadNotifications = (DataNotifications || []).filter(
    (item) =>
      item.read === false && item.isCheck === false && item.isAdmin === false
  );

  const handleMinus = (cartId, currentQuantity) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      setInputValue((prev) => ({ ...prev, [cartId]: newQuantity }));
      debouncedUpdate(cartId, newQuantity);
    }
  };
  const handlePlus = (cartId, currentQuantity) => {
    const cartItem = ListCart.items.find((item) => item._id === cartId);
    if (!cartItem) return;

    // Lấy variant theo color
    const variant = cartItem.productId.variants.find(
      (v) => v.color === cartItem.color
    );

    // Lấy size object theo size
    const sizeObj = variant?.sizes.find((s) => s.size === cartItem.size);

    // Số lượng tối đa có thể mua
    const maxQuantity = sizeObj?.quantity || Infinity;

    const newQuantity = currentQuantity + 1;

    if (newQuantity > maxQuantity) {
      message.warning(`Số lượng tối đa là ${maxQuantity}!`);
      setInputValue((prev) => ({ ...prev, [cartId]: maxQuantity }));
      debouncedUpdate(cartId, maxQuantity);
    } else {
      setInputValue((prev) => ({ ...prev, [cartId]: newQuantity }));
      debouncedUpdate(cartId, newQuantity);
    }
  };

  const handleInputChange = (cartId, value) => {
    if (value === "" || /^[0-9]*$/.test(value)) {
      setInputValue((prev) => ({ ...prev, [cartId]: value }));
    }

    if (value === "") return;

    const quantity = parseInt(value);
    const cartItem = ListCart.items.find((item) => item._id === cartId);

    // Lấy variant theo color
    const variant = cartItem.productId.variants.find(
      (v) => v.color === cartItem.color
    );

    // Lấy size object theo size
    const sizeObj = variant?.sizes.find((s) => s.size === cartItem.size);

    // Số lượng tối đa có thể mua
    const maxQuantity = sizeObj?.quantity || Infinity;

    if (quantity === 0) {
      handleRemoveCartProduct(cartId);
    } else if (quantity > maxQuantity) {
      message.warning(`Số lượng tối đa là ${maxQuantity}!`);
      setInputValue((prev) => ({ ...prev, [cartId]: maxQuantity }));
      debouncedUpdate(cartId, maxQuantity);
    } else {
      const validQuantity = Math.max(1, quantity);
      debouncedUpdate(cartId, validQuantity);
    }
  };

  const handleBlur = (cartId, value) => {
    if (value === "" || isNaN(value)) {
      const currentQuantity =
        ListCart.items.find((item) => item._id === cartId)?.quantity || 1;
      setInputValue((prev) => ({ ...prev, [cartId]: currentQuantity }));
      debouncedUpdate(cartId, currentQuantity);
    }
  };

  const handleUpdateQuantity = useCallback(
    async (cartId, newQuantity) => {
      try {
        const quantityToUpdate =
          newQuantity === "" || isNaN(newQuantity) ? 1 : newQuantity;
        const res = await UpdateCartQuantity(
          ListCart?._id,
          cartId,
          user?._id,
          quantityToUpdate
        );
        if (res.data && res.data.EC === 0) {
          CartListProductsUser();
          setInputValue((prev) => ({ ...prev, [cartId]: quantityToUpdate }));
        } else {
          throw new Error(res.data?.message || "Update failed");
        }
      } catch (error) {
        setLoadingSpin(false);
        console.error("Error updating quantity:", error);
        message.error("Không thể cập nhật số lượng. Vui lòng thử lại!");
        setInputValue((prev) => ({
          ...prev,
          [cartId]:
            ListCart.items.find((item) => item._id === cartId)?.quantity || 1,
        }));
      }
    },
    [ListCart, user?._id, CartListProductsUser]
  );

  const debouncedUpdate = useCallback(
    debounce(handleUpdateQuantity, 100, { leading: false, trailing: true }),
    [handleUpdateQuantity]
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const getUserGroup = (UserGroup) => {
    switch (UserGroup) {
      case "newUser":
        return "Thành viên mới";

      case "regular":
        return "Khách hàng thường xuyên";
      case "vip":
        return "Khách hàng vip";
      case "loyalCustomer":
        return "Khách hàng trung thành";
      case "elite":
        return "Khách hàng thân thiết";
      default:
        return "Tài khoản";
    }
  };

  return (
    <>
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          {contextHolder}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 group">
                <img
                  src={
                    Logo
                      ? Logo
                      : "https://dosi-in.com/images/assets/icons/logo.svg"
                  }
                  alt="Logo"
                  className="w-12 h-12 lg:w-12 lg:h-12 object-cover "
                />
                <div className="hidden sm:block">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Shopping
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full h-12 pl-6 pr-14 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-lg"
                    onClick={handleSearchProducts}
                    onChange={handleChangeInput}
                    value={keywordSearch}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && keywordSearch.trim()) {
                        btnHandleChangeSearch();
                      }
                    }}
                  />
                  <button
                    onClick={btnHandleChangeSearch}
                    className="absolute right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <IoSearch size={18} />
                  </button>
                </div>
                <Search
                  open={openSerch}
                  setOpen={setOpenSearch}
                  show={showSearch}
                  setShow={setShowSearch}
                  keywordSearch={keywordSearch}
                  setKeywordSearch={setKeywordSearch}
                  data={data}
                  setData={setData}
                  onSearch={(keyword) => {
                    FetchSearhProductsAPI(keyword);
                  }}
                />
              </div>
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={handleShowNocations}
                  className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-lg group"
                >
                  <IoNotificationsOutline
                    size={22}
                    className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                  />
                  {unreadNotifications.length > 0 && (
                    <Badge
                      count={
                        unreadNotifications.filter((item) => !item.read).length
                      }
                      className="absolute -top-1 -right-1"
                      size="small"
                    />
                  )}
                </button>
              </div>

              {/* Cart */}
              <div className="relative">
                <button
                  onClick={showLoading}
                  className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-lg group"
                >
                  <IoCartOutline
                    size={22}
                    className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                  />
                  {ListCart?.items?.length > 0 && (
                    <Badge
                      count={ListCart.items.length}
                      className="absolute -top-1 -right-1"
                      size="small"
                    />
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200"
                      />
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-24">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">
                          {getUserGroup(user?.userGroup)}
                        </p>
                      </div>
                    </button>
                  </Dropdown>
                ) : (
                  <button
                    onClick={handleLogOut}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <FaUser size={18} />
                    <span className="hidden lg:inline font-medium">
                      Đăng nhập
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Right Section */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={toggleMobileSearch}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                <IoSearch size={20} className="text-gray-700" />
              </button>

              <div className="relative">
                <button
                  onClick={showLoading}
                  className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300"
                >
                  <IoCartOutline size={20} className="text-gray-700" />
                  {ListCart?.items?.length > 0 && (
                    <Badge
                      count={ListCart.items.length}
                      className="absolute -top-1 -right-1"
                      size="small"
                    />
                  )}
                </button>
              </div>

              <button
                onClick={toggleMobileMenu}
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300"
              >
                {mobileMenuOpen ? (
                  <IoCloseOutline size={22} className="text-gray-700" />
                ) : (
                  <IoMenuOutline size={22} className="text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchVisible && (
          <div className="md:hidden border-t border-gray-200 bg-white p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full h-12 pl-6 pr-14 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={handleSearchProducts}
                onChange={handleChangeInput}
                value={keywordSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keywordSearch.trim()) {
                    btnHandleChangeSearch();
                  }
                }}
              />
              <button
                onClick={btnHandleChangeSearch}
                className="absolute right-2 top-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white"
              >
                <IoSearch size={18} />
              </button>
            </div>
            <Search
              open={openSerch}
              setOpen={setOpenSearch}
              show={showSearch}
              setShow={setShowSearch}
              keywordSearch={keywordSearch}
              setKeywordSearch={setKeywordSearch}
              data={data}
              setData={setData}
              onSearch={(keyword) => {
                FetchSearhProductsAPI(keyword);
              }}
            />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="p-4 space-y-4">
              {user ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 font-bold">
                      {getUserGroup(user?.userGroup)}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLogOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
                >
                  Đăng Nhập
                </button>
              )}

              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                  onClick={() => {
                    handleShowNocations();
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <IoNotificationsOutline
                        size={16}
                        className="text-white"
                      />
                    </div>
                    <span className="text-gray-900 font-medium">Thông báo</span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <Badge
                      count={
                        unreadNotifications.filter((item) => !item.read).length
                      }
                      size="small"
                    />
                  )}
                </button>

                {user && (
                  <>
                    <button
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                      onClick={() => {
                        navigate(`/profile/${user?.name || ""}`);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <FaRegUserCircle size={16} className="text-white" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        Thông tin tài khoản
                      </span>
                    </button>

                    <button
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                      onClick={() => {
                        navigate("/order");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <FaRegListAlt size={16} className="text-white" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        Đơn hàng của tôi
                      </span>
                    </button>

                    {user?.role === "admin" ||
                      (user?.role === "staff" && (
                        <button
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                          onClick={() => {
                            navigate("/admin");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <RiAdminLine size={16} className="text-white" />
                          </div>
                          <span className="text-gray-900 font-medium">
                            Quản trị viên
                          </span>
                        </button>
                      ))}

                    <button
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                      onClick={() => {
                        navigate("/wishlist");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <MdOutlineVolunteerActivism
                          size={16}
                          className="text-white"
                        />
                      </div>
                      <span className="text-gray-900 font-medium">
                        Danh sách yêu thích
                      </span>
                    </button>

                    <button
                      className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-xl transition-colors duration-300 text-red-600"
                      onClick={() => {
                        handleLogOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
                        <LogoutOutlined className="text-white text-sm" />
                      </div>
                      <span className="font-medium">Đăng Xuất</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <NavigationMenu />
      </header>

      {/* Enhanced Cart Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <HiShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Giỏ hàng của bạn
              </h3>
              <p className="text-sm text-gray-500">
                {ListCart?.items?.length || 0} sản phẩm
              </p>
            </div>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
        className="cart-modal"
        centered
        loading={loading}
      >
        <div className="max-h-96 overflow-y-auto">
          {ListCart?.items?.length > 0 ? (
            <div className="space-y-4">
              {ListCart.items.map((cart) => {
                const imageUrl =
                  cart.productId?.variants.find(
                    (product) => product.color === cart.color
                  )?.images[0]?.url || "";

                return (
                  <div
                    key={cart._id}
                    className="flex flex-col md:flex-row items-start md:items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 gap-4"
                  >
                    {/* Image và thông tin sản phẩm */}
                    <div className="flex items-start gap-4 w-full md:flex-1">
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={cart.productId?.name || "Product"}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {cart.productId?.name || "Unknown Product"}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2 uppercase">
                          {cart.color} - {cart.size}
                        </p>
                        <div className="flex items-center justify-between md:justify-start md:gap-4">
                          <span className="text-lg font-bold text-orange-600">
                            {formatPrice(cart.price)}
                          </span>
                          <button
                            onClick={() => handleRemoveCartProduct(cart._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 md:hidden"
                          >
                            <MdDeleteForever size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Delete button cho desktop */}
                      <button
                        onClick={() => handleRemoveCartProduct(cart._id)}
                        className="hidden md:block p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 flex-shrink-0"
                      >
                        <MdDeleteForever size={20} />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between w-full md:w-auto md:flex-shrink-0 md:ml-4">
                      <div className="flex items-center bg-white border border-gray-300 rounded-xl overflow-hidden">
                        <button
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
                          onClick={() => handleMinus(cart._id, cart.quantity)}
                          disabled={loadingSpin}
                        >
                          <span className="text-lg font-bold text-gray-600">
                            −
                          </span>
                        </button>
                        <input
                          type="number"
                          className="w-16 h-10 text-center font-semibold text-gray-900 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={
                            inputValue[cart._id] !== undefined
                              ? inputValue[cart._id]
                              : cart.quantity
                          }
                          min={0}
                          onChange={(e) =>
                            handleInputChange(cart._id, e.target.value)
                          }
                          onBlur={(e) => handleBlur(cart._id, e.target.value)}
                        />
                        <button
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
                          onClick={() => handlePlus(cart._id, cart.quantity)}
                          disabled={loadingSpin}
                        >
                          <span className="text-lg font-bold text-gray-600">
                            +
                          </span>
                        </button>
                      </div>
                      <div className="ml-4">
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(cart.totalItemPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaCartArrowDown size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 text-center">
                Chưa có sản phẩm nào trong giỏ hàng của bạn
              </p>
            </div>
          )}
        </div>

        {ListCart?.items?.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500">Tổng cộng</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(ListCart.totalPrice)}
                </p>
              </div>
              <button
                onClick={handlePay}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Đặt Hàng
              </button>
            </div>
          </div>
        )}

        {loadingSpin && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <ClipLoader color="#3b82f6" />
          </div>
        )}
      </Modal>

      {/* Enhanced Notifications Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <IoNotificationsOutline className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold sm:text-base">Thông báo</h3>
              <p className="text-sm text-gray-500 sm:text-xs">
                {unreadNotifications.length} chưa đọc
              </p>
            </div>
          </div>
        }
        placement="right"
        open={showHiden}
        onClose={() => setShowHiden(false)}
        width={window.innerWidth < 768 ? "90%" : 420}
        loading={loading}
        extra={
          <div className="flex gap-2 flex-wrap">
            <Button
              type="primary"
              size="small"
              onClick={handleReadsNocations}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-400/30 to-indigo-500/30 backdrop-blur-md text-white font-semibold shadow-lg rounded-xl border border-white/30 hover:scale-105 transform transition-all duration-300 px-3 py-1 text-sm sm:text-xs sm:px-2 sm:py-1"
            >
              <FaBookReader className="w-4 h-4 sm:w-3 sm:h-3" />
              Đọc tất cả
            </Button>
            <Button
              size="small"
              onClick={handleDeleteNocations}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-400/30 to-purple-500/30 backdrop-blur-md text-white font-semibold shadow-lg rounded-xl border border-white/30 hover:scale-105 transform transition-all duration-300 px-3 py-1 text-sm sm:text-xs sm:px-2 sm:py-1"
            >
              <FaTrashAlt className="w-4 h-4 sm:w-3 sm:h-3" />
              Xóa tất cả
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {DataNotifications?.filter((item) => !item.isAdmin)?.length > 0 ? (
            DataNotifications.filter((item) => item.isAdmin === false).map(
              (item) => (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                    item.read === false
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  } sm:p-3`}
                  onClick={() => handleBtnNocafition(item._id, item.orderId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 leading-relaxed mb-2 sm:text-sm line-clamp-2">
                        {item.message}
                      </p>
                      <span className="text-xs text-gray-500 sm:text-xs">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    {item.read === false && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-3 mt-1"></div>
                    )}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-10">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:w-16 sm:h-16">
                <IoNotificationsOutline
                  size={32}
                  className="text-gray-400 sm:size-24"
                />
              </div>
              <p className="text-gray-500 text-center sm:text-sm">
                Không có thông báo nào
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Header;
