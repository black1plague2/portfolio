import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Topbar from '../components/layout/Topbar';
import { connectSocket, disconnectSocket } from '../services/socket';

export default function DashboardLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) connectSocket();
    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-heritage-beige via-white to-heritage-beige/60">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="animate-[fadeIn_350ms_ease] space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
