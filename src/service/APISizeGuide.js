import axios from "../untils/axios";

const addOneSize = async (productId, size, note) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    `api/v1/add-one/size`,
    { productId, size, note },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const getIdGuideSize = async (id) => {
  return await axios.get(`api/v1/size/${id}`);
};

const updateGuideSeize = async (productId, size, updatedData) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    "api/v1//update-size",
    {
      productId,
      size,
      updatedData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const deleteGuideSize = async (productId, size) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`api/v1/delete-size`, {
    data: { productId, size }, // ✅ phải đặt trong key data
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export { addOneSize, getIdGuideSize, updateGuideSeize, deleteGuideSize };
