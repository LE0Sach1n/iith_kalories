
import { supabase } from '../lib/supabaseClient';
import { LogOut, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'logger' | 'portal' | 'discover' | 'products';
  setActiveTab: (tab: 'dashboard' | 'logger' | 'portal' | 'discover' | 'products') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export function Navbar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }: NavbarProps) {
  return (
    <header className="px-6 py-5 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50 shrink-0 shadow-sm transition-colors duration-300">
      <div className="flex items-center mt-1">
        <img src="/logo.png" alt="Kalories Logo" className="h-6 md:h-8 object-contain dark:invert transition-all origin-left" />
      </div>
      
      {/* Desktop Nav */}
      <div className="hidden md:flex gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-sm items-center transition-colors">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'dashboard' ? 'bg-brand-navy dark:bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('logger')} 
          className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'logger' ? 'bg-brand-navy dark:bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          Hybrid Log
        </button>
        <button 
          onClick={() => setActiveTab('portal')} 
          className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'portal' ? 'bg-brand-navy dark:bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          Consultant
        </button>
        <button 
          onClick={() => setActiveTab('discover')} 
          className={`relative text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'discover' ? 'bg-brand-navy dark:bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          Feed
          <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-brand-salmon rounded-full"></div>
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full flex items-center gap-1 ${activeTab === 'products' ? 'bg-brand-red text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-500/20'}`}
        >
          Products
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="text-slate-500 hover:text-brand-navy dark:text-slate-400 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-xs tracking-wider uppercase font-bold transition-all px-3 py-1.5 rounded-full text-brand-red hover:bg-brand-red/10 flex items-center gap-1.5 mr-1"
          title="Logout"
        >
          <LogOut size={14} /> Exit
        </button>
      </div>
    </header>
  );
}
