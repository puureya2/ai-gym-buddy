"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";
import { ChevronRight, ChevronLeft, ShieldCheck, Zap, HeartPulse } from "lucide-react";

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

const GOALS = ["Build Muscle", "Lose Weight", "Endurance", "Flexibility", "Health", "Powerlifting"];
const PERSONALITIES = [
  { id: 'drill_sergeant', label: 'Drill Sergeant', desc: 'Disciplined & Blunt' },
  { id: 'zen_master', label: 'Mindful Coach', desc: 'Form & Recovery focused' },
  { id: 'data_scientist', label: 'Data Scientist', desc: 'Objective & Analytical' },
  { id: 'custom', label: 'Custom Intel', desc: 'Build your own orchestrator' }
];

export default function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    fitnessGoals: [],
    injuries: [],
    healthConcerns: [],
    coachPersonality: 'data_scientist',
    trainingAge: 'beginner',
    totalWorkoutsCompleted: 0,
    tutorialStep: 1,
    customCoachSettings: { intensity: 5, cautionLevel: 5, researchFocus: 5, styleDescription: "" }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile(userId, { ...data, lastActive: Date.now() });
      onComplete();
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="card-premium w-full max-w-xl p-10 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex gap-0.5">
           {[1, 2, 3, 4, 5].map(s => (
             <div key={s} className={`h-full flex-1 transition-all duration-500 ${s <= step ? 'bg-brand-electric shadow-[0_0_10px_#00FFFF]' : 'bg-slate-100'}`} />
           ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 bg-slate-100 rounded-2xl mb-2">
                 <ShieldCheck className="w-8 h-8 text-slate-950" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950">Mission Objective</h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Select your primary training protocols.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => setData({ ...data, fitnessGoals: data.fitnessGoals?.includes(goal) ? data.fitnessGoals.filter(g => g !== goal) : [...(data.fitnessGoals || []), goal] })}
                  className={`p-5 rounded-2xl border-2 text-xs font-black uppercase italic transition-all ${data.fitnessGoals?.includes(goal) ? 'border-brand-electric bg-brand-electric/5 text-slate-950 scale-[1.02] shadow-xl' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!data.fitnessGoals?.length} className="metallic-button w-full flex items-center justify-center gap-2 group disabled:opacity-30">
              Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-3">
               <Zap className="w-10 h-10 text-brand-electric mx-auto" />
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Biometrics</h2>
               <p className="text-slate-400 text-sm">Provide vitals for protocol calibration.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Height (cm)</label>
                <input type="number" onChange={e => setData({...data, height: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-brand-electric outline-none font-bold" placeholder="180" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Weight (kg)</label>
                <input type="number" onChange={e => setData({...data, weight: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-brand-electric outline-none font-bold" placeholder="85" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-black italic uppercase text-xs text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(3)} className="metallic-button flex-[2]">Next Intel</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-3">
               <HeartPulse className="w-10 h-10 text-red-400 mx-auto" />
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Health Intel</h2>
               <p className="text-slate-400 text-sm">Specify any compromised systems or injuries.</p>
            </div>
            <div className="space-y-4">
               <textarea 
                 placeholder="INJURIES: List any chronic pain or recent traumas..." 
                 onChange={e => setData({...data, injuries: e.target.value.split(',').map(i => i.trim())})}
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 h-24 outline-none font-bold text-sm resize-none focus:border-red-400 transition-colors"
               />
               <textarea 
                 placeholder="HEALTH CONCERNS: Cardiac, respiratory, or other medical flags..." 
                 onChange={e => setData({...data, healthConcerns: e.target.value.split(',').map(i => i.trim())})}
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 h-24 outline-none font-bold text-sm resize-none focus:border-red-400 transition-colors"
               />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-black italic uppercase text-xs text-slate-400 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(4)} className="metallic-button flex-[2]">Calibrate Coach</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-3">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Orchestrator</h2>
               <p className="text-slate-400 text-sm">Select your coaching personality and designation.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Coach Designation (Name)</label>
              <input 
                type="text" 
                placeholder="E.g. UNIT-7, SARGE, ATHENA..." 
                value={data.coachName || ""}
                onChange={e => setData({...data, coachName: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-brand-electric outline-none font-bold uppercase italic"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setData({ ...data, coachPersonality: p.id as any })}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${data.coachPersonality === p.id ? 'border-brand-electric bg-slate-50 scale-[1.01] shadow-md' : 'border-slate-100 opacity-60'}`}
                >
                  <p className="font-black italic uppercase text-sm">{p.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-black italic uppercase text-xs text-slate-400 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
              <button onClick={data.coachPersonality === 'custom' ? () => setStep(5) : handleSave} className="metallic-button flex-[2]">
                {data.coachPersonality === 'custom' ? "Fine-Tune" : "Initialize System"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="text-center">
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter">Custom Logic</h2>
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Intensity', key: 'intensity' },
                   { label: 'Caution', key: 'cautionLevel' },
                   { label: 'Research', key: 'researchFocus' }
                 ].map((trait) => (
                    <div key={trait.key} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{trait.label}</span>
                          <span className="text-brand-electric">{data.customCoachSettings?.[trait.key as keyof typeof data.customCoachSettings] || 5}/10</span>
                       </div>
                       <input 
                         type="range" min="1" max="10" 
                         value={data.customCoachSettings?.[trait.key as keyof typeof data.customCoachSettings] || 5} 
                         onChange={e => setData({...data, customCoachSettings: {...data.customCoachSettings!, [trait.key]: parseInt(e.target.value)}})} 
                         className="w-full accent-brand-electric h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                       />
                    </div>
                 ))}
                 <textarea 
                    placeholder="STYLE: Describe how the coach should speak..." 
                    onChange={e => setData({...data, customCoachSettings: {...data.customCoachSettings!, styleDescription: e.target.value}})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 h-20 outline-none font-bold text-sm resize-none focus:border-brand-electric"
                 />
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setStep(4)} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-black italic uppercase text-xs text-slate-400 flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
                 <button onClick={handleSave} disabled={isSaving} className="metallic-button flex-[2] uppercase">
                    {isSaving ? "Syncing..." : "Activate Orchestrator"}
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
