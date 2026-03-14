import { motion } from 'framer-motion';
import { ArrowRight, Bot, Activity, Box } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export function Landing({ onLoginClick }: LandingProps) {
  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-navy/20 font-['Inter'] selection:bg-brand-orange/20 overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center bg-white dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="Kalories Logo" className="h-8 md:h-10 object-contain dark:invert transition-all scale-110 origin-left" />
        </div>
        <div>
          <button 
            onClick={onLoginClick}
            className="text-sm font-bold tracking-wider uppercase text-white bg-brand-navy hover:bg-slate-800 transition-all px-6 py-2 rounded-full shadow-md"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center md:text-left z-10"
        >
          <div className="mb-4 inline-block px-3 py-1 bg-brand-gold/20 border border-brand-gold/50 rounded-full text-brand-navy text-xs font-bold uppercase tracking-widest">
            In Collaboration with Dr. Goparaju Samaram
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-navy tracking-tight leading-tight mb-6 font-['Orbitron']">
            Where Chocolate Meets <span className="text-brand-red">Intimacy.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
            From the vibrant cocoa farms of Tanuku, West Godavari. We craft bean-to-bar functional dark chocolate designed for modern wellness, sports nutrition, and couple intimacy.
          </p>
          <button 
            onClick={onLoginClick}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-orange text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-brand-red/30 transition-all mx-auto md:mx-0 active:scale-95"
          >
            Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Floating elements representing the three pillars */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full h-[400px]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/20 to-brand-red/10 rounded-full blur-[80px]"></div>
          
          <div className="absolute top-10 left-10 md:left-20 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 transform rotate-[-5deg] hover:rotate-0 transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-brand-navy text-white flex items-center justify-center">
              <Bot size={32} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-wide text-sm">Forkplay AI Coach</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 z-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-red to-brand-orange text-white flex items-center justify-center shadow-lg shadow-brand-red/30">
              <Box size={40} />
            </div>
            <span className="font-black font-['Orbitron'] text-brand-navy tracking-widest uppercase">Premium</span>
            <span className="font-bold text-brand-red tracking-wide text-sm">Chocolate Brand</span>
          </div>

          <div className="absolute bottom-10 right-10 md:right-20 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 transform rotate-[5deg] hover:rotate-0 transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold text-brand-navy flex items-center justify-center">
              <Activity size={32} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-wide text-sm">Vitality Tracking</span>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="bg-brand-navy text-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
            <div className="w-16 h-16 rounded-2xl bg-brand-red/20 text-brand-red flex items-center justify-center mb-6 mx-auto md:mx-0">
               <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-['Orbitron'] text-white">Intimacy Dark Chocolate</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">A luxurious bean-to-bar functional dark chocolate crafted to support intimacy, connection, and couple wellness. Designed for shared moments.</p>
            <div className="text-xs font-bold text-brand-red uppercase tracking-widest mt-auto">Patent Applied Innovation</div>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center mb-6 mx-auto md:mx-0">
               <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-['Orbitron'] text-white">Forkplay AI Coach</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">Sync your Google Fit data and let our private, E2E encrypted Intelligence Bot analyze your macros to build personalized wellness and endurance protocols.</p>
            <div className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-auto">Secure & Anonymous</div>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/20 text-brand-orange flex items-center justify-center mb-6 mx-auto md:mx-0">
               <Box size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-['Orbitron'] text-white">Energy Square Dark Chocolate</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">Functional dark chocolate crafted for energy and daily nutrition. Powered by antioxidant-rich cocoa, spirulina blue algae, plant protein, and real citrus.</p>
            <div className="text-xs font-bold text-brand-orange uppercase tracking-widest mt-auto">WADA Compliant</div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-center border-t border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">© 2026 Kalories® Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
