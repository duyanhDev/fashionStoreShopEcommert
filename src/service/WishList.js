import axios from "./../untils/axios";

const addToWishlistAPI = async (userId, productId) => {
  return await axios.post("/api/v1/add-wishlist", { userId, productId });
};

const getWishlistAPI = async (userId) => {
  if (!userId || userId === "undefined" || userId === "null") {
    throw new Error("Invalid user ID");
  }

  try {
    const response = await axios.get(`/api/v1/get-wishlist/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    // Nếu server trả về null hoặc undefined wishlist, mặc định trả về rỗng
    if (!response.data?.data?.products) {
      return {
        data: {
          EC: 0,
          EM: "Success - Empty wishlist",
          data: {
            products: [],
          },
        },
      };
    }

    return response;
  } catch (error) {
    console.error("❌ Wishlist API error:", error);

    if (error.response?.status === 500) {
      console.error("Server error - possibly invalid userId format");
    }

    throw error;
  }
};

const RemoveToWishListAPI = async (userId, productId) => {
  return await axios.post("/api/v1/remove-wishlist", { userId, productId });
};
export { addToWishlistAPI, getWishlistAPI, RemoveToWishListAPI };
