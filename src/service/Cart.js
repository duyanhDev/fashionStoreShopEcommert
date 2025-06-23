import axios from "./../untils/axios";

const AddCartAPI = async (userId, productId, quantity, size, color, price) => {
  return await axios.post("api/v1/cart", {
    userId,
    productId,
    quantity,
    size,
    color,
    price,
  });
};

const CartListProduct = async (userId) => {
  return await axios.get(`api/v1/cart/${userId}`);
};

const addMultipleToCart = async (userId, items) => {
  return await axios.post("api/v1/cart/add-many", { userId, items });
};

const RemoveCartOnePorduct = async (cartId, itemId, userId) => {
  try {
    const response = await axios.put(`api/v1/cart/${cartId}/${itemId}`, {
      userId,
    });
    return response;
  } catch (error) {
    console.error(
      "Error removing product from cart:",
      error.response?.data || error.message
    );
    throw error; // Re-throw to handle error where the function is called
  }
};

const UpdateCartQuantity = async (cartId, itemId, userId, quantity) => {
  try {
    const response = await axios.put(`api/v1/cart-update/${cartId}/${itemId}`, {
      userId,
      quantity,
    });
    return response;
  } catch (error) {
    console.error(
      "Error removing product from cart:",
      error.response?.data || error.message
    );
    throw error; // Re-throw to handle error where the function is called
  }
};

export {
  AddCartAPI,
  CartListProduct,
  RemoveCartOnePorduct,
  UpdateCartQuantity,
  addMultipleToCart,
};
