import React, { useState } from "react";
import {
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
  CreditCard,
  Package,
  AlertCircle,
} from "lucide-react";

export default function PrivacyTermsPage() {
  const [activeTab, setActiveTab] = useState("privacy");
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const privacySections = [
    {
      id: "info-collect",
      icon: <User className="w-5 h-5" />,
      title: "Thông Tin Chúng Tôi Thu Thập",
      content: `Khi bạn sử dụng dịch vụ của chúng tôi, chúng tôi có thể thu thập các thông tin sau:
      
• Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng
• Thông tin thanh toán: Thông tin thẻ tín dụng/ghi nợ được xử lý an toàn qua cổng thanh toán
• Thông tin đơn hàng: Lịch sử mua hàng, sở thích sản phẩm
• Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, hệ điều hành
• Cookies và dữ liệu sử dụng: Để cải thiện trải nghiệm người dùng`,
    },
    {
      id: "info-use",
      icon: <Lock className="w-5 h-5" />,
      title: "Cách Chúng Tôi Sử Dụng Thông Tin",
      content: `Thông tin của bạn được sử dụng để:
      
• Xử lý và giao hàng đơn đặt hàng của bạn
• Gửi thông báo về đơn hàng và cập nhật vận chuyển
• Cải thiện dịch vụ khách hàng và hỗ trợ
• Gửi thông tin khuyến mãi (nếu bạn đồng ý)
• Phân tích xu hướng và cải thiện website
• Phát hiện và ngăn chặn gian lận
• Tuân thủ các yêu cầu pháp lý`,
    },
    {
      id: "info-protect",
      icon: <Shield className="w-5 h-5" />,
      title: "Bảo Mật Thông Tin",
      content: `Chúng tôi cam kết bảo vệ thông tin của bạn:
      
• Mã hóa SSL/TLS cho tất cả giao dịch
• Tuân thủ tiêu chuẩn PCI DSS cho thanh toán
• Hệ thống bảo mật nhiều lớp
• Đào tạo nhân viên về bảo mật dữ liệu
• Sao lưu dữ liệu thường xuyên
• Không chia sẻ thông tin với bên thứ ba không liên quan`,
    },
    {
      id: "user-rights",
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Quyền Của Bạn",
      content: `Bạn có các quyền sau đối với dữ liệu cá nhân:
      
• Quyền truy cập và xem thông tin cá nhân
• Quyền chỉnh sửa hoặc cập nhật thông tin
• Quyền xóa tài khoản và dữ liệu
• Quyền từ chối nhận email marketing
• Quyền yêu cầu xuất dữ liệu cá nhân
• Quyền khiếu nại với cơ quan có thẩm quyền
      
Để thực hiện các quyền này, vui lòng liên hệ bộ phận hỗ trợ khách hàng.`,
    },
  ];

  const termsSections = [
    {
      id: "account",
      icon: <User className="w-5 h-5" />,
      title: "Tài Khoản Người Dùng",
      content: `Khi tạo tài khoản, bạn đồng ý:
      
• Cung cấp thông tin chính xác và đầy đủ
• Bảo mật thông tin đăng nhập của bạn
• Chịu trách nhiệm về mọi hoạt động trên tài khoản
• Thông báo ngay nếu phát hiện truy cập trái phép
• Không chia sẻ tài khoản cho người khác
• Tuân thủ các quy định về độ tuổi (từ 16 tuổi trở lên)`,
    },
    {
      id: "orders",
      icon: <Package className="w-5 h-5" />,
      title: "Đặt Hàng & Thanh Toán",
      content: `Chính sách đặt hàng:
      
• Tất cả giá được hiển thị bằng VNĐ và đã bao gồm VAT
• Đơn hàng được xác nhận qua email sau khi đặt
• Chúng tôi có quyền từ chối đơn hàng trong trường hợp đặc biệt
• Thanh toán được xử lý an toàn qua cổng thanh toán
• Hóa đơn VAT được cung cấp theo yêu cầu
• Thời gian xử lý đơn hàng: 1-2 ngày làm việc`,
    },
    {
      id: "shipping",
      icon: <Package className="w-5 h-5" />,
      title: "Giao Hàng & Đổi Trả",
      content: `Chính sách giao hàng và đổi trả:
      
• Giao hàng toàn quốc trong 3-7 ngày làm việc
• Miễn phí vận chuyển cho đơn hàng trên 500.000đ
• Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi
• Sản phẩm đổi trả phải còn nguyên tem, mác
• Hoàn tiền trong 7-14 ngày sau khi nhận hàng trả
• Khách hàng chịu phí ship đổi size (nếu không lỗi)`,
    },
    {
      id: "intellectual",
      icon: <Shield className="w-5 h-5" />,
      title: "Sở Hữu Trí Tuệ",
      content: `Bảo vệ quyền sở hữu trí tuệ:
      
• Tất cả nội dung trên website thuộc quyền sở hữu của chúng tôi
• Logo, hình ảnh, thiết kế được bảo vệ bởi luật bản quyền
• Cấm sao chép, phân phối nội dung mà không có sự cho phép
• Sản phẩm giả mạo sẽ bị xử lý theo pháp luật
• Khách hàng không được sử dụng nội dung cho mục đích thương mại`,
    },
    {
      id: "liability",
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Giới Hạn Trách Nhiệm",
      content: `Điều khoản trách nhiệm:
      
• Chúng tôi không chịu trách nhiệm về:
  - Thiệt hại gián tiếp hoặc ngẫu nhiên
  - Mất mát dữ liệu hoặc lợi nhuận
  - Gián đoạn dịch vụ do bảo trì hoặc sự cố kỹ thuật
• Trách nhiệm tối đa không vượt quá giá trị đơn hàng
• Bảo hành sản phẩm theo quy định của nhà sản xuất
• Khuyến nghị kiểm tra hàng khi nhận`,
    },
    {
      id: "changes",
      icon: <FileText className="w-5 h-5" />,
      title: "Thay Đổi Điều Khoản",
      content: `Về việc thay đổi điều khoản:
      
• Chúng tôi có quyền cập nhật điều khoản bất cứ lúc nào
• Thay đổi có hiệu lực ngay khi đăng lên website
• Người dùng sẽ được thông báo về thay đổi quan trọng
• Việc tiếp tục sử dụng dịch vụ đồng nghĩa chấp nhận thay đổi
• Điều khoản cập nhật lần cuối: Tháng 9/2025`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-32">
      {/* Header */}
      <div className="bg-black shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Fashion Store</h1>
              <p className="text-gray-300 text-sm">
                Thời trang cao cấp dành cho bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === "privacy"
                  ? "text-emerald-700 border-emerald-600 bg-emerald-50"
                  : "text-gray-600 border-transparent hover:text-emerald-600 hover:bg-gray-50"
              }`}
            >
              <Shield className="w-5 h-5" />
              Chính Sách Bảo Mật
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                activeTab === "terms"
                  ? "text-emerald-700 border-emerald-600 bg-emerald-50"
                  : "text-gray-600 border-transparent hover:text-emerald-600 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              Điều Khoản Sử Dụng
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Intro Section */}
          <div className="p-8 bg-gradient-to-r from-gray-900 to-black border-b-4 border-emerald-600">
            <h2 className="text-3xl font-bold text-white mb-3">
              {activeTab === "privacy"
                ? "Chính Sách Bảo Mật"
                : "Điều Khoản Sử Dụng"}
            </h2>
            <p className="text-gray-300 text-lg">
              {activeTab === "privacy"
                ? "Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Vui lòng đọc kỹ chính sách để hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn."
                : "Vui lòng đọc kỹ các điều khoản sử dụng trước khi sử dụng dịch vụ của chúng tôi. Việc sử dụng website đồng nghĩa với việc bạn chấp nhận các điều khoản này."}
            </p>
            <p className="text-emerald-400 text-sm mt-3 font-medium">
              Cập nhật lần cuối: 30 tháng 9, 2025
            </p>
          </div>

          {/* Sections */}
          <div className="p-8">
            {(activeTab === "privacy" ? privacySections : termsSections).map(
              (section, index) => (
                <div key={section.id} className="mb-4">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-xl transition-all border-2 ${
                      expandedSection === section.id
                        ? "bg-emerald-50 border-emerald-600 shadow-md"
                        : "bg-white border-gray-200 hover:border-emerald-400 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          expandedSection === section.id
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {section.icon}
                      </div>
                      <span className="font-semibold text-gray-900 text-left">
                        {section.title}
                      </span>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {expandedSection === section.id && (
                    <div className="mt-3 p-6 bg-gray-50 rounded-xl border-2 border-emerald-200">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-gray-100 p-8 border-t-2 border-gray-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-emerald-600">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Liên Hệ Với Chúng Tôi
                </h3>
                <p className="text-gray-700 mb-3">
                  Nếu bạn có bất kỳ câu hỏi nào về{" "}
                  {activeTab === "privacy"
                    ? "chính sách bảo mật"
                    : "điều khoản sử dụng"}
                  , vui lòng liên hệ:
                </p>
                <div className="space-y-1 text-sm text-gray-800">
                  <p>📧 Email: support@fashionstore.vn</p>
                  <p>📞 Hotline: 1900 xxxx</p>
                  <p>📍 Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center text-sm text-gray-700">
          <p>
            Bằng việc sử dụng website, bạn đồng ý với{" "}
            <button
              onClick={() => setActiveTab("privacy")}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Chính Sách Bảo Mật
            </button>{" "}
            và{" "}
            <button
              onClick={() => setActiveTab("terms")}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Điều Khoản Sử Dụng
            </button>{" "}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
