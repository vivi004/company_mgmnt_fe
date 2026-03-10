import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeFormData, OrderLine } from '../../../types/DashboardTypes';

interface AdminEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingEmployee: Employee | null;
    formData: EmployeeFormData;
    setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
    theme: string;
    orderLines: OrderLine[];
}

const AdminEmployeeModal: React.FC<AdminEmployeeModalProps> = ({
    open, onClose, onSubmit, editingEmployee, formData, setFormData, theme, orderLines
}) => {
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open) setShowPassword(false);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative rounded-[60px] w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-[0_0_100px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="p-12">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className={`text-4xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {editingEmployee ? "Refine Personnel" : "Provision Node"}
                            </h2>
                            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Access Control Protocol</p>
                        </div>
                        <button onClick={onClose} className={`w-14 h-14 flex items-center justify-center rounded-3xl transition-all ${theme === 'dark' ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">First Name</label>
                            <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Last Name</label>
                            <input required type="text" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                        </div>
                        <div className="col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Communication Line (Email)</label>
                            <input required type="email" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">System Identity</label>
                            <input required type="text" placeholder="username" className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                                Security Key {editingEmployee && <span className="text-slate-400 normal-case">(leave blank to keep current)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    required={!editingEmployee}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={editingEmployee ? "Leave blank to keep current" : "Min. 6 characters"}
                                    className={`w-full rounded-[25px] px-8 py-5 pr-16 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-2xl transition-all
                                        ${theme === 'dark'
                                            ? 'text-slate-400 hover:text-blue-400 hover:bg-white/10'
                                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}

                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Role Matrix</label>
                            <select className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="Staff">Node Staff</option>
                                <option value="Admin">Core Admin</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Status</label>
                            <select className={`w-full rounded-[25px] px-8 py-5 border transition-all font-black text-sm focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="Suspended">Offline</option>
                            </select>
                        </div>

                        {formData.role === 'Staff' && (
                            <div className="col-span-2 space-y-3 mt-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Accessible Villages / Order Lines</label>
                                <div className={`p-6 rounded-[25px] border ${theme === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-slate-50 border-slate-200'} max-h-48 overflow-y-auto hide-scrollbar grid grid-cols-2 gap-3`}>
                                    {orderLines.map(ol => (
                                        <label key={ol.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                                            ${formData.accessible_orderlines.includes(ol.id)
                                                ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-blue-50 border-blue-300')
                                                : (theme === 'dark' ? 'bg-slate-800 border-transparent hover:bg-slate-700' : 'bg-white border-transparent hover:bg-slate-100')}`}>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded truncate accent-blue-600 cursor-pointer"
                                                checked={formData.accessible_orderlines.includes(ol.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(f => ({ ...f, accessible_orderlines: [...f.accessible_orderlines, ol.id] }));
                                                    } else {
                                                        setFormData(f => ({ ...f, accessible_orderlines: f.accessible_orderlines.filter(id => id !== ol.id) }));
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ol.name}</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{ol.node_id}</span>
                                            </div>
                                        </label>
                                    ))}
                                    {orderLines.length === 0 && (
                                        <div className="col-span-2 text-center py-4 text-xs font-bold text-slate-500 italic">No Order Lines available</div>
                                    )}
                                </div>
                            </div>
                        )}
                        <button type="submit" className="col-span-2 bg-blue-600 text-white font-black py-7 rounded-[35px] shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:-translate-y-2 active:scale-[0.98] mt-6 transition-all text-2xl uppercase tracking-[0.2em] italic">
                            {editingEmployee ? "Confirm Updates" : "Commit Provisioning"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEmployeeModal;
