import { Router } from 'express';
import nodemailer from 'nodemailer';
import db from '../db.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.use(adminOnly);

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user, pass }
  });
}

// Bir oylik hisobotni bitta o'quvchiga yuborish
router.post('/send-monthly-report/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { month, year } = req.query;
  const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const y = year ? parseInt(year, 10) : new Date().getFullYear();

  const student = db.prepare(`
    SELECT s.id, s.gmail, s.familya, s.ism, s.user_id,
           g.name as group_name
    FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE s.id = ?
  `).get(studentId);
  if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi.' });

  const grades = db.prepare(`
    SELECT value, subject, comment, created_at
    FROM grades
    WHERE student_id = ? AND month = ? AND year = ?
    ORDER BY created_at
  `).all(studentId, m, y);

  const bonuses = db.prepare(`
    SELECT amount, reason, created_at
    FROM bonuses
    WHERE student_id = ?
    AND strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?
  `).all(studentId, String(m).padStart(2, '0'), String(y));

  const totalBonus = bonuses.reduce((s, b) => s + b.amount, 0);
  const avgGrade = grades.length ? Math.round(grades.reduce((s, g) => s + g.value, 0) / grades.length) : 0;

  const transporter = getTransporter();
  if (!transporter) {
    return res.status(503).json({
      error: 'Email sozlanmagan. .env da SMTP_USER va SMTP_PASS o\'rnating.',
      preview: {
        to: student.gmail,
        avgGrade,
        totalBonus,
        gradesCount: grades.length
      }
    });
  }

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const monthName = monthNames[m - 1] || m;

  const gradesRows = grades.map(g => `<tr><td>${g.subject || '-'}</td><td>${g.value}</td><td>${g.comment || '-'}</td></tr>`).join('');
  const bonusRows = bonuses.map(b => `<tr><td>+${b.amount}</td><td>${b.reason || '-'}</td></tr>`).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #1a5f4a 0%, #2d8f6f 100%); color: #fff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
  .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
  th { background: #1a5f4a; color: #fff; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-style: italic; color: #6b7280; }
  .big { font-size: 1.2em; font-weight: bold; }
</style></head>
<body>
  <div class="header">
    <h1 style="margin:0;">Bukhari Academy</h1>
    <p style="margin:8px 0 0;">O'quv markazi</p>
  </div>
  <div class="content">
    <p><strong>Hurmatli o'quvchi ${student.ism} ${student.familya}!</strong></p>
    <p>${monthName} ${y} oyi uchun o'quv natijalaringiz quyida keltirilgan.</p>
    <p><span class="big">O'rtacha baho: ${avgGrade} / 100</span></p>
    ${grades.length ? `<h3>Baholar</h3><table><thead><tr><th>Fan / Mavzu</th><th>Baho</th><th>Izoh</th></tr></thead><tbody>${gradesRows}</tbody></table>` : '<p>Bu oy uchun baholar qo\'shilmagan.</p>'}
    ${bonuses.length ? `<h3>Bonus ballar</h3><p><strong>Jami bonus: +${totalBonus}</strong></p><table><thead><tr><th>Ball</th><th>Sabab</th></tr></thead><tbody>${bonusRows}</tbody></table>` : ''}
    ${student.group_name ? `<p>Guruh: <strong>${student.group_name}</strong></p>` : ''}
    <div class="footer">
      Hurmat bilan,<br><strong>Bukhari Academy</strong>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: student.gmail,
      subject: `Bukhari Academy — ${monthName} ${y} oylik hisobot`,
      html
    });
    res.json({ message: `Hisobot ${student.gmail} ga yuborildi.` });
  } catch (err) {
    res.status(500).json({ error: 'Email yuborishda xatolik.', detail: err.message });
  }
});

// Barcha o'quvchilarga oylik hisobot yuborish
router.post('/send-monthly-reports', async (req, res) => {
  const { month, year } = req.query;
  const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const y = year ? parseInt(year, 10) : new Date().getFullYear();

  const students = db.prepare('SELECT id FROM students').all();
  const transporter = getTransporter();
  const results = { sent: 0, failed: [] };

  for (const s of students) {
    try {
      const student = db.prepare(`
        SELECT s.id, s.gmail, s.familya, s.ism
        FROM students s WHERE s.id = ?
      `).get(s.id);
      const grades = db.prepare(`
        SELECT value FROM grades WHERE student_id = ? AND month = ? AND year = ?
      `).all(s.id, m, y);
      const bonuses = db.prepare(`
        SELECT amount FROM bonuses WHERE student_id = ?
        AND strftime('%m', created_at) = ? AND strftime('%Y', created_at) = ?
      `).all(s.id, String(m).padStart(2, '0'), String(y));
      const avgGrade = grades.length ? Math.round(grades.reduce((a, g) => a + g.value, 0) / grades.length) : 0;
      const totalBonus = bonuses.reduce((a, b) => a + b.amount, 0);

      const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
      const monthName = monthNames[m - 1] || m;

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #1a5f4a 0%, #2d8f6f 100%); color: #fff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
  .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-style: italic; color: #6b7280; }
  .big { font-size: 1.2em; font-weight: bold; }
</style></head>
<body>
  <div class="header"><h1 style="margin:0;">Bukhari Academy</h1><p style="margin:8px 0 0;">O'quv markazi</p></div>
  <div class="content">
    <p><strong>Hurmatli o'quvchi ${student.ism} ${student.familya}!</strong></p>
    <p>${monthName} ${y} oyi uchun o'quv natijalaringiz.</p>
    <p><span class="big">O'rtacha baho: ${avgGrade} / 100</span></p>
    <p><span class="big">Bonus ballar: +${totalBonus}</span></p>
    <div class="footer">Hurmat bilan,<br><strong>Bukhari Academy</strong></div>
  </div>
</body>
</html>
      `;

      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: student.gmail,
          subject: `Bukhari Academy — ${monthName} ${y} oylik hisobot`,
          html
        });
      }
      results.sent++;
    } catch (err) {
      results.failed.push({ studentId: s.id, error: err.message });
    }
  }

  res.json({
    message: `${results.sent} ta hisobot yuborildi.`,
    total: students.length,
    sent: results.sent,
    failed: results.failed
  });
});

export default router;
