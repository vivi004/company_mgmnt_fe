import { useState, useEffect } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import OilCatAdmin from '../Oils_admin/Oil_catAdmin';
import NishaPureAdmin from '../Oils_admin/Nisha_pure_Admin';
import NishaSubcatAdmin from '../Oils_admin/Nisha_Subcat_Admin';
import MixedOilAdmin from '../Oils_admin/Mixed_oil_Admin';
import PalmOilAdmin from '../Oils_admin/Palm_oil_Admin';
import ReviewOrderAdmin from '../Bills_Admin/Review_Order_Admin';
import BillPageAdmin from '../Bills_Admin/Bill_Page_Admin';

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

const ShopNamesAdmin = ({ orderLineId, villageName, theme, onBack }: Props) => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
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

    const openAdd = () => {
        setEditingShop(null);
        setFormData({ shop_name: '', owner_name: '', phone: '', balance: '' });
        setShowModal(true);
    };

    const openEdit = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            shop_name: shop.shop_name,
            owner_name: shop.owner_name,
            phone: shop.phone,
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
            phone: formData.phone,
            balance: parseFloat(formData.balance) || 0
        };
        try {
            if (editingShop) {
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
        if (!window.confirm('Delete this shop?')) return;
        try {
            await api().delete(`/api/shops/${id}`);
            showToast('Shop deleted', 'success');
            fetchShops();
        } catch {
            showToast('Failed to delete shop', 'error');
        }
    };

    const isDark = theme === 'dark';

    // Bill Page
    if (selectedShop && showBill) {
        return (
            <BillPageAdmin
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
                <ReviewOrderAdmin
                    shopName={selectedShop.shop_name}
                    villageName={villageName}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setShowReview(false)}
                    onPlaceOrder={async () => {
                        const billPayload = {
                            invoice_no: Math.floor(5000 + Math.random() * 1000),
                            shop_name: selectedShop!.shop_name,
                            village_name: villageName,
                            cart: cart,
                            custom_rates: {},
                            created_by: 'Admin',
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
                                showToast('Order placed successfully!', 'success');
                            }
                            setShowReview(false);
                            setShowBill(true);
                        } catch (err: any) {
                            showToast(err.response?.data?.error || 'Failed to place order', 'error');
                        }
                    }}
                />
            </>
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'nisha (pure oils)' && !selectedSubCategory) {
        return (
            <NishaSubcatAdmin
                shopName={selectedShop.shop_name}
                theme={theme}
                onBack={() => setSelectedCategory(null)}
                onSelectCategory={(subcat) => setSelectedSubCategory(subcat)}
            />
        );
    }

    if (selectedShop && selectedCategory?.trim().toLowerCase() === 'nisha (pure oils)' && selectedSubCategory) {
        return (
            <NishaPureAdmin
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
            <MixedOilAdmin
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
            <PalmOilAdmin
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
            <OilCatAdmin
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
            <div className="flex items-center gap-6">
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
                        Area: <span className="text-blue-400 font-black">{villageName}</span>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border
                        ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {shops.length} Shops
                    </div>
                    <button
                        onClick={openAdd}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95"
                    >
                        + Add Shop
                    </button>
                </div>
            </div>

            {/* Shop Cards Grid */}
            {loading ? (
                <div className="py-20 text-center text-blue-400 font-black italic uppercase tracking-widest animate-pulse">
                    Loading shops...
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
                                ${isDark ? 'bg-slate-900 border-white/5 hover:bg-slate-800 hover:border-white/10' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-blue-500/10'}`}
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

                            {/* Actions */}
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEdit(shop); }}
                                    className={`p-2 rounded-xl border transition-all
                                        ${isDark ? 'bg-white/5 border-white/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(shop.id); }}
                                    className={`p-2 rounded-xl border transition-all
                                        ${isDark ? 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-600 hover:text-white'}`}
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Chevron */}
                            <div className="text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className={`relative rounded-[40px] w-full max-w-md border shadow-2xl p-8 animate-in zoom-in-95 duration-300
                        ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingShop ? 'Edit Shop' : 'Add New Shop'}
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
                                { label: 'Area Name', key: 'owner_name', type: 'text', required: false, placeholder: 'e.g. Main Road, Near Bus Stand' },
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
                                            ${isDark ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`}
                                        value={(formData as any)[key]}
                                        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95 mt-4"
                            >
                                {editingShop ? 'Save Changes' : 'Add Shop'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopNamesAdmin;

