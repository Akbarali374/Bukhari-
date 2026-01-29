import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bukhari-academy-secret-key';

router.post('/login', (req, res) => {
  try {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parol kiritishingiz kerak.' });
  }
  let user;
  try {
    user = db.prepare(`
      SELECT u.id, u.email, u.password, u.role, u.first_name, u.last_name
      FROM users u
      WHERE u.email = ?
    `).get(email.toLowerCase().trim());
  } catch (dbErr) {
    return res.status(500).json({ error: 'Ma\'lumotlar bazasi ishlamayapti. Serverni to\'xtatib, "cd server" dan "npm run init-db" bajaring.' });
  }
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri.' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const { password: _, ...safeUser } = user;
  let extra = {};
  if (safeUser.role === 'teacher') {
    const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(safeUser.id);
    if (t) extra.teacherId = t.id;
  }
  if (safeUser.role === 'student') {
    const s = db.prepare(`
      SELECT s.id, s.gmail, s.familya, s.ism, s.group_id, g.name as group_name
      FROM students s
      LEFT JOIN groups g ON g.id = s.group_id
      WHERE s.user_id = ?
    `).get(safeUser.id);
    if (s) extra.student = s;
  }
  res.json({ token, user: { ...safeUser, ...extra } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Kirishda xatolik.' });
  }
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Kirish uchun kiring.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare(`
      SELECT id, email, role, first_name, last_name FROM users WHERE id = ?
    `).get(decoded.id);
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi.' });
    let extra = {};
    if (user.role === 'teacher') {
      const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(user.id);
      if (t) extra.teacherId = t.id;
    }
    if (user.role === 'student') {
      const s = db.prepare(`
        SELECT s.id, s.gmail, s.familya, s.ism, s.group_id, g.name as group_name
        FROM students s
        LEFT JOIN groups g ON g.id = s.group_id
        WHERE s.user_id = ?
      `).get(user.id);
      if (s) extra.student = s;
    }
    res.json({ user: { ...user, ...extra } });
  } catch {
    res.status(401).json({ error: 'Sessiya tugadi.' });
  }
});

export default router;
