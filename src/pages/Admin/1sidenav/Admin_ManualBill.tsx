import React, { useState } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast, ToastContainer } from '../../../components/Toast';
import Bills from '../../../components/common/Billpage/Bills';
import ReviewOrder from '../../../components/common/ReviewOrder/ReviewOrder';
import UnifiedOrderingView from '../../../components/common/ShopManager/UnifiedOrderingView';
import { getAllProducts } from '../../../constants/productData';
import type { Product } from '../../../constants/productData';

interface AdminManualBillProps {
    shopName: string;
    villageName: string;
    phone?: string;
    theme: string;
    onBack: () => void;
    type: 'admin' | 'staff';
}

const Admin_ManualBill: React.FC<AdminManualBillProps> = ({ shopName, villageName, phone, theme, onBack, type }) => {
    const isAdmin = type === 'admin';
    const { toasts, showToast, removeToast } = useToast();
    
    const [cart, setCart] = useState<Record<string, number>>({});
    const [showReview, setShowReview] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [currentBillId, setCurrentBillId] = useState<number | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<number>(0);
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    });

    const api = () => getAuthAxios();

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

    if (showBill) {
        // Snapshot current rates so future updates don't affect this exact invoice view immediately
        const currentRates: Record<string, number> = {};
        getAllProducts().forEach((p: Product) => {
            if (cart[p.id] || cart[`${p.id}_box`] || cart[`${p.id}_ltr`]) {
                currentRates[p.id] = p.price;
            }
        });

        return (
            <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <Bills
                    shopName={shopName}
                    villageName={villageName}
                    theme={theme}
                    invoiceNo={invoiceNo}
                    cart={cart}
                    customRates={currentRates}
                    onNewOrder={() => {
                        setCart({});
                        setShowBill(false);
                        setShowReview(false);
                        setCurrentBillId(null);
                        setInvoiceNo(0);
                        onBack(); // Exit back to settings after doing a manual bill completely
                    }}
                    onEditOrder={() => {
                        setShowBill(false);
                        setShowReview(true);
                    }}
                    type={type}
                />
            </div>
        );
    }

    if (showReview) {
        return (
            <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <ToastContainer toasts={toasts} removeToast={removeToast} />
                <ReviewOrder
                    shopName={shopName}
                    villageName={villageName}
                    theme={theme}
                    cart={cart}
                    updateQuantity={updateQuantity}
                    onBack={() => setShowReview(false)}
                    onPlaceOrder={async () => {
                        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const createdBy = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : (isAdmin ? 'Admin' : 'Staff');

                        const currentRates: Record<string, number> = {};
                        getAllProducts().forEach((p: Product) => {
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
                            shop_name: shopName,
                            village_name: villageName,
                            phone: phone,
                            cart: cart,
                            custom_rates: currentRates,
                            created_by: createdBy,
                            bill_date: new Date().toISOString(),
                            delivery_date: new Date(deliveryDate + 'T00:00:00').toISOString(),
                            status: 'Unverified'
                        };

                        try {
                            if (currentBillId) {
                                const res = await api().put(`/api/bills/${currentBillId}`, { 
                                    cart, 
                                    custom_rates: currentRates,
                                    delivery_date: new Date(deliveryDate + 'T00:00:00').toISOString()
                                });
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
                    deliveryDate={deliveryDate}
                    onDeliveryDateChange={setDeliveryDate}
                />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-5 duration-500">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <UnifiedOrderingView
                shopName={shopName}
                theme={theme}
                cart={cart}
                updateQuantity={updateQuantity}
                onBack={onBack}
                onReviewOrder={() => setShowReview(true)}
            />
        </div>
    );
};

export default Admin_ManualBill;
