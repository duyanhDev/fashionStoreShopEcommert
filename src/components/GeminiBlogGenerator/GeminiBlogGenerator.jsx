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
  Image,
  Tooltip,
  Switch,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  RobotOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  LoadingOutlined,
  DeleteOutlined,
  PictureOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { generateBlogByGeminiAPi } from "../../service/ChatBot";
import { CreateBlog } from "../../service/Blog";

const { TextArea } = Input;
const { Title, Text } = Typography;

const GeminiBlogGenerator = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
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
  const [readTime, setReadTime] = useState("");
  const [featured, setFeatured] = useState(false);

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
    setReadTime("");
    setFeatured(false);
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
        readTime: readTime,
        featured: featured,
      });

      message.success("🤖 AI đã tạo nội dung thành công!");
    } catch (err) {
      console.error("Lỗi gọi Gemini:", err);
      message.error("Gemini không thể tạo blog.");
    }

    setLoading(false);
  };

  const handleSave = async (values) => {
    console.log(values);

    if (!values.title || !values.content) {
      message.error("Tiêu đề và nội dung không được để trống.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("tip", tip);
      formData.append("content", content);
      formData.append("slug", title.toLowerCase().replace(/\s+/g, "-"));
      formData.append("regex", keywords || "");
      formData.append("userId", "673017dde4526bd79cc61fa6");
      formData.append("readTime", readTime);
      formData.append("featured", featured);

      if (images.length > 0) {
        images.forEach((img) => formData.append("img", img));
      }
      console.log(formData);

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

  const removeImage = (index) => {
    const newFileList = [...fileList];
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    newFileList.splice(index, 1);
    newImages.splice(index, 1);
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);

    setFileList(newFileList);
    setImages(newImages);
    setImagePreviews(newPreviews);
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
    showUploadList: false, // Tắt danh sách mặc định để dùng UI tùy chỉnh
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);

      const selectedFiles = newFileList
        .map((file) => file.originFileObj)
        .filter(Boolean);

      setImages(selectedFiles);

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    },
  };

  console.log(title);

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
              <Col span={12}>
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
              <Col span={6}>
                <Form.Item name="keywords" label="Từ khóa">
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="readTime"
                  label={
                    <div className="flex items-center space-x-1">
                      <ClockCircleOutlined className="text-orange-500" />
                      <span>Thời gian đọc (phút)</span>
                    </div>
                  }
                >
                  <Input
                    value={readTime}
                    onChange={(value) => setReadTime(value)}
                    size="large"
                    min={1}
                    max={60}
                    placeholder="5"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={18}>
                <Form.Item name="tip" label="Mẹo mở đầu">
                  <Input
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="featured"
                  label={
                    <div className="flex items-center space-x-1">
                      <StarOutlined className="text-yellow-500" />
                      <span>Bài viết nổi bật</span>
                    </div>
                  }
                  valuePropName="checked"
                >
                  <Switch
                    checked={featured}
                    onChange={(checked) => setFeatured(checked)}
                    size="default"
                    checkedChildren="Có"
                    unCheckedChildren="Không"
                    className="bg-gray-300"
                  />
                </Form.Item>
              </Col>
            </Row>

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

            <Form.Item
              name="image"
              label={
                <div className="flex items-center space-x-2">
                  <PictureOutlined className="text-blue-500" />
                  <span>Ảnh bài viết</span>
                  {imagePreviews.length > 0 && (
                    <Tag color="blue">{imagePreviews.length} ảnh</Tag>
                  )}
                </div>
              }
            >
              <div className="space-y-4">
                {/* Upload Area */}
                <Upload {...uploadProps}>
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="bg-blue-100 p-4 rounded-full mb-3">
                      <UploadOutlined className="text-3xl text-blue-600" />
                    </div>
                    <Text className="text-lg font-medium text-gray-700 mb-1">
                      Tải lên ảnh cho bài viết
                    </Text>
                    <Text type="secondary" className="text-center">
                      Kéo thả hoặc click để chọn nhiều ảnh
                      <br />
                      <span className="text-xs">
                        Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi ảnh)
                      </span>
                    </Text>
                  </div>
                </Upload>

                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <Text strong className="text-gray-700">
                        Ảnh đã chọn ({imagePreviews.length})
                      </Text>
                      <Text type="secondary" className="text-sm">
                        Click vào ảnh để xem phóng to
                      </Text>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200"
                        >
                          <div className="aspect-square overflow-hidden">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                              preview={{
                                mask: (
                                  <div className="flex items-center justify-center">
                                    <EyeOutlined className="text-white text-lg" />
                                  </div>
                                ),
                              }}
                            />
                          </div>

                          {/* Delete Button */}
                          <Tooltip title="Xóa ảnh này">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center w-8 h-8 rounded-full shadow-lg"
                            />
                          </Tooltip>

                          {/* Image Index */}
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>

            <Divider />

            <div className="flex justify-between items-center">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => setShowPreview(!showPreview)}
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
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
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <EyeOutlined className="text-green-500" />
                  <span>Xem trước bài viết</span>
                </div>
              }
              className="border-green-200"
            >
              <Title level={2} className="text-gray-800">
                {title}
              </Title>
              {tip && (
                <Alert
                  message={tip}
                  type="info"
                  className="mb-4 rounded-lg"
                  showIcon
                />
              )}
              {keywords && (
                <div className="mb-4">
                  <Text type="secondary" className="block mb-2">
                    Từ khóa:
                  </Text>
                  <div className="flex flex-wrap gap-1">
                    {keywords.split(",").map((k, i) => (
                      <Tag color="blue" key={i} className="mb-1">
                        {k.trim()}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <Text type="secondary" className="block mb-3">
                    Ảnh bài viết ({imagePreviews.length}):
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <Image
                          src={src}
                          alt={`Preview ${i + 1}`}
                          className="rounded-lg shadow-md w-full object-cover"
                          style={{ maxHeight: "200px" }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                          {i + 1}/{imagePreviews.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {content}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal>
    </>
  );
};

export default GeminiBlogGenerator;
