const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userData = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userData.id;
    const role = socket.userData.role;
    console.log(`🔌 Socket connected: ${userId} [${role}]`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Join order room
    socket.on('join_order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('leave_order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Notification helpers
const notifyUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

const notifyOrderRoom = (orderId, event, data) => {
  getIO().to(`order:${orderId}`).emit(event, data);
};

const notifyAdmins = (event, data) => {
  getIO().to('role:admin').emit(event, data);
};

module.exports = initSocket;
module.exports.getIO = getIO;
module.exports.notifyUser = notifyUser;
module.exports.notifyOrderRoom = notifyOrderRoom;
module.exports.notifyAdmins = notifyAdmins;
