const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Express app yaratish
const app = express();

// CORS sozlamalari
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// In-memory database (sodda test uchun)
let users = [
  {
    id: 1,
    email: 'admin@bukhari.uz',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User'
  }
];

let teachers = [];
let groups = [];
let students = [];
let grades = [];
let bonuses = [];
let news = [];

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'bukhari-academy-secret-key';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bukhari Academy API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  });
});

// Admin routes
app.get('/api/admin/teachers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  res.json(teachers);
});

app.post('/api/admin/teachers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  try {
    const { email, password, first_name, last_name, phone } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Bu email allaqachon mavjud' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = {
      id: teachers.length + 2,
      email,
      password: hashedPassword,
      role: 'teacher',
      first_name,
      last_name,
      phone
    };

    teachers.push(newTeacher);
    users.push(newTeacher);

    res.json({ message: 'Ustoz muvaffaqiyatli yaratildi' });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('/api/admin/groups', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  
  const groupsWithTeachers = groups.map(group => {
    const teacher = teachers.find(t => t.id === group.teacher_id);
    return {
      ...group,
      teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Noma\'lum',
      student_count: students.filter(s => s.group_id === group.id).length
    };
  });
  
  res.json(groupsWithTeachers);
});

app.post('/api/admin/groups', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const { name, teacher_id } = req.body;
  const newGroup = {
    id: groups.length + 1,
    name,
    teacher_id,
    created_at: new Date().toISOString()
  };

  groups.push(newGroup);
  res.json({ message: 'Guruh muvaffaqiyatli yaratildi' });
});

app.get('/api/admin/students', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const studentsWithGroups = students.map(student => {
    const group = groups.find(g => g.id === student.group_id);
    const user = users.find(u => u.id === student.user_id);
    return {
      ...student,
      group_name: group ? group.name : 'Noma\'lum',
      login_email: user ? user.email : 'Noma\'lum'
    };
  });

  res.json(studentsWithGroups);
});

app.get('/api/admin/logins', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const loginData = users.map(user => {
    if (user.role === 'student') {
      const student = students.find(s => s.user_id === user.id);
      const group = student ? groups.find(g => g.id === student.group_id) : null;
      return {
        ...user,
        group_name: group ? group.name : null
      };
    }
    return user;
  });

  res.json(loginData);
});

// News routes
app.get('/api/news', (req, res) => {
  res.json(news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.post('/api/admin/news', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const { title, content, image_url } = req.body;
  const newNews = {
    id: news.length + 1,
    title,
    content,
    image_url,
    created_at: new Date().toISOString()
  };

  news.push(newNews);
  res.json({ message: 'Yangilik qo\'shildi' });
});

// Export handler
module.exports.handler = serverless(app);
