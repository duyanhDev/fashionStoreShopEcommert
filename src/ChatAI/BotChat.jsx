import React, { useState } from "react";
import { PostChatBotAI } from "../service/ChatBot";
import { useOutletContext } from "react-router-dom";
import chatbotData from "./../chatbot-data.json";
const BotChatAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: chatbotData.initial_message.text,
      sender: "bot",
    },
  ]);
  const { user, ListProducts } = useOutletContext();

  const [inputMessage, setInputMessage] = useState("");

  // Icons for user and bot
  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const BotIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z"
      />
    </svg>
  );

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  );

  // Handle sending messages
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newUserMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    const lowerCaseMessage = inputMessage.trim().toLowerCase();

    // Hàm kiểm tra từ khóa
    const checkKeywords = (keywords) =>
      keywords.some((keyword) => lowerCaseMessage.includes(keyword));

    // Nhóm từ khóa
    const keywordGroups = {
      products: ["sản phẩm", "list", "danh sách", "hàng hóa"],
      highPriceProducts: ["giá cao", "cao cấp", "đắt tiền", "premium"],
      author: ["người viết", "tác giả", "sáng lập", "creator"],
    };

    // Xử lý sản phẩm
    if (checkKeywords(keywordGroups.products)) {
      const productSuggestions = ListProducts.map(
        (product, index) => `
          <li>
            <strong>${index + 1}. ${product.name}</strong>
            <p>Giá: ${product.price.toLocaleString()}đ</p>
          </li>`
      ).join("");

      const botResponse = {
        id: Date.now() + 1,
        text: `
          <strong>🛒 Danh sách sản phẩm của chúng tôi:</strong>
          <ul>${productSuggestions}</ul>
        `,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botResponse]);
      return;
    }

    // Xử lý sản phẩm cao cấp
    if (checkKeywords(keywordGroups.highPriceProducts)) {
      const productPricesMax = ListProducts.filter(
        (product) => product.price > 2000000
      )
        .map(
          (product, index) => `
        <li>
          <strong>${index + 1}. ${product.name}</strong>
          <p>Giá: ${product.price.toLocaleString()}đ</p>
        </li>`
        )
        .join("");

      const productRes = {
        id: Date.now() + 2,
        text:
          productPricesMax.length > 0
            ? `
            <strong>💎 Sản phẩm cao cấp của chúng tôi:</strong>
            <ul>${productPricesMax}</ul>
          `
            : "🔍 Hiện tại không có sản phẩm cao cấp nào.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, productRes]);
      return;
    }

    // Xử lý thông tin tác giả
    if (checkKeywords(keywordGroups.author)) {
      const authorProfile = {
        name: "Đặng Trinh Duy Anh",
        education: "Đại học Thủ Dầu Một",
        skills: [
          "Phát triển ứng dụng web hiện đại",
          "Thành thạo React và Node.js",
          "Quản lý cơ sở dữ liệu với MongoDB",
          "Xây dựng hệ thống API mạnh mẽ",
        ],
        bio: "Một lập trình viên đầy nhiệt huyết với tầm nhìn đổi mới công nghệ. Luôn tìm cách học hỏi, sáng tạo và áp dụng những công nghệ mới để giải quyết các bài toán phức tạp.",
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
          <strong>👨‍💻 Giới thiệu người sáng lập:</strong>
          <ul>
            <li><strong>Họ và tên:</strong> ${authorProfile.name}</li>
            <li><strong>Học vấn:</strong> ${authorProfile.education}</li>
            <li>
              <strong>Kỹ năng nổi bật:</strong>
              <ul>
                ${authorProfile.skills
                  .map((skill) => `<li>✅ ${skill}</li>`)
                  .join("")}
              </ul>
            </li>
            <li><strong>Tiểu sử:</strong> ${authorProfile.bio}</li>
            <li>
              <strong>Liên hệ:</strong> 
              <p>📧 Email: ${authorProfile.contact}</p>
              <p>🔗 GitHub: ${authorProfile.socialMedia.github}</p>
              <p>🔗 LinkedIn: ${authorProfile.socialMedia.linkedin}</p>
            </li>
            <li><strong>Trạng thái:</strong> ${
              authorProfile.relationshipStatus
            }</li>
          </ul>
        `,
        sender: "bot",
      };

      setMessages((prev) => [...prev, authorResponse]);
      return;
    }

    // Xử lý tin nhắn AI nếu không khớp các từ khóa
    try {
      const res = await PostChatBotAI(inputMessage.trim());

      if (res.data?.message?.content) {
        const formattedContent = res.data.message.content
          .replace(/(?:\*|[*] )(.*)/g, "<li>$1</li>")
          .replace(/(?:[*]{2})(.*)(?:[*]{2})/g, "<strong>$1</strong>");

        const botResponse = {
          id: Date.now() + 1,
          text: formattedContent,
          sender: "bot",
        };

        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-200 mt-28">
      {/* Header - ChatGPT style */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <h1 className="text-xl text-white text-center font-semibold">
          Tôi có thể giúp gì cho bạn?
        </h1>
      </div>

      {/* Message list */}
      <div className="flex-grow overflow-y-auto bg-gray-900">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 p-4 ${
                msg.sender === "user" ? "bg-gray-900" : "bg-gray-800"
              }`}
            >
              {msg.sender === "bot" && <BotIcon />}
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                {msg.sender === "bot" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: msg.text,
                    }}
                    className="prose prose-invert"
                  />
                ) : (
                  msg.text
                )}
              </div>
              {msg.sender === "user" && (
                <div className="flex items-center space-x-2 ">
                  <UserIcon />
                  <p className="text-sm text-gray-400">
                    {user?.name || "Người dùng"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input box - ChatGPT style */}
      <div className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
            placeholder="Nhập tin nhắn..."
            className="w-full bg-gray-700 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-gray-600 resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-2 bottom-2.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-600"
          >
            <SendIcon />
          </button>
        </div>

        {/* Bottom toolbar */}
        <div className="max-w-3xl mx-auto mt-2 flex items-center space-x-2 text-gray-400">
          <button className="p-2 hover:bg-gray-800 rounded">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotChatAI;
