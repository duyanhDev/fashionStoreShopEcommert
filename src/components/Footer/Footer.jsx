import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white p-8">
      {/* Top Section */}
      <div className="mb-8  flex gap-10">
        <div>
          <h2 className="text-xl font-bold mb-4">COOLMATE lắng nghe bạn!</h2>
          <p className="max-w-xl mb-4">
            Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng góp
            từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản phẩm tốt
            hơn nữa.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            ĐÓNG GÓP Ý KIẾN →
          </button>
        </div>

        {/* Contact Info */}
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="https://www.coolmate.me/images/footer/icon-hotline.svg"
              alt="phone"
              className="w-8"
            />

            <div>
              <span>Hotline</span>
              <br />
              <span>1900.272737 - 028.7777.2737</span>
              <br />
              <span>(8:30 - 22:00)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="https://www.coolmate.me/images/footer/icon-email.svg"
              alt="email"
            />

            <div>
              <span>Email</span>
              <br />
              <span>Cool@coolmate.me</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* COOLCLUB */}
        <div>
          <h3 className="font-bold mb-4">COOLCLUB</h3>
          <ul className="space-y-2">
            <li>Tài khoản CoolClub</li>
            <li>Ưu đãi & Đặc quyền</li>
          </ul>
        </div>

        {/* CHÍNH SÁCH */}
        <div>
          <h3 className="font-bold mb-4">CHÍNH SÁCH</h3>
          <ul className="space-y-2">
            <li>Chính sách đổi trả 60 ngày</li>
            <li>Chính sách khuyến mãi</li>
            <li>Chính sách bảo mật</li>
            <li>Chính sách giao hàng</li>
          </ul>
        </div>

        {/* CHĂM SÓC KHÁCH HÀNG */}
        <div>
          <h3 className="font-bold mb-4">CHĂM SÓC KHÁCH HÀNG</h3>
          <ul className="space-y-2">
            <li>Trải nghiệm mua sắm 100% hài lòng</li>
            <li>Hỏi đáp - FAQs</li>
          </ul>
        </div>

        {/* VỀ COOLMATE */}
        <div>
          <h3 className="font-bold mb-4">VỀ COOLMATE</h3>
          <ul className="space-y-2">
            <li>Coolmate 101</li>
            <li>DVKH xuất sắc</li>
            <li>Câu chuyện về Coolmate</li>
            <li>Nhà máy</li>
          </ul>
        </div>

        {/* ĐỊA CHỈ LIÊN HỆ */}
        <div>
          <h3 className="font-bold mb-4">ĐỊA CHỈ LIÊN HỆ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              Văn phòng Hà Nội: Tầng 3 Tòa nhà BMM, KM2, Đường Phùng Hưng,
              Phường Phúc La, Quận Hà Đông, TP Hà Nội
            </li>
            <li>
              Trung tâm vận hành Hà Nội: LO C8, KCN Lại Yên, Xã Lại Yên, Huyện
              Hoài Đức, Thành phố Hà Nội
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="flex gap-4 mt-8">
        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
          <span className="sr-only">Facebook</span>
          <i className="fab fa-facebook-f"></i>
        </div>
        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
          <span className="sr-only">Zalo</span>
          <i className="fas fa-comments"></i>
        </div>
        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
          <span className="sr-only">TikTok</span>
          <i className="fab fa-tiktok"></i>
        </div>
        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
          <span className="sr-only">Instagram</span>
          <i className="fab fa-instagram"></i>
        </div>
        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
          <span className="sr-only">YouTube</span>
          <i className="fab fa-youtube"></i>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 pt-8 border-t border-gray-700 text-sm">
        <p>© CÔNG TY TNHH FASTECH ASIA</p>
        <p className="mt-2">
          Mã số doanh nghiệp: 0108670058. Giấy chứng nhận đăng ký doanh nghiệp
          do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 20/02/2019.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
