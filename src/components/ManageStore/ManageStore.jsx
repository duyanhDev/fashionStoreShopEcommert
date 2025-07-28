import {
  Button,
  Space,
  Table,
  Card,
  Typography,
  Row,
  Col,
  Input,
  Tooltip,
  Popconfirm,
  message,
  Tag,
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import { deleteSupplierAPI, FindAllSupplierAPI } from "../../service/Supplier";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DeleteFilled,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  HomeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./ManageStore.css";
import AddManageStore from "./Add-ManageStore/Add-ManageStore";
import UpdateSupplierForm from "./Update-ManageStore/UpdateSupplierForm";
import ViewSupplierForm from "./ViewSupplierForm/ViewSupplierForm";
const { Title, Text } = Typography;
const { Search } = Input;

const ManageStore = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openResponsive, setOpenResponsive] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1890ff", marginBottom: 2 }}>
            {text}
          </div>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            {record.contactPerson}
          </Text>
        </div>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.contactPerson.toLowerCase().includes(value.toLowerCase()) ||
        record.email.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div
            style={{ marginBottom: 4, display: "flex", alignItems: "center" }}
          >
            <PhoneOutlined style={{ color: "#52c41a", marginRight: 6 }} />
            <Text>{record.phone}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MailOutlined style={{ color: "#1890ff", marginRight: 6 }} />
            <Text style={{ color: "#1890ff" }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <HomeOutlined
              style={{ color: "#fa8c16", marginRight: 6, marginTop: 2 }}
            />
            <Text
              style={{
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {text}
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Thông tin khác",
      key: "other",
      width: 200,
      render: (_, record) => (
        <div>
          {record.website && (
            <div style={{ marginBottom: 4 }}>
              <GlobalOutlined style={{ color: "#722ed1", marginRight: 6 }} />
              <a
                href={record.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "12px" }}
              >
                Website
              </a>
            </div>
          )}
          {record.taxCode && (
            <Tag color="blue" size="small">
              {record.taxCode}
            </Tag>
          )}
        </div>
      ),
    },
    // {
    //   title: "Ghi chú",
    //   dataIndex: "notes",
    //   key: "notes",
    //   width: 200,
    //   render: (text) => (
    //     <Text
    //       style={{
    //         fontSize: "12px",
    //         color: "#666",
    //         display: "-webkit-box",
    //         WebkitLineClamp: 2,
    //         WebkitBoxOrient: "vertical",
    //         overflow: "hidden",
    //       }}
    //     >
    //       {text}
    //     </Text>
    //   ),
    // },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => new Date(a.createdAtRaw) - new Date(b.createdAtRaw),
      render: (text) => (
        <Text style={{ fontSize: "12px", color: "#666" }}>{text}</Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa nhà cung cấp?"
              description="Hành động này không thể hoàn tác"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                style={{ color: "#ff4d4f" }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Event handlers
  const handleView = (record) => {
    setSelectedSupplierId(record.key);
    setOpenView(true);
  };

  const handleEdit = (record) => {
    setSelectedSupplierId(record.key);
    setOpenUpdate(true);
  };

  const handleDelete = async (record) => {
    try {
      const res = await deleteSupplierAPI(record.key);
      if (res && res.data && res.data.EC === 0) {
        message.success(`Đã xóa: ${record.name}`);
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSupplier = () => {
    setOpenResponsive(true);
  };

  const handleDeleteAll = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Chọn ít nhất một nhà cung cấp để xóa");
      return;
    }
    console.log("Delete selected suppliers:", selectedRowKeys);
    message.success(`Đã xóa ${selectedRowKeys.length} nhà cung cấp`);
    setSelectedRowKeys([]);
  };

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, searchText);
    message.success("Đã làm mới dữ liệu");
  };

  // Fetch data from api với pagination
  const fetchData = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      // Nếu API hỗ trợ pagination từ server
      const params = {
        page: page,
        limit: pageSize,
        search: search,
      };

      const res = await FindAllSupplierAPI(params);
      if (res && res.data && res.data.EC === 0) {
        setData(res.data.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: pageSize,
          total: res.data.total || res.data.data.length,
        }));
      }
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, searchText);
  }, []);

  // Handle pagination change
  const handleTableChange = (paginationConfig, filters, sorter) => {
    const { current, pageSize } = paginationConfig;

    // Reset selection khi chuyển trang
    setSelectedRowKeys([]);

    // Fetch data với params mới
    fetchData(current, pageSize, searchText);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    // Reset về trang 1 khi search
    fetchData(1, pagination.pageSize, value);
  };

  const dataSource =
    data && data.length > 0
      ? data.map((supplier) => ({
          key: supplier._id,
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          website: supplier.website,
          taxCode: supplier.taxCode,
          notes: supplier.notes,
          createdAt: new Date(supplier.createdAt).toLocaleDateString("vi-VN"),
          createdAtRaw: supplier.createdAt,
        }))
      : [];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#262626" }}>
          Quản lý nhà cung cấp
        </Title>
        <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>
          Quản lý thông tin các nhà cung cấp và đối tác
        </Text>
      </div>

      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        {/* Toolbar */}
        <div style={{ marginBottom: "16px" }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={8}>
              <Search
                placeholder="Tìm kiếm nhà cung cấp..."
                allowClear
                enterButton
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleSearch("");
                  }
                }}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={16} md={16}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddSupplier}
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                  }}
                >
                  Thêm đối tác
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm
                    title="Xóa các nhà cung cấp đã chọn?"
                    description={`Sẽ xóa ${selectedRowKeys.length} nhà cung cấp`}
                    onConfirm={handleDeleteAll}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                  >
                    <Button danger icon={<DeleteFilled />}>
                      Xóa ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Stats */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Text style={{ color: "#666", marginRight: "16px" }}>
              Tổng cộng: <strong>{pagination.total}</strong> nhà cung cấp
            </Text>
            <Text style={{ color: "#666", fontSize: "12px" }}>
              (Trang {pagination.current} /{" "}
              {Math.ceil(pagination.total / pagination.pageSize)} - Hiển thị{" "}
              {pagination.pageSize} mục/trang)
            </Text>
          </div>
          {selectedRowKeys.length > 0 && (
            <Tag color="blue">Đã chọn: {selectedRowKeys.length}</Tag>
          )}
        </div>

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
            pageSizeOptions: ["10", "20", "50", "100"],
            onShowSizeChange: (current, size) => {
              // Khi thay đổi số items per page
              fetchData(1, size, searchText); // Reset về trang 1
            },
          }}
          onChange={handleTableChange}
          size="middle"
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <AddManageStore
        openResponsive={openResponsive}
        setOpenResponsive={setOpenResponsive}
        fetchData={fetchData}
      />

      <UpdateSupplierForm
        openUpdate={openUpdate}
        setOpenUpdate={setOpenUpdate}
        id={selectedSupplierId}
        fetchData={fetchData}
      />
      <ViewSupplierForm
        openView={openView}
        setOpenView={setOpenView}
        id={selectedSupplierId}
        fetchData={fetchData}
      />
    </div>
  );
};

export default ManageStore;
