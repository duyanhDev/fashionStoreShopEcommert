import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWishlistAPI, RemoveToWishListAPI } from "../../service/WishList";
import { useSelector } from "react-redux";
import { addMultipleToCart } from "../../service/Cart";
import ProductCart from "../ProductCart/ProductCart";
import { useNavigate, useOutletContext } from "react-router-dom";

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [modalCartOpen, setModalCartOpen] = useState(false);

  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const { CartListProductsUser } = useOutletContext();

  const removeFromFavorites = async (wishlistItemId, productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));

    // Simulate API call
    const res = await RemoveToWishListAPI(user._id, productId);
    if (res) {
      setTimeout(() => {
        setFavorites((prev) =>
          prev.filter((item) => item._id !== wishlistItemId)
        );
        setActionLoading((prev) => ({ ...prev, [productId]: false }));
      }, 1000);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Liên hệ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const getTotalStock = (product) => {
    return product?.stock || 0;
  };

  const filteredItems = useMemo(() => {
    if (!Array.isArray(favorites)) return [];
    if (filter === "all") return favorites;
    if (filter === "inStock")
      return favorites.filter((item) => getTotalStock(item.product) > 0);
    if (filter === "outOfStock")
      return favorites.filter((item) => getTotalStock(item.product) <= 0);
    return favorites.filter((item) => item.product?.category === filter);
  }, [favorites, filter]);

  const categories = useMemo(() => {
    if (!Array.isArray(favorites)) return ["all", "inStock", "outOfStock"];
    const categoryIds = [
      ...new Set(
        favorites.map((item) => item.product?.category).filter(Boolean)
      ),
    ];
    return ["all", "inStock", "outOfStock", ...categoryIds];
  }, [favorites]);

  const filterLabels = {
    all: "Tất cả",
    inStock: "Còn hàng",
    outOfStock: "Hết hàng",
    "67242f4095a1d8ea4d6a9249": "Quần áo",
    "6725c76b8e7bbe9af497f624": "Giày",
  };

  const handleAddAllToCart = async () => {
    const inStockItems = favorites.filter(
      (item) => getTotalStock(item.product) > 0
    );

    if (inStockItems.length === 0) {
      alert("Không có sản phẩm nào còn hàng để thêm vào giỏ!");
      return;
    }

    setActionLoading((prev) => ({ ...prev, all: true }));

    try {
      const res = await addMultipleToCart(user._id, inStockItems);

      if (res && res.data) {
        alert(`Đã thêm ${inStockItems.length} sản phẩm vào giỏ hàng!`);
        CartListProductsUser();
      }
    } catch (error) {
      console.error(error);
      alert("Thêm vào giỏ hàng thất bại!");
    } finally {
      setActionLoading((prev) => ({ ...prev, all: false }));
    }
  };

  const getWishlist = async () => {
    try {
      const res = await getWishlistAPI(user._id);

      if (res && res.data && res.data.EC === 0) {
        setFavorites(res.data.data.products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getWishlist();
  }, [user._id]);

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
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900 opacity-95"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center items-center mb-4 md:mb-6">
              <div className="bg-green-500 p-3 md:p-4 rounded-full shadow-lg">
                <svg
                  className="w-10 h-10 md:w-12 md:h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
              Danh sách yêu thích
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
              {favorites.length} sản phẩm đang chờ bạn
            </p>

            {/* Filter Section */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setFilter(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                    filter === category
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-white/10 text-white hover:bg-green-500/20 backdrop-blur-sm border border-white/20"
                  }`}
                >
                  {filterLabels[category] || category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 md:p-4 rounded-lg mb-6 md:mb-8"
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 md:py-20 bg-white rounded-2xl shadow-lg border border-gray-200"
          >
            <div className="bg-gray-100 p-6 md:p-8 rounded-full mb-4 md:mb-6">
              <svg
                className="w-12 h-12 md:w-16 md:h-16 text-gray-400"
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
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Danh sách yêu thích trống
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 text-center max-w-md">
              Hãy khám phá và thêm những sản phẩm yêu thích của bạn vào đây!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-medium shadow-lg transition-all duration-300"
              onClick={() => (window.location.href = "/")}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 inline mr-2"
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
              Khám phá sản phẩm
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-green-100 p-2 md:p-3 rounded-lg">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Đang hiển thị
                    </p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">
                      {filterLabels[filter] || filter} • {filteredItems.length}{" "}
                      sản phẩm
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleAddAllToCart}
                  disabled={
                    actionLoading.all ||
                    filteredItems.filter(
                      (item) => getTotalStock(item.product) > 0
                    ).length === 0
                  }
                  whileHover={{ scale: actionLoading.all ? 1 : 1.05 }}
                  whileTap={{ scale: actionLoading.all ? 1 : 0.95 }}
                  className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center gap-2 ${
                    actionLoading.all ||
                    filteredItems.filter(
                      (item) => getTotalStock(item.product) > 0
                    ).length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl"
                  }`}
                >
                  {actionLoading.all ? (
                    <>
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                      Thêm tất cả vào giỏ
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence>
                {filteredItems.map((item, index) => {
                  const product = item.product || {};
                  const imageUrl =
                    product.variants?.[0]?.images?.[0]?.url ||
                    "/default-image.png";
                  const price = product.price || 0;
                  const discountedPrice = product.discountedPrice || price;
                  const hasDiscount =
                    discountedPrice < price && discountedPrice !== 0;
                  const isInStock = getTotalStock(product) > 0;

                  return (
                    <motion.div
                      key={item._id}
                      onClick={() => navigate(`/product/${product.slug}`)}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name || "Sản phẩm"}
                          className="w-full h-48 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1 md:gap-2">
                          {hasDiscount && (
                            <div className="bg-green-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                              -
                              {Math.round(
                                ((price - discountedPrice) / price) * 100
                              )}
                              %
                            </div>
                          )}
                          {!isInStock && (
                            <div className="bg-black text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg">
                              Hết hàng
                            </div>
                          )}
                        </div>

                        {/* Heart Icon */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4">
                          <div className="bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-full shadow-lg">
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </div>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 md:p-6">
                        <div className="mb-3 md:mb-4">
                          <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                            {product.name || "Không có tên"}
                          </h3>

                          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                            <span className="text-xs md:text-sm text-gray-500">
                              {filterLabels[product.category] ||
                                product.category ||
                                "Không xác định"}
                            </span>
                            <div
                              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                                isInStock ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <span
                              className={`text-[10px] md:text-xs font-medium ${
                                isInStock ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isInStock ? "Còn hàng" : "Hết hàng"}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1 md:gap-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-xl md:text-2xl font-bold text-green-600">
                                  {formatPrice(discountedPrice)}
                                </span>
                                <span className="text-xs md:text-sm text-gray-400 line-through">
                                  {formatPrice(price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl md:text-2xl font-bold text-gray-900">
                                {formatPrice(price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 md:gap-3">
                          <motion.button
                            onClick={() =>
                              removeFromFavorites(item._id, product._id)
                            }
                            disabled={actionLoading[product._id]}
                            whileHover={{
                              scale: actionLoading[product._id] ? 1 : 1.05,
                            }}
                            whileTap={{
                              scale: actionLoading[product._id] ? 1 : 0.95,
                            }}
                            className={`flex-1 bg-gray-100 hover:bg-black hover:text-white text-gray-700 py-2 px-3 md:py-3 md:px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${
                              actionLoading[product._id]
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {actionLoading[product._id] ? (
                              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 md:w-4 md:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Xóa
                              </>
                            )}
                          </motion.button>

                          <motion.button
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
                            disabled={!isInStock || actionLoading[product._id]}
                            whileHover={{
                              scale:
                                !isInStock || actionLoading[product._id]
                                  ? 1
                                  : 1.05,
                            }}
                            whileTap={{
                              scale:
                                !isInStock || actionLoading[product._id]
                                  ? 1
                                  : 0.95,
                            }}
                            className={`flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 md:py-3 md:px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${
                              !isInStock || actionLoading[product._id]
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-lg"
                            }`}
                          >
                            {actionLoading[product._id] ? (
                              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 md:w-4 md:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                  />
                                </svg>
                                Thêm
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
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
};

export default FavoritesList;
