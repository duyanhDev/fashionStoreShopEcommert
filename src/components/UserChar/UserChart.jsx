import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  LabelList,
} from "recharts";
import { UserAuth } from "../../service/Auth";
import { getListProductsAPI } from "../../service/ApiProduct";
import { ListCategoryAPI } from "../../service/ApiCategory";
import {
  getListDallyOrderAPI,
  ListAllSumProduct,
  ListOderProductsAll,
} from "../../service/Oder";
import moment from "moment";
import "./UserChart.css";
import { getRevenueAPI } from "../../service/APITransaction";

// Sample data for charts

// Sample data for customer segments

// Sample data for daily sales
const dailySalesData = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  value: Math.floor(Math.random() * 100) + 20,
}));

const pieColors = [
  "#4f46e5",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#0ea5e9",
  "#f43f5e",
  "#84cc16",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, subtext, color, icon, change }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} flex-1 min-w-64 hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 font-medium">{title}</p>
          <h2 className="text-2xl font-bold mt-1">{value}</h2>
          <p className="text-gray-500 text-sm mt-1">{subtext}</p>
          {change && (
            <p
              className={`text-sm mt-2 font-medium ${
                change.includes("-") ? "text-red-500" : "text-green-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("border-", "bg-")
            .replace("-600", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 font-medium rounded-md transition-colors duration-200 ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
};

export default function DashboardStats() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategorys] = useState([]);
  const [total, setTotal] = useState(0);
  const [sumTotal, setSumTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("year");
  const [isLoading, setIsLoading] = useState(true);
  const [customerSegment, setCustomerSegment] = useState([]);
  const [dailySum, setDailySum] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "0₫";
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
  };

  const FetchUserAuth = async () => {
    try {
      const res = await UserAuth();
      if (res && res.data && res.data.EC === 0) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getCategoryAPIChar = async () => {
    try {
      const res = await ListCategoryAPI();
      if (res && res.data && res.data.data) {
        setCategorys(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getListProductsAPIChar = async () => {
    try {
      const res = await getListProductsAPI();
      if (res && res.data && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const AllTotalPriceProduct = async () => {
    try {
      const res = await ListAllSumProduct();
      if (res && res.data) {
        setTotal(res.data.totalProductsSold);
      }
    } catch (error) {
      console.error("Error fetching product totals:", error);
    }
  };

  const ListOderProductsTotalSum = async () => {
    try {
      const res = await ListOderProductsAll();
      if (res && res.data && res.data.EC === 0) {
        setCustomerSegment(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching order totals:", error);
    }
  };

  const listRevenueTotal = async () => {
    try {
      const res = await getRevenueAPI();

      if (res && res.data && res.data.EC === 0) {
        const data = res.data.data.reduce((total, acc) => {
          return total + acc.totalAmount;
        }, 0);
        setPaymentMethodData(res.data.data);
        setSumTotal(data);
      }
    } catch (error) {
      console.error("Error fetching order totals:", error);
    }
  };

  const fetchDailySum = async () => {
    try {
      const res = await getListDallyOrderAPI();
      if (res && res.data.EC === 0) {
        setDailySum(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        FetchUserAuth(),
        getCategoryAPIChar(),
        getListProductsAPIChar(),
        AllTotalPriceProduct(),
        ListOderProductsTotalSum(),
        listRevenueTotal(),
        fetchDailySum(),
      ]);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  const priceTotalProduct =
    products && products.length > 0
      ? products.reduce((total, acc) => {
          return total + acc.totalCost;
        }, 0)
      : 0;

  const totalProfit = sumTotal - priceTotalProduct;

  function calculateGrossProfitMargin(revenue, costOfGoods) {
    const grossProfit = revenue - costOfGoods;

    if (revenue === 0) return 0;

    const grossProfitMargin = (grossProfit / revenue) * 100;

    // Làm tròn thành số nguyên (không có .00)
    return Math.round(grossProfitMargin);
  }

  // Data for pie chart
  const pieData = [
    { name: "Chi phí nhập hàng", value: priceTotalProduct },
    { name: "Lợi nhuận", value: totalProfit },
  ];
  const pastelColors = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Mint Green
    "#FECA57", // Golden Yellow
  ];
  const pieColors = pastelColors; // xanh cho chi phí, đỏ cho lợi nhuận (âm)
  // Generate data for product categories
  const categoryProductData = category?.map((cat) => {
    const catProducts = products.filter(
      (product) => product.category.name === cat.name
    );

    // Tổng doanh thu: ví dụ lấy discountedPrice * sold
    const totalRevenue = catProducts.reduce(
      (sum, product) =>
        sum + (product.discountedPrice || product.price) * product.sold,
      0
    );

    // Tổng lợi nhuận: ví dụ totalRevenue - tổng cost
    const totalProfit = catProducts.reduce((sum, product) => {
      const cost = (product.costPrice || 0) * (product.stock || 0);

      const profit =
        ((product.discountedPrice || product.price) -
          (product.costPrice || 0)) *
        (product.stock || 0);
      return sum + profit; // quan trọng: return sum + profit
    }, 0);

    return {
      name: cat.name,
      products: catProducts.length,
      revenue: totalRevenue,
      profit: totalProfit,
    };
  });
  let yearCounts = {};

  users?.forEach((user) => {
    if (!user.created_at) return;

    const date = new Date(user.created_at);
    if (isNaN(date)) return;

    const year = date.getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  // Chuyển thành mảng
  let yearlyData = Object.keys(yearCounts).map((year) => ({
    year: parseInt(year),
    users: yearCounts[year],
  }));

  // Sắp xếp tăng dần theo năm
  yearlyData.sort((a, b) => a.year - b.year);

  // Tính riêng năm hiện tại
  const currentYear = new Date().getFullYear();
  const currentYearUsers = yearCounts[currentYear] || 0;

  // Generate data for top selling products
  const topSellingProducts = products
    ?.filter((product) => product.sold > 2000)
    .map((product) => {
      return {
        name: product.name || `Sản phẩm ${index + 1}`,
        sold: product.sold,
        revenue: Math.floor(Math.random() * 10000000) + 5000000,
      };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // xử lí dữ liệu  cho biểu độ hiệu suất theo tháng
  const monthlyDataChart = {};

  // Khởi tạo tháng
  for (let m = 1; m <= 12; m++) {
    monthlyDataChart[m] = {
      name: moment()
        .month(m - 1)
        .format("MMM"),
      usersSet: new Set(),
      sales: 0,
      profit: 0,
      totalCost: 0, // Thêm để lưu chi phí nhập hàng
    };
  }

  // 1. Tính doanh thu, số user từ customerSegment
  if (Array.isArray(customerSegment)) {
    customerSegment
      .filter((order) => order.orderStatus === "Completed")
      .forEach((item) => {
        const month = moment(item.updatedAt).month() + 1;
        const totalAmount = Number(item.totalAmount) || 0;
        const userId = item.userId?.toString();

        if (monthlyDataChart[month]) {
          monthlyDataChart[month].sales += totalAmount;
          if (userId) monthlyDataChart[month].usersSet.add(userId);
        }
      });
  }

  // 2. Tính chi phí nhập hàng từ products
  for (let m = 1; m <= 12; m++) {
    const productsInMonth =
      products?.filter((p) => moment(p.updatedAt).month() + 1 === m) || [];

    const totalCost = productsInMonth.reduce(
      (acc, p) => acc + (p.totalCost || 0),
      0
    );

    if (monthlyDataChart[m]) {
      monthlyDataChart[m].totalCost = totalCost;
    }
  }

  // 3. Tính lợi nhuận = doanh thu - chi phí nhập hàng
  for (let m = 1; m <= 12; m++) {
    if (monthlyDataChart[m]) {
      monthlyDataChart[m].profit =
        monthlyDataChart[m].sales - monthlyDataChart[m].totalCost;
    }
  }

  // Chuyển thành array cho biểu đồ
  const chartData = Object.values(monthlyDataChart).map((item) => ({
    name: item.name,
    users: item.usersSet.size,
    sales: item.sales, //doanh thu
    profit: item.profit, // lợi nhuận
    totalCost: item.totalCost, // chi phí nhập hàng
  }));

  // Icon components
  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const CategoryIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-purple-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );

  const ProductIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-orange-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  const SalesIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-yellow-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );

  const ExpenseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );

  const IncomeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-emerald-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const ProfitIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // users: mảng user có created_at
  // users: mảng user có created_at
  const getUserStatsThisMonth = (users) => {
    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();

    const lastMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastMonthYear = lastMonthDate.getFullYear();

    const countUsersByMonth = (month, year) =>
      users.filter((u) => {
        const date = new Date(u.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      }).length;

    const usersThisMonth = countUsersByMonth(thisMonth, thisYear);
    const usersLastMonth = countUsersByMonth(lastMonth, lastMonthYear);

    const changeText =
      usersLastMonth === 0
        ? usersThisMonth > 0
          ? `+${usersThisMonth} người mới`
          : "0 người mới"
        : `${(
            ((usersThisMonth - usersLastMonth) / usersLastMonth) *
            100
          ).toFixed(1)}% so với tháng trước`;

    return { usersThisMonth, changeText };
  };

  const { usersThisMonth, changeText } = getUserStatsThisMonth(users);
  // trả về số người dùng trong một tháng nhất định

  const groupedPayments = paymentMethodData?.reduce((acc, item) => {
    if (item.paymentMethod) {
      acc[item.paymentMethod] = (acc[item.paymentMethod] || 0) + 1;
    }
    return acc;
  }, {});

  const groupedPaymentsArray = Object.entries(groupedPayments).map(
    ([method, count]) => ({
      paymentMethod: method,
      count,
    })
  );

  // Mảng tháng
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Khởi tạo dữ liệu mặc định cho 12 tháng
  let monthly2025 = months.map((month) => ({
    name: month,
    users: 0,
  }));

  // Gom users theo tháng trong năm 2025
  users?.forEach((user) => {
    if (!user.created_at) return;
    const date = new Date(user.created_at);
    if (isNaN(date)) return;

    const year = date.getFullYear();
    if (year === 2025) {
      const monthIndex = date.getMonth(); // 0-11
      monthly2025[monthIndex].users += 1;
    }
  });

  // Giả sử mỗi user có field userGroup = "Khách thường xuyên" | "Khách mới" | ...
  const groupCounts = users?.reduce((acc, user) => {
    const group = user.userGroup;
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const customerSegmentData = [
    {
      subject: "Khách hàng thường xuyên",
      A: groupCounts["regular"] || 0,
      fullMark: 150,
    },
    {
      subject: "Khách hàng mới",
      A: groupCounts["newUser"] || 0,
      fullMark: 150,
    },
    { subject: "Khách hàng vip", A: groupCounts["vip"] || 0, fullMark: 150 },
    {
      subject: "Khách hàng thân thiết",
      A: groupCounts["elite"] || 0,
      fullMark: 150,
    },
    {
      subject: "Khách hàng trung thành",
      A: groupCounts["loyalCustomer"] || 0,
      fullMark: 150,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bảng Thống Kê</h1>
        <p className="text-gray-500">
          Tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
        </TabButton>
        <TabButton
          active={activeTab === "sales"}
          onClick={() => setActiveTab("sales")}
        >
          Doanh số
        </TabButton>
        <TabButton
          active={activeTab === "products"}
          onClick={() => setActiveTab("products")}
        >
          Sản phẩm
        </TabButton>
        <TabButton
          active={activeTab === "customers"}
          onClick={() => setActiveTab("customers")}
        >
          Khách hàng
        </TabButton>
      </div>

      {/* Date Range Filter */}
      {/* <div className="mb-8 flex gap-2 justify-end">
        <TabButton
          active={dateRange === "week"}
          onClick={() => setDateRange("week")}
        >
          Tuần này
        </TabButton>
        <TabButton
          active={dateRange === "month"}
          onClick={() => setDateRange("month")}
        >
          Tháng này
        </TabButton>
        <TabButton
          active={dateRange === "quarter"}
          onClick={() => setDateRange("quarter")}
        >
          Quý này
        </TabButton>
        <TabButton
          active={dateRange === "year"}
          onClick={() => setDateRange("year")}
        >
          Năm nay
        </TabButton>
      </div> */}

      {activeTab === "overview" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Người dùng"
              value={usersThisMonth || "0"}
              subtext="Tổng số người dùng"
              color="border-indigo-600"
              icon={<UserIcon />}
              change={changeText}
            />

            <StatCard
              title="Danh mục"
              value={category && category.length > 0 ? category.length : "0"}
              subtext="Tổng số danh mục"
              color="border-purple-600"
              icon={<CategoryIcon />}
            />

            <StatCard
              title="Sản phẩm"
              value={products && products.length > 0 ? products.length : "0"}
              subtext="Tổng số sản phẩm"
              color="border-orange-500"
              icon={<ProductIcon />}
            />

            <StatCard
              title="Đã bán"
              value={total ? total : "0"}
              subtext="Số lượng sản phẩm đã bán"
              color="border-yellow-500"
              icon={<SalesIcon />}
            />
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Chi phí nhập hàng"
              value={formatPrice(priceTotalProduct)}
              subtext="Tổng số tiền nhập hàng"
              color="border-red-600"
              icon={<ExpenseIcon />}
            />

            <StatCard
              title="Doanh thu"
              value={formatPrice(sumTotal)}
              subtext="Tổng doanh thu"
              color="border-emerald-600"
              icon={<IncomeIcon />}
              // change="+8.3% so với chi phí nhập hàng"
            />

            <StatCard
              title="Lợi nhuận"
              value={formatPrice(totalProfit)}
              subtext="Lợi nhuận ròng"
              color="border-blue-600"
              icon={<ProfitIcon />}
              change={`${calculateGrossProfitMargin(
                sumTotal,
                priceTotalProduct
              )}% so với tháng trước`}
            />
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Area Chart - Monthly Performance */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Hiệu suất theo tháng
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="totalCost"
                      stackId="1"
                      stroke="#7C3AED"
                      fill="#C4B5FD"
                      name="Tổng chi phí nhập hàng"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#fef3c7"
                      name="Doanh số"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke="#10b981"
                      fill="#d1fae5"
                      name="Lợi nhuận"
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="2"
                      stroke="#4f46e5"
                      fill="#e0e7ff"
                      name="Khách hàng"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart - Revenue Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Phân tích doanh thu
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pieData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        `${new Intl.NumberFormat("vi-VN").format(value)} VND`
                      }
                    />
                    <Legend />
                    <Bar dataKey="value">
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN").format(value)
                        }
                      />
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Column Chart - Categories */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Phân tích sản phẩm theo danh mục
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryProductData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar
                    dataKey="products"
                    name="Số lượng sản phẩm"
                    fill="#8b5cf6"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === "sales" && (
        <>
          {/* Sales Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Composed Chart - Sales vs Profit */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Doanh số và Lợi nhuận
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="totalCost"
                      stackId="1"
                      stroke="#7C3AED"
                      fill="#C4B5FD"
                      name="Tổng chi phí nhập hàng"
                    />
                    <Bar
                      dataKey="sales"
                      name="Doanh số"
                      fill="#f59e0b"
                      radius={[10, 10, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Lợi nhuận"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Doanh số theo ngày trong tháng
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailySum}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fill: "#6b7280" }} />
                    <YAxis
                      tick={{ fill: "#6b7280" }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(0)}K`;
                        }
                        return value.toString();
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="totalSales"
                      name="Doanh số"
                      fill="#4f46e5"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Phân tích phương thức thanh toán
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupedPaymentsArray}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={78}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="paymentMethod"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {groupedPaymentsArray.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === "products" && (
        <>
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Sản phẩm bán chạy
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSellingProducts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                  barSize={30}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fill: "#6b7280" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#6b7280" }}
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar
                    dataKey="sold"
                    name="Số lượng đã bán"
                    fill="#ec4899"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Categories Comparison */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              So sánh danh mục theo doanh thu và lợi nhuận
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryProductData.slice(0, 5)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#0ea5e9"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Lợi nhuận"
                    fill="#84cc16"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === "customers" && (
        <>
          {/* Customer Segments Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Phân khúc khách hàng
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={customerSegmentData}
                >
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis />
                  <Radar
                    name="Khách hàng"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tăng trưởng khách hàng theo tháng (2025)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthly2025}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Khách hàng mới"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tăng trưởng khách hàng
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "#6b7280" }}
                        label={{
                          value: "Năm",
                          position: "insideBottom",
                          offset: -5,
                          fill: "#374151",
                          fontSize: 14,
                        }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280" }}
                        label={{
                          value: "Số lượng khách hàng",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#374151",
                          fontSize: 14,
                        }}
                      />
                      <Tooltip />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar
                        dataKey="users"
                        fill="#4f46e5"
                        barSize={50}
                        name="Khách hàng mới"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
