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

// In-memory database (Netlify uchun)
let users = [
  {
    id: 1,
    email: 'admin@bukhari.uz',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin',
    first_name: 'Admin',
    last_name: 'Bukhari'
  }
];

let teachers = [];
let groups = [];
let students = [];
let grades = [];
let bonuses = [];
let news = [];

// Auto-increment IDs
let nextUserId = 2;
let nextTeacherId = 1;
let nextGroupId = 1;
let nextStudentId = 1;
let nextGradeId = 1;
let nextBonusId = 1;
let nextNewsId = 1;

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
    message: 'Bukhari Academy API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email va parol kiritishingiz kerak' });
    }
    
    const user = users.find(u => u.email === email.toLowerCase().trim());
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
      { expiresIn: '7d' }
    );

    let extra = {};
    if (user.role === 'teacher') {
      const teacher = teachers.find(t => t.user_id === user.id);
      if (teacher) extra.teacherId = teacher.id;
    }
    if (user.role === 'student') {
      const student = students.find(s => s.user_id === user.id);
      if (student) {
        const group = groups.find(g => g.id === student.group_id);
        extra.student = {
          ...student,
          group_name: group ? group.name : 'Noma\'lum'
        };
      }
    }

    const { password: _, ...safeUser } = user;
    res.json({
      token,
      user: { ...safeUser, ...extra }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  }

  let extra = {};
  if (user.role === 'teacher') {
    const teacher = teachers.find(t => t.user_id === user.id);
    if (teacher) extra.teacherId = teacher.id;
  }
  if (user.role === 'student') {
    const student = students.find(s => s.user_id === user.id);
    if (student) {
      const group = groups.find(g => g.id === student.group_id);
      extra.student = {
        ...student,
        group_name: group ? group.name : 'Noma\'lum'
      };
    }
  }

  const { password: _, ...safeUser } = user;
  res.json({
    user: { ...safeUser, ...extra }
  });
});

// Admin routes
app.get('/api/admin/teachers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  
  const teachersWithUsers = teachers.map(teacher => {
    const user = users.find(u => u.id === teacher.user_id);
    return {
      id: teacher.id,
      first_name: user ? user.first_name : '',
      last_name: user ? user.last_name : '',
      email: user ? user.email : '',
      phone: teacher.phone || ''
    };
  });
  
  res.json(teachersWithUsers);
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
    const newUser = {
      id: nextUserId++,
      email,
      password: hashedPassword,
      role: 'teacher',
      first_name,
      last_name
    };

    const newTeacher = {
      id: nextTeacherId++,
      user_id: newUser.id,
      phone: phone || ''
    };

    users.push(newUser);
    teachers.push(newTeacher);

    res.json({ message: 'Ustoz muvaffaqiyatli yaratildi' });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('/api/admin/groups', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }
  
  const groupsWithTeachers = groups.map(group => {
    const teacher = teachers.find(t => t.id === group.teacher_id);
    const teacherUser = teacher ? users.find(u => u.id === teacher.user_id) : null;
    return {
      ...group,
      teacher_name: teacherUser ? `${teacherUser.first_name} ${teacherUser.last_name}` : 'Noma\'lum',
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
    id: nextGroupId++,
    name,
    teacher_id: parseInt(teacher_id),
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

app.post('/api/admin/students', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  try {
    const { email, password, gmail, familya, ism, group_id, phone } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Bu email allaqachon mavjud' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextUserId++,
      email,
      password: hashedPassword,
      role: 'student',
      first_name: ism,
      last_name: familya
    };

    const newStudent = {
      id: nextStudentId++,
      user_id: newUser.id,
      group_id: parseInt(group_id),
      gmail,
      familya,
      ism,
      phone: phone || ''
    };

    users.push(newUser);
    students.push(newStudent);

    res.json({ message: 'O\'quvchi muvaffaqiyatli yaratildi' });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.get('/api/admin/logins', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const loginData = users.map(user => {
    let group_name = null;
    if (user.role === 'student') {
      const student = students.find(s => s.user_id === user.id);
      if (student) {
        const group = groups.find(g => g.id === student.group_id);
        group_name = group ? group.name : null;
      }
    }
    return {
      ...user,
      group_name
    };
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
    id: nextNewsId++,
    title,
    content,
    image_url: image_url || null,
    created_at: new Date().toISOString()
  };

  news.push(newNews);
  res.json({ message: 'Yangilik qo\'shildi' });
});

app.delete('/api/admin/news/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Ruxsat yo\'q' });
  }

  const id = parseInt(req.params.id);
  const index = news.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Yangilik topilmadi' });
  }

  news.splice(index, 1);
  res.json({ message: 'Yangilik o\'chirildi' });
});

// Export handler
module.exports.handler = serverless(app);
