import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bukhari-academy-secret-key';

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Kirish uchun tizimga kiring.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Sessiya tugadi. Qayta kiring.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Faqat admin uchun.' });
  }
  next();
};

export const teacherOrAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
    return res.status(403).json({ error: 'Ruxsat yo\'q.' });
  }
  next();
};
