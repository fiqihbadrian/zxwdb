const mysql = require('mysql2/promise');

class DatabaseConnection {
  constructor() {
    this.connections = new Map();
  }

  async connect(connectionId, config) {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database
      });

      this.connections.set(connectionId, connection);
      return { success: true, message: 'Connected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Alias for connect (used in new endpoints)
  async createConnection(connectionId, config) {
    return await this.connect(connectionId, config);
  }

  // Close and remove connection
  async closeConnection(connectionId) {
    return await this.disconnect(connectionId);
  }

  async testConnection(config) {
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port || 3306,
        user: config.user,
        password: config.password,
        database: config.database
      });

      await connection.ping();
      await connection.end();
      return { success: true, message: 'Connection test successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getConnection(connectionId) {
    return this.connections.get(connectionId);
  }

  async disconnect(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      await connection.end();
      this.connections.delete(connectionId);
    }
  }

  async query(connectionId, sql, params = []) {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }
    
    // For DDL statements (CREATE, ALTER, DROP, etc.), use query() instead of execute()
    // because MySQL doesn't support prepared statements for DDL
    const isDDL = /^\s*(CREATE|ALTER|DROP|RENAME|TRUNCATE)/i.test(sql);
    
    if (isDDL || params.length === 0) {
      // Use query() for DDL or when no params
      const [rows] = await connection.query(sql);
      return rows;
    } else {
      // Use execute() for DML with params (SELECT, INSERT, UPDATE, DELETE)
      const [rows] = await connection.execute(sql, params);
      return rows;
    }
  }
}

module.exports = new DatabaseConnection();
