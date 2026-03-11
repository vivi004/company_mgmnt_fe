interface Props {
    totalItems: number;
    totalPrice: number;
    isDark: boolean;
    primaryColor: string;
    onReviewOrder: () => void;
}

const NishaPureOrderSummary = ({ totalItems, totalPrice, isDark, primaryColor, onReviewOrder }: Props) => {
    if (totalItems <= 0) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 lg:bottom-10 lg:left-[calc(18rem+2.5rem)] lg:right-10 z-[100] animate-in slide-in-from-bottom-10 duration-700">
            <div className={`max-w-6xl mx-auto rounded-[30px] lg:rounded-[50px] p-4 md:p-6 lg:p-8 border backdrop-blur-3xl shadow-2xl transition-all
                ${isDark ? `bg-slate-900/90 border-white/10 shadow-${primaryColor}-500/10` : `bg-white/90 border-slate-200 shadow-slate-300`}`}>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-between">
                    <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-${primaryColor}-600 flex items-center justify-center text-white shadow-xl shadow-${primaryColor}-600/30 shrink-0`}>
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div className="min-w-0">
                                <h4 className={`text-lg md:text-2xl font-black italic tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Summary</h4>
                                <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest truncate">{totalItems} ITEMS SELECTED</p>
                            </div>
                        </div>
                        <div className="text-right lg:hidden">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total</p>
                            <p className={`text-2xl md:text-3xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                <span className="text-sm mr-0.5 opacity-50 font-medium italic">₹</span>{totalPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-6 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="hidden lg:block text-right pr-4 border-r border-slate-200 dark:border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
                            <p className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                <span className="text-xl mr-1 opacity-50 font-medium italic">₹</span>{totalPrice.toLocaleString()}
                            </p>
                        </div>
                        <button onClick={onReviewOrder} className={`flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 border-2 border-${primaryColor}-500 text-${primaryColor}-500 hover:bg-${primaryColor}-500 hover:text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 text-center`}>Review</button>
                        <button onClick={onReviewOrder} className={`flex-1 lg:flex-none px-4 md:px-10 py-3 md:py-4 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl shadow-${primaryColor}-600/30 hover:-translate-y-1 active:scale-95 text-center`}>Place Order</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NishaPureOrderSummary;
