const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chatbot-dev-secret-change-in-production';

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    return next(new Error('Invalid token'));
  }
}

module.exports = { generateToken, verifyToken, authMiddleware, socketAuthMiddleware };
