const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Execute a custom SQL query (SELECT only for safety)
router.post('/execute/:connectionId', async (req, res) => {
  const { connectionId } = req.params;
  const { query } = req.body;
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Only allow SELECT queries for safety
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return res.status(400).json({ 
        error: 'Only SELECT queries are allowed in query runner. Use table operations for INSERT/UPDATE/DELETE.' 
      });
    }

    const startTime = Date.now();
    const [rows] = await connection.query(query);
    const executionTime = Date.now() - startTime;
    
    // Get column metadata
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    
    res.json({
      success: true,
      data: rows,
      columns,
      rowCount: rows.length,
      executionTime: `${executionTime}ms`
    });
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get suggested JOIN queries based on foreign keys
router.get('/suggestions/:connectionId', async (req, res) => {
  const { connectionId } = req.params;
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Get all foreign keys in the database
    const [fks] = await connection.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    // Generate JOIN query suggestions
    const suggestions = fks.map(fk => {
      const query = `SELECT 
  ${fk.TABLE_NAME}.*,
  ${fk.REFERENCED_TABLE_NAME}.*
FROM \`${fk.TABLE_NAME}\`
JOIN \`${fk.REFERENCED_TABLE_NAME}\`
  ON ${fk.TABLE_NAME}.\`${fk.COLUMN_NAME}\` = ${fk.REFERENCED_TABLE_NAME}.\`${fk.REFERENCED_COLUMN_NAME}\`
LIMIT 10;`;

      return {
        name: `${fk.TABLE_NAME} ⟶ ${fk.REFERENCED_TABLE_NAME}`,
        description: `Join ${fk.TABLE_NAME}.${fk.COLUMN_NAME} with ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`,
        query,
        fkConstraint: fk.CONSTRAINT_NAME
      };
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
