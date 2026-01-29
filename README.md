# Bukhari Academy — O'quv markazi tizimi

Zamonaviy o'quv markazi boshqaruv tizimi: admin, ustozlar, guruhlar, o'quvchilar, baholar (1–100), bonuslar va oylik hisobotlar Gmail orqali.

## Imkoniyatlar

- **Admin:** Login (admin@bukhari.uz / admin123), ustoz yaratish, guruh yaratish (har bir guruhga bitta ustoz), o'quvchilar bo'limi (guruh bo'yicha), loginlar ro'yxati, o'quvchilarga login yaratish, oylik hisobotlarni barcha o'quvchilarga Gmailga yuborish.
- **Ustoz:** O'z guruhlari va o'quvchilari, baho (1–100) va bonus qo'shish.
- **O'quvchi:** Gmail, familya, ism bilan qo'shiladi; profil va ma'lumotlarni tahrirlash; baholar va qo'shimcha bonuslarni ko'rish.
- **Oylik hisobot:** Har oy o'quvchiga "Hurmatli o'quvchi" deb natija Gmailga yuboriladi, oxirida "Hurmat bilan, Bukhari Academy".

## O'rnatish

```bash
npm run install:all
cd server && npm run init-db
```

Server uchun `.env` yarating (server papkasida):

```env
PORT=5000
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:5173
```

Gmail uchun [App password](https://myaccount.google.com/apppasswords) yarating.

## Ishga tushirish

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000  

## GitHub va production

1. Loyihani GitHubga yuklang.
2. Hostingda (Vercel, Render, va hokazo) `FRONTEND_URL` va `JWT_SECRET` ni production qiymatlariga o'zgartiring.
3. Admin panelidan o'quvchilarga login yarating; o'quvchilar shu login va parol bilan tizimga kirishadi.

## Texnologiyalar

- **Frontend:** React, Vite, Tailwind CSS (mobil qurilmalarga mos).
- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT, Nodemailer.
