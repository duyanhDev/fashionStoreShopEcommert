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
        border: "border-yellow-400/60",
        glow: "shadow-2xl shadow-yellow-500/50",
        particle: "bg-yellow-300",
      },
      {
        bg: "from-slate-300 via-slate-400 to-gray-500",
        text: "text-slate-100",
        border: "border-slate-400/60",
        glow: "shadow-2xl shadow-slate-500/50",
        particle: "bg-slate-300",
      },
      {
        bg: "from-orange-500 via-orange-600 to-amber-600",
        text: "text-orange-100",
        border: "border-orange-400/60",
        glow: "shadow-2xl shadow-orange-600/50",
        particle: "bg-orange-400",
      },
    ];
    return (
      styles[index] || {
        bg: "from-green-500 via-emerald-600 to-green-700",
        text: "text-green-100",
        border: "border-green-400/60",
        glow: "shadow-xl shadow-green-500/40",
        particle: "bg-green-400",
      }
    );
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <Crown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-300 drop-shadow-lg animate-bounce" />
        );
      case 1:
        return (
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-300 drop-shadow-lg" />
        );
      case 2:
        return (
          <Medal className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-orange-400 drop-shadow-lg" />
        );
      default:
        return (
          <Award className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400 drop-shadow-lg" />
        );
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
      .sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0))
      .filter((item) => item.role === "customer")
      .slice(0, 5);
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
      <div className="min-h-screen mt-14 bg-gradient-to-br from-black via-green-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-5 sm:top-20 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-5 sm:bottom-20 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-green-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pt-16 sm:pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4 sm:mb-6 shadow-2xl shadow-green-500/40">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent mb-3 sm:mb-4 tracking-tight px-2">
                🏆 BẢNG XẾP HẠNG ELITE 🏆
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4">
                Những người dẫn đầu trong cuộc đua chi tiêu tháng này
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 px-4">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-white text-xs sm:text-sm">
                    {sortedRanking.length} Thành viên
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-white text-xs sm:text-sm">
                    Cập nhật realtime
                  </span>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}

            {/* Detailed Ranking List */}
            <div className="bg-emerald-50/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 border border-green-200/50 shadow-2xl mx-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
                  <DollarSign className="text-green-600 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  <span className="line-clamp-1">Bảng Xếp Hạng Chi Tiết</span>
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-xs sm:text-sm text-gray-700 bg-green-100 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-green-200">
                    {sortedRanking.length} thành viên
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-3 lg:space-y-4">
                {sortedRanking.map((user, index) => {
                  const rankStyle = getRankStyles(index);
                  const isTopThree = index < 3;

                  return (
                    <div
                      key={user._id}
                      className={`
                        relative group flex flex-col items-start
                        p-3 sm:p-4 lg:p-6 bg-white/90
                        border-2 ${
                          isTopThree ? rankStyle.border : "border-green-200/50"
                        } 
                        rounded-xl sm:rounded-2xl backdrop-blur-sm
                        hover:bg-white transition-all duration-500 
                        transform hover:-translate-y-1 
                        ${
                          isTopThree
                            ? rankStyle.glow
                            : "hover:shadow-xl shadow-lg"
                        }
                      `}
                    >
                      {isTopThree && (
                        <FloatingParticles
                          count={4}
                          className="bg-green-400/40"
                        />
                      )}

                      {/* Top row: Rank + Icon + Avatar */}
                      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full mb-3">
                        {/* Rank number */}
                        <div
                          className={`
                          flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                          rounded-xl font-black text-lg sm:text-xl lg:text-2xl transition-all duration-300 
                          group-hover:scale-110 shrink-0
                          ${
                            isTopThree
                              ? `bg-gradient-to-r ${rankStyle.bg} text-white shadow-lg`
                              : "bg-green-100 text-green-700 border-2 border-green-300"
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
                              w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border-3 object-cover 
                              transition-all duration-300 group-hover:scale-105
                              ${
                                isTopThree
                                  ? "border-white shadow-xl ring-2 ring-white/50"
                                  : "border-green-200"
                              }
                            `}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* VIP badge (mobile - right side) */}
                        {isTopThree && (
                          <div className="flex items-center gap-1 ml-auto shrink-0">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse" />
                            <span className="text-xs sm:text-sm text-yellow-600 font-bold">
                              VIP
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom row: User info */}
                      <div className="w-full pl-0 sm:pl-2">
                        <div className="mb-2">
                          <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-800 group-hover:text-green-600 transition-colors duration-300 mb-1">
                            {user.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <span className="shrink-0 font-medium">
                              Tổng chi tiêu:
                            </span>
                            <span className="font-bold text-green-600 text-sm sm:text-base lg:text-lg">
                              {formatPrice(user.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 sm:h-2.5 bg-green-100 rounded-full overflow-hidden border border-green-200/50">
                          <div
                            className={`
                              h-full transition-all duration-1000 ease-out rounded-full
                              ${
                                isTopThree
                                  ? `bg-gradient-to-r ${rankStyle.bg}`
                                  : "bg-gradient-to-r from-green-400 to-emerald-600"
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
              <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2">
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
                    color: "from-emerald-400 to-emerald-600",
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
                    color: "from-green-500 to-green-700",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center transform hover:scale-105 transition-all duration-300 border border-white/20 hover:bg-white/20"
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}
                    >
                      <stat.icon className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-white mb-1 sm:mb-2 truncate px-1">
                      {stat.title}
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm lg:text-base line-clamp-2">
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
