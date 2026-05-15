"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { routineService } from "@/services/routineService";
import { authService } from "@/services/authService";
import { Workout, UserProfile, Routine } from "@/types";
import AIChatCommandCenter from "@/components/AIChatCommandCenter";
import OnboardingModal from "@/components/OnboardingModal";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, Info, X } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadData();
  }, [user, loading, router]);

  const loadData = async () => {
    if (!user) return;
    const [workoutData, userDoc] = await Promise.all([
      workoutService.getRecentWorkouts(user.uid),
      getDoc(doc(db, "users", user.uid))
    ]);
    setRecentWorkouts(workoutData);
    if (userDoc.exists()) {
      const p = userDoc.data() as UserProfile;
      setProfile(p);
      if (!p.fitnessGoals?.length) setShowOnboarding(true);
      else if (p.tutorialStep === 1) setShowTutorial(true);
    }
  };

  const handleRoutineApproval = async (routine: Routine) => {
    if (!user) return;
    
    // Ensure nested objects (exercises) are fully formed for Firestore
    const sanitizedExercises = (routine.exercises || []).map(ex => ({
      id: ex.id || Math.random().toString(36).substr(2, 9),
      name: ex.name || "Unknown Objective",
      category: ex.category || "strength",
      sets: ex.sets || [],
      notes: ex.notes || "",
      plannedSets: ex.plannedSets || 0,
      plannedReps: ex.plannedReps || ""
    }));

    await routineService.createRoutine(user.uid, routine.name, sanitizedExercises, true);
    
    // Advance tutorial if active
    if (profile?.tutorialStep === 1) {
       await authService.updateProfile(user.uid, { tutorialStep: 2 });
    }
    router.push('/routines');
  };

  const closeTutorial = async () => {
    if (user) {
      await authService.updateProfile(user.uid, { tutorialStep: -1 });
      setShowTutorial(false);
    }
  };

  if (loading) return null;
  if (!user || !profile) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32 px-4 md:px-8">
      
      {showOnboarding && <OnboardingModal userId={user.uid} onComplete={() => { setShowOnboarding(false); loadData(); }} />}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Tutorial Overlays */}
        {showTutorial && (
          <div className="bg-slate-950 text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl border-l-4 border-brand-electric animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-electric/10 flex items-center justify-center">
                   <Info className="w-5 h-5 text-brand-electric" />
                </div>
                <div>
                   <p className="font-black italic uppercase text-xs tracking-widest text-brand-electric">System Instruction</p>
                   <p className="text-sm font-bold text-slate-300">Phase 1: Establish Contact. Ask the coach to "Draft a protocol" to begin your journey.</p>
                </div>
             </div>
             <button onClick={closeTutorial} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side Column: Performance Snapshot */}
          <div className="lg:col-span-4 space-y-6">
             <div className="card-premium p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                   <ShieldCheck className="w-6 h-6 text-brand-electric" />
                   <h3 className="font-black italic uppercase text-lg tracking-tighter">Status Monitor</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                      <p className="text-2xl font-black italic">84%</p>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-950 w-[84%] shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Missions</p>
                      <p className="text-xl font-black italic">{profile.totalWorkoutsCompleted || 0}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                      <p className="text-xl font-black italic">12<span className="text-[10px]">d</span></p>
                   </div>
                </div>
             </div>

             <div className="card-premium p-8 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <ShieldCheck className="w-24 h-24" />
                </div>
                <h3 className="font-black italic uppercase text-brand-electric tracking-widest text-xs mb-6">Active Directives</h3>
                <div className="space-y-4">
                   {profile.fitnessGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-brand-electric" />
                         <span className="text-xs font-bold uppercase tracking-tight text-slate-300">{g}</span>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={() => router.push('/profile')}
                  className="mt-8 w-full py-3 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                   Modify Directives
                </button>
             </div>
          </div>

          {/* Main Column: AI COMMS */}
          <div className="lg:col-span-8">
             <AIChatCommandCenter 
               profile={profile} 
               recentWorkouts={recentWorkouts} 
               onSuggestRoutine={handleRoutineApproval} 
             />
          </div>

        </div>
      </div>
    </div>
  );
}
