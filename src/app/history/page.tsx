"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { Workout } from "@/types";
import { useRouter } from "next/navigation";
import { 
  History, 
  ChevronRight, 
  Timer, 
  Calendar, 
  ArrowUpRight, 
  ClipboardCheck, 
  StickyNote,
  Zap
} from "lucide-react";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadHistory();
  }, [user, loading]);

  const loadHistory = async () => {
    const data = await workoutService.getRecentWorkouts(user!.uid, 50);
    setWorkouts(data);
  };

  const formatDuration = (start?: number, end?: number) => {
    if (!start || !end) return "N/A";
    const mins = Math.round((end - start) / 60000);
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <header className="border-b-2 border-slate-900 pb-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950 rounded-2xl">
                 <History className="w-8 h-8 text-brand-electric" />
              </div>
              <div>
                 <h1 className="text-5xl font-black italic uppercase tracking-tighter">Mission Archives</h1>
                 <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em]">Sector: Historical Intelligence</p>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* History List */}
           <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2">Extracted Sessions</h3>
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                 {workouts.map(w => (
                   <button 
                     key={w.id}
                     onClick={() => setSelectedWorkout(w)}
                     className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all group relative overflow-hidden ${
                       selectedWorkout?.id === w.id 
                         ? 'border-slate-950 bg-white shadow-xl scale-[1.02]' 
                         : 'border-slate-100 bg-white hover:border-slate-300'
                     }`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                               {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-950 group-hover:text-brand-electric transition-colors">{w.title}</h4>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-mono text-slate-400">{formatDuration(w.startTime, w.endTime)}</span>
                         </div>
                      </div>
                      <div className="flex gap-1">
                         {w.exercises.slice(0, 4).map((_, i) => (
                           <div key={i} className="h-1 flex-1 bg-slate-100 rounded-full group-hover:bg-brand-electric/20" />
                         ))}
                      </div>
                   </button>
                 ))}
                 {workouts.length === 0 && (
                   <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">No Records Found</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Detail View */}
           <div className="lg:col-span-7">
              {selectedWorkout ? (
                <div className="card-premium p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                   
                   <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                      <div className="space-y-1">
                         <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedWorkout.title}</h2>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedWorkout.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {formatDuration(selectedWorkout.startTime, selectedWorkout.endTime)}</span>
                         </div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-2xl">
                         <ClipboardCheck className="w-6 h-6 text-brand-electric" />
                      </div>
                   </div>

                   <div className="space-y-8">
                      {selectedWorkout.exercises.map((ex, i) => (
                        <div key={i} className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="h-6 w-1 bg-brand-electric rounded-full" />
                              <h5 className="font-black italic uppercase text-lg tracking-tight">{ex.name}</h5>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-2">
                              {ex.sets.map((set, si) => (
                                <div key={si} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div className="flex items-center gap-6">
                                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Phase {si + 1}</span>
                                      <div className="flex gap-8">
                                         <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Load</p>
                                            <p className="text-sm font-black italic">{set.weight} <span className="text-[10px] text-slate-300">kg</span></p>
                                         </div>
                                         <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Reps</p>
                                            <p className="text-sm font-black italic">{set.reps}</p>
                                         </div>
                                      </div>
                                   </div>
                                   {set.plannedWeight && (
                                      <div className="text-right">
                                         <p className="text-[8px] font-black text-slate-400 uppercase">Vs Protocol</p>
                                         <p className={`text-[10px] font-black italic ${set.weight! >= set.plannedWeight ? 'text-green-500' : 'text-slate-300'}`}>
                                            Tgt: {set.plannedWeight}kg
                                         </p>
                                      </div>
                                   )}
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>

                   {selectedWorkout.notes && (
                      <div className="p-6 bg-slate-950 rounded-[2rem] relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-10">
                            <StickyNote className="w-12 h-12 text-white" />
                         </div>
                         <h5 className="text-[10px] font-black text-brand-electric uppercase tracking-widest mb-3">Field Notes</h5>
                         <p className="text-sm font-bold text-slate-300 italic leading-relaxed">
                            "{selectedWorkout.notes}"
                         </p>
                      </div>
                   )}

                </div>
              ) : (
                <div className="h-full flex items-center justify-center card-premium p-20 border-dashed opacity-50">
                   <div className="text-center space-y-4">
                      <Zap className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="text-sm font-black italic uppercase text-slate-400 tracking-[0.3em]">Select a Session to Decrypt</p>
                   </div>
                </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
