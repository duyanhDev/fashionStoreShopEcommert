import React, { useState } from "react";
import { Card, Rate, Button, Badge } from "antd";

const EnhancedProductsSection = ({ ListProducts }) => {
  const [hoveredProduct, setHoveredProduct] = useState(null);

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
    .slice(0, 5);
  const bestsellerProducts = products
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const ProductCard = ({ product, index, section }) => (
    <div
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setHoveredProduct(product._id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <div className="aspect-square relative bg-gray-50">
          <img
            src={
              product.variants?.[0]?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              -{product.discount}%
            </span>
          )}
          {section === "bestseller" && index < 3 && (
            <span
              className={`inline-block text-white text-xs font-semibold px-2 py-1 rounded-md ${
                index === 0
                  ? "bg-yellow-500"
                  : index === 1
                  ? "bg-gray-400"
                  : "bg-yellow-600"
              }`}
            >
              #{index + 1}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="small"
            shape="circle"
            className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-sm"
            icon={
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
            }
          />
          <Button
            size="small"
            shape="circle"
            className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-sm"
            icon={
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Bestseller sold count */}
        {section === "bestseller" && product.soldCount && (
          <div className="absolute bottom-3 left-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md">
            Đã bán {product.soldCount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.brand}
          </span>
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Rate
            disabled
            defaultValue={product.rating || 4.5}
            allowHalf
            className="text-sm"
            style={{ fontSize: "14px" }}
          />
          <span className="text-xs text-gray-500">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-red-600">
              {formatPrice(product.discountedPrice || product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.costPrice || product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Savings */}
        {product.discount > 0 && (
          <div className="mt-2 text-xs text-green-600 font-medium">
            Tiết kiệm{" "}
            {formatPrice(
              (product.costPrice || product.price) -
                (product.discountedPrice || product.price)
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 px-4 max-w-7xl mx-auto">
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Sale Products Section */}
      <section className="bg-gradient-to-r from-red-50 to-pink-50 py-12 px-6 rounded-2xl">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              Sale Hot
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🔥 Sản Phẩm Khuyến Mãi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cơ hội sở hữu những sản phẩm yêu thích với mức giá ưu đãi nhất
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {saleProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                section="sale"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bestseller Products Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-6 rounded-2xl">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Bestseller
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ⭐ Sản Phẩm Bán Chạy
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những sản phẩm được khách hàng yêu thích và lựa chọn nhiều nhất
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {bestsellerProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                section="bestseller"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedProductsSection;
