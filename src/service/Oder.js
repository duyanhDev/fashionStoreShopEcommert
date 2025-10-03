import axios from "./../untils/axios";

const listOderUserIdAPI = async (userId) => {
  return await axios.get(`api/v1/order/${userId}`);
};

// tạo hóa đơn
const createOrder = async (
  userId,
  username,
  phone,
  items, // Ensure items passed has productId, quantity, and price
  fullAddress,
  city,
  district,
  ward,
  paymentMethod,
  email,
  CartId,
  productId,
  discountValue,
  idDiscount,
  order_code,
  idItems,
  discountType
) => {
  try {
    const formattedItems = items.map((item) => ({
      productId: item.productId, // productId must be provided
      name: item.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color, // quantity must be provided
      price: item.price,
      image: item.imageUrl, // price must be provided
    }));

    const response = await axios.post("api/v1/order", {
      userId,
      username,
      phone,
      items: formattedItems, // Ensure items are formatted correctly
      shippingAddress: {
        fullAddress,
        city,
        district,
        ward,
      },
      paymentMethod,
      email,
      CartId,
      productId,
      discountValue,
      idDiscount,
      order_code,
      idItems,
      discountType,
    });

    return response;
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const UpDateConfirmedAPI = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    `api/v1/check-orderConfirmed`,
    { id: id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

//  Đơn hàng đang trên đường giao đến bạn
const UpDateOrderProductAPI = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    `api/v1/order/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// // Đơn hàng đã được giao cho GHN Express

const updateShipping = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "api/v1/check-orderShipping",
      { id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // Trả về dữ liệu từ API nếu thành công
  } catch (error) {
    console.error(
      "Error updating shipping status:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message: error.response?.data?.message || "Failed to update shipping",
    };
  }
};

// hoàn thành
const UpDateCompleted = async (id, totalPrice) => {
  const token = localStorage.getItem("token");
  return await axios.post(
    "api/v1/check-orderCompleted",
    {
      id: id,
      totalPrice: totalPrice,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const ListAllSumProduct = async () => {
  return await axios.get("api/v1/get-quantity-all");
};

// sum price oder one proudct
const ListOderProductsAll = async () => {
  return await axios.get("api/v1/get-order-all");
};

const OrderStatusOneProduct = async (id) => {
  return await axios.get(`api/v1/get-order-one/${id}`);
};

const updateShippingCancelled = async (id, orderStatus) => {
  try {
    return await axios.put(`api/v1/update-order/${id}`, {
      orderStatus,
    });
  } catch (error) {
    console.log(
      "Error updating shipping status:",
      error.response?.data || error.message
    );
  }
};

const createRepurchaseOrder = async (id, orderStatus) => {
  try {
    return await axios.put(`api/v1/update-order-repurchase/${id}`, {
      orderStatus,
    });
  } catch (error) {
    console.log(
      "Error updating shipping status:",
      error.response?.data || error.message
    );
  }
};

const updateShippingCancelledAdmin = async (id, orderStatus) => {
  const token = localStorage.getItem("token");
  try {
    return await axios.put(
      `api/v1/update-order-admin/${id}`,
      {
        orderStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log(
      "Error updating shipping status:",
      error.response?.data || error.message
    );
  }
};

// lọc sản phẩm theo trạng thái

const filterOrdersByStatus = async (status) => {
  try {
    return await axios.post(`api/v1/filter-order/${status}`);
  } catch (error) {
    console.log(error);
  }
};

const getListDallyOrderAPI = async () => {
  return await axios.get(`api/v1/daily`);
};
export {
  listOderUserIdAPI,
  createOrder,
  ListOderProductsAll,
  ListAllSumProduct,
  OrderStatusOneProduct,
  UpDateOrderProductAPI,
  UpDateConfirmedAPI,
  updateShipping,
  UpDateCompleted,
  updateShippingCancelled,
  updateShippingCancelledAdmin,
  filterOrdersByStatus,
  createRepurchaseOrder,
  getListDallyOrderAPI,
};
