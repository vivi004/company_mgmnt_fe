import React from 'react';

interface LoadingScreenProps {
    message?: string;
    theme?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    message = "Loading experience...", 
    theme = 'dark' 
}) => {
    const isDark = theme === 'dark';
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen w-full font-['Outfit'] select-none transition-colors duration-500
            ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <div className="relative flex items-center justify-center">
                {/* Glowing Background Radial Effects */}
                <div className={`absolute w-32 h-32 rounded-full blur-3xl opacity-30 animate-pulse
                    ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}></div>
                <div className={`absolute w-24 h-24 rounded-full blur-2xl opacity-20 animate-pulse delay-75
                    ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`}></div>
                
                {/* Outer Spinning Ring */}
                <div className="w-16 h-16 rounded-full border-[3px] border-t-blue-600 border-r-transparent border-b-emerald-500 border-l-transparent animate-spin duration-1000"></div>
                
                {/* Inner Spinning Ring (Opposite Direction) */}
                <div className="absolute w-10 h-10 rounded-full border-[3px] border-t-purple-500 border-r-transparent border-b-transparent border-l-pink-500 animate-spin duration-700 [animation-direction:reverse]"></div>
            </div>
            
            {/* Pulsing Text */}
            <p className={`mt-8 text-xs font-black uppercase tracking-[0.25em] animate-pulse italic
                ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {message}
            </p>
        </div>
    );
};

export const TabLoadingFallback: React.FC<{ theme?: string }> = ({ theme = 'dark' }) => {
    const isDark = theme === 'dark';
    return (
        <div className="flex flex-col items-center justify-center py-20 w-full min-h-[300px] animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full border-[2.5px] border-t-blue-600 border-r-transparent border-b-emerald-500 border-l-transparent animate-spin duration-1000"></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'} italic`}>
                Loading view...
            </p>
        </div>
    );
};
