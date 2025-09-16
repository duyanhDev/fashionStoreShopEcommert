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
}) => {
  const containerRef = useRef();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4);

  const onClose = () => {
    setOpen(false);
    setVisibleCount(4); // Reset về 4 khi đóng
  };

  // Function để load thêm sản phẩm
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, data.length));
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  // Sử dụng debounce cho keywordSearch
  const debouncedKeywordSearch = useDebounce(keywordSearch, 500);

  // Effect để theo dõi debouncedKeywordSearch và đặt lại data khi keyword rỗng
  useEffect(() => {
    if (debouncedKeywordSearch.trim() === "") {
      setData([]);
      setShow(false);
      setVisibleCount(4); // Reset về 4 khi search mới
    }
  }, [debouncedKeywordSearch, setData, setShow]);

  // Effect để xử lý click ngoài để đóng
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
          {/* Simple backdrop */}

          {/* Main container */}
          <div
            className="fixed left-1/2 top-20 -translate-x-1/2 z-50 w-[95%] max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-xl"
            ref={containerRef}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {data.length > 0
                      ? `Tìm thấy ${data.length} sản phẩm`
                      : "Tìm kiếm sản phẩm"}
                  </h3>
                  {keywordSearch && (
                    <p className="text-sm text-gray-500">
                      Kết quả cho "{keywordSearch}"
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <CloseCircleOutlined className="text-gray-500 text-lg" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {/* No results */}
              {show && keywordSearch.trim() !== "" && (
                <div className="text-center py-12 px-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Không có sản phẩm nào phù hợp với từ khóa "{keywordSearch}"
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Gợi ý:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Kiểm tra chính tả</li>
                      <li>• Sử dụng từ khóa khác</li>
                      <li>• Thử từ khóa ngắn gọn hơn</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Products */}
              {!show && (
                <div className="p-6">
                  {data && data.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Sản phẩm
                        </h4>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {Math.min(visibleCount, data.length)}/{data.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.slice(0, visibleCount).map((product, index) => (
                          <div
                            key={index}
                            className="bg-white border rounded-lg p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-50">
                              <img
                                src={product.variants[0]?.images[0]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>

                            <h5 className="font-medium text-gray-900 line-clamp-2 h-12 mb-2 group-hover:text-blue-600">
                              {product.name}
                            </h5>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-red-600">
                                  {formatPrice(product.discountedPrice)}
                                </span>
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                                  -{product.discount}%
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.costPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {data.length > visibleCount && (
                        <div className="text-center mt-6">
                          <button
                            onClick={handleLoadMore}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Xem thêm {Math.min(6, data.length - visibleCount)}{" "}
                            sản phẩm
                          </button>
                        </div>
                      )}
                    </>
                  ) : keywordSearch.trim() === "" ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600"
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Tìm kiếm sản phẩm
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Nhập từ khóa để tìm kiếm sản phẩm bạn cần
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                        {["Quần", "Áo", "Balo", "Phụ Kiện"].map(
                          (keyword, index) => (
                            <button
                              key={index}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
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
