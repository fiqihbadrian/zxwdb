import { useState, useEffect } from 'react';
import { X, Plus, Trash2, RefreshCw, Edit2, Save, ChevronRight, ChevronDown, Link2, Eye } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const DataBrowser = ({ tables, connectionId, selectedTable, onClose }) => {
  const { setSuccess, setError } = useAppStore();
  const [currentTable, setCurrentTable] = useState(selectedTable || (tables[0]?.id));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [insertMode, setInsertMode] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [activeTab, setActiveTab] = useState('data'); // 'data' or 'query'
  const [querySQL, setQuerySQL] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [relatedData, setRelatedData] = useState(null);

  const table = tables.find(t => t.id === currentTable);

  console.log('DataBrowser Debug:', { currentTable, table, columns: table?.columns });

  if (!table || !table.columns || table.columns.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#1e1e1e] p-8 rounded-lg border border-[#3a3a3a]">
          <p className="text-[#f48771] font-mono mb-4">Table not found or has no columns</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#2d2d2d] text-[#d4d4d4] rounded">Close</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (currentTable && connectionId) {
      fetchData();
    }
  }, [currentTable, connectionId]);

  const fetchData = async () => {
    if (!currentTable) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/data/${connectionId}/${currentTable}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this row?')) return;
    const pk = table.columns.find(c => (c.Key || c.key) === 'PRI');
    if (!pk) {
      setError('Primary key not found');
      return;
    }

    try {
      const pkField = pk.Field || pk.name || pk.COLUMN_NAME;
      const res = await fetch(`http://localhost:3001/api/data/${connectionId}/${currentTable}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [pkField]: row[pkField] })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        setError(`Delete failed: ${errData.error || 'Unknown error'}`);
        return;
      }
      
      setSuccess('Row deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      setError(`Delete failed: ${error.message}`);
    }
  };

  const startEdit = (row) => {
    setEditingRow(row);
    setEditedData({ ...row });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const runQuery = async () => {
    if (!querySQL.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/query/execute/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: querySQL })
      });

      const result = await res.json();
      if (res.ok) {
        setQueryResult(result);
        setSuccess(`Query executed: ${result.rowCount} rows in ${result.executionTime}`);
      } else {
        setError(result.error || 'Query failed');
      }
    } catch (error) {
      setError(`Query error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewRelatedRecords = async (row, fk) => {
    const refTable = fk.referencedTable || fk.REFERENCED_TABLE_NAME;
    const colName = fk.column || fk.COLUMN_NAME;
    const refCol = fk.referencedColumn || fk.REFERENCED_COLUMN_NAME;

    try {
      const query = `SELECT * FROM ${refTable} WHERE ${refCol} = '${row[colName]}'`;
      const res = await fetch(`http://localhost:3001/api/query/execute/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const result = await res.json();
      if (res.ok) {
        setRelatedData({ tableName: refTable, data: result.data, columns: result.columns });
        setExpandedRow(row);
      }
    } catch (error) {
      setError(`Failed to load related records: ${error.message}`);
    }
  };

  const saveEdit = async () => {
    const pk = table.columns.find(c => (c.Key || c.key) === 'PRI');
    if (!pk) {
      setError('Primary key not found');
      return;
    }

    try {
      const pkField = pk.Field || pk.name || pk.COLUMN_NAME;
      
      // Convert empty strings to null
      const cleanedData = {};
      Object.keys(editedData).forEach(key => {
        cleanedData[key] = editedData[key] === '' ? null : editedData[key];
      });
      
      const res = await fetch(`http://localhost:3001/api/data/${connectionId}/${currentTable}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          where: { [pkField]: editingRow[pkField] },
          data: cleanedData
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        setError(`Update failed: ${errData.error || 'Unknown error'}`);
        return;
      }
      
      setEditingRow(null);
      setSuccess('Row updated successfully');
      fetchData();
    } catch (error) {
      console.error('Update error:', error);
      setError(`Update failed: ${error.message}`);
    }
  };

  const handleInsert = async () => {
    try {
      // Convert empty strings to null
      const cleanedData = {};
      Object.keys(newRowData).forEach(key => {
        cleanedData[key] = newRowData[key] === '' ? null : newRowData[key];
      });
      
      const res = await fetch(`http://localhost:3001/api/data/${connectionId}/${currentTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        setError(`Insert failed: ${errData.error || 'Unknown error'}`);
        return;
      }
      
      setInsertMode(false);
      setNewRowData({});
      setSuccess('Row inserted successfully');
      fetchData();
    } catch (error) {
      console.error('Insert error:', error);
      setError(`Insert failed: ${error.message}`);
    }
  };

  if (!table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-5/6 h-5/6 rounded-lg flex flex-col border border-[#3a3a3a]">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-3">
            <select
              value={currentTable}
              onChange={(e) => setCurrentTable(e.target.value)}
              className="bg-[#2d2d2d] text-[#d4d4d4] px-3 py-2 rounded border border-[#3a3a3a] font-mono"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="flex gap-2 border-l border-[#3a3a3a] pl-3">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 rounded font-mono text-sm ${
                  activeTab === 'data'
                    ? 'bg-[#4ec9b0] text-[#1e1e1e]'
                    : 'bg-[#2d2d2d] text-[#808080] hover:text-[#d4d4d4]'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setActiveTab('query')}
                className={`px-3 py-1.5 rounded font-mono text-sm ${
                  activeTab === 'query'
                    ? 'bg-[#4ec9b0] text-[#1e1e1e]'
                    : 'bg-[#2d2d2d] text-[#808080] hover:text-[#d4d4d4]'
                }`}
              >
                Query (JOIN/Aggregation)
              </button>
            </div>
            {activeTab === 'data' && <span className="text-sm text-[#808080] font-mono">{data.length} rows</span>}
          </div>
          <div className="flex gap-2">
            {activeTab === 'data' && (
              <button
                onClick={() => setInsertMode(true)}
                className="px-3 py-1.5 bg-[#4ec9b0] text-[#1e1e1e] rounded flex items-center gap-1 hover:bg-[#5ed9c0] font-mono text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            )}
            {activeTab === 'data' && (
              <button onClick={fetchData} className="p-2 text-[#808080] hover:text-[#d4d4d4]">
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-[#808080] hover:text-[#d4d4d4]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'data' ? (
            loading ? (
              <div className="text-center text-[#808080]">Loading...</div>
            ) : (
              <table className="w-full text-sm font-mono border-collapse">
              <thead className="bg-[#2d2d2d] sticky top-0">
                <tr>
                  {table.columns.map(col => {
                    const colName = col.Field || col.name || col.COLUMN_NAME;
                    const fk = table.foreignKeys?.find(fk => (fk.column || fk.COLUMN_NAME) === colName);
                    const relType = fk ? 'N:1' : null; // Many-to-One (current table has FK to parent)
                    
                    return (
                      <th key={colName} className="px-3 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">
                        <div className="flex items-center gap-2">
                          <span>{colName}</span>
                          {fk && (
                            <span className="flex items-center gap-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#4ec9b0] bg-opacity-20 text-[#4ec9b0] text-[10px] font-semibold">
                                <Link2 className="w-3 h-3 mr-0.5" />
                                FK
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#569cd6] bg-opacity-20 text-[#569cd6] text-[10px] font-semibold">
                                N:1
                              </span>
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {insertMode && (
                  <tr className="bg-[#2d2d2d]">
                    {table.columns.map(col => {
                      const colName = col.Field || col.name || col.COLUMN_NAME;
                      return (
                        <td key={colName} className="px-3 py-2 border border-[#3a3a3a]">
                          <input
                            value={newRowData[colName] || ''}
                            onChange={(e) => setNewRowData({ ...newRowData, [colName]: e.target.value })}
                            placeholder={colName}
                            className="bg-[#1e1e1e] text-[#d4d4d4] px-2 py-1 rounded w-full border border-[#4ec9b0]"
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 border border-[#3a3a3a]">
                      <button onClick={handleInsert} className="text-[#4ec9b0] hover:text-[#5ed9c0] mr-2">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setInsertMode(false); setNewRowData({}); }} className="text-[#f48771]">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#2d2d2d]">
                    {table.columns.map(col => {
                      const colName = col.Field || col.name || col.COLUMN_NAME;
                      return (
                        <td key={colName} className="px-3 py-2 text-[#d4d4d4] border border-[#3a3a3a]">
                          {editingRow === row ? (
                            <input
                              value={editedData[colName] ?? ''}
                              onChange={(e) => setEditedData({ ...editedData, [colName]: e.target.value })}
                              className="bg-[#2d2d2d] text-[#d4d4d4] px-2 py-1 rounded w-full"
                            />
                          ) : (
                            row[colName] ?? 'NULL'
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 border border-[#3a3a3a]">
                      {editingRow === row ? (
                        <>
                          <button onClick={saveEdit} className="text-[#4ec9b0] hover:text-[#5ed9c0] mr-2" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="text-[#f48771] hover:text-[#ff6b6b]" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(row)} className="text-[#dcdcaa] hover:text-[#e6e4b4] mr-2" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(row)} className="text-[#f48771] hover:text-[#ff6b6b] mr-2" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {table.foreignKeys?.length > 0 && (
                            <button 
                              onClick={() => {
                                if (expandedRow === row) {
                                  setExpandedRow(null);
                                  setRelatedData(null);
                                } else {
                                  viewRelatedRecords(row, table.foreignKeys[0]);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#569cd6] bg-opacity-20 text-[#569cd6] hover:bg-opacity-30 transition-all"
                              title="View Related Records"
                            >
                              {expandedRow === row ? (
                                <><ChevronDown className="w-3 h-3" /><span className="text-xs">Hide</span></>
                              ) : (
                                <><Eye className="w-3 h-3" /><span className="text-xs">Related</span></>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Expanded Row - Related Data */}
                {expandedRow && relatedData && (
                  <tr>
                    <td colSpan={table.columns.length + 1} className="bg-gradient-to-r from-[#2d2d2d] to-[#252525] p-0 border-l-4 border-[#569cd6]">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#569cd6] bg-opacity-20 border border-[#569cd6]">
                            <Link2 className="w-4 h-4 text-[#569cd6]" />
                            <span className="text-sm font-semibold text-[#569cd6] font-mono">Related Records</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#569cd6]" />
                          <span className="text-sm text-[#d4d4d4] font-mono">{relatedData.tableName}</span>
                          <span className="px-2 py-0.5 rounded bg-[#4ec9b0] bg-opacity-20 text-[#4ec9b0] text-xs font-semibold">1:N Parent</span>
                        </div>
                        {relatedData.data.length > 0 ? (
                          <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#3a3a3a]">
                            <table className="w-full text-xs font-mono">
                              <thead className="bg-[#2d2d2d]">
                                <tr>
                                  {relatedData.columns.map(col => (
                                    <th key={col} className="px-3 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {relatedData.data.map((relRow, idx) => (
                                  <tr key={idx} className="hover:bg-[#2d2d2d] transition-colors">
                                    {relatedData.columns.map(col => (
                                      <td key={col} className="px-3 py-2 text-[#d4d4d4] border border-[#3a3a3a]">
                                        {relRow[col] ?? <span className="text-[#808080] italic">NULL</span>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-4 bg-[#1e1e1e] rounded-lg border border-[#3a3a3a]">
                            <X className="w-4 h-4 text-[#808080]" />
                            <span className="text-xs text-[#808080] font-mono">No related records found</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )
          ) : (
            <div className="h-full flex gap-4">
              {/* Left: Suggestions */}
              <div className="w-1/3 overflow-y-auto">
                <h4 className="text-sm font-semibold text-[#d4d4d4] mb-3 font-mono">Quick Templates</h4>
                <div className="space-y-2">
                  {/* JOIN Suggestions */}
                  {table.foreignKeys?.filter(fk => fk && fk.referencedTable).map((fk, idx) => {
                    const refTable = fk.referencedTable || fk.REFERENCED_TABLE_NAME;
                    const colName = fk.column || fk.COLUMN_NAME;
                    const refCol = fk.referencedColumn || fk.REFERENCED_COLUMN_NAME;
                    
                    if (!refTable || !colName || !refCol) return null;
                    
                    const joinQuery = `SELECT ${table.name}.*, ${refTable}.*\nFROM ${table.name}\nJOIN ${refTable}\n  ON ${table.name}.${colName} = ${refTable}.${refCol};`;
                    return (
                      <div
                        key={idx}
                        onClick={() => setQuerySQL(joinQuery)}
                        className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                      >
                        <div className="text-xs font-semibold text-[#4ec9b0] mb-1 font-mono">
                          JOIN: {table.name} → {refTable}
                        </div>
                        <div className="text-xs text-[#808080] font-mono truncate">
                          {colName} = {refCol}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Verify FK Relationship */}
                  {table.foreignKeys?.filter(fk => fk && fk.referencedTable).map((fk, idx) => {
                    const refTable = fk.referencedTable || fk.REFERENCED_TABLE_NAME;
                    const colName = fk.column || fk.COLUMN_NAME;
                    const refCol = fk.referencedColumn || fk.REFERENCED_COLUMN_NAME;
                    
                    if (!refTable || !colName || !refCol) return null;
                    
                    const verifyQuery = `-- Verify FK: ${table.name}.${colName} -> ${refTable}.${refCol}\nSELECT \n  ${table.name}.${colName},\n  COUNT(*) as total,\n  CASE WHEN ${refTable}.${refCol} IS NOT NULL THEN 'Valid' ELSE 'Invalid' END as status\nFROM ${table.name}\nLEFT JOIN ${refTable} ON ${table.name}.${colName} = ${refTable}.${refCol}\nGROUP BY ${table.name}.${colName}, ${refTable}.${refCol};`;
                    
                    return (
                      <div
                        key={`verify-${idx}`}
                        onClick={() => setQuerySQL(verifyQuery)}
                        className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#569cd6]"
                      >
                        <div className="text-xs font-semibold text-[#569cd6] mb-1 font-mono">
                          ✓ Verify: {colName} → {refTable}
                        </div>
                        <div className="text-xs text-[#808080] font-mono">
                          Test FK relationship
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Aggregation Suggestions */}
                  <div
                    onClick={() => setQuerySQL(`SELECT COUNT(*) as total\nFROM ${table.name};`)}
                    className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                  >
                    <div className="text-xs font-semibold text-[#dcdcaa] mb-1 font-mono">COUNT all rows</div>
                    <div className="text-xs text-[#808080] font-mono">Total records in {table.name}</div>
                  </div>
                  
                  {table.foreignKeys?.length > 0 && table.foreignKeys[0] && (
                    <div
                      onClick={() => {
                        const fk = table.foreignKeys[0];
                        const colName = fk.column || fk.COLUMN_NAME;
                        if (colName) {
                          setQuerySQL(`SELECT ${colName}, COUNT(*) as total\nFROM ${table.name}\nGROUP BY ${colName};`);
                        }
                      }}
                      className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                    >
                      <div className="text-xs font-semibold text-[#dcdcaa] mb-1 font-mono">GROUP BY FK</div>
                      <div className="text-xs text-[#808080] font-mono">Count by {table.foreignKeys[0].column || table.foreignKeys[0].COLUMN_NAME || 'FK column'}</div>
                    </div>
                  )}
                  
                  <div
                    onClick={() => setQuerySQL(`SELECT *\nFROM ${table.name}\nORDER BY /* column */ DESC\nLIMIT 10;`)}
                    className="p-3 bg-[#2d2d2d] rounded cursor-pointer hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                  >
                    <div className="text-xs font-semibold text-[#dcdcaa] mb-1 font-mono">TOP 10 records</div>
                    <div className="text-xs text-[#808080] font-mono">Most recent/highest</div>
                  </div>
                </div>
              </div>
              
              {/* Right: Query Editor */}
              <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <label className="text-sm font-semibold text-[#d4d4d4] font-mono mb-2 block">SQL Query (JOIN, Aggregation, etc.)</label>
                <textarea
                  value={querySQL}
                  onChange={(e) => setQuerySQL(e.target.value)}
                  placeholder="SELECT * FROM mahasiswa JOIN prodi ON mahasiswa.kd_prodi = prodi.kd_prodi;"
                  className="w-full h-32 bg-[#2d2d2d] text-[#d4d4d4] p-3 rounded border border-[#3a3a3a] font-mono text-sm resize-none focus:outline-none focus:border-[#4ec9b0]"
                />
                <button
                  onClick={runQuery}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#5ed9c0] disabled:opacity-50 font-mono"
                >
                  {loading ? 'Running...' : 'Run Query'}
                </button>
              </div>

              {queryResult && (
                <div className="flex-1 overflow-auto">
                  <div className="mb-2 text-sm text-[#808080] font-mono">
                    {queryResult.rowCount} rows in {queryResult.executionTime}
                  </div>
                  <table className="w-full text-sm font-mono border-collapse">
                    <thead className="bg-[#2d2d2d] sticky top-0">
                      <tr>
                        {queryResult.columns.map(col => (
                          <th key={col} className="px-3 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#2d2d2d]">
                          {queryResult.columns.map(col => (
                            <td key={col} className="px-3 py-2 text-[#d4d4d4] border border-[#3a3a3a]">
                              {row[col] ?? 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataBrowser;
