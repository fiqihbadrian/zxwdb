import { create } from 'zustand';

export const useAppStore = create((set, get) => {
  // Load from sessionStorage for connection (clears on tab close)
  // Load from localStorage for tables/relationships (persists)
  const savedTables = localStorage.getItem('zxwdb_tables');
  const savedRelationships = localStorage.getItem('zxwdb_relationships');
  const savedConnection = sessionStorage.getItem('zxwdb_connection');
  
  // Parse saved connection
  let initialConnectionState = {
    connectionId: null,
    isConnected: false,
    connectionConfig: null,
  };
  
  if (savedConnection) {
    try {
      const parsed = JSON.parse(savedConnection);
      initialConnectionState = {
        connectionId: parsed.connectionId,
        isConnected: true,
        connectionConfig: parsed.connectionConfig,
      };
    } catch (e) {
      console.error('Failed to parse saved connection:', e);
    }
  }
  
  return {
  // Connection state
  ...initialConnectionState,
  currentDatabase: sessionStorage.getItem('zxwdb_currentDatabase') || null,
  showConnectionModal: false,

  // Canvas state
  viewMode: 'ERD', // 'ERD' or 'LRS'
  tables: savedTables ? JSON.parse(savedTables) : [],
  relationships: savedRelationships ? JSON.parse(savedRelationships) : [],
  
  // Undo/Redo history
  undoStack: [],
  redoStack: [],

  // UI state
  selectedTable: null,
  isLoading: false,
  error: null,

  // Actions
  setConnection: (connectionId, config) => {
    // Save to sessionStorage (clears on tab close)
    sessionStorage.setItem('zxwdb_connection', JSON.stringify({
      connectionId,
      connectionConfig: config
    }));
    
    set({ 
      connectionId, 
      isConnected: true, 
      connectionConfig: config,
      showConnectionModal: false
    }, false, 'setConnection');
  },
  
  setCurrentDatabase: (databaseName) => {
    sessionStorage.setItem('zxwdb_currentDatabase', databaseName);
    set({ currentDatabase: databaseName }, false, 'setCurrentDatabase');
  },

  disconnect: () => {
    // Clear from sessionStorage and localStorage
    sessionStorage.removeItem('zxwdb_connection');
    sessionStorage.removeItem('zxwdb_currentDatabase');
    localStorage.removeItem('zxwdb_tables');
    localStorage.removeItem('zxwdb_relationships');
    
    set({ 
      connectionId: null, 
      isConnected: false, 
      connectionConfig: null,
      currentDatabase: null,
      tables: [],
      relationships: [],
      undoStack: [],
      redoStack: [],
      showConnectionModal: false
    }, false, 'disconnect');
  },

  setConnectionModal: (show) => set({ showConnectionModal: show }, false, 'setConnectionModal'),

  setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
  
  // Execute SQL directly to database
  executeSQLToDatabase: async (sql) => {
    const state = get();
    if (!state.connectionId) {
      throw new Error('Not connected to database');
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/schema/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: state.connectionId,
          sql: sql
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // If connection not found, try to reconnect and retry
        if (error.error && error.error.includes('Connection not found')) {
          console.log('Connection lost, attempting to reconnect...');
          
          // Reconnect using stored config
          const newConnectionId = `conn-${Date.now()}`;
          const connectResponse = await fetch('http://localhost:3001/api/database/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connectionId: newConnectionId,
              config: state.connectionConfig
            })
          });
          
          if (connectResponse.ok) {
            // Update connection ID
            state.setConnection(newConnectionId, state.connectionConfig);
            
            // Retry the SQL execution
            const retryResponse = await fetch('http://localhost:3001/api/schema/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                connectionId: newConnectionId,
                sql: sql
              })
            });
            
            if (!retryResponse.ok) {
              const retryError = await retryResponse.json();
              throw new Error(retryError.error || 'Failed to execute SQL after reconnect');
            }
            
            return await retryResponse.json();
          } else {
            throw new Error('Failed to reconnect to database');
          }
        }
        
        throw new Error(error.error || 'Failed to execute SQL');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Execute SQL error:', error);
      throw error;
    }
  },
  
  // Add operation to undo history
  addToHistory: (operation) => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-19), operation], // Keep last 20
      redoStack: [] // Clear redo stack when new action is performed
    }));
  },
  
  clearHistory: () => {
    set({ undoStack: [], redoStack: [] });
  },
  
  // Undo last operation
  undo: async () => {
    const state = get();
    if (state.undoStack.length === 0) {
      set({ error: { message: 'Nothing to undo', type: 'info' } });
      return;
    }
    
    const operation = state.undoStack[state.undoStack.length - 1];
    
    try {
      // Execute reverse SQL
      console.log('Undoing:', operation.description);
      console.log('Executing:', operation.undoSQL);
      
      await state.executeSQLToDatabase(operation.undoSQL);
      
      // Refresh schema
      const response = await fetch(`http://localhost:3001/api/schema/complete/${state.connectionId}`);
      if (response.ok) {
        const data = await response.json();
        state.importSchema(data.schema);
      }
      
      // Move operation to redo stack
      set((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, operation],
        error: { message: `Undone: ${operation.description}`, type: 'success' }
      }));
    } catch (error) {
      console.error('Undo error:', error);
      set({ error: { message: 'Failed to undo: ' + error.message, type: 'error' } });
    }
  },
  
  // Redo last undone operation
  redo: async () => {
    const state = get();
    if (state.redoStack.length === 0) {
      set({ error: { message: 'Nothing to redo', type: 'info' } });
      return;
    }
    
    const operation = state.redoStack[state.redoStack.length - 1];
    
    try {
      // Execute original SQL
      console.log('Redoing:', operation.description);
      console.log('Executing:', operation.redoSQL);
      
      await state.executeSQLToDatabase(operation.redoSQL);
      
      // Refresh schema
      const response = await fetch(`http://localhost:3001/api/schema/complete/${state.connectionId}`);
      if (response.ok) {
        const data = await response.json();
        state.importSchema(data.schema);
      }
      
      // Move operation back to undo stack
      set((state) => ({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, operation],
        error: { message: `Redone: ${operation.description}`, type: 'success' }
      }));
    } catch (error) {
      console.error('Redo error:', error);
      set({ error: { message: 'Failed to redo: ' + error.message, type: 'error' } });
    }
  },

  setTables: (tables) => {
    set({ tables }, false, 'setTables');
    // Save to localStorage
    localStorage.setItem('zxwdb_tables', JSON.stringify(tables));
  },

  addTable: (table) => {
    set((state) => {
      const newTables = [...state.tables, table];
      // Save to localStorage
      localStorage.setItem('zxwdb_tables', JSON.stringify(newTables));
      return { 
        tables: newTables,
        error: { message: `Table "${table.name}" created successfully`, type: 'success' }
      };
    });
  },

  updateTable: (tableId, updates) => set((state) => ({
    tables: state.tables.map(t => 
      t.id === tableId ? { ...t, ...updates } : t
    )
  })),

  deleteTable: async (tableId) => {
    const state = get();
    const table = state.tables.find(t => t.id === tableId);
    
    if (!table) {
      set({ error: { message: 'Table not found', type: 'error' } });
      return;
    }
    
    // If connected to database, execute DROP TABLE
    if (state.connectionId) {
      try {
        // Generate CREATE TABLE SQL for undo
        const columnDefs = table.columns.map(col => {
          const colName = col.name || col.Field;
          const colType = col.type || col.Type;
          let def = `\`${colName}\` ${colType}`;
          if (col.notNull || col.Null === 'NO') def += ' NOT NULL';
          if (col.autoIncrement || col.Extra?.includes('auto_increment')) def += ' AUTO_INCREMENT';
          return def;
        }).join(', ');
        
        const primaryKeys = table.columns
          .filter(c => c.primaryKey || c.Key === 'PRI' || c.key === 'PRI')
          .map(c => `\`${c.name || c.Field}\``)
          .join(', ');
        const pkConstraint = primaryKeys ? `, PRIMARY KEY (${primaryKeys})` : '';
        
        const createSQL = `CREATE TABLE \`${table.name}\` (${columnDefs}${pkConstraint});`;
        const dropSQL = `DROP TABLE \`${table.name}\`;`;
        
        console.log('Executing DROP TABLE:', dropSQL);
        
        await state.executeSQLToDatabase(dropSQL);
        
        // Add to undo history
        state.addToHistory({
          description: `Deleted table "${table.name}"`,
          redoSQL: dropSQL,
          undoSQL: createSQL,
          timestamp: new Date().toISOString()
        });
        
        // Refresh schema from database
        const response = await fetch(`http://localhost:3001/api/schema/complete/${state.connectionId}`);
        if (response.ok) {
          const data = await response.json();
          state.importSchema(data.schema);
        }
        
        set({ 
          selectedTable: state.selectedTable === tableId ? null : state.selectedTable,
          error: { message: `Table "${table.name}" deleted from database`, type: 'success' }
        });
      } catch (error) {
        console.error('Delete table error:', error);
        set({ error: { message: 'Failed to delete table: ' + error.message, type: 'error' } });
      }
    } else {
      // Not connected - just remove from local state
      set((state) => {
        const newTables = state.tables.filter(t => t.id !== tableId);
        const newRelationships = state.relationships.filter(r => 
          r.sourceTable !== tableId && r.targetTable !== tableId
        );
        localStorage.setItem('zxwdb_tables', JSON.stringify(newTables));
        localStorage.setItem('zxwdb_relationships', JSON.stringify(newRelationships));
        return {
          tables: newTables,
          relationships: newRelationships,
          selectedTable: state.selectedTable === tableId ? null : state.selectedTable,
          error: { message: `Table "${table?.name}" deleted`, type: 'info' }
        };
      });
    }
  },

  addRelationship: (relationship) => {
    set((state) => {
      const newRelationships = [...state.relationships, relationship];
      // Save to localStorage
      localStorage.setItem('zxwdb_relationships', JSON.stringify(newRelationships));
      return { relationships: newRelationships };
    });
  },

  deleteRelationship: (relationshipId) => {
    set((state) => {
      const newRelationships = state.relationships.filter(r => r.id !== relationshipId);
      // Save to localStorage
      localStorage.setItem('zxwdb_relationships', JSON.stringify(newRelationships));
      return { relationships: newRelationships };
    });
  },
  
  updateTableColumns: async (connectionId, tableName) => {
    console.log(`🔄 Updating table columns for: ${tableName}`);
    try {
      // Fetch fresh table schema
      const response = await fetch(`http://localhost:3001/api/schema/complete/${connectionId}`);
      if (!response.ok) throw new Error('Failed to fetch schema');
      
      const data = await response.json();
      console.log(`📊 Schema fetched, tables:`, data.schema.map(t => t.name));
      
      const tableSchema = data.schema.find(t => t.name === tableName);
      console.log(`📋 Table schema for ${tableName}:`, tableSchema);
      
      if (tableSchema) {
        console.log(`🔑 Foreign keys in ${tableName}:`, tableSchema.foreignKeys);
        console.log(`📦 Columns:`, tableSchema.columns.map(c => `${c.Field} (Key: ${c.Key})`));
        
        set((state) => {
          const newTables = state.tables.map(table => {
            if (table.name === tableName) {
              const updated = {
                ...table,
                columns: tableSchema.columns.map(col => ({
                  name: col.Field,
                  type: col.Type,
                  nullable: col.Null === 'YES',
                  key: col.Key,
                  default: col.Default,
                  extra: col.Extra
                })),
                foreignKeys: tableSchema.foreignKeys || [] // Update foreignKeys array!
              };
              console.log(`✅ Updated table ${tableName}:`, updated);
              return updated;
            }
            return table;
          });
          
          // Save to localStorage
          localStorage.setItem('zxwdb_tables', JSON.stringify(newTables));
          console.log(`💾 Saved to localStorage`);
          return { tables: newTables };
        });
      } else {
        console.error(`❌ Table ${tableName} not found in schema`);
      }
    } catch (error) {
      console.error('❌ Failed to update table columns:', error);
    }
  },

  setSelectedTable: (tableId) => set({ selectedTable: tableId }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setError: (message, type = 'error') => set({ 
    error: typeof message === 'string' ? { message, type } : message 
  }),

  setSuccess: (message) => set({ 
    error: { message, type: 'success' } 
  }),

  setInfo: (message) => set({ 
    error: { message, type: 'info' } 
  }),

  clearError: () => set({ error: null }),

  // Import schema from database
  importSchema: (schema) => {
    console.log('📥 importSchema called');
    console.log('📊 Schema length:', schema?.length);
    console.log('📦 Schema data:', schema);
    
    // Calculate better positions - spread tables in a cleaner grid
    const gridCols = 3; // 3 tables per row
    const horizontalSpacing = 400; // More space between tables
    const verticalSpacing = 350;
    const startX = 150;
    const startY = 100;
    
    const tables = schema.map((table, index) => ({
      id: table.name, // Use table name as ID for easier foreign key mapping
      name: table.name,
      columns: table.columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      })),
      foreignKeys: table.foreignKeys || [], // Include foreignKeys array!
      position: { 
        x: startX + (index % gridCols) * horizontalSpacing, 
        y: startY + Math.floor(index / gridCols) * verticalSpacing 
      }
    }));

    // Create relationships from foreign keys
    const relationships = [];
    const addedRelationships = new Set();

    // 1. Add relationships from explicit foreign key constraints
    schema.forEach((table) => {
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach((fk) => {
          const targetTable = schema.find(t => t.name === fk.REFERENCED_TABLE_NAME);
          if (targetTable) {
            const relId = `${fk.REFERENCED_TABLE_NAME}-${fk.REFERENCED_COLUMN_NAME}-${table.name}-${fk.COLUMN_NAME}`;
            if (!addedRelationships.has(relId)) {
              relationships.push({
                id: relId,
                source: fk.REFERENCED_TABLE_NAME,  // Parent table (has PK)
                target: table.name,                 // Child table (has FK)
                sourceHandle: `${fk.REFERENCED_COLUMN_NAME}-right-source`,
                targetHandle: `${fk.COLUMN_NAME}-left-target`,
                type: 'step',
                animated: true,
                style: { stroke: '#4ec9b0', strokeWidth: 2 },
                markerEnd: {
                  type: 'arrowclosed',
                  color: '#4ec9b0',
                },
                label: fk.CONSTRAINT_NAME || `FK: ${fk.COLUMN_NAME}`,
                labelStyle: { fill: '#4ec9b0', fontSize: 10 },
                labelBgStyle: { fill: '#2d2d2d' },
                data: {
                  constraintName: fk.CONSTRAINT_NAME,
                  sourceColumn: fk.REFERENCED_COLUMN_NAME,
                  targetColumn: fk.COLUMN_NAME,
                  isDatabaseFK: true
                }
              });
              addedRelationships.add(relId);
            }
          }
        });
      }
    });

    // 2. Auto-detect relationships based on naming conventions
    // Pattern: kd_xxx or id_xxx in one table -> xxx table with kd_xxx or id_xxx as PK
    console.log('🔍 Starting smart relationship detection...');
    schema.forEach((table) => {
      console.log(`📋 Checking table: ${table.name}`);
      table.columns.forEach((col) => {
        const colName = col.Field;
        
        // Check if column name suggests a foreign key (starts with kd_ or id_)
        const fkMatch = colName.match(/^(kd_|id_)(\w+)$/);
        if (fkMatch) {
          const prefix = fkMatch[1]; // 'kd_' or 'id_'
          const referencedTableName = fkMatch[2]; // e.g., 'prodi'
          console.log(`  🔗 Found potential FK: ${colName} -> looking for table '${referencedTableName}'`);
          
          // Look for a table with this name
          const targetTable = schema.find(t => t.name.toLowerCase() === referencedTableName.toLowerCase());
          
          if (targetTable && targetTable.name !== table.name) {  // Prevent self-reference
            console.log(`  ✅ Found target table: ${targetTable.name}`);
            console.log(`  🔎 Looking for PK column '${colName}' in ${targetTable.name}`);
            console.log(`  📊 Target table columns:`, targetTable.columns.map(c => `${c.Field} (Key: ${c.Key})`));
            
            // Check if target table has a matching PK column
            const targetPK = targetTable.columns.find(c => 
              c.Field === colName && c.Key === 'PRI'
            );
            
            if (targetPK) {
              console.log(`  🎯 Match! Creating relationship: ${targetTable.name}.${targetPK.Field} -> ${table.name}.${colName}`);
              console.log(`  📍 Source handle: ${targetPK.Field}-right-source`);
              console.log(`  📍 Target handle: ${colName}-left-target`);
              const relId = `${targetTable.name}-${targetPK.Field}-${table.name}-${colName}`;
              
              // Check if this relationship already exists as explicit FK (don't duplicate)
              if (!addedRelationships.has(relId)) {
                // Check if there's an actual FK constraint in database for this inferred relationship
                const actualFK = table.foreignKeys?.find(fk => 
                  fk.COLUMN_NAME === colName &&
                  fk.REFERENCED_TABLE_NAME === targetTable.name &&
                  fk.REFERENCED_COLUMN_NAME === targetPK.Field
                );
                
                if (actualFK) {
                  // This inferred relationship has an actual FK constraint
                  // Mark it as database FK (will be handled by explicit FK section above)
                  console.log(`  ⚠️ Skipping - already added as explicit FK: ${actualFK.CONSTRAINT_NAME}`);
                } else {
                  // Pure inferred relationship (no FK in database)
                  relationships.push({
                    id: relId,
                    source: targetTable.name,  // FROM parent table (PK)
                    target: table.name,        // TO child table (FK)
                    sourceHandle: `${targetPK.Field}-right-source`,  // Use right-side source handle
                    targetHandle: `${colName}-left-target`,          // Use left-side target handle
                    type: 'step',
                    animated: true,
                    style: { stroke: '#dcdcaa', strokeWidth: 2, strokeDasharray: '5,5' },
                    markerEnd: {
                      type: 'arrowclosed',
                      color: '#dcdcaa',
                    },
                    label: `${targetTable.name}.${targetPK.Field} → ${table.name}.${colName}`,
                    labelStyle: { fill: '#dcdcaa', fontSize: 10, fontWeight: 'bold' },
                    labelBgStyle: { fill: '#2d2d2d', fillOpacity: 0.8 },
                    data: {
                      visualOnly: true // Pure visual, no FK in database
                    }
                  });
                  addedRelationships.add(relId);
                  console.log(`  ✨ Visual-only relationship added!`);
                }
              }
            } else {
              console.log(`  ❌ No matching PK found in ${targetTable.name}`);
            }
          } else {
            console.log(`  ❌ Target table '${referencedTableName}' not found`);
          }
        }
      });
    });
    console.log(`🎉 Smart detection complete. Total relationships found: ${relationships.length}`);
    console.log('Relationships:', relationships);

    set({ tables, relationships });
    
    // Save to localStorage
    localStorage.setItem('zxwdb_tables', JSON.stringify(tables));
    localStorage.setItem('zxwdb_relationships', JSON.stringify(relationships));
  }
};
});
