import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Tag,
  Edit3,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { createChangeLogAPI, getChangeModelAPI } from "../../service/Changelog";

const ChangelogManager = () => {
  const [changelogs, setChangelogs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const fetchDataChangeLogs = async () => {
    try {
      const res = await getChangeModelAPI();

      if (res && res.data && res.data.success === true) {
        const formattedData = res.data.data.map((changelog) => ({
          ...changelog,
          changes: {
            new: Array.isArray(changelog.changes.new)
              ? changelog.changes.new
              : [],
            improved: Array.isArray(changelog.changes.improved)
              ? changelog.changes.improved
              : [],
            fixed: Array.isArray(changelog.changes.fixed)
              ? changelog.changes.fixed
              : [],
          },
        }));
        setChangelogs(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataChangeLogs();
  }, []);

  console.log(changelogs);

  const [formData, setFormData] = useState({
    version: "",
    title: "",
    summary: "",
    changes: {
      new: [""],
      improved: [""],
      fixed: [""],
    },
    tags: [],
  });

  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeItemUpdate = (category, index, value) => {
    setFormData((prev) => ({
      ...prev,
      changes: {
        ...prev.changes,
        [category]: prev.changes[category].map((item, i) =>
          i === index ? value : item
        ),
      },
    }));
  };

  const addChangeItem = (category) => {
    setFormData((prev) => ({
      ...prev,
      changes: {
        ...prev.changes,
        [category]: [...prev.changes[category], ""],
      },
    }));
  };

  const removeChangeItem = (category, index) => {
    setFormData((prev) => ({
      ...prev,
      changes: {
        ...prev.changes,
        [category]: prev.changes[category].filter((_, i) => i !== index),
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const resetForm = () => {
    setFormData({
      version: "",
      title: "",
      summary: "",
      changes: {
        new: [""],
        improved: [""],
        fixed: [""],
      },
      tags: [],
    });
    setNewTag("");
  };

  const handleSubmit = async () => {
    // Filter out empty strings from changes
    const cleanedChanges = {
      new: formData.changes.new.filter((item) => item.trim() !== ""),
      improved: formData.changes.improved.filter((item) => item.trim() !== ""),
      fixed: formData.changes.fixed.filter((item) => item.trim() !== ""),
    };

    const newChangelog = {
      _id: Date.now().toString(),
      ...formData,
      changes: cleanedChanges,
      createdAt: new Date().toISOString(),
    };

    if (editingChangelog) {
      setChangelogs((prev) =>
        prev.map((changelog) =>
          changelog._id === editingChangelog._id
            ? { ...newChangelog, _id: editingChangelog._id }
            : changelog
        )
      );
      setEditingChangelog(null);
    } else {
      const res = await createChangeLogAPI(formData);

      console.log(res);

      if (res.data.success === true) {
        resetForm();
        setShowAddForm(false);
      }
    }
  };

  const handleEdit = (changelog) => {
    setFormData({
      version: changelog.version,
      title: changelog.title,
      summary: changelog.summary,
      changes: {
        new: changelog.changes.new.length ? changelog.changes.new : [""],
        improved: changelog.changes.improved.length
          ? changelog.changes.improved
          : [""],
        fixed: changelog.changes.fixed.length ? changelog.changes.fixed : [""],
      },
      tags: changelog.tags,
    });
    setEditingChangelog(changelog);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa changelog này?")) {
      setChangelogs((prev) => prev.filter((changelog) => changelog._id !== id));
    }
  };

  const filteredChangelogs = changelogs.filter((changelog) => {
    const matchesSearch =
      changelog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      changelog.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      changelog.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || changelog.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = [
    ...new Set(changelogs.flatMap((changelog) => changelog.tags)),
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      new: "bg-green-100 text-green-800",
      improved: "bg-blue-100 text-blue-800",
      fixed: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      new: "Tính năng mới",
      improved: "Cải thiện",
      fixed: "Sửa lỗi",
    };
    return labels[category] || category;
  };

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {editingChangelog
                  ? "Chỉnh sửa Changelog"
                  : "Thêm Changelog Mới"}
              </h1>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingChangelog(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên bản *
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      handleInputChange("version", e.target.value)
                    }
                    placeholder="v2.1.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Cập nhật tính năng mới"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="Mô tả ngắn gọn về những thay đổi trong phiên bản này"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Changes sections */}
              {Object.entries(formData.changes).map(([category, items]) => {
                console.log(category, items);

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {getCategoryLabel(category)}
                      </label>
                      <button
                        type="button"
                        onClick={() => addChangeItem(category)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Thêm mục
                      </button>
                    </div>

                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleChangeItemUpdate(
                              category,
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Nhập ${getCategoryLabel(
                            category
                          ).toLowerCase()}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChangeItem(category, index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Nhập tag mới"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingChangelog ? "Cập nhật" : "Tạo Changelog"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingChangelog(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Changelog
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý và theo dõi các phiên bản cập nhật
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Thêm Changelog
          </button>
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
                  placeholder="Tìm kiếm changelog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Changelog List */}
        <div className="space-y-6">
          {filteredChangelogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedTag
                  ? "Không tìm thấy changelog"
                  : "Chưa có changelog nào"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedTag
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                  : "Bắt đầu bằng cách tạo changelog đầu tiên"}
              </p>
            </div>
          ) : (
            filteredChangelogs.map((changelog) => (
              <div
                key={changelog._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {changelog.version}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {changelog.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">{changelog.summary}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(changelog.createdAt)}
                        </span>
                        {changelog.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag size={16} />
                            <div className="flex gap-1">
                              {changelog.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(changelog)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(changelog._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(changelog.changes).map(
                      ([category, items]) => {
                        console.log(items);

                        return (
                          items?.length > 0 && (
                            <div key={category}>
                              <h4
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getCategoryColor(
                                  category
                                )}`}
                              >
                                {getCategoryLabel(category)}
                              </h4>
                              <ul className="space-y-1">
                                {items.map((item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-gray-700 pl-4 relative"
                                  >
                                    <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangelogManager;
