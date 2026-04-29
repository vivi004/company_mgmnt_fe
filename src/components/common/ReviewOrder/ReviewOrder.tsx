import { useState } from 'react';
import { getCartItems } from '../../../constants/productData';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    cart: Record<string, number>;
    updateQuantity: (id: string, delta: number) => void;
    onBack: () => void;
    onPlaceOrder: () => Promise<void> | void;
    type?: 'admin' | 'staff';
}

const ReviewOrder = ({ shopName, villageName, theme, cart, updateQuantity, onBack, onPlaceOrder, type = 'admin' }: Props) => {
    const isDark = theme === 'dark';
    const [placing, setPlacing] = useState(false);

    const cartItems = getCartItems(cart);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const primaryColor = type === 'admin' ? 'blue' : 'emerald';

    return (
        <div className={`min-h-screen pb-10 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>

            {/* Header */}
            <div className="flex items-center gap-6 mb-10">
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
                    <h2 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Review Order
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                        <span className={`text-${primaryColor}-500 font-black`}>{shopName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{villageName}</span>
                    </p>
                </div>
            </div>

            {/* Order Table */}
            {cartItems.length === 0 ? (
                <div className={`text-center py-20 rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">🛒</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Cart is empty</p>
                    <p className="text-slate-500 mt-2 font-medium">Go back and add items to your order</p>
                </div>
            ) : (
                <div className={`rounded-[40px] border overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[700px] lg:min-w-0">
                            {/* Table Header */}
                            <div className={`grid grid-cols-12 gap-4 px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b
                                ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                <div className="col-span-1">S.No</div>
                                <div className="col-span-5">Description of Goods</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-right pr-4">Rate (₹)</div>
                                <div className="col-span-2 text-right">Amount (₹)</div>
                            </div>

                            {cartItems.map((item, index) => {
                                const isBox = item.id.includes('_box');
                                const is2L_Base = !isBox && item.size.toLowerCase() === '2 ltr' && !item.id.includes('_ltr');
                                const is500_Ltr = !isBox && item.id.includes('_ltr');
                                const cartDelta = is500_Ltr ? 0.5 : 1;

                                const description = item.brand !== 'Nisha' ? `${item.brand.toUpperCase()} ${item.size.toUpperCase()}` : `${item.name.toUpperCase()} ${item.size.toUpperCase()}`;
                                let displayUnit = (item.unit || 'NOS').toUpperCase();

                                if (/\b15\s*(LTR|KG|L|T|TIN)\b/i.test(description)) {
                                    displayUnit = 'TIN';
                                } else if (/\b5\s*(LTR|KG|L|CAN)\b/i.test(description)) {
                                    displayUnit = 'CAN';
                                } else if (/\bBOX\b/i.test(description) || item.id.includes('_box')) {
                                    displayUnit = 'BOX';
                                } else if (/\b(100|200|500)\s*ML\b/i.test(description)) {
                                    displayUnit = 'PCS';
                                } else if (displayUnit === 'LITRE') {
                                    displayUnit = 'PCS';
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className={`grid grid-cols-12 gap-4 px-8 py-6 items-center border-b transition-all
                                            ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : `border-slate-50 hover:bg-${primaryColor}-50/30`}`}
                                    >
                                        <div className={`col-span-1 font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{index + 1}</div>

                                        <div className="col-span-5">
                                            <p className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {item.name} {item.size}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 mt-0.5">{item.brand}</p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="col-span-2 flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.id, -cartDelta)} className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                </button>
                                                <div className="text-center min-w-[3rem]">
                                                    <span className={`block font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        {displayUnit === 'CAN' ? 'CANS' : displayUnit}
                                                    </span>
                                                </div>
                                                <button onClick={() => updateQuantity(item.id, cartDelta)} className={`w-8 h-8 rounded-full flex items-center justify-center bg-${primaryColor}-500 text-white hover:bg-${primaryColor}-600 shadow-md shadow-${primaryColor}-500/20 transition-all`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`col-span-2 text-right pr-4 font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            ₹{item.price.toFixed(2)}
                                        </div>

                                        <div className={`col-span-2 text-right font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Total Row */}
                            <div className={`grid grid-cols-12 gap-4 px-8 py-6 items-center
                                ${isDark ? `bg-${primaryColor}-500/5` : `bg-${primaryColor}-50/50`}`}>
                                <div className="col-span-6"></div>
                                <div className={`col-span-2 text-center font-black text-lg ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`}>
                                    {totalItems} items
                                </div>
                                <div className={`col-span-2 text-right pr-4 font-black uppercase text-xs tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Total
                                </div>
                                <div className={`col-span-2 text-right font-black text-2xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {cartItems.length > 0 && (
                <div className="flex justify-end gap-6 mt-10">
                    <button
                        onClick={onBack}
                        className={`px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all hover:-translate-y-0.5 active:scale-95
                            ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}
                    >
                        ← Back to Items
                    </button>
                    <button
                        onClick={async () => {
                            setPlacing(true);
                            try {
                                await onPlaceOrder();
                            } finally {
                                setPlacing(false);
                            }
                        }}
                        disabled={placing}
                        className={`px-10 py-5 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all shadow-xl shadow-${primaryColor}-600/30 hover:-translate-y-0.5 active:scale-95 flex items-center gap-3`}
                    >
                        {placing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Submitting...
                            </>
                        ) : 'Place Order Now →'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewOrder;
