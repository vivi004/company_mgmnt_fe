import React from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";

interface SuperAdminSidenavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    onClose?: () => void;
}

const SuperAdminSidenav: React.FC<SuperAdminSidenavProps> = ({ activeTab, setActiveTab, onLogout, onClose }) => {
    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-20 border-r border-slate-800 relative">
            <div className="p-8 pb-6 flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
                        Ω
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none text-white">Nisha SaaS</h1>
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-1">Super Admin Panel</p>
                    </div>
                </div>
                {onClose && (
                    <IconButton
                        onClick={onClose}
                        sx={{ color: '#64748b', '&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        className="lg:hidden -me-4 -mt-2"
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </div>

            <nav className="flex-grow px-4 space-y-2 overflow-y-auto hide-scrollbar pb-6 mt-6">
                {/* 1. Dashboard */}
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'dashboard' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">System Metrics</span>
                </button>

                {/* 2. Tenants */}
                <button
                    onClick={() => setActiveTab("tenants")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'tenants' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'tenants' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Manage Tenants</span>
                </button>

                {/* 3. Admins */}
                <button
                    onClick={() => setActiveTab("admins")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'admins' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'admins' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Tenant Admins</span>
                </button>

                {/* 4. Settings */}
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'settings' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Global Settings</span>
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
                >
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:bg-red-500/20 group-hover:border-red-500/30 group-hover:scale-110 transition-all">
                        <LogoutIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-tight">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default SuperAdminSidenav;
