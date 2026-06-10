const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all rows from a table with pagination
router.get('/:connectionId/:tableName', async (req, res) => {
  const { connectionId, tableName } = req.params;
  const { page = 1, limit = 50, orderBy = '', orderDir = 'ASC' } = req.query;
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const offset = (page - 1) * limit;
    
    // Build ORDER BY clause
    let orderClause = '';
    if (orderBy) {
      const direction = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderClause = ` ORDER BY \`${orderBy}\` ${direction}`;
    }
    
    // Get total count
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM \`${tableName}\``
    );
    const total = countResult[0].total;
    
    // Get paginated data
    const [rows] = await connection.query(
      `SELECT * FROM \`${tableName}\`${orderClause} LIMIT ${limit} OFFSET ${offset}`
    );
    
    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Insert a new row
router.post('/:connectionId/:tableName', async (req, res) => {
  const { connectionId, tableName } = req.params;
  const rowData = req.body;
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const columns = Object.keys(rowData);
    const values = Object.values(rowData);
    const placeholders = values.map(() => '?').join(', ');
    
    const sql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
    
    const [result] = await connection.execute(sql, values);
    
    res.json({
      success: true,
      insertId: result.insertId,
      message: 'Row inserted successfully'
    });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a row
router.put('/:connectionId/:tableName', async (req, res) => {
  const { connectionId, tableName } = req.params;
  const { where, data } = req.body; // where: {column: value}, data: {column: value}
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const setClause = Object.keys(data).map(key => `\`${key}\` = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `\`${key}\` = ?`).join(' AND ');
    
    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(where)];
    
    const [result] = await connection.execute(sql, values);
    
    res.json({
      success: true,
      affectedRows: result.affectedRows,
      message: 'Row updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a row
router.delete('/:connectionId/:tableName', async (req, res) => {
  const { connectionId, tableName } = req.params;
  const where = req.body; // {column: value}
  
  try {
    const connection = db.getConnection(connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const whereClause = Object.keys(where).map(key => `\`${key}\` = ?`).join(' AND ');
    const sql = `DELETE FROM \`${tableName}\` WHERE ${whereClause}`;
    const values = Object.values(where);
    
    const [result] = await connection.execute(sql, values);
    
    res.json({
      success: true,
      affectedRows: result.affectedRows,
      message: 'Row deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
