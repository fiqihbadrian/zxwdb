import { useState, useEffect } from 'react';
import { X, Play, Database } from 'lucide-react';

const QueryRunner = ({ connectionId, onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchSuggestions();
  }, [connectionId]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/query/suggestions/${connectionId}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Fetch suggestions error:', error);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/query/execute/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setResult({ error: data.error });
      }
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-5/6 h-5/6 rounded-lg flex flex-col border border-[#3a3a3a]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#4ec9b0]" />
            <h3 className="text-lg font-semibold text-[#d4d4d4] font-mono">Query Runner</h3>
          </div>
          <button onClick={onClose} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Suggestions */}
          <div className="w-1/3 border-r border-[#3a3a3a] overflow-y-auto p-4">
            <h4 className="text-sm font-semibold text-[#d4d4d4] mb-3 font-mono">JOIN Suggestions</h4>
            <div className="space-y-2">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => setQuery(sug.query)}
                  className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                >
                  <div className="text-sm font-semibold text-[#4ec9b0] mb-1 font-mono">
                    {sug.name}
                  </div>
                  <div className="text-xs text-[#808080] font-mono">{sug.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Query Editor & Results */}
          <div className="flex-1 flex flex-col">
            {/* Query Editor */}
            <div className="p-4 border-b border-[#3a3a3a]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#d4d4d4] font-mono">SQL Query</label>
                <button
                  onClick={executeQuery}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#5ed9c0] disabled:opacity-50 font-mono"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Running...' : 'Run Query'}
                </button>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM table1 JOIN table2 ON ..."
                className="w-full h-32 bg-[#2d2d2d] text-[#d4d4d4] p-3 rounded border border-[#3a3a3a] font-mono text-sm resize-none focus:outline-none focus:border-[#4ec9b0]"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-auto p-4">
              {result?.error ? (
                <div className="p-4 bg-[#f48771] bg-opacity-20 border border-[#f48771] rounded text-[#f48771] font-mono text-sm">
                  {result.error}
                </div>
              ) : result?.data ? (
                <div>
                  <div className="mb-2 text-sm text-[#808080] font-mono">
                    {result.rowCount} rows in {result.executionTime}
                  </div>
                  <div className="overflow-auto">
                    <table className="w-full text-sm font-mono">
                      <thead className="bg-[#2d2d2d] sticky top-0">
                        <tr>
                          {result.columns.map(col => (
                            <th key={col} className="px-4 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, idx) => (
                          <tr key={idx} className="border-b border-[#3a3a3a] hover:bg-[#2d2d2d]">
                            {result.columns.map(col => (
                              <td key={col} className="px-4 py-2 text-[#d4d4d4] border border-[#3a3a3a]">
                                {row[col] ?? 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#808080] mt-8 font-mono">
                  Run a query to see results
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryRunner;
