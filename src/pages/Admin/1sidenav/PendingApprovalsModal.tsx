import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';

interface PendingApprovalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    showToast: (msg: string, type: any) => void;
    refreshDashboard: () => void;
    handleApprove: (txId: number) => Promise<void>;
    handleReject: (txId: number, reason: string) => Promise<void>;
    fmt: (v: number) => string;
}

export const PendingApprovalsModal = ({
    isOpen,
    onClose,
    isDark,
    showToast,
    refreshDashboard,
    handleApprove,
    handleReject,
    fmt
}: PendingApprovalsModalProps) => {
    const [pendingTxs, setPendingTxs] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [selectedPendingIds, setSelectedPendingIds] = useState<number[]>([]);
        const [approvingBulk, setApprovingBulk] = useState(false);
    const [pendingSearchQuery, setPendingSearchQuery] = useState('');
    const [skipConfirm, setSkipConfirm] = useState(() => {
        return localStorage.getItem('skipApprovalConfirm') !== 'false';
    });

    const fetchPendingTxs = async () => {
        setLoadingPending(true);
        try {
            const res = await getAuthAxios().get('/api/shops/transactions/pending');
            setPendingTxs(res.data || []);
        } catch (err) {
            showToast('Failed to fetch pending requests', 'error');
        } finally {
            setLoadingPending(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPendingTxs();
            setSelectedPendingIds([]);
            setPendingSearchQuery('');
        }
    }, [isOpen]);

    const filteredPendingTxs = pendingTxs.filter((tx: any) => 
        (tx.shop_name || '').toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        (tx.village_name || '').toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        (tx.description || '').toLowerCase().includes(pendingSearchQuery.toLowerCase())
    );

    const handleSelectPending = (id: number) => {
        if (selectedPendingIds.includes(id)) {
            setSelectedPendingIds(prev => prev.filter(x => x !== id));
        } else {
            setSelectedPendingIds(prev => [...prev, id]);
        }
    };

    const handleSelectAllPending = (filteredIds: number[]) => {
        const allSelectedInFiltered = filteredIds.every(id => selectedPendingIds.includes(id));
        if (allSelectedInFiltered) {
            setSelectedPendingIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedPendingIds(prev => {
                const union = new Set([...prev, ...filteredIds]);
                return Array.from(union);
            });
        }
    };

    const handleApprovePendingSingle = async (txId: number, mode: string, amt: number) => {
        if (!skipConfirm) {
            if (!window.confirm(`Approve this ${mode} request of ₹${fmt(amt)}?`)) return;
        }

        const originalPending = [...pendingTxs];

        // Optimistically remove from state
        setPendingTxs(prev => prev.filter(t => t.id !== txId));
        setSelectedPendingIds(prev => prev.filter(id => id !== txId));

        try {
            await handleApprove(txId);
            // Background fetch to verify sync
            const res = await getAuthAxios().get('/api/shops/transactions/pending');
            setPendingTxs(res.data || []);
        } catch (err) {
            // Revert state on failure
            setPendingTxs(originalPending);
        }
    };

    const handleRejectPendingSingle = async (txId: number) => {
        const reason = window.prompt('Enter rejection reason (optional):');
        if (reason === null) return;

        const originalPending = [...pendingTxs];

        // Optimistically remove from state instantly
        setPendingTxs(prev => prev.filter(t => t.id !== txId));
        setSelectedPendingIds(prev => prev.filter(id => id !== txId));

        try {
            await handleReject(txId, reason);
            // Background fetch to verify sync
            const res = await getAuthAxios().get('/api/shops/transactions/pending');
            setPendingTxs(res.data || []);
        } catch (err) {
            setPendingTxs(originalPending);
        }
    };

    const handleApprovePendingBulk = async () => {
        if (selectedPendingIds.length === 0) return;
        if (!skipConfirm) {
            if (!window.confirm(`Are you sure you want to approve all ${selectedPendingIds.length} selected request(s)?`)) return;
        }
        
        const originalPending = [...pendingTxs];
        const idsToApprove = [...selectedPendingIds];

        // Optimistically remove all selected from list immediately
        setPendingTxs(prev => prev.filter(t => !idsToApprove.includes(t.id)));
        setSelectedPendingIds([]);
        setApprovingBulk(true);

        try {
            await getAuthAxios().post('/api/shops/transactions/approve-bulk', { tx_ids: idsToApprove });
            showToast('Selected transactions approved successfully!', 'success');
            refreshDashboard();
            // Background fetch to verify sync
            const res = await getAuthAxios().get('/api/shops/transactions/pending');
            setPendingTxs(res.data || []);
        } catch (err: any) {
            // Revert
            setPendingTxs(originalPending);
            setSelectedPendingIds(idsToApprove);
            showToast(err.response?.data?.error || 'Bulk approval failed', 'error');
        } finally {
            setApprovingBulk(false);
        }
    };

    if (!isOpen) return null;

    const pendingCount = pendingTxs.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent flex items-center justify-between">
                    <div>
                        <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ⏳ PENDING APPROVAL REQUESTS
                        </h3>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                            {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} awaiting administrative review
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="px-6 py-4 border-b dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={pendingSearchQuery}
                            onChange={(e) => setPendingSearchQuery(e.target.value)}
                            placeholder="Filter by shop, village or description..."
                            className={`w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border focus:ring-4 outline-none transition-all ${isDark 
                                ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20 focus:border-blue-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500/10 focus:border-blue-500 shadow-inner'}`}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={skipConfirm} 
                                onChange={(e) => {
                                    setSkipConfirm(e.target.checked);
                                    localStorage.setItem('skipApprovalConfirm', String(e.target.checked));
                                    showToast(e.target.checked ? '⚡ Fast Approve active!' : 'Confirmation prompts active.', 'info');
                                }}
                                className="sr-only peer" 
                            />
                            <div className="w-8 h-4.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className={`ml-2 text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                ⚡ Fast Approve
                            </span>
                        </label>
                        {selectedPendingIds.length > 0 && (
                            <div className="text-xs font-bold text-blue-500 animate-pulse">
                                ✓ {selectedPendingIds.length} item{selectedPendingIds.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto">
                    {loadingPending ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : pendingTxs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider">
                            🎉 No pending approval requests in the system!
                        </div>
                    ) : filteredPendingTxs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider">
                            🔍 No matches found for "{pendingSearchQuery}"
                        </div>
                    ) : (
                        <div className="overflow-hidden border rounded-xl dark:border-white/5">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        <th className="px-4 py-3 text-center w-12">
                                            <input 
                                                type="checkbox"
                                                checked={filteredPendingTxs.length > 0 && filteredPendingTxs.every((tx: any) => selectedPendingIds.includes(tx.id))}
                                                onChange={() => handleSelectAllPending(filteredPendingTxs.map((t: any) => t.id))}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-white/10"
                                            />
                                        </th>
                                        <th className="px-4 py-3">Shop &amp; Village</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3">Requested By / Date</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                    {filteredPendingTxs.map((tx: any) => {
                                        const mode = (tx.payment_mode || tx.payment_method || 'CASH').toUpperCase();
                                        const isAdj = tx.transaction_category === 'MANUAL_ADJUST';
                                        return (
                                            <tr key={tx.id} className={`${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'} transition-colors`}>
                                                <td className="px-4 py-3 text-center">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedPendingIds.includes(tx.id)}
                                                        onChange={() => handleSelectPending(tx.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-white/10"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold">{tx.shop_name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{tx.village_name}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${isAdj ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                        {isAdj ? 'Adjustment' : 'Payment'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-xs text-blue-400">
                                                    {mode}
                                                </td>
                                                <td className="px-4 py-3 text-xs italic max-w-xs truncate" title={tx.description}>
                                                    {tx.description}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-black ${isAdj ? (tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500') : 'text-blue-500'}`}>
                                                    ₹{fmt(tx.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div className="font-semibold">{tx.created_by || 'Staff'}</div>
                                                    <div className="text-[10px] text-slate-500">{new Date(tx.transaction_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})} {new Date(tx.transaction_date).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => handleApprovePendingSingle(tx.id, mode, tx.amount)}
                                                            className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group/btn"
                                                            title="Approve"
                                                        >
                                                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectPendingSingle(tx.id)}
                                                            className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all group/btn"
                                                            title="Reject"
                                                        >
                                                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-white/5 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Showing {filteredPendingTxs.length} of {pendingTxs.length} pending request(s)
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleApprovePendingBulk}
                            disabled={selectedPendingIds.length === 0 || approvingBulk}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 flex items-center gap-1.5`}
                        >
                            {approvingBulk ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                `Approve Selected (${selectedPendingIds.length})`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
