const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (production)
const frontendPath = path.join(__dirname, '..', 'public');
app.use(express.static(frontendPath));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'zxwdb Backend is running' });
});

// Import routes
const dbRoutes = require('./routes/database');
const schemaRoutes = require('./routes/schema');
const dataRoutes = require('./routes/data');
const queryRoutes = require('./routes/query');

app.use('/api/database', dbRoutes);
app.use('/api/schema', schemaRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/query', queryRoutes);

// Serve frontend for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 zxwdb running on http://localhost:${PORT}`);
  console.log(`📡 Network access enabled on port ${PORT}`);
});
