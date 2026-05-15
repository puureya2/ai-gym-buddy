"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { chatService } from "@/services/chatService";
import { ChatMessage, UserProfile, Workout } from "@/types";
import { Send, Zap, ShieldAlert, Sparkles, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIChatCommandCenterProps {
  profile: UserProfile;
  recentWorkouts: Workout[];
  onSuggestRoutine: (routine: any) => void;
}

export default function AIChatCommandCenter({ profile, recentWorkouts, onSuggestRoutine }: AIChatCommandCenterProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Goal-Based Suggestion
  useEffect(() => {
    if (messages.length === 0 && profile.fitnessGoals.length > 0) {
      const primaryGoal = profile.fitnessGoals[0];
      setSuggestedReplies([
        `How can I build ${primaryGoal.toLowerCase()} safely?`,
        "Draft a routine for me",
        "Explain my analytics"
      ]);
    }
  }, [messages, profile]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadHistory = async () => {
    if (!user) return;
    const history = await chatService.getChatHistory(user.uid);
    setMessages(history);
  };

  const handleSend = async (content?: string) => {
    const text = content || input;
    if (!text.trim() || !user) return;
    
    setInput("");
    setSuggestedReplies([]);
    
    const optimisticMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: user.uid,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    setIsTyping(true);
    try {
      const response = await chatService.sendMessage(user.uid, text, profile, recentWorkouts);
      setMessages(prev => [...prev, response]);
      
      if (response.suggestedReplies) {
        setSuggestedReplies(response.suggestedReplies);
      } else {
        setSuggestedReplies(["Can I share my diet?", "Is this weight safe?", "Update my profile"]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        userId: user.uid,
        role: 'model',
        content: "_SYSTEM ERROR: Tactical link lost. Please retry report transmission._",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
      
      {/* Tactical Header */}
      <div className="bg-slate-950 p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="h-10 w-10 rounded-2xl bg-brand-electric flex items-center justify-center rotate-3 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                <Zap className="w-6 h-6 text-slate-950 fill-current" />
             </div>
             <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-950" />
          </div>
          <div>
            <span className="font-black italic uppercase text-xs tracking-[0.3em] text-white block">{profile.coachName || "Coach AI V3.0"}</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Protocol: Active Intelligence</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-full flex items-center gap-2 border border-white/10">
           <ShieldAlert className="w-3 h-3 text-brand-electric" />
           <span className="text-[8px] font-black text-slate-300 uppercase">Context Sync: 100%</span>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-gradient-to-b from-slate-50 to-white"
      >
        {messages.length === 0 && (
          <div className="text-center py-20 animate-in fade-in duration-700">
             <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-black italic uppercase text-sm tracking-widest">Ready for the Mission?</p>
             <p className="text-slate-300 text-xs mt-2">Choose an initial objective below.</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-5 rounded-3xl font-bold text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-slate-950 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none border-l-4 border-l-brand-electric'
            }`}>
              <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-p:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
              
              {m.pendingRoutine && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border-2 border-brand-electric/20 space-y-4">
                  <div className="flex items-center gap-2">
                     <Plus className="w-4 h-4 text-brand-electric" />
                     <p className="text-[10px] font-black uppercase text-brand-chrome tracking-widest">Suggested Protocol</p>
                  </div>
                  <p className="text-xl font-black italic uppercase text-slate-950">{m.pendingRoutine.name}</p>
                  <button 
                    onClick={() => onSuggestRoutine(m.pendingRoutine!)}
                    className="w-full bg-brand-electric text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-electric/10"
                  >
                    Load Suggestion
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm">
               <div className="flex gap-1.5">
                 <div className="h-1.5 w-1.5 bg-brand-electric rounded-full animate-bounce" />
                 <div className="h-1.5 w-1.5 bg-brand-electric rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="h-1.5 w-1.5 bg-brand-electric rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Replies & Input */}
      <div className="p-6 bg-white border-t border-slate-100 space-y-6">
        
        {suggestedReplies.length > 0 && (
           <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
             {suggestedReplies.map((reply, i) => (
               <button 
                 key={i}
                 onClick={() => handleSend(reply)}
                 className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black uppercase italic text-slate-500 hover:border-brand-electric hover:text-brand-electric hover:bg-slate-100 transition-all"
               >
                 {reply}
               </button>
             ))}
           </div>
        )}

        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Report intel or ask for a mission plan..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-electric focus:bg-white outline-none transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="bg-slate-950 text-white h-14 w-14 rounded-2xl flex items-center justify-center hover:bg-brand-electric hover:text-slate-950 transition-all disabled:opacity-50 shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
