import axios from "../untils/axios";

const getRevenueAPI = async () => {
  return await axios.get("api/v1/revenue/total");
};

export { getRevenueAPI };
