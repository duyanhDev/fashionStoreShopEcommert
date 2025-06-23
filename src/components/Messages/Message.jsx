import { CloseOutlined } from "@ant-design/icons";
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
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Gửi tin nhắn cho server
      const sentTime = new Date().toISOString(); // Lấy thời gian hiện tại

      await sendMessageCutomer(user?._id, newMessage, null, sentTime); // Truyền sentTime

      // Thêm tin nhắn vào state ngay lập tức mà không cần phải reload
      const newMsg = {
        _id: new Date().getTime(), // Dùng thời gian làm _id tạm thời
        sender: user?._id,
        content: newMessage,
        sentAt: sentTime,
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);

      setNewMessage("");
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
                <div className="flex  items-center gap-1">
                  <img
                    className="w-12 h-12 rounded-full"
                    src={message?.sender?.avatar}
                  />
                  <span>{message?.sender?.name}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {message.sentAt &&
                    new Date(message.sentAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
      </div>

      <div className="p-4 bg-white border-t">
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
          <div className="flex-shrink-0 self-center">
            <button
              type="submit"
              disabled={!newMessage.trim()}
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
