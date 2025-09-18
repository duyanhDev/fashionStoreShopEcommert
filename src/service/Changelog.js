import axios from "./../untils/axios";

const createChangeLogAPI = async (newChangelog) => {
  return await axios.post(`api/v1/create/changelog`, { newChangelog });
};

const getChangeModelAPI = async () => {
  return await axios.get(`api/v1/changelog`);
};

const updateChangeModelAPI = async (id, changelogData) => {
  return await axios.put(`api/v1/update-changelog/${id}`, { changelogData });
};
const deleteChangelModelAPI = async (id) => {
  return await axios.delete(`api/v1/delete-changelog/${id}`);
};
export {
  createChangeLogAPI,
  getChangeModelAPI,
  updateChangeModelAPI,
  deleteChangelModelAPI,
};
