import { useEffect, useRef, useState } from "react";
import { getMessages, sendMessageCutomer } from "./../../service/Message";
import { useSelector } from "react-redux";
import socket from "./../../socket";

const Message = ({ open, setOpen, assignedAdmin }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const LogoMess = "/support-avatar.png";

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
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

  const removeImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedImages.length === 0) return;

    try {
      const sentTime = new Date().toISOString();
      setIsTyping(true);

      await sendMessageCutomer(user?._id, newMessage, selectedImages, sentTime);

      const newMsg = {
        _id: new Date().getTime(),
        sender: {
          _id: user?._id,
          name: user?.name,
          avatar: user?.avatar,
        },
        content: newMessage,
        images: selectedImages,
        sentAt: sentTime,
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);

      setNewMessage("");
      setSelectedImages([]);
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  const fetchgetMess = async () => {
    if (!user?._id) return;

    try {
      const res = await getMessages(user._id, assignedAdmin);
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
  }, [user?._id, assignedAdmin]);

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

  const renderMessage = (message, index) => {
    if (!message) return null;

    const isCurrentUser = message.sender?._id === user?._id;
    const senderName = isCurrentUser ? user?.name : "Admin";
    const senderAvatar = isCurrentUser
      ? message.sender?.avatar || user?.avatar
      : "https://bizweb.dktcdn.net/100/109/262/themes/137829/assets/sp1.jpg?1759138490269";

    return (
      <div
        key={message?._id || index}
        className={`flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } mb-3`}
      >
        <div
          className={`flex items-end space-x-2 max-w-[85%] sm:max-w-xs lg:max-w-sm ${
            isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {!isCurrentUser && (
            <div className="flex-shrink-0">
              <img
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                src={senderAvatar || "/placeholder.svg?height=32&width=32"}
                alt="avatar"
              />
            </div>
          )}

          <div
            className={`px-3 py-2 rounded-2xl shadow-sm max-w-full ${
              isCurrentUser
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
            }`}
          >
            {!isCurrentUser && (
              <div className="text-xs font-medium mb-1 text-gray-500">
                {senderName}
              </div>
            )}

            {message.content && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                {message.content}
              </p>
            )}

            {message.images && message.images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {message.images.map((imageUrl, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={imageUrl || "/placeholder.svg?height=60&width=60"}
                    alt={`Message image ${imgIndex + 1}`}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(imageUrl, "_blank")}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-1">
              <span
                className={`text-xs ${
                  isCurrentUser ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {formatTime(message.sentAt)}
              </span>
              {isCurrentUser && (
                <svg
                  className="w-3 h-3 ml-1 text-blue-100"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          open && !isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out ${
          // Mobile: full screen when open, hidden when closed
          "lg:bottom-4 lg:right-4 lg:w-96 lg:max-w-none lg:relative lg:transform-none " +
          // Desktop: bottom-right corner
          (open && !isMinimized
            ? "inset-0 w-full h-full lg:inset-auto lg:w-96 lg:h-[32rem]"
            : isMinimized
            ? "bottom-4 right-4 w-80 h-14 lg:w-96 lg:h-16"
            : "bottom-4 right-4 w-16 h-16")
        }`}
      >
        <div
          className={`h-full bg-white rounded-none lg:rounded-2xl shadow-lg overflow-hidden flex flex-col ${
            isMinimized ? "lg:rounded-2xl" : "lg:rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
                  <div className="flex items-center text-xs opacity-90">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Đang hoạt động
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors lg:block hidden"
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
                      d={
                        isMinimized ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M20 12H4"
                      }
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0"
              >
                {/* Welcome message */}
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm">
                    <span className="mr-1">👋</span>
                    Chào mừng bạn đến với hỗ trợ!
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-2">
                  {Array.isArray(messages) && messages.map(renderMessage)}
                </div>

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">Đang gửi...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                {/* Image preview */}
                {selectedImages.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-xl">
                    <div className="flex flex-wrap gap-2">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={
                              image.preview ||
                              "/placeholder.svg?height=48&width=48"
                            }
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input row */}
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập tin nhắn..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
                      style={{ minHeight: "40px", maxHeight: "100px" }}
                    />
                    <button className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600">
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

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() && selectedImages.length === 0}
                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
      </div>

      {/* Floating action button - only show when closed or minimized */}
      {(!open || isMinimized) && (
        <button
          onClick={() => {
            setOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-105"
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

          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            1
          </div>
        </button>
      )}
    </>
  );
};

export default Message;
