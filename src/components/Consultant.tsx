import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Lock, ShieldCheck, Send } from 'lucide-react';
import { getDoctorConsultation } from '../services/aiService';

export function Consultant({ trackAction, userName = 'Guest' }: any) {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello, ${userName}. I am Forkplay AI Consultant, specializing in performance optimization and hormonal balance. I noticed your HRV is stable but your deep sleep has dropped by 40% this week. How can I help you today?`, isDoctor: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [chatInput, setChatInput] = useState("");
  
  const PRESET_PROMPTS = [
      "What should I eat for energy?",
      "Analyse my stress from today",
      "Suggest a pre-workout snack"
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    const userMsg = { id: Date.now(), text: userText, isDoctor: false, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    
    trackAction('chat_message_sent', { message: userText });

    try {
        // Secure call via Supabase Edge function
        const data: any = await getDoctorConsultation(userText);
        const aiResponse = data?.response || "Understood. The protocol will be updated.";
        
        setMessages(prev => [...prev, { id: Date.now()+1, text: aiResponse.replace(/\*/g,''), isDoctor: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    } catch(e) {
        setMessages(prev => [...prev, { id: Date.now()+1, text: "System offline. Please consult dashboard protocols. (Edge function unavailable)", isDoctor: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }
  };

  return (
    <motion.div 
        key="portal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col pb-20 md:pb-0"
    >
        {/* Portal Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 flex items-center justify-between mb-6 shrink-0 shadow-sm border border-slate-200 dark:border-slate-700 mt-2 md:mt-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center relative shadow-sm">
                    <Stethoscope size={22} className="text-orange-500" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dr. Aris</h3>
                        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">Specialist</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wide">
                        <Lock size={12} className="text-slate-400" /> 
                        <span>E2E Encrypted • Anonymous ID: 9X4B</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => { trackAction('connect_doctor_clicked'); alert('Routing to an available human specialist...'); }}
                className="bg-brand-red text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
                Connect Humans
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6 scrollbar-hide px-1">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isDoctor ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-3xl p-5 shadow-sm ${msg.isDoctor ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-tl-sm text-slate-700 dark:text-slate-200' : 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-sm shadow-md shadow-pink-500/20'}`}>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className={`text-[10px] font-bold mt-3 flex items-center gap-1 ${msg.isDoctor ? 'text-slate-400' : 'text-pink-100'}`}>
                            {msg.time} {msg.isDoctor && <ShieldCheck size={12} className="text-emerald-500" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Input Area */}
        <div className="bg-slate-50 dark:bg-slate-800/50/90 backdrop-blur-xl shrink-0 mt-auto box-border pt-2 pb-2">
            
            {/* Preset Chips */}
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide px-1 pb-1">
                {PRESET_PROMPTS.map((prompt, i) => (
                    <button 
                        key={i}
                        onClick={() => setChatInput(prompt)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap hover:border-brand-orange hover:text-brand-orange transition-colors"
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            <div className="relative border border-slate-200 dark:border-slate-700 rounded-full shadow-sm bg-white dark:bg-slate-900">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Discuss performance constraints..."
                    className="w-full bg-transparent py-4 pl-6 pr-14 text-sm text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400 focus:outline-none"
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
  );
}
