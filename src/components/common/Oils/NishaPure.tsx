import { useState } from 'react';
import { useToast, ToastContainer } from '../../../components/Toast';
import { getNishaProducts, saveNishaProducts, getCartItems, type Product } from '../../../constants/productData';
import NishaPureHeader from './NishaPureHeader';
import NishaPureProductCard from './NishaPureProductCard';
import NishaPureOrderSummary from './NishaPureOrderSummary';
import NishaPureProductModal from './NishaPureProductModal';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    cart: Record<string, number>;
    updateQuantity: (id: string, delta: number) => void;
    filterSubCategory: string | null;
    onBack: () => void;
    onReviewOrder: () => void;
    type?: 'admin' | 'staff';
}

const NishaPure = ({
    shopName,
    villageName,
    theme,
    cart,
    updateQuantity,
    filterSubCategory,
    onBack,
    onReviewOrder,
    type = 'admin'
}: Props) => {
    const isDark = theme === 'dark';
    const isAdmin = type === 'admin';
    const { toasts, showToast, removeToast } = useToast();

    const primaryColor = isAdmin ? 'blue' : 'emerald';

    const allNishaProducts = getNishaProducts();
    const [products, setProducts] = useState<Product[]>(allNishaProducts.filter((p: Product) => !filterSubCategory || p.name === filterSubCategory));
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({ name: '', brand: 'Nisha', size: '', price: '', unit: 'Litre', weight: '', icon: '' });

    const cartItems = getCartItems(cart);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: '', brand: 'Nisha', size: '', price: '', unit: 'Litre', weight: '', icon: '' });
        setShowProductModal(true);
    };

    const openEditProduct = (p: Product) => {
        setEditingProduct(p);
        setProductForm({ name: p.name, brand: p.brand, size: p.size, price: p.price.toString(), unit: p.unit, weight: p.weight || '', icon: p.icon || '' });
        setShowProductModal(true);
    };

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.size || !productForm.price) {
            showToast('Fill name, size, and price', 'error');
            return;
        }
        let updated: Product[];
        const allUpdatedProducts = [...allNishaProducts];
        if (editingProduct) {
            const index = allUpdatedProducts.findIndex(p => p.id === editingProduct.id);
            if (index !== -1) {
                allUpdatedProducts[index] = { ...allUpdatedProducts[index], name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined };
            }
            updated = products.map(p => p.id === editingProduct.id ? { ...p, name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined } : p);
            showToast('Product updated!', 'success');
        } else {
            const newId = `nisha-${Date.now()}`;
            const newP: Product = { id: newId, name: productForm.name, brand: productForm.brand, size: productForm.size, price: parseFloat(productForm.price), unit: productForm.unit, weight: productForm.weight || undefined, icon: productForm.icon || undefined };
            allUpdatedProducts.push(newP);
            updated = [...products, newP];
            showToast('Product added!', 'success');
        }
        setProducts(updated);
        saveNishaProducts(allUpdatedProducts);
        setShowProductModal(false);
    };

    const handleDeleteProduct = (id: string) => {
        if (!window.confirm('Delete this product?')) return;
        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        const allUpdatedProducts = allNishaProducts.filter(p => p.id !== id);
        saveNishaProducts(allUpdatedProducts);
        showToast('Product deleted', 'success');
    };

    const handleManualQuantity = (id: string, val: number, p?: Product) => {
        let safeVal = isNaN(val) ? 0 : val;

        if (p && !id.includes('_box')) {
            const size = p.size.toLowerCase();
            if (size === '500 ml') {
                safeVal = Math.round(safeVal * 2) / 2;
            } else if (size === '1 litre' || size === '1 ltr-pet') {
                safeVal = Math.round(safeVal);
            } else if (size === '2 ltr') {
                safeVal = Math.round(safeVal / 2) * 2;
            }
        }

        const current = cart[id] || 0;
        const delta = safeVal - current;
        if (delta !== 0) {
            updateQuantity(id, delta);
        }
    };

    const inputCls = `w-full px-4 py-3 rounded-2xl border font-bold text-sm transition-all focus:outline-none focus:ring-2
        ${isDark ? `bg-slate-800 border-white/10 text-white focus:ring-${primaryColor}-500/50` : `bg-slate-50 border-slate-200 text-slate-900 focus:ring-${primaryColor}-500/30`}`;

    return (
        <div className={`min-h-screen pb-40 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <NishaPureHeader
                shopName={shopName}
                villageName={villageName}
                filterSubCategory={filterSubCategory}
                onBack={onBack}
                isDark={isDark}
                isAdmin={isAdmin}
                primaryColor={primaryColor}
                openAddProduct={openAddProduct}
            />

            {/* Product Grid */}
            <div className="grid gap-6">
                {products.map((product) => (
                    <NishaPureProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        isDark={isDark}
                        isAdmin={isAdmin}
                        primaryColor={primaryColor}
                        updateQuantity={updateQuantity}
                        handleManualQuantity={handleManualQuantity}
                        openEditProduct={openEditProduct}
                        handleDeleteProduct={handleDeleteProduct}
                    />
                ))}
            </div>

            <NishaPureOrderSummary
                totalItems={totalItems}
                totalPrice={totalPrice}
                isDark={isDark}
                primaryColor={primaryColor}
                onReviewOrder={onReviewOrder}
            />

            {isAdmin && (
                <NishaPureProductModal
                    showProductModal={showProductModal}
                    editingProduct={editingProduct}
                    productForm={productForm}
                    setProductForm={setProductForm}
                    handleSaveProduct={handleSaveProduct}
                    setShowProductModal={setShowProductModal}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    inputCls={inputCls}
                />
            )}
        </div>
    );
};

export default NishaPure;
