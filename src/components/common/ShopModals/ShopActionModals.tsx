import React from 'react';
import type { Shop } from '../../../hooks/useShopActions';

interface Props {
    theme: string;
    selectedShop: Shop | null;
    setSelectedShop: (shop: Shop | null) => void;
    
    // Ledger
    showLedger: boolean;
    setShowLedger: (show: boolean) => void;
    ledgerData: any[];
    loadingLedger: boolean;
    ledgerHasMore: boolean;
    loadMoreLedger: () => void;
    
    // Adjustment
    showAdjustModal: boolean;
    setShowAdjustModal: (show: boolean) => void;
    adjData: { amount: string; description: string; method: string };
    setAdjData: (data: any) => void;
    submittingAdj: boolean;
    handleAdjustment: (e: React.FormEvent) => void;
    
    // Payment
    showPaymentModal: boolean;
    setShowPaymentModal: (show: boolean) => void;
    paymentData: { amount: string; method: string; upiApp: string; description: string };
    setPaymentData: (data: any) => void;
    submittingPayment: boolean;
    handleCollectPayment: (e: React.FormEvent) => void;

    // Approval Actions
    handleApprove: (txId: number) => void;
    handleReject: (txId: number, reason: string) => void;
}

const ShopActionModals: React.FC<Props> = (props) => {
    const {
        theme, selectedShop, setSelectedShop,
        showLedger, setShowLedger, ledgerData, loadingLedger, ledgerHasMore, loadMoreLedger,
        showAdjustModal, setShowAdjustModal, adjData, setAdjData, submittingAdj, handleAdjustment,
        showPaymentModal, setShowPaymentModal, paymentData, setPaymentData, submittingPayment, handleCollectPayment,
        handleApprove, handleReject
    } = props;

    const isDark = theme === 'dark';

    return (
        <>
            {/* Ledger Modal */}
            {showLedger && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center overflow-y-auto no-scrollbar p-0 sm:p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => { setShowLedger(false); setSelectedShop(null); }} />
                    <div className={`relative w-full max-w-4xl max-h-[90vh] border shadow-2xl overflow-hidden flex flex-col rounded-t-[40px] sm:rounded-[40px] animate-in slide-in-from-bottom-5 duration-300
                        ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight">Shop Ledger</h3>
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">{selectedShop?.shop_name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowAdjustModal(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20"
                                >
                                    Adjust Balance
                                </button>
                                <button onClick={() => { setShowLedger(false); setSelectedShop(null); }} className="text-slate-400 hover:text-red-400 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            {loadingLedger && !ledgerData.length ? (
                                <div className="text-center py-20 font-black uppercase tracking-widest animate-pulse text-slate-500">Fetching Ledger...</div>
                            ) : ledgerData.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-bold italic">No transactions recorded yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {ledgerData.map((tx: any) => (
                                        <div key={tx.id} className={`p-5 rounded-3xl border flex items-center justify-between transition-all hover:bg-slate-50/5
                                            ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black
                                                    ${tx.type === 'Bill' ? 'bg-red-500/10 text-red-500' 
                                                    : (tx.payment_mode || '').toUpperCase() === 'DISCOUNT' ? 'bg-amber-500/10 text-amber-500'
                                                    : tx.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-500' 
                                                    : 'bg-indigo-500/10 text-indigo-500'}`}>
                                                    {tx.type === 'Bill' ? 'B' : (tx.payment_mode || '').toUpperCase() === 'DISCOUNT' ? 'D' : tx.type === 'Payment' ? 'P' : 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tight">{tx.description}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                        {(() => {
                                                            const dateStr = tx.transaction_date || tx.created_at;
                                                            if (!dateStr) return '—';
                                                            let validIso = dateStr;
                                                            if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
                                                                // Backend stores dates as IST strings — mark them as +05:30, NOT 'Z' (UTC)
                                                                validIso = dateStr.includes('T') ? dateStr + '+05:30' : dateStr.replace(' ', 'T') + '+05:30';
                                                            }
                                                            return new Date(validIso).toLocaleString('en-IN', {
                                                                timeZone: 'Asia/Kolkata',
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }).toUpperCase();
                                                        })()} • BY {tx.created_by}
                                                    </p>
                                                    
                                                    {/* Status Badge */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border
                                                            ${tx.approval_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                              tx.approval_status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 
                                                              'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                            {tx.approval_status}
                                                        </span>
                                                        {tx.payment_mode && (
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                                MODE: {tx.payment_mode}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {tx.rejected_reason && (
                                                        <p className="text-[9px] font-bold text-red-400 mt-1 italic tracking-tight">
                                                            Reason: {tx.rejected_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-right">
                                                {(() => {
                                                    const isBill = tx.type === 'Bill';
                                                    const isPayment = tx.type === 'Payment';
                                                    const isAdjustment = tx.type === 'Adjustment';
                                                    const isDiscountTx = (tx.payment_mode || '').toUpperCase() === 'DISCOUNT';
                                                    const isAddition = isBill || (isAdjustment && tx.amount > 0);
                                                    const isReduction = isPayment || (isAdjustment && tx.amount < 0);
                                                    const sign = isAddition ? '+' : (isReduction ? '-' : '');
                                                    const colorClass = isDiscountTx ? 'text-amber-500' : isAddition ? 'text-red-500' : (isReduction ? 'text-emerald-500' : 'text-indigo-500');
                                                    return (
                                                        <p className={`text-lg font-black ${colorClass}`}>
                                                            {sign}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    );
                                                })()}
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    Balance After: ₹{Number(tx.balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>

                                                {/* Admin Approval Actions */}
                                                {tx.approval_status === 'PENDING' && (() => {
                                                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                                                    const isAdmin = storedUser.role === 'admin' || storedUser.role === 'Admin';
                                                    if (!isAdmin) return <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-2 animate-pulse italic">Waiting for Admin Approval</p>;
                                                    
                                                    return (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button 
                                                                onClick={() => handleApprove(tx.id)}
                                                                className="w-7 h-7 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group/btn"
                                                                title="Approve"
                                                            >
                                                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    const reason = window.prompt('Enter rejection reason (optional):');
                                                                    if (reason !== null) handleReject(tx.id, reason);
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all group/btn"
                                                                title="Reject"
                                                            >
                                                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {ledgerHasMore && (
                                        <button
                                            onClick={loadMoreLedger}
                                            disabled={loadingLedger}
                                            className={`w-full py-3 mt-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                                                ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                                ${loadingLedger ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loadingLedger ? 'Loading...' : 'Load More'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Adjust Balance Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center items-center overflow-y-auto no-scrollbar p-0 sm:p-4">
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => { setShowAdjustModal(false); setSelectedShop(null); }} />
                    <div className={`relative w-full max-w-sm border shadow-2xl p-8 rounded-t-[40px] sm:rounded-[40px] animate-in slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <h3 className="text-2xl font-black italic tracking-tight mb-6">Manual Adjustment</h3>
                        <form onSubmit={handleAdjustment} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">Amount (Use minus for deduction)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={adjData.amount}
                                    onChange={e => setAdjData({ ...adjData, amount: e.target.value })}
                                    className={`w-full rounded-2xl px-5 py-4 border text-sm font-semibold focus:outline-none focus:ring-4
                                        ${isDark ? 'bg-slate-800 border-white/10 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-600/10'}`}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">Reason / Description</label>
                                <textarea
                                    required
                                    value={adjData.description}
                                    onChange={e => setAdjData({ ...adjData, description: e.target.value })}
                                    className={`w-full rounded-2xl px-5 py-4 border text-sm font-semibold focus:outline-none focus:ring-4 min-h-[100px]
                                        ${isDark ? 'bg-slate-800 border-white/10 text-white focus:ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-indigo-600/10'}`}
                                    placeholder="Reason for adjustment..."
                                />
                            </div>

                            {parseFloat(adjData.amount) < 0 && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-3 block text-center">Set as Collection Mode</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['Cash', 'UPI', 'Cheque', 'Discount'] as const).map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setAdjData({ ...adjData, method: m })}
                                                className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all
                                                    ${adjData.method === m
                                                        ? m === 'Discount'
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105'
                                                            : 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <p className={`text-[9px] font-bold mt-2 text-center uppercase tracking-tighter italic
                                        ${adjData.method === 'Discount' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {adjData.method === 'Discount' 
                                            ? 'Discount — no money collected, balance reduced directly'
                                            : `This will update the ${adjData.method} column in reports`}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submittingAdj}
                                className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 mt-4
                                    ${submittingAdj ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                            >
                                {submittingAdj ? 'Processing...' : 'Apply Adjustment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Collect Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center overflow-y-auto no-scrollbar p-0 sm:p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => { setShowPaymentModal(false); setSelectedShop(null); }} />
                    <div className={`relative w-full max-w-md border shadow-2xl p-8 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 rounded-t-[40px] sm:rounded-[40px] max-h-[90vh] overflow-y-auto no-scrollbar
                        ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight">Collect Payment</h3>
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1">{selectedShop?.shop_name}</p>
                            </div>
                            <button onClick={() => { setShowPaymentModal(false); setSelectedShop(null); }} className="text-slate-400 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCollectPayment} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">Amount to Collect (₹)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    autoFocus
                                    value={paymentData.amount}
                                    onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    className={`w-full rounded-2xl px-6 py-5 text-2xl font-black border focus:outline-none focus:ring-4
                                        ${isDark ? 'bg-slate-800 border-white/10 text-emerald-400 focus:ring-emerald-500/20' : 'bg-slate-50 border-emerald-100 text-emerald-600 focus:ring-emerald-600/10'}`}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-3 block">Payment Method</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(['Cash', 'UPI', 'Cheque', 'Discount'] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentData({ ...paymentData, method: m })}
                                            className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all
                                                ${paymentData.method === m
                                                    ? m === 'Discount'
                                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                        : 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                                {paymentData.method === 'Discount' && (
                                    <p className="text-[9px] font-bold text-amber-500 mt-2 text-center uppercase tracking-tighter italic animate-in fade-in duration-300">
                                        Discount — no money collected, balance will be reduced directly
                                    </p>
                                )}
                            </div>

                            {paymentData.method === 'UPI' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-3 block">Select UPI App</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['PhonePe', 'GPay', 'Paytm', 'Other'] as const).map((app) => (
                                            <button
                                                key={app}
                                                type="button"
                                                onClick={() => setPaymentData({ ...paymentData, upiApp: app })}
                                                className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all
                                                    ${paymentData.upiApp === app
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {app}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block">Notes (Optional)</label>
                                <textarea
                                    value={paymentData.description}
                                    onChange={e => setPaymentData({ ...paymentData, description: e.target.value })}
                                    className={`w-full rounded-2xl px-5 py-4 border text-sm font-semibold focus:outline-none focus:ring-4 min-h-[80px]
                                        ${isDark ? 'bg-slate-800 border-white/10 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 focus:ring-blue-600/10'}`}
                                    placeholder="e.g. Paid via PhonePe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingPayment}
                                className={`w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[24px] text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/40 transition-all hover:-translate-y-0.5 active:scale-95
                                    ${submittingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {submittingPayment ? 'Recording...' : 'Confirm Collection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShopActionModals;
