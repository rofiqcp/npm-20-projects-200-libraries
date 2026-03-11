const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

module.exports = (io) => {
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
    socket.on('join_board', (boardId) => {
      socket.join(`board:${boardId}`);
    });

    socket.on('task_moved', async ({ taskId, columnId, order, boardId }) => {
      try {
        await Task.findByIdAndUpdate(taskId, { columnId, order });
        socket.to(`board:${boardId}`).emit('task_moved', { taskId, columnId, order });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('task_updated', ({ task, boardId }) => {
      socket.to(`board:${boardId}`).emit('task_updated', task);
    });

    socket.on('task_created', ({ task, boardId }) => {
      socket.to(`board:${boardId}`).emit('task_created', task);
    });

    socket.on('task_deleted', ({ taskId, boardId }) => {
      socket.to(`board:${boardId}`).emit('task_deleted', taskId);
    });

    socket.on('leave_board', (boardId) => {
      socket.leave(`board:${boardId}`);
    });
  });
};
