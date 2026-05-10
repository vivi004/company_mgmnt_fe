
import type { Product } from '../../../constants/productData';

interface StaffProductRatesProps {
    products: Product[];
    loading: boolean;
    theme: string;
}

const StaffProductRates = ({ theme }: StaffProductRatesProps) => {

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Rate Card</h3>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] sm:text-xs tracking-widest">Live from Master Database</p>
                    </div>
                </div>

                {/* Iframe View */}
                <div className={`rounded-[30px] sm:rounded-[48px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/30'}`} style={{ height: '75vh', minHeight: '500px' }}>
                    <iframe 
                        /* Uses widget=false to hide native bottom tabs and gid to force the sheet */
                        src={`https://docs.google.com/spreadsheets/d/1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM/htmlembed?widget=false&headers=false&chrome=false&gid=0`} 
                        loading="lazy"
                        className={`w-full h-full border-0 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-90 mix-blend-screen' : ''}`}
                        title="Live Product Rates Sheet"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default StaffProductRates;
