import { Table, Button, Tag, Image, Flex } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getListProductsAPI } from "../../service/ApiProduct";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [dataProducts, setDataProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const hasSelected = selectedRowKeys.length > 0;
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // const arr1 = selectedRowKeys.join(",");
  // console.log(arr1);

  const getRandomColor = () => {
    const colors = [
      "magenta",
      "red",
      "volcano",
      "orange",
      "gold",
      "lime",
      "green",
      "cyan",
      "blue",
      "geekblue",
      "purple",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const navigate = useNavigate();
  const handleNavigate = (id) => {
    navigate(`/admin/uploadproducts/${id}`);
  };
  const handleViewNavigate = (id) => {
    navigate(`/admin/viewproduct/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getListProductsAPI();

        const products = response.data.data.map((product, index) => ({
          key: product._id,
          Index: index + 1,
          name: product.name,
          gender: product.gender,
          description: (
            <p className="whitespace-nowrap overflow-hidden text-ellipsis w-36 h-40 ">
              {product.description}
            </p>
          ),
          category: <Tag color={getRandomColor()}>{product.category.name}</Tag>,
          brand: product.brand,
          care: product.care,
          costPrice: product.costPrice ? formatPrice(product.costPrice) : 0,
          price: formatPrice(product.price),
          totalCost: formatPrice(product.totalCost),
          stock:
            product.stock && product.stock > 0 ? product.stock : "Đã hết hàng",
          size: (
            <div className="flex flex-wrap items-center gap-1 w-52">
              {product.variants.slice(0, 10).map((variant, variantIndex) => {
                return variant.sizes.map((sizeItem, sizeIndex) => {
                  return (
                    <Tag
                      key={`${variantIndex}-${sizeIndex}-${sizeItem.size}`}
                      color={getRandomColor()}
                    >
                      {sizeItem.size}
                    </Tag>
                  );
                });
              })}
            </div>
          ),

          color: (
            <div className="flex gap-3 items-center">
              {product.variants.map((color) => {
                if (color.color === "đen") {
                  return (
                    <div
                      key={color}
                      className="w-5 h-5 bg-black rounded-full"
                    ></div>
                  );
                } else if (color.color === "vàng") {
                  return (
                    <div
                      key={color}
                      className="w-5 h-5 bg-yellow-500 rounded-full "
                    ></div>
                  );
                } else if (color.color === "trắng") {
                  return (
                    <div
                      key={color.color}
                      className="w-5 h-5 bg-white border border-black-300 rounded-full "
                    ></div>
                  );
                }

                return null;
              })}
            </div>
          ),
          image: (
            <div className="flex">
              {product.variants
                .filter((item) => item.images !== null)
                .map((value, index) => {
                  return value.images.map((img) => {
                    return (
                      <Image
                        key={index}
                        src={img.url}
                        alt={`${product.name} image ${index + 1}`}
                        width={50}
                        height={50}
                        style={{
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = "path/to/placeholder/image.jpg";
                        }}
                      />
                    );
                  });
                })}
            </div>
          ),

          Action: (
            <div className="flex items-center gap-5">
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleViewNavigate(product._id)}
              />
              <Button
                icon={<EditOutlined />}
                onClick={() => handleNavigate(product._id)}
              />
              <Button icon={<DeleteOutlined />} />
            </div>
          ),
        }));
        setDataProducts(products);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, []);

  console.log(dataProducts);

  const columns = [
    { title: "Index", dataIndex: "Index", key: "Index" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Care", dataIndex: "care", key: "care" },
    { title: "costPrice", dataIndex: "costPrice", key: "costPrice" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "totalCost", dataIndex: "totalCost", key: "totalCost" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Color", dataIndex: "color", key: "color" },
    { title: "Image", dataIndex: "image", key: "image" },
    { title: "Action", dataIndex: "Action", key: "Action" },
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
    <div className="w-full">
      {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      <div className="flex gap-3">
        <Button
          type="primary"
          block
          onClick={() => navigate("/admin/addproduct")}
        >
          Add Product
        </Button>

        <Button type="primary" block onClick={() => onChangeAllSelection()}>
          All Delete Products
        </Button>
      </div>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        dataSource={paginatedData}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: dataProducts.length,
          onChange: (page) => setCurrentPage(page), // Cập nhật trang hiện tại
        }}
      />
    </div>
  );
};

export default Products;
