import React, { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView';
import SystemOverview from './components/SystemOverview';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
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
    <div className="bg-background text-on-background min-h-screen pb-24 font-sans selection:bg-primary/30 selection:text-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
          <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">AeroSight AI</h1>
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
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'overview' && <SystemOverview />}
        {currentTab === 'map' && (
          <div className="max-w-container-max mx-auto px-6 py-6 space-y-6">
            <h2 className="font-mono text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4">Dedicated Network Map</h2>
            <div className="glass-panel rounded-2xl overflow-hidden h-[500px] border border-outline-variant/30 relative">
              <div className="absolute inset-0 bg-[#0b1326] flex flex-col justify-center items-center">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#3c4a42 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Visualizing Active Nodes */}
                <div className="absolute top-[25%] left-[20%]">
                  <div className="w-5 h-5 bg-primary rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-5 h-5 bg-primary rounded-full relative border-2 border-[#0b1326] shadow-lg flex items-center justify-center text-[8px] font-mono text-black">A</div>
                </div>
                <div className="absolute top-[45%] left-[55%]">
                  <div className="w-5 h-5 bg-secondary rounded-full animate-pulse absolute opacity-75"></div>
                  <div className="w-5 h-5 bg-secondary rounded-full relative border-2 border-[#0b1326] shadow-lg flex items-center justify-center text-[8px] font-mono text-black">B</div>
                </div>
                <div className="absolute top-[70%] left-[35%]">
                  <div className="w-5 h-5 bg-error rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-5 h-5 bg-error rounded-full relative border-2 border-[#0b1326] shadow-lg flex items-center justify-center text-[8px] font-mono text-black">C</div>
                </div>
                <div className="absolute top-[30%] right-[15%]">
                  <div className="w-4 h-4 bg-primary rounded-full relative border border-white shadow-lg"></div>
                </div>
                <div className="absolute bottom-[20%] right-[30%]">
                  <div className="w-4 h-4 bg-primary rounded-full relative border border-white shadow-lg animate-pulse"></div>
                </div>

                <div className="z-10 text-center space-y-2 pointer-events-none px-4">
                  <p className="font-mono text-sm text-primary tracking-widest uppercase">Global Core Grid</p>
                  <p className="text-on-surface-variant text-xs max-w-md">1,248 telemetry sensors reporting optical particulate drift measurements. 12 operational regional nodes.</p>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-xl border border-outline-variant/40 flex justify-between items-center gap-4">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase">SYSTEM LEVEL</span>
                  <div className="flex-1 h-3 rounded bg-gradient-to-r from-primary via-secondary to-error relative">
                    <span className="absolute -top-4 left-0 font-mono text-[8px] text-primary">GOOD (0-50)</span>
                    <span className="absolute -top-4 right-0 font-mono text-[8px] text-error">CRITICAL (300+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentTab === 'alerts' && (
          <div className="max-w-container-max mx-auto px-6 py-6 space-y-6">
            <h2 className="font-mono text-xs font-bold text-primary uppercase tracking-[0.3em] mb-4">Critical Alerts & Logs</h2>
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-xl border-l-4 border-error space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <h3 className="font-semibold text-on-surface">Node-74 (Mumbai): Signal Degradation</h3>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">T -02:14:05</span>
                </div>
                <p className="text-sm text-on-surface-variant font-sans">
                  Optical telemetry receiver reporting 42% packet drop rate. Smog sensor occlusion detected. Triggering automated lens clearing cycle in epoch 944.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-xl border-l-4 border-secondary space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                    <h3 className="font-semibold text-on-surface">Network Sync: 89% Replicated</h3>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">T -00:05:44</span>
                </div>
                <p className="text-sm text-on-surface-variant font-sans">
                  Central registry syncing distributed database hashes. Sync backlog processing: 142/500 items. Nominal processing speed verified.
                </p>
              </div>

              <div className="glass-panel p-5 rounded-xl border-l-4 border-primary space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <h3 className="font-semibold text-on-surface">Node-112: Core Kernel Update Complete</h3>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">T -00:12:00</span>
                </div>
                <p className="text-sm text-on-surface-variant font-sans">
                  Node successfully updated to v2.4.1. Patch successfully deployed. Real-time visual data feed stabilized at 60fps.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-4 pb-2 bg-surface-container-lowest/85 backdrop-blur-md border-t border-outline-variant/30 z-50 rounded-t-2xl">
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentTab === 'dashboard' ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(90,240,179,0.3)]' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          <span className="font-mono text-[8px] uppercase tracking-wider mt-1">Dashboard</span>
        </button>

        <button 
          onClick={() => setCurrentTab('overview')} 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentTab === 'overview' ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(90,240,179,0.3)]' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentTab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}>visibility</span>
          <span className="font-mono text-[8px] uppercase tracking-wider mt-1">Vision</span>
        </button>

        <button 
          onClick={() => setCurrentTab('map')} 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentTab === 'map' ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(90,240,179,0.3)]' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentTab === 'map' ? "'FILL' 1" : "'FILL' 0" }}>map</span>
          <span className="font-mono text-[8px] uppercase tracking-wider mt-1">Map</span>
        </button>

        <button 
          onClick={() => setCurrentTab('alerts')} 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${currentTab === 'alerts' ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(90,240,179,0.3)]' : 'text-on-surface-variant hover:text-primary/70'}`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: currentTab === 'alerts' ? "'FILL' 1" : "'FILL' 0" }}>notifications_active</span>
          <span className="font-mono text-[8px] uppercase tracking-wider mt-1">Alerts</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
