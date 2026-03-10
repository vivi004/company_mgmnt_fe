import { useState, useRef, useEffect } from "react";
import Navbar from "./1Navbar";
import Footer from "./3Footer";

export default function ContactPage() {
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

    const contactInfo = [
        { label: "Phone", value: "99651 74472", icon: "📞", href: "tel:+919965174472" },
        { label: "Location", value: "Konganapuram, Salem, Tamil Nadu", icon: "📍", href: "#" },
        { label: "Business", value: "Nisha Oil Mill", icon: "🏭", href: "#" },
        { label: "Owner", value: "Prathap", icon: "👤", href: "#" },
    ];

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 overflow-hidden relative font-['Outfit']">
            <Navbar scrolled={scrolled} />

            <main ref={scrollRef} className="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth">

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 opacity-80" />
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-sky-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-4 py-1.5 text-sky-300 font-bold text-xs uppercase tracking-widest mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                            <span>Get In Touch</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400 italic">Us</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                            Have questions about our products or want to place a bulk order? We'd love to hear from you.
                        </p>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">Reach Us</h3>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                How to Find Us
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                            {contactInfo.map((info) => (
                                <a
                                    key={info.label}
                                    href={info.href}
                                    className="group p-8 rounded-[32px] bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 text-center block"
                                >
                                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{info.icon}</div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{info.label}</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{info.value}</p>
                                </a>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12 space-y-4">
                                <h3 className="text-blue-600 font-black tracking-widest uppercase text-xs">Send a Message</h3>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                    Drop Us a Line
                                </h2>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert("Thank you for your message! We will get back to you soon.");
                                }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Rajesh Kumar"
                                            className="w-full rounded-2xl px-6 py-4 border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="e.g. 98765 43210"
                                            className="w-full rounded-2xl px-6 py-4 border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. rajesh@example.com"
                                        className="w-full rounded-2xl px-6 py-4 border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Tell us about your requirements, quantity needed, preferred oils..."
                                        className="w-full rounded-2xl px-6 py-4 border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Map / Location CTA */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                            Visit Our Mill
                        </h3>
                        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                            We're located in the heart of Konganapuram, Salem. Come see how we produce pure oils using traditional methods.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 max-w-xl mx-auto">
                            <p className="text-slate-300 font-medium text-lg mb-2">📍 Nisha Oil Mill</p>
                            <p className="text-white font-black text-xl">Konganapuram, Salem</p>
                            <p className="text-white font-black text-xl">Tamil Nadu, India</p>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Call Us Directly</p>
                                <a href="tel:+919965174472" className="text-blue-400 font-black text-2xl hover:text-blue-300 transition-colors">
                                    99651 74472
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />

            </main>
        </div>
    );
}
