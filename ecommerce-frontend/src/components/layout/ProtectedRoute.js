import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSeller,
} from '../../store/slices/authSlice';
import { ROUTES } from '../../constants';

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireSeller = false,
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isSeller = useSelector(selectIsSeller);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (requireSeller && !isSeller && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;