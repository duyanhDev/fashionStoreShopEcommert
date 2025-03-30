import { Button, Modal, Typography, Input, message } from "antd";
import { AddCategoryAPI } from "../../../service/ApiCategory";

const AddCategory = ({
  open,
  setOpen,
  handleCancel,
  name,
  setName,
  description,
  setDescription,
  FetchApiCategory,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  console.log(name, description);

  const handleOk = async () => {
    try {
      const res = await AddCategoryAPI(name, description);
      if (res) {
        const key = "updatable";

        // Display loading message and success notification
        messageApi.open({
          key,
          type: "loading",
          content: "Loading...",
        });
        setTimeout(() => {
          messageApi.open({
            key,
            type: "success",
            content: "Category added successfully!",
            duration: 2,
          });
        }, 1000);

        setName("");
        setDescription("");

        setOpen(false);
        FetchApiCategory();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      messageApi.error("Failed to add category.");
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        title="Add Category"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="custom" onClick={() => console.log("Custom action")}>
            Custom Button
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
        ]}
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

export default AddCategory;
