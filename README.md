# zxwdb - Visual Database Designer

🎨 Professional visual database designer for MySQL/MariaDB with modern Mac Terminal-inspired interface.

[![npm version](https://img.shields.io/npm/v/@fiqihbadrian/zxwdb.svg)](https://www.npmjs.com/package/@fiqihbadrian/zxwdb)
[![GitHub](https://img.shields.io/badge/github-fiqihbadrian%2Fzxwdb-blue)](https://github.com/fiqihbadrian/zxwdb)

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

That's it! The server will start automatically and your browser will open.

---

## 📖 How to Use

### 1. Start the Application

```bash
zxwdb
```

**Interactive Menu:**
- ☆ Open in Browser
- ☆ View Server Info
- ☆ View Documentation
- ☆ Restart Server
- ☆ Stop & Exit

### 2. Access the Web Interface

**Local Access:**
```
http://localhost:3001
```

**Network Access (from other devices):**
```
http://[your-ip]:3001
```

### 3. Connect to Database

1. Click "Connect to Database"
2. Enter your database credentials:
   - Host (e.g., `localhost`)
   - Port (e.g., `3306`)
   - Username
   - Password
3. Click "Connect"

### 4. Select or Create Database

- **Browse existing databases** - Select from dropdown
- **Create new database** - Click "Create Database"

### 5. Design Your Database

**Import Existing Schema:**
- Click "Import Schema" to load tables from your database
- Relationships are auto-detected from foreign keys

**Create New Tables:**
- Click "+ New Table" or press `Cmd/Ctrl+N`
- Define columns, primary keys, data types
- Save directly to database

**Visual Relationships:**
- Drag from one column to another to create relationships
- Choose "Visual Only" or "Create FK Constraint"
- Delete relationships by dragging to empty space

**Edit Tables:**
- Double-click any table to edit structure
- Add/remove/modify columns
- Changes save automatically to database

**Browse Data:**
- Click "Browse Data" or press `Cmd/Ctrl+B`
- View, insert, edit, delete records
- Run queries and test relationships

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New Table |
| `Cmd/Ctrl + B` | Browse Data |
| `Cmd/Ctrl + P` | Preview SQL |
| `Cmd/Ctrl + K` | Quick Search |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `F` | Fit View |
| `Delete` | Delete Selected |
| `ESC` | Close/Cancel |
| `Hold Cmd/Ctrl` | Show All Shortcuts |

---

## ✨ Features

### Visual Database Design
- 🎨 Drag-and-drop table designer
- 🔄 Auto-detect relationships from foreign keys
- 📊 ERD (Entity Relationship Diagram) view
- 🔗 Column-level relationship connections
- ⚡ Real-time schema updates

### Database Operations
- 💾 Auto-save to database (no manual save needed)
- 🔍 Browse and edit table data
- 📝 Run SQL queries
- 🔐 Foreign key constraint management
- 📊 View relationship cardinality

### Modern UX
- 🎯 Mac Terminal color scheme (dark mode)
- ⌨️ Professional keyboard shortcuts
- 🔔 Toast notifications for all operations
- ↩️ Undo/Redo support
- 🔍 Quick table search

### CLI Features
- 🚀 Auto-start server
- 🎛️ Interactive menu
- 🌐 Network accessible
- 🔄 Restart without exit
- 📚 Built-in documentation

---

## 🔧 Configuration

### Port Configuration

By default, zxwdb uses port 3001. If the port is already in use, it will automatically find the next available port.

**Custom Port:**
```bash
PORT=3002 zxwdb
```

### Database Connection

Connections are session-based and cleared when you close the browser tab (for security).

---

## 🛠️ Troubleshooting

### Port Already in Use

zxwdb automatically detects and uses an available port. If you see a warning:
```
⚠️  Port 3001 in use, using port 3002 instead
```

This is normal! Just use the displayed port number.

### Can't Connect to Database

1. Check database is running:
   ```bash
   mysql -u root -p
   ```

2. Verify credentials (host, port, username, password)

3. Ensure MySQL/MariaDB allows remote connections if accessing from network

### Server Won't Start

1. Check Node.js version:
   ```bash
   node --version  # Should be >= 14.0.0
   ```

2. Reinstall package:
   ```bash
   npm uninstall -g @fiqihbadrian/zxwdb
   npm install -g @fiqihbadrian/zxwdb
   ```

---

## 📦 Update

Check for updates:
```bash
npm outdated -g
```

Update to latest version:
```bash
npm update -g @fiqihbadrian/zxwdb
```

Or reinstall:
```bash
npm install -g @fiqihbadrian/zxwdb@latest
```

---

## 📋 Requirements

- **Node.js** >= 14.0.0
- **MySQL** >= 5.7 or **MariaDB** >= 10.2
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 🌟 Use Cases

- **Database Design** - Visual schema planning
- **Reverse Engineering** - Import and visualize existing databases
- **Documentation** - Generate ERD diagrams
- **Development** - Quick database prototyping
- **Learning** - Understand database relationships
- **Data Management** - Browse and edit data

---

## 🔐 Security

- Connections are session-based (auto-logout on tab close)
- Database credentials not stored permanently
- Local-first design (your data stays on your machine)
- Network binding optional (access from other devices)

---

## 📄 License

MIT © Fiqih Badrian

---

## 🐛 Report Issues

Found a bug or have a feature request?

**GitHub Issues:** https://github.com/fiqihbadrian/zxwdb/issues

---

## 💬 Support

Need help? Have questions?

- 📖 Run `zxwdb` → Choose "View Documentation"
- 🐛 Report issues on GitHub
- 📧 Contact: [your-email@example.com]

---

## 🎉 Quick Example

```bash
# 1. Install
npm install -g @fiqihbadrian/zxwdb

# 2. Run
zxwdb

# 3. Browser opens automatically
# 4. Connect to your MySQL/MariaDB database
# 5. Start designing!
```

---

**Made with ❤️ by Fiqih Badrian**

**Enjoy designing databases visually!** 🚀
