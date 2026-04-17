import React, { useState } from 'react';
import type { Product } from '../../constants/productData';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface ShopProductCardProps {
  product: Product;
}

export const ShopProductCard: React.FC<ShopProductCardProps> = ({ product }) => {
  const [qty, setQty] = useState(0);

  const inc = () => setQty(q => q + 1);
  const dec = () => setQty(q => Math.max(0, q - 1));

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow duration-200">

      {/* Icon / Image */}
      <div className="w-16 h-16 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-4xl">
        {product.icon ?? '🛢️'}
      </div>

      {/* Details */}
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

      {/* Quantity Controls */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {qty === 0 ? (
          <button
            onClick={inc}
            className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
          >
            <AddIcon fontSize="small" />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1">
            <button
              onClick={dec}
              className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors shadow-sm border border-blue-100"
            >
              <RemoveIcon style={{ fontSize: 14 }} />
            </button>
            <span className="text-sm font-bold text-blue-700 min-w-[16px] text-center">{qty}</span>
            <button
              onClick={inc}
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
