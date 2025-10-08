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

const updateBlogNew = async (id, dataBlog, selectedFiles) => {
  try {
    const formData = new FormData();

    // append các field text
    formData.append("title", dataBlog.title);
    formData.append("tip", dataBlog.tip);
    formData.append("content", dataBlog.content);
    formData.append("regex", dataBlog.regex);
    formData.append("userId", dataBlog.userId);
    formData.append("readTime", dataBlog.readTime);
    formData.append("featured", dataBlog.featured);

    if (selectedFiles && selectedFiles.length > 0) {
      selectedFiles.forEach((img) => formData.append("img", img));
    }

    return await axios.put(`api/v1/update-blog/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error update blog:", error);
    throw error;
  }
};

const deleteBlog = async (id) => {
  return await axios.delete(`api/v1/delete-blog/${id}`);
};
export {
  CreateBlog,
  getAllBlog,
  getDetaillBlog,
  updateViewBlog,
  updateBlogNew,
  deleteBlog,
};
