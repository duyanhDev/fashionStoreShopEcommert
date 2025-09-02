import "./Clothing.css";
import { Flex, Rate, Skeleton, Card, Button, notification } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ProductCart from "../../ProductCart/ProductCart";
import {
  addToWishlistAPI,
  getWishlistAPI,
  RemoveToWishListAPI,
} from "../../../service/WishList";
import { useSelector } from "react-redux";
import { updateViewProductAPI } from "../../../service/ApiProduct";

export default function Clothing({ ListProducts }) {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [modalCartOpen, setModalCartOpen] = useState(false);
  const [IdProduct, setIdProducts] = useState("");
  const [listItems, setListItems] = useState();
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [productname, setProductname] = useState("");
  const [discount, setDiscount] = useState(0);
  const [visibleItems, setVisibleItems] = useState(20);
  const [visibleAoItems, setVisibleAoItems] = useState(20);
  const [visibleQuanItems, setVisibleQuanItems] = useState(20);
  const [visibleGiayItems, setVisibleGiayItems] = useState(20);
  const [WishList, setWishList] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const itemsPerLoad = 20;

  const aoProducts = ListProducts.filter(
    (p) => p.category && p.category.name === "Áo"
  );
  const quanProducts = ListProducts.filter(
    (p) => p.category && p.category.name === "Quần"
  );
  const giayProducts = ListProducts.filter(
    (p) => p.category && p.category.name === "Giày"
  );

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const SkeletonCard = () => (
    <Card className="w-full rounded-2xl overflow-hidden shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="animate-pulse">
        <div className="w-full h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer w-3/4"></div>
          <div className="h-6 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full bg-[length:200%_100%] animate-shimmer w-1/2"></div>
        </div>
      </div>
    </Card>
  );

  const handleDetails = async (slug) => {
    const res = await updateViewProductAPI(slug);
    if (res && res.data && res.data.EC === 0) {
      navigate(`/product/${slug}`);
    }
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

  const ProductCard = ({ product }) => (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
      onMouseEnter={() => setHoveredProduct(product._id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          className="w-full h-56 object-cover transition-all duration-700 group-hover:scale-110"
          src={product.variants[0]?.images[0]?.url || "/default-image.jpg"}
          alt={product.name}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Discount Badge */}
        {typeof product.discount !== "undefined" && product.discount > 0 && (
          <div className="absolute top-4 right-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-xl animate-pulse">
                <span className="relative z-10">-{product.discount}%</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-full blur-sm opacity-50 animate-ping"></div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div
          className={`absolute bottom-4 right-4 flex gap-2 transform transition-all duration-300 ${
            hoveredProduct === product._id
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {/* Wishlist Button */}
          {isProductInWishlist.includes(product._id) ? (
            <button
              className="group/btn relative p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
              onClick={() => handleRemoveWishList(product._id)}
            >
              <svg
                className="w-5 h-5 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-pink-400 blur-md opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
            </button>
          ) : (
            <button
              className="group/btn relative p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 shadow-xl hover:shadow-2xl transform hover:scale-110 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-300"
              onClick={() => handlAddWishList(product._id)}
            >
              <svg
                className="w-5 h-5"
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
          )}

          {/* Cart Button */}
          <button
            className="group/btn relative p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
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
              className="w-5 h-5"
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur-md opacity-50 group-hover/btn:opacity-75 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => handleDetails(product.slug)}
      >
        {/* Brand */}
        <div className="flex items-center mb-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200 tracking-wider uppercase">
            {product.brand}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-emerald-600 mb-1">
              {formatPrice(product.discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <div className="text-right">
              <span className="text-sm text-red-500 font-medium">
                Tiết kiệm {formatPrice(product.price - product.discountedPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              {formatNumberToShort(product.view)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <svg
              className="w-4 h-4 text-orange-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 18a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{product.sold || 0} đã bán</span>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-200 transition-all duration-300 pointer-events-none"></div>
    </div>
  );

  const renderProductSection = (title, products, visibleCount, onLoadMore) => (
    <section className="py-12 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/80"></div>

      <div className="relative max-w-full md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px] mx-auto ">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">{title}</span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-orange-300 to-red-300 rounded-full opacity-50"></div>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá bộ sưu tập {title.toLowerCase()} mới nhất với thiết kế hiện
            đại và chất lượng cao
          </p>
        </div>

        {/* Products Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-2 "
          data-aos="fade-up"
        >
          {loading
            ? [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
            : products
                .slice(0, visibleCount)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
        </div>

        {/* Load More Button */}
        {visibleCount < products.length && (
          <div className="mt-12 text-center">
            <Button
              onClick={onLoadMore}
              className="relative group px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              size="large"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>XEM THÊM SẢN PHẨM</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </Button>
          </div>
        )}
      </div>
    </section>
  );

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="min-h-screen ">
      {contextHolder}

      {/* Main Hero Section */}
      <section className="py-12 relative overflow-hidden">
        {/* Animated Background */}
        <div className=""></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/2 w-40 h-40 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
        </div>

        <div className="relative max-w-full md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px] lg:px-8">
          {/* Featured Products Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-2"
            data-aos="fade-up"
          >
            {loading
              ? [...Array(20)].map((_, i) => <SkeletonCard key={i} />)
              : ListProducts.slice(0, visibleItems).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>

          {/* Load More for Main Section */}
          {visibleItems < ListProducts.length && (
            <div className="mt-12 text-center">
              <Button
                onClick={() => setVisibleItems((prev) => prev + itemsPerLoad)}
                className="relative group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                size="large"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <span className="text-lg">KHÁM PHÁ THÊM</span>
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Category Sections */}
      {renderProductSection("ÁO THỜI TRANG", aoProducts, visibleAoItems, () =>
        setVisibleAoItems((prev) => prev + itemsPerLoad)
      )}
      {renderProductSection(
        "QUẦN PHONG CÁCH",
        quanProducts,
        visibleQuanItems,
        () => setVisibleQuanItems((prev) => prev + itemsPerLoad)
      )}
      {renderProductSection(
        "GIÀY SNEAKER",
        giayProducts,
        visibleGiayItems,
        () => setVisibleGiayItems((prev) => prev + itemsPerLoad)
      )}

      {/* Product Cart Modal */}
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

      {/* Custom Styles */}
    </div>
  );
}
