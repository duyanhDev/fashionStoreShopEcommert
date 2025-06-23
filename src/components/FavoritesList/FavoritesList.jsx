import { useEffect, useState, useMemo } from "react";
import { HiHeart, HiOutlineHeart, HiOutlineShoppingCart } from "react-icons/hi";
import { HiMiniAdjustmentsHorizontal } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getWishlistAPI, RemoveToWishListAPI } from "../../service/WishList";
import { AddCartAPI } from "../../service/Cart";

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?._id) {
        console.log("No user ID found");
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        console.log("Fetching favorites for user:", user._id);
        const res = await getWishlistAPI(user._id);
        console.log("API response:", res.data);
        if (res && res.data && res.data.EC === 0) {
          // Đảm bảo res.data.data là mảng
          const data = Array.isArray(res.data.data.products)
            ? res.data.data.products
            : [];
          setFavorites(data);
        } else {
          setError(res?.data?.EM || "Không thể tải danh sách yêu thích");
          setFavorites([]); // Đặt lại thành mảng rỗng nếu lỗi
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Đã xảy ra lỗi khi tải danh sách yêu thích");
        setFavorites([]); // Đặt lại thành mảng rỗng nếu lỗi
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user?._id]);

  const removeFromFavorites = async (wishlistItemId, productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await RemoveToWishListAPI(user._id, wishlistItemId);
      if (res && res.data && res.data.EC === 0) {
        setFavorites(favorites.filter((item) => item._id !== wishlistItemId));
      } else {
        alert(res?.data?.EM || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Đã xảy ra lỗi khi xóa sản phẩm");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await AddCartAPI(user._id, productId);
      if (res && res.data && res.data.EC === 0) {
        alert("Đã thêm vào giỏ hàng!");
      } else {
        alert(res?.data?.EM || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Đã xảy ra lỗi khi thêm vào giỏ hàng");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
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
      const promises = inStockItems.map((item) =>
        AddCartAPI(user._id, item.product._id)
      );
      const results = await Promise.all(promises);
      const failed = results.filter((res) => res.data.EC !== 0);
      if (failed.length === 0) {
        alert(`Đã thêm ${inStockItems.length} sản phẩm vào giỏ hàng!`);
      } else {
        alert("Một số sản phẩm không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Error adding all to cart:", error);
      alert("Đã xảy ra lỗi khi thêm vào giỏ hàng");
    } finally {
      setActionLoading((prev) => ({ ...prev, all: false }));
    }
  };

  console.log("Favorites:", favorites);

  return (
    <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <HiHeart className="text-red-500 mr-2" />
          Danh sách yêu thích
          <span className="ml-2 text-sm font-medium text-gray-500">
            ({favorites.length || 0} sản phẩm)
          </span>
        </h1>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HiMiniAdjustmentsHorizontal className="mr-2 text-gray-500" />
            Lọc
          </button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div className="py-1" role="menu" aria-orientation="vertical">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setFilter(category);
                      setShowFilters(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filter === category
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } hover:bg-gray-50`}
                    role="menuitem"
                  >
                    {filterLabels[category] || category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div class nephews="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <HiOutlineHeart className="w-16 h-16 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Danh sách yêu thích trống
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => (window.location.href = "/products")}
            >
              Khám phá sản phẩm
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                Đang hiển thị:{" "}
                <span className="font-medium text-gray-900">
                  {filterLabels[filter] || filter}
                </span>
              </p>
            </div>
            <button
              onClick={handleAddAllToCart}
              disabled={actionLoading.all}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                actionLoading.all ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <HiOutlineShoppingCart className="mr-2" />
              {actionLoading.all ? "Đang xử lý..." : "Thêm tất cả vào giỏ"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-sdn gap-6">
            {filteredItems.map((item) => {
              console.log("Item:", item);
              const product = item.product || {};
              const imageUrl =
                product.variants?.[0]?.images?.[0]?.url || "/default-image.png";
              const price = product.price || 0;
              const discountedPrice = product.discountedPrice || price;

              return (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 flex flex-col justify-between bg-white shadow-sm"
                >
                  <div>
                    <img
                      src={imageUrl}
                      alt={product.name || "Sản phẩm"}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name || "Không có tên"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Loại hàng:{" "}
                      {filterLabels[product.category] ||
                        product.category ||
                        "Không xác định"}
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      {getTotalStock(product) > 0 ? (
                        <span className="text-green-600 font-semibold">
                          Còn hàng
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Hết hàng
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-lg font-bold text-indigo-600">
                      {discountedPrice < price && discountedPrice !== 0 ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">
                            {formatPrice(price)}
                          </span>
                          <span>{formatPrice(discountedPrice)}</span>
                        </>
                      ) : (
                        <span>{formatPrice(price)}</span>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => removeFromFavorites(item._id, product._id)}
                      disabled={actionLoading[product._id]}
                      className={`inline-flex items-center px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition ${
                        actionLoading[product._id]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {actionLoading[product._id] ? "Đang xóa..." : "Xóa"}
                    </button>
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={
                        getTotalStock(product) <= 0 ||
                        actionLoading[product._id]
                      }
                      className={`inline-flex items-center px-3 py-1 border border-indigo-600 rounded text-indigo-600 hover:bg-indigo-600 hover:text-white transition ${
                        getTotalStock(product) <= 0 ||
                        actionLoading[product._id]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {actionLoading[product._id]
                        ? "Đang thêm..."
                        : "Thêm vào giỏ"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoritesList;
