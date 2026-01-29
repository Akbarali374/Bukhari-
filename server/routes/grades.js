import { Router } from 'express';
import db from '../db.js';
import { auth, adminOnly, teacherOrAdmin } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// O'quvchi baholari (1-100)
router.get('/students/:studentId/grades', (req, res) => {
  const { studentId } = req.params;
  const user = req.user;
  if (user.role === 'student') {
    const st = db.prepare('SELECT id, user_id FROM students WHERE user_id = ?').get(user.id);
    if (!st || st.id !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Faqat o\'z baholaringizni ko\'rishingiz mumkin.' });
    }
  }
  const list = db.prepare(`
    SELECT id, student_id, value, subject, comment, month, year, created_at
    FROM grades
    WHERE student_id = ?
    ORDER BY year DESC, month DESC, created_at DESC
  `).all(studentId);
  res.json(list);
});

// Baho qo'shish (admin yoki ustoz)
router.post('/students/:studentId/grades', teacherOrAdmin, (req, res) => {
  const { studentId } = req.params;
  const { value, subject, comment, month, year } = req.body;
  if (value == null || value < 1 || value > 100) {
    return res.status(400).json({ error: 'Baho 1 dan 100 gacha bo\'lishi kerak.' });
  }
  const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
  if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi.' });
  const m = month ?? new Date().getMonth() + 1;
  const y = year ?? new Date().getFullYear();
  db.prepare(`
    INSERT INTO grades (student_id, value, subject, comment, month, year)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(studentId, value, subject || null, comment || null, m, y);
  res.status(201).json({ message: 'Baho qo\'shildi.' });
});

// Bonuslar
router.get('/students/:studentId/bonuses', (req, res) => {
  const { studentId } = req.params;
  const user = req.user;
  if (user.role === 'student') {
    const st = db.prepare('SELECT id FROM students WHERE user_id = ?').get(user.id);
    if (!st || st.id !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Ruxsat yo\'q.' });
    }
  }
  const list = db.prepare(`
    SELECT id, student_id, amount, reason, created_at
    FROM bonuses
    WHERE student_id = ?
    ORDER BY created_at DESC
  `).all(studentId);
  const total = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM bonuses WHERE student_id = ?')
    .get(studentId);
  res.json({ list, totalBonus: total.total });
});

router.post('/students/:studentId/bonuses', teacherOrAdmin, (req, res) => {
  const { studentId } = req.params;
  const { amount, reason } = req.body;
  if (amount == null) return res.status(400).json({ error: 'Bonus ballini kiriting.' });
  const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
  if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi.' });
  db.prepare('INSERT INTO bonuses (student_id, amount, reason) VALUES (?, ?, ?)')
    .run(studentId, parseInt(amount) || 0, reason || null);
  res.status(201).json({ message: 'Bonus qo\'shildi.' });
});

export default router;
