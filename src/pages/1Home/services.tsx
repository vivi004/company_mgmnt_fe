import { useState, useRef, useEffect } from "react";
import Navbar from "./1Navbar";
import Footer from "./3Footer";
import { Link } from "react-router-dom";

export default function ServicesPage() {
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

    const services = [
        {
            title: "Premium Cold-Pressed Oils",
            description: "100% pure, unrefined oils extracted using traditional cold-press methods to retain maximum nutrients, aroma, and natural health benefits.",
            icon: "🫒",
            color: "emerald"
        },
        {
            title: "Wholesale Network Supply",
            description: "Reliable bulk distribution to extensive network nodes and villages, ensuring consistent stock availability for community storefronts.",
            icon: "🚚",
            color: "blue"
        },
        {
            title: "Direct-to-Staff Delivery",
            description: "Seamless internal requisition system allowing verified staff to place and track orders directly through our operational node infrastructure.",
            icon: "📦",
            color: "indigo"
        },
        {
            title: "Custom Volume Packaging",
            description: "Flexible packaging options ranging from 500ml retail bottles to multi-litre comprehensive wholesale boxes dynamically managed by our system.",
            icon: "🛢️",
            color: "amber"
        }
    ];

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 overflow-hidden relative font-['Outfit']">
            <Navbar scrolled={scrolled} />

            <main ref={scrollRef} className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth">

                {/* Hero Section — Dark background to match Navbar contrast */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 opacity-80" />
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 font-bold text-xs uppercase tracking-widest mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            <span>Enterprise Solutions</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                            Elevating <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-300 to-sky-400 italic">Purity</span>
                            <br /> & Distribution
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                            We connect traditional, high-quality oil production with a modern, vast distribution network.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-16 md:py-24 bg-white relative z-10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">
                                What We Offer
                            </h3>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                Our Core Services
                            </h2>
                            <p className="text-slate-700 text-lg font-medium">
                                From traditional oil extraction to modern distribution — everything under one roof.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {services.map((service) => (
                                <div
                                    key={service.title}
                                    className="group p-10 lg:p-14 rounded-[40px] bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl mb-8 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg ` +
                                        (service.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/20' :
                                            service.color === 'blue' ? 'bg-blue-50 text-blue-600 shadow-blue-500/20' :
                                                service.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 shadow-indigo-500/20' :
                                                    'bg-amber-50 text-amber-600 shadow-amber-500/20')
                                    }>
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-3 gap-16 text-center">
                        <div>
                            <h4 className="text-6xl font-black text-blue-500">9+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em] mt-2">Years of Trusted Service</p>
                        </div>
                        <div>
                            <h4 className="text-6xl font-black text-emerald-400">15+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em] mt-2">Oil Products Available</p>
                        </div>
                        <div>
                            <h4 className="text-6xl font-black text-sky-400">100%</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em] mt-2">Pure & Natural Oils</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-blue-600 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
                        <h3 className="text-3xl md:text-6xl font-black text-white tracking-tighter">
                            Ready to Access the Network?
                        </h3>
                        <p className="text-white text-xl font-bold max-w-2xl mx-auto">
                            Join our internal directory to place orders, track requisitions, and manage sector resources seamlessly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link to="/login">
                                <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all">
                                    Enter Portal
                                </button>
                            </Link>
                            <button className="bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl border border-blue-400 hover:bg-blue-400 transition-all">
                                Call: 99651 74472
                            </button>
                        </div>
                    </div>
                </section>

                <Footer />

            </main>
        </div>
    );
}
