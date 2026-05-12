import React from 'react';
import { useCollections } from './useCollections';
import type { OrderLine } from '../../../types/DashboardTypes';

interface Props {
    theme: string;
    orderLines: OrderLine[];
}

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminCollections = ({ theme, orderLines }: Props) => {
    const isDark = theme === 'dark';
    const {
        selectedDate, setSelectedDate,
        selectedOlId, setSelectedOlId,
        collections, loading,
        totals, modeBreakdown,
        refresh,
    } = useCollections(orderLines);

    // Mode badge renderer for a single row
    const renderModeBadges = (cash: number, upi: number, cheque: number) => {
        const badges: React.ReactNode[] = [];
        if (cash > 0) badges.push(
            <span key="cash" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                💵 Cash ₹{fmt(cash)}
            </span>
        );
        if (upi > 0) badges.push(
            <span key="upi" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                📱 UPI ₹{fmt(upi)}
            </span>
        );
        if (cheque > 0) badges.push(
            <span key="cheque" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                📝 Cheque ₹{fmt(cheque)}
            </span>
        );
        if (badges.length === 0) return <span className="text-slate-400 text-xs">—</span>;
        return <div className="flex flex-wrap gap-1">{badges}</div>;
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-5 duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h2 className={`text-3xl sm:text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        📊 Today Collection
                    </h2>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Daily billing &amp; payment summary
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={refresh} className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
                    />
                </div>
            </div>

            {/* ── Order Line Tabs ── */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-1">
                {orderLines.map(ol => {
                    const isActive = ol.id === selectedOlId;
                    return (
                        <button
                            key={ol.id}
                            onClick={() => setSelectedOlId(ol.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 border ${isActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30 scale-105'
                                : isDark
                                    ? 'bg-slate-800 text-slate-300 border-white/10 hover:border-blue-400 hover:text-blue-400'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-sm'
                                }`}
                        >
                            <span>🗺️</span>
                            <span className="uppercase tracking-wider">{ol.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 mb-6">
                {[
                    { label: 'Billed Today', value: `₹${fmt(totals.todaysBillAmount)}`, icon: '🧾', color: 'blue' },
                    { label: 'Collected', value: `₹${fmt(totals.amountCollected)}`, icon: '💰', color: 'green' },
                    { label: 'Upcoming Bills', value: `₹${fmt(totals.totalFutureBills + totals.totalPastBills)}`, icon: '📅', color: (totals.totalFutureBills + totals.totalPastBills) > 0 ? 'purple' : 'slate' },
                    { label: 'Manual Adj', value: `₹${fmt(totals.totalManualAdjust)}`, icon: '⚙️', color: totals.totalManualAdjust === 0 ? 'slate' : totals.totalManualAdjust > 0 ? 'blue' : 'amber' },
                    { label: 'Pending', value: `₹${fmt(totals.todaysBillBalance)}`, icon: '⏳', color: totals.todaysBillBalance > 0 ? 'amber' : 'green' },
                    { label: 'Shops', value: String(collections.length), icon: '🏪', color: 'purple' },
                ].map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{card.icon}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{card.label}</span>
                        </div>
                        <p className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Loading State ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : collections.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-5xl mb-4">📭</span>
                    <p className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No collections recorded</p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        No billing or payment activity found for {selectedDate}
                    </p>
                </div>
            ) : (
                <>
                    {/* ═══════ TABLE 1: Main Collection Table ═══════ */}
                    <div className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📋 Collection Details</h3>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        <th className="text-left px-5 py-3">#</th>
                                        <th className="text-left px-5 py-3">Shop Name</th>
                                        <th className="text-right px-5 py-3">Prev Bal</th>
                                        <th className="text-right px-5 py-3">Today's Bill</th>
                                        <th className="text-right px-5 py-3">Collected</th>
                                        <th className="text-right px-5 py-3">Manual Adjust</th>
                                        <th className="text-right px-5 py-3">Upcoming Bill</th>
                                        <th className="text-right px-5 py-3">Total Bal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collections.map((row, idx) => {
                                        const collected = row.cash_collected + row.upi_collected + row.cheque_collected;
                                        const upcoming = row.future_bills + row.past_bills;
                                        return (
                                            <tr key={row.id} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                                <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</td>
                                                <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{row.shop_name}</td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(row.old_balance)}</td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(row.todays_bill_amount)}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className={`font-black ${collected > 0 ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{fmt(collected)}</div>
                                                    <div className="flex justify-end mt-1">{renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected)}</div>
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${row.manual_adjustments !== 0 ? (row.manual_adjustments > 0 ? 'text-blue-500' : 'text-amber-500') : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                    {row.manual_adjustments !== 0 ? `₹${fmt(row.manual_adjustments)}` : '—'}
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${upcoming !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                    {upcoming !== 0 ? `₹${fmt(upcoming)}` : '—'}
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-black ${row.total_balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    ₹{fmt(row.total_balance)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* ── TOTAL ROW ── */}
                                    <tr className={`border-t-2 font-black ${isDark ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50'}`}>
                                        <td className="px-5 py-4"></td>
                                        <td className={`px-5 py-4 text-base uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total</td>
                                        <td className="px-5 py-4"></td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(totals.todaysBillAmount)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${totals.amountCollected > 0 ? 'text-green-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(totals.amountCollected)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${totals.totalManualAdjust !== 0 ? 'text-blue-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>₹{fmt(totals.totalManualAdjust)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${ (totals.totalFutureBills + totals.totalPastBills) !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>₹{fmt(totals.totalFutureBills + totals.totalPastBills)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${totals.totalBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{fmt(totals.totalBalance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-white/5">
                            {collections.map((row, idx) => {
                                let collected = row.cash_collected + row.upi_collected + row.cheque_collected;
                                let upcoming = row.future_bills + row.past_bills;
                                return (
                                    <div key={row.id} className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {idx + 1}. {row.shop_name}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div><span className="text-slate-400">Prev Bal:</span> <span className="font-bold">₹{fmt(row.old_balance)}</span></div>
                                            <div className="text-right"><span className="text-slate-400">Today Bill:</span> <span className="font-bold">₹{fmt(row.todays_bill_amount)}</span></div>
                                            <div><span className="text-slate-400">Collected:</span> <span className="font-bold text-green-500">₹{fmt(collected)}</span></div>
                                            <div className="text-right"><span className="text-slate-400">Adjust:</span> <span className="font-bold">₹{fmt(row.manual_adjustments)}</span></div>
                                            <div><span className="text-slate-400">Upcoming:</span> <span className="font-bold text-purple-500">₹{fmt(upcoming)}</span></div>
                                            <div className="text-right"><span className="text-slate-400 text-xs font-black uppercase">Total:</span> <span className="font-black text-red-500 text-sm">₹{fmt(row.total_balance)}</span></div>
                                        </div>
                                        <div>{renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected)}</div>
                                    </div>
                                );
                            })}
                            {/* Mobile TOTAL Card */}
                            <div className={`p-4 space-y-1 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50/80'}`}>
                                <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total Summary</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-slate-500">Bill:</span> <span className="font-black">₹{fmt(totals.todaysBillAmount)}</span></div>
                                    <div className="text-right"><span className="text-slate-500">Collected:</span> <span className="font-black">₹{fmt(totals.amountCollected)}</span></div>
                                    <div><span className="text-slate-500">Adjust:</span> <span className="font-black">₹{fmt(totals.totalManualAdjust)}</span></div>
                                    <div className="text-right"><span className="text-slate-500">Upcoming:</span> <span className="font-black">₹{fmt(totals.totalFutureBills + totals.totalPastBills)}</span></div>
                                    <div className="col-span-2 text-center mt-2 border-t border-blue-200/50 pt-2">
                                        <span className="text-slate-500 font-black uppercase tracking-tighter">Total Balance:</span> 
                                        <span className="font-black text-lg ml-2 text-red-500">₹{fmt(totals.totalBalance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ TABLE 2: Payment Mode Breakdown ═══════ */}
                    {modeBreakdown.total > 0 && (
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    💰 Collection Breakdown by Mode
                                </h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        <th className="text-left px-5 py-3">Payment Mode</th>
                                        <th className="text-right px-5 py-3">Total Collected</th>
                                        <th className="text-right px-5 py-3">% Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { icon: '💵', label: 'Cash', amount: modeBreakdown.cash, percent: modeBreakdown.cashPercent, color: 'green' },
                                        { icon: '📱', label: 'UPI', amount: modeBreakdown.upi, percent: modeBreakdown.upiPercent, color: 'blue' },
                                        { icon: '📝', label: 'Cheque', amount: modeBreakdown.cheque, percent: modeBreakdown.chequePercent, color: 'amber' },
                                    ].map(mode => (
                                        <tr key={mode.label} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                            <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                <span className="mr-2">{mode.icon}</span>{mode.label}
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-black ${mode.amount > 0 ? `text-${mode.color}-500` : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                ₹{fmt(mode.amount)}
                                            </td>
                                            <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {mode.percent}%
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Mode Breakdown TOTAL */}
                                    <tr className={`border-t-2 font-black ${isDark ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50'}`}>
                                        <td className={`px-5 py-4 text-base uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(modeBreakdown.total)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminCollections;
