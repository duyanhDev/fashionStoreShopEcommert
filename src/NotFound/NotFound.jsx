import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ShoppingOutlined,
  HomeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-heading">404</h1>
        <div className="not-found-divider"></div>
        <h2 className="not-found-subheading">Trang không tìm thấy</h2>
        <p className="not-found-message">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di
          chuyển.
          <br />
          Hãy kiểm tra lại đường dẫn hoặc khám phá các bộ sưu tập thời trang mới
          nhất của chúng tôi.
        </p>
        <div className="not-found-buttons">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            size="large"
            onClick={() => navigate("/")}
          >
            Trang Chủ
          </Button>
          <Button
            icon={<ShoppingOutlined />}
            size="large"
            onClick={() => navigate("/collections")}
          >
            Bộ Sưu Tập
          </Button>
          <Button
            icon={<SearchOutlined />}
            size="large"
            onClick={() => navigate("/search")}
          >
            Tìm Kiếm
          </Button>
        </div>
      </div>
      <div className="not-found-image">
        <div className="image-placeholder"></div>
      </div>
    </div>
  );
};

export default NotFound;
