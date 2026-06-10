import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded border border-[#3a3a3a] shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#dcdcaa]" />
            <h2 className="text-sm font-semibold text-[#d4d4d4] font-mono">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-[#808080] hover:text-[#d4d4d4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-[#d4d4d4] font-mono">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-[#3a3a3a]">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[#3a3a3a] rounded hover:bg-[#1e1e1e] text-xs font-mono text-[#d4d4d4]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#f48771] text-[#1e1e1e] rounded hover:bg-[#ff6b6b] text-xs font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
