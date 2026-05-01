"use client";

import { useAuth } from "@/hooks/useAuth";

export default function DebugAuthPage() {
  const { user, loading, error, signIn, signOut } = useAuth();

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold border-b-2 border-brand-electric pb-2">
          Auth Debugger
        </h1>

        <section className="card-tech space-y-4">
          <h2 className="text-xl font-semibold text-brand-electric">Status</h2>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Connection:</span>
            {loading ? (
              <span className="text-yellow-500 animate-pulse">Checking...</span>
            ) : (
              <span className="text-green-500">Ready</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium">User State:</span>
            {user ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                AUTHENTICATED
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                ANONYMOUS
              </span>
            )}
          </div>
        </section>

        {user && (
          <section className="card-tech space-y-4">
            <h2 className="text-xl font-semibold text-brand-electric">User Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono bg-black/5 p-4 rounded-lg overflow-auto">
              <div>
                <p className="text-gray-500">UID</p>
                <p className="truncate">{user.uid}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Display Name</p>
                <p>{user.displayName || "N/A"}</p>
              </div>
            </div>
          </section>
        )}

        {error && (
          <section className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700 font-bold">Error</p>
            <p className="text-red-600 text-sm">{error.message}</p>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {!user ? (
            <button
              onClick={signIn}
              disabled={loading}
              className="bg-brand-electric text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In with Google
            </button>
          ) : (
            <button
              onClick={signOut}
              disabled={loading}
              className="border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg font-bold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign Out
            </button>
          )}
        </div>

        <footer className="text-xs text-gray-400 pt-8 border-t border-gray-100">
          Note: Ensure you have enabled Google Auth in your Firebase Console and added 
          localhost:3000 to your authorized domains.
        </footer>
      </main>
    </div>
  );
}
