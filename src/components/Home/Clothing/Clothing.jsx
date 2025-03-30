import "./Clothing.css";
import { Flex, Rate, Skeleton, Card, Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
export default function Clothing({ ListProducts }) {
  const desc = ["terrible", "bad", "normal", "good", "wonderful"];
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const navigate = useNavigate();

  // State for visible items count
  const [visibleItems, setVisibleItems] = useState(20);
  const [visibleAoItems, setVisibleAoItems] = useState(20);
  const [visibleQuanItems, setVisibleQuanItems] = useState(10);
  const [visibleGiayItems, setVisibleGiayItems] = useState(10);

  const itemsPerLoad = 10;

  const aoProducts = ListProducts.filter(
    (product) => product.category.name === "Áo"
  );
  const quanProducts = ListProducts.filter(
    (product) => product.category.name === "Quần"
  );
  const giayProducts = ListProducts.filter(
    (product) => product.category.name === "Giày"
  );

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const handleRate = (id, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [id]: value,
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const SkeletonCard = () => (
    <Card
      style={{ width: 250.9 }}
      cover={
        <Skeleton.Image active={true} style={{ width: "100%", height: 200 }} />
      }
    >
      <Skeleton active={true} paragraph={{ rows: 5 }} />
    </Card>
  );

  const handleDetails = (id) => {
    navigate(`product/${id}`);
  };

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + itemsPerLoad);
  };

  const handleLoadMoreAo = () => {
    setVisibleAoItems((prev) => prev + itemsPerLoad);
  };

  const handleLoadMoreQuan = () => {
    setVisibleQuanItems((prev) => prev + itemsPerLoad);
  };

  const handleLoadMoreGiay = () => {
    setVisibleGiayItems((prev) => prev + itemsPerLoad);
  };

  const renderProductSection = (title, products, visibleCount, onLoadMore) => (
    <>
      <div className="ml-4 mt-3 text-xl font-bold">{title}</div>
      <div
        className="flex flex-wrap justify-center items-center gap-2"
        data-aos="zoom-in"
      >
        {loading
          ? [...Array(12)].map((_, index) => <SkeletonCard key={index} />)
          : products.slice(0, visibleCount).map((product) => (
              <div
                className="content_dosin"
                key={product._id}
                onClick={() => handleDetails(product._id)}
              >
                <div className="border-b">
                  <img
                    className="w-full h-64 object-cover"
                    src={
                      product.variants[0]?.images[0]?.url ||
                      "/default-image.jpg"
                    }
                    alt={product.name}
                  />
                </div>
                <div className="item_content">
                  <p>{product.brand}</p>
                </div>
                <div className="item_content" style={{ maxWidth: "200px" }}>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
                    {product.name}
                  </span>
                </div>
                {product.discount ? (
                  <div className="item_content">
                    <span className="text_span line-through">
                      {formatPrice(product.costPrice)}
                    </span>
                    <span className="ml-2 text_span text-red-600">
                      -{product.discount}%
                    </span>
                  </div>
                ) : (
                  <div className="item_content"></div>
                )}
                <div className="item_content">
                  {product.discountedPrice ? (
                    <span className="text_span">
                      {formatPrice(product.discountedPrice)}
                    </span>
                  ) : (
                    <span className="text_span">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="item_content">
                  <Flex gap="middle" vertical>
                    <Rate
                      tooltips={desc}
                      onChange={(value) => handleRate(product._id, value)}
                      value={ratings[product._id] || 0}
                    />
                  </Flex>
                </div>
              </div>
            ))}
      </div>
      {visibleCount < products.length && (
        <div className="flex justify-center mt-4 mb-8">
          <Button onClick={onLoadMore} type="primary">
            XEM THÊM
          </Button>
        </div>
      )}
    </>
  );
  useEffect(() => {
    AOS.init({
      duration: 1000, // Thời gian hiệu ứng (ms)
      // once: true, // Hiệu ứng chỉ chạy một lần khi scroll
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Danh sách tất cả sản phẩm */}
      <div
        className="flex gap-2 flex-wrap  justify-center items-center col"
        data-aos="zoom-in"
      >
        {loading
          ? [...Array(20)].map((_, index) => <SkeletonCard key={index} />)
          : ListProducts.slice(0, visibleItems).map((product) => (
              <div
                className="content_dosin"
                key={product._id}
                onClick={() => handleDetails(product._id)}
              >
                <div className="border-b">
                  <img
                    className="w-full h-64 object-cover"
                    src={
                      product.variants[0]?.images[0]?.url ||
                      "/default-image.jpg"
                    }
                    alt={product.name}
                  />
                </div>
                <div className="item_content">
                  <p>{product.brand}</p>
                </div>
                <div className="item_content" style={{ maxWidth: "200px" }}>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis block">
                    {product.name}
                  </span>
                </div>
                {product.discount ? (
                  <div className="item_content">
                    <span className="text_span line-through">
                      {formatPrice(product.costPrice)}
                    </span>
                    <span className="ml-2 text_span text-red-600">
                      -{product.discount}%
                    </span>
                  </div>
                ) : (
                  <div className="item_content"></div>
                )}
                <div className="item_content">
                  {product.discountedPrice ? (
                    <span className="text_span">
                      {formatPrice(product.discountedPrice)}
                    </span>
                  ) : (
                    <span className="text_span">
                      {formatPrice(product.costPrice)}
                    </span>
                  )}
                </div>
                <div className="item_content">
                  <Flex gap="middle" vertical>
                    <Rate
                      tooltips={desc}
                      onChange={(value) => handleRate(product._id, value)}
                      value={ratings[product._id] || 0}
                    />
                  </Flex>
                </div>
              </div>
            ))}
      </div>
      {visibleItems < ListProducts.length && (
        <div className="flex justify-center mt-4 mb-8">
          <Button onClick={handleLoadMore} type="primary">
            XEM THÊM
          </Button>
        </div>
      )}

      {/* Các section sản phẩm theo danh mục */}
      {renderProductSection("ÁO", aoProducts, visibleAoItems, handleLoadMoreAo)}
      {renderProductSection(
        "QUẦN",
        quanProducts,
        visibleQuanItems,
        handleLoadMoreQuan
      )}
      {renderProductSection(
        "GIÀY",
        giayProducts,
        visibleGiayItems,
        handleLoadMoreGiay
      )}
    </div>
  );
}
