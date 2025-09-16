import React, { useEffect, useState } from "react";
import {
  Calendar,
  Sparkles,
  Wrench,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getChangeModelAPI } from "../../service/Changelog";

const ChangelogPage = () => {
  const [expandedItems, setExpandedItems] = useState(new Set([0]));
  const [changelogs, setChangelogs] = useState([]);
  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const fetchDataChangeLogs = async () => {
    try {
      const res = await getChangeModelAPI();

      if (res && res.data && res.data.success === true) {
        const formattedData = res.data.data.map((changelog) => ({
          ...changelog,
          changes: {
            new: Array.isArray(changelog.changes.new)
              ? changelog.changes.new
              : [],
            improved: Array.isArray(changelog.changes.improved)
              ? changelog.changes.improved
              : [],
            fixed: Array.isArray(changelog.changes.fixed)
              ? changelog.changes.fixed
              : [],
          },
        }));
        setChangelogs(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataChangeLogs();
  }, []);

  const getTagColor = (tag) => {
    const colors = {
      "Major Update": "bg-purple-100 text-purple-800",
      "UI/UX": "bg-blue-100 text-blue-800",
      Payment: "bg-green-100 text-green-800",
      Security: "bg-red-100 text-red-800",
      Performance: "bg-yellow-100 text-yellow-800",
      "Bug Fix": "bg-gray-100 text-gray-800",
      "AI Feature": "bg-indigo-100 text-indigo-800",
      "Summer Collection": "bg-orange-100 text-orange-800",
      Mobile: "bg-teal-100 text-teal-800",
      "Loyalty Program": "bg-pink-100 text-pink-800",
      "Customer Experience": "bg-cyan-100 text-cyan-800",
      Rewards: "bg-emerald-100 text-emerald-800",
    };
    return colors[tag] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 mt-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nhật Ký Thay Đổi
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Theo dõi những cập nhật, cải tiến và tính năng mới nhất của DuyAnh
              Shop. Chúng tôi không ngừng phát triển để mang đến trải nghiệm tốt
              nhất cho bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>

          {changelogs.map((item, index) => (
            <div key={index} className="relative mb-8 md:mb-12 md:ml-20">
              {/* Version badge */}
              <div className="md:absolute md:-left-28 md:top-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg mb-4 md:mb-0 inline-block">
                {item.version}
              </div>

              {/* Timeline dot */}
              <div className="absolute -left-6 top-8 w-3 h-3 bg-white border-4 border-blue-500 rounded-full shadow-lg hidden md:block"></div>

              {/* Content card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("vi-vn")}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{item.summary}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTagColor(
                          tag
                        )}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {expandedItems.has(index) ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Xem chi tiết
                      </>
                    )}
                  </button>

                  {/* Expandable content */}
                  {expandedItems.has(index) && (
                    <div className="mt-6 space-y-6 border-t pt-6">
                      {/* New features */}
                      {item.changes.new.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                            <Sparkles className="w-5 h-5" />
                            Tính năng mới
                          </h4>
                          <ul className="space-y-2">
                            {item.changes.new.map((change, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-gray-700"
                              >
                                <span className="text-green-500 mt-1 text-sm">
                                  ✨
                                </span>
                                <span className="text-sm md:text-base">
                                  {change}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {item.changes.improved.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-semibold text-blue-700 mb-3">
                            <Wrench className="w-5 h-5" />
                            Cải tiến
                          </h4>
                          <ul className="space-y-2">
                            {item.changes.improved.map((change, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-gray-700"
                              >
                                <span className="text-blue-500 mt-1 text-sm">
                                  🔧
                                </span>
                                <span className="text-sm md:text-base">
                                  {change}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Bug fixes */}
                      {item.changes.fixed.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                            <Bug className="w-5 h-5" />
                            Sửa lỗi
                          </h4>
                          <ul className="space-y-2">
                            {item.changes.fixed.map((change, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-gray-700"
                              >
                                <span className="text-red-500 mt-1 text-sm">
                                  🐛
                                </span>
                                <span className="text-sm md:text-base">
                                  {change}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            Có ý kiến đóng góp? Hãy liên hệ với chúng tôi tại{" "}
            <a
              href="mailto:feedback@coolmate.me"
              className="text-blue-400 hover:text-blue-300"
            >
              feedback@dangtrinhduyanh100202@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage;
