import { useEffect, useRef, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Custom hook để tạo debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Search = ({
  open,
  setOpen,
  show,
  setShow,
  keywordSearch,
  setKeywordSearch,
  setData,
  data,
  lastData,
}) => {
  const containerRef = useRef();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4);

  const onClose = () => {
    setOpen(false);
    setVisibleCount(4);
    setData(lastData || []);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, data.length));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const debouncedKeywordSearch = useDebounce(keywordSearch, 500);

  useEffect(() => {
    if (debouncedKeywordSearch.trim() === "") {
      setData([]);
      setShow(false);
      setVisibleCount(4);
    }
  }, [debouncedKeywordSearch, setData, setShow]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative w-full">
      {open && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed " />

          {/* Modal container - Responsive positioning */}
          <div
            className="fixed inset-x-0 top-0 sm:top-48 md:top-16 lg:top-20 z-50 
                       h-screen sm:h-auto
                       sm:left-1/2 sm:-translate-x-1/2 
                       w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] sm:max-w-5xl
                       sm:max-h-[85vh] md:max-h-[80vh]
                       bg-white sm:rounded-xl shadow-2xl
                       flex flex-col"
            ref={containerRef}
          >
            {/* Header - Fixed - Responsive padding & sizes */}
            <div
              className="flex-shrink-0 flex items-center justify-between 
                          p-3 sm:p-4 md:p-5
                          border-b bg-gradient-to-r from-gray-50 to-white 
                          sm:rounded-t-xl"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Icon - Responsive sizes */}
                <div
                  className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 
                              bg-gradient-to-br from-blue-500 to-blue-600 
                              rounded-full flex items-center justify-center 
                              shadow-md flex-shrink-0"
                >
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white"
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

                {/* Title - Responsive text & truncate */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-semibold text-gray-900 
                               text-sm sm:text-base md:text-lg
                               truncate"
                  >
                    {data.length > 0 ? `${data.length} sản phẩm` : "Tìm kiếm"}
                  </h3>
                  {keywordSearch && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      "{keywordSearch}"
                    </p>
                  )}
                </div>
              </div>

              {/* Close button - Responsive */}
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                         hover:bg-gray-200 active:bg-gray-300
                         rounded-full flex items-center justify-center 
                         transition-all duration-200 flex-shrink-0 ml-2"
                aria-label="Đóng"
              >
                <CloseCircleOutlined className="text-gray-600 text-base sm:text-lg md:text-xl" />
              </button>
            </div>

            {/* Content - Scrollable - Smooth scroll on mobile */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* No results - Responsive spacing */}
              {show && keywordSearch.trim() !== "" && (
                <div className="text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                                bg-gray-100 rounded-full 
                                flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  >
                    <svg
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3
                    className="text-lg sm:text-xl md:text-2xl 
                               font-semibold text-gray-900 mb-2"
                  >
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                    Không có sản phẩm nào phù hợp với từ khóa "{keywordSearch}"
                  </p>
                  <div
                    className="bg-blue-50 rounded-lg sm:rounded-xl 
                                p-3 sm:p-4 md:p-5 
                                max-w-xs sm:max-w-md mx-auto"
                  >
                    <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">
                      Gợi ý:
                    </p>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1 text-left">
                      <li>• Kiểm tra chính tả</li>
                      <li>• Sử dụng từ khóa khác</li>
                      <li>• Thử từ khóa ngắn gọn hơn</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Products - Responsive grid & spacing */}
              {!show && (
                <div className="p-3 sm:p-4 md:p-6">
                  {data && data.length > 0 ? (
                    <>
                      {/* Header - Responsive */}
                      <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                        <h4
                          className="text-base sm:text-lg md:text-xl 
                                     font-semibold text-gray-900"
                        >
                          Sản phẩm
                        </h4>
                        <span
                          className="text-xs sm:text-sm text-gray-600 
                                       bg-gray-100 px-2 sm:px-3 py-1 
                                       rounded-full font-medium"
                        >
                          {Math.min(visibleCount, data.length)}/{data.length}
                        </span>
                      </div>

                      {/* Product Grid - Responsive columns & gaps */}
                      <div
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                                    gap-2 sm:gap-3 md:gap-4"
                      >
                        {data.slice(0, visibleCount).map((product, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg sm:rounded-xl 
                                     p-2 sm:p-3 md:p-4
                                     hover:shadow-lg hover:border-blue-300
                                     active:scale-[0.98]
                                     transition-all duration-200 cursor-pointer group"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            {/* Product Image - Responsive with discount badge */}
                            <div
                              className="aspect-square rounded-md sm:rounded-lg 
                                          overflow-hidden mb-2 sm:mb-3 
                                          bg-gray-50 relative"
                            >
                              <img
                                src={product.variants[0]?.images[0]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover 
                                         group-hover:scale-110 
                                         transition-transform duration-300"
                                loading="lazy"
                              />
                              {product.discount > 0 && (
                                <div
                                  className="absolute top-1 sm:top-2 right-1 sm:right-2 
                                              bg-red-500 text-white 
                                              px-1.5 sm:px-2 py-0.5 sm:py-1 
                                              rounded text-[10px] sm:text-xs font-bold 
                                              shadow-md"
                                >
                                  -{product.discount}%
                                </div>
                              )}
                            </div>

                            {/* Product Name - Responsive text & line clamp */}
                            <h5
                              className="font-medium text-gray-900 
                                         text-xs sm:text-sm md:text-base
                                         line-clamp-2 h-8 sm:h-10 md:h-12 
                                         mb-1.5 sm:mb-2 
                                         group-hover:text-blue-600 
                                         transition-colors"
                            >
                              {product.name}
                            </h5>

                            {/* Price - Responsive text sizes */}
                            <div className="space-y-1 sm:space-y-1.5">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span
                                  className="text-sm sm:text-base md:text-lg 
                                               font-bold text-red-600"
                                >
                                  {formatPrice(product.discountedPrice)}
                                </span>
                              </div>
                              {product.costPrice !==
                                product.discountedPrice && (
                                <span
                                  className="text-[10px] sm:text-xs md:text-sm 
                                               text-gray-500 line-through block"
                                >
                                  {formatPrice(product.costPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Load More Button - Responsive */}
                      {data.length > visibleCount && (
                        <div className="text-center mt-4 sm:mt-6 md:mt-8">
                          <button
                            onClick={handleLoadMore}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 
                                     hover:from-blue-700 hover:to-blue-800
                                     active:scale-95
                                     text-white 
                                     px-4 sm:px-6 md:px-8 
                                     py-2 sm:py-2.5 md:py-3 
                                     rounded-lg sm:rounded-xl 
                                     text-sm sm:text-base
                                     font-medium 
                                     transition-all duration-200
                                     shadow-md hover:shadow-lg
                                     w-full sm:w-auto"
                          >
                            Xem thêm {Math.min(6, data.length - visibleCount)}{" "}
                            sản phẩm
                          </button>
                        </div>
                      )}
                    </>
                  ) : keywordSearch.trim() === "" ? (
                    // Empty State - Responsive
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                                    bg-blue-100 rounded-full 
                                    flex items-center justify-center mx-auto mb-3 sm:mb-4"
                      >
                        <svg
                          className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600"
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
                      <h3
                        className="text-lg sm:text-xl md:text-2xl 
                                   font-semibold text-gray-900 mb-2"
                      >
                        Tìm kiếm sản phẩm
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                        Nhập từ khóa để tìm kiếm sản phẩm bạn cần
                      </p>

                      {/* Quick Search Buttons - Responsive Grid */}
                      <div
                        className="grid grid-cols-2 sm:grid-cols-4 
                                    gap-2 sm:gap-3 
                                    max-w-xs sm:max-w-lg mx-auto px-4"
                      >
                        {["Quần", "Áo", "Balo", "Phụ Kiện"].map(
                          (keyword, index) => (
                            <button
                              key={index}
                              onClick={() => setKeywordSearch(keyword)}
                              className="bg-gray-100 hover:bg-gray-200 
                                       active:bg-gray-300
                                       text-gray-700 
                                       py-2 sm:py-2.5 md:py-3 
                                       px-3 sm:px-4 
                                       rounded-lg sm:rounded-xl 
                                       text-xs sm:text-sm 
                                       font-medium 
                                       transition-all duration-200
                                       hover:shadow-md
                                       active:scale-95"
                            >
                              {keyword}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
