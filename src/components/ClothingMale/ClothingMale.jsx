import { useCallback, useEffect, useRef, useState } from "react";
import {
  Radio,
  Space,
  Slider,
  Button,
  Card,
  Skeleton,
  Rate,
  Drawer,
  notification,
} from "antd";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ListCategoryAPI } from "../../service/ApiCategory";
import ReactPaginate from "react-paginate";
import { fetchProducts } from "../../redux/actions/filterAction";
import SliderComponent from "../Slider/Slider";
import ProductCart from "../ProductCart/ProductCart";
import "./ClothingMale.css";
import {
  addToWishlistAPI,
  getWishlistAPI,
  RemoveToWishListAPI,
} from "../../service/WishList";
import { getListProductsAPI } from "../../service/ApiProduct";

import {
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FireOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Select } from "antd";
import { Helmet } from "react-helmet-async";
import { debounce } from "lodash";
const { Option } = Select;

const ClothingMale = () => {
  const param = useParams();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [modalCartOpen, setModalCartOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const [WishList, setWishList] = useState([]);
  const [hidden, setHidden] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [listCategory, setListCategory] = useState([]);
  const [valueId, setValueId] = useState("");
  const [size, setSize] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Current applied price range
  const [tempPriceRange, setTempPriceRange] = useState([0, 1000000]);
  const [selectedCare, setSelectedCare] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [dataProducts, setDataProducts] = useState([]);
  const [color, setColor] = useState("");

  const listRef = useRef();

  const handleFilter = () => {
    // ... filter logic
    if (listRef.current) {
      const offset = -100; // số px muốn nhích lên trên
      const y =
        listRef.current.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  const menuRef = useRef(null);
  const { products, loading, totalPages } = useSelector(
    (state) => state.filter
  );

  const queryParams = new URLSearchParams(location.search);
  const careParams = queryParams.get("care") || "";
  const sizeParams = queryParams.get("size")?.split(",").filter(Boolean) || [];
  const colorParms = queryParams.get("color") || "";
  const viewParams = queryParams.get("view") || "";
  const brandParams = queryParams.get("brand") || "";
  const savedSortPrice = queryParams.get("sortPrice") || "";
  const savedCategory = queryParams.get("Category") || "";
  const savedCurrentPage = Number.parseInt(queryParams.get("currentPage")) || 1;
  const savedSortDate = queryParams.get("sortDate") || "";
  const savedSortSold = queryParams.get("sortSold") || "";
  const urlMinPrice = Number(queryParams.get("minPrice")) || undefined;
  const urlMaxPrice = Number(queryParams.get("maxPrice")) || undefined;

  // Tối ưu hóa getFetchParams để memo hóa:
  const getFetchParams = useCallback(() => {
    return {
      gender: param.gender,
      category:
        valueId ||
        (savedCategory
          ? listCategory.find((cat) => cat.name === savedCategory)?._id
          : ""),
      sortPrice: savedSortPrice,
      sortDate: savedSortDate,
      sortSold: savedSortSold,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      care: careParams,
      size: sizeParams,
      color: colorParms,
      currentPage: Number(queryParams.get("currentPage")) || 1,
      view: viewParams,
      brand: brandParams,
    };
  }, [
    param.gender,
    valueId,
    savedCategory,
    listCategory,
    savedSortPrice,
    savedSortDate,
    savedSortSold,
    urlMinPrice,
    urlMaxPrice,
    careParams,
    sizeParams,
    colorParms,
    viewParams,
    brandParams,
    // Loại bỏ savedCurrentPage khỏi dependency vì nó không được sử dụng trong function
  ]);

  // Thêm một useEffect riêng để xử lý reset filters:
  useEffect(() => {
    if (location.search === "" && location.pathname.includes(param.gender)) {
      const resetStates = () => {
        setValueId("");
        setSelectedCare("");
        setSize([]);
        setSelectedBrand("");
        setPriceRange([0, 1000000]);
        setColor("");
        setHidden(false);
      };
      resetStates();

      // ép URL có ?currentPage=1 khi xoá hết filter
      navigate(`${location.pathname}?currentPage=1`, { replace: true });
    }
  }, [location.search, location.pathname, param.gender]);

  const fetchgetListProductsAPI = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        setDataProducts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchListCategoryAndInitialize = async () => {
      try {
        const res = await ListCategoryAPI();
        if (res && res.data) {
          setListCategory(res.data.data);
          const categoryFromURL = queryParams.get("Category");
          if (categoryFromURL) {
            const foundCategory = res.data.data.find(
              (cat) => cat.name === categoryFromURL
            );
            if (foundCategory) setValueId(foundCategory._id);
          }
          if (sizeParams.length > 0) setSize(sizeParams);
          if (careParams) setSelectedCare(careParams);
          if (urlMinPrice || urlMaxPrice)
            setPriceRange([urlMinPrice || 0, urlMaxPrice || 1000000]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchListCategoryAndInitialize();
  }, []);

  useEffect(() => {
    // Thêm flag để tránh gọi API khi component đang mount
    if (!listCategory.length) return;

    // Thêm debounce để tránh gọi API liên tiếp
    const timeoutId = setTimeout(() => {
      if (location.pathname.includes(param.gender)) {
        const params = getFetchParams();
        dispatch(fetchProducts(params));
      }
    }, 100); // Debounce 100ms

    return () => clearTimeout(timeoutId);
  }, [param.gender, location.search, listCategory.length]);

  useEffect(() => {
    fetchgetListProductsAPI();
  }, []);

  const handlePageClick = useCallback(
    (page) => {
      const pageNumber = page.selected + 1;
      const newParams = new URLSearchParams(location.search);
      newParams.set("currentPage", pageNumber);

      // Sử dụng setTimeout để tránh gọi navigate trong render cycle
      setTimeout(() => {
        navigate(`${location.pathname}?${newParams.toString()}`);
      }, 0);
    },
    [location.search, location.pathname, navigate]
  );

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return "0đ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const marks = { 0: "0", 500000: "500K", 1000000: "1M" };

  const onChange = (e) => {
    const selectedValue = e.target.value;
    const selectedCategory = listCategory.find(
      (category) => category._id === selectedValue
    );
    if (selectedCategory) {
      setValueId(selectedValue);
      setHidden(true);
      const newParams = new URLSearchParams(location.search);
      newParams.set("Category", selectedCategory.name);
      newParams.set("currentPage", "1");
      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    }
  };

  // Tối ưu hóa tất cả các hàm filter khác bằng cách loại bỏ setTimeout:
  const handleCheckboxChange = (value) => {
    const updatedSizes = size.includes(value)
      ? size.filter((s) => s !== value)
      : [...size, value];

    setSize(updatedSizes);
    setHidden(true);
    setCheckFilter(false);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("size", updatedSizes.join(","));
    queryParams.set("currentPage", "1");

    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
  };

  const handleSortDesAndAsc = (value) => {
    setHidden(true);
    setCheckFilter(false);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sortPrice", value);
    queryParams.set("currentPage", "1");

    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    handleFilter();
  };

  const handleSortDate = (value) => {
    const queryParams = new URLSearchParams(location.search);

    queryParams.delete("sortSold");
    queryParams.delete("view");
    queryParams.delete("sortPrice");

    queryParams.set("sortDate", value);
    queryParams.set("currentPage", "1");
    setHidden(true);
    setCheckFilter(false);
    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    handleFilter();
  };

  const handleSortSold = (value) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.delete("sortPrice");
    queryParams.delete("sortDate");
    queryParams.delete("view");
    queryParams.set("sortSold", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
    handleFilter();
  };

  const handleFilterProduct = () => {
    const resetStates = () => {
      setValueId("");
      setSelectedCare("");
      setSize([]);
      setSelectedBrand("");
      setPriceRange([0, 1000000]);
      setHidden(false);
      setColor("");
    };

    resetStates();

    // luôn reset về page 1 khi xoá filter
    navigate(`${location.pathname}?currentPage=1`, { replace: true });
    handleFilter();
  };

  const handleRangeChange = useCallback(
    debounce((value) => {
      setTempPriceRange(value);
    }, 50), // 50ms debounce to reduce lag
    []
  );

  const handleApplyFilter = () => {
    setPriceRange(tempPriceRange);
    setHidden(true); // Assuming this hides a UI element
    setCheckFilter(false); // Assuming this resets a filter checkbox

    const [min, max] = tempPriceRange;
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("minPrice", min);
    queryParams.set("maxPrice", max);
    queryParams.set("currentPage", "1");

    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    handleFilter(); // Assuming this is defined elsewhere
  };

  const handleOnClickColor = (value) => {
    setColor(value);
    setHidden(true);
    setCheckFilter(false);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("color", value);
    queryParams.set("currentPage", "1");

    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    handleFilter();
  };

  const handleSortView = (value) => {
    setHidden(true);
    setCheckFilter(false);
    const queryParams = new URLSearchParams(location.search);

    queryParams.delete("sortPrice");
    queryParams.delete("sortDate");
    queryParams.delete("sortSold");
    queryParams.set("view", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
  };

  const onChangeCare = (e) => {
    const careItem = e.target.value;
    setSelectedCare(careItem);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("care", careItem);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    setHidden(true);
    setCheckFilter(false);
    handleFilter();
  };

  const filterBrand = (e) => {
    const brandItem = e.target.value;
    setSelectedBrand(brandItem);
    setHidden(true);
    setCheckFilter(false);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("brand", brandItem);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`, {
      replace: true,
    });
    handleFilter();
  };

  const SkeletonCard = () => (
    <Card
      className="w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      cover={
        <div className="w-full aspect-[350/250] bg-gray-200">
          <Skeleton.Image
            active
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>
      }
    >
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
  );
  const OptionGender = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "unisex":
        return "Unisex";
      default:
        return "Không có giới tính";
    }
  };

  const handleDetails = (slug) => {
    navigate(`/product/${slug}`);
  };

  const handelModelProductCart = (
    id,
    items,
    price,
    costPrice,
    name,
    discount
  ) => {
    setIdProducts(id);
    setListItems(items);
    setPrice(price);
    setCostPrice(costPrice);
    setModalCartOpen(true);
    setProductname(name);
    setDiscount(discount);
  };

  const handlAddWishList = async (productId) => {
    if (!user) {
      api["error"]({
        message: "Vui lòng đăng nhập",
        description: "Khách hàng đăng nhập mới sử dụng được tính năng này",
      });
      return;
    }
    try {
      const res = await addToWishlistAPI(user?._id, productId);

      if (res && res.data && res.data.EC === 0) {
        api["success"]({
          message: "Đã thêm vào danh sách yêu thích",
          description: res.data.message,
        });
        fetchListWishList();
      }
    } catch (error) {
      api["error"]({
        message: "Sản phẩm đã tồn tại danh sách yêu thích",
        description: "Sản phẩm đã tồn tại danh sách yêu thích",
      });
    }
  };

  const fetchListWishList = async () => {
    try {
      const res = await getWishlistAPI(user?._id);
      if (res && res.data && res.data.EC === 0) {
        setWishList(res?.data?.data?.products || []);
      }
    } catch (error) {
      throw new Error("Lỗi lấy danh sách yêu thích");
    }
  };

  const handleRemoveWishList = async (productId) => {
    try {
      const res = await RemoveToWishListAPI(user?._id, productId);

      if (res && res.data && res.data.EC === 0) {
        api["success"]({
          message: "Đã xóa khỏi danh sách yêu thích",
        });
        fetchListWishList();
      }
    } catch (error) {
      api["error"]({
        message: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
        description: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
      });
    }
  };
  useEffect(() => {
    if (user?._id) {
      fetchListWishList();
    }
  }, [user?._id]);

  const isProductInWishlist = WishList?.map((item) => item.product._id);

  // Filter Component
  const FilterContent = () => (
    <div className="">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-md"></div>
        <h2 className="text-xl font-medium text-gray-900">Bộ lọc</h2>
      </div>

      {/* Category Filter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Loại sản phẩm</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <Radio.Group onChange={onChange} value={valueId} className="w-full">
            <Space direction="vertical" className="w-full space-y-2">
              {listCategory.length > 0 &&
                listCategory.map((category) => (
                  <Radio
                    key={category._id}
                    value={category._id}
                    className="flex items-center p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-700 hover:text-green-600"
                  >
                    <span className="ml-2 font-medium">{category.name}</span>
                  </Radio>
                ))}
            </Space>
          </Radio.Group>
        </div>
      </div>

      {/* Care Collection Filter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Bộ sưu tập</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <Radio.Group
            onChange={onChangeCare}
            value={selectedCare}
            className="w-full"
          >
            <Space direction="vertical" className="w-full space-y-2">
              {dataProducts &&
                dataProducts
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((t) => t.care === item.care)
                  )
                  .map((item) => (
                    <Radio
                      key={item.care}
                      value={item.care}
                      className="flex items-center p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-700 hover:text-green-600"
                    >
                      <span className="ml-2 font-medium">{item.care}</span>
                    </Radio>
                  ))}
            </Space>
          </Radio.Group>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Thương hiệu</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <Radio.Group
            onChange={filterBrand}
            value={selectedBrand}
            className="w-full"
          >
            <Space direction="vertical" className="w-full space-y-2">
              {dataProducts &&
                dataProducts
                  .filter((item) => item.gender === param.gender)
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((t) => t.brand === item.brand)
                  )
                  .map((item) => (
                    <Radio
                      key={item.brand}
                      value={item.brand}
                      className="flex items-center p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 text-gray-700 hover:text-green-600"
                    >
                      <span className="ml-2 font-medium">{item.brand}</span>
                    </Radio>
                  ))}
            </Space>
          </Radio.Group>
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Kích cỡ</h3>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg -p-4">
          <div className="grid grid-cols-5 gap-3">
            {["S", "M", "L", "XL", "XXL", "28", "29", "30", "31", "32"].map(
              (sizeOption) => (
                <label
                  key={sizeOption}
                  className={`relative flex items-center justify-center w-12 h-12 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    size.includes(sizeOption)
                      ? "border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200"
                      : "border-gray-300 bg-white hover:border-green-400 hover:shadow-md text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={sizeOption}
                    checked={size.includes(sizeOption)}
                    onChange={() => handleCheckboxChange(sizeOption)}
                    className="hidden"
                  />
                  <span className="text-sm font-bold">{sizeOption}</span>
                  {size.includes(sizeOption) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </label>
              )
            )}
          </div>
        </div>
      </div>

      {/* Color Filter */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-800">Màu sắc</h3>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "be", label: "Be", color: "bg-yellow-400" },
              { value: "xanh", label: "Xanh", color: "bg-blue-500" },
              { value: "đen", label: "Đen", color: "bg-black" },
              { value: "đỏ", label: "Đỏ", color: "bg-red-500" },
              {
                value: "trắng",
                label: "Trắng",
                color: "bg-white border-2 border-gray-300",
              },
            ].map((colorOption) => (
              <label
                key={colorOption.value}
                className="flex flex-col items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="color"
                  value={colorOption.value}
                  onChange={() => handleOnClickColor(colorOption.value)}
                  className="hidden"
                />
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full ${colorOption.color} group-hover:scale-110 transition-transform duration-300 shadow-lg border-4 border-white ring-2 ring-gray-200 group-hover:ring-green-300`}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white opacity-20"></div>
                </div>
                <span className="text-xs font-medium text-gray-600 mt-2 group-hover:text-green-600 transition-colors duration-200">
                  {colorOption.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-6 p-4 ">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-900">Lọc theo giá</h3>
        </div>
        <div className="">
          <Slider
            range
            marks={marks}
            value={tempPriceRange}
            min={0}
            max={1000000}
            step={50000}
            onChange={handleRangeChange}
            className="mb-8"
          />
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100">
              <span className="text-sm font-semibold text-indigo-700">
                {formatPrice(tempPriceRange[0])}
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 to-indigo-100 mx-4"></div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100">
              <span className="text-sm font-semibold text-indigo-700">
                {formatPrice(tempPriceRange[1])}
              </span>
            </div>
          </div>
          <button
            onClick={handleApplyFilter}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Clear Filters Button */}
    </div>
  );

  function formatNumberToShort(num) {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(".", ",") + "b";
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(".", ",") + "m";
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(".", ",") + "k";
    } else {
      return num.toString();
    }
  }

  const sortOptions = [
    {
      value: "newest",
      label: "Mới nhất",
      icon: <ClockCircleOutlined className="text-blue-500" />,
      color: "from-blue-500 to-cyan-500",
      handler: () => handleSortDate("newest"),
    },
    {
      value: "price-asc",
      label: "Giá: thấp - cao",
      icon: <ArrowUpOutlined className="text-green-500" />,
      color: "from-green-500 to-emerald-500",
      handler: () => handleSortDesAndAsc("asc"),
    },
    {
      value: "price-desc",
      label: "Giá: cao - thấp",
      icon: <ArrowDownOutlined className="text-red-500" />,
      color: "from-red-500 to-pink-500",
      handler: () => handleSortDesAndAsc("desc"),
    },
    {
      value: "hot-selling",
      label: "Bán chạy nhất",
      icon: <FireOutlined className="text-orange-500" />,
      color: "from-orange-500 to-yellow-500",
      handler: () => handleSortSold("hot"),
    },
    {
      value: "most-viewed",
      label: "Lượt xem nhiều nhất",
      icon: <EyeOutlined className="text-purple-500" />,
      color: "from-purple-500 to-indigo-500",
      handler: () => handleSortView("asc"),
    },
  ];

  const handleSortChange = (value) => {
    const selectedOption = sortOptions.find((option) => option.value === value);
    if (selectedOption) {
      selectedOption.handler();
    }
  };

  useEffect(() => {
    const saveScrollPos = () => {
      sessionStorage.setItem("filterScrollPos", window.scrollY);
    };
    window.addEventListener("beforeunload", saveScrollPos);

    // Khôi phục vị trí scroll sau reload
    const storedScroll = sessionStorage.getItem("filterScrollPos");
    if (storedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: parseInt(storedScroll, 10),
          behavior: "instant", // không mượt để khỏi giật
        });
      });
    }

    return () => {
      window.removeEventListener("beforeunload", saveScrollPos);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <SliderComponent />
      {contextHolder}

      <Helmet>
        <title>Thời trang nam | Shop Duy Anh</title>
        <meta
          name="description"
          content="Bộ sưu tập quần áo nam mới nhất, đa dạng mẫu mã, chất lượng cao."
        />
        <meta property="og:title" content="Thời trang nam" />
        <meta
          property="og:description"
          content="Khám phá ngay bộ sưu tập thời trang nam của Shop Duy Anh."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
      </Helmet>
      <div className="clothing-male-wrapper">
        <div className="clothing-male-layout-grid">
          {/* Desktop Sidebar Filters */}
          <div className="clothing-male-sidebar">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="clothing-male-main-content">
            {/* Breadcrumb */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Link to="/" className="text-gray-500 hover:text-green-600">
                    Trang chủ
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-700 font-medium">
                    Đồ {OptionGender(param.gender)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-700 font-semibold">
                    Trang {savedCurrentPage} - {products?.length || 0} sản phẩm
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Filter Button & Sort Controls */}
            <div className="flex justify-end items-center gap-3 mb-4 px-2 w-full flex-wrap">
              {/* Mobile Filter Button */}
              <Button
                onClick={() => setFilterDrawerOpen(true)}
                className="clothing-male-filter-btn bg-green-500 hover:bg-green-600 text-white border-none rounded-xl px-3 h-9 flex items-center gap-2 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Bộ lọc
              </Button>

              {/* Sort Controls */}
              <div className="relative flex items-center gap-2" ref={menuRef}>
                <div className="text-gray-600 font-medium hidden md:block">
                  Sắp xếp theo
                </div>
                <Select
                  defaultValue="newest"
                  placeholder="Sắp xếp theo"
                  onChange={handleSortChange}
                  className="w-[160px] md:w-[200px]"
                  size="large"
                  dropdownClassName="custom-sort-dropdown"
                  dropdownStyle={{
                    borderRadius: "10px",
                    boxShadow:
                      "0 8px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 5px -1px rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    zIndex: 1000, // Đảm bảo dropdown không bị che
                  }}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    height: "36px", // Chuẩn hóa chiều cao
                  }}
                >
                  {sortOptions.map((option) => (
                    <Option
                      key={option.value}
                      value={option.value}
                      className="custom-option"
                    >
                      <div className="flex items-center space-x-2 py-1">
                        <div
                          className={`w-6 h-6 rounded-md bg-gradient-to-r ${option.color} flex items-center justify-center shadow-sm`}
                        >
                          {option.icon}
                        </div>
                        <span className="font-medium text-gray-700">
                          {option.label}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>

                {hidden && (
                  <Button
                    onClick={handleFilterProduct}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl h-9 px-3 transition-colors duration-200"
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="clothing-male-grid" ref={listRef}>
              {loading ? (
                [...Array(12)].map((_, index) => <SkeletonCard key={index} />)
              ) : products && products.length > 0 ? (
                products.map((product) => {
                  const filiterColor = product.variants.filter((item) => {
                    return item.color === color;
                  });

                  return (
                    <div
                      key={product._id}
                      className="clothing-male-card bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          className="clothing-male-image w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={
                            color
                              ? filiterColor[0]?.images[0]?.url ||
                                "/placeholder.svg?height=250&width=350"
                              : product.variants[0]?.images[0]?.url ||
                                "/placeholder.svg?height=250&width=350"
                          }
                          alt={product.name}
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg transform rotate-12 shadow-lg">
                              SOLD OUT
                            </div>
                          </div>
                        )}
                        {product.discount > 0 && (
                          <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            -{product.discount}%
                          </span>
                        )}
                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {isProductInWishlist?.includes(product._id) ? (
                            <>
                              <button
                                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                onClick={() =>
                                  handleRemoveWishList(product._id)
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
                              onClick={() => handlAddWishList(product._id)}
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handelModelProductCart(
                                product._id,
                                product.variants,
                                product.price,
                                product.discountedPrice,
                                product.name,
                                product.discount
                              )
                            }
                            className="bg-green-500 hover:bg-green-600 p-2 rounded-full shadow-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div
                        className="clothing-male-content"
                        onClick={() => handleDetails(product.slug)}
                      >
                        <p className="text-sm text-green-600 uppercase tracking-wider font-medium mb-2">
                          {product.brand}
                        </p>
                        <h3 className="clothing-male-title font-semibold text-gray-900 line-clamp-2 mb-3 cursor-pointer hover:text-green-600">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="clothing-male-price font-bold text-green-600">
                              {formatPrice(product.discountedPrice)}
                            </span>
                            {product.discount > 0 && (
                              <span className="clothing-male-original-price text-gray-500 line-through ml-2">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className=" flex items-center justify-between">
                          <span className="italic">
                            {" "}
                            {formatNumberToShort(product.view)} lượt xem
                          </span>
                          <span className="italic">Đã bán {product.sold}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy sản phẩm nào
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {products && products.length > 0 && (
              <div className="mt-8 flex justify-center">
                <ReactPaginate
                  key={`${param.gender}-${savedCurrentPage}-${totalPages}`} // Thêm key
                  previousLabel={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  }
                  nextLabel={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                  initialPage={savedCurrentPage - 1}
                  breakLabel="..."
                  pageCount={totalPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageClick}
                  containerClassName="clothing-male-pagination flex items-center gap-2 flex-wrap justify-center"
                  pageLinkClassName="clothing-male-page-link flex items-center justify-center rounded-xl border border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors text-sm"
                  activeLinkClassName="bg-green-500 text-white border-green-500 hover:bg-green-600"
                  previousClassName="p-1 sm:p-2 rounded-xl border border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors"
                  nextClassName="p-1 sm:p-2 rounded-xl border border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors"
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">Bộ lọc</span>
          </div>
        }
        placement="left"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={320}
        className="clothing-male-drawer"
        styles={{
          header: { borderBottom: "1px solid #e5e7eb" },
          body: { padding: "20px" },
        }}
      >
        <FilterContent />
      </Drawer>

      <ProductCart
        modalCartOpen={modalCartOpen}
        setModalCartOpen={setModalCartOpen}
        IdProduct={IdProduct}
        listItems={listItems}
        price={price}
        costPrice={costPrice}
        productname={productname}
        discount={discount}
      />
    </div>
  );
};

export default ClothingMale;
