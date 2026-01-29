import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.use(adminOnly);

// Ustozlar ro'yxati
router.get('/teachers', (req, res) => {
  const list = db.prepare(`
    SELECT t.id, t.user_id, t.phone, t.created_at,
           u.email, u.first_name, u.last_name
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.id DESC
  `).all();
  res.json(list);
});

// Ustoz yaratish (login parol bilan)
router.post('/teachers', (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Email, parol, ism va familya kiritishingiz kerak.' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const user = db.prepare(`
      INSERT INTO users (email, password, role, first_name, last_name)
      VALUES (?, ?, 'teacher', ?, ?)
    `).run(email.toLowerCase().trim(), hashed, first_name.trim(), last_name.trim());
    db.prepare('INSERT INTO teachers (user_id, phone) VALUES (?, ?)')
      .run(user.lastInsertRowid, phone || null);
    res.status(201).json({ id: user.lastInsertRowid, message: 'Ustoz qo\'shildi.' });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Bu email allaqachon mavjud.' });
    }
    throw e;
  }
});

// Guruhlar ro'yxati
router.get('/groups', (req, res) => {
  const list = db.prepare(`
    SELECT g.id, g.name, g.teacher_id, g.created_at,
           u.first_name || ' ' || u.last_name as teacher_name,
           u.email as teacher_email,
           (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id) as student_count
    FROM groups g
    JOIN teachers t ON t.id = g.teacher_id
    JOIN users u ON u.id = t.user_id
    ORDER BY g.id DESC
  `).all();
  res.json(list);
});

// Guruh yaratish (bitta ustoz)
router.post('/groups', (req, res) => {
  const { name, teacher_id } = req.body;
  if (!name || !teacher_id) {
    return res.status(400).json({ error: 'Guruh nomi va ustoz tanlang.' });
  }
  const r = db.prepare('INSERT INTO groups (name, teacher_id) VALUES (?, ?)')
    .run(name.trim(), teacher_id);
  res.status(201).json({ id: r.lastInsertRowid, message: 'Guruh yaratildi.' });
});

// Barcha o'quvchilar (guruh bo'yicha)
router.get('/students', (req, res) => {
  const groupId = req.query.group_id;
  let list;
  if (groupId) {
    list = db.prepare(`
      SELECT s.id, s.user_id, s.gmail, s.familya, s.ism, s.group_id, s.created_at,
             u.email as login_email,
             g.name as group_name
      FROM students s
      JOIN users u ON u.id = s.user_id
      JOIN groups g ON g.id = s.group_id
      WHERE s.group_id = ?
      ORDER BY s.familya, s.ism
    `).all(groupId);
  } else {
    list = db.prepare(`
      SELECT s.id, s.user_id, s.gmail, s.familya, s.ism, s.group_id, s.created_at,
             u.email as login_email,
             g.name as group_name
      FROM students s
      JOIN users u ON u.id = s.user_id
      JOIN groups g ON g.id = s.group_id
      ORDER BY g.name, s.familya, s.ism
    `).all();
  }
  res.json(list);
});

// Loginlar (barcha foydalanuvchilar login/parol ko'rinishi - faqat admin)
router.get('/logins', (req, res) => {
  const list = db.prepare(`
    SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.created_at,
           CASE WHEN u.role = 'student' THEN (SELECT g.name FROM students s JOIN groups g ON g.id = s.group_id WHERE s.user_id = u.id)
                ELSE NULL END as group_name
    FROM users u
    WHERE u.role IN ('teacher', 'student')
    ORDER BY u.role, u.last_name
  `).all();
  res.json(list);
});

// O'quvchi qo'shish (login yaratib berish)
router.post('/students', (req, res) => {
  const { email, password, gmail, familya, ism, group_id, phone } = req.body;
  if (!email || !password || !gmail || !familya || !ism || !group_id) {
    return res.status(400).json({
      error: 'Login (email), parol, Gmail, familya, ism va guruh talab qilinadi.'
    });
  }
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const user = db.prepare(`
      INSERT INTO users (email, password, role, first_name, last_name)
      VALUES (?, ?, 'student', ?, ?)
    `).run(email.toLowerCase().trim(), hashed, ism.trim(), familya.trim());
    db.prepare(`
      INSERT INTO students (user_id, group_id, gmail, familya, ism, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.lastInsertRowid, group_id, gmail.trim(), familya.trim(), ism.trim(), phone || null);
    res.status(201).json({ id: user.lastInsertRowid, message: 'O\'quvchi va login yaratildi.' });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Bu login (email) allaqachon mavjud.' });
    }
    throw e;
  }
});

// O'quvchini yangilash (admin)
router.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { gmail, familya, ism, group_id, phone } = req.body;
  const student = db.prepare('SELECT id, user_id FROM students WHERE id = ?').get(id);
  if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi.' });
  if (familya !== undefined) {
    db.prepare('UPDATE users SET last_name = ? WHERE id = ?').run(familya, student.user_id);
  }
  if (ism !== undefined) {
    db.prepare('UPDATE users SET first_name = ? WHERE id = ?').run(ism, student.user_id);
  }
  db.prepare(`
    UPDATE students SET gmail = COALESCE(?, gmail), familya = COALESCE(?, familya),
      ism = COALESCE(?, ism), group_id = COALESCE(?, group_id), phone = COALESCE(?, phone)
    WHERE id = ?
  `).run(gmail ?? null, familya ?? null, ism ?? null, group_id ?? null, phone ?? null, id);
  res.json({ message: 'Yangilandi.' });
});

// Login parolini almashtirish (admin)
router.put('/users/:userId/password', (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Parol kamida 4 belgidan iborat bo\'lishi kerak.' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const r = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, userId);
  if (r.changes === 0) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
  res.json({ message: 'Parol yangilandi.' });
});

export default router;
