import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import OilCatStaff from '../Oils_staff/Oil_catStaff';
import NishaPureStaff from '../Oils_staff/Nisha_pure_Staff';
import NishaSubcatStaff from '../Oils_staff/Nisha_Subcat_Staff';
import MixedOilStaff from '../Oils_staff/Mixed_oil_Staff';
import PalmOilStaff from '../Oils_staff/Palm_oil_Staff';
import ReviewOrderStaff from '../Bills_Staff/Review_Order_Staff';
import BillPageStaff from '../Bills_Staff/Bill_Page_Staff';

interface Shop {
    id: number;
    order_line_id: number;
    shop_name: string;
    village_name: string;
    owner_name: string;
    phone: string;
    balance: number;
}

interface Props {
    orderLineId: number;
    villageName: string;
    theme: string;
    onBack: () => void;
}

const ShopNamesStaff = ({ orderLineId, villageName, theme, onBack }: Props) => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ shop_name: '', owner_name: '', phone: '', balance: '' });
    const { toasts, showToast, removeToast } = useToast();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [showReview, setShowReview] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [currentBillId, setCurrentBillId] = useState<number | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<number>(0);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            order_line_id: orderLineId,
            shop_name: formData.shop_name,
            owner_name: formData.owner_name,
            phone: formData.phone,
            balance: parseFloat(formData.balance) || 0
        };
        try {
            await api().post('/api/shops', payload);
            showToast('Shop added!', 'success');
            setShowModal(false);
            setFormData({ shop_name: '', owner_name: '', phone: '', balance: '' });
            fetchShops();
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to add shop', 'error');
        }
    };

    const handleDeleteRequest = async (_shopId: number) => {

        if (!window.confirm('Request to delete this shop?')) return;
        showToast('Deletion requested — contact admin for approval.', 'info');
        // Staff cannot directly delete; they can request via admin workflow
        // Extend this to send a deletion request API call if needed
    };

    const isDark = theme === 'dark';

    // Bill Page
    if (selectedShop && showBill) {
        return (
            <BillPageStaff
                shopName={selectedShop.shop_name}
                villageName={villageName}
                theme={theme}
                invoiceNo={invoiceNo}
                cart={cart}
                onNewOrder={() => {
                    setCart({});
                    setShowBill(false);
                    setShowReview(false);
                    setSelectedSubCategory(null);
                    setSelectedCategory(null);
                    setSelectedShop(null);
                    setCurrentBillId(null);
                    setInvoiceNo(0);
                }}
                onEditOrder={() => {
                    setShowBill(false);
                    setShowReview(true);
                }}
            />
        );
    }

    // Review Order Page
    if (selectedShop && showReview) {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <ReviewOrderStaff
                    shopName={selectedShop.shop_name}
                    villageName={villageName}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setShowReview(false)}
                    onPlaceOrder={async () => {
                        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const userName = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Staff';

                        const billPayload = {
                            invoice_no: Math.floor(5000 + Math.random() * 1000),
                            shop_name: selectedShop!.shop_name,
                            village_name: villageName,
                            cart: cart,
                            custom_rates: {},
                            created_by: userName,
                            bill_date: new Date().toISOString(),
                            status: 'Unverified'
                        };

                        try {
                            if (currentBillId) {
                                const res = await api().put(`/api/bills/${currentBillId}`, { cart, custom_rates: {} });
                                if (res.data.invoice_no) setInvoiceNo(res.data.invoice_no);
                                showToast('Order updated!', 'success');
                            } else {
                                const res = await api().post('/api/bills', billPayload);
                                setCurrentBillId(res.data.id);
                                setInvoiceNo(res.data.invoice_no || billPayload.invoice_no);
                                showToast('Order submitted for verification!', 'success');
                            }
                            setShowReview(false);
                            setShowBill(true);
                        } catch (err: any) {
                            showToast(err.response?.data?.error || 'Failed to submit order', 'error');
                        }
                    }}
                />
            </>
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'nisha (pure oils)' && !selectedSubCategory) {
        return (
            <NishaSubcatStaff
                shopName={selectedShop.shop_name}
                theme={theme}
                onBack={() => setSelectedCategory(null)}
                onSelectCategory={(subcat) => setSelectedSubCategory(subcat)}
            />
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'nisha (pure oils)' && selectedSubCategory) {
        return (
            <NishaPureStaff
                shopName={selectedShop.shop_name}
                villageName={villageName}
                theme={theme}
                cart={cart}
                updateQuantity={updateQuantity}
                filterSubCategory={selectedSubCategory}
                onBack={() => setSelectedSubCategory(null)}
                onReviewOrder={() => setShowReview(true)}
            />
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'mixed oil') {
        return (
            <MixedOilStaff
                shopName={selectedShop.shop_name}
                villageName={villageName}
                theme={theme}
                cart={cart}
                updateQuantity={updateQuantity}
                onBack={() => setSelectedCategory(null)}
                onReviewOrder={() => setShowReview(true)}
            />
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'palm oil') {
        return (
            <PalmOilStaff
                shopName={selectedShop.shop_name}
                villageName={villageName}
                theme={theme}
                cart={cart}
                updateQuantity={updateQuantity}
                onBack={() => setSelectedCategory(null)}
                onReviewOrder={() => setShowReview(true)}
            />
        );
    }

    if (selectedShop) {
        return (
            <OilCatStaff
                shopName={selectedShop.shop_name}
                theme={theme}
                onBack={() => setSelectedShop(null)}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
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
                        Area: <span className="text-emerald-400 font-black">{villageName}</span>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border
                        ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {shops.length} Shops
                    </div>
                    <button
                        onClick={() => { setFormData({ shop_name: '', owner_name: '', phone: '', balance: '' }); setShowModal(true); }}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95"
                    >
                        + Add Shop
                    </button>
                </div>
            </div>

            {/* Shop Cards Grid */}
            {loading ? (
                <div className="py-20 text-center text-emerald-500 font-black italic uppercase tracking-widest animate-pulse">
                    Syncing Shop Data...
                </div>
            ) : shops.length === 0 ? (
                <div className={`py-20 text-center rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">🏪</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>No shops in {villageName}</p>
                    <p className="text-slate-500 mt-2 font-medium">Click "+ Add Shop" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {shops.map((shop) => (
                        <div
                            key={shop.id}
                            onClick={() => setSelectedShop(shop)}
                            className={`flex items-center gap-5 p-6 rounded-[28px] border group transition-all hover:-translate-y-1 cursor-pointer
                                ${isDark ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-white/10' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-emerald-500/10'}`}
                        >
                            {/* Shop Icon */}
                            <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-[20px] text-3xl
                                ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-100 shadow-lg'}`}>
                                🏬
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <p className={`font-black text-xl leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.shop_name}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    {shop.owner_name || '—'}
                                </p>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">{shop.phone || '—'}</p>
                                <p className={`text-sm font-black mt-2 ${shop.balance > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    BALANCE₹{Number(shop.balance).toFixed(2)}
                                </p>
                            </div>

                            {/* Delete request button (hover) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRequest(shop.id); }}
                                className="opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Request Deletion"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            {/* Chevron */}
                            <div className="text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className={`relative rounded-[40px] w-full max-w-md border shadow-2xl p-8 animate-in zoom-in-95 duration-300
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Add New Shop
                                </h3>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{villageName}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {[
                                { label: 'Shop Name', key: 'shop_name', type: 'text', required: true, placeholder: 'e.g. Annai Store' },
                                { label: 'Owner Name', key: 'owner_name', type: 'text', required: false, placeholder: 'e.g. Ravi' },
                                { label: 'Phone', key: 'phone', type: 'text', required: false, placeholder: 'e.g. 9876543210' },
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
                                            ${isDark ? 'bg-slate-800 border-white/10 text-white focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-600/10 focus:border-emerald-600'}`}
                                        value={(formData as any)[key]}
                                        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-95 mt-4"
                            >
                                Add Shop
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopNamesStaff;

