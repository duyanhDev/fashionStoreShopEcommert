import { useDispatch, useSelector } from "react-redux";
import "./Style.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchProductsByNameAPI } from "../../service/ApiProduct";
import { Search as SearchAction } from "../../redux/actions/Auth";
import ProductCart from "../ProductCart/ProductCart";
import {
  addToWishlistAPI,
  getWishlistAPI,
  RemoveToWishListAPI,
} from "../../service/WishList";
import { notification } from "antd";
const ViewSearch = ({}) => {
  const { data, totalpage } = useSelector((state) => state.search);
  const dispatch = useDispatch();
  const [DataProducts, setDataProducts] = useState(data);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const navigate = useNavigate();
  const [modalCartOpen, setModalCartOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const [WishList, setWishList] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchKeyword = params.get("q") || "";

  const handleAPISerchData = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    try {
      const res = await searchProductsByNameAPI(searchKeyword, nextPage);
      if (res?.data) {
        setDataProducts((prev) => [...prev, ...res.data.data]);
        dispatch(SearchAction(res.data.data, res.data.totalPages));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDataProducts(data);
    setPage(1);
  }, [searchKeyword]);

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

  const ProductCard = ({ product }) => (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl ${
        viewMode === "grid"
          ? "bg-white rounded-2xl p-5 border border-gray-200 hover:border-green-300 hover:-translate-y-2 flex flex-col shadow-lg hover:shadow-green-100"
          : "bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 flex flex-row items-center gap-4 hover:shadow-lg shadow-md hover:shadow-green-50"
      }`}
    >
      {/* Product Image */}
      <div
        className={`relative overflow-hidden rounded-xl ${
          viewMode === "grid"
            ? "aspect-square mb-4 w-full"
            : "w-24 h-24 flex-shrink-0"
        }`}
      >
        <img
          src={
            product.variants && product.variants.length > 0
              ? product.variants[0]?.images[0]?.url
              : "fallback-image-url.jpg"
          }
          alt={product.name || "Sản phẩm"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
          <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            {isProductInWishlist?.includes(product._id) ? (
              <>
                <button
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
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
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                onClick={() => handlAddWishList(product._id)}
              >
                <svg
                  className="w-4 h-4 text-red-500"
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
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
              onClick={() => navigate(`/product/${product.slug}`)}
            >
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className={`${viewMode === "grid" ? "space-y-3 flex-1" : "flex-1"}`}>
        <h3
          className={`font-semibold text-gray-800 line-clamp-2 group-hover:text-green-600 transition-colors ${
            viewMode === "grid" ? "text-sm h-10 leading-5" : "text-base"
          }`}
          onClick={() => navigate(`/product/${product.slug}`)}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5 fill-current drop-shadow-sm"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-600 font-medium">(4.5)</span>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.costPrice)}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <p className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full inline-block">
              Tiết kiệm{" "}
              {formatPrice(product.costPrice - product.discountedPrice)}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => {
            handelModelProductCart(
              product._id,
              product.variants,
              product.discountedPrice,
              product.costPrice,
              product.name,
              product.discount
            );
            setModalCartOpen(true);
            // Add to cart logic here
          }}
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Thêm vào giỏ
        </button>
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 mt-28">
      {/* Header Section */}

      {contextHolder}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                Kết quả tìm kiếm
              </h1>
              {searchKeyword && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
                  <p className="text-green-100 text-sm mb-1">
                    Từ khóa tìm kiếm:
                  </p>
                  <p className="text-white font-semibold text-lg">
                    "{searchKeyword}"
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-sm">
                    Tìm thấy{" "}
                    <span className="font-bold text-white">
                      {DataProducts?.length || 0}
                    </span>{" "}
                    sản phẩm
                  </span>
                </div>
                {DataProducts?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">Kết quả chính xác</span>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-200 font-medium">
                Hiển thị:
              </span>
              <div className="flex bg-black/20 backdrop-blur-sm rounded-xl p-1.5 border border-white/20">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white text-green-600 shadow-lg transform scale-105"
                      : "text-green-200 hover:text-white hover:bg-white/10"
                  }`}
                  title="Hiển thị dạng lưới"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white text-green-600 shadow-lg transform scale-105"
                      : "text-green-200 hover:text-white hover:bg-white/10"
                  }`}
                  title="Hiển thị dạng danh sách"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full mx-auto sm:px-2 lg:px-8 py-8">
        {DataProducts && DataProducts.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-2 lg:gap-4"
                  : "space-y-4"
              }
            >
              {DataProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {totalpage > page && (
              <div className="flex justify-center mt-12">
                <button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300"
                  onClick={handleAPISerchData}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải thêm sản phẩm...</span>
                    </>
                  ) : (
                    <>
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>Xem thêm sản phẩm</span>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả. Bạn
              cũng có thể duyệt qua các danh mục sản phẩm của chúng tôi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => navigate("/categories")}
                className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Xem danh mục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSearch;
