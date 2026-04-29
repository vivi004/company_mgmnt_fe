import React from 'react';
import { useAdminBills } from './useAdminBills';
import AdminBillsCalendar from './Admin_BillsCalendar';
import AdminBillsEditModal from './Admin_BillsEditModal';
import { previewBill, downloadBill, downloadAllFiltered, downloadStaffBillsPdf, type Bill } from '../../../utils/invoiceGenerator';
import { printLoadingSheet } from '../../../utils/loadingSheetGenerator';
import { getAuthAxios } from '../../../utils/apiClient';
import { useState, useEffect } from 'react';

interface Props {
    bills: Bill[];
    theme: string;
    onDeleteBill: (id: number) => void;
    onClearAll: () => void;
    onEditBill: (id: number, newCart: Record<string, number>, newRates?: Record<string, number>) => void;
}

const AdminBills: React.FC<Props> = ({ bills, theme, onDeleteBill, onClearAll, onEditBill }) => {
    const isDark = theme === 'dark';
    const { state, actions, computed, refs } = useAdminBills(bills, onEditBill);

    const [motorVehicles, setMotorVehicles] = useState<any[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<Record<string, string>>({});

    useEffect(() => {
        getAuthAxios().get('/api/settings/vehicles')
            .then(res => setMotorVehicles(res.data))
            .catch(err => console.error('Failed to load vehicles', err));
    }, []);

    const handleVehicleChange = (staffName: string, vehicleNo: string) => {
        setSelectedVehicles(prev => ({ ...prev, [staffName]: vehicleNo }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                    <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {state.filteredBills.length} invoice{state.filteredBills.length !== 1 ? 's' : ''} stored
                    </p>

                    <div className="relative flex items-center" ref={refs.calendarRef}>
                        <button
                            onClick={() => actions.setIsCalendarOpen(!state.isCalendarOpen)}
                            className={`flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none border transition-all shadow-sm
                                ${isDark
                                    ? 'bg-slate-800 border-white/10 text-white hover:border-blue-500/50'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-blue-500 hover:shadow-md'}
                                ${state.isCalendarOpen ? (isDark ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-blue-500 ring-2 ring-blue-500/20') : ''}`}
                        >
                            <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date Filter'}
                        </button>

                        <AdminBillsCalendar
                            isCalendarOpen={state.isCalendarOpen}
                            currentCalDate={state.currentCalDate}
                            selectedDate={state.selectedDate}
                            todayStr={state.todayStr}
                            minDate={state.minDate}
                            maxDate={state.maxDate}
                            handlePrevMonth={actions.handlePrevMonth}
                            handleNextMonth={actions.handleNextMonth}
                            handleDateSelect={actions.handleDateSelect}
                            generateCalendarDays={computed.generateCalendarDays}
                            theme={theme}
                        />

                        {state.selectedDate && (
                            <button
                                onClick={() => actions.setSelectedDate('')}
                                className={`ml-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                                title="Clear date filter"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => downloadAllFiltered(state.filteredBills)}
                        disabled={state.filteredBills.length === 0}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download All PDF
                    </button>
                    <button
                        onClick={() => printLoadingSheet(state.filteredBills, state.selectedDate || state.todayStr)}
                        disabled={state.filteredBills.length === 0}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Loading Sheet
                    </button>
                    <button
                        onClick={onClearAll}
                        disabled={bills.length === 0}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-red-500/10 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-red-500 hover:text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Bills Table */}
            {state.filteredBills.length === 0 ? (
                <div className={`text-center py-20 rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">📄</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>No Bills Found</p>
                    <p className="text-slate-500 mt-2 font-medium">
                        {state.selectedDate ? "No bills match the selected date." : "Place orders from Order Lines to see bills here"}
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(state.groupedBills).map(([staffName, staffBills]) => (
                        <div key={staffName} className="space-y-4">
                            {/* Staff Header */}
                            <div className="flex flex-wrap items-center justify-between px-2 gap-4">
                                <h3 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {staffName}'s Bills
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <select
                                        value={selectedVehicles[staffName] || ''}
                                        onChange={(e) => handleVehicleChange(staffName, e.target.value)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all focus:outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {motorVehicles.map(v => (
                                            <option key={v.id} value={v.vehicle_no}>{v.vehicle_no}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => downloadStaffBillsPdf(staffBills, staffName, selectedVehicles[staffName] || '')}
                                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={() => printLoadingSheet(staffBills, state.selectedDate || state.todayStr, selectedVehicles[staffName] || '')}
                                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Loading Sheet
                                    </button>
                                </div>
                            </div>

                            <div className={`rounded-[40px] border overflow-x-auto hide-scrollbar ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                <div className="min-w-[800px]">
                                    {/* Header */}
                                    <div className={`grid grid-cols-12 gap-4 px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b
                                        ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                        <div className="col-span-1">S.No</div>
                                    <div className="col-span-3">Shop Name</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-1">Items</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-3 text-right">Actions</div>
                                </div>

                                {/* Rows */}
                                {staffBills.map((bill) => (
                                    <div
                                        key={bill.id}
                                        className={`grid grid-cols-12 gap-4 px-8 py-5 items-center border-b transition-all
                                            ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-blue-50/30'}`}
                                    >
                                         <div className={`col-span-1 font-black text-xs ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                                                #{bill.invoiceNo}
                                            </div>
                                        <div className="col-span-3">
                                            <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{bill.shopName}</p>
                                            <p className="text-xs text-slate-500 font-medium">{bill.villageName}</p>
                                        </div>
                                        <div className={`col-span-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </div>
                                        <div className={`col-span-1 font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {computed.getItemCount(bill.cart)}
                                        </div>
                                        <div className={`col-span-2 text-right font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{computed.getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="col-span-3 flex justify-end gap-2">
                                            <button
                                                onClick={() => previewBill(bill, selectedVehicles[staffName] || '')}
                                                className={`p-2.5 rounded-xl transition-all border shrink-0
                                                    ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-400'}`}
                                                title="Preview PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => actions.openEditModal(bill)}
                                                className={`p-2.5 rounded-xl transition-all border shrink-0
                                                    ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm hover:border-blue-400 hover:bg-blue-50'}`}
                                                title="Edit Bill"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => downloadBill(bill, selectedVehicles[staffName] || '')}
                                                className="px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center shrink-0"
                                                title="Download PDF"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => onDeleteBill(bill.id)}
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl transition-all border border-red-500/20 active:scale-90 shrink-0"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AdminBillsEditModal
                open={!!state.editingBill}
                onClose={() => actions.setEditingBill(null)}
                editingBill={state.editingBill}
                editCart={state.editCart}
                setEditCart={actions.setEditCart}
                editRates={state.editRates}
                setEditRates={actions.setEditRates}
                searchQuery={state.searchQuery}
                setSearchQuery={actions.setSearchQuery}
                selectedCategory={state.selectedCategory}
                setSelectedCategory={actions.setSelectedCategory}
                handleSaveEdit={actions.handleSaveEdit}
                getTotal={computed.getTotal}
                getItemCount={computed.getItemCount}
                theme={theme}
            />
        </div>
    );
};

export default AdminBills;
