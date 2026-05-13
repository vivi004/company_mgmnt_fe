import React, { useState, useEffect } from 'react';
import { useCollections } from './useCollections';
import type { OrderLine } from '../../../types/DashboardTypes';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast } from '../../../components/Toast';

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
        refresh, addExpense, updateExpense, deleteExpense, expenses
    } = useCollections(orderLines);

    // Expense Modal State
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingExpId, setEditingExpId] = useState<number | null>(null);
    const [expAmount, setExpAmount] = useState('');
    const [expDesc, setExpDesc] = useState('');
    const [savingExp, setSavingExp] = useState(false);

    // Inline Action States
    const { showToast } = useToast();
    const [selectedShop, setSelectedShop] = useState<any | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    
    // Payment Form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Cheque'>('Cash');
    const [paymentDesc, setPaymentDesc] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Ledger Data
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [ledgerSkip, setLedgerSkip] = useState(0);
    const [ledgerHasMore, setLedgerHasMore] = useState(true);

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

    // --- Inline Action Handlers ---
    const openPaymentModal = (row: any) => {
        setSelectedShop({ id: row.shop_id, shop_name: row.shop_name });
        setPaymentAmount('');
        setPaymentMethod('Cash');
        setPaymentDesc('');
        setShowPaymentModal(true);
    };

    const openLedgerModal = (row: any) => {
        setSelectedShop({ id: row.shop_id, shop_name: row.shop_name });
        setLedgerData([]);
        setLedgerSkip(0);
        setLedgerHasMore(true);
        setShowLedgerModal(true);
        fetchLedger(row.shop_id, 0);
    };

    const fetchLedger = async (shopId: number, skip: number) => {
        setLoadingLedger(true);
        try {
            const res = await getAuthAxios().get(`/api/shops/ledger/${shopId}?skip=${skip}&limit=20`);
            if (skip === 0) {
                setLedgerData(res.data);
            } else {
                setLedgerData(prev => [...prev, ...res.data]);
            }
            setLedgerHasMore(res.data.length === 20);
        } catch (err) {
            showToast('Failed to fetch ledger', 'error');
        } finally {
            setLoadingLedger(false);
        }
    };

    const handleCollectPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShop || submittingPayment) return;
        const amt = parseFloat(paymentAmount);
        if (isNaN(amt) || amt <= 0) return showToast('Enter valid amount', 'error');

        setSubmittingPayment(true);
        try {
            await getAuthAxios().post('/api/shops/collect-payment', {
                shop_id: selectedShop.id,
                amount: amt,
                method: paymentMethod,
                description: paymentDesc || `Admin Collection - ${selectedDate}`
            });
            showToast('Payment recorded successfully', 'success');
            setShowPaymentModal(false);
            refresh(); // Refresh table data
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to collect payment', 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Safety timeout for inline payment
    useEffect(() => {
        if (submittingPayment) {
            const timer = setTimeout(() => {
                setSubmittingPayment(false);
                showToast('Payment request timed out', 'error');
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [submittingPayment]);

    // Mode badge renderer for a single row
    const renderModeBadges = (cash: number, upi: number, cheque: number, pos: number = 0) => {
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
        if (pos > 0) badges.push(
            <span key="pos" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ➕ Addition ₹{fmt(pos)}
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
                    <button 
                        onClick={refresh} 
                        disabled={loading}
                        className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 mb-6">
                {[
                    { label: 'Billed Today', value: `₹${fmt(totals.todaysBillAmount)}`, icon: '🧾', color: 'blue' },
                    { label: 'Collected', value: `₹${fmt(totals.amountCollected)}`, icon: '💰', color: 'green' },
                    { label: 'Upcoming Bills', value: `₹${fmt(totals.totalFutureBills)}`, icon: '📅', color: totals.totalFutureBills > 0 ? 'purple' : 'slate' },
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
                                        return (
                                            <tr key={row.id} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                                <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</td>
                                                <td className={`px-5 py-3.5 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    <div className="flex items-center justify-between group">
                                                        <span>{row.shop_name}</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => openPaymentModal(row)}
                                                                title="Collect Payment"
                                                                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => openLedgerModal(row)}
                                                                title="View Ledger"
                                                                className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-sm"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(row.old_balance)}</td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(row.todays_bill_amount)}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className={`font-black ${collected > 0 ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{fmt(collected)}</div>
                                                    <div className="flex justify-end mt-1">{renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected)}</div>
                                                </td>
                                                <td className={`px-5 py-3.5 text-right`}>
                                                    <div className={`font-bold ${row.manual_adjustments !== 0 ? (row.manual_adjustments > 0 ? 'text-blue-500' : 'text-amber-500') : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                        {row.manual_adjustments !== 0 ? `₹${fmt(row.manual_adjustments)}` : '—'}
                                                    </div>
                                                    <div className="flex justify-end mt-1">{renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos)}</div>
                                                </td>
                                                <td className={`px-5 py-3.5 text-right font-bold ${row.future_bills !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                                                    {row.future_bills !== 0 ? `₹${fmt(row.future_bills)}` : '—'}
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
                                        <td className={`px-5 py-4 text-right text-base ${ totals.totalFutureBills !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>₹{fmt(totals.totalFutureBills)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${totals.totalBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{fmt(totals.totalBalance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-white/5">
                            {collections.map((row, idx) => {
                                let collected = row.cash_collected + row.upi_collected + row.cheque_collected;
                                return (
                                    <div key={row.id} className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {idx + 1}. {row.shop_name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openPaymentModal(row)}
                                                    className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => openLedgerModal(row)}
                                                    className="p-2 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div><span className="text-slate-400">Prev Bal:</span> <span className="font-bold">₹{fmt(row.old_balance)}</span></div>
                                            <div className="text-right"><span className="text-slate-400">Today Bill:</span> <span className="font-bold">₹{fmt(row.todays_bill_amount)}</span></div>
                                            <div><span className="text-slate-400">Collected:</span> <span className="font-bold text-green-500">₹{fmt(collected)}</span></div>
                                            <div className="text-right">
                                                <span className="text-slate-400">Adjust:</span> 
                                                <span className={`font-bold ${row.manual_adjustments !== 0 ? (row.manual_adjustments > 0 ? 'text-blue-500' : 'text-amber-500') : ''}`}>₹{fmt(row.manual_adjustments)}</span>
                                                <div className="flex justify-end mt-1">{renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos)}</div>
                                             </div>
                                            <div><span className="text-slate-400">Upcoming:</span> <span className="font-bold text-purple-500">₹{fmt(row.future_bills)}</span></div>
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
                                    <div className="text-right"><span className="text-slate-500">Upcoming:</span> <span className="font-black">₹{fmt(totals.totalFutureBills)}</span></div>
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
                            <table className="w-full text-sm">
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
                                    ].map(mode => (
                                        <tr key={mode.label} className={`border-t transition-colors ${isDark ? 'border-white/5 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                            <td className={`px-5 py-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{mode.icon}</span>
                                                    <div className="flex flex-col">
                                                        <span className="uppercase tracking-widest text-[11px]">{mode.label}</span>
                                                        {(mode.reg > 0 || mode.man > 0) && (
                                                            <div className="flex gap-2 mt-1 text-[9px] font-bold">
                                                                {mode.reg > 0 && <span className="text-slate-400">REG: ₹{fmt(mode.reg)}</span>}
                                                                {mode.man > 0 && <span className="text-amber-500/80 uppercase">MAN: ₹{fmt(mode.man)}</span>}
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
                                    <tr className={`font-black ${isDark ? 'bg-blue-900/20' : 'bg-blue-50/80'} border-t-2 ${isDark ? 'border-blue-500/30' : 'border-blue-200'}`}>
                                        <td className={`px-5 py-5 text-sm uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Net Total Collected</td>
                                        <td className={`px-5 py-5 text-right text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(modeBreakdown.total)}</td>
                                        <td className="px-5 py-5 text-right"><span className="text-[10px] text-slate-400 uppercase tracking-tighter">100% Share</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
            {/* ══════════ PAYEMENT COLLECTION MODAL ══════════ */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className={`relative w-full max-w-md rounded-[32px] shadow-2xl border p-8 animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Collect Payment</h3>
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">{selectedShop?.shop_name}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCollectPayment} className="space-y-6">
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Amount to Collect (₹)</label>
                                <input 
                                    type="number" step="0.01" required autoFocus
                                    value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    className={`w-full p-4 rounded-2xl font-black text-lg ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['Cash', 'UPI', 'Cheque'] as const).map(m => (
                                    <button 
                                        key={m} type="button" onClick={() => setPaymentMethod(m)}
                                        className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${paymentMethod === m ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : isDark ? 'bg-slate-800 border-white/10 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            <button 
                                type="submit" disabled={submittingPayment}
                                className={`w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50`}
                            >
                                {submittingPayment ? 'Recording...' : 'Confirm Collection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════ LEDGER VIEW MODAL ══════════ */}
            {showLedgerModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowLedgerModal(false)} />
                    <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-[40px] shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className={`p-8 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-slate-800/20' : 'border-slate-50 bg-slate-50/50'}`}>
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Shop Ledger</h3>
                                <p className="text-xs font-black text-blue-500 uppercase tracking-widest mt-1">{selectedShop?.shop_name}</p>
                            </div>
                            <button onClick={() => setShowLedgerModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                            {loadingLedger && ledgerData.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin text-blue-500 inline-block mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading history...</p>
                                </div>
                            ) : ledgerData.length === 0 ? (
                                <div className="py-20 text-center">
                                    <span className="text-5xl mb-4 block">📄</span>
                                    <p className="font-bold text-slate-400">No transactions found</p>
                                </div>
                            ) : (
                                ledgerData.map((item, i) => {
                                    const isAddition = item.type === 'Bill' || (item.type === 'Adjustment' && item.amount > 0);
                                    return (
                                        <div key={i} className={`p-5 rounded-[24px] border transition-all flex items-center justify-between ${isDark ? 'bg-slate-800/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-50 hover:border-slate-100 shadow-sm'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isAddition ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {item.type[0]}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.description}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black ${isAddition ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {isAddition ? '+' : '-'} ₹{fmt(Math.abs(item.amount))}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Balance: ₹{fmt(item.balance_after)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {ledgerHasMore && !loadingLedger && (
                                <button onClick={() => fetchLedger(selectedShop.id, ledgerSkip + 20)} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all">
                                    Load More History
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCollections;
