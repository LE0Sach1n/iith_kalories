import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, X, Sparkles, Moon, Activity, Flame } from 'lucide-react';

interface VitalsInput {
  sleepHours: number;
  nutritionScore: number;
  activityMinutes: number;
  stressScore: number;
}

interface PartnerBlendProps {
  partnerData: any;
  userVitals: VitalsInput;
  userName: string;
  onClose: () => void;
}

const CIRCUMFERENCE = 2 * Math.PI * 36;

export function PartnerBlend({ partnerData, userVitals, userName, onClose }: PartnerBlendProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Define loading steps for the aesthetic vibe
  const loadingMessages = [
    "Syncing heartbeats... 💓",
    "Aligning circadian rhythms... 🌙",
    "Calculating couple synergy... ✨"
  ];

  useEffect(() => {
    // Beautiful sequential loading animation
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStep(1);
      await new Promise(r => setTimeout(r, 1200));
      setLoadingStep(2);
      await new Promise(r => setTimeout(r, 1500));
      setShowResults(true);
    };
    sequence();
  }, []);

  const calculateScore = (v: VitalsInput) => {
    return Math.round(
      Math.min(100, (v.sleepHours / 8) * 30) +
      Math.min(100, (v.nutritionScore / 100) * 30) +
      Math.min(100, (v.activityMinutes / 60) * 25) +
      (v.stressScore > 0 ? ((100 - v.stressScore) / 100) * 15 : 15)
    );
  };

  const myScore = calculateScore(userVitals);
  const theirScore = calculateScore(partnerData.vitalsInput);

  const drawRing = (v: VitalsInput, isMe: boolean) => {
    const scores = [
      Math.min(100, (v.activityMinutes / 60) * 100), // Physical
      v.nutritionScore,                              // Nutrition
      Math.min(100, (v.sleepHours / 8) * 100),       // Recovery
      (100 - v.stressScore)                          // Subjective
    ];
    const colors = ["#F38118", "#CB2C30", "#052F46", "#F8C045"];
    
    return (
      <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              {scores.map((score, i) => {
                  const offset = i * (CIRCUMFERENCE / 4);
                  const length = (CIRCUMFERENCE / 4) - 2;
                  return (
                      <motion.circle 
                          key={i}
                          initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                          animate={{ strokeDasharray: `${(score / 100) * length} ${CIRCUMFERENCE}` }}
                          transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                          cx="50" cy="50" r="36" 
                          fill="none" 
                          stroke={colors[i]} 
                          strokeWidth="8" 
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                      />
                  );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-['Orbitron'] text-2xl md:text-3xl font-black text-white">{isMe ? myScore : theirScore}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/50">{isMe ? userName : partnerData.name}</span>
          </div>
      </div>
    );
  };

  const renderComparisonBar = (label: string, myVal: number, theirVal: number, max: number, format: string, icon: any) => (
      <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-white/70 uppercase tracking-widest mb-2 px-1">
              <span className="flex items-center gap-2">{myVal}{format}</span>
              <span className="flex items-center gap-2">{label} {icon}</span>
              <span className="flex items-center gap-2">{theirVal}{format}</span>
          </div>
          <div className="flex h-3 bg-white/5 rounded-full overflow-hidden w-full relative">
              <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(myVal / max) * 50}%` }} transition={{ duration: 1, delay: 0.8 }}
                  className="absolute right-1/2 h-full bg-brand-orange rounded-l-full origin-right" 
              />
              <div className="absolute left-1/2 -ml-[1px] w-[2px] h-full bg-white/20 z-10"></div>
              <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(theirVal / max) * 50}%` }} transition={{ duration: 1, delay: 0.8 }}
                  className="absolute left-1/2 h-full bg-brand-red rounded-r-full origin-left" 
              />
          </div>
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-slate-900 overflow-y-auto"
    >
        {/* Animated Spotify-style Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-brand-orange max-w-3xl blur-[120px] opacity-40 mix-blend-screen"
            />
            <motion.div 
              animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, -90, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-brand-red max-w-4xl blur-[140px] opacity-30 mix-blend-screen"
            />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
            {!showResults ? (
                /* LOADING SEQUENCE */
                <motion.div 
                    key="loading"
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full flex flex-col items-center justify-center text-white px-6 relative z-10"
                >
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        <HeartPulse size={36} className="text-brand-orange" />
                    </motion.div>
                    
                    <div className="h-12 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.h2 
                                key={loadingStep}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="text-xl md:text-2xl font-bold tracking-tight text-center"
                            >
                                {loadingMessages[loadingStep]}
                            </motion.h2>
                        </AnimatePresence>
                    </div>
                    
                    <div className="mt-8 flex gap-2">
                        {[0, 1, 2].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ 
                                    scale: loadingStep === i ? 1.5 : 1,
                                    opacity: loadingStep === i ? 1 : 0.3
                                }}
                                className="w-2 h-2 rounded-full bg-brand-orange"
                            />
                        ))}
                    </div>
                </motion.div>
            ) : (
                /* RESULTS UI */
                <motion.div 
                    key="results"
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center min-h-full"
                >
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-center mb-10"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] uppercase tracking-widest font-bold mb-4 backdrop-blur-md shadow-lg">
                            Vitality Blend
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
                            {partnerData.headline}
                        </h1>
                        <p className="text-white/60 font-medium">{userName} & {partnerData.name}</p>
                    </motion.div>

                    {/* The Rings Side by Side */}
                    <div className="flex items-center justify-center gap-2 md:gap-8 w-full mb-12">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
                            {drawRing(userVitals, true)}
                        </motion.div>
                        
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} className="w-12 h-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md z-10 mt-[-20px]">
                            <Sparkles className="text-brand-orange" size={20} />
                        </motion.div>

                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center">
                            {drawRing(partnerData.vitalsInput, false)}
                        </motion.div>
                    </div>

                    {/* Synergy Score Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-lg mb-8 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 blur-[30px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Overall Synergy</h3>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-5xl font-black font-['Orbitron'] text-white">{partnerData.synergy_score}%</span>
                            <span className="text-brand-orange font-bold text-sm">Match</span>
                        </div>

                        {renderComparisonBar("Sleep", userVitals.sleepHours, partnerData.vitalsInput.sleepHours, 12, "h", <Moon size={12}/>)}
                        {renderComparisonBar("Activity", userVitals.activityMinutes, partnerData.vitalsInput.activityMinutes, 120, "m", <Activity size={12}/>)}
                        {renderComparisonBar("Stress", userVitals.stressScore, partnerData.vitalsInput.stressScore, 100, "%", <Flame size={12}/>)}
                    </motion.div>

                    {/* Cute Insights */}
                    <div className="w-full space-y-4 mb-20">
                        {partnerData.insights.map((insight: any, idx: number) => (
                            <motion.div 
                                key={idx}
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 + (idx * 0.1) }}
                                className="flex gap-4 items-start p-5 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md"
                            >
                                <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-white ${insight.match ? 'bg-brand-red/20 border border-brand-red/30' : 'bg-brand-orange/20 border border-brand-orange/30'}`}>
                                    <HeartPulse size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">{insight.title}</h4>
                                    <p className="text-white/60 text-xs leading-relaxed">{insight.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}
