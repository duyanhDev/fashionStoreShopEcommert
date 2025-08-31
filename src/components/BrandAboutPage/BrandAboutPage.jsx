import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Star,
  Users,
  ShoppingBag,
  Award,
  Heart,
  Truck,
  Shield,
  Recycle,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
} from "lucide-react";

const BrandAboutPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stats = [
    { icon: Users, number: "2M+", label: "Khách hàng tin tưởng" },
    { icon: Star, number: "4.8", label: "Đánh giá trung bình" },
    { icon: ShoppingBag, number: "10M+", label: "Sản phẩm đã bán" },
    { icon: Award, number: "50+", label: "Giải thưởng nhận được" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Tận tâm với khách hàng",
      description:
        "Chúng tôi đặt khách hàng làm trung tâm của mọi quyết định, luôn lắng nghe và cải thiện để mang đến trải nghiệm tốt nhất.",
    },
    {
      icon: Shield,
      title: "Chất lượng hàng đầu",
      description:
        "Cam kết về chất lượng sản phẩm từ khâu chọn nguyên liệu đến khâu hoàn thiện, đảm bảo độ bền và thoải mái.",
    },
    {
      icon: Recycle,
      title: "Bền vững và thân thiện",
      description:
        "Ưu tiên sử dụng nguyên liệu tái chế và quy trình sản xuất thân thiện với môi trường.",
    },
    {
      icon: Truck,
      title: "Dịch vụ tận tâm",
      description:
        "Giao hàng nhanh chóng, đổi trả dễ dàng và chăm sóc khách hàng 24/7 với đội ngũ nhiệt huyết.",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Khách hàng VIP",
      content:
        "Tôi đã mua sắm ở đây được 3 năm và chưa bao giờ thất vọng. Chất lượng sản phẩm luôn đảm bảo, giá cả hợp lý và dịch vụ chăm sóc khách hàng rất tốt.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Trần Thị B",
      role: "Fashion Blogger",
      content:
        "Là một fashion blogger, tôi rất kỹ tính về chất lượng và style. Thương hiệu này luôn cập nhật xu hướng mới nhất và chất lượng sản phẩm thật sự ấn tượng.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Lê Minh C",
      role: "Doanh nhân",
      content:
        "Sản phẩm của họ rất phù hợp với phong cách công sở của tôi. Thiết kế thanh lịch, chất liệu cao cấp và giá cả hợp lý. Tôi sẽ tiếp tục ủng hộ!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const timeline = [
    {
      year: "2020",
      title: "Khởi đầu",
      description:
        "Ra mắt với tầm nhìn mang đến thời trang chất lượng cho mọi người",
    },
    {
      year: "2021",
      title: "Phát triển",
      description: "Mở rộng sản phẩm và đạt 100,000 khách hàng đầu tiên",
    },
    {
      year: "2022",
      title: "Bứt phá",
      description: "Launch store online và đạt 1 triệu khách hàng",
    },
    {
      year: "2023",
      title: "Toàn cầu",
      description:
        "Mở rộng ra thị trường quốc tế và ra mắt dòng sản phẩm premium",
    },
    {
      year: "2024",
      title: "Tương lai",
      description:
        "Hướng đến mục tiêu trở thành thương hiệu thời trang hàng đầu Việt Nam",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                    🌟 Thương hiệu thời trang hàng đầu
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Thời trang cho
                  <span className="block text-green-600 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    Cuộc sống hiện đại
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Chúng tôi tin rằng thời trang không chỉ là trang phục, mà là
                  cách bạn thể hiện bản thân. Với sứ mệnh mang đến những sản
                  phẩm chất lượng cao với giá cả hợp lý cho mọi người.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3">
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                  Xem bộ sưu tập
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                      <stat.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"
                  alt="Fashion Store"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl transform hover:scale-110 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900">
                    Đang online
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4.9★</div>
                  <div className="text-sm text-gray-600">2M+ đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Câu chuyện của chúng tôi
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Bắt đầu từ một ý tưởng đơn giản: làm sao để mọi người đều có
                  thể tiếp cận được thời trang chất lượng cao với giá cả hợp lý?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Chất lượng được kiểm soát nghiêm ngặt
                    </h3>
                    <p className="text-gray-600">
                      Mỗi sản phẩm đều trải qua quy trình kiểm tra chất lượng 15
                      bước để đảm bảo độ bền và thoải mái.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Thiết kế dành cho người Việt
                    </h3>
                    <p className="text-gray-600">
                      Nghiên cứu kỹ lưỡng về vóc dáng và sở thích của người Việt
                      Nam để tạo ra những sản phẩm phù hợp nhất.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cam kết bền vững
                    </h3>
                    <p className="text-gray-600">
                      Sử dụng nguyên liệu thân thiện với môi trường và quy trình
                      sản xuất có trách nhiệm.
                    </p>
                  </div>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors duration-300">
                Đọc thêm câu chuyện của chúng tôi
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&h=400&fit=crop"
                  alt="Team working"
                  className="rounded-2xl shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300&h=400&fit=crop"
                  alt="Design process"
                  className="rounded-2xl shadow-lg mt-8"
                />
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300"
                >
                  <Play className="w-8 h-8 text-green-600 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những giá trị định hình nên con người chúng tôi và cách chúng tôi
              phục vụ khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300">
                  <value.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ những ngày đầu khởi nghiệp đến hôm nay, chúng tôi không ngừng
              phát triển và cải tiến
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                    }`}
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  <div className="w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                  </div>

                  <div className="w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói về chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những phản hồi chân thật từ cộng đồng khách hàng yêu thích thương
              hiệu
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>
                <blockquote className="text-2xl text-gray-900 font-medium italic leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-colors duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-colors duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng triệu khách hàng đã tin tưởng và lựa chọn chúng
            tôi. Khám phá bộ sưu tập mới nhất ngay hôm nay!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Mua sắm ngay
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandAboutPage;
