import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

export default function PrivateRoute({ roles = [] }) {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  if (isLoading) return <Loader fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
