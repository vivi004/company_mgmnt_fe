import { useState } from 'react';
import ShopManager from '../../../components/common/ShopManager/ShopManager';

interface OrderLine {
    id: number;
    name: string;
    node_id: string;
}

interface OrderLineProps {
    orderLines: OrderLine[];
    theme: string;
    handleOpenOlModal: (ol?: OrderLine) => void;
    handleDeleteOl: (id: number) => void;
}

const AdminOrderLines = ({ orderLines, theme, handleOpenOlModal, handleDeleteOl }: OrderLineProps) => {
    const [selectedVillage, setSelectedVillage] = useState<OrderLine | null>(null);

    // If a village is selected, show its shop list
    if (selectedVillage) {
        return (
            <ShopManager
                orderLineId={selectedVillage.id}
                villageName={selectedVillage.name}
                theme={theme}
                onBack={() => setSelectedVillage(null)}
                type="admin"
            />
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Order Lines Management</h3>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Click a village to view its shops</p>
                </div>

                <button
                    onClick={() => handleOpenOlModal()}
                    className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto"
                >
                    + New Shop Lines
                </button>
            </div>

            {/* Village Sector Cards */}
            <div className="space-y-8">
                <h4 className={`text-xl font-black italic uppercase tracking-widest flex items-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4 text-blue-500">📍</div>
                    Shop Lines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orderLines.map((ol, idx) => (
                        <div
                            key={ol.id}
                            onClick={() => setSelectedVillage(ol)}
                            className={`p-8 rounded-[40px] border group transition-all cursor-pointer hover:-translate-y-2 hover:shadow-2xl
                                ${theme === 'dark'
                                    ? 'bg-slate-900 border-white/5 hover:border-blue-500/30 hover:shadow-blue-500/10'
                                    : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-blue-500/15 hover:border-blue-200'}`}
                        >
                            {/* Clickable area — navigate to shops */}
                            <div className="flex items-center space-x-6 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-transform group-hover:rotate-6
                                    ${theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-grow">
                                    <p className={`font-black text-lg tracking-tight uppercase italic group-hover:text-blue-500 transition-colors
                                        ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {ol.name}
                                    </p>
                                </div>
                                {/* Arrow hint */}
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            <div className="flex justify-end items-center mt-6 pt-6 border-t border-slate-100/5">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenOlModal(ol); }}
                                        className={`px-4 py-3 sm:p-2 rounded-xl transition-all border flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-500 hover:bg-blue-600 hover:text-white'}`}
                                        title="Edit Node"
                                    >
                                        <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        <span className="sm:hidden text-[10px] font-black uppercase">Edit</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOl(ol.id); }}
                                        className={`px-4 py-3 sm:p-2 rounded-xl transition-all border flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:text-red-500' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                        title="Delete Node"
                                    >
                                        <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="sm:hidden text-[10px] font-black uppercase">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderLines;
