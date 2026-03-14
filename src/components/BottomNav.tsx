import { Activity, Camera, Stethoscope, ShoppingBag, Compass } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'logger' | 'portal' | 'discover' | 'products';
  setActiveTab: (tab: 'dashboard' | 'logger' | 'portal' | 'discover' | 'products') => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-slate-200 dark:border-slate-700 flex items-center justify-around py-4 pb-8 z-50 bg-white dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'text-brand-navy' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
      >
          <Activity size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] uppercase tracking-widest font-extrabold">Dashboard</span>
      </button>
      <button 
          onClick={() => setActiveTab('logger')} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'logger' ? 'text-brand-navy' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
      >
          <Camera size={22} strokeWidth={activeTab === 'logger' ? 2.5 : 2} />
          <span className="text-[10px] uppercase tracking-widest font-extrabold">Log</span>
      </button>

      <button 
          onClick={() => setActiveTab('discover')} 
          className={`relative flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'discover' ? 'text-brand-navy' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
      >
          <Compass size={22} strokeWidth={activeTab === 'discover' ? 2.5 : 2} />
          <span className="text-[10px] uppercase tracking-widest font-extrabold">Feed</span>
          {/* Notification dot to trigger curiosity */}
          <div className="absolute top-0 right-1 w-2 h-2 bg-brand-salmon rounded-full border-2 border-white/90"></div>
      </button>
      <button 
          onClick={() => setActiveTab('portal')} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'portal' ? 'text-brand-navy' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300'}`}
      >
          <Stethoscope size={22} strokeWidth={activeTab === 'portal' ? 2.5 : 2} />
          <span className="text-[10px] uppercase tracking-widest font-extrabold">Consultant</span>
      </button>
      <button 
          onClick={() => setActiveTab('products')} 
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'products' ? 'text-brand-red' : 'text-slate-400 hover:text-brand-red'}`}
      >
          <ShoppingBag size={22} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
          <span className="text-[10px] uppercase tracking-widest font-extrabold">Products</span>
      </button>
    </nav>
  );
}
