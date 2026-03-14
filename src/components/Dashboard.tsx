import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, ShieldCheck, Moon, Activity, ChevronRight, Flame, Loader2 } from 'lucide-react';
import { getProductRecommendation } from '../services/VitalityEngine';
import mockData from '../mocks/vitalityMock.json';
import { PartnerBlend } from './PartnerBlend';
import { partnerProfiles } from '../mocks/partnerMocks';

const CIRCUMFERENCE = 2 * Math.PI * 40;
const QUADRANT_LENGTH = CIRCUMFERENCE / 4;

export function Dashboard({ vitalityResult, userName, trackAction, showToast }: any) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<'sleep' | 'stress' | 'nutrition' | null>(null);
  const [connectedPartner, setConnectedPartner] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // We map the raw vitalityResult from the engine to the visual segments the UI expects.
  // We use fallback to mockData for initial structure shape if vitalityResult is empty.
  const score = vitalityResult?.score || mockData.vitality_score;
  const gaps = vitalityResult?.gaps || [];
  
  // Format segments based on new logic or fallback to mock
  const segments = {
    physical: { 
      score: vitalityResult?.vitalsInput ? Math.min(100, (vitalityResult.vitalsInput.activityMinutes / 60) * 100) : mockData.segments.physical.score, 
      label: "Movement", 
      color: "#F38118" // brand-orange
    },
    nutrition: { 
      score: vitalityResult?.vitalsInput ? vitalityResult.vitalsInput.nutritionScore : mockData.segments.nutrition.score, 
      label: "Nutrition", 
      color: "#CB2C30" // brand-red
    },
    recovery: { 
      score: vitalityResult?.vitalsInput ? Math.min(100, (vitalityResult.vitalsInput.sleepHours / 8) * 100) : mockData.segments.recovery.score, 
      label: "Recovery", 
      color: "#052F46" // brand-navy
    },
    subjective: { 
      score: vitalityResult?.vitalsInput ? (100 - vitalityResult.vitalsInput.stressScore) : mockData.segments.subjective.score, 
      label: "Energy", 
      color: "#F8C045" // brand-gold
    }
  };

  const segmentKeys = Object.keys(segments) as Array<keyof typeof segments>;
  
  const gap_insight = gaps.length > 0 ? gaps.join(', ') + ' detected.' : mockData.gap_insight;
  const recommended_product = gaps.length > 0 ? getProductRecommendation(gaps) : mockData.recommended_product;

  const handleSegmentClick = (key: string) => {
    setSelectedSegment(key === selectedSegment ? null : key);
  };

  // Mock gamification data for now (to be wired to profiles.streak_days later)
  const currentStreak = 14; 
  
  const getStreakTitle = (days: number) => {
      if (days < 7) return "Novice";
      if (days < 30) return "Adept";
      if (days < 75) return "Scholar";
      return "Legend";
  };

  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col space-y-8 pb-20 md:pb-8"
    >
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mt-2">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">Hi, {userName}! 👋</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Your energy levels are looking great today.</p>
          </div>
          <div className="flex items-center gap-8 mt-4 md:mt-0">
              
              {/* STREAK WIDGET */}
              <div 
                onClick={() => showToast('Keep logging daily to unlock the next title!')}
                className="group cursor-pointer flex items-center gap-3 bg-gradient-to-r from-brand-orange/10 to-transparent pr-4 py-1.5 rounded-full border border-brand-orange/20 hover:border-brand-orange/40 transition-colors"
               >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-red flex items-center justify-center text-white shadow-md shadow-brand-orange/20 relative group-hover:scale-105 transition-transform">
                      <Flame size={20} className="relative z-10" />
                      <div className="absolute inset-0 bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-20 rounded-full transition-opacity"></div>
                  </div>
                  <div>
                      <span className="block text-[10px] font-bold text-brand-red uppercase tracking-widest">{getStreakTitle(currentStreak)}</span>
                      <span className="text-sm font-['Orbitron'] font-bold text-slate-800 dark:text-slate-100">{currentStreak} Day Streak</span>
                  </div>
              </div>

              <div className="text-center hidden sm:block">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Output</span>
                  <span className="text-lg font-['Orbitron'] font-bold text-slate-800 dark:text-slate-100">81</span>
              </div>
          </div>
      </div>

      <div className="md:grid md:grid-cols-2 gap-8 md:gap-12 items-start pt-2">
          {/* Left Column: Interactive Ring */}
          <div className="flex flex-col">
          <div className="text-center md:text-left mb-6">
              <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Vitality Score</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Tap segments for granular contribution.</p>
          </div>

          {/* Interactive Vitality Ring */}
          <div className="relative w-72 h-72 mx-auto drop-shadow-xl shrink-0">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]" viewBox="0 0 100 100">
                  {segmentKeys.map((key, index) => {
                      const offset = index * QUADRANT_LENGTH;
                      const length = QUADRANT_LENGTH - 2.5; 
                      const isSelected = selectedSegment === key;
                      const isDimmed = selectedSegment && !isSelected;
                      
                      return (
                          <g key={`track-${key}`} onClick={() => handleSegmentClick(key)} className="cursor-pointer transition-all duration-300 transform-origin-center hover:scale-[1.03]">
                              <circle 
                                  cx="50" cy="50" r="40" 
                                  fill="none" 
                                  stroke="rgba(0, 0, 0, 0.04)" 
                                  strokeWidth="10" 
                                  strokeDasharray={`${length} ${CIRCUMFERENCE}`}
                                  strokeDashoffset={-offset}
                                  strokeLinecap="round"
                                  className={`transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                              />
                              <circle 
                                  cx="50" cy="50" r="40" 
                                  fill="none" 
                                  stroke={segments[key].color} 
                                  strokeWidth={isSelected ? "12" : "10"} 
                                  strokeDasharray={`${(segments[key].score / 100) * length} ${CIRCUMFERENCE}`}
                                  strokeDashoffset={-offset}
                                  strokeLinecap="round"
                                  className={`transition-all duration-500 ease-out ${isDimmed ? 'opacity-20 stroke-opacity-50' : 'opacity-100'}`}
                              />
                          </g>
                      );
                  })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <AnimatePresence mode="wait">
                      {selectedSegment ? (
                          <motion.div 
                              key="segment"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-center bg-white dark:bg-slate-900 p-6 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800"
                          >
                              <span 
                                  className="block text-[9px] uppercase tracking-[0.2em] font-extrabold mb-1"
                                  style={{ color: segments[selectedSegment as keyof typeof segments].color }}
                              >
                                  {segments[selectedSegment as keyof typeof segments].label}
                              </span>
                              <span className="font-['Orbitron'] text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
                                  {Math.round(segments[selectedSegment as keyof typeof segments].score)}
                              </span>
                          </motion.div>
                      ) : (
                          <motion.div 
                              key="total"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-center bg-white dark:bg-slate-900 w-32 h-32 flex flex-col items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-slate-50"
                          >
                              <span className="font-['Orbitron'] text-5xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
                                  {score}
                              </span>
                              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Global</span>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>
          
          {/* Gap Insight */}
          {gap_insight && !selectedSegment && (
              <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 bg-brand-light dark:bg-brand-navy/20 border border-brand-orange/20 rounded-2xl p-5 flex gap-4 items-start shadow-sm"
              >
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-brand-orange/20 shrink-0 mt-0.5">
                      <HeartPulse className="text-brand-orange" size={20} />
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-brand-red uppercase tracking-wider mb-1.5">Insight Detected</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{gap_insight}</p>
                  </div>
              </motion.div>
          )}
          
          {/* Segment Breakdown Legend */}
          {selectedSegment && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 grid grid-cols-2 gap-3"
              >
                  {segmentKeys.map(key => (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedSegment === key ? 'bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700' : 'opacity-50 grayscale-[0.5]'}`}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segments[key].color, boxShadow: `0 0 10px ${segments[key].color}80` }}></div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{segments[key].label}</span>
                          <span className="text-sm font-['Orbitron'] font-bold ml-auto" style={{ color: segments[key].color }}>
                            {Math.round(segments[key].score)}
                          </span>
                      </div>
                  ))}
              </motion.div>
          )}
      </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div 
            onClick={() => setExpandedCard(expandedCard === 'sleep' ? null : 'sleep')}
            className={`cursor-pointer bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative overflow-hidden group ${expandedCard === 'sleep' ? 'ring-2 ring-brand-navy' : ''}`}
          >
              <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                      <Moon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-brand-navy tracking-widest uppercase">Rest</span>
              </div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Sleep Quality</h3>
              <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      {vitalityResult?.vitalsInput ? `${vitalityResult.vitalsInput.sleepHours}h` : '7h 42m'}
                  </span>
                  <span className="text-xs font-bold text-brand-navy bg-brand-navy/10 px-1.5 py-0.5 rounded">+5%</span>
              </div>
              <div className="flex items-end justify-between h-12 gap-1.5 px-1">
                  {[40, 30, 60, 45, 100, 60, 45].map((h, i) => (
                      <div key={i} className={`w-full rounded-t-sm transition-all duration-500 ${i === 4 ? 'bg-brand-navy' : 'bg-brand-navy/20 group-hover:bg-brand-navy/40'}`} style={{ height: `${h}%` }}></div>
                  ))}
              </div>
              {expandedCard === 'sleep' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Based on your Google Fit sync: Your deep sleep dropped by 10% compared to yesterday. Restorative time was optimal.
                  </motion.div>
              )}
          </div>

          <div 
            onClick={() => setExpandedCard(expandedCard === 'stress' ? null : 'stress')}
            className={`cursor-pointer bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative overflow-hidden group ${expandedCard === 'stress' ? 'ring-2 ring-brand-gold' : ''}`}
          >
              <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                      <HeartPulse size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-brand-gold tracking-widest uppercase">Balance</span>
              </div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Stress Level</h3>
              <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      {vitalityResult?.vitalsInput?.stressScore < 40 ? 'Low' : 'Mod'}
                  </span>
                  <span className="text-xs font-bold text-brand-gold ml-1">Stable</span>
              </div>
              <div className="mt-8 flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Zen</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-gold to-brand-orange rounded-full" style={{ width: `${vitalityResult?.vitalsInput?.stressScore || 30}%` }}></div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
              </div>
              {expandedCard === 'stress' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Score derived from your Hybrid Log inputs and HRV variance over the last 24h.
                  </motion.div>
              )}
          </div>

          <div 
            onClick={() => setExpandedCard(expandedCard === 'nutrition' ? null : 'nutrition')}
            className={`cursor-pointer bg-brand-red/5 rounded-3xl p-6 shadow-sm border border-brand-red/10 hover:shadow-md transition-all relative overflow-hidden group ${expandedCard === 'nutrition' ? 'ring-2 ring-brand-red' : ''}`}
          >
              <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-sm shadow-brand-red/30">
                      <Activity size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-brand-red tracking-widest uppercase">Fuel</span>
              </div>
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Nutrition Balance</h3>
              <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      {vitalityResult?.vitalsInput?.nutritionScore || 92}%
                  </span>
                  <span className="text-xs font-bold text-brand-red ml-1">Superb</span>
              </div>
              <div className="flex gap-1.5 mb-4">
                  <div className="h-1.5 flex-1 bg-brand-red rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-brand-red rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-brand-red rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-brand-red/20 rounded-full"></div>
              </div>
              <p className="text-[11px] text-brand-red font-medium leading-tight">Protein targets smashed! Ready for your afternoon workout.</p>
              {expandedCard === 'nutrition' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 mt-4 border-t border-brand-red/10 text-xs text-brand-red/80 font-medium">
                      Zinc and Carbs are perfectly aligned. This is calculated from your recent Forkplay AI scans.
                  </motion.div>
              )}
          </div>
      </div>

      {/* Morning Glow Routine Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-500 group-hover:scale-105 transition-transform">
              <Moon size={28} className="scale-x-[-1]" />
          </div>
          <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Morning Glow Routine</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Your body responds best to low-impact energy right now. How about a 15-min stretch session?</p>
          </div>
          <button 
              onClick={() => { trackAction('morning_glow_started'); showToast('Morning routine initiated!'); }}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 w-full md:w-auto">
              Let's do it!
          </button>
      </div>

      {/* Moved Intelligent Marketplace to the bottom */}
      <div className="mt-8">
          {recommended_product && (
              <div className="w-full relative">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Daily Intervention</h3>
                  
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-panel p-2 rounded-3xl relative overflow-hidden group cursor-pointer border border-brand-orange/20 hover:border-brand-orange/50 hover:shadow-md transition-all bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center gap-6"
                  >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-orange/10 to-brand-gold/20 blur-[60px] rounded-full group-hover:scale-110 transition-transform"></div>
                      
                      <div className="p-6 md:p-8 flex-1 relative z-10 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-4 bg-brand-light dark:bg-brand-navy/20 w-fit px-3 py-1.5 rounded-full border border-brand-gold/30 shadow-sm">
                               <ShieldCheck className="text-brand-orange" size={16} />
                               <span className="text-[10px] uppercase font-bold tracking-widest text-brand-red">Perfect Match</span>
                          </div>
                          
                          <h4 className="font-['Orbitron'] text-3xl font-bold text-brand-navy mb-2 leading-tight tracking-tight">
                              {recommended_product.name}
                          </h4>
                          
                          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {recommended_product.reason}
                          </p>
                      </div>

                      <div className="p-6 md:p-8 relative z-10 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">1 Dose / Afternoon</span>
                          <button 
                              disabled={isActivating}
                              onClick={async () => { 
                                  setIsActivating(true);
                                  await new Promise(r => setTimeout(r, 800));
                                  setIsActivating(false);
                                  trackAction('protocol_activated', { product: recommended_product.name }); 
                                  showToast('Protocol activated!'); 
                              }}
                              className="w-full flex justify-center items-center gap-2 text-xs text-white font-bold uppercase tracking-widest bg-brand-red px-6 py-4 rounded-full hover:bg-red-700 hover:shadow-lg hover:shadow-brand-red/30 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-wait">
                              {isActivating ? <Loader2 size={16} className="animate-spin" /> : 'Activate Protocol'}
                              {!isActivating && <ChevronRight size={16} className="text-white" />}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </div>

      {/* Partner Synchronization */}
      <div className="mt-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center shrink-0 text-brand-red group-hover:scale-105 transition-transform">
                  <HeartPulse size={28} />
              </div>
              <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">Partner Synchronization</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Connect with your partner to align vitality metrics and receive joint Forkplay AI intimacy protocols.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                <button 
                    disabled={isGenerating}
                    onClick={async () => { 
                        setIsGenerating(true);
                        await new Promise(r => setTimeout(r, 600));
                        setIsGenerating(false);
                        trackAction('generate_partner_invite'); 
                        showToast('Invite link copied to clipboard!'); 
                    }}
                    className="bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-full flex-1 shadow-sm transition-all active:scale-95 text-center flex justify-center items-center gap-2 whitespace-nowrap disabled:opacity-75 disabled:cursor-wait">
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : 'Generate Invite'}
                </button>
                <button 
                    onClick={() => { 
                        trackAction('enter_partner_code'); 
                        const code = prompt('Enter Partner Code (e.g. KLR-882, KLR-101):'); 
                        if (code) {
                            const profile = partnerProfiles[code.toUpperCase()];
                            if (profile) {
                                showToast(`Linking with ${profile.name}...`);
                                setConnectedPartner(profile);
                            } else {
                                showToast('Invalid or expired code.');
                            }
                        }
                    }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs px-6 py-3 rounded-full flex-1 shadow-sm transition-all active:scale-95 text-center whitespace-nowrap">
                    Enter Code
                </button>
              </div>
          </div>
      </div>

      <AnimatePresence>
          {connectedPartner && (
              <PartnerBlend 
                  partnerData={connectedPartner} 
                  userName={userName} 
                  userVitals={vitalityResult?.vitalsInput || { sleepHours: 7.5, nutritionScore: 85, activityMinutes: 45, stressScore: 20 }}
                  onClose={() => setConnectedPartner(null)} 
              />
          )}
      </AnimatePresence>

    </motion.div>
  );
}
