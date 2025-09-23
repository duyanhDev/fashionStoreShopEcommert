import axios from "../untils/axios";

const getIdGuidePantsSize = async (productId) => {
  return await axios.get(`api/v1/products/${productId}/sizes`);
};

const addOnePantsSize = async (
  productId,
  size,
  note,
  pantsType,
  fitType,
  material,
  measurementGuide
) => {
  const token = localStorage.getItem("token");

  return await axios.post(
    `api/v1/products/${productId}/sizes`,
    {
      size,
      note,
      pantsType,
      fitType,
      material,
      measurementGuide,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const updateOnePantsSize = async (productId, sizeId, size, note) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    `api/v1/products/${productId}/sizes/${sizeId}`,
    {
      size,
      note,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const deleteOnePantsSize = async (productId, sizeId) => {
  const token = localStorage.getItem("token");
  return await axios.delete(`api/v1/products/${productId}/sizes/${sizeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export {
  getIdGuidePantsSize,
  addOnePantsSize,
  updateOnePantsSize,
  deleteOnePantsSize,
};
