import { Button, Space, Table, Flex } from "antd";
import { useEffect, useState } from "react";
import { ListCategoryAPI } from "../../service/ApiCategory";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AddCategory from "./AddCategory/AddCategory";
import View from "./ViewCategory/View";
import Update from "./UpdateCategory/Update";
import Delete from "./DeleteCategory/Delete";

const Category = () => {
  const [dataCategory, setDataCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [isModel, setIsModel] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isModelDel, setIsModelDel] = useState(false);
  const [isCategory, setIdCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const pageSize = 4;

  const FetchApiCategory = async () => {
    try {
      const response = await ListCategoryAPI();
      if (response && response.data.EC === 0) {
        setDataCategory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    FetchApiCategory();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <p>{text}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle" key={record._id}>
          <div className="flex items-center gap-5">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleShowModel(record._id)}
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => handleShowUpdate(record._id)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id, record.name)}
            />
          </div>
        </Space>
      ),
    },
  ];
  const paginatedData = dataCategory.slice(
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
    <div className="w-full">
      <Flex
        vertical
        gap="small"
        style={{
          width: "100%",
        }}
      >
        <Button type="primary" block onClick={showModal}>
          Add Category
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: dataCategory.length,
          onChange: (page) => setCurrentPage(page), // Cập nhật trang hiện tại
        }}
      />
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
  );
};

export default Category;
