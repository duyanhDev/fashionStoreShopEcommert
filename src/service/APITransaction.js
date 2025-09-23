import axios from "../untils/axios";

const getRevenueAPI = async () => {
  return await axios.get("api/v1/revenue/total");
};

const exportTransactionsExcel = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`api/v1/export-excel`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", // bắt buộc khi tải file
  });

  // Tạo link download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "transactions_report.xlsx"); // tên file khi tải
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export { getRevenueAPI, exportTransactionsExcel };
