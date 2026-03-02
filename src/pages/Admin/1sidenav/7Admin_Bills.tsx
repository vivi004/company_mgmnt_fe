import { useState, useRef, useEffect } from 'react';
import { getAllProducts } from '../../../constants/productData';
import { numberToWordsINR } from '../../../utils/numberToWords';

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
    bills: Bill[];
    theme: string;
    onDeleteBill: (id: number) => void;
    onClearAll: () => void;
    onEditBill: (id: number, newCart: Record<string, number>, newRates?: Record<string, number>) => void;
}

const AdminBills = ({ bills, theme, onDeleteBill, onClearAll, onEditBill }: Props) => {
    const isDark = theme === 'dark';
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentCalDate, setCurrentCalDate] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    // Edit Modal State
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [editCart, setEditCart] = useState<Record<string, number>>({});
    const [editRates, setEditRates] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredBills = selectedDate
        ? bills.filter(b => b.date.startsWith(selectedDate))
        : bills;

    const groupedBills = filteredBills.reduce((acc, bill) => {
        const creator = bill.createdBy || 'Admin';
        if (!acc[creator]) acc[creator] = [];
        acc[creator].push(bill);
        return acc;
    }, {} as Record<string, Bill[]>);

    const getTotal = (cart: Record<string, number>, customRates?: Record<string, number>) =>
        getAllProducts().reduce((sum, p) => sum + (cart[p.id] || 0) * (customRates?.[p.id] ?? p.price), 0);

    const getItemCount = (cart: Record<string, number>) =>
        Object.values(cart).reduce((s, q) => s + q, 0);

    /* ── Build single invoice HTML ── */
    const invoiceHTML = (bill: Bill) => {
        const items = getAllProducts().filter(p => bill.cart[p.id]).map(p => ({ ...p, qty: bill.cart[p.id], activePrice: bill.customRates?.[p.id] ?? p.price }));
        const totalQty = items.reduce((a, i) => a + i.qty, 0);
        const totalAmt = items.reduce((a, i) => a + i.activePrice * i.qty, 0);
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
        ${items.map((it, i) => `<tr><td style="${B}text-align:center">${i + 1}</td><td style="${B}font-weight:bold">${it.name.toUpperCase()} ${it.size.toUpperCase()}</td><td style="${B}text-align:center;font-weight:bold">${it.qty} ${it.unit}${it.weight ? `<br><span style="font-size:9px;font-style:italic;font-weight:normal">(${it.weight})</span>` : ''}</td><td style="${B}text-align:right">${it.activePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td style="${B}text-align:center">${it.unit}</td><td style="${B}text-align:right;font-weight:bold">${(it.activePrice * it.qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
        <tr><td style="${B}height:40px"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td><td style="${B}"></td></tr>
        <tr style="font-weight:bold"><td style="${B}"></td><td style="${B}text-align:right">Total</td><td style="${B}text-align:center">${totalQty}</td><td style="${B}"></td><td style="${B}"></td><td style="${B}text-align:right;font-size:12px">₹ ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td colspan="4" style="${B}"><span style="font-size:9px">Amount Chargeable (in words)</span><br><b style="font-style:italic">${numberToWordsINR(totalAmt)}</b></td><td colspan="2" style="${B}text-align:right;font-size:9px;vertical-align:bottom">E. & O.E</td></tr>
        <tr><td colspan="4" style="${B}font-size:9px;line-height:1.6"><u><b>Declaration</b></u><br>We declare that this invoice shows the actual price of<br>the goods described and that all particulars are true<br>and correct. TERMS AND CONDITIONS:&<br>1) Interest @ 24% per month will be charged on<br>overdue bills.<br>2) Shortage/damage claims must be reported<br>immediately on receipt.<br>3) Cheque /RTGS/NEFT/IMPS should be in the name<br>of NISHA OIL MILL only&<br>4) Rates are valid only for this invoice; future<br>supplies will be at prevailing rates.</td><td colspan="2" style="${B}text-align:right;vertical-align:top;font-size:10px"><b>for NISHA OIL MILL</b><div style="margin-top:50px;font-style:italic">Authorised Signatory</div></td></tr>
        <tr><td colspan="4" style="${B}font-size:9px;padding:6px 5px">Customer's Seal and Signature</td><td colspan="2" style="${B}"></td></tr>
        <tr><td colspan="6" style="${B}text-align:center;font-size:9px;padding:5px"><b>SUBJECT TO SALEM JURISDICTION</b><br>This is a Computer Generated Invoice</td></tr>
        </tbody></table></div>`;
        return page('ORIGINAL FOR RECIPIENT') + page('DUPLICATE FOR SUPPLIER');
    };

    const downloadBill = (bill: Bill) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill)}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
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

    const handleSaveEdit = () => {
        if (!editingBill) return;
        // Strip items with 0 qty
        const finalCart: Record<string, number> = {};
        for (const [id, qty] of Object.entries(editCart)) {
            if (qty > 0) finalCart[id] = qty;
        }
        onEditBill(editingBill.id, finalCart, editRates);
        setEditingBill(null);
    };

    // Calendar Logic
    const minDate = new Date('2025-03-01T00:00:00');
    const maxDate = new Date('2026-04-30T23:59:59');
    const todayStr = new Date().toISOString().split('T')[0];

    const generateCalendarDays = () => {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // empty slots before month starts
        for (let i = 0; i < firstDay; i++) days.push(null);
        // actual days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const handlePrevMonth = () => {
        const prev = new Date(currentCalDate);
        prev.setMonth(prev.getMonth() - 1);
        if (prev >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
            setCurrentCalDate(prev);
        }
    };

    const handleNextMonth = () => {
        const next = new Date(currentCalDate);
        next.setMonth(next.getMonth() + 1);
        if (next <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
            setCurrentCalDate(next);
        }
    };

    const handleDateSelect = (date: Date) => {
        // Adjust for timezone offset to get local YYYY-MM-DD reliably
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        setSelectedDate(offsetDate.toISOString().split('T')[0]);
        setIsCalendarOpen(false);
    };

    const downloadAll = () => {
        if (filteredBills.length === 0) return;
        const w = window.open('', '_blank');
        if (!w) return;
        const allHTML = filteredBills.map(b => invoiceHTML(b)).join('');
        w.document.write(`<html><head><title>All Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    };

    const downloadStaffBills = (staffBills: Bill[], staffName: string) => {
        if (staffBills.length === 0) return;
        const w = window.open('', '_blank');
        if (!w) return;
        const allHTML = staffBills.map(b => invoiceHTML(b)).join('');
        w.document.write(`<html><head><title>${staffName} Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-6">
                    <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {filteredBills.length} invoice{filteredBills.length !== 1 ? 's' : ''} stored
                    </p>

                    <div className="relative flex items-center" ref={calendarRef}>
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`flex items-center gap-3 pl-4 pr-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest outline-none border transition-all shadow-sm
                                ${isDark
                                    ? 'bg-slate-800 border-white/10 text-white hover:border-blue-500/50'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-blue-500 hover:shadow-md'}
                                ${isCalendarOpen ? (isDark ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-blue-500 ring-2 ring-blue-500/20') : ''}`}
                        >
                            <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date Filter'}
                        </button>

                        {/* Custom Dropdown Calendar */}
                        {isCalendarOpen && (
                            <div className={`absolute top-full right-0 lg:left-0 mt-3 p-5 rounded-[30px] shadow-2xl z-50 w-80 border animate-in slide-in-from-top-2 fade-in duration-200
                                ${isDark ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>

                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <button onClick={handlePrevMonth} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className={`font-black uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <button onClick={handleNextMonth} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>

                                {/* Calendar Days Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className={`text-[10px] font-black uppercase tracking-wider py-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
                                    ))}
                                    {generateCalendarDays().map((date, i) => {
                                        if (!date) return <div key={`empty-${i}`} className="h-9" />;

                                        const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                        const isSelected = dateStr === selectedDate;
                                        const isToday = dateStr === todayStr;
                                        const isOOB = date < minDate || date > maxDate;

                                        return (
                                            <button
                                                key={i}
                                                disabled={isOOB}
                                                onClick={() => handleDateSelect(date)}
                                                className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                                                    ${isOOB ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}
                                                    ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-black scale-110'
                                                        : (isDark
                                                            ? (isToday ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800')
                                                            : (isToday ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'))}
                                                `}
                                            >
                                                {date.getDate()}
                                                {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className={`text-[9px] text-center font-bold italic pt-3 border-t mt-2 ${isDark ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                                    Data available Mar 2025 – Apr 2026
                                </div>
                            </div>
                        )}

                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate('')}
                                className={`ml-3 p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                                title="Clear date filter"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={downloadAll}
                        disabled={filteredBills.length === 0}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download All PDF
                    </button>
                    <button
                        onClick={onClearAll}
                        disabled={bills.length === 0}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-red-500 hover:text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Bills Table */}
            {filteredBills.length === 0 ? (
                <div className={`text-center py-20 rounded-[40px] border ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="text-5xl mb-4">📄</div>
                    <p className={`font-black text-xl italic ${isDark ? 'text-white' : 'text-slate-900'}`}>No Bills Found</p>
                    <p className="text-slate-500 mt-2 font-medium">
                        {selectedDate ? "No bills match the selected date." : "Place orders from Order Lines to see bills here"}
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedBills).map(([staffName, staffBills]) => (
                        <div key={staffName} className="space-y-4">
                            {/* Staff Header */}
                            <div className="flex items-center justify-between px-2">
                                <h3 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {staffName}'s Bills
                                </h3>
                                <button
                                    onClick={() => downloadStaffBills(staffBills, staffName)}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>

                            <div className={`rounded-[40px] border overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                                {/* Header */}
                                <div className={`grid grid-cols-12 gap-4 px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b
                                    ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                    <div className="col-span-1">S.No</div>
                                    <div className="col-span-3">Shop Name</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-1">Items</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-3 text-right">Actions</div>
                                </div>

                                {/* Rows */}
                                {staffBills.map((bill, idx) => (
                                    <div
                                        key={bill.id}
                                        className={`grid grid-cols-12 gap-4 px-8 py-5 items-center border-b transition-all
                                            ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-blue-50/30'}`}
                                    >
                                        <div className={`col-span-1 font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{idx + 1}</div>
                                        <div className="col-span-3">
                                            <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{bill.shopName}</p>
                                            <p className="text-xs text-slate-500 font-medium">{bill.villageName}</p>
                                        </div>
                                        <div className={`col-span-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </div>
                                        <div className={`col-span-1 font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {getItemCount(bill.cart)}
                                        </div>
                                        <div className={`col-span-2 text-right font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{getTotal(bill.cart, bill.customRates).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="col-span-3 flex justify-end gap-2">
                                            <button
                                                onClick={() => previewBill(bill)}
                                                className={`p-2.5 rounded-xl transition-all border shrink-0
                                                    ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm hover:border-slate-400'}`}
                                                title="Preview PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => downloadBill(bill)}
                                                className="px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center shrink-0"
                                                title="Download PDF"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => onDeleteBill(bill.id)}
                                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-xl transition-all border border-red-500/20 active:scale-90 shrink-0"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Bill Modal */}
            {editingBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingBill(null)} />
                    <div className={`relative rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
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
                        <div className={`px-8 pb-4 flex gap-4 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
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
                                            <div key={p.id} className={`p-4 rounded-[24px] border flex flex-col justify-between transition-all ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${qty > 0 ? (isDark ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-500/50 shadow-md bg-blue-50/50') : ''}`}>
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
                                                            onChange={(e) => setEditRates(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                                                            className={`w-16 px-2 py-1.5 rounded-xl border text-xs font-black outline-none text-center transition-all focus:border-blue-500
                                                            ${isDark ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-inner'}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-slate-200 dark:border-white/5">
                                                    <div className={`font-black text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        ₹{((customRate) * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-inner ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                                        <button
                                                            onClick={() => setEditCart(prev => ({ ...prev, [p.id]: Math.max(0, qty - 1) }))}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-white hover:shadow text-slate-600'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                        </button>
                                                        <div className={`w-8 text-center font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{qty}</div>
                                                        <button
                                                            onClick={() => setEditCart(prev => ({ ...prev, [p.id]: qty + 1 }))}
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
                        <div className={`p-8 border-t shrink-0 flex items-center justify-between rounded-b-[40px] ${isDark ? 'bg-slate-900/90 border-white/10 backdrop-blur-md' : 'bg-slate-50/90 border-slate-200 backdrop-blur-md'}`}>
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

export default AdminBills;
