"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { routineService } from "@/services/routineService";
import { workoutService } from "@/services/workoutService";
import { Routine, Workout } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import WorkoutLogger from "@/components/WorkoutLogger";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Play } from "lucide-react";

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId");

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Routine | Workout | undefined>();
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Weekly Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) {
       loadRoutines();
       if (routineId) {
          handleExecuteFromId(routineId);
       }
    }
  }, [user, loading, routineId]);

  const loadRoutines = async () => {
    if (!user) return;
    const data = await routineService.getRoutines(user.uid);
    setRoutines(data);
  };

  const handleExecuteFromId = async (id: string) => {
    const data = await routineService.getRoutines(user!.uid);
    const routine = data.find(r => r.id === id);
    if (routine) {
       setActiveWorkout(routine);
       setIsExecuting(true);
    }
  };

  const startMission = (data: Routine) => {
    setActiveWorkout(data);
    setIsExecuting(true);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {isExecuting ? (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Live Session</h2>
               </div>
               <button onClick={() => setIsExecuting(false)} className="text-xs font-black uppercase text-slate-400 hover:text-red-500">Terminate</button>
             </div>
             <WorkoutLogger 
                initialData={activeWorkout} 
                onComplete={() => { setIsExecuting(false); router.push('/analytics'); }} 
             />
          </div>
        ) : (
          <>
            {/* Mission Planning Header */}
            <header className="border-b-2 border-slate-900 pb-8 space-y-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950">Missions</h1>
                    <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em]">Sector: Field Operations</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
                     <button className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-4 h-4" /></button>
                     <span className="font-black italic uppercase text-xs px-4">May 2026</span>
                     <button className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                  </div>
               </div>
            </header>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                 <div key={day} className="card-premium p-4 min-h-[160px] flex flex-col group relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{day}</p>
                    <div className="flex-1 space-y-2">
                       {/* This would show scheduled routines */}
                       {i % 2 === 0 && routines[0] && (
                         <div className="p-2 bg-brand-electric/10 border border-brand-electric/20 rounded-lg">
                            <p className="text-[8px] font-black uppercase truncate text-slate-700">{routines[0].name}</p>
                         </div>
                       )}
                    </div>
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                       <button className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                         Schedule <Clock className="w-3 h-3" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Quick Execute List */}
            <div className="space-y-6">
               <h3 className="text-sm font-black italic uppercase tracking-widest border-b border-slate-100 pb-2">Available Protocols</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {routines.map(r => (
                    <div key={r.id} className="card-premium p-6 flex flex-col justify-between hover:border-brand-electric group">
                       <div>
                          <h4 className="font-black italic uppercase text-lg mb-1 group-hover:text-brand-electric transition-colors">{r.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{r.exercises.length} Objectives</p>
                       </div>
                       <button 
                         onClick={() => startMission(r)}
                         className="mt-6 w-full bg-slate-950 text-white py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-brand-electric hover:text-slate-950 transition-all"
                       >
                         Execute Session <Play className="w-3 h-3 fill-current" />
                       </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => router.push('/routines')}
                    className="card-premium p-6 border-2 border-dashed border-slate-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"
                  >
                     <p className="text-slate-400 font-black italic uppercase text-[10px] tracking-widest">+ Access Library</p>
                  </div>
               </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
