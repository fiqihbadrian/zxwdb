import { X, Key, Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import ConfirmDialog from './ConfirmDialog';
import EditTableModal from './EditTableModal';

export default function TableDetailsPanel() {
  const { selectedTable, tables, setSelectedTable, updateTable, deleteTable } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!selectedTable) return null;

  const table = tables.find(t => t.id === selectedTable);
  if (!table) return null;

  const handleClose = () => {
    setSelectedTable(null);
  };

  const handleDeleteTable = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    deleteTable(table.id);
    setSelectedTable(null);
    setConfirmDelete(false);
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-[#2d2d2d] border-l border-[#3a3a3a] shadow-lg z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a] bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[#d4d4d4] text-sm font-mono">{table.name}</h3>
        </div>
        <button
          onClick={handleClose}
          className="text-[#808080] hover:text-[#d4d4d4]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#2d2d2d]">
        {/* Table Info */}
        <div className="mb-6">
          <h4 className="text-xs font-mono font-semibold text-[#d4d4d4] mb-2 uppercase tracking-wide">
            Table Information
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#808080]">Columns:</span>
              <span className="font-medium text-[#d4d4d4]">{table.columns?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#808080]">Primary Keys:</span>
              <span className="font-medium text-[#d4d4d4]">
                {table.columns?.filter(c => 
                  c.primaryKey || c.Key === 'PRI' || c.key === 'PRI'
                ).length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#808080]">Foreign Keys:</span>
              <span className="font-medium text-[#d4d4d4]">
                {table.foreignKeys?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Columns List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono font-semibold text-[#d4d4d4] uppercase tracking-wide">
              Columns
            </h4>
          </div>
          
          <div className="space-y-2">
            {table.columns && table.columns.length > 0 ? (
              table.columns.map((column, index) => {
                const columnName = column.name || column.Field;
                const isPrimaryKey = column.primaryKey || column.Key === 'PRI' || column.key === 'PRI';
                const isForeignKey = table.foreignKeys?.some(fk => 
                  (fk.COLUMN_NAME || fk.column) === columnName
                );
                const isNotNull = column.notNull || column.Null === 'NO';
                const isAutoIncrement = column.autoIncrement || column.Extra?.includes('auto_increment');
                
                // Get FK details if this is a foreign key
                const fkDetails = isForeignKey ? table.foreignKeys?.find(fk => 
                  (fk.COLUMN_NAME || fk.column) === columnName
                ) : null;
                
                return (
                  <div
                    key={index}
                    className="p-3 bg-[#1e1e1e] rounded-lg border border-[#3a3a3a]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isPrimaryKey && (
                          <Key className="w-4 h-4 text-[#dcdcaa] flex-shrink-0" />
                        )}
                        <span className="font-medium text-[#d4d4d4]">
                          {column.name || column.Field}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-[#808080] space-y-1 ml-6">
                      <div>
                        Type: <span className="font-mono text-[#4ec9b0]">{column.type || column.Type}</span>
                      </div>
                      
                      {(isNotNull || isPrimaryKey || isForeignKey || isAutoIncrement) && (
                        <div className="flex gap-2 flex-wrap">
                          {isPrimaryKey && (
                            <span className="px-2 py-0.5 bg-[#dcdcaa] bg-opacity-20 text-[#dcdcaa] rounded text-[10px] font-semibold">
                              PRIMARY KEY
                            </span>
                          )}
                          {isForeignKey && (
                            <span className="px-2 py-0.5 bg-[#569cd6] bg-opacity-20 text-[#569cd6] rounded text-[10px] font-semibold">
                              FOREIGN KEY
                            </span>
                          )}
                          {isNotNull && (
                            <span className="px-2 py-0.5 bg-[#f48771] bg-opacity-20 text-[#f48771] rounded text-[10px]">
                              NOT NULL
                            </span>
                          )}
                          {isAutoIncrement && (
                            <span className="px-2 py-0.5 bg-[#4ec9b0] bg-opacity-20 text-[#4ec9b0] rounded text-[10px]">
                              AUTO_INCREMENT
                            </span>
                          )}
                        </div>
                      )}
                      
                      {fkDetails && (
                        <div className="mt-1 text-[#569cd6]">
                          References: <span className="font-mono">
                            {fkDetails.REFERENCED_TABLE_NAME || fkDetails.referencedTable}.{fkDetails.REFERENCED_COLUMN_NAME || fkDetails.referencedColumn}
                          </span>
                        </div>
                      )}
                      
                      {column.default && (
                        <div>
                          Default: <span className="font-mono">{column.default || column.Default}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-mono text-[#808080] text-center py-4">No columns</p>
            )}
          </div>
        </div>

        {/* Foreign Keys */}
        {table.foreignKeys && table.foreignKeys.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-mono font-semibold text-[#d4d4d4] mb-2 uppercase tracking-wide">
              Foreign Keys
            </h4>
            <div className="space-y-2">
              {table.foreignKeys.map((fk, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm"
                >
                  <div className="font-medium text-[#d4d4d4] mb-1">
                    {fk.CONSTRAINT_NAME || fk.constraintName}
                  </div>
                  <div className="text-xs text-[#808080]">
                    {fk.COLUMN_NAME || fk.column} → {fk.REFERENCED_TABLE_NAME || fk.referencedTable}.
                    {fk.REFERENCED_COLUMN_NAME || fk.referencedColumn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#3a3a3a] bg-[#1e1e1e] space-y-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full px-4 py-2 bg-[#569cd6] text-[#1e1e1e] rounded hover:bg-[#4ec9b0] flex items-center justify-center gap-2 text-xs font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit Table
        </button>
        <button
          onClick={handleDeleteTable}
          className="w-full px-4 py-2 bg-[#f48771] text-[#1e1e1e] rounded hover:bg-[#ff6b6b] flex items-center justify-center gap-2 text-xs font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete Table
        </button>
      </div>

      {/* Edit Table Modal */}
      {showEditModal && (
        <EditTableModal
          table={table}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Table"
          message={`Are you sure you want to delete table "${table.name}"? This action cannot be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
