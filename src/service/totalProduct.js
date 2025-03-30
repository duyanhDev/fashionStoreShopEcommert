import axios from "./../untils/axios";

const fetchTotalProductsSoldAPI = async () => {
  return await axios.get(`api/v1/get-total-products-sold`);
};

export { fetchTotalProductsSoldAPI };
