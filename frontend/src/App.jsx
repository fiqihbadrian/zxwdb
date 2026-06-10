import { Database, Plus, Download, Upload, Book } from 'lucide-react';
import { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import ConnectionModal from './components/ConnectionModal';
import DatabaseSelectionPage from './components/DatabaseSelectionPage';
import Toolbar from './components/Toolbar';
import TableDetailsPanel from './components/TableDetailsPanel';
import Toast from './components/Toast';
import ShortcutOverlay from './components/ShortcutOverlay';
import DocsModal from './components/DocsModal';
import { useAppStore } from './stores/appStore';

function App() {
  const { isConnected, viewMode, showConnectionModal, setConnectionModal, connectionConfig, setShowAddTableModal, setShowDataBrowser, setShowSQLPreviewModal } = useAppStore();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cmdHoldTimer, setCmdHoldTimer] = useState(null);
  const [showDocs, setShowDocs] = useState(false);

  // Keyboard shortcuts implementation
  useEffect(() => {
    const handleShortcuts = (e) => {
      // Prevent shortcuts when typing in input/textarea (except ESC)
      if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.key !== 'Escape') {
        return;
      }

      // ESC - Universal close/cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        
        // Priority 1: Close any open modal
        const closeButtons = document.querySelectorAll('[data-close-modal], button[title*="Close"], button:has(svg.lucide-x)');
        const visibleCloseBtn = Array.from(closeButtons).find(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0; // Check if visible
        });
        
        if (visibleCloseBtn) {
          visibleCloseBtn.click();
          return;
        }
        
        // Priority 2: Cancel edit mode (if in DataBrowser editing)
        const cancelEditBtn = document.querySelector('button[title="Cancel"]');
        if (cancelEditBtn) {
          cancelEditBtn.click();
          return;
        }
        
        // Priority 3: Deselect table
        const { selectedTable, setSelectedTable } = useAppStore.getState();
        if (selectedTable) {
          setSelectedTable(null);
        }
        
        return;
      }

      // Cmd+K or Ctrl+K - Quick search (focus sidebar search)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Cmd+B or Ctrl+B - Browse data (click button)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        const browseBtn = document.querySelector('button[title*="Browse"]');
        if (browseBtn) browseBtn.click();
      }

      // Cmd+N or Ctrl+N - New table (click button)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        const addBtn = document.querySelector('button[title*="Add"]');
        if (addBtn) addBtn.click();
      }

      // Cmd+P or Ctrl+P - Preview SQL (click button)
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        const sqlBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Preview SQL'));
        if (sqlBtn) sqlBtn.click();
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [isConnected]);

  // Detect Cmd/Ctrl hold for shortcut overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Meta' || e.key === 'Control') && !cmdHoldTimer) {
        const timer = setTimeout(() => {
          setShowShortcuts(true);
        }, 500); // Show after holding for 500ms
        setCmdHoldTimer(timer);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        if (cmdHoldTimer) {
          clearTimeout(cmdHoldTimer);
          setCmdHoldTimer(null);
        }
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (cmdHoldTimer) clearTimeout(cmdHoldTimer);
    };
  }, [cmdHoldTimer]);

  // Check if connected but no database selected
  const showDatabaseSelection = isConnected && !connectionConfig?.database;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b border-[#3a3a3a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[#4ec9b0]" />
          <h1 className="text-lg font-semibold text-[#d4d4d4] tracking-wide">zxwdb</h1>
          <span className="text-xs text-[#808080] font-mono">Visual Database Designer</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocs(true)}
            className="px-3 py-1.5 text-[#d4d4d4] hover:bg-[#1e1e1e] rounded font-medium transition-colors flex items-center gap-2 text-xs border border-transparent hover:border-[#3a3a3a]"
          >
            <Book className="w-4 h-4" />
            Docs
          </button>
          {!isConnected && (
            <button
              onClick={() => setConnectionModal(true)}
              className="px-4 py-2 bg-[#4ec9b0] text-[#1e1e1e] rounded font-medium hover:bg-[#569cd6] transition-colors flex items-center gap-2 text-xs"
            >
              <Database className="w-4 h-4" />
              Connect to Database
            </button>
          )}
          {isConnected && (
            <span className="text-xs text-[#89d185] font-medium font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-[#89d185] rounded-full animate-pulse"></span>
              Connected
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showDatabaseSelection ? (
          <DatabaseSelectionPage />
        ) : isConnected ? (
          <>
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col relative">
              <Toolbar />
              <Canvas />
              <TableDetailsPanel />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center max-w-2xl px-6">
              <Database className="w-20 h-20 text-[#4ec9b0] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-[#d4d4d4] mb-3 font-mono">
                Welcome to zxwdb
              </h2>
              <p className="text-[#808080] mb-8 text-base leading-relaxed">
                Visual Database Designer for MySQL/MariaDB<br/>
                Design, visualize, and manage your database schema with ease
              </p>
              
              <div className="flex gap-3 justify-center mb-12">
                <button
                  onClick={() => setConnectionModal(true)}
                  className="px-6 py-3 bg-[#4ec9b0] text-[#1e1e1e] rounded-lg font-semibold hover:bg-[#5ed9c0] transition-colors inline-flex items-center gap-2 shadow-lg"
                >
                  <Database className="w-5 h-5" />
                  Connect to Database
                </button>
                <button
                  onClick={() => setShowDocs(true)}
                  className="px-6 py-3 bg-[#2d2d2d] text-[#d4d4d4] rounded-lg font-semibold hover:bg-[#3a3a3a] transition-colors inline-flex items-center gap-2 border border-[#3a3a3a]"
                >
                  <Book className="w-5 h-5" />
                  View Documentation
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-6 border border-[#3a3a3a] rounded-lg bg-[#2d2d2d] hover:border-[#4ec9b0] transition-colors">
                  <div className="w-12 h-12 bg-[#4ec9b0] bg-opacity-20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Database className="w-6 h-6 text-[#4ec9b0]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[#d4d4d4] text-sm">Import Existing Schema</h3>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    Auto-detect tables, columns, and FK relationships from your database
                  </p>
                </div>
                <div className="p-6 border border-[#3a3a3a] rounded-lg bg-[#2d2d2d] hover:border-[#569cd6] transition-colors">
                  <div className="w-12 h-12 bg-[#569cd6] bg-opacity-20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Plus className="w-6 h-6 text-[#569cd6]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[#d4d4d4] text-sm">Design Visually</h3>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    Create tables, relationships, and manage data with intuitive UI
                  </p>
                </div>
                <div className="p-6 border border-[#3a3a3a] rounded-lg bg-[#2d2d2d] hover:border-[#dcdcaa] transition-colors">
                  <div className="w-12 h-12 bg-[#dcdcaa] bg-opacity-20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Upload className="w-6 h-6 text-[#dcdcaa]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[#d4d4d4] text-sm">Auto-Save to Database</h3>
                  <p className="text-xs text-[#808080] leading-relaxed">
                    All changes sync to your database immediately with undo/redo support
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal onClose={() => setConnectionModal(false)} />
      )}

      {/* Docs Modal */}
      {showDocs && (
        <DocsModal onClose={() => setShowDocs(false)} />
      )}

      {/* Shortcut Overlay */}
      <ShortcutOverlay show={showShortcuts} />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default App;
