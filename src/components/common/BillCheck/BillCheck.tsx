import { useState, useEffect } from 'react';
import { getAllProducts, getCartItems } from '../../../constants/productData';
import { numberToWordsINR } from '../../../utils/numberToWords';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast } from '../../../components/Toast';

interface Bill {
    id: number;
    shopName: string;
    villageName: string;
    cart: Record<string, number>;
    customRates?: Record<string, number>;
    date: string;
    invoiceNo: number;
    createdBy?: string;
}

interface Props {
    theme: string;
    type: 'admin' | 'staff';
    userProfileName?: string; // Required for staff type
}

const BillCheck = ({ theme, type, userProfileName }: Props) => {
    const isDark = theme === 'dark';
    const isAdmin = type === 'admin';
    const [unverifiedBills, setUnverifiedBills] = useState<Bill[]>([]);
    const { showToast } = useToast();
    const api = () => getAuthAxios();

    // Edit Modal State
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editCart, setEditCart] = useState<Record<string, number>>({});
    const [editRates, setEditRates] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadUnverifiedBills();
    }, [userProfileName, type]);

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
                cart: b.cart,
                customRates: b.custom_rates || b.customRates || {},
                date: b.bill_date || b.date,
                invoiceNo: b.invoice_no || b.invoiceNo,
                createdBy: b.created_by || b.createdBy
            }));
            setUnverifiedBills(mapped);
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

    const invoiceHTML = (bill: Bill) => {
        const items = getCartItems(bill.cart, bill.customRates);
        const totalQty = items.reduce((a, i) => a + i.quantity, 0);
        const totalAmt = items.reduce((a, i) => a + (i.price * i.quantity), 0);
        const d = new Date(bill.date);
        const ds = `${d.getDate()}-${d.toLocaleString('en', { month: 'short' })}-${String(d.getFullYear()).slice(2)}`;
        const B = 'border:1px solid #000;padding:3px 5px;vertical-align:top;';

        const page = (label: string) => `
        <div class="bp" style="font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:5mm">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed">
        <colgroup><col style="width:4%"><col style="width:44%"><col style="width:13%"><col style="width:13%"><col style="width:6%"><col style="width:20%"></colgroup>
        <tbody>
        <tr><td colspan="6" style="${B}text-align:center;padding:5px"><b style="font-size:14px;text-decoration:underline">QUATATION</b><span style="margin-left:40px;font-size:9px;font-style:italic">(${label})</span></td></tr>
        <tr>
            <td colspan="2" rowspan="5" style="${B}line-height:1.6"><b style="font-size:12px">NISHA OIL MILL</b><br>Salem Main Road,Konganapuram,<br>Edappadi[Tk],Salem[dt].<br>FSSAI NO:12417018006626.<br>State Name : Tamil Nadu, Code : 33<br>Contact : 9965174472<br>E-Mail : nishaoilmills.pvt.ltd@gmail.com</td>
            <td colspan="2" style="${B}font-size:10px">Invoice No.<br><b style="font-size:11px">${bill.invoiceNo}</b></td>
            <td colspan="2" style="${B}font-size:10px">Dated<br><b style="font-size:11px">${ds}</b></td>
        </tr>
        <tr><td colspan="2" style="${B}font-size:10px">Delivery Note</td><td colspan="2" style="${B}font-size:10px">Mode/Terms of Payment<br><b>15 Days</b></td></tr>
        <tr><td colspan="2" style="${B}font-size:10px">Dispatch Doc No.</td><td colspan="2" style="${B}font-size:10px">Delivery Note Date</td></tr>
        <tr><td colspan="2" style="${B}font-size:10px">Dispatched through</td><td colspan="2" style="${B}font-size:10px">Destination</td></tr>
        <tr><td colspan="4" style="${B}font-size:10px">Terms of Delivery</td></tr>
        <tr><td colspan="6" style="${B}line-height:1.6"><span style="font-size:9px">Buyer (Bill to)</span><br><b style="font-size:12px">${bill.shopName.toUpperCase()}</b><br>${bill.villageName.toUpperCase()}.<br>State Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Tamil Nadu, Code : 33</td></tr>
        <tr style="text-align:center;font-size:10px"><td style="${B}">SI<br>No.</td><td style="${B}">Description of Goods</td><td style="${B}">Quantity</td><td style="${B}">Rate</td><td style="${B}">per</td><td style="${B}">Amount</td></tr>
        ${items.map((it, i) => `<tr><td style="${B}text-align:center">${i + 1}</td><td style="${B}font-weight:bold">${it.name.toUpperCase()} ${it.size.toUpperCase()}</td><td style="${B}text-align:center;font-weight:bold">${it.quantity} ${it.id.includes('_box') ? 'BOX' : 'BOTTLE'}${it.weight ? `<br><span style="font-size:9px;font-style:italic;font-weight:normal">(${it.weight})</span>` : ''}</td><td style="${B}text-align:right">${it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td style="${B}text-align:center">${it.id.includes('_box') ? 'BOX' : 'PCS'}</td><td style="${B}text-align:right;font-weight:bold">${(it.price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
        <tr><td style="${B}height:40px"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td></tr>
        <tr style="font-weight:bold"><td style="${B}"></td><td style="${B}text-align:right">Total</td><td style="${B}text-align:center">${totalQty}</td><td style="${B}"></td><td style="${B}"></td><td style="${B}text-align:right;font-size:12px">₹ ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td colspan="4" style="${B}"><span style="font-size:9px">Amount Chargeable (in words)</span><br><b style="font-style:italic">${numberToWordsINR(totalAmt)}</b></td><td colspan="2" style="${B}text-align:right;font-size:9px;vertical-align:bottom">E. & O.E</td></tr>
        <tr><td colspan="4" style="${B}font-size:9px;line-height:1.6"><u><b>Declaration</b></u><br>We declare that this invoice shows the actual price of<br>the goods described and that all particulars are true<br>and correct. TERMS AND CONDITIONS:&<br>1) Interest @ 24% per month will be charged on<br>overdue bills.<br>2) Shortage/damage claims must be reported<br>immediately on receipt.<br>3) Cheque /RTGS/NEFT/IMPS should be in the name<br>of NISHA OIL MILL only&<br>4) Rates are valid only for this invoice; future<br>supplies will be at prevailing rates.</td><td colspan="2" style="${B}text-align:right;vertical-align:top;font-size:10px"><b>for NISHA OIL MILL</b><div style="margin-top:50px;font-style:italic">Authorised Signatory</div></td></tr>
        <tr><td colspan="4" style="${B}font-size:9px;padding:6px 5px">Customer's Seal and Signature</td><td colspan="2" style="${B}"></td></tr>
        <tr><td colspan="6" style="${B}text-align:center;font-size:9px;padding:5px"><b>SUBJECT TO SALEM JURISDICTION</b><br>This is a Computer Generated Invoice</td></tr>
        </tbody></table></div>`;
        return page('ORIGINAL FOR RECIPIENT') + page('DUPLICATE FOR SUPPLIER');
    };

    const previewBill = (bill: Bill) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Preview Invoice-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:20px}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always;max-width:210mm;margin:0 auto;box-shadow:0 0 10px rgba(0,0,0,0.1)}.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill)}</body></html>`);
        w.document.close();
    };

    const openEditModal = (bill: Bill) => {
        setEditingBill(bill);
        setEditCart({ ...bill.cart });
        setEditRates({ ...(bill.customRates || {}) });
        setSearchQuery('');
        setSelectedCategory('All');
    };

    const handleSaveEdit = async () => {
        if (!editingBill) return;
        const finalCart: Record<string, number> = {};
        for (const [id, qty] of Object.entries(editCart)) {
            if (qty > 0) finalCart[id] = qty;
        }

        try {
            await api().put(`/api/bills/${editingBill.id}`, { cart: finalCart, custom_rates: editRates });
            showToast('Bill updated successfully', 'success');
            setEditingBill(null);
            loadUnverifiedBills();
        } catch {
            showToast('Failed to update bill', 'error');
        }
    };

    return (
        <div className={`space-y-8 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="flex items-center justify-between gap-6 flex-wrap">
                <div>
                    <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isAdmin ? 'Bill Verifications' : 'My Pending Bills'}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">
                        {isAdmin ? 'Pending Orders Awaiting Approval' : 'Orders awaiting Admin/Manager verification'}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border
                    ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {unverifiedBills.length} {isAdmin ? 'Pending' : 'In Queue'}
                </div>
            </div>

            {unverifiedBills.length === 0 ? (
                <div className={`py-20 text-center rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4 opacity-50">{isAdmin ? '📋' : '🕒'}</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isAdmin ? 'No bills awaiting verification' : 'No bills in queue'}
                    </p>
                    {!isAdmin && <p className="text-slate-500 mt-2 text-sm font-bold">Your submitted orders will appear here until verified.</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    {unverifiedBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(bill => (
                        <div key={bill.id}
                            className={`p-6 rounded-[30px] border transition-all 
                             ${isAdmin
                                    ? (isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50')
                                    : (isDark ? 'bg-slate-900 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-amber-50/50 border-amber-200 shadow-xl shadow-amber-500/10')
                                }`}>

                            <div className="grid grid-cols-12 gap-6 items-center">
                                {/* Details */}
                                <div className="col-span-12 md:col-span-4">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className={`font-black tracking-tight text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {bill.shopName}
                                        </p>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                            INV-{bill.invoiceNo}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{bill.villageName}</p>
                                </div>

                                {/* Meta Info */}
                                <div className="col-span-12 md:col-span-3">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isAdmin ? 'text-slate-400' : 'text-amber-500'}`}>
                                        {isAdmin ? 'Generated By' : 'Status'}
                                    </p>
                                    <p className={`text-sm font-black italic tracking-tighter ${isAdmin ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                                        {isAdmin ? (bill.createdBy || 'Unknown') : 'AWAITING VERIFICATION'}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                        {new Date(bill.date).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {/* Financials */}
                                <div className="col-span-6 md:col-span-2 text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Items</p>
                                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {getItemCount(bill.cart)}
                                    </p>
                                </div>

                                <div className="col-span-6 md:col-span-3 text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Value</p>
                                    <p className={`text-xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        ₹{getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div className={`mt-6 pt-6 border-t border-dashed flex items-center justify-end gap-3 
                                ${isAdmin ? 'border-slate-200 dark:border-white/10' : 'border-amber-200 dark:border-white/10'}`}>
                                <button
                                    onClick={() => previewBill(bill)}
                                    className={`p-2.5 rounded-xl transition-all border shrink-0
                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-400'}`}
                                    title="Preview PDF"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => openEditModal(bill)}
                                    className={`p-2.5 rounded-xl transition-all border shrink-0
                                        ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10' : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm hover:border-blue-400 hover:bg-blue-50'}`}
                                    title="Edit Bill"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleReject(bill.id)}
                                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                                >
                                    Reject / Discard
                                </button>
                                <button
                                    onClick={() => handleVerify(bill)}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
                                >
                                    Verify Bill ✓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Bill Modal */}
            {editingBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingBill(null)} />
                    <div className={`relative rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 border 
                        ${isAdmin
                            ? (isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100')
                            : (isDark ? 'bg-slate-900 border-amber-500/20' : 'bg-white border-slate-100')}`}>
                        {/* Header */}
                        <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Invoice No: {editingBill.invoiceNo}</h2>
                                <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">{editingBill.shopName} - {editingBill.villageName}</p>
                            </div>
                            <button onClick={() => setEditingBill(null)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Filters */}
                        <div className={`px-8 pb-4 flex gap-4 border-b shrink-0 ${isAdmin ? (isDark ? 'border-white/10' : 'border-slate-100') : (isDark ? 'border-amber-500/20' : 'border-slate-100')}`}>
                            <div className="relative flex-1">
                                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className={`w-full rounded-[20px] pl-10 pr-5 py-3 text-sm font-bold border outline-none transition-all
                                        ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 hover:border-slate-300'}`}
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className={`rounded-[20px] px-5 py-3 text-sm font-bold border outline-none cursor-pointer transition-all
                                    ${isDark ? 'bg-slate-800/50 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 hover:border-slate-300'}`}
                            >
                                <option value="All">All Categories</option>
                                {Array.from(new Set(getAllProducts().map(p => p.name))).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cart Modifier */}
                        <div className="p-8 overflow-y-auto hide-scrollbar flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getAllProducts()
                                    .filter(p => selectedCategory === 'All' || p.name === selectedCategory)
                                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.size.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(p => {
                                        const qty = editCart[p.id] || 0;
                                        const customRate = editRates[p.id] ?? p.price;
                                        return (
                                            <div key={p.id} className={`p-4 rounded-[24px] border flex flex-col justify-between transition-all ${isDark ? 'bg-slate-800/30 border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${qty > 0 ? (isDark ? 'border-amber-500/50 bg-amber-500/5' : 'border-blue-500/50 shadow-md bg-blue-50/50') : ''}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className={`font-black uppercase tracking-tight text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                                                        <div className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.brand} • {p.size}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rate: ₹</span>
                                                        <input
                                                            type="number"
                                                            value={customRate === 0 ? '' : customRate}
                                                            onChange={(e) => setEditRates((prev: Record<string, number>) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                                            className={`w-16 px-2 py-1.5 rounded-xl border text-xs font-black outline-none text-center transition-all focus:border-blue-500
                                                            ${isDark ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-inner'}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-white/5">
                                                    <div className={`font-black text-sm ${isAdmin ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-amber-400' : 'text-blue-600')}`}>
                                                        ₹{((customRate) * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-inner ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                                        <button
                                                            onClick={() => setEditCart((prev: Record<string, number>) => ({ ...prev, [p.id]: Math.max(0, qty - 1) }))}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white hover:shadow text-slate-600'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                        </button>
                                                        <div className={`w-8 text-center font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{qty}</div>
                                                        <button
                                                            onClick={() => setEditCart((prev: Record<string, number>) => ({ ...prev, [p.id]: qty + 1 }))}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white hover:shadow text-slate-600'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Footer Totals */}
                        <div className={`p-8 border-t shrink-0 flex items-center justify-between rounded-b-[40px] 
                            ${isAdmin ? (isDark ? 'bg-slate-900/90 border-white/10 backdrop-blur-md' : 'bg-slate-50/90 border-slate-200 backdrop-blur-md')
                                : (isDark ? 'bg-slate-900/90 border-amber-500/20 backdrop-blur-md' : 'bg-slate-50/90 border-slate-200 backdrop-blur-md')}`}>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Revised Total</p>
                                <p className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    ₹{getTotal(editCart, editRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-bold text-slate-500 ml-3 tracking-widest normal-case">({getItemCount(editCart)} items)</span>
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setEditingBill(null)}
                                    className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border
                                        ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillCheck;
