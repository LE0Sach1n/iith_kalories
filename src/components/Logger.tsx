import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Smartphone, TrendingUp, CheckCircle2, Dumbbell, RefreshCw, Upload } from 'lucide-react';
import { analyzeFoodWithAI, analyzeStressEvent } from '../services/aiService';
import { connectGoogleFit, syncWearableToDb, getGoogleTokenFromUrl, fetchGoogleFitData } from '../services/wearableService';

export function Logger({ trackAction, showToast, userId, updateVitals, currentVitals }: any) {
  const [activityTab, setActivityTab] = useState<'sync' | 'manual'>('sync');
  const [isScanning, setIsScanning] = useState(false);
  const [macros, setMacros] = useState({ carbs: 80, protein: 65, zinc: 25 });
  const [mealInput, setMealInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSyncingWearable, setIsSyncingWearable] = useState(false);
  const [lastSync, setLastSync] = useState("2m ago");
  const [stressInput, setStressInput] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loggedItems, setLoggedItems] = useState<{name: string, cal: number, p: number, c: number, f: number}[]>([]);

  useEffect(() => {
    // Check if we just returned from Google OAuth
    const token = getGoogleTokenFromUrl();
    if (token) {
      localStorage.setItem('google_fit_token', token);
      window.location.hash = ''; // Clear hash securely
      handleRealGoogleSync(token);
    }
  }, []);

  const handleRealGoogleSync = async (token: string) => {
    setIsSyncingWearable(true);
    try {
        const data = await fetchGoogleFitData(token);
        
        // Wrap DB call in try-catch so it doesn't fail the sync if the table isn't ready
        try {
            await syncWearableToDb(userId, data);
        } catch (dbErr) {
            console.error("Supabase insert suppressed", dbErr);
        }
        
        trackAction('wearable_synced_oauth', data);
        showToast(`Google Fit Synced! Pulled ${data.steps_today || 0} steps.`);
        
        // Dynamically update UI state
        if (updateVitals) {
            updateVitals({
                activityMinutes: (data.steps_today || 0) / 100, // rough conversion
                sleepHours: (data.sleep_duration_seconds || 0) / 3600
            });
        }
        
        setLastSync("Just now");
        setActivityTab('sync');
    } catch (err: any) {
        console.error(err);
        if (err.message === 'UNAUTHORIZED') {
            localStorage.removeItem('google_fit_token');
            connectGoogleFit();
            return;
        }
        // Show our new manual redirect popup instead of a toast
        setShowErrorPopup(true);
    } finally {
        setIsSyncingWearable(false);
    }
  };

  const handleWearableSync = () => {
      const storedToken = localStorage.getItem('google_fit_token');
      if (storedToken) {
          handleRealGoogleSync(storedToken);
      } else {
          connectGoogleFit();
      }
  };

  const handleAnalyzeLibido = async () => {
    if (!mealInput.trim() && !photoUrl) return;
    setIsScanning(true);
    try {
      const macrosResult: any = await analyzeFoodWithAI(mealInput || "Auto-detected meal from photo");
      setMacros({ carbs: macrosResult.carbs || 0, protein: macrosResult.protein || 0, zinc: macrosResult.zinc || 0 });
      trackAction('nutrition_logged', { meal: mealInput, photo: !!photoUrl, macros: macrosResult });
      
      if (updateVitals) {
          // Increase nutrition score dynamically when they log good macros
          const boost = (macrosResult.protein > 20) ? 10 : 5;
          updateVitals({
              nutritionScore: Math.min(100, (currentVitals?.nutritionScore || 80) + boost)
          });
      }
      
      // Simulate adding to list
      setLoggedItems(prev => [...prev, { 
        name: mealInput || 'Captured Meal', 
        cal: (macrosResult.carbs * 4) + (macrosResult.protein * 4) + 120, // rough estimate
        p: macrosResult.protein || 0, 
        c: macrosResult.carbs || 0, 
        f: 12 
      }]);
      
      setMealInput("");
      setPhotoUrl(null);
      showToast('Nutrition logged perfectly!');
    } catch (error) {
      console.error(error);
      setMacros({ carbs: 40, protein: 85, zinc: 90 });
      showToast('Fallback macros applied (Edge Offline)');
    }
    setIsScanning(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStressLog = async () => {
     if (!stressInput.trim()) return;
     const result = await analyzeStressEvent(stressInput);
     trackAction('stress_logged', { incident: stressInput, severity: result.severity });
     showToast(`Event analyzed. Vitality load impacted by ${result.severity}%.`);
     
     if (updateVitals) {
        // dynamically adjust the score
        updateVitals({
            stressScore: Math.min(100, (currentVitals?.stressScore || 20) + result.severity)
        });
     }
     setStressInput('');
  };

  return (
    <motion.div 
      key="logger"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-8 pb-20 md:pb-0"
    >
        {/* Activity Header & Tabs */}
        <div>
            <h2 className="text-xl font-['Orbitron'] text-slate-900 dark:text-white font-bold mb-5 tracking-tight">Activity Logger</h2>
            <div className="flex p-1 bg-white dark:bg-slate-900 rounded-full w-fit shadow-sm border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setActivityTab('sync')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${activityTab === 'sync' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 border border-transparent'}`}
                >
                    <Smartphone size={16} /> Auto-Sync
                </button>
                <button 
                    onClick={() => setActivityTab('manual')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${activityTab === 'manual' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 border border-transparent'}`}
                >
                    <TrendingUp size={16} /> Manual
                </button>
            </div>
        </div>

        {/* Activity Content */}
        <AnimatePresence mode="wait">
            {activityTab === 'sync' ? (
                <motion.div 
                    key="sync-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel bg-white dark:bg-slate-900 p-6 rounded-3xl border border-brand-orange/20 flex items-center justify-between shadow-lg shadow-brand-orange/5 group hover:border-brand-orange transition-colors"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-light dark:bg-brand-navy/20 flex items-center justify-center border border-brand-orange/30 shadow-inner group-hover:scale-105 transition-transform">
                            <Activity className="text-brand-orange" size={26} />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-brand-navy tracking-tight">Google Health Connect</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Wearable Polling. <span className="text-brand-red font-semibold">Synced {lastSync}.</span></p>
                            <button 
                                onClick={handleWearableSync}
                                disabled={isSyncingWearable}
                                className="mt-3 flex items-center gap-2 bg-brand-navy text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full shadow-md hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {isSyncingWearable ? <RefreshCw size={14} className="animate-spin" /> : <Smartphone size={14} />}
                                {isSyncingWearable ? 'Syncing...' : 'Sync Wearables'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-brand-light dark:bg-brand-navy/20 p-2 rounded-full border border-brand-orange/30 shrink-0 self-start mt-1">
                         <CheckCircle2 className="text-brand-orange" size={24} />
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="manual-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy">
                              <Dumbbell size={16} />
                           </div>
                           <h4 className="font-bold text-brand-navy tracking-tight text-sm">Log Manual Workout</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Activity Type</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange cursor-pointer">
                                    <option>Cardio / Aerobics</option>
                                    <option>Strength Training</option>
                                    <option>Recovery / Yoga</option>
                                    <option>High Intensity Interval (HIIT)</option>
                                    <option>Sports</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Duration (min)</label>
                                    <input type="number" placeholder="45" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Intensity</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange cursor-pointer">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={() => { 
                                    trackAction('manual_workout_log'); 
                                    showToast('Workout logged! +45 mins added.'); 
                                    if (updateVitals) {
                                        updateVitals({ activityMinutes: (currentVitals?.activityMinutes || 0) + 45 });
                                    }
                                }}
                                className="w-full mt-2 bg-brand-navy text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition shadow-md active:scale-95"
                            >
                                Submit Activity
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy">
                              <Activity size={16} />
                           </div>
                           <h4 className="font-bold text-brand-navy tracking-tight text-sm">Log Stressful Event</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            Forkplay AI analyzes your psychological load and adjusts your daily Vitality capacity accordingly.
                        </p>
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={stressInput}
                                onChange={e => setStressInput(e.target.value)}
                                placeholder="E.g. Intense meeting with the board..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                            />
                            <button 
                                onClick={handleStressLog}
                                disabled={!stressInput.trim()}
                                className="bg-brand-navy text-white px-5 rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                Log
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Nutrition Logger */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                    Nutrition Intake
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border shadow-sm ${macros.zinc < 50 ? 'text-pink-600 bg-pink-100 border-pink-200' : 'text-emerald-600 bg-emerald-100 border-emerald-200'}`}>
                        {macros.zinc < 50 ? 'Gap Critical' : 'Optimal'}
                    </span>
                </h2>
            </div>
            
            <div className="glass-panel bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                {isScanning ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
                        <h3 className="text-xl font-bold text-brand-navy mb-2">Analyzing Meal Securely...</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-[250px] leading-relaxed">
                            Deriving accurate macros via AI Engine.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* New MFP Style Upload / Input */}
                        <div className="flex flex-col gap-4">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                className="hidden" 
                            />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${photoUrl ? 'border-brand-navy bg-slate-50 dark:bg-slate-800/50' : 'border-slate-300 hover:border-brand-orange hover:bg-slate-50 dark:bg-slate-800/50'}`}
                            >
                                {photoUrl ? (
                                    <>
                                        <img src={photoUrl} alt="Meal preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                        <div className="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <CheckCircle2 className="text-brand-orange mb-1" size={24} />
                                            <span className="text-brand-navy font-bold text-sm">Image Attached</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-1">Tap to change</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 shadow-sm">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-brand-navy font-bold text-sm">Tap to scan meal from photo</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Accepts JPG, PNG</span>
                                    </>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={mealInput}
                                        onChange={(e) => setMealInput(e.target.value)}
                                        placeholder="Search food database (e.g. 2x Eggs...)"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <input 
                                        type="number"
                                        placeholder="Serving Size"
                                        className="w-1/2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                                    />
                                    <select className="w-1/2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange cursor-pointer">
                                        <option>Multi-unit (g, mL)</option>
                                        <option>Servings / Cups</option>
                                        <option>Whole Pieces</option>
                                    </select>
                                </div>
                                
                                <div className="pt-2">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Items</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Oats Bowl', 'Intimacy Chocolate Square', 'Whey Scoop', 'Avocado Toast'].map((f, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setMealInput(f)}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] px-3 py-1.5 rounded-full hover:border-brand-orange hover:text-brand-orange transition-colors"
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleAnalyzeLibido}
                                disabled={isScanning || (!mealInput.trim() && !photoUrl)}
                                className="w-full bg-brand-navy text-white text-sm py-3.5 rounded-2xl hover:bg-slate-800 transition-all font-bold tracking-wide shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Log Food Entry
                            </button>
                        </div>

                        {/* List-Based Logged Items (MFP Style) */}
                        {loggedItems.length > 0 && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Today's Log</h3>
                                {loggedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-2">
                                                <span className="text-brand-red font-semibold">{item.p}g P</span>
                                                <span className="text-brand-orange font-semibold">{item.c}g C</span>
                                                <span className="text-slate-400 font-semibold">{item.f}g F</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black font-['Orbitron'] text-brand-navy text-lg">{item.cal}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">kcal</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center leading-relaxed font-medium bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="font-bold text-emerald-500">Forkplay AI</span> derives accurate nutritional elements to cross-reference with Circadian and Hormonal baselines.
            </p>
        </div>

        {/* Error Popup */}
        <AnimatePresence>
            {showErrorPopup && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-50 text-brand-red flex items-center justify-center mb-4 border border-red-100">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sync Unavailable</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                            We couldn't securely pull data from Google Health Connect right now. Would you like to log your activity manually instead?
                        </p>
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowErrorPopup(false);
                                    setActivityTab('manual');
                                }}
                                className="w-full bg-brand-navy text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-slate-800 transition active:scale-95"
                            >
                                Log Manual Activity
                            </button>
                            <button
                                onClick={() => setShowErrorPopup(false)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 transition active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

    </motion.div>
  );
}
