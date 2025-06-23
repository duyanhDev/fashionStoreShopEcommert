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
export { CreateBlog, getAllBlog };
