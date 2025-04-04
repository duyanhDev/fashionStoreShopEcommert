import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import {
  IoSearch,
  IoNotificationsOutline,
  IoCartOutline,
} from "react-icons/io5";
import { Dropdown, Button, Drawer, Modal } from "antd";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout, Search as SearchAction } from "../../redux/actions/Auth";
import { useEffect, useState } from "react";
import { RemoveCartOnePorduct, UpdateCartQuantity } from "../../service/Cart";
import ClipLoader from "react-spinners/ClipLoader";
import {
  FetcDataNocatifions,
  UpdateDataNocatifions,
} from "../../service/ApiNocatifions";
import Search from "../SearchProducts/Search";
import { searchProductsByNameAPI } from "../../service/ApiProduct";
import { HiShoppingBag } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { debounce } from "lodash";
import { FaCartArrowDown, FaUser } from "react-icons/fa";

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

  const items = [
    {
      key: "1",
      label: user?.name || "My name",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Profile",
      extra: "⌘P",
      onClick: () => {
        navigate(`/profile/${user?.name || ""}`);
      },
    },
    ...(user
      ? [
          {
            key: "3",
            label: "Đơn hàng",
            extra: "⌘B",
            onClick: () => navigate("/order"),
          },
        ]
      : []),
    {
      key: "4",
      label: "Settings",
      icon: <SettingOutlined />,
      extra: "⌘S",
    },
    ...(user && user.isAdmin
      ? [
          {
            key: "5",
            label: "Admin",
            icon: <SettingOutlined />,
            extra: "⌘S",
            onClick: () => {
              navigate("/admin");
            },
          },
        ]
      : []),
    {
      key: "6",
      label: user?.name ? "Đăng Xuất" : "Đăng Nhập",
      icon: <LogoutOutlined />,
      extra: "⌘S",
      onClick: handleLogOut,
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
      if (res.data) {
        setTimeout(() => {
          setLoadingSpin(false);
          CartListProductsUser();
        }, 3000);
      }
    } catch (error) {
      setLoadingSpin(false);
      console.error("Error in handleRemoveCartProduct:", error);
    }
  };

  const handlePay = () => {
    setLoadingCart(true);
    try {
      setOpen(false);
      const timer = setTimeout(() => {
        setLoadingCart(false);
      }, 3000);
      navigate("cart");
      return () => clearTimeout(timer);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleShowNocations = () => {
    setShowHiden(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const FetchDataNocatifionsAPI = async () => {
    try {
      let res = await FetcDataNocatifions(user._id);
      if (res && res.data && res.data.EC === 0) {
        setDataNotifications(res.data.data);
      }
    } catch (error) {}
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
      console.log(error);
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
    } catch (error) {}
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
      console.error("Keyword is empty");
      return;
    }
    navigate(`search?q=${keyword}`);
    dispatch(SearchAction(data, totalPage));
    setKeywordSearch("");
  };

  const unreadNotifications = (DataNotifications || []).filter(
    (item) =>
      item.read === false && item.isCheck === false && item.isAdmin === false
  );

  const handleMinus = (cartId, currentQuantity) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      debouncedUpdate(cartId, newQuantity);
    }
  };

  const handlePlus = (cartId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    debouncedUpdate(cartId, newQuantity);
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    try {
      setLoadingSpin(true);
      const res = await UpdateCartQuantity(
        ListCart._id,
        cartId,
        user._id,
        newQuantity
      );
      if (res.data && res.data.EC === 0) {
        CartListProductsUser();
        setLoadingSpin(false);
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (error) {
      setLoadingSpin(false);
      console.error("Error updating quantity:", error);
    }
  };

  const debouncedUpdate = debounce(handleUpdateQuantity, 300, {
    leading: false,
    trailing: true,
  });

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const debouncedFetchSearch = debounce(() => {
    if (keywordSearch.trim()) {
      FetchSearhProductsAPI();
    }
  }, 300);

  useEffect(() => {
    debouncedFetchSearch();
    return () => debouncedFetchSearch.cancel();
  }, [keywordSearch]);

  return (
    <div className="header_main_dosin w-full flex justify-between items-center h-full m-auto">
      <div className="flex items-center doin_image">
        <ul className="flex items-center justify-between">
          <li className="px-5">
            <Link to="/" className="image_logo">
              <img
                src="https://dosi-in.com/images/assets/icons/logo.svg"
                alt="Logo"
              />
            </Link>
          </li>
          <li>
            <Link className="text_shop text-xl">Shopping</Link>
          </li>
        </ul>
      </div>
      <div className="input_search_item input relative flex items-center">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm"
          className="w-full outline-none"
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
          className="absolute right-0 m-4 text-2xl"
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
        />
      </div>
      <div className="w-3/12 flex justify-between doin_right px-5">
        <ul className="dosin_right_items flex justify-end w-full items-center">
          <li className="px-5 relative" onClick={handleShowNocations}>
            <IoNotificationsOutline size={30} />
            {unreadNotifications && unreadNotifications.length > 0 ? (
              <span className="cart_items mr-1">
                {unreadNotifications.filter((item) => !item.read).length}
              </span>
            ) : (
              <span className="cart_items mr-1">0</span>
            )}
          </li>
          <li className="px-5 relative" onClick={showLoading}>
            <IoCartOutline size={30} />
            {ListCart && ListCart.items ? (
              <span className="cart_items">{ListCart.items.length}</span>
            ) : (
              <span className="cart_items">0</span>
            )}
          </li>
          <li className="px-5">
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
                    className="w-8 h-8 rounded-full"
                  />
                </a>
              </Dropdown>
            ) : (
              <FaUser size={25} onClick={handleLogOut} />
            )}
          </li>
        </ul>
        <Modal
          title={
            <div className="flex items-center gap-2">
              <HiShoppingBag className="cart_color_item text-green-600" />
              <span>
                Hiện đang có
                {ListCart && ListCart.items ? (
                  <span className=""> {ListCart.items.length} </span>
                ) : (
                  <span className="">0</span>
                )}
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
        >
          <div className="item_list_cart_products">
            <span className=" ">Hình ảnh</span>
            <span className=" ">Sản phẩm</span>
            <span className="text-center">Số lượng</span>
            <span className="">Thành tiền</span>
          </div>
          {ListCart?.items?.length > 0 ? (
            ListCart.items.map((cart) => {
              const imageUrl =
                cart?.productId?.variants?.[0]?.images?.[0]?.url ||
                "https://via.placeholder.com/100";
              return (
                <div
                  className="item_list_cart_total flex items-center"
                  key={cart._id}
                >
                  <div>
                    <img
                      src={imageUrl}
                      alt={cart.productId?.name || "Product"}
                      width={100}
                    />
                  </div>
                  <div className="">
                    <span className="whitespace-nowrap">
                      {cart.productId?.name || "Unknown Product"}
                    </span>
                    <p className="uppercase">
                      {cart.color || "N/A"} - {cart.size || "N/A"}
                    </p>
                    <div className="flex items-center gap-5">
                      <span className="border-r-2 pr-4">
                        {formatPrice(cart.price)}
                      </span>
                      <MdDeleteForever
                        className="cursor-pointer"
                        size={20}
                        color=""
                        style={{ color: "rgb(242, 153, 74)" }}
                        onClick={() => handleRemoveCartProduct(cart._id)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="flex justify-center items-center border border-gray-400 rounded-lg overflow-hidden w-4/5">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                        onClick={() => handleMinus(cart._id, cart.quantity)}
                        disabled={loadingSpin}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="w-10 h-8 text-center text-lg font-semibold text-gray-900 bg-transparent border-x border-gray-300 outline-none appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={cart.quantity}
                        min={1}
                        readOnly
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
                  <div className="">{formatPrice(cart.totalItemPrice)}</div>
                </div>
              );
            })
          ) : (
            <div className="h-96 flex justify-center items-center gap-3">
              <FaCartArrowDown className="cart-icon" size={120} />
              <span>Giỏ hàng chưa có gì :(, chọn mua đồ bạn nhé)</span>
            </div>
          )}
          {ListCart && ListCart.items && ListCart.items.length > 0 ? (
            <div className="flex justify-between items-center">
              <p className="font-semibold text-base ml-5 mt-2 whitespace-nowrap">
                Tổng tiền :{" "}
                {ListCart && ListCart.totalPrice !== undefined
                  ? formatPrice(ListCart.totalPrice)
                  : "0đ"}
              </p>
              <Button
                className="flex justify-center w-32 items-center ml-14 mt-1"
                type="primary"
                onClick={() => handlePay()}
              >
                Đặt Hàng
              </Button>
            </div>
          ) : (
            <div></div>
          )}
          {loadingSpin && (
            <div className="overlay flex items-center justify-center w-full h-full">
              <ClipLoader className="" />
            </div>
          )}
        </Modal>
        <Drawer
          closable
          destroyOnClose
          title={<p>Thông Báo</p>}
          placement="right"
          open={showHiden}
          loading={loading}
          onClose={() => setShowHiden(false)}
        >
          <Button
            type="primary"
            style={{
              marginBottom: 16,
            }}
            onClick={handleShowNocations}
          >
            Reload
          </Button>
          {unreadNotifications && unreadNotifications.length > 0 ? (
            unreadNotifications.map((item) => (
              <div key={item._id}>
                <div
                  className="border-b-2 p-1 cursor-pointer"
                  onClick={() => handleBtnNocafition(item._id, item.orderId)}
                >
                  {item.message}
                  <div className="mt-1">{formatTimeAgo(item.createdAt)}</div>
                  {item.read === false && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full float-right -mt-4"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Hiện tại không có thông báo nào</p>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default Header;
