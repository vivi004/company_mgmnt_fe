import React, { useState, useEffect } from 'react';
import { useCollections } from './useCollections';
import { useShopActions } from '../../../hooks/useShopActions';
import ShopActionModals from '../../../components/common/ShopModals/ShopActionModals';
import { PendingApprovalsModal } from './PendingApprovalsModal';
import type { OrderLine } from '../../../types/DashboardTypes';
import { useToast, ToastContainer } from '../../../components/Toast';
import { getAuthAxios } from '../../../utils/apiClient';
import { getAllProducts } from '../../../constants/productData';

interface Props {
    theme: string;
    orderLines: OrderLine[];
    isAdmin?: boolean;
}

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface CollectionRowProps {
    row: any;
    idx: number;
    isDark: boolean;
    isAdmin: boolean;
    setSelectedShop: (shop: any) => void;
    setShowPaymentModal: (show: boolean) => void;
    setShowAdjustModal: (show: boolean) => void;
    handleOpenReturnModal: (shop: any) => void;
    fetchLedger: (shop: any) => void;
    handleOpenLedgerEdit: (shop: any, tab: 'PAYMENTS' | 'ADJUSTMENTS' | 'RETURNS') => void;
    renderModeBadges: (cash: number, upi: number, cheque: number, pos: number, pendingTxs: any[], discount: number, shopId?: number) => React.ReactNode;
}

const CollectionRow = React.memo(({
    row,
    idx,
    isDark,
    isAdmin,
    setSelectedShop,
    setShowPaymentModal,
    setShowAdjustModal,
    handleOpenReturnModal,
    fetchLedger,
    handleOpenLedgerEdit,
    renderModeBadges
}: CollectionRowProps) => {
    const collected = row.cash_collected + row.upi_collected + row.cheque_collected + (row.discount_payment || 0);
    const actionShop = React.useMemo(() => ({
        id: row.shop_id,
        shop_name: row.shop_name,
        balance: row.total_balance,
        village_name: row.village_name
    }), [row.shop_id, row.shop_name, row.total_balance, row.village_name]);

    return (
        <tr className={`transition-all duration-200 group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
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
                            onClick={() => handleOpenReturnModal(actionShop)}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-tighter hover:bg-amber-500 hover:text-white transition-all"
                        >
                            Return ↩
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
            <td className={`px-5 py-3.5 text-right font-bold text-amber-500`}>
                {isAdmin ? (
                    <button 
                        onClick={() => handleOpenLedgerEdit(actionShop, 'RETURNS')}
                        className="group/edit inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
                        title="Click to Manage/Edit Returns"
                    >
                        <span>₹{fmt(row.return_amount || 0)}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all text-sm sm:text-base ml-1.5 inline-block hover:scale-125 duration-200">✏️</span>
                    </button>
                ) : (
                    `₹${fmt(row.return_amount || 0)}`
                )}
            </td>
            <td className="px-5 py-3.5 text-right">
                {isAdmin ? (
                    <button
                        onClick={() => handleOpenLedgerEdit(actionShop, 'PAYMENTS')}
                        className="group/edit inline-flex items-center gap-1 font-black text-green-500 hover:text-green-400 transition-colors"
                        title="Click to Manage/Edit Payments"
                    >
                        <span>₹{fmt(collected)}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all text-sm sm:text-base ml-1.5 inline-block hover:scale-125 duration-200">✏️</span>
                    </button>
                ) : (
                    <div className={`font-black ${collected > 0 ? 'text-green-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>₹{fmt(collected)}</div>
                )}
                <div className="flex justify-end mt-1">{renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected, 0, row.pending_transactions.filter((t: any) => (t.category || t.type || '').toUpperCase() === 'PAYMENT'), row.discount_payment, row.shop_id)}</div>
            </td>
            <td className={`px-5 py-3.5 text-right`}>
                {isAdmin ? (
                    <button
                        onClick={() => handleOpenLedgerEdit(actionShop, 'ADJUSTMENTS')}
                        className={`group/edit inline-flex items-center gap-1 font-bold transition-colors ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-500 hover:text-blue-400' : 'text-amber-500 hover:text-amber-400') : isDark ? 'text-slate-600 hover:text-slate-500' : 'text-slate-300 hover:text-slate-400'}`}
                        title="Click to Manage/Edit Adjustments"
                    >
                        <span>{(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? `₹${fmt(row.manual_adjustments + (row.discount_payment || 0))}` : '—'}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all text-sm sm:text-base ml-1.5 inline-block hover:scale-125 duration-200">✏️</span>
                    </button>
                ) : (
                    <div className={`font-bold ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-500' : 'text-amber-500') : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                        {(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? `₹${fmt(row.manual_adjustments + (row.discount_payment || 0))}` : '—'}
                    </div>
                )}
                <div className="flex justify-end mt-1">{renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos, row.pending_transactions.filter((t: any) => (t.category || t.type || '').toUpperCase() === 'MANUAL_ADJUST'), row.discount_adjustment, row.shop_id)}</div>
            </td>
            <td className={`px-5 py-3.5 text-right font-bold ${row.future_bills !== 0 ? 'text-purple-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                {row.future_bills !== 0 ? `₹${fmt(row.future_bills)}` : '—'}
            </td>
            <td className={`px-5 py-3.5 text-right font-black ${row.total_balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ₹{fmt(row.total_balance)}
            </td>
        </tr>
    );
});
CollectionRow.displayName = 'CollectionRow';

const AdminCollections = ({ theme, orderLines, isAdmin: propsIsAdmin }: Props) => {
    const isDark = theme === 'dark';
    const {
        selectedDate, setSelectedDate,
        selectedOlId, setSelectedOlId,
        collections, setCollections, loading,
        totals, modeBreakdown,
        refresh, addExpense, updateExpense, deleteExpense, expenses, recordProductReturn,
        fetchShopDayDetails, updatePayment, updateAdjustment, deleteTransaction,
        updateReturnProduct, deleteReturnProduct, addRetroactiveTx
    } = useCollections(orderLines);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = propsIsAdmin ?? (storedUser.role === 'admin' || storedUser.role === 'Admin');

    const { toasts, showToast, removeToast } = useToast();

    const {
        selectedShop, setSelectedShop,
        showLedger, setShowLedger, ledgerData, loadingLedger, ledgerHasMore, fetchLedger, loadMoreLedger,
        showAdjustModal, setShowAdjustModal, adjData, setAdjData, submittingAdj, handleAdjustment,
        showPaymentModal, setShowPaymentModal, paymentData, setPaymentData, submittingPayment, handleCollectPayment,
        handleApprove, handleReject
    } = useShopActions(showToast, () => refresh(), selectedDate);

    const [skipConfirm, setSkipConfirm] = useState(() => {
        return localStorage.getItem('skipApprovalConfirm') !== 'false';
    });

    const handleApproveOptimistic = async (txId: number, txAmount: number, txMode: string, shopId: number) => {
        const isSkip = localStorage.getItem('skipApprovalConfirm') !== 'false';
        if (!isSkip) {
            if (!window.confirm(`Approve this ${txMode} amount of ₹${fmt(txAmount)}?`)) return;
        }

        const originalCollections = [...collections];
        const originalPendingCount = pendingCount;

        // Perform optimistic update
        setCollections(prev => prev.map(row => {
            if (row.shop_id !== shopId) return row;

            const pendingList = row.pending_transactions || [];
            const txExists = pendingList.some((t: any) => t.id === txId);
            if (!txExists) return row;

            const updatedPending = pendingList.filter((t: any) => t.id !== txId);

            let cashAdd = 0;
            let upiAdd = 0;
            let chequeAdd = 0;

            const m = txMode.toUpperCase();
            if (m.includes('UPI')) {
                upiAdd = txAmount;
            } else if (m.includes('CHEQUE') || m.includes('CHECK')) {
                chequeAdd = txAmount;
            } else {
                cashAdd = txAmount;
            }

            const newCash = row.cash_collected + cashAdd;
            const newUpi = row.upi_collected + upiAdd;
            const newCheque = row.cheque_collected + chequeAdd;

            // total_balance = old_balance + todays_bill_amount - (cash_collected + upi_collected + cheque_collected) + manual_adjustments - return_amount
            const newTotalBalance = row.old_balance + row.todays_bill_amount - (newCash + newUpi + newCheque) + row.manual_adjustments - row.return_amount;

            return {
                ...row,
                pending_transactions: updatedPending,
                cash_collected: newCash,
                upi_collected: newUpi,
                cheque_collected: newCheque,
                total_balance: newTotalBalance
            };
        }));

        setPendingCount(prev => Math.max(0, prev - 1));

        try {
            await handleApprove(txId);
        } catch (err) {
            // Rollback on failure
            setCollections(originalCollections);
            setPendingCount(originalPendingCount);
        }
    };

    // Search query filter state
    const [searchQuery, setSearchQuery] = useState('');

    const [cashInHand, setCashInHand] = useState<string>('');
    const [tempCashInput, setTempCashInput] = useState<string>('');

    // Fetch tally from database when date changes
    useEffect(() => {
        let isMounted = true;
        const fetchTally = async () => {
            try {
                const res = await getAuthAxios().get(`/api/collections/tally?date=${selectedDate}`);
                if (isMounted) {
                    const savedVal = res.data.physical_cash !== null && res.data.physical_cash !== undefined 
                        ? res.data.physical_cash.toString() 
                        : '';
                    setCashInHand(savedVal);
                    setTempCashInput(savedVal);
                }
            } catch (err) {
                console.error('Failed to fetch cash tally:', err);
            }
        };
        fetchTally();
        return () => { isMounted = false; };
    }, [selectedDate]);

    // Save tally to backend database
    const handleSaveTally = async (val: string) => {
        const systemCash = modeBreakdown.netCash || 0;
        const physicalCash = val.trim() !== '' ? parseFloat(val) : null;
        const variance = physicalCash !== null ? physicalCash - systemCash : null;

        try {
            await getAuthAxios().post('/api/collections/tally', {
                date: selectedDate,
                physical_cash: physicalCash,
                variance: variance
            });
            setCashInHand(val);
            showToast('Cash tally saved & verified to database!', 'success');
        } catch (err) {
            console.error('Failed to save cash tally:', err);
            showToast('Failed to save cash tally to database.', 'error');
        }
    };

    // Reset tally in backend database
    const handleResetTally = async () => {
        try {
            await getAuthAxios().post('/api/collections/tally', {
                date: selectedDate,
                physical_cash: null,
                variance: null
            });
            setTempCashInput('');
            setCashInHand('');
            showToast('Cash tally reset successfully.', 'info');
        } catch (err) {
            console.error('Failed to reset cash tally:', err);
            showToast('Failed to clear cash tally from database.', 'error');
        }
    };

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
        acc.totalReturnAmount += row.return_amount;
        acc.totalFutureBills += row.future_bills;
        acc.totalBalance += row.total_balance;
        return acc;
    }, {
        totalOldBalance: 0,
        todaysBillAmount: 0,
        amountCollected: 0,
        totalManualAdjust: 0,
        totalReturnAmount: 0,
        totalFutureBills: 0,
        totalBalance: 0
    });

    // Expense Modal State
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingExpId, setEditingExpId] = useState<number | null>(null);
    const [expAmount, setExpAmount] = useState('');
    const [expDesc, setExpDesc] = useState('');
    const [savingExp, setSavingExp] = useState(false);

    // Product Return Modal State
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnProductName, setReturnProductName] = useState('');
    const [returnAmount, setReturnAmount] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // Overall Returns Modal State
    const [showOverallReturnsModal, setShowOverallReturnsModal] = useState(false);
    const [overallReturns, setOverallReturns] = useState<any[]>([]);
    const [loadingOverallReturns, setLoadingOverallReturns] = useState(false);

    // Pending Approvals Dashboard State
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Consolidated Ledger Edit Modal States
    const [showLedgerEditModal, setShowLedgerEditModal] = useState(false);
    const [ledgerEditTab, setLedgerEditTab] = useState<'PAYMENTS' | 'ADJUSTMENTS' | 'RETURNS'>('PAYMENTS');
    const [loadingLedgerDetails, setLoadingLedgerDetails] = useState(false);
    const [ledgerDayTxs, setLedgerDayTxs] = useState<any[]>([]);
    const [ledgerDayReturns, setLedgerDayReturns] = useState<any[]>([]);

    // Retroactive forms state
    const [retroAmount, setRetroAmount] = useState('');
    const [retroMode, setRetroMode] = useState('CASH');
    const [retroDesc, setRetroDesc] = useState('');
    const [retroProductName, setRetroProductName] = useState('');
    const [submittingRetro, setSubmittingRetro] = useState(false);

    // Inline edit state
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editItemAmount, setEditItemAmount] = useState('');
    const [editItemMode, setEditItemMode] = useState('');
    const [editItemDesc, setEditItemDesc] = useState('');
    const [editItemProdName, setEditItemProdName] = useState('');
    const [savingItemEdit, setSavingItemEdit] = useState(false);

    // Overall Returns Single Product Edit State
    const [editingReturnProduct, setEditingReturnProduct] = useState<any | null>(null);
    const [editRetProdName, setEditRetProdName] = useState('');
    const [editRetProdAmount, setEditRetProdAmount] = useState('');
    const [savingRetProdEdit, setSavingRetProdEdit] = useState(false);

    const loadShopDayDetails = async (shopId: number) => {
        setLoadingLedgerDetails(true);
        try {
            const details = await fetchShopDayDetails(shopId, selectedDate);
            setLedgerDayTxs(details.transactions || []);
            setLedgerDayReturns(details.returns || []);
        } catch (err) {
            showToast('Failed to load shop ledger details', 'error');
        } finally {
            setLoadingLedgerDetails(false);
        }
    };

    const handleOpenLedgerEdit = async (shop: any, tab: 'PAYMENTS' | 'ADJUSTMENTS' | 'RETURNS') => {
        setSelectedShop(shop);
        setLedgerEditTab(tab);
        setShowLedgerEditModal(true);
        setRetroAmount('');
        setRetroMode('CASH');
        setRetroDesc('');
        setRetroProductName('');
        setEditingItemId(null);
        await loadShopDayDetails(shop.id);
    };

    const handleSaveInlineTxEdit = async (tx: any) => {
        const amt = parseFloat(editItemAmount);
        if (isNaN(amt) || amt < 0) return alert('Please enter a valid positive amount');
        setSavingItemEdit(true);
        try {
            if (tx.type === 'Payment') {
                await updatePayment(tx.id, amt, editItemMode, editItemDesc);
            } else if (tx.type === 'Adjustment') {
                await updateAdjustment(tx.id, amt, editItemMode, editItemDesc);
            }
            showToast('Ledger entry updated successfully', 'success');
            setEditingItemId(null);
            if (selectedShop) await loadShopDayDetails(selectedShop.id);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to update ledger entry', 'error');
        } finally {
            setSavingItemEdit(false);
        }
    };

    const handleDeleteInlineTx = async (txId: number) => {
        if (!window.confirm('Are you sure you want to delete this ledger entry? Balances will be recalculated.')) return;
        try {
            await deleteTransaction(txId);
            showToast('Ledger entry deleted successfully', 'success');
            if (selectedShop) await loadShopDayDetails(selectedShop.id);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to delete ledger entry', 'error');
        }
    };

    const handleSaveInlineReturnEdit = async (retId: number) => {
        const amt = parseFloat(editItemAmount);
        if (!editItemProdName.trim()) return alert('Please enter product name');
        if (isNaN(amt) || amt <= 0) return alert('Please enter a valid amount');
        setSavingItemEdit(true);
        try {
            await updateReturnProduct(retId, editItemProdName.trim(), amt);
            showToast('Product return updated successfully', 'success');
            setEditingItemId(null);
            if (selectedShop) await loadShopDayDetails(selectedShop.id);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to update product return', 'error');
        } finally {
            setSavingItemEdit(false);
        }
    };

    const handleDeleteInlineReturn = async (retId: number) => {
        if (!window.confirm('Are you sure you want to delete this product return? Balances will be recalculated.')) return;
        try {
            await deleteReturnProduct(retId);
            showToast('Product return deleted successfully', 'success');
            if (selectedShop) await loadShopDayDetails(selectedShop.id);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to delete product return', 'error');
        }
    };

    const handleAddRetroactive = async () => {
        if (!selectedShop) return;
        const amt = parseFloat(retroAmount);
        if (isNaN(amt) || amt <= 0) return alert('Please enter a valid positive amount');

        let type = 'Payment';
        let desc = retroDesc.trim();
        if (ledgerEditTab === 'PAYMENTS') {
            type = 'Payment';
            if (!desc) desc = `Retroactive Payment (${retroMode})`;
        } else if (ledgerEditTab === 'ADJUSTMENTS') {
            type = 'Adjustment';
            if (!desc) desc = 'Retroactive Adjustment';
        } else if (ledgerEditTab === 'RETURNS') {
            type = 'Return';
            if (!retroProductName.trim()) return alert('Please enter product name');
            desc = `Product Return: ${retroProductName.trim()} (₹${amt})`;
        }

        setSubmittingRetro(true);
        try {
            await addRetroactiveTx(selectedShop.id, type, amt, retroMode, desc, selectedDate);
            showToast('Retroactive entry recorded successfully', 'success');
            setRetroAmount('');
            setRetroDesc('');
            setRetroProductName('');
            await loadShopDayDetails(selectedShop.id);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to record retroactive entry', 'error');
        } finally {
            setSubmittingRetro(false);
        }
    };

    const handleSaveOverallReturnEdit = async () => {
        if (!editingReturnProduct) return;
        const amt = parseFloat(editRetProdAmount);
        if (!editRetProdName.trim()) return alert('Please enter product name');
        if (isNaN(amt) || amt <= 0) return alert('Please enter a valid amount');
        setSavingRetProdEdit(true);
        try {
            await updateReturnProduct(editingReturnProduct.id, editRetProdName.trim(), amt);
            showToast('Product return updated successfully', 'success');
            // Reload overall returns list
            const res = await getAuthAxios().get(`/api/collections/returns?date=${selectedDate}`);
            setOverallReturns(res.data || []);
            setEditingReturnProduct(null);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to update product return', 'error');
        } finally {
            setSavingRetProdEdit(false);
        }
    };

    const handleDeleteOverallReturn = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this product return? Balances will be recalculated.')) return;
        try {
            await deleteReturnProduct(id);
            showToast('Product return deleted successfully', 'success');
            // Reload overall returns list
            const res = await getAuthAxios().get(`/api/collections/returns?date=${selectedDate}`);
            setOverallReturns(res.data || []);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to delete product return', 'error');
        }
    };

    const handleOpenReturnModal = (shop: any) => {
        setSelectedShop(shop);
        setReturnProductName('');
        setReturnAmount('');
        setShowReturnModal(true);
    };

    const handleSaveProductReturn = async () => {
        const amt = parseFloat(returnAmount);
        if (!returnProductName.trim()) return alert('Please enter product name');
        if (isNaN(amt) || amt <= 0) return alert('Please enter a valid amount');
        if (!selectedShop) return;
        setSubmittingReturn(true);
        try {
            await recordProductReturn(selectedShop.id, returnProductName.trim(), amt);
            showToast('Product return recorded successfully', 'success');
            setShowReturnModal(false);
            setSelectedShop(null);
            setReturnProductName('');
            setReturnAmount('');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to record product return', 'error');
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleOpenOverallReturns = async () => {
        setShowOverallReturnsModal(true);
        setLoadingOverallReturns(true);
        try {
            const res = await getAuthAxios().get(`/api/collections/returns?date=${selectedDate}`);
            setOverallReturns(res.data || []);
        } catch (err) {
            showToast('Failed to fetch returns data', 'error');
        } finally {
            setLoadingOverallReturns(false);
        }
    };

    const fetchPendingCount = async () => {
        try {
            const res = await getAuthAxios().get('/api/shops/transactions/pending');
            setPendingCount(res.data?.length || 0);
        } catch (err) {
            console.error('Failed to fetch pending count:', err);
        }
    };

    useEffect(() => {
        fetchPendingCount();
    }, [collections]);



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
    const renderModeBadges = (cash: number, upi: number, cheque: number, pos: number = 0, pendingTxs: any[] = [], discount: number = 0, shopId?: number) => {
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
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (shopId) {
                                        handleApproveOptimistic(tx.id, amt || 0, mode, shopId);
                                    } else {
                                        if (window.confirm(`Approve this ${mode} amount of ₹${fmt(amt || 0)}?`)) {
                                            handleApprove(tx.id);
                                        }
                                    }
                                }}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8 gap-3 sm:gap-4 mb-6">
                {[
                    { label: 'Billed Today', value: `₹${fmt(totals.todaysBillAmount)}`, icon: '🧾', color: 'blue' },
                    { label: 'Collected', value: `₹${fmt(totals.amountCollected)}`, icon: '💰', color: 'green' },
                    { label: 'Returns', value: `₹${fmt(totals.totalReturnAmount || 0)}`, icon: '↩', color: 'amber' },
                    { label: 'Upcoming Bills', value: `₹${fmt(totals.totalFutureBills)}`, icon: '📅', color: totals.totalFutureBills > 0 ? 'purple' : 'slate' },
                    { label: 'Discounts', value: `₹${fmt(modeBreakdown.discount || 0)}`, icon: '🏷️', color: 'amber' },
                    { label: 'Manual Adj', value: `₹${fmt(totals.totalManualAdjust)}`, icon: '⚙️', color: totals.totalManualAdjust === 0 ? 'slate' : totals.totalManualAdjust > 0 ? 'blue' : 'amber' },
                    { label: 'Pending', value: `₹${fmt(totals.todaysBillBalance)}`, icon: '⏳', color: totals.todaysBillBalance > 0 ? 'amber' : 'green' },
                    { label: 'Shops', value: String(collections.length), icon: '🏪', color: 'purple' },
                ].map((card) => {
                    const isLongValue = card.value.length > 9;
                    return (
                        <div
                            key={card.label}
                            className={`rounded-2xl border p-4 sm:p-5 transition-all min-w-0 overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
                        >
                            <div className="flex items-center gap-2 mb-2 min-w-0 overflow-hidden">
                                <span className="text-lg shrink-0">{card.icon}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} truncate`} title={card.label}>{card.label}</span>
                            </div>
                            <p 
                                className={`font-black tracking-tight ${isLongValue ? 'text-base sm:text-lg lg:text-xl' : 'text-xl sm:text-2xl'} ${isDark ? 'text-white' : 'text-slate-900'} truncate`}
                                title={card.value}
                            >
                                {card.value}
                            </p>
                        </div>
                    );
                })}
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
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📋 Collection Details</h3>
                                <button
                                    onClick={handleOpenOverallReturns}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow flex items-center gap-1.5 hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-amber-400 hover:bg-slate-700 shadow-slate-900/40' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 shadow-sm'}`}
                                >
                                    ↩ View Return Products
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowPendingModal(true)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow flex items-center gap-1.5 hover:scale-105 active:scale-95 relative ${isDark ? 'bg-slate-800 border-white/10 text-blue-400 hover:bg-slate-700 shadow-slate-900/40' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm'}`}
                                    >
                                        ⏳ Pending Approvals
                                        {pendingCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-lg shadow-red-500/50 animate-bounce">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
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
                                        <th className="text-right px-5 py-3">Returns</th>
                                        <th className="text-right px-5 py-3">Collected</th>
                                        <th className="text-right px-5 py-3">Manual Adjust</th>
                                        <th className="text-right px-5 py-3">Upcoming</th>
                                        <th className="text-right px-5 py-3">Total Bal</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                    {filteredCollections.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-12 text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase text-xs">
                                                🔍 No matching shops found for "{searchQuery}"
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCollections.map((row, idx) => (
                                            <CollectionRow
                                                key={row.id}
                                                row={row}
                                                idx={idx}
                                                isDark={isDark}
                                                isAdmin={isAdmin}
                                                setSelectedShop={setSelectedShop}
                                                setShowPaymentModal={setShowPaymentModal}
                                                setShowAdjustModal={setShowAdjustModal}
                                                handleOpenReturnModal={handleOpenReturnModal}
                                                fetchLedger={fetchLedger}
                                                handleOpenLedgerEdit={handleOpenLedgerEdit}
                                                renderModeBadges={renderModeBadges}
                                            />
                                        ))
                                    )}
                                    {/* ── TOTAL ROW ── */}
                                    <tr key="total-row" className={`border-t-2 font-black ${isDark ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50'}`}>
                                        <td className="px-5 py-4"></td>
                                        <td className={`px-5 py-4 text-base uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Total</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹{fmt(filteredTotals.totalOldBalance)}</td>
                                        <td className={`px-5 py-4 text-right text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{fmt(filteredTotals.todaysBillAmount)}</td>
                                        <td className={`px-5 py-4 text-right text-base text-amber-500`}>₹{fmt(filteredTotals.totalReturnAmount)}</td>
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
                                                            handleOpenReturnModal(s);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-black"
                                                        title="Product Return"
                                                    >
                                                        ↩
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
                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                <div><span className="text-slate-400">Prev Bal:</span> <span className="font-bold">₹{fmt(row.old_balance)}</span></div>
                                                <div className="text-right"><span className="text-slate-400">Today Bill:</span> <span className="font-bold">₹{fmt(row.todays_bill_amount)}</span></div>
                                                
                                                <div>
                                                     <span className="text-slate-400">Returns:</span>{' '}
                                                     {isAdmin ? (
                                                         <button
                                                             onClick={() => handleOpenLedgerEdit({ id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name }, 'RETURNS')}
                                                             className="font-bold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1"
                                                         >
                                                             <span>₹{fmt(row.return_amount || 0)}</span>
                                                             <span className="text-sm sm:text-base ml-0.5 inline-block hover:scale-125 transition-transform duration-200">✏️</span>
                                                         </button>
                                                     ) : (
                                                         <span className="font-bold text-amber-500">₹{fmt(row.return_amount || 0)}</span>
                                                     )}
                                                 </div>
                                                 <div className="text-right">
                                                     <span className="text-slate-400">Collected:</span>{' '}
                                                     {isAdmin ? (
                                                         <button
                                                             onClick={() => handleOpenLedgerEdit({ id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name }, 'PAYMENTS')}
                                                             className="font-bold text-green-500 hover:text-green-400 inline-flex items-center gap-1"
                                                         >
                                                             <span>₹{fmt(collected)}</span>
                                                             <span className="text-sm sm:text-base ml-0.5 inline-block hover:scale-125 transition-transform duration-200">✏️</span>
                                                         </button>
                                                     ) : (
                                                         <span className="font-bold text-green-500">₹{fmt(collected)}</span>
                                                     )}
                                                 </div>
                                                 
                                                 <div>
                                                     <span className="text-slate-400">Adjust:</span>{' '}
                                                     {isAdmin ? (
                                                         <button
                                                             onClick={() => handleOpenLedgerEdit({ id: row.shop_id, shop_name: row.shop_name, balance: row.total_balance, village_name: row.village_name }, 'ADJUSTMENTS')}
                                                             className={`font-bold ml-1 inline-flex items-center gap-1 ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-500 hover:text-blue-400' : 'text-amber-500 hover:text-amber-400') : 'text-slate-400'}`}
                                                         >
                                                             <span>₹{fmt(row.manual_adjustments + (row.discount_payment || 0))}</span>
                                                             <span className="text-sm sm:text-base ml-0.5 inline-block hover:scale-125 transition-transform duration-200">✏️</span>
                                                         </button>
                                                     ) : (
                                                         <span className={`font-bold ml-1 ${(row.manual_adjustments + (row.discount_payment || 0)) !== 0 ? ((row.manual_adjustments + (row.discount_payment || 0)) > 0 ? 'text-blue-500' : 'text-amber-500') : ''}`}>₹{fmt(row.manual_adjustments + (row.discount_payment || 0))}</span>
                                                     )}
                                                 </div>
                                                <div className="text-right"><span className="text-slate-400">Upcoming:</span> <span className="font-bold text-purple-500">₹{fmt(row.future_bills)}</span></div>

                                                {/* Mode breakdown badges aligned correctly and cleanly */}
                                                <div className="col-span-2 mt-1 space-y-1.5 border-t border-slate-100/50 dark:border-white/5 pt-2">
                                                    {(collected > 0 || row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'PAYMENT').length > 0) && (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Collected by:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {renderModeBadges(row.cash_collected, row.upi_collected, row.cheque_collected, 0, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'PAYMENT'), row.discount_payment, row.shop_id)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {((row.manual_adjustments + (row.discount_payment || 0)) !== 0 || row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'MANUAL_ADJUST').length > 0) && (
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Adjusted by:</span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {renderModeBadges(row.manual_cash, row.manual_upi, row.manual_cheque, row.manual_pos, row.pending_transactions.filter(t => (t.category || t.type || '').toUpperCase() === 'MANUAL_ADJUST'), row.discount_adjustment, row.shop_id)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="col-span-2 border-t border-slate-100/30 dark:border-white/5 pt-2 flex items-center justify-end">
                                                    <div><span className="text-slate-400 text-xs font-black uppercase">Total:</span> <span className="font-black text-red-500 text-sm ml-1.5">₹{fmt(row.total_balance)}</span></div>
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
                                    <div className="text-right"><span className="text-slate-500">Returns:</span> <span className="font-black text-amber-500">₹{fmt(filteredTotals.totalReturnAmount)}</span></div>
                                    <div><span className="text-slate-500">Collected:</span> <span className="font-black">₹{fmt(filteredTotals.amountCollected)}</span></div>
                                    <div className="text-right"><span className="text-slate-500">Adjust:</span> <span className="font-black">₹{fmt(filteredTotals.totalManualAdjust)}</span></div>
                                    <div><span className="text-slate-500">Upcoming:</span> <span className="font-black">₹{fmt(filteredTotals.totalFutureBills)}</span></div>
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
                                                            <span className="inline-block hover:scale-125 transition-transform duration-200 text-sm sm:text-base">✏️</span>
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

                    {/* ═══════ Cash Hand Tally & Verification ═══════ */}
                    <div className={`mt-8 rounded-2xl border overflow-hidden p-6 space-y-6 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-white/5">
                            <div>
                                <h3 className={`text-base font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    <span>💵</span> Cash Hand Tally & Verification
                                </h3>
                                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
                                    Verify physical cash in hand against web recorded cash for {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                </p>
                            </div>
                            <button
                                onClick={handleResetTally}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-red-500 shadow-sm'}`}
                            >
                                🔄 Reset Tally
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Web recorded cash display */}
                            <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Cash (Web)</span>
                                    <h4 className={`text-2xl font-black italic tracking-tighter mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        ₹{fmt(modeBreakdown.netCash || 0)}
                                    </h4>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                                    Includes all cash collections minus daily expenses
                                </p>
                            </div>

                            {/* Physical cash input field */}
                            <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                <div>
                                    <label htmlFor="physical-cash-input" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Physical Cash in Hand (Counted)
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-grow">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 text-base">₹</span>
                                            <input
                                                id="physical-cash-input"
                                                type="text"
                                                value={tempCashInput}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                        setTempCashInput(val);
                                                    }
                                                }}
                                                placeholder="Enter counted cash..."
                                                className={`w-full pl-8 pr-4 py-3 rounded-xl border font-black text-base outline-none transition-all ${isDark ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500/30 shadow-sm'}`}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSaveTally(tempCashInput)}
                                            className={`px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-md ${isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-200'}`}
                                        >
                                            Okay
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                                    Enter cash amount physically present in cash box
                                </p>
                            </div>
                        </div>

                        {/* Reconciliation status box */}
                        {cashInHand.trim() !== '' && (() => {
                            const systemCash = modeBreakdown.netCash || 0;
                            const physicalCash = parseFloat(cashInHand) || 0;
                            const diff = physicalCash - systemCash;
                            const absDiff = Math.abs(diff);

                            let bgClass = '';
                            let borderClass = '';
                            let textClass = '';
                            let badgeLabel = '';
                            let emoji = '';
                            let statusDesc = '';

                            if (absDiff === 0) {
                                bgClass = isDark ? 'bg-emerald-950/20' : 'bg-emerald-50';
                                borderClass = isDark ? 'border-emerald-500/20' : 'border-emerald-200';
                                textClass = 'text-emerald-500 dark:text-emerald-400';
                                badgeLabel = 'TALLY BALANCED';
                                emoji = '✅';
                                statusDesc = 'Perfect match! Web record matches physical cash in hand exactly.';
                            } else if (diff > 0) {
                                bgClass = isDark ? 'bg-blue-950/20' : 'bg-blue-50';
                                borderClass = isDark ? 'border-blue-500/20' : 'border-blue-200';
                                textClass = 'text-blue-500 dark:text-blue-400';
                                badgeLabel = `SURPLUS: +₹${fmt(absDiff)}`;
                                emoji = '📈';
                                statusDesc = 'Extra cash in hand! Physical cash is more than recorded transactions.';
                            } else {
                                bgClass = isDark ? 'bg-rose-950/20' : 'bg-rose-50';
                                borderClass = isDark ? 'border-rose-500/20' : 'border-rose-200';
                                textClass = 'text-rose-500 dark:text-rose-400';
                                badgeLabel = `SHORTAGE: -₹${fmt(absDiff)}`;
                                emoji = '⚠️';
                                statusDesc = 'Cash shortage! Physical cash is less than recorded transactions.';
                            }

                            return (
                                <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${bgClass} ${borderClass}`}>
                                    <div className="flex items-start gap-4">
                                        <span className="text-3xl shrink-0 mt-0.5">{emoji}</span>
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${textClass} ${borderClass} bg-white/5`}>
                                                {badgeLabel}
                                            </span>
                                            <p className={`text-sm font-black mt-2 ${textClass}`}>
                                                {diff === 0 
                                                    ? 'Tally matches 100%' 
                                                    : diff > 0 
                                                        ? `Cash surplus of ₹${fmt(absDiff)} detected.` 
                                                        : `Cash deficit of ₹${fmt(absDiff)} detected.`}
                                            </p>
                                            <p className={`text-xs mt-1 font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {statusDesc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Variance</span>
                                        <span className={`text-2xl font-black italic tracking-tighter ${textClass}`}>
                                            {diff === 0 ? '₹0.00' : `${diff > 0 ? '+' : '-'}₹${fmt(absDiff)}`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
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

            {/* ── Product Return Modal ── */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setShowReturnModal(false); setSelectedShop(null); }} />
                    <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                            <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                ↩ RECORD PRODUCT RETURN
                            </h3>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                {selectedShop?.shop_name}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Product Name</label>
                                <input
                                    type="text"
                                    list="return-products"
                                    value={returnProductName}
                                    onChange={(e) => setReturnProductName(e.target.value)}
                                    placeholder="Search or type product name..."
                                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-amber-500/20'}`}
                                />
                                <datalist id="return-products">
                                    {Array.from(new Set(getAllProducts().map(p => `${p.brand} ${p.name} ${p.size}`))).map(option => (
                                        <option key={option} value={option} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Return Value (₹)</label>
                                <input
                                    type="number"
                                    value={returnAmount}
                                    onChange={(e) => setReturnAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full px-4 py-3 rounded-xl border font-black text-lg focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-amber-500/20'}`}
                                />
                            </div>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button
                                onClick={() => { setShowReturnModal(false); setSelectedShop(null); }}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProductReturn}
                                disabled={submittingReturn}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30`}
                            >
                                {submittingReturn ? 'Submitting...' : 'Save Return'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Overall Returns Modal ── */}
            {showOverallReturnsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowOverallReturnsModal(false)} />
                    <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
                            <div>
                                <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    ↩ RETURNED PRODUCTS SUMMARY
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                    Date: {selectedDate.split('-').reverse().join('-')}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowOverallReturnsModal(false)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 max-h-[400px] overflow-y-auto">
                            {loadingOverallReturns ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : overallReturns.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-wider">
                                    ↩ No products returned on this date
                                </div>
                            ) : (
                                <div className="overflow-hidden border rounded-xl dark:border-white/5">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                                <th className="px-4 py-3">Shop</th>
                                                <th className="px-4 py-3">Product Name</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                            {overallReturns.map((item, idx) => (
                                                <tr key={item.id || idx} className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                                    <td className="px-4 py-3 font-bold">{item.shop_name}</td>
                                                    <td className="px-4 py-3">{item.product_name}</td>
                                                    <td className="px-4 py-3 text-right font-black text-amber-500">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span>₹{fmt(item.amount)}</span>
                                                            {isAdmin && (
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingReturnProduct(item);
                                                                            setEditRetProdName(item.product_name);
                                                                            setEditRetProdAmount(String(item.amount));
                                                                        }}
                                                                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                                                        title="Edit Return"
                                                                    >
                                                                        <span className="inline-block hover:scale-125 transition-transform duration-200 text-sm sm:text-base">✏️</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteOverallReturn(item.id)}
                                                                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                                                        title="Delete Return"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className={`font-black ${isDark ? 'bg-amber-950/20' : 'bg-amber-50/50'} border-t-2 ${isDark ? 'border-amber-500/20' : 'border-amber-200'}`}>
                                                <td colSpan={2} className="px-4 py-3 uppercase tracking-wider text-xs">Total Returns</td>
                                                <td className="px-4 py-3 text-right text-base text-amber-600 dark:text-amber-400">
                                                    ₹{fmt(overallReturns.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-white/5 flex justify-end">
                            <button
                                onClick={() => setShowOverallReturnsModal(false)}
                                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Pending Approvals Modal ── */}
            <PendingApprovalsModal 
                isOpen={showPendingModal}
                onClose={() => {
                    setShowPendingModal(false);
                    fetchPendingCount();
                }}
                isDark={isDark}
                showToast={showToast}
                refreshDashboard={refresh}
                handleApprove={handleApprove}
                handleReject={handleReject}
                fmt={fmt}
            />

            {/* ── Consolidated Shop Ledger Edit Modal (Admin-Only) ── */}
            {showLedgerEditModal && selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowLedgerEditModal(false)} />
                    <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent flex items-center justify-between">
                            <div>
                                <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    ✏️ MANAGE LEDGER: {selectedShop.shop_name}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                    Date: {selectedDate.split('-').reverse().join('-')} | Village: {selectedShop.village_name}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowLedgerEditModal(false)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className={`flex border-b ${isDark ? 'border-white/5 bg-slate-950/20' : 'border-slate-100 bg-slate-50'}`}>
                            {[
                                { id: 'PAYMENTS', label: '💳 Payments', color: 'green' },
                                { id: 'ADJUSTMENTS', label: '⚙️ Adjustments', color: 'blue' },
                                { id: 'RETURNS', label: '↩ Returns', color: 'amber' }
                            ].map(tab => {
                                const isActive = ledgerEditTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setLedgerEditTab(tab.id as any);
                                            setEditingItemId(null);
                                            setRetroAmount('');
                                            setRetroDesc('');
                                            setRetroProductName('');
                                        }}
                                        className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                                            isActive 
                                                ? isDark 
                                                    ? 'border-blue-500 text-blue-400 bg-white/5' 
                                                    : 'border-blue-600 text-blue-600 bg-blue-50/30'
                                                : isDark 
                                                    ? 'border-transparent text-slate-400 hover:text-white hover:bg-white/5' 
                                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content Scroll Area */}
                        <div className="p-6 max-h-[450px] overflow-y-auto space-y-6">
                            {loadingLedgerDetails ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fetching day ledger entries...</span>
                                </div>
                            ) : (
                                <>
                                    {/* ── Active Tab Entry List ── */}
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Approved Entries for today</h4>
                                        {ledgerEditTab === 'PAYMENTS' && (
                                            <div className="space-y-3">
                                                {ledgerDayTxs.filter(t => t.type === 'Payment').length === 0 ? (
                                                    <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed rounded-xl dark:border-white/5">No approved payments for this shop today.</p>
                                                ) : (
                                                    ledgerDayTxs.filter(t => t.type === 'Payment').map(tx => {
                                                        const isEditing = editingItemId === tx.id;
                                                        return (
                                                            <div key={tx.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                                {isEditing ? (
                                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount (₹)</label>
                                                                            <input 
                                                                                type="number" 
                                                                                value={editItemAmount} 
                                                                                onChange={(e) => setEditItemAmount(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Mode</label>
                                                                            <select 
                                                                                value={editItemMode} 
                                                                                onChange={(e) => setEditItemMode(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            >
                                                                                <option value="CASH">CASH</option>
                                                                                <option value="UPI">UPI</option>
                                                                                <option value="CHEQUE">CHEQUE</option>
                                                                                <option value="DISCOUNT">DISCOUNT</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={editItemDesc} 
                                                                                onChange={(e) => setEditItemDesc(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-black text-sm text-green-500">₹{fmt(tx.amount)}</span>
                                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20`}>{tx.payment_mode}</span>
                                                                            <span className="text-[10px] text-slate-500 font-bold">by {tx.created_by || 'Staff'}</span>
                                                                        </div>
                                                                        <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{tx.description}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleSaveInlineTxEdit(tx)}
                                                                                disabled={savingItemEdit}
                                                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-colors"
                                                                            >
                                                                                {savingItemEdit ? 'Saving...' : 'Save'}
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setEditingItemId(null)}
                                                                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setEditingItemId(tx.id);
                                                                                    setEditItemAmount(String(tx.amount));
                                                                                    setEditItemMode(tx.payment_mode || 'CASH');
                                                                                    setEditItemDesc(tx.description || '');
                                                                                }}
                                                                                className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteInlineTx(tx.id)}
                                                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {ledgerEditTab === 'ADJUSTMENTS' && (
                                            <div className="space-y-3">
                                                {ledgerDayTxs.filter(t => t.type === 'Adjustment').length === 0 ? (
                                                    <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed rounded-xl dark:border-white/5">No approved adjustments for this shop today.</p>
                                                ) : (
                                                    ledgerDayTxs.filter(t => t.type === 'Adjustment').map(tx => {
                                                        const isEditing = editingItemId === tx.id;
                                                        const isPositive = parseFloat(tx.amount) > 0;
                                                        return (
                                                            <div key={tx.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                                {isEditing ? (
                                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Amount (₹)</label>
                                                                            <span className="text-[9px] block text-slate-400 font-semibold mb-1">Use negative value (e.g. -200) to decrease balance</span>
                                                                            <input 
                                                                                type="number" 
                                                                                value={editItemAmount} 
                                                                                onChange={(e) => setEditItemAmount(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Adjustment Type</label>
                                                                            <select 
                                                                                value={editItemMode} 
                                                                                onChange={(e) => setEditItemMode(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            >
                                                                                <option value="CASH">CASH</option>
                                                                                <option value="UPI">UPI</option>
                                                                                <option value="CHEQUE">CHEQUE</option>
                                                                                <option value="DISCOUNT">DISCOUNT</option>
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={editItemDesc} 
                                                                                onChange={(e) => setEditItemDesc(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`font-black text-sm ${isPositive ? 'text-indigo-500' : 'text-amber-500'}`}>
                                                                                {isPositive ? '+' : ''}₹{fmt(tx.amount)}
                                                                            </span>
                                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${isPositive ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'} border`}>
                                                                                {tx.payment_mode || 'Adjustment'}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-500 font-bold">by {tx.created_by || 'Admin'}</span>
                                                                        </div>
                                                                        <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{tx.description}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleSaveInlineTxEdit(tx)}
                                                                                disabled={savingItemEdit}
                                                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-colors"
                                                                            >
                                                                                {savingItemEdit ? 'Saving...' : 'Save'}
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setEditingItemId(null)}
                                                                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setEditingItemId(tx.id);
                                                                                    setEditItemAmount(String(tx.amount));
                                                                                    setEditItemMode(tx.payment_mode || 'CASH');
                                                                                    setEditItemDesc(tx.description || '');
                                                                                }}
                                                                                className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteInlineTx(tx.id)}
                                                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}

                                        {ledgerEditTab === 'RETURNS' && (
                                            <div className="space-y-3">
                                                {ledgerDayReturns.length === 0 ? (
                                                    <p className="text-xs text-slate-500 italic py-3 text-center border border-dashed rounded-xl dark:border-white/5">No returned products recorded today.</p>
                                                ) : (
                                                    ledgerDayReturns.map(ret => {
                                                        const isEditing = editingItemId === ret.id;
                                                        return (
                                                            <div key={ret.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                                                {isEditing ? (
                                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Product Name</label>
                                                                            <input 
                                                                                type="text" 
                                                                                list="edit-return-products"
                                                                                value={editItemProdName} 
                                                                                onChange={(e) => setEditItemProdName(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                            <datalist id="edit-return-products">
                                                                                {Array.from(new Set(getAllProducts().map(p => `${p.brand} ${p.name} ${p.size}`))).map(option => (
                                                                                    <option key={option} value={option} />
                                                                                ))}
                                                                            </datalist>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Return Value (₹)</label>
                                                                            <input 
                                                                                type="number" 
                                                                                value={editItemAmount} 
                                                                                onChange={(e) => setEditItemAmount(e.target.value)}
                                                                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-black outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-black text-sm text-amber-500">₹{fmt(ret.amount)}</span>
                                                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">by {ret.created_by || 'Staff'}</span>
                                                                        </div>
                                                                        <p className={`text-xs mt-1 font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{ret.product_name}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => handleSaveInlineReturnEdit(ret.id)}
                                                                                disabled={savingItemEdit}
                                                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-colors"
                                                                            >
                                                                                {savingItemEdit ? 'Saving...' : 'Save'}
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setEditingItemId(null)}
                                                                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setEditingItemId(ret.id);
                                                                                    setEditItemAmount(String(ret.amount));
                                                                                    setEditItemProdName(ret.product_name || '');
                                                                                }}
                                                                                className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteInlineReturn(ret.id)}
                                                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black transition-all"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Retroactive Form ── */}
                                    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/20 border-white/5' : 'bg-slate-100/50 border-slate-200'}`}>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">➕ Add Retroactive approved Entry</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {ledgerEditTab === 'RETURNS' ? (
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Product Name</label>
                                                    <input 
                                                        type="text" 
                                                        list="retro-products"
                                                        value={retroProductName}
                                                        onChange={(e) => setRetroProductName(e.target.value)}
                                                        placeholder="Search or type product return name..."
                                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                    />
                                                    <datalist id="retro-products">
                                                        {Array.from(new Set(getAllProducts().map(p => `${p.brand} ${p.name} ${p.size}`))).map(option => (
                                                            <option key={option} value={option} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Payment Mode</label>
                                                    <select 
                                                        value={retroMode}
                                                        onChange={(e) => setRetroMode(e.target.value)}
                                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                    >
                                                        <option value="CASH">CASH</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="CHEQUE">CHEQUE</option>
                                                        <option value="DISCOUNT">DISCOUNT</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                                                    {ledgerEditTab === 'ADJUSTMENTS' ? 'Amount (₹) (e.g. -200)' : 'Amount (₹)'}
                                                </label>
                                                <input 
                                                    type="number" 
                                                    value={retroAmount}
                                                    onChange={(e) => setRetroAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-black outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                />
                                            </div>

                                            {ledgerEditTab !== 'RETURNS' && (
                                                <div className="sm:col-span-2 md:col-span-1">
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Description (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        value={retroDesc}
                                                        onChange={(e) => setRetroDesc(e.target.value)}
                                                        placeholder="e.g. Retroactive credit"
                                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleAddRetroactive}
                                            disabled={submittingRetro}
                                            className={`mt-4 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2`}
                                        >
                                            <span>{submittingRetro ? 'Submitting...' : `➕ Record Approved ${ledgerEditTab === 'RETURNS' ? 'Return' : ledgerEditTab === 'ADJUSTMENTS' ? 'Adjustment' : 'Payment'}`}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-white/5 flex justify-end">
                            <button
                                onClick={() => setShowLedgerEditModal(false)}
                                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                Close Ledger Manager
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Return Product Single Edit Sub-Modal (Admin-Only) ── */}
            {editingReturnProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setEditingReturnProduct(null)} />
                    <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                            <h3 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                ✏️ EDIT PRODUCT RETURN ENTRY
                            </h3>
                            <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                                Shop: {editingReturnProduct.shop_name}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Product Name</label>
                                <input
                                    type="text"
                                    list="edit-overall-return-products"
                                    value={editRetProdName}
                                    onChange={(e) => setEditRetProdName(e.target.value)}
                                    placeholder="Search or type product name..."
                                    className={`w-full px-4 py-3 rounded-xl border font-bold text-sm focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-amber-500/20'}`}
                                />
                                <datalist id="edit-overall-return-products">
                                    {Array.from(new Set(getAllProducts().map(p => `${p.brand} ${p.name} ${p.size}`))).map(option => (
                                        <option key={option} value={option} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Return Value (₹)</label>
                                <input
                                    type="number"
                                    value={editRetProdAmount}
                                    onChange={(e) => setEditRetProdAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full px-4 py-3 rounded-xl border font-black text-lg focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-white/5 text-white focus:ring-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-amber-500/20'}`}
                                />
                            </div>
                        </div>
                        <div className="p-6 flex gap-3">
                            <button
                                onClick={() => setEditingReturnProduct(null)}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveOverallReturnEdit}
                                disabled={savingRetProdEdit}
                                className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30`}
                            >
                                {savingRetProdEdit ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default AdminCollections;
