import axios from 'axios';

const API_BASE_URL = '/api';

export const databaseAPI = {
  testConnection: async (config) => {
    const response = await axios.post(`${API_BASE_URL}/database/test`, config);
    return response.data;
  },

  connect: async (connectionId, config) => {
    const response = await axios.post(`${API_BASE_URL}/database/connect`, {
      connectionId,
      ...config
    });
    return response.data;
  },

  disconnect: async (connectionId) => {
    const response = await axios.post(`${API_BASE_URL}/database/disconnect`, {
      connectionId
    });
    return response.data;
  },

  listDatabases: async (host, port, user, password) => {
    const response = await axios.get(`${API_BASE_URL}/database/list`, {
      params: { host, port, user, password }
    });
    return response.data;
  },
};

export const schemaAPI = {
  getTables: async (connectionId) => {
    const response = await axios.get(`${API_BASE_URL}/schema/tables/${connectionId}`);
    return response.data;
  },

  getTable: async (connectionId, tableName) => {
    const response = await axios.get(`${API_BASE_URL}/schema/table/${connectionId}/${tableName}`);
    return response.data;
  },

  getCompleteSchema: async (connectionId) => {
    const response = await axios.get(`${API_BASE_URL}/schema/complete/${connectionId}`);
    return response.data;
  },

  executeQuery: async (connectionId, sql) => {
    const response = await axios.post(`${API_BASE_URL}/schema/query/${connectionId}`, { sql });
    return response.data;
  },

  generateSQL: async (tables) => {
    const response = await axios.post(`${API_BASE_URL}/schema/generate-sql`, { tables });
    return response.data;
  }
};
