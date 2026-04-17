import React from 'react';
import type { Subcategory } from '../../types/shop';

interface SidebarMenuProps {
  subcategories: Subcategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  subcategories,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col w-[100px] border-r border-gray-200 overflow-y-auto bg-gray-50/50 pb-20 custom-scrollbar">
      {subcategories.map((sub) => {
        const isSelected = selectedId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`flex flex-col items-center justify-center p-3 gap-2 transition-all duration-300 relative ${
              isSelected 
                ? 'bg-white shadow-[inset_4px_0_0_#3b82f6]' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            {/* Soft background shape behind icon when selected */}
            {isSelected && (
              <div className="absolute inset-0 bg-blue-50/50 opacity-50 pointer-events-none" />
            )}
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-transform duration-300 ${isSelected ? 'scale-110 shadow-sm bg-white' : 'bg-transparent'}`}>
               <img 
                 src={sub.image || 'https://via.placeholder.com/48'} 
                 alt={sub.name} 
                 className={`w-8 h-8 object-contain transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 grayscale-[50%]'}`}
               />
               {isSelected && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex justify-center items-center"><span className="text-[8px] text-white font-bold leading-none">&#10003;</span></div>}
            </div>
            
            <span 
              className={`text-[10px] text-center font-medium leading-tight relative z-10 ${
                isSelected ? 'text-blue-600 font-bold' : 'text-gray-500'
              }`}
            >
              {sub.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
