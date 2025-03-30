// src/components/Auth/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../redux/actions/Auth";
import { jwtDecode } from "jwt-decode";
// You might need to install this: npm install jwt-decode

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          // Decode the token to get user ID
          const decoded = jwtDecode(token);

          console.log(token);

          // Fetch user details with the token
          const response = await fetch("http://localhost:9000/auth/user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log(response);

          if (response.ok) {
            const userData = await response.json();
            console.log(userData);

            // Store in localStorage
            localStorage.setItem("authToken", token);

            // Dispatch to Redux store
            dispatch(login(token, userData));

            // Redirect to home
            navigate("/");
          } else {
            console.error("Failed to fetch user data");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error processing authentication:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Đang xác thực...</p>
    </div>
  );
};

export default AuthCallback;
