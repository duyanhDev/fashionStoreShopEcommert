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
} from "antd";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { ListOneProductAPI, UpdateProductAPI } from "../../service/ApiProduct";
import { ListCategoryAPI } from "../../service/ApiCategory";
import { listColorAPI } from "../../service/APIColor";

const View = () => {
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
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  // Thêm state mới cho việc quản lý variants
  const [currentVariants, setCurrentVariants] = useState([]);
  const [stockUpdateMode, setStockUpdateMode] = useState("all"); // "all" | "specific"
  const [showVariantsTable, setShowVariantsTable] = useState(false);
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

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleChangeCatogry = (value) => setCategoryId(value);
  const onChangePrice = (value) => setPrice(value);
  const onChangeStock = (value) => {
    setStock(value);
    // Tự động chuyển sang mode specific nếu có chọn size/color
    if ((size.length > 0 || color.length > 0) && value > 0) {
      setStockUpdateMode("specific");
    }
  };
  const onChangeSold = (value) => setSold(value);
  const handleChangeColor = (value) => {
    setColor(value);
    // Tự động chuyển sang mode specific nếu có stock
    if (value.length > 0 && stock > 0) {
      setStockUpdateMode("specific");
    }
  };
  const handleChangeSize = (value) => {
    setSize(value);
    // Tự động chuyển sang mode specific nếu có stock
    if (value.length > 0 && stock > 0) {
      setStockUpdateMode("specific");
    }
  };
  const onChangeGender = (value) => setGender(value);
  const onChangeDiscount = (value) => setDisscount(value);

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
    } catch (error) {
      console.log(error);
    }
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

  // Reset các field khi chuyển đổi mode
  const handleStockModeChange = (mode) => {
    setStockUpdateMode(mode);
    if (mode === "all") {
      setSize([]);
      setColor([]);
    }
  };

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

      if (image.length > 0 && image.length !== color.length) {
        messageApi.error("Số lượng ảnh phải khớp với số màu đã chọn");
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
        costPrice
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
                <Typography.Title level={5}>Mô tả</Typography.Title>
                <Input.TextArea
                  showCount
                  maxLength={1500}
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
                  <Button
                    type="primary"
                    onClick={hanldeUpdateProducts}
                    disabled
                  >
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
                    max={10000}
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
                  <Typography.Title level={5}>Hình ảnh</Typography.Title>
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

export default View;
