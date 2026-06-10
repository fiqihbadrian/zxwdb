# zxwdb - Features Overview

## ✅ Implemented Features

### 🎨 UI/UX
- **Mac Terminal Theme**: Dark theme inspired by macOS Terminal with SF Mono font
- **Responsive Layout**: Header, Sidebar, Canvas, and Details Panel
- **Smooth Animations**: Toast notifications with slide-in effect
- **Keyboard Shortcuts**: 
  - `Delete/Backspace`: Delete selected table
  - `F`: Fit view to canvas

### 🗄️ Database Connection
- **Connect to MySQL/MariaDB**: Local or remote databases
- **Test Connection**: Verify credentials before connecting
- **Connection Status**: Real-time connection indicator
- **Import Existing Schema**: Reverse engineering from database

### 📊 Visual Design
- **Canvas Interface**: Drag-and-drop tables on canvas
- **ERD Mode**: Entity Relationship Diagram view (simplified)
- **LRS Mode**: Logical Relational Schema view (detailed with types)
- **ReactFlow Integration**: Zoom, pan, minimap, controls
- **Table Nodes**: Custom table cards showing columns and keys
- **Relationships**: Draw connections between tables
- **Visual Feedback**: Selected tables highlighted

### 🔧 Table Management
- **Add New Table**: Modal form to create tables with columns
- **Column Configuration**: 
  - Name, Type, Length
  - Primary Key, NOT NULL, Auto Increment
  - Multiple data types (INT, VARCHAR, TEXT, etc.)
- **Delete Table**: Remove tables from design
- **Table Search**: Filter tables by name
- **Table Details Panel**: View detailed info when table selected

### 💾 Project Management
- **Save Project**: Export design as JSON file
- **Load Project**: Import previously saved projects
- **Export SQL**: Generate CREATE TABLE statements
- **Execute SQL**: Run generated SQL on connected database

### 📋 Other Features
- **Sidebar**: Table list with search and statistics
- **Toolbar**: Quick access to view modes and actions
- **Toast Notifications**: Success/error messages
- **Column Statistics**: Total tables and columns count

---

## 🚀 Tech Stack

**Frontend:**
- React 18
- ReactFlow (canvas)
- Zustand (state)
- TailwindCSS
- Axios
- Lucide Icons
- Vite

**Backend:**
- Node.js
- Express
- mysql2
- CORS

---

## 📍 Current Status

**Ready for use:**
- ✅ Connect to database
- ✅ Import existing schema
- ✅ Design new tables visually
- ✅ Save/Load projects
- ✅ Export SQL
- ✅ Execute SQL to database

**Known Limitations:**
- Relationships are visual only (not included in SQL export yet)
- No edit table feature (delete & recreate workaround)
- No data viewer/editor
- No migration system
- Single user (no authentication)

---

## 🎯 How to Use

1. **Start the app**: `npm run dev` (from root folder)
2. **Connect**: Click "Connect to Database" and enter MySQL credentials
3. **Import or Design**:
   - Import existing schema automatically, or
   - Click "Add Table" to create new tables
4. **Visualize**: Switch between ERD/LRS modes
5. **Export**: Click "Export SQL" to download schema
6. **Execute**: Click "Execute" to create tables in database
7. **Save**: Click "Save" to export project as JSON

---

## 🌈 Theme Colors

**Mac Terminal Inspired:**
- Background: `#1e1e1e` (dark gray)
- Surface: `#2d2d2d` (medium gray)
- Border: `#3a3a3a` (light gray)
- Text: `#d4d4d4` (white-gray)
- Dim Text: `#808080` (gray)
- Accent 1: `#4ec9b0` (teal)
- Accent 2: `#569cd6` (blue)
- Success: `#89d185` (green)
- Error: `#f48771` (red)
- Warning: `#dcdcaa` (yellow)

**Font:**
- SF Mono, Monaco, Inconsolata
- Size: 11px (body), varies per component

---

Built with ❤️ for database designers
