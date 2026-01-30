# Deployment Guide - Bukhari Academy

## 🚀 Quick Deployment Steps

### 1. GitHub'ga yuklash

```bash
git init
git add .
git commit -m "Initial commit: Bukhari Academy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bukhari-academy.git
git push -u origin main
```

### 2. Backend Deploy (Render.com - Tavsiya etiladi)

1. [Render.com](https://render.com) ga kiring
2. "New +" > "Web Service" tanlang
3. GitHub repository'ni ulang
4. Settings:
   - **Name:** `bukhari-academy-api`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 18

5. Environment Variables qo'shing:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here-make-it-long
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-gmail-app-password
   FRONTEND_URL=https://bukhari-academy.netlify.app
   ```

6. Deploy tugaguncha kuting (5-10 daqiqa)
7. URL ni yozib oling: `https://bukhari-academy-api.onrender.com`

### 3. Frontend Deploy (Netlify)

1. [Netlify.com](https://netlify.com) ga kiring
2. "Add new site" > "Import an existing project"
3. GitHub'dan repository tanlang
4. Settings:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`

5. Environment Variables qo'shing:
   ```
   VITE_API_URL=https://bukhari-academy-api.onrender.com
   ```

6. Deploy qiling
7. Site URL ni oling: `https://bukhari-academy.netlify.app`

### 4. Final Steps

1. Render'da `FRONTEND_URL` ni Netlify URL ga o'zgartiring
2. Ikki service ham ishlab turganini tekshiring
3. Admin login: `admin@bukhari.uz` / `admin123`

## 🔧 Alternative Hosting Options

### Backend Alternatives:
- **Railway.app** (Render'ga o'xshash)
- **Heroku** (pullik)
- **DigitalOcean App Platform**

### Frontend Alternatives:
- **Vercel** (Netlify'ga o'xshash)
- **GitHub Pages** (static hosting)
- **Firebase Hosting**

## 🐛 Common Issues & Solutions

### "Page not found" on Netlify
✅ **Hal qilindi:** `client/public/_redirects` fayli yaratilgan

### CORS errors
✅ **Hal qilindi:** Server'da CORS sozlangan

### Environment variables not working
- Netlify'da: Site Settings > Environment Variables
- Render'da: Environment tab

### Database not initialized
- Render'da build command'ga qo'shing: `npm install && npm run init-db`

## 📱 Testing Deployment

1. **Frontend test:** Netlify URL'ni oching
2. **Backend test:** `https://your-backend-url.com/api/health`
3. **Full test:** Admin login qiling va ustoz yarating

## 🔒 Security Checklist

- [ ] JWT_SECRET uzun va murakkab
- [ ] Gmail App Password ishlatilgan (oddiy parol emas)
- [ ] Environment variables to'g'ri o'rnatilgan
- [ ] HTTPS ishlatilgan (Netlify va Render avtomatik beradi)

## 📞 Support

Muammolar bo'lsa:
1. Browser console'ni tekshiring
2. Network tab'da API so'rovlarni ko'ring
3. Render logs'ni tekshiring
4. GitHub Issues'da savol bering