import React, { useState, useRef, useEffect, memo } from 'react';
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
  rates: Record<string, number>;
  updateQuantity: (id: string, delta: number) => void;
  updateRate: (id: string, rate: number) => void;
  onBack: () => void;
  onReviewOrder: (hasEditedPrice: boolean) => void;
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
    name: 'Varshini Gold',
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
  rates: Record<string, number>;
  isDark: boolean;
  updateQuantity: (id: string, delta: number) => void;
  updateRate: (id: string, rate: number) => void;
  handleManualQuantity: (id: string, val: number, p?: Product) => void;
}

const BoxLitreControls = memo(({ boxId, litreId, boxMultiplier, litreStep, litreMultiplier, litreLabel, currentBaseRate, isDark, updateQuantity, handleManualQuantity, product, cart }: {
  boxId: string; litreId: string; boxMultiplier: number; litreStep: number; litreMultiplier: number; litreLabel: string;
  currentBaseRate: number; isDark: boolean; updateQuantity: (id: string, delta: number) => void; 
  handleManualQuantity: (id: string, val: number, p?: Product) => void; product: Product; cart: Record<string, number>;
}) => {
  const boxRate = currentBaseRate * boxMultiplier;
  const litreRate = currentBaseRate * litreMultiplier;

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 rounded-[24px] border ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
      
      {/* Box Section */}
      <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
        <div className="flex flex-col items-start sm:items-end min-w-[60px] sm:min-w-[70px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Box</span>
          <span className={`text-xs font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>₹{boxRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button onClick={() => updateQuantity(boxId, -1)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <RemoveIcon style={{ fontSize: 18 }} />
          </button>
          <input
            type="number" min="0" value={cart[boxId] || ''}
            onChange={(e) => handleManualQuantity(boxId, parseInt(e.target.value) || 0)}
            placeholder="0"
            className={`w-12 sm:w-10 text-center text-base sm:text-sm font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
          />
          <button onClick={() => updateQuantity(boxId, 1)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <AddIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className={`hidden sm:block w-px h-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
      <div className={`sm:hidden w-full h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

      {/* Litre Section */}
      <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
        <div className="flex flex-col items-start sm:items-end min-w-[60px] sm:min-w-[70px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{litreLabel}</span>
          <span className={`text-xs font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>₹{litreRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button onClick={() => updateQuantity(litreId, -litreStep)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <RemoveIcon style={{ fontSize: 18 }} />
          </button>
          <input
            type="number" min="0" step={litreStep} value={cart[litreId] || ''}
            onChange={(e) => handleManualQuantity(litreId, parseFloat(e.target.value) || 0, product)}
            placeholder="0"
            className={`w-12 sm:w-10 text-center text-base sm:text-sm font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'} [-moz-appearance:_textfield][&::-webkit-inner-spin-button]:m-0[&::-webkit-inner-spin-button]:appearance-none`}
          />
          <button onClick={() => updateQuantity(litreId, litreStep)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <AddIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
});

const UnifiedProductCard = memo(({ product, cart, rates, isDark, updateQuantity, updateRate, handleManualQuantity }: CardProps) => {
  // Local state for price input to allow clearing/editing without jumps
  const [priceInput, setPriceInput] = useState<string>((rates[product.id] ?? product.price).toString());

  // Sync with prop changes only if not focused or if meaningfully different
  useEffect(() => {
    const currentPrice = rates[product.id] ?? product.price;
    if (parseFloat(priceInput) !== currentPrice && priceInput !== "") {
      setPriceInput(currentPrice.toString());
    }
  }, [rates[product.id], product.price]);

  const handlePriceChange = (val: string) => {
    let finalVal = val;
    // If user deleted everything, make it "0"
    if (finalVal === "") {
      finalVal = "0";
    }
    // If user starts typing while it is "0", remove the leading zero
    // e.g. "01" -> "1", but keep "0." for decimals
    if (finalVal.length > 1 && finalVal.startsWith('0') && finalVal[1] !== '.') {
      finalVal = finalVal.substring(1);
    }

    if (/^\d*\.?\d*$/.test(finalVal)) {
      setPriceInput(finalVal);
      const numeric = parseFloat(finalVal);
      updateRate(product.id, isNaN(numeric) ? 0 : numeric);
    }
  };

  // Determine if product is actively in cart
  const isInCart = (cart[product.id] > 0 || cart[product.id + '_box'] > 0 || cart[product.id + '_ltr'] > 0);
  const primaryColor = 'blue';

  const renderSizeControls = () => {
    const sizeLower = product.size.toLowerCase();
    const currentBaseRate = rates[product.id] ?? product.price;

    // Pattern matching exactly like old layout
    if (sizeLower === '100 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={50} litreStep={1} litreMultiplier={10} litreLabel="LTR" currentBaseRate={currentBaseRate} isDark={isDark} updateQuantity={updateQuantity} handleManualQuantity={handleManualQuantity} product={product} cart={cart} />;
    if (sizeLower === '200 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id + '_ltr'} boxMultiplier={25} litreStep={1} litreMultiplier={5} litreLabel="LTR" currentBaseRate={currentBaseRate} isDark={isDark} updateQuantity={updateQuantity} handleManualQuantity={handleManualQuantity} product={product} cart={cart} />;
    if (sizeLower === '500 ml') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={20} litreStep={1} litreMultiplier={1} litreLabel="PCS" currentBaseRate={currentBaseRate} isDark={isDark} updateQuantity={updateQuantity} handleManualQuantity={handleManualQuantity} product={product} cart={cart} />;
    if (sizeLower === '1 litre' || sizeLower === '1 ltr-pet' || sizeLower === '1 ltr') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={10} litreStep={1} litreMultiplier={1} litreLabel="PCS" currentBaseRate={currentBaseRate} isDark={isDark} updateQuantity={updateQuantity} handleManualQuantity={handleManualQuantity} product={product} cart={cart} />;
    if (sizeLower === '2 ltr') return <BoxLitreControls boxId={product.id + '_box'} litreId={product.id} boxMultiplier={5} litreStep={1} litreMultiplier={1} litreLabel="2L-PCS" currentBaseRate={currentBaseRate} isDark={isDark} updateQuantity={updateQuantity} handleManualQuantity={handleManualQuantity} product={product} cart={cart} />;

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
    <div className={`relative flex flex-col lg:flex-row items-stretch lg:items-center gap-4 rounded-[32px] p-4 lg:p-5 transition-all duration-300 group border ${isDark
      ? isInCart ? 'bg-slate-800 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40' : 'bg-slate-800 border-white/5 hover:border-white/10'
      : isInCart ? 'bg-white border-blue-400 shadow-xl ring-1 ring-blue-400' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
    }`}>
      {/* Product info section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon */}
        <div className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-2xl flex items-center justify-center text-3xl lg:text-5xl transition-transform group-hover:scale-110 duration-300 ${isDark ? 'bg-slate-700/60' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
          {product.icon ?? '🛢️'}
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
            {product.brand} &middot; {product.size}
          </p>
          <h3 className={`text-base lg:text-lg font-black leading-tight mt-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
          
          {/* Price Edit Box */}
          <div className="flex items-center gap-3 mt-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all focus-within:ring-4 ${isDark ? 'bg-slate-950/50 border-white/10 focus-within:ring-blue-500/20' : 'bg-slate-50 border-slate-200 focus-within:ring-blue-600/10'}`}>
              <span className="text-[10px] font-black text-slate-400 uppercase">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
                onBlur={() => {
                  if (priceInput === "" || isNaN(parseFloat(priceInput))) {
                    setPriceInput(product.price.toString());
                  }
                }}
                className={`w-20 text-xs font-black bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Unit Price</span>
          </div>
        </div>
      </div>

      {/* Controls section */}
      <div className="lg:shrink-0 w-full lg:w-auto">
        {renderSizeControls()}
      </div>
    </div>
  );
});


// -------------------------------------------------------------
// Unified Shop Page Component
// -------------------------------------------------------------

const UnifiedOrderingView: React.FC<Props> = ({ shopName, theme, cart, rates, updateQuantity, updateRate, onBack, onReviewOrder }) => {
  const isDark = theme === 'dark';

  const [activeCatId, setActiveCatId] = useState(SHOP_CATEGORIES[0].id);
  const [activeSubcatId, setActiveSubcatId] = useState(SHOP_CATEGORIES[0].subcategories[0].id);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  // Scroll to top when category or subcategory changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCatId, activeSubcatId]);


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
        safeVal = Math.round(safeVal);
      } else if (size === '1 litre' || size === '1 ltr-pet') {
        safeVal = Math.round(safeVal);
      } else if (size === '2 ltr') {
        safeVal = Math.round(safeVal);
      }
    }
    const current = cart[id] || 0;
    const delta = safeVal - current;
    if (delta !== 0) updateQuantity(id, delta);
  };

  // Compute Cart Info for footer
  const totalItems = Object.values(cart).reduce((a, b) => a + Number(b), 0);
  
  // Detection for "EDITED PRICE" flag
  const hasEditedPrice = Object.keys(rates).some(id => rates[id] !== undefined);

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
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${isActive
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

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row relative">
        {/* ── Subcategory Navigation (Responsive) ── */}
      <div className={`flex sm:flex-col w-full sm:w-28 shrink-0 overflow-x-auto sm:overflow-y-auto custom-scrollbar border-b sm:border-b-0 sm:border-r ${isDark ? 'bg-slate-950 border-white/5' : 'bg-white border-gray-200'}`}>
        {activeCat.subcategories.map(sub => {
          const isSel = sub.id === activeSubcatId;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubcatId(sub.id)}
              className={`flex flex-row sm:flex-col items-center justify-center py-3 sm:py-5 px-4 sm:px-1 relative transition-all duration-200 border-r sm:border-r-0 sm:border-b whitespace-nowrap gap-2 sm:gap-0 ${isDark ? 'border-white/5' : 'border-gray-50'
                } ${isSel
                  ? isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                  : isDark ? 'hover:bg-slate-900' : 'hover:bg-gray-50'
                }`}
            >
              <span className="text-xl sm:text-3xl leading-none">{sub.icon}</span>
              <span className={`text-[10px] sm:text-[10px] text-center leading-tight font-black uppercase tracking-tighter ${isSel ? 'text-blue-500' : isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {sub.name}
              </span>
              {isSel && (
                <>
                  <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-500 rounded-l-full" />
                  <div className="sm:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-500 rounded-t-full" />
                </>
              )}
            </button>
          );
        })}
      </div>

        {/* ── Product List ── */}
        <main 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 pb-36 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}
        >
          <div className="flex flex-col gap-3 sm:gap-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
              {filtered.map(p => (
                <UnifiedProductCard
                  key={p.id}
                  product={p}
                  cart={cart}
                  rates={rates}
                  isDark={isDark}
                  updateQuantity={updateQuantity}
                  updateRate={updateRate}
                  handleManualQuantity={handleManualQuantity}
                />
              ))}
            </div>
            {filtered.length > 0 ? (
              <div className="text-center py-6">
                <span className={`inline-block text-xs uppercase tracking-widest px-5 py-2 rounded-full border shadow-sm ${isDark ? 'bg-slate-800 text-slate-400 border-white/10' : 'bg-white text-gray-400 border-gray-100'}`}>
                  {filtered.length} items · End of List
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different subcategory or search term</p>
              </div>
            )}
          </div>
        </main>



      </div>
      {/* ── Footer ── */}
      <footer className={`px-4 sm:px-6 h-16 sm:h-20 shrink-0 border-t flex items-center justify-between ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Order</span>
          <span className={`text-base sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalItems} Items</span>
        </div>
        <button
          onClick={() => onReviewOrder(hasEditedPrice)}
          disabled={totalItems === 0}
          className={`px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all
            ${totalItems > 0
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Review Order →
        </button>
      </footer>
    </div>
  );
};

export default UnifiedOrderingView;
