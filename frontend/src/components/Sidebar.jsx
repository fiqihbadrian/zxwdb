import { useState } from 'react';
import { Table2, ChevronRight, Trash2, Edit, Search } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import ConfirmDialog from './ConfirmDialog';

export default function Sidebar() {
  const { tables, selectedTable, setSelectedTable, deleteTable } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDeleteTable = (e, tableId) => {
    e.stopPropagation();
    const table = tables.find(t => t.id === tableId);
    setConfirmDelete({ tableId, tableName: table?.name });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      deleteTable(confirmDelete.tableId);
      setConfirmDelete(null);
    }
  };

  // Filter tables based on search query
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-[#2d2d2d] border-r border-[#3a3a3a] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-xs font-semibold text-[#d4d4d4] uppercase tracking-wide font-mono mb-3">
          Tables
        </h2>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#808080]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#3a3a3a] rounded bg-[#1e1e1e] text-[#d4d4d4] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-[#4ec9b0] font-mono"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTables.length === 0 ? (
          <div className="p-4 text-center">
            {searchQuery ? (
              <>
                <p className="text-xs text-[#808080] font-mono">No tables found</p>
                <p className="text-xs text-[#808080] mt-1 font-mono">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <Table2 className="w-12 h-12 text-[#3a3a3a] mx-auto mb-2" />
                <p className="text-xs text-[#808080] font-mono">No tables yet</p>
                <p className="text-xs text-[#808080] mt-1 font-mono">
                  Import from database or add new tables
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`w-full text-left p-3 rounded mb-1 transition-colors group font-mono ${
                  selectedTable === table.id
                    ? 'bg-[#1e1e1e] border border-[#4ec9b0]'
                    : 'hover:bg-[#1e1e1e] border border-transparent hover:border-[#3a3a3a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Table2 className="w-4 h-4 text-[#569cd6] flex-shrink-0" />
                    <span className="font-medium text-xs truncate text-[#d4d4d4]">{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                      onClick={(e) => handleDeleteTable(e, table.id)}
                      className="p-1 hover:bg-[#f48771] rounded text-[#f48771] hover:text-[#1e1e1e] cursor-pointer"
                      title="Delete table"
                    >
                      <Trash2 className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-[#808080] mt-1 ml-6">
                  {table.columns?.length || 0} columns
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#3a3a3a] bg-[#1e1e1e]">
        <div className="text-xs text-[#808080] font-mono">
          <div className="flex justify-between mb-1">
            <span>Total Tables:</span>
            <span className="font-semibold text-[#d4d4d4]">{tables.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Columns:</span>
            <span className="font-semibold text-[#d4d4d4]">
              {tables.reduce((sum, t) => sum + (t.columns?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Table"
          message={`Are you sure you want to delete table "${confirmDelete.tableName}"? This action cannot be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
