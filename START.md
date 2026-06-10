# 🚀 zxwdb - Quick Start

## Aplikasi sudah RUNNING!

✅ **Backend**: http://localhost:3001 (sudah jalan)
✅ **Frontend**: http://localhost:5173 (sudah jalan)

---

## 📖 Cara Pakai

### 1. Buka Browser
```
http://localhost:5173
```

### 2. Connect ke Database
- Klik tombol **"Connect to Database"**
- Isi form:
  - Host: `localhost`
  - Port: `3306`
  - Username: `root` (atau user MySQL kamu)
  - Password: (password MySQL kamu)
  - Database: nama database yang sudah ada
- Klik **"Test Connection"** untuk test dulu
- Klik **"Connect & Import"** untuk connect dan import schema

### 3. Mulai Design
**Opsi A: Import Existing**
- Setelah connect, schema otomatis ter-import
- Lihat tables di sidebar kiri
- Klik table untuk lihat detail

**Opsi B: Design from Scratch**
- Klik **"Add Table"** di toolbar
- Isi nama table dan columns
- Set data types, primary keys, dll
- Klik **"Create Table"**

### 4. Visualisasi
- **ERD Mode**: View simplified (entity relationships)
- **LRS Mode**: View detailed (dengan tipe data kolom)
- Toggle di toolbar atas

### 5. Canvas Actions
- **Drag**: Pindahkan tables
- **Zoom**: Scroll mouse atau controls
- **Draw Connection**: Drag dari handle kanan table ke handle kiri table lain
- **Select Table**: Klik table untuk lihat detail di panel kanan
- **Delete**: Pilih table → tekan `Delete` atau `Backspace`
- **Fit View**: Tekan `F`

### 6. Export & Execute
- **Save Project**: Simpan design sebagai JSON
- **Load Project**: Load JSON project sebelumnya
- **Export SQL**: Download SQL file
- **Execute**: Run SQL ke database (butuh connection aktif)

---

## 🎨 Theme

**Mac Terminal Inspired Dark Theme**
- Background: Dark gray (#1e1e1e)
- Text: Light gray (#d4d4d4)
- Accents: Teal (#4ec9b0) & Blue (#569cd6)
- Font: SF Mono 11px

---

## ⚠️ Troubleshooting

**Modal tidak terlihat?**
- Refresh browser (Cmd+R)

**Connection gagal?**
- Pastikan MySQL/MariaDB sudah running
- Cek username/password benar
- Cek database exist

**Port sudah dipakai?**
- Backend: Edit `backend/.env` → ubah PORT
- Frontend: Edit `frontend/vite.config.js` → ubah port

---

## 🛑 Stop Aplikasi

```bash
# Kill processes
pkill -f nodemon
pkill -f vite
```

## 🔄 Restart Aplikasi

```bash
cd /Users/macbook/Documents/Project/zxwdb
npm run dev
```

---

## 📁 Project Structure

```
zxwdb/
├── backend/           → API Server (Port 3001)
├── frontend/          → React App (Port 5173)
├── FEATURES.md        → List semua fitur
├── README.md          → Documentation
└── START.md           → This file
```

---

## ✨ Features Available

✅ Connect to MySQL/MariaDB
✅ Import existing schema
✅ Add new tables visually
✅ ERD & LRS view modes
✅ Drag & drop tables
✅ Draw relationships
✅ Search tables
✅ Table details panel
✅ Save/Load projects
✅ Export SQL
✅ Execute SQL to database
✅ Keyboard shortcuts
✅ Toast notifications

---

**Enjoy designing your database! 🎉**
