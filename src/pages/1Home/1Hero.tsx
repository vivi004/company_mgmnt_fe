import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden bg-slate-950">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 pointer-events-none opacity-80" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            <div className="max-w-7xl mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16 relative z-10">
                <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-left duration-700 font-['Outfit']">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span>Version 2.0 is now live</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Simplify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 drop-shadow-sm">Business</span> <br className="hidden md:block" /> Management
                    </h2>
                    <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed opacity-90">
                        The all-in-one platform to manage employees, track sales, optimize inventory, and gain deep insights with powerful analytics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Link to="/login">
                            <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all">
                                Login
                            </button>
                        </Link>
                        <button className="bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center group">
                            Watch Demo
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="lg:w-1/2 relative animate-in fade-in slide-in-from-right duration-700 delay-200">
                    <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 shadow-2xl">
                        <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white pl-1 shadow-lg shadow-blue-600/40">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
