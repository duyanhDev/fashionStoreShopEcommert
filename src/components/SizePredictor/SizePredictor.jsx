import { Drawer, Tabs } from "antd";
import React, { useState } from "react";
import "./size.css";
const SizePredictor = ({ open, onClose }) => {
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
  const [notes, setNotes] = useState(""); // thêm notes
  const [loading, setLoading] = useState(false);
  const [prediction_id, setPrediction_id] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("https://size-prediction.onrender.com", {
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
      console.log(data);

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
        `http://127.0.0.1:8080/feedback/${prediction_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: feedback === result ? "correct" : "incorrect",
            actual_size: feedback,
            notes: notes || null, // gửi notes
          }),
        }
      );

      if (res.ok) {
        alert(
          "✅ Cảm ơn bạn đã đóng góp dữ liệu! Feedback đã được lưu vào modstatus."
        );
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

  const productData = {
    sizes: ["S", "M", "L", "XL"],
    height: ["1m55 - 1m59", "1m60 - 1m65", "1m66 - 1m72", "1m72 - 1m77"],
    weight: ["48kg - 54kg", "55kg - 61kg", "62kg - 68kg", "69kg - 75kg"],
    shirtLength: [66, 68, 70, 72],
    shoulderWidth: [41.5, 43, 44.5, 46],
    waist: [47, 49, 51, 53],
    sleeveLength: [21, 21.5, 22, 22.5],
  };

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

              {/* <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium">
                    Size thực tế bạn dùng:
                  </label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ví dụ: M hoặc 30"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Ghi chú thêm (tuỳ chọn):
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Áo hơi rộng, quần hơi ngắn..."
                    rows="2"
                    className="mt-1 w-full border rounded-lg px-3 py-2 resize-none"
                  />
                </div>

                <button
                  onClick={handleFeedback}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  📝 Gửi feedback
                </button>
              </div> */}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 2,
      label: "Bảng size",
      children: (
        <div className="table-container">
          <h2>THÔNG SỐ SẢN PHẨM</h2>
          <div className="table-scroll">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {productData.sizes.map((size, index) => (
                    <th key={index}>{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chiều cao</td>
                  {productData.height.map((h, index) => (
                    <td key={index}>{h}</td>
                  ))}
                </tr>
                <tr>
                  <td>Cân nặng</td>
                  {productData.weight.map((w, index) => (
                    <td key={index}>{w}</td>
                  ))}
                </tr>
                <tr>
                  <td>Dài áo</td>
                  {productData.shirtLength.map((d, index) => (
                    <td key={index}>{d}</td>
                  ))}
                </tr>
                <tr>
                  <td>Rộng vai</td>
                  {productData.shoulderWidth.map((d, index) => (
                    <td key={index}>{d}</td>
                  ))}
                </tr>
                <tr>
                  <td>1/2 Vòng eo</td>
                  {productData.waist.map((d, index) => (
                    <td key={index}>{d}</td>
                  ))}
                </tr>
                <tr>
                  <td>Dài tay</td>
                  {productData.sleeveLength.map((d, index) => (
                    <td key={index}>{d}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="note">
            <p>Trường hợp số đo của bạn nằm trong khoảng giữa các size:</p>
            <ul>
              <li>Với áo thun, hãy ưu tiên theo chiều cao</li>
              <li>
                Ví dụ chiều cao theo size L nhưng cân nặng theo size M. Hãy chọn
                L.
              </li>
              <li>97% khách hàng đã chọn đúng size theo cách này.</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];
  const onChange = (key) => {
    console.log(key);
  };

  return (
    <Drawer
      title="Hướng dẫn chọn Size"
      closable={{ "aria-label": "Close Button" }}
      onClose={onClose}
      open={open}
    >
      <Tabs items={items} defaultActiveKey="1" onChange={onChange} />
    </Drawer>
  );
};

export default SizePredictor;
