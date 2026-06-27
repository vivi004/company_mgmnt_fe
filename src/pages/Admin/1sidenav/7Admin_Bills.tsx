import React from 'react';
import { useAdminBills } from './useAdminBills';
import AdminBillsCalendar from './Admin_BillsCalendar';
import UnifiedOrderingView from '../../../components/common/ShopManager/UnifiedOrderingView';
import ReviewOrder from '../../../components/common/ReviewOrder/ReviewOrder';
import { previewBill, downloadBill, downloadAllFiltered, downloadStaffBillsPdf, downloadStaffDataPdf, type Bill } from '../../../utils/invoiceGenerator';
import { printLoadingSheet } from '../../../utils/loadingSheetGenerator';
import { useState } from 'react';

interface Props {
    bills: Bill[];
    theme: string;
    onDeleteBill: (id: number) => void;
    onEditBill: (id: number, newCart: Record<string, number>, newRates?: Record<string, number>, newDate?: string, isEditedPrice?: boolean, isEditedQty?: boolean, isEditedDate?: boolean) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    motorVehicles: any[];
    isViewer?: boolean;
}

const AdminBills: React.FC<Props> = ({ bills, theme, onDeleteBill, onEditBill, selectedDate, setSelectedDate, motorVehicles, isViewer }) => {
    const isDark = theme === 'dark';
    const { state, actions, computed, refs } = useAdminBills(bills, onEditBill, selectedDate, setSelectedDate);

    const [selectedVehicles, setSelectedVehicles] = useState<Record<string, string>>({});
    const [printBothCopies, setPrintBothCopies] = useState(false);

    const handleVehicleChange = (staffName: string, vehicleNo: string) => {
        setSelectedVehicles(prev => ({ ...prev, [staffName]: vehicleNo }));
    };

    if (state.editingBill) {
        if (state.showReview) {
            return (
                <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                    <ReviewOrder
                        shopName={state.editingBill.shopName}
                        villageName={state.editingBill.villageName}
                        theme={theme}
                        cart={state.editCart}
                        updateQuantity={actions.updateQuantity}
                        onBack={() => actions.setShowReview(false)}
                        onPlaceOrder={actions.handleSaveEdit}
                        type="admin"
                        deliveryDate={state.editDeliveryDate}
                        onDeliveryDateChange={actions.setEditDeliveryDate}
                        customRates={state.editRates}
                    />
                </div>
            );
        }

        return (
            <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <UnifiedOrderingView
                    shopName={state.editingBill.shopName}
                    theme={theme}
                    cart={state.editCart}
                    rates={state.editRates}
                    updateQuantity={actions.updateQuantity}
                    updateRate={actions.updateRate}
                    onBack={() => actions.setEditingBill(null)}
                    onReviewOrder={(edited) => {
                        actions.setIsEditedPrice(edited);
                        actions.setShowReview(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {state.filteredBills.length} invoice{state.filteredBills.length !== 1 ? 's' : ''} stored
                    </p>

                    {/* Search Bar */}
                    <div className="relative group w-full sm:w-64">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Bills..."
                            value={state.listSearchQuery}
                            onChange={(e) => actions.setListSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border outline-none
                                ${isDark 
                                    ? 'bg-slate-800 border-white/10 text-white focus:border-blue-500/50' 
                                    : 'bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500/50'}`}
                        />
                    </div>

                    <div className="relative flex items-center" ref={refs.calendarRef}>
                        <div className={`flex items-center rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                            {state.selectedDate && (
                                <button 
                                    onClick={() => {
                                        const d = new Date(state.selectedDate);
                                        d.setDate(d.getDate() - 1);
                                        actions.setSelectedDate(d.toISOString().split('T')[0]);
                                    }}
                                    className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                    title="Previous Day"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                            )}
                            
                            <button
                                onClick={() => actions.setIsCalendarOpen(!state.isCalendarOpen)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest outline-none transition-all ${!state.selectedDate ? 'rounded-2xl' : ''}
                                    ${isDark ? 'text-white hover:text-blue-400' : 'text-slate-800 hover:text-blue-600'}
                                    ${state.isCalendarOpen ? 'text-blue-500' : ''}`}
                            >
                                <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {state.selectedDate ? new Date(state.selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'Select Date Filter'}
                            </button>

                            {state.selectedDate && (
                                <button 
                                    onClick={() => {
                                        const d = new Date(state.selectedDate);
                                        d.setDate(d.getDate() + 1);
                                        actions.setSelectedDate(d.toISOString().split('T')[0]);
                                    }}
                                    className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                    title="Next Day"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            )}
                        </div>

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

                <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-3 sm:gap-4 w-full sm:w-auto items-center">
                    {/* Print Duplicate Toggle */}
                    <div className="flex items-center gap-3 mr-2 sm:mr-4 select-none">
                        <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Duplicate Copy
                        </span>
                        <button
                            onClick={() => setPrintBothCopies(!printBothCopies)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 outline-none ${
                                printBothCopies ? 'bg-blue-600' : (isDark ? 'bg-slate-700' : 'bg-slate-200')
                            }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                    printBothCopies ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {!isViewer && (
                    <button
                        onClick={() => downloadAllFiltered(state.filteredBills, '', printBothCopies)}
                        disabled={state.filteredBills.length === 0}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">Download All PDF</span>
                    </button>
                    )}
                    <button
                        onClick={() => printLoadingSheet(state.filteredBills, state.selectedDate || state.todayStr)}
                        disabled={state.filteredBills.length === 0}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">Loading Sheet</span>
                    </button>
                </div>
            </div>

            {/* Bills Table */}
            {state.filteredBills.length === 0 ? (
                <div className={`text-center py-16 sm:py-20 rounded-[28px] sm:rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">📄</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>No Bills Found</p>
                    <p className="text-slate-500 mt-2 font-medium">
                        {state.selectedDate ? "No bills match the selected date." : "Place orders from Order Lines to see bills here"}
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(state.groupedBills).map(([staffName, villageGroups]) => {
                        // Flatten all bills for this staff for the top-level staff buttons
                        const allStaffBills = Object.values(villageGroups).flat();
                        
                        return (
                            <div key={staffName} className="space-y-8">
                                {/* Staff Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
                                    <h3 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {staffName}'s Bills
                                    </h3>
                                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full sm:w-auto">
                                        <select
                                            value={selectedVehicles[staffName] || ''}
                                            onChange={(e) => handleVehicleChange(staffName, e.target.value)}
                                            className={`w-full xs:w-48 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all focus:outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                                        >
                                            <option value="">Select Vehicle</option>
                                            {motorVehicles.map(v => (
                                                <option key={v.id} value={v.vehicle_no}>{v.vehicle_no}</option>
                                            ))}
                                        </select>
                                        <div className="flex items-center gap-3 flex-1 xs:flex-initial">
                                            <button
                                                onClick={() => downloadStaffBillsPdf(allStaffBills, staffName, selectedVehicles[staffName] || '', printBothCopies)}
                                                className="flex-1 xs:flex-initial px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Staff PDF
                                            </button>
                                            <button
                                                onClick={() => downloadStaffDataPdf(allStaffBills, staffName)}
                                                className="flex-1 xs:flex-initial px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                Data
                                            </button>
                                            <button
                                                onClick={() => printLoadingSheet(allStaffBills, state.selectedDate || state.todayStr, selectedVehicles[staffName] || '')}
                                                className="flex-1 xs:flex-initial px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Staff Sheet
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Village Subcategories */}
                                <div className="space-y-10 pl-2 sm:pl-6 border-l-2 border-slate-100 dark:border-white/5 ml-2 sm:ml-4">
                                    {Object.entries(villageGroups).map(([villageName, villageBills]) => (
                                        <div key={villageName} className="space-y-4">
                                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 px-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                                        📍
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-lg font-black uppercase tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                            {villageName}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {villageBills.length} Invoices • ₹{villageBills.reduce((acc, b) => acc + computed.getTotal(b.cart, b.customRates), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full xs:w-auto justify-end">
                                                    <button
                                                        onClick={() => downloadStaffBillsPdf(villageBills, `${staffName}_${villageName}`, selectedVehicles[staffName] || '', printBothCopies)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 shadow-sm'}`}
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => downloadStaffDataPdf(villageBills, `${staffName}_${villageName}`)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-amber-600 shadow-sm'}`}
                                                    >
                                                        Data
                                                    </button>
                                                    <button
                                                        onClick={() => printLoadingSheet(villageBills, state.selectedDate || state.todayStr, selectedVehicles[staffName] || '')}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 shadow-sm'}`}
                                                    >
                                                        Sheet
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Desktop View Table */}
                                            <div className={`hidden sm:block rounded-[24px] sm:rounded-[32px] border overflow-x-auto hide-scrollbar ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/20'}`}>
                                                <div className="min-w-[800px]">
                                                    <div className={`grid grid-cols-12 gap-4 px-8 py-4 text-[9px] font-black uppercase tracking-widest border-b
                                                        ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                        <div className="col-span-1">Inv No</div>
                                                        <div className="col-span-3">Shop Name</div>
                                                        <div className="col-span-2">Date</div>
                                                        <div className="col-span-1">Items</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                        <div className="col-span-3 text-right">Actions</div>
                                                    </div>

                                                    {villageBills.map((bill) => (
                                                        <div
                                                            key={bill.id}
                                                            className={`grid grid-cols-12 gap-4 px-8 py-4 items-center border-b transition-all
                                                                ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-blue-50/30'}`}
                                                        >
                                                            <div className={`col-span-1 font-black text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                #{bill.invoiceNo}
                                                            </div>
                                                            <div className="col-span-3">
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <span className={`font-black text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                        {bill.shopName}
                                                                        {bill.specificArea && bills.filter(b => b.shopName.trim().toLowerCase() === bill.shopName.trim().toLowerCase()).length > 1 ? ` (${bill.specificArea})` : ''}
                                                                    </span>
                                                                    {bill.isEditedPrice && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">Edited Price</span>
                                                                    )}
                                                                    {bill.isEditedQty && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">Edited Qty</span>
                                                                    )}
                                                                    {bill.isEditedDate && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">Edited Date</span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-[10px] font-black uppercase tracking-tight mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {bill.specificArea || 'NO LANDMARK'}
                                                                </p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className={`text-[11px] font-black ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                                                    {new Date(bill.deliveryDate || bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                                                </p>
                                                            </div>
                                                            <div className={`col-span-1 font-black text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                {computed.getItemCount(bill.cart)}
                                                            </div>
                                                            <div className={`col-span-2 text-right font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                ₹{computed.getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="col-span-3 flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => previewBill(bill, selectedVehicles[staffName] || '', printBothCopies)}
                                                                    className={`p-2 rounded-lg transition-all border shrink-0
                                                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'}`}
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                </button>
                                                                {!isViewer && (
                                                                <button
                                                                    onClick={() => actions.openEditModal(bill)}
                                                                    className={`p-2 rounded-lg transition-all border shrink-0
                                                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm'}`}
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                )}
                                                                <button
                                                                    onClick={() => downloadBill(bill, selectedVehicles[staffName] || '', printBothCopies)}
                                                                    className="px-2.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-lg text-[9px] uppercase tracking-widest transition-all active:scale-90 flex items-center"
                                                                >
                                                                    PDF
                                                                </button>
                                                                {!isViewer && (
                                                                <button
                                                                    onClick={() => onDeleteBill(bill.id)}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-lg transition-all border border-red-500/20 active:scale-90"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Mobile View Feed */}
                                            <div className="sm:hidden space-y-4">
                                                {villageBills.map((bill) => (
                                                    <div 
                                                        key={bill.id} 
                                                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3
                                                            ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-md shadow-slate-200/10'}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center flex-wrap gap-2">
                                                                    <span className={`text-xs font-black shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                        #{bill.invoiceNo}
                                                                    </span>
                                                                    <span className={`font-black text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                        {bill.shopName}
                                                                        {bill.specificArea && bills.filter(b => b.shopName.trim().toLowerCase() === bill.shopName.trim().toLowerCase()).length > 1 ? ` (${bill.specificArea})` : ''}
                                                                    </span>
                                                                    {bill.isEditedPrice && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">Edited Price</span>
                                                                    )}
                                                                    {bill.isEditedQty && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">Edited Qty</span>
                                                                    )}
                                                                    {bill.isEditedDate && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">Edited Date</span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-[10px] font-black uppercase tracking-tight mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {bill.specificArea || 'NO LANDMARK'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                    ₹{computed.getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                                                    {computed.getItemCount(bill.cart)} items
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col xs:flex-row xs:items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2.5 gap-2.5">
                                                            <span className={`text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                Date: {new Date(bill.deliveryDate || bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                                            </span>
                                                            <div className="flex items-center justify-end gap-2 w-full xs:w-auto">
                                                                <button
                                                                    onClick={() => previewBill(bill, selectedVehicles[staffName] || '', printBothCopies)}
                                                                    className={`flex-1 xs:flex-initial p-2 rounded-lg transition-all border flex items-center justify-center
                                                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'}`}
                                                                    title="Preview"
                                                                >
                                                                    <svg className="w-4 h-4 animate-in fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                </button>
                                                                {!isViewer && (
                                                                <button
                                                                    onClick={() => actions.openEditModal(bill)}
                                                                    className={`flex-1 xs:flex-initial p-2 rounded-lg transition-all border flex items-center justify-center
                                                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm'}`}
                                                                    title="Edit"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                )}
                                                                <button
                                                                    onClick={() => downloadBill(bill, selectedVehicles[staffName] || '', printBothCopies)}
                                                                    className="flex-1 xs:flex-initial px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-lg text-[9px] uppercase tracking-widest transition-all active:scale-90 flex items-center justify-center"
                                                                >
                                                                    PDF
                                                                </button>
                                                                {!isViewer && (
                                                                <button
                                                                    onClick={() => onDeleteBill(bill.id)}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-lg transition-all border border-red-500/20 active:scale-90 flex items-center justify-center"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


        </div>
    );
};

export default AdminBills;
