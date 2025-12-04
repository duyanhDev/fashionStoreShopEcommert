import { useState, useEffect, useRef } from "react";
import { PostChatBotAI } from "../service/ChatBot";
import { useOutletContext } from "react-router-dom";
import chatbotData from "./../chatbot-data.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ExternalLink } from "lucide-react";

// Function để làm sạch format response
const cleanResponseFormat = (text) => {
  if (!text) return text;

  return text
    .replace(/\*([^*]+)\*/g, "**$1**")
    .replace(/\*\*([^*]+)\*\*:/g, "### $1")
    .replace(/^\*\s*/gm, "- ")
    .replace(/•\s*/g, "- ")
    .replace(/\n\s*-\s*\*([^*]+)\*:/g, "\n\n#### $1")
    .replace(/\*\*([^*]+)\*\*\s*\*\*([^*]+)\*\*:/g, "**$1 $2**:")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*\*+\s*/gm, "")
    .replace(/:\*\*/g, ":**")
    .trim();
};

const BotChatAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
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
      label: "Xem tất cả",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      text: "Sản phẩm cao cấp",
      label: "Premium",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: 3,
      text: "Thông tin tác giả",
      label: "Về chúng tôi",
      gradient: "from-slate-500 to-slate-600",
    },
    {
      id: 4,
      text: "Chính sách bảo hành",
      label: "Hỗ trợ",
      gradient: "from-emerald-500 to-emerald-600",
    },
  ];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoading]);

  const UserAvatar = () => (
    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-md flex-shrink-0">
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>
  );

  const BotAvatar = () => (
    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs font-bold shadow-md flex-shrink-0">
      AI
    </div>
  );

  const LoadingIndicator = () => (
    <div className="flex items-center space-x-3 text-slate-500 px-5 py-4">
      <div className="flex space-x-1.5">
        <div
          className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
      <span className="text-sm font-medium">Đang suy nghĩ</span>
    </div>
  );

  const MessageActions = ({ message }) => (
    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
      <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        Sao chép
      </button>
      <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
        Hữu ích
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
      sale: ["top sản phẩm bán chạy", "sản phẩm bán chạy nhất"],
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
            slug: product.slug,
            id: product.id || product._id,
            view: product.view,
          }));

          botResponse = {
            id: Date.now() + 1,
            text: `## Danh sách sản phẩm

Chúng tôi có **${productList.length} sản phẩm** đang có sẵn:

${productList
  .map(
    (product, index) =>
      `**${index + 1}. [${product.name}](/product/${product.slug})**  
Giá: ${product.price.toLocaleString()}đ  
Tình trạng: ${product.stock > 0 ? "Còn hàng" : "Hết hàng"}`
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
              text: `## Sản phẩm cao cấp

Chúng tôi có **${premiumProducts.length} sản phẩm cao cấp** dành cho bạn:

${premiumProducts
  .map(
    (product, index) =>
      `**${index + 1}. [${product.name}](/product/${product.slug})**  
Giá: **${product.price.toLocaleString()}đ**  
Chất lượng premium  
Bảo hành 12 tháng  
Miễn phí vận chuyển`
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
              text: `## Không tìm thấy sản phẩm cao cấp

Hiện tại chúng tôi đang cập nhật thêm các sản phẩm cao cấp mới.  
Vui lòng quay lại sau hoặc liên hệ để được thông báo khi có hàng mới.

**Hotline**: 1800-xxxx  
**Email**: support@company.com`,
              sender: "bot",
              timestamp: new Date(),
            };
          }
        } else if (checkKeywords(keywordGroups.sale)) {
          if (!ListProducts || !Array.isArray(ListProducts)) {
            console.error("❌ ListProducts chưa có dữ liệu!");
            return;
          }

          const topSale = ListProducts.filter(
            (product) => Number(product.sold || 0) > 3000
          ).slice(0, 5);

          if (topSale.length > 0) {
            botResponse = {
              id: Date.now() + 2,
              text: `## Sản phẩm thuộc top bán chạy nhất

Chúng tôi có **${topSale.length} sản phẩm** bán chạy nhất dành cho bạn:

${topSale
  .map(
    (product, index) =>
      `**${index + 1}. [${product.name}](/product/${product.slug})**  
Giá: **${Number(product.price || 0).toLocaleString()}đ**  
Chất lượng premium  
Bảo hành 12 tháng  
Miễn phí vận chuyển`
  )
  .join("\n\n")}

---

*Sản phẩm bán chạy nhất của Shop.*`,
              sender: "bot",
              timestamp: new Date(),
            };
          } else {
            botResponse = {
              id: Date.now() + 2,
              text: "Hiện chưa có sản phẩm nào đạt ngưỡng bán chạy trên 3000 lượt.",
              sender: "bot",
              timestamp: new Date(),
            };
          }
        } else if (checkKeywords(keywordGroups.author)) {
          botResponse = {
            id: Date.now() + 3,
            text: `## Thông tin tác giả

### **Đặng Trinh Duy Anh**
*Lập trình viên Full-stack | Đại học Thủ Dầu Một*

---

#### Kỹ năng chuyên môn
- **Frontend**: React.js, Next.js, TypeScript
- **Backend**: Node.js, Express.js, MongoDB  
- **DevOps**: Docker, AWS, CI/CD
- **Mobile**: React Native

#### Về tôi
Một lập trình viên đầy nhiệt huyết với tầm nhìn đổi mới công nghệ. Luôn học hỏi và cập nhật những xu hướng mới nhất trong ngành IT.

#### Liên hệ
- **Email**: duyanh@gmail.com
- **GitHub**: [github.com/duyanh](https://github.com/duyanh)
- **LinkedIn**: [linkedin.com/in/duyanh](https://linkedin.com/in/duyanh)

#### Trạng thái
Độc thân và tập trung phát triển sự nghiệp

---
*"Code is poetry, and every bug is a chance to learn something new."*`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else if (checkKeywords(keywordGroups.warranty)) {
          botResponse = {
            id: Date.now() + 4,
            text: `## Chính sách bảo hành

### **Thời gian bảo hành**
- **Sản phẩm thường**: 6 tháng
- **Sản phẩm cao cấp**: 12 tháng  
- **Phụ kiện**: 3 tháng

### **Điều kiện bảo hành**
- Sản phẩm còn trong thời gian bảo hành  
- Có phiếu bảo hành và hóa đơn mua hàng  
- Lỗi do nhà sản xuất  
- Không bảo hành: va đập, ngấm nước, tự sửa chữa

### **Quy trình bảo hành**
1. **Liên hệ**: Gọi hotline **1900-633-988 **
2. **Gửi sản phẩm**: Đến trung tâm hoặc gửi bưu điện
3. **Kiểm tra**: Nhận phiếu tiếp nhận
4. **Nhận hàng**: Sau khi sửa chữa hoàn tất

### **Trung tâm bảo hành**
**Địa chỉ**: 178 Huỳnh Văn Lũy, P. Phú Lợi, TP. Thủ Dầu Một, Bình Dương  
**Hotline**: 1900-633-988  
**Giờ làm việc**: 8:00 - 17:30 (T2-T7)

---
*Chúng tôi cam kết mang đến dịch vụ bảo hành tốt nhất cho khách hàng.*`,
            sender: "bot",
            timestamp: new Date(),
          };
        } else {
          try {
            const res = await PostChatBotAI(messageToSend.trim());
            console.log(res);

            if (res.data?.response) {
              const cleanedResponse = cleanResponseFormat(res.data.response);

              botResponse = {
                id: Date.now() + 5,
                text: cleanedResponse,
                sender: "bot",
                timestamp: new Date(),
                products: res.data.products || [],
              };
            }
          } catch (apiError) {
            botResponse = {
              id: Date.now() + 6,
              text: `## Thông báo

Xin lỗi bạn! Hệ thống đang trong quá trình phát triển và chỉ có thể trả lời một số câu hỏi cơ bản.

### Các chủ đề tôi có thể hỗ trợ:
- Danh sách sản phẩm
- Sản phẩm cao cấp  
- Thông tin tác giả
- Chính sách bảo hành

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

  const ProductCard = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {product.image ? (
          <img
            src={product.image?.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mb-3">
          {product.price !== product.discountedPrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.price?.toLocaleString("vi-VN")}đ
            </span>
          )}
          <span className="text-sm font-bold text-blue-600">
            {product.discountedPrice?.toLocaleString("vi-VN")}đ
          </span>
        </div>
        <a
          href={product.detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <span>Xem chi tiết</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">
                  AI
                </span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800">
                  Trợ Lí Ảo AI
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Trực tuyến</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              Phản hồi nhanh chóng
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 mt-11">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 sm:gap-4 group animate-in slide-in-from-bottom-4 duration-500 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.sender === "bot" ? <BotAvatar /> : <UserAvatar />}

              <div
                className={`flex-1 max-w-[85%] sm:max-w-3xl ${
                  message.sender === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`relative ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl rounded-br-md shadow-lg"
                      : "bg-white text-slate-800 rounded-3xl rounded-bl-md shadow-md border border-slate-100"
                  } px-5 py-4 sm:px-6 sm:py-5 transition-all duration-200 hover:shadow-xl`}
                >
                  {/* Render text content */}
                  {message.sender === "user" ? (
                    // User message: plain text
                    <p className="text-white font-medium leading-relaxed text-sm sm:text-base">
                      {message.text}
                    </p>
                  ) : (
                    // Bot message: markdown
                    <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-h2:text-lg prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200 prose-h3:text-base prose-h3:mt-5 prose-h3:mb-3 prose-h4:text-sm prose-h4:mt-4 prose-h4:mb-2 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-strong:font-semibold prose-ul:my-3 prose-li:my-1 prose-li:text-slate-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-hr:border-slate-200 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Timestamp và actions */}
                  <div
                    className={`flex items-center justify-between mt-4 pt-3 border-t ${
                      message.sender === "user"
                        ? "border-blue-400/30"
                        : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>

                    {message.sender === "bot" && (
                      <MessageActions message={message} />
                    )}
                  </div>
                </div>
                {/* Render products BÊN NGOÀI message bubble */}
                {message.sender === "bot" &&
                  message.products &&
                  message.products.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-700 mb-3">
                        🛍️ Sản phẩm gợi ý:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {message.products.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 duration-300">
              <BotAvatar />
              <div className="bg-white rounded-3xl rounded-bl-md shadow-md border border-slate-100">
                <LoadingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 shadow-lg">
        {isTyping && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {suggestionButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleSuggestionClick(button)}
                  className={`group relative overflow-hidden bg-gradient-to-r ${button.gradient} text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 px-4 py-3 sm:py-4 rounded-xl`}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center">
                    <div className="text-xs font-semibold opacity-80 mb-1">
                      {button.label}
                    </div>
                    <div className="font-bold text-xs sm:text-sm">
                      {button.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                setIsTyping(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
              className="w-full min-h-[60px] pr-16 p-4 sm:p-5 border-0 focus:outline-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 bg-transparent text-sm sm:text-base"
              disabled={isLoading}
              rows={2}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {inputMessage.trim() && (
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium hidden sm:inline-block">
                  {inputMessage.length}
                </span>
              )}
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-white text-sm"
              >
                {isLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
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
                  "↑"
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">
              Nhấn <span className="font-semibold">Enter</span> để gửi •{" "}
              <span className="font-semibold">Shift + Enter</span> để xuống dòng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotChatAI;
