import { useState } from 'react';
import { getNishaSubcategories } from '../../../constants/productData';
import type { NishaSubcategory } from '../../../constants/productData';

interface Props {
    shopName: string;
    theme: string;
    onBack: () => void;
    onSelectCategory: (category: string) => void;
}

const NishaSubcatStaff = ({ shopName, theme, onBack, onSelectCategory }: Props) => {
    const isDark = theme === 'dark';

    // Read-only — always reflects whatever admin has configured
    const [subcategories] = useState<NishaSubcategory[]>(() => getNishaSubcategories());

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
                        Nisha Pure Oils
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        Shop: <span className="text-emerald-400 font-black">{shopName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        Step <span className="text-emerald-500 font-black">3.5 of 4</span>
                    </p>
                </div>
            </div>

            {/* Subcategory Grid */}
            {subcategories.length === 0 ? (
                <div className={`text-center py-20 rounded-[40px] border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                    <p className="font-bold italic text-xl">No subcategories available. Ask your admin to configure them.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                    {subcategories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`group relative flex flex-col items-center justify-center p-8 rounded-[40px] border transition-all cursor-pointer hover:-translate-y-2
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
                            <h3 className={`text-xl font-black italic tracking-tight uppercase group-hover:text-emerald-500 transition-colors text-center
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

export default NishaSubcatStaff;
