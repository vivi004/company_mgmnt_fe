import React from 'react';

interface StaffProfileModalProps {
    open: boolean;
    onClose: () => void;
    formData: {
        first_name: string;
        last_name: string;
        email: string;
    };
    setFormData: (data: any) => void;
    handleRequestSubmit: (e: React.FormEvent) => void;
    theme: string;
}

const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
    open, onClose, formData, setFormData, handleRequestSubmit, theme
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative rounded-[60px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 border hide-scrollbar ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="p-12 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-center mb-12 relative">
                        <div>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h2>
                            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Personal Node Modification</p>
                        </div>
                        <button onClick={onClose} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleRequestSubmit} className="space-y-8 relative">
                        <div className={`p-6 border rounded-[30px] flex items-start gap-4 mb-4 ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-50 border-blue-100'}`}>
                            <span className="text-2xl">⚡</span>
                            <p className={`text-xs font-bold leading-relaxed italic ${theme === 'dark' ? 'text-indigo-300' : 'text-blue-700'}`}>Changes submitted here will be queued for Admin approval. Your profile will update once confirmed.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">First Name</label>
                                <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Last Name</label>
                                <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Preferred Work Email</label>
                            <input required type="email" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-indigo-500/20 focus:border-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <button type="submit" className={`w-full text-white font-black py-7 rounded-[35px] shadow-2xl hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-blue-600 shadow-blue-600/40 hover:bg-blue-700'}`}>
                            Submit Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffProfileModal;
