import { useState, useEffect, useMemo } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import type { OrderLine } from '../../../types/DashboardTypes';

export interface DailyCollection {
    id: number;
    shop_id: number;
    shop_name: string;
    village_name: string;
    order_line_id: number;
    order_line_name: string;
    collection_date: string;
    todays_bill_amount: number;
    cash_collected: number;
    upi_collected: number;
    cheque_collected: number;
    adjustments: number;
    old_balance: number;
    total_balance: number;
}

export const useCollections = (orderLines: OrderLine[]) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        return ist.toISOString().split('T')[0];
    });
    const [selectedOlId, setSelectedOlId] = useState<number | null>(null);
    const [collections, setCollections] = useState<DailyCollection[]>([]);
    const [loading, setLoading] = useState(false);

    const api = () => getAuthAxios();

    // Auto-select first order line when orderLines load
    useEffect(() => {
        if (orderLines.length > 0 && selectedOlId === null) {
            setSelectedOlId(orderLines[0].id);
        }
    }, [orderLines, selectedOlId]);

    // Fetch collections when date or order line changes
    useEffect(() => {
        if (!selectedOlId || !selectedDate) return;
        fetchCollections();
    }, [selectedOlId, selectedDate]);

    const fetchCollections = async () => {
        if (!selectedOlId || !selectedDate) return;
        setLoading(true);
        try {
            const res = await api().get(
                `/api/collections/by-orderline/${selectedOlId}?date=${selectedDate}`
            );
            // Parse numeric fields (they may come as strings from MySQL)
            const parsed: DailyCollection[] = res.data.map((row: any) => ({
                ...row,
                todays_bill_amount: parseFloat(row.todays_bill_amount) || 0,
                cash_collected: parseFloat(row.cash_collected) || 0,
                upi_collected: parseFloat(row.upi_collected) || 0,
                cheque_collected: parseFloat(row.cheque_collected) || 0,
                adjustments: parseFloat(row.adjustments) || 0,
                old_balance: parseFloat(row.old_balance) || 0,
                total_balance: parseFloat(row.total_balance) || 0,
            }));
            setCollections(parsed);
        } catch (err) {
            console.error('Failed to fetch collections:', err);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    // Computed totals for Table 1 TOTAL row
    const totals = useMemo(() => {
        return collections.reduce(
            (acc, row) => {
                const rowCollected = row.cash_collected + row.upi_collected + row.cheque_collected;
                return {
                    amountCollected: acc.amountCollected + rowCollected,
                    todaysBillAmount: acc.todaysBillAmount + row.todays_bill_amount,
                    todaysBillBalance: row.todays_bill_amount > 0 ? (acc.todaysBillBalance + Math.max(0, row.todays_bill_amount - rowCollected)) : acc.todaysBillBalance,
                    totalAdjustments: acc.totalAdjustments + row.adjustments,
                    totalBalance: acc.totalBalance + row.total_balance,
                };
            },
            { amountCollected: 0, todaysBillAmount: 0, todaysBillBalance: 0, totalAdjustments: 0, totalBalance: 0 }
        );
    }, [collections]);

    // Computed mode breakdown for Table 2
    const modeBreakdown = useMemo(() => {
        const cash = collections.reduce((sum, r) => sum + r.cash_collected, 0);
        const upi = collections.reduce((sum, r) => sum + r.upi_collected, 0);
        const cheque = collections.reduce((sum, r) => sum + r.cheque_collected, 0);
        const total = cash + upi + cheque;
        return {
            cash,
            upi,
            cheque,
            total,
            cashPercent: total > 0 ? ((cash / total) * 100).toFixed(1) : '0.0',
            upiPercent: total > 0 ? ((upi / total) * 100).toFixed(1) : '0.0',
            chequePercent: total > 0 ? ((cheque / total) * 100).toFixed(1) : '0.0',
        };
    }, [collections]);

    return {
        selectedDate,
        setSelectedDate,
        selectedOlId,
        setSelectedOlId,
        collections,
        loading,
        totals,
        modeBreakdown,
        refresh: fetchCollections,
    };
};
