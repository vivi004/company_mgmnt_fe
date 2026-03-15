import React from 'react';

interface StaffSettingsProps {
    theme: string;
    setTheme: (theme: string) => void;
    userProfile: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    setShowModal: (show: boolean) => void;
    profilePic: string;
    setProfilePic: (pic: string) => void;
}

const StaffSettings = ({ theme, setTheme, userProfile, setShowModal, profilePic, setProfilePic }: StaffSettingsProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfilePic(base64String);
                localStorage.setItem('staffProfilePic', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="animate-in zoom-in-95 fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Profile Image Card */}
                <div className={`p-10 rounded-[50px] border lg:col-span-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
                    <div className="flex items-center space-x-5 mb-10">
                        <div className="w-16 h-16 bg-emerald-600 rounded-[20px] flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/40">📸</div>
                        <div>
                            <h3 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Profile Identity</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Personalize Your Presence</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div 
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={`w-40 h-40 rounded-full border-4 overflow-hidden transition-all duration-500 shadow-2xl group-hover:scale-105 group-hover:rotate-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-50'}`}>
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-5xl font-black italic ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>
                                        {userProfile.first_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                <span className="text-white font-black text-xs uppercase tracking-widest px-4 py-2 border border-white/40 rounded-full">Change Photo</span>
                            </div>
                        </div>

                        <div className="flex-grow space-y-4 text-center md:text-left">
                            <h4 className={`text-lg font-black italic ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Customize your Avatar</h4>
                            <p className="text-slate-500 text-sm font-medium max-w-sm">
                                Upload a profile image to make your dashboard unique. Recommended size: 400x400px.
                            </p>
                            
                            <input 
                                type="file" 
                                hidden 
                                ref={fileInputRef} 
                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                onChange={handleFileChange}
                            />
                            
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                                >
                                    Browse Image
                                </button>
                                {profilePic && (
                                    <button 
                                        onClick={() => {
                                            setProfilePic("");
                                            localStorage.removeItem('staffProfilePic');
                                        }}
                                        className={`px-8 py-3 font-black rounded-2xl text-[10px] uppercase tracking-widest border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' : 'bg-white border-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100'}`}
                                    >
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Supports .PNG, .JPG, .GIF</p>
                        </div>
                    </div>
                </div>

                <div className={`p-10 rounded-[50px] border ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
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
                            <button onClick={() => setTheme('light')} className={`p-6 rounded-[35px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'light' ? 'bg-blue-600 border-white shadow-2xl shadow-blue-500/50 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}>
                                <span className="text-3xl">☀️</span>
                                <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-white' : 'text-slate-900'}`}>Bright Mode</span>
                            </button>
                            <button onClick={() => setTheme('dark')} className={`p-6 rounded-[35px] border-4 flex flex-col items-center justify-center space-y-3 transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-indigo-500/40 scale-105' : 'bg-slate-50 border-slate-100 hover:border-slate-200 opacity-60'}`}>
                                <span className="text-3xl">🌙</span>
                                <span className={`font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Deep Space</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`p-10 rounded-[50px] border ${theme === 'dark' ? 'bg-slate-900 border-white/5 shadow-2xl shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
                    <div className="flex items-center space-x-5 mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-3xl shadow-xl shadow-blue-500/40">⚙️</div>
                        <div>
                            <h3 className={`text-2xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Profile Management</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Identity Operations</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className={`text-sm font-black italic px-2 uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Update Your Credentials</p>
                        <button onClick={() => setShowModal(true)} className={`w-full p-6 rounded-[35px] border-2 flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-900'}`}>
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <span className="font-black italic uppercase tracking-widest text-xs">Edit Personal Details</span>
                            </div>
                            <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StaffSettings;
