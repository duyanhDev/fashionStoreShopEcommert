import { useState, useEffect } from "react";

const ProductsSection = ({ ListProducts }) => {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer effect
  useEffect(() => {
    const saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 2); // Sale ends in 2 days
    saleEndDate.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = saleEndDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for demonstration
  const mockProducts = [
    {
      _id: "1",
      name: "Áo thun nam basic premium",
      brand: "DOSIN",
      slug: "ao-thun-nam-basic-premium",
      price: 299000,
      discountedPrice: 199000,
      costPrice: 299000,
      discount: 33,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 1250,
      rating: 4.8,
      reviews: 124,
    },
    {
      _id: "2",
      name: "Quần jean nữ skinny",
      brand: "FASHION",
      slug: "quan-jean-nu-skinny",
      price: 450000,
      discountedPrice: 315000,
      costPrice: 450000,
      discount: 30,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 890,
      rating: 4.6,
      reviews: 89,
    },
    {
      _id: "3",
      name: "Hoodie unisex oversize",
      brand: "STREETWEAR",
      slug: "hoodie-unisex-oversize",
      price: 599000,
      discountedPrice: 399000,
      costPrice: 599000,
      discount: 33,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 2100,
      rating: 4.9,
      reviews: 156,
    },
    {
      _id: "4",
      name: "Váy midi hoa nhí vintage",
      brand: "FEMININE",
      slug: "vay-midi-hoa-nhi-vintage",
      price: 380000,
      discountedPrice: 280000,
      costPrice: 380000,
      discount: 26,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 567,
      rating: 4.7,
      reviews: 78,
    },
    {
      _id: "5",
      name: "Áo sơ mi nam công sở",
      brand: "BUSINESS",
      slug: "ao-so-mi-nam-cong-so",
      price: 320000,
      discountedPrice: 240000,
      costPrice: 320000,
      discount: 25,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 1876,
      rating: 4.5,
      reviews: 201,
    },
    {
      _id: "6",
      name: "Chân váy chữ A thanh lịch",
      brand: "ELEGANT",
      slug: "chan-vay-chu-a-thanh-lich",
      price: 250000,
      discountedPrice: 180000,
      costPrice: 250000,
      discount: 28,
      variants: [
        {
          images: [
            {
              url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
            },
          ],
        },
      ],
      isOnSale: true,
      soldCount: 3200,
      rating: 4.9,
      reviews: 298,
    },
  ];

  const products = ListProducts?.length > 0 ? ListProducts : mockProducts;
  const saleProducts = products
    .filter((p) => p.isOnSale || p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 8);
  const bestsellerProducts = products
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 8);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const StarRating = ({ rating, reviews }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating)
              ? "text-yellow-400"
              : i < rating
              ? "text-yellow-300"
              : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({reviews || 0})</span>
    </div>
  );

  const CountdownTimer = () => (
    <div className="flex justify-center items-center gap-4 mb-8">
      <div className="text-white text-sm font-medium">Kết thúc sau:</div>
      <div className="flex gap-2">
        {[
          { label: "Ngày", value: timeLeft.days },
          { label: "Giờ", value: timeLeft.hours },
          { label: "Phút", value: timeLeft.minutes },
          { label: "Giây", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[48px] border border-green-200">
              <div className="text-black font-semibold text-lg">
                {String(item.value).padStart(2, "0")}
              </div>
            </div>
            <div className="text-white text-xs mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProductCard = ({ product, index, section }) => (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setHoveredProduct(product._id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <div className="aspect-square relative bg-gray-50">
          <img
            src={
              product.variants?.[0]?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop" ||
              "/placeholder.svg" ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}
          {section === "bestseller" && index < 3 && (
            <div className="bg-black text-white text-xs font-semibold px-2 py-1 rounded">
              TOP {index + 1}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="bg-green-600 text-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-200">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>

        {/* Bestseller sold count */}
        {section === "bestseller" && product.soldCount && (
          <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
            Đã bán {product.soldCount?.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
            {product.brand}
          </div>
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight hover:text-green-600 transition-colors duration-200 cursor-pointer">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <StarRating rating={product.rating || 4.5} reviews={product.reviews} />

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-green-600">
              {formatPrice(product.discountedPrice || product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.costPrice || product.price)}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <div className="text-sm text-green-600">
              Tiết kiệm{" "}
              {formatPrice(
                (product.costPrice || product.price) -
                  (product.discountedPrice || product.price)
              )}
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100">
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="space-y-16 px-4 max-w-7xl mx-auto py-12">
        {/* Hero Section */}
        <section className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bộ Sưu Tập <span className="text-green-600">Thời Trang</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Khám phá những xu hướng thời trang mới nhất với chất lượng cao và
            giá cả hợp lý
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Miễn phí vận chuyển
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Đổi trả trong 30 ngày
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Chất lượng đảm bảo
            </span>
          </div>
        </section>

        {/* Sale Products Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl">
            <div className="relative py-12 px-6">
              <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <span>🔥</span>
                    <span>FLASH SALE</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Khuyến Mãi Đặc Biệt
                  </h2>
                  <p className="text-white/90 text-base max-w-2xl mx-auto mb-2">
                    Giảm giá lên đến 50% cho các sản phẩm chất lượng cao
                  </p>
                  <p className="text-white/80 text-sm mb-6">
                    ⚡ Số lượng có hạn - Nhanh tay đặt hàng ngay!
                  </p>
                  <CountdownTimer />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {saleProducts.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      section="sale"
                    />
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <button className="bg-white text-green-600 hover:bg-gray-50 font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    Xem tất cả sản phẩm khuyến mãi →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bestseller Products Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-xl border border-gray-200">
            <div className="relative py-12 px-6">
              <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <span>🏆</span>
                    <span>TOP SELLER</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Sản Phẩm Bán Chạy Nhất
                  </h2>
                  <p className="text-gray-600 text-base max-w-2xl mx-auto mb-2">
                    Những sản phẩm được khách hàng tin tưởng và lựa chọn nhiều
                    nhất
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    ⭐ Được đánh giá cao bởi hàng nghìn khách hàng
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        10,000+
                      </div>
                      <div className="text-sm text-gray-500">
                        Khách hàng hài lòng
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        50,000+
                      </div>
                      <div className="text-sm text-gray-500">
                        Sản phẩm đã bán
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        4.8★
                      </div>
                      <div className="text-sm text-gray-500">
                        Đánh giá trung bình
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {bestsellerProducts.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      section="bestseller"
                    />
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                  <button className="bg-green-600 text-white hover:bg-green-700 font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    Khám phá thêm bestsellers →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Đăng Ký Nhận Thông Tin
            </h3>
            <p className="text-gray-600 mb-6">
              Nhận thông báo về các chương trình khuyến mãi và sản phẩm mới nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                Đăng ký
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsSection;
