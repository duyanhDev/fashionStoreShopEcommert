import axios from "./../untils/axios";

const createChangeLogAPI = async (newChangelog) => {
  return await axios.post(`api/v1/create/changelog`, { newChangelog });
};

const getChangeModelAPI = async () => {
  return await axios.get(`api/v1/changelog`);
};
export { createChangeLogAPI, getChangeModelAPI };
