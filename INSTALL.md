# zxwdb Installation Guide

## 🚀 Quick Start

### Option 1: Install from npm (After Publishing)

```bash
# Install globally
npm install -g zxwdb

# Run zxwdb
zxwdb

# Access via browser
# Local:   http://localhost:3001
# Network: http://192.168.x.x:3001
```

### Option 2: Local Installation for Testing

```bash
# Clone or navigate to project directory
cd /path/to/zxwdb

# Install dependencies
npm run install:all

# Build frontend
npm run build

# Link globally (requires sudo on some systems)
sudo npm link

# Run zxwdb
zxwdb
```

### Option 3: Development Mode

```bash
# Run both frontend and backend separately (for development)
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

## 📦 Publishing to npm

```bash
# Login to npm
npm login

# Publish package
npm publish

# Users can now install:
# npm install -g zxwdb
```

## 🌐 Network Access

When you run `zxwdb`, it will show:

```
✅ zxwdb is running!

🌐 Access URLs:
   Local:   http://localhost:3001
   Network: http://192.168.x.x:3001
```

Anyone on your local network can access zxwdb using the Network URL!

## 🛠️ How It Works

1. **Single Command**: `zxwdb` starts both frontend and backend
2. **Single Server**: Backend serves frontend static files + API routes
3. **Single Port**: Everything runs on port 3001
4. **Network Accessible**: Bound to 0.0.0.0 for network access

## 🔧 Configuration

Edit `backend/.env` to configure database connection defaults:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
```

## 📚 Features

- ✅ Visual database designer (ERD/LRS)
- ✅ Auto-detect FK relationships
- ✅ CRUD operations on table data
- ✅ JOIN and aggregation queries
- ✅ Keyboard shortcuts (Hold Cmd/Ctrl to see all)
- ✅ Auto-save to database
- ✅ Undo/redo support
- ✅ Network accessible (like router admin interface)

## 🛑 Stop Server

Press `Ctrl+C` in the terminal where zxwdb is running.

## 📝 Requirements

- Node.js >= 14.0.0
- MySQL or MariaDB server
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

### Cannot access from other devices

- Make sure firewall allows port 3001
- Check if your local network allows device-to-device communication
- Use the Network IP shown when starting zxwdb

### Build failed

```bash
# Clean and rebuild
rm -rf backend/public
npm run build
```

## 📖 Documentation

After starting zxwdb, click the **"Docs"** button in the top navbar for comprehensive documentation on how to use all features.

---

**zxwdb** - Visual Database Designer for MySQL/MariaDB
