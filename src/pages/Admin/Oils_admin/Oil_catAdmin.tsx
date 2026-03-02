import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface Props {
    shopName: string;
    theme: string;
    onBack: () => void;
    onSelectCategory: (category: string) => void;
}

const OilCatAdmin = ({ shopName, theme, onBack, onSelectCategory }: Props) => {
    const isDark = theme === 'dark';
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showManageModal, setShowManageModal] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const { toasts, showToast, removeToast } = useToast();

    const api = getAuthAxios();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/categories', { name: newCatName });
            showToast('Category added successfully', 'success');
            setNewCatName("");
            fetchCategories();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/api/categories/${id}`);
            showToast('Category deleted successfully', 'success');
            fetchCategories();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to delete category', 'error');
        }
    };

    return (
        <div className={`space-y-10 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl border font-black transition-all hover:-translate-x-1
                            ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-md'}`}
                    >
                        ←
                    </button>
                    <div>
                        <h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Select Category
                        </h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">
                            Shop: <span className="text-blue-400 font-black">{shopName}</span>
                            <span className="ml-4 opacity-50">Step 3 of 4</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowManageModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95"
                >
                    Manage Categories
                </button>
            </div>

            {/* Category Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-black italic text-slate-500 uppercase tracking-widest">Fetching Dynamic Nodes...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-slate-100 rounded-[40px] border border-dashed border-slate-300">
                    <p className="text-slate-500 font-bold italic text-xl">No categories found. Add some to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`group relative flex flex-col items-center justify-center p-12 rounded-[40px] border transition-all cursor-pointer hover:-translate-y-2
                                ${isDark
                                    ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10'
                                    : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:border-blue-200 hover:shadow-blue-500/15'}`}
                        >
                            {/* Icon */}
                            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6
                                ${isDark ? 'bg-slate-800 text-blue-400 border border-white/5' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {cat.icon}
                            </div>

                            {/* Name */}
                            <h3 className={`text-2xl font-black italic tracking-tight uppercase group-hover:text-blue-500 transition-colors
                                ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {cat.name}
                            </h3>

                            {/* Hover Decoration */}
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manage Modal */}
            {showManageModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowManageModal(false)} />
                    <div className={`relative rounded-[50px] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-500 border overflow-hidden hide-scrollbar
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>

                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Category Management</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Operational Node Configuration</p>
                                </div>
                                <button
                                    onClick={() => setShowManageModal(false)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Add Form */}
                            <form onSubmit={handleAddCategory} className="mb-12 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">New Category Identity</label>
                                <div className="flex gap-4">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter category name..."
                                        className={`flex-grow rounded-2xl px-6 py-4 border transition-all font-bold text-sm focus:outline-none focus:ring-4 ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-900 focus:ring-blue-500/10'}`}
                                        value={newCatName}
                                        onChange={e => setNewCatName(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>

                            {/* Existing Categories List */}
                            <div className="space-y-4">
                                <h3 className={`text-sm font-black uppercase tracking-widest ml-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Nodes</h3>
                                <div className={`rounded-[30px] border divide-y ${isDark ? 'bg-slate-800/50 border-white/5 divide-white/5' : 'bg-slate-50 border-slate-100 divide-slate-100'}`}>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex justify-between items-center px-6 py-4 transition-all hover:bg-blue-500/5 overflow-hidden group">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className={`font-black italic tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{cat.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform translate-x-4 group-hover:translate-x-0"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OilCatAdmin;
