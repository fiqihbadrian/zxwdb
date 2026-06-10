# ZxwDB - Visual Database Designer & Query Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Compatible-blue)](https://www.mysql.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-Compatible-blue)](https://mariadb.org/)

**ZxwDB** is a powerful visual database designer and query builder for MySQL and MariaDB databases. Design your database schema visually with an intuitive drag-and-drop interface, similar to draw.io, and automatically generate SQL scripts.

![ZxwDB Visual Database Designer](https://via.placeholder.com/800x400?text=ZxwDB+Visual+Database+Designer)

## 🌟 Why ZxwDB?

- **Visual Database Design** - Design your database schema using an intuitive canvas interface
- **No SQL Knowledge Required** - Perfect for beginners and professionals alike
- **Real-time SQL Generation** - See SQL code generated as you design
- **Database Reverse Engineering** - Import and visualize existing database schemas
- **ERD & LRS Support** - Entity Relationship Diagrams and Logical Relational Schema views
- **Free & Open Source** - MIT licensed, use it anywhere

## ✨ Key Features

### 🎨 Visual Design Canvas
- **Draw.io-like Interface** - Familiar and easy to use canvas for database design
- **Drag & Drop Tables** - Create tables, columns, and relationships visually
- **Real-time Preview** - See your database structure as you build it
- **Zoom & Pan** - Navigate large database schemas with ease

### 🔄 Entity Relationship Diagram (ERD)
- **Visual Relationships** - See connections between tables clearly
- **Foreign Key Visualization** - Understand data relationships at a glance
- **Cardinality Indicators** - One-to-one, one-to-many, many-to-many relationships

### 📊 Logical Relational Schema (LRS)
- **Detailed Schema View** - See complete table definitions
- **Data Types & Constraints** - Define columns, primary keys, foreign keys, indexes
- **Normalization Support** - Design normalized database schemas

### 🔌 Database Connection
- **Local & Remote MySQL/MariaDB** - Connect to any MySQL or MariaDB database
- **Secure Connections** - Support for SSL/TLS connections
- **Multiple Databases** - Switch between different database connections

### 📥 Import & Export
- **Reverse Engineering** - Import existing database schemas automatically
- **SQL Script Export** - Generate CREATE TABLE statements
- **Migration Scripts** - Generate ALTER TABLE migration scripts
- **Schema Comparison** - Compare and sync database schemas

### ⚡ Real-time Features
- **Live SQL Preview** - See generated SQL as you design
- **Instant Validation** - Catch errors before deploying
- **Auto-save** - Never lose your work

## 🚀 Quick Start

### Prerequisites

Before installing ZxwDB, make sure you have:

- **Node.js** version 14.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **MySQL** or **MariaDB** database server ([MySQL Download](https://www.mysql.com/downloads/) | [MariaDB Download](https://mariadb.org/download/))
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/fiqihbadrian/ZxwDB.git
cd ZxwDB

# Install all dependencies (frontend + backend)
npm run install:all
```

### Running ZxwDB

```bash
# Start both frontend and backend servers
npm run dev
```

The application will start on:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### First Time Setup

1. Open http://localhost:5173 in your browser
2. Click "Connect Database" 
3. Enter your MySQL/MariaDB connection details:
   - Host: `localhost` (or your database server IP)
   - Port: `3306` (default MySQL/MariaDB port)
   - Username: your database username
   - Password: your database password
   - Database: your database name
4. Start designing your database!

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [Installation Guide](INSTALL.md) - Detailed installation instructions
- [Features Overview](FEATURES.md) - Complete feature documentation
- [Auto Update Feature](AUTO_UPDATE_FEATURE.md) - How auto-updates work
- [Getting Started Tutorial](START.md) - Step-by-step tutorial

## 💻 Project Structure

```
zxwdb/
├── frontend/              # React + TypeScript frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand state management
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   └── package.json
│
├── backend/              # Node.js + Express backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Data models
│   │   └── utils/       # Utility functions
│   └── package.json
│
├── bin/                  # CLI executable
├── scripts/              # Build and deployment scripts
├── README.md            # This file
└── package.json         # Root package configuration
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **ReactFlow** - Canvas and diagram visualization
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **Vite** - Fast frontend build tool

### Backend Technologies
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **mysql2** - MySQL client for Node.js
- **CORS** - Cross-origin resource sharing

## 🎯 Use Cases

### For Beginners
- Learn database design without writing SQL
- Understand table relationships visually
- Practice database normalization

### For Developers
- Rapid prototyping of database schemas
- Visualize existing database structures
- Generate migration scripts for version control
- Design databases for new projects

### For Database Administrators
- Document existing database schemas
- Plan database migrations
- Optimize database structure
- Create training materials

### For Teams
- Collaborate on database design
- Share visual database diagrams
- Standardize database design practices

## 📦 Building for Production

```bash
# Build optimized production version
npm run build

# The built application will be in backend/public/
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/fiqihbadrian/ZxwDB/issues).

## ⭐ Show Your Support

If you find ZxwDB helpful, please consider giving it a star on GitHub! It helps others discover the project.

## 📧 Contact

- **GitHub**: [@fiqihbadrian](https://github.com/fiqihbadrian)
- **Repository**: [ZxwDB](https://github.com/fiqihbadrian/ZxwDB)

## 🔗 Related Projects

- [MySQL Workbench](https://www.mysql.com/products/workbench/) - Official MySQL design tool
- [dbdiagram.io](https://dbdiagram.io/) - Online database diagram tool
- [DBeaver](https://dbeaver.io/) - Universal database tool

## 📊 Keywords

Database design, MySQL designer, MariaDB designer, visual database, ERD tool, database diagram, SQL generator, database modeling, schema designer, database visualization, open source database tool, free database designer, web-based database tool, database management, SQL builder, database reverse engineering

---

Made with ❤️ by [Fiqih Badrian](https://github.com/fiqihbadrian)
