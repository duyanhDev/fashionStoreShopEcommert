import { useEffect, useState } from "react";
import { getListProductsAPI } from "../../service/ApiProduct";
import {
  addOnePantsSize,
  deleteOnePantsSize,
  getIdGuidePantsSize,
  updateOnePantsSize,
} from "../../service/APIPantsSize";

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
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
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
      "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25",
    default:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    dashed:
      "bg-white hover:bg-gray-50 text-gray-700 border border-dashed border-gray-300 shadow-sm",
    link: "bg-transparent hover:bg-purple-50 text-purple-600 hover:text-purple-700",
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

const Input = ({
  value,
  onChange,
  placeholder,
  addonBefore,
  suffix,
  ...props
}) => {
  if (addonBefore || suffix) {
    return (
      <div className="flex">
        {addonBefore && (
          <span className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-600 text-sm font-medium">
            {addonBefore}
          </span>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(e)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-gray-200 ${
              addonBefore ? "rounded-r-lg rounded-l-none" : "rounded-lg"
            } focus:outline-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-300`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-300"
      {...props}
    />
  );
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
        if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
          onChange && onChange(inputValue);
        }
      }}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border border-gray-200 ${
        addonAfter ? "rounded-l-lg rounded-r-none" : "rounded-lg"
      } focus:outline-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-300`}
      {...props}
    />
    {addonAfter && (
      <span className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-gray-600 text-sm font-medium">
        {addonAfter}
      </span>
    )}
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

const Popconfirm = ({ title, onConfirm, children }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (window.confirm(title)) {
      onConfirm && onConfirm();
    }
  };

  return <span onClick={handleClick}>{children}</span>;
};

const Spin = ({ spinning, children, tip }) => (
  <div className="relative">
    {spinning && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-500 border-t-transparent mx-auto"></div>
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
    info: "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-800",
    warning:
      "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800",
    error:
      "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800",
  };

  const iconMap = {
    success: "✅",
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
const SearchOutlined = () => <span className="text-lg">🔍</span>;

const PantsSizeManager = () => {
  const [products, setProducts] = useState([]);
  const [productSizeStatus, setProductSizeStatus] = useState({});
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sizeData, setSizeData] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isCheckEdit, setisCheckEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProductsdata = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        const data = res.data?.data.filter((item) => {
          return item.category.name === "Quần"; // Filter for pants
        });
        setProducts(data);

        // Check size status for each product in parallel
        checkProductSizeStatus(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkProductSizeStatus = async (productList) => {
    // Fetch all size data in parallel instead of sequentially
    const sizeStatusPromises = productList.map(async (product) => {
      try {
        const res = await getIdGuidePantsSize(product._id);
        return {
          id: product._id,
          status: {
            hasSize:
              res &&
              res.data &&
              res.data.EC === 0 &&
              res.data.data &&
              res.data.data.sizes &&
              res.data.data.sizes.length > 0,
            sizeCount:
              res &&
              res.data &&
              res.data.EC === 0 &&
              res.data.data &&
              res.data.data.sizes
                ? res.data.data.sizes.length
                : 0,
          },
        };
      } catch (error) {
        return {
          id: product._id,
          status: { hasSize: false, sizeCount: 0 },
        };
      }
    });

    // Wait for all requests to complete
    const results = await Promise.all(sizeStatusPromises);

    // Convert array to object
    const sizeStatus = {};
    results.forEach(({ id, status }) => {
      sizeStatus[id] = status;
    });

    setProductSizeStatus(sizeStatus);
  };

  useEffect(() => {
    fetchProductsdata();
  }, []);

  const handleChangeProduct = (productId) => {
    setSelectedProductId(productId);
    setLoading(true);

    setTimeout(async () => {
      if (productId) {
        const res = await getIdGuidePantsSize(productId);

        if (res && res.data && res.data.EC === 0) {
          if (!res.data.data || !res.data.data.sizes) {
            setSizeData({ productId, sizes: [], note: "" });
          } else {
            setSizeData(res.data.data);
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
      pantsLength: "",
      waistCircumference: "",
      hipCircumference: "",
      thighCircumference: "",
      crotchLength: "",
    };

    setSizeData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, newSize],
    }));

    setEditingIndex(sizeData.sizes.length);
  };

  const handleDeleteSize = async (index) => {
    if (!sizeData) return;
    const size = sizeData.sizes[index];
    console.log(size);

    const res = await deleteOnePantsSize(selectedProductId, size._id);
    if (res && res.data && res.data.EC === 0) {
      alert("xóa thành công");
      setSizeData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index),
      }));
      setEditingIndex(-1);

      // Update size status
      fetchProductsdata();
    }
  };

  const handleEditSize = (index) => {
    setEditingIndex(index);
    setisCheckEdit(true);
  };

  const handleSaveSize = async (index) => {
    setEditingIndex(-1);
    if (isCheckEdit) {
      setisCheckEdit(false);

      const size = sizeData.sizes[editingIndex];
      const note = sizeData.note;
      const res = await updateOnePantsSize(
        selectedProductId,
        size._id,
        size,
        note
      );

      if (res && res.data && res.data.EC === 0) {
        alert("Cập nhật thành công");
        fetchProductsdata();
      }
    } else {
      const size = sizeData.sizes[index];
      const note = sizeData.note;
      const res = await addOnePantsSize(selectedProductId, size, note);

      if (res && res.data && res.data.EC === 0) {
        alert("Thêm thành công");
        // Update size status after adding
        fetchProductsdata();
      }
    }
  };

  const handleCancelEdit = () => {
    if (!isCheckEdit) {
      // Remove the newly added size if canceling
      setSizeData((prev) => ({
        ...prev,
        sizes: prev.sizes.slice(0, -1),
      }));
    }
    setEditingIndex(-1);
    setisCheckEdit(false);
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

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate products with and without sizes
  const productsWithSizes = filteredProducts.filter(
    (product) => productSizeStatus[product._id]?.hasSize
  );
  const productsWithoutSizes = filteredProducts.filter(
    (product) => !productSizeStatus[product._id]?.hasSize
  );

  const renderSizeForm = (size, index) => {
    const isEditing = editingIndex === index;
    const fields = [
      {
        key: "size",
        label: "Size",
        placeholder: "29, 30, 31, 32, 33...",
        required: true,
        icon: "🏷️",
      },
      {
        key: "heightRange",
        label: "Chiều cao",
        placeholder: "1m60 - 1m65",
        icon: "📏",
      },
      {
        key: "weightRange",
        label: "Cân nặng",
        placeholder: "55kg - 63kg",
        icon: "⚖️",
      },
      {
        key: "pantsLength",
        label: "Dài quần",
        placeholder: "95.5",
        type: "number",
        icon: "📐",
        unit: "cm",
      },
      {
        key: "waistCircumference",
        label: "1/2 Vòng eo",
        placeholder: "38.5",
        type: "number",
        icon: "⭕",
        unit: "cm",
      },
      {
        key: "hipCircumference",
        label: "1/2 Vòng mông",
        placeholder: "49",
        type: "number",
        icon: "🍑",
        unit: "cm",
      },
      {
        key: "thighCircumference",
        label: "1/2 Vòng đùi",
        placeholder: "32.4",
        type: "number",
        icon: "🦵",
        unit: "cm",
      },
      {
        key: "crotchLength",
        label: "1/2 Vòng lai",
        placeholder: "19",
        type: "number",
        icon: "📏",
        unit: "cm",
      },
    ];

    return (
      <Card
        key={index}
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👖</span>
              <div>
                <span className="text-lg font-bold">
                  Size:{" "}
                  <span className="text-purple-600">
                    {size.size || "Chưa đặt tên"}
                  </span>
                </span>
                <div className="text-sm text-gray-500">
                  {isEditing ? "📝 Đang chỉnh sửa..." : "👁️ Xem thông tin"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => handleSaveSize(index)}
                    size="small"
                  >
                    Lưu
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={handleCancelEdit}
                    size="small"
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => handleEditSize(index)}
                    size="small"
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa size này?"
                    onConfirm={() => handleDeleteSize(index)}
                  >
                    <Button danger icon={<DeleteOutlined />} size="small">
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map(
            ({ key, label, placeholder, type, required, icon, unit }) => (
              <FormItem
                key={key}
                label={`${icon} ${label}`}
                required={required}
              >
                {isEditing ? (
                  type === "number" ? (
                    <InputNumber
                      value={size[key]}
                      onChange={(value) => handleInputChange(index, key, value)}
                      placeholder={placeholder}
                      addonAfter={unit}
                    />
                  ) : (
                    <Input
                      value={size[key]}
                      onChange={(e) =>
                        handleInputChange(index, key, e.target.value)
                      }
                      placeholder={placeholder}
                    />
                  )
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100 min-h-[48px] flex items-center">
                    <span className="text-gray-800 font-medium">
                      {size[key]
                        ? `${size[key]}${unit ? ` ${unit}` : ""}`
                        : "-"}
                    </span>
                  </div>
                )}
              </FormItem>
            )
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-3xl">👖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Quản lý bảng size quần
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Tạo và quản lý thông tin size chi tiết cho từng sản phẩm quần
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Product Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {productsWithSizes.length}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Quần đã có size
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭕</span>
                  <div>
                    <div className="text-2xl font-bold text-orange-700">
                      {productsWithoutSizes.length}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      Quần chưa có size
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👖</span>
                  <div>
                    <div className="text-2xl font-bold text-purple-700">
                      {products.length}
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      Tổng sản phẩm quần
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <Card title="🔍 Chọn sản phẩm để quản lý size">
              <div className="space-y-4">
                <FormItem label="Tìm kiếm sản phẩm">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
                    suffix={<SearchOutlined />}
                  />
                </FormItem>

                <FormItem label="Chọn sản phẩm" required>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleChangeProduct(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">-- Chọn sản phẩm quần --</option>

                    {productsWithoutSizes.length > 0 && (
                      <optgroup label="🔴 Quần chưa có size (ưu tiên)">
                        {productsWithoutSizes.map((product) => (
                          <option key={product._id} value={product._id}>
                            ⭕ {product.name} - Chưa có size
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {productsWithSizes.length > 0 && (
                      <optgroup label="✅ Quần đã có size">
                        {productsWithSizes.map((product) => {
                          const sizeCount =
                            productSizeStatus[product._id]?.sizeCount || 0;
                          return (
                            <option key={product._id} value={product._id}>
                              ✅ {product.name} - {sizeCount} size
                              {sizeCount > 1 ? "s" : ""}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </select>
                </FormItem>
              </div>
            </Card>

            {/* Main Content */}
            <Spin spinning={loading} tip="🔄 Đang tải dữ liệu size quần...">
              {sizeData && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📊</span>
                          <span className="font-semibold">
                            Tổng số size:{" "}
                            <span className="text-purple-600">
                              {sizeData.sizes.length}
                            </span>
                          </span>
                        </div>
                        {sizeData.sizes.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            <span className="text-sm text-gray-600">
                              Sizes:{" "}
                              {sizeData.sizes
                                .map((s) => s.size)
                                .filter(Boolean)
                                .join(", ") || "Chưa đặt tên"}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSize}
                        size="large"
                        className="shadow-lg"
                      >
                        ➕ Thêm size mới
                      </Button>
                    </div>
                  </Card>

                  {/* Size Management */}
                  {sizeData.sizes.length > 0 ? (
                    <div className="space-y-4">
                      {sizeData.sizes.map((size, index) =>
                        renderSizeForm(size, index)
                      )}
                    </div>
                  ) : (
                    <Card>
                      <Empty description="📭 Sản phẩm này chưa có size nào">
                        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                          <div className="text-center">
                            <span className="text-4xl mb-4 block">👖</span>
                            <h3 className="text-lg font-semibold text-purple-800 mb-2">
                              Bắt đầu tạo bảng size quần
                            </h3>
                            <p className="text-purple-600 mb-4">
                              Thêm thông tin size chi tiết để khách hàng dễ dàng
                              chọn lựa
                            </p>
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={handleAddSize}
                              size="large"
                            >
                              ➕ Thêm size đầu tiên
                            </Button>
                          </div>
                        </div>
                      </Empty>
                    </Card>
                  )}

                  {/* Note Section */}
                  {sizeData.sizes.length > 0 && (
                    <Card title="📝 Ghi chú hướng dẫn chọn size">
                      <div className="space-y-4">
                        <Alert
                          message="💡 Lời khuyên cho size quần"
                          description="Ghi chú chi tiết về cách đo và chọn size quần sẽ giúp khách hàng chọn đúng size, giảm thiểu việc đổi trả."
                          type="info"
                          showIcon
                        />
                        <textarea
                          value={sizeData.note}
                          onChange={handleNoteChange}
                          placeholder="💬 Nhập ghi chú hướng dẫn chọn size quần cho khách hàng...
Ví dụ: 
- Size 30 phù hợp với người cao 1m65-1m70, nặng 60-65kg
- Đo vòng eo tại vị trí hẹp nhất của eo
- Đo vòng mông tại vị trí rộng nhất
- Nếu thích mặc rộng, nên chọn size lớn hơn 1 số
- Chất liệu jeans ít co giãn, cần chọn size vừa vặn"
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                        />
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {!selectedProductId && !loading && (
                <Card>
                  <Empty description="👖 Vui lòng chọn một sản phẩm quần để bắt đầu quản lý bảng size">
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-purple-50 rounded-xl border border-green-200">
                      <div className="text-center mb-6">
                        <span className="text-4xl mb-4 block">🚀</span>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          Hướng dẫn sử dụng
                        </h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">
                            ✅ Ưu tiên làm:
                          </h4>
                          <ul className="text-green-600 space-y-1">
                            <li>
                              • Chọn quần <strong>chưa có size</strong> (màu đỏ)
                            </li>
                            <li>• Thêm đầy đủ thông số size (8 trường)</li>
                            <li>• Viết ghi chú hướng dẫn đo size rõ ràng</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-700 mb-2">
                            📏 Các thông số size:
                          </h4>
                          <ul className="text-purple-600 space-y-1">
                            <li>
                              • <strong>Dài quần</strong>: Từ eo xuống gấu
                            </li>
                            <li>
                              • <strong>1/2 Vòng eo</strong>: Nửa chu vi vòng eo
                            </li>
                            <li>
                              • <strong>1/2 Vòng mông</strong>: Nửa chu vi vòng
                              mông
                            </li>
                            <li>
                              • <strong>1/2 Vòng đùi & lai</strong>: Chi tiết
                              fit
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Empty>
                </Card>
              )}
            </Spin>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PantsSizeManager;
