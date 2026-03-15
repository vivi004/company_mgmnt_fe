import type { Product } from '../../../constants/productData';

interface Props {
    product: Product;
    cart: Record<string, number>;
    isDark: boolean;
    isAdmin: boolean;
    primaryColor: string;
    updateQuantity: (id: string, delta: number) => void;
    handleManualQuantity: (id: string, val: number, p?: Product) => void;
    openEditProduct: (p: Product) => void;
    handleDeleteProduct: (id: string) => void;
}

const NishaPureProductCard = ({ product, cart, isDark, isAdmin, primaryColor, updateQuantity, handleManualQuantity, openEditProduct, handleDeleteProduct }: Props) => {
    const isInCart = (cart[product.id] > 0 || cart[product.id + '_box'] > 0 || cart[product.id + '_ltr'] > 0);

    const AdminActions = () => (
        isAdmin ? (
            <div className="flex gap-2 mt-2">
                <button onClick={() => openEditProduct(product)} className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Edit">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        ) : null
    );

    const BoxLitreControls = ({ boxId, litreId, boxMultiplier, litreStep, litreMultiplier, litreLabel }: {
        boxId: string; litreId: string; boxMultiplier: number; litreStep: number; litreMultiplier: number; litreLabel: string;
    }) => (
        <div className={`flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 p-4 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
            <div className="flex flex-col items-center flex-1 sm:flex-none">
                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Box</span>
                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <button onClick={() => updateQuantity(boxId, -1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                    </button>
                    <input type="number" min="0" value={cart[boxId] || ''} onChange={(e) => handleManualQuantity(boxId, parseInt(e.target.value) || 0)} placeholder="0" className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} />
                    <button onClick={() => updateQuantity(boxId, 1)} className={`w-8 h-8 rounded-xl bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600 shadow-md shadow-${primaryColor}-500/20`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
                <span className="text-sm font-black text-slate-500 mt-2">{product.price * boxMultiplier}/box</span>
            </div>
            <div className="hidden sm:block w-px h-16 bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex flex-col items-center flex-1 sm:flex-none">
                <span className="text-sm font-black uppercase tracking-widest text-slate-500">PCS</span>
                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <button onClick={() => updateQuantity(litreId, -litreStep)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${cart[litreId] > 0 ? 'hover:bg-red-100 hover:text-red-500' : ''} text-slate-400`} disabled={!cart[litreId]}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                    </button>
                    <input type="number" min="0" step={litreStep} value={cart[litreId] || ''} onChange={(e) => handleManualQuantity(litreId, parseFloat(e.target.value) || 0, product)} placeholder="0" className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} />
                    <button onClick={() => updateQuantity(litreId, litreStep)} className={`w-8 h-8 rounded-xl bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600 shadow-md shadow-${primaryColor}-500/20`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
                <span className="text-sm font-black text-slate-500 mt-2">{product.price * litreMultiplier}/{litreLabel}</span>
            </div>
        </div>
    );

    const renderSizeControls = () => {
        const sizeLower = product.size.toLowerCase();

        if (sizeLower === '100 ml') {
            return (
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                        <AdminActions />
                    </div>
                    <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={50} litreStep={1} litreMultiplier={10} litreLabel="PCS" />
                </div>
            );
        }

        if (sizeLower === '200 ml') {
            return (
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                        <AdminActions />
                    </div>
                    <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={25} litreStep={1} litreMultiplier={5} litreLabel="PCS" />
                </div>
            );
        }

        if (sizeLower === '500 ml') {
            return (
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                        <AdminActions />
                    </div>
                    <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={20} litreStep={1} litreMultiplier={2} litreLabel="PCS" />
                </div>
            );
        }

        if (sizeLower === '1 litre' || sizeLower === '1 ltr-pet' || sizeLower === '1 ltr') {
            return (
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                        <AdminActions />
                    </div>
                    <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={10} litreStep={1} litreMultiplier={1} litreLabel="PCS" />
                </div>
            );
        }

        if (sizeLower === '2 ltr') {
            return (
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                    <div className="flex-shrink-0">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                        <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                        <AdminActions />
                    </div>
                    <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={5} litreStep={2} litreMultiplier={1} litreLabel="2L" />
                </div>
            );
        }

        // Default: simple quantity control
        return (
            <div className="flex flex-wrap items-center justify-between mt-auto gap-4">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                    <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <>
                            <button onClick={() => openEditProduct(product)} className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-90" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90" title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    )}
                    <div className={`flex items-center gap-5 p-2 rounded-3xl border ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-slate-100 shadow-inner'}`}>
                        <button onClick={() => updateQuantity(product.id, -1)} className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90
                            ${cart[product.id] > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-slate-500/5 border-slate-500/10 text-slate-500 cursor-not-allowed opacity-30'}`}
                            disabled={!cart[product.id]}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                        </button>
                        <input type="number" min="0" value={cart[product.id] || ''} onChange={(e) => handleManualQuantity(product.id, parseInt(e.target.value) || 0)} placeholder="0" className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} />
                        <button onClick={() => updateQuantity(product.id, 1)} className={`w-10 h-10 rounded-2xl bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600 active:scale-90 shadow-lg shadow-${primaryColor}-500/30`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`group relative p-8 rounded-[40px] border transition-all duration-500 hover:-translate-y-1
                ${isInCart
                    ? isDark ? `bg-${primaryColor}-950/30 border-${primaryColor}-500/30 shadow-xl shadow-${primaryColor}-500/5` : `bg-${primaryColor}-50/80 border-${primaryColor}-200 shadow-xl shadow-${primaryColor}-100`
                    : isDark ? 'bg-slate-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-blue-500/10 hover:border-blue-100'}`}
        >
            {isInCart && (
                <div className="absolute top-8 right-8 animate-in zoom-in-50 duration-300">
                    <span className={`px-3 py-1 bg-${primaryColor}-500 text-white text-[10px] font-black italic uppercase tracking-widest rounded-full shadow-lg shadow-${primaryColor}-500/40`}>IN CART</span>
                </div>
            )}
            <div className="flex gap-8 items-center">
                <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-4xl transition-transform group-hover:scale-110 group-hover:rotate-3
                    ${isDark ? 'bg-slate-800 border border-white/5' : `bg-${primaryColor}-50 border border-${primaryColor}-100`}`}>
                    {product.icon || '🧴'}
                </div>
                <div className="flex-grow min-w-0 flex flex-col">
                    <p className={`text-[16px] font-black uppercase tracking-[0.2em] text-${primaryColor}-500 mb-1`}>{product.brand} {product.size}</p>
                    <h3 className={`text-2xl font-black italic tracking-tight leading-none mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{product.name}</h3>
                    {renderSizeControls()}
                </div>
            </div>
        </div>
    );
};

export default NishaPureProductCard;
