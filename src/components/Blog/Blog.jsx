import React, { useState } from "react";
import {
  Search,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Filter,
  Grid,
  List,
} from "lucide-react";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Sample blog data
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Xu Hướng Thời Trang Bền Vững 2024",
      excerpt:
        "Khám phá những xu hướng thời trang bền vững đang định hình ngành công nghiệp thời trang hiện đại. Từ chất liệu tái chế đến thiết kế tối giản...",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
      category: "Thời trang",
      author: "Nguyễn Minh",
      date: "16.06.2025",
      readTime: "5 phút đọc",
      featured: true,
    },
    {
      id: 2,
      title: "Cách Phối Đồ Với Áo Thun Basic Chuẩn Trend",
      excerpt:
        "Áo thun basic là item không thể thiếu trong tủ đồ. Hãy cùng khám phá những cách phối đồ thông minh để tạo ra outfit ấn tượng...",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
      category: "Phối đồ",
      author: "Trần Hương",
      date: "15.06.2025",
      readTime: "3 phút đọc",
    },
    {
      id: 3,
      title: "Bí Quyết Chăm Sóc Quần Áo Cotton Đúng Cách",
      excerpt:
        "Cotton là chất liệu phổ biến nhất trong thời trang. Tìm hiểu cách giặt, ủi và bảo quản quần áo cotton để sản phẩm luôn như mới...",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
      category: "Chăm sóc",
      author: "Lê Văn A",
      date: "14.06.2025",
      readTime: "4 phút đọc",
    },
    {
      id: 4,
      title: "Những Màu Sắc Thời Trang Hot Nhất Mùa Hè",
      excerpt:
        "Mùa hè 2024 mang đến những gam màu tươi sáng và năng động. Cùng khám phá palette màu sắc đang được yêu thích nhất...",
      image:
        "https://images.unsplash.com/photo-1516762689617-e1cfddf819d1?w=800&h=600&fit=crop",
      category: "Xu hướng",
      author: "Phạm Thu",
      date: "13.06.2025",
      readTime: "6 phút đọc",
    },
    {
      id: 5,
      title: "Style Minimalist: Phong Cách Tối Giản Đầy Tinh Tế",
      excerpt:
        "Minimalist không chỉ là xu hướng mà còn là triết lý sống. Tìm hiểu cách áp dụng phong cách tối giản vào tủ đồ của bạn...",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
      category: "Lifestyle",
      author: "Vũ Minh",
      date: "12.06.2025",
      readTime: "7 phút đọc",
    },
    {
      id: 6,
      title: "Giày Sneakers: Từ Thể Thao Đến Streetwear",
      excerpt:
        "Sneakers đã trở thành biểu tượng của văn hóa streetwear. Cùng tìm hiểu lịch sử và cách phối giày sneakers sao cho phù hợp...",
      image:
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=600&fit=crop",
      category: "Phụ kiện",
      author: "Hoàng Nam",
      date: "11.06.2025",
      readTime: "5 phút đọc",
    },
  ];

  const categories = [
    { id: "all", name: "Tất cả", count: blogPosts.length },
    { id: "fashion", name: "Thời trang", count: 2 },
    { id: "styling", name: "Phối đồ", count: 1 },
    { id: "care", name: "Chăm sóc", count: 1 },
    { id: "trend", name: "Xu hướng", count: 1 },
    { id: "lifestyle", name: "Lifestyle", count: 1 },
  ];

  const featuredPost = blogPosts.find((post) => post.featured);
  const otherPosts = blogPosts.filter((post) => !post.featured);

  return (
    <div className="min-h-screen  text-white mt-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Blog Thời Trang</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Khám phá thế giới thời trang với những bài viết chất lượng, xu
              hướng mới nhất và bí quyết phối đồ độc đáo
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500">
                  <option>Mới nhất</option>
                  <option>Phổ biến</option>
                  <option>Cũ nhất</option>
                </select>
              </div>
              <div className="flex bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-400"
                  } rounded-l-lg`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "text-gray-400"
                  } rounded-r-lg`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900 rounded-xl p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-6 text-green-400">
                Danh mục
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm bg-gray-700 px-2 py-1 rounded">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8 p-4 bg-gradient-to-r from-green-600 to-green-500 rounded-lg">
                <h4 className="font-semibold mb-2">Đăng ký nhận tin</h4>
                <p className="text-sm text-green-100 mb-3">
                  Nhận những bài viết mới nhất về thời trang
                </p>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-3 py-2 bg-white text-black rounded mb-3 text-sm"
                />
                <button className="w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-8 bg-green-500 rounded"></div>
                  <h2 className="text-2xl font-bold text-green-400">
                    Bài viết nổi bật
                  </h2>
                </div>
                <div className="bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                          {featuredPost.category}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 hover:text-green-400 transition-colors cursor-pointer">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{featuredPost.author}</span>
                          <span>•</span>
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                          Đọc tiếp
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Posts */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-green-500 rounded"></div>
                <h2 className="text-2xl font-bold text-green-400">
                  Bài viết khác
                </h2>
              </div>

              {viewMode === "grid" ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {otherPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-3 group-hover:text-green-400 transition-colors cursor-pointer line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                          </div>
                          <button className="text-green-400 hover:text-green-300 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {otherPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors group"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                              {post.category}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {post.date}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-3 group-hover:text-green-400 transition-colors cursor-pointer">
                            {post.title}
                          </h3>
                          <p className="text-gray-300 mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <User className="w-4 h-4" />
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.readTime}</span>
                            </div>
                            <button className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                              Đọc tiếp
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                Trước
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                2
              </button>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                10
              </button>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Không bỏ lỡ xu hướng mới nhất
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Đăng ký để nhận những bài viết chất lượng về thời trang và phong
            cách sống
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-black"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
