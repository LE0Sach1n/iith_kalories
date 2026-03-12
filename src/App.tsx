import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  HeartPulse, 
  Camera,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  ShieldCheck,
  Moon,
  Flame,
  Stethoscope,
  Send,
  Lock
} from 'lucide-react';
import mockData from './mocks/vitalityMock.json';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Utility for calculating circle paths
const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40
const QUADRANT_LENGTH = CIRCUMFERENCE / 4;

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logger' | 'portal'>('dashboard');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [activityTab, setActivityTab] = useState<'sync' | 'manual'>('sync');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
  };

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, Patient #9X4B. I am Dr. Aris, specializing in performance optimization and hormonal balance. I noticed your HRV is stable but your deep sleep has dropped by 40% this week. How are you feeling overall?", isDoctor: true, time: "09:42 AM" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [mealInput, setMealInput] = useState("");

  const trackAction = async (actionName: string, details?: any) => {
      try {
          await supabase.from('user_actions').insert([{ action_name: actionName, details }]);
      } catch(e) { console.warn("Supabase sync failed", e); }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    const userMsg = { id: Date.now(), text: userText, isDoctor: false, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    
    trackAction('chat_message_sent', { message: userText });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: "You are Dr. Aris, an AI consultant specializing in performance optimization and hormonal balance. Keep it under 2 sentences." }]},
                contents: [{ parts: [{ text: userText }] }]
            })
        });
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Understood. The protocol will be updated.";
        setMessages(prev => [...prev, { id: Date.now()+1, text: aiResponse.replace(/\*/g,''), isDoctor: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch(e) {
        setMessages(prev => [...prev, { id: Date.now()+1, text: "System offline. Please consult dashboard protocols.", isDoctor: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }
  };

  const handleAnalyzeLibido = async () => {
    if (!mealInput.trim()) return;
    setIsScanning(true);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Analyze the following meal and provide the macronutrients in strict JSON format with keys: "carbs", "protein", "zinc". Provide integer numbers only. Meal: ${mealInput}` }] }]
            })
        });
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
            const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const macrosResult = JSON.parse(cleaned);
            setMacros({ carbs: macrosResult.carbs || 0, protein: macrosResult.protein || 0, zinc: macrosResult.zinc || 0 });
            trackAction('nutrition_logged', { meal: mealInput, macros: macrosResult });
        }
    } catch (error) {
        setMacros({ carbs: 40, protein: 85, zinc: 90 });
    }
    setIsScanning(false);
  };

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [macros, setMacros] = useState({ carbs: 80, protein: 65, zinc: 25 });


  // Load data from mock
  const { vitality_score, segments, gap_insight, recommended_product } = mockData;

  const segmentKeys = Object.keys(segments) as Array<keyof typeof segments>;
  
  // Handlers
  const handleSegmentClick = (key: string) => {
    setSelectedSegment(key === selectedSegment ? null : key);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Inter'] selection:bg-pink-200 selection:text-pink-900 pb-24 md:pb-0 h-screen overflow-hidden">
      
      {/* Top Header */}
      <header className="px-6 py-5 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 border border-pink-400/50 flex items-center justify-center font-bold text-white tracking-widest shadow-lg shadow-pink-500/20">
            K
          </div>
          <div className="flex flex-col">
             <span className="font-['Orbitron'] font-bold text-lg tracking-wide leading-tight text-slate-900">KALORIES<span className="text-pink-500">®</span></span>
             <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Intelligence</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('logger')} 
            className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'logger' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Hybrid Log
          </button>
          <button 
            onClick={() => setActiveTab('portal')} 
            className={`text-xs tracking-wider uppercase font-bold transition-all px-4 py-1.5 rounded-full ${activeTab === 'portal' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Consultant
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-md md:max-w-4xl mx-auto p-6 md:p-8 relative h-full">

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                /* ------------------------------------- */
                /* THE VITALITY DASHBOARD                */
                /* ------------------------------------- */
                <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col space-y-8 pb-20 md:pb-8"
                >
                    {/* Greeting Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-2">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Hi, Alex! 👋</h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Your energy levels are looking great today.</p>
                        </div>
                        <div className="flex items-center gap-8 mt-4 md:mt-0">
                            <div className="text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base</span>
                                <span className="text-lg font-['Orbitron'] font-bold text-slate-800">72</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peak</span>
                                <span className="text-lg font-['Orbitron'] font-bold text-slate-800">89</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg</span>
                                <span className="text-lg font-['Orbitron'] font-bold text-slate-800">81</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:grid md:grid-cols-2 gap-8 md:gap-12 items-start pt-2">
                        {/* Left Column: Interactive Ring */}
                        <div className="flex flex-col">
                        <div className="text-center md:text-left mb-6">
                            <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Vitality Score</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Tap segments for granular contribution.</p>
                        </div>

                        {/* Interactive Vitality Ring */}
                        <div className="relative w-72 h-72 mx-auto drop-shadow-xl shrink-0">
                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]" viewBox="0 0 100 100">
                                {/* Base Track - 4 Quarters with small gaps */}
                                {segmentKeys.map((key, index) => {
                                    const offset = index * QUADRANT_LENGTH;
                                    const length = QUADRANT_LENGTH - 2.5; // -2.5 for distinct gap
                                    const isSelected = selectedSegment === key;
                                    const isDimmed = selectedSegment && !isSelected;
                                    
                                    return (
                                        <g key={`track-${key}`} onClick={() => handleSegmentClick(key)} className="cursor-pointer transition-all duration-300 transform-origin-center hover:scale-[1.03]">
                                            {/* Background track segment */}
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
                                            {/* Filled track segment */}
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

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <AnimatePresence mode="wait">
                                    {selectedSegment ? (
                                        <motion.div 
                                            key="segment"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-center bg-white p-6 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100"
                                        >
                                            <span 
                                                className="block text-[9px] uppercase tracking-[0.2em] font-extrabold mb-1"
                                                style={{ color: segments[selectedSegment as keyof typeof segments].color }}
                                            >
                                                {segments[selectedSegment as keyof typeof segments].label}
                                            </span>
                                            <span className="font-['Orbitron'] text-4xl font-black tracking-tighter text-slate-800">
                                                {segments[selectedSegment as keyof typeof segments].score}
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="total"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center bg-white w-32 h-32 flex flex-col items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-slate-50"
                                        >
                                            <span className="font-['Orbitron'] text-5xl font-black tracking-tighter text-slate-800">
                                                {vitality_score}
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
                                className="mt-8 bg-pink-50 border border-pink-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm"
                            >
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-pink-100 shrink-0 mt-0.5">
                                    <HeartPulse className="text-pink-500" size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-1.5">Insight Detected</h4>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{gap_insight}</p>
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
                                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedSegment === key ? 'bg-white shadow-md border border-slate-200' : 'opacity-50 grayscale-[0.5]'}`}>
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segments[key].color, boxShadow: `0 0 10px ${segments[key].color}80` }}></div>
                                        <span className="text-xs font-bold text-slate-700">{segments[key].label}</span>
                                        <span className="text-sm font-['Orbitron'] font-bold ml-auto" style={{ color: segments[key].color }}>{segments[key].score}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Intelligent Marketplace */}
                    <div className="md:pt-4 flex flex-col justify-end md:justify-start">
                        {recommended_product && (
                            <div className="h-full flex flex-col">
                                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Daily Intervention</h3>
                                
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="glass-panel p-2 rounded-3xl relative overflow-hidden group cursor-pointer border border-[#10b981]/20 hover:border-[#10b981]/50 hover:shadow-2xl hover:-translate-y-1 transition-all flex-1 md:flex-none bg-white"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#10B981]/20 to-emerald-200/40 blur-[50px] rounded-full group-hover:scale-110 transition-transform"></div>
                                    
                                    <div className="p-6 h-full flex flex-col relative z-10">
                                        <div className="flex items-center gap-2 mb-6 bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                             <ShieldCheck className="text-emerald-500" size={16} />
                                             <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Perfect Match</span>
                                        </div>
                                        
                                        <h4 className="font-['Orbitron'] text-3xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">
                                            {recommended_product.name}
                                        </h4>
                                        
                                        <p className="text-base text-slate-600 leading-relaxed mb-8 font-medium max-w-[90%]">
                                            {recommended_product.reason}
                                        </p>
                                        
                                        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">1 Dose / Afternoon</span>
                                            <button 
                                                onClick={() => { trackAction('protocol_activated', { product: recommended_product.name }); showToast('Protocol activated!'); }}
                                                className="flex items-center gap-2 text-xs text-white font-bold uppercase tracking-widest bg-emerald-500 px-5 py-3 rounded-full hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95">
                                                Activate Protocol <ChevronRight size={16} className="text-emerald-100" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Dashboard Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {/* Sleep Quality */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Moon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-300 tracking-widest uppercase">Rest</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Sleep Quality</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold text-slate-800 tracking-tight">7h 42m</span>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+5%</span>
                            </div>
                            {/* Mock Bar Chart */}
                            <div className="flex items-end justify-between h-12 gap-1.5 px-1">
                                {[40, 30, 60, 45, 100, 60, 45].map((h, i) => (
                                    <div key={i} className={`w-full rounded-t-sm transition-all duration-500 ${i === 4 ? 'bg-indigo-500' : 'bg-indigo-100 group-hover:bg-indigo-200'}`} style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Stress Level */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                    <HeartPulse size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-orange-300 tracking-widest uppercase">Balance</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Stress Level</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold text-slate-800 tracking-tight">Low</span>
                                <span className="text-xs font-bold text-orange-500 ml-1">Stable</span>
                            </div>
                            {/* Mock Stress Bar */}
                            <div className="mt-8 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Zen</span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full w-1/4"></div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        {/* Nutrition Balance */}
                        <div className="bg-emerald-50/50 rounded-3xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-white shadow-sm shadow-emerald-400/30">
                                    <Activity size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Fuel</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-600 mb-1">Nutrition Balance</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-slate-800 tracking-tight">92%</span>
                                <span className="text-xs font-bold text-emerald-600 ml-1">Superb</span>
                            </div>
                            <div className="flex gap-1.5 mb-4">
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-emerald-200 rounded-full"></div>
                            </div>
                            <p className="text-[11px] text-emerald-700 font-medium leading-tight">Protein targets smashed! Ready for your afternoon workout.</p>
                        </div>
                    </div>

                    {/* Morning Glow Routine Banner */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-500 group-hover:scale-105 transition-transform">
                            <Moon size={28} className="scale-x-[-1]" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Morning Glow Routine</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your body responds best to low-impact energy right now. How about a 15-min stretch session?</p>
                        </div>
                        <button 
                            onClick={() => { trackAction('morning_glow_started'); showToast('Morning routine initiated!'); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 w-full md:w-auto">
                            Let's do it!
                        </button>
                    </div>

                </motion.div>
                ) : activeTab === 'logger' ? (
                /* ------------------------------------- */
                /* THE HYBRID LOGGER                     */
                /* ------------------------------------- */
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
                        <h2 className="text-xl font-['Orbitron'] text-slate-900 font-bold mb-5 tracking-tight">Activity Logger</h2>
                        <div className="flex p-1 bg-white rounded-full w-fit shadow-sm border border-slate-200">
                            <button 
                                onClick={() => setActivityTab('sync')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${activityTab === 'sync' ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                            >
                                <Smartphone size={16} /> Auto-Sync
                            </button>
                            <button 
                                onClick={() => setActivityTab('manual')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${activityTab === 'manual' ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'}`}
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
                                className="glass-panel bg-white p-6 rounded-3xl border border-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-500/5 group hover:border-emerald-300 transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform">
                                        <Activity className="text-emerald-500" size={26} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-800 tracking-tight">Apple Health / Google Fit</h4>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Live polling active. <span className="text-emerald-600 font-semibold">Synced 2m ago.</span></p>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-2 rounded-full border border-emerald-100 shrink-0">
                                     <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="manual-tab"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-3 gap-4"
                            >
                                {/* Manual Tappable Icons */}
                                {['Strength', 'Cardio', 'Recovery'].map((label, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => { trackAction('manual_log', { type: label }); showToast(label + ' workout logged!'); }}
                                        className="bg-white p-6 rounded-3xl flex flex-col items-center gap-4 hover:bg-slate-50 hover:border-slate-300 transition-all border border-slate-200 shadow-sm active:scale-95 group">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white border border-slate-100 shadow-sm transition-colors text-slate-400 group-hover:text-pink-500">
                                            {i === 0 ? <Dumbbell size={24} /> : i === 1 ? <Activity size={24} /> : <HeartPulse size={24} />}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 tracking-wide">{label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nutrition Logger */}
                    <div className="pt-6 border-t border-slate-200">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                                Nutrition Intake
                                <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border shadow-sm ${macros.zinc < 50 ? 'text-pink-600 bg-pink-100 border-pink-200' : 'text-emerald-600 bg-emerald-100 border-emerald-200'}`}>
                                    {macros.zinc < 50 ? 'Gap Critical' : 'Optimal'}
                                </span>
                            </h2>
                        </div>
                        
                        <div className="glass-panel bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
                            {isScanning ? (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Libido AI is analyzing...</h3>
                                    <p className="text-sm text-slate-500 font-medium max-w-[250px] leading-relaxed">
                                        Deriving accurate macros for your meal.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <textarea 
                                            value={mealInput}
                                            onChange={(e) => setMealInput(e.target.value)}
                                            placeholder="What did you eat? E.g., '1 scoop whey, 2 boiled eggs...'"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pb-14 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 min-h-[120px] resize-none"
                                        />
                                        <button 
                                            onClick={handleAnalyzeLibido}
                                            disabled={isScanning || !mealInput.trim()}
                                            className="absolute bottom-3 right-3 bg-slate-900 text-white text-xs px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all font-bold tracking-wide shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Analyze with Libido
                                        </button>
                                    </div>

                                    {/* Display Derived Macros */}
                                    <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                                        <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Carbs</span>
                                            <span className="text-xl font-bold text-slate-800">{macros.carbs}g</span>
                                        </div>
                                        <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                                            <span className="block text-[10px] uppercase font-bold text-emerald-600 tracking-widest mb-1">Protein</span>
                                            <span className="text-xl font-bold text-emerald-700">{macros.protein}g</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Zinc (µg)</span>
                                            <span className="text-xl font-bold text-slate-800">{macros.zinc}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <p className="text-sm text-slate-500 mt-6 text-center leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="font-bold text-emerald-500">Libido AI</span> derives accurate nutritional elements to cross-reference with Circadian and Hormonal baselines.
                        </p>
                    </div>

                </motion.div>
                ) : activeTab === 'portal' ? (
                /* ------------------------------------- */
                /* THE CONSULTANT (DOCTOR PORTAL)        */
                /* ------------------------------------- */
                <motion.div 
                    key="portal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col pb-20 md:pb-0"
                >
                    {/* Portal Header */}
                    <div className="bg-white rounded-3xl p-5 flex items-center justify-between mb-6 shrink-0 shadow-sm border border-slate-200 mt-2 md:mt-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center relative shadow-sm">
                                <Stethoscope size={22} className="text-orange-500" />
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800 text-sm">Dr. Aris</h3>
                                    <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">Specialist</div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold tracking-wide">
                                     <Lock size={12} className="text-slate-400" /> 
                                     <span>E2E Encrypted • Anonymous ID: 9X4B</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6 scrollbar-hide px-1">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isDoctor ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-3xl p-5 shadow-sm ${msg.isDoctor ? 'bg-white border border-slate-200 rounded-tl-sm text-slate-700' : 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-sm shadow-md shadow-pink-500/20'}`}>
                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    <div className={`text-[10px] font-bold mt-3 flex items-center gap-1 ${msg.isDoctor ? 'text-slate-400' : 'text-pink-100'}`}>
                                        {msg.time} {msg.isDoctor && <ShieldCheck size={12} className="text-emerald-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="bg-slate-50/90 backdrop-blur-xl shrink-0 mt-auto box-border pt-4">
                        <div className="relative border border-slate-200 rounded-full shadow-sm bg-white">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Discuss performance constraints..."
                                className="w-full bg-transparent py-4 pl-6 pr-14 text-sm text-slate-700 font-medium placeholder-slate-400 focus:outline-none"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim()}
                                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
                            >
                                <Send size={16} className="ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                        <div className="text-center mt-4 mb-2 text-[10px] text-slate-400 font-bold tracking-wide uppercase">
                            Information is fully encrypted and never tied to your real identity.
                        </div>
                    </div>
                </motion.div>
                ) : null}
            </AnimatePresence>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-slate-200 flex items-center justify-around py-4 pb-8 z-50 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Activity size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-widest font-extrabold">Dashboard</span>
        </button>
        <button 
            onClick={() => setActiveTab('logger')} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'logger' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Camera size={22} strokeWidth={activeTab === 'logger' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-widest font-extrabold">Log</span>
        </button>
        <button 
            onClick={() => setActiveTab('portal')} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'portal' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <Stethoscope size={22} strokeWidth={activeTab === 'portal' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-widest font-extrabold">Consultant</span>
        </button>
      </nav>

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
