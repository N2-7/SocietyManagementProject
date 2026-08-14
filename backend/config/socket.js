const User = require('../models/User');

/**
 * Configure Socket.io for real-time notifications
 */
const setupSocket = (io) => {
  // Store connected users with their socket IDs
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins their personal room based on user ID
    socket.on('join', (userId) => {
      socket.join(userId);
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} joined their room`);
    });

    // Admin joins admin room for admin notifications
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    // Handle new complaint notification
    socket.on('new-complaint', (data) => {
      // Notify admin
      io.to('admin-room').emit('complaint-created', {
        message: 'New complaint created',
        data,
      });
    });

    // Handle complaint status update notification
    socket.on('complaint-updated', (data) => {
      // Notify the resident who created the complaint
      io.to(data.residentId).emit('complaint-status-changed', {
        message: 'Your complaint status has been updated',
        data,
      });
    });

    // Handle maintenance generated notification
    socket.on('maintenance-generated', (data) => {
      // Notify the resident
      io.to(data.residentId).emit('maintenance-created', {
        message: 'New maintenance bill generated',
        data,
      });
    });

    // Handle payment success notification
    socket.on('payment-success', (data) => {
      // Notify the resident
      io.to(data.residentId).emit('payment-confirmed', {
        message: 'Payment successful',
        data,
      });
      // Notify admin
      io.to('admin-room').emit('payment-received', {
        message: 'New payment received',
        data,
      });
    });

    // Handle visitor arrival notification
    socket.on('visitor-arrived', (data) => {
      // Notify the resident
      io.to(data.residentId).emit('visitor-at-gate', {
        message: 'Your visitor has arrived',
        data,
      });
    });

    // Handle notice published notification
    socket.on('notice-published', (data) => {
      // Broadcast to all users
      io.emit('new-notice', {
        message: 'New notice published',
        data,
      });
    });

    // Handle event created notification
    socket.on('event-created', (data) => {
      // Broadcast to all users
      io.emit('new-event', {
        message: 'New event announced',
        data,
      });
    });

    // Handle amenity booking notification
    socket.on('amenity-booked', (data) => {
      // Notify admin
      io.to('admin-room').emit('new-amenity-booking', {
        message: 'New amenity booking request',
        data,
      });
    });

    // Handle amenity booking status update
    socket.on('amenity-status-changed', (data) => {
      // Notify the resident
      io.to(data.residentId).emit('amenity-booking-updated', {
        message: 'Your amenity booking status has been updated',
        data,
      });
    });

    // Handle emergency alert
    socket.on('emergency-alert', (data) => {
      // Notify admin
      io.to('admin-room').emit('emergency-triggered', {
        message: 'Emergency alert triggered',
        data,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove user from connected users
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

module.exports = setupSocket;
