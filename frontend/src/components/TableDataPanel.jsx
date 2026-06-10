import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';

const TableDataPanel = ({ table, connectionId, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});

  // Safety check
  if (!table) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#1e1e1e] p-8 rounded-lg border border-[#3a3a3a]">
          <p className="text-[#f48771] font-mono">No table selected</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-[#2d2d2d] text-[#d4d4d4] rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (table && connectionId) {
      fetchData();
    }
  }, [table, connectionId, pagination.page]);

  const fetchData = async () => {
    if (!table || !connectionId) {
      console.error('Missing table or connectionId');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/data/${connectionId}/${table.name}?page=${pagination.page}&limit=${pagination.limit}`
      );
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/data/${connectionId}/${table.name}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRow)
        }
      );
      if (response.ok) {
        setNewRow({});
        fetchData();
      }
    } catch (error) {
      console.error('Insert error:', error);
    }
  };

  const handleUpdate = async (oldRow, newData) => {
    try {
      const pkColumn = table.columns.find(c => c.key === 'PRI');
      if (!pkColumn) return;

      const response = await fetch(
        `http://localhost:3001/api/data/${connectionId}/${table.name}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            where: { [pkColumn.name]: oldRow[pkColumn.name] },
            data: newData
          })
        }
      );
      if (response.ok) {
        setEditingRow(null);
        fetchData();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this row?')) return;
    
    try {
      const pkColumn = table.columns.find(c => c.key === 'PRI');
      if (!pkColumn) return;

      const response = await fetch(
        `http://localhost:3001/api/data/${connectionId}/${table.name}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [pkColumn.name]: row[pkColumn.name] })
        }
      );
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-5/6 h-5/6 rounded-lg flex flex-col border border-[#3a3a3a]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <h3 className="text-lg font-semibold text-[#d4d4d4] font-mono">
            {table.name} - Data
          </h3>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-[#808080] hover:text-[#d4d4d4]"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-[#808080] hover:text-[#d4d4d4]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center text-[#808080]">Loading...</div>
          ) : (
            <table className="w-full text-sm font-mono">
              <thead className="bg-[#2d2d2d] sticky top-0">
                <tr>
                  {table.columns.map(col => (
                    <th key={col.name} className="px-4 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">
                      {col.name}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-[#d4d4d4] border border-[#3a3a3a]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#3a3a3a] hover:bg-[#2d2d2d]">
                    {table.columns.map(col => (
                      <td key={col.name} className="px-4 py-2 text-[#d4d4d4] border border-[#3a3a3a]">
                        {row[col.name] ?? 'NULL'}
                      </td>
                    ))}
                    <td className="px-4 py-2 border border-[#3a3a3a]">
                      <button
                        onClick={() => handleDelete(row)}
                        className="text-[#f48771] hover:text-[#ff6b6b]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#3a3a3a] flex justify-between items-center">
          <div className="text-sm text-[#808080] font-mono">
            Total: {pagination.total} rows
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-[#2d2d2d] text-[#d4d4d4] rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-[#d4d4d4] font-mono">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 bg-[#2d2d2d] text-[#d4d4d4] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDataPanel;
