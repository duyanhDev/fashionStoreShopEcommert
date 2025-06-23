import React, { useState, useEffect, useRef } from "react";
import { PostChatBotAI } from "../service/ChatBot";
import { useOutletContext } from "react-router-dom";
import chatbotData from "./../chatbot-data.json";

const BotChatAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: chatbotData.initial_message.text,
      sender: "bot",
    },
  ]);
  const { user, ListProducts } = useOutletContext();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const suggestionButtons = [
    { id: 1, text: "Danh sách sản phẩm", icon: "🛒" },
    { id: 2, text: "Sản phẩm cao cấp", icon: "💎" },
    { id: 3, text: "Thông tin tác giả", icon: "👨‍💻" },
    { id: 4, text: "Chính sách bảo hành", icon: "🛡️" },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const UserIcon = () => (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md">
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>
  );

  const BotIcon = () => (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <circle cx="8" cy="16" r="1" />
        <circle cx="16" cy="16" r="1" />
        <path d="M9 20v1" />
        <path d="M15 20v1" />
      </svg>
    </div>
  );

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center space-x-2">
      <div
        className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}
      ></div>
    </div>
  );

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
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    const lowerCaseMessage = messageToSend.trim().toLowerCase();
    const checkKeywords = (keywords) =>
      keywords.some((keyword) => lowerCaseMessage.includes(keyword));

    const keywordGroups = {
      products: ["list", "danh sách", "hàng hóa"],
      highPriceProducts: ["giá cao", "cao cấp", "đắt tiền", "premium"],
      author: [
        "người viết",
        "tác giả",
        "sáng lập",
        "creator",
        "thông tin tác giả",
      ],
      warranty: ["bảo hành", "chính sách", "đổi trả", "warranty"],
    };

    const timeoutId = setTimeout(async () => {
      try {
        if (checkKeywords(keywordGroups.products)) {
          const productSuggestions = ListProducts.map(
            (product, index) => `
            <li class="mb-4 p-4 bg-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300">
              <div class="flex justify-between items-center">
                <strong class="text-blue-600 text-lg">${index + 1}. ${
              product.name
            }</strong>
                <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">${product.price.toLocaleString()}đ</span>
              </div>
              <p class="text-gray-600 mt-2 text-sm">Mô tả sản phẩm đang được cập nhật...</p>
            </li>`
          ).join("");

          const botResponse = {
            id: Date.now() + 1,
            text: `<div class="space-y-3">
              <h3 class="text-xl font-bold text-blue-600 flex items-center"><span class="mr-2">🛒</span>Danh sách sản phẩm của chúng tôi:</h3>
              <ul class="mt-4 space-y-2">${productSuggestions}</ul>
              <p class="text-gray-500 text-sm italic mt-3">Nhấn vào sản phẩm để xem chi tiết</p>
            </div>`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, botResponse]);
        } else if (checkKeywords(keywordGroups.highPriceProducts)) {
          const productPricesMax = ListProducts.filter(
            (product) => product.price > 2000000
          )
            .map(
              (product, index) => `
              <li class="mb-4 p-4 bg-gray-100 rounded-xl border-l-4 border-yellow-400 hover:shadow-md transition-all duration-300">
                <div class="flex justify-between items-center">
                  <strong class="text-yellow-600 text-lg">${index + 1}. ${
                product.name
              }</strong>
                  <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">${product.price.toLocaleString()}đ</span>
                </div>
                <p class="text-gray-600 mt-2 text-sm">Sản phẩm cao cấp chất lượng hàng đầu</p>
                <div class="flex space-x-2 mt-3">
                  <span class="bg-gray-200 text-yellow-600 px-2 py-1 rounded text-xs">Premium</span>
                  <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Bảo hành 12 tháng</span>
                </div>
              </li>`
            )
            .join("");

          const productRes = {
            id: Date.now() + 2,
            text:
              productPricesMax.length > 0
                ? `<div class="space-y-3">
                    <h3 class="text-xl font-bold text-yellow-600 flex items-center"><span class="mr-2">💎</span>Sản phẩm cao cấp của chúng tôi:</h3>
                    <ul class="mt-4 space-y-2">${productPricesMax}</ul>
                    <p class="text-gray-500 text-sm italic mt-3">Trải nghiệm sản phẩm cao cấp ngay hôm nay</p>
                  </div>`
                : `<div class="p-5 bg-gray-100 rounded-xl border border-gray-200">
                    <p class="text-yellow-600 text-lg flex items-center"><span class="mr-2">🔍</span>Hiện tại không có sản phẩm cao cấp nào.</p>
                    <p class="text-gray-600 mt-2">Chúng tôi đang cập nhật thêm sản phẩm mới. Vui lòng quay lại sau.</p>
                  </div>`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, productRes]);
        } else if (checkKeywords(keywordGroups.author)) {
          const authorProfile = {
            name: "Đặng Trinh Duy Anh",
            education: "Đại học Thủ Dầu Một",
            skills: [
              "Phát triển ứng dụng web hiện đại",
              "Thành thạo React và Node.js",
              "Quản lý cơ sở dữ liệu với MongoDB",
              "Xây dựng hệ thống API mạnh mẽ",
            ],
            bio: "Một lập trình viên đầy nhiệt huyết với tầm nhìn đổi mới công nghệ.",
            contact: "duyanh@gmail.com",
            socialMedia: {
              github: "https://github.com/duyanh",
              linkedin: "https://linkedin.com/in/duyanh",
            },
            relationshipStatus: "Độc thân",
          };

          const authorResponse = {
            id: Date.now() + 3,
            text: `
            <div class="bg-gray-50 rounded-xl p-5 border-l-4 border-green-400 shadow-md">
              <div class="flex items-center mb-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-r from-green-300 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">
                  ${authorProfile.name.charAt(0)}
                </div>
                <div class="ml-4">
                  <h3 class="text-xl font-bold text-green-600">👨‍💻 ${
                    authorProfile.name
                  }</h3>
                  <p class="text-gray-600">${authorProfile.education}</p>
                </div>
              </div>
              <div class="space-y-4 text-gray-700">
                <div>
                  <h4 class="font-semibold text-green-600 mb-2 flex items-center"><span class="mr-2">⚡</span>Kỹ năng:</h4>
                  <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${authorProfile.skills
                      .map(
                        (s) =>
                          `<li class="flex items-center bg-gray-100 px-3 py-2 rounded-lg"><span class="text-green-500 mr-2">✓</span>${s}</li>`
                      )
                      .join("")}
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-green-600 mb-2 flex items-center"><span class="mr-2">📝</span>Tiểu sử:</h4>
                  <p class="bg-gray-100 p-3 rounded-lg">${authorProfile.bio}</p>
                </div>
                <div>
                  <h4 class="font-semibold text-green-600 mb-2 flex items-center"><span class="mr-2">📱</span>Liên hệ:</h4>
                  <div class="space-y-2">
                    <p class="flex items-center"><span class="text-blue-500 mr-2">📧</span>${
                      authorProfile.contact
                    }</p>
                    <a href="${
                      authorProfile.socialMedia.github
                    }" class="flex items-center text-blue-500 hover:underline" target="_blank"><span class="mr-2">🔗</span>GitHub: ${
              authorProfile.socialMedia.github
            }</a>
                    <a href="${
                      authorProfile.socialMedia.linkedin
                    }" class="flex items-center text-blue-500 hover:underline" target="_blank"><span class="mr-2">🔗</span>LinkedIn: ${
              authorProfile.socialMedia.linkedin
            }</a>
                  </div>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span class="font-semibold text-green-600">Trạng thái:</span>
                  <span class="bg-gray-100 px-3 py-1 rounded-full text-gray-700">${
                    authorProfile.relationshipStatus
                  }</span>
                </div>
              </div>
            </div>`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, authorResponse]);
        } else if (checkKeywords(keywordGroups.warranty)) {
          const warrantyResponse = {
            id: Date.now() + 4,
            text: `
            <div class="bg-gray-50 rounded-xl p-5 border-l-4 border-blue-400 shadow-md">
              <h3 class="text-xl font-bold text-blue-600 mb-4 flex items-center"><span class="mr-2">🛡️</span>Chính sách bảo hành</h3>
              <div class="space-y-4">
                <div class="bg-gray-100 p-4 rounded-lg">
                  <h4 class="font-medium text-blue-600 mb-2">Thời gian bảo hành</h4>
                  <ul class="space-y-2 text-gray-700">
                    <li class="flex items-center"><span class="text-blue-500 mr-2">✓</span><span>Sản phẩm thường: <strong>6 tháng</strong></span></li>
                    <li class="flex items-center"><span class="text-blue-500 mr-2">✓</span><span>Sản phẩm cao cấp: <strong>12 tháng</strong></span></li>
                    <li class="flex items-center"><span class="text-blue-500 mr-2">✓</span><span>Phụ kiện: <strong>3 tháng</strong></span></li>
                  </ul>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg">
                  <h4 class="font-medium text-blue-600 mb-2">Điều kiện bảo hành</h4>
                  <ul class="space-y-2 text-gray-700">
                    <li class="flex items-start"><span class="text-blue-500 mr-2 mt-1">•</span><span>Sản phẩm còn trong thời gian bảo hành và có phiếu bảo hành</span></li>
                    <li class="flex items-start"><span class="text-blue-500 mr-2 mt-1">•</span><span>Lỗi được xác nhận do nhà sản xuất</span></li>
                    <li class="flex items-start"><span class="text-blue-500 mr-2 mt-1">•</span><span>Sản phẩm không bị tác động vật lý, va đập hoặc ngấm nước</span></li>
                  </ul>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg">
                  <h4 class="font-medium text-blue-600 mb-2">Quy trình bảo hành</h4>
                  <ol class="space-y-2 text-gray-700">
                    <li class="flex items-start"><span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1">1</span><span>Liên hệ với trung tâm bảo hành qua hotline: <strong>1800-xxxx</strong></span></li>
                    <li class="flex items-start"><span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1">2</span><span>Mang sản phẩm đến trung tâm bảo hành hoặc gửi qua đường bưu điện</span></li>
                    <li class="flex items-start"><span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1">3</span><span>Nhận phiếu tiếp nhận bảo hành</span></li>
                    <li class="flex items-start"><span class="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1">4</span><span>Nhận sản phẩm sau khi bảo hành hoàn tất</span></li>
                  </ol>
                </div>
              </div>
              <p class="text-gray-500 text-sm italic mt-4">Mọi thắc mắc vui lòng liên hệ hotline: <strong>1800-xxxx</strong></p>
            </div>`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, warrantyResponse]);
        } else {
          const res = await PostChatBotAI(messageToSend.trim());
          if (res.data?.message?.content) {
            const formattedContent = res.data.message.content
              .replace(
                /(?:\*|[*] )(.*)/g,
                "<li class='ml-4 mb-2 flex items-start'><span class='text-blue-500 mr-2'>•</span>$1</li>"
              )
              .replace(
                /(?:[*]{2})(.*)(?:[*]{2})/g,
                "<strong class='text-blue-600'>$1</strong>"
              );

            const botResponse = {
              id: Date.now() + 5,
              text: `<div class="bg-gray-100 rounded-xl p-4">${formattedContent}</div>`,
              sender: "bot",
            };
            setMessages((prev) => [...prev, botResponse]);
          }
        }
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 6,
          text: `
          <div class="bg-red-100 border border-red-400 rounded-xl p-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-red-600">Xin lỗi bạn! Chức năng đang được phát triển nên chỉ trả lời được 1 số câu hỏi cơ bản (bản thử nghiệm)</p>
          </div>`,
          sender: "bot",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="flex flex-col h-screen bg-white mt-28">
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-white/20"></div>
        </div>
        <h1 className="text-2xl text-white text-center font-bold flex items-center justify-center relative z-10">
          <BotIcon />
          <span className="ml-3">Trợ lý thông minh AI</span>
        </h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start animate-fade-in-up ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && <BotIcon />}
              <div
                className={`px-5 py-3 rounded-2xl max-w-[80%] shadow-md ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-2"
                    : "bg-gray-100 text-gray-800 mr-2"
                }`}
              >
                {msg.sender === "bot" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                    className="prose max-w-none"
                  />
                ) : (
                  <p className="text-lg">{msg.text}</p>
                )}
              </div>
              {msg.sender === "user" && <UserIcon />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start justify-start animate-fade-in-up">
              <BotIcon />
              <div className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 mr-2 shadow-md">
                <LoadingSpinner />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-4 shadow-md">
        <div className="bg-white py-3 px-4 shadow-md overflow-x-auto">
          <div className="flex space-x-3 max-w-3xl mx-auto">
            {suggestionButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleSuggestionClick(button)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full whitespace-nowrap transition-all duration-300 transform hover:scale-105 border border-gray-300 hover:border-blue-400"
              >
                <span>{button.icon}</span>
                <span>{button.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSendMessage())
            }
            placeholder="Nhập tin nhắn của bạn..."
            className="w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-full pl-5 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none shadow-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            className="absolute right-2 bottom-2 p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-md disabled:opacity-50"
            disabled={isLoading}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotChatAI;
