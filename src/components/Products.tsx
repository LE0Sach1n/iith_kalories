import { motion } from 'framer-motion';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import intimacyImg from '../assets/products/intimacy.png';
import energyImg from '../assets/products/energy.png';
import sleepImg from '../assets/products/sleep.png';

export function Products({ trackAction, showToast }: any) {
  const products = [
    {
      id: 'intimacy',
      name: 'Intimacy Dark Chocolate',
      tagline: 'Deep Connection & Vasodilation',
      desc: 'Formulated with Maca Root, Epimedium, and premium Cacao to promote healthy blood flow and elevate shared experiences.',
      price: '₹1499',
      img: intimacyImg,
      color: 'bg-brand-red',
      rating: 4.9,
      reviews: 342
    },
    {
      id: 'energy',
      name: 'Energy Square Dark Chocolate',
      tagline: 'Sustained Output & Focus',
      desc: 'Infused with Cordyceps, Lions Mane, and natural L-Theanine for a crash-free drive during intense activity or work.',
      price: '₹999',
      img: energyImg,
      color: 'bg-brand-orange',
      rating: 4.8,
      reviews: 891
    },
    {
      id: 'sleep',
      name: 'Melatonin Sleep Square',
      tagline: 'Deep Recovery & REM Support',
      desc: 'A gentle blend of Ashwagandha, Magnesium Glycinate, and Melatonin wrapped in 70% dark chocolate for perfect rest.',
      price: '₹1199',
      img: sleepImg,
      color: 'bg-brand-navy',
      rating: 4.9,
      reviews: 512
    }
  ];

  return (
    <motion.div 
      key="products"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="pb-20 md:pb-8 flex flex-col space-y-8"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mt-2 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
         <div className="text-left">
            <h2 className="text-2xl font-bold text-brand-navy tracking-tight mb-1">Our Collection</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">Precision crafted functional chocolate aligned perfectly with your Forkplay AI and Vitality metrics.</p>
         </div>
         <div className="mt-4 md:mt-0 bg-brand-light dark:bg-brand-navy/20 border border-brand-orange/30 px-4 py-2 rounded-full flex items-center gap-2">
            <ShoppingBag size={16} className="text-brand-orange" />
            <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">Store Restricted Access</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-shadow group flex flex-col">
            <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start text-left">
                    <span className={`inline-block px-2 py-1 rounded ${p.color} text-white text-[9px] font-bold uppercase tracking-widest mb-2 shadow-sm`}>
                        {p.id}
                    </span>
                    <h3 className="text-white font-['Playfair_Display'] italic font-black text-xl leading-tight">{p.name}</h3>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-1 text-left">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{p.price}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                        <Star size={12} className="text-brand-gold fill-brand-gold" />
                        <span className="text-[10px] font-bold">{p.rating} ({p.reviews})</span>
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{p.tagline}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                    {p.desc}
                </p>
                
                <button 
                    onClick={() => { trackAction('added_to_cart', { product: p.id }); showToast(`${p.name} added to protocol cart.`); }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${p.color} hover:opacity-90`}
                >
                    Add to Protocol <ArrowRight size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
