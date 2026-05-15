"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { routineService } from "@/services/routineService";
import { Routine } from "@/types";
import { useRouter } from "next/navigation";
import WorkoutLogger from "@/components/WorkoutLogger";
import { Plus, Trash2, Edit3, Dumbbell, XCircle } from "lucide-react";

export default function RoutinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedRoutine, setSelectedInitialData] = useState<Routine | undefined>();

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadRoutines();
  }, [user, loading]);

  const loadRoutines = async () => {
    if (!user) return;
    const data = await routineService.getRoutines(user.uid);
    setRoutines(data);
  };

  const handleCreate = () => {
    setSelectedInitialData(undefined);
    setIsDrafting(true);
  };

  const handleEdit = (routine: Routine) => {
    setSelectedInitialData(routine);
    setIsDrafting(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Purge this protocol from the library?")) {
      await routineService.deleteRoutine(id);
      loadRoutines();
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {isDrafting ? (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Drafting Protocol</h2>
               <button 
                 onClick={() => {
                   if(confirm("DISCARD PROTOCOL? Changes will not be stored.")) {
                     setIsDrafting(false);
                   }
                 }} 
                 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors"
               >
                 <XCircle className="w-4 h-4" /> Discard
               </button>
             </div>
             <WorkoutLogger 
                initialData={selectedRoutine} 
                isRoutineCreation={true} 
                onComplete={() => { setIsDrafting(false); loadRoutines(); }} 
             />
          </div>
        ) : (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-slate-900 pb-8">
               <div>
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950">Library</h1>
                  <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em]">Subsystem: Protocol Storage</p>
               </div>
               <button 
                 onClick={handleCreate}
                 className="metallic-button flex items-center justify-center gap-2 group"
               >
                 <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                 Manual Draft
               </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {routines.map((r) => (
                 <div key={r.id} className="card-premium p-8 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleEdit(r)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                          <Edit3 className="w-4 h-4 text-slate-600" />
                       </button>
                       <button onClick={() => handleDelete(r.id)} className="p-2 bg-slate-100 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                       </button>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-brand-chrome uppercase tracking-widest mb-1">
                             {r.isAiGenerated ? "AI GENERATED" : "MANUAL DRAFT"}
                          </p>
                          <h3 className="text-2xl font-black italic uppercase tracking-tight group-hover:text-brand-electric transition-colors">{r.name}</h3>
                       </div>
                       
                       <div className="space-y-2">
                          {r.exercises.map((ex, i) => (
                             <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                {ex.name}
                             </div>
                          ))}
                       </div>

                       <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                             Exercises: {r.exercises.length}
                          </span>
                          <button 
                            onClick={() => router.push(`/workout?routineId=${r.id}`)}
                            className="text-xs font-black italic uppercase text-brand-chrome hover:text-brand-electric flex items-center gap-1"
                          >
                             Execute Mission <Dumbbell className="w-3 h-3" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}

               {routines.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-400 font-black italic uppercase text-sm tracking-widest">Protocol Storage Empty</p>
                    <p className="text-slate-300 text-xs mt-2">Consult with AI Coach or Draft manually to begin.</p>
                 </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
