import axios from "../untils/axios";

const getVoucherAPI = async () => {
  return await axios.get("api/v1/voucher");
};

const createVoucherAPI = async (formdata) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    "api/v1/add-voucher",
    {
      code: formdata.code,
      discountType: formdata.discountType,
      discountValue: formdata.discountValue,
      minOrderValue: formdata.minOrderValue,
      startDate: formdata.startDate,
      endDate: formdata.endDate,
      usageLimit: formdata.usageLimit,
      userGroup: formdata.userGroup,
      content: formdata.description,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const updateVoucherAPI = async (id, formdata) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    `api/v1/update-voucher/${id}`,
    { formdata },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const getListVoucherByUserId = async (userId) => {
  return await axios.get(`api/v1/voucher-user/:${userId}`);
};
export {
  getVoucherAPI,
  createVoucherAPI,
  updateVoucherAPI,
  getListVoucherByUserId,
};
