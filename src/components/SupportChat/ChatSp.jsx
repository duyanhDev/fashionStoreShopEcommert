import "./ChatSp.css";
import {
  CloseOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  getMessages,
  sendMessageAdmin,
  getMessagesList,
  UpdateIsReadAPI,
  getListSender,
} from "../../service/Message";
import { useSelector } from "react-redux";

const socket = io("http://localhost:9000", {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
});

// const socket = io("https://fashionstoreshop.onrender.com/", {
//   withCredentials: true,
//   reconnection: true,
//   reconnectionAttempts: 5,
// });
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

    // Reset input
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
      // Gửi tin nhắn cho server
      const sentTime = new Date().toISOString(); // Lấy thời gian hiện tại

      await sendMessageAdmin(
        user?._id,
        senderId,
        newMessage,
        selectedImages,
        sentTime
      ); // Truyền selectedImages

      // Thêm tin nhắn vào state ngay lập tức mà không cần phải reload
      const newMsg = {
        _id: new Date().getTime(), // Dùng thời gian làm _id tạm thời
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

  return (
    <div className="chat_container ">
      <div className="flex justify-between m-6 main_chat">
        <div className="w-1/5 main_chat-users">
          <h1 className="text_main-h1 text-center">Tất cả</h1>
          {MessFriends &&
            MessFriends.length > 0 &&
            MessFriends.filter(
              (item, index, self) =>
                item.recipient?._id &&
                item.recipient?._id !== user._id && // Lọc bỏ cuộc trò chuyện với chính mình
                index ===
                  self.findIndex(
                    (t) => t.recipient?._id === item.recipient?._id
                  )
            ).map((item) => (
              <div
                key={item.recipient._id}
                className="mt-5 cursor-pointer"
                onClick={onChangeIsread}
              >
                <div
                  className="flex justify-center gap-3 items-center"
                  onClick={() => handleChangeSetId(item.recipient._id)}
                >
                  <img
                    src={item.recipient.avatar}
                    className="w-12 h-12 rounded-full"
                    alt="avatar"
                  />
                  <div className="w-32">
                    <span>{item.recipient.name}</span>
                    <p
                      className={`${
                        item.isRead ? "text-blue-400" : "text-black font-bold"
                      }`}
                    >
                      {item.messageSender?._id === user?._id
                        ? `Bạn: ${item.content}`
                        : item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="w-4/5">
          <div className="flex flex-col mess_users-cl mt-4">
            <div className="text-white flex justify-between items-center">
              <h1 className="text-xl font-bold text-black">
                {data
                  .filter(
                    (item, index, self) =>
                      item.sender?._id && // Kiểm tra item.recipient và item.recipient._id
                      index ===
                        self.findIndex((t) => t.sender?._id === senderId)
                  )
                  .map(
                    (item) =>
                      item.sender?._id !== user._id && (
                        <div
                          key={item.sender._id}
                          className="mt-5 cursor-pointer"
                        >
                          <div
                            className="flex justify-center gap-3 items-center "
                            onClick={() => handleChangeSetId(item.sender._id)}
                          >
                            <img
                              src={item.sender.avatar}
                              className="w-12 h-12 rounded-full "
                              alt="avatar"
                            />
                            <div>
                              <span>{item.sender.name}</span>
                            </div>
                          </div>
                        </div>
                      )
                  )}
              </h1>
              <h1 className="text-xl font-bold text-black">
                <CloseOutlined />
              </h1>
            </div>

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
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
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender?._id === user?._id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <div className="flex  items-center gap-1">
                        <img
                          className="w-12 h-12 rounded-full"
                          src={
                            message?.sender?.avatar || "default-avatar-url.jpg"
                          } // URL ảnh mặc định nếu không có avatar
                          alt="Avatar"
                        />

                        <span>{message?.sender?.name}</span>
                      </div>

                      {/* Hiển thị text */}
                      {message.content && (
                        <p className="whitespace-pre-wrap mt-2">
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
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
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

                      <span className="text-xs opacity-75 mt-1 block">
                        {message.sentAt &&
                          new Date(message.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-white border-t">
              {/* Hiển thị ảnh đã chọn */}
              {selectedImages.length > 0 && (
                <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="relative flex items-end space-x-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    onClick={onChangeIsread}
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 resize-none min-h-[40px] max-h-[150px] overflow-y-auto"
                    style={{ lineHeight: "20px" }}
                  />
                </div>

                {/* Nút chọn ảnh */}
                <div className="flex-shrink-0 self-center">
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
                    className="h-10 w-10 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none flex items-center justify-center"
                  >
                    <PictureOutlined />
                  </button>
                </div>

                <div className="flex-shrink-0 self-center">
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && selectedImages.length === 0}
                    className="h-10 px-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none disabled:opacity-50"
                  >
                    Gửi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSp;
