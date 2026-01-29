import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// O'quvchi o'z ma'lumotlarini ko'radi va tahrirlaydi
router.get('/me/profile', (req, res) => {
  const user = req.user;
  if (user.role !== 'student') {
    return res.json({ user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } });
  }
  const student = db.prepare(`
    SELECT s.id, s.gmail, s.familya, s.ism, s.group_id, s.phone, s.created_at,
           g.name as group_name,
           u.email
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE s.user_id = ?
  `).get(user.id);
  if (!student) return res.status(404).json({ error: 'Profil topilmadi.' });
  res.json({ profile: student });
});

router.put('/me/profile', (req, res) => {
  const user = req.user;
  const { gmail, familya, ism, phone, currentPassword, newPassword } = req.body;
  if (user.role === 'student') {
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(user.id);
    if (!student) return res.status(404).json({ error: 'Profil topilmadi.' });
    if (gmail !== undefined) db.prepare('UPDATE students SET gmail = ? WHERE user_id = ?').run(gmail, user.id);
    if (familya !== undefined) db.prepare('UPDATE users SET last_name = ? WHERE id = ?').run(familya, user.id);
    if (ism !== undefined) db.prepare('UPDATE users SET first_name = ? WHERE id = ?').run(ism, user.id);
    if (phone !== undefined) db.prepare('UPDATE students SET phone = ? WHERE user_id = ?').run(phone, user.id);
  } else {
    if (familya !== undefined) db.prepare('UPDATE users SET last_name = ? WHERE id = ?').run(familya, user.id);
    if (ism !== undefined) db.prepare('UPDATE users SET first_name = ? WHERE id = ?').run(ism, user.id);
  }
  if (newPassword && currentPassword) {
    const u = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id);
    if (!bcrypt.compareSync(currentPassword, u.password)) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri.' });
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), user.id);
  }
  res.json({ message: 'Profil yangilandi.' });
});

export default router;
