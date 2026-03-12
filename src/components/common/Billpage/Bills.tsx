import { useRef } from 'react';
import { getCartItems } from '../../../constants/productData';
import { numberToWordsINR } from '../../../utils/numberToWords';

interface Props {
    shopName: string;
    villageName: string;
    theme: string;
    invoiceNo: number;
    cart: Record<string, number>;
    onNewOrder: () => void;
    onEditOrder: () => void;
    type?: 'admin' | 'staff';
}

const Bills = ({ shopName, villageName, theme, invoiceNo, cart, onNewOrder, onEditOrder, type = 'admin' }: Props) => {
    const isDark = theme === 'dark';
    const printRef = useRef<HTMLDivElement>(null);
    const cartItems = getCartItems(cart);

    const totalQty = cartItems.reduce((a, i) => a + i.quantity, 0);
    const totalAmt = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    const d = new Date();
    const dateStr = `${d.getDate()}-${d.toLocaleString('en', { month: 'short' })}-${String(d.getFullYear()).slice(2)}`;
    const invNo = invoiceNo;

    const handlePDF = () => {
        const el = printRef.current;
        if (!el) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice-${shopName}</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}
@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}
td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}
.bp{page-break-after:always}.bp:last-child{page-break-after:auto}
</style></head><body>${el.innerHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    };

    const B: React.CSSProperties = { border: '1px solid #000', padding: '3px 5px', verticalAlign: 'top' };

    const renderPage = (label: string) => (
        <div className="bp" style={{ fontFamily: 'Arial,sans-serif', fontSize: '11px', color: '#000', background: '#fff', padding: '5mm', marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '44%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '20%' }} />
                </colgroup>
                <tbody>
                    {/* TITLE */}
                    <tr>
                        <td colSpan={6} style={{ ...B, textAlign: 'center', padding: '5px' }}>
                            <b style={{ fontSize: '14px', textDecoration: 'underline' }}>QUATATION</b>
                            <span style={{ marginLeft: '40px', fontSize: '9px', fontStyle: 'italic' }}>({label})</span>
                        </td>
                    </tr>

                    {/* COMPANY + INVOICE DETAILS */}
                    <tr>
                        <td colSpan={2} rowSpan={5} style={{ ...B, lineHeight: '1.6' }}>
                            <b style={{ fontSize: '12px' }}>NISHA OIL MILL</b><br />
                            Salem Main Road,Konganapuram,<br />
                            Edappadi[Tk],Salem[dt].<br />
                            FSSAI NO:12417018006626.<br />
                            State Name : Tamil Nadu, Code : 33<br />
                            Contact : 9965174472<br />
                            E-Mail : nishaoilmills.pvt.ltd@gmail.com
                        </td>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Invoice No.<br /><b style={{ fontSize: '11px' }}>{invNo}</b></td>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Dated<br /><b style={{ fontSize: '11px' }}>{dateStr}</b></td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Delivery Note</td>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Mode/Terms of Payment<br /><b>15 Days</b></td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Dispatch Doc No.</td>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Delivery Note Date</td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Dispatched through</td>
                        <td colSpan={2} style={{ ...B, fontSize: '10px' }}>Destination</td>
                    </tr>
                    <tr>
                        <td colSpan={4} style={{ ...B, fontSize: '10px' }}>Terms of Delivery</td>
                    </tr>

                    {/* BUYER */}
                    <tr>
                        <td colSpan={6} style={{ ...B, lineHeight: '1.6' }}>
                            <span style={{ fontSize: '9px' }}>Buyer (Bill to)</span><br />
                            <b style={{ fontSize: '12px' }}>{shopName.toUpperCase()}</b><br />
                            {villageName.toUpperCase()}.<br />
                            State Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Tamil Nadu, Code : 33
                        </td>
                    </tr>

                    {/* ITEMS HEADER */}
                    <tr style={{ textAlign: 'center', fontSize: '10px' }}>
                        <td style={B}>SI<br />No.</td>
                        <td style={B}>Description of Goods</td>
                        <td style={B}>Quantity</td>
                        <td style={B}>Rate</td>
                        <td style={B}>per</td>
                        <td style={B}>Amount</td>
                    </tr>

                    {/* ITEMS */}
                    {cartItems.map((item, i) => (
                        <tr key={item.id}>
                            <td style={{ ...B, textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ ...B, fontWeight: 'bold' }}>{item.brand !== 'Nisha' ? `${item.brand.toUpperCase()} ${item.size.toUpperCase()}` : `${item.name.toUpperCase()} ${item.size.toUpperCase()}`}</td>
                            <td style={{ ...B, textAlign: 'center', fontWeight: 'bold' }}>
                                {item.quantity} {item.id.includes('_box') ? 'BOX' : (item.unit === 'CAN' ? 'CANS' : (item.unit || 'UNIT').toUpperCase())}
                                {item.weight && <><br /><span style={{ fontSize: '9px', fontStyle: 'italic', fontWeight: 'normal' }}>({item.weight})</span></>}
                            </td>
                            <td style={{ ...B, textAlign: 'right' }}>{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td style={{ ...B, textAlign: 'center' }}>{item.id.includes('_box') ? 'BOX' : 'PCS'}</td>
                            <td style={{ ...B, textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    ))}

                    {/* EMPTY SPACE */}
                    <tr><td style={{ ...B, height: '60px' }}></td><td style={B}></td><td style={B}></td><td style={B}></td><td style={B}></td><td style={B}></td></tr>

                    {/* TOTAL */}
                    <tr style={{ fontWeight: 'bold' }}>
                        <td style={B}></td>
                        <td style={{ ...B, textAlign: 'right' }}>Total</td>
                        <td style={{ ...B, textAlign: 'center' }}>{totalQty}</td>
                        <td style={B}></td>
                        <td style={B}></td>
                        <td style={{ ...B, textAlign: 'right', fontSize: '12px' }}>₹ {totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>

                    {/* AMOUNT IN WORDS */}
                    <tr>
                        <td colSpan={4} style={B}>
                            <span style={{ fontSize: '9px' }}>Amount Chargeable (in words)</span><br />
                            <b style={{ fontStyle: 'italic' }}>{numberToWordsINR(totalAmt)}</b>
                        </td>
                        <td colSpan={2} style={{ ...B, textAlign: 'right', fontSize: '9px', verticalAlign: 'bottom' }}>E. & O.E</td>
                    </tr>

                    {/* DECLARATION + SIGNATURE */}
                    <tr>
                        <td colSpan={4} style={{ ...B, fontSize: '9px', lineHeight: '1.6' }}>
                            <u><b>Declaration</b></u><br />
                            We declare that this invoice shows the actual price of<br />
                            the goods described and that all particulars are true<br />
                            and correct. TERMS AND CONDITIONS:&<br />
                            1) Interest @ 24% per month will be charged on<br />
                            overdue bills.<br />
                            2) Shortage/damage claims must be reported<br />
                            immediately on receipt.<br />
                            3) Cheque /RTGS/NEFT/IMPS should be in the name<br />
                            of NISHA OIL MILL only&<br />
                            4) Rates are valid only for this invoice; future<br />
                            supplies will be at prevailing rates.
                        </td>
                        <td colSpan={2} style={{ ...B, textAlign: 'right', verticalAlign: 'top', fontSize: '10px' }}>
                            <b>for NISHA OIL MILL</b>
                            <div style={{ marginTop: '60px', fontStyle: 'italic' }}>Authorised Signatory</div>
                        </td>
                    </tr>

                    {/* CUSTOMER SEAL */}
                    <tr>
                        <td colSpan={4} style={{ ...B, fontSize: '9px', padding: '6px 5px' }}>Customer's Seal and Signature</td>
                        <td colSpan={2} style={B}></td>
                    </tr>

                    {/* FOOTER */}
                    <tr>
                        <td colSpan={6} style={{ ...B, textAlign: 'center', fontSize: '9px', padding: '5px' }}>
                            <b>SUBJECT TO SALEM JURISDICTION</b><br />
                            This is a Computer Generated Invoice
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

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
                <div ref={printRef} className="min-w-[800px]">
                    {renderPage('ORIGINAL FOR RECIPIENT')}
                    {renderPage('DUPLICATE FOR SUPPLIER')}
                </div>
            </div>
            <style>{`.bp{border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.12)}`}</style>
        </div>
    );
};

export default Bills;
