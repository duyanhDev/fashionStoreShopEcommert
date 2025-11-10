import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Activity,
  Database,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserPlus,
  Target,
  Award,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const USER_GROUP_COLORS = {
  elite: "#8b5cf6",
  loyalCustomer: "#3b82f6",
  vip: "#10b981",
  regular: "#f59e0b",
  newUser: "#6b7280",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [activeTab, setActiveTab] = useState("overview");

  const [revenueForecast, setRevenueForecast] = useState(null);
  const [profitForecast, setProfitForecast] = useState(null);
  const [insights, setInsights] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [aiInsights, setAiInsights] = useState("");
  const [revenueAnalysis, setRevenueAnalysis] = useState("");

  const [userDistribution, setUserDistribution] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const [upgradePotential, setUpgradePotential] = useState(null);
  const [userForecast, setUserForecast] = useState([]);
  const [highValueCustomers, setHighValueCustomers] = useState([]);
  const [userStrategy, setUserStrategy] = useState("");

  const [monitoringStatus, setMonitoringStatus] = useState(null);
  const [driftAnalysis, setDriftAnalysis] = useState(null);
  const [retrainLog, setRetrainLog] = useState([]);
  const [showMonitoring, setShowMonitoring] = useState(false);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .trim();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatChartData = (forecast) => {
    if (!forecast?.forecast) return [];
    return forecast.forecast.map((item) => ({
      date: new Date(item.ds).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      predicted: Math.round(item.yhat),
      lower: Math.round(item.yhat_lower),
      upper: Math.round(item.yhat_upper),
    }));
  };

  const getFreshnessColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const fetchUserAnalytics = async () => {
    try {
      const [
        distributionRes,
        demographicsRes,
        upgradeRes,
        forecastRes,
        highValueRes,
        strategyRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/users/groups/distribution`),
        fetch(`${API_BASE}/users/demographics`),
        fetch(`${API_BASE}/users/upgrade-potential`),
        fetch(`${API_BASE}/users/revenue-forecast?days=${forecastDays}`),
        fetch(`${API_BASE}/users/high-value?limit=10`),
        fetch(`${API_BASE}/ai/user-strategy`),
      ]);

      if (distributionRes.ok) {
        const data = await distributionRes.json();
        setUserDistribution(data.distribution || []);
      }

      if (demographicsRes.ok) {
        const data = await demographicsRes.json();
        setDemographics(data.demographics || null);
      }

      if (upgradeRes.ok) {
        const data = await upgradeRes.json();
        setUpgradePotential(data.upgrade_potential || null);
      }

      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setUserForecast(data.usergroup_forecast || []);
      }

      if (highValueRes.ok) {
        const data = await highValueRes.json();
        setHighValueCustomers(data.customers || []);
      }

      if (strategyRes.ok) {
        const data = await strategyRes.json();
        setUserStrategy(cleanMarkdown(data.ai_strategy || ""));
      }
    } catch (err) {
      console.error("Error fetching user analytics:", err);
    }
  };

  const fetchMonitoringStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/monitoring/status`);
      if (res.ok) {
        const data = await res.json();
        setMonitoringStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch monitoring status:", err);
    }
  };

  const fetchDriftAnalysis = async () => {
    try {
      const res = await fetch(`${API_BASE}/monitoring/drift-analysis`);
      if (res.ok) {
        const data = await res.json();
        setDriftAnalysis(data);
      }
    } catch (err) {
      console.error("Failed to fetch drift analysis:", err);
    }
  };

  const fetchRetrainLog = async () => {
    try {
      const res = await fetch(`${API_BASE}/monitoring/retrain-log`);
      if (res.ok) {
        const data = await res.json();
        setRetrainLog(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch retrain log:", err);
    }
  };

  const triggerRetrain = async () => {
    if (!window.confirm("Bạn có chắc muốn retrain models ngay?")) return;

    try {
      const res = await fetch(`${API_BASE}/monitoring/trigger-retrain`, {
        method: "POST",
      });

      if (res.ok) {
        alert("✅ Retrain thành công!");
        await fetchData();
        await fetchMonitoringStatus();
        await fetchRetrainLog();
      } else {
        alert("❌ Retrain thất bại");
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const checkChanges = async () => {
    try {
      const res = await fetch(`${API_BASE}/monitoring/check-changes`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        alert(
          `📊 Kết quả:\nOrders: ${
            data.orders.changed ? "✅ Có thay đổi" : "Không đổi"
          }\nProducts: ${
            data.products.changed ? "✅ Có thay đổi" : "Không đổi"
          }`
        );
        await fetchMonitoringStatus();
      }
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [revenueRes, profitRes, insightsRes, productsRes, revenueAIRes] =
        await Promise.all([
          fetch(`${API_BASE}/forecast?days=${forecastDays}`),
          fetch(`${API_BASE}/profit_forecast?days=${forecastDays}`),
          fetch(`${API_BASE}/insights`),
          fetch(`${API_BASE}/ai/products-analysis?limit=10`),
          fetch(`${API_BASE}/ai/revenue-analysis`),
        ]);

      if (!revenueRes.ok) throw new Error("Failed to fetch revenue forecast");
      if (!profitRes.ok) throw new Error("Failed to fetch profit forecast");

      const revenueData = await revenueRes.json();
      const profitData = await profitRes.json();
      const insightsData = insightsRes.ok ? await insightsRes.json() : null;
      const productsData = productsRes.ok
        ? await productsRes.json()
        : { products: [] };
      const revenueAIData = revenueAIRes.ok ? await revenueAIRes.json() : null;

      setRevenueForecast(revenueData);
      setProfitForecast(profitData);
      setInsights(insightsData);
      setTopProducts(productsData.products || []);
      setAiInsights(cleanMarkdown(productsData.ai_insights || ""));
      setRevenueAnalysis(cleanMarkdown(revenueAIData?.ai_insights || ""));

      await fetchMonitoringStatus();
      await fetchUserAnalytics();
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchMonitoringStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [forecastDays]);

  const handleAskAI = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/quick-ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAiAnswer(cleanMarkdown(data.answer || "No answer received"));
    } catch (err) {
      setAiAnswer("❌ Error: " + err.message);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Lỗi kết nối API</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const revenueChartData = formatChartData(revenueForecast);
  const profitChartData = formatChartData(profitForecast);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Duy Anh Shop
            </h1>
            <p className="text-green-300">
              Hệ thống dự báo AI với Auto-Detection ⚡
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="bg-gray-800 border border-green-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value={7}>7 ngày</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={60}>60 ngày</option>
              <option value={90}>90 ngày</option>
            </select>
            <button
              onClick={fetchData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
          {["overview", "users", "monitoring"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "users" && "👥 User Analytics"}
              {tab === "monitoring" && "🔍 Monitoring"}
            </button>
          ))}
        </div>

        {/* Monitoring Banner */}
        {monitoringStatus && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-500 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Auto-Detection System
              </h3>
              <button
                onClick={() => setShowMonitoring(!showMonitoring)}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                {showMonitoring ? "Ẩn" : "Xem"} chi tiết
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Freshness</span>
                </div>
                <p
                  className={`text-2xl font-bold ${getFreshnessColor(
                    monitoringStatus.freshness?.score || 0
                  )}`}
                >
                  {monitoringStatus.freshness?.score || 0}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Retrain</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {monitoringStatus.should_retrain ? "Cần" : "OK"}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Scheduler</span>
                </div>
                <div className="flex items-center gap-2">
                  {monitoringStatus.scheduler_running ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">Issues</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">
                  {monitoringStatus.data_quality?.critical_issues || 0}
                </p>
              </div>
            </div>

            {showMonitoring && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={checkChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🔍 Check Changes
                </button>
                <button
                  onClick={triggerRetrain}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  🔄 Manual Retrain
                </button>
                <button
                  onClick={() => {
                    fetchDriftAnalysis();
                    fetchRetrainLog();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  📊 Load Stats
                </button>
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {insights && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                  <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(insights.avg_revenue)}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    Doanh thu TB/ngày
                  </p>
                </div>
                <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                  <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(insights.avg_profit)}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    Lợi nhuận TB/ngày
                  </p>
                </div>
                <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                  <ShoppingCart className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {insights.profit_margin_percent.toFixed(1)}%
                  </p>
                  <p className="text-green-400 text-sm mt-1">Biên lợi nhuận</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Dự báo Doanh thu ({forecastDays} ngày)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis
                    stroke="#9ca3af"
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #10b981",
                    }}
                    formatter={(v) => formatCurrency(v)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Dự báo"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#34d399"
                    strokeDasharray="5 5"
                    name="Max"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#6ee7b7"
                    strokeDasharray="5 5"
                    name="Min"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Dự báo Lợi nhuận ({forecastDays} ngày)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profitChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis
                    stroke="#9ca3af"
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #10b981",
                    }}
                    formatter={(v) => formatCurrency(v)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Dự báo"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#34d399"
                    strokeDasharray="5 5"
                    name="Max"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#6ee7b7"
                    strokeDasharray="5 5"
                    name="Min"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Top 10 Sản phẩm
                </h2>
                <div className="space-y-3">
                  {topProducts.slice(0, 10).map((p, idx) => (
                    <div
                      key={p.product_id}
                      className="bg-gray-900 rounded-lg p-4 border border-green-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-2xl font-bold text-green-400">
                            #{idx + 1}
                          </span>
                          <h3 className="font-semibold text-white text-sm truncate">
                            {p.product_name}
                          </h3>
                        </div>
                        <span className="text-lg font-bold text-green-400">
                          {p.total_quantity_sold}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400">Doanh thu</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(p.total_revenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Lợi nhuận</p>
                          <p className="text-green-400 font-semibold">
                            {formatCurrency(p.total_profit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  AI Insights
                </h2>
                <div className="space-y-4 min-h-screen overflow-y-auto">
                  {aiInsights && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                      <h3 className="font-semibold text-green-400 mb-2">
                        📦 Sản phẩm
                      </h3>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {aiInsights}
                      </p>
                    </div>
                  )}
                  {revenueAnalysis && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                      <h3 className="font-semibold text-green-400 mb-2">
                        📈 Doanh thu
                      </h3>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {revenueAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Hỏi AI</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAskAI()}
                  placeholder="VD: Sản phẩm nào nên nhập thêm?"
                  className="flex-1 bg-gray-900 border border-green-500 text-white px-4 py-3 rounded-lg"
                />
                <button
                  onClick={handleAskAI}
                  disabled={chatLoading || !question.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {chatLoading ? "..." : "Hỏi"}
                </button>
              </div>
              {aiAnswer && (
                <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                  <p className="text-white text-sm whitespace-pre-line">
                    {aiAnswer}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* USER ANALYTICS TAB */}
        {activeTab === "users" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {userDistribution.map((g) => (
                <div
                  key={g.userGroup}
                  className="bg-gray-800/90 border-2 rounded-xl p-4"
                  style={{ borderColor: USER_GROUP_COLORS[g.userGroup] }}
                >
                  <Users
                    className="w-6 h-6 mb-2"
                    style={{ color: USER_GROUP_COLORS[g.userGroup] }}
                  />
                  <p className="text-xl font-bold text-white">{g.count}</p>
                  <p className="text-sm text-gray-400 capitalize">
                    {g.userGroup}
                  </p>
                  <p className="text-xs text-green-400">{g.percentage}%</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Phân bố User Groups
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistribution}
                    dataKey="count"
                    nameKey="userGroup"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(e) => `${e.userGroup}: ${e.percentage}%`}
                  >
                    {userDistribution.map((e) => (
                      <Cell
                        key={e.userGroup}
                        fill={USER_GROUP_COLORS[e.userGroup]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {demographics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    👥 Giới tính
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={demographics.gender}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="gender" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #10b981",
                        }}
                      />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    🎂 Độ tuổi
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={demographics.age_groups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="age_group" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #10b981",
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {upgradePotential && (
              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-400" />
                  Cơ hội Upgrade
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-yellow-400 text-sm">
                        New → Regular
                      </h3>
                      <UserPlus className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {upgradePotential.newUser_to_regular.count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency(
                        upgradePotential.newUser_to_regular.threshold
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-green-400 text-sm">
                        Regular → VIP
                      </h3>
                      <Award className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {upgradePotential.regular_to_vip.count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency(
                        upgradePotential.regular_to_vip.threshold
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-purple-400 text-sm">
                        VIP → Loyal
                      </h3>
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {upgradePotential.vip_to_loyalCustomer.count}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency(
                        upgradePotential.vip_to_loyalCustomer.threshold
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userForecast.length > 0 && (
              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Dự báo Revenue theo Group ({forecastDays}d)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">
                          Group
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Users
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          AOV
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Orders
                        </th>
                        <th className="text-right py-3 px-4 text-gray-400">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userForecast.map((f) => (
                        <tr
                          key={f.userGroup}
                          className="border-b border-gray-800 hover:bg-gray-900"
                        >
                          <td className="py-3 px-4">
                            <span
                              className="font-semibold capitalize"
                              style={{ color: USER_GROUP_COLORS[f.userGroup] }}
                            >
                              {f.userGroup}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-white">
                            {f.current_users}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-300">
                            {formatCurrency(f.historical_aov)}
                          </td>
                          <td className="text-right py-3 px-4 text-blue-400">
                            {f[`predicted_orders_${forecastDays}d`]}
                          </td>
                          <td className="text-right py-3 px-4 text-green-400 font-semibold">
                            {formatCurrency(
                              f[`predicted_revenue_${forecastDays}d`]
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {highValueCustomers.length > 0 && (
              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-400" />
                  Top 10 VIP Customers
                </h2>
                <div className="space-y-2">
                  {highValueCustomers.map((c, idx) => (
                    <div
                      key={c.userId}
                      className="bg-gray-900 rounded-lg p-4 border border-green-500/30 hover:border-green-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl font-bold text-green-400">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white truncate">
                              {c.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                              {c.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            {formatCurrency(c.totalSpending)}
                          </p>
                          <p
                            className="text-xs font-semibold capitalize"
                            style={{ color: USER_GROUP_COLORS[c.userGroup] }}
                          >
                            {c.userGroup}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">City: </span>
                          <span className="text-white">{c.city}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Age: </span>
                          <span className="text-white">{c.age || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Since: </span>
                          <span className="text-white">{c.memberSince}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userStrategy && (
              <div className="bg-gray-800/90 border-2 border-green-500 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  AI Chiến lược Khách hàng
                </h2>
                <div className="bg-gray-900 rounded-lg p-4 border border-green-500/30">
                  <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                    {userStrategy}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* MONITORING TAB */}
        {activeTab === "monitoring" && (
          <div className="bg-gray-800/90 border-2 border-purple-500 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              🔍 System Monitoring
            </h2>
            <p className="text-gray-400 mb-4">
              Chi tiết monitoring được hiển thị ở banner phía trên. Sử dụng các
              nút để kiểm tra:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Check Changes - Kiểm tra thay đổi data</li>
              <li>Manual Retrain - Trigger retrain thủ công</li>
              <li>Load Stats - Xem drift analysis & retrain log</li>
            </ul>

            {driftAnalysis && (
              <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-bold text-purple-400 mb-3">
                  📊 Drift Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Mean Change</p>
                    <p className="text-white font-semibold">
                      {driftAnalysis.drift_analysis?.mean_change_pct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Drift Detected</p>
                    <p
                      className={
                        driftAnalysis.drift_analysis?.drift
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {driftAnalysis.drift_analysis?.drift ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {retrainLog.length > 0 && (
              <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-bold text-purple-400 mb-3">
                  📝 Recent Retrains
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {retrainLog
                    .slice(-10)
                    .reverse()
                    .map((log, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-300 flex items-center gap-2 border-b border-gray-800 pb-2"
                      >
                        {log.success ? (
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        )}
                        <span className="flex-shrink-0">
                          {new Date(log.timestamp).toLocaleString("vi-VN")}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="flex-shrink-0">{log.metric_type}</span>
                        <span className="text-gray-500">•</span>
                        <span className="truncate">{log.reason}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Duy Anh Shop • Powered by AI & Auto-Detection System ⚡</p>
        </div>
      </div>
    </div>
  );
}
