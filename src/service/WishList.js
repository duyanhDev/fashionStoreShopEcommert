import axios from "./../untils/axios";

const addToWishlistAPI = async (userId, productId) => {
  return await axios.post("/api/v1/add-wishlist", { userId, productId });
};

const getWishlistAPI = async (userId) => {
  return await axios.get(`/api/v1/get-wishlist/${userId}`);
};

const RemoveToWishListAPI = async (userId, productId) => {
  return await axios.post("/api/v1/remove-wishlist", { userId, productId });
};
export { addToWishlistAPI, getWishlistAPI, RemoveToWishListAPI };
