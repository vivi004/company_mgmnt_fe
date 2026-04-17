import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
} from '../../constants/productData';
import type { Product, NishaSubcategory } from '../../constants/productData';

/* ── Inline Product Card ── */
const ShopProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [qty, setQty] = useState(0);
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all duration-200 group">

      {/* Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-105 transition-transform duration-200">
        {product.icon ?? '🛢️'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-500">
          {product.brand} &middot; {product.size}
        </p>
        <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug mt-0.5">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base sm:text-lg font-black text-gray-900">₹{product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 font-medium">/ {product.unit}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="shrink-0">
        {qty === 0 ? (
          <button
            onClick={() => setQty(1)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all duration-150 shadow-md"
          >
            <AddIcon />
          </button>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5">
            <button
              onClick={() => setQty(q => Math.max(0, q - 1))}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 hover:bg-blue-100 active:scale-95 transition-all"
            >
              <RemoveIcon style={{ fontSize: 16 }} />
            </button>
            <span className="text-sm sm:text-base font-bold text-blue-700 min-w-[20px] text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              <AddIcon style={{ fontSize: 16 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Category definitions ── */
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

function filterProducts(products: Product[], subcatId: string): Product[] {
  if (subcatId === 'ALL') return products;
  const byName = products.filter(p => p.name === subcatId);
  if (byName.length > 0) return byName;
  return products.filter(p => p.id.startsWith(subcatId.toLowerCase() + '-'));
}

/* ── Page ── */
const ShopCategoryPage: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 bg-white border-b border-gray-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight leading-none">{activeCat.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{filtered.length} products</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showSearch && (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400 w-40 sm:w-64 transition-all"
            />
          )}
          <IconButton size="small" onClick={() => { setShowSearch(s => !s); setSearch(''); }}>
            <SearchIcon />
          </IconButton>
        </div>
      </header>

      {/* ── Top Category Tabs ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 overflow-x-auto bg-white border-b border-gray-100 shrink-0 custom-scrollbar">
        {SHOP_CATEGORIES.map(cat => {
          const isActive = cat.id === activeCatId;
          return (
            <button
              key={cat.id}
              onClick={() => handleCatChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside className="flex flex-col w-20 sm:w-36 shrink-0 border-r border-gray-200 overflow-y-auto bg-white custom-scrollbar">
          {activeCat.subcategories.map(sub => {
            const isSel = sub.id === activeSubcatId;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatId(sub.id)}
                className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-3 sm:py-4 px-1 sm:px-2 relative transition-all duration-200 border-b border-gray-50 ${
                  isSel
                    ? 'bg-blue-50 shadow-[inset_3px_0_0_#2563eb]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xl sm:text-3xl leading-none">{sub.icon}</span>
                <span className={`text-[9px] sm:text-[11px] text-center leading-tight font-semibold ${isSel ? 'text-blue-600' : 'text-gray-500'}`}>
                  {sub.name}
                </span>
                {isSel && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full" />
                )}
              </button>
            );
          })}
        </aside>

        {/* ── Product List ── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-3 sm:p-6 pb-10">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl mx-auto">
            {filtered.length > 0 ? (
              <>
                {filtered.map(product => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
                <div className="text-center py-6">
                  <span className="inline-block text-xs text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-5 py-2 rounded-full shadow-sm">
                    {filtered.length} items · End of List
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-gray-500 font-semibold">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different subcategory or search term</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default ShopCategoryPage;
