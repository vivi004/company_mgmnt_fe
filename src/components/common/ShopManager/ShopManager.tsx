import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import Bills from '../Billpage/Bills';
import ReviewOrder from '../ReviewOrder/ReviewOrder';
import { getAllProducts } from '../../../constants/productData';
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
}

interface Props {
    orderLineId: number;
    villageName: string;
    theme: string;
    onBack: () => void;
    type: 'admin' | 'staff';
}

const ShopManager = ({ orderLineId, villageName, theme, onBack, type }: Props) => {
    const isAdmin = type === 'admin';
    const isDark = theme === 'dark';
    const primaryColor = isAdmin ? 'blue' : 'emerald';

    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [formData, setFormData] = useState({ shop_name: '', owner_name: '', shop_owner: '', phone: '', phone2: '', balance: '' });
    const { toasts, showToast, removeToast } = useToast();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [shopSearch, setShopSearch] = useState('');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [showReview, setShowReview] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [currentBillId, setCurrentBillId] = useState<number | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<number>(0);

    const api = () => getAuthAxios();

    useEffect(() => {
        fetchShops();
    }, [orderLineId]);

    const fetchShops = async () => {
        setLoading(true);
        try {
            const res = await api().get(`/api/shops/by-village/${orderLineId}`);
            setShops(res.data);
        } catch {
            showToast('Failed to load shops', 'error');
        } finally {
            setLoading(false);
        }
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

    const openAdd = () => {
        setEditingShop(null);
        setFormData({ shop_name: '', owner_name: '', shop_owner: '', phone: '', phone2: '', balance: '' });
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
            balance: shop.balance.toString()
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            order_line_id: orderLineId,
            shop_name: formData.shop_name,
            village_name: villageName,
            owner_name: formData.owner_name,
            shop_owner: formData.shop_owner,
            phone: formData.phone,
            phone2: formData.phone2,
            balance: parseFloat(formData.balance) || 0
        };
        try {
            if (isAdmin && editingShop) {
                await api().put(`/api/shops/${editingShop.id}`, payload);
                showToast('Shop updated!', 'success');
            } else {
                await api().post('/api/shops', payload);
                showToast('Shop added!', 'success');
            }
            setShowModal(false);
            fetchShops();
        } catch (err: any) {
            showToast(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) {
            if (!window.confirm('Request to delete this shop?')) return;
            showToast('Deletion requested — contact admin for approval.', 'info');
            return;
        }

        if (!window.confirm('Delete this shop?')) return;
        try {
            await api().delete(`/api/shops/${id}`);
            showToast('Shop deleted', 'success');
            fetchShops();
        } catch {
            showToast('Failed to delete shop', 'error');
        }
    };

    // Sub-view rendering
    if (selectedShop && showBill) {
        // If currentBillId exists, look up the snapshot rates from the API/context if possible,
        // but since we just placed the order, we can snapshot the current cart rates here for the immediate display view.
        const currentRates: Record<string, number> = {};
        getAllProducts().forEach(p => {
            if (cart[p.id] || cart[`${p.id}_box`] || cart[`${p.id}_ltr`]) {
                currentRates[p.id] = p.price;
            }
        });

        return (
            <Bills
                shopName={selectedShop.shop_name}
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
                }}
                onEditOrder={() => {
                    setShowBill(false);
                    setShowReview(true);
                }}
                type={type}
            />
        );
    }

    if (selectedShop && showReview) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <ReviewOrder
                    shopName={selectedShop.shop_name}
                    villageName={villageName}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setShowReview(false)}
                    onPlaceOrder={async () => {
                        let createdBy = 'Admin';
                        if (!isAdmin) {
                            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                            createdBy = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Staff';
                        }

                        // Snapshot current rates so future Google Sheet updates don't affect this invoice
                        const currentRates: Record<string, number> = {};
                        getAllProducts().forEach(p => {
                            if (cart[p.id] || cart[`${p.id}_box`] || cart[`${p.id}_ltr`]) {
                                currentRates[p.id] = p.price;
                            }
                        });

                        const currentInvoiceNo = parseInt(localStorage.getItem('nextInvoiceNo') || '1001', 10);
                        const nextNo = currentInvoiceNo + 1;
                        localStorage.setItem('nextInvoiceNo', String(nextNo));
                        localStorage.setItem('lastInvoiceNo', String(currentInvoiceNo));
                        // Sync to backend in background (non-blocking)
                        api().put('/api/settings/invoice', {
                            next_invoice_no: nextNo,
                            last_invoice_no: currentInvoiceNo
                        }).catch(e => console.error('Invoice sync failed:', e));

                        const billPayload = {
                            invoice_no: currentInvoiceNo,
                            shop_name: selectedShop!.shop_name,
                            village_name: villageName,
                            cart: cart,
                            custom_rates: currentRates,
                            created_by: createdBy,
                            bill_date: new Date().toISOString(),
                            status: 'Unverified'
                        };

                        try {
                            if (currentBillId) {
                                const res = await api().put(`/api/bills/${currentBillId}`, { cart, custom_rates: currentRates });
                                if (res.data.invoice_no) setInvoiceNo(res.data.invoice_no);
                                showToast('Order updated!', 'success');
                            } else {
                                const res = await api().post('/api/bills', billPayload);
                                setCurrentBillId(res.data.id);
                                setInvoiceNo(res.data.invoice_no || billPayload.invoice_no);
                                showToast(isAdmin ? 'Order placed successfully!' : 'Order submitted for verification!', 'success');
                            }
                            setShowReview(false);
                            setShowBill(true);
                        } catch (err: any) {
                            showToast(err.response?.data?.error || 'Failed to place order', 'error');
                        }
                    }}
                    type={type}
                />
            </>
        );
    }

    if (selectedShop) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <UnifiedOrderingView
                    shopName={selectedShop.shop_name}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setSelectedShop(null)}
                    onReviewOrder={() => setShowReview(true)}
                />
            </>
        );
    }

    return (
        <div className={`space-y-8 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex items-center gap-6 flex-wrap">
                <button
                    onClick={onBack}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border font-black transition-all hover:-translate-x-1
                        ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-md'}`}
                >
                    ←
                </button>
                <div>
                    <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Select Shop
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">
                        Area: <span className={`text-${primaryColor}-400 font-black`}>{villageName}</span>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border
                        ${isDark ? `bg-${primaryColor}-500/10 text-${primaryColor}-400 border-${primaryColor}-500/20` : `bg-${primaryColor}-50 text-${primaryColor}-600 border-${primaryColor}-100`}`}>
                        {shops.length} Shops
                    </div>
                    <button
                        onClick={openAdd}
                        className={`px-6 py-3 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-${primaryColor}-600/20 hover:-translate-y-0.5 active:scale-95`}
                    >
                        + Add Shop
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {!loading && shops.length > 0 && (
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search shops by name, owner, or phone..."
                        value={shopSearch}
                        onChange={e => setShopSearch(e.target.value)}
                        className={`w-full pl-14 pr-12 py-4 rounded-[20px] font-bold text-sm border transition-all focus:outline-none focus:ring-4
                            ${isDark ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-600/10 focus:border-blue-600 shadow-lg shadow-slate-200/30'}`}
                    />
                    {shopSearch && (
                        <button onClick={() => setShopSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            )}

            {/* Shop Cards Grid */}
            {(() => {
                const filteredShops = shopSearch.trim()
                    ? shops.filter(s =>
                        s.shop_name.toLowerCase().includes(shopSearch.toLowerCase()) ||
                        (s.owner_name && s.owner_name.toLowerCase().includes(shopSearch.toLowerCase())) ||
                        (s.shop_owner && s.shop_owner.toLowerCase().includes(shopSearch.toLowerCase())) ||
                        (s.phone && s.phone.includes(shopSearch)) ||
                        (s.phone2 && s.phone2.includes(shopSearch))
                    )
                    : shops;

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
                            className={`flex items-center gap-5 p-6 rounded-[28px] border group transition-all hover:-translate-y-1 cursor-pointer
                                ${isDark ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-white/10' : `bg-white border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-${primaryColor}-500/10`}`}
                        >
                            <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-[20px] text-3xl
                                ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-100 shadow-lg'}`}>
                                🏬
                            </div>

                            <div className="flex-grow min-w-0">
                                <p className={`font-black text-xl leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.shop_name}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    {(isAdmin ? shop.owner_name : shop.owner_name) || '—'} {shop.shop_owner && <span className="text-blue-500 ml-1">• {shop.shop_owner}</span>}
                                </p>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">{shop.phone || '—'}</p>
                                {shop.phone2 && <p className="text-sm text-slate-500 font-medium">{shop.phone2}</p>}
                                <p className={`text-sm font-black mt-2 ${shop.balance > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    BALANCE₹{Number(shop.balance).toFixed(2)}
                                </p>
                            </div>

                            <div className={`flex flex-col gap-2 ${isAdmin ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEdit(shop); }}
                                            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(shop.id); }}
                                            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className={`text-slate-400 group-hover:text-${primaryColor}-400 transition-colors flex-shrink-0`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    ))}
                </div>
            );
            })()}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className={`relative my-auto rounded-[40px] w-full max-w-md border shadow-2xl p-8 animate-in zoom-in-95 duration-300
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
                                { label: 'Area Name', key: 'owner_name', type: 'text', required: false, placeholder: 'e.g. Entrance' },
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
                            <button
                                type="submit"
                                className={`w-full py-4 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-${primaryColor}-600/20 transition-all hover:-translate-y-0.5 active:scale-95 mt-4`}
                            >
                                {isAdmin && editingShop ? 'Save Changes' : 'Add Shop'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopManager;
