interface ProductFormData {
    name: string;
    brand: string;
    size: string;
    price: string;
    unit: string;
    weight: string;
    icon: string;
}

interface Props {
    showProductModal: boolean;
    editingProduct: unknown | null;
    productForm: ProductFormData;
    setProductForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
    handleSaveProduct: () => void;
    setShowProductModal: (show: boolean) => void;
    isDark: boolean;
    primaryColor: string;
    inputCls: string;
}

const NishaPureProductModal = ({ showProductModal, editingProduct, productForm, setProductForm, handleSaveProduct, setShowProductModal, isDark, primaryColor, inputCls }: Props) => {
    if (!showProductModal) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowProductModal(false)} />
            <div className={`relative rounded-3xl w-full max-w-md shadow-2xl border p-8 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
                <h3 className={`text-2xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Product Name</label>
                        <input className={inputCls} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Groundnut Oil" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Brand</label>
                            <input className={inputCls} value={productForm.brand} onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Size</label>
                            <input className={inputCls} value={productForm.size} onChange={e => setProductForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 500 ml" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Price (₹)</label>
                            <input className={inputCls} type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 90" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Unit</label>
                            <select className={inputCls} value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))}>
                                <option value="Litre">Litre</option>
                                <option value="Kg">Kg</option>
                                <option value="BOX">BOX</option>
                                <option value="CAN">CAN</option>
                                <option value="BOTTLE">BOTTLE</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Weight (optional)</label>
                            <input className={inputCls} value={productForm.weight} onChange={e => setProductForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 4.550 KGS" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Icon (emoji)</label>
                            <input className={inputCls} value={productForm.icon} onChange={e => setProductForm(f => ({ ...f, icon: e.target.value }))} placeholder="e.g. 🥜" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={() => setShowProductModal(false)} className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Cancel</button>
                    <button onClick={handleSaveProduct} className={`flex-1 py-4 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-${primaryColor}-600/20 active:scale-95`}>
                        {editingProduct ? 'Update' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NishaPureProductModal;
