"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { routineService } from "@/services/routineService";
import { authService } from "@/services/authService";
import { Workout, UserProfile, Routine, Exercise } from "@/types";
import WorkoutLogger from "@/components/WorkoutLogger";
import AIChatCommandCenter from "@/components/AIChatCommandCenter";
import OnboardingModal from "@/components/OnboardingModal";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, Info, X, XCircle, ChevronRight, Activity, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedInitialData, setSelectedInitialData] = useState<Routine | Workout | undefined>();

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

  const handleRoutineSuggestion = (routine: Routine) => {
    setSelectedInitialData(routine);
    setIsDrafting(true);
  };

  const finishDrafting = async () => {
    await loadData();
    setIsDrafting(false);
    // Advance tutorial if active
    if (profile?.tutorialStep === 1) {
       await authService.updateProfile(user!.uid, { tutorialStep: 2 });
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-32 px-4 md:px-8 font-[family-name:var(--font-geist-sans)]">
      
      {showOnboarding && <OnboardingModal userId={user.uid} onComplete={() => { setShowOnboarding(false); loadData(); }} />}

      <div className="max-w-7xl mx-auto space-y-8">
        
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
             <div className="card-premium p-8 space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                   <ShieldCheck className="w-6 h-6 text-brand-electric" />
                   <h3 className="font-black italic uppercase text-lg tracking-tighter">Status Monitor</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Efficiency</p>
                      <p className="text-2xl font-black italic">92.4%</p>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-950 w-[92%] shadow-[0_0_10px_rgba(0,255,255,0.1)]" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-brand-electric transition-all cursor-pointer" onClick={() => router.push('/history')}>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                         Missions <ChevronRight className="w-2 h-2" />
                      </p>
                      <p className="text-2xl font-black italic text-slate-950 group-hover:text-brand-electric">{profile.totalWorkoutsCompleted || 0}</p>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                      <p className="text-2xl font-black italic text-slate-950">12<span className="text-xs">d</span></p>
                   </div>
                </div>

                <button 
                  onClick={() => router.push('/analytics')}
                  className="w-full metallic-button flex items-center justify-center gap-2 py-4"
                >
                  <Activity className="w-4 h-4" /> Statistical Lab
                </button>
             </div>

             <div className="card-premium p-8 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <ShieldCheck className="w-24 h-24 text-brand-electric" />
                </div>
                <h3 className="font-black italic uppercase text-brand-electric tracking-widest text-xs mb-6">Active Directives</h3>
                <div className="space-y-4 relative z-10">
                   {profile.fitnessGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-brand-electric" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{g}</span>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={() => router.push('/profile')}
                  className="mt-8 w-full py-4 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all relative z-10"
                >
                   Modify Directives
                </button>
             </div>
          </div>

          {/* Main Column: AI COMMS or DRAFTING */}
          <div className="lg:col-span-8">
             {isDrafting ? (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                   <div className="flex items-center justify-between mb-8 px-4">
                     <div className="flex items-center gap-4">
                        <div className="h-3 w-3 rounded-full bg-brand-electric shadow-[0_0_10px_#00FFFF]" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Drafting Protocol</h2>
                     </div>
                     <button 
                       onClick={() => {
                         if(confirm("DISCARD PROTOCOL? Changes will not be stored.")) {
                           setIsDrafting(false);
                         }
                       }} 
                       className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-widest"
                     >
                       <XCircle className="w-4 h-4" /> Discard
                     </button>
                   </div>
                   <WorkoutLogger 
                      initialData={selectedInitialData} 
                      isRoutineCreation={true} 
                      onComplete={finishDrafting} 
                   />
                </div>
             ) : (
                <AIChatCommandCenter 
                  profile={profile} 
                  recentWorkouts={recentWorkouts} 
                  onSuggestRoutine={handleRoutineSuggestion} 
                />
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
