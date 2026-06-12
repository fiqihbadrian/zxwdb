# ZxwDB - Visual Database Designer & Query Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@fiqihbadrian/zxwdb.svg)](https://www.npmjs.com/package/@fiqihbadrian/zxwdb)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

**ZxwDB** is a powerful visual database designer and query builder for MySQL and MariaDB. Design your database schema visually with a drag-and-drop interface and execute SQL queries directly to your database.

---

## 🚀 Quick Start

### Installation

```bash
npm install -g @fiqihbadrian/zxwdb
```

### Run

```bash
zxwdb
```

Application will run on:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 🎯 Core Features

### 1. 🎨 Visual Database Design
- **ERD (Entity Relationship Diagram)** - Visualize table relationships
- **LRS (Logical Relational Schema)** - Detailed table structure view
- **Drag & Drop** - Design databases with an intuitive interface
- **Auto-arrange** - Automatically organize table layouts
- **Reverse Engineering** - Import and visualize existing databases

### 2. 💾 Database Management
- **Connect to MySQL/MariaDB** - Local or remote databases
- **Multi-database Support** - Switch between databases easily
- **Real-time Sync** - Changes saved directly to database
- **Browse Data** - View, edit, add, and delete table data
- **Foreign Key Management** - Manage table relationships

### 3. 🔧 SQL Editor with Real-time Console
- **Execute All SQL Types** - SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP
- **Real-time Console Output** - Query execution status with timestamps
- **Auto-save to Database** - Queries executed and saved immediately
- **Keyboard Shortcuts** - Ctrl/Cmd+Enter to run queries
- **Error Handling** - Clear and informative error messages
- **Execution Details** - Execution time, affected rows, insert ID
- **4 Message Types** - Success, Error, Warning, Info with color codes

### 4. 📦 Complete Database Export
- **Complete SQL Export** - CREATE TABLE + INSERT data + Foreign Keys
- **Include All Data** - All table data exported in INSERT statements
- **Foreign Key Constraints** - Table relationships included
- **One-click Download** - Download complete SQL file
- **Safe Re-import** - DROP IF EXISTS & FOREIGN_KEY_CHECKS
- **Production Ready** - Safe for database migration

### 5. ⚡ Table Operations
- **Add/Edit/Delete Tables** - Manage tables visually
- **Column Management** - Add, edit, delete columns
- **Primary/Foreign Keys** - Set primary key and foreign key constraints
- **Data Types** - Support all MySQL/MariaDB data types
- **Undo/Redo** - Ctrl+Z/Ctrl+Y for undo/redo changes

---

## 📖 How to Use

### 1. Connect to Database
- Click "Connect to Database"
- Enter MySQL/MariaDB credentials:
  - Host: `localhost` or server IP
  - Port: `3306` (default)
  - Username & Password
  - Database name
- Click Connect

### 2. Design Database
- **Add Table**: Click "Add Table" to create new table
- **Edit Table**: Double-click table to edit structure
- **Add Relationship**: Drag from foreign key column to primary key of another table
- **Browse Data**: Click "Browse Data" to view table contents

### 3. SQL Editor
- Click "SQL Editor" in toolbar
- Type SQL query (SELECT, INSERT, UPDATE, DELETE, etc.)
- Press `Ctrl+Enter` or click "Run Query"
- View results in Results panel
- View execution status in Console panel with timestamps

### 4. Export Complete Database
- Click "Preview SQL" in toolbar
- Complete SQL (structure + data + foreign keys) will be displayed
- Click "Download SQL File" to download
- Import SQL file to another database

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Run SQL Query |
| `Ctrl/Cmd + N` | Add New Table |
| `Ctrl/Cmd + B` | Browse Data |
| `Ctrl/Cmd + P` | Preview SQL |
| `Ctrl/Cmd + K` | Quick Search |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `ESC` | Close/Cancel |

---

## 💻 Technology Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, ReactFlow, Zustand
- **Backend**: Node.js, Express.js, mysql2
- **Build Tool**: Vite with Terser minification

---

## 🔒 Code Protection

This package uses advanced code protection:
- ✅ **Minified Production Build** - Code is heavily minified and optimized
- ✅ **Aggressive Compression** - 3-pass Terser compression with unsafe optimizations
- ✅ **Name Mangling** - All variable and function names obfuscated to single letters
- ✅ **Read-only in node_modules** - Files cannot be edited by users
- ✅ **MIT License** - Users must provide attribution

**Note**: Source code is protected using industry-standard minification techniques to make reverse engineering significantly more difficult.

---

## 📋 Requirements

- Node.js >= 14.0.0
- MySQL >= 5.7 or MariaDB >= 10.2
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## 🛠️ Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use, the application will notify you. Stop other services or change the port in configuration.

### Can't Connect to Database
1. Check database is running: `mysql -u root -p`
2. Verify credentials (host, port, username, password)
3. Ensure MySQL/MariaDB allows connections

### Server Won't Start
1. Check Node.js version: `node --version` (>= 14.0.0)
2. Reinstall: `npm install -g @fiqihbadrian/zxwdb`

---

## 📦 Update

Update to latest version:
```bash
npm update -g @fiqihbadrian/zxwdb
# or
npm install -g @fiqihbadrian/zxwdb@latest
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🐛 Issues & Support

Found a bug or need help?

**GitHub Issues**: https://github.com/fiqihbadrian/ZxwDB/issues

---

## ⭐ Features Highlight

✅ Visual database design with drag & drop  
✅ ERD & LRS views  
✅ SQL Editor with real-time console output  
✅ Complete database export (structure + data + foreign keys)  
✅ Browse, add, edit, delete table data  
✅ Reverse engineering from existing database  
✅ Multi-database support  
✅ Undo/Redo support  
✅ Keyboard shortcuts  
✅ Auto-save to database  
✅ Protected code with advanced minification  

---

**Made with ❤️ by [Fiqih Badrian](https://github.com/fiqihbadrian)**

**Repository**: https://github.com/fiqihbadrian/ZxwDB
