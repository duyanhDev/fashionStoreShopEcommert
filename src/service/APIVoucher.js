import axios from "./../untils/axios";

const getVoucherAPI = async () => {
  return await axios.get("api/v1/voucher");
};

const createVoucherAPI = async (formdata) => {
  return await axios.post("api/v1/add-voucher", {
    code: formdata.code,
    discountType: formdata.discountType,
    discountValue: formdata.discountValue,
    minOrderValue: formdata.minOrderValue,
    startDate: formdata.startDate,
    endDate: formdata.startDate,
    usageLimit: formdata.usageLimit,
    userGroup: formdata.userGroup,
    content: formdata.description,
  });
};
export { getVoucherAPI, createVoucherAPI };
