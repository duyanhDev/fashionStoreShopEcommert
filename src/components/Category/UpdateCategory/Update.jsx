import { Input, Modal, Typography, notification } from "antd";
import { useEffect, useState } from "react";
import {
  ListOneCategoryAPI,
  UpdateOneCatogryAPI,
} from "../../../service/ApiCategory";

const Update = ({ isModalOpen, setIsModel, isCategory, FetchApiCategory }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await ListOneCategoryAPI(isCategory);
        if (res && res.data && res.data.EC === 0) {
          setName(res.data.data.name || "");
          setDescription(res.data.data.description || "");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();
  }, [isCategory]);

  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        handleOk();
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleEnterPress);
    } else {
      window.removeEventListener("keydown", handleEnterPress);
    }

    return () => {
      window.removeEventListener("keydown", handleEnterPress);
    };
  }, [isModalOpen, name, description]);

  const handleOk = async () => {
    try {
      const res = await UpdateOneCatogryAPI(isCategory, name, description);
      if (res && res.data.EC === 0) {
        api.success({
          message: "Notification",
          description: "Category updated successfully!",
          placement: "topRight",
        });
        FetchApiCategory();
        setIsModel(false);
      } else {
        api.error({
          message: "Notification",
          description: "Error updating category!",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      api.error({
        message: "Notification",
        description: "Error updating category!",
        placement: "topRight",
      });
    }
  };

  const handleCancel = () => {
    setIsModel(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Update Category"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Typography.Title level={5}>Name</Typography.Title>
        <Input
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Typography.Title level={5}>Description</Typography.Title>
        <Input
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Update;
