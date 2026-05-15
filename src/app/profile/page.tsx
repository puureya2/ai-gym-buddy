"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";
import { authService } from "@/services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Settings, Shield, Edit3, Save, X, Activity, Scale, Ruler } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const snap = await getDoc(doc(db, "users", user!.uid));
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      setProfile(data);
      setEditData(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(user.uid, editData);
      setProfile({ ...profile, ...editData } as UserProfile);
      setIsEditing(false);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-8">
           <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">Profile</h1>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.4em]">Athlete Identity & Configuration</p>
           </div>
           {!isEditing ? (
             <button 
               onClick={() => setIsEditing(true)}
               className="metallic-button flex items-center justify-center gap-2 py-3"
             >
               <Edit3 className="w-4 h-4" /> Edit Identity
             </button>
           ) : (
             <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 border-2 border-slate-200 rounded-2xl font-black italic uppercase text-xs text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="metallic-button flex items-center justify-center gap-2 py-3 px-10"
                >
                  {isSaving ? "Syncing..." : <><Save className="w-4 h-4" /> Save Intel</>}
                </button>
             </div>
           )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Column: Identity & Vitals */}
           <div className="lg:col-span-4 space-y-6">
              <div className="card-premium p-8 text-center relative overflow-hidden">
                 <div className="relative inline-block mb-6">
                    <div className="h-28 w-28 rounded-[2rem] bg-slate-950 flex items-center justify-center text-white text-4xl font-black italic shadow-2xl">
                       {user?.displayName?.[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2.5 bg-brand-electric rounded-2xl shadow-xl shadow-brand-electric/20">
                       <Shield className="w-5 h-5 text-slate-950" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-950">{user?.displayName}</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">{user?.email}</p>
                 
                 <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <p className="text-sm font-bold uppercase text-brand-chrome">{profile.trainingAge}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure</p>
                       <p className="text-sm font-bold uppercase text-brand-chrome">12 Days</p>
                    </div>
                 </div>
              </div>

              <div className="card-premium p-8 space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Biometrics</h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-100 rounded-xl"><Ruler className="w-4 h-4 text-slate-400" /></div>
                       <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Height</p>
                          {isEditing ? (
                            <input type="number" value={editData.height || ""} onChange={e => setEditData({...editData, height: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-slate-200 font-bold outline-none focus:border-brand-electric" />
                          ) : (
                            <p className="font-bold italic">{profile.height} cm</p>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-slate-100 rounded-xl"><Scale className="w-4 h-4 text-slate-400" /></div>
                       <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Weight</p>
                          {isEditing ? (
                            <input type="number" value={editData.weight || ""} onChange={e => setEditData({...editData, weight: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-slate-200 font-bold outline-none focus:border-brand-electric" />
                          ) : (
                            <p className="font-bold italic">{profile.weight} kg</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Customization */}
           <div className="lg:col-span-8 space-y-8">
              <div className="card-premium p-8 space-y-8">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Settings className="w-5 h-5 text-slate-950" />
                    <h3 className="font-black italic uppercase text-sm tracking-widest">Orchestration Protocol</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Coach ID</p>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editData.coachName || ""} 
                              onChange={e => setEditData({...editData, coachName: e.target.value})} 
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-black uppercase italic outline-none focus:border-brand-electric"
                            />
                          ) : (
                            <div className="p-4 bg-slate-950 rounded-2xl border-2 border-brand-electric/20 shadow-xl shadow-brand-electric/5">
                               <p className="font-black italic uppercase text-lg text-brand-electric tracking-tighter">{profile.coachName || "UNNAMED COACH"}</p>
                            </div>
                          )}
                       </div>
                       
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Goal</p>
                          <div className="flex flex-wrap gap-2">
                             {profile.fitnessGoals.map((g, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase italic text-slate-600">{g}</span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic Calibration</p>
                       {profile.customCoachSettings ? (
                          <div className="space-y-6">
                             {[
                               { label: 'Intensity', key: 'intensity' },
                               { label: 'Caution', key: 'cautionLevel' },
                               { label: 'Research', key: 'researchFocus' }
                             ].map(trait => (
                                <div key={trait.key} className="space-y-2">
                                   <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                                      <span>{trait.label}</span>
                                      <span className="text-brand-electric">{profile.customCoachSettings?.[trait.key as keyof typeof profile.customCoachSettings]}/10</span>
                                   </div>
                                   {isEditing ? (
                                      <input 
                                        type="range" min="1" max="10" 
                                        value={editData.customCoachSettings?.[trait.key as keyof typeof editData.customCoachSettings] || 5} 
                                        onChange={e => setEditData({
                                          ...editData, 
                                          customCoachSettings: {
                                            ...editData.customCoachSettings!, 
                                            [trait.key]: parseInt(e.target.value)
                                          }
                                        })} 
                                        className="w-full accent-brand-electric h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                      />
                                   ) : (
                                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-slate-950" style={{ width: `${(profile.customCoachSettings?.[trait.key as keyof typeof profile.customCoachSettings] as number) * 10}%` }} />
                                      </div>
                                   )}
                                </div>
                             ))}
                          </div>
                       ) : (
                          <p className="text-xs italic text-slate-400">Standard preset active. Enter edit mode to customize logic.</p>
                       )}
                    </div>
                 </div>
              </div>

              <div className="card-premium p-8 space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <Activity className="w-5 h-5 text-slate-950" />
                    <h3 className="font-black italic uppercase text-sm tracking-widest">Medical Logs</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Injuries</p>
                       {isEditing ? (
                         <textarea 
                           value={editData.injuries?.join(", ") || ""} 
                           onChange={e => setEditData({...editData, injuries: e.target.value.split(',').map(i => i.trim())})}
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-bold min-h-[100px] outline-none"
                         />
                       ) : (
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-red-500 uppercase italic leading-relaxed">{profile.injuries?.length ? profile.injuries.join(" / ") : "No Injuries Reported"}</p>
                         </div>
                       )}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Concerns</p>
                       {isEditing ? (
                         <textarea 
                           value={editData.healthConcerns?.join(", ") || ""} 
                           onChange={e => setEditData({...editData, healthConcerns: e.target.value.split(',').map(i => i.trim())})}
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-xs font-bold min-h-[100px] outline-none"
                         />
                       ) : (
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-600 uppercase italic leading-relaxed">{profile.healthConcerns?.length ? profile.healthConcerns.join(" / ") : "No Health Flags"}</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
