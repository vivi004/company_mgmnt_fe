import { useState, useRef, useEffect } from "react";
import Hero from "./1Hero";
import Footer from "./3Footer";
import Navbar from "./1Navbar";

const HomeContent = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setIsScrolled(scrollRef.current.scrollTop > 20);
            }
        };
        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 overflow-hidden relative font-['Outfit']">
            {/* Navbar is fixed inside the component, but we place it here to be part of the app shell */}
            <Navbar scrolled={isScrolled} />

            {/* Scrollable Container */}
            <main
                ref={scrollRef}
                className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth"
            >
                {/* Hero is now inside the scrollable area */}
                <Hero />

                {/* ================= FEATURES ================= */}
                <section className="py-16 md:py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">Powerful Enterprise Tools</h3>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">Everything you need to scale</h2>
                            <p className="text-slate-700 text-lg font-medium">Stop juggling multiple apps. BizManager brings all your business operations into a single, unified dashboard.</p>
                        </div>

                        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 pb-8 md:pb-0 hide-scrollbar snap-x">
                            {[
                                { title: "Employee Management", desc: "Track attendance, payroll, and performance with intuitive tools.", icon: "👥", color: "blue" },
                                { title: "Sales Analytics", desc: "Real-time data visualization and predictive insights for your growth.", icon: "📈", color: "indigo" },
                                { title: "Inventory Control", desc: "Automated low-stock alerts and multi-warehouse management.", icon: "📦", color: "sky" }
                            ].map((feature, idx) => (
                                <div key={idx} className="min-w-[280px] md:min-w-0 snap-center bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 group transition-all duration-500">
                                    <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-xl font-black mb-3 text-slate-900">{feature.title}</h4>
                                    <p className="text-slate-700 font-medium leading-relaxed">{feature.desc}</p>
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <button className={`text-${feature.color}-600 font-black text-xs uppercase tracking-widest flex items-center hover:opacity-80`}>
                                            Explore {feature.title.split(' ')[0]}
                                            <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= STATS ================= */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 skew-x-12 translate-x-1/2 pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-3 gap-16 text-center">
                        <div className="space-y-2">
                            <h4 className="text-6xl font-black text-blue-500 mb-2 tracking-tighter">25+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Global Regions</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-6xl font-black text-indigo-400 mb-2 tracking-tighter">10k+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Daily Operations</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-6xl font-black text-sky-400 mb-2 tracking-tighter">24/7</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">System Support</p>
                        </div>
                    </div>
                </section>

                {/* ================= CALL TO ACTION ================= */}
                <section className="py-32 bg-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-700 translate-y-1/2 rounded-[100%] scale-150 blur-3xl opacity-50 pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
                        <h3 className="text-3xl md:text-6xl font-black text-white tracking-tighter">
                            Scale Your Enterprise Today
                        </h3>
                        <p className="text-white text-xl font-bold max-w-2xl mx-auto px-4 opacity-100 drop-shadow-md">
                            Experience the future of business management with our unified command center.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-slate-50 hover:-translate-y-1 active:scale-95 transition-all">
                                Get Started Now
                            </button>
                            <button className="bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl border border-blue-400 hover:bg-blue-400/80 transition-all">
                                Schedule Demo
                            </button>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
};

export default HomeContent;
