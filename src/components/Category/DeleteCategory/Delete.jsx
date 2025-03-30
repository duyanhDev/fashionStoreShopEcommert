import { Input, Modal, Typography, notification } from "antd";
import { DeleteOneCategoryAPI } from "../../../service/ApiCategory";

const Delete = ({
  isModalOpen,
  setIsModel,
  name,
  isCategory,
  FetchApiCategory,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const handleOk = async () => {
    try {
      const res = await DeleteOneCategoryAPI(isCategory);
      if (res && res.data && res.data.EC === 0) {
        api.success({
          message: "Notification",
          description: "Delete updated successfully!",
          placement: "topRight",
        });
        FetchApiCategory();
        setIsModel(false);
      }
    } catch (error) {}
  };
  const handleCancel = () => {
    setIsModel(false);
  };
  return (
    <>
      {contextHolder}
      <Modal
        title="Delete Category"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Delete"
        cancelText="Dismiss"
      >
        <Typography.Title level={5}>Name</Typography.Title>
        <Input maxLength={200} value={name} disabled />
      </Modal>
    </>
  );
};

export default Delete;
