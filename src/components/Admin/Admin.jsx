import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
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
import { Avatar, Badge, Button, Drawer } from "antd";
import { FiUsers, FiShoppingBag } from "react-icons/fi";
import { FaSquarePollVertical } from "react-icons/fa6";
import { AiTwotoneAppstore } from "react-icons/ai";
import { RiAdminLine } from "react-icons/ri";
import { FcFeedback } from "react-icons/fc";
import { MdDashboard, MdCategory, MdInventory } from "react-icons/md";
import { useSelector } from "react-redux";
import {
  AllReadNotifications,
  DeleteAllNotificationsAPI,
  FetcDataNocatifions,
  UpdateDataNocatifions,
} from "../../service/ApiNocatifions";

const menuItems = [
  {
    icon: <MdDashboard className="text-xl" />,
    label: "Tổng quan",
    to: "",
    color: "text-blue-500",
  },

  {
    icon: <FcFeedback className="text-xl " />,
    label: "Quản lí doanh thu",
    to: "/admin/revenue",
    color: "text-gray-500",
  },
  {
    icon: <FiUsers className="text-xl" />,
    label: "Khách hàng",
    to: "/admin/usercustom",
    color: "text-green-500",
  },
  {
    icon: <RiAdminLine className="text-xl" />,
    label: "Quản trị viên",
    to: "/admin/account",
    color: "text-purple-500",
  },
  {
    icon: <SettingOutlined className="text-xl" />,
    label: "Hỗ trợ tài khoản",
    to: "/admin/adminAccountManagement",
    color: "text-purple-500",
  },
  {
    icon: <MdInventory className="text-xl" />,
    label: "Sản phẩm",
    to: "/admin/products",
    color: "text-orange-500",
  },
  {
    icon: <MdCategory className="text-xl" />,
    label: "Danh mục",
    to: "category",
    color: "text-pink-500",
  },
  {
    icon: <FaSquarePollVertical className="text-xl" />,
    label: "Báo cáo",
    to: "/reports",
    color: "text-indigo-500",
  },
  {
    icon: <FiShoppingBag className="text-xl" />,
    label: "Đơn hàng",
    to: "order",
    color: "text-teal-500",
  },
  {
    icon: <AiTwotoneAppstore className="text-xl" />,
    label: "Nhà cung cấp",
    to: "/admin/manage-store",
    color: "text-red-500",
  },
  {
    icon: <MessageOutlined className="text-xl" />,
    label: "Hỗ trợ",
    to: "/admin/support-chat",
    color: "text-cyan-500",
  },
  {
    icon: <GiftFilled className="text-xl" />,
    label: "Khuyến mãi",
    to: "/admin/voucher",
    color: "text-yellow-500",
  },
  {
    icon: <GiftFilled className="text-xl" />,
    label: "Quản lý Banner",
    to: "/admin/banner",
    color: "text-yellow-500",
  },
  {
    icon: <FcFeedback className="text-xl " />,
    label: "Đánh giá",
    to: "/admin/review",
    color: "text-gray-500",
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
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const unreadNotifications = (DataNotifications || []).filter(
    (item) =>
      item.read === false && item.isCheck === false && item.isAdmin === true
  );

  // Đóng sidebar khi click ra ngoài (mobile only)
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
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Overlay cho mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 z-40 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transition-all duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block`}
      >
        {/* Logo Header */}
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 border-b border-blue-500/20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MdDashboard className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DOIIN</h1>
                <p className="text-blue-100 text-sm">Admin Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 md:hidden text-white/80 hover:text-white"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-full pb-20 ">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = isActiveRoute(item.to);
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600"
                      }`}
                    >
                      <div
                        className={`${
                          isActive ? "text-white" : item.color
                        } group-hover:scale-110 transition-transform`}
                      >
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom Gradient */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" /> */}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 h-16 px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center justify-between h-full">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors md:hidden"
            >
              <MenuOutlined className="text-gray-600" />
            </button>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Badge count={5} size="small">
                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <BellOutlined
                    className="text-gray-600 text-lg"
                    onClick={() => {
                      handleShowNocations();
                    }}
                  />
                </button>
              </Badge>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                />
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
    </div>
  );
};

export default Admin;
