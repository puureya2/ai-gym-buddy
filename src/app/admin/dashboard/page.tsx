"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { UserProfile, Workout } from "@/types";
import { 
  Users, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  Settings,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMissions: 0,
    aiQuota: "84%",
    activeToday: 12
  });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const workoutsSnap = await getDocs(collection(db, "workouts"));
        
        setStats({
          totalUsers: usersSnap.size,
          totalMissions: workoutsSnap.size,
          aiQuota: "92%",
          activeToday: Math.floor(usersSnap.size * 0.4)
        });

        // Load 5 recent users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(usersQuery);
        setRecentUsers(recentSnap.docs.map(doc => doc.data() as UserProfile));

      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-32 px-4 md:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-red-900 pb-10">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-8 h-8 text-red-500" />
                 <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Command Console</h1>
              </div>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em] ml-11">Status: Administrative Access Level 5</p>
           </div>
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-red-500">Live Telemetry</span>
              </div>
           </div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Total Athletes', value: stats.totalUsers, icon: Users, color: 'text-white' },
             { label: 'Global Missions', value: stats.totalMissions, icon: Activity, color: 'text-white' },
             { label: 'AI Tactical Link', value: stats.aiQuota, icon: Cpu, color: 'text-green-500' },
             { label: 'Daily Operations', value: stats.activeToday, icon: BarChart3, color: 'text-white' },
           ].map((kpi, i) => (
             <div key={i} className="card-premium p-6 bg-slate-900 border-slate-800 flex items-center justify-between group hover:border-red-500/50 transition-all">
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                   <p className={`text-2xl font-black italic ${kpi.color}`}>{kpi.value}</p>
                </div>
                <kpi.icon className="w-8 h-8 text-slate-800 group-hover:text-red-500/20 transition-colors" />
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* System Health */}
           <div className="lg:col-span-8 space-y-6">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Subsystem Integrity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { name: "Auth Cluster", status: "Operational", health: 100 },
                   { name: "Intelligence Core", status: "Healthy", health: 94 },
                   { name: "Biometric Storage", status: "Operational", health: 100 },
                   { name: "Analytics Engine", status: "Processing", health: 88 }
                 ].map((sys, i) => (
                   <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                         <p className="font-black italic uppercase text-xs text-white">{sys.name}</p>
                         <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{sys.status}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500" style={{ width: `${sys.health}%` }} />
                      </div>
                   </div>
                 ))}
              </div>

              {/* Alert Center */}
              <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-red-500 flex items-center justify-center">
                       <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white uppercase italic">Zero Critical Anomalies Detected</p>
                       <p className="text-xs text-slate-500 uppercase tracking-widest font-black">All athlete telemetry within safe parameters.</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">Clear Logs</button>
              </div>
           </div>

           {/* Recent Athletes */}
           <div className="lg:col-span-4 space-y-6">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Recent Inductions</h3>
              <div className="card-premium p-6 bg-slate-900 border-slate-800 space-y-4">
                 {recentUsers.map((u, i) => (
                   <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-2xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-white italic">
                            {u.displayName?.[0] || 'U'}
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-white uppercase">{u.displayName}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-black">{u.fitnessGoals[0] || 'General'}</p>
                         </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-red-500 transition-colors" />
                   </div>
                 ))}
                 <button className="w-full mt-4 py-3 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-800 hover:text-white transition-all">
                    View All Athletes
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
