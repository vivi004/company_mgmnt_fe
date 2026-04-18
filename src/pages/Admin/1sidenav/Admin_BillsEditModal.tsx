import React from 'react';
import { getAllProducts } from '../../../constants/productData';
import type { Bill } from '../../../utils/invoiceGenerator';

interface AdminBillsEditModalProps {
    open: boolean;
    onClose: () => void;
    editingBill: Bill | null;
    editCart: Record<string, number>;
    setEditCart: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    editRates: Record<string, number>;
    setEditRates: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedCategory: string;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
    handleSaveEdit: () => void;
    getTotal: (cart: Record<string, number>, customRates?: Record<string, number>) => number;
    getItemCount: (cart: Record<string, number>) => number;
    theme: string;
}

const AdminBillsEditModal: React.FC<AdminBillsEditModalProps> = ({
    open, onClose, editingBill, editCart, setEditCart, editRates, setEditRates,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    handleSaveEdit, getTotal, getItemCount, theme
}) => {
    if (!open || !editingBill) return null;
    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className={`relative rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                {/* Header */}
                <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Invoice No: {editingBill.invoiceNo}</h2>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">{editingBill.shopName} - {editingBill.villageName}</p>
                    </div>
                    <button onClick={onClose} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filters */}
                <div className={`px-8 pb-4 flex gap-4 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="relative flex-1">
                        <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full rounded-[20px] pl-10 pr-5 py-3 text-sm font-bold border outline-none transition-all
                                        ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-300'}`}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className={`rounded-[20px] px-5 py-3 text-sm font-bold border outline-none cursor-pointer transition-all
                                    ${isDark ? 'bg-slate-800/50 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 hover:border-slate-300'}`}
                    >
                        <option value="All">All Categories</option>
                        {Array.from(new Set(getAllProducts().map(p => p.name))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Cart Modifier */}
                <div className="p-8 overflow-y-auto hide-scrollbar flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getAllProducts()
                            .filter(p => selectedCategory === 'All' || p.name === selectedCategory)
                            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.size.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(p => {
                                const qty = editCart[p.id] || 0;
                                const customRate = editRates[p.id] ?? p.price;
                                return (
                                    <div key={p.id} className={`p-4 rounded-[24px] border flex flex-col justify-between transition-all ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${qty > 0 ? (isDark ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-500/50 shadow-md bg-blue-50/50') : ''}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className={`font-black uppercase tracking-tight text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                                                <div className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.brand} • {p.size}</div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rate: ₹</span>
                                                <input
                                                    type="number"
                                                    value={customRate === 0 ? '' : customRate}
                                                    onChange={(e) => setEditRates(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                                    className={`w-16 px-2 py-1.5 rounded-xl border text-xs font-black outline-none text-center transition-all focus:border-blue-500
                                                            ${isDark ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-inner'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-white/5">
                                            <div className={`font-black text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                ₹{((customRate) * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-inner ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                                <button
                                                    onClick={() => setEditCart(prev => ({ ...prev, [p.id]: Math.max(0, qty - 1) }))}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white hover:shadow text-slate-600'}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                </button>
                                                <div className={`w-8 text-center font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{qty}</div>
                                                <button
                                                    onClick={() => setEditCart(prev => ({ ...prev, [p.id]: qty + 1 }))}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white hover:shadow text-slate-600'}`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Footer Totals */}
                <div className={`p-5 sm:p-8 border-t shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-0 rounded-b-[40px] ${isDark ? 'bg-slate-900/90 border-white/10 backdrop-blur-md' : 'bg-slate-50/90 border-slate-200 backdrop-blur-md'}`}>
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Revised Total</p>
                        <p className={`text-3xl sm:text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ₹{getTotal(editCart, editRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            <span className="text-sm font-bold text-slate-500 ml-2 sm:ml-3 tracking-widest normal-case break-keep whitespace-nowrap">({getItemCount(editCart)} items)</span>
                        </p>
                    </div>
                    <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className={`flex-1 sm:flex-none px-4 sm:px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border
                                        ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            className="flex-1 sm:flex-none px-4 sm:px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBillsEditModal;
