import nishaLogo from "../../assets/Logos/NISHA LOGO .jpg";

const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20">
                        <img src={nishaLogo} alt="Nisha Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter italic">Nisha</span>
                </div>
                <div className="flex space-x-10 text-slate-700 font-black uppercase text-[10px] tracking-widest">
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Twitter</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a>
                </div>
                <p className="text-slate-600 text-xs font-black uppercase tracking-widest">
                    © {new Date().getFullYear()} Nisha Enterprise. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
