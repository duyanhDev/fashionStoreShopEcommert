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

export default function Clothing({ ListProducts }) {
  const desc = ["terrible", "bad", "normal", "good", "wonderful"];
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

  const handleRate = (id, value) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const SkeletonCard = () => (
    <Card
      className="w-full rounded-xl overflow-hidden"
      cover={<Skeleton.Image active className="w-full h-48 object-cover" />}
    >
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  );

  const handleDetails = (slug) => navigate(`product/${slug}`);

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
  const ProductCard = ({ product }) => (
    <div className="product-card rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          src={product.variants[0]?.images[0]?.url || "/default-image.jpg"}
          alt={product.name}
        />
        {typeof product.discount !== "undefined" && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{product.discount || 0}%
          </span>
        )}
        <div className="absolute bottom-2 right-2 flex gap-2 ">
          {isProductInWishlist.includes(product._id) ? (
            <>
              <button
                className="p-1.5 rounded-full shadow-md "
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
          )}
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
      <div className="p-3" onClick={() => handleDetails(product.slug)}>
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
  );

  const renderProductSection = (title, products, visibleCount, onLoadMore) => (
    <section className="py-8">
      <div className="max-w-full  md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 relative inline-block">
          {title}
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded"></span>
        </h2>
        <div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6"
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
        {visibleCount < products.length && (
          <div className="mt-8 text-center">
            <Button onClick={onLoadMore} className="btn-load-more">
              XEM THÊM
            </Button>
          </div>
        )}
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
    </section>
  );

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {contextHolder}
      <section className="py-8">
        <div className="max-w-full md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1280px] 2xl:max-w-[1536px]  lg:px-8">
          <div
            className="grid grid-cols-2 sm:grid-cols-2 mx-3 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6"
            data-aos="fade-up"
          >
            {loading
              ? [...Array(20)].map((_, i) => <SkeletonCard key={i} />)
              : ListProducts.slice(0, visibleItems).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
          {visibleItems < ListProducts.length && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => setVisibleItems((prev) => prev + itemsPerLoad)}
                className="btn-load-more"
              >
                XEM THÊM
              </Button>
            </div>
          )}
        </div>
      </section>

      {renderProductSection("ÁO", aoProducts, visibleAoItems, () =>
        setVisibleAoItems((prev) => prev + itemsPerLoad)
      )}
      {renderProductSection("QUẦN", quanProducts, visibleQuanItems, () =>
        setVisibleQuanItems((prev) => prev + itemsPerLoad)
      )}
      {renderProductSection("GIÀY", giayProducts, visibleGiayItems, () =>
        setVisibleGiayItems((prev) => prev + itemsPerLoad)
      )}
    </div>
  );
}
