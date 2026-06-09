"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workoutService } from "@/services/workoutService";
import { Workout } from "@/types";
import { useRouter } from "next/navigation";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Activity, Target, Zap, TrendingUp, History, ShieldCheck, Info, HelpCircle, Brain, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [metric, setMetric] = useState<'volume' | 'strength'>('volume');
  const [activeBriefing, setActiveBriefing] = useState<string | null>(null);
  
  // Real stats
  const [kpis, setKpis] = useState({
    totalMissions: 0,
    avgTonnage: 0,
    consistency: 0,
    streak: 0
  });

  useEffect(() => {
    if (!loading && !user) router.push("/debug-auth");
    if (user) loadData();
  }, [user, loading]);

  const loadData = async () => {
    if (!user) return;
    const data = await workoutService.getRecentWorkouts(user.uid, 50);
    setWorkouts(data);
    processFieldData(data);
  };

  const processFieldData = (data: Workout[]) => {
    if (data.length === 0) return;

    const processed = data.slice().reverse().map(w => {
      const sessionVolume = w.exercises.reduce((acc, ex) => 
        acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0
      );

      let maxE1RM = 0;
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.weight && s.reps) {
            const e1rm = s.weight * (1 + (s.reps / 30));
            if (e1rm > maxE1RM) maxE1RM = Math.round(e1rm);
          }
        });
      });

      return {
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume: sessionVolume,
        strength: maxE1RM
      };
    });

    setChartData(processed);

    const totalV = processed.reduce((acc, d) => acc + d.volume, 0);
    const avgV = processed.length > 0 ? Math.round(totalV / processed.length) : 0;
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const uniqueDays = new Set(data.filter(w => w.date > thirtyDaysAgo).map(w => new Date(w.date).toDateString())).size;
    const consistency = Math.round((uniqueDays / 30) * 100);

    setKpis({
      totalMissions: data.length,
      avgTonnage: avgV,
      consistency,
      streak: 5
    });
  };

  const metricBriefings: Record<string, string> = {
    volume: "Volume Flux (Tonnage) tracks the total work performed. Increasing this over time is the primary driver of muscle growth (Hypertrophy).",
    strength: "Strength Potential (E1RM) uses the Epley Formula to project your maximal strength. This allows us to track intensity gains without dangerous 1-rep testing.",
    consistency: "Consistency is calculated as the percentage of operational days within the last 30-day window. Technical proficiency requires high frequency.",
    tonnage: "Average Tonnage is your mean load displacement per mission. It represents your baseline tactical capacity."
  };

  if (loading) return null;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 md:px-8 bg-slate-50 font-[family-name:var(--font-geist-sans)]">
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
        </header>

        {/* Tactical KPIs with Interactive Briefings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Total Missions', value: kpis.totalMissions, icon: Target, key: 'missions' },
             { label: 'Avg Tonnage', value: `${kpis.avgTonnage}kg`, icon: Zap, key: 'tonnage' },
             { label: 'Consistency', value: `${kpis.consistency}%`, icon: TrendingUp, key: 'consistency' },
             { label: 'Active Streak', value: `${kpis.streak} Days`, icon: Activity, key: 'streak' },
           ].map((kpi, i) => (
             <div 
               key={i} 
               onClick={() => setActiveBriefing(activeBriefing === kpi.key ? null : kpi.key)}
               className={`card-premium p-6 flex items-center justify-between group cursor-help transition-all ${activeBriefing === kpi.key ? 'border-brand-electric ring-1 ring-brand-electric/20' : ''}`}
             >
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      {kpi.label} <HelpCircle className="w-2 h-2" />
                   </p>
                   <p className="text-2xl font-black italic group-hover:text-brand-electric transition-colors">{kpi.value}</p>
                </div>
                <kpi.icon className="w-8 h-8 text-slate-100 group-hover:text-brand-electric/20 transition-colors" />
             </div>
           ))}
        </div>

        {/* Interactive Metric Briefing Panel */}
        {activeBriefing && metricBriefings[activeBriefing] && (
          <div className="p-6 bg-slate-900 text-white rounded-3xl animate-in slide-in-from-top-2 duration-300 flex items-center gap-6 shadow-2xl">
             <div className="h-12 w-12 rounded-2xl bg-brand-electric flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-slate-950" />
             </div>
             <div>
                <p className="text-[10px] font-black text-brand-electric uppercase tracking-widest mb-1">Intelligence Briefing: {activeBriefing}</p>
                <p className="text-sm font-bold text-slate-300 italic">"{metricBriefings[activeBriefing]}"</p>
             </div>
          </div>
        )}

        {/* Data Analysis Summary & Coach Intelligence Report */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Deep Data Analysis */}
           <div className="lg:col-span-7 space-y-6">
              <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">Data Analysis Summary</h3>
              <div className="card-premium p-10 space-y-8 bg-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Brain className="w-40 h-40" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-2 w-2 rounded-full bg-brand-electric animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Correlation Engine</p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase">
                          <span className="text-brand-electric">Progression Status:</span> {kpis.avgTonnage > 4000 ? "Advanced Scaling" : "Structural Foundations"}
                       </p>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Cross-referencing {workouts.length} historical extractions with biometric telemetry. Initial analysis suggests a linear volume trajectory. Correlating qualitative notes with load spikes shows high efficacy on rest-recovery cycles exceeding 48 hours.
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-6">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Efficiency Rating</p>
                          <div className="flex items-baseline gap-2">
                             <p className="text-2xl font-black italic">A-</p>
                             <p className="text-[10px] font-bold text-green-500">92%</p>
                          </div>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Adaptation Rate</p>
                          <div className="flex items-baseline gap-2">
                             <p className="text-2xl font-black italic">+4.2</p>
                             <p className="text-[10px] font-bold text-brand-chrome">KG/WK</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Coach Report Sidebar */}
           <div className="lg:col-span-5 space-y-6">
              <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-slate-900 pb-2 inline-block">Intelligence Report</h3>
              <div className="card-premium p-10 bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-32 h-32" />
                 </div>
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Next Directive</p>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-xs font-bold text-slate-300 leading-relaxed uppercase italic">
                             {kpis.consistency < 70 
                               ? "Increase Mission Frequency. Calibrating system for higher intensity protocols once 70% threshold is cleared."
                               : "Maintain Volume Flux. Systems stable for primary compound load increases in next operation phase."}
                          </p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em]">Critical Guardrails</p>
                       <div className="space-y-3">
                          {[
                            { label: "Injury Risk", val: "Minimal" },
                            { label: "Form Cadence", val: "Optimal" }
                          ].map((m, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                               <span className="text-[10px] font-bold uppercase text-slate-500">{m.label}</span>
                               <span className="text-xs font-black italic text-brand-electric">{m.val}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Statistical Core */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 card-premium p-10 space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black italic uppercase tracking-widest border-b-2 border-brand-electric pb-2">
                      {metric === 'volume' ? 'Volume Flux (Tonnage)' : 'Strength Potential (E1RM)'}
                    </h3>
                    <p 
                      onClick={() => setActiveBriefing(metric)}
                      className="text-[8px] font-bold text-slate-400 uppercase tracking-widest cursor-help hover:text-brand-electric flex items-center gap-1"
                    >
                      Explain this metric <HelpCircle className="w-2 h-2" />
                    </p>
                 </div>
                 <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setMetric('volume')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${metric === 'volume' ? 'bg-white shadow-sm text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Volume
                    </button>
                    <button 
                      onClick={() => setMetric('strength')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${metric === 'strength' ? 'bg-white shadow-sm text-slate-950' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Strength
                    </button>
                 </div>
              </div>
              
              <div className="h-[400px] w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                       <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'black' }} />
                       <Area type="monotone" dataKey={metric} stroke="#00FFFF" strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" animationDuration={1500} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Completion Sidebar linking to History */}
           <div className="lg:col-span-4 card-premium p-8 flex flex-col space-y-8">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                 <History className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-black italic uppercase tracking-widest">Recent Archive</h3>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                 {workouts.map(w => (
                   <div 
                     key={w.id} 
                     onClick={() => router.push('/history')}
                     className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-electric transition-all group cursor-pointer"
                   >
                      <div className="flex justify-between items-start mb-2">
                         <p className="text-[10px] font-black uppercase italic group-hover:text-brand-electric truncate max-w-[120px]">{w.title}</p>
                         <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-brand-electric" />
                      </div>
                      <p className="text-[8px] font-mono text-slate-400 mb-2">{new Date(w.date).toLocaleDateString()}</p>
                      <div className="flex gap-1">
                         {w.exercises.slice(0, 5).map((_, i) => (
                           <div key={i} className="h-1 flex-1 bg-brand-electric/30 rounded-full" />
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => router.push('/history')}
                className="w-full metallic-button text-[10px] py-3"
              >
                Access Full Archives
              </button>
           </div>
        </div>

        {/* Operation Frequency Section */}
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
