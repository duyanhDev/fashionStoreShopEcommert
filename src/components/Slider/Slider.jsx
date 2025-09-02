import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import "./Slider.css";
import { getListBannerAPI } from "../../service/APIBanner";

const SliderComponent = () => {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const swiperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slides, setSlides] = useState([]);

  // Memoize functions để tránh re-render
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setProgress(0);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Fetch API chỉ chạy 1 lần khi mount
  useEffect(() => {
    const fetchAPIBanner = async () => {
      try {
        const res = await getListBannerAPI();

        if (res && res.data && res.data.EC === 0) {
          setSlides(res.data.data);
        }
      } catch (error) {
        console.log("API Error:", error);
      }
    };

    fetchAPIBanner();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Auto-play functionality - FIX: thêm slides.length và nextSlide
  useEffect(() => {
    if (slides.length === 0) return; // Không chạy nếu chưa có slides

    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + 1;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSlide, slides.length, nextSlide]); // Thêm đầy đủ dependencies

  // Reset currentSlide nếu vượt quá số slides
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Update progress circle
  useEffect(() => {
    if (progressCircle.current && progressContent.current) {
      const progressValue = progress / 100;
      progressCircle.current.style.setProperty(
        "--progress",
        String(progressValue)
      );
      progressContent.current.textContent = `${Math.ceil(
        ((100 - progress) * 4) / 100
      )}`;
    }
  }, [progress]);

  // Không render nếu chưa có slides
  if (slides.length === 0) {
    return (
      <div className="slider-container flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="slider-container">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Overlay */}

            {/* Image */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              onError={(e) => {
                e.target.src = "/path/to/fallback-image.jpg"; // Fallback image
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Custom Progress Indicator */}
      {/* <div className="absolute right-2 sm:right-6 bottom-2 sm:bottom-6 z-30">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16">
          <button
            onClick={toggleAutoplay}
            className="absolute inset-0 w-full h-full bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform ml-0.5" />
            )}
          </button>

          <svg
            ref={progressCircle}
            viewBox="0 0 48 48"
            className="absolute inset-0 w-full h-full -rotate-90"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset="calc(125.6px * (1 - var(--progress, 0)))"
              className="transition-all duration-100 ease-linear"
            />
          </svg>

          <span
            ref={progressContent}
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pointer-events-none"
          />
        </div>
      </div> */}

      {/* Custom Pagination Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SliderComponent;
