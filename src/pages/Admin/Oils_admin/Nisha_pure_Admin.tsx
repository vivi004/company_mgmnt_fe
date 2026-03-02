import { useState } from 'react';
import { useToast, ToastContainer } from '../../../components/Toast';
import { getNishaProducts, saveNishaProducts, getCartItems, type Product } from '../../../constants/productData';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    cart: Record<string, number>;
    updateQuantity: (id: string, delta: number) => void;
    filterSubCategory: string | null;
    onBack: () => void;
    onReviewOrder: () => void;
}

const NishaPureAdmin = ({ shopName, villageName, theme, cart, updateQuantity, filterSubCategory, onBack, onReviewOrder }: Props) => {
    const isDark = theme === 'dark';
    const { toasts, showToast, removeToast } = useToast();

    const allNishaProducts = getNishaProducts();
    const [products, setProducts] = useState<Product[]>(allNishaProducts.filter((p: Product) => !filterSubCategory || p.name === filterSubCategory));
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({ name: '', brand: 'Nisha', size: '', price: '', unit: 'BTL', weight: '', icon: '' });

    const cartItems = getCartItems(cart);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: '', brand: 'Nisha', size: '', price: '', unit: 'BTL', weight: '', icon: '' });
        setShowProductModal(true);
    };

    const openEditProduct = (p: Product) => {
        setEditingProduct(p);
        setProductForm({ name: p.name, brand: p.brand, size: p.size, price: p.price.toString(), unit: p.unit, weight: p.weight || '', icon: p.icon || '' });
        setShowProductModal(true);
    };

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.size || !productForm.price) {
            showToast('Fill name, size, and price', 'error');
            return;
        }
        let updated: Product[];
        const allUpdatedProducts = [...allNishaProducts];
        if (editingProduct) {
            const index = allUpdatedProducts.findIndex(p => p.id === editingProduct.id);
            if (index !== -1) {
                allUpdatedProducts[index] = { ...allUpdatedProducts[index], name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined };
            }
            updated = products.map(p => p.id === editingProduct.id ? { ...p, name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined } : p);
            showToast('Product updated!', 'success');
        } else {
            const newId = `nisha-${Date.now()}`;
            const newP: Product = { id: newId, name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined };
            allUpdatedProducts.push(newP);
            updated = [...products, newP];
            showToast('Product added!', 'success');
        }
        setProducts(updated);
        saveNishaProducts(allUpdatedProducts);
        setShowProductModal(false);
    };

    const handleDeleteProduct = (id: string) => {
        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        const allUpdatedProducts = allNishaProducts.filter(p => p.id !== id);
        saveNishaProducts(allUpdatedProducts);
        showToast('Product deleted', 'success');
    };

    const inputCls = `w-full px-4 py-3 rounded-2xl border font-bold text-sm transition-all focus:outline-none focus:ring-2
        ${isDark ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/30'}`;

    const handleManualQuantity = (id: string, val: number, p?: Product) => {
        let safeVal = isNaN(val) ? 0 : val;

        // Apply rounding based on product size
        if (p && !id.includes('_box')) {
            const size = p.size.toLowerCase();
            if (size === '500 ml') {
                safeVal = Math.round(safeVal * 2) / 2;
            } else if (size === '1 litre' || size === '1 ltr-pet') {
                safeVal = Math.round(safeVal);
            } else if (size === '2 ltr') {
                safeVal = Math.round(safeVal / 2) * 2;
            }
        }

        const current = cart[id] || 0;
        const delta = safeVal - current;
        if (delta !== 0) {
            updateQuantity(id, delta);
        }
    };

    return (
        <div className={`min-h-screen pb-40 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-black text-blue-500 uppercase tracking-widest mb-4 hover:underline">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    <h2 className={`text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {filterSubCategory || 'Nisha Pure Oils'}
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                        CATEGORY: <span className="text-blue-500 font-black">NISHA (Pure Oils)</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        Step <span className="text-blue-500 font-black">4 of 4</span>
                    </p>
                </div>
                <button onClick={openAddProduct} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Add Product
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6">
                {products.map((product) => (
                    <div key={product.id}
                        className={`group relative p-8 rounded-[40px] border transition-all duration-500 hover:-translate-y-1
                            ${cart[product.id] > 0
                                ? isDark ? 'bg-blue-950/30 border-blue-500/30 shadow-xl shadow-blue-500/5' : 'bg-blue-50/80 border-blue-200 shadow-xl shadow-blue-100'
                                : isDark ? 'bg-slate-900 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-blue-500/10 hover:border-blue-100'
                            }`}
                    >
                        {cart[product.id] > 0 && (
                            <div className="absolute top-8 right-8 animate-in zoom-in-50 duration-300">
                                <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black italic uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/40">IN CART</span>
                            </div>
                        )}

                        <div className="flex gap-8 items-center">
                            <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-4xl transition-transform group-hover:scale-110 group-hover:rotate-3
                                ${isDark ? 'bg-slate-800 border border-white/5' : 'bg-blue-50 border border-blue-800'}`}>
                                {product.icon || '🧴'}
                            </div>

                            <div className="flex-grow min-w-0 flex flex-col">
                                <p className="text-[16px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{product.brand} {product.size}</p>
                                <h3 className={`text-2xl font-black italic tracking-tight leading-none mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {product.name}
                                </h3>

                                {product.size.toLowerCase() === '500 ml' ? (
                                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                                        <div className="flex-shrink-0">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                                            <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                ₹{product.price.toFixed(2)}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                {/* Admin Edit/Delete */}
                                                <button onClick={() => openEditProduct(product)} className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Edit">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 p-4 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>

                                            {/* Box Variant */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Box</span>
                                                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                    <button onClick={() => updateQuantity(product.id + '_box', -1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={cart[product.id + '_box'] || ''}
                                                        onChange={(e) => handleManualQuantity(product.id + '_box', parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id + '_box', 1)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price * 20}/box</span>
                                            </div>

                                            <div className="hidden sm:block w-px h-16 bg-slate-300 dark:bg-slate-700"></div>

                                            {/* Litre Variant */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Litre</span>
                                                <div className={`flex items - center gap - 1 mt - 1 p - 1 rounded - 2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'} `}>
                                                    <button onClick={() => updateQuantity(product.id + '_ltr', -0.5)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={cart[product.id + '_ltr'] || ''}
                                                        onChange={(e) => handleManualQuantity(product.id + '_ltr', parseFloat(e.target.value) || 0, product)}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id + '_ltr', 0.5)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price * 2}/litre</span>
                                                <span className="text-[10px] font-bold text-blue-500/60 mt-1">adding 0.5 litre, 1 litre...</span>
                                            </div>

                                        </div>
                                    </div>
                                ) : product.size.toLowerCase() === '1 litre' || product.size.toLowerCase() === '1 ltr-pet' ? (
                                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                                        <div className="flex-shrink-0">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                                            <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                ₹{product.price.toFixed(2)}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                {/* Admin Edit/Delete */}
                                                <button onClick={() => openEditProduct(product)} className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Edit">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 p-4 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>

                                            {/* Box Variant */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Box</span>
                                                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                    <button onClick={() => updateQuantity(product.id + '_box', -1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={cart[product.id + '_box'] || ''}
                                                        onChange={(e) => handleManualQuantity(product.id + '_box', parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id + '_box', 1)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price * 10}/box</span>
                                            </div>

                                            <div className="hidden sm:block w-px h-16 bg-slate-300 dark:bg-slate-700"></div>

                                            {/* Single Litre Variant */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Litre</span>
                                                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'} `}>
                                                    <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={cart[product.id] || ''}
                                                        onChange={(e) => handleManualQuantity(product.id, parseFloat(e.target.value) || 0, product)}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price}/litre</span>
                                                <span className="text-[10px] font-bold text-blue-500/60 mt-1">adding 1 litre, 2 litre...</span>
                                            </div>

                                        </div>
                                    </div>
                                ) : product.size.toLowerCase() === '2 ltr' ? (
                                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between mt-auto gap-4 w-full">
                                        <div className="flex-shrink-0">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                                            <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                ₹{product.price.toFixed(2)}
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => openEditProduct(product)} className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Edit">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95" title="Delete">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 p-4 rounded-3xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                                            {/* Box Variant (2L x 5 = 10L) */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Box</span>
                                                <div className={`flex items-center gap-1 mt-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                    <button onClick={() => updateQuantity(product.id + '_box', -1)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={cart[product.id + '_box'] || ''}
                                                        onChange={(e) => handleManualQuantity(product.id + '_box', parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id + '_box', 1)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price * 5}/box</span>
                                            </div>

                                            <div className="hidden sm:block w-px h-16 bg-slate-300 dark:bg-slate-700"></div>

                                            {/* Litre Variant (2L increments) */}
                                            <div className="flex flex-col items-center flex-1 sm:flex-none">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Litre</span>
                                                <div className={`flex items - center gap - 1 mt - 1 p - 1 rounded - 2xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'} `}>
                                                    <button onClick={() => updateQuantity(product.id, -2)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${cart[product.id] > 0 ? 'hover:bg-red-100 hover:text-red-500' : ''} text-slate-400`} disabled={!cart[product.id]}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="2"
                                                        value={cart[product.id] || ''}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            handleManualQuantity(product.id, Math.round(val / 2) * 2);
                                                        }}
                                                        placeholder="0"
                                                        className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                    />
                                                    <button onClick={() => updateQuantity(product.id, 2)} className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 shadow-md shadow-blue-500/20">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-sm font-black text-slate-500 mt-2">{product.price}/2L</span>
                                                <span className="text-[10px] font-bold text-blue-500/60 mt-1">adding 2 litre, 4 litre...</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between mt-auto gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit Price</p>
                                            <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                ₹{product.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Admin Edit/Delete */}
                                            <button onClick={() => openEditProduct(product)} className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all active:scale-90" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>

                                            {/* Quantifier */}
                                            <div className={`flex items-center gap-5 p-2 rounded-3xl border
                                                ${isDark ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50/50 border-slate-100 shadow-inner'}`}>
                                                <button onClick={() => updateQuantity(product.id, -1)} className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-90
                                                    ${cart[product.id] > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-slate-500/5 border-slate-500/10 text-slate-500 cursor-not-allowed opacity-30'}`}
                                                    disabled={!cart[product.id]}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cart[product.id] || ''}
                                                    onChange={(e) => handleManualQuantity(product.id, parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className={`w-10 text-center text-[16px] font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
                                                />
                                                <button onClick={() => updateQuantity(product.id, 1)} className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 active:scale-90 shadow-lg shadow-blue-500/30">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary Footer */}
            {totalItems > 0 && (
                <div className="fixed bottom-4 left-4 right-4 lg:bottom-10 lg:left-[calc(18rem+2.5rem)] lg:right-10 z-[100] animate-in slide-in-from-bottom-10 duration-700">
                    <div className={`mx-auto rounded-[30px] lg:rounded-[50px] p-4 md:p-6 lg:p-8 border backdrop-blur-3xl shadow-[-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-2xl transition-all
                        ${isDark ? 'bg-slate-900/95 border-white/10 shadow-blue-500/10' : 'bg-white/95 border-slate-200 shadow-slate-300'}`}>
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-between">
                            {/* Mobile Top Row: Total & Items count */}
                            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 shrink-0">
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
                                <button onClick={onReviewOrder} className="flex-1 lg:flex-none px-4 md:px-8 py-3 md:py-4 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 text-center">Review</button>
                                <button onClick={onReviewOrder} className="flex-1 lg:flex-none px-4 md:px-10 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1 active:scale-95 text-center">Place Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Add/Edit Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowProductModal(false)} />
                    <div className={`relative rounded-3xl w-full max-w-md shadow-2xl border p-8 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <h3 className={`text-2xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Product Name</label>
                                <input className={inputCls} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Groundnut Oil" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Brand</label>
                                    <input className={inputCls} value={productForm.brand} onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Size</label>
                                    <input className={inputCls} value={productForm.size} onChange={e => setProductForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 500 ml" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Price (₹)</label>
                                    <input className={inputCls} type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 90" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Unit</label>
                                    <select className={inputCls} value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))}>
                                        <option value="BTL">BTL</option>
                                        <option value="CAN">CAN</option>
                                        <option value="BOX">BOX</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Weight (optional)</label>
                                    <input className={inputCls} value={productForm.weight} onChange={e => setProductForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 4.550 KGS" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Icon (emoji)</label>
                                    <input className={inputCls} value={productForm.icon} onChange={e => setProductForm(f => ({ ...f, icon: e.target.value }))} placeholder="e.g. 🥜" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowProductModal(false)} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
                            <button onClick={handleSaveProduct} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                {editingProduct ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default NishaPureAdmin;
