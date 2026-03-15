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
    setShowOlModal: (show: boolean) => void;
    handleDeleteRequest: (olId: number) => void;
}

const StaffOrderLines = ({ orderLines, olLoading, theme, setShowOlModal, handleDeleteRequest }: StaffOrderLinesProps) => {
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
            {/* orderLines Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[48px] p-10 text-white shadow-2xl shadow-emerald-600/30 relative overflow-hidden group">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-4">Territorial Operations</h2>
                        <p className="text-emerald-100 text-xl font-bold opacity-90 italic">Click a village to view its shops and outlets.</p>
                    </div>
                    <button
                        onClick={() => setShowOlModal(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all backdrop-blur-md border border-white/30"
                    >
                        + Add New Sector
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orderLines.map((ol, idx) => (
                            <div
                                key={ol.id}
                                onClick={() => setSelectedVillage(ol)}
                                className={`p-8 rounded-[40px] border flex items-center justify-between group transition-all hover:-translate-y-2 cursor-pointer
                                    ${theme === 'dark'
                                        ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10'
                                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200'}`}
                            >
                                <div className="flex items-center space-x-6 flex-1 min-w-0 mr-4">
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform
                                        ${theme === 'dark' ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black tracking-tight uppercase italic group-hover:text-emerald-500 transition-colors
                                            ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-base sm:text-lg lg:text-[17px] leading-tight text-balance break-words`} title={ol.name}>
                                            {ol.name}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest break-words">Node ID: {ol.node_id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Delete request button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(ol.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                        title="Request Deletion"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
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
