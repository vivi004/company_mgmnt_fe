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
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 overflow-hidden relative font-['Outfit']">

            <Navbar scrolled={isScrolled} />

            <main
                ref={scrollRef}
                className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth"
            >

                <Hero />

                {/* ================= PRODUCTS / FEATURES ================= */}
                <section className="py-16 md:py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">

                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">
                                Nisha Oil Mill Products
                            </h3>

                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                Pure & Traditional Oil Products
                            </h2>

                            <p className="text-slate-700 text-lg font-medium">
                                Nisha Oil Mill provides high-quality natural oils and related
                                products trusted by customers in Konganapuram and nearby areas.
                            </p>
                        </div>

                        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 pb-8 md:pb-0 hide-scrollbar snap-x">

                            {[
                                {
                                    title: "Natural Oil Production",
                                    desc: "We produce traditional oils like Groundnut Oil, Coconut Oil, Sesame Oil, Castor Oil and Lamp Oil using natural processing methods.",
                                    icon: "🛢️",
                                    color: "blue"
                                },
                                {
                                    title: "Wide Range of Oils",
                                    desc: "Available oils include Groundnut Oil, Coconut Oil, Neem Oil, Mahua Oil, Palm Oil and trusted brands like Varshini, Roshini and Kumaran.",
                                    icon: "🥥",
                                    color: "indigo"
                                },
                                {
                                    title: "Oil Cakes & Snacks",
                                    desc: "We also supply Powdered Oil Cake, Block Oil Cake for agriculture and Peanut Barfi (Candy Jar).",
                                    icon: "🌾",
                                    color: "sky"
                                }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="min-w-[280px] md:min-w-0 snap-center bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 group transition-all duration-500"
                                >
                                    <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                                        {feature.icon}
                                    </div>

                                    <h4 className="text-xl font-black mb-3 text-slate-900">
                                        {feature.title}
                                    </h4>

                                    <p className="text-slate-700 font-medium leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                </section>


                {/* ================= BUSINESS STATS ================= */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">

                    <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-3 gap-16 text-center">

                        <div>
                            <h4 className="text-6xl font-black text-blue-500">9+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">
                                Years of Trusted Service
                            </p>
                        </div>

                        <div>
                            <h4 className="text-6xl font-black text-indigo-400">15+</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">
                                Oil Products Available
                            </p>
                        </div>

                        <div>
                            <h4 className="text-6xl font-black text-sky-400">100%</h4>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">
                                Pure & Natural Oils
                            </p>
                        </div>

                    </div>
                </section>


                {/* ================= CONTACT CTA ================= */}
                <section className="py-32 bg-blue-600 relative overflow-hidden">

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">

                        <h3 className="text-3xl md:text-6xl font-black text-white tracking-tighter">
                            Experience the Purity of Nisha Oil Mill
                        </h3>

                        <p className="text-white text-xl font-bold max-w-2xl mx-auto">
                            We supply pure Groundnut Oil, Coconut Oil, Sesame Oil,
                            Castor Oil and many more traditional oils.
                            Contact us today to place your order.
                        </p>

                        <p className="text-white text-lg">
                            Owner: <strong>Prathap</strong> | Contact: <strong>99651 74472</strong>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

                            <button className="bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-slate-50">
                                Contact Now
                            </button>

                            <button className="bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl border border-blue-400">
                                Call: 99651 74472
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