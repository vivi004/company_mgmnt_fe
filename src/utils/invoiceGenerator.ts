import { getAllProducts } from '../constants/productData';
import { numberToWordsINR } from './numberToWords';

export interface Bill {
    id: number;
    shopName: string;
    villageName: string;
    cart: Record<string, number>;
    customRates?: Record<string, number>;
    date: string;
    invoiceNo: number;
    createdBy?: string;
}

export const invoiceHTML = (bill: Bill) => {
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

export const downloadBill = (bill: Bill) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Invoice-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill)}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};

export const previewBill = (bill: Bill) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Preview Invoice-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:20px}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always;max-width:210mm;margin:0 auto;box-shadow:0 0 10px rgba(0,0,0,0.1)}.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill)}</body></html>`);
    w.document.close();
};

export const downloadAllFiltered = (filteredBills: Bill[]) => {
    if (filteredBills.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const allHTML = filteredBills.map(b => invoiceHTML(b)).join('');
    w.document.write(`<html><head><title>All Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};

export const downloadStaffBillsPdf = (staffBills: Bill[], staffName: string) => {
    if (staffBills.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const allHTML = staffBills.map(b => invoiceHTML(b)).join('');
    w.document.write(`<html><head><title>${staffName} Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:1px solid #000;padding:3px 5px;vertical-align:top}.bp{page-break-after:always}.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};
