import {
  CloseOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./Message.css";
import { useEffect, useRef, useState } from "react";
import { getMessages, sendMessageCutomer } from "../../service/Message";
import { useSelector } from "react-redux";
import socket from "../../socket";
import LogoMess from "../../assets/Image/Home/logo_mess.png";
const Message = ({ open, setOpen, assignedAdmin }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  // Xử lý chọn ảnh
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const imagePromises = imageFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file: file,
              preview: e.target.result,
              id: Date.now() + Math.random(),
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then((images) => {
        setSelectedImages((prev) => [...prev, ...images]);
      });
    }
    e.target.value = "";
  };

  // Xóa ảnh đã chọn
  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedImages.length === 0) return;

    try {
      const sentTime = new Date().toISOString();

      // Gửi tin nhắn với ảnh
      await sendMessageCutomer(user?._id, newMessage, selectedImages, sentTime);

      // Thêm tin nhắn vào state
      const newMsg = {
        _id: new Date().getTime(),
        sender: user?._id,
        content: newMessage,
        images: selectedImages,
        sentAt: sentTime,
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);

      setNewMessage("");
      setSelectedImages([]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchgetMess = async () => {
    if (!user?._id) return;

    try {
      let res = await getMessages(user._id, assignedAdmin);
      if (res?.data) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected");
      fetchgetMess();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...(prevMessages || []), message]);
      fetchgetMess();
      scrollToBottom();
    });

    fetchgetMess();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newMessage");
    };
  }, [user?._id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Container */}
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-80 sm:w-96 h-96 sm:h-[500px]"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              <div>
                <h2 className="font-semibold text-lg">Hỗ trợ khách hàng</h2>
                <p className="text-sm text-blue-100">Đang hoạt động</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Phone Call */}
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>

              {/* Video Call */}
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CloseOutlined className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Content - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
              style={{ height: "calc(100% - 120px - 80px)" }}
            >
              {/* Welcome Message */}
              <div className="flex justify-center">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                  Chào mừng bạn đến với hỗ trợ khách hàng! 👋
                </div>
              </div>

              {Array.isArray(messages) &&
                messages.map((message, index) => (
                  <div
                    key={message?._id || index}
                    className={`flex ${
                      message.sender?._id === user?._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs ${
                        message.sender?._id === user?._id
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <img
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                        src={
                          message.sender._id === user?._id
                            ? message?.sender?.avatar
                            : LogoMess
                        }
                        alt="avatar"
                      />

                      <div
                        className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender?._id === user?._id
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        {/* Sender Name */}
                        <div
                          className={`text-xs font-medium mb-1 ${
                            message.sender?._id === user?._id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.sender._id === user?._id
                            ? message?.sender?.name
                            : "TrendHunter"}
                        </div>

                        {/* Message Content */}
                        {message.content && (
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        )}

                        {/* Images */}
                        {message.images && message.images.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {message.images.map((imageUrl, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={imageUrl}
                                alt={`Message image ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/20"
                                onClick={() => window.open(imageUrl, "_blank")}
                              />
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div
                          className={`flex items-center justify-between mt-2 ${
                            message.sender?._id === user?._id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">
                            {formatTime(message.sentAt)}
                          </span>
                          {message.sender?._id === user?._id && (
                            <div className="ml-2">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    style={{
                      minHeight: "44px",
                      maxHeight: "120px",
                      lineHeight: "20px",
                    }}
                  />

                  {/* Emoji Button */}
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
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
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Image Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <PictureOutlined className="text-lg" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim() && selectedImages.length === 0}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button - Shows when minimized or chat closed */}
      {(isMinimized || !open) && (
        <div className="absolute bottom-0 right-0">
          <button
            onClick={() => {
              if (!open) setOpen(true);
              setIsMinimized(false);
            }}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center relative"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Message;
