import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { RawBill, RawReturn } from './useAdminSales';

interface Props {
    bills: RawBill[];
    returns: RawReturn[];
    isDark: boolean;
}

interface ShopAggregate {
    key: string;
    shopName: string;
    villageName: string;
    grossSales: number;
    returnsAmount: number;
    netSales: number;
    orderCount: number;
}

const getTodayLocal = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const getMonthLocal = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().substring(0, 7);
};

const ShopSalesAnalysis = ({ bills, returns, isDark }: Props) => {
    // Local helper for formatting Indian Rupee
    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Local States for Leaderboard
    const [leaderboardSearch, setLeaderboardSearch] = useState('');
    const [leaderboardPage, setLeaderboardPage] = useState(1);
    const leaderboardPageSize = 8;

    // Local States for Date/Month/Range Calendar Finder
    const [periodMode, setPeriodMode] = useState<'date' | 'month' | 'range'>('date');
    const [calStartDate, setCalStartDate] = useState(getTodayLocal());
    const [calEndDate, setCalEndDate] = useState(getTodayLocal());
    
    // Date hooks initialized with top-level helpers

    const [selectedDate, setSelectedDate] = useState(getTodayLocal());
    const [selectedMonth, setSelectedMonth] = useState(getMonthLocal());
    const [calendarSearch, setCalendarSearch] = useState('');
    const [calendarPage, setCalendarPage] = useState(1);
    const calendarPageSize = 5;

    // 1. Overall Aggregation by Shop (for the main filtered range)
    const overallShopData = useMemo((): ShopAggregate[] => {
        const map: Record<string, { shopName: string; villageName: string; gross: number; returnsVal: number; orders: number }> = {};

        // Aggregate Bills
        bills.forEach(b => {
            const village = b.village_name || 'Unknown';
            const key = `${b.shop_name} (${village})`;
            if (!map[key]) {
                map[key] = { shopName: b.shop_name, villageName: village, gross: 0, returnsVal: 0, orders: 0 };
            }
            map[key].gross += (b as any).total || 0;
            map[key].orders += 1;
        });

        // Aggregate Returns
        returns.forEach(r => {
            const village = r.village_name || 'Unknown';
            const key = `${r.shop_name} (${village})`;
            if (!map[key]) {
                map[key] = { shopName: r.shop_name, villageName: village, gross: 0, returnsVal: 0, orders: 0 };
            }
            map[key].returnsVal += Number(r.amount) || 0;
        });

        return Object.entries(map).map(([key, d]) => {
            const net = Math.max(0, d.gross - d.returnsVal);
            return {
                key,
                shopName: d.shopName,
                villageName: d.villageName,
                grossSales: d.gross,
                returnsAmount: d.returnsVal,
                netSales: net,
                orderCount: d.orders
            };
        }).sort((a, b) => b.netSales - a.netSales);
    }, [bills, returns]);

    // Derived metrics for overall shop stats
    const totalUniqueShops = overallShopData.length;
    const bestShop = overallShopData[0] || null;
    const totalNetSales = overallShopData.reduce((acc, s) => acc + s.netSales, 0);
    const averageNetSales = totalUniqueShops > 0 ? totalNetSales / totalUniqueShops : 0;

    // Filtered & Paginated Leaderboard
    const filteredLeaderboard = useMemo(() => {
        if (!leaderboardSearch) return overallShopData;
        const q = leaderboardSearch.toLowerCase();
        return overallShopData.filter(s => 
            s.shopName.toLowerCase().includes(q) || 
            s.villageName.toLowerCase().includes(q)
        );
    }, [overallShopData, leaderboardSearch]);

    const paginatedLeaderboard = useMemo(() => {
        const start = (leaderboardPage - 1) * leaderboardPageSize;
        return filteredLeaderboard.slice(start, start + leaderboardPageSize);
    }, [filteredLeaderboard, leaderboardPage]);

    const totalLeaderboardPages = Math.ceil(filteredLeaderboard.length / leaderboardPageSize);

    // 2. Specific Period (Date, Month, or Range) Shop Aggregation
    const periodShopData = useMemo((): ShopAggregate[] => {
        const filteredBills = bills.filter(b => {
            const dateToUse = (b as any).localDeliveryDate || (b as any).localDate;
            if (periodMode === 'date') {
                return dateToUse === selectedDate;
            } else if (periodMode === 'month') {
                return dateToUse.startsWith(selectedMonth);
            } else {
                return dateToUse >= calStartDate && dateToUse <= calEndDate;
            }
        });

        const filteredReturns = returns.filter(r => {
            const rDate = (() => {
                const d = new Date(r.return_date);
                return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            })();
            if (periodMode === 'date') {
                return rDate === selectedDate;
            } else if (periodMode === 'month') {
                return rDate.startsWith(selectedMonth);
            } else {
                return rDate >= calStartDate && rDate <= calEndDate;
            }
        });

        const map: Record<string, { shopName: string; villageName: string; gross: number; returnsVal: number; orders: number }> = {};

        filteredBills.forEach(b => {
            const village = b.village_name || 'Unknown';
            const key = `${b.shop_name} (${village})`;
            if (!map[key]) {
                map[key] = { shopName: b.shop_name, villageName: village, gross: 0, returnsVal: 0, orders: 0 };
            }
            map[key].gross += (b as any).total || 0;
            map[key].orders += 1;
        });

        filteredReturns.forEach(r => {
            const village = r.village_name || 'Unknown';
            const key = `${r.shop_name} (${village})`;
            if (!map[key]) {
                map[key] = { shopName: r.shop_name, villageName: village, gross: 0, returnsVal: 0, orders: 0 };
            }
            map[key].returnsVal += Number(r.amount) || 0;
        });

        return Object.entries(map).map(([key, d]) => {
            const net = Math.max(0, d.gross - d.returnsVal);
            return {
                key,
                shopName: d.shopName,
                villageName: d.villageName,
                grossSales: d.gross,
                returnsAmount: d.returnsVal,
                netSales: net,
                orderCount: d.orders
            };
        }).sort((a, b) => b.netSales - a.netSales);
    }, [bills, returns, periodMode, selectedDate, selectedMonth, calStartDate, calEndDate]);

    // Period derived metrics
    const periodTotalGross = periodShopData.reduce((acc, s) => acc + s.grossSales, 0);
    const periodTotalReturns = periodShopData.reduce((acc, s) => acc + s.returnsAmount, 0);
    const periodTotalNet = Math.max(0, periodTotalGross - periodTotalReturns);

    // Period filtered & paginated list
    const filteredPeriodData = useMemo(() => {
        if (!calendarSearch) return periodShopData;
        const q = calendarSearch.toLowerCase();
        return periodShopData.filter(s => 
            s.shopName.toLowerCase().includes(q) || 
            s.villageName.toLowerCase().includes(q)
        );
    }, [periodShopData, calendarSearch]);

    const paginatedPeriodData = useMemo(() => {
        const start = (calendarPage - 1) * calendarPageSize;
        return filteredPeriodData.slice(start, start + calendarPageSize);
    }, [filteredPeriodData, calendarPage]);

    const totalCalendarPages = Math.ceil(filteredPeriodData.length / calendarPageSize);

    // Chart Data (Top 5 shops in selected period)
    const periodChartData = useMemo(() => {
        return periodShopData.slice(0, 5).map(s => ({
            name: s.shopName.length > 12 ? s.shopName.substring(0, 10) + '...' : s.shopName,
            fullName: s.shopName,
            gross: s.grossSales,
            net: s.netSales,
            returns: s.returnsAmount
        }));
    }, [periodShopData]);

    const cardClass = `p-6 rounded-[28px] border transition-all hover:-translate-y-0.5 ${
        isDark ? 'bg-slate-900 border-white/5 shadow-2xl shadow-black/30' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/40'
    }`;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Card: Unique Active Shops */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-3xl p-3 rounded-2xl shrink-0 ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>🏪</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Shops</span>
                    </div>
                    <p className={`font-black tracking-tight text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {totalUniqueShops}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Shops transacting in main range</p>
                </div>

                {/* Metric Card: Highest Selling Shop */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-3xl p-3 rounded-2xl shrink-0 ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>🏆</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Top Shop</span>
                    </div>
                    <p className={`font-black tracking-tight text-2xl truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={bestShop?.shopName || 'N/A'}>
                        {bestShop ? bestShop.shopName : 'N/A'}
                    </p>
                    <p className="text-xs text-emerald-500 mt-1 font-black">
                        {bestShop ? `Net: ${fmt(bestShop.netSales)}` : 'No data in range'}
                    </p>
                </div>

                {/* Metric Card: Average Sales per Shop */}
                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-3xl p-3 rounded-2xl shrink-0 ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>📈</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg Sale / Shop</span>
                    </div>
                    <p className={`font-black tracking-tight text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {fmt(averageNetSales)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">Net sales averaged across active shops</p>
                </div>
            </div>

            {/* Split Grid for Leaderboard and Period Calendar Finder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Shop Leaderboard */}
                <div className={`p-6 sm:p-8 rounded-[28px] border flex flex-col justify-between ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/20'}`}>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className={`text-xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                🏆 Shop Sales Leaderboard
                            </h3>
                            {/* Search bar */}
                            <div className="relative w-full sm:w-60 shrink-0">
                                <input 
                                    type="text" 
                                    placeholder="Search shop or village..." 
                                    value={leaderboardSearch} 
                                    onChange={e => {
                                        setLeaderboardSearch(e.target.value);
                                        setLeaderboardPage(1);
                                    }}
                                    className={`w-full px-4 py-2.5 rounded-2xl border font-bold text-xs focus:outline-none focus:ring-4 ${
                                        isDark 
                                            ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20' 
                                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <th className="pb-3 text-center w-12">Rank</th>
                                        <th className="pb-3 pl-2">Shop Name</th>
                                        <th className="pb-3 text-center w-16">Bills</th>
                                        <th className="pb-3 text-right">Gross Sales</th>
                                        <th className="pb-3 text-right text-amber-500">Returns</th>
                                        <th className="pb-3 text-right text-emerald-500">Net Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-500 italic font-medium">
                                                No shops found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedLeaderboard.map((shop, index) => {
                                            const globalRank = (leaderboardPage - 1) * leaderboardPageSize + index + 1;
                                            
                                            // Premium badge style for Top 3
                                            const rankBadge = () => {
                                                if (globalRank === 1) return <span className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30">1</span>;
                                                if (globalRank === 2) return <span className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-300 text-slate-950 font-black text-xs shadow-lg shadow-slate-300/30">2</span>;
                                                if (globalRank === 3) return <span className="w-6 h-6 rounded-full flex items-center justify-center bg-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-400/30">3</span>;
                                                return <span className={`text-xs font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{globalRank}</span>;
                                            };

                                            return (
                                                <tr key={shop.key} className={`border-b transition-colors last:border-0 ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                                                    <td className="py-4 text-center flex items-center justify-center">{rankBadge()}</td>
                                                    <td className="py-4 pl-2">
                                                        <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.shopName}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">{shop.villageName}</p>
                                                    </td>
                                                    <td className="py-4 text-center font-bold text-sm text-blue-500">{shop.orderCount}</td>
                                                    <td className={`py-4 text-right text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{fmt(shop.grossSales)}</td>
                                                    <td className="py-4 text-right text-xs font-bold text-amber-500">{shop.returnsAmount > 0 ? `-${fmt(shop.returnsAmount)}` : '—'}</td>
                                                    <td className="py-4 text-right text-sm font-black text-emerald-500">{fmt(shop.netSales)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalLeaderboardPages > 1 && (
                        <div className={`flex items-center justify-between mt-6 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <button 
                                onClick={() => setLeaderboardPage(Math.max(1, leaderboardPage - 1))} 
                                disabled={leaderboardPage === 1}
                                className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            >
                                ← Prev
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Page {leaderboardPage} of {totalLeaderboardPages}
                            </span>
                            <button 
                                onClick={() => setLeaderboardPage(Math.min(totalLeaderboardPages, leaderboardPage + 1))} 
                                disabled={leaderboardPage === totalLeaderboardPages}
                                className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Interactive Calendar Period Lookup */}
                <div className={`p-6 sm:p-8 rounded-[28px] border flex flex-col justify-between ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/20'}`}>
                    <div>
                        <h3 className={`text-xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            📅 Calendar Sales Lookup
                        </h3>

                        {/* Toggles & Inputs */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {/* Period Toggle */}
                            <div className="flex rounded-xl overflow-hidden border border-white/5">
                                <button 
                                    onClick={() => {
                                        setPeriodMode('date');
                                        setCalendarPage(1);
                                    }}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        periodMode === 'date' 
                                            ? 'bg-blue-600 text-white' 
                                            : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    Date-Wise
                                </button>
                                <button 
                                    onClick={() => {
                                        setPeriodMode('month');
                                        setCalendarPage(1);
                                    }}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        periodMode === 'month' 
                                            ? 'bg-blue-600 text-white' 
                                            : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    Monthly-Wise
                                </button>
                                <button 
                                    onClick={() => {
                                        setPeriodMode('range');
                                        setCalendarPage(1);
                                    }}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        periodMode === 'range' 
                                            ? 'bg-blue-600 text-white' 
                                            : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    Range-Wise
                                </button>
                            </div>

                            {/* Calendar Input Fields */}
                            <div className="flex-1 min-w-[140px] flex items-center gap-2">
                                {periodMode === 'date' && (
                                    <input 
                                        type="date" 
                                        value={selectedDate} 
                                        onChange={e => {
                                            setSelectedDate(e.target.value);
                                            setCalendarPage(1);
                                        }}
                                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                        className={`w-full px-4 py-2 rounded-xl border font-bold text-xs focus:outline-none focus:ring-4 ${
                                            isDark 
                                                ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                        }`}
                                    />
                                )}
                                {periodMode === 'month' && (
                                    <input 
                                        type="month" 
                                        value={selectedMonth} 
                                        onChange={e => {
                                            setSelectedMonth(e.target.value);
                                            setCalendarPage(1);
                                        }}
                                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                        className={`w-full px-4 py-2 rounded-xl border font-bold text-xs focus:outline-none focus:ring-4 ${
                                            isDark 
                                                ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20' 
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                        }`}
                                    />
                                )}
                                {periodMode === 'range' && (
                                    <div className="flex items-center gap-2 w-full">
                                        <input 
                                            type="date" 
                                            value={calStartDate} 
                                            onChange={e => {
                                                setCalStartDate(e.target.value);
                                                setCalendarPage(1);
                                            }}
                                            style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                            className={`w-1/2 px-3 py-2 rounded-xl border font-bold text-[11px] focus:outline-none focus:ring-4 ${
                                                isDark 
                                                    ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                            }`}
                                        />
                                        <span className={`text-[10px] font-black uppercase text-slate-500`}>to</span>
                                        <input 
                                            type="date" 
                                            value={calEndDate} 
                                            onChange={e => {
                                                setCalEndDate(e.target.value);
                                                setCalendarPage(1);
                                            }}
                                            style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                            className={`w-1/2 px-3 py-2 rounded-xl border font-bold text-[11px] focus:outline-none focus:ring-4 ${
                                                isDark 
                                                    ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                            }`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Totals & Filter Search */}
                        <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${
                            isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-100'
                        }`}>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500`}>
                                    Sales on {periodMode === 'date' ? selectedDate : periodMode === 'month' ? selectedMonth : `${calStartDate} to ${calEndDate}`}
                                </span>
                                <p className={`text-lg font-black mt-0.5 text-emerald-500`}>
                                    Net: {fmt(periodTotalNet)}
                                </p>
                                <span className="text-[10px] font-bold text-slate-500">
                                    Gross: {fmt(periodTotalGross)} | Returns: {fmt(periodTotalReturns)}
                                </span>
                            </div>

                            {/* Search bar inside Calendar Finder */}
                            <div className="relative w-full sm:w-48">
                                <input 
                                    type="text" 
                                    placeholder="Filter list..." 
                                    value={calendarSearch} 
                                    onChange={e => {
                                        setCalendarSearch(e.target.value);
                                        setCalendarPage(1);
                                    }}
                                    className={`w-full px-3 py-1.5 rounded-xl border font-bold text-[11px] focus:outline-none focus:ring-2 ${
                                        isDark 
                                            ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20' 
                                            : 'bg-white border-slate-200 text-slate-900 focus:ring-blue-500/10'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Interactive Recharts visual for Selected Day/Month */}
                        {periodShopData.length > 0 && (
                            <div className={`p-4 rounded-2xl border mb-6 ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Top 5 Contribution
                                </h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart data={periodChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} horizontal={false} />
                                        <XAxis type="number" tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 9 }} />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 9, fontWeight: 700 }} />
                                        <Tooltip 
                                            contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'), borderRadius: 8, fontSize: 11, fontWeight: 700 }}
                                            formatter={(value: any, name: any) => ['₹' + Number(value).toLocaleString('en-IN'), name === 'gross' ? 'Gross' : 'Net']}
                                        />
                                        <Bar dataKey="net" fill="#10b981" radius={[0, 4, 4, 0]} name="Net" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* List representation of Calendar-filtered Sales */}
                        <div className="space-y-2">
                            {paginatedPeriodData.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed rounded-3xl border-slate-800/10">
                                    <p className="text-3xl mb-2">📅</p>
                                    <p className={`font-black text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        No sales records found
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">Select another day or month from the calendar</p>
                                </div>
                            ) : (
                                paginatedPeriodData.map(shop => (
                                    <div key={shop.key} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                        isDark ? 'bg-slate-800/35 border-white/5 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                                    }`}>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className={`font-black text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{shop.shopName}</p>
                                            <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase">{shop.villageName}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-black text-xs text-emerald-500`}>{fmt(shop.netSales)}</p>
                                            <span className="text-[9px] font-bold text-slate-500">
                                                Gross: {fmt(shop.grossSales)} | {shop.orderCount} ord
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pagination for Period Lookup */}
                    {totalCalendarPages > 1 && (
                        <div className={`flex items-center justify-between mt-6 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <button 
                                onClick={() => setCalendarPage(Math.max(1, calendarPage - 1))} 
                                disabled={calendarPage === 1}
                                className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            >
                                ← Prev
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Page {calendarPage} of {totalCalendarPages}
                            </span>
                            <button 
                                onClick={() => setCalendarPage(Math.min(totalCalendarPages, calendarPage + 1))} 
                                disabled={calendarPage === totalCalendarPages}
                                className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopSalesAnalysis;
