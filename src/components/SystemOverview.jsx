import { useState, useEffect, useRef } from 'react';

const logMessages = [
  "[04:22:30] NODE-44: Resuming high-frequency sampling",
  "[04:22:35] SECURITY: Integrity check passed - 100% valid",
  "[04:22:42] API: GET request from node-cluster-04 handled",
  "[04:22:48] NETWORK: Balancing ingress traffic across 12 zones",
  "[04:22:55] SENSOR: Mumbai air quality spike detected (PM2.5)",
  "[04:23:02] KERNEL: Garbage collection completed (44ms saved)",
  "[04:23:10] NODES: Sync protocol active on node-74",
  "[04:23:18] TELEMETRY: Optical laser lenses recalibrating",
  "[04:23:24] CORE: AI prediction weight threshold nominal"
];

function SystemOverview() {
  const [logs, setLogs] = useState([
    "[04:22:15] AUTH: Handshake protocol established (RSA-4096)",
    "[04:22:18] STREAM: Primary data pipe optimized (Zstd level 3)",
    "[04:22:20] KERNEL: Haze Analyzer Core loading neural weights...",
    "[04:22:25] BOOT: System initialized in 1.442ms"
  ]);

  const logIndexRef = useRef(0);
  const logContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextMsg = logMessages[logIndexRef.current];
      setLogs((prevLogs) => {
        const nextLogs = [...prevLogs, nextMsg];
        if (nextLogs.length > 8) {
          nextLogs.shift();
        }
        return nextLogs;
      });
      logIndexRef.current = (logIndexRef.current + 1) % logMessages.length;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-6">
      
      {/* Network Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        
        {/* Global Uptime */}
        <div className="glass p-5 rounded-xl emerald-glow border border-outline-variant/10">
          <p className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Global Uptime</p>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-[38px] md:text-[44px] font-bold text-primary leading-none">99.9</span>
            <span className="font-headline text-lg font-bold text-primary/60">%</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-[10px] text-primary font-bold">System Nominal</span>
          </div>
        </div>

        {/* Active Nodes */}
        <div className="glass p-5 rounded-xl border border-outline-variant/10">
          <p className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Active Nodes</p>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-[38px] md:text-[44px] font-bold text-on-surface leading-none">1,248</span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-[10px] text-on-surface-variant font-bold">+12 since last epoch</span>
          </div>
        </div>

        {/* Data Throughput */}
        <div className="glass p-5 rounded-xl border border-outline-variant/10">
          <p className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Data Throughput</p>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-[38px] md:text-[44px] font-bold text-on-surface leading-none">4.2</span>
            <span className="font-headline text-lg font-bold text-on-surface-variant">TB/day</span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-[10px] text-on-surface-variant font-bold">Peak: 5.1 TB (14:00 UTC)</span>
          </div>
        </div>

      </div>

      {/* Global Node Map & Alerts Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Global Node Distribution */}
        <div className="lg:col-span-8 glass rounded-xl relative overflow-hidden min-h-[350px] flex flex-col border border-outline-variant/10">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/30">
            <h2 className="font-mono text-label-caps text-on-surface tracking-widest uppercase">Global Node Distribution</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-mono text-[9px] text-on-surface-variant uppercase">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-mono text-[9px] text-on-surface-variant uppercase">Syncing</span>
              </div>
            </div>
          </div>
          
          <div className="flex-grow relative bg-surface-container-lowest/30 overflow-hidden flex items-center justify-center min-h-[250px]">
            {/* Styled world grid graphic outline map representation */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#5af0b3 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            {/* Center nodes indicator grid panel */}
            <div className="relative text-center pointer-events-none p-4 space-y-2 z-10">
              <span className="font-mono text-[11px] text-primary tracking-widest uppercase">Neural Grid Active</span>
              <p className="text-[11px] text-on-surface-variant/80 max-w-sm">Nodes running visual aerosol models globally. Sync frequency optimized at 60s bounds.</p>
            </div>

            {/* Glowing Map Coordinate Indicators */}
            <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-primary rounded-full emerald-glow animate-ping"></div>
            <div className="absolute top-[32%] left-[25%] w-2 h-2 bg-primary rounded-full"></div>
            
            <div className="absolute top-[50%] left-[45%] w-2 h-2 bg-primary rounded-full emerald-glow"></div>
            
            <div className="absolute top-[28%] right-[30%] w-3 h-3 bg-secondary rounded-full amber-glow"></div>
            
            <div className="absolute bottom-[40%] left-[60%] w-2 h-2 bg-primary rounded-full emerald-glow"></div>
          </div>
        </div>

        {/* Critical Alerts Sidebar Feed */}
        <div className="lg:col-span-4 glass rounded-xl flex flex-col border border-outline-variant/10 bg-surface-container/10">
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container/30">
            <h2 className="font-mono text-label-caps text-on-surface tracking-widest uppercase">Critical Event Feed</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-3 space-y-2.5 max-h-[300px] terminal-scroll">
            
            <div className="p-3 bg-error-container/10 border-l-2 border-error rounded flex gap-2.5">
              <span className="material-symbols-outlined text-error text-[18px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <p className="font-mono text-[11px] text-on-surface leading-tight font-bold">Node-74 (Mumbai): Signal Occlusion</p>
                <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-1">T -02:14:05</p>
              </div>
            </div>

            <div className="p-3 bg-surface-variant/20 border-l-2 border-primary rounded flex gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="font-mono text-[11px] text-on-surface leading-tight font-bold">Node-92 (Singapore): Calibrating</p>
                <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-1">T -00:45:12</p>
              </div>
            </div>

            <div className="p-3 bg-surface-variant/20 border-l-2 border-primary rounded flex gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] select-none" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div>
                <p className="font-mono text-[11px] text-on-surface leading-tight font-bold">Node-112: Patch Update Complete</p>
                <p className="text-[9px] text-on-surface-variant font-mono uppercase mt-1">T -00:12:00</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Latency, Packet Loss & Dev Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Neural Latency */}
        <div className="glass p-5 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex justify-between items-start">
            <p className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest">Neural Latency</p>
            <span className="font-mono text-xs font-bold text-primary">12.4ms</span>
          </div>
          
          {/* Animated sparkline Columns */}
          <div className="h-14 flex items-end gap-1 px-1">
            <div className="flex-grow h-[20%] bg-primary/20 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[45%] bg-primary/20 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[65%] bg-primary/40 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[85%] bg-primary/60 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[55%] bg-primary/40 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[35%] bg-primary/30 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[75%] bg-primary/50 rounded-t-sm transition-all duration-300"></div>
            <div className="flex-grow h-[95%] bg-primary emerald-glow rounded-t-sm transition-all duration-300"></div>
          </div>
        </div>

        {/* Packet Loss */}
        <div className="glass p-5 rounded-xl border border-outline-variant/10 space-y-4">
          <div className="flex justify-between items-start">
            <p className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest">Packet Loss</p>
            <span className="font-mono text-xs font-bold text-on-surface">0.002%</span>
          </div>
          
          <div className="h-14 flex items-end gap-1 px-1">
            <div className="flex-grow h-[10%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[8%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[15%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[10%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[35%] bg-secondary/40 rounded-t-sm animate-pulse"></div>
            <div className="flex-grow h-[10%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[12%] bg-on-surface-variant/20 rounded-t-sm"></div>
            <div className="flex-grow h-[8%] bg-on-surface-variant/20 rounded-t-sm"></div>
          </div>
        </div>

        {/* Interactive Shell Terminal */}
        <div className="glass rounded-xl overflow-hidden flex flex-col border border-outline-variant/10 bg-surface-container-low/20">
          <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-high/40 flex justify-between items-center">
            <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Kernel Output / Dev/Null</p>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          </div>
          
          <div 
            ref={logContainerRef}
            className="p-3 font-mono text-[10px] text-primary/80 overflow-y-auto max-h-[100px] lg:max-h-[140px] terminal-scroll space-y-1.5 select-none"
          >
            {logs.map((log, index) => (
              <div key={index} className="transition-all duration-500 animate-fadeIn">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default SystemOverview;
