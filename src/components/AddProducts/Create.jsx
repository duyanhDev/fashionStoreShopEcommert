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
  Row,
  Col,
  Divider,
  Form,
  Tag,
} from "antd";

import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  TagsOutlined,
  PictureOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { ListCategoryAPI } from "../../service/ApiCategory";
import { createProductAPI } from "../../service/ApiProduct";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FindAllSupplierAPI } from "../../service/Supplier";
import { listColorAPI } from "../../service/APIColor";

const { Title, Text } = Typography;

const Create = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState([]);
  const [opitonCategory, setOptionCategory] = useState([]);
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [discount, setDisscount] = useState(0);
  const [view, setView] = useState(0);
  const [brand, setBrand] = useState("");
  const [care, setCare] = useState("");
  const [categoryId, setCategoryId] = useState();
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useSelector((state) => state.auth);
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  const [image, setImageFiles] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [variantsInput, setVariantsInput] = useState([
    {
      color: "",
      sizes: [{ size: "", quantity: 0 }],
    },
  ]);

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

  const handleChange = (value) => {
    setCategoryId(value);
  };

  const handleChangeSupper = (value) => {
    setSupplierId(value);
  };

  const onChange = (value) => {
    setPrice(value);
  };

  const onChangeStock = (value) => {
    // Deprecated
  };

  const onChangeGender = (value) => {
    setGender(value);
  };

  const onChangeDiscount = (value) => {
    setDisscount(value);
  };

  const handleAddVariant = () => {
    setVariantsInput([
      ...variantsInput,
      { color: "", sizes: [{ size: "", quantity: 0 }] },
    ]);
  };

  const handleRemoveVariant = (index) => {
    const updated = [...variantsInput];
    updated.splice(index, 1);
    setVariantsInput(updated);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variantsInput];
    updated[index][field] = value;
    setVariantsInput(updated);
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updated = [...variantsInput];
    updated[variantIndex].sizes[sizeIndex][field] = value;
    setVariantsInput(updated);
  };

  const addSizeToVariant = (variantIndex) => {
    const updated = [...variantsInput];
    updated[variantIndex].sizes.push({ size: "", quantity: 0 });
    setVariantsInput(updated);
  };

  const removeSizeFromVariant = (variantIndex, sizeIndex) => {
    const updated = [...variantsInput];
    updated[variantIndex].sizes.splice(sizeIndex, 1);
    setVariantsInput(updated);
  };

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

  const handleCreate = async () => {
    if (user.role !== "admin") {
      message.error("Bạn không có quyền thêm sản phẩm mới");
      return;
    }
    if (
      !name ||
      !gender ||
      !description ||
      !categoryId ||
      !price ||
      image.length === 0 ||
      variantsInput.length === 0
    ) {
      messageApi.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("gender", gender);
      formData.append("description", description);
      formData.append("category", categoryId);
      formData.append("brand", brand);
      formData.append("care", care);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("costPrice", costPrice);
      formData.append("view", view);
      image.forEach((img) => formData.append("images", img));
      formData.append("variantsInput", JSON.stringify(variantsInput));
      formData.append("supplierId", supplierId);

      const res = await createProductAPI(formData);

      if (res) {
        messageApi.success("Tạo sản phẩm thành công");
        navigate("/admin");
      }
    } catch (error) {}
  };

  const fetchAPIColor = async () => {
    try {
      const res = await listColorAPI();
      if (res && res.data && res.data.EC === 0) {
        setColors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAPIColor();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
      }}
    >
      {contextHolder}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "none",
          }}
        >
          <Flex align="center" gap="middle">
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
              }}
            >
              <ShoppingOutlined />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
                Tạo sản phẩm mới
              </Title>
              <Text type="secondary">Thêm sản phẩm vào cửa hàng của bạn</Text>
            </div>
          </Flex>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Left Column - Basic Info */}
          <Col xs={24} lg={14}>
            {/* Basic Information */}
            <Card
              title={
                <Flex align="center" gap="small">
                  <InfoCircleOutlined style={{ color: "#667eea" }} />
                  <span>Thông tin cơ bản</span>
                </Flex>
              }
              style={{
                marginBottom: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                border: "none",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Tên sản phẩm *
                  </Text>
                  <Input
                    placeholder="Nhập tên sản phẩm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="large"
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text
                      strong
                      style={{
                        color: "#1a1a1a",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Giới tính
                    </Text>
                    <Select
                      placeholder="Chọn giới tính"
                      value={gender}
                      onChange={onChangeGender}
                      options={[
                        { label: "Nam", value: "male" },
                        { label: "Nữ", value: "female" },
                        { label: "Unisex", value: "unisex" },
                      ]}
                      size="large"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Text
                      strong
                      style={{
                        color: "#1a1a1a",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Thương hiệu
                    </Text>
                    <Input
                      placeholder="Nhập thương hiệu"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      size="large"
                      style={{ borderRadius: "8px" }}
                    />
                  </Col>
                </Row>

                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Thể Loại
                  </Text>
                  <Input
                    placeholder="Nhập thể loại"
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    size="large"
                    style={{ borderRadius: "8px" }}
                  />
                </div>
                <div style={{ marginTop: "40px" }}>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Danh mục sản phẩm *
                  </Text>
                  <Select
                    placeholder="Chọn danh mục"
                    value={categoryId}
                    onChange={handleChange}
                    options={opitonCategory}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    suffixIcon={<TagsOutlined style={{ color: "#667eea" }} />}
                  />
                </div>

                <div style={{ marginTop: "40px" }}>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Chọn nhà cung cấp *
                  </Text>
                  <Select
                    placeholder="Chọn danh mục"
                    value={supplierId}
                    onChange={handleChangeSupper}
                    options={supplierName}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    suffixIcon={<TagsOutlined style={{ color: "#667eea" }} />}
                  />
                </div>
                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Mô tả sản phẩm
                  </Text>
                  <Input.TextArea
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Nội dung chi tiết
                  </Text>
                  <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                    <ReactQuill
                      value={"1"}
                      style={{ height: 200 }}
                      theme="snow"
                    />
                  </div>
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Số lượt xem
                  </Text>
                  <InputNumber
                    placeholder="0"
                    value={view}
                    onChange={(val) => setView(val)}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    min={0}
                  />
                </div>
              </Space>
            </Card>

            {/* Product Variants */}
            <Card
              title={
                <Flex align="center" gap="small">
                  <TagsOutlined style={{ color: "#667eea" }} />
                  <span>Biến thể sản phẩm</span>
                </Flex>
              }
              style={{
                marginBottom: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                border: "none",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {variantsInput.map((variant, i) => (
                  <Card
                    key={i}
                    size="small"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveVariant(i)}
                        style={{ borderRadius: "6px" }}
                      >
                        Xóa màu
                      </Button>
                    }
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <div>
                          <Text
                            strong
                            style={{ marginBottom: "8px", display: "block" }}
                          >
                            Màu sắc
                          </Text>

                          <Select
                            placeholder="Nhập màu sắc (VD: Đỏ, Xanh, Vàng...)"
                            onChange={(value) =>
                              handleVariantChange(i, "color", value)
                            }
                          >
                            {colors?.map((item) => (
                              <Select.Option
                                key={item._id || item.value}
                                value={item.type}
                              >
                                {item.title}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Text
                          strong
                          style={{ marginBottom: "8px", display: "block" }}
                        >
                          Kích thước và số lượng
                        </Text>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          {variant.sizes.map((sz, j) => (
                            <Flex key={j} gap="small" align="center">
                              <Input
                                placeholder="Size (VD: S, M, L, XL)"
                                value={sz.size}
                                onChange={(e) =>
                                  handleSizeChange(i, j, "size", e.target.value)
                                }
                                style={{ flex: 1, borderRadius: "6px" }}
                              />
                              <InputNumber
                                placeholder="Số lượng"
                                value={sz.quantity}
                                onChange={(val) =>
                                  handleSizeChange(i, j, "quantity", val)
                                }
                                min={0}
                                style={{ width: "120px", borderRadius: "6px" }}
                              />
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeSizeFromVariant(i, j)}
                                style={{ borderRadius: "6px" }}
                              />
                            </Flex>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => addSizeToVariant(i)}
                            style={{ width: "100%", borderRadius: "6px" }}
                          >
                            Thêm size
                          </Button>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddVariant}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    borderColor: "#667eea",
                    color: "#667eea",
                  }}
                >
                  Thêm biến thể màu mới
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Right Column - Pricing & Images */}
          <Col xs={24} lg={10}>
            {/* Pricing */}
            <Card
              title={
                <Flex align="center" gap="small">
                  <DollarOutlined style={{ color: "#667eea" }} />
                  <span>Thông tin giá</span>
                </Flex>
              }
              style={{
                marginBottom: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                border: "none",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Giá nhập (VNĐ)
                  </Text>
                  <InputNumber
                    placeholder="0"
                    value={costPrice}
                    onChange={(val) => setCostPrice(val)}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    min={0}
                  />
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Giá bán (VNĐ) *
                  </Text>
                  <InputNumber
                    placeholder="0"
                    value={price}
                    onChange={onChange}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    min={0}
                  />
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Giảm giá (%)
                  </Text>
                  <InputNumber
                    placeholder="0"
                    value={discount}
                    onChange={onChangeDiscount}
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                    min={0}
                    max={100}
                  />
                </div>

                {price && discount > 0 && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea20, #764ba220)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #667eea30",
                    }}
                  >
                    <Text strong style={{ color: "#667eea" }}>
                      Giá sau giảm:{" "}
                      {((price * (100 - discount)) / 100).toLocaleString()} VNĐ
                    </Text>
                  </div>
                )}
              </Space>
            </Card>

            {/* Product Images */}
            <Card
              title={
                <Flex align="center" gap="small">
                  <PictureOutlined style={{ color: "#667eea" }} />
                  <span>Hình ảnh sản phẩm</span>
                </Flex>
              }
              style={{
                marginBottom: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                border: "none",
              }}
            >
              <div>
                <Text
                  type="secondary"
                  style={{ marginBottom: "16px", display: "block" }}
                >
                  Tải lên tối đa 5 hình ảnh. Hình ảnh đầu tiên sẽ là ảnh đại
                  diện.
                </Text>
                <ImgCrop rotationSlider>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={onChangeImg}
                    onPreview={onPreview}
                    multiple
                    beforeUpload={() => false}
                    style={{ borderRadius: "8px" }}
                  >
                    {fileList.length < 5 && (
                      <div style={{ textAlign: "center" }}>
                        <PlusOutlined
                          style={{
                            fontSize: "24px",
                            color: "#667eea",
                            marginBottom: "8px",
                          }}
                        />
                        <div style={{ color: "#667eea", fontSize: "14px" }}>
                          Tải ảnh lên
                        </div>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "none",
            background: "white",
          }}
        >
          <Flex justify="space-between" align="center">
            <div>
              <Text type="secondary">
                Kiểm tra kỹ thông tin trước khi tạo sản phẩm
              </Text>
            </div>
            <Flex gap="middle">
              <Button
                size="large"
                onClick={() => navigate("/admin")}
                style={{
                  borderRadius: "8px",
                  minWidth: "120px",
                  height: "48px",
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleCreate}
                style={{
                  borderRadius: "8px",
                  minWidth: "120px",
                  height: "48px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                }}
              >
                Tạo sản phẩm
              </Button>
            </Flex>
          </Flex>
        </Card>
      </div>
    </div>
  );
};

export default Create;
