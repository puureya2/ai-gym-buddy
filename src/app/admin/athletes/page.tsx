"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc, where, writeBatch } from "firebase/firestore";
import { UserProfile } from "@/types";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Scale, 
  Ruler, 
  Target,
  Calendar,
  Trash2,
  AlertCircle
} from "lucide-react";

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPurging, setIsPurging] = useState<string | null>(null);

  useEffect(() => {
    loadAthletes();
  }, []);

  async function loadAthletes() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    setAthletes(snap.docs.map(doc => doc.data() as UserProfile));
    setLoading(false);
  }

  const handlePurge = async (userId: string, name: string) => {
    if (!confirm(`CRITICAL: Are you sure you want to PURGE athlete "${name}"? This will delete their profile, all logged missions, and all chat intelligence. This action is irreversible.`)) {
      return;
    }

    setIsPurging(userId);
    try {
      const batch = writeBatch(db);
      
      // 1. Delete User Document
      batch.delete(doc(db, "users", userId));

      // 2. Find and Delete all Workouts (Missions)
      const workoutsSnap = await getDocs(query(collection(db, "workouts"), where("userId", "==", userId)));
      workoutsSnap.forEach(d => batch.delete(d.ref));

      // 3. Find and Delete all Routines (Protocols)
      const routinesSnap = await getDocs(query(collection(db, "routines"), where("userId", "==", userId)));
      routinesSnap.forEach(d => batch.delete(d.ref));

      // 4. Find and Delete all Chat Messages
      const messagesSnap = await getDocs(query(collection(db, "chat_messages"), where("userId", "==", userId)));
      messagesSnap.forEach(d => batch.delete(d.ref));

      await batch.commit();
      
      // Refresh local list
      setAthletes(athletes.filter(a => a.uid !== userId));
      alert(`Purge Complete: Athlete "${name}" and all associated data have been removed from the grid.`);

    } catch (err) {
      console.error("Purge Failed:", err);
      alert("System Error: Unable to complete total purge.");
    } finally {
      setIsPurging(null);
    }
  };

  const filteredAthletes = athletes.filter(a => 
    a.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && athletes.length === 0) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
       <Users className="w-12 h-12 text-red-500 animate-pulse" />
       <p className="text-red-500 font-mono text-xs uppercase tracking-[0.4em]">Scanning Athlete Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
           <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Athlete Registry</h1>
              <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-[0.5em]">Subsystem: Biometric Management</p>
           </div>
           
           <div className="flex gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Search ID/Email..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-white outline-none focus:border-red-500 transition-all w-64"
                 />
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
           {filteredAthletes.map((a) => (
             <div key={a.uid} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-all relative overflow-hidden group">
                {isPurging === a.uid && (
                   <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <p className="text-white font-black italic uppercase animate-pulse">Executing Total Purge...</p>
                   </div>
                )}
                
                <div className="flex items-center gap-6 flex-1">
                   <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black italic text-white shadow-xl">
                      {a.displayName?.[0] || 'A'}
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic uppercase text-white">{a.displayName}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{a.email}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-[2]">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Ruler className="w-3 h-3" /> Height</p>
                      <p className="text-sm font-bold text-slate-300">{a.height || '??'} cm</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Scale className="w-3 h-3" /> Weight</p>
                      <p className="text-sm font-bold text-slate-300">{a.weight || '??'} kg</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Mission</p>
                      <p className="text-sm font-bold text-slate-300 truncate w-32">{a.fitnessGoals?.[0] || 'Standard'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Tenure</p>
                      <p className="text-sm font-bold text-slate-300">{Math.floor((Date.now() - (a.createdAt || Date.now())) / 86400000)} Days</p>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button 
                     onClick={() => handlePurge(a.uid, a.displayName || "Unknown")}
                     className="p-3 bg-slate-800 rounded-xl hover:bg-red-500 hover:text-white transition-all text-slate-400"
                     title="Purge Athlete"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
           ))}

           {filteredAthletes.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-600 font-black italic uppercase tracking-widest">No matching records found.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
