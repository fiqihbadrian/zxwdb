import { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, LogOut, ChevronRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { databaseAPI, schemaAPI } from '../utils/api';
import CreateDatabaseModal from './CreateDatabaseModal';

export default function DatabaseSelectionPage() {
  const { connectionConfig, disconnect, setConnection, setCurrentDatabase, setSuccess, setError, connectionId, importSchema, clearHistory } = useAppStore();
  const [databases, setDatabases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDB, setShowCreateDB] = useState(false);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setIsLoading(true);
    try {
      const response = await databaseAPI.listDatabases(
        connectionConfig.host,
        connectionConfig.port,
        connectionConfig.user,
        connectionConfig.password
      );

      if (response.success) {
        setDatabases(response.databases);
      } else {
        setError('Failed to fetch databases: ' + response.error);
      }
    } catch (error) {
      setError('Failed to fetch databases: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDatabase = async (dbName) => {
    setIsLoading(true);
    try {
      // Connect to selected database
      const newConnectionId = `conn-${Date.now()}`;
      const config = {
        ...connectionConfig,
        database: dbName
      };

      const connectResponse = await databaseAPI.connect(newConnectionId, config);
      
      if (connectResponse.success) {
        // Import schema
        const schemaResponse = await schemaAPI.getCompleteSchema(newConnectionId);
        
        if (schemaResponse.success && schemaResponse.schema) {
          // Use importSchema to properly parse foreign keys and create relationships
          setConnection(newConnectionId, config);
          setCurrentDatabase(dbName); // Set current database
          clearHistory(); // Clear undo/redo history when switching database
          importSchema(schemaResponse.schema);
          setSuccess(`Connected to database "${dbName}" with ${schemaResponse.schema.length} tables`);
        }
      } else {
        setError('Failed to connect: ' + connectResponse.error);
      }
    } catch (error) {
      setError('Failed to connect: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDBSuccess = (dbName) => {
    setShowCreateDB(false);
    fetchDatabases();
    setSuccess(`Database "${dbName}" created successfully`);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="bg-[#2d2d2d] border-b border-[#3a3a3a] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-[#d4d4d4] mb-1">Select Database</h1>
              <p className="text-xs text-[#808080] font-mono">
                Connected to {connectionConfig?.host}:{connectionConfig?.port} as {connectionConfig?.user}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] text-xs font-mono text-[#d4d4d4] flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateDB(true)}
              className="px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] text-xs font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Database
            </button>
            <button
              onClick={fetchDatabases}
              disabled={isLoading}
              className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] disabled:opacity-50 text-xs font-mono text-[#d4d4d4] flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Database List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-[#808080] animate-spin mx-auto mb-2" />
              <p className="text-sm text-[#808080] font-mono">Loading databases...</p>
            </div>
          ) : databases.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-[#3a3a3a] mx-auto mb-4" />
              <p className="text-sm text-[#808080] font-mono mb-4">No databases found</p>
              <button
                onClick={() => setShowCreateDB(true)}
                className="px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] text-xs font-medium"
              >
                Create Your First Database
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {databases.map((db) => (
                <button
                  key={db}
                  onClick={() => handleSelectDatabase(db)}
                  className="p-4 bg-[#2d2d2d] border border-[#3a3a3a] rounded hover:border-[#4ec9b0] transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-[#569cd6]" />
                      <span className="text-sm font-mono text-[#d4d4d4] group-hover:text-[#4ec9b0]">
                        {db}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#808080] group-hover:text-[#4ec9b0]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Database Modal */}
      {showCreateDB && (
        <CreateDatabaseModal
          onClose={() => setShowCreateDB(false)}
          onSuccess={handleCreateDBSuccess}
          connectionConfig={connectionConfig}
        />
      )}
    </div>
  );
}
