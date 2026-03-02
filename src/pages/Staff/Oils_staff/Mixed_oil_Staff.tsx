import { getMixedOilProducts, getAllProducts } from '../../../constants/productData';
import { useToast, ToastContainer } from '../../../components/Toast';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    cart: Record<string, number>;
    updateQuantity: (id: string, delta: number) => void;
    onBack: () => void;
    onReviewOrder: () => void;
}

const MixedOilStaff = ({ shopName, villageName, theme, cart, updateQuantity, onBack, onReviewOrder }: Props) => {
    const isDark = theme === 'dark';
    const { toasts, removeToast } = useToast();

    const products = getMixedOilProducts();

    const cartItems = getAllProducts()
        .filter(p => cart[p.id])
        .map(p => ({ ...p, quantity: cart[p.id] }));

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleManualQuantity = (id: string, val: number) => {
        const safeVal = isNaN(val) ? 0 : val;
        const current = cart[id] || 0;
        const delta = safeVal - current;
        if (delta !== 0) {
            updateQuantity(id, delta);
        }
    };

    return (
        <div className={`min-h-screen pb-40 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

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
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={onBack}
                    className={`w-14 h-14 flex items-center justify-center rounded-[20px] border font-black transition-all hover:-translate-x-1 active:scale-90
                        ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h2 className={`text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        New Order
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                        CATEGORY: <span className="text-emerald-500 font-black">Mixed oil</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        Step <span className="text-emerald-500 font-black">4 of 4</span>
                    </p>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`group relative p-8 rounded-[40px] border transition-all duration-500 hover:-translate-y-1
                            ${isDark
                                ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30'
                                : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-emerald-500/10 hover:border-emerald-100'}`}
                    >
                        {cart[product.id] > 0 && (
                            <div className="absolute top-8 right-8 animate-in zoom-in-50 duration-300">
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black italic uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/40">
                                    IN CART
                                </span>
                            </div>
                        )}

                        <div className="flex gap-8 items-center">
                            <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-4xl transition-transform group-hover:scale-110 group-hover:rotate-3
                                ${isDark ? 'bg-slate-800 border border-white/5' : 'bg-emerald-50 border border-emerald-100 shadow-inner'}`}>
                                📦
                            </div>

                            <div className="flex-grow min-w-0 flex flex-col">
                                <p className="text-[16px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">{product.brand} {product.size}</p>
                                <h3 className={`text-2xl font-black italic tracking-tight leading-none mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {product.name}
                                </h3>

                                <div className="flex flex-wrap items-center justify-between mt-auto gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{product.price.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantifier */}
                                    <div className={`flex items-center gap-5 p-2 rounded-3xl border
                                        ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-slate-100 shadow-inner'}`}>
                                        <button
                                            onClick={() => updateQuantity(product.id, -1)}
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90
                                                ${cart[product.id] > 0
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                    : 'bg-slate-500/5 border-slate-500/10 text-slate-500 cursor-not-allowed opacity-30'}`}
                                            disabled={!cart[product.id]}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                            </svg>
                                        </button>

                                        <input
                                            type="number"
                                            min="0"
                                            value={cart[product.id] || ''}
                                            onChange={(e) => handleManualQuantity(product.id, parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                        />

                                        <button
                                            onClick={() => updateQuantity(product.id, 1)}
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500 border border-emerald-400 text-white hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary Footer */}
            {totalItems > 0 && (
                <div className="fixed bottom-4 left-4 right-4 lg:bottom-10 lg:left-[calc(18rem+2.5rem)] lg:right-10 z-[100] animate-in slide-in-from-bottom-10 duration-700">
                    <div className={`max-w-6xl mx-auto rounded-[30px] lg:rounded-[50px] p-4 md:p-6 lg:p-8 border backdrop-blur-3xl shadow-2xl transition-all
                        ${isDark
                            ? 'bg-slate-900/90 border-white/10 shadow-emerald-500/10'
                            : 'bg-white/90 border-slate-200 shadow-slate-300'}`}>

                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-between">
                            {/* Mobile Top Row: Total & Items count */}
                            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 shrink-0">
                                        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-lg md:text-2xl font-black italic tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Order Summary</h4>
                                        <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest truncate">{totalItems} ITEMS SELECTED</p>
                                    </div>
                                </div>

                                {/* Mobile Total Price */}
                                <div className="text-right lg:hidden">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total</p>
                                    <p className={`text-2xl md:text-3xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <span className="text-sm mr-0.5 opacity-50 font-medium italic">₹</span>{totalPrice.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Actions & Desktop Total */}
                            <div className="flex items-center gap-3 md:gap-6 w-full lg:w-auto justify-between lg:justify-end">
                                <div className="hidden lg:block text-right pr-4 border-r border-slate-200 dark:border-white/10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
                                    <p className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <span className="text-xl mr-1 opacity-50 font-medium italic">₹</span>{totalPrice.toLocaleString()}
                                    </p>
                                </div>
                                <button onClick={onReviewOrder} className="flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 text-center">Review</button>
                                <button onClick={onReviewOrder} className="flex-1 lg:flex-none px-4 md:px-10 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-1 active:scale-95 text-center">Place Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MixedOilStaff;
