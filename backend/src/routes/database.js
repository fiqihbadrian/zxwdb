const express = require('express');
const router = express.Router();
const dbConnection = require('../config/database');

// List all databases
router.get('/list', async (req, res) => {
  try {
    const { host, port, user, password } = req.query;

    // Create temporary connection without database
    const tempConnectionId = `temp-${Date.now()}`;
    const tempConfig = {
      host: host || 'localhost',
      port: port || 3306,
      user,
      password
    };

    await dbConnection.createConnection(tempConnectionId, tempConfig);

    // Get list of databases
    const databases = await dbConnection.query(tempConnectionId, 'SHOW DATABASES');

    // Close temporary connection
    dbConnection.closeConnection(tempConnectionId);

    // Filter out system databases (optional)
    const userDatabases = databases
      .map(row => row.Database)
      .filter(db => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db));

    res.json({ success: true, databases: userDatabases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new database
router.post('/create', async (req, res) => {
  try {
    const { host, port, user, password, dbName, charset = 'utf8mb4', collation = 'utf8mb4_unicode_ci' } = req.body;

    // Create temporary connection without database
    const tempConnectionId = `temp-${Date.now()}`;
    const tempConfig = {
      host: host || 'localhost',
      port: port || 3306,
      user,
      password
    };

    await dbConnection.createConnection(tempConnectionId, tempConfig);

    // Create database
    await dbConnection.query(
      tempConnectionId,
      `CREATE DATABASE \`${dbName}\` CHARACTER SET ${charset} COLLATE ${collation}`
    );

    // Close temporary connection
    dbConnection.closeConnection(tempConnectionId);

    res.json({ success: true, message: `Database "${dbName}" created successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test database connection
router.post('/test', async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;
    const result = await dbConnection.testConnection({
      host,
      port,
      user,
      password,
      database
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to database
router.post('/connect', async (req, res) => {
  try {
    const { connectionId, host, port, user, password, database } = req.body;
    const result = await dbConnection.connect(connectionId, {
      host,
      port,
      user,
      password,
      database
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disconnect from database
router.post('/disconnect', async (req, res) => {
  try {
    const { connectionId } = req.body;
    await dbConnection.disconnect(connectionId);
    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all databases
router.get('/list/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const databases = await dbConnection.query(connectionId, 'SHOW DATABASES');
    res.json({ success: true, databases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
