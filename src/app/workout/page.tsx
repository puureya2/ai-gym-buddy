"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { routineService } from "@/services/routineService";
import { workoutService } from "@/services/workoutService";
import { Routine, Workout } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import WorkoutLogger from "@/components/WorkoutLogger";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  XCircle,
  Bell,
  CheckCircle2
} from "lucide-react";

function WorkoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId");

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Routine | Workout | undefined>();
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Weekly Calendar State
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // 0-6

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

  const toggleSchedule = async (routineId: string, dayIndex: number) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const currentSchedule = routine.weeklySchedule || [];
    const newSchedule = currentSchedule.includes(dayIndex)
      ? currentSchedule.filter(d => d !== dayIndex)
      : [...currentSchedule, dayIndex];

    await routineService.updateRoutine(routineId, { weeklySchedule: newSchedule });
    loadRoutines();
  };

  if (loading) return null;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
               <button 
                 onClick={() => {
                   if(confirm("ABORT MISSION? Telemetry will not be saved.")) {
                     setIsExecuting(false);
                   }
                 }} 
                 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors"
               >
                 <XCircle className="w-4 h-4" /> Abort
               </button>
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
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
                        <CalendarIcon className="w-4 h-4 text-slate-400 ml-2" />
                        <span className="font-black italic uppercase text-xs px-4">Tactical Schedule</span>
                     </div>
                  </div>
               </div>
            </header>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
               {days.map((day, i) => {
                 const scheduledForThisDay = routines.filter(r => r.weeklySchedule?.includes(i));
                 const isToday = new Date().getDay() === i;

                 return (
                   <div 
                    key={day} 
                    onClick={() => setSelectedDay(i)}
                    className={`card-premium p-4 min-h-[180px] flex flex-col transition-all cursor-pointer border-2 ${selectedDay === i ? 'border-brand-electric shadow-lg shadow-brand-electric/10' : 'border-slate-100'}`}
                   >
                      <div className="flex justify-between items-center mb-4">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-brand-electric' : 'text-slate-400'}`}>{day}</p>
                        {isToday && <div className="h-1.5 w-1.5 rounded-full bg-brand-electric animate-ping" />}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                         {scheduledForThisDay.map(r => (
                           <div key={r.id} className="p-2 bg-slate-950 text-white rounded-lg flex items-center justify-between group/item">
                              <p className="text-[8px] font-black uppercase truncate">{r.name}</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); startMission(r); }}
                                className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                 <Play className="w-3 h-3 text-brand-electric fill-current" />
                              </button>
                           </div>
                         ))}
                         {scheduledForThisDay.length === 0 && (
                           <p className="text-[8px] text-slate-300 italic uppercase">No Mission</p>
                         )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                         <span className="text-[8px] font-black text-slate-400 uppercase">{scheduledForThisDay.length} OPS</span>
                         <button className="text-slate-200 hover:text-brand-electric transition-colors">
                            <Clock className="w-3 h-3" />
                         </button>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Quick Execute & Scheduling List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-8 space-y-6">
                  <h3 className="text-sm font-black italic uppercase tracking-widest border-b border-slate-100 pb-2">Available Protocols</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {routines.map(r => (
                       <div key={r.id} className="card-premium p-6 flex flex-col justify-between hover:border-brand-electric group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                             <button 
                               onClick={() => toggleSchedule(r.id, selectedDay)}
                               className={`p-2 rounded-xl transition-all ${r.weeklySchedule?.includes(selectedDay) ? 'bg-brand-electric text-slate-950 shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                               title={r.weeklySchedule?.includes(selectedDay) ? "Unschedule" : "Schedule for selected day"}
                             >
                                <CalendarIcon className="w-4 h-4" />
                             </button>
                          </div>
                          <div>
                             <h4 className="font-black italic uppercase text-lg mb-1 group-hover:text-brand-electric transition-colors pr-10">{r.name}</h4>
                             <div className="flex gap-1 mt-2">
                                {days.map((d, i) => (
                                  <span key={i} className={`text-[7px] font-black w-4 h-4 rounded-sm flex items-center justify-center border ${r.weeklySchedule?.includes(i) ? 'bg-slate-950 text-white border-slate-950' : 'text-slate-300 border-slate-100'}`}>{d[0]}</span>
                                ))}
                             </div>
                          </div>
                          <button 
                            onClick={() => startMission(r)}
                            className="mt-6 w-full bg-slate-950 text-white py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-brand-electric hover:text-slate-950 transition-all"
                          >
                            Execute Session <Play className="w-3 h-3 fill-current" />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="card-premium p-8 bg-slate-950 text-white space-y-6">
                     <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Bell className="w-5 h-5 text-brand-electric" />
                        <h3 className="font-black italic uppercase text-xs tracking-widest">Selected: {days[selectedDay]}</h3>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                        Select a day in the calendar to adjust mission assignments. Scheduled protocols will appear in your daily briefing.
                     </p>
                     <div className="space-y-3">
                        {routines.filter(r => r.weeklySchedule?.includes(selectedDay)).map(r => (
                          <div key={r.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                             <CheckCircle2 className="w-4 h-4 text-green-500" />
                             <span className="text-[10px] font-black uppercase italic">{r.name}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  <div 
                    onClick={() => router.push('/routines')}
                    className="card-premium p-6 border-2 border-dashed border-slate-200 bg-transparent flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group"
                  >
                     <p className="text-slate-400 group-hover:text-slate-950 transition-colors font-black italic uppercase text-[10px] tracking-widest">+ Access Library</p>
                  </div>
               </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse pt-32 text-slate-400 font-mono uppercase text-xs tracking-widest">INITIALIZING FIELD OPERATIONS...</div>}>
      <WorkoutContent />
    </Suspense>
  );
}
