import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress, Alert } from "@mui/material";

interface Activity {
    id: string;
    title: string;
    tenant: string;
    date: string;
    type: 'user' | 'bill' | 'payment';
}

interface Stats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    recentActivities: Activity[];
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchStats = async () => {
        try {
            setError("");
            const token = localStorage.getItem("token");
            const res = await axios.get<Stats>(`${API}/api/superadmin/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err: any) {
            console.error("Fetch stats error:", err);
            setError(err.response?.data?.error || "Failed to load platform stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress sx={{ color: "#3b82f6" }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto mt-8">
                <Alert severity="error" sx={{ backgroundColor: "#1e1b4b", color: "#f87171", border: "1px solid #312e81" }}>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in font-['Outfit']">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Tenants */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-between shadow-lg shadow-slate-950/50 hover:border-blue-500/30 transition-all duration-300 group">
                    <div className="space-y-2">
                        <span className="text-sm font-bold text-slate-400">Total Registered Tenants</span>
                        <h3 className="text-4xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">
                            {stats?.totalTenants}
                        </h3>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                    </div>
                </div>

                {/* Active Tenants */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-between shadow-lg shadow-slate-950/50 hover:border-emerald-500/30 transition-all duration-300 group">
                    <div className="space-y-2">
                        <span className="text-sm font-bold text-slate-400">Active Subscriptions</span>
                        <h3 className="text-4xl font-extrabold text-emerald-500 group-hover:scale-105 transition-transform origin-left">
                            {stats?.activeTenants}
                        </h3>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-between shadow-lg shadow-slate-950/50 hover:border-violet-500/30 transition-all duration-300 group">
                    <div className="space-y-2">
                        <span className="text-sm font-bold text-slate-400">Active Tenant Users</span>
                        <h3 className="text-4xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">
                            {stats?.totalUsers}
                        </h3>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Platform activity feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-lg shadow-slate-950/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Live Platform Activities</h3>
                        <p className="text-xs text-slate-400">Consolidated real-time feed across all tenants</p>
                    </div>
                    <button 
                        onClick={fetchStats}
                        className="px-4 py-2 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-600/10 border border-blue-500/20 rounded-xl transition-all"
                    >
                        Sync Feed
                    </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((act) => (
                            <div key={act.id} className="flex items-start justify-between p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-all">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-2 rounded-xl mt-1 ${
                                        act.type === 'user' ? 'bg-violet-500/10 text-violet-500' :
                                        act.type === 'bill' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                        {act.type === 'user' && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                        {act.type === 'bill' && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                        {act.type === 'payment' && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white leading-snug">{act.title}</h4>
                                        <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                                            <span>Tenant:</span>
                                            <span className="bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">{act.tenant}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap ml-4 mt-1">
                                    {new Date(act.date).toLocaleDateString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No platform activity logged yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
