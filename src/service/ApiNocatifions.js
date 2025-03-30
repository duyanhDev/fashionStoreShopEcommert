import axios from "./../untils/axios";

const FetcDataNocatifions = async (userId) => {
  return axios.get(`api/v1/notification/${userId}`);
};
const UpdateDataNocatifions = async (id) => {
  return axios.post(`api/v1/notification/${id}`);
};
export { FetcDataNocatifions, UpdateDataNocatifions };
