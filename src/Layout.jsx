// MainLayout.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { RouterLayout, RouterAdmin } from "./Routes/Router";
import App from "./App";
import { useSelector } from "react-redux";
import LoginForm from "./components/Login/Login";
import AuthCallback from "./components/AuthCallback/AuthCallback";
function MainLayout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          {RouterLayout.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {isAuthenticated && user.isAdmin === true ? (
          RouterAdmin.map((adminRoute, index) => (
            <Route
              key={index}
              path={adminRoute.path}
              element={adminRoute.element}
            >
              {adminRoute.children?.map((childRoute, childIndex) => (
                <Route
                  key={childIndex}
                  path={childRoute.path}
                  element={childRoute.element}
                  index={childRoute.index || undefined}
                />
              ))}
            </Route>
          ))
        ) : (
          <Route path="/login" element={<LoginForm />} />
        )}
      </Routes>
    </Router>
  );
}

export default MainLayout;
