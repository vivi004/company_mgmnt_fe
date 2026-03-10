import React from 'react';

interface StaffSectorModalProps {
    open: boolean;
    onClose: () => void;
    newSector: {
        name: string;
        node_id: string;
    };
    setNewSector: (sector: any) => void;
    handleAddSector: (e: React.FormEvent) => void;
    theme: string;
}

const StaffSectorModal: React.FC<StaffSectorModalProps> = ({
    open, onClose, newSector, setNewSector, handleAddSector, theme
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative rounded-[60px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-500 border hide-scrollbar ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="p-12 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-center mb-12 relative">
                        <div>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Provision Sector</h2>
                            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Territorial Expansion Protocol</p>
                        </div>
                        <button onClick={onClose} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleAddSector} className="space-y-8 relative">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Village Sector Name</label>
                            <input required type="text" placeholder="e.g. Emerald Valley" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={newSector.name} onChange={e => setNewSector({ ...newSector, name: e.target.value })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Operational Node ID</label>
                            <input required type="text" placeholder="e.g. SEC-1010" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`} value={newSector.node_id} onChange={e => setNewSector({ ...newSector, node_id: e.target.value })} />
                        </div>
                        <button type="submit" className={`w-full text-white font-black py-7 rounded-[35px] shadow-2xl hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700' : 'bg-emerald-600 shadow-emerald-600/40 hover:bg-emerald-700'}`}>
                            Activate Sector
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffSectorModal;
