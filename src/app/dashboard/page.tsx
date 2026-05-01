"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { authService } from "@/services/authService";
import { Workout, UserProfile } from "@/types";
import WorkoutLogger from "@/components/WorkoutLogger";
import AICoach from "@/components/AICoach";
import OnboardingModal from "@/components/OnboardingModal";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLogger, setShowLogger] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/debug-auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    // Load Workouts
    const workoutData = await workoutService.getRecentWorkouts(user.uid);
    setRecentWorkouts(workoutData);

    // Load Profile
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const profileData = userDoc.data() as UserProfile;
      setProfile(profileData);
      if (!profileData.fitnessGoals || profileData.fitnessGoals.length === 0) {
        setShowOnboarding(true);
      }
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Your Progress...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
      {showOnboarding && user && (
        <OnboardingModal 
          userId={user.uid} 
          onComplete={() => {
            setShowOnboarding(false);
            loadData();
          }} 
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-brand-electric">{user.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500">Track your gains and stay consistent.</p>
          </div>
          <button 
            onClick={() => setShowLogger(!showLogger)}
            className="bg-brand-electric text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-brand-electric/20"
          >
            {showLogger ? "View History" : "+ Log New Workout"}
          </button>
        </header>

        {showLogger ? (
          <div className="animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-6">
               <button onClick={() => setShowLogger(false)} className="text-gray-400 hover:text-black">← Back</button>
               <h2 className="text-xl font-bold">New Workout</h2>
            </div>
            <WorkoutLogger />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar / AI Column */}
            <div className="md:col-span-1 space-y-6">
              <AICoach workouts={recentWorkouts} profile={profile || undefined} />
              
              <div className="card-tech bg-black text-white p-6">
                <h3 className="font-bold mb-2 italic">Active Mission</h3>
                <div className="space-y-2 mb-4">
                  {profile?.fitnessGoals?.map(goal => (
                    <span key={goal} className="inline-block bg-brand-electric/20 text-brand-electric text-[10px] font-bold px-2 py-1 rounded-full border border-brand-electric/30 uppercase tracking-tighter mr-2">
                      {goal}
                    </span>
                  ))}
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full mb-2">
                  <div className="bg-brand-electric h-full rounded-full w-[60%]"></div>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Consistency: 60%</p>
              </div>
            </div>

            {/* Main History Column */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-xl font-bold border-b border-gray-200 pb-2">Recent History</h2>
              
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400">No workouts logged yet. Time to hit the gym!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="card-tech hover:border-brand-electric transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-brand-electric transition-colors">{workout.title}</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(workout.date).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {workout.exercises.length} Exercises
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {workout.exercises.slice(0, 6).map((ex, i) => (
                          <div key={i} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                            <p className="font-bold truncate">{ex.name}</p>
                            <p className="text-gray-400">{ex.sets.length} sets</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
