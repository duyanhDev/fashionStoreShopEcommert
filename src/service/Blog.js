import axios from "./../untils/axios";

const CreateBlog = async (formData) => {
  return await axios.post("api/v1/create-blog", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getAllBlog = async () => {
  return await axios.get("api/v1/all-blog");
};

const getDetaillBlog = async (slug) => {
  return await axios.get(`api/v1/blog/${slug}`);
};

const updateViewBlog = async (slug) => {
  return await axios.put(`api/v1/post-view/${slug}`);
};
export { CreateBlog, getAllBlog, getDetaillBlog, updateViewBlog };
