# Bukhari Academy — O'quv markazi tizimi

Zamonaviy o'quv markazi boshqaruv tizimi: admin, ustozlar, guruhlar, o'quvchilar, baholar (1–100), bonuslar va oylik hisobotlar Gmail orqali.

## 🚀 Demo

- **Frontend (Netlify):** [https://bukhari-academy.netlify.app](https://bukhari-academy.netlify.app)
- **Backend:** Backend serverini alohida deploy qiling (Render, Railway, yoki boshqa hosting)

## 📋 Imkoniyatlar

- **Admin:** Login (admin@bukhari.uz / admin123), ustoz yaratish, guruh yaratish (har bir guruhga bitta ustoz), o'quvchilar bo'limi (guruh bo'yicha), loginlar ro'yxati, o'quvchilarga login yaratish, oylik hisobotlarni barcha o'quvchilarga Gmailga yuborish.
- **Ustoz:** O'z guruhlari va o'quvchilari, baho (1–100) va bonus qo'shish.
- **O'quvchi:** Gmail, familya, ism bilan qo'shiladi; profil va ma'lumotlarni tahrirlash; baholar va qo'shimcha bonuslarni ko'rish.
- **Oylik hisobot:** Har oy o'quvchiga "Hurmatli o'quvchi" deb natija Gmailga yuboriladi, oxirida "Hurmat bilan, Bukhari Academy".

## 🛠 Texnologiyalar

- **Frontend:** React, Vite, Tailwind CSS (mobil qurilmalarga mos)
- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT, Nodemailer
- **Deployment:** Netlify (Frontend), Render/Railway (Backend)

## 📦 O'rnatish (Local Development)

```bash
# Barcha dependencies o'rnatish
npm run install:all

# Database yaratish
cd server && npm run init-db

# Server uchun .env yaratish
cp server/.env.example server/.env
```

Server uchun `.env` to'ldiring:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

Gmail uchun [App password](https://myaccount.google.com/apppasswords) yarating.

## 🚀 Ishga tushirish

```bash
# Development mode (frontend + backend)
npm run dev

# Yoki alohida ishga tushirish:
npm run server  # Backend: http://localhost:5000
npm run client  # Frontend: http://localhost:5173
```

## 🌐 Production Deployment

### 1. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/bukhari-academy.git
git push -u origin main
```

### 2. Backend Deploy (Render/Railway)

1. **Render.com** yoki **Railway.app** da yangi service yarating
2. GitHub repository'ni ulang
3. Environment variables qo'shing:
   ```
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   FRONTEND_URL=https://your-netlify-url.netlify.app
   ```
4. Build command: `cd server && npm install`
5. Start command: `cd server && npm start`

### 3. Frontend Deploy (Netlify)

1. **Netlify.com** da yangi site yarating
2. GitHub repository'ni ulang
3. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. Environment variables qo'shing:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy qiling

### 4. Domain va SSL

- Netlify avtomatik SSL sertifikat beradi
- Custom domain qo'shishingiz mumkin

## 🔧 Konfiguratsiya

### Environment Variables

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000  # Development
# VITE_API_URL=https://your-backend-url.com  # Production
```

**Server (.env):**
```env
PORT=5000
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

## 📱 Mobil Responsive

Loyiha to'liq mobil qurilmalarga moslashtirilgan va PWA sifatida ishlaydi.

## 🤝 Contributing

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📄 License

MIT License - [LICENSE](LICENSE) faylini ko'ring.

## 📞 Support

Muammolar yoki savollar uchun [Issues](https://github.com/username/bukhari-academy/issues) bo'limiga murojaat qiling.
