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

const ClothingMale = () => {
  const { user } = useSelector((state) => state.auth);
  const param = useParams();
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

  const [ratings, setRatings] = useState({});
  const [WishList, setWishList] = useState([]);

  const [hidden, setHidden] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [listCategory, setListCategory] = useState([]);
  const [valueId, setValueId] = useState("");
  const [size, setSize] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedCare, setSelectedCare] = useState("");
  const [color, setColor] = useState("");

  const menuRef = useRef(null);
  const { products, loading, totalPages } = useSelector(
    (state) => state.filter
  );

  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const careParams = queryParams.get("care") || "";
  const sizeParams = queryParams.get("size")?.split(",").filter(Boolean) || [];
  const colorParms = queryParams.get("color") || "";
  const viewParams = queryParams.get("view") || "";
  const savedSortPrice = queryParams.get("sortPrice") || "";
  const savedCategory = queryParams.get("Category") || "";
  const savedCurrentPage = Number.parseInt(queryParams.get("currentPage")) || 1;
  const savedSortDate = queryParams.get("sortDate") || "";
  const savedSortSold = queryParams.get("sortSold") || "";
  const urlMinPrice = Number(queryParams.get("minPrice")) || undefined;
  const urlMaxPrice = Number(queryParams.get("maxPrice")) || undefined;

  // Fetch params function
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
      currentPage: savedCurrentPage,
      view: viewParams,
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
    savedCurrentPage,
  ]);

  // Initial category fetch and URL sync
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

  // Fetch products when URL changes or categories load
  useEffect(() => {
    if (listCategory.length > 0) {
      const params = getFetchParams();
      dispatch(fetchProducts(params));
    }
  }, [param.gender, location.search, listCategory.length, dispatch]);

  // Handle click outside for filter menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setCheckFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageClick = (page) => {
    const pageNumber = page.selected + 1;
    const newParams = new URLSearchParams(location.search);
    newParams.set("currentPage", pageNumber);
    navigate(`${location.pathname}?${newParams.toString()}`);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      navigate(`${location.pathname}?${newParams.toString()}`);
    }
  };

  const handleCheckboxChange = (value) => {
    const updatedSizes = size.includes(value)
      ? size.filter((s) => s !== value)
      : [...size, value];
    setSize(updatedSizes);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("size", updatedSizes.join(","));
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleSortDesAndAsc = (value) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sortPrice", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleSortDate = (value) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sortDate", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleSortSold = (value) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sortSold", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleFilterProduct = () => {
    setValueId("");
    setSelectedCare("");
    setSize([]);
    setPriceRange([0, 1000000]);
    setHidden(false);
    navigate(`${location.pathname}`);
  };

  const handleRangeChange = (value) => {
    setPriceRange(value);
    const [min, max] = value;
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("minPrice", min);
    queryParams.set("maxPrice", max);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleOnClickColor = (value) => {
    const color = value;
    setColor(value);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("color", color);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const handleSortView = (value) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("view", value);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const onChangeCare = (e) => {
    const careItem = e.target.value;
    setSelectedCare(careItem);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("care", careItem);
    queryParams.set("currentPage", "1");
    navigate(`${location.pathname}?${queryParams.toString()}`);
    setHidden(true);
    setCheckFilter(false);
  };

  const SkeletonCard = () => (
    <Card
      className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      cover={<Skeleton.Image active style={{ width: "100%", height: 200 }} />}
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

  const handleRate = (productId, value) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
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
        setWishList(res.data.data.products);
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
    fetchListWishList();
  }, [user?._id]);

  const isProductInWishlist = WishList?.map((item) => item.product._id);

  // Filter Component
  const FilterContent = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
        Bộ lọc sản phẩm
      </h2>

      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Loại sản phẩm
        </h3>
        <Radio.Group onChange={onChange} value={valueId} className="w-full">
          <Space direction="vertical" className="w-full">
            {listCategory.length > 0 &&
              listCategory.map((category) => (
                <Radio
                  key={category._id}
                  value={category._id}
                  className="text-gray-700 hover:text-green-600"
                >
                  {category.name}
                </Radio>
              ))}
          </Space>
        </Radio.Group>
      </div>

      {/* Care Collection Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bộ sưu tập</h3>
        <Radio.Group
          onChange={onChangeCare}
          value={selectedCare}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            {products &&
              products
                .filter(
                  (item, index, self) =>
                    index === self.findIndex((t) => t.care === item.care)
                )
                .map((item) => (
                  <Radio
                    key={item.care}
                    value={item.care}
                    className="text-gray-700 hover:text-green-600"
                  >
                    {item.care}
                  </Radio>
                ))}
          </Space>
        </Radio.Group>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Kích cỡ</h3>
        <div className="grid grid-cols-5 gap-2">
          {["S", "M", "L", "XL", "XXL", "28", "29", "30", "31", "32"].map(
            (sizeOption) => (
              <label
                key={sizeOption}
                className={`flex items-center justify-center w-10 h-10 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  size.includes(sizeOption)
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 hover:border-green-400 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  value={sizeOption}
                  checked={size.includes(sizeOption)}
                  onChange={() => handleCheckboxChange(sizeOption)}
                  className="hidden"
                />
                <span className="text-sm font-medium">{sizeOption}</span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Màu sắc</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "vàng", label: "Vàng", color: "bg-yellow-400" },
            { value: "xanh lá cây", label: "Xanh lá", color: "bg-green-500" },
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
              <div
                className={`w-8 h-8 rounded-full ${colorOption.color} group-hover:scale-110 transition-transform duration-200 shadow-md`}
              />
              <span className="text-xs text-gray-600 mt-1">
                {colorOption.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Lọc theo giá
        </h3>
        <Slider
          range
          marks={marks}
          value={priceRange}
          min={0}
          max={1000000}
          step={50000}
          onChange={handleRangeChange}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Clear Filters */}
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

  return (
    <div className="min-h-screen bg-white">
      <SliderComponent />
      {contextHolder}
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
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Mobile Filter Button */}
                <Button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="clothing-male-filter-btn bg-green-500 hover:bg-green-600 text-white border-none rounded-xl px-4 h-10 flex items-center gap-2"
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
                <div className="relative" ref={menuRef}>
                  <div className=" flex items-center gap-2">
                    <Button
                      onClick={() => setCheckFilter((prev) => !prev)}
                      className="bg-green-500 hover:bg-green-600 text-white border-none rounded-xl px-6 h-10"
                    >
                      Sắp xếp theo
                    </Button>

                    {hidden && (
                      <Button
                        onClick={handleFilterProduct}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-none rounded-xl h-10"
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                  </div>
                  {checkFilter && (
                    <div className="absolute top-12 right-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-48">
                      <button
                        onClick={() => handleSortDate("newest")}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                      >
                        Mới nhất
                      </button>
                      <button
                        onClick={() => handleSortDesAndAsc("asc")}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                      >
                        Giá: thấp - cao
                      </button>
                      <button
                        onClick={() => handleSortDesAndAsc("desc")}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                      >
                        Giá: cao - thấp
                      </button>
                      <button
                        onClick={() => handleSortSold("hot")}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                      >
                        Bán chạy nhất
                      </button>

                      <button
                        onClick={() => handleSortView("asc")}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                      >
                        Lượt xem nhiều nhất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="clothing-male-grid">
              {loading ? (
                [...Array(12)].map((_, index) => <SkeletonCard key={index} />)
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="clothing-male-card bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      <img
                        className="clothing-male-image w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={
                          product.variants[0]?.images[0]?.url ||
                          "/placeholder.svg?height=250&width=350"
                        }
                        alt={product.name}
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          -{product.discount}%
                        </span>
                      )}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {isProductInWishlist.includes(product._id) ? (
                          <>
                            <button
                              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                              onClick={() => handleRemoveWishList(product._id)}
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
                ))
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
            <span className="text-lg font-semibold text-gray-900">
              Bộ lọc sản phẩm
            </span>
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
