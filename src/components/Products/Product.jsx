import {
  Table,
  Button,
  Tag,
  Image,
  Flex,
  Typography,
  Tooltip,
  Upload,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Space,
  Progress,
  Badge,
  Divider,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  WarningOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  BarChartOutlined,
  RiseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  DeleteOneProductAPI,
  getListProductsAPI,
} from "../../service/ApiProduct";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Products = () => {
  const [dataProducts, setDataProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const pageSize = 8;
  const hasSelected = selectedRowKeys.length > 0;
  const navigate = useNavigate();

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getRandomColor = () => {
    const colors = ["blue", "purple", "cyan", "green", "pink", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleNavigate = (id) => navigate(`/admin/uploadproducts/${id}`);
  const handleViewNavigate = (id) => navigate(`/admin/viewproduct/${id}`);

  // Statistics calculations
  const totalProducts = dataProducts.length;
  const inStockProducts = dataProducts.filter(
    (p) => p.stock?.props?.children > 0
  ).length;
  const outOfStockProducts = totalProducts - inStockProducts;
  const totalValue = dataProducts.reduce((sum, product) => {
    const priceText = product.price?.props?.children;
    if (priceText) {
      const price = parseInt(priceText.replace(/[^\d]/g, ""));
      return sum + (price || 0);
    }
    return sum;
  }, 0);
  const avgPrice =
    totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;

  // Filter products
  const applyFilters = () => {
    let filtered = [...dataProducts];

    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const info = product.info?.props?.children;
        if (info && info[0]?.props?.children) {
          return info[0].props.children
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }
        return false;
      });
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => {
        const category = product.category?.props?.children;
        return category === categoryFilter;
      });
    }

    if (stockFilter === "instock") {
      filtered = filtered.filter((p) => p.stock?.props?.children > 0);
    } else if (stockFilter === "outofstock") {
      filtered = filtered.filter((p) => p.stock?.props?.children === "Hết");
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, stockFilter, dataProducts]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getListProductsAPI();
      const products = response.data.data.map((product, index) => ({
        key: product._id,
        Index: index + 1,
        info: (
          <div className="space-y-1">
            <Text strong className="text-gray-900 text-sm">
              {truncateText(product.name, 25)}
            </Text>
            <Tooltip title={product.description}>
              <Text className="text-gray-500 text-xs block">
                {truncateText(product.description, 20)}
              </Text>
            </Tooltip>
          </div>
        ),
        category: (
          <Tag
            color={getRandomColor()}
            className="px-3 py-1 text-xs rounded-full font-medium shadow-sm"
          >
            {product.category?.name || "N/A"}
          </Tag>
        ),
        care: (
          <Tag
            color={getRandomColor()}
            className="px-3 py-1 text-xs rounded-full font-medium shadow-sm"
          >
            {product?.care || "N/A"}
          </Tag>
        ),
        costPrice: (
          <Text className="text-gray-700 text-sm font-medium">
            {product.costPrice ? formatPrice(product.costPrice) : "0đ"}
          </Text>
        ),
        price: (
          <Text strong className="text-green-600 text-sm">
            {formatPrice(product.price)}
          </Text>
        ),
        totalCost: (
          <Text className="text-gray-700 text-sm font-medium">
            {formatPrice(product.totalCost)}
          </Text>
        ),
        stock: (
          <Tag
            color={product.stock > 0 ? "success" : "error"}
            className="px-3 py-1 text-xs rounded-full shadow-sm font-medium"
          >
            {product.stock > 0 ? product.stock : "Hết"}
          </Tag>
        ),
        size: (
          <div className="flex flex-wrap gap-1 max-w-[100px] overflow-x-auto">
            {product.variants.slice(0, 3).map((variant, variantIndex) =>
              variant.sizes.slice(0, 3).map((sizeItem, sizeIndex) => (
                <Tag
                  key={`${variantIndex}-${sizeIndex}-${sizeItem.size}`}
                  color={getRandomColor()}
                  className="text-xs px-2 py-1 rounded-full shadow-sm"
                >
                  {sizeItem.size}
                </Tag>
              ))
            )}
          </div>
        ),
        color: (
          <div className="flex flex-wrap gap-1.5">
            {product.variants.slice(0, 3).map((color, index) => {
              const colorStyles = {
                đen: "bg-black border-gray-200",
                vàng: "bg-yellow-400 border-gray-200",
                trắng: "bg-white border-gray-300",
                be: "bg-[#f5f5dc] border-gray-200",
                xanh: "bg-blue-500 border-gray-200",
              };
              return colorStyles[color.color] ? (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full shadow-md border-2 ${
                    colorStyles[color.color]
                  } hover:scale-125 transition-transform duration-200`}
                />
              ) : null;
            })}
          </div>
        ),
        image: (
          <div className="flex flex-wrap gap-1.5 max-w-[100px] overflow-x-auto">
            {product.variants
              .filter((item) => item.images?.length)
              .slice(0, 2)
              .map((value, index) =>
                value.images.slice(0, 2).map((img, imgIndex) => (
                  <Image
                    key={`${index}-${imgIndex}`}
                    src={img.url}
                    alt={`${product.name} image ${index + 1}`}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover shadow-md hover:scale-110 transition-transform duration-300 border border-gray-200"
                    onError={(e) => {
                      e.target.src = "path/to/placeholder/image.jpg";
                    }}
                  />
                ))
              )}
          </div>
        ),
        Action: (
          <Space size="small" className="min-w-[130px]">
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewNavigate(product._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleNavigate(product._id)}
                className="bg-green-500 hover:bg-green-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              />
            </Tooltip>
            <Popconfirm
              title="Xóa sản phẩm"
              description={`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`}
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => handleDeleteOneProuduct(product._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa sản phẩm">
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  className="bg-red-500 hover:bg-red-600 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
        rawProduct: product, // Keep original product data for filtering
      }));
      setDataProducts(products);
    } catch (error) {
      console.error("Error fetching product data:", error);
      message.error("Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "STT",
      dataIndex: "Index",
      key: "Index",
      width: 60,
      align: "center",
      render: (text) => (
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
          {text}
        </div>
      ),
    },
    { title: "Danh Mục", dataIndex: "category", key: "category", width: 110 },
    { title: "Thông Tin", dataIndex: "info", key: "info", width: 200 },
    {
      title: "Loại",
      dataIndex: "care",
      key: "care",
      width: 100,
      responsive: ["md"],
    },
    {
      title: "Giá Vốn",
      dataIndex: "costPrice",
      key: "costPrice",
      width: 100,
      responsive: ["lg"],
    },
    { title: "Giá Bán", dataIndex: "price", key: "price", width: 100 },
    {
      title: "Tổng Chi Phí",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 120,
      responsive: ["xl"],
    },
    { title: "Kho", dataIndex: "stock", key: "stock", width: 80 },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 120,
      responsive: ["lg"],
    },
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      width: 100,
      responsive: ["md"],
    },
    { title: "Hình Ảnh", dataIndex: "image", key: "image", width: 120 },
    {
      title: "Hành Động",
      dataIndex: "Action",
      key: "Action",
      width: 140,
      fixed: "right",
    },
  ];

  const paginatedData = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onChangeAllSelection = () => {
    if (selectedRowKeys.length === filteredProducts.length) {
      setSelectedRowKeys([]);
    } else {
      const allProductKeys = filteredProducts.map((product) => product.key);
      setSelectedRowKeys(allProductKeys);
    }
  };
  const token = localStorage.getItem("token");
  const props = {
    name: "execl",
    accept: ".xlsx,.xls",
    action: "http://localhost:9000/api/v1/products/excel",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} tải lên thành công`);
        fetchData();
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
  };

  const handleDeleteOneProuduct = async (productId) => {
    try {
      const res = await DeleteOneProductAPI(productId);
      if (res && res.data && res.data.EC === 0) {
        message.success("Xóa sản phẩm thành công");
        setDataProducts((prev) =>
          prev.filter((product) => product.key !== productId)
        );
        setSelectedRowKeys((prev) => prev.filter((key) => key !== productId));
      }
    } catch (error) {
      console.log("Xóa sản phẩm thất bại", error);
      message.error("Xóa sản phẩm thất bại");
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    prefix = "",
  }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const ProductCard = ({ product }) => (
    <Card
      className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden group"
      bodyStyle={{ padding: "20px" }}
    >
      <div className="flex flex-col h-full">
        {/* Header with Image */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">{product.image}</div>
          <div className="flex-1 min-w-0">
            {product.info}
            <div className="flex items-center space-x-2 mt-2">
              {product.category}
              {product.care}
            </div>
          </div>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-green-600">
              {product.price?.props?.children}
            </div>
            <div className="text-sm text-gray-500">
              Vốn: {product.costPrice?.props?.children}
            </div>
          </div>
          <div className="text-right">{product.stock}</div>
        </div>

        {/* Colors and Sizes */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <Text className="text-xs text-gray-500">Màu:</Text>
            {product.color}
          </div>
          <div className="flex items-center space-x-2">
            <Text className="text-xs text-gray-500">Size:</Text>
            {product.size}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100">{product.Action}</div>
      </div>
    </Card>
  );

  // Get unique categories for filter
  const categories = [
    ...new Set(
      dataProducts.map((p) => p.category?.props?.children).filter(Boolean)
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản Lý Sản Phẩm
              </h1>
              <p className="text-gray-600">
                Quản lý toàn bộ sản phẩm trong cửa hàng
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Space wrap>
                <Upload {...props}>
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Tải Excel
                  </Button>
                </Upload>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => navigate("/admin/addproduct")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Thêm Sản Phẩm
                </Button>
              </Space>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={ShoppingCartOutlined}
                title="Tổng Sản Phẩm"
                value={totalProducts.toLocaleString()}
                subtitle="+12% so với tháng trước"
                color="bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={TrophyOutlined}
                title="Còn Hàng"
                value={inStockProducts.toLocaleString()}
                subtitle={`${
                  totalProducts > 0
                    ? Math.round((inStockProducts / totalProducts) * 100)
                    : 0
                }% tổng số`}
                color="bg-gradient-to-r from-green-500 to-green-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={WarningOutlined}
                title="Hết Hàng"
                value={outOfStockProducts.toLocaleString()}
                subtitle="Cần nhập thêm"
                color="bg-gradient-to-r from-red-500 to-red-600"
              />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatCard
                icon={DollarOutlined}
                title="Giá Trung Bình"
                value={avgPrice.toLocaleString()}
                prefix=""
                subtitle="VND"
                color="bg-gradient-to-r from-purple-500 to-purple-600"
              />
            </Col>
          </Row>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  size="large"
                  style={{ width: 150 }}
                  placeholder="Danh mục"
                >
                  <Option value="all">Tất cả</Option>
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>

                <Select
                  value={stockFilter}
                  onChange={setStockFilter}
                  size="large"
                  style={{ width: 120 }}
                  placeholder="Kho"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="instock">Còn hàng</Option>
                  <Option value="outofstock">Hết hàng</Option>
                </Select>

                <Button.Group>
                  <Button
                    icon={<UnorderedListOutlined />}
                    size="large"
                    type={viewMode === "table" ? "primary" : "default"}
                    onClick={() => setViewMode("table")}
                  />
                  <Button
                    icon={<AppstoreOutlined />}
                    size="large"
                    type={viewMode === "grid" ? "primary" : "default"}
                    onClick={() => setViewMode("grid")}
                  />
                </Button.Group>
              </div>
            </div>

            {/* Selection Actions Row */}
            {hasSelected && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Text className="text-blue-700">
                  Đã chọn <strong>{selectedRowKeys.length}</strong> sản phẩm
                </Text>
                <Button
                  type="primary"
                  danger
                  onClick={onChangeAllSelection}
                  className="shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {selectedRowKeys.length === filteredProducts.length
                    ? "Hủy chọn tất cả"
                    : "Chọn tất cả"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {viewMode === "table" ? (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: onSelectChange,
              }}
              dataSource={paginatedData}
              columns={columns}
              scroll={{ x: 1400 }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredProducts.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong ${total} sản phẩm`,
                className: "mt-6",
              }}
              loading={loading}
              className="products-table"
              rowClassName="hover:bg-blue-50 transition-colors duration-200"
            />
          </Card>
        ) : (
          <div>
            <Row gutter={[16, 16]}>
              {paginatedData.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.key}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {/* Grid Pagination */}
            {filteredProducts.length > pageSize && (
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
                      {Math.ceil(filteredProducts.length / pageSize)}
                    </span>
                    <Button
                      disabled={
                        currentPage >=
                        Math.ceil(filteredProducts.length / pageSize)
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
        {filteredProducts.length === 0 && !loading && (
          <Card className="text-center py-16 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-gray-400 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCartOutlined
                  style={{ fontSize: "3rem" }}
                  className="text-white"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
                ? "Không tìm thấy sản phẩm"
                : "Chưa có sản phẩm nào"}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || categoryFilter !== "all" || stockFilter !== "all"
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bắt đầu bằng cách thêm sản phẩm đầu tiên"}
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/addproduct")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 px-8 py-3 h-auto text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Thêm Sản Phẩm
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Products;
