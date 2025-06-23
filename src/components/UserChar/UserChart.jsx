import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { UserAuth } from "../../service/Auth";
import { getListProductsAPI } from "../../service/ApiProduct";
import { ListCategoryAPI } from "../../service/ApiCategory";
import { ListAllSumProduct, ListOderProductsAll } from "../../service/Oder";

const data = [
  { month: "Jan", value: 22 },
  { month: "Feb", value: 20 },
  { month: "Mar", value: 24 },
  { month: "Apr", value: 25 },
  { month: "May", value: 19 },
  { month: "Jun", value: 18 },
  { month: "Jul", value: 16 },
];

// Custom Tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-2 text-sm">
        <p className="text-gray-700">{`${payload[0].value}K Users`}</p>
      </div>
    );
  }
  return null;
};
const CustomToolCatetory = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-2 text-sm">
        <p className="text-gray-700">{`${payload[0].value}K Users`}</p>
      </div>
    );
  }
  return null;
};
export default function UserStatsCard() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategorys] = useState([]);
  const [total, setTotal] = useState([]);
  const [sumTotal, setSumTotal] = useState("");

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0đ"; // Return fallback value if price is not valid
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };
  const FetchUserAuth = async () => {
    try {
      const res = await UserAuth();
      if (res && res.data && res.data.EC === 0) {
        setUsers(res.data.data);
      }
    } catch (error) {}
  };
  const getCategoryAPIChar = async () => {
    try {
      const res = await ListCategoryAPI();
      if (res && res.data && res.data.data) {
        setCategorys(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getListProductsAPIChar = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const AllTotalPriceProduct = async () => {
    try {
      const res = await ListAllSumProduct();
      if (res && res.data) {
        setTotal(res.data.totalProductsSold);
      }
    } catch (error) {}
  };

  const ListOderProductsTotalSum = async () => {
    try {
      const res = await ListOderProductsAll();
      if (res && res.data && res.data.EC === 0) {
        const data = res.data.data.reduce((total, acc) => {
          return total + acc.totalAmount;
        }, 0);
        setSumTotal(data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    FetchUserAuth();
    getCategoryAPIChar();
    getListProductsAPIChar();
    AllTotalPriceProduct();
    ListOderProductsTotalSum();
  }, []);

  const priceTotalProduct =
    products &&
    products.length > 0 &&
    products.reduce((total, acc) => {
      return total + acc.totalCost;
    }, 0);

  const Totalprofit = sumTotal - priceTotalProduct;

  return (
    <div className="flex gap-2 flex-wrap ">
      {/* User */}
      <div className="bg-indigo-600 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {user && user.length} Users
              </h2>
            </div>
            <p className="text-indigo-200 mt-1">Users</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomToolCatetory />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Category */}
      <div className="bg-violet-600 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {category && category.length} Danh mục
              </h2>
            </div>
            <p className="text-indigo-200 mt-1">Danh mục</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* tổng sản phẩm  sản phẩm  */}
      <div className="bg-orange-500 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {products && products.length} Sản phẩm
              </h2>
            </div>
            <p className="text-indigo-200 mt-1">Sản phẩm</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/*tổng sản phấm bán được*/}
      <div className="bg-yellow-500 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold whitespace-nowrap">
                {total} sản phẩm
              </h2>
              <span className="text-red-300 text-sm">(-12.4% ↓)</span>
            </div>
            <p className="text-indigo-200 mt-1">Số lượng bán</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Tổng số tiền nhập đơn hàng */}
      <div className="bg-red-600 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {formatPrice(priceTotalProduct)}
              </h2>
            </div>
            <p className="text-indigo-200 mt-1">Tổng số tiền nhập hàng</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Tổng thu nhập  */}
      <div className="bg-red-600 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">{formatPrice(sumTotal)}</h2>
            </div>
            <p className="text-indigo-200 mt-1">Tổng thu nhập</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-red-600 rounded-lg p-6 text-white w-56 h-64">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">{formatPrice(Totalprofit)}</h2>
            </div>
            <p className="text-indigo-200 mt-1">Lợi nhuận</p>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-indigo-200 hover:text-white"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.2)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeWidth={2}
                dot={{ r: 2, fill: "#e2e8f0" }}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
