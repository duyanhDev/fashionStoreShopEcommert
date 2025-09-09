import axios from "./../untils/axios";

const addToWishlistAPI = async (userId, productId) => {
  return await axios.post("/api/v1/add-wishlist", { userId, productId });
};

const getWishlistAPI = async (userId) => {
  // Validate userId trước khi gọi API
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (userId === "undefined" || userId === "null") {
    console.error('❌ getWishlistAPI: userId is string "undefined"');
    throw new Error("Invalid user ID");
  }

  try {
    const response = await axios.get(`/api/v1/get-wishlist/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("❌ Wishlist API error:", error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      console.log("ℹ️ User has no wishlist - returning empty");
      return {
        data: {
          EC: 0,
          EM: "Success - Empty wishlist",
          data: {
            products: [], // 👈 phải có key products
          },
        },
      };
    }

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
