import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import {
  IoSearch,
  IoNotificationsOutline,
  IoCartOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { Dropdown, Button, Drawer, Modal, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout, Search as SearchAction } from "../../redux/actions/Auth";
import { useEffect, useState, useCallback } from "react";
import { RemoveCartOnePorduct, UpdateCartQuantity } from "../../service/Cart";
import ClipLoader from "react-spinners/ClipLoader";
import {
  FetcDataNocatifions,
  UpdateDataNocatifions,
} from "../../service/ApiNocatifions";
import Search from "../SearchProducts/Search";
import { searchProductsByNameAPI } from "../../service/ApiProduct";
import { HiShoppingBag } from "react-icons/hi";
import { MdDeleteForever, MdOutlineVolunteerActivism } from "react-icons/md";
import { debounce } from "lodash";

import {
  FaCartArrowDown,
  FaRegListAlt,
  FaRegUserCircle,
  FaUser,
} from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";

const Header = ({ user, ListCart, CartListProductsUser }) => {
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

  const handleLogOut = () => {
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
      label: user?.name || "My name",
      disabled: true,
      style: { ...itemStyle, fontWeight: "bold", color: "#1890ff" },
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <FaRegUserCircle size={18} />,
      label: <span style={{ flex: 1 }}>Thông tin tài khoản</span>,
      onClick: () => {
        navigate(`/profile/${user?.name || ""}`);
        setMobileMenuOpen(false);
      },
      style: itemStyle,
    },
    ...(user
      ? [
          {
            key: "orders",
            icon: <FaRegListAlt size={18} />,
            label: <span style={{ flex: 1 }}>Đơn hàng của tôi</span>,
            onClick: () => {
              navigate("/order");
              setMobileMenuOpen(false);
            },
            style: itemStyle,
          },
        ]
      : []),
    { type: "divider" },
    ...(user?.role === "admin"
      ? [
          {
            key: "admin",
            icon: <RiAdminLine size={20} />,
            label: <span style={{ flex: 1 }}>Quản trị viên</span>,
            onClick: () => {
              navigate("/admin");
              setMobileMenuOpen(false);
            },
            style: itemStyle,
          },
          { type: "divider" },
        ]
      : []),
    {
      key: "settings",
      icon: <MdOutlineVolunteerActivism size={18} />,
      label: <span style={{ flex: 1 }}>Danh sách yêu thích</span>,
      onClick: () => {
        navigate("/wishlist");
        setMobileMenuOpen(false);
      },
      style: itemStyle,
    },
    {
      key: "auth",
      icon: <LogoutOutlined />,
      label: (
        <span style={{ flex: 1 }}>
          {user?.name ? "Đăng Xuất" : "Đăng Nhập"}
        </span>
      ),
      onClick: handleLogOut,
      style: itemStyle,
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
      console.log(res);

      if (res && res.data) {
        setTimeout(() => {
          setLoadingSpin(false);
          CartListProductsUser();
          message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        }, 1000); // Reduced timeout for better UX
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
    setKeywordSearch(e.target.value);
    setShowSearch(false);
  };

  const FetchSearhProductsAPI = async () => {
    try {
      const res = await searchProductsByNameAPI(keywordSearch, page);
      if (res && res.data && res.data.EC === 0) {
        setData(res.data.data);
        setTotalPage(res.data.totalPages);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  useEffect(() => {
    if (keywordSearch && keywordSearch.trim() !== "") {
      FetchSearhProductsAPI();
    }
  }, [keywordSearch]);

  const btnHandleChangeSearch = () => {
    setOpenSearch(false);
    const keyword = keywordSearch.trim();
    if (!keyword) {
      message.error("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }
    navigate(`search?q=${keyword}`);
    dispatch(SearchAction(data, totalPage));
    setKeywordSearch("");
    setSearchVisible(false);
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
    const newQuantity = currentQuantity + 1;
    const cartItem = ListCart.items.find((item) => item._id === cartId);
    const maxQuantity = cartItem?.productId?.inventory || Infinity;
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

    if (value === "") {
      return;
    }

    const quantity = parseInt(value);
    const cartItem = ListCart.items.find((item) => item._id === cartId);
    const maxQuantity = cartItem?.productId?.inventory || Infinity;

    if (quantity === 0) {
      handleRemoveCartProduct(cartId);
    } else if (quantity > maxQuantity) {
      message.warning(`Số lượng tối đa là ${maxQuantity}!`);
      setInputValue((prev) => ({ ...prev, [cartId]: maxQuantity }));
      debouncedUpdate(cartId, maxQuantity);
    } else {
      const validQuantity = Math.max(1, quantity || 1);
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

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const debouncedFetchSearch = useCallback(
    debounce(() => {
      if (keywordSearch.trim()) {
        FetchSearhProductsAPI();
      }
    }, 500),
    [keywordSearch]
  );

  useEffect(() => {
    debouncedFetchSearch();
    return () => debouncedFetchSearch.cancel();
  }, [debouncedFetchSearch]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileSearch = () => {
    setSearchVisible(!searchVisible);
  };

  return (
    <>
      {/* Main Header */}
      <div className="header_main_dosin w-full flex justify-between items-center h-full mx-auto px-2 sm:px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center doin_image flex-shrink-0">
          <ul className="flex items-center justify-between">
            <li className="px-2 sm:px-3 lg:px-5">
              <Link to="/" className="image_logo">
                <img
                  src="https://dosi-in.com/images/assets/icons/logo.svg"
                  alt="Logo"
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link className="text_shop text-lg sm:text-xl">Shopping</Link>
            </li>
          </ul>
        </div>

        {/* Desktop Search */}
        <div className="input_search_item input relative items-center hidden md:flex flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            className="absolute w-full outline-none px-4 py-2 pr-12 border rounded-lg"
            onClick={handleSearchProducts}
            onChange={handleChangeInput}
            value={keywordSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keywordSearch.trim()) {
                btnHandleChangeSearch();
              }
            }}
          />
          <IoSearch
            color="#ccc"
            className="absolute right-0 m-4 text-2xl cursor-pointer"
            onClick={btnHandleChangeSearch}
          />
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

        {/* Desktop Right Section */}
        <div className="hidden md:flex w-auto justify-between doin_right px-2 sm:px-5">
          <ul className="dosin_right_items flex justify-end items-center space-x-2 sm:space-x-4">
            <li
              className="relative cursor-pointer"
              onClick={handleShowNocations}
            >
              <IoNotificationsOutline size={24} className="sm:w-7 sm:h-7" />
              <span className="cart_items absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications && unreadNotifications.length > 0
                  ? unreadNotifications.filter((item) => !item.read).length
                  : 0}
              </span>
            </li>
            <li className="relative cursor-pointer" onClick={showLoading}>
              <IoCartOutline size={24} className="sm:w-7 sm:h-7" />
              <span className="cart_items absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {ListCart && ListCart.items ? ListCart.items.length : 0}
              </span>
            </li>
            <li>
              {user ? (
                <Dropdown
                  menu={{
                    items,
                  }}
                  trigger={["click"]}
                >
                  <a onClick={(e) => e.preventDefault()}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                  </a>
                </Dropdown>
              ) : (
                <FaUser
                  size={20}
                  className="cursor-pointer"
                  onClick={handleLogOut}
                />
              )}
            </li>
          </ul>
        </div>

        {/* Mobile Right Section */}
        <div className="flex md:hidden items-center space-x-3">
          <IoSearch
            size={24}
            className="cursor-pointer"
            onClick={toggleMobileSearch}
          />
          <div className="relative cursor-pointer" onClick={showLoading}>
            <IoCartOutline size={24} />
            <span className="cart_items absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {ListCart && ListCart.items ? ListCart.items.length : 0}
            </span>
          </div>
          <button onClick={toggleMobileMenu} className="cursor-pointer">
            {mobileMenuOpen ? (
              <IoCloseOutline size={28} />
            ) : (
              <IoMenuOutline size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchVisible && (
        <div className="md:hidden px-4 py-2 border-t bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              className="w-full outline-none px-4 py-2 pr-12 border rounded-lg"
              onClick={handleSearchProducts}
              onChange={handleChangeInput}
              value={keywordSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter" && keywordSearch.trim()) {
                  btnHandleChangeSearch();
                }
              }}
            />
            <IoSearch
              color="#ccc"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-4 text-2xl cursor-pointer"
              onClick={btnHandleChangeSearch}
            />
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="px-4 py-6">
            {user ? (
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-semibold">{user.name}</span>
              </div>
            ) : (
              <div className="mb-6 pb-4 border-b">
                <Button
                  type="primary"
                  className="w-full"
                  onClick={() => {
                    handleLogOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Đăng Nhập
                </Button>
              </div>
            )}
            <div className="space-y-4">
              <div
                className="flex items-center justify-between py-2 cursor-pointer"
                onClick={() => {
                  handleShowNocations();
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <IoNotificationsOutline size={20} />
                  <span>Thông báo</span>
                </div>
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications && unreadNotifications.length > 0
                    ? unreadNotifications.filter((item) => !item.read).length
                    : 0}
                </span>
              </div>
              {user && (
                <>
                  <div
                    className="flex items-center space-x-3 py-2 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${user?.name || ""}`);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaRegUserCircle size={20} />
                    <span>Thông tin tài khoản</span>
                  </div>
                  <div
                    className="flex items-center space-x-3 py-2 cursor-pointer"
                    onClick={() => {
                      navigate("/order");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FaRegListAlt size={20} />
                    <span>Đơn hàng của tôi</span>
                  </div>
                  {user?.role === "admin" && (
                    <div
                      className="flex items-center space-x-3 py-2 cursor-pointer"
                      onClick={() => {
                        navigate("/admin");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <RiAdminLine size={20} />
                      <span>Quản trị viên</span>
                    </div>
                  )}
                  <div
                    className="flex items-center space-x-3 py-2 cursor-pointer"
                    onClick={() => {
                      navigate("/wishlist");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <MdOutlineVolunteerActivism size={20} />
                    <span>Danh sách yêu thích</span>
                  </div>
                  <div
                    className="flex items-center space-x-3 py-2 cursor-pointer text-red-600"
                    onClick={() => {
                      handleLogOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogoutOutlined />
                    <span>Đăng Xuất</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HiShoppingBag className="cart_color_item text-green-600" />
            <span className="text-sm sm:text-base">
              Hiện đang có
              <span className="mx-1">
                {ListCart && ListCart.items ? ListCart.items.length : 0}
              </span>
              sản phẩm trong giỏ hàng
            </span>
          </div>
        }
        placement="right"
        open={open}
        centered
        loading={loading}
        onCancel={() => setOpen(false)}
        className="relative cart_products_item"
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <div className="item_list_cart_products hidden sm:grid">
          <span>Hình ảnh</span>
          <span>Sản phẩm</span>
          <span className="text-center">Số lượng</span>
          <span>Thành tiền</span>
        </div>

        {ListCart?.items?.length > 0 ? (
          ListCart.items.map((cart) => {
            const imageUrl =
              cart?.productId?.variants?.[0]?.images?.[0]?.url ||
              "https://via.placeholder.com/100";
            return (
              <div
                className="item_list_cart_total flex flex-col sm:flex-row items-start sm:items-center py-4 border-b"
                key={cart._id}
              >
                <div className="w-full sm:w-auto mb-2 sm:mb-0 flex justify-center sm:justify-start">
                  <img
                    src={imageUrl}
                    alt={cart.productId?.name || "Product"}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                  />
                </div>
                <div className="flex-1 px-0 sm:px-4 mb-2 sm:mb-0">
                  <h4 className="font-medium text-sm sm:text-base mb-1 line-clamp-2">
                    {cart.productId?.name || "Unknown Product"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 uppercase mb-2">
                    {cart.color || "N/A"} - {cart.size || "N/A"}
                  </p>
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="text-sm sm:text-base font-semibold text-orange-600">
                      {formatPrice(cart.price)}
                    </span>
                    <MdDeleteForever
                      className="cursor-pointer hover:text-orange-600"
                      size={20}
                      color="rgb(242, 153, 74)"
                      onClick={() => handleRemoveCartProduct(cart._id)}
                    />
                  </div>
                </div>
                <div className="w-full sm:w-auto flex justify-center mb-2 sm:mb-0">
                  <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden">
                    <button
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() => handleMinus(cart._id, cart.quantity)}
                      disabled={loadingSpin}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="w-12 h-8 text-center text-lg font-semibold text-gray-900 bg-transparent border-x border-gray-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={
                        inputValue[cart._id] !== undefined
                          ? inputValue[cart._id]
                          : cart.quantity
                      }
                      min={0}
                      placeholder="1"
                      onChange={(e) =>
                        handleInputChange(cart._id, e.target.value)
                      }
                      onBlur={(e) => handleBlur(cart._id, e.target.value)}
                    />
                    <button
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                      onClick={() => handlePlus(cart._id, cart.quantity)}
                      disabled={loadingSpin}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-full sm:w-auto text-center sm:text-right">
                  <span className="font-semibold text-base text-green-600">
                    {formatPrice(cart.totalItemPrice)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-64 sm:h-96 flex flex-col justify-center items-center gap-3">
            <FaCartArrowDown className="cart-icon text-gray-400" size={80} />
            <span className="text-center text-gray-600 px-4">
              Giỏ hàng chưa có gì :(, chọn mua đồ bạn nhé
            </span>
          </div>
        )}

        {ListCart && ListCart.items && ListCart.items.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t gap-3">
            <p className="font-semibold text-base sm:text-lg text-center sm:text-left">
              Tổng tiền:{" "}
              <span className="text-green-600 text-lg sm:text-xl">
                {ListCart && ListCart.totalPrice !== undefined
                  ? formatPrice(ListCart.totalPrice)
                  : "0đ"}
              </span>
            </p>
            <Button
              className="w-full sm:w-auto min-w-32"
              type="primary"
              size="large"
              onClick={() => handlePay()}
            >
              Đặt Hàng
            </Button>
          </div>
        )}

        {loadingSpin && (
          <div className="overlay flex items-center justify-center w-full h-full absolute top-0 left-0 bg-white bg-opacity-80 z-10">
            <ClipLoader />
          </div>
        )}
      </Modal>

      {/* Notifications Drawer */}
      <Drawer
        closable
        destroyOnClose
        title={<p>Thông Báo</p>}
        placement="right"
        open={showHiden}
        loading={loading}
        onClose={() => setShowHiden(false)}
        width={window.innerWidth < 768 ? "90%" : 400}
      >
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={handleShowNocations}
          className="w-full sm:w-auto"
        >
          Reload
        </Button>
        {unreadNotifications && unreadNotifications.length > 0 ? (
          unreadNotifications.map((item) => (
            <div key={item._id}>
              <div
                className="border-b-2 p-3 cursor-pointer hover:bg-gray-50 rounded"
                onClick={() => handleBtnNocafition(item._id, item.orderId)}
              >
                <p className="text-sm sm:text-base mb-2">{item.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                  {item.read === false && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            Hiện tại không có thông báo nào
          </p>
        )}
      </Drawer>
    </>
  );
};

export default Header;
