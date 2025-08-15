// MainLayout.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import App from "./App";
import { RouterLayout, RouterAdmin } from "./Routes/Router";
import AuthCallback from "./components/AuthCallback/AuthCallback";
import NotFound from "./NotFound/NotFound";
import LoginForm from "./components/Login/Login";

function MainLayout() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAdmin =
    isAuthenticated &&
    (user?.role === "admin" ||
      (user?.role === "staff" && !user?.isAccountLocked));

  return (
    <Router>
      <Routes>
        {/* Public fallback route */}
        <Route path="*" element={<NotFound />} />
        {/* App routes (nested layout) */}(
        <Route path="/" element={<App />}>
          {RouterLayout.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>
        ){/* Auth callback route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Admin routes - secured with Navigate */}
        {RouterAdmin.map((adminRoute, index) => (
          <Route
            key={index}
            path={adminRoute.path}
            element={
              isAdmin ? adminRoute.element : <Navigate to="/login" replace />
            }
          >
            {adminRoute.children?.map((childRoute, childIndex) => (
              <Route
                key={childIndex}
                path={childRoute.path}
                element={
                  isAdmin ? (
                    childRoute.element
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
                index={childRoute.index || undefined}
              />
            ))}
          </Route>
        ))}
        {/* Login fallback route */}
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default MainLayout;
