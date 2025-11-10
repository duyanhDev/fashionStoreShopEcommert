import {
  Input,
  Typography,
  Button,
  Flex,
  Select,
  Space,
  InputNumber,
  Upload,
  message,
  Card,
  Divider,
  Alert,
  Row,
  Col,
  Tag,
  Table,
  Modal,
  Switch,
  Image,
  Popconfirm,
  Collapse,
} from "antd";
import {
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  DeleteVariantImageAPI,
  ListOneProductAPI,
  UpdateProductAPI,
} from "../../service/ApiProduct";
import { ListCategoryAPI } from "../../service/ApiCategory";
import { useSelector } from "react-redux";
import { FindAllSupplierAPI } from "../../service/Supplier";
import { listColorAPI } from "../../service/APIColor";

const { Panel } = Collapse;

const UpLoad = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [opitonCategory, setOptionCategory] = useState([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sold, setSold] = useState(0);
  const [discount, setDisscount] = useState(0);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [image, setImageFiles] = useState([]);
  const [care, setCare] = useState("");
  const [brand, setBrand] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [view, setView] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useSelector((state) => state.auth);
  const [isAddStock, setIsAddStock] = useState(true);
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState([]);

  // Thêm state mới cho việc quản lý variants
  const [currentVariants, setCurrentVariants] = useState([]);
  const [stockUpdateMode, setStockUpdateMode] = useState("all");
  const [showVariantsTable, setShowVariantsTable] = useState(false);

  // State mới cho việc quản lý xóa ảnh
  const [showImageManager, setShowImageManager] = useState(false);
  const [colors, setColors] = useState([]);

  const Navigate = useNavigate();
  const param = useParams();

  const onChangeImg = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const files = newFileList.map((file) => file.originFileObj);
    setImageFiles(files);
  };

  const onPreview = async (file) => {
    const src = file.url || (await getBase64(file.originFileObj));
    const imgWindow = window.open(src);
    imgWindow.document.write(`<img src="${src}" />`);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // API function để xóa ảnh (bạn cần implement này)
  const DeleteProductImageAPI = async (
    productId,
    deleteImages,
    deleteAllImagesForColor
  ) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add your auth headers here
        },
        body: JSON.stringify({
          deleteImages,
          deleteAllImagesForColor,
        }),
      });
      return response.json();
    } catch (error) {
      console.error("Error deleting images:", error);
      throw error;
    }
  };

  // Xử lý xóa ảnh đơn lẻ
  const handleDeleteSingleImage = async (color, imageId) => {
    try {
      messageApi.loading({ content: "Đang xóa ảnh...", key: "deleteImage" });

      const response = await DeleteVariantImageAPI(param.id, imageId);

      if (response.data.EC === 0) {
        messageApi.success({
          content: "Xóa ảnh thành công!",
          key: "deleteImage",
        });

        // Cập nhật lại currentVariants
        setCurrentVariants((prev) =>
          prev.map((variant) => {
            if (variant.color === color) {
              return {
                ...variant,
                images: variant.images.filter((img) => img.url !== imageUrl),
              };
            }
            return variant;
          })
        );

        // Cập nhật fileList nếu cần
        setFileList((prev) => prev.filter((file) => file.url !== imageUrl));
      } else {
        messageApi.error({
          content: response.message || "Xóa ảnh thất bại!",
          key: "deleteImage",
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      messageApi.error({
        content: "Có lỗi xảy ra khi xóa ảnh!",
        key: "deleteImage",
      });
    }
  };

  // Xử lý xóa tất cả ảnh của một màu
  const handleDeleteAllImagesForColor = async (color) => {
    try {
      messageApi.loading({
        content: `Đang xóa tất cả ảnh màu ${color}...`,
        key: "deleteColorImages",
      });

      const response = await DeleteProductImageAPI(param.id, null, [color]);

      if (response.success) {
        messageApi.success({
          content: `Xóa tất cả ảnh màu ${color} thành công!`,
          key: "deleteColorImages",
        });

        // Cập nhật lại currentVariants
        setCurrentVariants((prev) =>
          prev.map((variant) => {
            if (variant.color === color) {
              return {
                ...variant,
                images: [],
              };
            }
            return variant;
          })
        );

        // Cập nhật fileList
        setFileList((prev) =>
          prev.filter((file) => {
            const variant = currentVariants.find((v) => v.color === color);
            return !variant?.images.some((img) => img.url === file.url);
          })
        );
      } else {
        messageApi.error({
          content: response.message || "Xóa ảnh thất bại!",
          key: "deleteColorImages",
        });
      }
    } catch (error) {
      console.error("Error deleting color images:", error);
      messageApi.error({
        content: "Có lỗi xảy ra khi xóa ảnh!",
        key: "deleteColorImages",
      });
    }
  };

  // Component hiển thị ảnh theo màu
  const ImagesByColorComponent = () => {
    if (!currentVariants || currentVariants.length === 0) {
      return <div>Chưa có ảnh nào</div>;
    }

    return (
      <div>
        <Collapse>
          {currentVariants.map((variant, variantIndex) => (
            <Panel
              header={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <Tag color="blue">{variant.color}</Tag>
                    <span>{variant.images.length} ảnh</span>
                  </span>
                  {variant.images.length > 0 && (
                    <Popconfirm
                      title={`Xóa tất cả ảnh màu ${variant.color}?`}
                      description="Hành động này không thể hoàn tác!"
                      onConfirm={(e) => {
                        e.stopPropagation();
                        handleDeleteAllImagesForColor(variant.color);
                      }}
                      onCancel={(e) => e.stopPropagation()}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Xóa tất cả
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              }
              key={variantIndex}
            >
              {variant.images.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {variant.images.map((img, imgIndex) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={imgIndex}>
                      <div
                        style={{
                          position: "relative",
                          border: "1px solid #d9d9d9",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={img.url}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                          }}
                          preview={{
                            mask: <EyeOutlined />,
                          }}
                        />

                        {/* Overlay với nút xóa */}
                        <div
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            display: "flex",
                            gap: "4px",
                          }}
                        >
                          <Popconfirm
                            title="Xóa ảnh này?"
                            description="Hành động này không thể hoàn tác!"
                            onConfirm={() =>
                              handleDeleteSingleImage(variant.color, img._id)
                            }
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              danger
                              size="small"
                              shape="circle"
                              icon={<DeleteOutlined />}
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderColor: "#ff4d4f",
                              }}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "20px",
                  }}
                >
                  Chưa có ảnh nào cho màu {variant.color}
                </div>
              )}
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  };

  // Các hàm xử lý khác giữ nguyên...
  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleChangeCatogry = (value) => setCategoryId(value);
  const onChangePrice = (value) => setPrice(value);
  const onChangeStock = (value) => {
    setStock(value);
    if ((size.length > 0 || color.length > 0) && value > 0) {
      setStockUpdateMode("specific");
    }
  };
  const onChangeSold = (value) => setSold(value);
  const handleChangeColor = (value) => {
    setColor(value);
    if (value.length > 0 && stock > 0) {
      setStockUpdateMode("specific");
    }
  };
  const handleChangeSize = (value) => {
    setSize(value);
    if (value.length > 0 && stock > 0) {
      setStockUpdateMode("specific");
    }
  };
  const onChangeGender = (value) => setGender(value);
  const onChangeDiscount = (value) => setDisscount(value);

  // Các useEffect giữ nguyên...
  useEffect(() => {
    const FetchCategory = async () => {
      try {
        const res = await ListCategoryAPI();
        if (res && res.data && res.data.EC === 0) {
          const dataCategory = res.data.data.map((category) => ({
            label: category.name,
            value: category._id,
          }));
          setOptionCategory(dataCategory);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchCategory();
  }, []);

  useEffect(() => {
    const FetchAPISupplier = async () => {
      try {
        const res = await FindAllSupplierAPI();
        if (res && res.data && res.data.EC === 0) {
          const data = res.data.data.map((supplier) => ({
            label: supplier.name,
            value: supplier._id,
          }));
          setSupplierName(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    FetchAPISupplier();
  }, []);

  useEffect(() => {
    const CallApiListProduct = async () => {
      try {
        const res = await ListOneProductAPI(param.id);
        if (res && res.data.EC === 0) {
          const product = res.data.data;
          setName(product.name || "");
          setGender(product.gender || "");
          setDescription(product.description || "");
          setBrand(product.brand || "");
          setCare(product.care || "");
          setCategoryId(product.category?._id || null);

          setPrice(product.price || "");
          setDisscount(product.discount || 0);
          setStock(product.stock || "");
          setSold(product.sold || 0);
          setCostPrice(product.costPrice || 0);
          setView(product.view || 0);
          if (product.supplierId) {
            setSupplierId(product.supplierId._id || "");
          }
          setColor(product.variants.map((item) => item.color) || []);
          const sizes = product.variants.map((item) => item.sizes) || [];

          const flatSizes = sizes.flat().map((item) => String(item.size));
          setSize(flatSizes || []);

          // Set current variants để hiển thị
          setCurrentVariants(product.variants || []);

          setFileList(
            product.variants.flatMap((item) =>
              item.images.map((image) => ({
                url: image.url,
                name: image.url || "Image",
              }))
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    CallApiListProduct();
  }, [param.id]);

  const fetchAPIColor = async () => {
    try {
      const res = await listColorAPI();
      if (res && res.data && res.data.EC === 0) {
        setColors(res.data.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAPIColor();
  }, []);

  const optionsSize = [
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
    { label: "XL", value: "XL" },
    { label: "XXL", value: "XXL" },
    { label: "28", value: "28" },
    { label: "29", value: "29" },
    { label: "30", value: "30" },
    { label: "31", value: "31" },
    { label: "32", value: "32" },
    { label: "33", value: "33" },
    { label: "34", value: "34" },
  ];

  const optionsColor = colors?.map((color) => ({
    label: color.title,
    value: color.type,
  }));

  const genderArr = ["male", "female", "unisex"];
  const optionGender = genderArr.map((gender) => ({
    label: gender,
    value: gender,
  }));

  // Tạo dữ liệu cho bảng variants
  const getVariantsTableData = () => {
    return currentVariants.flatMap((variant) =>
      variant.sizes.map((sizeItem, index) => ({
        key: `${variant.color}-${sizeItem.size}`,
        color: variant.color,
        size: sizeItem.size,
        quantity: sizeItem.quantity,
        sold: sizeItem.sold || 0,
        images: variant.images.length,
      }))
    );
  };

  const variantsColumns = [
    {
      title: "Màu",
      dataIndex: "color",
      key: "color",
      render: (color) => <Tag color="blue">{color}</Tag>,
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => <Tag>{size}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => (
        <span
          style={{ fontWeight: "bold", color: quantity > 0 ? "green" : "red" }}
        >
          {quantity}
        </span>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      render: (count) => `${count} ảnh`,
    },
  ];

  const getStockUpdateMessage = () => {
    if (!stock || stock <= 0) return null;

    if (
      stockUpdateMode === "all" ||
      (size.length === 0 && color.length === 0)
    ) {
      return (
        <Alert
          message="Cập nhật tồn kho cho tất cả variants"
          description={`Số lượng ${stock} sẽ được cộng thêm vào tất cả các size và màu hiện có của sản phẩm.`}
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    } else {
      const selectedSizes = size.length > 0 ? size.join(", ") : "tất cả sizes";
      const selectedColors = color.length > 0 ? color.join(", ") : "tất cả màu";

      return (
        <Alert
          message="Cập nhật tồn kho cho variants cụ thể"
          description={`Số lượng ${stock} sẽ được cập nhật cho: Màu (${selectedColors}) và Size (${selectedSizes}).`}
          type="warning"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    }
  };

  const hanldeUpdateProducts = async () => {
    if (user.role !== "admin") {
      messageApi.error("Bạn không có quyền cập nhật sản phẩm này");
      return;
    }
    try {
      // Validation
      if (!name.trim()) {
        messageApi.error("Vui lòng nhập tên sản phẩm");
        return;
      }

      if (!categoryId) {
        messageApi.error("Vui lòng chọn danh mục");
        return;
      }

      const res = await UpdateProductAPI(
        param.id,
        name,
        gender,
        description,
        categoryId,
        brand,
        care,
        price,
        discount,
        stock,
        sold,
        size,
        color,
        image,
        costPrice,
        view,
        isAddStock,
        supplierId
      );

      if (res) {
        const key = "updatable";
        messageApi.open({
          key,
          type: "loading",
          content: "Đang cập nhật...",
        });

        setTimeout(() => {
          messageApi.open({
            key,
            type: "success",
            content: "Cập nhật sản phẩm thành công!",
            duration: 2,
          });
          // Refresh data
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      messageApi.error("Có lỗi xảy ra khi cập nhật sản phẩm");
    }
  };

  const handleChangeSupper = (value) => {
    setSupplierId(value);
  };

  return (
    <div className="w-full p-6">
      {contextHolder}

      <Row gutter={24}>
        {/* Cột trái - Thông tin cơ bản */}
        <Col span={14}>
          <Card title="Thông tin sản phẩm" className="mb-4">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Typography.Title level={5}>Tên sản phẩm *</Typography.Title>
                <Input
                  maxLength={200}
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Typography.Title level={5}>Giới tính</Typography.Title>
                  <Select
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Chọn giới tính"
                    value={gender}
                    onChange={onChangeGender}
                    options={optionGender}
                  />
                </Col>
                <Col span={12}>
                  <Typography.Title level={5}>Thương hiệu</Typography.Title>
                  <Input
                    maxLength={200}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Nhập thương hiệu"
                  />
                </Col>
              </Row>

              <div>
                <Typography.Title level={5}>Thể loại</Typography.Title>
                <Input
                  maxLength={200}
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  placeholder="Thể loại"
                />
              </div>

              <div>
                <Typography.Title level={5}>Nhà cung cấp</Typography.Title>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn nhà cung cấp"
                  value={supplierId}
                  onChange={handleChangeSupper}
                  options={supplierName}
                  size="large"
                />
              </div>

              <div>
                <Typography.Title level={5}>
                  Lượt xem
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 12, marginLeft: 8 }}
                  >
                    (Sẽ được cộng thêm vào số hiện có)
                  </Typography.Text>
                </Typography.Title>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100000000}
                  value={view}
                  onChange={(value) => setView(value)}
                  placeholder="Nhập số lượng cần thêm"
                />
              </div>

              <div>
                <Typography.Title level={5}>Mô tả</Typography.Title>
                <Input.TextArea
                  showCount
                  maxLength={500}
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Nhập mô tả sản phẩm"
                  style={{ height: 120, resize: "none" }}
                />
              </div>

              <div>
                <Typography.Title level={5}>Nội dung chi tiết</Typography.Title>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  style={{ height: "200px", marginBottom: "50px" }}
                />
              </div>
            </Space>
          </Card>

          {/* Card mới cho quản lý ảnh */}
          <Card
            title="Quản lý ảnh hiện tại"
            extra={
              <Button
                type="primary"
                ghost
                onClick={() => setShowImageManager(!showImageManager)}
              >
                {showImageManager ? "Ẩn" : "Xem ảnh"}
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            {showImageManager && (
              <div>
                <Alert
                  message="Quản lý ảnh sản phẩm"
                  description="Bạn có thể xem và xóa ảnh theo từng màu. Việc xóa ảnh sẽ được thực hiện ngay lập tức và không thể hoàn tác."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <ImagesByColorComponent />
              </div>
            )}
          </Card>
        </Col>

        {/* Cột phải - Thông tin bán hàng */}
        <Col span={10}>
          <div className="sticky top-4">
            <Card
              title="Thông tin bán hàng"
              extra={
                <Flex gap="small">
                  <Button onClick={() => Navigate("/admin/products")}>
                    Hủy
                  </Button>
                  <Button type="primary" onClick={hanldeUpdateProducts}>
                    Cập nhật
                  </Button>
                </Flex>
              }
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div>
                  <Typography.Title level={5}>Danh mục *</Typography.Title>
                  <Select
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Chọn danh mục"
                    value={categoryId}
                    onChange={handleChangeCatogry}
                    options={opitonCategory}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Typography.Title level={5}>Giá vốn</Typography.Title>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={costPrice}
                      onChange={(value) => setCostPrice(value)}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      placeholder="0"
                    />
                  </Col>
                  <Col span={12}>
                    <Typography.Title level={5}>Giá bán</Typography.Title>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      max={90000000}
                      value={price}
                      onChange={onChangePrice}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      placeholder="0"
                    />
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Typography.Title level={5}>Giảm giá (%)</Typography.Title>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={100}
                      value={discount}
                      onChange={onChangeDiscount}
                      placeholder="0"
                    />
                  </Col>
                  <Col span={12}>
                    <Typography.Title level={5}>Đã bán</Typography.Title>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={sold}
                      onChange={onChangeSold}
                      placeholder="0"
                    />
                  </Col>
                </Row>

                <div>
                  <span>Hệ thống sẽ cộng thêm số lượng (stock) vào kho</span>
                  <div>
                    <Switch
                      defaultChecked
                      onChange={() => setIsAddStock(!isAddStock)}
                    />
                  </div>
                </div>

                <Divider>Quản lý tồn kho</Divider>

                {getStockUpdateMessage()}

                <div>
                  <Typography.Title level={5}>
                    Số lượng thêm vào kho
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 8 }}
                    >
                      (Sẽ được cộng thêm vào số hiện có)
                    </Typography.Text>
                  </Typography.Title>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    max={10000000000000}
                    value={stock}
                    onChange={onChangeStock}
                    placeholder="Nhập số lượng cần thêm"
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Size
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 8 }}
                    >
                      (Để trống = tất cả size)
                    </Typography.Text>
                  </Typography.Title>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Chọn size cần cập nhật"
                    value={size}
                    onChange={handleChangeSize}
                    options={optionsSize}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>
                    Màu sắc
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12, marginLeft: 8 }}
                    >
                      (Để trống = tất cả màu)
                    </Typography.Text>
                  </Typography.Title>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Chọn màu cần cập nhật"
                    value={color}
                    onChange={handleChangeColor}
                    options={optionsColor}
                  />
                </div>

                <div>
                  <Typography.Title level={5}>Thêm ảnh mới</Typography.Title>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 8 }}
                  >
                    Nếu thêm ảnh mới, số lượng ảnh phải khớp với số màu đã chọn
                  </Typography.Text>
                  <ImgCrop rotationSlider>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={onChangeImg}
                      onPreview={onPreview}
                      multiple
                      beforeUpload={() => false}
                    >
                      {fileList.length < 10 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </ImgCrop>
                </div>

                {currentVariants.length > 0 && (
                  <div>
                    <Typography.Title level={5}>
                      Variants hiện tại
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setShowVariantsTable(!showVariantsTable)}
                      >
                        {showVariantsTable ? "Ẩn" : "Xem chi tiết"}
                      </Button>
                    </Typography.Title>

                    {showVariantsTable && (
                      <Table
                        columns={variantsColumns}
                        dataSource={getVariantsTableData()}
                        size="small"
                        pagination={false}
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                )}
              </Space>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Modal xác nhận (nếu cần) */}
      <Modal
        title="Xác nhận cập nhật"
        open={false}
        onOk={() => {}}
        onCancel={() => {}}
      >
        <p>Bạn có chắc chắn muốn cập nhật thông tin sản phẩm này?</p>
      </Modal>
    </div>
  );
};

export default UpLoad;
