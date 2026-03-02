
interface SettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
    companyName: string;
    setCompanyName: (name: string) => void;
    backendStatus: string;
}

const AdminSettings = ({ theme, setTheme, companyName, setCompanyName, backendStatus }: SettingsProps) => {
    return (
        <div className="animate-in zoom-in-95 fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Company Branding */}
                <div className={`p-10 rounded-[50px] border ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                    <div className="flex items-center space-x-5 mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-3xl shadow-xl shadow-blue-500/40">🏢</div>
                        <div>
                            <h3 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Profile Management</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Global Branding Assets</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className={`text-sm font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Organization Name</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className={`w-full px-8 py-5 rounded-[25px] font-black text-xl border transition-all focus:outline-none focus:ring-4 ${theme === 'dark' ? 'bg-slate-800 border-white/10 text-white focus:ring-blue-500/20 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-600/10 focus:border-blue-600'}`}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 opacity-50 group-focus-within:opacity-100 transition-opacity">⚡</div>
                            </div>
                        </div>
                        <div className="bg-blue-500/5 p-6 rounded-[30px] border border-blue-500/10">
                            <p className="text-xs font-bold text-blue-500/60 leading-relaxed italic">Changing the organization name will reflect across the entire dashboard interface immediately. Persistent shared settings are saved locally.</p>
                        </div>
                    </div>
                </div>

                {/* Appearance Toggles */}
                <div className={`p-10 rounded-[50px] border ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
                    <div className="flex items-center space-x-5 mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/40">🎨</div>
                        <div>
                            <h3 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Visual Experience</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Appearance & Interface</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className={`text-sm font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Select Interface Mode</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-6 rounded-[35px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'light' ? 'bg-blue-600 border-white shadow-2xl shadow-blue-500/50 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}
                            >
                                <span className="text-3xl">☀️</span>
                                <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-white' : 'text-slate-900'}`}>Bright Mode</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-6 rounded-[35px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-indigo-500/40 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}
                            >
                                <span className="text-3xl">🌙</span>
                                <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Deep Space</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className={`p-10 rounded-[50px] border lg:col-span-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-green-500 rounded-[20px] flex items-center justify-center text-3xl shadow-xl shadow-green-500/40">🛰️</div>
                            <div>
                                <h3 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>System Vitality</h3>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Global Node Monitoring</p>
                            </div>
                        </div>
                        <div className="bg-slate-500/10 px-8 py-4 rounded-[30px] border border-slate-500/20">
                            <p className="text-[10px] font-black italic text-slate-500 uppercase tracking-[0.2em] mb-1">Last Diagnostics</p>
                            <p className={`font-black text-xs ${backendStatus === 'Disconnected' ? 'text-red-500' : 'text-green-500'}`}>{new Date().toLocaleTimeString()} - {backendStatus}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className={`p-6 rounded-[30px] border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Engine</p>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 font-bold">V1</div>
                                <p className={`font-black italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Express 4.1.2</p>
                            </div>
                        </div>
                        <div className={`p-6 rounded-[30px] border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Storage Layer</p>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">SQL</div>
                                <p className={`font-black italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MySQL 8.0</p>
                            </div>
                        </div>
                        <div className={`p-6 rounded-[30px] border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit Stream</p>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">ON</div>
                                <p className={`font-black italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Active Logging</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
