"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { Workout } from "@/types";
import { useRouter } from "next/navigation";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from "recharts";
import { Activity, Target, Zap, TrendingUp, History, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadData();
  }, [user, loading]);

  const loadData = async () => {
    if (!user) return;
    const data = await workoutService.getRecentWorkouts(user.uid, 50);
    setWorkouts(data);
    
    // Process Volume Trend
    const trend = data.slice(0, 10).reverse().map(w => {
      const volume = w.exercises.reduce((acc, ex) => 
        acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0
      );
      return {
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume
      };
    });
    setVolumeData(trend);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Lab Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-10">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <Activity className="w-8 h-8 text-brand-electric" />
                 <h1 className="text-5xl font-black italic uppercase tracking-tighter">Performance Lab</h1>
              </div>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.5em] ml-11">Module: Advanced Biometrics v3.0</p>
           </div>
           <div className="flex gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Efficiency</p>
                 <p className="text-3xl font-black italic">92.4<span className="text-sm text-brand-electric">%</span></p>
              </div>
           </div>
        </header>

        {/* Tactical KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Total Missions', value: workouts.length, icon: Target },
             { label: 'Avg Tonnage', value: '4,280kg', icon: Zap },
             { label: 'Consistency', value: '88%', icon: TrendingUp },
             { label: 'Active Streak', value: '5 Days', icon: Activity },
           ].map((kpi, i) => (
             <div key={i} className="card-premium p-6 flex items-center justify-between group">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                   <p className="text-2xl font-black italic group-hover:text-brand-electric transition-colors">{kpi.value}</p>
                </div>
                <kpi.icon className="w-8 h-8 text-slate-100 group-hover:text-brand-electric/20 transition-colors" />
             </div>
           ))}
        </div>

        {/* Coach Intelligence Report */}
        <div className="space-y-6">
           <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">Coach Intelligence Report</h3>
           <div className="card-premium p-10 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                 <ShieldCheck className="w-40 h-40" />
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Current Assessment</p>
                    <p className="text-sm font-bold leading-relaxed text-slate-300 italic">
                       "Athlete is showing significant volume progression in primary compounds. Tactical consistency remains high. No new physiological anomalies reported in recent comms."
                    </p>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Critical Metrics</p>
                    <div className="space-y-3">
                       {[
                         { label: "Form Integrity", val: "92%" },
                         { label: "Metabolic Flux", val: "Optimal" },
                         { label: "Injury Risk", val: "Low" }
                       ].map((m, i) => (
                         <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500">{m.label}</span>
                            <span className="text-xs font-black italic">{m.val}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Next Directive</p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">
                          Maintain current intensity protocols. Ensure 48hr recovery window for compromised muscle groups. Report any localized joint inflammation immediately.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Statistical Core */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Volume Flux Chart */}
           <div className="lg:col-span-8 card-premium p-10 space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="flex items-center justify-between relative z-10">
                 <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-brand-electric pb-2">Volume Flux (Tonnage Over Time)</h3>
                 <span className="text-[10px] font-mono text-slate-400 uppercase">Unit: Kilograms (KG)</span>
              </div>
              <div className="h-[400px] w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData}>
                       <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                       <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'black' }} />
                       <Area type="monotone" dataKey="volume" stroke="#00FFFF" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Completion History Sidebar */}
           <div className="lg:col-span-4 card-premium p-8 flex flex-col space-y-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                 <History className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-black italic uppercase tracking-widest">Recent Extractions</h3>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
                 {workouts.map(w => (
                   <div key={w.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-electric transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-[10px] font-black uppercase italic group-hover:text-brand-electric">{w.title}</p>
                         <span className="text-[8px] font-mono text-slate-400">{new Date(w.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1">
                         {w.exercises.slice(0, 5).map((_, i) => (
                           <div key={i} className="h-1 flex-1 bg-brand-electric rounded-full" />
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full metallic-button text-[10px] py-3">Export Data</button>
           </div>

        </div>

        {/* Progress Calendar Section */}
        <div className="space-y-6">
           <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">Operation Frequency</h3>
           <div className="card-premium p-8">
              <div className="grid grid-cols-7 gap-2">
                 {Array.from({ length: 35 }).map((_, i) => (
                   <div key={i} className={`aspect-square rounded-lg border-2 ${i % 3 === 0 ? 'bg-brand-electric border-brand-electric' : 'bg-slate-50 border-slate-100 opacity-20'} shadow-inner`} />
                 ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-4">
                 <p className="text-[8px] font-black uppercase text-slate-400">Low Intensity</p>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                    <div className="w-3 h-3 bg-brand-electric opacity-40 rounded-sm" />
                    <div className="w-3 h-3 bg-brand-electric opacity-70 rounded-sm" />
                    <div className="w-3 h-3 bg-brand-electric rounded-sm" />
                 </div>
                 <p className="text-[8px] font-black uppercase text-slate-400">Combat Ready</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
