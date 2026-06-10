# zxwdb - Quick Start Guide

## 🚀 Cara Menjalankan Aplikasi

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend akan jalan di: **http://localhost:3001**

### 2. Start Frontend (Terminal Baru)

```bash
cd frontend
npm run dev
```

Frontend akan jalan di: **http://localhost:5173**

### 3. Atau Jalankan Sekaligus (dari root folder)

```bash
npm run dev
```

Ini akan menjalankan backend dan frontend bersamaan.

---

## 📋 Prerequisites

- **Node.js** v18 atau lebih baru
- **MySQL** atau **MariaDB** (harus sudah installed dan running)
- **npm** (terinstall otomatis dengan Node.js)

---

## ✅ Testing Connection

1. Buka browser: http://localhost:5173
2. Klik "Connect to Database"
3. Isi credentials MySQL kamu:
   - Host: `localhost`
   - Port: `3306`
   - User: `root` (atau username kamu)
   - Password: (password MySQL kamu)
   - Database: nama database yang sudah ada

4. Klik "Test Connection" untuk test
5. Klik "Connect & Import" untuk import schema

---

## 🎨 Features

### ✨ Yang Sudah Jadi:

- ✅ **Database Connection**: Connect ke MySQL/MariaDB local atau remote
- ✅ **Import Schema**: Reverse engineering dari database existing
- ✅ **Visual Canvas**: Draw.io-like interface dengan ReactFlow
- ✅ **ERD View**: Entity Relationship Diagram (simplified)
- ✅ **LRS View**: Logical Relational Schema (detailed dengan types)
- ✅ **Table List**: Sidebar dengan list semua tables
- ✅ **Drag & Drop**: Move tables di canvas
- ✅ **Mini Map**: Navigation helper
- ✅ **SQL Generator**: Generate CREATE TABLE statements

### 🚧 Yang Belum (Next Steps):

- ⏳ Add new table from UI
- ⏳ Edit table columns
- ⏳ Create relationships via drawing lines
- ⏳ Export SQL to file
- ⏳ Save/Load project
- ⏳ Generate migrations
- ⏳ Execute SQL to database

---

## 🏗️ Project Structure

```
zxwdb/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.js        # Main server
│   │   ├── config/
│   │   │   └── database.js # Database connection manager
│   │   └── routes/
│   │       ├── database.js # Connection routes
│   │       └── schema.js   # Schema import/export routes
│   └── package.json
│
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   ├── components/
│   │   │   ├── Canvas.jsx          # ReactFlow canvas
│   │   │   ├── ConnectionModal.jsx # DB connection form
│   │   │   ├── Sidebar.jsx         # Table list sidebar
│   │   │   ├── TableNode.jsx       # Custom table node
│   │   │   └── Toolbar.jsx         # Top toolbar
│   │   ├── stores/
│   │   │   └── appStore.js         # Zustand state management
│   │   └── utils/
│   │       └── api.js              # API calls to backend
│   └── package.json
│
└── package.json             # Root package (run both)
```

---

## 🔧 Troubleshooting

### Backend tidak connect ke MySQL?

Pastikan MySQL/MariaDB sudah running:

```bash
# Mac (via Homebrew)
brew services start mysql

# Check status
mysql -u root -p
```

### Port sudah dipakai?

Edit file `backend/.env`:
```
PORT=3002
```

Dan update `frontend/vite.config.js` proxy target ke port yang baru.

### Frontend tidak bisa hit API?

Pastikan backend sudah running di port 3001.

---

## 📦 Dependencies

### Backend:
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **mysql2**: MySQL driver dengan Promise support
- **dotenv**: Environment variables

### Frontend:
- **react**: UI library
- **reactflow**: Canvas/diagram library
- **zustand**: State management
- **axios**: HTTP client
- **tailwindcss**: CSS framework
- **lucide-react**: Icon library

---

## 🎯 Next Development Tasks

1. **Add Table Creator**: Form untuk buat table baru
2. **Column Editor**: CRUD untuk columns
3. **Relationship Drawing**: Drag line antar tables untuk create FK
4. **SQL Export**: Download SQL file
5. **Execute to DB**: Apply changes ke database
6. **Project Save/Load**: Simpan design sebagai JSON

---

## 📝 Notes

- Tool ini untuk **local development** dulu
- Belum ada authentication (single user)
- Database credentials disimpan di memory (tidak persistent)
- Cocok untuk prototyping dan database design

---

Selamat mencoba! 🎉
