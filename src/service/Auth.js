import { User } from "lucide-react";
import axios from "./../untils/axios";

const LoginAuth = async (email, password) => {
  return await axios.post("api/v1/login", {
    email,
    password,
  });
};

const UserAuth = async () => {
  return await axios.get("api/v1/users");
};

const get_profile_user = async (id) => {
  return await axios.get(`api/v1/profile-users`, {
    params: { id },
  });
};

const update_profileUser = async (
  id,
  name,
  city,
  district,
  ward,
  phone,
  gender,
  dateOfBirth,
  height,
  weight,
  role,
  permissions,
  avatar
) => {
  const data = new FormData();

  // Appending fields to the FormData object
  data.append("id", id);
  data.append("name", name);
  data.append("city", city);
  data.append("district", district);
  data.append("ward", ward);
  data.append("phone", phone);
  data.append("gender", gender);
  data.append("dateOfBirth", dateOfBirth);
  data.append("height", height);
  data.append("weight", weight);
  data.append("role", role);
  data.append("permissions", permissions);
  // Ensure avatar is either a file or null before appending
  if (avatar) {
    // If avatar is a file, append it
    data.append("avatar", avatar);
  }

  try {
    // Sending PUT request with FormData to the backend
    const response = await axios.put(`api/v1/updateProfile`, data, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure it's set to handle file uploads
      },
    });
    return response.data; // Return response data for further use
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating user profile:", error);
    throw error; // Optionally throw error or handle it with a custom message
  }
};

const update_profileAdmin = async (
  id,
  name,
  city,
  district,
  ward,
  phone,
  gender,
  dateOfBirth,
  height,
  weight,
  role,
  permissions,
  avatar
) => {
  const data = new FormData();
  const token = localStorage.getItem("token");
  // Appending fields to the FormData object
  data.append("id", id);
  data.append("name", name);
  data.append("city", city);
  data.append("district", district);
  data.append("ward", ward);
  data.append("phone", phone);
  data.append("gender", gender);
  data.append("dateOfBirth", dateOfBirth);
  data.append("height", height);
  data.append("weight", weight);
  data.append("role", role);
  data.append("permissions", permissions);
  // Ensure avatar is either a file or null before appending
  if (avatar) {
    // If avatar is a file, append it
    data.append("avatar", avatar);
  }

  try {
    // Sending PUT request with FormData to the backend
    const response = await axios.put(`api/v1/updateProfile-admin`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Return response data for further use
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating user profile:", error);
    throw error; // Optionally throw error or handle it with a custom message
  }
};

const ChanglePasswordAPI = async (id, currentPassword, newPassword) => {
  return await axios.put("api/v1/changel-passsword", {
    id,
    currentPassword,
    newPassword,
  });
};

const Forgotpassword = async (email) => {
  return await axios.post(`api/v1/forgetpassword`, {
    email,
  });
};

const ResetPassword = async (token, newPassword) => {
  return await axios.post(
    "/api/v1/reset-password",
    { token, newPassword },
    { headers: { "Content-Type": "application/json" } }
  );
};

const checkRestToken = async (token) => {
  return await axios.get(`api/v1/check-reset-token/${token}`);
};
const RegisterUser = async (name, email, password, isAdmin) => {
  const data = new FormData();

  data.append("name", name);
  data.append("email", email);
  data.append("password", password);
  data.append("isAdmin", isAdmin);
  return await axios.post("api/v1/register", data, {
    headers: {
      "Content-Type": "multipart/form-data", // Ensure it's set to handle file uploads
    },
  });
};

const SendverifyOTP = async (email) => {
  return await axios.post("api/v1/send-otp", { email });
};

const verifyOTP = async (email, otp, name, password, isAdmin = false) => {
  const data = new FormData();
  data.append("email", email);
  data.append("otp", otp);
  data.append("name", name);
  data.append("password", password);
  data.append("isAdmin", isAdmin);

  return await axios.post("api/v1/verify-otp", data, {
    headers: {
      "Content-Type": "multipart/form-data", // Ensure it's set to handle file uploads
    },
  });
};

const RefreshTokenUser = async () => {
  return await axios.post("api/v1/refresh-token");
};

const DeleteUserAPI = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`api/v1/delete-user/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

const AdminChangleProfileAPI = async (
  email,
  password,
  passwordAdmin,
  adminEmail
) => {
  try {
    const token = localStorage.getItem("token");
    return await axios.put(
      `api/v1/config-password`,
      { email, password, passwordAdmin, adminEmail },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {}
};

const AdminChangleNewpassword = async (email, passwordAdmin, adminEmail) => {
  try {
    const token = localStorage.getItem("token");
    return await axios.post(
      `api/v1/send-newpassword`,
      { email, passwordAdmin, adminEmail },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {}
};

const getRandomAdminAPI = async () => {
  return await axios.get(`api/v1/admins`);
};

const RegisterUserAPI_Alternative = async (
  name,
  email,
  password,
  role,
  permissions,
  avatarUrl
) => {
  try {
    const token = localStorage.getItem("token");
    return await axios.post(
      `api/v1/register-admin`,
      {
        name: name,
        email: email,
        password: password,
        role: role,
        permissions: permissions,
        avatar: avatarUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const isAccountUserLockerAPI = async (userId, isAccountLocked) => {
  const token = localStorage.getItem("token");

  return await axios.put(
    `/api/v1/users/${userId}/lock`,
    { isAccountLocked }, // body rỗng vì chỉ cập nhật trạng thái
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export {
  LoginAuth,
  UserAuth,
  get_profile_user,
  update_profileUser,
  update_profileAdmin,
  ChanglePasswordAPI,
  Forgotpassword,
  ResetPassword,
  RegisterUser,
  SendverifyOTP,
  verifyOTP,
  RefreshTokenUser,
  DeleteUserAPI,
  AdminChangleProfileAPI,
  getRandomAdminAPI,
  checkRestToken,
  RegisterUserAPI_Alternative,
  isAccountUserLockerAPI,
  AdminChangleNewpassword,
};
