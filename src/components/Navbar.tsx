"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on some pages if needed, but for now we'll show it everywhere
  
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-brand-electric font-black text-xl">A</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">
              GYM<span className="text-brand-electric">BUDDY</span>
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link 
                href="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-brand-electric' : 'text-gray-500 hover:text-black'} transition-colors`}
              >
                Dashboard
              </Link>
              <Link 
                href="/debug-auth" 
                className={`${isActive('/debug-auth') ? 'text-brand-electric' : 'text-gray-500 hover:text-black'} transition-colors`}
              >
                Auth Debug
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.displayName}</p>
                <p className="text-[10px] text-gray-400 leading-none mt-1 uppercase tracking-widest font-mono">Athlete</p>
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/debug-auth"
              className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition-all hover:bg-brand-electric"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
