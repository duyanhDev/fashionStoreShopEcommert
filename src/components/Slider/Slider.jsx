import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Slider.css";
import { getListBannerAPI } from "../../service/APIBanner";

const SliderComponent = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Next / Prev / GoTo slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Fetch API
  useEffect(() => {
    const fetchAPIBanner = async () => {
      try {
        setIsLoading(true);
        const res = await getListBannerAPI();
        if (res?.data?.EC === 0) {
          const data = res?.data?.data.filter((item) => item.isActive);
          setSlides(data);
        }
      } catch (err) {
        console.error("API Error:", err);
        // Fallback slides for demo
        setSlides([
          {
            _id: "demo-1",
            imageUrl: "https://picsum.photos/1200/400?random=1",
            title: "Demo Banner 1",
            isActive: true,
          },
          {
            _id: "demo-2",
            imageUrl: "https://picsum.photos/1200/400?random=2",
            title: "Demo Banner 2",
            isActive: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAPIBanner();
  }, []);

  // Auto-play with pause on hover
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  // Reset current slide if slides change
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Loading state
  if (isLoading) {
    return (
      <div className="slider-container">
        <div className="loading-state">
          <div className="text-center">
            <div className="loading-spinner mb-3"></div>
            <div className="text-white text-sm sm:text-base">
              Đang tải banner...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No slides available
  if (slides.length === 0) {
    return (
      <div className="slider-container">
        <div className="loading-state">
          <div className="text-white text-center">
            <div className="text-lg mb-2">⚠️</div>
            <div className="text-sm">Không có banner nào</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="slider-container"
      onMouseEnter={() => {
        // Pause auto-play on hover (optional)
      }}
      onMouseLeave={() => {
        // Resume auto-play on leave (optional)
      }}
    >
      {/* Slides */}
      {slides?.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 animate-fade-in" : "opacity-0"
          }`}
          style={{ zIndex: index === currentSlide ? 10 : 1 }}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title || `Banner ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            onError={(e) => {
              console.error("Failed to load image:", slide.imageUrl);
              e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
                  <rect width="100%" height="100%" fill="#374151"/>
                  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="16">
                    Ảnh không tải được
                  </text>
                </svg>
              `)}`;
            }}
            onLoad={() => {
              console.log(`Image loaded: ${slide.title}`);
            }}
          />

          {/* Optional: Slide title overlay */}
        </div>
      ))}

      {/* Navigation Buttons - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Pagination Bullets - Only show if more than 1 slide */}

      {/* Progress indicator (optional) */}
    </div>
  );
};

export default SliderComponent;
