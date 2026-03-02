import { useState } from 'react';
import { getNishaSubcategories, saveNishaSubcategories, DEFAULT_NISHA_SUBCATEGORIES } from '../../../constants/productData';
import type { NishaSubcategory } from '../../../constants/productData';
import { useToast, ToastContainer } from '../../../components/Toast';

interface Props {
    shopName: string;
    theme: string;
    onBack: () => void;
    onSelectCategory: (category: string) => void;
}

const NishaSubcatAdmin = ({ shopName, theme, onBack, onSelectCategory }: Props) => {
    const isDark = theme === 'dark';
    const { toasts, showToast, removeToast } = useToast();

    const [subcategories, setSubcategories] = useState<NishaSubcategory[]>(() => getNishaSubcategories());
    const [showModal, setShowModal] = useState(false);

    // Add form state
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('');

    // Edit state — which row is being edited
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('');

    /* ── helpers ── */
    const persist = (cats: NishaSubcategory[]) => {
        setSubcategories(cats);
        saveNishaSubcategories(cats);
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const trimName = newName.trim();
        const trimIcon = newIcon.trim() || '🛢️';
        if (!trimName) return;
        if (subcategories.some(c => c.name.toLowerCase() === trimName.toLowerCase())) {
            showToast('Subcategory already exists', 'warning');
            return;
        }
        const id = trimName.replace(/\s+/g, '_').toUpperCase().slice(0, 6) + '_' + Date.now();
        persist([...subcategories, { id, name: trimName, icon: trimIcon }]);
        setNewName('');
        setNewIcon('');
        showToast('Subcategory added!', 'success');
    };

    const startEdit = (cat: NishaSubcategory) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditIcon(cat.icon);
    };

    const handleSaveEdit = (id: string) => {
        const trimName = editName.trim();
        const trimIcon = editIcon.trim() || '🛢️';
        if (!trimName) return;
        persist(subcategories.map(c => c.id === id ? { ...c, name: trimName, icon: trimIcon } : c));
        setEditingId(null);
        showToast('Subcategory updated!', 'success');
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('Delete this subcategory?')) return;
        persist(subcategories.filter(c => c.id !== id));
        showToast('Subcategory deleted', 'info');
    };

    const handleReset = () => {
        if (!window.confirm('Reset all subcategories to factory defaults? This will erase custom additions.')) return;
        persist(DEFAULT_NISHA_SUBCATEGORIES);
        showToast('Restored defaults', 'success');
    };

    /* ── input classes ── */
    const inputCls = `rounded-2xl px-5 py-3 border transition-all font-bold text-sm focus:outline-none focus:ring-4
        ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`;

    return (
        <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                            Nisha Pure Oils
                        </h2>
                        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                            Shop: <span className="text-blue-400 font-black">{shopName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            Step <span className="text-blue-500 font-black">3.5 of 4</span>
                        </p>
                    </div>
                </div>

                {/* Manage button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage
                </button>
            </div>

            {/* Subcategory Grid */}
            {subcategories.length === 0 ? (
                <div className={`text-center py-20 rounded-[40px] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                    <p className="font-bold italic text-xl">No subcategories yet.<br />Click <span className="text-blue-500">Manage</span> to add some.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                    {subcategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`group relative flex flex-col items-center justify-center p-8 rounded-[40px] border transition-all cursor-pointer hover:-translate-y-2
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
                            <h3 className={`text-xl font-black italic tracking-tight uppercase group-hover:text-blue-500 transition-colors text-center
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

            {/* ── Manage Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300"
                        onClick={() => { setShowModal(false); setEditingId(null); }}
                    />

                    <div className={`relative rounded-[50px] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-500 border hide-scrollbar
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>

                        <div className="p-10">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Subcategory Management
                                    </h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Nisha Pure Oils</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleReset}
                                        title="Reset to Defaults"
                                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                            ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white'}`}
                                    >
                                        Reset Defaults
                                    </button>
                                    <button
                                        onClick={() => { setShowModal(false); setEditingId(null); }}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all
                                            ${isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* ── Add Form ── */}
                            <form onSubmit={handleAdd} className="mb-10">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-3">
                                    Add New Subcategory
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Name (e.g. Sesame Oil)"
                                        className={`${inputCls} flex-grow min-w-[160px]`}
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Icon emoji 🌿"
                                        className={`${inputCls} w-28 text-center text-xl`}
                                        value={newIcon}
                                        onChange={e => setNewIcon(e.target.value)}
                                        maxLength={4}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className={`h-px mb-8 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

                            {/* ── Existing List ── */}
                            <div className="space-y-3">
                                <h3 className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Active Subcategories ({subcategories.length})
                                </h3>

                                {subcategories.length === 0 && (
                                    <p className="text-slate-500 font-bold italic text-center py-6">No subcategories yet.</p>
                                )}

                                {subcategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all group
                                            ${isDark ? 'bg-slate-800/50 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                                    >
                                        {editingId === cat.id ? (
                                            /* ── Edit row ── */
                                            <>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    className={`${inputCls} flex-grow`}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className={`${inputCls} w-20 text-center text-xl`}
                                                    value={editIcon}
                                                    onChange={e => setEditIcon(e.target.value)}
                                                    maxLength={4}
                                                />
                                                {/* Save */}
                                                <button
                                                    onClick={() => handleSaveEdit(cat.id)}
                                                    title="Save"
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-lg"
                                                >
                                                    ✓
                                                </button>
                                                {/* Cancel */}
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    title="Cancel"
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-200/50 text-slate-500 hover:bg-slate-300 transition-all font-black text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            /* ── Display row ── */
                                            <>
                                                <span className="text-2xl select-none">{cat.icon}</span>
                                                <span className={`font-black italic tracking-tight flex-grow ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {cat.name}
                                                </span>

                                                {/* Edit button */}
                                                <button
                                                    onClick={() => startEdit(cat)}
                                                    title="Edit"
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all translate-x-2 group-hover:translate-x-0"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>

                                                {/* Delete button */}
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    title="Delete"
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all translate-x-2 group-hover:translate-x-0"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NishaSubcatAdmin;
