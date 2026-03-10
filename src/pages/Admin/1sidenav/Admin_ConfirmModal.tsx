import React from 'react';

interface ConfirmModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    theme: string;
}

const AdminConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onClose, theme }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
            <div className={`relative rounded-3xl w-full max-w-md shadow-2xl border p-8 ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="flex-grow">
                        <h3 className={`text-lg font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Confirm Action</h3>
                        <p className="text-slate-500 text-sm font-medium">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onClose(); onConfirm(); }}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-600/30"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminConfirmModal;
