import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import socket from "../../socket";

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
    <footer className="bg-black text-white p-6 mt-0">
      {/* Thông tin chính */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
        {/* Logo & Giới thiệu */}
        <div className="max-w-sm">
          <h2 className="text-lg font-bold mb-2">DA Fashion</h2>
          <p className="text-sm">
            Thời trang chất lượng – Phong cách của bạn. Chúng tôi luôn lắng nghe
            để mang đến trải nghiệm tốt nhất.
          </p>
        </div>

        {/* Liên hệ */}
        <div className="text-sm">
          <p className="font-semibold mb-1">Liên hệ</p>
          <p>Hotline: 0901 234 567</p>
          <p>Email: dafashion@gmail.com</p>
          <p>Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</p>
        </div>

        {/* Mạng xã hội */}
        <div>
          <p className="font-semibold mb-2">Kết nối với chúng tôi</p>
          <div className="flex gap-3">
            <a
              href="#"
              className="w-8 h-8 border border-white flex items-center justify-center rounded-full hover:bg-white hover:text-black"
            >
              <FaFacebook />
            </a>
            <a
              href="#"
              className="w-8 h-8 border border-white flex items-center justify-center rounded-full hover:bg-white hover:text-black"
            >
              <FaTiktok />
            </a>
            <a
              href="#"
              className="w-8 h-8 border border-white flex items-center justify-center rounded-full hover:bg-white hover:text-black"
            >
              <FaInstagram />
            </a>
          </div>
          <div>Tổng người online: {count}</div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="border-t border-gray-700 pt-4 text-xs text-center">
        © {new Date().getFullYear()} DA Fashion. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
