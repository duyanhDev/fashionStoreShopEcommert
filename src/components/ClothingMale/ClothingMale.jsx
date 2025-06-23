import { useCallback, useEffect, useRef, useState } from "react";
import "./ClothingMale.css";
import { Radio, Space, Slider, Button, Card, Skeleton, Flex, Rate } from "antd";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ListCategoryAPI } from "../../service/ApiCategory";
import ReactPaginate from "react-paginate";
import { fetchProducts } from "../../redux/actions/filterAction";
import SliderComponent from "../Slider/Slider";
import ProductCart from "../ProductCart/ProductCart";

const ClothingMale = () => {
  const param = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // Fixed: lowercase navigate
  const dispatch = useDispatch();
  const [modalCartOpen, setModalCartOpen] = useState(false);

  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);

  const desc = ["terrible", "bad", "normal", "good", "wonderful"];

  const [ratings, setRatings] = useState({});

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
  const savedSortPrice = queryParams.get("sortPrice") || "";
  const savedCategory = queryParams.get("Category") || "";
  const savedCurrentPage = parseInt(queryParams.get("currentPage")) || 1;
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
      color: colorParms, // Use URL params for consistency
      currentPage: savedCurrentPage,
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
          // Sync state with URL on mount
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
  }, []); // Run only once on mount

  // Fetch products when URL changes or categories load
  useEffect(() => {
    if (listCategory.length > 0) {
      const params = getFetchParams();
      dispatch(fetchProducts(params));
    }
  }, [param.gender, location.search, listCategory.length, dispatch]); // Depend on URL changes

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
  };

  const formatPrice = (price) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";

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
    let color = value;
    setColor(value);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("color", color);
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
      style={{ width: 260, marginLeft: "2px" }}
      cover={<Skeleton.Image active style={{ width: "100%", height: 200 }} />}
    >
      <Skeleton active paragraph={{ rows: 6 }} />
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
        return "Không có giới tinh";
    }
  };

  const handleDetails = (id) => {
    navigate(`/product/${id}`);
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

  return (
    <section>
      <SliderComponent />
      <div className="flex colletion">
        <div className="colletion_left">
          <div>
            <h1>Loại sản phẩm</h1>
            <Radio.Group className="mr-5" onChange={onChange} value={valueId}>
              <Space direction="vertical">
                {listCategory.length > 0 &&
                  listCategory.map((category) => (
                    <Radio value={category._id} key={category._id}>
                      {category.name}
                    </Radio>
                  ))}
              </Space>
            </Radio.Group>
          </div>
          <div>
            <h1 className="mt-2">Bộ sưu tập</h1>
            <Radio.Group
              className="mr-5"
              onChange={onChangeCare}
              value={selectedCare}
            >
              <Space direction="vertical">
                {products &&
                  products
                    .filter(
                      (item, index, self) =>
                        index === self.findIndex((t) => t.care === item.care)
                    )
                    .map((item) => (
                      <Radio key={item.care} value={item.care}>
                        {item.care}
                      </Radio>
                    ))}
              </Space>
            </Radio.Group>
          </div>
          <div className="mt-2">
            <h1>Kích cỡ</h1>
            <div className="w-52 collection_size">
              <ul className="flex items-center flex-wrap">
                {["S", "M", "L", "XL", "XXL", "28", "29", "30", "31", "32"].map(
                  (sizeOption) => (
                    <li className="size_products" key={sizeOption}>
                      <input
                        type="checkbox"
                        id={`size-${sizeOption}`}
                        value={sizeOption}
                        checked={size.includes(sizeOption)}
                        onChange={() => handleCheckboxChange(sizeOption)}
                      />
                      <label htmlFor={`size-${sizeOption}`}>
                        <span>{sizeOption}</span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="mt-2">
            <h1>Màu sắc</h1>

            <div className="grid grid-cols-4 -ml-6 ">
              <div className="filter-select-color__item-list flex justify-center">
                <input
                  type="radio"
                  id="color_yellow"
                  name="color" // Ensure all radio buttons share the same name
                  className="m-auto flex items-center mt-2"
                  value="vàng"
                  onChange={() => handleOnClickColor("vàng")}
                />
                <label htmlFor="color_yellow">
                  <div className="filter-select-color_button flex items-center justify-center m-auto"></div>
                  <span className="text-center">Vàng</span>
                </label>
              </div>
              <div className="filter-select-color__item-list flex justify-center">
                <input
                  type="radio"
                  id="color_green"
                  name="color" // Ensure all radio buttons share the same name
                  className="m-auto flex items-center mt-2"
                  value="xanh lá cây"
                  onChange={() => handleOnClickColor("xanh lá cây")}
                />
                <label htmlFor="color_green">
                  <div className="filter-select-green flex items-center justify-center m-auto"></div>
                  <span className="text-center">Xanh lá</span>
                </label>
              </div>

              <div className="filter-select-color__item-list flex justify-center ">
                <input
                  type="radio"
                  id="color_black"
                  name="color"
                  className="m-auto flex items-center mt-2"
                  value="đen"
                  onChange={() => handleOnClickColor("đen")}
                />

                <label htmlFor="color_black">
                  <div className="filter-select-black flex items-center justify-center m-auto"></div>
                  <span className="text-center m">Đen</span>
                </label>
              </div>
              <div className="filter-select-color__item-list flex justify-center  ">
                <input
                  type="radio"
                  id="color_red"
                  name="color"
                  className="m-auto flex items-center mt-2"
                  value="đỏ"
                  onChange={() => handleOnClickColor("đỏ")}
                />
                <label htmlFor="color_red">
                  <div className="filter-select-red flex items-center justify-center m-auto"></div>
                  <span className="text-center m">Đỏ</span>
                </label>
              </div>
              <div className="filter-select-color__item-list flex justify-center ">
                <input
                  type="radio"
                  id="color_white"
                  name="color"
                  className="m-auto flex items-center mt-2"
                  value="trắng"
                  onChange={() => handleOnClickColor("trắng")}
                />
                <label htmlFor="color_white">
                  <div className="filter-select-white flex items-center justify-center m-auto"></div>
                  <span className="text-center m">trắng</span>
                </label>
              </div>
            </div>
            {/* Repeat for other colors */}

            <div className="w-52">
              <h1>Lọc theo giá</h1>
              <Slider
                className="w-full"
                range
                marks={marks}
                value={priceRange}
                min={0}
                max={1000000}
                step={50000}
                onChange={handleRangeChange}
              />
            </div>
          </div>
        </div>
        <div className="colletion_right flex-1">
          <div className="home_item_products w-full flex justify-between items-center px-10 ">
            <div className="flex items-center gap-3">
              <Link>
                <h1 className="text-[#a3a3a3]">Trang chủ</h1>
              </Link>
              /
              <Link>
                <h1 className="text-[#a3a3a3]">
                  Đồ {OptionGender(param.gender)}
                </h1>
              </Link>
            </div>
            <div
              className="flex items-center gap-3 home_item_products_div
             "
            >
              <Link>
                <h1 className="text-[#333] text-xl font-bold">
                  Đồ {OptionGender(param.gender)}
                </h1>
              </Link>
              /
              <Link className="ml-3 font-normal products_link relative">
                Trang {savedCurrentPage} - {products.length} sản phẩm
              </Link>
            </div>
          </div>
          <div className="mt-5">
            <div className="ml-10 mt-5 sort_product_items">
              <div className="relative ">
                <ul className="flex items-center gap-3">
                  <div ref={menuRef}>
                    <li
                      className="male_clothing"
                      onClick={() => setCheckFilter((prev) => !prev)}
                    >
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full dark:bg-[#070e41] bg-[#ffffff] px-8 py-1 text-sm font-medium dark:text-gray-50 text-black backdrop-blur-3xl">
                        SẮP XẾP THEO
                      </span>
                    </li>
                    {checkFilter && (
                      <ul className="top-12 absolute z-40 sort_products">
                        <li onClick={() => handleSortDate("newest")}>
                          Mới nhất
                        </li>
                        <li onClick={() => handleSortDesAndAsc("asc")}>
                          Giá: thấp - cao
                        </li>
                        <li onClick={() => handleSortDesAndAsc("desc")}>
                          Giá: cao - thấp
                        </li>
                        <li onClick={() => handleSortSold("hot")}>
                          Bán chạy nhất
                        </li>
                      </ul>
                    )}
                  </div>
                  {hidden && (
                    <li className="male_clothing" onClick={handleFilterProduct}>
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full dark:bg-[#070e41] bg-[#ffffff] px-8 py-1 text-sm font-medium dark:text-gray-50 text-black backdrop-blur-3xl">
                        XÓA LỌC
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-3 male_left">
              <div className="grid grid-cols-1 sm:grid-cols-2 mx-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  [...Array(20)].map((_, index) => <SkeletonCard key={index} />)
                ) : products && products.length > 0 ? (
                  products.map((product, index) => (
                    <div
                      className="product-card group rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
                      key={product._id}
                    >
                      <div className="relative">
                        <img
                          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                          src={
                            product.variants[0]?.images[0]?.url ||
                            "/default-image.jpg"
                          }
                          alt={product.name}
                        />
                        {typeof product.discount !== "undefined" && (
                          <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            -{product.discount || 0}%
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-600"
                              fill="none"
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
                          <button
                            className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
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
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                        className="p-3"
                        onClick={() => handleDetails(product._id)}
                      >
                        <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                          {product.brand}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mt-1">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <span className="text-base font-bold text-red-600">
                              {formatPrice(product.discountedPrice)}
                            </span>

                            {product.discount > 0 && (
                              <span className="text-xs  text-gray-500 line-through ml-2">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Flex className="mt-2">
                          <Rate
                            tooltips={desc}
                            onChange={(value) => handleRate(product._id, value)}
                            value={ratings[product._id] || 0}
                            className="text-yellow-400"
                          />
                        </Flex>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex w-full h-80 justify-center items-center whitespace-pre-wrap">
                    <p>Không tìm thấy sản phẩm...</p>
                  </div>
                )}
              </div>
              <div className="mt-10 flex justify-center items-center">
                {products && products.length > 0 && (
                  <ReactPaginate
                    previousLabel={
                      <svg
                        viewBox="64 64 896 896"
                        focusable="false"
                        data-icon="left"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" />
                      </svg>
                    }
                    nextLabel={
                      <svg
                        viewBox="64 64 896 896"
                        focusable="false"
                        data-icon="right"
                        width="16px"
                        height="16px"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z" />
                      </svg>
                    }
                    initialPage={savedCurrentPage - 1}
                    breakLabel={null}
                    pageCount={totalPages}
                    marginPagesDisplayed={3}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName="flex items-center gap-2"
                    pageLinkClassName="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                    activeLinkClassName="bg-blue-500 text-white"
                    previousClassName="p-2"
                    nextClassName="p-2"
                    disabledClassName="opacity-50"
                  />
                )}
              </div>
            </div>
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
        </div>
      </div>
    </section>
  );
};

export default ClothingMale;
