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

  const onClose = () => {
    setOpen(false);
    setKeywordSearch("");
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
      setShow(false); // Ẩn thông báo "Không tìm thấy" khi chưa nhập từ khóa
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
        <div
          className="fixed left-0 right-0 z-50 mx-auto w-11/12 max-w-4xl top-20 max-h-[80vh] overflow-y-auto bg-gray-100 rounded-xl shadow-lg transition-all duration-300 transform origin-top"
          ref={containerRef}
        >
          <div className="relative w-full min-h-[300px]">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
              {show ? (
                <span className="p-2"></span>
              ) : (
                <span className="text-xl font-bold text-gray-800">
                  {data.length > 0
                    ? `Kết quả tìm thấy: ${data.length} sản phẩm`
                    : "Nhập từ khóa để tìm kiếm"}
                </span>
              )}
              <CloseCircleOutlined
                className="absolute right-2 text-2xl text-gray-500 hover:text-black transition-colors cursor-pointer"
                onClick={onClose}
              />
            </div>

            {show && keywordSearch.trim() !== "" && (
              <div className="flex items-center justify-center h-full py-8">
                <div className="w-full max-w-md">
                  <img
                    src="https://cdn2.cellphones.com.vn/x,webp/media/wysiwyg/Search-Empty.png"
                    alt="tìm kiếm"
                    className="max-w-xs mx-auto"
                  />
                  <div className="mt-4 text-center">
                    <h1 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
                      Hiện tại chưa có kết quả tìm kiếm nào hết !!
                    </h1>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 md:p-6">
              <span className="block text-lg font-bold text-gray-800 mb-3">
                Sản phẩm
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data && data.length > 0
                  ? data.slice(0, 4).map((product, index) => (
                      <div
                        className="bg-white rounded-xl p-3 cursor-pointer transition-all hover:shadow-md hover:translate-y-[-4px]"
                        key={index}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-3">
                          <img
                            src={product.variants[0]?.images[0]?.url}
                            alt="ảnh sản phẩm"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-gray-800 font-medium line-clamp-2 h-12 mb-2">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-pink-600">
                            {formatPrice(product.discountedPrice)}
                          </span>
                          <span className="bg-blue-500 px-2 py-0.5 text-white rounded-lg text-xs">
                            {product.discount}%
                          </span>
                          <span className="line-through text-gray-400 text-sm">
                            {formatPrice(product.costPrice)}
                          </span>
                        </div>
                      </div>
                    ))
                  : keywordSearch.trim() === "" && (
                      <div className="col-span-full text-center py-8">
                        <img
                          src="https://cdn2.cellphones.com.vn/x,webp/media/wysiwyg/Search-Empty.png"
                          alt="chưa tìm kiếm"
                          className="max-w-xs mx-auto mb-4"
                        />
                        <p className="text-gray-600 text-lg">
                          Vui lòng nhập từ khóa để tìm kiếm sản phẩm!
                        </p>
                      </div>
                    )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
