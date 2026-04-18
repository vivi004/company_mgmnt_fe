import { useState } from 'react';
import ShopManager from '../../../components/common/ShopManager/ShopManager';


interface OrderLine {
    id: number;
    name: string;
    node_id: string;
}

interface StaffOrderLinesProps {
    orderLines: OrderLine[];
    olLoading: boolean;
    theme: string;
}

const StaffOrderLines = ({ orderLines, olLoading, theme }: StaffOrderLinesProps) => {
    const [selectedVillage, setSelectedVillage] = useState<OrderLine | null>(null);

    // If a village is selected, show its shop list
    if (selectedVillage) {
        return (
            <ShopManager
                orderLineId={selectedVillage.id}
                villageName={selectedVillage.name}
                theme={theme}
                onBack={() => setSelectedVillage(null)}
                type="staff"
            />
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Sector List */}
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className={`text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Sector Directory</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Click a village to view shops</p>
                    </div>
                    <div className="bg-slate-100 px-5 py-2 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest">
                        {orderLines.length} NODES IDENTIFIED
                    </div>
                </div>

                {olLoading ? (
                    <div className="p-20 text-center text-emerald-500 font-black italic uppercase tracking-widest animate-pulse">Syncing Sector Data...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {orderLines.map((ol, idx) => (
                            <div
                                key={ol.id}
                                onClick={() => setSelectedVillage(ol)}
                                className={`p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border flex items-center justify-between group transition-all hover:-translate-y-2 cursor-pointer
                                    ${theme === 'dark'
                                        ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10'
                                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200'}`}
                            >
                                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 mr-2 sm:mr-4">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform
                                        ${theme === 'dark' ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black tracking-tight uppercase italic group-hover:text-emerald-500 transition-colors
                                            ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-sm sm:text-lg lg:text-[17px] leading-tight break-words`} title={ol.name}>
                                            {ol.name}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-1 sm:mt-2 uppercase tracking-widest truncate">Node ID: {ol.node_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    
                                    {/* Chevron */}
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffOrderLines;
