# Server qanday ishga tushiriladi

## 1-qadam: Ma'lumotlar bazasini yaratish (bir marta)

Loyiha papkasida (kundalikom bukhari) terminalda:

```bash
cd server
npm run init-db
```

Bu `server/data/bukhari.db` faylini va default admin (admin@bukhari.uz / admin123) yaratadi.

## 2-qadam: Server .env (ixtiyoriy)

Email yuborish kerak bo‘lsa, `server` papkasida `.env` fayl yarating.  
`.env.example` dan nusxa olib nomini `.env` qiling va kerakli qiymatlarni yozing:

- `PORT=5000` — server porti
- `JWT_SECRET=...` — istalgan maxfiy kalit
- Gmail uchun: `SMTP_USER`, `SMTP_PASS` (App password)

Agar `.env` yaratmasangiz ham server ishlaydi (default port 5000, admin login ishlaydi).

## 3-qadam: Serverni ishga tushirish

### Variant A — faqat server (backend)

Loyiha papkasida:

```bash
npm run server
```

yoki to‘g‘ridan-to‘g‘ri:

```bash
cd server
npm run dev
```

Terminalda `Bukhari Academy server: http://localhost:5000` chiqsa, server ishlayapti.

### Variant B — server + frontend birga

Loyiha papkasida:

```bash
npm run dev
```

Bu bir vaqtda:
- serverni http://localhost:5000 da
- frontendni http://localhost:5173 da

ishga tushiradi. Brauzerda http://localhost:5173 ochib, admin@bukhari.uz / admin123 bilan kiring.

---

## Qisqacha buyruqlar

| Nima qilmoqchi        | Buyruq                    |
|----------------------|---------------------------|
| DB yaratish (1 marta)| `cd server && npm run init-db` |
| Faqat server         | `npm run server`          |
| Server + sayt        | `npm run dev`             |
| Production server   | `cd server && npm start`  |
