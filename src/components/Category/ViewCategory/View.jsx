import { Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import { ListOneCategoryAPI } from "../../../service/ApiCategory";
const View = ({ isModalOpen, setIsModel, isCategory }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    const ApiCategory = async () => {
      try {
        const res = await ListOneCategoryAPI(isCategory);
        if (res && res.data && res.data.EC === 0) {
          setName(res.data.data.name || "");
          setDescription(res.data.data.description || "");
        }
      } catch (error) {
        console.log(error);
        return;
      }
    };
    ApiCategory();
  }, [isCategory]);
  const handleOk = () => {
    setIsModel(false);
  };
  const handleCancel = () => {
    setIsModel(false);
  };

  console.log(name);

  return (
    <>
      <Modal
        title="Category"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Typography.Title level={5}>Name</Typography.Title>
        <Input maxLength={200} value={name} disabled />

        <Typography.Title level={5}>Description</Typography.Title>
        <Input maxLength={200} value={description} disabled />
      </Modal>
    </>
  );
};

export default View;
