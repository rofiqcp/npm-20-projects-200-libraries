const jwt = require('jsonwebtoken');
const pool = require('../db');

const onlineUsers = new Map();

module.exports = (io, redisClient) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { id, username } = socket.user;
    onlineUsers.set(id, { username, socketId: socket.id });
    io.emit('online_count', onlineUsers.size);

    socket.on('join_room', async (roomId) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user_joined', { username, roomId });
    });

    socket.on('send_message', async ({ roomId, content }) => {
      try {
        const result = await pool.query(
          'INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
          [roomId, id, content]
        );
        const message = { ...result.rows[0], username };
        io.to(`room:${roomId}`).emit('new_message', message);
        if (redisClient && redisClient.isReady) {
          await redisClient.lPush(`room:${roomId}:messages`, JSON.stringify(message));
          await redisClient.lTrim(`room:${roomId}:messages`, 0, 99);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('typing', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('user_typing', { username, roomId });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('user_stop_typing', { username, roomId });
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user_left', { username, roomId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(id);
      io.emit('online_count', onlineUsers.size);
    });
  });
};
