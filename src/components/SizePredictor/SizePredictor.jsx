import { Drawer, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import "./size.css";
import { getIdGuideSize } from "../../service/APISizeGuide";
import { getIdGuidePantsSize } from "../../service/APIPantsSize";

const SizePredictor = ({ open, onClose, productId, shift }) => {
  const [form, setForm] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    leg: "",
    gender: "male",
    item_type: "shirt",
    body_type: "Bình thường",
  });
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction_id, setPrediction_id] = useState("");
  const [productData, setProductData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(form.height),
          weight: Number(form.weight),
          gender: form.gender,
          item_type: form.item_type,
          body_type: form.body_type,
        }),
      });
      const data = await res.json();
      setResult(data.predicted_size);
      setPrediction_id(data.prediction_id);
    } catch (err) {
      console.error(err);
      setResult("❌ Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedback) {
      alert("Vui lòng nhập size đúng!");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/feedback/${prediction_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: feedback === result ? "correct" : "incorrect",
            actual_size: feedback,
            notes: notes || null,
          }),
        }
      );

      if (res.ok) {
        alert("✅ Cảm ơn bạn đã đóng góp dữ liệu! Feedback đã được lưu.");
        setFeedback("");
        setNotes("");
      } else {
        alert("❌ Có lỗi xảy ra khi gửi feedback");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối khi gửi feedback");
    }
  };

  const fetchSizesByProductIdAPI = async () => {
    try {
      const res = await getIdGuideSize(productId);
      if (res && res.data && res.data.EC === 0) {
        setProductData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSizesByProductIdAPIPlants = async () => {
    try {
      const res = await getIdGuidePantsSize(productId);
      if (res && res.data && res.data.EC === 0) {
        setProductData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (productId && shift.name === "Áo") {
      fetchSizesByProductIdAPI();
    } else if (productId && shift.name === "Quần") {
      fetchSizesByProductIdAPIPlants();
    }
  }, [productId, shift]);

  const items = [
    {
      key: 1,
      label: "Hướng dẫn chọn size",
      children: (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">
            Dự đoán Size
          </h2>

          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Chiều cao (cm) *
              </label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Cân nặng (kg) *
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Giới tính</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">
                  Loại sản phẩm
                </label>
                <select
                  name="item_type"
                  value={form.item_type}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  <option value="shirt">Áo</option>
                  <option value="pants">Quần</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Body Type</label>
              <select
                name="body_type"
                value={form.body_type}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option value="Gầy">Gầy</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Đầy đặn">Đầy đặn</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              {loading ? "⏳ Đang dự đoán..." : "🚀 Dự đoán size"}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="font-semibold text-green-700">
                👉 Size gợi ý: <span className="text-xl">{result}</span>
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 2,
      label: "Bảng size",
      children: productData ? (
        <div className="table-container">
          <h2>THÔNG SỐ SẢN PHẨM</h2>
          <div className="table-scroll">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {productData.sizes.map((s, i) => (
                    <th key={i}>{s.size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shift.name === "Quần" ? (
                  <>
                    <tr>
                      <td>Chiều cao</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.heightRange}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Cân nặng</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.weightRange}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Dài quần</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.pantsLength}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Vòng eo</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.waistCircumference}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Vòng mông</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.hipCircumference}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Vòng đùi</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.thighCircumference}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Dài đáy</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.crotchLength}</td>
                      ))}
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td>Chiều cao</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.heightRange}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Cân nặng</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.weightRange}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Dài Áo</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.shirtLength}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Rộng vai</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.shoulderWidth}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Ngực</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.chestWidth}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Dài tay</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.sleeveLength}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Bắp tay</td>
                      {productData.sizes.map((s, i) => (
                        <td key={i}>{s.bicepWidth}</td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="note">
            <p>{productData.note}</p>
          </div>
        </div>
      ) : (
        <p>⏳ Đang tải dữ liệu bảng size...</p>
      ),
    },
  ];

  return (
    <Drawer
      title="Hướng dẫn chọn Size"
      closable={{ "aria-label": "Close Button" }}
      onClose={onClose}
      open={open}
      className="drawer"
    >
      <Tabs
        items={items}
        defaultActiveKey="1"
        onChange={(key) => console.log(key)}
      />
    </Drawer>
  );
};

export default SizePredictor;
