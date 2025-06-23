import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Alert,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  RobotOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { generateBlogByGeminiAPi } from "../../service/ChatBot";
import { CreateBlog } from "../../service/Blog";

const { TextArea } = Input;
const { Title, Text } = Typography;

const GeminiBlogGenerator = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [form] = Form.useForm();

  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [title, setTitle] = useState("");
  const [tip, setTip] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileList, setFileList] = useState([]);

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setTopic("");
    setKeywords("");
    setAudience("");
    setTitle("");
    setTip("");
    setContent("");
    setImages([]);
    setImagePreviews([]);
    setSaved(false);
    setFileList([]);
    setShowPreview(false);
  };

  const handleGenerate = async () => {
    if (!topic || !keywords || !audience) {
      message.error("Vui lòng nhập đủ các trường.");
      return;
    }

    setLoading(true);
    setSaved(false);

    try {
      const res = await generateBlogByGeminiAPi(topic, keywords, audience);
      const blog = res.data.blog;

      const newTitle = blog.title || "";
      const newTip = blog.tip || "";
      const newContent = blog.content || "";

      setTitle(newTitle);
      setTip(newTip);
      setContent(newContent);

      form.setFieldsValue({
        title: newTitle,
        tip: newTip,
        content: newContent,
        keywords: keywords,
      });

      message.success("🤖 AI đã tạo nội dung thành công!");
    } catch (err) {
      console.error("Lỗi gọi Gemini:", err);
      message.error("Gemini không thể tạo blog.");
    }

    setLoading(false);
  };

  const handleSave = async (values) => {
    if (!values.title || !values.content) {
      message.error("Tiêu đề và nội dung không được để trống.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("tip", values.tip || "");
      formData.append("content", values.content);
      formData.append("slug", values.title.toLowerCase().replace(/\s+/g, "-"));
      formData.append("regex", values.keywords || "");
      formData.append("author", "685047211a43fd53e1936c34");

      if (images.length > 0) {
        images.forEach((img) => formData.append("img", img));
      }

      const res = await CreateBlog(formData);

      if (res.status === 201) {
        message.success("✅ Đã lưu blog thành công!");
        setSaved(true);
        handleCancel();
      }
    } catch (err) {
      console.error("Lỗi lưu blog:", err);
      message.error("Không thể lưu blog.");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể tải lên file hình ảnh!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Kích thước file phải nhỏ hơn 5MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    multiple: true,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);

      const selectedFiles = newFileList
        .map((file) => file.originFileObj)
        .filter(Boolean);

      setImages(selectedFiles);

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    },
    listType: "picture-card",
  };

  return (
    <>
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={showModal}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Tạo bài viết mới
      </Button>

      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined className="text-blue-500" />
            <span className="text-xl font-semibold">
              ✍️ Tạo Blog Thời Trang bằng AI
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        className="admin-post-modal"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="space-y-6">
          <Card
            title={
              <div className="flex items-center space-x-2">
                <RobotOutlined className="text-purple-500" />
                <span>Tạo nội dung bằng AI</span>
              </div>
            }
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Chủ đề</Text>
                <Input
                  placeholder="Chủ đề..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  size="large"
                />
              </Col>
              <Col span={8}>
                <Text strong>Từ khóa</Text>
                <Input
                  placeholder="Từ khóa..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  size="large"
                />
              </Col>
              <Col span={8}>
                <Text strong>Đối tượng</Text>
                <Input
                  placeholder="Đối tượng..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  size="large"
                />
              </Col>
            </Row>
            <div className="mt-4">
              <Button
                type="primary"
                icon={loading ? <LoadingOutlined /> : <RobotOutlined />}
                onClick={handleGenerate}
                loading={loading}
                size="large"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0"
              >
                {loading ? "Đang tạo..." : "Tạo Blog bằng Gemini"}
              </Button>
            </div>
          </Card>

          <Divider orientation="center">
            <Text type="secondary">hoặc tự viết nội dung</Text>
          </Divider>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề!" },
                  ]}
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="keywords" label="Từ khóa">
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="tip" label="Mẹo mở đầu">
              <Input
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <TextArea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                showCount
                maxLength={5000}
              />
            </Form.Item>

            <Form.Item name="image" label="Ảnh bài viết">
              <Upload {...uploadProps}>
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                  <UploadOutlined className="text-2xl text-gray-400 mb-2" />
                  <Text type="secondary">Tải lên ảnh (nhiều ảnh)</Text>
                </div>
              </Upload>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index}`}
                      className="max-h-60 rounded-lg shadow-md object-cover w-full"
                    />
                  ))}
                </div>
              )}
            </Form.Item>

            <Divider />

            <div className="flex justify-between items-center">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Ẩn xem trước" : "Xem trước"}
              </Button>

              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0"
                >
                  Lưu Blog
                </Button>
              </Space>
            </div>
          </Form>

          {saved && (
            <Alert
              message="✅ Đã lưu thành công!"
              type="success"
              showIcon
              className="rounded-lg"
            />
          )}

          {showPreview && (title || form.getFieldValue("title")) && (
            <Card title="Xem trước bài viết">
              <Title level={2}>{title}</Title>
              {tip && <Alert message={tip} type="info" className="mb-3" />}
              {keywords && (
                <div className="mb-3">
                  {keywords.split(",").map((k, i) => (
                    <Tag color="blue" key={i}>
                      {k.trim()}
                    </Tag>
                  ))}
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i}`}
                      className="rounded-lg shadow-md w-full h-auto object-cover"
                    />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">{content}</div>
            </Card>
          )}
        </div>
      </Modal>
    </>
  );
};

export default GeminiBlogGenerator;
