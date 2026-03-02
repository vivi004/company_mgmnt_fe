import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';

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

const OilCatStaff = ({ shopName, theme, onBack, onSelectCategory }: Props) => {
    const isDark = theme === 'dark';
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {/* Header */}
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
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
                        Shop: <span className="text-emerald-400 font-black">{shopName}</span>
                        <span className="ml-4 opacity-50">Step 3 of 4</span>
                    </p>
                </div>
            </div>

            {/* Category Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-black italic text-slate-500 uppercase tracking-widest">Syncing Nodes...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-slate-100 rounded-[40px] border border-dashed border-slate-300">
                    <p className="text-slate-500 font-bold italic text-xl">No categories available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`group relative flex flex-col items-center justify-center p-12 rounded-[40px] border transition-all cursor-pointer hover:-translate-y-2
                                ${isDark
                                    ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10'
                                    : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:border-emerald-200 hover:shadow-emerald-500/15'}`}
                        >
                            {/* Icon */}
                            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6
                                ${isDark ? 'bg-slate-800 text-emerald-400 border border-white/5' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {cat.icon}
                            </div>

                            {/* Name */}
                            <h3 className={`text-2xl font-black italic tracking-tight uppercase group-hover:text-emerald-500 transition-colors
                                ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {cat.name}
                            </h3>

                            {/* Hover Decoration */}
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OilCatStaff;
