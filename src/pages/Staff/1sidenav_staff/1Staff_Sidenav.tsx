import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import nishaLogo from "../../../assets/Logos/NISHA LOGO .jpg";

interface StaffSidenavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    companyName: string;
    unverifiedCount: number;
    onClose?: () => void;
}

const StaffSidenav = ({ activeTab, setActiveTab, companyName, unverifiedCount, onClose }: StaffSidenavProps) => {
    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl z-20 border-r border-white/5 relative">
            <div className="p-8 pb-6 flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20">
                        <img src={nishaLogo} alt="Nisha Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">{companyName}</h1>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Staff Access</p>
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

            <nav className="flex-grow px-4 space-y-2 mt-4 overflow-y-auto hide-scrollbar pb-6">
                <button
                    onClick={() => setActiveTab("product-rates")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'product-rates' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'product-rates' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Product Rates</span>
                </button>

                <button
                    onClick={() => setActiveTab("order-lines")}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === 'order-lines' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <div className={`p-2 rounded-xl border ${activeTab === 'order-lines' ? 'bg-white/20 border-white/30' : 'bg-slate-800 border-slate-700'} group-hover:scale-110 transition-transform`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Order Lines</span>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight">Settings</span>
                </button>
            </nav>

            <div className="p-6 border-t border-white/5">
                <Link to="/" className="flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all group font-bold">
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                </Link>
            </div>
        </aside>
    );
};

export default StaffSidenav;
