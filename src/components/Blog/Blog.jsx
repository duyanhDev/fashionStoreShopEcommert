import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Filter,
  Grid,
  List,
  FileX,
} from "lucide-react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllBlog, updateViewBlog } from "../../service/Blog";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";

// Custom hook for debounce
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

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [allBlogPosts, setAllBlogPosts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [sortType, setSortType] = useState("newest");
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const debouncedSearch = useDebounce(searchItem, 500);

  // Memoize filtered and sorted posts để tránh re-render không cần thiết
  const processedBlogPosts = useMemo(() => {
    let filteredPosts = allBlogPosts;

    // Lọc theo danh mục
    if (selectedCategory) {
      filteredPosts = filteredPosts.filter(
        (blog) => blog.regex.toString() === selectedCategory.toString()
      );
    }

    // Lọc theo tìm kiếm
    if (debouncedSearch) {
      filteredPosts = filteredPosts.filter(
        (item) =>
          item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.regex.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Sắp xếp
    const sortedPosts = [...filteredPosts];
    switch (sortType) {
      case "newest":
        sortedPosts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        sortedPosts.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "popular":
        sortedPosts.sort((a, b) => (b.view || 0) - (a.view || 0));
        break;
      default:
        break;
    }

    return sortedPosts;
  }, [allBlogPosts, selectedCategory, debouncedSearch, sortType]);

  // Cập nhật blogPosts khi processedBlogPosts thay đổi
  useEffect(() => {
    setBlogPosts(processedBlogPosts);
    setCurrentPage(0); // Reset về trang đầu khi có thay đổi
  }, [processedBlogPosts]);

  // Pagination data
  const { currentItems, pageCount } = useMemo(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    return {
      currentItems: blogPosts.slice(offset, offset + ITEMS_PER_PAGE),
      pageCount: Math.ceil(blogPosts.length / ITEMS_PER_PAGE),
    };
  }, [blogPosts, currentPage]);

  const featuredPost = currentItems.find((post) => post.featured || post.regex);
  const otherPosts = currentItems.filter((post) => !post.featured);

  // Fetch data
  const fetchApiBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllBlog();

      if (res && res.data && res.data.EC === 0) {
        setAllBlogPosts(res.data.data);
        // Tạo danh mục unique
        const uniqueCategories = [
          ...new Set(res.data.data.map((item) => item.regex).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } else {
        setError("Không thể tải dữ liệu blog");
      }
    } catch (error) {
      console.error("Lỗi khi tải blog:", error);
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiBlog();
  }, [fetchApiBlog]);

  // Event handlers
  const handleCategoryFilter = useCallback((regex) => {
    setSelectedCategory(regex);
    handleFilter();
  }, []);

  const handleSort = useCallback((type) => {
    setSortType(type);
    handleFilter();
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchItem(e.target.value);
  }, []);

  const listRef = useRef();

  const handleFilter = () => {
    // ... filter logic
    if (listRef.current) {
      const offset = -150; // số px muốn nhích lên trên
      const y =
        listRef.current.getBoundingClientRect().top + window.scrollY + offset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };
  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected);

    // Scroll đến giữa màn hình

    handleFilter();
  }, []);

  const handlePostClick = useCallback(
    async (post) => {
      const res = await updateViewBlog(post.slug);
      if (res && res.data && res.data.EC === 0) {
        navigate(post.slug || `/blog/${post.slug}`);
      }
    },
    [navigate]
  );

  // Component hiển thị khi không có kết quả
  const NoResultsFound = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileX className="w-24 h-24 text-gray-600 mb-6" />
      <h3 className="text-2xl font-semibold text-gray-300 mb-4">
        Không tìm thấy bài viết nào
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {searchItem
          ? `Không có kết quả nào cho từ khóa "${searchItem}"`
          : selectedCategory
          ? `Không có bài viết nào trong danh mục "${selectedCategory}"`
          : "Không có bài viết nào để hiển thị"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {searchItem && (
          <button
            onClick={() => setSearchItem("")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Xóa từ khóa tìm kiếm
          </button>
        )}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory("")}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Xem tất cả danh mục
          </button>
        )}
      </div>
    </div>
  );

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchApiBlog}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white mt-28">
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
                value={searchItem}
                onChange={handleSearch}
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white placeholder-gray-400"
              />
              {searchItem && (
                <button
                  onClick={() => setSearchItem("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={sortType}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Phổ biến</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
              <div className="flex bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:text-white"
                  } rounded-l-lg`}
                  aria-label="Xem dạng lưới"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:text-white"
                  } rounded-r-lg`}
                  aria-label="Xem dạng danh sách"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Hiển thị thông tin tìm kiếm */}
          {(searchItem || selectedCategory) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span>Hiển thị {blogPosts.length} kết quả</span>
              {searchItem && (
                <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                  Từ khóa: "{searchItem}"
                </span>
              )}
              {selectedCategory && (
                <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                  Danh mục: {selectedCategory}
                </span>
              )}
            </div>
          )}
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
                <button
                  onClick={() => handleCategoryFilter("")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedCategory === ""
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {allBlogPosts.length}
                  </span>
                </button>

                {categories.map((category, index) => {
                  const count = allBlogPosts.filter(
                    (post) => post.regex === category
                  ).length;
                  return (
                    <button
                      key={index}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-green-600 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <span>{category}</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Newsletter Signup */}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {currentItems.length === 0 ? (
              <NoResultsFound />
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-12">
                    <div className="relative flex items-center gap-2 mb-4">
                      <div className="w-2 h-8 bg-green-500 rounded"></div>
                      <h2 className="text-2xl font-bold text-green-400">
                        Bài viết nổi bật
                      </h2>
                      {user?.role === "admin" && (
                        <Button
                          className="absolute right-0 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors border-none"
                          onClick={() => navigate("/create/blog")}
                        >
                          Tạo Bài Viết
                        </Button>
                      )}
                    </div>

                    <div
                      className="bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                      onClick={() => handlePostClick(featuredPost)}
                    >
                      <div className="md:flex">
                        <div className="md:w-1/2">
                          <img
                            src={featuredPost.img[0]?.url}
                            alt={featuredPost.title}
                            className="w-full h-64 md:h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="md:w-1/2 p-8">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                              {featuredPost.regex}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {moment(featuredPost.createdAt).format(
                                "DD/MM/YYYY"
                              )}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold mb-4 hover:text-green-400 transition-colors">
                            {featuredPost.title}
                          </h3>
                          <p className="text-gray-300 mb-4 leading-relaxed line-clamp-2">
                            {featuredPost.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <User className="w-4 h-4" />
                              <span>
                                {featuredPost.userId?.name || "Ẩn danh"}
                              </span>
                              <span>•</span>
                              <span>
                                {featuredPost.readTime || "5 phút đọc"}
                              </span>
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
                {otherPosts.length > 0 && (
                  <div className="mb-8" ref={listRef}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-8 bg-green-500 rounded"></div>
                      <h2 className="text-2xl font-bold text-green-400">
                        {featuredPost ? "Bài viết khác" : "Tất cả bài viết"}
                      </h2>
                    </div>

                    {viewMode === "grid" ? (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {otherPosts.map((post) => (
                          <article
                            key={post._id}
                            className="bg-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group cursor-pointer"
                            onClick={() => handlePostClick(post)}
                          >
                            <div className="relative">
                              <img
                                src={post.img[0]?.url}
                                alt={post.title}
                                className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
                                loading="lazy"
                              />
                              <div className="absolute top-4 left-4">
                                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                  {post.regex}
                                </span>
                              </div>
                            </div>
                            <div className="p-6">
                              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {moment(post.createdAt).format("DD/MM/YYYY")}
                                </span>
                                <span>•</span>
                                <span>{post.readTime || "5 phút đọc"}</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                {post.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <User className="w-4 h-4" />
                                  <span>{post.userId?.name || "Ẩn danh"}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {otherPosts.map((post) => (
                          <article
                            key={post._id}
                            className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors group cursor-pointer"
                            onClick={() => handlePostClick(post)}
                          >
                            <div className="md:flex">
                              <div className="md:w-1/3">
                                <img
                                  src={post.img[0]?.url}
                                  alt={post.title}
                                  className="w-full h-48 md:h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="md:w-2/3 p-6">
                                <div className="flex items-center gap-4 mb-3">
                                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                    {post.regex}
                                  </span>
                                  <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {moment(post.createdAt).format(
                                      "DD/MM/YYYY"
                                    )}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-gray-300 mb-4 line-clamp-3">
                                  {post.content}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <User className="w-4 h-4" />
                                    <span>
                                      {post.userId?.name || "Ẩn danh"}
                                    </span>
                                    <span>•</span>
                                    <span>{post.readTime || "5 phút đọc"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
                                    Đọc tiếp
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {pageCount > 1 && (
                  <div className="flex justify-center items-center mt-12">
                    <ReactPaginate
                      previousLabel={"← Trước"}
                      nextLabel={"Sau →"}
                      pageCount={pageCount}
                      onPageChange={handlePageClick}
                      containerClassName={"flex items-center gap-2"}
                      pageClassName={"page-item"}
                      pageLinkClassName={
                        "px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-green-600 transition-colors border border-gray-700"
                      }
                      activeClassName={"active"}
                      activeLinkClassName={
                        "!bg-green-600 !text-white border-green-600"
                      }
                      previousClassName={"page-item"}
                      previousLinkClassName={
                        "px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-green-600 transition-colors border border-gray-700"
                      }
                      nextClassName={"page-item"}
                      nextLinkClassName={
                        "px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-green-600 transition-colors border border-gray-700"
                      }
                      disabledClassName={"opacity-50 cursor-not-allowed"}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={2}
                      forcePage={currentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
