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

  const getRankColor = (index) => {
    return (
      ["bg-yellow-500", "bg-gray-300", "bg-amber-600"][index] || "bg-blue-100"
    );
  };

  const getRankIcon = (index) => {
    return index < 3 ? (
      <CrownOutlined className={`h-6 w-6 ${getRankColor(index)}`} />
    ) : (
      <TrophyOutlined className="h-6 w-6 text-blue-400" />
    );
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
    <div className="main_ranking max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Bảng Xếp Hạng Chi Tiêu
        </h2>
        <DollarOutlined className="text-blue-500 text-2xl" />
      </div>

      <div className="space-y-4 top_ranking">
        {sortedRanking.map((user, index) => (
          <div
            key={user._id}
            className="flex items-center p-4 bg-white border rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full mr-4">
              {getRankIcon(index)}
            </div>

            <img
              src={user.avatar}
              alt={user.name}
              className={`w-12 h-12 rounded-full border-2 ${getRankColor(
                index
              )}`}
            />

            <div className="ml-4 flex-grow">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <span className="text-sm text-gray-500">
                Tổng chi tiêu: {formatPrice(user.totalPrice)}
              </span>
            </div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(
                index
              )} text-white font-bold`}
            >
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
