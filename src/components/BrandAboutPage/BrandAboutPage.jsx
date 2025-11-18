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
      name: "Đặng Trịnh Duy Anh",
      role: "Khách hàng VIP",
      content:
        "Tôi đã mua sắm ở đây được 3 năm và chưa bao giờ thất vọng. Chất lượng sản phẩm luôn đảm bảo, giá cả hợp lý và dịch vụ chăm sóc khách hàng rất tốt.",
      rating: 5,
      avatar:
        "https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/503533690_1340568937012573_2806707248680754825_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=LBFZsORIa10Q7kNvwHujjA9&_nc_oc=Adk5SQzB71gpIi6ZEglnUdB9KHaUv1VokA5aKoV52zKZgFZa51SDphZxIi9r_2oAzds&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=BZg3fgNGqsneRfCsXDKOKA&oh=00_AfiM4q6KVk_s7qG0zhCGeCI53hg_bLYygXK_TmRI_mYsHw&oe=6921D664",
    },
    {
      name: "Nguyễn Thị Hồng Nhung",
      role: "Fashion Blogger",
      content:
        "Là một fashion blogger, tôi rất kỹ tính về chất lượng và style. Thương hiệu này luôn cập nhật xu hướng mới nhất và chất lượng sản phẩm thật sự ấn tượng.",
      rating: 5,
      avatar:
        "data:image/jpeg;base64,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",
    },
    {
      name: "Lê Minh C",
      role: "Khách hàng thân thiết",
      content:
        "Sản phẩm của họ rất phù hợp với phong cách công sở của tôi. Thiết kế thanh lịch, chất liệu cao cấp và giá cả hợp lý. Tôi sẽ tiếp tục ủng hộ!",
      rating: 5,
      avatar:
        "https://img.baobacninhtv.vn/Medias/6294/2025/10/07/Untitled-2.jpg",
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
    <div className="min-h-screen bg-white mt-16">
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
      {/* Testimonials Section - Enhanced Green Background */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute top-20 right-20 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/15 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-10 right-10 w-56 h-56 bg-green-300/25 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Mesh Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 2px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
              ⭐ Phản hồi từ khách hàng
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Khách hàng nói về chúng tôi
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Những phản hồi chân thật từ cộng đồng khách hàng yêu thích thương
              hiệu
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 relative overflow-hidden">
              {/* Card Accent */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-green-400"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/30 to-transparent rounded-bl-3xl"></div>

              <div className="relative z-10 text-center mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current mx-0.5"
                      />
                    )
                  )}
                </div>
                <blockquote className="text-2xl text-gray-900 font-medium italic leading-relaxed mb-8 relative">
                  <span className="text-green-300 text-5xl absolute -top-2 -left-2 font-serif opacity-40">
                    "
                  </span>
                  {testimonials[currentTestimonial].content}
                  <span className="text-green-300 text-5xl absolute -bottom-6 -right-2 font-serif opacity-40">
                    "
                  </span>
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-green-200/50"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-green-600 font-medium">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-all duration-300 transform hover:scale-110 border border-white/50"
            >
              <ChevronLeft className="w-6 h-6 text-green-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-all duration-300 transform hover:scale-110 border border-white/50"
            >
              <ChevronRight className="w-6 h-6 text-green-600" />
            </button>

            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                    index === currentTestimonial
                      ? "bg-white shadow-lg ring-2 ring-white/50"
                      : "bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced Green Background */}
      <section className="py-20 bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-radial from-white/25 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-20 right-0 w-96 h-96 bg-gradient-radial from-emerald-300/20 to-transparent rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-radial from-green-300/30 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-radial from-white/20 to-transparent rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-10 w-2 h-2 bg-white/50 rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-1/3 right-20 w-3 h-3 bg-emerald-200/60 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "3.5s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-green-200/50 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s", animationDuration: "4.5s" }}
          ></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
            🚀 Cơ hội đặc biệt
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-xl">
            <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Sẵn sàng trải nghiệm?
            </span>
          </h2>

          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Tham gia cùng hàng triệu khách hàng đã tin tưởng và lựa chọn chúng
            tôi. Khám phá bộ sưu tập mới nhất ngay hôm nay!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl relative overflow-hidden">
              <span className="relative z-10">Mua sắm ngay</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm relative overflow-hidden">
              <span className="relative z-10">Tìm hiểu thêm</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandAboutPage;
