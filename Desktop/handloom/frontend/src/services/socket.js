import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { addNotification } from '../redux/slices/uiSlice';
import { updateOrderFromSocket } from '../redux/slices/orderSlice';
import toast from 'react-hot-toast';

let socket = null;

export const connectSocket = () => {
  const token = store.getState().auth.accessToken;
  if (!token) return;

  socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('🔌 Socket connected'));
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  // Events
  socket.on('sub_order_assigned', (data) => {
    store.dispatch(addNotification({ type: 'sub_order', title: 'New Sub-Order', message: data.message, data }));
    toast.success(data.message);
  });

  socket.on('production_stage_updated', (data) => {
    store.dispatch(addNotification({ type: 'stage_update', title: 'Production Update', message: `Stage: ${data.stage}`, data }));
    store.dispatch(updateOrderFromSocket(data));
  });

  socket.on('order_shipped', (data) => {
    store.dispatch(addNotification({ type: 'shipped', title: 'Order Shipped!', message: data.message, data }));
    toast.success(data.message);
  });

  socket.on('order_delivered', (data) => {
    store.dispatch(addNotification({ type: 'delivered', title: 'Order Delivered!', message: data.message, data }));
    toast.success(data.message);
  });

  socket.on('new_message', (data) => {
    store.dispatch(addNotification({ type: 'message', title: 'New Message', message: data.message, data }));
  });

  socket.on('kyc_status_updated', (data) => {
    store.dispatch(addNotification({ type: 'kyc', title: 'KYC Update', message: data.message, data }));
    toast(data.message, { icon: data.kycStatus === 'approved' ? '✅' : '❌' });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinOrderRoom = (orderId) => socket?.emit('join_order', orderId);
export const leaveOrderRoom = (orderId) => socket?.emit('leave_order', orderId);
export const getSocket = () => socket;
