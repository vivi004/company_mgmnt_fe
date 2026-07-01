import { useState, useEffect } from 'react';
import { getAllProducts, getCartItems } from '../../../constants/productData';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast } from '../../../components/Toast';
import { previewBill as generatePreviewPDF, downloadStaffDataPdf } from '../../../utils/invoiceGenerator';
import { printLoadingSheet } from '../../../utils/loadingSheetGenerator';
import UnifiedOrderingView from '../ShopManager/UnifiedOrderingView';
import ReviewOrder from '../ReviewOrder/ReviewOrder';

interface Bill {
    id: number;
    shopName: string;
    villageName: string;
    areaName?: string;
    specificArea?: string;
    cart: Record<string, number>;
    customRates?: Record<string, number>;
    date: string;
    deliveryDate?: string;
    invoiceNo: number;
    createdBy?: string;
    phone?: string;
    phone2?: string;
    isEditedPrice?: boolean;
    isEditedQty?: boolean;
    isEditedDate?: boolean;
    originalCart?: Record<string, number>;
    originalDeliveryDate?: string;
    old_balance?: number;
    oldBalance?: number;
}

interface Props {
    theme: string;
    type: 'admin' | 'staff';
    userProfileName?: string; // Required for staff type
    onUnverifiedCountChange?: (count: number) => void;
    userRole?: string;
}

const BillCheck = ({ theme, type, userProfileName, onUnverifiedCountChange, userRole }: Props) => {
    const isDark = theme === 'dark';
    const isAdmin = type === 'admin';
    const [unverifiedBills, setUnverifiedBills] = useState<Bill[]>([]);
    const { showToast } = useToast();
    const api = () => getAuthAxios();

    const getTodayLocal = () => {
        const d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    };

    // Edit Modal State
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editCart, setEditCart] = useState<Record<string, number>>({});
    const [editRates, setEditRates] = useState<Record<string, number>>({});
    const [editDeliveryDate, setEditDeliveryDate] = useState<string>('');
    const [listSearchQuery, setListSearchQuery] = useState('');
    const [showReview, setShowReview] = useState(false);
    const [isEditedPrice, setIsEditedPrice] = useState(false);

    useEffect(() => {
        loadUnverifiedBills();
    }, [userProfileName, type]);

    const filteredUnverified = unverifiedBills.filter(b => {
        if (!listSearchQuery.trim()) return true;
        const query = listSearchQuery.toLowerCase().trim();
        return (
            b.shopName.toLowerCase().includes(query) ||
            b.villageName.toLowerCase().includes(query) ||
            b.invoiceNo.toString().includes(query) ||
            (b.createdBy || '').toLowerCase().includes(query) ||
            (b.specificArea || '').toLowerCase().includes(query)
        );
    });

    const loadUnverifiedBills = async () => {
        try {
            const res = await api().get('/api/bills/unverified');
            let data = res.data;

            if (type === 'staff' && userProfileName) {
                data = data.filter((b: any) => (b.created_by || b.createdBy) === userProfileName);
            }

            const mapped = data.map((b: any) => ({
                id: b.id,
                shopName: b.shop_name || b.shopName,
                villageName: b.village_name || b.villageName,
                areaName: b.area_name || b.areaName || '',
                specificArea: b.specific_area || b.specificArea || '',
                cart: b.cart,
                customRates: (() => {
                    const raw = b.custom_rates || b.customRates || {};
                    const cleaned: Record<string, number> = {};
                    for (const key of Object.keys(raw)) {
                        if (!key.endsWith('_box') && !key.endsWith('_ltr') && !key.endsWith('_box_wl') && !key.endsWith('_ltr_wl')) cleaned[key] = raw[key];
                    }
                    return cleaned;
                })(),
                date: b.bill_date || b.date,
                deliveryDate: b.delivery_date || b.deliveryDate || b.bill_date || b.date,
                invoiceNo: b.invoice_no || b.invoiceNo,
                createdBy: b.created_by || b.createdBy,
                phone: b.phone || '',
                phone2: b.phone2 || '',
                isEditedPrice: Boolean(b.is_edited_price || b.isEditedPrice),
                isEditedQty: Boolean(b.is_edited_qty || b.isEditedQty),
                isEditedDate: Boolean(b.is_edited_date || b.isEditedDate),
                originalCart: (() => {
                    const raw = b.original_cart || b.originalCart || b.cart || {};
                    const cleaned: Record<string, number> = {};
                    for (const key of Object.keys(raw)) {
                        cleaned[key] = raw[key];
                    }
                    return cleaned;
                })(),
                originalDeliveryDate: b.original_delivery_date || b.originalDeliveryDate || b.delivery_date || b.deliveryDate || b.bill_date || b.date,
                old_balance: b.old_balance ?? b.oldBalance ?? 0,
                oldBalance: b.old_balance ?? b.oldBalance ?? 0
            }));
            setUnverifiedBills(mapped);
            if (onUnverifiedCountChange) {
                onUnverifiedCountChange(mapped.length);
            }

            const legacyBills = mapped.filter((b: any) => Object.keys(b.customRates).length === 0 && Object.keys(b.cart).length > 0);
            if (legacyBills.length > 0) {
                import('../../../constants/productData').then(({ getAllProducts }) => {
                    const currentProducts = getAllProducts();
                    legacyBills.forEach(async (bill: any) => {
                        const legacyRates: Record<string, number> = {};
                        currentProducts.forEach(p => {
                            if (p.id.endsWith('_box') || p.id.endsWith('_ltr') || p.id.endsWith('_box_wl') || p.id.endsWith('_ltr_wl')) return;
                            if (bill.cart[p.id] || bill.cart[`${p.id}_box`] || bill.cart[`${p.id}_ltr`] ||
                                bill.cart[`${p.id}_wl`] || bill.cart[`${p.id}_box_wl`] || bill.cart[`${p.id}_ltr_wl`]) {
                                legacyRates[p.id] = p.price;
                            }
                        });
                        try {
                            await api().put(`/api/bills/${bill.id}`, { cart: bill.cart, custom_rates: legacyRates });
                        } catch (e) {
                            console.error('Failed to seal legacy unverified bill:', bill.id);
                        }
                    });
                });
            }

        } catch {
            showToast(isAdmin ? 'Failed to load unverified bills' : 'Failed to load pending bills', 'error');
        }
    };


    const getTotal = (cart: Record<string, number>, customRates?: Record<string, number>) =>
        getCartItems(cart, customRates).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const getItemCount = (cart: Record<string, number>) =>
        getCartItems(cart).reduce((sum, item) => sum + item.quantity, 0);

    const handleVerify = async (bill: Bill) => {
        if (!window.confirm('Verify and push this bill to the primary ledger?')) return;

        try {
            await api().put(`/api/bills/verify/${bill.id}`);
            showToast('Bill verified and moved to primary ledger!', 'success');
            loadUnverifiedBills();
        } catch {
            showToast('Failed to verify bill', 'error');
        }
    };

    const handleVerifyBatch = async (bills: Bill[], label: string) => {
        if (bills.length === 0) return;
        if (!window.confirm(`Verify ALL ${bills.length} bills for ${label} and push them to the primary ledger?`)) return;

        try {
            const billIds = bills.map(b => b.id);
            await api().put('/api/bills/verify/batch', { ids: billIds });
            showToast(`All ${bills.length} bills for ${label} verified successfully!`, 'success');
        } catch {
            showToast('Failed to verify batch bills', 'error');
        } finally {
            loadUnverifiedBills();
        }
    };

    const handleRejectBatch = async (bills: Bill[], label: string) => {
        if (bills.length === 0) return;
        if (!window.confirm(`Are you sure you want to permanently discard ALL ${bills.length} unverified bills for ${label}?`)) return;

        let success = 0;
        let failed = 0;
        for (const bill of bills) {
            try {
                await api().delete(`/api/bills/${bill.id}`);
                success++;
            } catch {
                failed++;
            }
        }
        showToast(`${success} bills discarded${failed > 0 ? `, ${failed} failed` : ''}`, success > 0 ? 'info' : 'error');
        loadUnverifiedBills();
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('Are you sure you want to permanently discard this unverified bill?')) return;
        try {
            await api().delete(`/api/bills/${id}`);
            showToast('Bill discarded', 'info');
            loadUnverifiedBills();
        } catch {
            showToast('Failed to discard bill', 'error');
        }
    };

    const previewBill = (bill: Bill) => {
        // Use the master invoice generator so all layouts are 100% consistent everywhere
        generatePreviewPDF(bill as any, '');
    };

    const updateQuantity = (id: string, delta: number) => {
        setEditCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const newCart = { ...prev };
                delete newCart[id];
                return newCart;
            }
            return { ...prev, [id]: next };
        });
    };

    const updateRate = (id: string, rate: number) => {
        setEditRates(prev => {
            const next = { ...prev };
            const p = getAllProducts().find(x => x.id === id);
            if (rate === 0 || (p && rate === p.price)) {
                delete next[id];
            } else {
                next[id] = rate;
            }
            // Flush variants so they recalculate from the new base rate
            delete next[`${id}_box`];
            delete next[`${id}_ltr`];
            delete next[`${id}_box_wl`];
            delete next[`${id}_ltr_wl`];
            return next;
        });
    };

    const openEditModal = (bill: Bill) => {
        setEditingBill(bill);
        setEditCart({ ...bill.cart });
        setEditRates({ ...(bill.customRates || {}) });
        
        // Handle both ISO (T) and MySQL (space) formats
        const d = bill.deliveryDate || bill.date || '';
        const datePart = d.includes('T') ? d.split('T')[0] : d.split(' ')[0];
        setEditDeliveryDate(datePart);
        setShowReview(false);
        setIsEditedPrice(false);
    };

    const handleSaveEdit = async () => {
        if (!editingBill) return;
        const finalCart: Record<string, number> = {};
        for (const [id, qty] of Object.entries(editCart)) {
            if (qty > 0) finalCart[id] = qty;
        }

        const finalRates = { ...editRates };
        getAllProducts().forEach(p => {
            if (p.id.endsWith('_box') || p.id.endsWith('_ltr') || p.id.endsWith('_box_wl') || p.id.endsWith('_ltr_wl')) return;
            if (finalCart[p.id] || finalCart[`${p.id}_box`] || finalCart[`${p.id}_ltr`] ||
                finalCart[`${p.id}_wl`] || finalCart[`${p.id}_box_wl`] || finalCart[`${p.id}_ltr_wl`]) {
                finalRates[p.id] = editRates[p.id] ?? p.price;
            }
        });

        try {
            const totalAmount = getTotal(finalCart, finalRates);
            const finalDeliveryDate = editDeliveryDate || editingBill.deliveryDate;

            // 1. Detect if any price was changed during this edit session
            const originalRates = editingBill.customRates || {};
            const allRateKeys = new Set([...Object.keys(originalRates), ...Object.keys(finalRates)]);
            let ratesChanged = false;
            for (const key of allRateKeys) {
                if ((originalRates[key] ?? undefined) !== (finalRates[key] ?? undefined)) {
                    ratesChanged = true;
                    break;
                }
            }
            const hasEditedPrice = ratesChanged || isEditedPrice || Boolean(editingBill.isEditedPrice);

            // 2. Detect if quantities changed from the original bill
            const originalCart = editingBill.originalCart || editingBill.cart || {};
            const allCartKeys = new Set([...Object.keys(originalCart), ...Object.keys(finalCart)]);
            let hasEditedQty = false;
            for (const key of allCartKeys) {
                if ((originalCart[key] || 0) !== (finalCart[key] || 0)) {
                    hasEditedQty = true;
                    break;
                }
            }

            // 3. Detect if delivery date changed from the original bill
            const originalDateStr = (() => {
                const d = editingBill.originalDeliveryDate || editingBill.deliveryDate || editingBill.date || '';
                return d.includes('T') ? d.split('T')[0] : d.split(' ')[0];
            })();
            const newDateStr = finalDeliveryDate ? (finalDeliveryDate.includes('T') ? finalDeliveryDate.split('T')[0] : finalDeliveryDate.split(' ')[0]) : '';
            const hasEditedDate = (originalDateStr !== newDateStr);

            await api().put(`/api/bills/${editingBill.id}`, { 
                cart: finalCart, 
                custom_rates: finalRates,
                total_amount: totalAmount,
                delivery_date: finalDeliveryDate,
                is_edited_price: hasEditedPrice,
                is_edited_qty: hasEditedQty,
                is_edited_date: hasEditedDate,
                created_by: (() => {
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    return storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : (isAdmin ? 'Admin' : 'Staff');
                })()
            });
            showToast('Bill updated successfully', 'success');
            setEditingBill(null);
            setShowReview(false);
            loadUnverifiedBills();
        } catch {
            showToast('Failed to update bill', 'error');
        }
    };

    const groupedBills = filteredUnverified.reduce((acc, bill) => {
        const creator = bill.createdBy || 'Admin';
        if (!acc[creator]) acc[creator] = [];
        acc[creator].push(bill);
        return acc;
    }, {} as Record<string, Bill[]>);

    if (editingBill) {
        if (showReview) {
            return (
                <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                    <ReviewOrder
                        shopName={editingBill.shopName}
                        villageName={editingBill.villageName}
                        theme={theme}
                        cart={editCart}
                        updateQuantity={updateQuantity}
                        onBack={() => setShowReview(false)}
                        onPlaceOrder={handleSaveEdit}
                        type={type}
                        deliveryDate={editDeliveryDate}
                        onDeliveryDateChange={setEditDeliveryDate}
                        customRates={editRates}
                    />
                </div>
            );
        }

        return (
            <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <UnifiedOrderingView
                    shopName={editingBill.shopName}
                    theme={theme}
                    cart={editCart}
                    rates={editRates}
                    updateQuantity={updateQuantity}
                    updateRate={updateRate}
                    onBack={() => setEditingBill(null)}
                    onReviewOrder={(edited) => {
                        setIsEditedPrice(edited);
                        setShowReview(true);
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div>
                    <h2 className={`text-2xl sm:text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isAdmin ? 'Bill Verifications' : 'My Pending Bills'}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
                        {isAdmin ? 'Pending Orders Awaiting Approval' : 'Orders awaiting Admin/Manager verification'}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search Bar */}
                    <div className="relative group w-full sm:w-64">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search pending..."
                            value={listSearchQuery}
                            onChange={(e) => setListSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border outline-none
                                ${isDark 
                                    ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500/50' 
                                    : 'bg-white border-slate-200 text-slate-900 shadow-sm focus:border-blue-500/50'}`}
                        />
                    </div>

                    <div className={`px-3 sm:px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border
                        ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {filteredUnverified.length} {isAdmin ? 'Pending' : 'In Queue'}
                    </div>
                    {filteredUnverified.length > 0 && (
                        <>
                            <button
                                onClick={() => downloadStaffDataPdf(filteredUnverified, 'ALL UNVERIFIED')}
                                className="px-4 sm:px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-amber-600/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Data
                            </button>
                            <button
                                onClick={() => printLoadingSheet(filteredUnverified, getTodayLocal(), '', userRole?.toLowerCase() === 'player')}
                                className="px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Loading Sheet
                            </button>
                        </>
                    )}
                    {unverifiedBills.length > 0 && userRole?.toLowerCase() !== 'player' && userRole?.toLowerCase() !== 'viewer' && (
                        <button
                            onClick={() => handleVerifyBatch(unverifiedBills, 'ALL STAFF')}
                            className="px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            ✓ Verify All
                        </button>
                    )}
                </div>
            </div>
            {unverifiedBills.length === 0 ? (
                <div className={`py-16 sm:py-20 text-center rounded-[28px] sm:rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-4xl sm:text-5xl mb-4 opacity-50">{isAdmin ? '📋' : '🕒'}</div>
                    <p className={`font-black text-lg sm:text-xl italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isAdmin ? 'No bills awaiting verification' : 'No bills in queue'}
                    </p>
                    {!isAdmin && <p className="text-slate-500 mt-2 text-sm font-bold px-4">Your submitted orders will appear here until verified.</p>}
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedBills).map(([staffName, staffBills]) => (
                        <div key={staffName} className="space-y-6">
                            {isAdmin && (
                                <div className="flex flex-wrap items-center gap-4 px-2">
                                    <div className="h-px flex-grow bg-slate-200 dark:bg-white/10" />
                                    <h3 className={`text-lg sm:text-xl font-black italic tracking-tight uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {staffName}'s Bills
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => downloadStaffDataPdf(staffBills, staffName)}
                                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all border border-amber-500/20 flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Data
                                        </button>
                                        <button
                                            onClick={() => printLoadingSheet(staffBills, getTodayLocal(), '', userRole?.toLowerCase() === 'player')}
                                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all border border-emerald-500/20 flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Loading Sheet
                                        </button>
                                        {userRole?.toLowerCase() !== 'player' && userRole?.toLowerCase() !== 'viewer' && (
                                            <>
                                                <button
                                                    onClick={() => handleRejectBatch(staffBills, staffName)}
                                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all border border-red-500/20"
                                                >
                                                    Reject All
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyBatch(staffBills, staffName)}
                                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all border border-emerald-500/20"
                                                >
                                                    Verify All
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="h-px flex-grow bg-slate-200 dark:bg-white/10" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4">
                                {staffBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(bill => {
                                    const isPlayer = userRole?.toLowerCase() === 'player';
                                    return (
                                        <div key={bill.id}
                                            className={`border transition-all 
                                             ${isPlayer ? 'p-3 sm:p-4 rounded-[20px]' : 'p-4 sm:p-6 rounded-[20px] sm:rounded-[30px]'}
                                             ${isAdmin
                                                    ? (isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50')
                                                    : (isDark ? 'bg-slate-900 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-amber-50/50 border-amber-200 shadow-xl shadow-amber-500/10')
                                                }`}>

                                            {/* Shop Name + Invoice */}
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <p className={`font-black tracking-tight text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {bill.shopName} {bill.createdBy && <span className="text-xs font-normal text-slate-500 normal-case ml-1">({bill.createdBy})</span>}
                                                </p>
                                                <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                    INV-{bill.invoiceNo}
                                                </span>
                                                {bill.isEditedPrice && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Edited Price</span>
                                                )}
                                                {bill.isEditedQty && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Edited Qty</span>
                                                )}
                                                {bill.isEditedDate && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">Edited Date</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{bill.villageName}</p>

                                            {!isPlayer && (
                                                <>
                                                    {/* Status / Created By / Delivery Date */}
                                                    <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                                                        <div>
                                                            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isAdmin ? 'text-slate-400' : 'text-amber-500'}`}>
                                                                {isAdmin ? 'Generated By' : 'Status'}
                                                            </p>
                                                            <p className={`text-sm font-black italic tracking-tighter ${isAdmin ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                                                                {isAdmin ? (bill.createdBy || 'Unknown') : 'AWAITING VERIFICATION'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-0.5">Delivery Date</p>
                                                            <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                                {new Date(bill.deliveryDate || bill.date).toLocaleDateString('en-IN', {
                                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                                    timeZone: 'Asia/Kolkata'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="hidden sm:block">
                                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Order Time</p>
                                                            <p className="text-sm font-semibold text-slate-500">
                                                                {new Date(bill.date).toLocaleString('en-IN', {
                                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit',
                                                                    timeZone: 'Asia/Kolkata'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Financials Row */}
                                                    <div className="flex items-center justify-between mt-4 gap-4">
                                                        <div>
                                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Total Items</p>
                                                            <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                {getItemCount(bill.cart)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Total Value</p>
                                                            <p className={`text-xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                ₹{getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Action Buttons */}
                                            <div className={`flex flex-wrap items-center justify-end gap-2 sm:gap-3
                                                 ${isPlayer ? 'mt-2' : `mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dashed ${isAdmin ? (isDark ? 'border-white/10' : 'border-slate-200') : (isDark ? 'border-white/10' : 'border-amber-200')}`}`}>
                                                <button
                                                    onClick={() => {
                                                        const billDateStr = bill.deliveryDate || bill.date;
                                                        const datePart = billDateStr.includes('T') ? billDateStr.split('T')[0] : billDateStr.split(' ')[0];
                                                        printLoadingSheet([bill], datePart, '', userRole?.toLowerCase() === 'player');
                                                    }}
                                                    className={`p-2 sm:p-2.5 rounded-xl transition-all border shrink-0
                                                         ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-600 shadow-sm hover:border-emerald-400 hover:bg-emerald-50'}`}
                                                    title="Loading Sheet"
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => previewBill(bill)}
                                                    className={`p-2 sm:p-2.5 rounded-xl transition-all border shrink-0
                                                         ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-400'}`}
                                                    title="Preview PDF"
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                {!isPlayer && userRole?.toLowerCase() !== 'viewer' && (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(bill)}
                                                            className={`p-2 sm:p-2.5 rounded-xl transition-all border shrink-0
                                                                 ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm hover:border-blue-400 hover:bg-blue-50'}`}
                                                            title="Edit Bill"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(bill.id)}
                                                            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                                                        >
                                                            Reject / Discard
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(bill)}
                                                            className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
                                                        >
                                                            Verify Bill ✓
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
};

export default BillCheck;
