import { getCartItems } from '../constants/productData';
import { numberToWordsINR } from './numberToWords';

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
}

export const invoiceHTML = (bill: Bill, vehicleNo: string = '') => {
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
        
        // Use local time components to avoid UTC shift issues
        const day = d.getDate();
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day}-${months[m - 1]}-${y}`;
    };

    const dds = formatStringDate(bill.deliveryDate || bill.date || '');

    const B   = 'border:1px solid #000;padding:3px 5px;vertical-align:top;';
    const LR  = 'border-left:1px solid #000;border-right:1px solid #000;border-top:none;border-bottom:none;padding:3px 5px;vertical-align:top;';
    const LRB = 'border-left:1px solid #000;border-right:1px solid #000;border-top:none;border-bottom:1px solid #000;padding:3px 5px;vertical-align:top;';

    const itemRows = items.map((it, i) => {
        const desc = `${it.name.toUpperCase()} ${it.size.toUpperCase()}`;
        let u = (it.unit || 'NOS').toUpperCase();
        if (/\b15\s*(LTR|KG|L|T|TIN)\b/i.test(desc))              u = 'TIN';
        else if (/\b5\s*(LTR|KG|L|CAN)\b/i.test(desc))            u = 'CAN';
        else if (/\bBOX\b/i.test(desc) || it.id.includes('_box')) u = 'BOX';
        else if (it.id.endsWith('_ltr') && (it.size.toLowerCase() === '100 ml' || it.size.toLowerCase() === '200 ml' || it.size.toLowerCase() === '500 ml')) u = 'LTR';
        else if (/\b(100|200|500)\s*ML\b/i.test(desc))            u = 'PCS';
        else if (u === 'LITRE')                                    u = 'PCS';
        return `<tr>
            <td style="${LR}text-align:center;">${i + 1}</td>
            <td style="${LR}font-weight:bold;">${desc}</td>
            <td style="${LR}text-align:center;font-weight:bold;">${it.quantity} ${u}${it.weight ? `<br><span style="font-size:9px;font-weight:normal;font-style:italic;">(${it.weight})</span>` : ''}</td>
            <td style="${LR}text-align:right;">${it.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="${LR}text-align:center;">${u}</td>
            <td style="${LR}text-align:right;font-weight:bold;">${(it.price * it.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>`;
    }).join('');

    /*
     * EXACT LAYOUT (from image):
     * 6 cols: 4% | 44% | 13% | 13% | 6% | 20%
     *
     * HEADER:
     *  Row1: NISHA OIL MILL (col1+2, rowspan=5) | Invoice No (col3+4) | Dated (col5+6)
     *  Row2: (span)                              | Delivery Note       | Mode/Terms
     *  Row3: (span)                              | Dispatch Doc No.    | Delivery Note Date
     *  Row4: (span)                              | Dispatched through  | Destination
     *  Row5: (span)                              | Bill of Lading      | Motor Vehicle No.
     *  Row6: Buyer (Bill to) (col1+2)            | Terms of Delivery (col3+4+5+6, colspan=4)
     *
     * ITEMS → SPACER → TOTAL
     *
     * BOTTOM:
     *  RowA: Amount Chargeable (col1-4) | E. & O.E (col5+6)
     *  RowB: Declaration text (col1-6, full width)
     *  RowC: Customer's Seal (col1+2, colspan=2) | for NISHA OIL MILL + Authorised Signatory (col3-6, colspan=4)
     *
     * FOOTER: outside table, centered div
     */

    const page = (label: string) => `
<div class="bp" style="font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:6mm 8mm;">

<div style="position:relative;text-align:center;margin-bottom:4px;">
    <b style="font-size:14px;text-decoration:underline;">QUOTATION</b>
    <span style="position:absolute;right:0;top:0;font-size:10px;font-style:italic;font-weight:normal;">(${label})</span>
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
    <td style="${LRB}height:120px;"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
    <td style="${LRB}"></td>
</tr>

<!-- Total -->
<tr style="font-weight:bold;">
    <td style="${B}"></td>
    <td style="${B}text-align:right;">Total</td>
    <td style="${B}text-align:center;">${totalQty}</td>
    <td style="${B}"></td>
    <td style="${B}"></td>
    <td style="${B}text-align:right;font-size:12px;">&#8377; ${totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
</tr>

<!-- Amount + Declaration in ONE full-width cell; E.&O.E floated right (no internal column line) -->
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

</tbody>
</table>

<!-- Footer outside table -->
<div style="text-align:center;font-size:9px;margin-top:6px;line-height:1.8;">
    <b>SUBJECT TO SALEM JURISDICTION</b><br>
    This is a Computer Generated Invoice
</div>

</div>`;

    return page('ORIGINAL FOR RECIPIENT') + page('DUPLICATE FOR SUPPLIER');
};

export const generatePdfMobile = async (htmlContent: string, filename: string, isLandscape: boolean = false) => {
    console.log("[PDF Debug] Initiating mobile PDF generation:", filename);
    try {
        const html2pdf = await new Promise<any>((resolve, reject) => {
            if ((window as any).html2pdf) {
                resolve((window as any).html2pdf);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => resolve((window as any).html2pdf);
            script.onerror = (e) => reject(new Error("Failed to load PDF library: " + e));
            document.head.appendChild(script);
        });

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = isLandscape ? '297mm' : '210mm';
        container.style.background = '#ffffff';

        // Check if there are internal page-break directives in htmlContent or if it's already a full html page
        const needsWrappers = !htmlContent.includes('<style>');
        if (needsWrappers) {
            container.innerHTML = `
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
                    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    td, th { border: none; }
                    div.bp { 
                        page-break-after: always; 
                        padding: 6mm 8mm; 
                        box-sizing: border-box; 
                        width: 210mm; 
                        height: 297mm;
                        position: relative;
                    }
                    div.bp:last-child { page-break-after: auto; }
                </style>
                <div>${htmlContent}</div>
            `;
        } else {
            // For custom HTML pages (like loading sheet)
            container.innerHTML = htmlContent;
        }

        document.body.appendChild(container);

        const opt = {
            margin:       0,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: isLandscape ? 'landscape' : 'portrait' }
        };

        await html2pdf().from(container).set(opt).save();
        console.log("[PDF Debug] PDF download triggered successfully for mobile:", filename);
        document.body.removeChild(container);
    } catch (err) {
        console.error("[PDF Debug] Error generating mobile PDF:", err);
        alert("Unable to generate PDF file. Downloading backup text format instead...");
        
        // As a ultimate fallback, do a backup text file download so the user never loses data!
        const blob = new Blob([htmlContent.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.pdf', '.txt');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

export const downloadBill = (bill: Bill, vehicleNo: string = '') => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        generatePdfMobile(invoiceHTML(bill, vehicleNo), `Invoice-${bill.invoiceNo}-${bill.shopName.replace(/\s+/g, '_')}.pdf`);
    } else {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>Invoice-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:none}div.bp{page-break-after:always}div.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill, vehicleNo)}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    }
};

export const previewBill = (bill: Bill, vehicleNo: string = '') => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Preview-${bill.shopName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff;padding:20px}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:none}div.bp{page-break-after:always;max-width:210mm;margin:0 auto 30px;box-shadow:0 0 10px rgba(0,0,0,0.1)}div.bp:last-child{page-break-after:auto}</style></head><body>${invoiceHTML(bill, vehicleNo)}</body></html>`);
    w.document.close();
};

export const downloadAllFiltered = (filteredBills: Bill[], vehicleNo: string = '') => {
    if (filteredBills.length === 0) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const allHTML = filteredBills.map(b => invoiceHTML(b, vehicleNo)).join('');
    if (isMobile) {
        generatePdfMobile(allHTML, `All-Invoices.pdf`);
    } else {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>All Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:none}div.bp{page-break-after:always}div.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    }
};

export const downloadStaffBillsPdf = (staffBills: Bill[], staffName: string, vehicleNo: string = '') => {
    if (staffBills.length === 0) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const allHTML = staffBills.map(b => invoiceHTML(b, vehicleNo)).join('');
    if (isMobile) {
        generatePdfMobile(allHTML, `${staffName.replace(/\s+/g, '_')}-Invoices.pdf`);
    } else {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<html><head><title>${staffName} Invoices</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#000;background:#fff}@page{size:A4;margin:8mm}table{width:100%;border-collapse:collapse}td,th{border:none}div.bp{page-break-after:always}div.bp:last-child{page-break-after:auto}</style></head><body>${allHTML}</body></html>`);
        w.document.close();
        setTimeout(() => { w.print(); w.close(); }, 600);
    }
};
