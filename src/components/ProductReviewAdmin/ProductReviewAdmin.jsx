import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiStar,
  FiMessageCircle,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiMoreHorizontal,
  FiCalendar,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import {
  DeleteRatingProductAPI,
  getListProductsAPI,
  toggleLikeReplyAPI,
} from "../../service/ApiProduct";

import { Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";

const ProductReviewAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [productData, setProductData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page
  const { user } = useSelector((state) => state.auth);

  const transformReviews = (products) => {
    if (!products || !Array.isArray(products)) return [];

    const transformed = products.flatMap((product) =>
      (product.ratings || []).map((rating) => ({
        id: rating._id || `rating-${Math.random()}`,
        productName: product.name || "Unknown Product",
        productId: product.id || `product-${Math.random()}`,
        productImage:
          product.variants?.[0]?.images?.[0]?.url || "/api/placeholder/60/60",
        customerName: rating.userId?.name || "Anonymous",
        customerEmail: rating.userId?.email
          ? `${rating.userId.email.toLowerCase()}`
          : "anonymous@email.com", // Mock email
        rating: rating.rating || 0,
        comment: rating.review || "No comment",
        date: rating.createdAt || new Date().toISOString(),
        status: rating.replies?.length > 0 ? "responded" : "pending",
        adminResponse:
          rating.replies?.length > 0
            ? rating.replies[rating.replies.length - 1].content
            : null, // Use latest reply
      }))
    );

    // Sort reviews by date (latest first)
    return transformed.sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
    );
  };

  const FetchRatingRewiew = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.EC === 0) {
        setProductData(res.data.data);
        const transformedReviews = transformReviews(res.data.data);
        setReviews(transformedReviews);
        setFilteredReviews(transformedReviews);
        setCurrentPage(1); // Reset to first page on new data
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };

  useEffect(() => {
    FetchRatingRewiew();
  }, []);

  useEffect(() => {
    let filtered = reviews;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.productName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((review) => review.status === filterStatus);
    }

    // Filter by rating
    if (filterRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filterRating)
      );
    }

    // Maintain sorting by latest date
    filtered = filtered.sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
    );

    setFilteredReviews(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filterStatus, filterRating, reviews]);

  const handleResponse = (review) => {
    setSelectedReview(review);
    setResponseText(review.adminResponse || "");
    setShowModal(true);
  };

  const handleDelteRating = async (productId, ratingId) => {
    try {
      const res = await DeleteRatingProductAPI(productId, ratingId);
      if (res && res.data && res.data.EC === 0) {
        const updatedReviews = reviews.filter(
          (review) => review.id !== ratingId
        );

        // Sort updated reviews by date
        const sortedReviews = updatedReviews.sort(
          (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
        );

        setReviews(sortedReviews);
        setFilteredReviews(sortedReviews);
        setCurrentPage(1); // Reset to first page after deletion
      }
    } catch (error) {
      console.log("Error deleting rating:", error);
    }
  };

  const submitResponse = async (productId, id) => {
    try {
      const res = await toggleLikeReplyAPI(
        productId,
        id,
        user._id,
        responseText
      );

      console.log("xxx", res);

      if (res && res.data && res.data.EC === 0) {
        const updatedReviews = reviews.map((review) => {
          if (review.id === selectedReview.id) {
            return {
              ...review,
              adminResponse: responseText,
              status: "responded",
            };
          }
          return review;
        });

        // Sort updated reviews by date
        const sortedReviews = updatedReviews.sort(
          (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
        );

        setReviews(sortedReviews);
        setFilteredReviews(sortedReviews);
        setShowModal(false);
        setResponseText("");
        setSelectedReview(null);
        setCurrentPage(1); // Reset to first page after response
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <AiFillStar
        key={i}
        size={16}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Chờ phản hồi
          </span>
        );
      case "responded":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Đã phản hồi
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Không xác định
          </span>
        );
    }
  };

  const getStatusStats = () => {
    const pending = reviews.filter((r) => r.status === "pending").length;
    const responded = reviews.filter((r) => r.status === "responded").length;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return { pending, responded, avgRating: avgRating.toFixed(1) };
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Đánh giá Sản phẩm
          </h1>
          <p className="text-gray-600">
            Theo dõi và phản hồi đánh giá từ khách hàng
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng đánh giá
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {reviews.length}
                </p>
              </div>
              <FiMessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Chờ phản hồi
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <FiEye className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã phản hồi</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.responded}
                </p>
              </div>
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.avgRating}
                </p>
              </div>
              <FiStar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo sản phẩm, khách hàng hoặc nội dung..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ phản hồi</option>
                <option value="responded">Đã phản hồi</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {review.productName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.customerEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          ({review.rating})
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moment(review.date).format("DD-MM-YYYY")}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <button
                        onClick={() => handleResponse(review)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        {review.status === "responded"
                          ? "Xem phản hồi"
                          : "Phản hồi"}
                      </button>

                      <Popconfirm
                        title="Bạn có muốn xóa phản hồi này không?"
                        description={`Bạn có chắc chắn muốn xóa phản hồi của sản phẩm "${review.productName}" không?`}
                        icon={
                          <QuestionCircleOutlined style={{ color: "red" }} />
                        }
                        onConfirm={() =>
                          handleDelteRating(review.productId, review.id)
                        }
                      >
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Xóa phản hồi
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4 px-6 bg-white border-t">
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages} (Tổng{" "}
                {filteredReviews.length} đánh giá)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                >
                  Trước
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Response Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {selectedReview?.status === "responded"
                  ? "Xem phản hồi"
                  : "Phản hồi đánh giá"}
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <img
                    src={selectedReview?.productImage}
                    alt={selectedReview?.productName}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="ml-3">
                    <div className="font-medium">
                      {selectedReview?.productName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedReview?.customerName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(selectedReview?.rating)}
                </div>
                <p className="text-gray-700">{selectedReview?.comment}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phản hồi của Admin
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập phản hồi của bạn..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  disabled={selectedReview?.status === "responded"}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                {selectedReview?.status !== "responded" && (
                  <button
                    onClick={() =>
                      submitResponse(
                        selectedReview.productId,
                        selectedReview.id
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={!responseText.trim()}
                  >
                    Gửi phản hồi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewAdmin;
