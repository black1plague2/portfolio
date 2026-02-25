import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    notifications: [],
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload; },
    addNotification: (state, action) => {
      state.notifications.unshift({ ...action.payload, id: Date.now(), read: false });
      if (state.notifications.length > 20) state.notifications.pop();
    },
    markNotificationRead: (state, action) => {
      const n = state.notifications.find((n) => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead: (state) => { state.notifications.forEach((n) => { n.read = true; }); },
    clearNotifications: (state) => { state.notifications = []; },
  },
});

export const { toggleSidebar, setSidebar, addNotification, markNotificationRead, markAllRead, clearNotifications } = uiSlice.actions;
export default uiSlice.reducer;
