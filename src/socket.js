import { io } from "socket.io-client";

// chỉ khởi tạo 1 socket duy nhất
const socket = io("https://fashionstoreshopecommertbe.onrender.com", {
  autoConnect: true,
});

export default socket;
