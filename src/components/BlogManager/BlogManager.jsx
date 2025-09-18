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
import { getAllBlog, updateBlogNew } from "../../service/Blog";
import { UserAuth } from "../../service/Auth";
import { useNavigate } from "react-router-dom";

const BlogManager = () => {
  // Mock data
  const mockUsers = [
    { _id: "1", name: "Nguyễn Văn A", email: "nva@email.com" },
    { _id: "2", name: "Trần Thị B", email: "ttb@email.com" },
    { _id: "3", name: "Lê Văn C", email: "lvc@email.com" },
  ];

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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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
    setImageFile(null);
    setImagePreview("");
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
      setImagePreview(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, GIF, WebP)");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      setImageFile(file);

      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData((prev) => ({
          ...prev,
          img: [{ url: e.target.result }], // Trong thực tế, đây sẽ là URL từ server sau khi upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      img: [{ url: "" }],
    }));
  };

  const handleSubmit = async () => {
    // Validation cơ bản
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

    // Trong thực tế, bạn sẽ upload file ảnh lên server trước
    // và nhận về URL để lưu vào database
    let imageUrl = formData.img[0]?.url || "";

    if (imageFile) {
      // Giả lập upload file - trong thực tế sẽ gọi API upload
      console.log("Uploading file:", imageFile);
      // imageUrl = await uploadImageToServer(imageFile);
      imageUrl = imagePreview; // Tạm thời dùng preview URL
    }

    if (editingBlog) {
      // Update blog

      const res = await updateBlogNew(editingBlog._id, formData);
      console.log(res);

      setShowModal(false);
      setEditingBlog(null);
      resetForm();
      fetchApiBlog();
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
      img: blog.img,
      userId: blog.userId,
      readTime: blog.readTime,
      featured: blog.featured,
      isApproved: blog.isApproved,
    });
    setImagePreview(blog.img[0]?.url || "");
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = (blogId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
    }
  };

  const getUserName = (userId) => {
    console.log(userId);

    const user = users.find((u) => u._id === userId._id);
    return user ? user.name : "Unknown User";
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
        setBlogs(res.data.data); // dữ liệu hiển thị mặc định
        // tạo danh mục (nếu cần unique)
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
    } finally {
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
                            {blog.view.toLocaleString()} lượt xem
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {blog.readTime}
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

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
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
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* OR divider */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">HOẶC</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

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
