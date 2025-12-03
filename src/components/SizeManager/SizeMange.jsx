import { useEffect, useState } from "react";
import { getListProductsAPI } from "../../service/ApiProduct";
import {
  addOneSize,
  deleteGuideSize,
  getIdGuideSize,
  updateGuideSeize,
} from "../../service/APISizeGuide";
import { message, notification } from "antd";
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
            } focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300`}
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
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
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
const CheckOutlined = () => <span className="text-lg">✅</span>;
const SearchOutlined = () => <span className="text-lg">🔍</span>;

const SizeManager = () => {
  const [products, setProducts] = useState([]);
  const [productSizeStatus, setProductSizeStatus] = useState({}); // Track which products have sizes
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sizeData, setSizeData] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isCheckEdit, setisCheckEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [SizeUpdate, setSizeUpdate] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const fetchProductsdata = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        const data = res.data?.data.filter((item) => {
          return item.category.name === "Áo";
        });
        setProducts(data);

        // Check size status for each product
        checkProductSizeStatus(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkProductSizeStatus = async (productList) => {
    // Gọi API song song thay vì tuần tự để nhanh hơn
    const promises = productList.map(async (product) => {
      try {
        const res = await getIdGuideSize(product._id);
        return {
          id: product._id,
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
        };
      } catch (error) {
        return {
          id: product._id,
          hasSize: false,
          sizeCount: 0,
        };
      }
    });

    const results = await Promise.all(promises);
    const sizeStatus = {};
    results.forEach((result) => {
      sizeStatus[result.id] = {
        hasSize: result.hasSize,
        sizeCount: result.sizeCount,
      };
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
        const res = await getIdGuideSize(productId);

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

    setEditingIndex(sizeData.sizes.length);
  };

  const handleDeleteSize = async (index, size) => {
    if (!sizeData) return;

    const res = await deleteGuideSize(selectedProductId, size);
    if (res && res.data && res.data.EC === 0) {
      api["success"]({
        message: `Bạn đã xóa thành công `,
        description: `Chúc mừng bạn đã xóa thành công size ${size}`,
      });
      setSizeData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index),
      }));
      setEditingIndex(-1);

      // Update size status
      fetchProductsdata();
    }
  };

  const handleEditSize = (index, size) => {
    setSizeUpdate(size);
    setEditingIndex(index);
    setisCheckEdit(true);
  };

  const handleSaveSize = async (index) => {
    setEditingIndex(-1);
    if (isCheckEdit) {
      const size = sizeData.sizes[editingIndex];
      const res = await updateGuideSeize(selectedProductId, SizeUpdate, size);

      if (res && res.data && res.data.EC === 0) {
        setisCheckEdit(false);
        api["success"]({
          message: `Bạn đã cập nhật thành công`,
          description: `Chúc mừng bạn đã cập nhật thành công size ${size.size}`,
        });
        checkProductSizeStatus(products);
      }
    } else {
      const size = sizeData.sizes[index];
      const note = sizeData.note;
      const res = await addOneSize(selectedProductId, size, note);

      if (res && res.data && res.data.EC === 0) {
        api["success"]({
          message: `Bạn đã thêm thành công size cho sản phẩm `,
          description: `Chúc mừng bạn đã thêm thành công size ${size.size}`,
        });
        // Update size status after adding
        checkProductSizeStatus(products);
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
        placeholder: "M, L, XL...",
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
        placeholder: "55kg - 60kg",
        icon: "⚖️",
      },
      {
        key: "shirtLength",
        label: "Dài áo",
        placeholder: "67",
        type: "number",
        icon: "📐",
        unit: "cm",
      },
      {
        key: "shoulderWidth",
        label: "Rộng vai",
        placeholder: "43",
        type: "number",
        icon: "👐",
        unit: "cm",
      },
      {
        key: "chestWidth",
        label: "Vòng ngực",
        placeholder: "49",
        type: "number",
        icon: "🫸",
        unit: "cm",
      },
      {
        key: "sleeveLength",
        label: "Dài tay",
        placeholder: "20.5",
        type: "number",
        icon: "🦾",
        unit: "cm",
      },
      {
        key: "bicepWidth",
        label: "Bắp tay",
        placeholder: "15.5",
        type: "number",
        icon: "💪",
        unit: "cm",
      },
    ];

    return (
      <Card
        key={index}
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👕</span>
              <div>
                <span className="text-lg font-bold">
                  Size:{" "}
                  <span className="text-blue-600">
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
                    onClick={() => handleEditSize(index, size.size)}
                    size="small"
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa size này?"
                    onConfirm={() => handleDeleteSize(index, size.size)}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {contextHolder}
      <div className="p-6 max-w-7xl mx-auto">
        <Card
          title={
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-3xl">📏</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Quản lý bảng size áo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Tạo và quản lý thông tin size chi tiết cho từng sản phẩm áo
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
                      Sản phẩm đã có size
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
                      Sản phẩm chưa có size
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {products.length}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Tổng sản phẩm áo
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">-- Chọn sản phẩm --</option>

                    {productsWithoutSizes.length > 0 && (
                      <optgroup label="🔴 Sản phẩm chưa có size (ưu tiên)">
                        {productsWithoutSizes.map((product) => (
                          <option key={product._id} value={product._id}>
                            ⭕ {product.name} - Chưa có size
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {productsWithSizes.length > 0 && (
                      <optgroup label="✅ Sản phẩm đã có size">
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
            <Spin spinning={loading} tip="🔄 Đang tải dữ liệu size...">
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
                            <span className="text-blue-600">
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
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="text-center">
                            <span className="text-4xl mb-4 block">👕</span>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                              Bắt đầu tạo bảng size
                            </h3>
                            <p className="text-blue-600 mb-4">
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
                          message="💡 Lời khuyên"
                          description="Ghi chú chi tiết sẽ giúp khách hàng chọn size phù hợp, giảm thiểu việc đổi trả hàng."
                          type="info"
                          showIcon
                        />
                        <textarea
                          value={sizeData.note}
                          onChange={handleNoteChange}
                          placeholder="💬 Nhập ghi chú hướng dẫn chọn size cho khách hàng...
Ví dụ: 
- Size M phù hợp với người cao 1m65-1m70, nặng 60-65kg
- Nếu thích mặc rộng, nên chọn size lớn hơn 1 số
- Chất liệu co giãn nhẹ, thoải mái khi mặc"
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 resize-none"
                        />
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {!selectedProductId && !loading && (
                <Card>
                  <Empty description="🛍️ Vui lòng chọn một sản phẩm để bắt đầu quản lý bảng size">
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
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
                              • Chọn sản phẩm <strong>chưa có size</strong> (màu
                              đỏ)
                            </li>
                            <li>• Thêm đầy đủ thông số size</li>
                            <li>• Viết ghi chú hướng dẫn rõ ràng</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">
                            🔧 Các chức năng:
                          </h4>
                          <ul className="text-blue-600 space-y-1">
                            <li>
                              • <strong>Thêm</strong>: Tạo size mới
                            </li>
                            <li>
                              • <strong>Sửa</strong>: Chỉnh sửa thông tin size
                            </li>
                            <li>
                              • <strong>Xóa</strong>: Loại bỏ size không cần
                            </li>
                            <li>
                              • <strong>Tìm kiếm</strong>: Lọc sản phẩm nhanh
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

export default SizeManager;
