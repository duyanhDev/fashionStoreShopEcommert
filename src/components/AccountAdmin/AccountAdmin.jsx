import { useEffect, useState } from "react";
import { DeleteUserAPI, UserAuth } from "../../service/Auth";
import { Avatar, Button, Flex, notification, Table } from "antd";
import Search from "antd/es/input/Search";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:9000"); // URL server của bạn
const AccountAdmin = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Dữ liệu gốc
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const fetchAPIUser = async () => {
    try {
      let res = await UserAuth();

      if (res && res.data && res.data.EC === 0) {
        setOriginalData(res.data.data); // lưu bản gốc
        setData(res.data.data); // bản hiển thị (có thể lọc)
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAPIUser();
  }, []);

  useEffect(() => {
    socket.on("userDeleted", ({ userId }) => {
      // Gọi hàm fetch lại danh sách hoặc cập nhật UI
      fetchAPIUser(); // giả sử đây là hàm bạn viết để lấy lại danh sách user
    });

    return () => {
      socket.off("userDeleted");
    };
  }, []);

  const columns = [
    { title: "STT", dataIndex: "key" },
    { title: "Tài khoản khách hàng", dataIndex: "email" },
    { title: "Tên khách hàng", dataIndex: "name" },
    { title: "Avatar", dataIndex: "avatar" },
    { title: "Giới tính", dataIndex: "gender" },
    { title: "Quyền hạn", dataIndex: "role" },
    { title: "Số tiền đã mua sắm", dataIndex: "totalPrice" },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_, record) => (
        <Flex gap="middle">
          <EyeOutlined
            style={{ fontSize: 18, cursor: "pointer" }}
            onClick={() => handleAdd(record)}
          />
          <EditOutlined
            style={{ fontSize: 18, cursor: "pointer" }}
            onClick={() => handleEdit(record)}
          />
          <DeleteOutlined
            style={{ fontSize: 18, cursor: "pointer" }}
            onClick={() => handleDelete(record)}
          />
        </Flex>
      ),
    },
  ];

  const handleEdit = (record) => {
    navigate(`/admin/usercustom/${record.id}`);
  };

  const handleDelete = async (record) => {
    try {
      const res = await DeleteUserAPI(record.id);

      if (res && res.data.EC === 0) {
        api["success"]({
          message: "Xóa tài khoản",
          description: res.data.message,
        });
      }
    } catch (error) {
      api["error"]({
        message: "Xóa tài khoản",
        description: "Có lỗi xảy ra khi xóa tài khoản",
      });
    }
  };

  const handleAdd = (record) => {
    // Ví dụ: thêm mới đơn hàng hoặc thao tác liên quan
  };

  const dataUserCustom =
    data &&
    data.length > 0 &&
    data.filter((users) => users.role === "admin" || users.role === "staff");

  const dataSource =
    dataUserCustom &&
    dataUserCustom.length > 0 &&
    dataUserCustom.map((user, index) => {
      return {
        key: index + 1,
        email: user.email,
        name: user.name,
        avatar: (
          <img
            width={60}
            height={60}
            src={user.avatar ? user.avatar : <Avatar />}
            alt="avatar"
          />
        ),
        id: user._id,
        gender: user.gender,
        role: user.role,
        totalPrice: formatPrice(user.totalPrice),
      };
    });

  const start = () => {
    setLoading(true);
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const onSearch = (value) => {
    if (!value) {
      setData(originalData); // reset nếu không có giá trị
    } else {
      const results = originalData.filter(
        (item) =>
          item.name?.toLowerCase().includes(value.toLowerCase()) ||
          item.email?.toLowerCase().includes(value.toLowerCase())
      );
      setData(results);
    }
  };

  return (
    <div className="w-full">
      {contextHolder}
      <Flex gap="middle" vertical>
        <Flex align="center" gap="middle">
          <Button
            type="primary"
            onClick={start}
            disabled={!hasSelected}
            loading={loading}
          >
            Reload
          </Button>

          {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}

          <Search
            placeholder="Tìm kiếm tên khách hàng"
            allowClear
            onSearch={onSearch}
            style={{ width: 200 }}
          />
        </Flex>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
        />
      </Flex>
    </div>
  );
};

export default AccountAdmin;
