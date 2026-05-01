import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Background Accents */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-electric/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-electric/5 rounded-full blur-3xl -z-10 animate-pulse transition-all duration-1000"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block animate-in fade-in slide-in-from-top-4 duration-1000">
             <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase">
               Next Gen Fitness Tracking
             </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            TRAIN SMARTER.<br />
            POWERED BY <span className="text-brand-electric italic">AI.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-gray-500 text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Log your workouts, track your progress, and get real-time 
            performance insights from Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link 
              href="/debug-auth"
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-electric transition-all shadow-xl shadow-black/10 hover:shadow-brand-electric/20"
            >
              Get Started Free
            </Link>
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto border-2 border-gray-100 bg-white px-8 py-4 rounded-xl font-bold text-lg hover:border-black transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-tech bg-white p-8 space-y-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-brand-electric text-xl font-bold">01</div>
              <h3 className="text-xl font-bold italic">Precision Logging</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Log every set, rep, and kilogram with a frictionless interface designed for the gym floor.
              </p>
            </div>
            
            <div className="card-tech bg-white p-8 space-y-4 border-brand-electric/20 shadow-lg shadow-brand-electric/5">
              <div className="w-12 h-12 bg-brand-electric rounded-lg flex items-center justify-center text-white text-xl font-bold italic">AI</div>
              <h3 className="text-xl font-bold italic">Gemini Coaching</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive data-driven feedback on your training volume and intensity after every session.
              </p>
            </div>

            <div className="card-tech bg-white p-8 space-y-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-brand-electric text-xl font-bold">03</div>
              <h3 className="text-xl font-bold italic">Cloud Sync</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your progress is securely backed up to Firebase, accessible anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Build with Performance Tech &copy; 2026
        </p>
      </footer>
    </div>
  );
}
