import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Table2, Key } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const TableNode = memo(({ data, id }) => {
  const { table, viewMode } = data;
  const { selectedTable, setSelectedTable } = useAppStore();
  const isSelected = selectedTable === id;

  const handleClick = () => {
    setSelectedTable(id);
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-[#2d2d2d] rounded border min-w-[250px] transition-all cursor-pointer font-mono relative ${
        isSelected 
          ? 'border-[#4ec9b0] ring-2 ring-[#4ec9b0] ring-opacity-20' 
          : 'border-[#3a3a3a] hover:border-[#569cd6]'
      }`}
    >
      {/* Table Header */}
      <div className="bg-[#1e1e1e] text-[#d4d4d4] px-4 py-2 rounded-t flex items-center gap-2 border-b border-[#3a3a3a]">
        <Table2 className="w-4 h-4 text-[#569cd6]" />
        <span className="font-semibold text-xs">{table.name}</span>
      </div>

      {/* Columns */}
      <div className="p-2">
        {table.columns && table.columns.length > 0 ? (
          <div className="space-y-1">
            {table.columns.map((column, index) => {
              const columnName = column.name || column.Field;
              
              return (
                <div
                  key={columnName}
                  className="px-2 py-1.5 text-xs hover:bg-[#1e1e1e] rounded flex items-center justify-between transition-colors relative"
                  style={{ minHeight: '28px' }}
                >
                  {/* Multiple handles per column - ReactFlow picks the best one */}
                  {/* Left side handles */}
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`${columnName}-left-target`}
                    className="!absolute !left-[-6px]"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: '#569cd6',
                      border: '2px solid #1e1e1e',
                      borderRadius: '50%',
                      opacity: 1, // VISIBLE for debug
                      zIndex: 10,
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Left}
                    id={`${columnName}-left-source`}
                    className="!absolute !left-[-6px]"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: '#4ec9b0',
                      border: '2px solid #1e1e1e',
                      borderRadius: '50%',
                      opacity: 0.3, // Semi-visible
                      zIndex: 10,
                    }}
                  />
                  
                  {/* Right side handles */}
                  <Handle
                    type="target"
                    position={Position.Right}
                    id={`${columnName}-right-target`}
                    className="!absolute !right-[-6px]"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: '#569cd6',
                      border: '2px solid #1e1e1e',
                      borderRadius: '50%',
                      opacity: 0.3,
                      zIndex: 10,
                    }}
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${columnName}-right-source`}
                    className="!absolute !right-[-6px]"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      background: '#4ec9b0',
                      border: '2px solid #1e1e1e',
                      borderRadius: '50%',
                      opacity: 1, // VISIBLE for debug
                      zIndex: 10,
                    }}
                  />
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Primary Key Icon */}
                    {(column.key === 'PRI' || column.Key === 'PRI') && (
                      <Key className="w-3 h-3 text-[#dcdcaa] flex-shrink-0" />
                    )}
                    
                    {/* Column Name */}
                    <span className="font-medium text-[#d4d4d4] truncate">
                      {columnName}
                    </span>
                  </div>

                  {/* Column Type (LRS View) */}
                  {viewMode === 'LRS' && (
                    <span className="text-xs text-[#4ec9b0] ml-2 flex-shrink-0 font-mono">
                      {column.type || column.Type}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-[#808080] font-mono">
            No columns
          </div>
        )}
      </div>
    </div>
  );
});

TableNode.displayName = 'TableNode';

export default TableNode;
