
import type { Product } from '../../../constants/productData';

interface StaffProductRatesProps {
    products: Product[];
    loading: boolean;
    theme: string;
}

const StaffProductRates = ({ theme }: StaffProductRatesProps) => {

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[48px] p-6 sm:p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter mb-2 sm:mb-4">Live Product Rates</h2>
                    <p className="text-blue-100 text-sm sm:text-xl font-bold opacity-90 italic">View the Master Rate Sheet directly.</p>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rate Card</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] sm:text-xs tracking-widest">Live from Master Database</p>
                    </div>
                </div>

                <div className={`rounded-[30px] sm:rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`} style={{ height: '75vh', minHeight: '500px' }}>
                    <iframe 
                        src="https://docs.google.com/spreadsheets/d/1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM/htmlembed?widget=true&headers=false" 
                        loading="lazy"
                        className={`w-full h-full border-0 ${theme === 'dark' ? 'opacity-90 mix-blend-screen' : ''}`}
                        title="Live Product Rates Sheet"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default StaffProductRates;
