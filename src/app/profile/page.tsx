"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Settings, Shield, Zap, Info } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const snap = await getDoc(doc(db, "users", user!.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="border-b-2 border-slate-900 pb-8">
           <h1 className="text-5xl font-black italic uppercase tracking-tighter">Profile</h1>
           <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em]">Athlete Identity & Configuration</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           
           {/* Left: Identity */}
           <div className="md:col-span-4 space-y-6">
              <div className="card-premium p-8 text-center">
                 <div className="relative inline-block mb-6">
                    <div className="h-24 w-24 rounded-3xl bg-slate-950 flex items-center justify-center text-white text-3xl font-black italic">
                       {user?.displayName?.[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-brand-electric rounded-xl shadow-lg shadow-brand-electric/20">
                       <Shield className="w-4 h-4 text-slate-950" />
                    </div>
                 </div>
                 <h2 className="text-xl font-black uppercase italic tracking-tight">{user?.displayName}</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase mt-1">{user?.email}</p>
                 
                 <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                       <p className="text-sm font-bold uppercase text-brand-chrome">{profile.trainingAge}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                       <p className="text-sm font-bold uppercase text-brand-chrome">12 Days</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Orchestration Settings */}
           <div className="md:col-span-8 space-y-8">
              <div className="card-premium p-8 space-y-8">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Settings className="w-5 h-5 text-slate-950" />
                    <h3 className="font-black italic uppercase text-sm tracking-widest">Coach Configuration</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Personality</p>
                       <div className="p-4 bg-slate-50 rounded-2xl border-2 border-brand-electric/20">
                          <p className="font-black italic uppercase text-sm text-brand-chrome">{profile.coachPersonality?.replace('_', ' ')}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic Calibration</p>
                       {profile.customCoachSettings ? (
                          <div className="space-y-4">
                             {['Intensity', 'Caution', 'Research'].map(trait => (
                                <div key={trait}>
                                   <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1">
                                      <span>{trait}</span>
                                      <span className="text-brand-electric">{profile.customCoachSettings?.[trait.toLowerCase() as keyof typeof profile.customCoachSettings]}/10</span>
                                   </div>
                                   <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-slate-950" style={{ width: `${(profile.customCoachSettings?.[trait.toLowerCase() as keyof typeof profile.customCoachSettings] as number) * 10}%` }} />
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <p className="text-xs italic text-slate-400">Standard preset active.</p>
                       )}
                    </div>
                 </div>
              </div>

              <div className="card-premium p-8 space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Info className="w-5 h-5 text-slate-950" />
                    <h3 className="font-black italic uppercase text-sm tracking-widest">System Info</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Version</p>
                       <p className="text-sm font-bold">3.0.4-PREMIUM</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-sm font-bold uppercase">Operational</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
