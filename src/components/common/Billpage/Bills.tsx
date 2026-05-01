import { useRef } from 'react';
import { invoiceHTML, type Bill } from '../../../utils/invoiceGenerator';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    invoiceNo: number;
    cart: Record<string, number>;
    customRates?: Record<string, number>;
    onNewOrder: () => void;
    onEditOrder: () => void;
    type?: 'admin' | 'staff';
    phone?: string;
    phone2?: string;
    deliveryDate?: string;
}

const Bills = ({ shopName, villageName, theme, invoiceNo, cart, customRates, onNewOrder, onEditOrder, type = 'admin', phone, phone2, deliveryDate }: Props) => {
    const isDark = theme === 'dark';
    const printRef = useRef<HTMLDivElement>(null);

    const mockBill: Bill = {
        id: invoiceNo,
        shopName,
        villageName,
        cart,
        customRates,
        date: new Date().toISOString(),
        deliveryDate: deliveryDate || new Date().toISOString(),
        invoiceNo,
        phone,
        phone2
    };

    const handlePDF = () => {
        const el = printRef.current;
        if (!el) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice-${shopName}</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}
@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}
td,th{border:none}
.bp{page-break-after:always}.bp:last-child{page-break-after:auto}
</style></head><body>${el.innerHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    };

    const primaryColor = type === 'admin' ? 'blue' : 'emerald';

    return (
        <div className={`min-h-screen pb-10 animate-in fade-in slide-in-from-right-5 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-8">
                <h2 className={`text-3xl md:text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Invoice Generated ✓
                </h2>
                <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
                    <button
                        onClick={handlePDF}
                        className={`flex-1 md:flex-none justify-center px-4 md:px-8 py-3 md:py-4 bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white font-black rounded-xl md:rounded-2xl text-xs md:text-sm uppercase tracking-widest transition-all shadow-xl shadow-${primaryColor}-600/30 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2`}
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>Download PDF</span>
                    </button>
                    <button onClick={onEditOrder} className={`flex-1 md:flex-none justify-center px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest border transition-all hover:-translate-y-0.5 active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            <span>Edit</span>
                        </span>
                    </button>
                    <button onClick={onNewOrder} className={`w-full md:w-auto justify-center px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest border transition-all hover:-translate-y-0.5 active:scale-95 ${isDark ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg'}`}>
                        New Order
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div 
                    ref={printRef} 
                    className="min-w-[800px]"
                    dangerouslySetInnerHTML={{ __html: invoiceHTML(mockBill, '') }}
                />
            </div>
            <style>{`.bp{border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.12); margin-bottom: 20px;}`}</style>
        </div>
    );
};

export default Bills;
