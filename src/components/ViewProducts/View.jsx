import {
  Input,
  Typography,
  Button,
  Flex,
  Select,
  Space,
  InputNumber,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles for Quill
import { useNavigate, useParams } from "react-router-dom";
import { ListOneProductAPI } from "../../service/ApiProduct";
import { ListCategoryAPI } from "../../service/ApiCategory";

const View = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState([]);
  const [opitonCategory, setOptionCategory] = useState([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [image, setImageFiles] = useState([]);
  const param = useParams();
  const [categoryId, setCategoryId] = useState();
  const [brand, setBrand] = useState("");
  // xử lí ảnh

  const navigate = useNavigate();

  const [fileList, setFileList] = useState([{}]);

  const onChangeImg = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // Lưu trữ các file ảnh thực tế, không phải chỉ tên
    const files = newFileList.map((file) => file.originFileObj);
    setImageFiles(files);
  };

  const onPreview = async (file) => {
    // You can handle image preview here if needed
    // Example: display modal with the selected image
    const src = file.url || (await getBase64(file.originFileObj));
    const imgWindow = window.open(src);
    imgWindow.document.write(`<img src="${src}" />`);
  };

  // Function to convert file to base64 for preview
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeCatogry = (value) => {
    setCategoryId(value);
  };

  const onChangePrice = (value) => {
    setPrice(value);
  };

  const onChangeStock = (value) => {
    setStock(value);
  };

  const handleChangeColor = (value) => {
    setColor(value);
  };
  const handleChangeSize = (value) => {
    setSize(value);
  };

  useEffect(() => {
    const CallApiListProduct = async () => {
      try {
        const res = await ListOneProductAPI(param.id);

        if (res && res.data.EC === 0) {
          setName(res.data.data.name || "");
          setDescription(res.data.data.description || "");
          setBrand(res.data.data.brand || "");
          setCategory([res.data.data.category.name] || []);
          setPrice(res.data.data.price || "");
          setStock(res.data.data.stock || "");
          setSize(res.data.data.size || []);
          setColor(res.data.data.color || []);
          setFileList(
            res.data.data.images.map((image) => ({
              url: image.url,
              name: image.url || "Image",
            })) || []
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    CallApiListProduct();
  }, [param.id]);

  useEffect(() => {
    const FetchCategory = async () => {
      try {
        const res = await ListCategoryAPI();
        if (res && res.data && res.data.EC === 0) {
          const dataCategory = res.data.data.map((category) => ({
            label: category.name,
            value: category._id,
          }));
          setCategory(category.name);
          setOptionCategory(dataCategory);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchCategory();
  }, []);

  const optionsSize = [
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
    { label: "XL", value: "XL" },
    { label: "XXL", value: "XXL" },
    { label: "28", value: 28 },
    { label: "29", value: 29 },
    { label: "30", value: 30 },
    { label: "31", value: 31 },
    { label: "32", value: 32 },
    { label: "33", value: 33 },
    { label: "34", value: 34 },
  ];

  const colorArr = ["đen", "trắng", "vàng", "đỏ", "be"];
  const optionsColor = colorArr.map((color) => ({
    label: color,
    value: color,
  }));

  const hanldeUpdateProducts = async () => {
    navigate("/admin");
  };

  return (
    <div className="w-full ml-6 flex ">
      <div className="w-3/5">
        <Typography.Title level={5}>Name</Typography.Title>
        <Input
          maxLength={200}
          value={name}
          onChange={handleNameChange}
          disabled
        />
        <Typography.Title level={5}>Brand</Typography.Title>
        <Input
          maxLength={200}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          disabled
        />
        <Typography.Title level={5} className="mt-4">
          Description
        </Typography.Title>
        <Input.TextArea
          showCount
          maxLength={100}
          value={description}
          onChange={handleDescriptionChange}
          disabled
          placeholder="disable resize"
          style={{
            height: 120,
            resize: "none",
          }}
        />
        <Typography.Title level={5}>Content</Typography.Title>
        <ReactQuill value={"1"} style={{ height: "300px" }} disabled />
      </div>
      <div className="w-2/5 ">
        <Flex gap="small" wrap className="mt-8 ml-5 ">
          <Button type="primary" onClick={hanldeUpdateProducts}>
            Cancel
          </Button>
        </Flex>

        <div className="ml-5 mt-2">
          <Typography.Title level={5}>Category</Typography.Title>
          <Space
            style={{
              width: "50%",
            }}
            direction="vertical"
          >
            <Select
              mode="multiple"
              allowClear
              style={{
                width: "100%",
              }}
              placeholder="Please select"
              value={category}
              onChange={handleChangeCatogry}
              options={opitonCategory}
              disabled
            />
          </Space>
        </div>
        <div className="ml-5 mt-2">
          <Typography.Title level={5}>Price</Typography.Title>
          <InputNumber
            style={{
              width: "50%",
            }}
            min={1}
            max={90000000}
            value={price}
            onChange={onChangePrice}
            disabled
          />
        </div>

        <div className="ml-5 mt-2">
          <Typography.Title level={5}>Stock</Typography.Title>
          <InputNumber
            style={{
              width: "50%",
            }}
            min={0}
            max={10000}
            value={stock}
            onChange={onChangeStock}
            disabled
          />
        </div>

        <div className="ml-5 mt-2">
          <Typography.Title level={5}>Size</Typography.Title>
          <Space
            style={{
              width: "50%",
            }}
            direction="vertical"
          >
            <Select
              mode="multiple"
              allowClear
              style={{
                width: "100%",
              }}
              placeholder="Please select"
              value={size}
              onChange={handleChangeSize}
              options={optionsSize}
              disabled
            />
          </Space>
        </div>

        <div className="ml-5 mt-2">
          <Typography.Title level={5}>Color</Typography.Title>
          <Space
            style={{
              width: "50%",
            }}
            direction="vertical"
          >
            <Select
              mode="multiple"
              allowClear
              style={{
                width: "100%",
              }}
              placeholder="Please select"
              value={color}
              onChange={handleChangeColor}
              options={optionsColor}
              disabled
            />
          </Space>
        </div>

        <div className="ml-5 mt-2">
          <ImgCrop rotationSlider>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChangeImg}
              onPreview={onPreview}
              multiple
              beforeUpload={() => false}
              disabled // Prevent automatic upload
            >
              {fileList.length < 5 && "+ Upload"}
            </Upload>
          </ImgCrop>
        </div>
      </div>
    </div>
  );
};

export default View;
