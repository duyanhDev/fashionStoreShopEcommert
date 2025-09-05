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
    const senderName = isCurrentUser ? user?.name : "TrendHunter";
    const senderAvatar = isCurrentUser
      ? message.sender?.avatar || user?.avatar
      : LogoMess;

    return (
      <div
        key={message?._id || index}
        className={`flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`flex items-end space-x-3 max-w-xs lg:max-w-sm ${
            isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          <div className="relative flex-shrink-0">
            <img
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
              src={
                senderAvatar ||
                "/placeholder.svg?height=40&width=40&query=user avatar"
              }
              alt="avatar"
            />
            {!isCurrentUser && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div
            className={`relative px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
              isCurrentUser
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md ml-2"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md mr-2"
            }`}
          >
            <div
              className={`text-xs font-medium mb-1 ${
                isCurrentUser ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {senderName}
            </div>

            {message.content && (
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {message.content}
              </p>
            )}

            {message.images && message.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {message.images.map((imageUrl, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={
                      imageUrl ||
                      "/placeholder.svg?height=80&width=80&query=message image"
                    }
                    alt={`Message image ${imgIndex + 1}`}
                    className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-white/20 shadow-sm"
                    onClick={() => window.open(imageUrl, "_blank")}
                  />
                ))}
              </div>
            )}

            <div
              className={`flex items-center justify-between mt-2 ${
                isCurrentUser ? "text-blue-100" : "text-gray-400"
              }`}
            >
              <span className="text-xs">{formatTime(message.sentAt)}</span>
              {isCurrentUser && (
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
    );
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <div
        className={`backdrop-blur-lg border border-white/20 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMinimized
            ? "w-80 h-16 rounded-2xl"
            : "w-80 sm:w-96 h-[32rem] sm:h-[36rem] rounded-3xl"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          className="relative p-4 rounded-t-3xl text-white overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full animate-pulse"
              style={{
                transform: "translate(-50%, -50%)",
                animation: "float 6s ease-in-out infinite",
              }}
            ></div>
            <div
              className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full animate-pulse"
              style={{
                transform: "translate(50%, -50%)",
                animation: "float 8s ease-in-out infinite reverse",
              }}
            ></div>
            <div
              className="absolute bottom-0 left-1/3 w-20 h-20 bg-white rounded-full animate-pulse"
              style={{
                transform: "translate(-50%, 50%)",
                animation: "float 7s ease-in-out infinite",
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>

              <div>
                <p className="font-semibold text-sm">Hỗ trợ khách hàng</p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Đang hoạt động
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>

              <button className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
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
                    d={isMinimized ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M20 12H4"}
                  />
                </svg>
              </button>

              <button
                onClick={() => setOpen(false)}
                className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
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
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 relative"
              style={{
                height: "calc(100% - 140px)",
                background:
                  "linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)",
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-5 w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>
                <div
                  className="absolute top-32 right-8 w-1 h-1 bg-purple-300 rounded-full opacity-40 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute top-64 left-12 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-35 animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
              </div>

              <div className="flex justify-center mb-6 relative z-10">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 px-6 py-3 rounded-full text-sm font-medium border border-blue-200 shadow-sm">
                  <span className="mr-2">👋</span>
                  Chào mừng bạn đến với hỗ trợ khách hàng!
                </div>
              </div>

              <div className="relative z-10">
                {Array.isArray(messages) && messages.map(renderMessage)}
              </div>

              {isTyping && (
                <div className="flex justify-start relative z-10">
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
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

            <div
              className="p-4 backdrop-blur-lg border-t border-white/20 rounded-b-3xl"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {selectedImages.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={
                            image.preview ||
                            "/placeholder.svg?height=56&width=56&query=preview image"
                          }
                          alt="Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all bg-white/90 backdrop-blur-sm text-gray-800 placeholder:text-gray-400"
                    style={{
                      minHeight: "48px",
                      maxHeight: "120px",
                      lineHeight: "20px",
                    }}
                  />

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
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all duration-200"
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
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim() && selectedImages.length === 0}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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

      {(isMinimized || !open) && (
        <div className="absolute bottom-0 right-0">
          <button
            onClick={() => {
              if (!open) setOpen(true);
              setIsMinimized(false);
            }}
            className="w-16 h-16 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center relative group hover:scale-105 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <svg
              className="w-7 h-7 transition-transform group-hover:scale-110 relative z-10"
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

            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse z-20">
              1
            </div>

            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Message;
