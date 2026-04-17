import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { IconButton } from '@mui/material';

import {
  getNishaProducts,
  getMixedOilProducts,
  getPalmOilProducts,
  getBurfiProducts,
  getOilCakeProducts,
  getNishaSubcategories,
} from '../../../constants/productData';
import type { Product, NishaSubcategory } from '../../../constants/productData';

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------

interface Props {
  shopName: string;
  theme: string;
  cart: Record<string, number>;
  updateQuantity: (id: string, delta: number) => void;
  onBack: () => void;
  onReviewOrder: () => void;
}

interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: NishaSubcategory[];
  getProducts: () => Product[];
}

const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'nisha',
    name: 'Nisha Pure Oils',
    icon: '🫙',
    subcategories: getNishaSubcategories(),
    getProducts: getNishaProducts,
  },
  {
    id: 'mixed',
    name: 'Mixed Oil',
    icon: '🛢️',
    subcategories: [{ id: 'ALL', name: 'All Products', icon: '🛢️' }],
    getProducts: getMixedOilProducts,
  },
  {
    id: 'palm',
    name: 'Palm Oil',
    icon: '🌴',
    subcategories: [{ id: 'ALL', name: 'All Products', icon: '🌴' }],
    getProducts: getPalmOilProducts,
  },
  {
    id: 'burfi',
    name: 'Burfi',
    icon: '🥜',
    subcategories: [{ id: 'ALL', name: 'All Products', icon: '🥜' }],
    getProducts: getBurfiProducts,
  },
  {
    id: 'oilcake',
    name: 'Oil Cake',
    icon: '🧱',
    subcategories: [
      { id: 'Thool Cake', name: 'Thool Cake', icon: '🧱' },
      { id: 'Katti Cake', name: 'Katti Cake', icon: '🪨' },
    ],
    getProducts: getOilCakeProducts,
  },
];

// Helper: Filter products by subcategory
function filterProducts(products: Product[], subcatId: string): Product[] {
  if (subcatId === 'ALL') return products;
  const byName = products.filter(p => p.name === subcatId);
  if (byName.length > 0) return byName;
  return products.filter(p => p.id.startsWith(subcatId.toLowerCase() + '-'));
}


// -------------------------------------------------------------
// Unified Product Card 
// Includes the Box/Litre manual selectors when appropriate
// -------------------------------------------------------------

interface CardProps {
  product: Product;
  cart: Record<string, number>;
  isDark: boolean;
  updateQuantity: (id: string, delta: number) => void;
  handleManualQuantity: (id: string, val: number, p?: Product) => void;
}

const UnifiedProductCard: React.FC<CardProps> = ({ product, cart, isDark, updateQuantity, handleManualQuantity }) => {
  // Determine if product is actively in cart
  const isInCart = (cart[product.id] > 0 || cart[product.id + '_box'] > 0 || cart[product.id + '_ltr'] > 0);
  const primaryColor = 'blue';

  const BoxLitreControls = ({ boxId, litreId, boxMultiplier, litreStep, litreMultiplier, litreLabel }: {
    boxId: string; litreId: string; boxMultiplier: number; litreStep: number; litreMultiplier: number; litreLabel: string;
  }) => (
    <div className={`flex items-center gap-4 p-3 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
      <div className="flex flex-col items-center flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Box</span>
        <div className={`flex items-center gap-1 mt-1 p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button onClick={() => updateQuantity(boxId, -1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500 text-slate-400">
            <RemoveIcon style={{ fontSize: 16 }} />
          </button>
          <input 
            type="number" min="0" value={cart[boxId] || ''} 
            onChange={(e) => handleManualQuantity(boxId, parseInt(e.target.value) || 0)} 
            placeholder="0" 
            className={`w-8 sm:w-10 text-center text-sm sm:text-base font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} 
          />
          <button onClick={() => updateQuantity(boxId, 1)} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600`}>
            <AddIcon style={{ fontSize: 16 }} />
          </button>
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-500 mt-1">{(product.price * boxMultiplier).toFixed(2)} /box</span>
      </div>
      
      <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
      
      <div className="flex flex-col items-center flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{litreLabel}</span>
        <div className={`flex items-center gap-1 mt-1 p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button onClick={() => updateQuantity(litreId, -litreStep)} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${(cart[litreId] || 0) > 0 ? 'hover:bg-red-100 hover:text-red-500' : ''} text-slate-400`} disabled={!(cart[litreId] || 0)}>
            <RemoveIcon style={{ fontSize: 16 }} />
          </button>
          <input 
            type="number" min="0" step={litreStep} value={cart[litreId] || ''} 
            onChange={(e) => handleManualQuantity(litreId, parseFloat(e.target.value) || 0, product)} 
            placeholder="0" 
            className={`w-8 sm:w-10 text-center text-sm sm:text-base font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} 
          />
          <button onClick={() => updateQuantity(litreId, litreStep)} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600`}>
            <AddIcon style={{ fontSize: 16 }} />
          </button>
        </div>
        <span className="text-[10px] sm:text-xs font-black text-slate-500 mt-1">{(product.price * litreMultiplier).toFixed(2)} /{litreLabel}</span>
      </div>
    </div>
  );

  const renderSizeControls = () => {
    const sizeLower = product.size.toLowerCase();
    
    // Pattern matching exactly like old layout
    if (sizeLower === '100 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={50} litreStep={1} litreMultiplier={10} litreLabel="LTR" />;
    if (sizeLower === '200 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={25} litreStep={1} litreMultiplier={5} litreLabel="LTR" />;
    if (sizeLower === '500 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={20} litreStep={1} litreMultiplier={2} litreLabel="LTR" />;
    if (sizeLower === '1 litre' || sizeLower === '1 ltr-pet' || sizeLower === '1 ltr') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={10} litreStep={1} litreMultiplier={1} litreLabel="PCS" />;
    if (sizeLower === '2 ltr') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={5} litreStep={2} litreMultiplier={1} litreLabel="2L-PCS" />;

    // Default simple quantity control
    return (
      <div className={`mt-2 flex items-center gap-2 p-1.5 rounded-xl border w-max ${isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <button onClick={() => updateQuantity(product.id, -1)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${(cart[product.id] || 0) > 0 ? 'hover:bg-red-100 hover:text-red-500 text-slate-600' : 'text-slate-300'}`} disabled={!(cart[product.id] || 0)}>
          <RemoveIcon style={{ fontSize: 16 }} />
        </button>
        <input 
          type="number" min="0" value={cart[product.id] || ''} 
          onChange={(e) => handleManualQuantity(product.id, parseInt(e.target.value) || 0)} 
          placeholder="0" 
          className={`w-10 text-center text-base font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`} 
        />
        <button onClick={() => updateQuantity(product.id, 1)} className={`w-8 h-8 rounded-lg bg-${primaryColor}-500 text-white flex items-center justify-center transition-all hover:bg-${primaryColor}-600`}>
          <AddIcon style={{ fontSize: 16 }} />
        </button>
      </div>
    );
  };

  return (
    <div className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border ${isInCart ? 'border-blue-400 shadow-md ring-1 ring-blue-400' : 'border-gray-100 shadow-sm hover:shadow-md'} rounded-2xl p-4 transition-all duration-200 group`}>
      {/* Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl sm:text-5xl">
        {product.icon ?? '🛢️'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 w-full shrink-0">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-500">
          {product.brand} &middot; {product.size}
        </p>
        <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug mt-0.5">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base sm:text-lg font-black text-gray-900">₹{product.price.toFixed(2)}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase">Unit price</span>
        </div>
      </div>

      {/* Box/Litre Controls */}
      <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
        {renderSizeControls()}
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// Unified Shop Page Component
// -------------------------------------------------------------

const UnifiedOrderingView: React.FC<Props> = ({ shopName, theme, cart, updateQuantity, onBack, onReviewOrder }) => {
  const isDark = theme === 'dark';
  
  const [activeCatId, setActiveCatId] = useState(SHOP_CATEGORIES[0].id);
  const [activeSubcatId, setActiveSubcatId] = useState(SHOP_CATEGORIES[0].subcategories[0].id);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const activeCat = SHOP_CATEGORIES.find(c => c.id === activeCatId)!;
  const allInSubcat = filterProducts(activeCat.getProducts(), activeSubcatId);
  
  const filtered = search.trim()
    ? allInSubcat.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.size.toLowerCase().includes(search.toLowerCase())
      )
    : allInSubcat;

  const handleCatChange = (catId: string) => {
    const cat = SHOP_CATEGORIES.find(c => c.id === catId)!;
    setActiveCatId(catId);
    setActiveSubcatId(cat.subcategories[0].id);
    setSearch('');
  };

  // Re-implementing handleManualQuantity identically to old NishaPure to ensure logic parity
  const handleManualQuantity = (id: string, val: number, p?: Product) => {
    let safeVal = isNaN(val) ? 0 : val;
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
    if (delta !== 0) updateQuantity(id, delta);
  };

  // Compute Cart Info for footer
  const totalItems = Object.values(cart).reduce((a, b) => a + Number(b), 0);

  return (
    <div className={`flex flex-col h-screen font-sans ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>

      {/* ── Header ── */}
      <header className={`flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 shrink-0 shadow-sm border-b ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton size="small" onClick={onBack} className={isDark ? '!text-white' : ''}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border font-black transition-all hover:-translate-x-1 ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
              ←
            </div>
          </IconButton>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-xs">{shopName}</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{activeCat.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showSearch && (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`border rounded-xl px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-32 sm:w-64 transition-all ${isDark ? 'bg-slate-800 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            />
          )}
          <IconButton size="small" onClick={() => { setShowSearch(s => !s); setSearch(''); }} className={isDark ? '!text-white' : ''}>
            <SearchIcon />
          </IconButton>
        </div>
      </header>

      {/* ── Top Category Tabs ── */}
      <div className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 overflow-x-auto shrink-0 custom-scrollbar border-b ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-gray-100'}`}>
        {SHOP_CATEGORIES.map(cat => {
          const isActive = cat.id === activeCatId;
          return (
            <button
              key={cat.id}
              onClick={() => handleCatChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                  : isDark ? 'bg-slate-800 text-slate-300 border-white/10 hover:border-blue-400 hover:text-blue-400' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Left Sidebar ── */}
        <aside className={`flex flex-col w-20 sm:w-28 shrink-0 overflow-y-auto custom-scrollbar border-r ${isDark ? 'bg-slate-950 border-white/5' : 'bg-white border-gray-200'}`}>
          {activeCat.subcategories.map(sub => {
            const isSel = sub.id === activeSubcatId;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatId(sub.id)}
                className={`flex flex-col items-center justify-center py-4 px-1 relative transition-all duration-200 border-b ${
                  isDark ? 'border-white/5' : 'border-gray-50'
                } ${
                  isSel
                    ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                    : isDark ? 'hover:bg-slate-900' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl sm:text-3xl leading-none mb-1.5">{sub.icon}</span>
                <span className={`text-[10px] text-center leading-tight font-bold ${isSel ? 'text-blue-500' : isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {sub.name}
                </span>
                {isSel && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-l-full" />
                )}
              </button>
            );
          })}
        </aside>

        {/* ── Product List ── */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 pb-32 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl mx-auto">
            {filtered.length > 0 ? (
              <>
                {filtered.map(product => (
                  <UnifiedProductCard 
                    key={product.id} 
                    product={product} 
                    cart={cart} 
                    isDark={isDark} 
                    updateQuantity={updateQuantity} 
                    handleManualQuantity={handleManualQuantity} 
                  />
                ))}
                <div className="text-center py-6">
                  <span className={`inline-block text-xs uppercase tracking-widest px-5 py-2 rounded-full border shadow-sm ${isDark ? 'bg-slate-800 text-slate-400 border-white/10' : 'bg-white text-gray-400 border-gray-100'}`}>
                    {filtered.length} items · End of List
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different subcategory or search term</p>
              </div>
            )}
          </div>
        </main>

        {/* Floating Cart Footer */}
        {totalItems > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
            <button
              onClick={onReviewOrder}
              className="w-full flex items-center justify-between p-4 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all text-left"
            >
              <div>
                <p className="opacity-80 text-xs font-black uppercase tracking-widest mb-1">Verify Cart Content</p>
                <p className="font-extrabold text-xl leading-none">{totalItems} Total Variants Added</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UnifiedOrderingView;
