import { Link, Outlet } from "react-router-dom";
import "./Admin.css";
import {
  GifOutlined,
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
const Admin = () => {
  return (
    <div className="container">
      <div className="nav flex justify-between  ">
        <div className="w-1/6 text-center p-4">
          <Link to="/">DOIIN</Link>
        </div>
        <div className="flex justify-between w-5/6 h-20 p-4 ">
          <div className="relative w-80 h-8 flex items-center cursor-pointer">
            <input
              type="text"
              className="w-full h-full nav_input p-5"
              placeholder="Tìm kiếm sản phẩm "
            />
            <SearchOutlined className="absolute right-0 text-xl mr-3 text-[#ccc]" />
          </div>
          <div className="flex items-center gap-10 ">
            <h1>
              <IoMdNotificationsOutline size={30} />
            </h1>
            <Avatar size={40} icon={<UserOutlined />} />
          </div>
        </div>
      </div>
      <div className="nav_content flex ">
        <div className="nav_left w-1/6 text-center ">
          <ul className="nav_content_ul text-center m-auto ">
            <li>
              <Link to="" className="nav-link">
                <FiHome />
                Dashobar
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="nav-link">
                <FiHome />
                Products
              </Link>
            </li>
            <li>
              <Link to="category" className="nav-link">
                <FaOpencart />
                Category
              </Link>
            </li>
            <li>
              <Link to="/reports" className="nav-link ">
                <FaSquarePollVertical />
                Reports
              </Link>
            </li>
            <li>
              <Link to="/suppliers" className="nav-link">
                <UserOutlined />
                Suppliers
              </Link>
            </li>
            <li>
              <Link to="order" className="nav-link">
                <RiBillLine />
                Orders
              </Link>
            </li>
            <li>
              <Link to="/manage-store" className="nav-link">
                <AiTwotoneAppstore />
                Manage Store
              </Link>
            </li>
            <li>
              <Link to="/admin/support-chat" className="nav-link">
                <MessageOutlined />
                Support Chat
              </Link>
            </li>
            <li>
              <Link to="/admin/voucher" className="nav-link">
                <GiftFilled />
                Voucher
              </Link>
            </li>
          </ul>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
