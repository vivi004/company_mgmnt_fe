import { useEffect } from 'react';
import { useAdminSales } from './useAdminSales';
import { ToastContainer } from '../../../components/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface Props { theme: string; }

const AdminSales = ({ theme }: Props) => {
    const isDark = theme === 'dark';
    const { state, data, actions } = useAdminSales();

    useEffect(() => { actions.fetchSalesData(); }, []);

    const card = (title: string, value: string, sub: string, icon: string, color: string) => (
        <div className={`p-6 rounded-[28px] border transition-all hover:-translate-y-1
            ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
            <div className="flex items-center justify-between mb-4">
                <span className={`text-3xl p-3 rounded-2xl ${isDark ? 'bg-slate-800' : `bg-${color}-50`}`}>{icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</span>
            </div>
            <p className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">{sub}</p>
        </div>
    );

    const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <ToastContainer toasts={state.toasts} removeToast={actions.removeToast} />

            {/* Date Filter */}
            <div className={`flex flex-wrap items-end gap-4 p-6 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
                <div className="flex-1 min-w-[160px]">
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start Date</label>
                    <input type="date" value={state.startDate} onChange={e => actions.setStartDate(e.target.value)}
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-4 ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} />
                </div>
                <div className="flex-1 min-w-[160px]">
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>End Date</label>
                    <input type="date" value={state.endDate} onChange={e => actions.setEndDate(e.target.value)}
                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                        className={`w-full px-4 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-4 ${isDark ? 'bg-white/5 border-white/10 text-white focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} />
                </div>
                <button onClick={actions.fetchSalesData} disabled={state.loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95">
                    {state.loading ? 'Loading...' : 'Apply Filter'}
                </button>
                <button onClick={actions.exportCSV}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50' : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-400 shadow-sm'}`}>
                    📥 CSV
                </button>
                <button onClick={actions.exportPDF}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-red-400 hover:border-red-500/50' : 'bg-white border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-400 shadow-sm'}`}>
                    📄 PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {card('Total Sales', fmt(data.summary.totalSales), `${state.startDate} — ${state.endDate}`, '💰', 'blue')}
                {card('Total Orders', data.summary.totalOrders.toString(), 'Verified invoices', '📦', 'emerald')}
                {card('Avg Order Value', fmt(data.summary.avgValue), 'Per invoice average', '📊', 'violet')}
                {card('Best Staff', data.summary.bestStaff?.name || '—', data.summary.bestStaff ? fmt(data.summary.bestStaff.amount) : 'No data', '🏆', 'amber')}
            </div>

            {/* View Toggle + Search/Filter */}
            <div className={`flex flex-wrap items-center gap-4 p-5 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-lg'}`}>
                <div className="flex rounded-2xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'}">
                    <button onClick={() => actions.setViewMode('individual')}
                        className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${state.viewMode === 'individual' ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        Individual
                    </button>
                    <button onClick={() => actions.setViewMode('overall')}
                        className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${state.viewMode === 'overall' ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        Overall
                    </button>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <input type="text" placeholder="Search staff..." value={state.searchQuery} onChange={e => actions.setSearchQuery(e.target.value)}
                        className={`w-full px-5 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-4 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} />
                </div>
                <div className="min-w-[180px]">
                    <input type="number" placeholder="Min Sales ₹" value={state.minSalesFilter || ''} onChange={e => actions.setMinSalesFilter(Number(e.target.value) || 0)}
                        className={`w-full px-5 py-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-4 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'}`} />
                </div>
            </div>

            {state.viewMode === 'individual' && (
                <div className={`rounded-[28px] border overflow-x-auto hide-scrollbar ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <div className="min-w-[800px]">
                        <div className={`grid grid-cols-12 gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b ${isDark ? 'bg-slate-800/50 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            <div className="col-span-1">#</div>
                            <div className="col-span-3">Staff Name</div>
                        <div className="col-span-2 text-center cursor-pointer hover:text-blue-500" onClick={() => actions.toggleSort('orders')}>
                            Orders {state.sortBy === 'orders' && (state.sortDir === 'desc' ? '↓' : '↑')}
                        </div>
                        <div className="col-span-2 text-right cursor-pointer hover:text-blue-500" onClick={() => actions.toggleSort('amount')}>
                            Total Sales {state.sortBy === 'amount' && (state.sortDir === 'desc' ? '↓' : '↑')}
                        </div>
                        <div className="col-span-2 text-right">Avg Order</div>
                        <div className="col-span-2 text-right">Last Sale</div>
                    </div>
                    {state.loading ? (
                        <div className="py-16 text-center animate-pulse">
                            <p className={`font-black italic ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Loading sales data...</p>
                        </div>
                    ) : data.staffRows.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-4xl mb-3">📊</p>
                            <p className={`font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>No sales data found</p>
                            <p className="text-slate-500 text-sm mt-1">Adjust date range or filters</p>
                        </div>
                    ) : (
                        data.staffRows.map((row, idx) => {
                            const isLow = data.lowPerformers.some(l => l.name === row.name);
                            return (
                                <div key={row.name}
                                    className={`grid grid-cols-12 gap-2 px-6 py-4 items-center border-b transition-all
                                        ${isLow ? (isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/50 border-red-100') : (isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-blue-50/30')}`}>
                                    <div className={`col-span-1 font-black text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {(state.currentPage - 1) * 10 + idx + 1}
                                    </div>
                                    <div className="col-span-3">
                                        <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{row.name}</p>
                                        {isLow && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Low Performer</span>}
                                    </div>
                                    <div className={`col-span-2 text-center font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{row.totalOrders}</div>
                                    <div className={`col-span-2 text-right font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(row.totalAmount)}</div>
                                    <div className={`col-span-2 text-right font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{fmt(row.avgOrderValue)}</div>
                                    <div className={`col-span-2 text-right text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {new Date(row.lastSaleDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                        {state.totalPages > 1 && (
                            <div className={`flex items-center justify-between px-6 py-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                <button onClick={() => actions.setCurrentPage(Math.max(1, state.currentPage - 1))} disabled={state.currentPage === 1}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 text-white hover:bg-blue-700 transition-all">← Prev</button>
                                <span className={`text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Page {state.currentPage} of {state.totalPages}</span>
                                <button onClick={() => actions.setCurrentPage(Math.min(state.totalPages, state.currentPage + 1))} disabled={state.currentPage === state.totalPages}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 bg-blue-600 text-white hover:bg-blue-700 transition-all">Next →</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Overall Summary (Overall View) */}
            {state.viewMode === 'overall' && (
                <div className={`p-8 rounded-[28px] border space-y-6 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <h3 className={`text-2xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Daily Sales Summary</h3>
                    {data.dailyData.length === 0 ? (
                        <p className="text-slate-500 italic">No daily data available</p>
                    ) : (
                        <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            {data.dailyData.map(d => (
                                <div key={d.date} className={`flex justify-between items-center py-3 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                    <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' })}
                                    </span>
                                    <div className="flex gap-6">
                                        <span className={`font-bold text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{d.orderCount} orders</span>
                                        <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{fmt(d.totalAmount)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Sales Per Staff */}
                <div className={`p-6 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <h3 className={`text-xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Per Staff</h3>
                    {data.allStaffRows.length === 0 ? (
                        <p className="text-slate-500 italic text-center py-10">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.allStaffRows.map(r => ({ name: r.name.split(' ')[0], sales: Math.round(r.totalAmount) }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }} />
                                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'), borderRadius: 12, fontWeight: 700 }}
                                    formatter={(value: any) => ['₹' + Number(value).toLocaleString('en-IN'), 'Sales']} />
                                <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Line Chart: Sales Trend */}
                <div className={`p-6 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <h3 className={`text-xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Trend</h3>
                    {data.dailyData.length === 0 ? (
                        <p className="text-slate-500 italic text-center py-10">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.dailyData.map(d => ({ date: d.date.slice(5), amount: Math.round(d.totalAmount), orders: d.orderCount }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 700 }} />
                                <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'), borderRadius: 12, fontWeight: 700 }}
                                    formatter={(value: any, name: any) => [name === 'amount' ? '₹' + Number(value).toLocaleString('en-IN') : value, name === 'amount' ? 'Sales' : 'Orders']} />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Sales (₹)" />
                                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Orders" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Leaderboard + Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Leaderboard */}
                <div className={`p-6 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <h3 className={`text-xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>🏆 Top 5 Staff</h3>
                    {data.top5Staff.length === 0 ? (
                        <p className="text-slate-500 italic">No data</p>
                    ) : (
                        <div className="space-y-3">
                            {data.top5Staff.map((s, i) => (
                                <div key={s.name} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg
                                        ${i === 0 ? 'bg-amber-500/20 text-amber-500' : i === 1 ? 'bg-slate-300/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                                        <p className="text-xs text-slate-500 font-bold">{s.totalOrders} orders</p>
                                    </div>
                                    <p className={`font-black text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{fmt(s.totalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Staff Comparison */}
                <div className={`p-6 rounded-[28px] border ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                    <h3 className={`text-xl font-black italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>⚡ Staff Comparison</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 items-center">
                        <select value={state.compareStaff[0]} onChange={e => actions.setCompareStaff([e.target.value, state.compareStaff[1]])}
                            style={isDark ? { colorScheme: 'dark' } : {}}
                            className={`w-full sm:flex-1 px-4 py-3 rounded-2xl border font-bold text-sm cursor-pointer focus:outline-none focus:ring-2 ${isDark ? 'bg-slate-800 border-slate-600 text-white focus:ring-blue-500/30' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/20'}`}>
                            <option value="" style={isDark ? { background: '#1e293b', color: '#94a3b8' } : {}}>Select Staff A</option>
                            {data.staffNames.map(n => <option key={n} value={n} style={isDark ? { background: '#1e293b', color: '#fff' } : {}}>{n}</option>)}
                        </select>
                        <span className={`font-black text-xl py-1 sm:py-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>VS</span>
                        <select value={state.compareStaff[1]} onChange={e => actions.setCompareStaff([state.compareStaff[0], e.target.value])}
                            style={isDark ? { colorScheme: 'dark' } : {}}
                            className={`w-full sm:flex-1 px-4 py-3 rounded-2xl border font-bold text-sm cursor-pointer focus:outline-none focus:ring-2 ${isDark ? 'bg-slate-800 border-slate-600 text-white focus:ring-blue-500/30' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/20'}`}>
                            <option value="" style={isDark ? { background: '#1e293b', color: '#94a3b8' } : {}}>Select Staff B</option>
                            {data.staffNames.map(n => <option key={n} value={n} style={isDark ? { background: '#1e293b', color: '#fff' } : {}}>{n}</option>)}
                        </select>
                    </div>
                    {data.comparisonData ? (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch">
                            {/* Staff A */}
                            <div className={`flex-1 text-center p-4 rounded-2xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Staff A</p>
                                <p className={`font-black text-base sm:text-lg break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.comparisonData[0].name}</p>
                                <p className={`font-black mt-2 text-sm sm:text-base ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{fmt(data.comparisonData[0].totalAmount)}</p>
                                <p className="text-xs text-slate-500 font-bold">{data.comparisonData[0].totalOrders} orders</p>
                            </div>
                            {/* DIFF */}
                            <div className="flex sm:flex-col items-center justify-center gap-2 py-2 sm:py-4 px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diff</p>
                                <p className={`font-black text-base sm:text-lg text-center ${data.comparisonData[0].totalAmount >= data.comparisonData[1].totalAmount ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {data.comparisonData[0].totalAmount >= data.comparisonData[1].totalAmount ? '+' : ''}{fmt(data.comparisonData[0].totalAmount - data.comparisonData[1].totalAmount)}
                                </p>
                            </div>
                            {/* Staff B */}
                            <div className={`flex-1 text-center p-4 rounded-2xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Staff B</p>
                                <p className={`font-black text-base sm:text-lg break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.comparisonData[1].name}</p>
                                <p className={`font-black mt-2 text-sm sm:text-base ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{fmt(data.comparisonData[1].totalAmount)}</p>
                                <p className="text-xs text-slate-500 font-bold">{data.comparisonData[1].totalOrders} orders</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 italic text-center py-6">Select two staff members to compare</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSales;
