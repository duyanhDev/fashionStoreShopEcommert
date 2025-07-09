import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  GiftFilled,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar } from "antd";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiHome } from "react-icons/fi";
import { FaOpencart } from "react-icons/fa";
import { FaSquarePollVertical } from "react-icons/fa6";
import { AiTwotoneAppstore } from "react-icons/ai";
import { RiBillLine } from "react-icons/ri";
import { FcFeedback } from "react-icons/fc";
const menuItems = [
  { icon: <FiHome />, label: "Thống kê ", to: "" },
  {
    icon: <UserOutlined />,
    label: "Tài khoản khách hàng",
    to: "/admin/usercustom",
  },
  {
    icon: <UserOutlined />,
    label: "Tài khoản Admin",
    to: "/admin/account",
  },
  { icon: <FiHome />, label: "Sản phẩm", to: "/admin/products" },
  { icon: <FaOpencart />, label: "Danh mục", to: "category" },
  { icon: <FaSquarePollVertical />, label: "Báo cáo", to: "/reports" },
  { icon: <RiBillLine />, label: "Đơn hàng", to: "order" },
  { icon: <AiTwotoneAppstore />, label: "Manage Store", to: "/manage-store" },
  {
    icon: <MessageOutlined />,
    label: "Trò chuyện",
    to: "/admin/support-chat",
  },
  { icon: <GiftFilled />, label: "Mã giảm giá", to: "/admin/voucher" },
  {
    icon: <FcFeedback />,
    label: "Phản hồi",
    to: "/admin/review",
  },
];

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // ❗ Đóng sidebar khi click ra ngoài (mobile only)
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

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-white/90 backdrop-blur-md shadow-xl transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block`}
      >
        <div className="text-3xl font-bold text-blue-600 text-center py-6 border-b">
          <Link to="/">DOIIN</Link>
        </div>
        <ul className="mt-6 space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-blue-100 text-gray-700 ${
                  location.pathname === item.to ||
                  location.pathname === `/admin/${item.to}`
                    ? "bg-blue-500 text-white shadow-md"
                    : ""
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-md h-16 px-4 md:px-6">
          <button onClick={toggleSidebar} className="text-2xl md:hidden">
            ☰
          </button>

          <div className="relative hidden sm:block w-72">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-full bg-gray-100 px-10 py-2 border focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <SearchOutlined className="absolute left-3 top-2.5 text-gray-400 text-lg" />
          </div>

          <div className="flex items-center gap-5">
            <IoMdNotificationsOutline size={28} className="text-gray-700" />
            <Avatar size={40} icon={<UserOutlined />} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
