import React, { useState } from 'react';
import AeroMap from './AeroMap';

function DashboardView() {
  const [pinCode, setPinCode] = useState('110001');
  const [region, setRegion] = useState('New Delhi, DL');
  const [isLinkingCamera, setIsLinkingCamera] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  // Pin Code auto-resolve mock
  const handlePinChange = (e) => {
    const val = e.target.value;
    setPinCode(val);
    if (val === '110001') {
      setRegion('New Delhi, DL');
    } else if (val.length === 6) {
      // Mock other districts
      const firstDigit = val[0];
      if (firstDigit === '4') setRegion('Mumbai, MH');
      else if (firstDigit === '5') setRegion('Hyderabad, TS');
      else if (firstDigit === '6') setRegion('Bangalore, KA');
      else if (firstDigit === '7') setRegion('Kolkata, WB');
      else setRegion('Remote Cluster Node');
    }
  };

  const handleCameraClick = () => {
    setIsLinkingCamera(true);
    setTimeout(() => {
      setIsLinkingCamera(false);
      setIsLinked(true);
      setTimeout(() => setIsLinked(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile space-y-gutter py-6">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        
        {/* Card 1: Live Air Sampling & Location */}
        <div className="space-y-4">
          
          <div className="glass-panel rounded-xl p-5 space-y-4 overflow-hidden relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-label-caps text-on-surface-variant mb-1 uppercase tracking-tighter">Live Air Sampling</p>
                <h2 className="font-headline text-2xl text-on-surface font-semibold tracking-tighter">Optical Telemetry</h2>
              </div>
              <span className="material-symbols-outlined text-primary opacity-50 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            </div>

            <button 
              onClick={handleCameraClick}
              disabled={isLinkingCamera}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform glow-emerald hover:bg-primary-container"
            >
              {isLinkingCamera ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                  Linking Telemetry...
                </>
              ) : isLinked ? (
                <>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                  Camera Link Secured
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                  Launch System Camera
                </>
              )}
            </button>

            <div className="flex items-start gap-2 bg-error-container/20 p-3 rounded-lg border border-error/20">
              <span className="material-symbols-outlined text-error text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <p className="font-sans text-[11px] leading-tight text-error/90">
                File uploads restricted. Real-time visual data capture only to prevent telemetry drift.
              </p>
            </div>
          </div>

          {/* Location Context */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-lg p-3">
              <label className="font-mono text-label-caps text-on-surface-variant mb-2 block uppercase">PIN Code</label>
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-mono text-data-sm text-primary focus:border-primary outline-none transition-colors" 
                placeholder="Enter PIN" 
                type="text" 
                value={pinCode}
                onChange={handlePinChange}
              />
            </div>
            <div className="glass-panel rounded-lg p-3">
              <label className="font-mono text-label-caps text-on-surface-variant mb-2 block uppercase">Region/District</label>
              <div className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded px-2 py-1 font-mono text-data-sm text-on-surface-variant/80 select-none">
                {region}
              </div>
            </div>
          </div>

        </div>

        {/* Card 2: Neural Network Inference & Weather */}
        <div className="glass-panel rounded-xl p-5 flex flex-col items-center">
          <p className="font-mono text-label-caps text-on-surface-variant self-start mb-4 uppercase">Neural Network Inference</p>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Custom circular progress using Tailwind border gradients and shadows */}
            <div className="w-full h-full rounded-full flex items-center justify-center border-8 border-surface-container glow-orange relative"
                 style={{
                   background: 'radial-gradient(closest-side, #0b1326 79%, transparent 80% 100%)',
                   borderColor: '#171f33'
                 }}>
              
              {/* Colored conic indicator */}
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-secondary border-r-secondary opacity-80 rotate-45"></div>

              <div className="flex flex-col items-center z-10">
                <span className="font-headline text-[44px] font-bold text-secondary leading-none">142</span>
                <span className="font-mono text-[9px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Poor AQI</span>
              </div>
            </div>

            {/* Micro-Sparkline Decorative Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path className="text-secondary" d="M 10 50 Q 25 40, 40 60 T 70 30 T 90 50" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>

          {/* Weather Grid */}
          <div className="grid grid-cols-2 w-full gap-4 mt-6">
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>device_thermostat</span>
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant uppercase">Temp</p>
                <p className="font-mono text-base font-semibold text-on-surface">32°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>humidity_percentage</span>
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant uppercase">Humidity</p>
                <p className="font-mono text-base font-semibold text-on-surface">45%</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Computer Vision Section */}
      <section className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-[0.3em]">Computer Vision Feed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Raw Feed */}
          <div className="relative rounded-xl overflow-hidden glass-panel h-48 border border-primary/20">
            {/* Visual fallback gradient block representing raw visual sky smog */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#131b2e] via-[#242e47] to-[#0f192b] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              {/* Skyline silhouette mockup */}
              <div className="w-full h-1/2 bg-[#090f1e] absolute bottom-0 opacity-80 flex flex-col justify-end">
                <div className="h-12 w-8 bg-[#0b1429] ml-6 border-t border-r border-[#1e2a47]"></div>
                <div className="h-20 w-12 bg-[#0d1830] ml-16 border-t border-x border-[#1e2a47] absolute bottom-0"></div>
                <div className="h-16 w-10 bg-[#0c162c] ml-32 border-t border-x border-[#1e2a47] absolute bottom-0"></div>
                <div className="h-24 w-16 bg-[#0a1124] mr-8 absolute right-0 bottom-0 border-t border-l border-[#1e2a47]"></div>
              </div>
              <div className="z-10 text-center">
                <span className="font-mono text-[10px] text-on-surface-variant/70 tracking-widest block uppercase">Raw Camera Frame</span>
                <span className="font-mono text-xs text-primary font-bold">New Delhi Skyline Smog Index</span>
              </div>
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-background/80 px-2 py-1 rounded border border-outline-variant/30 z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
              <span className="font-mono text-[8px] font-bold uppercase text-on-surface">RAW_VIDEO_INPUT</span>
            </div>
          </div>

          {/* Processed Heatmap */}
          <div className="relative rounded-xl overflow-hidden glass-panel h-48 border border-secondary/20">
            {/* Heatmap processed visualization using overlapping glow blurs */}
            <div className="absolute inset-0 bg-[#090f1e] overflow-hidden flex flex-col justify-center items-center">
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-error/40 rounded-full blur-[40px] opacity-60 animate-pulse"></div>
              <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-[60px] opacity-40"></div>
              
              {/* Simulated computer vision analytics overlay */}
              <div className="absolute top-[40%] left-[20%] w-[120px] h-[60px] border border-error/50 rounded-sm flex flex-col justify-between p-1 bg-error/5">
                <span className="font-mono text-[7px] text-error font-bold leading-none">BUILDING_OC_42</span>
                <span className="font-mono text-[8px] text-error font-bold self-end bg-error/20 px-1 rounded">PM2.5: 180</span>
              </div>
              
              <div className="absolute top-[10%] right-[30%] w-[80px] h-[50px] border border-secondary/50 rounded-sm flex flex-col justify-between p-1 bg-secondary/5">
                <span className="font-mono text-[7px] text-secondary font-bold leading-none">PLUME_HIGH_08</span>
                <span className="font-mono text-[8px] text-secondary font-bold self-end bg-secondary/20 px-1 rounded">MODERATE</span>
              </div>

              <div className="z-10 text-center pointer-events-none">
                <span className="font-mono text-[10px] text-secondary tracking-widest block uppercase font-bold">Neural Inference Map</span>
                <span className="font-mono text-[10px] text-on-surface/80">Particulate Mapping Active</span>
              </div>
            </div>
            
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-secondary/90 px-2 py-1 rounded border border-on-secondary/30 z-20">
              <span className="font-mono text-[8px] uppercase text-on-secondary font-bold">Neural_Map_Active</span>
            </div>
            <div className="absolute bottom-2 right-2 z-20">
              <span className="font-mono text-[8px] text-on-surface/60">PM2.5 SCAN: COMPLETE</span>
            </div>
          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-mono text-xs font-bold text-primary uppercase tracking-[0.3em]">Network Topology</h3>
          <span className="text-primary font-mono text-[10px] bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">12 Active Nodes</span>
        </div>
        
        <AeroMap pinCode={pinCode} onRegionResolved={(resolvedRegion) => setRegion(resolvedRegion)} />
      </section>

    </div>
  );
}

export default DashboardView;
