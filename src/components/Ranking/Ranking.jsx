import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Crown,
  Trophy,
  Medal,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
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
        bg: "from-yellow-400 via-yellow-500 to-amber-500",
        text: "text-yellow-100",
        border: "border-yellow-300/50",
        glow: "shadow-2xl shadow-yellow-500/40",
        particle: "bg-yellow-300",
      },
      {
        bg: "from-slate-400 via-slate-500 to-gray-600",
        text: "text-slate-100",
        border: "border-slate-300/50",
        glow: "shadow-2xl shadow-slate-500/40",
        particle: "bg-slate-300",
      },
      {
        bg: "from-amber-600 via-orange-600 to-amber-700",
        text: "text-amber-100",
        border: "border-amber-300/50",
        glow: "shadow-2xl shadow-amber-600/40",
        particle: "bg-amber-400",
      },
    ];
    return (
      styles[index] || {
        bg: "from-blue-500 via-indigo-500 to-purple-600",
        text: "text-blue-100",
        border: "border-blue-300/50",
        glow: "shadow-xl shadow-blue-500/30",
        particle: "bg-blue-400",
      }
    );
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <Crown className="w-8 h-8 text-yellow-300 drop-shadow-lg animate-bounce" />
        );
      case 1:
        return <Trophy className="w-7 h-7 text-slate-300 drop-shadow-lg" />;
      case 2:
        return <Medal className="w-7 h-7 text-amber-400 drop-shadow-lg" />;
      default:
        return <Award className="w-6 h-6 text-indigo-400 drop-shadow-lg" />;
    }
  };

  // Simulated API call
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
    return [...users]
      .slice(0, 5)
      .sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0))
      .filter((item) => item.role === "customer");
  }, [users]);

  const FloatingParticles = ({ count = 6, className = "bg-white" }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 ${className} rounded-full opacity-60`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6 shadow-2xl shadow-purple-500/30 pulse-glow">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tight">
                🏆 BẢNG XẾP HẠNG ELITE 🏆
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Những người dẫn đầu trong cuộc đua chi tiêu tháng này
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">
                    {sortedRanking.length} Thành viên
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">Cập nhật realtime</span>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}
            {sortedRanking.length >= 3 && (
              <div className="mb-16 lg:mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {/* Responsive podium order: 2nd, 1st, 3rd */}
                  {[1, 0, 2].map((position, displayIndex) => {
                    const user = sortedRanking[position];
                    const rankStyle = getRankStyles(position);
                    const heights = ["lg:h-32", "lg:h-48", "lg:h-28"];
                    const orders = [
                      "order-2 lg:order-1",
                      "order-1 lg:order-2",
                      "order-3 lg:order-3",
                    ];

                    return (
                      <div
                        key={user._id}
                        className={`${orders[displayIndex]} relative`}
                      >
                        <div
                          className={`
                          relative ${heights[displayIndex]} h-40 lg:h-auto
                          bg-gradient-to-br ${rankStyle.bg} 
                          ${rankStyle.border} border-2 ${rankStyle.glow}
                          rounded-3xl flex flex-col items-center justify-end 
                          p-4 lg:p-6 transform hover:scale-105 transition-all duration-500 
                          cursor-pointer overflow-hidden group shimmer
                        `}
                        >
                          <FloatingParticles
                            count={8}
                            className={rankStyle.particle}
                          />

                          {/* Rank badge */}
                          <div
                            className={`
                            absolute -top-4 left-1/2 transform -translate-x-1/2 
                            w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full 
                            flex items-center justify-center font-black text-lg lg:text-xl 
                            shadow-2xl border-4 ${rankStyle.border}
                            ${position === 0 ? "animate-pulse" : ""}
                          `}
                          >
                            #{position + 1}
                          </div>

                          {/* Crown for first place */}
                          {position === 0 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                              <Crown className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-400 animate-bounce" />
                            </div>
                          )}

                          {/* User avatar */}
                          <div className="relative mb-4 lg:mb-6">
                            <div className="relative">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className={`
                                  w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white 
                                  shadow-2xl object-cover transform transition-transform duration-300 
                                  group-hover:scale-110
                                  ${
                                    position === 0
                                      ? "ring-4 ring-yellow-400/50"
                                      : ""
                                  }
                                `}
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                            </div>
                            <div className="absolute -top-2 -right-2">
                              {getRankIcon(position)}
                            </div>
                          </div>

                          {/* User info */}
                          <div className="text-center mb-2">
                            <h3
                              className={`font-bold ${rankStyle.text} text-sm lg:text-base mb-1 drop-shadow-lg tracking-wide`}
                            >
                              {user.name}
                            </h3>
                            <p className="text-white/90 text-xs lg:text-sm font-bold drop-shadow">
                              {formatPrice(user.totalPrice)}
                            </p>
                          </div>

                          {/* Special effects for top 3 */}
                          <div className="absolute top-2 right-2 flex flex-col space-y-1">
                            {Array.from({ length: 3 - position }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-300 animate-pulse"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Ranking List */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                  <DollarSign className="text-green-400 w-8 h-8" />
                  Bảng Xếp Hạng Chi Tiết
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    {sortedRanking.length} thành viên
                  </div>
                </div>
              </div>

              <div className="space-y-3 lg:space-y-4">
                {sortedRanking.map((user, index) => {
                  const rankStyle = getRankStyles(index);
                  const isTopThree = index < 3;

                  return (
                    <div
                      key={user._id}
                      className={`
                        relative group flex flex-col sm:flex-row items-start sm:items-center 
                        p-4 lg:p-6 bg-gradient-to-r from-white/10 to-white/5 
                        border border-white/20 rounded-2xl backdrop-blur-sm
                        hover:bg-white/20 transition-all duration-500 
                        transform hover:-translate-y-1 hover:shadow-2xl
                        ${
                          isTopThree
                            ? rankStyle.glow + " " + rankStyle.border
                            : "hover:shadow-xl"
                        }
                      `}
                    >
                      {isTopThree && (
                        <FloatingParticles count={4} className="bg-white/40" />
                      )}

                      <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-0 w-full sm:w-auto">
                        {/* Rank number */}
                        <div
                          className={`
                          flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 
                          rounded-xl font-black text-lg lg:text-xl transition-all duration-300 
                          group-hover:scale-110 shrink-0
                          ${
                            isTopThree
                              ? `bg-gradient-to-r ${rankStyle.bg} text-white shadow-lg`
                              : "bg-white/10 text-gray-300 border border-white/20"
                          }
                        `}
                        >
                          #{index + 1}
                        </div>

                        {/* Rank icon */}
                        <div className="transform group-hover:scale-110 transition-transform duration-300 shrink-0">
                          {getRankIcon(index)}
                        </div>

                        {/* User avatar */}
                        <div className="relative shrink-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={`
                              w-12 h-12 lg:w-16 lg:h-16 rounded-full border-3 object-cover 
                              transition-all duration-300 group-hover:scale-105
                              ${
                                isTopThree
                                  ? "border-white shadow-xl ring-2 ring-white/30"
                                  : "border-white/30"
                              }
                            `}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                      </div>

                      {/* User details */}
                      <div className="flex-grow w-full sm:ml-4 lg:ml-12">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-lg lg:text-xl text-white group-hover:text-yellow-300 transition-colors duration-300">
                              {user.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span>Tổng chi tiêu:</span>
                              <span className="font-bold text-green-400 text-base lg:text-lg">
                                {formatPrice(user.totalPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Achievement badges */}
                          {isTopThree && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 animate-pulse" />
                              <span className="text-xs lg:text-sm text-yellow-300 font-semibold">
                                VIP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`
                              h-full transition-all duration-1000 ease-out rounded-full
                              ${
                                isTopThree
                                  ? `bg-gradient-to-r ${rankStyle.bg}`
                                  : "bg-gradient-to-r from-blue-400 to-purple-500"
                              }
                            `}
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Footer */}
            {sortedRanking.length > 0 && (
              <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: DollarSign,
                    title: formatPrice(
                      sortedRanking.reduce(
                        (sum, user) => sum + (user.totalPrice || 0),
                        0
                      )
                    ),
                    subtitle: "Tổng chi tiêu",
                    color: "from-green-400 to-green-600",
                  },
                  {
                    icon: Users,
                    title: sortedRanking.length.toString(),
                    subtitle: "Thành viên tham gia",
                    color: "from-blue-400 to-blue-600",
                  },
                  {
                    icon: Trophy,
                    title: formatPrice(sortedRanking[0]?.totalPrice || 0),
                    subtitle: "Người dẫn đầu",
                    color: "from-yellow-400 to-yellow-600",
                  },
                  {
                    icon: TrendingUp,
                    title: "98%",
                    subtitle: "Mức độ tham gia",
                    color: "from-purple-400 to-purple-600",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 border border-white/20 hover:bg-white/20"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-xl lg:text-2xl text-white mb-2 truncate">
                      {stat.title}
                    </h3>
                    <p className="text-gray-300 text-sm lg:text-base">
                      {stat.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ranking;
