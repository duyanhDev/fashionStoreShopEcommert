import { useEffect, useState } from "react";
import { getListProductsAPI } from "../../service/ApiProduct";
import { addOneSize, getIdGuideSize } from "../../service/APISizeGuide";

// Enhanced Mock Ant Design components with better styling
const Card = ({ children, title, extra, size = "default", ...props }) => {
  const sizeClasses = {
    small: "p-4",
    default: "p-6",
    large: "p-8",
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
      {...props}
    >
      {(title || extra) && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          {title && (
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {title}
            </h3>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className={sizeClasses[size]}>{children}</div>
    </div>
  );
};

const Button = ({
  children,
  type = "default",
  size = "middle",
  icon,
  onClick,
  danger,
  disabled,
  className = "",
  loading,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]";

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    middle: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const typeClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
    default:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    dashed:
      "bg-white hover:bg-gray-50 text-gray-700 border border-dashed border-gray-300 shadow-sm",
    link: "bg-transparent hover:bg-blue-50 text-blue-600 hover:text-blue-700",
  };

  let classes = `${baseClasses} ${sizeClasses[size]} ${typeClasses[type]} ${className}`;

  if (danger) {
    classes = `${baseClasses} ${sizeClasses[size]} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 ${className}`;
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      ) : (
        icon && <span className="w-4 h-4">{icon}</span>
      )}
      {children}
    </button>
  );
};

const Select = ({ value, onChange, options, placeholder, style, ...props }) => (
  <select
    value={value}
    onChange={(e) => onChange && onChange(e.target.value)}
    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
    style={style}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options &&
      options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
  </select>
);

const Input = ({
  value,
  onChange,
  placeholder,
  addonBefore,
  suffix,
  ...props
}) => {
  const inputElement = (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
      {...props}
    />
  );

  if (addonBefore || suffix) {
    return (
      <div className="flex">
        {addonBefore && (
          <span className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-600 text-sm font-medium">
            {addonBefore}
          </span>
        )}
        <div className="relative flex-1">
          {React.cloneElement(inputElement, {
            className: `w-full px-4 py-3 border border-gray-200 ${
              addonBefore ? "rounded-r-lg rounded-l-none" : "rounded-lg"
            } focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300`,
          })}
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  return inputElement;
};

const InputNumber = ({
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  addonAfter,
  ...props
}) => (
  <div className="flex">
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const inputValue = e.target.value;
        // Cho phép số, dấu chấm, dấu trừ và chuỗi rỗng
        if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
          onChange && onChange(inputValue);
        }
      }}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border border-gray-200 ${
        addonAfter ? "rounded-l-lg rounded-r-none" : "rounded-lg"
      } focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300`}
      {...props}
    />
    {addonAfter && (
      <span className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-gray-600 text-sm font-medium">
        {addonAfter}
      </span>
    )}
  </div>
);

const Table = ({ columns, dataSource, rowKey, pagination = false, scroll }) => (
  <div
    className={`${
      scroll?.x ? "overflow-x-auto" : ""
    } rounded-lg border border-gray-100`}
  >
    <table className="min-w-full bg-white rounded-lg overflow-hidden">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          {columns.map((col, index) => (
            <th
              key={index}
              className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-100"
            >
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-50">
        {dataSource &&
          dataSource.map((record, index) => (
            <tr
              key={rowKey ? record[rowKey] : index}
              className="hover:bg-blue-50/50 transition-colors duration-150"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {col.render
                    ? col.render(record[col.dataIndex], record, index)
                    : record[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

const FormItem = ({ label, children, required }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-semibold text-gray-700">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </label>
    )}
    {children}
  </div>
);

const Row = ({ children, gutter = 16, justify, align, ...props }) => (
  <div
    className={`flex flex-wrap ${justify ? `justify-${justify}` : ""} ${
      align ? `items-${align}` : ""
    }`}
    style={{ marginLeft: -gutter / 2, marginRight: -gutter / 2 }}
    {...props}
  >
    {children}
  </div>
);

const Col = ({ children, span = 24, xs, sm, md, lg, xl, ...props }) => {
  const getColClass = () => {
    let classes = ["px-2"];

    // Mobile first approach
    if (span === 24) classes.push("w-full");
    else if (span === 12) classes.push("w-1/2");
    else if (span === 8) classes.push("w-1/3");
    else if (span === 6) classes.push("w-1/4");
    else classes.push(`w-${span}/24`);

    if (sm === 24) classes.push("sm:w-full");
    else if (sm === 12) classes.push("sm:w-1/2");
    else if (sm === 8) classes.push("sm:w-1/3");
    else if (sm === 6) classes.push("sm:w-1/4");
    else if (sm) classes.push(`sm:w-${sm}/24`);

    if (md === 24) classes.push("md:w-full");
    else if (md === 12) classes.push("md:w-1/2");
    else if (md === 8) classes.push("md:w-1/3");
    else if (md === 6) classes.push("md:w-1/4");
    else if (md) classes.push(`md:w-${md}/24`);

    if (lg === 24) classes.push("lg:w-full");
    else if (lg === 12) classes.push("lg:w-1/2");
    else if (lg === 8) classes.push("lg:w-1/3");
    else if (lg === 6) classes.push("lg:w-1/4");
    else if (lg) classes.push(`lg:w-${lg}/24`);

    if (xl === 24) classes.push("xl:w-full");
    else if (xl === 12) classes.push("xl:w-1/2");
    else if (xl === 8) classes.push("xl:w-1/3");
    else if (xl === 6) classes.push("xl:w-1/4");
    else if (xl) classes.push(`xl:w-${xl}/24`);

    return classes.join(" ");
  };

  return (
    <div className={getColClass()} {...props}>
      {children}
    </div>
  );
};

const Popconfirm = ({ title, onConfirm, children }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (window.confirm(title)) {
      onConfirm && onConfirm();
    }
  };

  return <span onClick={handleClick}>{children}</span>;
};

const Space = ({ children, size = "middle", direction = "horizontal" }) => {
  const sizeMap = { small: "gap-2", middle: "gap-3", large: "gap-4" };
  const directionClass = direction === "vertical" ? "flex-col" : "flex-row";

  return (
    <div className={`flex ${directionClass} ${sizeMap[size]}`}>{children}</div>
  );
};

const Spin = ({ spinning, children, tip }) => (
  <div className="relative">
    {spinning && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto"></div>
          {tip && (
            <p className="text-gray-600 mt-3 text-sm font-medium">{tip}</p>
          )}
        </div>
      </div>
    )}
    {children}
  </div>
);

const Empty = ({ description, children }) => (
  <div className="text-center py-12">
    <div className="text-gray-300 text-8xl mb-6">📋</div>
    <p className="text-gray-500 text-lg mb-4">
      {description || "Không có dữ liệu"}
    </p>
    {children}
  </div>
);

const Alert = ({ message, description, type = "info", showIcon, style }) => {
  const typeClasses = {
    success:
      "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800",
    info: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800",
    warning:
      "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800",
    error:
      "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800",
  };

  const iconMap = {
    success: "🎉",
    info: "💡",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={`border rounded-xl p-4 ${typeClasses[type]}`} style={style}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0 mr-3 text-lg">{iconMap[type]}</div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{message}</h4>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
      </div>
    </div>
  );
};

// Enhanced Icons
const PlusOutlined = () => <span className="text-lg">➕</span>;
const EditOutlined = () => <span className="text-lg">✏️</span>;
const DeleteOutlined = () => <span className="text-lg">🗑️</span>;
const SaveOutlined = () => <span className="text-lg">💾</span>;
const CloseOutlined = () => <span className="text-lg">❌</span>;
const TableOutlined = () => <span className="text-lg">📊</span>;

const SizeManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sizeData, setSizeData] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [isCheckEdit, setisCheckEdit] = useState(false);
  const fetchProductsdata = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        const data = res.data?.data.filter((item) => {
          return item.category.name === "Áo";
        });

        setProducts(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProductsdata();
  }, []);
  const handleChangeProduct = (productId) => {
    setSelectedProductId(productId);
    setLoading(true);

    setTimeout(async () => {
      if (productId) {
        const res = await getIdGuideSize(productId);
        console.log(res);

        if (res && res.data && res.data.EC === 0) {
          if (!res.data.data || !res.data.data.sizes) {
            setSizeData({ productId, sizes: [], note: "" });
          } else {
            setSizeData(res.data.data); // Sử dụng data từ API
          }
        }
      } else {
        setSizeData({ productId, sizes: [], note: "" });
      }
      setLoading(false);
      setEditingIndex(-1);
    }, 800);
  };

  const handleAddSize = () => {
    if (!sizeData) return;

    const newSize = {
      size: "",
      heightRange: "",
      weightRange: "",
      shirtLength: "",
      shoulderWidth: "",
      chestWidth: "",
      sleeveLength: "",
      bicepWidth: "",
    };

    setSizeData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSize],
    }));

    console.log(newSize);

    setEditingIndex(sizeData.sizes.length);
  };

  const handleDeleteSize = (index) => {
    if (!sizeData) return;

    setSizeData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
    setEditingIndex(-1);
  };

  const handleEditSize = (index) => {
    setEditingIndex(index);
    setisCheckEdit(true);
  };

  const handleSaveSize = async (index) => {
    setEditingIndex(-1);
    if (isCheckEdit) {
      console.log("xx");
    } else {
      console.log("Saved size data:", sizeData.sizes[index]);

      const size = sizeData.sizes[index];
      const note = sizeData.note;
      const res = await addOneSize(selectedProductId, size, note);

      if (res && res.data && res.data.EC === 0) {
        confirm("Thêm thành công");
      }
    }
  };
  console.log(editingIndex);

  const handleCancelEdit = () => {
    setEditingIndex(-1);
  };

  const handleInputChange = (index, field, value) => {
    if (!sizeData) return;

    setSizeData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      ),
    }));
  };

  const handleNoteChange = (e) => {
    setSizeData((prev) => ({
      ...prev,
      note: e.target.value,
    }));
  };

  const tableColumns = [
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (text) => (
        <strong className="text-blue-600 font-bold text-base">{text}</strong>
      ),
    },
    {
      title: "Chiều cao",
      dataIndex: "heightRange",
      key: "heightRange",
    },
    {
      title: "Cân nặng",
      dataIndex: "weightRange",
      key: "weightRange",
    },
    {
      title: "Dài áo (cm)",
      dataIndex: "shirtLength",
      key: "shirtLength",
    },
    {
      title: "Rộng vai (cm)",
      dataIndex: "shoulderWidth",
      key: "shoulderWidth",
    },
    {
      title: "Vòng ngực (cm)",
      dataIndex: "chestWidth",
      key: "chestWidth",
    },
    {
      title: "Dài tay (cm)",
      dataIndex: "sleeveLength",
      key: "sleeveLength",
    },
    {
      title: "Bắp tay (cm)",
      dataIndex: "bicepWidth",
      key: "bicepWidth",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record, index) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setViewMode("form");
              handleEditSize(index);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa size này?"
            onConfirm={() => handleDeleteSize(index)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderFormInput = (
    value,
    onChange,
    placeholder,
    isEditing,
    type = "text"
  ) => {
    if (!isEditing) {
      return (
        <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-gray-800 font-medium">{value || "-"}</span>
        </div>
      );
    }

    if (type === "number") {
      return (
        <InputNumber
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          addonAfter="cm"
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-6 max-w-7xl mx-auto">
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📏</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Quản lý bảng size sản phẩm
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Tạo và quản lý thông tin size cho từng sản phẩm
                </p>
              </div>
            </div>
          }
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Product Selection */}
            <Card size="small">
              <Row gutter={24} align="middle">
                <Col span={24} md={12}>
                  <FormItem label="Chọn sản phẩm" required>
                    <Select
                      value={selectedProductId}
                      onChange={handleChangeProduct}
                      placeholder="🔍 Tìm kiếm và chọn sản phẩm..."
                      options={products.map((product) => ({
                        value: product._id,
                        label: `🛍️ ${product.name}`,
                      }))}
                    />
                  </FormItem>
                </Col>

                {sizeData && (
                  <Col span={24} md={12}>
                    <FormItem label="Chế độ xem">
                      <Space>
                        <Button
                          type={viewMode === "table" ? "primary" : "default"}
                          icon={<TableOutlined />}
                          onClick={() => setViewMode("table")}
                        >
                          📊 Bảng
                        </Button>
                        <Button
                          type={viewMode === "form" ? "primary" : "default"}
                          icon={<EditOutlined />}
                          onClick={() => setViewMode("form")}
                        >
                          📝 Form
                        </Button>
                      </Space>
                    </FormItem>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Main Content */}
            <Spin spinning={loading} tip="🔄 Đang tải dữ liệu size...">
              {sizeData && (
                <div>
                  {/* Action Buttons */}
                  {viewMode === "form" && (
                    <Card size="small">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSize}
                        size="large"
                      >
                        ➕ Thêm size mới
                      </Button>
                    </Card>
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <Card title="📊 Bảng size chi tiết">
                      {sizeData.sizes.length > 0 ? (
                        <Table
                          columns={tableColumns}
                          dataSource={sizeData.sizes}
                          rowKey="size"
                          scroll={{ x: 1200 }}
                        />
                      ) : (
                        <Empty description="📭 Chưa có size nào. Chuyển sang chế độ Form để thêm size mới." />
                      )}
                    </Card>
                  )}

                  {/* Form View */}
                  {viewMode === "form" && (
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {sizeData.sizes.map((size, index) => {
                        const isEditing = editingIndex === index;

                        return (
                          <Card
                            key={index}
                            title={
                              <div className="flex items-center gap-2">
                                <span className="text-lg">👕</span>
                                <span>
                                  Size:{" "}
                                  <strong className="text-blue-600">
                                    {size.size || "Chưa đặt tên"}
                                  </strong>
                                </span>
                              </div>
                            }
                            extra={
                              <Space>
                                {isEditing ? (
                                  <>
                                    <Button
                                      type="primary"
                                      icon={<SaveOutlined />}
                                      onClick={() => handleSaveSize(index)}
                                    >
                                      💾 Lưu
                                    </Button>
                                    <Button onClick={handleCancelEdit}>
                                      ❌ Hủy
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      type="default"
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditSize(index)}
                                    >
                                      ✏️ Sửa
                                    </Button>
                                    <Popconfirm
                                      title="⚠️ Bạn có chắc chắn muốn xóa size này?"
                                      onConfirm={() => handleDeleteSize(index)}
                                    >
                                      <Button danger icon={<DeleteOutlined />}>
                                        🗑️ Xóa
                                      </Button>
                                    </Popconfirm>
                                  </>
                                )}
                              </Space>
                            }
                          >
                            <Row gutter={[24, 16]}>
                              <Col span={24} sm={12} md={6}>
                                <FormItem label="🏷️ Size" required>
                                  {renderFormInput(
                                    size.size,
                                    (value) =>
                                      handleInputChange(index, "size", value),
                                    "VD: M, L, XL...",
                                    isEditing
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="📏 Chiều cao">
                                  {renderFormInput(
                                    size.heightRange,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "heightRange",
                                        value
                                      ),
                                    "VD: 1m60 - 1m65",
                                    isEditing
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="⚖️ Cân nặng">
                                  {renderFormInput(
                                    size.weightRange,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "weightRange",
                                        value
                                      ),
                                    "VD: 55kg - 60kg",
                                    isEditing
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="📐 Dài áo">
                                  {renderFormInput(
                                    size.shirtLength,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "shirtLength",
                                        value
                                      ),
                                    "VD: 67",
                                    isEditing,
                                    "number"
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="👐 Rộng vai">
                                  {renderFormInput(
                                    size.shoulderWidth,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "shoulderWidth",
                                        value
                                      ),
                                    "VD: 43",
                                    isEditing,
                                    "number"
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="🫸 Vòng ngực">
                                  {renderFormInput(
                                    size.chestWidth,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "chestWidth",
                                        value
                                      ),
                                    "VD: 49",
                                    isEditing,
                                    "number"
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="🦾 Dài tay">
                                  {renderFormInput(
                                    size.sleeveLength,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "sleeveLength",
                                        value
                                      ),
                                    "VD: 20.5",
                                    isEditing,
                                    "number"
                                  )}
                                </FormItem>
                              </Col>

                              <Col span={24} sm={12} md={6}>
                                <FormItem label="💪 Bắp tay">
                                  {renderFormInput(
                                    size.bicepWidth,
                                    (value) =>
                                      handleInputChange(
                                        index,
                                        "bicepWidth",
                                        value
                                      ),
                                    "VD: 15.5",
                                    isEditing,
                                    "number"
                                  )}
                                </FormItem>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}

                      {sizeData.sizes.length === 0 && (
                        <Card>
                          <Empty description="📭 Chưa có size nào được thêm">
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={handleAddSize}
                              size="large"
                            >
                              ➕ Thêm size đầu tiên
                            </Button>
                          </Empty>
                        </Card>
                      )}

                      {/* Note section */}
                      {sizeData.sizes.length > 0 && (
                        <Card title="📝 Ghi chú hướng dẫn" size="small">
                          <Alert
                            message="💡 Mẹo hữu ích"
                            description="Hãy thêm ghi chú chi tiết để giúp khách hàng chọn size phù hợp nhất. Điều này sẽ giảm thiểu việc đổi trả hàng."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                          <textarea
                            value={sizeData.note}
                            onChange={handleNoteChange}
                            placeholder="💬 Nhập ghi chú hướng dẫn chọn size cho khách hàng..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                          />
                        </Card>
                      )}
                    </Space>
                  )}
                </div>
              )}

              {!selectedProductId && !loading && (
                <Card>
                  <Empty description="🛍️ Vui lòng chọn một sản phẩm để bắt đầu quản lý bảng size">
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        🚀 Hướng dẫn sử dụng:
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Chọn sản phẩm từ danh sách dropdown</li>
                        <li>• Thêm các size với thông tin chi tiết</li>
                        <li>• Chuyển đổi giữa chế độ Bảng và Form</li>
                        <li>• Thêm ghi chú hướng dẫn cho khách hàng</li>
                      </ul>
                    </div>
                  </Empty>
                </Card>
              )}
            </Spin>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default SizeManager;
