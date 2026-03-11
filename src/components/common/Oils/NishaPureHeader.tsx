interface Props {
    shopName: string;
    villageName: string;
    filterSubCategory: string | null;
    onBack: () => void;
    isDark: boolean;
    isAdmin: boolean;
    primaryColor: string;
    openAddProduct: () => void;
}

const NishaPureHeader = ({ shopName, villageName, filterSubCategory, onBack, isDark, isAdmin, primaryColor, openAddProduct }: Props) => {
    return (
        <>
            {/* Top Context Bar */}
            <div className={`p-8 mb-8 rounded-[40px] flex gap-12 items-center border transition-all
                ${isDark ? 'bg-slate-900/50 border-white/5 shadow-2xl shadow-emerald-500/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Delivery Area</p>
                        <p className={`font-black italic text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{villageName}</p>
                    </div>
                </div>

                <div className="w-px h-12 bg-slate-500/20" />

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Selected Shop</p>
                        <p className={`font-black italic text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{shopName}</p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div className="flex items-center gap-6">
                    {!isAdmin ? (
                        <button
                            onClick={onBack}
                            className={`w-14 h-14 flex items-center justify-center rounded-[20px] border font-black transition-all hover:-translate-x-1 active:scale-90
                             ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    ) : (
                        <button onClick={onBack} className={`flex items-center gap-2 text-sm font-black text-${primaryColor}-500 uppercase tracking-widest mb-4 hover:underline`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>
                    )}
                    <div>
                        <h2 className={`text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{filterSubCategory || 'Nisha Pure Oils'}</h2>
                        <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                            CATEGORY: <span className={`text-${primaryColor}-500 font-black`}>NISHA (Pure Oils)</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            Step <span className={`text-${primaryColor}-500 font-black`}>4 of 4</span>
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={openAddProduct} className={`px-6 py-3 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-${primaryColor}-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </button>
                )}
            </div>
        </>
    );
};

export default NishaPureHeader;
