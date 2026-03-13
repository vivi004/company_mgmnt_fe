import { useState, useMemo, useCallback } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import { useToast } from '../../../components/Toast';
import { getAllProducts } from '../../../constants/productData';

interface RawBill {
    id: number;
    shop_name: string;
    village_name: string;
    cart: Record<string, number>;
    custom_rates: Record<string, number>;
    created_by: string;
    bill_date: string;
    invoice_no: number;
    status: string;
}

export interface StaffRow {
    name: string;
    totalOrders: number;
    totalAmount: number;
    avgOrderValue: number;
    lastSaleDate: string;
}

export interface DailyData {
    date: string;
    totalAmount: number;
    orderCount: number;
}

function computeBillTotal(cart: Record<string, number>, customRates: Record<string, number>): number {
    const products = getAllProducts();
    let total = 0;
    for (const p of products) {
        const qty = cart[p.id] || 0;
        if (qty > 0) {
            const rate = customRates?.[p.id] ?? p.price;
            total += rate * qty;
        }
    }
    return total;
}

function getTodayLocal(): string {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

function getMonthStartLocal(): string {
    const d = new Date();
    const ms = new Date(d.getFullYear(), d.getMonth(), 1);
    return new Date(ms.getTime() - ms.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}

export const useAdminSales = () => {
    const [bills, setBills] = useState<RawBill[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getMonthStartLocal());
    const [endDate, setEndDate] = useState(getTodayLocal());
    const [searchQuery, setSearchQuery] = useState('');
    const [minSalesFilter, setMinSalesFilter] = useState(0);
    const [sortBy, setSortBy] = useState<'amount' | 'orders'>('amount');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'individual' | 'overall'>('individual');
    const [compareStaff, setCompareStaff] = useState<[string, string]>(['', '']);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { toasts, showToast, removeToast } = useToast();
    const api = () => getAuthAxios();

    const fetchSalesData = useCallback(async () => {
        setLoading(true);
        try {
            let billsData: RawBill[];
            try {
                // Try the new date-range endpoint first
                const res = await api().get('/api/bills/date-range', {
                    params: { startDate, endDate }
                });
                billsData = res.data;
            } catch {
                // Fallback: use existing /api/bills and filter client-side
                const res = await api().get('/api/bills');
                const allBills: RawBill[] = res.data;
                billsData = allBills.filter(b => {
                    if (b.status !== 'Verified') return false;
                    const d = new Date(b.bill_date);
                    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    if (startDate && localDate < startDate) return false;
                    if (endDate && localDate > endDate) return false;
                    return true;
                });
            }
            setBills(billsData);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error fetching sales data:', err);
            showToast('Failed to load sales data', 'error');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    // Compute bill totals
    const billsWithTotals = useMemo(() =>
        bills.map(b => ({
            ...b,
            total: computeBillTotal(b.cart, b.custom_rates),
            staffName: b.created_by || 'Admin',
            localDate: (() => {
                const d = new Date(b.bill_date);
                return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            })()
        })),
    [bills]);

    // Summary cards
    const summary = useMemo(() => {
        const totalSales = billsWithTotals.reduce((s, b) => s + b.total, 0);
        const totalOrders = billsWithTotals.length;
        const avgValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        const staffTotals: Record<string, number> = {};
        billsWithTotals.forEach(b => {
            staffTotals[b.staffName] = (staffTotals[b.staffName] || 0) + b.total;
        });
        const bestStaff = Object.entries(staffTotals).sort((a, b) => b[1] - a[1])[0];

        return {
            totalSales,
            totalOrders,
            avgValue,
            bestStaff: bestStaff ? { name: bestStaff[0], amount: bestStaff[1] } : null
        };
    }, [billsWithTotals]);

    // Staff rows
    const allStaffRows = useMemo((): StaffRow[] => {
        const map: Record<string, { orders: number; amount: number; lastDate: string }> = {};
        billsWithTotals.forEach(b => {
            if (!map[b.staffName]) {
                map[b.staffName] = { orders: 0, amount: 0, lastDate: b.localDate };
            }
            map[b.staffName].orders += 1;
            map[b.staffName].amount += b.total;
            if (b.localDate > map[b.staffName].lastDate) map[b.staffName].lastDate = b.localDate;
        });

        return Object.entries(map).map(([name, d]) => ({
            name,
            totalOrders: d.orders,
            totalAmount: d.amount,
            avgOrderValue: d.orders > 0 ? d.amount / d.orders : 0,
            lastSaleDate: d.lastDate
        }));
    }, [billsWithTotals]);

    // Filtered + sorted staff rows
    const staffRows = useMemo(() => {
        let rows = [...allStaffRows];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            rows = rows.filter(r => r.name.toLowerCase().includes(q));
        }
        if (minSalesFilter > 0) {
            rows = rows.filter(r => r.totalAmount >= minSalesFilter);
        }
        rows.sort((a, b) => {
            const valA = sortBy === 'amount' ? a.totalAmount : a.totalOrders;
            const valB = sortBy === 'amount' ? b.totalAmount : b.totalOrders;
            return sortDir === 'desc' ? valB - valA : valA - valB;
        });
        return rows;
    }, [allStaffRows, searchQuery, minSalesFilter, sortBy, sortDir]);

    // Paginated staff rows
    const paginatedStaffRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return staffRows.slice(start, start + pageSize);
    }, [staffRows, currentPage]);

    const totalPages = Math.ceil(staffRows.length / pageSize);

    // Daily data for line chart
    const dailyData = useMemo((): DailyData[] => {
        const map: Record<string, { amount: number; count: number }> = {};
        billsWithTotals.forEach(b => {
            if (!map[b.localDate]) map[b.localDate] = { amount: 0, count: 0 };
            map[b.localDate].amount += b.total;
            map[b.localDate].count += 1;
        });
        return Object.entries(map)
            .map(([date, d]) => ({ date, totalAmount: d.amount, orderCount: d.count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [billsWithTotals]);

    // Top 5 staff
    const top5Staff = useMemo(() =>
        [...allStaffRows].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5),
    [allStaffRows]);

    // Low performers (bottom 20% or below avg)
    const lowPerformers = useMemo(() => {
        if (allStaffRows.length === 0) return [];
        const avg = allStaffRows.reduce((s, r) => s + r.totalAmount, 0) / allStaffRows.length;
        return allStaffRows.filter(r => r.totalAmount < avg * 0.5);
    }, [allStaffRows]);

    // Staff comparison
    const comparisonData = useMemo(() => {
        if (!compareStaff[0] || !compareStaff[1]) return null;
        const a = allStaffRows.find(r => r.name === compareStaff[0]);
        const b = allStaffRows.find(r => r.name === compareStaff[1]);
        if (!a || !b) return null;
        return [a, b];
    }, [compareStaff, allStaffRows]);

    // Unique staff names
    const staffNames = useMemo(() => allStaffRows.map(r => r.name), [allStaffRows]);

    // Export CSV
    const exportCSV = useCallback(() => {
        const headers = ['Staff Name', 'Total Orders', 'Total Sales', 'Avg Order Value', 'Last Sale Date'];
        const csvRows = [headers.join(',')];
        staffRows.forEach(r => {
            csvRows.push([
                `"${r.name}"`, r.totalOrders, r.totalAmount.toFixed(2), r.avgOrderValue.toFixed(2), r.lastSaleDate
            ].join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${startDate}_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported successfully', 'success');
    }, [staffRows, startDate, endDate]);

    // Export PDF
    const exportPDF = useCallback(() => {
        const w = window.open('', '_blank');
        if (!w) return;
        const totalSales = staffRows.reduce((s, r) => s + r.totalAmount, 0);
        const totalOrders = staffRows.reduce((s, r) => s + r.totalOrders, 0);
        const html = `
        <html><head><title>Sales Report</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#000}
        h1{text-align:center;margin-bottom:5px}h3{text-align:center;color:#666;margin-bottom:20px;font-weight:normal}
        table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #000;padding:8px;text-align:left}
        th{background:#1e293b;color:white;font-size:12px;text-transform:uppercase}td{font-size:13px}
        .summary{display:flex;gap:20px;margin-bottom:20px}.card{flex:1;border:1px solid #ddd;padding:15px;border-radius:8px;text-align:center}
        .card h4{font-size:11px;color:#666;text-transform:uppercase;margin-bottom:4px}.card p{font-size:18px;font-weight:bold}
        @page{size:A4 landscape;margin:10mm}</style></head><body>
        <h1>NISHA OIL MILL — Sales Report</h1>
        <h3>${startDate} to ${endDate}</h3>
        <div class="summary">
            <div class="card"><h4>Total Sales</h4><p>₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></div>
            <div class="card"><h4>Total Orders</h4><p>${totalOrders}</p></div>
            <div class="card"><h4>Avg Order Value</h4><p>₹${totalOrders > 0 ? (totalSales / totalOrders).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</p></div>
        </div>
        <table><thead><tr><th>#</th><th>Staff Name</th><th>Total Orders</th><th>Total Sales (₹)</th><th>Avg Order (₹)</th><th>Last Sale</th></tr></thead>
        <tbody>${staffRows.map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.totalOrders}</td><td>${r.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td>${r.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td>${r.lastSaleDate}</td></tr>`).join('')}
        </tbody></table></body></html>`;
        w.document.write(html);
        w.document.close();
        setTimeout(() => { w.print(); }, 600);
    }, [staffRows, startDate, endDate]);

    const toggleSort = (col: 'amount' | 'orders') => {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    return {
        state: {
            bills: billsWithTotals, loading, startDate, endDate, searchQuery, minSalesFilter,
            sortBy, sortDir, viewMode, compareStaff, currentPage, totalPages, toasts
        },
        data: { summary, staffRows: paginatedStaffRows, allStaffRows: staffRows, dailyData, top5Staff, lowPerformers, comparisonData, staffNames },
        actions: {
            setStartDate, setEndDate, setSearchQuery, setMinSalesFilter, setViewMode,
            setCompareStaff, setCurrentPage, fetchSalesData, exportCSV, exportPDF, toggleSort, removeToast
        }
    };
};
