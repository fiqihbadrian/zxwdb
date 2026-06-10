import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { databaseAPI, schemaAPI } from '../utils/api';
import { useAppStore } from '../stores/appStore';
import CreateDatabaseModal from './CreateDatabaseModal';

export default function ConnectionModal({ onClose }) {
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showCreateDB, setShowCreateDB] = useState(false);
  const [isFetchingDatabases, setIsFetchingDatabases] = useState(false);
  const [databases, setDatabases] = useState([]);

  const { setConnection, importSchema, setLoading } = useAppStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setTestResult(null);
  };

  const handleCreateDBSuccess = (dbName) => {
    setFormData({ ...formData, database: dbName });
    setShowCreateDB(false);
    setTestResult({ success: true, message: `Database "${dbName}" created! Now click Connect.` });
  };

  const handleFetchDatabases = async () => {
    setIsFetchingDatabases(true);
    setTestResult(null);

    try {
      const response = await databaseAPI.listDatabases(
        formData.host,
        formData.port,
        formData.user,
        formData.password
      );

      if (response.success) {
        setDatabases(response.databases);
        setTestResult({ success: true, message: `Found ${response.databases.length} databases` });
      } else {
        setTestResult({ success: false, error: response.error });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setIsFetchingDatabases(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await databaseAPI.testConnection(formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connectionId = `conn-${Date.now()}`;
      const connectResult = await databaseAPI.connect(connectionId, formData);
      
      if (connectResult.success) {
        setConnection(connectionId, formData);
        
        // Import schema
        setLoading(true);
        const schemaResult = await schemaAPI.getCompleteSchema(connectionId);
        if (schemaResult.success) {
          importSchema(schemaResult.schema);
        }
        setLoading(false);
        
        onClose();
      } else {
        setTestResult(connectResult);
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <h2 className="text-sm font-semibold text-[#d4d4d4] font-mono">Connect to Database</h2>
          <button
            onClick={onClose}
            className="text-[#808080] hover:text-[#d4d4d4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Host
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="localhost"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Port
            </label>
            <input
              type="text"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="3306"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Username
            </label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="root"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="••••••••"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#d4d4d4] font-mono">
                Database
              </label>
              <button
                onClick={handleFetchDatabases}
                disabled={isFetchingDatabases || !formData.user}
                className="text-xs text-[#4ec9b0] hover:text-[#569cd6] font-mono disabled:opacity-50"
              >
                {isFetchingDatabases ? 'Loading...' : 'Browse Databases'}
              </button>
            </div>
            {databases.length > 0 ? (
              <select
                name="database"
                value={formData.database}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              >
                <option value="">-- Select Database --</option>
                {databases.map(db => (
                  <option key={db} value={db}>{db}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="database"
                value={formData.database}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
                placeholder="mydb or click Browse Databases"
              />
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded border text-xs font-mono ${
              testResult.success 
                ? 'bg-[#1e1e1e] text-[#89d185] border-[#89d185]' 
                : 'bg-[#1e1e1e] text-[#f48771] border-[#f48771]'
            }`}>
              <p>
                {testResult.success ? '✓ ' + testResult.message : '✗ ' + testResult.error}
              </p>
            </div>
          )}
          
          {/* Create Database Link */}
          <div className="text-center">
            <button
              onClick={() => setShowCreateDB(true)}
              className="text-xs text-[#4ec9b0] hover:text-[#569cd6] font-mono underline"
            >
              + Create New Database
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || isConnecting}
            className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-mono text-[#d4d4d4]"
          >
            {isTesting && <Loader2 className="w-4 h-4 animate-spin" />}
            Test Connection
          </button>
          <button
            onClick={handleConnect}
            disabled={isTesting || isConnecting}
            className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-medium"
          >
            {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
            {formData.database ? 'Connect & Import' : 'Connect'}
          </button>
        </div>
      </div>
      
      {/* Create Database Modal */}
      {showCreateDB && (
        <CreateDatabaseModal
          onClose={() => setShowCreateDB(false)}
          onSuccess={handleCreateDBSuccess}
          connectionConfig={formData}
        />
      )}
    </div>
  );
}
