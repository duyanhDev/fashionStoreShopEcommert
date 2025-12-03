import axios from "./../untils/axios";

const getListBannerAPI = async () => {
  return await axios.get("api/v1/banner");
};

const getFindByIdBannerAPI = async (id) => {
  return await axios.get(`api/v1/banner-id`, { params: { id: id } });
};

const CreateBannerAPI = async (title, imageUrl, link, position) => {
  const formdata = new FormData();
  if (title) {
    formdata.append("title", title);
  }
  if (imageUrl) {
    formdata.append("imageUrl", imageUrl);
  }
  if (link) {
    formdata.append("link", link);
  }

  if (position) {
    formdata.append("position", position);
  }
  try {
    const result = await axios.post("api/v1/create-banner", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return result;
  } catch (error) {
    console.error("Error create banner:", error);
    throw error; // Optionally throw error or handle it with a custom message
  }
};

const UpdateBannerAPI = async (
  id,
  title,
  imageUrl,
  link,
  position,
  isActive
) => {
  const formdata = new FormData();
  if (title) {
    formdata.append("title", title);
  }
  if (imageUrl) {
    formdata.append("imageUrl", imageUrl);
  }
  if (link) {
    formdata.append("link", link);
  }

  if (position) {
    formdata.append("position", position);
  }
  if (isActive) {
    formdata.append("position", isActive);
  }
  try {
    const result = await axios.put(`/api/v1/update-banner/${id}`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return result;
  } catch (error) {
    console.error("Error Update banner:", error);
    throw error; // Optionally throw error or handle it with a custom message
  }
};

const DeleteBannerAPI = async (id) => {
  return axios.delete(`api/v1/delete-banner/${id}`);
};

const CheckIsActiveBannerAPI = async (id, isActive) => {
  return axios.put(`api/v1/update-banner-isActive/${id}`, {
    isActive,
  });
};

export {
  getListBannerAPI,
  getFindByIdBannerAPI,
  CreateBannerAPI,
  UpdateBannerAPI,
  DeleteBannerAPI,
  CheckIsActiveBannerAPI,
};
