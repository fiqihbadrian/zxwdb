const express = require('express');
const router = express.Router();
const dbConnection = require('../config/database');

// Get all tables from database
router.get('/tables/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const tables = await dbConnection.query(connectionId, 'SHOW TABLES');
    res.json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get table structure
router.get('/table/:connectionId/:tableName', async (req, res) => {
  try {
    const { connectionId, tableName } = req.params;
    
    // Get columns
    const columns = await dbConnection.query(
      connectionId, 
      `DESCRIBE \`${tableName}\``
    );
    
    // Get foreign keys
    const foreignKeys = await dbConnection.query(
      connectionId,
      `SELECT 
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [tableName]
    );
    
    // Get indexes
    const indexes = await dbConnection.query(
      connectionId,
      `SHOW INDEX FROM \`${tableName}\``
    );
    
    res.json({ 
      success: true, 
      table: {
        name: tableName,
        columns,
        foreignKeys,
        indexes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get complete database schema (for reverse engineering)
router.get('/complete/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    // Get all TABLES only (exclude views) using INFORMATION_SCHEMA
    const tablesResult = await dbConnection.query(
      connectionId,
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`
    );
    
    const tableNames = tablesResult.map(row => row.TABLE_NAME);
    
    const schema = [];
    const errors = [];
    
    for (const tableName of tableNames) {
      try {
        // Get columns
        const columns = await dbConnection.query(
          connectionId,
          `DESCRIBE \`${tableName}\``
        );
        
        // Get foreign keys
        const foreignKeys = await dbConnection.query(
          connectionId,
          `SELECT 
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME,
            CONSTRAINT_NAME
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND REFERENCED_TABLE_NAME IS NOT NULL`,
          [tableName]
        );
        
        schema.push({
          name: tableName,
          columns,
          foreignKeys
        });
      } catch (error) {
        // Skip problematic tables/views but log the error
        console.error(`Error processing table ${tableName}:`, error.message);
        errors.push({ table: tableName, error: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      schema,
      ...(errors.length > 0 && { skipped: errors })
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute custom SQL query
router.post('/query/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { sql } = req.body;
    
    const result = await dbConnection.query(connectionId, sql);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute SQL statements (for auto-save)
router.post('/execute', async (req, res) => {
  try {
    const { connectionId, sql } = req.body;
    
    if (!connectionId) {
      return res.status(400).json({ success: false, error: 'connectionId is required' });
    }
    
    if (!sql) {
      return res.status(400).json({ success: false, error: 'sql is required' });
    }
    
    console.log('Executing SQL:', sql);
    
    // Split multiple statements by semicolon and execute each
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const results = [];
    
    for (const statement of statements) {
      const result = await dbConnection.query(connectionId, statement);
      results.push(result);
    }
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Execute SQL error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate SQL from schema design
router.post('/generate-sql', async (req, res) => {
  try {
    const { tables } = req.body;
    const sqlStatements = [];
    
    // Generate CREATE TABLE statements
    tables.forEach(table => {
      let sql = `CREATE TABLE \`${table.name}\` (\n`;
      
      const columnDefs = table.columns.map(col => {
        let def = `  \`${col.name}\` ${col.type}`;
        if (col.length) def += `(${col.length})`;
        if (col.notNull) def += ' NOT NULL';
        if (col.autoIncrement) def += ' AUTO_INCREMENT';
        if (col.unique) def += ' UNIQUE';
        if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
        return def;
      });
      
      sql += columnDefs.join(',\n');
      
      // Add primary key
      const primaryKeys = table.columns.filter(col => col.primaryKey);
      if (primaryKeys.length > 0) {
        const pkNames = primaryKeys.map(col => `\`${col.name}\``).join(', ');
        sql += `,\n  PRIMARY KEY (${pkNames})`;
      }
      
      sql += '\n);';
      sqlStatements.push(sql);
    });
    
    // Generate ALTER TABLE for foreign keys
    tables.forEach(table => {
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          const sql = `ALTER TABLE \`${table.name}\` ADD CONSTRAINT \`${fk.name}\` FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.referencedTable}\`(\`${fk.referencedColumn}\`);`;
          sqlStatements.push(sql);
        });
      }
    });
    
    res.json({ success: true, sql: sqlStatements.join('\n\n') });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
