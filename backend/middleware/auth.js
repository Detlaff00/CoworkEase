
const jwt = require('jsonwebtoken');



function authMiddleware(req, res, next) {
  const token = req.cookies.token;        

  if (!token) return res.status(401).json({ error: 'Нет токена' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Неверный или просроченный токен' });
  }
}

module.exports = authMiddleware;