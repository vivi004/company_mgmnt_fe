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
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow duration-200">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-4xl">
        {product.icon ?? '🛢️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 truncate">
          {product.brand} · {product.size}
        </p>
        <h3 className="text-sm font-bold text-gray-800 leading-snug truncate">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Unit Price&nbsp;·&nbsp;
          <span className="font-bold text-gray-700">₹{product.price.toFixed(2)}</span>
        </p>
        <p className="text-[10px] text-gray-400 uppercase">{product.unit}</p>
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0">
        {qty === 0 ? (
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
          >
            <AddIcon fontSize="small" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1">
            <button
              onClick={() => setQty(q => Math.max(0, q - 1))}
              className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors shadow-sm border border-blue-100"
            >
              <RemoveIcon style={{ fontSize: 14 }} />
            </button>
            <span className="text-sm font-bold text-blue-700 min-w-[16px] text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <AddIcon style={{ fontSize: 14 }} />
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
  // Oil Cake: match by name
  const byName = products.filter(p => p.name === subcatId);
  if (byName.length > 0) return byName;
  // Nisha: match by id prefix e.g. 'GN' → 'gn-'
  return products.filter(p => p.id.startsWith(subcatId.toLowerCase() + '-'));
}

/* ── Page ── */
const ShopCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCatId, setActiveCatId] = useState(SHOP_CATEGORIES[0].id);
  const [activeSubcatId, setActiveSubcatId] = useState(SHOP_CATEGORIES[0].subcategories[0].id);

  const activeCat = SHOP_CATEGORIES.find(c => c.id === activeCatId)!;
  const filtered = filterProducts(activeCat.getProducts(), activeSubcatId);

  const handleCatChange = (catId: string) => {
    const cat = SHOP_CATEGORIES.find(c => c.id === catId)!;
    setActiveCatId(catId);
    setActiveSubcatId(cat.subcategories[0].id);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{activeCat.name}</h1>
        </div>
        <IconButton size="small">
          <SearchIcon fontSize="small" />
        </IconButton>
      </header>

      {/* Top Category Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-gray-100 shrink-0 custom-scrollbar">
        {SHOP_CATEGORIES.map(cat => {
          const isActive = cat.id === activeCatId;
          return (
            <button
              key={cat.id}
              onClick={() => handleCatChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="flex flex-col w-24 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 custom-scrollbar">
          {activeCat.subcategories.map(sub => {
            const isSel = sub.id === activeSubcatId;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatId(sub.id)}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-1 relative transition-all duration-200 ${
                  isSel ? 'bg-white shadow-[inset_3px_0_0_#2563eb]' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl leading-none">{sub.icon}</span>
                <span className={`text-[9px] text-center leading-tight font-semibold ${isSel ? 'text-blue-600' : 'text-gray-500'}`}>
                  {sub.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-3 pb-10">
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map(product => (
                <ShopProductCard key={product.id} product={product} />
              ))}
              <div className="text-center py-4">
                <span className="inline-block text-xs text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full">
                  End of List
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-gray-400 font-medium">No products found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ShopCategoryPage;
