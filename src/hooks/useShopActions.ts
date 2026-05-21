import { useState, useEffect } from 'react';
import { getAuthAxios } from '../utils/apiClient';

export interface Shop {
    id: number;
    shop_name: string;
    balance: number | string;
    village_name: string;
    [key: string]: any; // Allow other fields like phone, owner, etc.
}

export const useShopActions = (showToast: (msg: string, type: any) => void, onSuccess?: () => void, collectionDate?: string) => {
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    
    // Ledger States
    const [showLedger, setShowLedger] = useState(false);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [ledgerSkip, setLedgerSkip] = useState(0);
    const [ledgerHasMore, setLedgerHasMore] = useState(true);

    // Adjustment States
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjData, setAdjData] = useState({ amount: '', description: '', method: 'Cash' });
    const [submittingAdj, setSubmittingAdj] = useState(false);

    // Payment States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ 
        amount: '', 
        method: 'Cash', 
        upiApp: 'PhonePe', 
        description: '' 
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const api = () => getAuthAxios();

    // Safety Timeouts
    useEffect(() => {
        const checkTimeout = (state: boolean, setter: (v: boolean) => void, name: string) => {
            if (state) {
                const timer = setTimeout(() => {
                    setter(false);
                    showToast(`${name} request timed out. Please try again.`, 'error');
                }, 15000);
                return () => clearTimeout(timer);
            }
        };
        const t1 = checkTimeout(submittingAdj, setSubmittingAdj, 'Adjustment');
        const t2 = checkTimeout(submittingPayment, setSubmittingPayment, 'Payment');
        return () => { if (t1) t1(); if (t2) t2(); };
    }, [submittingAdj, submittingPayment]);

    const fetchLedger = async (shop: Shop) => {
        setSelectedShop(shop);
        setShowLedger(true);
        setLoadingLedger(true);
        setLedgerSkip(0);
        setLedgerHasMore(true);
        try {
            const res = await api().get(`/api/shops/${shop.id}/ledger?limit=20&skip=0`);
            setLedgerData(res.data);
            if (res.data.length < 20) setLedgerHasMore(false);
        } catch {
            showToast('Failed to load ledger', 'error');
        } finally {
            setLoadingLedger(false);
        }
    };

    const loadMoreLedger = async () => {
        if (!selectedShop || loadingLedger || !ledgerHasMore) return;
        const newSkip = ledgerSkip + 20;
        setLoadingLedger(true);
        try {
            const res = await api().get(`/api/shops/${selectedShop.id}/ledger?limit=20&skip=${newSkip}`);
            if (res.data.length > 0) {
                setLedgerData(prev => [...prev, ...res.data]);
                setLedgerSkip(newSkip);
            }
            if (res.data.length < 20) setLedgerHasMore(false);
        } catch {
            showToast('Failed to load more ledger data', 'error');
        } finally {
            setLoadingLedger(false);
        }
    };

    const handleAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShop || submittingAdj) return;
        setSubmittingAdj(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const adminName = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Admin';

            await api().post(`/api/shops/${selectedShop.id}/adjust-balance`, {
                amount: parseFloat(adjData.amount),
                description: adjData.description,
                payment_method: parseFloat(adjData.amount) < 0 ? adjData.method : null,
                created_by: adminName,
                collection_date: collectionDate || undefined
            });
            showToast('Balance adjusted!', 'success');
            setShowAdjustModal(false);
            setSelectedShop(null);
            setAdjData({ amount: '', description: '', method: 'Cash' });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast(err.response?.data?.message || err.response?.data?.error || 'Failed to adjust balance', 'error');
        } finally {
            setSubmittingAdj(false);
        }
    };

    const handleCollectPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShop || submittingPayment) return;
        setSubmittingPayment(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Admin';
            let amount = parseFloat(paymentData.amount);

            if (isNaN(amount) || amount <= 0) {
                showToast('Please enter a valid amount', 'error');
                return;
            }

            const currentBalance = Number(selectedShop.balance) || 0;
            if (amount > currentBalance) {
                showToast(`Total balance is ₹${currentBalance.toLocaleString('en-IN')}, invalid to collect`, 'error');
                return;
            }

            let method = paymentData.method;
            let description = paymentData.description;
            if (paymentData.method === 'UPI') {
                method = paymentData.upiApp;
            } else if (paymentData.method === 'Discount') {
                method = 'Discount';
                if (!description) {
                    description = `Discount Applied — ₹${amount.toLocaleString('en-IN')}`;
                }
            }

            const cash_amount = paymentData.method === 'Cash' ? amount : 0;
            const upi_amount = paymentData.method === 'UPI' ? amount : 0;
            const cheque_amount = paymentData.method === 'Cheque' ? amount : 0;

            await api().post(`/api/shops/${selectedShop.id}/collect-payment`, {
                amount: amount,
                payment_method: method,
                cash_amount,
                upi_amount,
                cheque_amount,
                description: description || `${method} payment collected by ${userName}`,
                created_by: userName,
                collection_date: collectionDate || undefined
            });
            showToast('Payment recorded!', 'success');
            setShowPaymentModal(false);
            setSelectedShop(null);
            setPaymentData({ amount: '', method: 'Cash', upiApp: 'PhonePe', description: '' });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to record payment', 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleApprove = async (txId: number) => {
        try {
            await api().post(`/api/shops/transactions/${txId}/approve`);
            showToast('Transaction approved!', 'success');
            // Refresh ledger
            if (selectedShop) {
                const res = await api().get(`/api/shops/${selectedShop.id}/ledger?limit=20&skip=0`);
                setLedgerData(res.data);
            }
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Approval failed', 'error');
        }
    };

    const handleReject = async (txId: number, reason: string) => {
        try {
            await api().post(`/api/shops/transactions/${txId}/reject`, { reason });
            showToast('Transaction rejected', 'info');
            // Refresh ledger
            if (selectedShop) {
                const res = await api().get(`/api/shops/${selectedShop.id}/ledger?limit=20&skip=0`);
                setLedgerData(res.data);
            }
            if (onSuccess) onSuccess();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Rejection failed', 'error');
        }
    };

    return {
        selectedShop, setSelectedShop,
        showLedger, setShowLedger, ledgerData, loadingLedger, ledgerHasMore, fetchLedger, loadMoreLedger,
        showAdjustModal, setShowAdjustModal, adjData, setAdjData, submittingAdj, handleAdjustment,
        showPaymentModal, setShowPaymentModal, paymentData, setPaymentData, submittingPayment, handleCollectPayment,
        handleApprove, handleReject
    };
};
