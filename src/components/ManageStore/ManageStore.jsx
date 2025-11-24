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
  Statistic,
  Modal,
  List,
  Avatar,
  Badge,
} from "antd";
import { useEffect, useState } from "react";
import { deleteSupplierAPI, FindAllSupplierAPI } from "../../service/Supplier";
import axios from "axios";
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
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import "./ManageStore.css";
import AddManageStore from "./Add-ManageStore/Add-ManageStore";
import UpdateSupplierForm from "./Update-ManageStore/UpdateSupplierForm";
import ViewSupplierForm from "./ViewSupplierForm/ViewSupplierForm";
import { getListProductsAPI } from "../../service/ApiProduct";

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
  const [products, setProducts] = useState([]);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedSupplierStats, setSelectedSupplierStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        setProducts(res.data.data || res.data);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  // Tính toán thống kê cho từng nhà cung cấp
  const calculateSupplierStats = (supplierId) => {
    const supplierProducts = products.filter(
      (p) => p.supplierId?.$oid === supplierId || p.supplierId === supplierId
    );

    const totalCost = supplierProducts.reduce((sum, product) => {
      const stock = product.stock || 0;
      const costPrice = product.costPrice || 0;
      return sum + stock * costPrice;
    }, 0);

    const totalProducts = supplierProducts.length;
    const totalStock = supplierProducts.reduce(
      (sum, p) => sum + (p.stock || 0),
      0
    );

    return {
      totalCost,
      totalProducts,
      totalStock,
      products: supplierProducts,
    };
  };

  // Hiển thị modal thống kê chi tiết
  const showSupplierStats = (record) => {
    const stats = calculateSupplierStats(record.key);
    setSelectedSupplierStats({
      ...record,
      ...stats,
    });
    setStatsModalVisible(true);
  };

  const columns = [
    {
      title: (
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Nhà cung cấp</span>
      ),
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#2e7d32", marginBottom: 2 }}>
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
      title: <span style={{ color: "#ffffff", fontWeight: 600 }}>Liên hệ</span>,
      key: "contact",
      width: 180,
      render: (_, record) => (
        <div>
          <div
            style={{ marginBottom: 4, display: "flex", alignItems: "center" }}
          >
            <PhoneOutlined style={{ color: "#2e7d32", marginRight: 6 }} />
            <Text>{record.phone}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <MailOutlined style={{ color: "#43a047", marginRight: 6 }} />
            <Text style={{ color: "#2e7d32", fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "#ffffff", fontWeight: 600 }}>
          Thống kê nhập hàng
        </span>
      ),
      key: "stats",
      width: 220,
      render: (_, record) => {
        const stats = calculateSupplierStats(record.key);
        return (
          <div>
            <div style={{ marginBottom: 6 }}>
              <Tag
                color="green"
                icon={<DollarOutlined />}
                style={{ fontWeight: 600 }}
              >
                {stats.totalCost.toLocaleString("vi-VN")} đ
              </Tag>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              <ShoppingOutlined style={{ marginRight: 4, color: "#2e7d32" }} />
              {stats.totalProducts} sản phẩm · {stats.totalStock} tồn kho
            </div>
          </div>
        );
      },
    },
    {
      title: <span style={{ color: "#ffffff", fontWeight: 600 }}>Địa chỉ</span>,
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <HomeOutlined
              style={{ color: "#2e7d32", marginRight: 6, marginTop: 2 }}
            />
            <Text
              style={{
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "12px",
              }}
            >
              {text}
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: (
        <span style={{ color: "#ffffff", fontWeight: 600 }}>
          Thông tin khác
        </span>
      ),
      key: "other",
      width: 150,
      render: (_, record) => (
        <div>
          {record.website && (
            <div style={{ marginBottom: 4 }}>
              <GlobalOutlined style={{ color: "#2e7d32", marginRight: 6 }} />
              <a
                href={record.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "12px", color: "#43a047" }}
              >
                Website
              </a>
            </div>
          )}
          {record.taxCode && (
            <Tag color="green" size="small">
              {record.taxCode}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Thao tác</span>
      ),
      key: "action",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chi tiết thống kê">
            <Button
              type="text"
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => showSupplierStats(record)}
              style={{ color: "#2e7d32" }}
            />
          </Tooltip>
          <Tooltip title="Xem">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: "#43a047" }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#66bb6a" }}
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
    message.success(`Đã xóa ${selectedRowKeys.length} nhà cung cấp`);
    setSelectedRowKeys([]);
  };

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, searchText);
    fetchProducts();
    message.success("Đã làm mới dữ liệu");
  };

  const fetchData = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
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
    fetchProducts();
  }, []);

  const handleTableChange = (paginationConfig, filters, sorter) => {
    const { current, pageSize } = paginationConfig;
    setSelectedRowKeys([]);
    fetchData(current, pageSize, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
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

  // Tính tổng thống kê
  const totalStats = dataSource.reduce(
    (acc, supplier) => {
      const stats = calculateSupplierStats(supplier.key);
      acc.totalCost += stats.totalCost;
      acc.totalProducts += stats.totalProducts;
      acc.totalStock += stats.totalStock;
      return acc;
    },
    { totalCost: 0, totalProducts: 0, totalStock: 0 }
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0f9f4 0%, #e8f5e9 100%)",
        minHeight: "100vh",
        width: "100%",
        padding: "24px 16px",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
          borderRadius: "16px",
          padding: "32px 24px",
          marginBottom: "24px",
          boxShadow: "0 8px 24px rgba(46, 125, 50, 0.2)",
        }}
      >
        <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
          🏪 Quản lý nhà cung cấp
        </Title>
        <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
          Quản lý thông tin các nhà cung cấp và thống kê nhập hàng
        </Text>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%)",
              border: "2px solid #a5d6a7",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.1)",
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                  Tổng giá trị nhập hàng
                </span>
              }
              value={totalStats.totalCost}
              prefix={<DollarOutlined style={{ color: "#2e7d32" }} />}
              suffix="đ"
              valueStyle={{
                color: "#1b5e20",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%)",
              border: "2px solid #a5d6a7",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.1)",
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                  Tổng số sản phẩm
                </span>
              }
              value={totalStats.totalProducts}
              prefix={<ShoppingOutlined style={{ color: "#2e7d32" }} />}
              valueStyle={{
                color: "#1b5e20",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%)",
              border: "2px solid #a5d6a7",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.1)",
            }}
            hoverable
          >
            <Statistic
              title={
                <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                  Tổng tồn kho
                </span>
              }
              value={totalStats.totalStock}
              prefix={<BarChartOutlined style={{ color: "#2e7d32" }} />}
              valueStyle={{
                color: "#1b5e20",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "2px solid #c8e6c9",
          background: "#ffffff",
        }}
      >
        <div style={{ marginTop: "30px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={10} lg={8}>
              <Search
                placeholder="🔍 Tìm kiếm nhà cung cấp..."
                allowClear
                enterButton
                size="large"
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleSearch("");
                  }
                }}
                style={{
                  width: "100%",
                }}
                className="custom-search-green"
              />
            </Col>
            <Col xs={24} sm={24} md={14} lg={16}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  size="large"
                  style={{
                    borderColor: "#4caf50",
                    color: "#2e7d32",
                    borderRadius: "8px",
                  }}
                  className="btn-green-outline"
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddSupplier}
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
                    borderColor: "#2e7d32",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                  className="btn-green-primary"
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
                    <Button
                      danger
                      icon={<DeleteFilled />}
                      size="large"
                      style={{ borderRadius: "8px", fontWeight: 600 }}
                    >
                      Xóa ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: "20px 0", borderColor: "#c8e6c9" }} />

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <Text
              style={{ color: "#2e7d32", marginRight: "16px", fontWeight: 600 }}
            >
              Tổng cộng:{" "}
              <strong style={{ color: "#1b5e20" }}>{pagination.total}</strong>{" "}
              nhà cung cấp
            </Text>
            <Text style={{ color: "#666", fontSize: "12px" }}>
              (Trang {pagination.current} /{" "}
              {Math.ceil(pagination.total / pagination.pageSize)} - Hiển thị{" "}
              {pagination.pageSize} mục/trang)
            </Text>
          </div>
          {selectedRowKeys.length > 0 && (
            <Tag
              color="green"
              style={{ padding: "4px 12px", fontSize: "14px" }}
            >
              ✓ Đã chọn: {selectedRowKeys.length}
            </Tag>
          )}
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
            pageSizeOptions: ["10", "20", "50", "100"],
            onShowSizeChange: (current, size) => {
              fetchData(1, size, searchText);
            },
          }}
          onChange={handleTableChange}
          size="middle"
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light-green" : "table-row-dark-green"
          }
          className="green-theme-table"
        />
      </Card>

      {/* Modal thống kê chi tiết */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <BarChartOutlined
              style={{
                marginRight: 8,
                color: "#2e7d32",
                fontSize: "20px",
              }}
            />
            <span style={{ color: "#1b5e20", fontWeight: 600 }}>
              Thống kê chi tiết - {selectedSupplierStats?.name}
            </span>
          </div>
        }
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {selectedSupplierStats && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    border: "2px solid #81c784",
                    borderRadius: "12px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                        Tổng giá trị nhập
                      </span>
                    }
                    value={selectedSupplierStats.totalCost}
                    prefix="₫"
                    valueStyle={{
                      color: "#1b5e20",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    border: "2px solid #81c784",
                    borderRadius: "12px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                        Số sản phẩm
                      </span>
                    }
                    value={selectedSupplierStats.totalProducts}
                    valueStyle={{
                      color: "#1b5e20",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  style={{
                    background:
                      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    border: "2px solid #81c784",
                    borderRadius: "12px",
                  }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                        Tồn kho
                      </span>
                    }
                    value={selectedSupplierStats.totalStock}
                    valueStyle={{
                      color: "#1b5e20",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ borderColor: "#c8e6c9" }}>
              <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                📦 Danh sách sản phẩm
              </span>
            </Divider>

            <List
              itemLayout="horizontal"
              dataSource={selectedSupplierStats.products}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Text
                      key="stock"
                      style={{ color: "#2e7d32", fontWeight: 600 }}
                    >
                      Tồn: <strong>{item.stock}</strong>
                    </Text>,
                    <Text
                      key="cost"
                      style={{ color: "#1b5e20", fontWeight: 600 }}
                    >
                      {(item.costPrice * item.stock).toLocaleString("vi-VN")} đ
                    </Text>,
                  ]}
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "8px",
                    background: "#f1f8f4",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        count={item.stock}
                        showZero
                        style={{ backgroundColor: "#2e7d32" }}
                      >
                        <Avatar
                          src={
                            item.variants?.[0]?.images?.[0]?.url ||
                            "https://via.placeholder.com/40"
                          }
                          size={50}
                          shape="square"
                          style={{ border: "2px solid #c8e6c9" }}
                        />
                      </Badge>
                    }
                    title={
                      <div>
                        <span style={{ color: "#1b5e20", fontWeight: 600 }}>
                          {item.name}
                        </span>
                        <Tag
                          color="green"
                          size="small"
                          style={{ marginLeft: 8 }}
                        >
                          {item.brand}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Giá nhập: {item.costPrice?.toLocaleString("vi-VN")} đ
                          · Đã bán: {item.sold || 0}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "0 4px",
              }}
            />
          </div>
        )}
      </Modal>

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
