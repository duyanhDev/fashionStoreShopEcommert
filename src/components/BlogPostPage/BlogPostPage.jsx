import React, { useEffect, useState } from "react";
import { Calendar, Clock, Eye } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDetaillBlog } from "../../service/Blog";
import moment from "moment";

const BlogPostPage = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(142);
  const { slug } = useParams();
  const [blogPost1, SetblogPost] = useState("");
  console.log(slug);

  const fetchAPIBlog = async () => {
    try {
      const res = await getDetaillBlog(slug);

      console.log(res);
      SetblogPost(res.data.data);
    } catch (error) {}
  };

  // Mock data cho các bài viết gợi ý
  const suggestedPosts = [
    {
      id: 1,
      title: "10 Xu hướng thời trang nữ hot nhất 2025",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop",
      category: "Thời trang",
      readTime: "3 phút",
      publishDate: "25/08/2025",
    },
    {
      id: 2,
      title: "Cách phối đồ streetwear chuẩn chỉnh",
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=200&fit=crop",
      category: "Streetwear",
      readTime: "5 phút",
      publishDate: "23/08/2025",
    },
    {
      id: 3,
      title: "Makeup trend mùa thu 2025",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop",
      category: "Làm đẹp",
      readTime: "4 phút",
      publishDate: "20/08/2025",
    },
    {
      id: 4,
      title: "Bí quyết chọn phụ kiện hoàn hảo",
      image:
        "https://images.unsplash.com/photo-1596035069985-8d0968a8bc01?w=300&h=200&fit=crop",
      category: "Phụ kiện",
      readTime: "6 phút",
      publishDate: "18/08/2025",
    },
    {
      id: 5,
      title: "Thời trang công sở hiện đại",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop",
      category: "Công sở",
      readTime: "7 phút",
      publishDate: "15/08/2025",
    },
  ];

  const trendingTags = [
    "Thời trang 2025",
    "Streetwear",
    "Vintage",
    "Sustainable Fashion",
    "Y2K Style",
    "Minimalism",
    "Color Trend",
    "Accessories",
  ];

  // Mock data cho bài viết
  const blogPost = {
    id: blogPost1._id,
    title: blogPost1.title,
    subtitle: blogPost1.tip,
    author: {
      name: blogPost1?.userId?.name,
      avatar: blogPost1?.userId?.avatar,
      bio: "Senior Frontend Developer với 5+ năm kinh nghiệm",
    },
    publishDate: moment(blogPost1.createdAt).format("DD/MM/YYYY"),
    readTime: `${blogPost1.readTime} đọc`,
    views: blogPost1.view,
    category: blogPost1.regex,
    featuredImage: blogPost1 && blogPost1.img[0]?.url,
    content: blogPost1?.content,

    tags: ["React", "JavaScript", "Frontend", "Web Development", "Hooks"],
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatContent = (content) => {
    if (!content || typeof content !== "string") return null; // tránh lỗi split

    // Xử lý các loại line break khác nhau: \r\n\r\n, \n\n, hoặc chỉ \r\n, \n
    const paragraphs = content
      .split(/\r\n\r\n|\n\n/) // Split theo double line breaks
      .filter((paragraph) => paragraph.trim() !== ""); // Loại bỏ đoạn rỗng

    return paragraphs.map((paragraph, index) => {
      // Loại bỏ \r\n thừa trong mỗi đoạn và thay bằng space để text không bị dính
      const cleanParagraph = paragraph.replace(/\r\n|\n/g, " ").trim();

      if (cleanParagraph.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-2xl font-bold mt-8 mb-4 text-gray-800"
          >
            {cleanParagraph.replace("## ", "")}
          </h2>
        );
      } else if (cleanParagraph.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold mt-6 mb-3 text-gray-700"
          >
            {cleanParagraph.replace("### ", "")}
          </h3>
        );
      } else if (cleanParagraph.includes("```")) {
        const codeContent = cleanParagraph.replace(
          /```javascript\n?|\n?```/g,
          ""
        );
        return (
          <pre
            key={index}
            className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto my-4 text-sm"
          >
            <code>{codeContent}</code>
          </pre>
        );
      } else if (
        cleanParagraph.startsWith("- **") ||
        cleanParagraph.startsWith("**")
      ) {
        return (
          <p
            key={index}
            className="mb-4 text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: cleanParagraph
                .replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-semibold text-gray-800">$1</strong>'
                )
                .replace(
                  /`(.*?)`/g,
                  '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
                )
                .replace(/'/g, "&#39;"), // Escape single quotes cho HTML
            }}
          />
        );
      }

      return (
        <p
          key={index}
          className="mb-4 text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: cleanParagraph
              .replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="font-semibold text-gray-800">$1</strong>'
              )
              .replace(
                /`(.*?)`/g,
                '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
              )
              .replace(/'/g, "&#39;"), // Escape single quotes cho HTML
          }}
        />
      );
    });
  };

  useEffect(() => {
    fetchAPIBlog();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article - Takes 3/4 of the width */}
          <article className="lg:col-span-3 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Featured Image */}
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img
                src={blogPost.featuredImage}
                alt={blogPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {blogPost.category}
                </span>
              </div>
            </div>

            {/* Article Header */}
            <div className="p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {blogPost.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {blogPost.subtitle}
              </p>

              {/* Author Info & Meta */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center mb-4 md:mb-0">
                  <img
                    src={blogPost.author.avatar}
                    alt={blogPost.author.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {blogPost.author.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {blogPost.author.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {blogPost.publishDate}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {blogPost.readTime}
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {blogPost.views} lượt xem
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {formatContent(blogPost.content)}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Takes 1/4 of the width */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Suggested Posts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Bài viết gợi ý
              </h3>
              <div className="space-y-4">
                {suggestedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex space-x-3 group cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Tags phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Đăng ký nhận tin</h3>
              <p className="text-blue-100 text-sm mb-4">
                Nhận những bài viết mới nhất về thời trang và lifestyle
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Author Bio */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-start space-x-4">
            <img
              src={blogPost.author.avatar}
              alt={blogPost.author.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Về tác giả
              </h3>
              <h4 className="font-semibold text-gray-700 mb-2">
                {blogPost.author.name}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {blogPost.author.bio}. Anh có đam mê lớn với công nghệ web hiện
                đại và luôn tìm kiếm những cách thức mới để tối ưu hóa trải
                nghiệm người dùng. Trong thời gian rảnh, anh thích chia sẻ kiến
                thức thông qua các bài viết và workshop.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;
