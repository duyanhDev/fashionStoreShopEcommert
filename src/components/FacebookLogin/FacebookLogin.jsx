import { FacebookLoginButton } from "react-social-login-buttons";
import { LoginSocialFacebook } from "reactjs-social-login";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/actions/Auth";

const FacebookLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async ({ data }) => {
    try {
      if (!data || !data.accessToken || !data.userID) {
        console.error("Thiếu accessToken hoặc userID:", data);
        return;
      }

      const { accessToken, userID } = data;

      const res = await axios.post(
        "https://fashionstoreshopecommertbe.onrender.com/auth/facebook",
        {
          accessToken,
          userID,
        }
      );

      if (res && res.data) {
        dispatch(login(res.data.token, res.data.user));

        navigate("/");
      }
    } catch (err) {
      console.error("Lỗi gửi dữ liệu lên BE:", err.response?.data || err);
    }
  };

  const handleError = (err) => {
    console.error("Lỗi đăng nhập:", err);
  };

  return (
    <LoginSocialFacebook
      appId="632037699909696"
      onResolve={({ data }) => handleLogin({ data })}
      onReject={handleError}
    >
      <button
        style={{
          border: "1px solid #ccc",
          color: "#333",
          borderRadius: "12px",
          fontWeight: "bold",
          padding: "10px 20px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%", // nếu muốn full width
        }}
      >
        Đăng nhập bằng Facebook
      </button>
    </LoginSocialFacebook>
  );
};

export default FacebookLogin;
