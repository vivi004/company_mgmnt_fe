import React from 'react';
import type { Product } from '../../types/shop';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IconButton } from '@mui/material';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 border border-gray-100 p-4 gap-4 w-full relative">
      
      {/* Product Image Section */}
      <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0 bg-gray-50 rounded-xl flex items-center justify-center p-2 group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex gap-1 flex-col">
           {product.isAd && (
            <span className="bg-gray-400/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-sm">
              AD
            </span>
          )}
        </div>
        
        <div className="absolute top-1 right-1">
          <IconButton size="small" className="text-gray-400 hover:text-red-500 bg-white shadow-sm">
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
        </div>
        
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-medium text-gray-700 shadow-sm border border-gray-100">
           {product.weightOrVolume}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col flex-1 justify-between py-1">
        {/* Top Info */}
        <div>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-widest gap-1">
              <AccessTimeIcon style={{ fontSize: 14 }} />
              {product.timeToDeliver}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold border border-green-200">
                <StarIcon style={{ fontSize: 12 }} />
                {product.rating} <span className="text-gray-500 font-medium text-[10px]">({product.ratingCount})</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 leading-tight mt-1 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 flex justify-between items-end">
          <div>
            {product.discountPercentage && (
              <div className="text-emerald-600 font-bold text-sm mb-0.5 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-100">
                {product.discountPercentage}% OFF
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          
          <button className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors duration-300 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
            <AddIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
