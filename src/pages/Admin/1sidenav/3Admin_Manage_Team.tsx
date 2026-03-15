
import type { Employee } from '../../../types/DashboardTypes';

interface ManageTeamProps {
    employees: Employee[];
    loading: boolean;
    theme: string;
    billCount: number;
    handleEdit: (emp: Employee) => void;
    handleDelete: (id: number) => void;
    handleAddNew: () => void;
}

const AdminManageTeam = ({ employees, loading, theme, billCount, handleEdit, handleDelete, handleAddNew }: ManageTeamProps) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`p-8 rounded-[40px] border transition-all hover:-translate-y-2 group ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Global Workforce</p>
                            <h3 className={`text-6xl font-black mt-3 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{employees.length}</h3>
                        </div>
                        <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform">
                            👥
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100/5 flex items-center text-green-500 text-sm font-black italic">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-ping" />
                        <span>Real-time sync enabled</span>
                    </div>
                </div>

                <div className={`p-8 rounded-[40px] border transition-all hover:-translate-y-2 group ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Operational Nodes</p>
                            <h3 className={`text-6xl font-black mt-3 text-indigo-500`}>
                                {employees.filter(e => e.status === 'Active').length}
                            </h3>
                        </div>
                        <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/40 group-hover:rotate-12 transition-transform">
                            🏢
                        </div>
                    </div>
                    <p className="mt-8 text-slate-400 text-sm font-bold italic">Active personnel status</p>
                </div>

                <div className={`p-8 rounded-[40px] border transition-all hover:-translate-y-2 group ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Bills Processed</p>
                            <h3 className={`text-6xl font-black mt-3 text-amber-500 uppercase tracking-tighter`}>
                                {billCount}
                            </h3>
                        </div>
                        <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40 group-hover:rotate-12 transition-transform">
                            🧾
                        </div>
                    </div>
                    <p className="mt-8 text-slate-400 text-sm font-bold italic">Total bills in ledger</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <div>
                    <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Manage staff and admins</h3>
                    <p className="text-slate-500 font-bold mt-1">Found {employees.length} active database nodes</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-10 py-5 rounded-[30px] font-black shadow-2xl shadow-blue-600/40 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all text-xl uppercase tracking-widest flex items-center"
                >
                    <span className="text-3xl mr-3">+</span> Add User
                </button>
            </div>

            <div className={`rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">User Identity</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Credentials</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Access Role</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                            {loading ? (
                                <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-500 font-black italic uppercase tracking-widest">Initializing Secure Stream...</td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-500 font-black italic uppercase tracking-widest">Network Empty</td></tr>
                            ) : (
                                employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-blue-500/5 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center">
                                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-xl mr-6 border transition-all group-hover:rotate-6 ${theme === 'dark' ? 'bg-slate-800 text-blue-400 border-white/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                    {emp.first_name[0]}{emp.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-xl tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-sm font-bold text-slate-500 mt-0.5">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <code className="text-xs font-black bg-slate-500/10 px-3 py-1.5 rounded-lg text-slate-400 uppercase tracking-widest">
                                                @{emp.username || 'null'}
                                            </code>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${emp.role.toLowerCase() === 'admin'
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ring-4 ring-indigo-500/5'
                                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center">
                                                <div className={`w-2.5 h-2.5 rounded-full mr-3 border-2 ${emp.status === 'Active' ? 'bg-green-500 border-green-200' : 'bg-slate-300 border-slate-100'}`} />
                                                <span className={`text-xs font-black uppercase tracking-tighter ${emp.status === 'Active' ? 'text-green-500' : 'text-slate-400'}`}>
                                                    {emp.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end items-center space-x-3">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-800 text-white border-white/10 hover:bg-blue-600 hover:border-blue-500' : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-blue-600/30'}`}
                                                >
                                                    Modify
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className={`p-3.5 rounded-2xl transition-all border group/del ${theme === 'dark' ? 'bg-slate-800 border-white/10 hover:bg-red-500/20 hover:border-red-500/40 text-slate-400 hover:text-red-500' : 'bg-red-50 border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-xl hover:shadow-red-500/40'}`}
                                                    title="Purge Node"
                                                >
                                                    <svg className="w-5 h-5 group-hover/del:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminManageTeam;
