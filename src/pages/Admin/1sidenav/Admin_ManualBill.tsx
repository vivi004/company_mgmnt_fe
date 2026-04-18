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
    theme: string;
    onBack: () => void;
    type: 'admin' | 'staff';
}

const Admin_ManualBill: React.FC<AdminManualBillProps> = ({ shopName, villageName, theme, onBack, type }) => {
    const isAdmin = type === 'admin';
    const { toasts, showToast, removeToast } = useToast();
    
    const [cart, setCart] = useState<Record<string, number>>({});
    const [showReview, setShowReview] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [currentBillId, setCurrentBillId] = useState<number | null>(null);
    const [invoiceNo, setInvoiceNo] = useState<number>(0);

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
                        let createdBy = 'Admin';
                        if (!isAdmin) {
                            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                            createdBy = storedUser.first_name ? `${storedUser.first_name} ${storedUser.last_name || ''}`.trim() : 'Staff';
                        }

                        const currentRates: Record<string, number> = {};
                        getAllProducts().forEach((p: Product) => {
                            if (cart[p.id] || cart[`${p.id}_box`] || cart[`${p.id}_ltr`]) {
                                currentRates[p.id] = p.price;
                            }
                        });

                        const currentInvoiceNo = parseInt(localStorage.getItem('nextInvoiceNo') || '1001', 10);
                        localStorage.setItem('nextInvoiceNo', String(currentInvoiceNo + 1));

                        const billPayload = {
                            invoice_no: currentInvoiceNo,
                            shop_name: shopName,
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
