import { useState } from "react";
import { Link } from "react-router-dom";
import nishaLogo from "../../assets/Logos/NISHA LOGO .jpg";

interface NavbarProps {
    scrolled: boolean;
}

const Navbar = ({ scrolled }: NavbarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 py-4 ${scrolled ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-xl shadow-slate-200/20" : "bg-transparent"}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center space-x-2 group cursor-pointer">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden group-hover:rotate-6 transition-transform shadow-lg shadow-blue-500/30">
                        <img src={nishaLogo} alt="Nisha Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className={`text-3xl font-black tracking-tighter italic transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
                        Nisha
                    </h1>
                </div>

                <div className={`hidden md:flex space-x-15 font-black uppercase text-xl tracking-widest ${scrolled ? "text-slate-600" : "text-white"}`}>
                    <a href="#" className="hover:text-blue-400 transition-colors">Home</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Services</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">About</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
                </div>

                <div className="hidden md:block">
                    <Link to="/login">
                        <button className={`${scrolled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20"} px-8 py-3 rounded-2xl font-black text-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg ${scrolled ? 'shadow-blue-500/30' : 'shadow-none'}`}>
                            Login
                        </button>
                    </Link>
                </div>

                <button
                    className={`md:hidden p-2 rounded-xl transition-all ${scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                        <span className={`block w-full h-0.5 transition-all ${scrolled ? 'bg-slate-900' : 'bg-white'} ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-full h-0.5 transition-all ${scrolled ? 'bg-slate-900' : 'bg-white'} ${menuOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-full h-0.5 transition-all ${scrolled ? 'bg-slate-900' : 'bg-white'} ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-8 space-y-6 shadow-2xl transition-all duration-500 overflow-hidden ${menuOpen ? 'max-h-[400px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-10'}`}>
                <div className="flex flex-col space-y-4">
                    <a href="#" className="text-xl font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">Home</a>
                    <a href="#" className="text-xl font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">Services</a>
                    <a href="#" className="text-xl font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">About</a>
                    <a href="#" className="text-xl font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">Contact</a>
                </div>
                <Link to="/login" className="block w-full pt-4">
                    <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/30">
                        Login to Portal
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
