import React, { useState, useEffect } from "react";

const FashionBrandPartners = () => {
  // Sample fashion brands data
  const brands = [
    {
      name: "Gucci",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Gucci-Logo.png",
    },
    {
      name: "Louis Vuitton",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Louis-Vuitton-Logo.png",
    },
    {
      name: "Chanel",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Chanel-Logo.png",
    },
    {
      name: "Dior",
      logo: "https://icolor.vn/wp-content/uploads/2024/08/logo-dior-1.png",
    },
    {
      name: "Prada",
      logo: "https://www.elleman.vn/wp-content/uploads/2019/07/27/logo-thu%CC%9Bo%CC%9Bng-hie%CC%A3%CC%82u-prada-nguye%CC%82n-ba%CC%89n.jpg",
    },
    {
      name: "Versace",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Versace-Logo.png",
    },
    {
      name: "Levents",
      logo: "https://static.ybox.vn/2024/12/5/1733467286417-dfff.png",
    },
    {
      name: "Balenciaga",
      logo: "https://logos-world.net/wp-content/uploads/2021/08/Balenciaga-Emblem.png",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("brand-partners");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Auto-slide for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(brands.length / 2));
    }, 5000);
    return () => clearInterval(interval);
  }, [brands.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(brands.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(brands.length / 2)) % Math.ceil(brands.length / 2)
    );
  };

  return (
    <section
      id="brand-partners"
      className="relative py-24 bg-gradient-to-br from-gray-50 via-green-50/30 to-slate-50 overflow-hidden"
    >
      {/* Elegant background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-slate-200/30 to-gray-300/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-green-100/20 to-emerald-200/20 rounded-full blur-3xl"></div>

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Elegant Header */}
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Fashion icon */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full shadow-2xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div className="absolute -inset-3 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide">
            <span className="bg-gradient-to-r from-gray-900 via-slate-800 to-black bg-clip-text text-transparent">
              THƯƠNG HIỆU
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold italic">
              ĐỐI TÁC
            </span>
          </h2>

          {/* Decorative line */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-green-300"></div>
            <div className="w-8 h-8 mx-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-green-300"></div>
          </div>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light">
            Hợp tác cùng những nhà mốt danh tiếng thế giới, mang đến cho bạn
            <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text font-medium">
              {" "}
              trải nghiệm thời trang đẳng cấp
            </span>
          </p>
        </div>

        {/* Desktop Masonry Grid */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((brand, index) => (
              <div
                key={index}
                className={`group relative transition-all duration-700 transform hover:scale-105 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Luxury card design - FIXED HEIGHT */}
                <div className="relative h-32 sm:h-36 bg-white/80 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/60 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Brand logo container */}
                  <div className="relative flex items-center justify-center h-full p-4 sm:p-6">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-12 sm:max-h-14 max-w-full object-contain transition-all duration-500 filter grayscale-0 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Hover overlay with brand name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-end justify-center">
                    <div className="text-white font-medium text-xs sm:text-sm mb-3 sm:mb-4 px-3 py-1 bg-black/30 rounded-full backdrop-blur-sm">
                      {brand.name}
                    </div>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-green-200/50 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Elegant Carousel */}
        <div className="lg:hidden">
          <div className="relative mx-4">
            {/* Carousel container with elegant styling */}
            <div className="overflow-hidden rounded-3xl bg-white/30 backdrop-blur-md border border-white/50 shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from(
                  { length: Math.ceil(brands.length / 2) },
                  (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        {brands
                          .slice(slideIndex * 2, slideIndex * 2 + 2)
                          .map((brand, index) => (
                            <div
                              key={index}
                              className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 group"
                            >
                              <div className="flex items-center justify-center h-16">
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="m-h-10 max-w-full object-contain transition-all duration-300 group-hover:scale-110"
                                  loading="lazy"
                                />
                              </div>
                              {/* Mobile brand name */}
                              <div className="text-center mt-3 text-sm text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {brand.name}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Elegant Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-md hover:bg-white shadow-xl hover:shadow-2xl rounded-full p-4 transition-all duration-300 group border border-white/60"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-md hover:bg-white shadow-xl hover:shadow-2xl rounded-full p-4 transition-all duration-300 group border border-white/60"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Elegant indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {Array.from(
                { length: Math.ceil(brands.length / 2) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg"
                        : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400"
                    }`}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Fashion Trust Indicators */}
        <div
          className={`mt-24 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">
                Thương Hiệu Cao Cấp
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hợp tác với những nhà mốt danh tiếng hàng đầu thế giới
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-700 rounded-full shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">
                Chất Lượng Đỉnh Cao
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sản phẩm authentic 100% từ các brand chính hãng
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-full shadow-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">
                Phong Cách Độc Đáo
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tạo nên xu hướng thời trang riêng biệt và đẳng cấp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FashionBrandPartners;
