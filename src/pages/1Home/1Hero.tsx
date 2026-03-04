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

                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 font-bold text-xs uppercase tracking-widest">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <span>Nisha Oil Mill • Konganapuram</span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                        Welcome to
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                            {" "}Nisha Oil Mill
                        </span>
                        <br className="hidden md:block" />
                        Pure & Natural Oils
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-slate-200 font-medium max-w-xl leading-relaxed">
                        Nisha Oil Mill is a trusted oil manufacturing business located in
                        Konganapuram, Salem. We produce high-quality traditional oils
                        using natural methods. Our products include Groundnut Oil,
                        Coconut Oil, Sesame (Gingelly) Oil, Castor Oil, Lamp Oil (Puja Oil),
                        Neem Oil, Mahua Oil, and Palm Oil.
                    </p>

                    {/* Product List */}
                    <p className="text-md text-slate-300 max-w-xl">
                        We also supply branded oils such as <strong>Varshini Brand Oil,
                            Roshini Brand Oil, Rosi Gold Palm Oil, Kumaran Groundnut Oil,
                            and Varshini Gold.</strong> Along with oils, we offer
                        <strong> Powdered Oil Cake, Block Oil Cake, and Peanut Barfi (Candy Jar).</strong>
                    </p>

                    {/* Owner & Contact */}
                    <p className="text-blue-300 font-semibold">
                        Owner: Prathap | Contact: 99651 74472
                    </p>

                    {/* Advertising Line */}
                    <p className="text-slate-300 italic">
                        "Pure quality oils with traditional taste – trusted by customers
                        for years. Order today and experience the natural goodness of
                        Nisha Oil Mill products."
                    </p>

                    {/* Buttons */}
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
                <div className="lg:w-1/2 flex justify-end">

                    <div className="inline-block bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-3 shadow-2xl">

                        <img
                            src={dashboard}
                            alt="Nisha Oil Mill"
                            className="rounded-2xl object-contain max-w-[500px] max-h-[500px]"
                        />

                    </div>

                </div>

            </div>

        </section>
    );
};

export default Hero;