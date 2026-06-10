import { useState } from 'react';
import { X, Database, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export default function CreateDatabaseModal({ onClose, onSuccess, connectionConfig }) {
  const [dbName, setDbName] = useState('');
  const [charset, setCharset] = useState('utf8mb4');
  const [collation, setCollation] = useState('utf8mb4_unicode_ci');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!dbName.trim()) {
      setError('Database name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/database/create`, {
        host: connectionConfig?.host || 'localhost',
        port: connectionConfig?.port || 3306,
        user: connectionConfig?.user || 'root',
        password: connectionConfig?.password || '',
        dbName: dbName.trim(),
        charset,
        collation
      });

      if (response.data.success) {
        onSuccess(dbName.trim());
      } else {
        setError(response.data.error || 'Failed to create database');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create database');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#4ec9b0]" />
            <h2 className="text-sm font-semibold text-[#d4d4d4] font-mono">Create New Database</h2>
          </div>
          <button onClick={onClose} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Database Name
            </label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="mydb"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Character Set
            </label>
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
            >
              <option value="utf8mb4">utf8mb4</option>
              <option value="utf8">utf8</option>
              <option value="latin1">latin1</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Collation
            </label>
            <select
              value={collation}
              onChange={(e) => setCollation(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
            >
              <option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci</option>
              <option value="utf8mb4_general_ci">utf8mb4_general_ci</option>
              <option value="utf8_unicode_ci">utf8_unicode_ci</option>
              <option value="utf8_general_ci">utf8_general_ci</option>
              <option value="latin1_swedish_ci">latin1_swedish_ci</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded border bg-[#f48771] bg-opacity-10 border-[#f48771] text-[#f48771] text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono text-[#d4d4d4]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !dbName.trim()}
            className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs font-medium"
          >
            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Database
          </button>
        </div>
      </div>
    </div>
  );
}
