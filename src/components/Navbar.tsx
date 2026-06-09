"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  MessageSquare, 
  Dumbbell, 
  History,
  Library, 
  BarChart3, 
  User,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data()?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    }
    checkRole();
  }, [user]);

  const navItems = [
    { label: "COMMS", icon: MessageSquare, href: "/dashboard" },
    { label: "MISSIONS", icon: Dumbbell, href: "/workout" },
    { label: "HISTORY", icon: History, href: "/history" },
    { label: "LIBRARY", icon: Library, href: "/routines" },
    { label: "LAB", icon: BarChart3, href: "/analytics" },
    { label: "PROFILE", icon: User, href: "/profile" },
  ];

  if (!user) return null;
  
  // Don't show standard navbar on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 md:top-0 md:bottom-auto">
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-2 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-1 px-4 mr-4 border-r border-slate-200">
             <ShieldCheck className="w-5 h-5 text-brand-electric" />
             <span className="font-black italic text-xs tracking-tighter hidden md:block">GYM BUDDY v3.0</span>
          </div>
          
          <div className="flex-1 flex justify-around md:justify-start md:gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col md:flex-row items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                    isActive 
                      ? "bg-slate-950 text-white shadow-lg scale-105" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black italic uppercase tracking-widest md:text-xs">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link 
                href="/admin/dashboard"
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase italic hover:bg-red-500 hover:text-white transition-all mr-2"
              >
                <LayoutDashboard className="w-4 h-4 inline-block mr-1" />
                Admin
              </Link>
            )}
            <button 
              onClick={signOut}
              className="px-4 py-2 text-[10px] font-black italic uppercase text-slate-400 hover:text-red-500 transition-colors"
            >
              Abort
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Admin Portal for Admins in User View */}
      {isAdmin && !pathname.startsWith('/admin') && (
        <Link 
          href="/admin/dashboard"
          className="fixed bottom-24 right-8 z-[60] h-14 w-14 bg-slate-900 border-2 border-red-500/50 rounded-2xl flex items-center justify-center text-red-500 shadow-2xl hover:scale-110 transition-transform group"
          title="Return to Command Center"
        >
           <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        </Link>
      )}
    </>
  );
}
