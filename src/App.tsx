import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { calculateVitality, type VitalsInput, type VitalityResult } from './services/VitalityEngine';
import { CheckCircle2 } from 'lucide-react';

import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Logger } from './components/Logger';
import { Consultant } from './components/Consultant';
import { Products } from './components/Products';
import { Landing } from './components/Landing';
import { Discover } from './components/Discover';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState<string>("Alex");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logger' | 'portal' | 'discover' | 'products'>('dashboard');
  const [toast, setToast] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  
  const [vitalsInput, setVitalsInput] = useState<VitalsInput>({
    sleepHours: 7.5, nutritionScore: 85, activityMinutes: 45, stressScore: 20
  });
  const [vitalsData, setVitalsData] = useState<VitalityResult | null>(null);

  // Recalculate vitality result whenever the raw inputs change
  useEffect(() => {
    setVitalsData({ ...calculateVitality(vitalsInput), vitalsInput } as any);
  }, [vitalsInput]);

  const updateVitals = (updates: Partial<VitalsInput>) => {
      setVitalsInput(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
          fetchVitals(session.user.id);
          fetchProfile(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          fetchVitals(session.user.id);
          fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
      try {
          const { data } = await supabase.from('profiles').select('display_name').eq('id', userId).single();
          if (data && data.display_name) {
              setUserName(data.display_name);
          }
      } catch(e) {
          console.warn("Could not fetch profile", e);
      }
  };

  const fetchVitals = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('daily_vitals')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();
        
      if (data) {
        // Hydrate the engine from supabase data
        setVitalsInput({
          sleepHours: data.sleep_score / 12 || 7, // Convert placeholder logic
          nutritionScore: data.nutrition_pts || 80,
          activityMinutes: data.movement_pts || 45,
          stressScore: data.stress_score || 30
        });
      }
    } catch(err) {
      console.log('Using mock local calculation for baseline');
      setVitalsInput({ sleepHours: 7.5, nutritionScore: 85, activityMinutes: 45, stressScore: 20 });
    }
  };

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
  };

  const trackAction = async (actionName: string, details?: any) => {
      if (!session) return;
      try {
          await supabase.from('user_actions').insert([{ user_id: session.user.id, action_name: actionName, details }]);
      } catch(e) { console.warn("Supabase sync failed", e); }
  }

  // Auth Boundary
  if (!session) {
    if (showLogin) {
      return <Login onLogin={() => {}} />;
    }
    return <Landing onLoginClick={() => setShowLogin(true)} />;
  }

  // Main Authenticated UI
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-['Inter'] selection:bg-pink-200 selection:text-pink-900 pb-24 md:pb-0 h-screen overflow-hidden transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-md md:max-w-4xl mx-auto p-6 md:p-8 relative h-full">
            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <Dashboard vitalityResult={vitalsData} userName={userName} trackAction={trackAction} showToast={showToast} />}
                {activeTab === 'logger' && <Logger trackAction={trackAction} showToast={showToast} userId={session.user.id} updateVitals={updateVitals} currentVitals={vitalsInput} />}
                {activeTab === 'portal' && <Consultant trackAction={trackAction} userName={userName} />}
                {activeTab === 'discover' && <Discover />}
                {activeTab === 'products' && <Products trackAction={trackAction} showToast={showToast} />}
            </AnimatePresence>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
            <motion.div 
                initial={{ opacity: 0, y: 50, x: "-50%" }} 
                animate={{ opacity: 1, y: 0, x: "-50%" }} 
                exit={{ opacity: 0, y: 50, x: "-50%" }}
                className="fixed bottom-24 md:bottom-10 left-1/2 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 flex items-center gap-3 font-semibold text-sm max-w-[90%] w-max"
            >
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{toast}</span>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
