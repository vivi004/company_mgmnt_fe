

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
}

interface StaffDirectoryProps {
    employees: Employee[];
    loading: boolean;
    theme: string;
    userProfileId: number;
}

const StaffDirectory = ({ employees, loading, theme, userProfileId }: StaffDirectoryProps) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black italic tracking-tighter mb-4">Internal Workforce Network</h2>
                    <p className="text-blue-100 text-xl font-bold opacity-90 italic">Browse the organization and maintain your professional profile.</p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Company Directory Table */}
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className={`text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Company Directory</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Global Resource Nodes</p>
                    </div>
                    <div className="bg-slate-100 px-5 py-2 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest">
                        {employees.length} TOTAL MEMBERS
                    </div>
                </div>

                <div className={`rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} border-b`}>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Identity</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Operational Role</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                                {loading ? (
                                    <tr><td colSpan={2} className="px-10 py-20 text-center text-slate-500 font-black italic uppercase tracking-widest animate-pulse">Scanning Secure Directory...</td></tr>
                                ) : (
                                    employees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-blue-500/5 transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center">
                                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-xl mr-6 border transition-all group-hover:rotate-6 ${theme === 'dark' ? 'bg-slate-800 text-blue-400 border-white/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-xl tracking-tight transition-colors italic uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-sm font-bold text-slate-400 mt-0.5">{emp.id === userProfileId ? 'You (Operational Self)' : 'Verified Member'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className={`inline-flex items-center px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border transition-all italic ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500'}`}>
                                                    {emp.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDirectory;
