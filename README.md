# zxwdb

Visual Database Designer & Query Builder for MySQL/MariaDB

## Features

- 🎨 Draw.io-like canvas interface for database design
- 🔄 ERD (Entity Relationship Diagram) visualization
- 📊 LRS (Logical Relational Schema) detailed view
- 🔌 Connect to local/remote MySQL/MariaDB databases
- 📥 Import existing database schemas (reverse engineering)
- 📤 Export SQL scripts and generate migrations
- ⚡ Real-time visual design to SQL conversion

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL or MariaDB installed locally or accessible remotely

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd zxwdb

# Install all dependencies
npm run install:all
```

### Running the Application

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
dbcanvas/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── src/
│   └── package.json
└── package.json       # Root package for scripts
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- ReactFlow (canvas visualization)
- TailwindCSS (styling)
- Zustand (state management)
- Axios (API calls)

### Backend
- Node.js + Express
- mysql2 (MySQL driver)
- CORS enabled for local development

## License

MIT
