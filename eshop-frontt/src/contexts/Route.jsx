import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const PrivateRoute = ({ children, roles = [] }) => {
  const { isLoggedIn, roles: userRoles } = useAuth();
  console.log("PrivateRoute: isLoggedIn =", isLoggedIn, "userRoles =", userRoles);

  if (!isLoggedIn) {
    console.log("Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      console.log("Redirecting to unauthorized");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
