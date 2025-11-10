import axios from "./../untils/axios";

const getListProductsAPI = async () => {
  return await axios.get("api/v1/products");
};

const ListOneProductAPI = async (id) => {
  return await axios.get(`api/v1/products/${id}`);
};

const ListSlugProductAPI = async (slug) => {
  return await axios.get(`api/v1/products-slug/${slug}`);
};

const createProductAPI = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post("api/v1/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// update

const UpdateProductAPI = async (
  id,
  name,
  gender,
  description,
  category,
  brand,
  care,
  price,
  discount,
  stock,
  sold,
  size,
  color,
  images = [],
  costPrice,
  view,
  isAddStock,
  supplierId
) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("gender", gender);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("brand", brand);
  formData.append("care", care);
  formData.append("price", price);
  formData.append("discount", discount);
  formData.append("stock", stock);
  formData.append("sold", sold);
  formData.append("color", color);
  formData.append("size", size);
  images.forEach((file) => {
    formData.append("images", file);
  });
  formData.append("costPrice", costPrice);
  formData.append("view", view);
  formData.append("isAddStock", isAddStock ? true : false);
  formData.append("supplierId", supplierId);
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(`api/v1/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// delete Product
const DeleteOneProductAPI = async (productId) => {
  const token = localStorage.getItem("token");

  return await axios.delete("api/v1/delete-product", {
    params: { productId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const PutFeedbackProductAPI = async (id, userId, rating, review) => {
  return await axios.post("api/v1/feedback", {
    id,
    userId,
    rating,
    review,
  });
};

// phản hồi đánh giá admin

const toggleLikeReplyAPI = async (productId, ratingId, userId, content) => {
  return await axios.post(`api/v1/products/replies`, {
    productId,
    ratingId,
    userId,
    content,
  });
};

// xóa phản hồi

const DeleteRatingProductAPI = async (productId, ratingId) => {
  return await axios.delete("api/v1/delete-rating", {
    params: {
      productId: productId,
      ratingId: ratingId,
    },
  });
};

const toggleLikeRatingAPI = async (productId, ratingId, userId) => {
  return await axios.post("api/v1/like", {
    productId,
    ratingId,
    userId,
  });
};

// tìm kiếm

const searchProductsByNameAPI = async (keyword, page = 1) => {
  return await axios.get(`/api/v1/search/${page}`, {
    params: { keyword },
  });
};

//đánh giá nhiều sản phẩm

const feeckacksProductsAPI = async (ids, userId, rating, review, images) => {
  try {
    const formData = new FormData();

    // Kiểm tra ids hợp lệ
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      throw new Error("Danh sách ID sản phẩm không được trống.");
    }

    // Đảm bảo ids là mảng
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    // Gửi danh sách ID
    formData.append("id", ids);

    // Kiểm tra userId hợp lệ
    if (!userId) {
      throw new Error("User ID không hợp lệ.");
    }
    formData.append("userId", userId);

    // Kiểm tra rating hợp lệ (nếu cần)
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating phải là số từ 1 đến 5.");
    }
    formData.append("rating", rating);

    // Kiểm tra review hợp lệ
    if (review && typeof review !== "string") {
      throw new Error("Review phải là một chuỗi.");
    }
    formData.append("review", review || "");

    // Kiểm tra images có hợp lệ không
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((image, index) => {
        if (image instanceof File || image instanceof Blob) {
          formData.append(`images`, image);
        } else {
          console.warn(`Ảnh thứ ${index + 1} không hợp lệ, bỏ qua.`);
        }
      });
    }

    // Gửi request
    const response = await axios.post("api/v1/feedbacks-products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi gửi phản hồi sản phẩm:", error);
    throw error;
  }
};

const updateViewProductAPI = async (slug) => {
  return await axios.post(`api/v1/product/update-view/${slug}`);
};

const getTopSellingProductsByCategoryAPI = async (category, gender) => {
  return await axios.get(`api/v1/top-selling/${category}/${gender}`);
};

const DeleteVariantImageAPI = async (productId, imageId) => {
  const token = localStorage.getItem("token");
  return await axios.delete(
    `api/v1/products/${productId}/variant/image/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const exportProductsToExcel = async () => {
  const token = localStorage.getItem("token");

  return await axios.get("api/v1/products/export-excel", {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export {
  createProductAPI,
  getListProductsAPI,
  ListOneProductAPI,
  UpdateProductAPI,
  PutFeedbackProductAPI,
  toggleLikeRatingAPI,
  searchProductsByNameAPI,
  feeckacksProductsAPI,
  toggleLikeReplyAPI,
  ListSlugProductAPI,
  updateViewProductAPI,
  DeleteRatingProductAPI,
  DeleteOneProductAPI,
  getTopSellingProductsByCategoryAPI,
  DeleteVariantImageAPI,
  exportProductsToExcel,
};
