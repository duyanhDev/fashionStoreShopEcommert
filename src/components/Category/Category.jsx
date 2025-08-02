import {
  Button,
  Space,
  Table,
  Flex,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { ListCategoryAPI } from "../../service/ApiCategory";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RiseOutlined,
  TagsOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import AddCategory from "./AddCategory/AddCategory";
import View from "./ViewCategory/View";
import Update from "./UpdateCategory/Update";
import Delete from "./DeleteCategory/Delete";

const { Search } = Input;

const Category = () => {
  const [dataCategory, setDataCategory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [isModel, setIsModel] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isModelDel, setIsModelDel] = useState(false);
  const [isCategory, setIdCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  const FetchApiCategory = async () => {
    setLoading(true);
    try {
      const response = await ListCategoryAPI();
      if (response && response.data.EC === 0) {
        setDataCategory(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchApiCategory();
  }, []);

  const handleSearch = (value) => {
    const filtered = dataCategory.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Statistics calculations
  const totalCategories = dataCategory.length;
  const activeCategories = dataCategory.filter(
    (cat) => cat.status !== "inactive"
  ).length;
  const recentCategories = dataCategory.filter((cat) => {
    const createdDate = new Date(cat.createdAt || Date.now());
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  const columns = [
    {
      title: "Tên Danh Mục",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <TagsOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors text-base">
              {text}
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
              ID: {record._id.slice(-6)}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div className="max-w-xs">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {text}
          </p>
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Trạng Thái",
      key: "status",
      render: (_, record) => (
        <Tag color="success" className="px-3 py-1 rounded-full font-medium">
          Hoạt Động
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "Ngày Tạo",
      key: "createdAt",
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.createdAt
            ? new Date(record.createdAt).toLocaleDateString("vi-vn")
            : new Date(record.updatedAt).toLocaleDateString("vi-vn")}
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "Hành Động",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-sm"
            onClick={() => handleShowModel(record._id)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 shadow-sm"
            onClick={() => handleShowUpdate(record._id)}
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm"
            onClick={() => handleDelete(record._id, record.name)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const CategoryCard = ({ category }) => (
    <Card
      className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden group"
      bodyStyle={{ padding: "24px" }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TagsOutlined className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <Tag
                color="success"
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                Hoạt Động
              </Tag>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {category.description}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Tạo:{" "}
              {category.createdAt
                ? new Date(category.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleShowModel(category._id)}
            >
              Xem
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleShowUpdate(category._id)}
            >
              Sửa
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleDelete(category._id, category.name)}
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleShowModel = (id) => {
    setIdCategory(id);
    setIsModel(true);
  };

  const handleShowUpdate = (id) => {
    setIdCategory(id);
    setHidden(true);
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setName("");
    setDescription("");
  };

  const handleDelete = (id, name) => {
    setIdCategory(id);
    setName(name);
    setIsModelDel(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản Lý Danh Mục
              </h1>
              <p className="text-gray-600">
                Quản lý danh mục sản phẩm một cách hiệu quả
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={showModal}
              >
                Thêm Danh Mục
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={12} sm={12} lg={6}>
              <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100">
                <Statistic
                  title="Tổng Danh Mục"
                  value={totalCategories}
                  prefix={<TagsOutlined className="text-blue-600" />}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100">
                <Statistic
                  title="Đang Hoạt Động"
                  value={activeCategories}
                  prefix={<RiseOutlined className="text-green-600" />}
                  valueStyle={{
                    color: "#52c41a",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100">
                <Statistic
                  title="Gần Đây (30 ngày)"
                  value={recentCategories}
                  prefix={<FileTextOutlined className="text-orange-600" />}
                  valueStyle={{
                    color: "#fa8c16",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <Card className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100">
                <Statistic
                  title="Tỷ Lệ Tăng Trưởng"
                  value={
                    totalCategories > 0
                      ? Math.round((recentCategories / totalCategories) * 100)
                      : 0
                  }
                  suffix="%"
                  prefix={<BarChartOutlined className="text-purple-600" />}
                  valueStyle={{
                    color: "#722ed1",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Controls Section */}
        <Card className="mb-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Tìm kiếm danh mục..."
                allowClear
                size="large"
                prefix={<SearchOutlined />}
                onSearch={handleSearch}
                className="w-full search-input"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<FilterOutlined />}
                size="large"
                className="hidden sm:flex border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                Lọc
              </Button>
              <Button.Group>
                <Button
                  icon={<UnorderedListOutlined />}
                  size="large"
                  type={viewMode === "table" ? "primary" : "default"}
                  onClick={() => setViewMode("table")}
                  className={
                    viewMode === "table"
                      ? "bg-blue-500 border-blue-500"
                      : "hover:border-blue-400 hover:bg-blue-50"
                  }
                />
                <Button
                  icon={<AppstoreOutlined />}
                  size="large"
                  type={viewMode === "grid" ? "primary" : "default"}
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "bg-blue-500 border-blue-500"
                      : "hover:border-blue-400 hover:bg-blue-50"
                  }
                />
              </Button.Group>
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {viewMode === "table" ? (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong ${total} danh mục`,
                className: "mt-4",
              }}
              scroll={{ x: 800 }}
              className="category-table"
            />
          </Card>
        ) : (
          <div>
            <Row gutter={[16, 16]}>
              {paginatedData.map((category) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={category._id}>
                  <CategoryCard category={category} />
                </Col>
              ))}
            </Row>

            {/* Grid Pagination */}
            {filteredData.length > pageSize && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-center space-x-6">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-6 py-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-sm"
                    >
                      Trước
                    </Button>
                    <span className="text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                      Trang {currentPage} /{" "}
                      {Math.ceil(filteredData.length / pageSize)}
                    </span>
                    <Button
                      disabled={
                        currentPage >= Math.ceil(filteredData.length / pageSize)
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-6 py-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 shadow-sm"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 && !loading && (
          <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-gray-400 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <TagsOutlined
                  style={{ fontSize: "3rem" }}
                  className="text-white"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Không tìm thấy danh mục
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Bắt đầu bằng cách tạo danh mục đầu tiên của bạn
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={showModal}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 px-8 py-3 h-auto text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Thêm Danh Mục
            </Button>
          </Card>
        )}

        {/* Modals - Giữ nguyên component gốc của bạn */}
        <AddCategory
          open={open}
          handleCancel={handleCancel}
          setOpen={setOpen}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          FetchApiCategory={FetchApiCategory}
        />
        <View
          isModalOpen={isModel}
          setIsModel={setIsModel}
          isCategory={isCategory}
        />
        <Update
          isCategory={isCategory}
          setIsModel={setHidden}
          isModalOpen={hidden}
          FetchApiCategory={FetchApiCategory}
        />
        <Delete
          isCategory={isCategory}
          name={name}
          setIsModel={setIsModelDel}
          isModalOpen={isModelDel}
          FetchApiCategory={FetchApiCategory}
        />
      </div>
    </div>
  );
};

export default Category;
