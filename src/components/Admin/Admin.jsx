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
} from "@ant-design/icons";
import { Avatar, Badge } from "antd";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiHome, FiUsers, FiShoppingBag } from "react-icons/fi";
import { FaOpencart } from "react-icons/fa";
import { FaSquarePollVertical } from "react-icons/fa6";
import { AiTwotoneAppstore } from "react-icons/ai";
import { RiBillLine, RiAdminLine } from "react-icons/ri";
import { FcFeedback } from "react-icons/fc";
import { MdDashboard, MdCategory, MdInventory } from "react-icons/md";

const menuItems = [
  {
    icon: <MdDashboard className="text-xl" />,
    label: "Tổng quan",
    to: "",
    color: "text-blue-500",
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
    icon: <FcFeedback className="text-xl" />,
    label: "Đánh giá",
    to: "/admin/review",
    color: "text-gray-500",
  },
];

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

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
        <div className="overflow-y-auto h-full pb-20">
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
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
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
                  <BellOutlined className="text-gray-600 text-lg" />
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
    </div>
  );
};

export default Admin;
