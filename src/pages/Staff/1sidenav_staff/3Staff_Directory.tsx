import { useState, useMemo } from 'react';
import type { Product } from '../../../constants/productData';
import SearchIcon from '@mui/icons-material/Search';

interface StaffProductRatesProps {
    products: Product[];
    loading: boolean;
    theme: string;
}

const StaffProductRates = ({ products, loading, theme }: StaffProductRatesProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        
        const lowerSearch = searchTerm.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerSearch) || 
            p.brand.toLowerCase().includes(lowerSearch)
        );
    }, [products, searchTerm]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black italic tracking-tighter mb-4">Live Product Rates</h2>
                    <p className="text-blue-100 text-xl font-bold opacity-90 italic">Instantly search and view the latest synced pricing.</p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 className={`text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rate Card</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Synced with Master Database</p>
                    </div>
                    
                    {/* Search and Count */}
                    <div className="flex items-center gap-4">
                        <div className={`relative flex items-center w-full md:w-64 rounded-2xl overflow-hidden border transition-colors ${theme === 'dark' ? 'bg-slate-900 border-white/10 focus-within:border-blue-500' : 'bg-white border-slate-200 focus-within:border-blue-500 shadow-sm'}`}>
                            <div className="pl-4 text-slate-400">
                                <SearchIcon fontSize="small" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full py-2.5 px-3 bg-transparent outline-none text-sm font-bold ${theme === 'dark' ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
                            />
                        </div>
                        <div className="bg-slate-100 px-5 py-3 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest whitespace-nowrap hidden sm:block">
                            {filteredProducts.length} ITEMS
                        </div>
                    </div>
                </div>

                <div className={`rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} border-b`}>
                                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Product Name</th>
                                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Brand</th>
                                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Size / Unit</th>
                                    <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Current Rate</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                                {loading ? (
                                    <tr><td colSpan={4} className="px-10 py-20 text-center text-slate-500 font-black italic uppercase tracking-widest animate-pulse">Syncing Rates...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan={4} className="px-10 py-20 text-center text-slate-500 font-black italic tracking-widest">No products found for "{searchTerm}"</td></tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-blue-500/5 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl border transition-all group-hover:rotate-6 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                                                        {product.icon || '📦'}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-lg tracking-tight transition-colors italic uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-400 mt-0.5 sm:hidden">{product.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden sm:table-cell">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-slate-100'}`}>
                                                    {product.brand}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-black text-sm italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{product.size}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={`text-xl font-black italic tracking-tight ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                    ₹{product.price.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffProductRates;
