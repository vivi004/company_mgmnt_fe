
import React, { useState } from 'react';
import type { Product } from '../../../constants/productData';

interface StaffProductRatesProps {
    products: Product[];
    loading: boolean;
    theme: string;
}

const StaffProductRates = ({ theme }: StaffProductRatesProps) => {
    // Default GID for Sheet 1 is usually '0'. 
    // Replace '1' with your actual Sheet 2 GID from its URL if '1' does not load correctly.
    const [activeTab, setActiveTab] = useState('0');

    const tabs = [
        { id: '0', label: 'Sheet 1' },
        { id: '1631525042', label: 'Sheet 2' }, // Common random GID placeholder; User must update with exact GID if known, but I'll use a generic string '1' for now, actually I'll use '1' and if they said it has 3 sheets, they might be using default IDs. Edit: GIDs are random integers except the first sheet (0). I'll use '1' for placeholder.
    ];

    // Realistically, we use an array of objects to map standard tabs
    const sheetTabs = [
        { id: '0', name: 'Sheet 1' },
        { id: '1', name: 'Sheet 2' } // Update this string if Sheet 2 doesn't load.
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[48px] p-6 sm:p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter mb-2 sm:mb-4">Live Product Rates</h2>
                    <p className="text-blue-100 text-sm sm:text-xl font-bold opacity-90 italic">View the Master Rate Sheet directly.</p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rate Card</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] sm:text-xs tracking-widest">Live from Master Database</p>
                    </div>

                    {/* Custom Sheet Navigation Tabs */}
                    <div className={`flex items-center gap-2 p-1.5 rounded-2xl sm:rounded-3xl border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                        {sheetTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : `${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'}`
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Iframe View */}
                <div className={`rounded-[30px] sm:rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`} style={{ height: '75vh', minHeight: '500px' }}>
                    <iframe 
                        /* Uses widget=false to hide native bottom tabs and gid to force the sheet */
                        src={`https://docs.google.com/spreadsheets/d/1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM/htmlembed?widget=false&headers=false&chrome=false&gid=${activeTab}`} 
                        loading="lazy"
                        className={`w-full h-full border-0 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-90 mix-blend-screen' : ''}`}
                        title="Live Product Rates Sheet"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default StaffProductRates;
