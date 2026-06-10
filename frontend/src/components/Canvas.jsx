import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from '../stores/appStore';
import TableNode from './TableNode';
import ConfirmDialog from './ConfirmDialog';

const nodeTypes = {
  table: TableNode,
};

export default function Canvas() {
  const { tables, relationships, addRelationship, deleteRelationship, viewMode, deleteTable, selectedTable, setSelectedTable, connectionId, setError, setSuccess, executeSQLToDatabase, addToHistory, importSchema, updateTableColumns } = useAppStore();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [reconnectSucceeded, setReconnectSucceeded] = useState(false);
  
  // Convert tables to ReactFlow nodes
  const initialNodes = tables.map(table => ({
    id: table.id,
    type: 'table',
    position: table.position || { x: 100, y: 100 },
    data: { 
      table,
      viewMode 
    },
  }));

  // Convert relationships to ReactFlow edges
  const initialEdges = relationships.map(rel => ({
    id: rel.id,
    source: rel.source || rel.sourceTable,
    target: rel.target || rel.targetTable,
    sourceHandle: rel.sourceHandle,
    targetHandle: rel.targetHandle,
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: '#4ec9b0', 
      strokeWidth: 3  // Made thicker to be more visible
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 25,
      height: 25,
      color: '#4ec9b0',
    },
    label: rel.label || `${rel.sourceHandle} → ${rel.targetHandle}`,
    labelStyle: { 
      fill: '#d4d4d4', 
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: 'SF Mono, Monaco, monospace' 
    },
    labelBgStyle: { 
      fill: '#2d2d2d',
      fillOpacity: 0.9 
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when tables change
  useEffect(() => {
    console.log('📦 Syncing nodes with tables:', tables.length);
    const newNodes = tables.map(table => ({
      id: table.id,
      type: 'table',
      position: table.position || { x: 100, y: 100 },
      data: { 
        table,
        viewMode 
      },
    }));
    setNodes(newNodes);
  }, [tables, viewMode, setNodes]);

  // Sync edges when relationships change
  useEffect(() => {
    console.log('🔗 Syncing edges with relationships:', relationships.length);
    console.log('📊 Relationships:', relationships);
    
    // Filter out old-format relationships that don't have proper handle IDs
    const validRelationships = relationships.filter(rel => {
      // New format: columnName-side-type (e.g., "id_pesanan-right-source")
      // Must end with -source or -target
      const hasValidHandles = 
        rel.sourceHandle && (rel.sourceHandle.endsWith('-source')) &&
        rel.targetHandle && (rel.targetHandle.endsWith('-target'));
      
      if (!hasValidHandles) {
        console.warn('⚠️ Skipping old-format relationship:', rel.id, {
          sourceHandle: rel.sourceHandle,
          targetHandle: rel.targetHandle
        });
        return false;
      }
      return true;
    });
    
    const newEdges = validRelationships.map(rel => {
      const edge = {
        id: rel.id,
        source: rel.source || rel.sourceTable,
        target: rel.target || rel.targetTable,
        sourceHandle: rel.sourceHandle,
        targetHandle: rel.targetHandle,
        type: 'step',
        animated: true,
        style: { 
          stroke: rel.style?.stroke || '#4ec9b0', 
          strokeWidth: rel.style?.strokeWidth || 2,
          strokeDasharray: rel.style?.strokeDasharray || undefined
        },
        interactionWidth: 20,  // Make edges easier to click
        focusable: true,
        selectable: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 25,
          height: 25,
          color: rel.markerEnd?.color || '#4ec9b0',
        },
        label: rel.label || `${rel.sourceHandle} → ${rel.targetHandle}`,
        labelStyle: { 
          fill: rel.labelStyle?.fill || '#d4d4d4', 
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'SF Mono, Monaco, monospace' 
        },
        labelBgStyle: { 
          fill: '#2d2d2d',
          fillOpacity: 0.9 
        },
      };
      
      console.log('🎯 Creating edge:', edge);
      return edge;
    });
    
    console.log('✅ Setting edges:', newEdges);
    setEdges(newEdges);
  }, [relationships, setEdges]);

  const onConnect = useCallback(
    async (params) => {
      console.log('🔌 Manual connection:', params);
      const sourceTable = tables.find(t => t.id === params.source);
      const targetTable = tables.find(t => t.id === params.target);
      
      if (!sourceTable || !targetTable) {
        console.error('❌ Source or target table not found');
        setError('Source or target table not found');
        return;
      }
      
      // Parse handle IDs to get column names
      const sourceColumnName = params.sourceHandle?.split('-')[0];
      const targetColumnName = params.targetHandle?.split('-')[0];
      
      if (!sourceColumnName || !targetColumnName) {
        console.error('❌ Invalid connection handles');
        setError('Invalid connection handles');
        return;
      }
      
      // Find columns
      const sourceColumn = sourceTable.columns.find(c => (c.name || c.Field) === sourceColumnName);
      const targetColumn = targetTable.columns.find(c => (c.name || c.Field) === targetColumnName);
      
      if (!sourceColumn || !targetColumn) {
        console.error('❌ Source or target column not found');
        setError('Source or target column not found');
        return;
      }
      
      console.log('✅ Connection valid, showing modal...');
      
      // Store connection info and show modal
      setPendingConnection({
        params,
        sourceTable,
        targetTable,
        sourceColumnName,
        targetColumnName
      });
      setShowRelationshipModal(true);
    },
    [tables, setError, setPendingConnection, setShowRelationshipModal]
  );

  const handleCreateFK = async () => {
    if (!pendingConnection || !connectionId) return;
    
    const { sourceTable, targetTable, sourceColumnName, targetColumnName, params } = pendingConnection;
    
    try {
      // Find columns for validation
      const sourceColumn = sourceTable.columns.find(c => (c.name || c.Field) === sourceColumnName);
      const targetColumn = targetTable.columns.find(c => (c.name || c.Field) === targetColumnName);
      
      if (!sourceColumn || !targetColumn) {
        setError('Column not found');
        setShowRelationshipModal(false);
        setPendingConnection(null);
        return;
      }
      
      // Validation 1: Check if relationship already exists
      const existingRel = relationships.find(r => 
        (r.source === params.source && r.target === params.target && 
         r.sourceHandle === params.sourceHandle && r.targetHandle === params.targetHandle)
      );
      
      if (existingRel) {
        setError('Relationship already exists between these columns');
        setShowRelationshipModal(false);
        setPendingConnection(null);
        return;
      }
      
      // Validation 2: Source column should be a Primary Key (recommended)
      const sourceIsPK = sourceColumn.primaryKey || sourceColumn.Key === 'PRI' || sourceColumn.key === 'PRI';
      if (!sourceIsPK) {
        console.warn('⚠️ Warning: Source column is not a PK, but allowing anyway');
      }
      
      // Validation 3: Check column type compatibility
      const sourceType = (sourceColumn.type || sourceColumn.Type || '').split('(')[0].toUpperCase();
      const targetType = (targetColumn.type || targetColumn.Type || '').split('(')[0].toUpperCase();
      
      if (sourceType !== targetType) {
        setError(`Column types don't match: ${sourceType} vs ${targetType}. FK requires compatible types.`);
        setShowRelationshipModal(false);
        setPendingConnection(null);
        return;
      }
      
      const constraintName = `fk_${targetTable.name}_${targetColumnName}_${Date.now()}`;
      const sql = `ALTER TABLE \`${targetTable.name}\` ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${targetColumnName}\`) REFERENCES \`${sourceTable.name}\`(\`${sourceColumnName}\`);`;
      
      console.log('✅ Creating FK constraint:', sql);
      await executeSQLToDatabase(sql);
      
      // Add to history
      addToHistory({
        description: `Created FK: ${targetTable.name}.${targetColumnName} → ${sourceTable.name}.${sourceColumnName}`,
        redoSQL: sql,
        undoSQL: `ALTER TABLE \`${targetTable.name}\` DROP FOREIGN KEY \`${constraintName}\`;`,
        timestamp: new Date().toISOString()
      });
      
      setSuccess('Foreign key constraint created in database');
      setShowRelationshipModal(false);
      setPendingConnection(null);
      
      // Refresh schema to get updated relationships
      const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔄 Refreshing schema after FK creation...');
        importSchema(data.schema);
      }
    } catch (error) {
      console.error('❌ Create FK error:', error);
      setError('Failed to create FK constraint: ' + error.message);
      setShowRelationshipModal(false);
      setPendingConnection(null);
    }
  };
  
  const handleVisualOnly = () => {
    if (!pendingConnection) return;
    
    const { sourceTable, targetTable, sourceColumnName, targetColumnName, params } = pendingConnection;
    
    // Create visual-only relationship
    const relationship = {
      id: `${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceTable: params.source,
      targetTable: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'step',
      animated: true,
      style: { stroke: '#dcdcaa', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#dcdcaa',
      },
      data: {
        sourceColumn: sourceColumnName,
        targetColumn: targetColumnName,
        isManual: true,
        visualOnly: true
      }
    };
    
    addRelationship(relationship);
    setSuccess('Visual relationship created (not in database)');
    setShowRelationshipModal(false);
    setPendingConnection(null);
  };
  
  const handleCancelConnection = () => {
    setShowRelationshipModal(false);
    setPendingConnection(null);
  };

  const onEdgesDelete = useCallback(
    async (edgesToDelete) => {
      for (const edge of edgesToDelete) {
        // Check if this is a database FK constraint
        if (edge.data?.isDatabaseFK && edge.data?.constraintName && connectionId) {
          try {
            // Get target table (the table that has the FK constraint)
            const targetTable = tables.find(t => t.id === edge.target);
            if (targetTable) {
              const sql = `ALTER TABLE \`${targetTable.name}\` DROP FOREIGN KEY \`${edge.data.constraintName}\`;`;
              
              console.log('Dropping FK constraint:', sql);
              await executeSQLToDatabase(sql);
              
              // Add to undo history (to recreate FK)
              const sourceTable = tables.find(t => t.id === edge.source);
              if (sourceTable) {
                const createSQL = `ALTER TABLE \`${targetTable.name}\` ADD CONSTRAINT \`${edge.data.constraintName}\` FOREIGN KEY (\`${edge.data.targetColumn}\`) REFERENCES \`${sourceTable.name}\`(\`${edge.data.sourceColumn}\`);`;
                
                addToHistory({
                  description: `Dropped FK: ${edge.data.constraintName}`,
                  redoSQL: sql,
                  undoSQL: createSQL,
                  timestamp: new Date().toISOString()
                });
              }
              
              setSuccess(`Foreign key constraint "${edge.data.constraintName}" dropped from database`);
              
              // Refresh schema
              const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
              if (response.ok) {
                const data = await response.json();
                importSchema(data.schema);
              }
            }
          } catch (error) {
            console.error('Drop FK error:', error);
            setError('Failed to drop FK constraint: ' + error.message);
          }
        } else {
          // Visual-only relationship, just remove from state
          deleteRelationship(edge.id);
        }
      }
    },
    [deleteRelationship, connectionId, tables, executeSQLToDatabase, addToHistory, setSuccess, setError, importSchema]
  );

  const handleNodeClick = useCallback((event, node) => {
    setSelectedTable(node.id);
  }, [setSelectedTable]);
  
  const handleEdgeClick = useCallback((event, edge) => {
    console.log('Edge clicked:', edge);
    event.stopPropagation();
    // ReactFlow automatically handles selection, just log for debugging
  }, []);
  
  const handleReconnect = useCallback(async (oldEdge, newConnection) => {
    console.log('Edge reconnected:', oldEdge, newConnection);
    setReconnectSucceeded(true); // Mark reconnection as successful
    
    // Remove old edge and its FK constraint if it exists
    if (oldEdge.data?.isDatabaseFK && oldEdge.data?.constraintName && connectionId) {
      try {
        const targetTable = tables.find(t => t.id === oldEdge.target);
        if (targetTable) {
          const sql = `ALTER TABLE \`${targetTable.name}\` DROP FOREIGN KEY \`${oldEdge.data.constraintName}\`;`;
          await executeSQLToDatabase(sql);
        }
      } catch (error) {
        console.error('Failed to drop old FK:', error);
      }
    }
    
    // Remove old relationship from state
    deleteRelationship(oldEdge.id);
    
    // Create new relationship with updated connection
    const params = {
      source: newConnection.source,
      target: newConnection.target,
      sourceHandle: newConnection.sourceHandle,
      targetHandle: newConnection.targetHandle
    };
    
    // Reuse onConnect logic to validate and create
    await onConnect(params);
  }, [tables, deleteRelationship, connectionId, executeSQLToDatabase, onConnect]);
  
  const handleReconnectStart = useCallback((event, edge, handleType) => {
    console.log('Reconnect started:', edge.id);
    setReconnectSucceeded(false); // Reset flag
  }, []);
  
  const handleReconnectEnd = useCallback(async (event, edge, handleType) => {
    console.log('Reconnect ended:', edge.id, 'succeeded:', reconnectSucceeded);
    
    // If reconnection didn't succeed, user dragged to empty space
    if (!reconnectSucceeded) {
      console.log('🗑️ Edge dragged to empty space, removing...');
      console.log('Edge data:', edge.data);
      
      // Remove from state and localStorage
      deleteRelationship(edge.id);
      
      // Try to drop FK constraint from database
      if (connectionId) {
        try {
          const sourceTable = tables.find(t => t.id === edge.source);
          const targetTable = tables.find(t => t.id === edge.target);
          
          if (sourceTable && targetTable) {
            const sourceColumnName = edge.sourceHandle?.split('-')[0];
            const targetColumnName = edge.targetHandle?.split('-')[0];
            
            if (sourceColumnName && targetColumnName) {
              // FAST PATH: If we have FK info in edge data, use it directly
              if (edge.data?.isDatabaseFK && edge.data?.constraintName) {
                const sql = `ALTER TABLE \`${targetTable.name}\` DROP FOREIGN KEY \`${edge.data.constraintName}\`;`;
                console.log('Dropping FK (fast path):', sql);
                
                await executeSQLToDatabase(sql);
                
                // Refresh table schema to update FK badges and counts
                await updateTableColumns(connectionId, targetTable.name);
                
                // Add to undo history
                if (edge.data.sourceColumn && edge.data.targetColumn) {
                  const createSQL = `ALTER TABLE \`${targetTable.name}\` ADD CONSTRAINT \`${edge.data.constraintName}\` FOREIGN KEY (\`${edge.data.targetColumn}\`) REFERENCES \`${sourceTable.name}\`(\`${edge.data.sourceColumn}\`);`;
                  
                  addToHistory({
                    description: `Dropped FK: ${edge.data.constraintName}`,
                    redoSQL: sql,
                    undoSQL: createSQL,
                    timestamp: new Date().toISOString()
                  });
                }
                
                setSuccess(`Foreign key "${edge.data.constraintName}" removed from database`);
                console.log('✅ FK dropped successfully (fast path)');
              }
              // FALLBACK PATH: Query database to find FK constraint
              else if (!edge.data?.visualOnly) {
                console.log('Querying database for FK constraint...');
                const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
                if (response.ok) {
                  const data = await response.json();
                  const targetTableSchema = data.schema.find(t => t.name === targetTable.name);
                  
                  if (targetTableSchema?.foreignKeys) {
                    const matchingFK = targetTableSchema.foreignKeys.find(fk => 
                      fk.COLUMN_NAME === targetColumnName &&
                      fk.REFERENCED_TABLE_NAME === sourceTable.name &&
                      fk.REFERENCED_COLUMN_NAME === sourceColumnName
                    );
                    
                    if (matchingFK) {
                      const sql = `ALTER TABLE \`${targetTable.name}\` DROP FOREIGN KEY \`${matchingFK.CONSTRAINT_NAME}\`;`;
                      console.log('Dropping FK (fallback path):', sql);
                      
                      await executeSQLToDatabase(sql);
                      
                      // Refresh table schema to update FK badges and counts
                      await updateTableColumns(connectionId, targetTable.name);
                      
                      // Add to undo history
                      const createSQL = `ALTER TABLE \`${targetTable.name}\` ADD CONSTRAINT \`${matchingFK.CONSTRAINT_NAME}\` FOREIGN KEY (\`${targetColumnName}\`) REFERENCES \`${sourceTable.name}\`(\`${sourceColumnName}\`);`;
                      
                      addToHistory({
                        description: `Dropped FK: ${matchingFK.CONSTRAINT_NAME}`,
                        redoSQL: sql,
                        undoSQL: createSQL,
                        timestamp: new Date().toISOString()
                      });
                      
                      setSuccess(`Foreign key "${matchingFK.CONSTRAINT_NAME}" removed from database`);
                      console.log('✅ FK dropped successfully (fallback path)');
                    } else {
                      setSuccess('Relationship removed (no FK found in database)');
                      console.log('⚠️ No matching FK found in database');
                    }
                  } else {
                    setSuccess('Relationship removed');
                    console.log('⚠️ No foreign keys in target table');
                  }
                } else {
                  setError('Failed to check FK constraints');
                  console.error('Failed to fetch schema');
                }
              }
              // Visual-only relationship
              else {
                setSuccess('Visual relationship removed');
                console.log('✅ Visual-only relationship removed');
              }
            }
          }
        } catch (error) {
          console.error('Failed to drop FK:', error);
          setError('Failed to remove FK: ' + error.message);
        }
      } else {
        setSuccess('Relationship removed');
        console.log('⚠️ No connection ID');
      }
    }
    
    // Reset flag
    setReconnectSucceeded(false);
  }, [reconnectSucceeded, deleteRelationship, tables, connectionId, executeSQLToDatabase, setSuccess, setError, addToHistory]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Delete table with Delete/Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTable) {
        // Only delete if not focused on input
        if (document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
          const table = tables.find(t => t.id === selectedTable);
          setConfirmDelete({ tableId: selectedTable, tableName: table?.name });
        }
      }

      // Fit view with F key
      if (e.key === 'f' && reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTable, tables, setSelectedTable, reactFlowInstance]);

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      deleteTable(confirmDelete.tableId);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex-1 bg-[#1e1e1e] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onReconnect={handleReconnect}
        onReconnectStart={handleReconnectStart}
        onReconnectEnd={handleReconnectEnd}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        elementsSelectable={true}
        selectNodesOnDrag={false}
        nodesConnectable={true}
        nodesDraggable={true}
        edgesFocusable={true}
        reconnectRadius={20}
        connectionLineType="step"
        onPaneClick={() => setSelectedTable(null)}
        defaultEdgeOptions={{
          type: 'step',
          animated: true,
          style: { stroke: '#4ec9b0', strokeWidth: 2 },
          interactionWidth: 20,
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left">
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => {
            return node.id === selectedTable ? '#4ec9b0' : '#569cd6';
          }}
          nodeBorderRadius={4}
          maskColor="rgba(30, 30, 30, 0.9)"
          style={{
            backgroundColor: '#1e1e1e',
            border: '1px solid #3a3a3a',
          }}
        />
        <Background 
          color="#3a3a3a" 
          gap={16} 
          size={1}
          variant="dots"
        />
      </ReactFlow>

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Table"
          message={`Are you sure you want to delete table "${confirmDelete.tableName}"? This action cannot be undone.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      
      {/* Create Relationship Modal */}
      {showRelationshipModal && pendingConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-[#3a3a3a]">
              <h2 className="text-sm font-semibold text-[#d4d4d4] font-mono">Create Relationship</h2>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="text-xs text-[#d4d4d4] font-mono">
                <div className="mb-2 text-[#808080]">Foreign Key Relationship:</div>
                <div className="bg-[#1e1e1e] p-3 rounded border border-[#3a3a3a]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#569cd6]">{pendingConnection.targetTable.name}</span>
                    <span className="text-[#808080]">.</span>
                    <span className="text-[#4ec9b0]">{pendingConnection.targetColumnName}</span>
                  </div>
                  <div className="text-center text-[#dcdcaa] my-1">↓</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#569cd6]">{pendingConnection.sourceTable.name}</span>
                    <span className="text-[#808080]">.</span>
                    <span className="text-[#4ec9b0]">{pendingConnection.sourceColumnName}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-[#808080] font-mono">
                Choose how to create this relationship:
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
              <button
                onClick={handleCancelConnection}
                className="flex-1 px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] text-xs font-mono text-[#d4d4d4]"
              >
                Cancel
              </button>
              <button
                onClick={handleVisualOnly}
                className="flex-1 px-4 py-2 bg-[#dcdcaa] text-[#1e1e1e] rounded hover:bg-[#569cd6] text-xs font-medium"
              >
                Visual Only
              </button>
              <button
                onClick={handleCreateFK}
                className="flex-1 px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded hover:bg-[#569cd6] text-xs font-medium"
              >
                Create FK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
