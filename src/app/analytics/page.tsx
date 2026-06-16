"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { Workout, UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Activity, Target, Zap, TrendingUp, History, ShieldCheck, Flame } from "lucide-react";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadData();
  }, [user, loading]);

  const loadData = async () => {
    if (!user) return;
    const data = await workoutService.getRecentWorkouts(user.uid, 50);
    setWorkouts(data);
    
    // 1. Process Volume Trend
    const trend = data.slice(0, 10).reverse().map(w => {
      const volume = (w.exercises || []).reduce((acc, ex) => 
        acc + (ex.sets || []).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0
      );
      return {
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume
      };
    });
    setVolumeData(trend);

    // 2. Calculate Real-Time Streak
    calculateStreak(data);
  };

  const calculateStreak = (allWorkouts: Workout[]) => {
    if (allWorkouts.length === 0) return;
    
    const workoutDates = allWorkouts.map(w => new Date(w.date).toDateString());
    const uniqueDates = Array.from(new Set(workoutDates));
    
    let currentStreak = 0;
    const today = new Date();
    const checkDate = new Date();
    
    // Check if they worked out today or yesterday to maintain streak
    const workedOutToday = uniqueDates.includes(today.toDateString());
    checkDate.setDate(checkDate.getDate() - 1);
    const workedOutYesterday = uniqueDates.includes(checkDate.toDateString());

    if (!workedOutToday && !workedOutYesterday) {
      setStreak(0);
      return;
    }

    // Start checking from the most recent active day
    let dateToVerify = workedOutToday ? today : checkDate;
    
    while (uniqueDates.includes(dateToVerify.toDateString())) {
      currentStreak++;
      dateToVerify.setDate(dateToVerify.getDate() - 1);
    }
    
    setStreak(currentStreak);
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
                 <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950">Performance Lab</h1>
              </div>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.5em] ml-11">Module: Advanced Biometrics v3.4</p>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-center px-8 py-4 bg-slate-950 text-white rounded-[2rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                    <Flame className="w-12 h-12 text-orange-500 fill-current" />
                 </div>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Active Streak</p>
                 <p className="text-4xl font-black italic text-brand-electric relative z-10">{streak}<span className="text-xs ml-1 text-white">DAYS</span></p>
              </div>
           </div>
        </header>

        {/* Tactical KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Total Missions', value: workouts.length, icon: Target },
             { label: 'Global Rank', value: streak > 5 ? 'VETERAN' : 'RECRUIT', icon: ShieldCheck },
             { label: 'Consistency', value: `${Math.min(100, streak * 20)}%`, icon: TrendingUp },
             { label: 'Current Phase', value: 'Active Ops', icon: Zap },
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
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Assessment</p>
                    <p className="text-sm font-bold leading-relaxed text-slate-300 italic">
                       "Athlete streak is currently at {streak} days. Volume progression is scaling within parameters. Maintain current tactical intensity."
                    </p>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Operational Readiness</p>
                    <div className="space-y-3">
                       {[
                         { label: "Execution Cadence", val: streak > 0 ? "Optimal" : "Pending" },
                         { label: "Telemetry Sync", val: "100%" },
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
                    <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Next Objective</p>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">
                          Continue daily extractions to build a 7-day veteran streak. Tactical focus remains on volume consistency.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Statistical Core */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 card-premium p-10 space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-brand-electric pb-2 relative z-10 inline-block">Volume Flux (Tonnage Over Time)</h3>
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

           <div className="lg:col-span-4 card-premium p-8 flex flex-col space-y-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                 <History className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-black italic uppercase tracking-widest">Operation History</h3>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
                 {workouts.map(w => (
                   <div key={w.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-electric transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-[10px] font-black uppercase italic group-hover:text-brand-electric">{w.title}</p>
                         <span className="text-[8px] font-mono text-slate-400">{new Date(w.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1">
                         {(w.exercises || []).slice(0, 5).map((_, i) => (
                           <div key={i} className="h-1 flex-1 bg-brand-electric rounded-full" />
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
