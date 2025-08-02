// components/PermissionRoute.jsx
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PermissionRoute = ({ children, allowedPermissions = [] }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (
      user.role !== "admin" &&
      !allowedPermissions.includes(user.permissions?.trim())
    ) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate, allowedPermissions]);

  // Chặn render trước khi có user (tránh lỗi navigate khi component mới render)
  if (!user) return null;

  return children;
};

export default PermissionRoute;
