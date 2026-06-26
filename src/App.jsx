import { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView';

function App() {
  const [isSyncing, setIsSyncing] = useState(true);

  // Periodic visual sync heartbeat mock
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing((prev) => !prev);
      setTimeout(() => {
        setIsSyncing((prev) => !prev);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen pb-6 font-sans selection:bg-primary/30 selection:text-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
          <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">Haze Analyzer</h1>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/30">
          <span className={`material-symbols-outlined text-primary text-[10px] ${isSyncing ? 'animate-pulse' : 'opacity-70'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            fiber_manual_record
          </span>
          <span className="font-mono text-[9px] font-bold text-primary tracking-widest uppercase">
            {isSyncing ? 'Syncing' : 'Connected'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20">
        <DashboardView />
      </main>
    </div>
  );
}

export default App;
