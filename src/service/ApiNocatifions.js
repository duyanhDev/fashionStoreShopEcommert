import axios from "./../untils/axios";

const FetcDataNocatifions = async (userId) => {
  return await axios.get(`api/v1/notification/${userId}`);
};
const UpdateDataNocatifions = async (id) => {
  return await axios.post(`api/v1/notification/${id}`);
};

const AllReadNotifications = async (userId) => {
  return await axios.put("api/v1/update-notification", { userId });
};

const DeleteAllNotificationsAPI = async (userId) => {
  return await axios.delete(`api/v1/delete-notifications/${userId}`);
};
export {
  FetcDataNocatifions,
  UpdateDataNocatifions,
  AllReadNotifications,
  DeleteAllNotificationsAPI,
};
