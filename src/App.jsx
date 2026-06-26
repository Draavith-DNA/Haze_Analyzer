import { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView';
import LandingView from './components/LandingView';

function App() {
  const [isSyncing, setIsSyncing] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    // Check if session is stored in localStorage to persist logins
    const saved = localStorage.getItem('haze_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  const handleEnterDashboard = (userInfo) => {
    setIsConnecting(true);
    setLoadingProgress(0);

    // Simulate progress loading sequence
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    setTimeout(() => {
      localStorage.setItem('haze_user', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
      setIsConnecting(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('haze_user');
    setCurrentUser(null);
  };

  // Get user initials for profile avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return '';
    return currentUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-6 font-sans selection:bg-primary/30 selection:text-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
          <h1 className="font-headline text-xl font-bold tracking-tighter text-primary select-none">Haze Analyzer</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection status badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/30">
            <span className={`material-symbols-outlined text-primary text-[10px] ${isSyncing ? 'animate-pulse' : 'opacity-70'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              fiber_manual_record
            </span>
            <span className="font-mono text-[9px] font-bold text-primary tracking-widest uppercase">
              {currentUser ? (isSyncing ? 'Syncing Telemetry' : 'Telemetry Linked') : 'System Idle'}
            </span>
          </div>

          {/* User profile info & logout */}
          {currentUser && (
            <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
              <span className="hidden md:inline font-mono text-[10px] text-on-surface-variant uppercase font-semibold">
                Agent: <span className="text-on-surface font-bold">{currentUser.name.split(' ')[0]}</span>
              </span>
              {/* Profile Circle */}
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/35 flex items-center justify-center font-mono text-xs font-bold text-primary cursor-default relative group select-none">
                {getUserInitials()}
                {/* User email tool tip */}
                <div className="absolute right-0 top-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high border border-outline-variant/30 text-[10px] font-mono text-on-surface px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 shadow-xl">
                  {currentUser.email}
                </div>
              </div>
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                title="Disconnect Telemetry Session"
                className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error/25 hover:bg-error/5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className={currentUser ? "pt-20" : ""}>
        {isConnecting ? (
          /* Connecting Loading Screen */
          <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background px-6 relative select-none">
            {/* Radar background element */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-primary/5 animate-pulse" />
            <div className="absolute w-[240px] h-[240px] rounded-full border border-primary/10" />
            <div className="absolute w-full h-[1px] bg-primary/5 top-1/2 left-0 animate-scanline" />

            <div className="z-10 text-center space-y-6 max-w-sm w-full glass-panel p-8 rounded-xl border border-outline-variant/25">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest block">Establishing Safe Session</span>
                <h4 className="font-headline text-lg font-bold text-on-surface">Connecting to GIS Telemetry</h4>
              </div>
              
              {/* Connecting Progress Bar */}
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden border border-outline-variant/20 relative">
                <div className="bg-gradient-to-r from-primary to-primary-container h-full transition-all duration-100" style={{ width: `${loadingProgress}%` }} />
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant/75 font-semibold block">{loadingProgress}% Done</span>
            </div>
          </div>
        ) : currentUser ? (
          /* Prediction Dashboard */
          <DashboardView />
        ) : (
          /* Landing page */
          <LandingView onEnterDashboard={handleEnterDashboard} />
        )}
      </main>
    </div>
  );
}

export default App;
