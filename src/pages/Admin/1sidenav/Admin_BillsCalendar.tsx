import React from 'react';

interface AdminBillsCalendarProps {
    isCalendarOpen: boolean;
    currentCalDate: Date;
    selectedDate: string;
    todayStr: string;
    minDate: Date;
    maxDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleDateSelect: (date: Date) => void;
    generateCalendarDays: () => (Date | null)[];
    theme: string;
}

const AdminBillsCalendar: React.FC<AdminBillsCalendarProps> = ({
    isCalendarOpen, currentCalDate, selectedDate, todayStr,
    minDate, maxDate, handlePrevMonth, handleNextMonth, handleDateSelect, generateCalendarDays, theme
}) => {
    if (!isCalendarOpen) return null;
    const isDark = theme === 'dark';

    return (
        <div className={`absolute top-full right-0 lg:left-0 mt-3 p-5 rounded-[30px] shadow-2xl z-50 w-80 border animate-in slide-in-from-top-2 fade-in duration-200
                                ${isDark ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={handlePrevMonth} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className={`font-black uppercase tracking-widest text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={handleNextMonth} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className={`text-[10px] font-black uppercase tracking-wider py-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
                ))}
                {generateCalendarDays().map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="h-9" />;

                    // Determine the actual date string without timezone shifting offset
                    const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const isOOB = date < minDate || date > maxDate;

                    return (
                        <button
                            key={i}
                            disabled={isOOB}
                            onClick={() => handleDateSelect(date)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative
                                                    ${isOOB ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}
                                                    ${isSelected
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-black scale-110'
                                    : (isDark
                                        ? (isToday ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800')
                                        : (isToday ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'))}
                                                `}
                        >
                            {date.getDate()}
                            {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />}
                        </button>
                    );
                })}
            </div>
            <div className={`text-[9px] text-center font-bold italic pt-3 border-t mt-2 ${isDark ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                Data available Mar 2025 – Apr 2026
            </div>
        </div>
    );
};

export default AdminBillsCalendar;
