import { useState, useEffect, useRef } from "react";
import { PostChatBotAI } from "../service/ChatBot";
import { useOutletContext } from "react-router-dom";
import chatbotData from "./../chatbot-data.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Function để làm sạch format response
const cleanResponseFormat = (text) => {
  if (!text) return text;

  return (
    text
      // Loại bỏ các dấu * không cần thiết
      .replace(/\*([^*]+)\*/g, "**$1**") // Chuyển *text* thành **text**
      .replace(/\*\*([^*]+)\*\*:/g, "### $1") // Chuyển **text**: thành ### text
      .replace(/^\*\s*/gm, "- ") // Chuyển * thành - cho bullet points
      .replace(/•\s*/g, "- ") // Chuyển • thành -
      .replace(/\n\s*-\s*\*([^*]+)\*:/g, "\n\n#### $1") // Format sub-headers
      .replace(/\*\*([^*]+)\*\*\s*\*\*([^*]+)\*\*:/g, "**$1 $2**:") // Gộp các ** liền kề
      .replace(/\n{3,}/g, "\n\n") // Giảm nhiều line break thành 2
      .replace(/^\s*\*+\s*/gm, "") // Loại bỏ * ở đầu dòng
      .replace(/:\*\*/g, ":**") // Fix format lỗi
      .trim()
  );
};

const BotChatAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: chatbotData.initial_message.text,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const { user, ListProducts } = useOutletContext();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const suggestionButtons = [
    {
      id: 1,
      text: "Danh sách sản phẩm",
      icon: "🛒",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      id: 2,
      text: "Sản phẩm cao cấp",
      icon: "💎",
      gradient: "from-green-600 to-emerald-700",
    },
    {
      id: 3,
      text: "Thông tin tác giả",
      icon: "👨‍💻",
      gradient: "from-gray-700 to-gray-800",
    },
    {
      id: 4,
      text: "Chính sách bảo hành",
      icon: "🛡️",
      gradient: "from-gray-600 to-gray-700",
    },
  ];

  // Scroll to bottom function - giống ChatGPT
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto scroll khi đang loading
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoading]);

  const UserAvatar = () => (
    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs sm:text-sm font-semibold shadow-lg ring-2 ring-emerald-100 flex-shrink-0">
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>
  );

  const BotAvatar = () => (
    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg ring-2 ring-gray-200 flex-shrink-0">
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    </div>
  );

  const LoadingIndicator = () => (
    <div className="flex items-center space-x-2 text-gray-500 px-4 py-3">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
      <span className="text-sm hidden sm:inline">Đang suy nghĩ...</span>
    </div>
  );

  const MessageActions = ({ message }) => (
    <div className="flex items-center space-x-1 sm:space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
      <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span className="hidden sm:inline">Sao chép</span>
      </button>
      <button className="flex items-center px-2 py-1 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      </button>
    </div>
  );

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.text);
    handleSendMessage(suggestion.text);
  };

  const handleSendMessage = async (manualInput = null) => {
    const messageToSend = manualInput || inputMessage;
    if (messageToSend.trim() === "") return;

    const newUserMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(false);

    const lowerCaseMessage = messageToSend.trim().toLowerCase();
    const checkKeywords = (keywords) =>
      keywords.some((keyword) => lowerCaseMessage.includes(keyword));

    const keywordGroups = {
      products: ["list", "danh sách", "hàng hóa", "tất cả sản phẩm"],
      highPriceProducts: ["giá cao", "cao cấp", "đắt tiền", "premium"],
      author: [
        "người viết",
        "tác giả",
        "sáng lập",
        "creator",
        "thông tin tác giả",
        "ceo",
      ],
      warranty: ["bảo hành", "chính sách", "đổi trả", "warranty"],
    };

    setTimeout(async () => {
      try {
        let botResponse;

        if (checkKeywords(keywordGroups.products)) {
          const productList = ListProducts.map((product, index) => ({
            name: product.name,
            price: product.price,
            index: index + 1,
            stock: product.stock,
          }));

          botResponse = {
            id: Date.now() + 1,
            text: `## 🛒 Danh sách sản phẩm

Chúng tôi có **${productList.length} sản phẩm** đang có sẵn:

${productList
  .map(
    (product, index) =>
      `**${index + 1}. ${product.name}**  
💰 Giá: ${product.price.toLocaleString()}đ  
📦 Tình trạng: ${product.stock > 0 ? "Còn hàng" : "Hết hàng"}`
  )
  .join("\n\n")}


---
*Nhấn vào sản phẩm để xem chi tiết hoặc liên hệ để được tư vấn thêm.*`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else if (checkKeywords(keywordGroups.highPriceProducts)) {
          const premiumProducts = ListProducts.filter(
            (product) => product.price > 2000000
          );

          if (premiumProducts.length > 0) {
            botResponse = {
              id: Date.now() + 2,
              text: `## 💎 Sản phẩm cao cấp

Chúng tôi có **${premiumProducts.length} sản phẩm cao cấp** dành cho bạn:

${premiumProducts
  .map(
    (product, index) =>
      `**${index + 1}. ${product.name}**  
💰 **${product.price.toLocaleString()}đ**  
⭐ Chất lượng premium  
🛡️ Bảo hành 12 tháng  
🚚 Miễn phí vận chuyển`
  )
  .join("\n\n")}

---
*Sản phẩm cao cấp với chất lượng hàng đầu và dịch vụ hậu mãi tốt nhất.*`,
              sender: "bot",
              timestamp: new Date(),
            };
          } else {
            botResponse = {
              id: Date.now() + 2,
              text: `## 🔍 Không tìm thấy sản phẩm cao cấp

Hiện tại chúng tôi đang cập nhật thêm các sản phẩm cao cấp mới.  
Vui lòng quay lại sau hoặc liên hệ để được thông báo khi có hàng mới.

📞 **Hotline**: 1800-xxxx  
📧 **Email**: support@company.com`,
              sender: "bot",
              timestamp: new Date(),
            };
          }
        } else if (checkKeywords(keywordGroups.author)) {
          botResponse = {
            id: Date.now() + 3,
            text: `## 👨‍💻 Thông tin tác giả

### **Đặng Trinh Duy Anh**
*Lập trình viên Full-stack | Đại học Thủ Dầu Một*

---

#### 🚀 **Kỹ năng chuyên môn**
- **Frontend**: React.js, Next.js, TypeScript
- **Backend**: Node.js, Express.js, MongoDB  
- **DevOps**: Docker, AWS, CI/CD
- **Mobile**: React Native

#### 💡 **Về tôi**
Một lập trình viên đầy nhiệt huyết với tầm nhìn đổi mới công nghệ. Luôn học hỏi và cập nhật những xu hướng mới nhất trong ngành IT.

#### 📱 **Liên hệ**
- 📧 **Email**: duyanh@gmail.com
- 🔗 **GitHub**: [github.com/duyanh](https://github.com/duyanh)
- 💼 **LinkedIn**: [linkedin.com/in/duyanh](https://linkedin.com/in/duyanh)

#### 💝 **Trạng thái**
🎯 Độc thân và tập trung phát triển sự nghiệp

---
*"Code is poetry, and every bug is a chance to learn something new."*`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else if (checkKeywords(keywordGroups.warranty)) {
          botResponse = {
            id: Date.now() + 4,
            text: `## 🛡️ Chính sách bảo hành

### **Thời gian bảo hành**
- 🔧 **Sản phẩm thường**: 6 tháng
- 💎 **Sản phẩm cao cấp**: 12 tháng  
- 🔌 **Phụ kiện**: 3 tháng

### **Điều kiện bảo hành**
✅ Sản phẩm còn trong thời gian bảo hành  
✅ Có phiếu bảo hành và hóa đơn mua hàng  
✅ Lỗi do nhà sản xuất  
❌ Không bảo hành: va đập, ngấm nước, tự sửa chữa

### **Quy trình bảo hành**
1. **Liên hệ**: Gọi hotline **1800-xxxx**
2. **Gửi sản phẩm**: Đến trung tâm hoặc gửi bưu điện
3. **Kiểm tra**: Nhận phiếu tiếp nhận
4. **Nhận hàng**: Sau khi sửa chữa hoàn tất

### **Trung tâm bảo hành**
📍 **Địa chỉ**: 123 Đường ABC, Quận XYZ, TP.HCM  
📞 **Hotline**: 1800-xxxx  
🕒 **Giờ làm việc**: 8:00 - 17:30 (T2-T7)

---
*Chúng tôi cam kết mang đến dịch vụ bảo hành tốt nhất cho khách hàng.*`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else {
          try {
            const res = await PostChatBotAI(messageToSend.trim());
            if (res.data?.response) {
              // Làm sạch format trước khi hiển thị
              const cleanedResponse = cleanResponseFormat(res.data.response);

              botResponse = {
                id: Date.now() + 5,
                text: cleanedResponse,
                sender: "bot",
                timestamp: new Date(),
              };
            }
          } catch (apiError) {
            botResponse = {
              id: Date.now() + 6,
              text: `## ⚠️ Thông báo

Xin lỗi bạn! Hệ thống đang trong quá trình phát triển và chỉ có thể trả lời một số câu hỏi cơ bản.

### Các chủ đề tôi có thể hỗ trợ:
- 🛒 Danh sách sản phẩm
- 💎 Sản phẩm cao cấp  
- 👨‍💻 Thông tin tác giả
- 🛡️ Chính sách bảo hành

Vui lòng thử lại với một trong những chủ đề trên!`,
              sender: "bot",
              timestamp: new Date(),
            };
          }
        }

        if (botResponse) {
          setMessages((prev) => [...prev, botResponse]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <style jsx>{`
        /* Custom scrollbar */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
          opacity: 0.7;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 shadow-lg ring-2 ring-green-100">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 via-green-700 to-emerald-600 bg-clip-text text-transparent">
                AI Assistant Pro
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Trực tuyến • Phản hồi nhanh chóng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto messages-container"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start mt-8 space-x-2 sm:space-x-4 group animate-in slide-in-from-bottom-4 duration-500 ${
                message.sender === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.sender === "bot" ? <BotAvatar /> : <UserAvatar />}

              <div
                className={`flex-1 max-w-[85%] sm:max-w-4xl ${
                  message.sender === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`relative ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl sm:rounded-3xl rounded-br-lg shadow-lg"
                      : "bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl sm:rounded-3xl rounded-bl-lg shadow-lg border border-green-100/50"
                  } p-3 sm:p-4 md:p-6 transition-all duration-200 hover:shadow-xl`}
                >
                  {message.sender === "bot" ? (
                    <div
                      className="prose prose-sm max-w-none 
  prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:leading-tight
  prose-h2:text-base  prose-h2:mt-0 prose-h2:mb-3 sm:prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-green-200
  prose-h3:text-sm  prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:mb-3 prose-h3:text-gray-800
  prose-h4:text-sm prose-h4:mt-3 sm:prose-h4:mt-4 prose-h4:mb-1 sm:prose-h4:mb-2 prose-h4:text-gray-700
  prose-p:text-sm sm:text-base prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 sm:prose-p:mb-4
  prose-strong:text-gray-900 prose-strong:font-semibold
  prose-ul:my-2 sm:prose-ul:my-3 prose-li:my-0.5 sm:prose-li:my-1 prose-li:text-sm sm:prose-li:text-base prose-li:text-gray-700
  prose-ol:my-2 sm:prose-ol:my-3 prose-ol:text-sm sm:prose-ol:text-base prose-ol:text-gray-700
  prose-code:text-green-600 prose-code:bg-green-50 
  prose-code:px-1.5 sm:prose-code:px-2 prose-code:py-0.5 sm:prose-code:py-1 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-3 sm:prose-pre:p-4
  prose-blockquote:border-l-green-500 prose-blockquote:bg-green-50 prose-blockquote:text-green-900
  prose-hr:border-green-200 prose-hr:my-4 sm:prose-hr:my-6
  prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
  prose-table:text-xs sm:prose-table:text-sm prose-table:border-collapse
  prose-th:border prose-th:border-green-200 prose-th:bg-green-50 prose-th:p-1 sm:prose-th:p-2 prose-th:text-xs sm:prose-th:text-sm
  prose-td:border prose-td:border-green-200 prose-td:p-1 sm:prose-td:p-2 prose-td:text-xs sm:prose-td:text-sm"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-white font-medium leading-relaxed text-sm sm:text-base">
                      {message.text}
                    </p>
                  )}

                  {/* Message Footer */}
                  <div
                    className={`flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t ${
                      message.sender === "user"
                        ? "border-emerald-400/30"
                        : "border-green-200/50"
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg
                        className={`w-3 h-3 ${
                          message.sender === "user"
                            ? "text-emerald-200"
                            : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className={`text-xs ${
                          message.sender === "user"
                            ? "text-emerald-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {message.sender === "bot" && (
                      <MessageActions message={message} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2 sm:space-x-4 animate-in slide-in-from-bottom-4 duration-300">
              <BotAvatar />
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl rounded-bl-lg shadow-lg border border-green-100/50">
                <LoadingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/95 backdrop-blur-md border-t border-green-100 shadow-lg">
        {/* Suggestion Buttons */}
        {isTyping && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {suggestionButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleSuggestionClick(button)}
                  className={`group relative overflow-hidden bg-gradient-to-r ${button.gradient} text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-3`}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-lg sm:text-xl relative z-10">
                    {button.icon}
                  </span>
                  <div className="text-center sm:text-left relative z-10">
                    <div className="font-medium text-xs sm:text-sm">
                      {button.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-green-100/50 overflow-hidden">
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                setIsTyping(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
              className="w-full min-h-[50px] sm:min-h-[60px] pr-12 sm:pr-16 p-3 sm:p-4 border-0 focus:outline-none focus:ring-0 resize-none text-gray-800 placeholder:text-gray-400 bg-transparent text-sm sm:text-base"
              disabled={isLoading}
              rows={2}
            />
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center space-x-1 sm:space-x-2">
              {inputMessage.trim() && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:inline">
                  {inputMessage.length} ký tự
                </span>
              )}
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile helper text */}
          <div className="mt-2 text-center sm:hidden">
            <p className="text-xs text-gray-500">Nhấn Enter để gửi tin nhắn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotChatAI;
