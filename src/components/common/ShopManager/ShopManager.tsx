import { useState, useEffect } from 'react';
import { useShopActions } from '../../../hooks/useShopActions';
import ShopActionModals from '../ShopModals/ShopActionModals';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import Bills from '../Billpage/Bills';
import ReviewOrder from '../ReviewOrder/ReviewOrder';
import { getAllProducts, getCartItems } from '../../../constants/productData';
import UnifiedOrderingView from './UnifiedOrderingView';

interface Shop {
    id: number;
    order_line_id: number;
    shop_name: string;
    village_name: string;
    owner_name: string;
    shop_owner: string;
    phone: string;
    phone2: string;
    balance: number;
    parent_shop_id?: number | null;
    has_order_today?: boolean;
    last_order_time?: string;
}

interface Props {
    orderLineId: number;
    villageName: string;
    theme: string;
    onBack: () => void;
    type: 'admin' | 'staff';
    handleRefreshInvoiceSettings?: () => Promise<void>;
    setOrderLines?: React.Dispatch<React.SetStateAction<any[]>>;
    fetchOrderLines?: () => Promise<void>;
}

const ShopManager = ({ orderLineId, villageName, theme, onBack, type, handleRefreshInvoiceSettings, setOrderLines, fetchOrderLines }: Props) => {
    const isAdmin = type === 'admin';
    const isDark = theme === 'dark';
    const primaryColor = isAdmin ? 'blue' : 'emerald';

    const [shops, setShops] = useState<Shop[]>([]);
    const [allShops, setAllShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [formData, setFormData] = useState({ shop_name: '', owner_name: '', shop_owner: '', phone: '', phone2: '', balance: '', parent_shop_id: '' as string | number });
    const { toasts, showToast, removeToast } = useToast();
    const [shopSearch, setShopSearch] = useState('');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [showReview, setShowReview] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [currentBillId, setCurrentBillId] = useState<number | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<number>(0);
    const [currentRates, setCurrentRates] = useState<Record<string, number>>({});
    const [isEditedPrice, setIsEditedPrice] = useState(false);

    const {
        selectedShop, setSelectedShop,
        showLedger, setShowLedger, ledgerData, loadingLedger, ledgerHasMore, fetchLedger, loadMoreLedger,
        showAdjustModal, setShowAdjustModal, adjData, setAdjData, submittingAdj, handleAdjustment,
        showPaymentModal, setShowPaymentModal, paymentData, setPaymentData, submittingPayment, handleCollectPayment,
        handleApprove, handleReject
    } = useShopActions(
        showToast, 
        () => {
            fetchShops();
            if (fetchOrderLines) fetchOrderLines();
        },
        undefined,
        (delta: number) => {
            if (setOrderLines) {
                setOrderLines((prev: any[]) => prev.map((ol: any) => ol.id === orderLineId ? { ...ol, total_balance: (parseFloat(String(ol.total_balance)) || 0) + delta } : ol));
            }
        }
    );

    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [submittingShop, setSubmittingShop] = useState(false);

    // Delivery Date (default = tomorrow)
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD local format
    });

    // Filtering & Sorting
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'balance' | 'status'>('status');


    const api = () => getAuthAxios();

    useEffect(() => {
        fetchShops();
    }, [orderLineId]);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const res = await api().get(`/api/shops/by-village/${orderLineId}`);
            // Normalize MySQL 0/1 to boolean for consistent UI behavior
            const normalized = res.data.map((s: any) => ({
                ...s,
                has_order_today: !!s.has_order_today
            }));
            setShops(normalized);
        } catch {
            showToast('Failed to load shops', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedShop) {
            setCart({});
            setCurrentRates({});
            setShowReview(false);
            setShowBill(false);
            setCurrentBillId(null);
            setIsEditedPrice(false);
        }
    }, [selectedShop]);


    const updateRate = (id: string, rate: number) => {
        setCurrentRates(prev => {
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
            return next;
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
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

    const handlePlaceOrder = async () => {
        if (submittingOrder) return;
        setSubmittingOrder(true);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const createdBy = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : (isAdmin ? 'Admin' : 'Staff');

        // Snapshot final rates for this bill
        const finalRates: Record<string, number> = {};
        getAllProducts().forEach(p => {
            // Skip variant products from snapshotting; they derive prices dynamically
            if (p.id.endsWith('_box') || p.id.endsWith('_ltr')) return;

            if (cart[p.id] || cart[`${p.id}_box`] || cart[`${p.id}_ltr`]) {
                finalRates[p.id] = currentRates[p.id] ?? p.price;
            }
        });

        const cartItemsForTotal = getCartItems(cart, currentRates);
        const totalPrice = cartItemsForTotal.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const billPayload = {
            shop_id: selectedShop!.id,
            shop_name: selectedShop!.shop_name,
            village_name: villageName,
            cart: cart,
            custom_rates: finalRates,
            created_by: createdBy,
            bill_date: new Date().toISOString(),
            delivery_date: deliveryDate,
            status: 'Unverified',
            total_amount: totalPrice,
            is_edited_price: isEditedPrice
        };

        try {
            if (currentBillId) {
                const res = await api().put(`/api/bills/${currentBillId}`, {
                    cart,
                    custom_rates: finalRates,
                    delivery_date: deliveryDate,
                    total_amount: totalPrice,
                    is_edited_price: isEditedPrice
                });
                if (res.data.invoice_no) setInvoiceNo(res.data.invoice_no);
                showToast('Order updated!', 'success');
            } else {
                const res = await api().post('/api/bills', billPayload);
                setCurrentBillId(res.data.id);
                setInvoiceNo(res.data.invoice_no);
                showToast(isAdmin ? 'Order placed successfully!' : 'Order submitted for verification!', 'success');
                if (handleRefreshInvoiceSettings) handleRefreshInvoiceSettings();
            }
            setShowReview(false);
            setShowBill(true);
            fetchShops(); // Refresh the list so the progress bar updates immediately
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to place order', 'error');
        } finally {
            setSubmittingOrder(false);
        }
    };

    const fetchAllShopsList = async () => {
        try {
            const res = await api().get('/api/shops?limit=2000');
            setAllShops(res.data);
        } catch (err) {
            console.error('Failed to fetch all shops:', err);
        }
    };

    const openAdd = () => {
        setEditingShop(null);
        setFormData({ shop_name: '', owner_name: '', shop_owner: '', phone: '', phone2: '', balance: '', parent_shop_id: '' });
        fetchAllShopsList();
        setShowModal(true);
    };

    const openEdit = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            shop_name: shop.shop_name,
            owner_name: shop.owner_name,
            shop_owner: shop.shop_owner || '',
            phone: shop.phone,
            phone2: shop.phone2 || '',
            balance: shop.balance.toString(),
            parent_shop_id: shop.parent_shop_id ? shop.parent_shop_id.toString() : ''
        });
        fetchAllShopsList();
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingShop) return;
        setSubmittingShop(true);
        const payload = {
            order_line_id: orderLineId,
            shop_name: formData.shop_name,
            village_name: villageName,
            owner_name: formData.owner_name,
            shop_owner: formData.shop_owner,
            phone: formData.phone,
            phone2: formData.phone2,
            balance: parseFloat(formData.balance) || 0,
            parent_shop_id: formData.parent_shop_id ? parseInt(String(formData.parent_shop_id)) : null,
            created_by: (() => {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                return storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : (isAdmin ? 'Admin' : 'Staff');
            })()
        };

        const originalShops = [...shops];

        try {
            // Close the modal instantly
            setShowModal(false);

            if (isAdmin && editingShop) {
                // Calculate balance difference
                const oldBalance = parseFloat(String(editingShop.balance)) || 0;
                const newBalance = parseFloat(formData.balance) || 0;
                const diff = newBalance - oldBalance;

                // Optimistically update the edited shop in local state
                setShops(prev => prev.map(s => s.id === editingShop.id ? { ...s, ...payload, balance: newBalance } : s));

                // Optimistically update parent orderLines balance
                if (setOrderLines) {
                    setOrderLines((prev: any[]) => prev.map((ol: any) => ol.id === orderLineId ? { ...ol, total_balance: (parseFloat(String(ol.total_balance)) || 0) + diff } : ol));
                }

                showToast('Shop updated!', 'success');
                await api().put(`/api/shops/${editingShop.id}`, payload);
            } else {
                const newBalance = parseFloat(formData.balance) || 0;

                // Optimistically add the new shop with a temporary negative ID
                const tempId = -Date.now();
                const newShopOpt = {
                    id: tempId,
                    ...payload,
                    balance: newBalance,
                    has_order_today: false
                };
                setShops(prev => [...prev, newShopOpt]);

                // Optimistically update parent orderLines balance and shop count
                if (setOrderLines) {
                    setOrderLines((prev: any[]) => prev.map((ol: any) => ol.id === orderLineId ? { ...ol, total_balance: (parseFloat(String(ol.total_balance)) || 0) + newBalance, shop_count: (ol.shop_count || 0) + 1 } : ol));
                }

                showToast('Shop added!', 'success');
                await api().post('/api/shops', payload);
            }

            // Silent background refresh (without setting fullscreen loading spinner)
            const res = await api().get(`/api/shops/by-village/${orderLineId}`);
            const normalized = res.data.map((s: any) => ({
                ...s,
                has_order_today: !!s.has_order_today
            }));
            setShops(normalized);
            
            // Trigger background dashboard fetch to sync
            if (fetchOrderLines) fetchOrderLines();
        } catch (err: any) {
            // Rollback on failure
            setShops(originalShops);
            if (fetchOrderLines) fetchOrderLines();
            showToast(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save', 'error');
        } finally {
            setSubmittingShop(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) {
            if (!window.confirm('Request to delete this shop?')) return;
            showToast('Deletion requested — contact admin for approval.', 'info');
            return;
        }

        if (!window.confirm('Delete this shop?')) return;

        const shopToDelete = shops.find(s => s.id === id);
        const shopBalance = shopToDelete ? (parseFloat(String(shopToDelete.balance)) || 0) : 0;
        const originalShops = [...shops];

        // Optimistic delete
        setShops(prev => prev.filter(s => s.id !== id));
        if (setOrderLines) {
            setOrderLines((prev: any[]) => prev.map((ol: any) => ol.id === orderLineId ? { ...ol, total_balance: Math.max(0, (parseFloat(String(ol.total_balance)) || 0) - shopBalance), shop_count: Math.max(0, (ol.shop_count || 0) - 1) } : ol));
        }

        try {
            await api().delete(`/api/shops/${id}`);
            showToast('Shop deleted', 'success');
            fetchShops();
            if (fetchOrderLines) fetchOrderLines();
        } catch {
            showToast('Failed to delete shop', 'error');
            setShops(originalShops);
            if (fetchOrderLines) fetchOrderLines();
        }
    };

    const getDisplayShopName = (shop: any) => {
        if (!shop) return '';
        const isDup = shops.filter(s => s.shop_name.trim().toLowerCase() === shop.shop_name.trim().toLowerCase()).length > 1;
        return isDup && shop.owner_name ? `${shop.shop_name} (${shop.owner_name})` : shop.shop_name;
    };

    // Sub-view rendering
    if (selectedShop && showBill) {
        // If currentBillId exists, look up the snapshot rates from the API/context if possible,
        // but since we just placed the order, we can snapshot the current cart rates here for the immediate display view.
        return (
            <Bills
                shopName={getDisplayShopName(selectedShop)}
                villageName={villageName}
                theme={theme}
                invoiceNo={invoiceNo}
                cart={cart}
                customRates={currentRates}
                onNewOrder={() => {
                    setCart({});
                    setShowBill(false);
                    setShowReview(false);
                    setSelectedShop(null);
                    setCurrentBillId(null);
                    setInvoiceNo(0);
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDeliveryDate(d.toISOString().split('T')[0]);
                }}
                onEditOrder={() => {
                    setShowBill(false);
                    setShowReview(false);
                }}
                type={type}
                deliveryDate={new Date(deliveryDate + 'T00:00:00').toISOString()}
                specificArea={selectedShop.owner_name}
            />
        );
    }

    if (selectedShop && showReview) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <ReviewOrder
                    shopName={getDisplayShopName(selectedShop)}
                    villageName={villageName}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setShowReview(false)}
                    onPlaceOrder={handlePlaceOrder}
                    type={type}
                    deliveryDate={deliveryDate}
                    onDeliveryDateChange={setDeliveryDate}
                    customRates={currentRates}
                    isSubmitting={submittingOrder}
                />
            </>
        );
    }

    if (selectedShop && !showLedger && !showPaymentModal && !showAdjustModal) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <UnifiedOrderingView
                    shopName={getDisplayShopName(selectedShop)}
                    theme={theme}
                    cart={cart}
                    rates={currentRates}
                    updateQuantity={updateQuantity}
                    updateRate={updateRate}
                    onBack={() => setSelectedShop(null)}
                    onReviewOrder={(edited) => {
                        setIsEditedPrice(edited);
                        setShowReview(true);
                    }}
                />
            </>
        );
    }

    return (
        <div className={`space-y-8 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={onBack}
                        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border font-black transition-all hover:-translate-x-1
                            ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-md'}`}
                    >
                        ←
                    </button>
                    <div className="min-w-0">
                        <h2 className={`text-2xl sm:text-3xl font-black italic tracking-tighter truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Select Shop
                        </h2>
                        <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1 truncate">
                            Area: <span className={`text-${primaryColor}-400 font-black`}>{villageName}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className={`flex-1 sm:flex-initial px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border text-center
                        ${isDark ? `bg-${primaryColor}-500/10 text-${primaryColor}-400 border-${primaryColor}-500/20` : `bg-${primaryColor}-50 text-${primaryColor}-600 border-${primaryColor}-100`}`}>
                        {shops.length} Shops
                    </div>
                    <button
                        onClick={openAdd}
                        className={`flex-1 sm:flex-initial px-6 py-3 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg shadow-${primaryColor}-600/20 hover:-translate-y-0.5 active:scale-95`}
                    >
                        + Add Shop
                    </button>
                </div>
            </div>

            {/* Daily Progress Dashboard */}
            {!loading && shops.length > 0 && (
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Route Progress</p>
                            <h3 className="text-xl sm:text-2xl font-black italic tracking-tighter mt-1">
                                {shops.filter(s => s.has_order_today).length} / {shops.length} Shops Completed
                            </h3>
                        </div>
                        <div className={`self-start xs:self-auto px-3.5 py-1.5 rounded-xl text-xs font-black border
                            ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {Math.round((shops.filter(s => s.has_order_today).length / shops.length) * 100)}% Done
                        </div>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                            style={{ width: `${(shops.filter(s => s.has_order_today).length / shops.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Filters and Search Bar Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="relative w-full lg:flex-1 min-w-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search shops..."
                        value={shopSearch}
                        onChange={e => setShopSearch(e.target.value)}
                        className={`w-full pl-11 sm:pl-14 pr-10 py-3.5 sm:py-4 rounded-[20px] font-bold text-xs sm:text-sm border transition-all focus:outline-none focus:ring-4
                            ${isDark ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-600/10 focus:border-blue-600 shadow-lg shadow-slate-200/30'}`}
                    />
                    {shopSearch && (
                        <button onClick={() => setShopSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                <div className={`p-1 rounded-2xl border flex flex-wrap items-center gap-1 w-full lg:w-auto
                    ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/30'}`}>
                    {(['all', 'pending', 'completed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 sm:flex-initial px-3 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                ${filterStatus === status
                                    ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20')
                                    : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="truncate">{status}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${filterStatus === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {status === 'all' ? shops.length :
                                    status === 'pending' ? shops.filter(s => !s.has_order_today).length :
                                        shops.filter(s => s.has_order_today).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className={`p-1 rounded-2xl border flex flex-wrap items-center gap-1 w-full lg:w-auto
                    ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/30'}`}>
                    {(['name', 'balance', 'status'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSortBy(s)}
                            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all
                                ${sortBy === s
                                    ? (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20')
                                    : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shop Cards Grid */}
            {(() => {
                let result = [...shops];

                // Search Filter
                if (shopSearch.trim()) {
                    result = result.filter(s =>
                        s.shop_name.toLowerCase().includes(shopSearch.toLowerCase()) ||
                        (s.owner_name && s.owner_name.toLowerCase().includes(shopSearch.toLowerCase())) ||
                        (s.shop_owner && s.shop_owner.toLowerCase().includes(shopSearch.toLowerCase())) ||
                        (s.phone && s.phone.includes(shopSearch)) ||
                        (s.phone2 && s.phone2.includes(shopSearch))
                    );
                }

                // Status Filter
                if (filterStatus === 'pending') {
                    result = result.filter(s => !s.has_order_today);
                } else if (filterStatus === 'completed') {
                    result = result.filter(s => s.has_order_today);
                }

                // Sorting
                result.sort((a, b) => {
                    if (sortBy === 'balance') return b.balance - a.balance;
                    if (sortBy === 'status') {
                        if (a.has_order_today === b.has_order_today) return a.shop_name.localeCompare(b.shop_name);
                        return a.has_order_today ? 1 : -1;
                    }
                    return a.shop_name.localeCompare(b.shop_name);
                });

                const filteredShops = result;

                return loading ? (
                    <div className={`py-20 text-center text-${primaryColor}-500 font-black italic uppercase tracking-widest animate-pulse`}>
                        {isAdmin ? 'Loading shops...' : 'Syncing Shop Data...'}
                    </div>
                ) : filteredShops.length === 0 ? (
                    <div className={`py-20 text-center rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                        <div className="text-5xl mb-4">{shopSearch ? '🔍' : '🏪'}</div>
                        <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{shopSearch ? `No shops matching "${shopSearch}"` : `No shops in ${villageName}`}</p>
                        <p className="text-slate-500 mt-2 font-medium">{shopSearch ? 'Try a different search term' : 'Click "+ Add Shop" to get started'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredShops.map((shop) => (
                            <div
                                key={shop.id}
                                onClick={() => setSelectedShop(shop)}
                                className={`flex flex-col justify-between p-5 sm:p-6 rounded-[28px] border group transition-all hover:-translate-y-1 cursor-pointer h-full
                                ${isDark ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-white/10' :
                                        shop.has_order_today
                                            ? 'bg-emerald-50 border-emerald-100 shadow-none'
                                            : 'bg-white border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-blue-500/10'}`}
                            >
                                <div className="flex items-start gap-4 sm:gap-5 w-full">
                                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl text-2xl sm:text-3xl
                                    ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-100 shadow-lg'}`}>
                                        🏬
                                        {shop.has_order_today && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white text-[8px] text-white font-bold">
                                                ✓
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`font-black text-base sm:text-lg leading-tight break-words ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
                                                {shop.shop_name}
                                                {shops.filter(s => s.shop_name.trim().toLowerCase() === shop.shop_name.trim().toLowerCase()).length > 1 && shop.owner_name ? ` (${shop.owner_name})` : ''}
                                                {shop.parent_shop_id && (
                                                    <span className="text-xs text-indigo-500 font-normal shrink-0" title="Linked Shared-Balance Account">🔗</span>
                                                )}
                                            </p>
                                            {shop.has_order_today && (
                                                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shrink-0 mt-0.5">
                                                    Order Taken
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5 break-words">
                                            {(isAdmin ? shop.owner_name : shop.owner_name) || '—'} {shop.shop_owner && <span className="text-blue-500 ml-1">• {shop.shop_owner}</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-1 break-words">{shop.phone || '—'}</p>
                                        {shop.phone2 && <p className="text-xs text-slate-500 font-medium break-words">{shop.phone2}</p>}
                                        <p className={`text-xs sm:text-sm font-black mt-3 uppercase tracking-wider ${shop.balance > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            BALANCE ₹{Number(shop.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100/50 dark:border-white/5 w-full">
                                    <div className="grid grid-cols-4 gap-2.5 w-full">
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedShop(shop); setPaymentData(p => ({ ...p, amount: '', method: 'Cash' })); setShowPaymentModal(true); }}
                                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                                    title="Collect Payment"
                                                >
                                                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span>Collect</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchLedger(shop); }}
                                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                                                    title="Ledger"
                                                >
                                                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.222.882a.5.5 0 010-.764L15.39 8.388a.5.5 0 01.44-.061l1.597.532a.5.5 0 00.54-.124l1.26-1.26a.5.5 0 00-.518-.813l-1.18.393a.5.5 0 01-.44-.061l-1.597-.532a.5.5 0 00-.54.124l-1.26 1.26a.5.5 0 00.518.813l1.18-.393z" /></svg>
                                                    <span>Ledger</span>
                                                </button>
                                            </>
                                        )}
                                        {isAdmin ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(shop); }}
                                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                                    title="Edit"
                                                >
                                                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(shop.id); }}
                                                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                                    title="Delete"
                                                >
                                                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    <span>Delete</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="col-span-2 flex w-full">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedShop(shop); setPaymentData(p => ({ ...p, amount: '', method: 'Cash' })); setShowPaymentModal(true); }}
                                                        className={`w-full p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                                        title="Collect Payment"
                                                    >
                                                        <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <span>Collect</span>
                                                    </button>
                                                </div>
                                                <div className="col-span-2 flex w-full">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); fetchLedger(shop); }}
                                                        className={`w-full p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                                                        title="Ledger"
                                                    >
                                                        <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.222.882a.5.5 0 010-.764L15.39 8.388a.5.5 0 01.44-.061l1.597.532a.5.5 0 00.54-.124l1.26-1.26a.5.5 0 00-.518-.813l-1.18.393a.5.5 0 01-.44-.061l-1.597-.532a.5.5 0 00-.54.124l-1.26 1.26a.5.5 0 00.518.813l1.18-.393z" /></svg>
                                                        <span>Ledger</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center overflow-y-auto no-scrollbar p-0 sm:p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className={`relative w-full max-w-md border shadow-2xl p-8 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300 rounded-t-[40px] sm:rounded-[40px] max-h-[95vh] overflow-y-auto no-scrollbar
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {isAdmin && editingShop ? 'Edit Shop' : 'Add New Shop'}
                                </h3>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{villageName}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {[
                                { label: 'Shop Name', key: 'shop_name', type: 'text', required: true, placeholder: 'e.g. Annai Store' },
                                { label: 'Landmark / Sub-Area', key: 'owner_name', type: 'text', required: false, placeholder: 'e.g. Entrance / Near Bazzar' },
                                { label: 'Owner Name', key: 'shop_owner', type: 'text', required: false, placeholder: 'e.g. Ravi' },
                                { label: 'Phone 1', key: 'phone', type: 'text', required: false, placeholder: 'e.g. 9876543210' },
                                { label: 'Phone 2', key: 'phone2', type: 'text', required: false, placeholder: 'e.g. 9876543211' },
                                { label: 'Balance (₹)', key: 'balance', type: 'number', required: false, placeholder: '0.00' },
                            ].map(({ label, key, type, required, placeholder }) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
                                    <input
                                        required={required}
                                        type={type}
                                        step={key === 'balance' ? '0.01' : undefined}
                                        placeholder={placeholder}
                                        className={`w-full rounded-2xl px-5 py-4 border text-sm font-semibold transition-all focus:outline-none focus:ring-4
                                            ${isDark ? `bg-slate-800 border-white/10 text-white focus:ring-${primaryColor}-500/20 focus:border-${primaryColor}-500` : `bg-slate-50 border-slate-200 text-slate-900 focus:ring-${primaryColor}-600/10 focus:border-${primaryColor}-600`}`}
                                        value={(formData as any)[key]}
                                        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                            {isAdmin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Link to Shop (Optional)</label>
                                    <select
                                        value={formData.parent_shop_id || ''}
                                        onChange={e => setFormData({ ...formData, parent_shop_id: e.target.value || '' })}
                                        className={`w-full rounded-2xl px-5 py-4 border text-sm font-semibold transition-all focus:outline-none focus:ring-4
                                            ${isDark ? `bg-slate-800 border-white/10 text-white focus:ring-${primaryColor}-500/20 focus:border-${primaryColor}-500` : `bg-slate-50 border-slate-200 text-slate-900 focus:ring-${primaryColor}-600/10 focus:border-${primaryColor}-600`}`}
                                    >
                                        <option value="">-- No Link (Independent Shop) --</option>
                                        {allShops
                                            .filter(s => s.id !== editingShop?.id) // Don't let shop link to itself
                                            .map(s => {
                                                const subArea = s.owner_name;
                                                const labelLocation = subArea 
                                                    ? `${s.village_name} - ${subArea}` 
                                                    : s.village_name;
                                                return (
                                                    <option key={s.id} value={s.id}>
                                                        {s.shop_name} ({labelLocation})
                                                    </option>
                                                );
                                            })}
                                    </select>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider italic">
                                        🔗 Linking shops consolidates their balances and ledger histories across both routes.
                                    </p>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submittingShop}
                                className={`w-full py-4 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-${primaryColor}-600/20 transition-all mt-4
                                    ${submittingShop ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                            >
                                {submittingShop ? 'Saving...' : (isAdmin && editingShop ? 'Save Changes' : 'Add Shop')}
                            </button>
                        </form>
                    </div>
                </div>
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
        </div>
    );
};

export default ShopManager;
