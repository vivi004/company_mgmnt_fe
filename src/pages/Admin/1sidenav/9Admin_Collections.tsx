import React, { useState, useEffect } from 'react';
import { useCollections } from './useCollections';
import { useShopActions } from '../../../hooks/useShopActions';
import ShopActionModals from '../../../components/common/ShopModals/ShopActionModals';
import type { OrderLine } from '../../../types/DashboardTypes';
import { useToast, ToastContainer } from '../../../components/Toast';

interface Props {
    theme: string;
    orderLines: OrderLine[];
    isAdmin?: boolean;
}

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminCollections = ({ theme, orderLines, isAdmin: propsIsAdmin }: Props) => {
    const isDark = theme === 'dark';
    const {
        selectedDate, setSelectedDate,
        selectedOlId, setSelectedOlId,
        collections, loading,
        totals, modeBreakdown,
        refresh, addExpense, updateExpense, deleteExpense, expenses
    } = useCollections(orderLines);

    const { toasts, showToast, removeToast } = useToast();

    const {
        selectedShop, setSelectedShop,
        showLedger, setShowLedger, ledgerData, loadingLedger, ledgerHasMore, fetchLedger, loadMoreLedger,
        showAdjustModal, setShowAdjustModal, adjData, setAdjData, submittingAdj, handleAdjustment,
        showPaymentModal, setShowPaymentModal, paymentData, setPaymentData, submittingPayment, handleCollectPayment,
        handleApprove, handleReject
    } = useShopActions(showToast, () => refresh(), selectedDate);

    // Search query filter state
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic filtered list based on query matching shop name or owner name
    const filteredCollections = collections.filter(row => 
        (row.shop_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Summing totals specifically for the filtered set to display at the bottom of the table
    const filteredTotals = filteredCollections.reduce((acc, row) => {
        const collected = row.cash_collected + row.upi_collected + row.cheque_collected + (row.discount_payment || 0);
        acc.totalOldBalance += row.old_balance;
        acc.todaysBillAmount += row.todays_bill_amount;
        acc.amountCollected += collected;
        acc.totalManualAdjust += (row.manual_adjustments + (row.discount_payment || 0));
        acc.totalFutureBills += row.future_bills;
        acc.totalBalance += row.total_balance;
        return acc;
    }, {
        totalOldBalance: 0,
        todaysBillAmount: 0,
        amountCollected: 0,
        totalManualAdjust: 0,
        totalFutureBills: 0,
        totalBalance: 0
    });

    // Expense Modal State
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingExpId, setEditingExpId] = useState<number | null>(null);
    const [expAmount, setExpAmount] = useState('');
    const [expDesc, setExpDesc] = useState('');
    const [savingExp, setSavingExp] = useState(false);

    // Safety timeout for expense saving (unstick buttons)
    useEffect(() => {
        if (savingExp) {
            const timer = setTimeout(() => {
                setSavingExp(false);
                alert('Expense save request timed out. Please try again.');
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [savingExp]);

    const handleOpenAdd = () => {
        setEditingExpId(null);
        setExpAmount('');
        setExpDesc('');
        setShowExpModal(true);
    };

    const handleOpenEdit = (exp: any) => {
        setEditingExpId(exp.id);
        setExpAmount(String(exp.amount));
        setExpDesc(exp.description);
        setShowExpModal(true);
    };

    const handleSaveExpense = async () => {
        const amt = parseFloat(expAmount);
        if (isNaN(amt) || amt <= 0) return alert('Enter valid amount');
        setSavingExp(true);
        try {
            if (editingExpId) {
                await updateExpense(editingExpId, amt, expDesc);
            } else {
                await addExpense(amt, expDesc);
            }
            setShowExpModal(false);
            setExpAmount('');
            setExpDesc('');
            setEditingExpId(null);
        } catch (err) {
            alert('Failed to save expense');
        } finally {
            setSavingExp(false);
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await deleteExpense(id);
        } catch (err) {
            alert('Failed to delete expense');
        }
    };

    // Mode badge renderer for a single row
    const renderModeBadges = (cash: number, upi: number, cheque: number, pos: number = 0, pendingTxs: any[] = [], discount: number = 0) => {
        const badges: React.ReactNode[] = [];
        
        // 1. APPROVED Badges
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
        if (pos > 0) badges.push(
            <span key="pos" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ➕ Addition ₹{fmt(pos)}
            </span>
        );
        if (discount > 0) badges.push(
            <span key="discount" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                🏷️ Discount ₹{fmt(discount)}
            </span>
        );

        // 2. PENDING Badges (with Approval Controls for Admin)
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = propsIsAdmin ?? (storedUser.role === 'admin' || storedUser.role === 'Admin');

        pendingTxs.forEach((tx, pIdx) => {
            const mode = (tx.mode || '').toUpperCase();
            const icon = mode === 'UPI' ? '📱' : (mode === 'CHEQUE' ? '📝' : '⏳');
            const color = mode === 'UPI' ? 'blue' : 'amber';
            const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
            
            badges.push(
                <div key={`pending-${tx.id || pIdx}`} className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-dashed animate-pulse transition-all
                    ${mode === 'UPI' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-tighter text-${color}-600 dark:text-${color}-400`}>
                        {icon} PENDING ₹{fmt(amt || 0)}
                    </span>
                    
                    {isAdmin && (
                        <div className="flex items-center gap-1.5 ml-1 border-l border-white/10 pl-1.5">
                            <button 
                                onClick={(e) => { e.stopPropagation(); if(window.confirm(`Approve this ${mode} amount of ₹${fmt(amt || 0)}?`)) handleApprove(tx.id); }}
                                className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group/btn"
                                title="Click to Approve and Reduce Balance"
                            >
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const reason = window.prompt('Enter rejection reason (optional):');
                                    if (reason !== null) handleReject(tx.id, reason);
                                }}
                                className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all group/btn"
                                title="Reject"
                            >
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            );
        });

        if (badges.length === 0) return <span className="text-slate-400 text-xs">—</span>;
        return <div className="flex flex-wrap gap-1 items-center">{badges}</div>;
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
                <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                        onClick={refresh} 
                        disabled={loading}
                        className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                        title="Refresh"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    <div className={`flex items-center p-1 rounded-xl border shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                            title="Previous Day"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <div className="relative flex items-center justify-between w-[130px] px-2 py-1 cursor-pointer group">
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {selectedDate.split('-').reverse().join('-')}
                            </span>
                            <svg className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                            title="Next Day"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
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
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 border disabled:opacity-60 disabled:cursor-not-allowed ${isActive
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 mb-6">
                {[
                    { label: 'Billed Today', value: `₹${fmt(totals.todaysBillAmount)}`, icon: '🧾', color: 'blue' },
                    { label: 'Collected', value: `₹${fmt(totals.amountCollected)}`, icon: '💰', color: 'green' },
                    { label: 'Upcoming Bills', value: `₹${fmt(totals.totalFutureBills)}`, icon: '📅', color: totals.totalFutureBills > 0 ? 'purple' : 'slate' },
                    { label: 'Discounts', value: `₹${fmt(modeBreakdown.discount || 0)}`, icon: '🏷️', color: 'amber' },
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

            {/* ── Expense Modal ── */}
            {showExpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowExpModal(false)} />
                    <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                            <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {editingExpId ? '✏️ EDIT EXPENSE' : '🥪 RECORD EXPENSE'}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                {editingExpId ? 'Modify existing expense entry' : 'Deduct from today\'s cash collection'}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={expAmount}
                                    onChange={(e) => setExpAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full px-4 py-3 rounded-xl border font-black text-lg focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-amber-500/20'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={expDesc}
                                    onChange={(e) => setExpDesc(e.target.value)}
                                    placeholder="e.g. Tea Cost, Fuel, etc."
                                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/20'}`}
                                />
                            </div>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button
                                onClick={() => setShowExpModal(false)}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveExpense}
                                disabled={savingExp}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30`}
                            >
                                {savingExp ? 'Saving...' : editingExpId ? 'Update Expense' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📋 Collection Details</h3>
                            <div className="relative max-w-md w-full sm:w-80">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by shop or owner name..."
                                    className={`w-full pl-10 pr-4 py-2 text-xs font-bold rounded-xl border focus:ring-4 outline-none transition-all ${isDark 
                                        ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20 focus:border-blue-500' 
                                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/10 focus:border-blue-500 shadow-inner'}`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
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
                                        <th className="text-right px-5 py-3">Upcoming</th>
                                        <th className="text-right px-5 py-3">Total Bal</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                    {filteredCollections.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-xs">
                                                🔍 No matching shops found for "{searchQuery}"
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCollections.map((row, idx) => {
                                            const collected = row.cash_collected + row.upi_collected + row.cheque_collected + (row.discount_payment || 0);
                                            const actionShop = { id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name };

                                            return (
                                                <tr key={row.id} className={`transition-all duration-200 group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                                                    <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                    {row.shop_name} {row.owner_name && row.owner_name.trim() ? `(${row.owner_name.trim()})` : ''}
                                                                </span>
                                                                {row.pending_transactions.length > 0 && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest animate-bounce shadow-lg shadow-amber-500/40">
                                                                        Needs Approval
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => { setSelectedShop(actionShop); setShowPaymentModal(true); }}
                                                                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all"
                                                                >
                                                                    Collect ₹
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setSelectedShop(actionShop); setShowAdjustModal(true); }}
                                                                    className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-tighter hover:bg-blue-500 hover:text-white transition-all"
                                                                >
                                                                    Adjust ±
                                                                </button>
                                                                <button 
                                                                    onClick={() => fetchLedger(actionShop)}
                                                                    className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 text-[10px] font-black uppercase tracking-tighter hover:bg-slate-500 hover:text-white transition-all"
                                                                >
                                                                    Ledger 👁
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(row.old_balance)}</td>
                                                    <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(row.todays_bill_amount)}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className={`font-black ${collected > 0 ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{fmt(collected)}</div>
                                                        <div className="flex justify-end mt-1">{renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected, 0, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'PAYMENT'), row.discount_payment)}</div>
                                                    </td>
                                                    <td className={`px-5 py-3.5 text-right`}>
                                                        <div className={`font-bold ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-500' : 'text-amber-500') : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                            {(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? `₹${fmt(row.manual_adjustments + (row.discount_payment || 0))}` : '—'}
                                                        </div>
                                                        <div className="flex justify-end mt-1">{renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'MANUAL_ADJUST'), row.discount_adjustment)}</div>
                                                    </td>
                                                    <td className={`px-5 py-3.5 text-right font-bold ${row.future_bills !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                        {row.future_bills !== 0 ? `₹${fmt(row.future_bills)}` : '—'}
                                                    </td>
                                                    <td className={`px-5 py-3.5 text-right font-black ${row.total_balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                        ₹{fmt(row.total_balance)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    {/* ── TOTAL ROW ── */}
                                    <tr key="total-row" className={`border-t-2 font-black ${isDark ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50'}`}>
                                        <td className="px-5 py-4"></td>
                                        <td className={`px-5 py-4 text-base uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(filteredTotals.totalOldBalance)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(filteredTotals.todaysBillAmount)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${filteredTotals.amountCollected > 0 ? 'text-green-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(filteredTotals.amountCollected)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${filteredTotals.totalManualAdjust !== 0 ? 'text-blue-400' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>₹{fmt(filteredTotals.totalManualAdjust)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${ filteredTotals.totalFutureBills !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>₹{fmt(filteredTotals.totalFutureBills)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${filteredTotals.totalBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{fmt(filteredTotals.totalBalance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-white/5">
                            {filteredCollections.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-xs">
                                    🔍 No matching shops found
                                </div>
                            ) : (
                                filteredCollections.map((row, idx) => {
                                    let collected = row.cash_collected + row.upi_collected + row.cheque_collected + (row.discount_payment || 0);
                                    return (
                                        <div key={row.id} className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {idx + 1}. {row.shop_name} {row.owner_name && row.owner_name.trim() ? `(${row.owner_name.trim()})` : ''}
                                                    {row.pending_transactions.length > 0 && (
                                                        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-amber-500/40">
                                                            Needs Approval
                                                        </span>
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            const s = { id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name };
                                                            setSelectedShop(s); setShowPaymentModal(true);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black"
                                                    >
                                                        ₹
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const s = { id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name };
                                                            setSelectedShop(s); setShowAdjustModal(true);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-black"
                                                    >
                                                        ±
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const s = { id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name };
                                                            fetchLedger(s);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-slate-500 text-white flex items-center justify-center text-xs font-black"
                                                    >
                                                        👁
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[11px] border-t border-slate-100/50 dark:border-white/5 pt-3">
                                                {/* Prev Bal */}
                                                <div>
                                                    <span className="font-extrabold text-slate-600 dark:text-slate-400">Prev Bal:</span>{' '}
                                                    <span className="font-black text-slate-900 dark:text-slate-100">₹{fmt(row.old_balance)}</span>
                                                </div>
                                                {/* Today's Bill */}
                                                <div className="text-right">
                                                    <span className="font-extrabold text-slate-600 dark:text-slate-400">Today Bill:</span>{' '}
                                                    <span className="font-black text-slate-900 dark:text-slate-100">₹{fmt(row.todays_bill_amount)}</span>
                                                </div>

                                                {/* Collected & its badges */}
                                                <div className="flex flex-col gap-1.5">
                                                    <div>
                                                        <span className="font-extrabold text-slate-600 dark:text-slate-400">Collected:</span>{' '}
                                                        <span className="font-black text-green-600 dark:text-green-400">₹{fmt(collected)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected, 0, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'PAYMENT'), row.discount_payment)}
                                                    </div>
                                                </div>

                                                {/* Adjust & its badges */}
                                                <div className="flex flex-col gap-1.5 items-end">
                                                    <div className="text-right">
                                                        <span className="font-extrabold text-slate-600 dark:text-slate-400">Adjust:</span>{' '}
                                                        <span className={`font-black ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400') : 'text-slate-900 dark:text-slate-100'}`}>
                                                            ₹{fmt(row.manual_adjustments + (row.discount_payment || 0))}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 justify-end">
                                                        {renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'MANUAL_ADJUST'), row.discount_adjustment)}
                                                    </div>
                                                </div>

                                                {/* Upcoming */}
                                                <div>
                                                    <span className="font-extrabold text-slate-600 dark:text-slate-400">Upcoming:</span>{' '}
                                                    <span className="font-black text-purple-600 dark:text-purple-400">₹{fmt(row.future_bills)}</span>
                                                </div>
                                                {/* Total Balance */}
                                                <div className="text-right">
                                                    <span className="font-extrabold text-slate-600 dark:text-slate-400 text-xs uppercase">Total:</span>{' '}
                                                    <span className="font-black text-red-600 dark:text-red-400 text-sm ml-1">₹{fmt(row.total_balance)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {/* Mobile TOTAL Card */}
                            <div className={`p-4 space-y-1 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50/80'}`}>
                                <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total Summary</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-slate-500">Bill:</span> <span className="font-black">₹{fmt(filteredTotals.todaysBillAmount)}</span></div>
                                    <div className="text-right"><span className="text-slate-500">Collected:</span> <span className="font-black">₹{fmt(filteredTotals.amountCollected)}</span></div>
                                    <div><span className="text-slate-500">Adjust:</span> <span className="font-black">₹{fmt(filteredTotals.totalManualAdjust)}</span></div>
                                    <div className="text-right"><span className="text-slate-500">Upcoming:</span> <span className="font-black">₹{fmt(filteredTotals.totalFutureBills)}</span></div>
                                    <div className="col-span-2 text-center mt-2 border-t border-blue-200/50 pt-2">
                                        <span className="text-slate-500 font-black uppercase tracking-tighter">Total Balance:</span> 
                                        <span className="font-black text-lg ml-2 text-red-500">₹{fmt(filteredTotals.totalBalance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ TABLE 2: Payment Mode Breakdown ═══════ */}
                    {(
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    💰 Collection Breakdown by Mode
                                </h3>
                                <button
                                    onClick={handleOpenAdd}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-lg ${isDark ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-amber-900/40' : 'bg-amber-500 border-amber-400 text-white hover:bg-amber-400 shadow-amber-200'}`}
                                >
                                    💸 Add Expense
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[400px]">
                                    <thead>
                                        <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                            <th className="text-left px-5 py-3">Payment Mode / Detail</th>
                                            <th className="text-right px-5 py-3">Amount</th>
                                            <th className="text-right px-5 py-3">% Share</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {/* ── INCOME MODES ── */}
                                    {[
                                        { 
                                            icon: '💵', label: 'Cash (Net)', amount: modeBreakdown.netCash, 
                                            reg: modeBreakdown.regCash, man: modeBreakdown.manCash,
                                            raw: modeBreakdown.rawCash, percent: modeBreakdown.cashPercent, color: 'green', isNet: true 
                                        },
                                        { 
                                            icon: '📱', label: 'UPI', amount: modeBreakdown.upi, 
                                            reg: modeBreakdown.regUpi, man: modeBreakdown.manUpi,
                                            percent: modeBreakdown.upiPercent, color: 'blue' 
                                        },
                                        { 
                                            icon: '📝', label: 'Cheque', amount: modeBreakdown.cheque, 
                                            reg: modeBreakdown.regCheque, man: modeBreakdown.manCheque,
                                            percent: modeBreakdown.chequePercent, color: 'amber' 
                                        },
                                        { 
                                            icon: '🏷️', label: 'Discount (Payment)', amount: modeBreakdown.discountPayment, 
                                            reg: modeBreakdown.discountPayment, man: 0,
                                            percent: 'N/A', color: 'amber' 
                                        },
                                        { 
                                            icon: '🏷️', label: 'Discount (Adj)', amount: modeBreakdown.discountAdjustment, 
                                            reg: 0, man: modeBreakdown.discountAdjustment,
                                            percent: 'N/A', color: 'amber' 
                                        },
                                    ].map(mode => (
                                        <tr key={mode.label} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                            <td className={`px-5 py-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{mode.icon}</span>
                                                    <div className="flex flex-col">
                                                        <span className="uppercase tracking-widest text-sm font-black">{mode.label}</span>
                                                        {(mode.reg > 0 || mode.man > 0) && (
                                                            <div className="flex gap-5 mt-1.5 text-xs font-black">
                                                                {mode.reg > 0 && <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>REG: ₹{fmt(mode.reg)}</span>}
                                                                {mode.man > 0 && <span className="text-amber-500">MAN: ₹{fmt(mode.man)}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-black">
                                                {mode.isNet && modeBreakdown.totalExpenses > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className={isDark ? 'text-white' : 'text-slate-900 text-base'}>₹{fmt(mode.amount)}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">(₹{fmt(mode.raw || 0)} - ₹{fmt(modeBreakdown.totalExpenses)})</span>
                                                    </div>
                                                ) : (
                                                    <span className={isDark ? 'text-white' : 'text-slate-900 text-base'}>₹{fmt(mode.amount)}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right font-black text-slate-400">
                                                {mode.percent}%
                                            </td>
                                        </tr>
                                    ))}

                                    {/* ── INDIVIDUAL EXPENSES ── */}
                                    {expenses.map((exp, eIdx) => (
                                        <tr key={`exp-${exp.id || eIdx}`} className={`border-t border-dashed group ${isDark ? 'border-white/5 bg-amber-950/10' : 'bg-amber-50/30 border-slate-100'}`}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3 pl-4">
                                                    <span className="text-sm">🥪</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/80' : 'text-amber-700/80'}`}>
                                                        Expense: {exp.description || 'General'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <span className="font-black text-amber-500 text-xs">- ₹{fmt(exp.amount)}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleOpenEdit(exp)}
                                                            className="p-1 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteExpense(exp.id)}
                                                            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right"></td>
                                        </tr>
                                    ))}

                                    {/* ── TOTAL Row ── */}
                                    <tr key="net-total-row" className={`font-black ${isDark ? 'bg-blue-900/20' : 'bg-blue-50/80'} border-t-2 ${isDark ? 'border-blue-500/30' : 'border-blue-200'}`}>
                                        <td className={`px-5 py-5 text-sm uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Net Total Collected</td>
                                        <td className={`px-5 py-5 text-right text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(modeBreakdown.total)}</td>
                                        <td className="px-5 py-5 text-right"><span className="text-[10px] text-slate-400 uppercase tracking-tighter">100% Share</span></td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ShopActionModals
                theme={theme}
                selectedShop={selectedShop}
                setSelectedShop={setSelectedShop}
                showLedger={showLedger}
                setShowLedger={setShowLedger}
                ledgerData={ledgerData}
                loadingLedger={loadingLedger}
                ledgerHasMore={ledgerHasMore}
                loadMoreLedger={loadMoreLedger}
                showAdjustModal={showAdjustModal}
                setShowAdjustModal={setShowAdjustModal}
                adjData={adjData}
                setAdjData={setAdjData}
                submittingAdj={submittingAdj}
                handleAdjustment={handleAdjustment}
                showPaymentModal={showPaymentModal}
                setShowPaymentModal={setShowPaymentModal}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                submittingPayment={submittingPayment}
                handleCollectPayment={handleCollectPayment}
                handleApprove={handleApprove}
                handleReject={handleReject}
            />
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default AdminCollections;
