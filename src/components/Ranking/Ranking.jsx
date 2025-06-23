import { useEffect, useState, useCallback, useMemo } from "react";
import "./Ranking.css";
import {
  DollarOutlined,
  CrownOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { UserAuth } from "../../service/Auth";

const Ranking = () => {
  const [users, setUsers] = useState([]);

  const formatPrice = (price) => {
    if (!price) return "0VNĐ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "VNĐ";
  };

  const getRankStyles = (index) => {
    const styles = [
      {
        bg: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",
        border: "border-yellow-300",
        shadow: "shadow-yellow-200",
        text: "text-yellow-900",
        glow: "shadow-2xl shadow-yellow-400/50",
      },
      {
        bg: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",
        border: "border-gray-300",
        shadow: "shadow-gray-200",
        text: "text-gray-800",
        glow: "shadow-2xl shadow-gray-400/50",
      },
      {
        bg: "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800",
        border: "border-amber-400",
        shadow: "shadow-amber-200",
        text: "text-amber-100",
        glow: "shadow-2xl shadow-amber-600/50",
      },
    ];
    return (
      styles[index] || {
        bg: "bg-gradient-to-r from-blue-100 to-blue-200",
        border: "border-blue-200",
        shadow: "shadow-blue-100",
        text: "text-blue-800",
        glow: "shadow-lg shadow-blue-200/30",
      }
    );
  };

  const getRankIcon = (index) => {
    const iconClass = "text-2xl drop-shadow-lg";
    switch (index) {
      case 0:
        return (
          <CrownOutlined
            className={`${iconClass} text-yellow-600 animate-pulse`}
          />
        );
      case 1:
        return <TrophyOutlined className={`${iconClass} text-gray-600`} />;
      case 2:
        return <TrophyOutlined className={`${iconClass} text-amber-600`} />;
      default:
        return <TrophyOutlined className={`${iconClass} text-blue-500`} />;
    }
  };

  const fetchDataUsers = useCallback(async () => {
    let res = await UserAuth();
    if (res?.data?.EC === 0) {
      setUsers(res.data.data);
    }
  }, []);

  useEffect(() => {
    fetchDataUsers();
  }, [fetchDataUsers]);

  const sortedRanking = useMemo(() => {
    return [...users].sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
  }, [users]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6 mt-28">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6 shadow-2xl shadow-purple-500/30">
            <DollarOutlined className="text-4xl text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🏆 Bảng Xếp Hạng Chi Tiêu 🏆
          </h1>
          <p className="text-gray-600 text-lg">
            Những người dẫn đầu trong tháng này
          </p>
        </div>

        {/* Top 3 Podium */}
        {/* Top 3 Podium */}
        {sortedRanking.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {[1, 0, 2].map((position, displayIndex) => {
              const user = sortedRanking[position];
              const rankStyle = getRankStyles(position);
              const heights = ["h-32", "h-40", "h-28"]; // Thấp - Cao - Trung bình
              return (
                <div
                  key={user._id}
                  className={`relative ${heights[displayIndex]} ${rankStyle.glow} rounded-2xl ${rankStyle.bg} ${rankStyle.border} border-2 flex flex-col items-center justify-end p-4 transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
                    <div
                      className="absolute top-4 right-3 w-3 h-3 bg-white rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div className="absolute bottom-8 left-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>

                  {/* Rank number badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-current">
                    #{position + 1}
                  </div>

                  {/* User avatar */}
                  <div className="relative mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                    <div className="absolute -top-2 -right-2">
                      {getRankIcon(position)}
                    </div>
                  </div>

                  {/* User info */}
                  <h3 className="font-bold text-white text-center text-sm mb-1 drop-shadow-lg">
                    {user.name}
                  </h3>
                  <p className="text-white/90 text-xs font-semibold drop-shadow">
                    {formatPrice(user.totalPrice)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Ranking List */}
        <div className="main_ranking bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-white/95">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <DollarOutlined className="text-green-500 text-3xl mr-3" />
              Bảng Xếp Hạng Chi Tiết
            </h2>
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              {sortedRanking.length} thành viên
            </div>
          </div>

          <div className="space-y-4 top_ranking">
            {sortedRanking.map((user, index) => {
              const rankStyle = getRankStyles(index);

              return (
                <div
                  key={user._id}
                  className={`relative group flex items-center p-6 bg-gradient-to-r from-white to-gray-50 border-2 ${
                    rankStyle.border
                  } rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    index < 3 ? rankStyle.glow : "hover:shadow-lg"
                  }`}
                >
                  {/* Rank number with special styling for top 3 */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl mr-6 ${
                      index < 3
                        ? rankStyle.bg + " text-white shadow-lg"
                        : "bg-gray-100 text-gray-700"
                    } font-bold text-lg transition-all duration-300 group-hover:scale-110`}
                  >
                    #{index + 1}
                  </div>

                  {/* Rank icon */}
                  <div className="mr-4 transform group-hover:scale-110 transition-transform duration-300">
                    {getRankIcon(index)}
                  </div>

                  {/* User avatar with online indicator */}
                  <div className="relative mr-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={`w-16 h-16 rounded-full border-4 ${
                        index < 3 ? "border-white shadow-lg" : "border-gray-200"
                      } object-cover transition-all duration-300 group-hover:scale-105`}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                  </div>

                  {/* User details */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                        {user.name}
                      </h3>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500 block">Tổng chi tiêu</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatPrice(user.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Achievement badges for top performers */}
                  {index < 3 && (
                    <div className="absolute top-4 right-4 flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
                    <div
                      className={`h-full ${
                        index < 3
                          ? rankStyle.bg
                          : "bg-gradient-to-r from-blue-400 to-purple-500"
                      } transition-all duration-1000 ease-out`}
                      style={{
                        width:
                          sortedRanking.length > 0
                            ? `${Math.min(
                                (user.totalPrice /
                                  sortedRanking[0].totalPrice) *
                                  100,
                                100
                              )}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        {sortedRanking.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarOutlined className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                {formatPrice(
                  sortedRanking.reduce(
                    (sum, user) => sum + (user.totalPrice || 0),
                    0
                  )
                )}
              </h3>
              <p className="text-gray-600">
                Tổng chi tiêu của tất cả thành viên
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyOutlined className="text-xl text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                {sortedRanking.length}
              </h3>
              <p className="text-gray-600">Tổng số thành viên tham gia</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
