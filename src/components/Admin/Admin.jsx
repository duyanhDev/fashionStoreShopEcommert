import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  GiftFilled,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { IoNotificationsOutline } from "react-icons/io5";
import { Avatar, Badge, Button, Drawer, Dropdown } from "antd";
import { FiUsers, FiShoppingBag } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import { MdDashboard, MdCategory, MdInventory } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  AllReadNotifications,
  DeleteAllNotificationsAPI,
  FetcDataNocatifions,
  UpdateDataNocatifions,
} from "../../service/ApiNocatifions";

import {
  MdAttachMoney,
  MdAssessment,
  MdCardGiftcard,
  MdRateReview,
  MdHistory,
  MdArticle,
} from "react-icons/md";
import { FiMessageCircle, FiImage } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import { AiOutlineShop } from "react-icons/ai";
import { TbRuler2 } from "react-icons/tb";
import { PiPantsFill } from "react-icons/pi";
import { logout } from "../../redux/actions/Auth";

// Định nghĩa tất cả menu items với permissions
const menuItems = [
  {
    icon: <MdDashboard className="text-2xl" />,
    label: "Tổng quan",
    to: "",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    activeBg: "from-blue-500 to-blue-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <MdAttachMoney className="text-2xl" />,
    label: "Quản lí doanh thu",
    to: "/admin/revenue",
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverBg: "hover:bg-green-100",
    activeBg: "from-green-500 to-green-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <FiUsers className="text-2xl" />,
    label: "Khách hàng",
    to: "/admin/usercustom",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    activeBg: "from-blue-500 to-indigo-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <RiAdminLine className="text-2xl" />,
    label: "Quản trị viên",
    to: "/admin/account",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    activeBg: "from-purple-500 to-purple-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <RiCustomerService2Line className="text-2xl" />,
    label: "Hỗ trợ tài khoản",
    to: "/admin/adminAccountManagement",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100",
    activeBg: "from-indigo-500 to-indigo-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <MdInventory className="text-2xl" />,
    label: "Quản lí sản phẩm",
    to: "/admin/products",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverBg: "hover:bg-orange-100",
    activeBg: "from-orange-500 to-orange-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <MdCategory className="text-2xl" />,
    label: "Quản lí danh mục",
    to: "category",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    hoverBg: "hover:bg-pink-100",
    activeBg: "from-pink-500 to-pink-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <MdAssessment className="text-2xl" />,
    label: "Quản lí báo cáo",
    to: "du-doan",
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverBg: "hover:bg-red-100",
    activeBg: "from-red-500 to-red-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <FiShoppingBag className="text-2xl" />,
    label: "Quản lí Đơn hàng",
    to: "order",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    hoverBg: "hover:bg-teal-100",
    activeBg: "from-teal-500 to-teal-600",
    allowedRoles: ["admin"],
    allowedPermissions: ["order_approval"],
  },
  {
    icon: <AiOutlineShop className="text-2xl" />,
    label: "Quản lí nhà cung cấp",
    to: "/admin/manage-store",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    hoverBg: "hover:bg-cyan-100",
    activeBg: "from-cyan-500 to-cyan-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <FiMessageCircle className="text-2xl" />,
    label: "Hỗ trợ",
    to: "/admin/support-chat",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    activeBg: "from-blue-400 to-blue-500",
    allowedRoles: ["admin"],
    allowedPermissions: ["customer_support"],
  },
  {
    icon: <MdCardGiftcard className="text-2xl" />,
    label: "Quản lí khuyến mãi",
    to: "/admin/voucher",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    hoverBg: "hover:bg-yellow-100",
    activeBg: "from-yellow-500 to-yellow-600",
    allowedRoles: ["admin"],
    allowedPermissions: ["customer_support"],
  },
  {
    icon: <FiImage className="text-2xl" />,
    label: "Quản lý Banner",
    to: "/admin/banner",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    activeBg: "from-purple-400 to-purple-500",
    allowedRoles: ["admin"],
    allowedPermissions: ["customer_support"],
  },
  {
    icon: <MdRateReview className="text-2xl" />,
    label: "Quản lí Đánh giá",
    to: "/admin/review",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
    activeBg: "from-amber-500 to-amber-600",
    allowedRoles: ["admin"],
    allowedPermissions: ["customer_support"],
  },
  {
    icon: <MdHistory className="text-2xl" />,
    label: "Quản lí nhật kí",
    to: "/admin/changle-log",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    hoverBg: "hover:bg-slate-100",
    activeBg: "from-slate-500 to-slate-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <MdArticle className="text-2xl" />,
    label: "Quản lí bài viết",
    to: "/admin/quan-li-blog",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100",
    activeBg: "from-emerald-500 to-emerald-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <TbRuler2 className="text-2xl" />,
    label: "Quản lí bảng size áo",
    to: "/admin/quan-li-bang-size-ao",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    hoverBg: "hover:bg-rose-100",
    activeBg: "from-rose-500 to-rose-600",
    allowedRoles: ["admin"],
  },
  {
    icon: <PiPantsFill className="text-2xl" />,
    label: "Quản lí bảng size quần",
    to: "/admin/quan-li-bang-size-quan",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    hoverBg: "hover:bg-violet-100",
    activeBg: "from-violet-500 to-violet-600",
    allowedRoles: ["admin"],
  },
];

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [DataNotifications, setDataNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [showHiden, setShowHiden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hàm kiểm tra quyền truy cập menu
  const hasAccess = (menuItem) => {
    if (user?.role === "admin") {
      return true;
    }

    if (user?.role === "staff") {
      if (
        menuItem.allowedPermissions &&
        menuItem.allowedPermissions.length > 0
      ) {
        return menuItem.allowedPermissions.includes(user?.permissions);
      }
      if (menuItem.allowedRoles && !menuItem.allowedPermissions) {
        return false;
      }
    }

    return false;
  };

  const filteredMenuItems = menuItems.filter(hasAccess);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const unreadNotifications = (DataNotifications || []).filter(
    (item) =>
      item.read === false && item.isCheck === true && item.isAdmin === true
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const isActiveRoute = (itemTo) => {
    return (
      location.pathname === itemTo || location.pathname === `/admin/${itemTo}`
    );
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

  const handleShowNocations = () => {
    setShowHiden(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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

  const handleLogOut = async () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };

  const items = [
    {
      key: "1",
      label: (
        <Button className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-200 border-none focus:ring-2 focus:ring-blue-300 focus:outline-none">
          Profile
        </Button>
      ),
    },
    {
      key: "2",
      label: (
        <Button
          className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-200 border-none focus:ring-2 focus:ring-red-300 focus:outline-none"
          onClick={handleLogOut}
        >
          Đăng Xuất
        </Button>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Overlay cho mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 z-40 bg-white shadow-2xl transition-all duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block`}
      >
        {/* Logo Header */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-lg">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <MdDashboard className="text-3xl text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">DA SHOP</h1>
                <p className="text-blue-100 text-sm font-medium">
                  Admin Dashboard
                </p>
              </div>
            </Link>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-5 right-5 md:hidden text-white/80 hover:text-white bg-white/10 rounded-lg p-1.5 backdrop-blur-sm"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-full pb-20 bg-gradient-to-b from-gray-50 to-white">
          <nav className="p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item, index) => {
                const isActive = isActiveRoute(item.to);
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${
                              item.activeBg
                            } text-white shadow-xl shadow-${
                              item.color.split("-")[1]
                            }-200 transform scale-[1.02] border-2 border-white`
                          : `${item.bgColor} ${item.hoverBg} hover:shadow-lg hover:scale-[1.01] border-2 border-transparent`
                      }`}
                    >
                      {/* Icon Container */}
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-white/20 shadow-lg"
                            : `bg-white shadow-md group-hover:shadow-lg group-hover:scale-110`
                        }`}
                      >
                        <div
                          className={`${
                            isActive ? "text-white" : item.color
                          } group-hover:scale-110 transition-transform duration-300`}
                        >
                          {item.icon}
                        </div>
                      </div>

                      {/* Label */}
                      <span
                        className={`font-bold text-base tracking-wide flex-1 ${
                          isActive ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse animation-delay-150" />
                        </div>
                      )}

                      {/* Hover Effect Border */}
                      {!isActive && (
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-dashed pointer-events-none"
                          style={{
                            borderColor: item.color.replace("text-", ""),
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-md border-b border-gray-200/50 h-16 px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center justify-between h-full">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
            >
              <MenuOutlined className="text-white text-lg" />
            </button>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8"></div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Badge count={unreadNotifications?.length} size="small">
                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md">
                  <BellOutlined
                    className="text-blue-600 text-lg"
                    onClick={() => {
                      handleShowNocations();
                    }}
                  />
                </button>
              </Badge>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {user?.role === "admin"
                      ? "Quản trị viên"
                      : user?.permissions === "order_approval"
                      ? "Nhân viên đơn hàng"
                      : user?.permissions === "customer_support"
                      ? "Nhân viên hỗ trợ"
                      : "Nhân viên"}
                  </p>
                </div>

                <Dropdown menu={{ items }} placement="bottom">
                  <Avatar
                    size={42}
                    icon={<UserOutlined />}
                    className="border-3 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                  />
                </Dropdown>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-blue-50/50">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <IoNotificationsOutline className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Thông báo</h3>
              <p className="text-sm text-gray-500">
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
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              onClick={handleReadsNocations}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 border-none"
            >
              Đọc tất cả
            </Button>
            <Button danger size="small" onClick={handleDeleteNocations}>
              Xóa tất cả
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {DataNotifications?.filter((item) => item.isAdmin)?.length > 0 ? (
            DataNotifications.filter((item) => item.isAdmin === true).map(
              (item) => {
                return (
                  <div
                    key={item._id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                      item.read === false
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleBtnNocafition(item._id, item.orderId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 leading-relaxed mb-2">
                          {item.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.read === false && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-3 mt-1"></div>
                      )}
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IoNotificationsOutline size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">
                Không có thông báo nào
              </p>
            </div>
          )}
        </div>
      </Drawer>

      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  );
};

export default Admin;
