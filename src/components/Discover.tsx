import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, Sparkles, Brain, Trophy, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export interface Article {
  id: string;
  title: string;
  content_snippet: string;
  category: string;
  source_illusion: string;
  reading_time_mins: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_vote?: 1 | -1 | null;
}

export function Discover() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<'start' | 'playing' | 'result'>('start');
  const [quizScore, setQuizScore] = useState(0);

  // Mock quiz questions (In reality, fetch from Supabase or generate via Gemini)
  const quiz = {
    question: "Myth or Fact: Consuming protein immediately before sleep significantly boosts nighttime muscle recovery.",
    options: ["Myth", "Fact"],
    correct: 1, // Fact
    explanation: "Fact! Studies show that 30-40g of slow-digesting protein (like casein) before bed increases overnight muscle protein synthesis and metabolic rate without increasing fat."
  };

  useEffect(() => {
    fetchGlobalFeed();
  }, []);

  const fetchGlobalFeed = async () => {
    setLoading(true);
    try {
      // 1. Fetch articles from the new discover_articles table
      const { data: rawArticles, error } = await supabase
        .from('discover_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && error.code === '42P01') {
          // Table doesn't exist yet (user hasn't run the SQL script)
          setArticles(getMockArticles());
          setLoading(false);
          return;
      }

      if (rawArticles && rawArticles.length > 0) {
         setArticles(rawArticles);
      } else {
         // Fallback to mocks if table is empty
         setArticles(getMockArticles());
      }
    } catch(err) {
      console.warn("Error fetching feed, falling back to mocks.", err);
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (articleId: string, voteType: 1 | -1) => {
    // Optimistic UI Update
    setArticles(prev => prev.map(a => {
      if (a.id === articleId) {
        const isRemovingVote = a.user_vote === voteType;
        const isChangingVote = a.user_vote && a.user_vote !== voteType;
        
        let newUpvotes = a.upvotes;
        let newDownvotes = a.downvotes;

        if (isRemovingVote) {
           if (voteType === 1) newUpvotes--;
           if (voteType === -1) newDownvotes--;
        } else if (isChangingVote) {
           if (voteType === 1) { newUpvotes++; newDownvotes--; }
           if (voteType === -1) { newDownvotes++; newUpvotes--; }
        } else {
           if (voteType === 1) newUpvotes++;
           if (voteType === -1) newDownvotes++;
        }

        return {
          ...a,
          user_vote: isRemovingVote ? null : voteType,
          upvotes: newUpvotes,
          downvotes: newDownvotes
        };
      }
      return a;
    }));

     // TODO: Dispatch specific vote logic to Supabase 'discover_votes'
  };

  const handleQuizAnswer = (index: number) => {
    const isCorrect = index === quiz.correct;
    setQuizScore(isCorrect ? 100 : 0);
    setQuizState('result');
    // TODO: Increment streak in Supabase 'profiles'
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Discover</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Science-backed insights for peak vitality</p>
        </div>
      </div>

      {/* DAILY QUIZ WIDGET (Variable Reward) */}
      <section className="bg-gradient-to-br from-brand-navy to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 translate-x-4 -translate-y-4">
            <Brain size={120} />
        </div>
        
        <AnimatePresence mode="wait">
            {quizState === 'start' && (
                <motion.div 
                    key="start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative z-10 flex flex-col gap-4"
                >
                    <div className="flex items-center gap-2 text-brand-salmon font-bold uppercase tracking-widest text-xs">
                        <Sparkles size={14} />
                        <span>Daily Vitality Quiz</span>
                    </div>
                    <h3 className="text-xl font-medium text-white leading-tight">
                        {quiz.question}
                    </h3>
                    <div className="flex gap-3 mt-4">
                        {quiz.options.map((opt, i) => (
                            <button 
                                key={opt}
                                onClick={() => handleQuizAnswer(i)}
                                className="flex-1 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 transition-colors border border-white/20 rounded-xl py-3 text-white font-medium backdrop-blur-md"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {quizState === 'result' && (
                 <motion.div 
                 key="result"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="relative z-10 flex flex-col gap-4 text-white"
             >
                 <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${quizScore > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                         {quizScore > 0 ? <Check size={20} /> : <Sparkles size={20} />}
                     </div>
                     <div>
                        <h3 className="font-bold text-lg">{quizScore > 0 ? 'Spot on!' : 'Good guess, but...'}</h3>
                        <p className="text-white/60 text-sm">+{quizScore} pts towards next title</p>
                     </div>
                 </div>
                 <p className="text-slate-200 mt-2 bg-black/20 p-4 rounded-xl text-sm border border-white/5">
                     {quiz.explanation}
                 </p>
             </motion.div>
            )}
        </AnimatePresence>
      </section>

      {/* GLOBAL FEED (Tribes / Reddit Format) */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Community Feed</h2>
      
      {loading ? (
          <div className="flex justify-center py-10 opacity-50">
              <Sparkles className="animate-pulse" />
          </div>
      ) : (
          <div className="flex flex-col gap-4">
             {articles.map((article) => (
                 <div key={article.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
                     
                     <div className="flex items-center gap-2 mb-3">
                         <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold tracking-wide uppercase">
                             {article.category}
                         </span>
                         <span className="text-slate-400 text-xs flex items-center gap-1">
                             <Sparkles size={10} /> {article.source_illusion}
                         </span>
                         <span className="text-slate-300 text-xs ml-auto">
                            {article.reading_time_mins} min read
                         </span>
                     </div>
                     
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 cursor-pointer group-hover:text-brand-navy transition-colors">
                         {article.title}
                     </h3>
                     
                     <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                         {article.content_snippet}
                     </p>
                     
                     {/* Reddit Controls */}
                     <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                        
                        <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
                             <button 
                                onClick={() => handleVote(article.id, 1)}
                                className={`p-2 hover:bg-slate-200 rounded-l-full transition-colors ${article.user_vote === 1 ? 'text-brand-salmon' : 'text-slate-400'}`}
                             >
                                 <ArrowUp size={16} strokeWidth={article.user_vote === 1 ? 3 : 2} />
                             </button>
                             <span className="px-2 text-sm font-bold text-slate-600 dark:text-slate-300 min-w-[2ch] text-center">
                                 {article.upvotes - article.downvotes}
                             </span>
                             <button 
                                onClick={() => handleVote(article.id, -1)}
                                className={`p-2 hover:bg-slate-200 rounded-r-full transition-colors ${article.user_vote === -1 ? 'text-brand-navy' : 'text-slate-400'}`}
                             >
                                 <ArrowDown size={16} strokeWidth={article.user_vote === -1 ? 3 : 2} />
                             </button>
                        </div>

                        <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors text-sm font-medium">
                            <MessageCircle size={16} />
                            <span>Discuss</span>
                        </button>

                        <button className="ml-auto flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors">
                            <Bookmark size={16} />
                        </button>

                     </div>
                 </div>
             ))}
          </div>
      )}

    </div>
  );
}

// ------------------------------------------------------------------
// Mocks strictly for visual testing if DB isn't populated yet
// ------------------------------------------------------------------
function getMockArticles(): Article[] {
   return [
       {
           id: "1",
           title: "The Neurochemistry of Ambition: Why sleep deprivation kills your execution drive first.",
           content_snippet: "Before cognitive decline hits, poor sleep down-regulates dopamine receptors in the striatum. This means you retain your intelligence, but completely lose the 'drive' to apply it. You know what to do, but simply can't force yourself to do it.",
           category: "Sleep",
           source_illusion: "Huberman Lab Digest",
           reading_time_mins: 2,
           upvotes: 245,
           downvotes: 12,
           created_at: new Date().toISOString()
       },
       {
           id: "2",
           title: "Libido isn't just horny; it's a proxy for baseline metabolic energy.",
           content_snippet: "When you are constantly in a caloric deficit or highly stressed, the body shuts down non-essential reproductive functions. A flatlining drive is often the first biochemical indicator that your physical recovery is failing.",
           category: "Vitality",
           source_illusion: "Peter Attia Notes",
           reading_time_mins: 4,
           upvotes: 890,
           downvotes: 45,
           created_at: new Date().toISOString()
       },
       {
           id: "3",
           title: "How continuous glucose spikes silently erode your discipline over the afternoon.",
           content_snippet: "Every time insulin crashes after a carb-heavy lunch, it simulates an acute stress response. The brain senses an energy crisis and prioritizes low-effort dopamine tasks (scrolling, snacking) over high-effort focus tasks.",
           category: "Nutrition",
           source_illusion: "Glucose Goddess Refrence",
           reading_time_mins: 3,
           upvotes: 56,
           downvotes: 2,
           created_at: new Date().toISOString()
       }
   ]
}
