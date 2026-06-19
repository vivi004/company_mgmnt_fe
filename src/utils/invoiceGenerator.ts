import { getCartItems } from '../constants/productData';
import { numberToWordsINR } from './numberToWords';
import * as qrcodeModule from 'qrcode-generator';

export interface Bill {
    id: number;
    shopName: string;
    villageName: string;
    areaName?: string;
    specificArea?: string;
    cart: Record<string, number>;
    customRates?: Record<string, number>;
    date: string;
    deliveryDate?: string;
    invoiceNo: number;
    createdBy?: string;
    phone?: string;
    phone2?: string;
    isEditedPrice?: boolean;
    old_balance?: number;
    oldBalance?: number;
}

interface InvoicePage {
    items: any[];
    startIndex: number;
    isFinal: boolean;
}

const MAX_ITEMS_WITH_FOOTER = 11;
const MAX_ITEMS_WITHOUT_FOOTER = 20;

const getUpiSettings = () => {
    const isClient = typeof window !== 'undefined';
    return {
        upiId1: isClient ? localStorage.getItem('upiId1') || 'nishaoilmills@ybl' : 'nishaoilmills@ybl',
        upiName1: isClient ? localStorage.getItem('upiName1') || 'NISHA OIL MILL' : 'NISHA OIL MILL',
        upiId2: isClient ? localStorage.getItem('upiId2') || 'nishaoilmills@okaxis' : 'nishaoilmills@okaxis',
        upiName2: isClient ? localStorage.getItem('upiName2') || 'NISHA OIL MILL' : 'NISHA OIL MILL',
    };
};

const generateQRCodeDataURL = (text: string): string => {
    try {
        let qrFn: any = qrcodeModule;
        if (qrFn && typeof qrFn.qrcode === 'function') {
            qrFn = qrFn.qrcode;
        } else if (typeof qrFn !== 'function' && qrFn && typeof qrFn.default === 'function') {
            qrFn = qrFn.default;
        }
        if (typeof qrFn !== 'function' && typeof window !== 'undefined' && (window as any).qrcode) {
            qrFn = (window as any).qrcode;
        }
        if (typeof qrFn !== 'function') {
            throw new Error('qrcode function is not defined in any of the resolved formats');
        }
        const qr = qrFn(0, 'M');
        qr.addData(text);
        qr.make();
        return qr.createDataURL(4, 1);
    } catch (e) {
        console.error('Error generating QR code', e);
        return '';
    }
};

const paginateItems = (allItems: any[]): InvoicePage[] => {
    const pages: InvoicePage[] = [];
    let currentIndex = 0;

    while (currentIndex < allItems.length) {
        const remainingCount = allItems.length - currentIndex;

        // 1. If remaining items fit on the final page, add them and complete
        if (remainingCount <= MAX_ITEMS_WITH_FOOTER) {
            pages.push({
                items: allItems.slice(currentIndex),
                startIndex: currentIndex + 1,
                isFinal: true
            });
            break;
        }

        // 2. Otherwise, create a non-final page
        let sliceSize = MAX_ITEMS_WITHOUT_FOOTER;

        // If slicing MAX_ITEMS_WITHOUT_FOOTER would leave 0 items for the next page, split them
        if (remainingCount - sliceSize <= 0) {
            sliceSize = MAX_ITEMS_WITH_FOOTER;
        } else if (remainingCount - sliceSize < 3) {
            // Avoid leaving only 1 or 2 items on the final page
            sliceSize = remainingCount - 5;
        }

        pages.push({
            items: allItems.slice(currentIndex, currentIndex + sliceSize),
            startIndex: currentIndex + 1,
            isFinal: false
        });
        currentIndex += sliceSize;
    }

    if (pages.length === 0) {
        pages.push({
            items: [],
            startIndex: 1,
            isFinal: true
        });
    }

    return pages;
};

export const invoiceHTML = (bill: Bill, vehicleNo: string = '') => {
    const upi = getUpiSettings();
    const upiLink1 = `upi://pay?pa=${upi.upiId1}&pn=${encodeURIComponent(upi.upiName1)}&cu=INR`;
    const upiLink2 = `upi://pay?pa=${upi.upiId2}&pn=${encodeURIComponent(upi.upiName2)}&cu=INR`;

    const items = getCartItems(bill.cart, bill.customRates).map(it => {
        const isLtrVariant = it.id.endsWith('_ltr');
        const sizeLower = it.size.toLowerCase();
        const is100ml = sizeLower === '100 ml';
        const is200ml = sizeLower === '200 ml';
        const is500ml = sizeLower === '500 ml';
        if (isLtrVariant && (is100ml || is200ml || is500ml)) {
            const multiplier = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
            return {
                ...it,
                quantity: it.quantity / multiplier,
                price: it.price * multiplier,
                unit: 'LTR'
            };
        }
        return it;
    });

    const totalQty = items.reduce((a, i) => a + i.quantity, 0);
    const totalAmt = items.reduce((a, i) => a + i.price * i.quantity, 0);

    const formatStringDate = (dStr: string) => {
        if (!dStr) return '';
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return dStr;
        const day = d.getDate();
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day}-${months[m - 1]}-${y}`;
    };

    const dds = formatStringDate(bill.deliveryDate || bill.date || '');

    const B = 'border:1px solid #000;padding:3px 5px;vertical-align:top;';
    const LR = 'border-left:1px solid #000;border-right:1px solid #000;border-top:none;border-bottom:none;padding:3px 5px;vertical-align:top;';
    const LRB = 'border-left:1px solid #000;border-right:1px solid #000;border-top:none;border-bottom:1px solid #000;padding:3px 5px;vertical-align:top;';

    const renderSinglePage = (
        pageItems: typeof items,
        startIndex: number,
        isFinal: boolean,
        pageLabel: string,
        pageNum: number,
        totalPages: number
    ) => {
        const oldBalVal = Number(bill.old_balance ?? bill.oldBalance ?? 0);
        const totalAmountVal = oldBalVal + totalAmt;
        const formattedOldBal = oldBalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const formattedTodayBill = totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const formattedTotalAmount = totalAmountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

        const itemRows = pageItems.map((it, i) => {
            const serialNo = startIndex + i;
            let desc = `${it.name.toUpperCase()} ${it.size.toUpperCase()}`;
            if (it.id === 'vs-gn-500ml-box' || it.id === 'vs-gn-1l-box') {
                desc = desc.replace(/\s*BOX$/i, '');
            }

            desc = desc.replace('1 BOX (50X100ML)', '100ML BOX');
            desc = desc.replace('1 BOX (25X200ML)', '200ML BOX');
            desc = desc.replace('1 BOX (20X500ML)', '500ML BOX');
            desc = desc.replace('1 BOX (10X1L)', '1LTR BOX');
            desc = desc.replace('1 BOX (5X2L)', '2LTR BOX');
            desc = desc.replace('1 LTR (10X100ML)', '100ML');
            desc = desc.replace('1 LTR (5X200ML)', '200ML');

            let u = (it.unit || 'NOS').toUpperCase();
            if (it.id === 'vs-gn-500ml-box' || it.id === 'vs-gn-1l-box' || it.id.endsWith('-box')) {
                u = 'BOX';
            } else if (/\b15\s*(LTR|KG|L|T|TIN)\b/i.test(desc)) u = 'TIN';
            else if (/\b5\s*(LTR|KG|L|CAN)\b/i.test(desc)) u = 'CAN';
            else if (/\bBOX\b/i.test(desc) || it.id.includes('_box')) u = 'BOX';
            else if (it.id.endsWith('_ltr') && (it.size.toLowerCase() === '100 ml' || it.size.toLowerCase() === '200 ml' || it.size.toLowerCase() === '500 ml')) u = 'LTR';
            else if (/\b(100|200|500)\s*ML\b/i.test(desc)) u = 'PCS';
            else if (u === 'LITRE') u = 'PCS';

            return `<tr>
                <td style="${LR}text-align:center;">${serialNo}</td>
                <td style="${LR}font-weight:bold;">${desc}</td>
                <td style="${LR}text-align:center;font-weight:bold;">${it.quantity} ${u}${it.weight ? `<br><span style="font-size:9px;font-weight:normal;font-style:italic;">(${it.weight})</span>` : ''}</td>
                <td style="${LR}text-align:right;">${it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td style="${LR}text-align:center;">${u}</td>
                <td style="${LR}text-align:right;font-weight:bold;">${(it.price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>`;
        }).join('');

        const numItems = pageItems.length;
        const spacerHeight = isFinal
            ? Math.max(0, 180 - numItems * 12)
            : Math.max(0, 320 - numItems * 13);

        const pageQty = pageItems.reduce((a, i) => a + i.quantity, 0);
        const pageAmt = pageItems.reduce((a, i) => a + i.price * i.quantity, 0);

        return `
<div class="bp" style="font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:6mm 8mm;">

<div style="position:relative;text-align:center;margin-bottom:4px;">
    <b style="font-size:14px;text-decoration:underline;">QUOTATION</b>
    <span style="position:absolute;right:0;top:0;font-size:10px;font-style:italic;font-weight:normal;">(${pageLabel})</span>
</div>

<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
<colgroup>
    <col style="width:4%"><col style="width:44%">
    <col style="width:13%"><col style="width:13%">
    <col style="width:6%"><col style="width:20%">
</colgroup>
<tbody>

<!-- Row 1: NISHA OIL MILL (rowspan=5) | Invoice No | Dated -->
<tr>
    <td colspan="2" rowspan="5" style="${B}line-height:1.7;vertical-align:top;">
        <b style="font-size:13px;">NISHA OIL MILL</b><br>
        Salem Main Road,Konganapuram,<br>
        Edappadi[Tk],Salem[dt].<br>
        FSSAI NO:12417018000626.<br>
        State Name : Tamil Nadu, Code : 33<br>
        Contact : 9965174472<br>
        E-Mail : nishaoilmills.pvt.ltd@gmail.com
    </td>
    <td colspan="2" style="${B}font-size:10px;">Invoice No.<br><b style="font-size:11px;">${bill.invoiceNo}</b></td>
    <td colspan="2" style="${B}font-size:10px;">Dated<br><b style="font-size:11px;">${dds}</b></td>
</tr>
<tr>
    <td colspan="2" style="${B}font-size:10px;">Delivery Note</td>
    <td colspan="2" style="${B}font-size:10px;">Mode/Terms of Payment<br><b>15 Days</b></td>
</tr>
<tr>
    <td colspan="2" style="${B}font-size:10px;">Dispatch Doc No.</td>
    <td colspan="2" style="${B}font-size:10px;">Delivery Note Date<br><b style="font-size:11px;"></b></td>
</tr>
<tr>
    <td colspan="2" style="${B}font-size:10px;">Dispatched through</td>
    <td colspan="2" style="${B}font-size:10px;">Destination</td>
</tr>
<tr>
    <td colspan="2" style="${B}font-size:10px;">Bill of Lading/LR-RR No.</td>
    <td colspan="2" style="${B}font-size:10px;">Motor Vehicle No.<br><b style="font-size:12px;">${vehicleNo.toUpperCase()}</b></td>
</tr>

<!-- Row 6: Buyer (left col1+2) | Terms of Delivery (right col3-6) -->
<tr>
    <td colspan="2" style="${B}line-height:1.7;padding:5px 5px 8px;vertical-align:top;">
        <span style="font-size:9px;">Buyer (Bill to)</span><br>
        <b style="font-size:12px;">${bill.shopName.toUpperCase()}</b><br>
        ${(bill.specificArea || bill.areaName || bill.villageName).toUpperCase()}<br>
        ${bill.phone || bill.phone2 ? `Mobile No: ${bill.phone || bill.phone2}<br>` : ''}State Name&nbsp;&nbsp;&nbsp;&nbsp;: Tamil Nadu, Code : 33
    </td>
    <td colspan="4" style="${B}font-size:10px;vertical-align:top;">Terms of Delivery<br><b style="font-size:12px;">IMMEDIATE - COD/UPI</b></td>
</tr>

<!-- Column headers -->
<tr style="text-align:center;font-size:10px;">
    <td style="${B}">Sl<br>No.</td>
    <td style="${B}">Description of Goods</td>
    <td style="${B}">Quantity</td>
    <td style="${B}">Rate</td>
    <td style="${B}">per</td>
    <td style="${B}">Amount</td>
</tr>

<!-- Item rows -->
${itemRows}

<!-- Spacer row -->
<tr>
    <td style="${LRB}height:${spacerHeight}px;"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
</tr>

<!-- Total or Subtotal -->
${isFinal ? `
<tr style="font-weight:bold;">
    <td style="${B}"></td>
    <td style="${B}text-align:right;font-size:14px;">Total</td>
    <td style="${B}text-align:center;font-size:14px;">${totalQty}</td>
    <td style="${B}"></td>
    <td style="${B}"></td>
    <td style="${B}text-align:right;font-size:20px;font-weight:bold;">&#8377; ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
</tr>

<!-- Amount + Declaration in ONE full-width cell; E.&O.E floated right -->
<tr>
    <td colspan="6" style="${B}font-size:9px;padding:4px 5px;vertical-align:top;line-height:1.6;">
        <span style="float:right;font-size:9px;">E. &amp; O.E</span>
        Amount Chargeable (in words)<br>
        <b style="font-size:10px;">${numberToWordsINR(totalAmt)}</b><br>
        <u><b>Declaration</b></u><br>
        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. TERMS AND CONDITIONS:<br>
        1) Interest @ 24% per month will be charged on overdue bills.<br>
        2) Shortage/damage claims must be reported immediately on receipt.<br>
        3) Cheque /RTGS/NEFT/IMPS should be in the name of NISHA OIL MILL only<br>
        4) Rates are valid only for this invoice; future supplies will be at prevailing rates.
    </td>
</tr>

<!-- Customer's Seal (col1+2) | for NISHA OIL MILL + Authorised Signatory (col3-6) -->
<tr>
    <td colspan="2" style="${B}font-size:9px;padding:5px;vertical-align:top;min-height:60px;">
        Customer's Seal and Signature<br><br><br>
    </td>
    <td colspan="4" style="${B}font-size:10px;text-align:right;vertical-align:top;padding:5px;">
        <b>for NISHA OIL MILL</b>
        <div style="margin-top:40px;font-size:10px;">Authorised Signatory</div>
    </td>
</tr>
` : `
<tr style="font-weight:bold;">
    <td style="${B}"></td>
    <td style="${B}text-align:right;font-size:12px;">Page Subtotal</td>
    <td style="${B}text-align:center;font-size:12px;">${pageQty}</td>
    <td style="${B}"></td>
    <td style="${B}"></td>
    <td style="${B}text-align:right;font-size:12px;">&#8377; ${pageAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
</tr>
<tr>
    <td colspan="6" style="${B}text-align:center;font-weight:bold;font-size:11px;padding:12px;background:#f9f9f9;letter-spacing:1px;">
        *** Continued on Page ${pageNum + 1} ***
    </td>
</tr>
`}

</tbody>
</table>

<!-- Footer outside table -->
<div style="text-align:center;font-size:9px;margin-top:6px;line-height:1.8;">
    <b>SUBJECT TO SALEM JURISDICTION</b><br>
    <span style="font-size:10px;font-weight:bold;">Page ${pageNum} of ${totalPages}</span>
    ${isFinal ? `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; text-align: left;">
        <div style="display: flex; justify-content: flex-start; gap: 250px;">
            <div style="width: 85px; text-align: center;">
                <img src="${generateQRCodeDataURL(upiLink1)}" width="85" height="85" style="display: block; margin: 0 auto 3px;" alt="Scan to Pay 1" />
                <div style="font-size: 8px; font-weight: bold; line-height: 1.2; color: #333;">GPay/PhonePe/Paytm<br>${upi.upiId1}</div>
            </div>
            <div style="width: 85px; text-align: center;">
                <img src="${generateQRCodeDataURL(upiLink2)}" width="85" height="85" style="display: block; margin: 0 auto 3px;" alt="Scan to Pay 2" />
                <div style="font-size: 8px; font-weight: bold; line-height: 1.2; color: #333;">Scan & Pay<br>${upi.upiId2}</div>
            </div>
        </div>
        <div style="font-size: 11px; line-height: 1.6; color: #000; font-family: Arial, sans-serif; font-weight: bold;">
            <table style="border-collapse: collapse; text-align: right; width: 220px; font-size: 11px; font-weight: bold; line-height: 1.5; color: #000; font-family: Arial, sans-serif;">
                <tr>
                    <td style="text-align: left; padding: 2px 5px 2px 0;">Prev Bal</td>
                    <td style="padding: 2px 0 2px 5px;">: &#8377; ${formattedOldBal}</td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 2px 5px 2px 0;">Today Bill</td>
                    <td style="padding: 2px 0 2px 5px;">: &#8377; ${formattedTodayBill}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="text-align: left; padding: 4px 5px 2px 0;">Total Amount</td>
                    <td style="padding: 4px 0 2px 5px;">: &#8377; ${formattedTotalAmount}</td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 4px 5px 2px 0;">Collected</td>
                    <td style="border-bottom: 1.5px dotted #000; width: 100px; padding: 4px 0 2px 5px;">: &#8377; </td>
                </tr>
                <tr>
                    <td style="text-align: left; padding: 6px 5px 2px 0;">Remaining Bal</td>
                    <td style="border-bottom: 1.5px solid #000; padding: 6px 0 2px 5px;">: &#8377; </td>
                </tr>
            </table>
        </div>
    </div>
    ` : ''}
</div>

</div>`;
    };

    const invoicePages = paginateItems(items);

    const generateCopyHTML = (label: string) => {
        return invoicePages.map((pg, pageIdx) => {
            const pageNum = pageIdx + 1;
            const totalPages = invoicePages.length;
            const pageLabel = `${label} - Page ${pageNum} of ${totalPages}`;
            return renderSinglePage(pg.items, pg.startIndex, pg.isFinal, pageLabel, pageNum, totalPages);
        }).join('');
    };

    return generateCopyHTML('ORIGINAL FOR RECIPIENT') + generateCopyHTML('DUPLICATE FOR SUPPLIER');
};

const printStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
    @page { size: A4; margin: 8mm; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: none; }
    div.bp { page-break-after: always; }
    div.bp:last-child { page-break-after: auto; }
    @media print {
        body { padding: 0 !important; }
        div.bp { padding: 2mm 0 !important; box-shadow: none !important; margin: 0 !important; }
    }
`;

export const downloadBill = (bill: Bill, vehicleNo: string = '') => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Invoice-${bill.shopName}</title><style>${printStyles}</style></head><body>${invoiceHTML(bill, vehicleNo)}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};

export const previewBill = (bill: Bill, vehicleNo: string = '') => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Preview-${bill.shopName}</title><style>${printStyles} body { padding: 20px; } div.bp { max-width: 210mm; margin: 0 auto 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }</style></head><body>${invoiceHTML(bill, vehicleNo)}</body></html>`);
    w.document.close();
};

export const downloadAllFiltered = (filteredBills: Bill[], vehicleNo: string = '') => {
    if (filteredBills.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const allHTML = filteredBills.map(b => invoiceHTML(b, vehicleNo)).join('');
    w.document.write(`<html><head><title>All Invoices</title><style>${printStyles}</style></head><body>${allHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};

export const downloadStaffBillsPdf = (staffBills: Bill[], staffName: string, vehicleNo: string = '') => {
    if (staffBills.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const allHTML = staffBills.map(b => invoiceHTML(b, vehicleNo)).join('');
    w.document.write(`<html><head><title>${staffName} Invoices</title><style>${printStyles}</style></head><body>${allHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};

const staffDataPrintStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; padding: 10mm; }
    @page { size: A4; margin: 10mm; }
    .data-container {
        column-count: 2;
        column-gap: 20px;
    }
    table { width: 100%; border-collapse: collapse; }
    div.data-page {
        width: 100%;
        page-break-inside: avoid;
        break-inside: avoid;
        display: inline-block;
    }
    @media print {
        body { padding: 0 !important; }
    }
`;

export const staffDataBillHTML = (bill: Bill) => {
    const items = getCartItems(bill.cart, bill.customRates).map(it => {
        const isLtrVariant = it.id.endsWith('_ltr');
        const sizeLower = it.size.toLowerCase();
        const is100ml = sizeLower === '100 ml';
        const is200ml = sizeLower === '200 ml';
        const is500ml = sizeLower === '500 ml';
        if (isLtrVariant && (is100ml || is200ml || is500ml)) {
            const multiplier = is100ml ? 10 : is200ml ? 5 : is500ml ? 2 : 1;
            return {
                ...it,
                quantity: it.quantity / multiplier,
                price: it.price * multiplier,
                unit: 'LTR'
            };
        }
        return it;
    });

    const itemRows = items.map((it, i) => {
        const serialNo = i + 1;
        let desc = `${it.name.toUpperCase()} ${it.size.toUpperCase()}`;
        if (it.id === 'vs-gn-500ml-box' || it.id === 'vs-gn-1l-box') {
            desc = desc.replace(/\s*BOX$/i, '');
        }

        desc = desc.replace('1 BOX (50X100ML)', '100ML BOX');
        desc = desc.replace('1 BOX (25X200ML)', '200ML BOX');
        desc = desc.replace('1 BOX (20X500ML)', '500ML BOX');
        desc = desc.replace('1 BOX (10X1L)', '1LTR BOX');
        desc = desc.replace('1 BOX (5X2L)', '2LTR BOX');
        desc = desc.replace('1 LTR (10X100ML)', '100ML');
        desc = desc.replace('1 LTR (5X200ML)', '200ML');

        let u = (it.unit || 'NOS').toUpperCase();
        if (it.id === 'vs-gn-500ml-box' || it.id === 'vs-gn-1l-box' || it.id.endsWith('-box')) {
            u = 'BOX';
        } else if (/\b15\s*(LTR|KG|L|T|TIN)\b/i.test(desc)) u = 'TIN';
        else if (/\b5\s*(LTR|KG|L|CAN)\b/i.test(desc)) u = 'CAN';
        else if (/\bBOX\b/i.test(desc) || it.id.includes('_box')) u = 'BOX';
        else if (it.id.endsWith('_ltr') && (it.size.toLowerCase() === '100 ml' || it.size.toLowerCase() === '200 ml' || it.size.toLowerCase() === '500 ml')) u = 'LTR';
        else if (/\b(100|200|500)\s*ML\b/i.test(desc)) u = 'PCS';
        else if (u === 'LITRE') u = 'PCS';

        return `<tr>
            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-size: 13px;">${serialNo}</td>
            <td style="border: 1px solid #000; padding: 6px 8px; font-weight: bold; font-size: 13px;">${desc}</td>
            <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-weight: bold; font-size: 14px;">${it.quantity} ${u}</td>
        </tr>`;
    }).join('');

    return `
    <div class="data-page" style="font-family: Arial, sans-serif; padding: 10px; margin-bottom: 25px; border-bottom: 2px dashed #333; page-break-inside: avoid;">
        <h2 style="font-size: 18px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase;">
            ${bill.shopName} <span style="font-size: 13px; font-weight: normal; color: #555;">(${bill.specificArea || bill.areaName || bill.villageName || ''})</span>
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 6px 8px; width: 8%; font-size: 12px; text-transform: uppercase;">Sl</th>
                    <th style="border: 1px solid #000; padding: 6px 8px; text-align: left; font-size: 12px; text-transform: uppercase;">Product Name</th>
                    <th style="border: 1px solid #000; padding: 6px 8px; width: 25%; font-size: 12px; text-transform: uppercase;">Qty</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>
    </div>
    `;
};

export const downloadStaffDataPdf = (staffBills: Bill[], title: string) => {
    if (staffBills.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const allHTML = `<div class="data-container">` + staffBills.map(b => staffDataBillHTML(b)).join('') + `</div>`;
    w.document.write(`<html><head><title>${title} Data</title><style>${staffDataPrintStyles}</style></head><body>${allHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
};
