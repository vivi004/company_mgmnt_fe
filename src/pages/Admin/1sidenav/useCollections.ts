import { useState, useEffect, useMemo } from 'react';
import { getAuthAxios } from '../../../utils/apiClient';
import type { OrderLine } from '../../../types/DashboardTypes';

export interface DailyCollection {
    id: number;
    shop_id: number;
    shop_name: string;
    village_name: string;
    owner_name?: string;
    order_line_id: number;
    order_line_name: string;
    collection_date: string;
    todays_bill_amount: number;
    cash_collected: number;
    upi_collected: number;
    cheque_collected: number;
    manual_adjustments: number;
    return_amount: number;
    future_bills: number;
    past_bills: number;
    old_balance: number;
    total_balance: number;
    manual_cash: number;
    manual_upi: number;
    manual_cheque: number;
    manual_pos: number;
    discount_payment: number;
    discount_adjustment: number;
    pending_transactions: any[];
}

export interface Expense {
    id: number;
    order_line_id: number;
    amount: number;
    description: string;
    expense_date: string;
}

export const useCollections = (orderLines: OrderLine[]) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        return ist.toISOString().split('T')[0];
    });
    const [selectedOlId, setSelectedOlId] = useState<number | null>(null);
    const [collections, setCollections] = useState<DailyCollection[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
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
            
            const rawCollections = res.data.collections || [];
            const rawExpenses = res.data.expenses || [];

            // Parse numeric fields (they may come as strings from MySQL)
            const parsed: DailyCollection[] = rawCollections.map((row: any) => ({
                ...row,
                todays_bill_amount: parseFloat(row.todays_bill_amount) || 0,
                cash_collected: parseFloat(row.cash_collected) || 0,
                upi_collected: parseFloat(row.upi_collected) || 0,
                cheque_collected: parseFloat(row.cheque_collected) || 0,
                manual_adjustments: parseFloat(row.manual_adjustments) || 0,
                return_amount: parseFloat(row.return_amount) || 0,
                manual_cash: parseFloat(row.manual_cash) || 0,
                manual_upi: parseFloat(row.manual_upi) || 0,
                manual_cheque: parseFloat(row.manual_cheque) || 0,
                manual_pos: parseFloat(row.manual_pos) || 0,
                discount_payment: parseFloat(row.discount_payment) || 0,
                discount_adjustment: parseFloat(row.discount_adjustment) || 0,
                future_bills: parseFloat(row.future_bills) || 0,
                past_bills: parseFloat(row.past_bills) || 0,
                old_balance: parseFloat(row.old_balance) || 0,
                total_balance: parseFloat(row.total_balance) || 0,
                pending_transactions: typeof row.pending_transactions === 'string' ? JSON.parse(row.pending_transactions) : (row.pending_transactions || [])
            }));

            const parsedExpenses: Expense[] = rawExpenses.map((ex: any) => ({
                ...ex,
                amount: parseFloat(ex.amount) || 0
            }));

            setCollections(parsed);
            setExpenses(parsedExpenses);
        } catch (err) {
            console.error('Failed to fetch collections:', err);
            setCollections([]);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (amount: number, description: string) => {
        if (!selectedOlId || !selectedDate) return;
        try {
            await api().post('/api/collections/expenses', {
                order_line_id: selectedOlId,
                amount,
                description,
                date: selectedDate
            });
            await fetchCollections();
        } catch (err) {
            console.error('Failed to add expense:', err);
            throw err;
        }
    };

    const updateExpense = async (id: number, amount: number, description: string) => {
        try {
            await api().put(`/api/collections/expenses/${id}`, { amount, description });
            await fetchCollections();
        } catch (err) {
            console.error('Failed to update expense:', err);
            throw err;
        }
    };

    const deleteExpense = async (id: number) => {
        try {
            await api().delete(`/api/collections/expenses/${id}`);
            await fetchCollections();
        } catch (err) {
            console.error('Failed to delete expense:', err);
            throw err;
        }
    };

    // Computed totals for Table 1 TOTAL row
    const totals = useMemo(() => {
        return collections.reduce(
            (acc, row) => {
                const rowCollected = row.cash_collected + row.upi_collected + row.cheque_collected + (row.discount_payment || 0);
                // total_balance from backend is already: old_balance + todays_bill - collected + manual_adjustments
                // future_bills is informational only and NOT included in total_balance
                return {
                    amountCollected: acc.amountCollected + rowCollected,
                    todaysBillAmount: acc.todaysBillAmount + row.todays_bill_amount,
                    todaysBillBalance: row.todays_bill_amount > 0
                        ? acc.todaysBillBalance + Math.max(0, row.todays_bill_amount - rowCollected)
                        : acc.todaysBillBalance,
                    totalManualAdjust: acc.totalManualAdjust + ((row.manual_adjustments || 0) + (row.discount_payment || 0)),
                    totalReturnAmount: acc.totalReturnAmount + (row.return_amount || 0),
                    totalFutureBills: acc.totalFutureBills + (row.future_bills || 0),
                    totalBalance: acc.totalBalance + row.total_balance,
                    totalOldBalance: acc.totalOldBalance + (row.old_balance || 0),
                };
            },
            { amountCollected: 0, todaysBillAmount: 0, todaysBillBalance: 0, totalManualAdjust: 0, totalReturnAmount: 0, totalFutureBills: 0, totalBalance: 0, totalOldBalance: 0 }
        );
    }, [collections]);

    // Computed mode breakdown for Table 2
    const modeBreakdown = useMemo(() => {
        // Regular Collections
        const regCash = collections.reduce((sum, r) => sum + r.cash_collected, 0);
        const regUpi = collections.reduce((sum, r) => sum + r.upi_collected, 0);
        const regCheque = collections.reduce((sum, r) => sum + r.cheque_collected, 0);

        // Manual Collections (Absolute values since they are stored as negative in ledger)
        const manCash = collections.reduce((sum, r) => sum + r.manual_cash, 0);
        const manUpi = collections.reduce((sum, r) => sum + r.manual_upi, 0);
        const manCheque = collections.reduce((sum, r) => sum + r.manual_cheque, 0);

        const rawCash = regCash + manCash;
        const upi = regUpi + manUpi;
        const cheque = regCheque + manCheque;
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const discountPayment = collections.reduce((sum, r) => sum + r.discount_payment, 0);
        const discountAdjustment = collections.reduce((sum, r) => sum + r.discount_adjustment, 0);
        const totalDiscount = discountPayment + discountAdjustment;
        
        const netCash = rawCash - totalExpenses;
        const total = netCash + upi + cheque;

        return {
            regCash, regUpi, regCheque,
            manCash, manUpi, manCheque,
            rawCash,
            netCash,
            totalExpenses,
            upi,
            cheque,
            discount: totalDiscount,
            discountPayment,
            discountAdjustment,
            total,
            cashPercent: total > 0 ? ((netCash / total) * 100).toFixed(1) : '0.0',
            upiPercent: total > 0 ? ((upi / total) * 100).toFixed(1) : '0.0',
            chequePercent: total > 0 ? ((cheque / total) * 100).toFixed(1) : '0.0',
        };
    }, [collections, expenses]);

    const recordProductReturn = async (shopId: number, productName: string, amount: number) => {
        if (!selectedDate) return;
        try {
            await api().post(`/api/shops/${shopId}/product-return`, {
                product_name: productName,
                amount,
                collection_date: selectedDate
            });
            await fetchCollections();
        } catch (err) {
            console.error('Failed to record product return:', err);
            throw err;
        }
    };

    return {
        selectedDate,
        setSelectedDate,
        selectedOlId,
        setSelectedOlId,
        collections,
        expenses,
        loading,
        totals,
        modeBreakdown,
        refresh: fetchCollections,
        addExpense,
        updateExpense,
        deleteExpense,
        recordProductReturn
    };
};
