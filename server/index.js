import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import gradesRoutes from './routes/grades.js';
import profileRoutes from './routes/profile.js';
import emailRoutes from './routes/email.js';
import newsRoutes from './routes/news.js';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: isDev ? true : FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', gradesRoutes);
app.use('/api', profileRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', newsRoutes);

// Yangiliklar jadvali mavjud bo'lmasa yaratish (eski bazalar uchun)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (_) {}

// Production: frontend static
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Bukhari Academy server: http://localhost:${PORT}`);
});
