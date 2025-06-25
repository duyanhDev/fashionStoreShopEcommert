"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const SliderComponent = () => {
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const swiperRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      image: "https://pos.nvncdn.com/d0f3ca-7136/bn/20241126_13hzQ65z.gif",
      title: "Summer Collection 2024",
      subtitle: "Discover the latest trends",
      cta: "Shop Now",
    },
    {
      id: 2,
      image: "https://pos.nvncdn.com/d0f3ca-7136/bn/20241126_13hzQ65z.gif",
      title: "Winter Essentials",
      subtitle: "Stay warm in style",
      cta: "Explore",
    },
    {
      id: 3,
      image: "https://pos.nvncdn.com/d0f3ca-7136/bn/20250522_bqLYZFPc.gif",
      title: "Premium Quality",
      subtitle: "Crafted with excellence",
      cta: "Learn More",
    },
  ];

  const onAutoplayTimeLeft = (s, time, progress) => {
    if (progressCircle.current && progressContent.current) {
      progressCircle.current.style.setProperty(
        "--progress",
        String(1 - progress)
      );
      progressContent.current.textContent = `${Math.ceil(time / 1000)}`;
    }
  };

  const toggleAutoplay = () => {
    if (swiperRef.current) {
      if (isPlaying) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px]    mt-24 p-8">
      <Swiper
        ref={swiperRef}
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet custom-bullet",
          bulletActiveClass:
            "swiper-pagination-bullet-active custom-bullet-active",
        }}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center text-white px-6 max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-delay">
                  {slide.subtitle}
                </p>
                <button className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in-delay-2">
                  <span className="relative z-10">{slide.cta}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
        <button className="custom-prev absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group">
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        <button className="custom-next absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group">
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Custom Progress Indicator */}
        <div className="absolute right-6 bottom-6 z-30">
          <div className="relative w-16 h-16">
            <button
              onClick={toggleAutoplay}
              className="absolute inset-0 w-full h-full bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform ml-0.5" />
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
        </div>
      </Swiper>

      <style>{`
  .custom-bullet {
    width: 12px !important;
    height: 12px !important;
    background: rgba(255, 255, 255, 0.5) !important;
    border-radius: 50% !important;
    transition: all 0.3s ease !important;
    margin: 0 6px !important;
  }

  .custom-bullet-active {
    background: white !important;
    transform: scale(1.2) !important;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
  }

  .swiper-pagination {
    bottom: 24px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: auto !important;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }

  .animate-fade-in-delay {
    animation: fade-in 0.8s ease-out 0.2s both;
  }

  .animate-fade-in-delay-2 {
    animation: fade-in 0.8s ease-out 0.4s both;
  }
`}</style>
    </div>
  );
};

export default SliderComponent;
