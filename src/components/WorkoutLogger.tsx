"use client";

import { useState, useEffect } from "react";
import { Exercise, Workout, Set, Routine } from "@/types";
import { workoutService } from "@/services/workoutService";
import { routineService } from "@/services/routineService";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Check, Play, Timer, Save, ShieldAlert, X } from "lucide-react";

interface WorkoutLoggerProps {
  initialData?: Routine | Workout;
  onComplete: () => void;
  isRoutineCreation?: boolean;
}

export default function WorkoutLogger({ initialData, onComplete, isRoutineCreation = false }: WorkoutLoggerProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(
    (initialData && 'title' in initialData ? (initialData as Workout).title : undefined) ||
    (initialData && 'name' in initialData ? (initialData as Routine).name : undefined) ||
    "Field Operation"
  );
  const [exercises, setExercises] = useState<Exercise[]>(initialData?.exercises || []);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRoutineCreation) {
      const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isRoutineCreation]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      category: "strength",
      sets: [{ reps: 0, weight: 0, completed: false }],
    };
    setExercises([...exercises, newExercise]);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, completed: false }] };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof Set, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (isRoutineCreation) {
        await routineService.createRoutine(user.uid, title, exercises);
        setMessage("PROTOCOL STORED");
      } else {
        const workoutData: Omit<Workout, "id"> = {
          userId: user.uid,
          title,
          date: Date.now(),
          startTime,
          endTime: Date.now(),
          exercises,
          notes,
          status: 'completed'
        };
        await workoutService.saveWorkout(user.uid, workoutData);
        setMessage("SESSION EXTRACTED");
      }
      setTimeout(() => onComplete(), 1500);
    } catch (error) { setMessage("SYSTEM ERROR"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Session Intelligence Header */}
      <div className="card-premium p-8 border-l-8 border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-4xl font-black italic uppercase bg-transparent border-none focus:ring-0 w-full tracking-tighter text-slate-950 p-0"
            placeholder="OPERATION CODENAME"
          />
          {!isRoutineCreation && (
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 text-white rounded-full">
                  <Timer className="w-3 h-3 text-brand-electric" />
                  <span className="text-[10px] font-black font-mono">{formatTime(elapsed)}</span>
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Telemetry Active</div>
            </div>
          )}
        </div>
        {!isRoutineCreation && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="md:w-1/3 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium outline-none resize-none h-20"
            placeholder="SITUATIONAL NOTES: Energy, form anomalies, environment..."
          />
        )}
      </div>

      {/* Objectives Area */}
      <div className="space-y-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="card-premium p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-brand-electric transition-colors" />
            
            <div className="flex justify-between items-start mb-8">
              <input
                type="text"
                placeholder="OBJECTIVE NAME"
                value={exercise.name}
                onChange={(e) => {
                  setExercises(exercises.map(ex => 
                    ex.id === exercise.id ? { ...ex, name: e.target.value } : ex
                  ));
                }}
                className="text-2xl font-black italic bg-transparent border-b-2 border-slate-100 focus:border-slate-950 transition-colors outline-none w-2/3 uppercase tracking-tight"
              />
              <button 
                onClick={() => setExercises(exercises.filter(ex => ex.id !== exercise.id))}
                className="p-2 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-300 hover:text-red-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
                <span>Phase</span>
                <span>Load (KG)</span>
                <span>Reps</span>
                <span className="text-center">{isRoutineCreation ? "Remove" : "Status"}</span>
              </div>
              
              {exercise.sets.map((set, idx) => (
                <div key={idx} className={`grid grid-cols-4 gap-6 items-center p-3 rounded-2xl transition-all ${set.completed ? 'bg-slate-50 opacity-60' : 'bg-slate-100/50 hover:bg-slate-100'}`}>
                  <span className="text-center font-black italic text-xs text-slate-400">{idx + 1}</span>
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(exercise.id, idx, "weight", parseFloat(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-brand-electric outline-none"
                    />
                    {set.plannedWeight && (
                      <p className="text-[8px] font-black uppercase text-slate-400 text-center">Tgt: {set.plannedWeight}kg</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exercise.id, idx, "reps", parseInt(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-brand-electric outline-none"
                    />
                    {set.plannedReps && (
                      <p className="text-[8px] font-black uppercase text-slate-400 text-center">Tgt: {set.plannedReps}</p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {isRoutineCreation ? (
                       <button onClick={() => {
                          setExercises(exercises.map(ex => 
                            ex.id === exercise.id ? { ...ex, sets: ex.sets.filter((_, i) => i !== idx) } : ex
                          ));
                       }} className="text-red-500 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                    ) : (
                      <button 
                        onClick={() => updateSet(exercise.id, idx, "completed", !set.completed)}
                        className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-white border-2 border-slate-200'}`}
                      >
                        <Check className={`w-4 h-4 ${set.completed ? 'text-white' : 'text-slate-100'}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exercise.id)}
              className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Phase
            </button>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 pt-10">
        <button
          onClick={addExercise}
          className="w-full border-2 border-dashed border-slate-200 py-8 rounded-[2rem] text-slate-300 hover:border-brand-electric hover:text-brand-electric transition-all font-black italic uppercase tracking-[0.3em] text-sm"
        >
          + Initialize New Objective
        </button>

        {exercises.length > 0 && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="metallic-button w-full h-20 text-xl flex items-center justify-center gap-3 group shadow-2xl shadow-slate-950/20"
          >
            {isSaving ? "TRANSMITTING..." : (
               <>
                 {isRoutineCreation ? "STORE PROTOCOL" : "EXTRACT SESSION"}
                 <ShieldAlert className="w-6 h-6 group-hover:rotate-12 transition-transform text-brand-electric" />
               </>
            )}
          </button>
        )}
      </div>

      {message && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-12 py-4 bg-slate-950 text-brand-electric rounded-full font-black uppercase italic tracking-widest shadow-2xl animate-bounce neon-border">
          {message}
        </div>
      )}
    </div>
  );
}
