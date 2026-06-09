"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (loading) return;

      // Skip check for the login page itself to avoid infinite redirect
      if (pathname === "/admin/login") {
        setIsVerifying(false);
        return;
      }

      if (!user) {
        router.push("/admin/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          router.push("/dashboard");
          return;
        }
        setIsVerifying(false);
      } catch (error) {
        console.error("Admin verification error:", error);
        router.push("/dashboard");
      }
    }

    checkAdmin();
  }, [user, loading, router, pathname]);

  if (loading || (isVerifying && pathname !== "/admin/login")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black italic uppercase text-brand-chrome animate-pulse tracking-widest">
        Verifying Security Clearance...
      </div>
    );
  }

  return (
    <>
      {pathname !== "/admin/login" && <AdminNavbar />}
      {children}
    </>
  );
}
