import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const dataTypes = [
  'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
  'VARCHAR', 'CHAR', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME',
  'DECIMAL', 'FLOAT', 'DOUBLE',
  'BOOLEAN', 'ENUM', 'JSON'
];

export default function EditTableModal({ table, onClose }) {
  const [tableName, setTableName] = useState(table.name);
  const [columns, setColumns] = useState(
    table.columns.map(col => {
      const isPrimaryKey = col.primaryKey || col.Key === 'PRI' || col.key === 'PRI';
      const isNotNull = col.notNull || col.Null === 'NO';
      const isAutoIncrement = col.autoIncrement || col.Extra?.includes('auto_increment') || col.extra?.includes('auto_increment');
      
      return {
        name: col.name || col.Field,
        type: col.type || col.Type?.split('(')[0] || 'VARCHAR',
        length: col.length || col.Type?.match(/\((\d+)\)/)?.[1] || '',
        primaryKey: isPrimaryKey,
        notNull: isNotNull,
        autoIncrement: isAutoIncrement,
        isNew: false,
        isModified: false
      };
    })
  );

  const { updateTable, setError, setSuccess, executeSQLToDatabase, connectionId, importSchema, addToHistory } = useAppStore();

  const addColumn = () => {
    setColumns([
      ...columns,
      { 
        name: '', 
        type: 'VARCHAR', 
        length: '255', 
        primaryKey: false, 
        notNull: false, 
        autoIncrement: false,
        isNew: true,
        isModified: false
      }
    ]);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index] = { 
      ...newColumns[index], 
      [field]: value,
      isModified: !newColumns[index].isNew
    };
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

    // Validate column names
    for (const col of columns) {
      if (!col.name.trim()) {
        setError('All columns must have a name');
        return;
      }
    }
    
    if (!connectionId) {
      setError('Not connected to database');
      return;
    }

    try {
      const sqlStatements = [];
      
      // Rename table if name changed
      if (tableName !== table.name) {
        sqlStatements.push(`ALTER TABLE \`${table.name}\` RENAME TO \`${tableName}\`;`);
      }
      
      // Get original columns
      const originalColumns = table.columns.map(col => col.name || col.Field);
      const newColumns = columns.map(col => col.name);
      
      // Find columns to drop
      const columnsToDrop = originalColumns.filter(name => !newColumns.includes(name));
      
      // Check if trying to drop ALL columns
      if (columnsToDrop.length === originalColumns.length) {
        setError('Cannot delete all columns. Use "Delete Table" instead or keep at least one column.');
        return;
      }
      
      columnsToDrop.forEach(colName => {
        sqlStatements.push(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${colName}\`;`);
      });
      
      // Find columns to add or modify
      columns.forEach(col => {
        const originalCol = table.columns.find(c => (c.name || c.Field) === col.name);
        
        let colDef = `\`${col.name}\` ${col.type}`;
        if (col.length) colDef += `(${col.length})`;
        if (col.notNull) colDef += ' NOT NULL';
        if (col.autoIncrement) colDef += ' AUTO_INCREMENT';
        
        if (!originalCol || col.isNew) {
          // Add new column
          sqlStatements.push(`ALTER TABLE \`${tableName}\` ADD COLUMN ${colDef};`);
        } else if (col.isModified) {
          // Modify existing column
          sqlStatements.push(`ALTER TABLE \`${tableName}\` MODIFY COLUMN ${colDef};`);
        }
      });
      
      // Execute all SQL statements
      const allSQL = sqlStatements.join(' ');
      for (const sql of sqlStatements) {
        console.log('Executing ALTER TABLE:', sql);
        await executeSQLToDatabase(sql);
      }
      
      // Generate undo SQL by storing old table structure
      if (sqlStatements.length > 0) {
        // Create DROP + CREATE SQL to restore old table structure
        const oldColumnDefs = table.columns.map(col => {
          const colName = col.name || col.Field;
          const colType = col.type || col.Type;
          let def = `\`${colName}\` ${colType}`;
          if (col.notNull || col.Null === 'NO') def += ' NOT NULL';
          if (col.autoIncrement || col.Extra?.includes('auto_increment') || col.extra?.includes('auto_increment')) def += ' AUTO_INCREMENT';
          return def;
        }).join(', ');
        
        const oldPrimaryKeys = table.columns
          .filter(c => c.primaryKey || c.Key === 'PRI' || c.key === 'PRI')
          .map(c => `\`${c.name || c.Field}\``)
          .join(', ');
        const oldPkConstraint = oldPrimaryKeys ? `, PRIMARY KEY (${oldPrimaryKeys})` : '';
        
        const undoSQL = `DROP TABLE \`${tableName}\`; CREATE TABLE \`${table.name}\` (${oldColumnDefs}${oldPkConstraint});`;
        
        addToHistory({
          description: `Modified table "${tableName}"`,
          redoSQL: allSQL,
          undoSQL: undoSQL,
          timestamp: new Date().toISOString()
        });
      }
      
      setSuccess(`Table "${tableName}" updated successfully in database`);
      
      // Refresh schema from database
      const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
      if (response.ok) {
        const data = await response.json();
        importSchema(data.schema);
      }
      
      onClose();
    } catch (error) {
      console.error('Edit table error:', error);
      setError('Failed to update table: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <h2 className="text-sm font-semibold text-[#d4d4d4] font-mono">Edit Table: {table.name}</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Table Name */}
          <div>
            <label className="block text-xs font-medium text-[#d4d4d4] mb-1 font-mono">
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] text-xs font-mono"
              placeholder="users, products, orders..."
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[#d4d4d4] font-mono">
                Columns
              </label>
              <button
                onClick={addColumn}
                className="px-3 py-1 text-xs bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
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
            className="px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] text-xs font-mono text-[#d4d4d4]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] text-xs font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
