import { Table, Button, Tag, Image, Flex, Typography, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getListProductsAPI } from "../../service/ApiProduct";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const Products = () => {
  const [dataProducts, setDataProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const pageSize = 4;
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

  useEffect(() => {
    const fetchData = async () => {
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
              className="px-2 py-0.5 text-xs rounded-full font-medium shadow-sm"
            >
              {product.category?.name || "N/A"}
            </Tag>
          ),
          care: (
            <Tag
              color={getRandomColor()}
              className="px-2 py-0.5 text-xs rounded-full font-medium shadow-sm"
            >
              {product?.care || "N/A"}
            </Tag>
          ),
          costPrice: (
            <Text className="text-gray-700 text-sm">
              {product.costPrice ? formatPrice(product.costPrice) : "0đ"}
            </Text>
          ),
          price: (
            <Text strong className="text-teal-600 text-sm">
              {formatPrice(product.price)}
            </Text>
          ),
          totalCost: (
            <Text className="text-gray-700 text-sm">
              {formatPrice(product.totalCost)}
            </Text>
          ),
          stock: (
            <Tag
              color={product.stock > 0 ? "green" : "red"}
              className="px-2 py-0.5 text-xs rounded-full shadow-sm"
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
                    className="text-xs px-1.5 py-0.5 rounded-full shadow-sm"
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
                    className={`w-4 h-4 rounded-full shadow-md border ${
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
                      width={35}
                      height={35}
                      className="rounded-md object-cover shadow-md hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "path/to/placeholder/image.jpg";
                      }}
                    />
                  ))
                )}
            </div>
          ),
          Action: (
            <Flex gap="small" justify="center" className="min-w-[110px]">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewNavigate(product._id)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
              />
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleNavigate(product._id)}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
              />
              <Button
                size="small"
                icon={<DeleteOutlined />}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 border-none rounded-full shadow-md transition-all duration-300 px-3 py-1"
              />
            </Flex>
          ),
        }));
        setDataProducts(products);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "Index", key: "Index", width: 50 },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 90 },
    { title: "Thông tin", dataIndex: "info", key: "info", width: 180 },
    { title: "Loại", dataIndex: "care", key: "care", width: 90 },
    { title: "Giá vốn", dataIndex: "costPrice", key: "costPrice", width: 90 },
    { title: "Giá bán", dataIndex: "price", key: "price", width: 90 },
    { title: "Tổng", dataIndex: "totalCost", key: "totalCost", width: 90 },
    { title: "Kho", dataIndex: "stock", key: "stock", width: 70 },
    { title: "Size", dataIndex: "size", key: "size", width: 100 },
    { title: "Màu", dataIndex: "color", key: "color", width: 80 },
    { title: "Hình", dataIndex: "image", key: "image", width: 100 },
    {
      title: "Hành động",
      dataIndex: "Action",
      key: "Action",
      width: 120,
      fixed: "right",
    },
  ];

  const paginatedData = dataProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onChangeAllSelection = () => {
    if (selectedRowKeys.length === dataProducts.length) {
      setSelectedRowKeys([]);
    } else {
      const allProductKeys = dataProducts.map((product) => product.key);
      setSelectedRowKeys(allProductKeys);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        {/* Header */}
        <Flex justify="space-between" align="center" className="mb-6">
          <Text className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
            Danh sách sản phẩm
          </Text>
          <Flex gap="middle" wrap="wrap">
            <Button
              type="primary"
              onClick={() => navigate("/admin/addproduct")}
              className="h-10 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              + Thêm mới
            </Button>
            <Button
              type="primary"
              onClick={onChangeAllSelection}
              className="h-10 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {selectedRowKeys.length === dataProducts.length
                ? "Hủy chọn"
                : "Xóa tất cả"}
            </Button>
          </Flex>
        </Flex>

        {/* Selection Info */}
        {hasSelected && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-md border border-indigo-100">
            <Text className="text-sm text-indigo-700">
              Đã chọn{" "}
              <span className="font-semibold text-indigo-900">
                {selectedRowKeys.length}
              </span>{" "}
              sản phẩm
            </Text>
          </div>
        )}

        {/* Table */}
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
          dataSource={paginatedData}
          columns={columns}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: dataProducts.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            pageRangeDisplayed: 5,
            className: "mt-6 flex justify-center gap-1.5 items-center",
            itemRender: (page, type, originalElement) => {
              if (type === "prev") {
                return (
                  <Button
                    className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-md transition-all duration-200"
                    disabled={currentPage === 1}
                  >
                    {currentPage === 1 ? (
                      <span className="text-gray-400">&lt;</span>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    )}
                  </Button>
                );
              }
              if (type === "next") {
                return (
                  <Button
                    className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-md transition-all duration-200"
                    disabled={
                      currentPage === Math.ceil(dataProducts.length / pageSize)
                    }
                  >
                    {currentPage ===
                    Math.ceil(dataProducts.length / pageSize) ? (
                      <span className="text-gray-400">&gt;</span>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </Button>
                );
              }
              if (type === "page") {
                return (
                  <Button
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 ${
                      page === currentPage
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                );
              }
              if (type === "jump-prev" || type === "jump-next") {
                return (
                  <div className="w-8 h-8 flex items-center justify-center text-gray-600">
                    ...
                  </div>
                );
              }
              return originalElement;
            },
          }}
          className="rounded-xl overflow-hidden shadow-lg"
          rowClassName="hover:bg-indigo-50 border-b border-gray-100 transition-colors duration-300"
          bordered={false}
        />
      </div>
    </div>
  );
};

export default Products;
