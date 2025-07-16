import axios from "./../untils/axios";

const getMessages = async (userId, adminId) => {
  try {
    const response = await axios.get(`api/v1/message`, {
      params: { userId, adminId }, // Sử dụng đối tượng { key: value } cho params
    });
    return response.data; // Trả về dữ liệu tin nhắn
  } catch (error) {
    console.error("Error fetching messages:", error.message); // Log lỗi nếu xảy ra
    throw error; // Ném lỗi để xử lý ở nơi khác (nếu cần)
  }
};

const getMessagesList = async (userId) => {
  try {
    const response = await axios.get(`api/v1/message/all-users`, {
      params: { userId }, // Sử dụng đối tượng { key: value } cho params
    });
    return response.data; // Trả về dữ liệu tin nhắn
  } catch (error) {
    console.error("Error fetching messages:", error.message); // Log lỗi nếu xảy ra
    throw error; // Ném lỗi để xử lý ở nơi khác (nếu cần)
  }
};

//  Gửi tin nhắn từ khách hàng đến admin
const sendMessageCutomer = async (sender, content, images, isAdminChat) => {
  const formData = new FormData();
  formData.append("sender", sender); // Người gửi
  formData.append("content", content); // Nội dung tin nhắn

  if (images) {
    images.forEach((image) => {
      formData.append(`images`, image.file);
    });
  }
  formData.append("isAdminChat", isAdminChat); // Đánh dấu đây là tin nhắn từ admin hay khách hàng

  // If isAdminChat is false, do not append recipient

  try {
    const response = await axios.post(
      "api/v1/customer/send", // Đường dẫn API của bạn
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data; // Trả về dữ liệu từ backend
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

//  Gửi tin nhắn từ admin đến admin khách hàng
const sendMessageAdmin = async (
  sender,
  recipient,
  content,
  images,
  isAdminChat
) => {
  const formData = new FormData();
  formData.append("sender", sender);
  formData.append("recipient", recipient); // Người gửi
  formData.append("content", content); // Nội dung tin nhắn
  if (images) {
    images.forEach((image) => {
      formData.append(`images`, image.file);
    });
  }
  formData.append("isAdminChat", isAdminChat); // Đánh dấu đây là tin nhắn từ admin hay khách hàng

  // If isAdminChat is false, do not append recipient
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "api/v1/admin/send", // Đường dẫn API của bạn
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // Trả về dữ liệu từ backend
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const UpdateIsReadAPI = async (sender, recipient) => {
  return await axios.post("api/v1/update-isread", {
    sender,
    recipient,
  });
};

const getListSender = async (sender) => {
  return await axios.get(`api/v1/get-list-sender/${sender}`);
};
export {
  getMessages,
  sendMessageCutomer,
  getMessagesList,
  sendMessageAdmin,
  UpdateIsReadAPI,
  getListSender,
};
