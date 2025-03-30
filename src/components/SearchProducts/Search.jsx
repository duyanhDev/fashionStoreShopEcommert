import { useEffect, useRef, useState } from "react";
import "./Search.css";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

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
  const onClose = () => {
    setOpen(false);
    setKeywordSearch("");
  };
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const navigate = useNavigate();
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
    <div className="container_search">
      {open && (
        <div
          className="search_nav fixed left-0 right-0 bg-gray-100 z-50 m-auto"
          ref={containerRef}
        >
          <div className="absolute w-full h-full">
            <div className="flex gap-3 border-b-2 p-4">
              {show ? (
                <>
                  <span className="p-2"></span>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold ">
                    Kết quả tìm thấy : {data.length} sản phẩm
                  </span>
                </>
              )}
              <CloseCircleOutlined
                className="absolute  right-2 text-gray-500 hover:text-black text-2xl"
                onClick={onClose}
              />
            </div>
            {show && (
              <div className="m-auto h-full text-center flex justify-center items-center">
                <div>
                  <img
                    src="https://cdn2.cellphones.com.vn/x,webp/media/wysiwyg/Search-Empty.png"
                    alt="tìm kiếm"
                    className="w-full text-center flex items-center"
                  />
                  <div className="mt-2 text-center">
                    <h1 className="text-2xl text-pink-gradient">
                      Hiện tại chưa có kết quả tìm kiếm nào hết !!
                    </h1>
                  </div>
                </div>
              </div>
            )}

            <div className="m-10 ">
              <span className="text-black font-bold">Sản phẩm</span>
              <div className="mt-2 flex flex-wrap items-center gap-10 ">
                {data && data.length > 0 ? (
                  data.slice(0, 4).map((product, index) => {
                    // Dùng slice đúng cách
                    return (
                      <div
                        className="product-header-search"
                        key={index}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <img
                          src={product.variants[0]?.images[0]?.url}
                          alt="ảnh"
                          style={{
                            width: "100%", // Điều chỉnh lại width để phù hợp
                            height: "273px", // Điều chỉnh lại chiều cao
                            borderRadius: "10px",
                          }}
                        />
                        <p className="text-product">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {" "}
                            {formatPrice(product.discountedPrice)}
                          </span>
                          <span className="bg-blue-500 px-2 text-white rounded-lg text-discount">
                            {product.discount}%
                          </span>
                          <span className="line-through text-[#c4c4c4]">
                            {formatPrice(product.costPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span>Không tìm thấy</span>
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
