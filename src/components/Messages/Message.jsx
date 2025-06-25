import {
  CloseOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./Message.css";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { getMessages, sendMessageCutomer } from "../../service/Message";
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

const Message = ({ open, setOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
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

  console.log(user._id);

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

  // Upload ảnh lên server (bạn cần implement API này)

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
      let res = await getMessages(user._id, "673017dde4526bd79cc61fa6");
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

  return (
    <div className="flex flex-col mess_chat max-w-md mx-auto bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin</h1>
        <h1 onClick={() => setOpen((prve) => !prve)} className="cursor-pointer">
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
                <div className="flex items-center gap-1">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={message?.sender?.avatar}
                    alt="avatar"
                  />
                  <span>{message?.sender?.name}</span>
                </div>

                {/* Hiển thị text */}
                {message.content && (
                  <p className="whitespace-pre-wrap mt-2">{message.content}</p>
                )}

                {/* Hiển thị ảnh */}
                {message.images && message.images.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.images.map((imageUrl, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={imageUrl}
                        alt={`Message image ${imgIndex + 1}`}
                        className="w-20 h-20 rounded-lg cursor-pointer"
                        onClick={() => window.open(imageUrl, "_blank")}
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
  );
};

export default Message;
