import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ roles, children }) => {
  const { isLoggedIn, roles: userRoles } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (isLoggedIn && roles.some(role => userRoles.includes(role))) {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  }, [isLoggedIn, userRoles, roles]);

  if (!isLoggedIn || !hasPermission) {
    return <Navigate to="/admin-dashboard" />;
  }

  return children;
};

export default PrivateRoute;