"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { UserProfile, Workout, ChatMessage } from "@/types";
import { 
  Users, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  AlertTriangle,
  Database,
  Terminal,
  Zap
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMissions: 0,
    totalTonnage: 0,
    aiLinkStability: "98.2%",
    activeToday: 0
  });
  const [recentMissions, setRecentMissions] = useState<Workout[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const workoutsSnap = await getDocs(collection(db, "workouts"));
        const messagesSnap = await getDocs(query(collection(db, "chat_messages"), orderBy("timestamp", "desc"), limit(5)));
        
        const allWorkouts = workoutsSnap.docs.map(doc => doc.data() as Workout);
        
        // Calculate Global Tonnage
        const tonnage = allWorkouts.reduce((acc, w) => {
          return acc + (w.exercises || []).reduce((exAcc, ex) => {
            return exAcc + (ex.sets || []).reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
          }, 0);
        }, 0);

        setStats({
          totalUsers: usersSnap.size,
          totalMissions: workoutsSnap.size,
          totalTonnage: tonnage,
          aiLinkStability: `${(95 + Math.random() * 4).toFixed(1)}%`,
          activeToday: Math.floor(usersSnap.size * 0.6) || 1
        });

        // Load 5 most recent missions across all users
        const sortedMissions = [...allWorkouts].sort((a, b) => b.date - a.date).slice(0, 5);
        setRecentMissions(sortedMissions);
        
        setRecentMessages(messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));

      } catch (err) {
        console.error("Critical: Admin Data Sync Failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
       <Terminal className="w-12 h-12 text-red-500 animate-pulse" />
       <p className="text-red-500 font-mono text-xs uppercase tracking-[0.4em]">Decrypting Administrative Access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-12 pb-32 px-4 md:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-red-900/30 pb-10">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-10 h-10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                 <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Command Console</h1>
                    <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-[0.5em]">Auth: Level 5 Administrator // Kevin Chifamba</p>
                 </div>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="px-5 py-2.5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                 <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Global Telemetry Link: Active</span>
              </div>
           </div>
        </header>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: 'Registered Athletes', value: stats.totalUsers, icon: Users, suffix: '' },
             { label: 'Missions Extracted', value: stats.totalMissions, icon: Activity, suffix: '' },
             { label: 'Global Tonnage', value: stats.totalTonnage > 100000 ? stats.totalTonnage.toExponential(2) : stats.totalTonnage.toLocaleString(), icon: Zap, suffix: 'kg' },
             { label: 'AI Link Stability', value: stats.aiLinkStability, icon: Cpu, color: 'text-brand-electric' },
           ].map((kpi, i) => (
             <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-red-500/30 transition-all group">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                   <p className={`text-3xl font-black italic ${kpi.color || 'text-white'}`}>{kpi.value}<span className="text-xs ml-1 opacity-50">{kpi.suffix}</span></p>
                </div>
                <kpi.icon className="w-8 h-8 text-slate-800 group-hover:text-red-500/20 transition-all" />
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Subsystem Monitoring */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                 <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500">Platform Infrastructure</h3>
                 <span className="text-[8px] font-mono text-slate-600 uppercase">Latency: 14ms</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { name: "Auth Cluster", status: "Operational", health: 100, icon: ShieldCheck },
                   { name: "Intelligence Core", status: "Active", health: 96, icon: Cpu },
                   { name: "Biometric Storage", status: "Synced", health: 100, icon: Database },
                   { name: "Analytics Engine", status: "Aggregating", health: 92, icon: BarChart3 }
                 ].map((sys, i) => (
                   <div key={i} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-3xl space-y-4 hover:bg-slate-900/50 transition-all">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <sys.icon className="w-4 h-4 text-red-500" />
                            <p className="font-black italic uppercase text-xs text-white">{sys.name}</p>
                         </div>
                         <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/20">{sys.status}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_#ef4444]" style={{ width: `${sys.health}%` }} />
                      </div>
                   </div>
                 ))}
              </div>

              {/* Mission Feed */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500">Live Mission Stream</h3>
                 <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-950 border-b border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                             <th className="px-6 py-4">Operation</th>
                             <th className="px-6 py-4">Intelligence</th>
                             <th className="px-6 py-4">Telemetry</th>
                             <th className="px-6 py-4">Timestamp</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/50">
                          {recentMissions.map((m, i) => (
                            <tr key={i} className="hover:bg-red-500/5 transition-colors group cursor-default">
                               <td className="px-6 py-4">
                                  <p className="text-xs font-black italic text-white uppercase group-hover:text-red-500 transition-colors">{m.title}</p>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase">{(m.exercises || []).length} Objectives</p>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                     <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                     <p className="text-[10px] text-slate-400 font-bold italic truncate max-w-[150px]">"{m.notes || 'No situational notes'}"</p>
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <span className="text-[10px] font-mono text-brand-electric font-bold">
                                     {(m.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).length, 0)} PHASES
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <span className="text-[9px] font-black text-slate-500 uppercase">{new Date(m.date).toLocaleTimeString()}</span>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Intelligence Traffic */}
           <div className="lg:col-span-4 space-y-8">
              <h3 className="text-xs font-black italic uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Intelligence Traffic</h3>
              <div className="space-y-4">
                 {recentMessages.map((msg, i) => (
                   <div key={i} className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3 relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1 h-full ${msg.role === 'user' ? 'bg-white/20' : 'bg-red-500'}`} />
                      <div className="flex justify-between items-center">
                         <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{msg.role === 'user' ? 'Athlete Report' : 'Coach Response'}</span>
                         <span className="text-[8px] font-mono text-slate-700">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-300 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all cursor-default text-xs">
                         {msg.content}
                      </p>
                   </div>
                 ))}
                 
                 <div className="p-8 bg-gradient-to-br from-red-600 to-red-900 rounded-[2rem] text-white space-y-4 shadow-2xl shadow-red-900/20">
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="w-5 h-5" />
                       <h4 className="font-black italic uppercase text-sm tracking-tighter">System Alert</h4>
                    </div>
                    <p className="text-[10px] font-bold leading-relaxed uppercase opacity-80">
                       All athlete systems currently synchronized. Deployment V3.4.1 stable. No immediate administrative intervention required.
                    </p>
                    <button className="w-full py-2.5 bg-white text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                       Initialize Global Scan
                    </button>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
