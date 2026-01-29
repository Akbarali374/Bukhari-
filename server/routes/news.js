import { Router } from 'express';
import db from '../db.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

// Barcha foydalanuvchilar yangiliklarni ko'rishi mumkin
router.get('/news', (req, res) => {
  const list = db.prepare(`
    SELECT id, title, content, image_url, created_at
    FROM news
    ORDER BY created_at DESC
    LIMIT 50
  `).all();
  res.json(list);
});

// Admin yangilik qo'shadi (sarlavha, matn, rasm URL)
router.post('/admin/news', auth, adminOnly, (req, res) => {
  const { title, content, image_url } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Sarlavha va matn kiritishingiz kerak.' });
  }
  const r = db.prepare(`
    INSERT INTO news (title, content, image_url)
    VALUES (?, ?, ?)
  `).run(title.trim(), content.trim(), image_url?.trim() || null);
  res.status(201).json({ id: r.lastInsertRowid, message: 'Yangilik qo\'shildi.' });
});

// Admin yangilikni o'chiradi
router.delete('/admin/news/:id', auth, adminOnly, (req, res) => {
  const { id } = req.params;
  const r = db.prepare('DELETE FROM news WHERE id = ?').run(id);
  if (r.changes === 0) return res.status(404).json({ error: 'Yangilik topilmadi.' });
  res.json({ message: 'O\'chirildi.' });
});

export default router;
