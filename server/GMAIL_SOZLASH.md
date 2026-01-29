# Oylik hisobot — Gmail sozlash

Oylik hisobot **akbaralivalijonov18@gmail.com** dan o'quvchilar Gmailiga yuboriladi.

## Parolni qo'yish (majburiy)

1. **server** papkasidagi **.env** faylini oching.
2. `SMTP_PASS=` qatorini toping.
3. Teng belgidan keyin **Gmail App password** yozing (oddiy parol emas).

## Gmail App password olish

1. https://myaccount.google.com/ ga kiring (akbaralivalijonov18@gmail.com bilan).
2. **Xavfsizlik** → **2 bosqichli tekshiruv** yoqilgan bo‘lishi kerak.
3. **App passwords** (Ilova parollari) ga boring.
4. "Mail" va "Windows computer" (yoki boshqa qurilma) tanlang, **Yaratish** bosing.
5. 16 belgili parol chiqadi — uni nusxalab **.env** da `SMTP_PASS=` dan keyin qo‘ying, bo‘sh joy qoldirmang.

Misol:
```
SMTP_PASS=abcd efgh ijkl mnop
```

6. **.env** ni saqlang va serverni qayta ishga tushiring (Ctrl+C, keyin `npm run dev`).

Shundan keyin admin panelida "Oylik hisobot" bo‘limida "Barcha o'quvchilarga yuborish" tugmasi hisobotlarni **akbaralivalijonov18@gmail.com** dan o‘quvchilar Gmailiga yuboradi.
