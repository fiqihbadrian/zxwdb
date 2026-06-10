import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export default function AddTableModal({ onClose }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { name: 'id', type: 'INT', length: '', primaryKey: true, notNull: true, autoIncrement: true }
  ]);

  const { addTable, tables, setError, setSuccess, executeSQLToDatabase, connectionId, importSchema, addToHistory } = useAppStore();

  const dataTypes = [
    'INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP',
    'BOOLEAN', 'DECIMAL', 'FLOAT', 'DOUBLE', 'ENUM', 'JSON'
  ];

  const addColumn = () => {
    setColumns([...columns, { 
      name: '', 
      type: 'VARCHAR', 
      length: '255',
      primaryKey: false, 
      notNull: false, 
      autoIncrement: false 
    }]);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }

    if (columns.length === 0) {
      setError('At least one column is required');
      return;
    }
    
    if (!connectionId) {
      setError('Not connected to database');
      return;
    }

    try {
      // Generate CREATE TABLE SQL
      const columnDefs = columns.map(col => {
        let def = `\`${col.name}\` ${col.type}`;
        if (col.length) def += `(${col.length})`;
        if (col.notNull) def += ' NOT NULL';
        if (col.autoIncrement) def += ' AUTO_INCREMENT';
        return def;
      }).join(', ');
      
      const primaryKeys = columns.filter(c => c.primaryKey).map(c => `\`${c.name}\``).join(', ');
      const pkConstraint = primaryKeys ? `, PRIMARY KEY (${primaryKeys})` : '';
      
      const sql = `CREATE TABLE \`${tableName}\` (${columnDefs}${pkConstraint});`;
      
      console.log('Executing CREATE TABLE:', sql);
      
      // Execute to database
      await executeSQLToDatabase(sql);
      
      // Add to undo history
      addToHistory({
        description: `Created table "${tableName}"`,
        redoSQL: sql,
        undoSQL: `DROP TABLE \`${tableName}\`;`,
        timestamp: new Date().toISOString()
      });
      
      setSuccess(`Table "${tableName}" created successfully in database`);
      
      // Refresh schema from database
      const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
      if (response.ok) {
        const data = await response.json();
        importSchema(data.schema);
      }
      
      onClose();
    } catch (error) {
      console.error('Create table error:', error);
      setError('Failed to create table: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <h2 className="text-xs font-mono font-semibold text-[#d4d4d4] font-mono">Add New Table</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Table Name */}
          <div>
            <label className="block text-xs font-medium font-mono text-[#d4d4d4] mb-1">
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full px-3 py-2 border bg-[#1e1e1e] text-[#d4d4d4] border-[#3a3a3a] rounded focus:outline-none focus:ring-1 focus:ring-[#4ec9b0]"
              placeholder="users, products, orders..."
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium font-mono text-[#d4d4d4]">
                Columns
              </label>
              <button
                onClick={addColumn}
                className="px-3 py-1 text-xs font-mono bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Column
              </button>
            </div>

            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-[#1e1e1e] rounded border border-[#3a3a3a]">
                  {/* Column Name */}
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#3a3a3a] rounded bg-[#2d2d2d] text-[#d4d4d4] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#4ec9b0]"
                    placeholder="column_name"
                  />

                  {/* Data Type */}
                  <select
                    value={column.type}
                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                    className="px-3 py-2 border border-[#3a3a3a] rounded bg-[#2d2d2d] text-[#d4d4d4] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#4ec9b0]"
                  >
                    {dataTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  {/* Length */}
                  <input
                    type="text"
                    value={column.length}
                    onChange={(e) => updateColumn(index, 'length', e.target.value)}
                    className="w-20 px-3 py-2 border border-[#3a3a3a] rounded bg-[#2d2d2d] text-[#d4d4d4] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#4ec9b0]"
                    placeholder="length"
                  />

                  {/* Checkboxes */}
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-xs text-[#d4d4d4] font-mono">
                      <input
                        type="checkbox"
                        checked={column.primaryKey}
                        onChange={(e) => updateColumn(index, 'primaryKey', e.target.checked)}
                        className="rounded"
                      />
                      PK
                    </label>
                    <label className="flex items-center gap-1 text-xs text-[#d4d4d4] font-mono">
                      <input
                        type="checkbox"
                        checked={column.notNull}
                        onChange={(e) => updateColumn(index, 'notNull', e.target.checked)}
                        className="rounded"
                      />
                      NOT NULL
                    </label>
                    <label className="flex items-center gap-1 text-xs text-[#d4d4d4] font-mono">
                      <input
                        type="checkbox"
                        checked={column.autoIncrement}
                        onChange={(e) => updateColumn(index, 'autoIncrement', e.target.checked)}
                        className="rounded"
                      />
                      AI
                    </label>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeColumn(index)}
                    className="p-2 text-[#f48771] hover:bg-[#f48771] hover:text-[#1e1e1e] rounded"
                    disabled={columns.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded-lg hover:bg-[#569cd6]"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}
