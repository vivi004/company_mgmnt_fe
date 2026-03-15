import React from 'react';
import type { OrderLine } from '../../../types/DashboardTypes';

interface AdminOrderLineModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingOl: OrderLine | null;
    olFormData: { name: string; node_id: string };
    setOlFormData: React.Dispatch<React.SetStateAction<{ name: string; node_id: string }>>;
    theme: string;
}

const AdminOrderLineModal: React.FC<AdminOrderLineModalProps> = ({
    open, onClose, onSubmit, editingOl, olFormData, setOlFormData, theme
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative rounded-[60px] w-full max-w-xl shadow-[0_0_100px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-500 border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="p-12">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {editingOl ? "Refine Sector" : "Deploy Sector"}
                            </h2>
                            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Network Configuration Protocol</p>
                        </div>
                        <button onClick={onClose} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Village Name</label>
                            <input required type="text" placeholder="Enter Sector Name" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={olFormData.name} onChange={e => setOlFormData({ ...olFormData, name: e.target.value })} />
                        </div>

                        <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[30px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 transition-all mt-8">
                            {editingOl ? "Confirm Configuration" : "Establish Node"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderLineModal;
