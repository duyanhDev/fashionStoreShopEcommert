import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  Clock,
  User,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { deleteBlog, getAllBlog, updateBlogNew } from "../../service/Blog";
import { UserAuth } from "../../service/Auth";
import { useNavigate } from "react-router-dom";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    tip: "",
    content: "",
    slug: "",
    regex: "",
    img: [{ url: "" }],
    userId: "",
    readTime: "",
    featured: false,
    isApproved: false,
  });

  // State cho file upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [useUrlInput, setUseUrlInput] = useState(false);

  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      title: "",
      tip: "",
      content: "",
      slug: "",
      regex: "",
      img: [{ url: "" }],
      userId: "",
      readTime: "",
      featured: false,
      isApproved: false,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setUseUrlInput(false);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }));
    } else if (name === "img-url") {
      setFormData((prev) => ({
        ...prev,
        img: [{ url: value }],
      }));
      // Clear file selection when using URL
      setSelectedFiles([]);
      setImagePreviews([]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Xử lý upload multiple files
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validation
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = [];
    const previews = [];

    for (const file of files) {
      // Kiểm tra định dạng
      if (!validTypes.includes(file.type)) {
        alert(
          `File "${file.name}" không đúng định dạng. Chỉ chấp nhận: JPEG, PNG, GIF, WebP`
        );
        continue;
      }

      // Kiểm tra kích thước
      if (file.size > maxSize) {
        alert(`File "${file.name}" quá lớn. Tối đa 5MB`);
        continue;
      }

      validFiles.push(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    }

    setSelectedFiles(validFiles);

    // Clear URL input when using file upload
    setFormData((prev) => ({
      ...prev,
      img: [{ url: "" }],
    }));

    console.log(`Selected ${validFiles.length} valid files`);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeUrlImage = () => {
    setFormData((prev) => ({
      ...prev,
      img: [{ url: "" }],
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.tip.trim()) {
      alert("Vui lòng nhập mẹo/danh mục");
      return;
    }
    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung");
      return;
    }
    if (!formData.userId) {
      alert("Vui lòng chọn tác giả");
      return;
    }

    try {
      if (editingBlog) {
        // Chuẩn bị data để gửi (không bao gồm img nếu có files)
        const dataToUpdate = {
          title: formData.title,
          tip: formData.tip,
          content: formData.content,
          slug: formData.slug,
          regex: formData.regex,
          userId: formData.userId,
          readTime: formData.readTime,
          featured: formData.featured,
          isApproved: formData.isApproved,
        };

        // Chỉ thêm img nếu không có files được chọn (sử dụng URL)
        if (selectedFiles.length === 0 && formData.img[0]?.url) {
          dataToUpdate.img = formData.img;
        }

        console.log("Updating blog with:", {
          data: dataToUpdate,
          files: selectedFiles,
          hasFiles: selectedFiles.length > 0,
        });

        const res = await updateBlogNew(
          editingBlog._id,
          dataToUpdate,
          selectedFiles.length > 0 ? selectedFiles : null
        );

        alert("Cập nhật blog thành công!");

        setShowModal(false);
        setEditingBlog(null);
        resetForm();
        fetchApiBlog();
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        "Có lỗi khi cập nhật blog: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      tip: blog.tip,
      content: blog.content,
      slug: blog.slug,
      regex: blog.regex,
      img: blog.img || [{ url: "" }],
      userId: blog.userId?._id || blog.userId,
      readTime: blog.readTime,
      featured: blog.featured,
      isApproved: blog.isApproved,
    });

    // Reset file states
    setSelectedFiles([]);
    setImagePreviews([]);
    setUseUrlInput(!!blog.img[0]?.url);

    setShowModal(true);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      const res = await deleteBlog(blogId);
      if (res && res.data && res.data.EC === 0) {
        alert("Xóa thành công Blog!");
        fetchApiBlog();
      }
    }
  };

  const getUserName = (userId) => {
    if (typeof userId === "string") {
      const user = users.find((u) => u._id === userId);
      return user ? user.name : "Unknown User";
    }

    if (userId && userId._id) {
      const user = users.find((u) => u._id === userId._id);
      return user ? user.name : userId.name || "Unknown User";
    }

    return "Unknown User";
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "true" && blog.isApproved) ||
      (filterStatus === "false" && !blog.isApproved);

    return matchesSearch && matchesFilter;
  });

  const fetchApiBlog = async () => {
    try {
      const res = await getAllBlog();
      if (res && res.data && res.data.EC === 0) {
        setBlogs(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApiBlog();
  }, []);

  const fetchAPIUser = async () => {
    try {
      let res = await UserAuth();
      if (res && res.data && res.data.EC === 0) {
        const filter = res.data.data.filter((item) => {
          return item.role === "admin";
        });
        setUsers(filter);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAPIUser();
  }, []);

  const handleNavigate = () => {
    navigate("/create/blog");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Blog</h1>
              <p className="text-gray-600 mt-1">
                Thêm, sửa, xóa và quản lý các bài viết
              </p>
            </div>
            <button
              onClick={handleNavigate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Thêm bài viết mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="false">Đã duyệt</option>
              <option value="true">Chờ duyệt</option>
            </select>
          </div>
        </div>

        {/* Blog List */}
        <div className="grid gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="lg:w-48 flex-shrink-0">
                    <img
                      src={
                        blog.img[0]?.url ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={blog.title}
                      className="w-full h-32 lg:h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {blog.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Tag size={16} />
                            {blog.tip}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={16} />
                            {getUserName(blog?.userId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={16} />
                            {blog.view ? blog.view.toLocaleString() : "0"} lượt
                            xem
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {blog.readTime || "5 phút"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {blog.content.substring(0, 200)}...
                    </p>

                    {/* Status badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {blog.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Nổi bật
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          blog.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {!blog.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingBlog ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (tự động tạo)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mẹo/Danh mục *
                  </label>
                  <input
                    type="text"
                    name="tip"
                    value={formData.tip}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh
                  </label>

                  {/* Toggle between upload and URL */}
                  <div className="mb-4">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageMethod"
                          checked={!useUrlInput}
                          onChange={() => setUseUrlInput(false)}
                          className="mr-2"
                        />
                        Upload file
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageMethod"
                          checked={useUrlInput}
                          onChange={() => setUseUrlInput(true)}
                          className="mr-2"
                        />
                        Dùng URL
                      </label>
                    </div>
                  </div>

                  {!useUrlInput ? (
                    // File Upload Section
                    <div className="space-y-4">
                      {/* Selected Files Preview */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                title="Xóa ảnh"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* File Upload */}
                      <div>
                        <label className="block w-full">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                            <Upload
                              className="mx-auto text-gray-400 mb-2"
                              size={48}
                            />
                            <p className="text-gray-600 mb-1">
                              Kéo thả file ảnh vào đây hoặc click để chọn
                            </p>
                            <p className="text-sm text-gray-500">
                              Hỗ trợ: JPEG, PNG, GIF, WebP (tối đa 5MB)
                            </p>
                            <p className="text-sm text-gray-500">
                              Đã chọn: {selectedFiles.length} file(s)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    // URL Input Section
                    <div className="space-y-4">
                      {/* URL Preview */}
                      {formData.img[0]?.url && (
                        <div className="relative mb-4">
                          <img
                            src={formData.img[0].url}
                            alt="URL Preview"
                            className="w-full h-48 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <button
                            type="button"
                            onClick={removeUrlImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            title="Xóa ảnh"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      {/* URL Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL hình ảnh
                        </label>
                        <input
                          type="url"
                          name="img-url"
                          value={formData.img[0]?.url || ""}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tác giả *
                    </label>
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn tác giả</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian đọc
                    </label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleInputChange}
                      placeholder="5 phút"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ khóa regex (phân cách bằng |)
                  </label>
                  <input
                    type="text"
                    name="regex"
                    value={formData.regex}
                    onChange={handleInputChange}
                    placeholder="react|javascript|frontend"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Bài viết nổi bật
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isApproved"
                      checked={formData.isApproved}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Đã duyệt</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBlog(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingBlog ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
