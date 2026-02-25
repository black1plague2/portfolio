import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { connectSocket, disconnectSocket } from './services/socket';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Weaver pages
import WeaverDashboard from './pages/weaver/WeaverDashboard';
import WeaverOrders from './pages/weaver/WeaverOrders';
import WeaverProducts from './pages/weaver/WeaverProducts';
import WeaverCapacity from './pages/weaver/WeaverCapacity';
import WeaverEarnings from './pages/weaver/WeaverEarnings';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BrowseProducts from './pages/buyer/BrowseProducts';
import ProductDetail from './pages/buyer/ProductDetail';
import PlaceOrder from './pages/buyer/PlaceOrder';
import BuyerOrders from './pages/buyer/BuyerOrders';
import OrderTracking from './pages/buyer/OrderTracking';
import Wishlist from './pages/buyer/Wishlist';
import Landing from './pages/Landing';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWeavers from './pages/admin/AdminWeavers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

// Designer pages
import DesignerDashboard from './pages/designer/DesignerDashboard';
import DesignRequests from './pages/designer/DesignRequests';

// Common
import PrivateRoute from './components/common/PrivateRoute';
import Loader from './components/common/Loader';
import NotFound from './pages/NotFound';

const ROLE_HOME = {
  weaver: '/weaver/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
  designer: '/designer/dashboard',
  cluster_manager: '/weaver/dashboard',
};

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  if (isLoading) return <Loader fullScreen />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <Navigate to={ROLE_HOME[user?.role] || '/buyer/dashboard'} replace /> : <Landing />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={ROLE_HOME[user?.role] || '/'} replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={ROLE_HOME[user?.role] || '/'} replace />} />
      <Route path="/products" element={<BrowseProducts />} />
      <Route path="/products/:id" element={<ProductDetail />} />

      {/* Weaver */}
      <Route element={<PrivateRoute roles={['weaver', 'cluster_manager']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/weaver/dashboard" element={<WeaverDashboard />} />
          <Route path="/weaver/orders" element={<WeaverOrders />} />
          <Route path="/weaver/products" element={<WeaverProducts />} />
          <Route path="/weaver/capacity" element={<WeaverCapacity />} />
          <Route path="/weaver/earnings" element={<WeaverEarnings />} />
        </Route>
      </Route>

      {/* Buyer */}
      <Route element={<PrivateRoute roles={['buyer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/orders" element={<BuyerOrders />} />
          <Route path="/buyer/orders/:id/track" element={<OrderTracking />} />
          <Route path="/buyer/place-order/:productId" element={<PlaceOrder />} />
        </Route>
        {/* Full-page shopping routes — use PublicNavbar, no sidebar */}
        <Route path="/buyer/wishlist" element={<Wishlist />} />
      </Route>

      {/* Admin */}
      <Route element={<PrivateRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/weavers" element={<AdminWeavers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Designer */}
      <Route element={<PrivateRoute roles={['designer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/designer/dashboard" element={<DesignerDashboard />} />
          <Route path="/designer/requests" element={<DesignRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
