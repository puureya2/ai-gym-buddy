"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Dumbbell, 
  Library, 
  BarChart3, 
  User,
  ShieldCheck
} from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "COMMS", icon: MessageSquare, href: "/dashboard" },
    { label: "MISSIONS", icon: Dumbbell, href: "/workout" },
    { label: "LIBRARY", icon: Library, href: "/routines" },
    { label: "LAB", icon: BarChart3, href: "/analytics" },
    { label: "PROFILE", icon: User, href: "/profile" },
  ];

  if (!user) return null;

  return (
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

        <button 
          onClick={signOut}
          className="ml-4 px-4 py-2 text-[10px] font-black italic uppercase text-slate-400 hover:text-red-500 transition-colors"
        >
          Abort
        </button>
      </div>
    </nav>
  );
}
