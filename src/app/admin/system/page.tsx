"use client";

import { Settings, Shield, Cpu, Database, Server, Info, Globe, Lock } from "lucide-react";

export default function SystemPage() {
  const firebaseConfig = {
    projectId: "ai-gym-buddy-b9e6b",
    region: "us-central1",
    status: "Healthy"
  };

  const aiEngine = {
    model: "Gemini 2.5 Flash",
    stability: "98.4%",
    latency: "1.2s avg"
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="border-b border-slate-800 pb-8">
           <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">System Diagnostics</h1>
           <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Subsystem: Operational Infrastructure</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Cloud Core */}
           <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4">
                 <Server className="w-5 h-5 text-red-500" />
                 <h3 className="font-black italic uppercase text-sm tracking-widest text-white">Cloud Core</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { label: "Deployment", val: "Vercel / Next.js 15" },
                   { label: "Database", val: "Google Firebase Firestore" },
                   { label: "Location", val: firebaseConfig.region },
                   { label: "Auth Provider", val: "Google OAuth 2.0" }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-300 font-mono">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Intelligence Engine */}
           <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4">
                 <Cpu className="w-5 h-5 text-brand-electric" />
                 <h3 className="font-black italic uppercase text-sm tracking-widest text-white">Intelligence Engine</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { label: "Active Model", val: aiEngine.model },
                   { label: "Stability", val: aiEngine.stability },
                   { label: "Response Rate", val: aiEngine.latency },
                   { label: "API Provider", val: "Google Generative AI" }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-300 font-mono">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Security Subsystem */}
           <div className="md:col-span-2 p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Shield className="w-32 h-32 text-red-500" />
              </div>
              <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4">
                 <Lock className="w-5 h-5 text-slate-500" />
                 <h3 className="font-black italic uppercase text-sm tracking-widest text-white">Security Protocols</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                 <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-[8px] font-black text-slate-600 uppercase mb-2 tracking-widest">Environment Encryption</p>
                    <p className="text-xs font-bold text-green-500 uppercase">AES-256 ACTIVE</p>
                 </div>
                 <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-[8px] font-black text-slate-600 uppercase mb-2 tracking-widest">Access Control</p>
                    <p className="text-xs font-bold text-green-500 uppercase">ROLE-BASED ACTIVE</p>
                 </div>
                 <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <p className="text-[8px] font-black text-slate-600 uppercase mb-2 tracking-widest">SSL Status</p>
                    <p className="text-xs font-bold text-green-500 uppercase">CERTIFIED</p>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
