import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTiktok,
  FaUsers,
} from "react-icons/fa";
import socket from "../../socket";
import { Link } from "react-router-dom";

const Footer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on("updateOnlineCount", (num) => {
      setCount(num);
    });

    return () => {
      socket.off("updateOnlineCount");
    };
  }, []);

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                DA Fashion
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                Thời trang chất lượng cao với phong cách hiện đại. Chúng tôi cam
                kết mang đến cho khách hàng những sản phẩm tốt nhất và trải
                nghiệm mua sắm tuyệt vời.
              </p>

              {/* Online Counter */}
              <div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 
                            backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2"
              >
                <FaUsers className="text-green-400 text-sm" />
                <span className="text-sm font-medium">
                  <span className="text-green-400">
                    {count.toLocaleString()}
                  </span>{" "}
                  người đang online
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6 relative">
              Liên hệ
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </h3>

            <div className="space-y-3">
              <a
                href="tel:0901234567"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div
                  className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center 
                              group-hover:bg-blue-500/30 transition-colors"
                >
                  <FaPhone className="text-blue-400 text-sm" />
                </div>
                <span>0901 234 567</span>
              </a>

              <a
                href="mailto:dafashion@gmail.com"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div
                  className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center 
                              group-hover:bg-purple-500/30 transition-colors"
                >
                  <FaEnvelope className="text-purple-400 text-sm" />
                </div>
                <span>dafashion@gmail.com</span>
              </a>

              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mt-0.5">
                  <FaMapMarkerAlt className="text-red-400 text-sm" />
                </div>
                <span className="leading-relaxed">
                  123 Đường ABC, Quận 1,
                  <br />
                  TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6 relative">
              Kết nối với chúng tôi
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500"></div>
            </h3>

            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="group relative w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center 
                          overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <FaFacebook className="text-white text-lg relative z-10" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 
                              group-hover:opacity-100 transition-opacity"
                ></div>
              </a>

              <a
                href="#"
                className="group relative w-12 h-12 bg-black rounded-xl flex items-center justify-center 
                          overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/25"
              >
                <FaTiktok className="text-white text-lg relative z-10" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-0 
                              group-hover:opacity-100 transition-opacity"
                ></div>
              </a>

              <a
                href="#"
                className="group relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl 
                          flex items-center justify-center overflow-hidden transition-all duration-300 
                          hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25"
              >
                <FaInstagram className="text-white text-lg relative z-10" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 
                              group-hover:opacity-100 transition-opacity"
                ></div>
              </a>
            </div>

            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              Theo dõi chúng tôi để cập nhật những xu hướng thời trang mới nhất
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} DA Fashion. Tất cả quyền được bảo
              lưu.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link
                to="/changelog"
                className="hover:text-white transition-colors"
              >
                Lịch sử thay đổi website
              </Link>
              <Link
                to="/dieu-khoan-va-chinh-sach-bao-mat-thong-tin-ca-nhan"
                className="hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/dieu-khoan-va-chinh-sach-bao-mat-thong-tin-ca-nhan"
                className="hover:text-white transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                to="https://www.facebook.com/anhcanvlog"
                className="hover:text-white transition-colors"
              >
                Hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
