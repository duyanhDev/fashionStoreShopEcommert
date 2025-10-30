import axios from "./../untils/axios";
const listColorAPI = async () => {
  return await axios.get("api/v1/color");
};

const createColorAPI = async (value, title, type) => {
  return await axios.post("api/v1/color", { value, title, type });
};

const updateColorAPI = async (id, value, title, type) => {
  return await axios.put(`api/v1/color/${id}`, { value, title, type });
};

const deleteColorAPI = async (id) => {
  return await axios.delete(`api/v1/color/${id}`);
};

export { listColorAPI, createColorAPI, updateColorAPI, deleteColorAPI };
