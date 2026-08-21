import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress, Alert } from "@mui/material";

interface GlobalSetting {
    id: number;
    next_invoice_no: number;
    last_invoice_no: number;
    tenant_id: number;
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const SuperAdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<GlobalSetting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError("");
                const token = localStorage.getItem("token");
                const res = await axios.get<GlobalSetting[]>(`${API}/api/superadmin/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSettings(res.data);
            } catch (err: any) {
                console.error("Fetch settings error:", err);
                setError(err.response?.data?.error || "Failed to load platform settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center">
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
        <div className="space-y-6 font-['Outfit']">
            <div>
                <h3 className="text-lg font-bold text-white">Global Platform Settings</h3>
                <p className="text-xs text-slate-400">View configuration parameters across active tenant instances</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.map((setting) => (
                    <div key={setting.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-950/50 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-400">Settings Config Group</h4>
                                <p className="text-[11px] text-slate-500 font-mono">Row ID: {setting.id}</p>
                            </div>
                            <span className="bg-blue-500/10 text-blue-400 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase border border-blue-500/20">
                                Tenant ID: {setting.tenant_id}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">Next Invoice No</span>
                                <span className="text-lg font-extrabold text-white font-mono">{setting.next_invoice_no}</span>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">Last Invoice No</span>
                                <span className="text-lg font-extrabold text-white font-mono">{setting.last_invoice_no}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {settings.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-500 text-sm">
                        No tenant settings records initialized in database.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminSettings;
