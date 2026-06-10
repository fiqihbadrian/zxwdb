import { X, Book, Zap, Database, Mouse, Keyboard, Eye, Code } from 'lucide-react';

const DocsModal = ({ onClose }) => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <Zap className="w-5 h-5" />,
      content: [
        { subtitle: '1. Connect to Database', text: 'Click "Connect to Database" and enter your MySQL/MariaDB credentials.' },
        { subtitle: '2. Select Database', text: 'Choose an existing database or create a new one.' },
        { subtitle: '3. Import or Design', text: 'Import existing schema automatically or start designing new tables.' },
      ]
    },
    {
      title: 'Visual Designer',
      icon: <Mouse className="w-5 h-5" />,
      content: [
        { subtitle: 'Add Tables', text: 'Click "+ Add Table" or press Cmd+N to create new tables.' },
        { subtitle: 'Edit Tables', text: 'Click a table to view details, then click "Edit Structure" to modify columns.' },
        { subtitle: 'Create Relationships', text: 'Drag from a column handle to another column to create FK relationships.' },
        { subtitle: 'Delete Items', text: 'Select a table and press Delete key, or drag relationship arrow to empty space.' },
      ]
    },
    {
      title: 'Data Management',
      icon: <Database className="w-5 h-5" />,
      content: [
        { subtitle: 'Browse Data', text: 'Click "Browse Data" (Cmd+B) to view and edit table data.' },
        { subtitle: 'Insert Rows', text: 'Click "Add Row" button, fill in values, and save.' },
        { subtitle: 'Edit Data', text: 'Click Edit icon, modify values, then Save or Cancel (ESC).' },
        { subtitle: 'View Related', text: 'Click "Related" button to see parent records (FK relationships).' },
      ]
    },
    {
      title: 'Query & Test',
      icon: <Code className="w-5 h-5" />,
      content: [
        { subtitle: 'Run Queries', text: 'In Browse Data → Query tab, run JOIN and aggregation queries.' },
        { subtitle: 'Quick Templates', text: 'Click suggested queries on the left to auto-fill SQL.' },
        { subtitle: 'Verify Relationships', text: 'Use "Verify FK" templates to test relationship integrity.' },
        { subtitle: 'Preview SQL', text: 'Press Cmd+P to see generated DDL for your schema.' },
      ]
    },
    {
      title: 'Keyboard Shortcuts',
      icon: <Keyboard className="w-5 h-5" />,
      content: [
        { subtitle: 'Hold Cmd/Ctrl', text: 'Show all available shortcuts overlay.' },
        { subtitle: 'Cmd+Z / Cmd+Shift+Z', text: 'Undo and Redo operations.' },
        { subtitle: 'Cmd+B / Cmd+N / Cmd+P', text: 'Browse Data, New Table, Preview SQL.' },
        { subtitle: 'ESC', text: 'Close modals, cancel edit, or deselect.' },
        { subtitle: 'F / Delete', text: 'Fit view to screen, Delete selected table.' },
      ]
    },
    {
      title: 'Features',
      icon: <Eye className="w-5 h-5" />,
      content: [
        { subtitle: 'Auto-Save', text: 'All changes are saved to database immediately (like MySQL Workbench).' },
        { subtitle: 'Relationship Detection', text: 'Automatically detects FK constraints from existing database.' },
        { subtitle: 'Cardinality Badges', text: 'Shows N:1, 1:N relationship types with badges.' },
        { subtitle: 'Undo/Redo', text: 'Full undo/redo support for schema and data operations.' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-4/5 h-5/6 rounded-lg flex flex-col border border-[#3a3a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4ec9b0] bg-opacity-20 rounded-lg">
              <Book className="w-6 h-6 text-[#4ec9b0]" />
            </div>
            <h2 className="text-xl font-bold text-[#d4d4d4] font-mono">Documentation</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#808080] hover:text-[#d4d4d4] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-[#2d2d2d] rounded-lg p-6 border border-[#3a3a3a]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[#4ec9b0]">{section.icon}</span>
                  <h3 className="text-lg font-semibold text-[#d4d4d4] font-mono">{section.title}</h3>
                </div>
                <div className="space-y-3">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <h4 className="text-sm font-semibold text-[#569cd6] mb-1 font-mono">{item.subtitle}</h4>
                      <p className="text-sm text-[#808080] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3a3a3a] bg-[#2d2d2d]">
          <p className="text-xs text-center text-[#808080] font-mono">
            zxwdb - Visual Database Designer &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
