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
    deliveryDate: string;
    onDeliveryDateChange: (date: string) => void;
    customRates?: Record<string, number>;
    isSubmitting?: boolean;
}

const ReviewOrder = ({ shopName, villageName, theme, cart, updateQuantity, onBack, onPlaceOrder, type = 'admin', deliveryDate, onDeliveryDateChange, customRates = {}, isSubmitting }: Props) => {
    const isDark = theme === 'dark';
    const [internalPlacing, setInternalPlacing] = useState(false);
    const placing = isSubmitting ?? internalPlacing;

    const cartItems = getCartItems(cart, customRates);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const primaryColor = type === 'admin' ? 'blue' : 'emerald';

    return (
        <div className={`min-h-screen px-4 sm:px-8 pb-10 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>

            {/* Header */}
            <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10 pt-2">
                <button
                    onClick={onBack}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-[20px] border font-black transition-all hover:-translate-x-1 active:scale-90
                        ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="min-w-0 flex-1">
                    <h2 className={`text-2xl sm:text-4xl font-black italic tracking-tighter truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Review Order
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest flex items-center gap-2 truncate">
                        <span className={`text-${primaryColor}-500 font-black truncate`}>{shopName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        <span className="truncate">{villageName}</span>
                    </p>
                </div>
            </div>

            {/* Order Content */}
            {cartItems.length === 0 ? (
                <div className={`text-center py-20 rounded-[30px] sm:rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">🛒</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Cart is empty</p>
                    <p className="text-slate-500 mt-2 font-medium">Go back and add items to your order</p>
                </div>
            ) : (
                <div className={`rounded-3xl sm:rounded-[40px] border overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    
                    {/* Desktop View */}
                    <div className="hidden sm:block overflow-x-auto no-scrollbar">
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
                                const isLtrVariant = !isBox && item.id.includes('_ltr');
                                const is100ml = item.size.toLowerCase() === '100 ml';
                                const is200ml = item.size.toLowerCase() === '200 ml';
                                const is500ml = item.size.toLowerCase() === '500 ml';
                                const isConvertibleLtr = isLtrVariant && (is100ml || is200ml || is500ml);
                                const ltrMultiplier = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
                                const cartDelta = isConvertibleLtr ? (1 / ltrMultiplier) : 1;

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

                                const displayQty = isConvertibleLtr ? item.quantity / ltrMultiplier : item.quantity;
                                const displayRate = isConvertibleLtr ? item.price * ltrMultiplier : item.price;
                                const displayUnitFinal = isConvertibleLtr ? 'LTR' : displayUnit;

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
                                                    <span className={`block font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayQty}</span>
                                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        {displayUnitFinal === 'CAN' ? 'CANS' : displayUnitFinal}
                                                    </span>
                                                </div>
                                                <button onClick={() => updateQuantity(item.id, cartDelta)} className={`w-8 h-8 rounded-full flex items-center justify-center bg-${primaryColor}-500 text-white hover:bg-${primaryColor}-600 shadow-md shadow-${primaryColor}-500/20 transition-all`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`col-span-2 text-right pr-4 font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            ₹{displayRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>

                                        <div className="col-span-2 text-right flex flex-col items-end gap-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{(displayRate * displayQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                {customRates[item.id] !== undefined && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">Edited Price</span>
                                                )}
                                            </div>
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

                    {/* Mobile View */}
                    <div className="sm:hidden divide-y divide-slate-100 dark:divide-white/5">
                        {cartItems.map((item, index) => {
                            const isBox = item.id.includes('_box');
                            const isLtrVariant = !isBox && item.id.includes('_ltr');
                            const is100ml = item.size.toLowerCase() === '100 ml';
                            const is200ml = item.size.toLowerCase() === '200 ml';
                            const is500ml = item.size.toLowerCase() === '500 ml';
                            const isConvertibleLtr = isLtrVariant && (is100ml || is200ml || is500ml);
                            const ltrMultiplier = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
                            const cartDelta = isConvertibleLtr ? (1 / ltrMultiplier) : 1;

                            const displayQty = isConvertibleLtr ? item.quantity / ltrMultiplier : item.quantity;
                            const displayRate = isConvertibleLtr ? item.price * ltrMultiplier : item.price;
                            const displayUnitFinal = isConvertibleLtr ? 'LTR' : (item.unit || 'NOS').toUpperCase();

                            return (
                                <div key={item.id} className="p-4 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-black text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {index + 1}. {item.name} {item.size}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.brand}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{(displayRate * displayQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                            {customRates[item.id] !== undefined && (
                                                <span className="inline-block text-[8px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 mt-1">Edited Price</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate: ₹{displayRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.id, -cartDelta)} className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                            </button>
                                            <div className="text-center min-w-[2.5rem]">
                                                <span className={`block font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayQty}</span>
                                                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                    {displayUnitFinal === 'CAN' ? 'CANS' : displayUnitFinal}
                                                </span>
                                            </div>
                                            <button onClick={() => updateQuantity(item.id, cartDelta)} className={`w-8 h-8 rounded-full flex items-center justify-center bg-${primaryColor}-500 text-white hover:bg-${primaryColor}-600 shadow-md shadow-${primaryColor}-500/20 transition-all`}>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mobile Total Row */}
                        <div className={`p-4 space-y-2.5 ${isDark ? `bg-${primaryColor}-500/5` : `bg-${primaryColor}-50/50`}`}>
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500 uppercase tracking-widest">Total Quantity</span>
                                <span className={`font-black ${isDark ? `text-${primaryColor}-400` : `text-${primaryColor}-600`}`}>{totalItems} items</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100/50 dark:border-white/5 pt-2.5">
                                <span className="text-slate-500 font-black uppercase tracking-widest">Grand Total</span>
                                <span className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Delivery Date Picker */}
            {cartItems.length > 0 && (
                <div className={`mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-[28px] border flex flex-col md:flex-row md:items-center justify-between gap-4
                    ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
                    <div>
                        <p className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Delivery / Bill Date</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Select official invoice date</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`flex items-center p-1.5 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800 border-white/10 shadow-lg shadow-black/20' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <button 
                                onClick={() => {
                                    const d = new Date(deliveryDate);
                                    d.setDate(d.getDate() - 1);
                                    onDeliveryDateChange(d.toISOString().split('T')[0]);
                                }}
                                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                title="Previous Day"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            
                            <div className="relative flex items-center justify-between w-[130px] sm:w-[140px] px-2.5 sm:border-r-0 cursor-pointer group">
                                <span className={`text-xs sm:text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {deliveryDate.split('-').reverse().join('-')}
                                </span>
                                <svg className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => onDeliveryDateChange(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <button 
                                onClick={() => {
                                    const d = new Date(deliveryDate);
                                    d.setDate(d.getDate() + 1);
                                    onDeliveryDateChange(d.toISOString().split('T')[0]);
                                }}
                                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                title="Next Day"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        {(() => {
                            const d = new Date(deliveryDate + 'T00:00:00');
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            if (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear()) {
                                return <span className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black rounded-lg shadow-lg shadow-emerald-500/20 shrink-0">TOMORROW</span>;
                            }
                            return null;
                        })()}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {cartItems.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 sm:mt-10 w-full">
                    <button
                        onClick={onBack}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest border transition-all hover:-translate-y-0.5 active:scale-95 text-center justify-center flex items-center
                            ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}
                    >
                        ← Back to Items
                    </button>
                    <button
                        onClick={async () => {
                            setInternalPlacing(true);
                            try {
                                await onPlaceOrder();
                            } finally {
                                setInternalPlacing(false);
                            }
                        }}
                        disabled={placing}
                        className={`w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl shadow-${primaryColor}-600/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3`}
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
