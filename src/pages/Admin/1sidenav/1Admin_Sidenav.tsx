import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import nishaLogo from "../../../assets/Logos/NISHA LOGO .jpg";

interface AdminSidenavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    companyName: string;
    requestCount: number;
    olRequestCount: number;
    billCount: number;
    unverifiedCount: number;
    onClose?: () => void;
}

const AdminSidenav = ({ activeTab, setActiveTab, companyName, requestCount, olRequestCount, billCount, unverifiedCount, onClose }: AdminSidenavProps) => {
    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-20 transition-all border-r border-white/5 relative">
            <div className="p-8 pb-6 flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20">
                        <img src={nishaLogo} alt="Nisha Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">{companyName}</h1>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Enterprise Admin</p>
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

            <nav className="flex-grow px-4 space-y-2 overflow-y-auto hide-scrollbar pb-6">
                <button
                    onClick={() => setActiveTab("manage")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'manage' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Manage Team</span>
                </button>

                <button
                    onClick={() => setActiveTab("requests")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl border ${activeTab === 'requests' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-tight">Staff Requests</span>
                    </div>
                    {(requestCount + olRequestCount) > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                            {requestCount + olRequestCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("order-lines")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'order-lines' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl border ${activeTab === 'order-lines' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-tight">Order Lines</span>
                    </div>
                    {olRequestCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {olRequestCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("bills")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'bills' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl border ${activeTab === 'bills' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-tight">Bills</span>
                    </div>
                    {billCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {billCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("bill-check")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'bill-check' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl border ${activeTab === 'bill-check' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-tight">Bill Check</span>
                    </div>
                    {unverifiedCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                            {unverifiedCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'settings' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">System Settings</span>
                </button>
            </nav>

            <div className="p-6 border-t border-white/5 space-y-4">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Connected Base</p>
                    <div className="flex items-center space-x-2 text-green-400 font-bold text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Database Secure</span>
                    </div>
                </div>
                <Link to="/" className="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group font-bold">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Exit Dashboard</span>
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidenav;
