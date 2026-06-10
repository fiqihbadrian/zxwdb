import { useState } from 'react';
import { X, Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { schemaAPI } from '../utils/api';
import { useAppStore } from '../stores/appStore';

export default function ExecuteSQLModal({ sql, onClose }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const { connectionId, setTables, setSuccess, setError } = useAppStore();

  const handleExecute = async () => {
    if (!connectionId) {
      setResult({ success: false, error: 'Not connected to database' });
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const queries = sql.split(';').filter(q => q.trim());
      const results = [];

      for (const query of queries) {
        if (query.trim()) {
          const res = await schemaAPI.executeQuery(connectionId, query.trim());
          results.push(res);
        }
      }

      const allSuccess = results.every(r => r.success);
      setResult({
        success: allSuccess,
        message: allSuccess 
          ? `Successfully executed ${results.length} statement(s)` 
          : 'Some statements failed',
        results
      });

      // Auto-refresh schema after successful execution
      if (allSuccess) {
        setTimeout(async () => {
          try {
            const schemaData = await schemaAPI.getCompleteSchema(connectionId);
            if (schemaData.success && schemaData.schema) {
              const formattedTables = schemaData.schema.map((table, index) => ({
                id: table.name,
                name: table.name,
                columns: table.columns,
                foreignKeys: table.foreignKeys || [],
                position: { x: 100 + (index % 5) * 300, y: 100 + Math.floor(index / 5) * 250 }
              }));
              setTables(formattedTables);
              setSuccess('Schema refreshed successfully');
            }
          } catch (error) {
            console.error('Failed to refresh schema:', error);
          }
        }, 500);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || error.message
      });
      setError('Failed to execute SQL');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <h2 className="text-xs font-mono font-semibold text-[#d4d4d4] font-mono">Execute SQL</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SQL Preview */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <label className="block text-xs font-medium font-mono text-[#d4d4d4] mb-2">
              SQL Statements
            </label>
            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-x-auto text-xs font-mono font-mono max-h-96">
{sql}
            </pre>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-[#89d185] bg-opacity-10 border-[#89d185]' 
                : 'bg-[#f48771] bg-opacity-10 border-[#f48771]'
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-[#89d185] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#f48771] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Success' : 'Error'}
                  </p>
                  <p className={`text-xs font-mono mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message || result.error}
                  </p>
                  {result.results && result.results.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.results.map((res, idx) => (
                        <div key={idx} className="text-xs">
                          Statement {idx + 1}: {res.success ? '✓' : '✗'} 
                          {res.error && ` - ${res.error}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e]"
          >
            Close
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !connectionId}
            className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded-lg hover:bg-[#569cd6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute on Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
