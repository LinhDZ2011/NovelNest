import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loggedUser } = useContext(AuthContext);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Chặn nếu vai trò không phải admin
  if (loggedUser && Object.keys(loggedUser).length > 0 && loggedUser.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
