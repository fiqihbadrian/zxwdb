import { Command, Undo, Redo, Plus, Trash2, Database, Search, Maximize, Eye, Code } from 'lucide-react';

const ShortcutOverlay = ({ show }) => {
  if (!show) return null;

  const shortcuts = [
    { category: 'Canvas', items: [
      { keys: ['F'], desc: 'Fit view to screen', icon: <Maximize className="w-4 h-4" /> },
      { keys: ['Delete'], desc: 'Delete selected', icon: <Trash2 className="w-4 h-4" /> },
      { keys: ['Cmd', 'Z'], desc: 'Undo', icon: <Undo className="w-4 h-4" /> },
      { keys: ['Cmd', 'Shift', 'Z'], desc: 'Redo', icon: <Redo className="w-4 h-4" /> },
    ]},
    { category: 'Actions', items: [
      { keys: ['Cmd', 'N'], desc: 'New table', icon: <Plus className="w-4 h-4" /> },
      { keys: ['Cmd', 'B'], desc: 'Browse data', icon: <Database className="w-4 h-4" /> },
      { keys: ['Cmd', 'K'], desc: 'Quick search', icon: <Search className="w-4 h-4" /> },
      { keys: ['Cmd', 'P'], desc: 'Preview SQL', icon: <Code className="w-4 h-4" /> },
    ]},
    { category: 'Navigation', items: [
      { keys: ['Esc'], desc: 'Close modal/panel', icon: <Eye className="w-4 h-4" /> },
      { keys: ['Tab'], desc: 'Next field', icon: null },
      { keys: ['Shift', 'Tab'], desc: 'Previous field', icon: null },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] pointer-events-none">
      <div className="bg-[#1e1e1e] rounded-lg border-2 border-[#4ec9b0] shadow-2xl p-6 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#4ec9b0] bg-opacity-20 rounded-lg">
            <Command className="w-6 h-6 text-[#4ec9b0]" />
          </div>
          <h2 className="text-xl font-bold text-[#d4d4d4] font-mono">Keyboard Shortcuts</h2>
        </div>

        <div className="space-y-6">
          {shortcuts.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-[#4ec9b0] mb-3 font-mono uppercase tracking-wider">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between p-2 bg-[#2d2d2d] rounded hover:bg-[#3a3a3a] transition-colors">
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-[#808080]">{item.icon}</span>}
                      <span className="text-sm text-[#d4d4d4] font-mono">{item.desc}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 bg-[#1e1e1e] border border-[#3a3a3a] rounded text-xs font-mono text-[#d4d4d4] shadow-sm">
                            {key === 'Cmd' ? '⌘' : key === 'Shift' ? '⇧' : key === 'Ctrl' ? 'Ctrl' : key}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && <span className="text-[#808080] text-xs">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
          <p className="text-xs text-[#808080] text-center font-mono">
            Hold <kbd className="px-1.5 py-0.5 bg-[#2d2d2d] border border-[#3a3a3a] rounded">⌘</kbd> or <kbd className="px-1.5 py-0.5 bg-[#2d2d2d] border border-[#3a3a3a] rounded">Ctrl</kbd> to show this overlay
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutOverlay;
