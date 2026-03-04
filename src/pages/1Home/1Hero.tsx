import { Link } from "react-router-dom";
import dashboard from "../../assets/Images/home.jpeg";

const Hero = () => {
    return (
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden bg-slate-950">

            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 opacity-80" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />

            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">

                {/* Left Content */}
                <div className="lg:w-1/2 space-y-8 text-center lg:text-left font-['Outfit']">

                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 font-bold text-xs uppercase tracking-widest">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span>Version 2.0 is now live</span>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Simplify Your
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                            {" "}Business
                        </span>
                        <br className="hidden md:block" />
                        Management
                    </h2>

                    <p className="text-lg md:text-xl text-slate-200 font-medium max-w-xl">
                        The all-in-one platform to manage employees, track sales,
                        optimize inventory, and gain deep insights with powerful analytics.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">

                        <Link to="/login">
                            <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition">
                                Login
                            </button>
                        </Link>

                        <button className="bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-700 transition flex items-center justify-center group">
                            Watch Demo
                            <svg
                                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>

                    </div>
                </div>


                {/* Right Image Section */}
                <div className="lg:w-1/2">

                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-3 shadow-2xl">

                        <img
                            src={dashboard}
                            alt="Business Management Dashboard"
                            className="w-full h-auto rounded-2xl object-cover"
                        />

                    </div>

                </div>

            </div>

        </section>
    );
};

export default Hero;