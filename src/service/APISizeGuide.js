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
    // ❌ Sai: bạn đang truyền { productId, size } trực tiếp, axios sẽ hiểu đây là config object
    // và sẽ bỏ qua nếu không đúng key hợp lệ
    data: { productId, size }, // ✅ phải đặt trong key data
    headers: {
      Authorization: `Bearer ${token}`, // ❌ bạn viết dở "aut"
    },
  });
};

export { addOneSize, getIdGuideSize, updateGuideSeize, deleteGuideSize };
