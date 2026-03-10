import { useState, useRef, useEffect } from "react";
import Navbar from "./1Navbar";
import Footer from "./3Footer";

export default function AboutPage() {
    const [scrolled, setScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setScrolled(scrollRef.current.scrollTop > 20);
            }
        };
        const container = scrollRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const values = [
        { title: "Tradition", desc: "We preserve age-old cold-press extraction methods passed down through generations.", icon: "🏛️" },
        { title: "Purity", desc: "Every drop is 100% natural — no chemicals, no additives, no compromises.", icon: "💧" },
        { title: "Quality", desc: "Rigorous quality checks at every stage ensure only the finest oils reach our customers.", icon: "✅" },
        { title: "Community", desc: "We empower local farmers and workers across the Konganapuram region.", icon: "🤝" },
    ];

    const milestones = [
        { year: "2015", event: "Nisha Oil Mill was founded in Konganapuram, Salem." },
        { year: "2017", event: "Expanded product range to 10+ natural oil varieties." },
        { year: "2019", event: "Launched branded lines — Varshini, Roshini, and Kumaran." },
        { year: "2022", event: "Established wholesale distribution across the region." },
        { year: "2024", event: "Digitized operations with a full internal management platform." },
    ];

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 overflow-hidden relative font-['Outfit']">
            <Navbar scrolled={scrolled} />

            <main ref={scrollRef} className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth">

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 opacity-80" />
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span>Our Story</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-sky-400 italic">Nisha Oil Mill</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                            Rooted in tradition, powered by purpose — delivering pure, natural oils from the heart of Konganapuram to families everywhere.
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-6">
                                <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">Who We Are</h3>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                    A Legacy of Pure & Natural Oils
                                </h2>
                                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                    Nisha Oil Mill is a trusted oil manufacturing business located in Konganapuram, Salem. We produce high-quality traditional oils using natural methods — Groundnut Oil, Coconut Oil, Sesame Oil, Castor Oil, Lamp Oil, Neem Oil, Mahua Oil, and Palm Oil.
                                </p>
                                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                    We also supply branded oils such as <strong>Varshini Brand Oil, Roshini Brand Oil, Rosi Gold Palm Oil, Kumaran Groundnut Oil, and Varshini Gold.</strong> Along with oils, we offer <strong>Powdered Oil Cake, Block Oil Cake, and Peanut Barfi (Candy Jar).</strong>
                                </p>
                                <div className="pt-4">
                                    <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                                        Owner: Prathap &nbsp;|&nbsp; Contact: 99651 74472
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-100 to-blue-50 rounded-[48px] p-12 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="text-8xl">🫒</div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Pure. Natural. Trusted.</h4>
                                    <p className="text-slate-500 font-medium">Since 2015 — Konganapuram, Salem</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-16 md:py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">What Drives Us</h3>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">Our Core Values</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((v) => (
                                <div key={v.title} className="group p-8 rounded-[32px] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 text-center">
                                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{v.icon}</div>
                                    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{v.title}</h4>
                                    <p className="text-slate-500 font-medium leading-relaxed text-sm">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline / Milestones */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16 space-y-4">
                            <h3 className="text-indigo-400 font-black tracking-widest uppercase text-xs">Our Journey</h3>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Key Milestones</h2>
                        </div>
                        <div className="space-y-0 relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
                            {milestones.map((m, idx) => (
                                <div key={idx} className="relative pl-16 pb-12 last:pb-0 group">
                                    <div className="absolute left-4 top-1.5 w-5 h-5 rounded-full border-2 border-indigo-400 bg-slate-950 group-hover:bg-indigo-400 transition-colors duration-300" />
                                    <div className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-1">{m.year}</div>
                                    <p className="text-slate-300 font-medium text-lg">{m.event}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Footer />

            </main>
        </div>
    );
}
