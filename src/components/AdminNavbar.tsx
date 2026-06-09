"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShieldAlert,
  ArrowLeftRight,
  LogOut
} from "lucide-react";

export default function AdminNavbar() {
  const { signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "COMMAND", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "ATHLETES", icon: Users, href: "/admin/athletes" },
    { label: "SYSTEM", icon: Settings, href: "/admin/system" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[70] p-4">
      <div className="max-w-5xl mx-auto bg-slate-900 border border-red-500/20 rounded-3xl p-2 flex items-center justify-between shadow-[0_0_50px_rgba(255,0,0,0.1)] backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 mr-4 border-r border-slate-800">
           <ShieldAlert className="w-5 h-5 text-red-500" />
           <span className="font-black italic text-xs tracking-widest text-white hidden md:block">ADMIN.OS</span>
        </div>
        
        <div className="flex-1 flex gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-2 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.3)] scale-105" 
                    : "text-slate-500 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-black italic uppercase tracking-widest">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard"
            className="px-4 py-2 text-[10px] font-black italic uppercase text-slate-500 hover:text-brand-electric flex items-center gap-2 transition-colors border-l border-slate-800 ml-4"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden md:block">Athlete View</span>
          </Link>
          <button 
            onClick={signOut}
            className="px-4 py-2 text-[10px] font-black italic uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
          >
            Terminal.End
          </button>
        </div>
      </div>
    </nav>
  );
}
