import "./ChatSp.css";
import {
  CloseOutlined,
  PictureOutlined,
  DeleteOutlined,
  FilterOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

import {
  getMessages,
  sendMessageAdmin,
  getMessagesList,
  UpdateIsReadAPI,
  getListSender,
} from "../../service/Message";
import { useSelector } from "react-redux";

import socket from "../../socket";

const ChatSp = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [MessFriends, setMessFriends] = useState([]);
  const [data, SetData] = useState([]);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [senderId, setSenderId] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageFilter, setMessageFilter] = useState("all"); // 'all', 'unread', 'read'

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (mobile) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      await sendMessageAdmin(
        user?._id,
        senderId,
        newMessage,
        selectedImages,
        sentTime
      );

      const newMsg = {
        _id: new Date().getTime(),
        sender: user?._id,
        recipient: senderId,
        content: newMessage,
        images: selectedImages,
        sentAt: sentTime,
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);

      setNewMessage("");
      setSelectedImages([]);
      scrollToBottom();
      getListSenderId();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchgetMess = async () => {
    if (!user?._id) return;

    try {
      let res = await getMessages(user._id, senderId);
      if (res?.data) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchgetMessList = async () => {
    if (!user?._id) return;

    try {
      let res = await getMessagesList(user._id);

      if (res && res.EC === 0) {
        SetData(res.data);
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
      fetchgetMessList();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...(prevMessages || []), message]);
      fetchgetMess();
      fetchgetMessList();
      scrollToBottom();
    });

    fetchgetMess();
    fetchgetMessList();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newMessage");
    };
  }, [user?._id, senderId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleChangeSetId = (id) => {
    setSenderId(id);
    if (isMobileView) setShowSidebar(false);
  };

  const onChangeIsread = async () => {
    try {
      let data = await UpdateIsReadAPI(senderId, user._id);

      if (data) {
        fetchgetMessList();
        fetchgetMess();
      }
    } catch (error) {}
  };

  const getListSenderId = async () => {
    try {
      let res = await getListSender(user._id);

      if (res.data && res.data.EC === 0) {
        setMessFriends(res.data.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getListSenderId();
    fetchgetMessList();
  }, [user._id]);

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ`;
    return date.toLocaleDateString("vi-VN");
  };

  // Filter conversations
  const filteredFriends = MessFriends.filter((item, index, self) => {
    const matchesSearch =
      item.recipient?._id &&
      item.recipient?._id !== user._id &&
      item.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      index === self.findIndex((t) => t.recipient?._id === item.recipient?._id);

    if (!matchesSearch) return false;

    if (messageFilter === "all") return true;
    if (messageFilter === "unread") return !item.isRead;
    if (messageFilter === "read") return item.isRead;

    return true;
  });

  // Get current conversation
  const currentConversation = data.find(
    (item) => item.sender?._id === senderId && item.sender?._id !== user._id
  );

  // Statistics
  const totalMessages = MessFriends.filter(
    (item, index, self) =>
      item.recipient?._id &&
      item.recipient?._id !== user._id &&
      index === self.findIndex((t) => t.recipient?._id === item.recipient?._id)
  ).length;

  const unreadMessages = MessFriends.filter(
    (item, index, self) =>
      item.recipient?._id &&
      item.recipient?._id !== user._id &&
      !item.isRead &&
      index === self.findIndex((t) => t.recipient?._id === item.recipient?._id)
  ).length;

  console.log(MessFriends);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${showSidebar ? (isMobileView ? "w-full" : "w-80") : "w-0"} 
        ${isMobileView ? "absolute inset-0 z-50" : "relative"} 
        bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Hỗ trợ khách hàng</h1>
            {isMobileView && (
              <button
                onClick={() => setShowSidebar(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <CloseOutlined className="text-lg" />
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="flex flex-col items-center">
                <MessageOutlined className="text-white text-lg mb-1" />
                <span className="text-white font-bold text-sm">
                  {totalMessages}
                </span>
                <span className="text-white/80 text-xs">Tổng</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="flex flex-col items-center">
                <ClockCircleOutlined className="text-yellow-300 text-lg mb-1" />
                <span className="text-white font-bold text-sm">
                  {unreadMessages}
                </span>
                <span className="text-white/80 text-xs">Chưa đọc</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="flex flex-col items-center">
                <CheckCircleOutlined className="text-green-300 text-lg mb-1" />
                <span className="text-white font-bold text-sm">
                  {totalMessages - unreadMessages}
                </span>
                <span className="text-white/80 text-xs">Đã đọc</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-lg border border-white/30 focus:outline-none focus:bg-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex space-x-1">
            {[
              { key: "all", label: "Tất cả", count: totalMessages },
              { key: "unread", label: "Chưa đọc", count: unreadMessages },
              {
                key: "read",
                label: "Đã đọc",
                count: totalMessages - unreadMessages,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setMessageFilter(filter.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  messageFilter === filter.key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      messageFilter === filter.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
              <MessageOutlined className="text-4xl mb-3 text-gray-300" />
              <p className="text-center">
                {searchTerm
                  ? "Không tìm thấy cuộc trò chuyện nào"
                  : "Chưa có tin nhắn nào"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredFriends.map((item) => {
                return (
                  <div
                    key={item.recipient._id}
                    className={`rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm
                    ${
                      senderId === item.recipient._id
                        ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                        : "bg-white border border-gray-100"
                    }`}
                    onClick={() => {
                      handleChangeSetId(item.recipient._id);
                      onChangeIsread();
                    }}
                  >
                    <div className="flex items-center p-3">
                      <div className="relative">
                        <img
                          src={item.recipient.avatar}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          alt="avatar"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.recipient.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(item.sentAt)}
                            </span>
                            {!item.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-sm truncate ${
                              item.messageSender?._id !== user?._id &&
                              !item.isRead &&
                              "text-gray-900 font-medium"
                            }`}
                          >
                            {item.messageSender?._id === user?._id
                              ? `Bạn: ${item.content}`
                              : item.content}
                          </p>
                          {item.messageSender?._id !== user?._id &&
                            !item.isRead && (
                              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                Mới
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!currentConversation ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center p-8">
              <MessageOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isMobileView && (
                    <button
                      onClick={() => setShowSidebar(true)}
                      className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  )}

                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={currentConversation.sender.avatar}
                        alt={currentConversation.sender.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="ml-3">
                      <h2 className="font-semibold text-gray-900">
                        {currentConversation.sender.name}
                      </h2>
                      <p className="text-sm text-green-500 font-medium flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Đang hoạt động
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
            >
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
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        message.sender?._id === user?._id
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <img
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                        src={
                          message?.sender?.avatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt="Avatar"
                      />

                      <div
                        className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                          message.sender?._id === user?._id
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            message.sender?._id === user?._id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message?.sender?.name}
                        </div>

                        {/* Hiển thị text */}
                        {message.content && (
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        )}

                        {/* Hiển thị ảnh */}
                        {message.images && message.images.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {message.images.map((imageUrl, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={
                                  typeof imageUrl === "string"
                                    ? imageUrl
                                    : imageUrl
                                }
                                alt={`Message image ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/20"
                                onClick={() =>
                                  window.open(
                                    typeof imageUrl === "string"
                                      ? imageUrl
                                      : imageUrl,
                                    "_blank"
                                  )
                                }
                              />
                            ))}
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-between mt-2 ${
                            message.sender?._id === user?._id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">
                            {message.sentAt && formatTime(message.sentAt)}
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

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Hiển thị ảnh đã chọn */}
              {selectedImages.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    onClick={onChangeIsread}
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 transition-all"
                    style={{ minHeight: "48px", lineHeight: "20px" }}
                  />

                  <div className="absolute right-3 bottom-3">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
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
                </div>

                <div className="flex items-center space-x-2">
                  {/* Nút chọn ảnh */}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSp;
