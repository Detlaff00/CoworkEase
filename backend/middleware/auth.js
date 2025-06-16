// backend/middleware/auth.js
const jwt = require('jsonwebtoken');



function authMiddleware(req, res, next) {
  const token = req.cookies.token;        // берём из HTTP-only cookie
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Неверный или просроченный токен' });
  }
}

module.exports = authMiddleware;