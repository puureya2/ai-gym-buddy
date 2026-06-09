"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, User, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await authService.signInAdmin(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="card-premium w-full max-w-md p-10 bg-slate-900 border-red-500/20 space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.1)]">
        
        {/* Visual Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <ShieldAlert className="w-24 h-24 text-red-500" />
        </div>

        <div className="space-y-3 relative z-10">
           <div className="inline-flex p-3 bg-red-500/10 rounded-2xl mb-2 border border-red-500/20">
              <Lock className="w-6 h-6 text-red-500" />
           </div>
           <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Central Admin</h1>
           <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Subsystem: Security Clearance</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Designation</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-red-500/50 transition-all"
                     placeholder="admin@mission.control"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="password" 
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-red-500/50 transition-all"
                     placeholder="••••••••"
                   />
                </div>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-shake">
               {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 bg-white text-slate-950 font-black italic uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : <>Initiate Access <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-[8px] font-mono text-slate-600 uppercase tracking-widest relative z-10">
           Warning: Unauthorized access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
}
