import axios from "../untils/axios";

const addOneSize = async (productId, size, note) => {
  return await axios.post(`api/v1/add-one/size`, { productId, size, note });
};

const getIdGuideSize = async (id) => {
  return await axios.get(`api/v1/size/${id}`);
};

export { addOneSize, getIdGuideSize };
