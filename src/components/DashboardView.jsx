import React, { useState, useEffect, useRef } from 'react';
import AeroMap from './AeroMap';

function DashboardView() {
  const [pinCode, setPinCode] = useState('110001');
  const [region, setRegion] = useState('New Delhi, DL');
  
  // Camera state management
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraState, setCameraState] = useState('inactive'); // 'inactive' | 'linking' | 'active'

  // Image Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const canvasRef = useRef(null);

  // Dynamic canvas mock photo generator (Skyline HUD builder)
  const generateMockPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Draw Slate background
    ctx.fillStyle = '#0b1326';
    ctx.fillRect(0, 0, 640, 480);
    
    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(133, 148, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    
    // Draw futuristic skyline silhouettes in dark colors
    ctx.fillStyle = '#090f1e';
    ctx.fillRect(40, 240, 80, 240);
    ctx.fillRect(160, 180, 100, 300);
    ctx.fillRect(300, 280, 120, 200);
    ctx.fillRect(460, 200, 140, 280);
    
    ctx.fillStyle = '#060a14';
    ctx.fillRect(100, 320, 90, 160);
    ctx.fillRect(240, 290, 110, 190);
    ctx.fillRect(400, 340, 80, 140);
    
    // Draw smog overlay (subtle linear gradients representing atmospheric pollution)
    const smogGrad = ctx.createLinearGradient(0, 0, 0, 480);
    smogGrad.addColorStop(0, 'rgba(255, 198, 64, 0.15)'); // Amber haze at the top
    smogGrad.addColorStop(0.5, 'rgba(255, 180, 171, 0.1)'); // Crimson haze
    smogGrad.addColorStop(1, 'rgba(11, 19, 38, 0)');
    ctx.fillStyle = smogGrad;
    ctx.fillRect(0, 0, 640, 480);
    
    // Add technical HUD metrics overlay
    ctx.fillStyle = 'rgba(90, 240, 179, 0.7)'; // Emerald Green
    ctx.font = 'bold 12px monospace';
    ctx.fillText('AEROSIGHT TELEMETRY FRAME - RAW', 20, 30);
    
    ctx.fillStyle = 'rgba(218, 226, 253, 0.5)';
    ctx.font = '10px monospace';
    ctx.fillText(`GEO_LOC: [28.6139 N, 77.2090 E]`, 20, 50);
    ctx.fillText(`TIMESTAMP: ${new Date().toISOString()}`, 20, 65);
    ctx.fillText(`REGION: ${region}`, 20, 80);
    
    // Target Reticle
    ctx.strokeStyle = '#5af0b3';
    ctx.lineWidth = 1.5;
    // Top-left corner of reticle
    ctx.beginPath();
    ctx.moveTo(300, 220); ctx.lineTo(300, 200); ctx.lineTo(320, 200);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(340, 200); ctx.lineTo(360, 200); ctx.lineTo(360, 220);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(300, 260); ctx.lineTo(300, 280); ctx.lineTo(320, 280);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(340, 280); ctx.lineTo(360, 280); ctx.lineTo(360, 260);
    ctx.stroke();
    
    // Dot in center
    ctx.fillStyle = '#ffc640';
    ctx.beginPath();
    ctx.arc(330, 240, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    return canvas.toDataURL('image/png');
  };

  // Trigger CV Particulate Heatmap processing when capturedImage updates
  useEffect(() => {
    if (!capturedImage) {
      setIsProcessing(false);
      setProcessingProgress(0);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Small deferral to ensure canvas element is mounted and rendered inside state
          setTimeout(() => {
            drawHeatmap();
          }, 50);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [capturedImage]);

  // Dynamic canvas particulate overlay renderer
  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      // Set dimensions
      canvas.width = 640;
      canvas.height = 480;
      
      // 1. Draw raw city skyline frame
      ctx.drawImage(img, 0, 0, 640, 480);
      
      // 2. Overlay heatmap blending layers
      ctx.save();
      ctx.globalAlpha = 0.5;
      
      // Orange toxic plume center
      const grad1 = ctx.createRadialGradient(
        320, 240, 20,
        320, 240, 250
      );
      grad1.addColorStop(0, 'rgba(255, 198, 64, 0.9)'); // Amber
      grad1.addColorStop(0.5, 'rgba(255, 166, 104, 0.5)'); // Orange
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(320, 240, 250, 0, 2 * Math.PI);
      ctx.fill();

      // Red critical plume center
      const grad2 = ctx.createRadialGradient(
        180, 200, 10,
        180, 200, 120
      );
      grad2.addColorStop(0, 'rgba(255, 180, 171, 0.9)'); // Red/Crimson
      grad2.addColorStop(0.6, 'rgba(147, 0, 10, 0.4)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(180, 200, 120, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();

      // 3. Draw neon bounding analytical HUD grids
      ctx.strokeStyle = '#ffa668'; // Orange outline
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 120, 200, 150);
      
      ctx.fillStyle = 'rgba(255, 166, 104, 0.85)';
      ctx.font = 'bold 12px monospace';
      ctx.fillRect(100, 95, 140, 25);
      ctx.fillStyle = '#0b1326';
      ctx.fillText('ANALYTICS: 182 AQI', 108, 112);

      // Nominals box
      ctx.strokeStyle = '#5af0b3'; // Emerald outline
      ctx.strokeRect(420, 160, 150, 180);
      
      ctx.fillStyle = 'rgba(90, 240, 179, 0.85)';
      ctx.fillRect(420, 135, 100, 25);
      ctx.fillStyle = '#0b1326';
      ctx.fillText('ZONE NOMINAL', 428, 152);

      // Target laser watermark
      ctx.fillStyle = 'rgba(90, 240, 179, 0.7)';
      ctx.fillText('NEURAL MAPPING - COMPLETE (USEPA v4)', 20, 440);
    };
  };

  const handleLaunchCamera = () => {
    setCameraState('linking');
    setTimeout(() => {
      setCameraState('active');
    }, 1500);
  };

  const handleCapturePhoto = () => {
    const dataUrl = generateMockPhoto();
    setCapturedImage(dataUrl);
    setCameraState('inactive');
  };

  const handleResetCamera = () => {
    setCapturedImage(null);
    setCameraState('inactive');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

            {cameraState === 'inactive' && !capturedImage && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleLaunchCamera}
                  className="flex-grow bg-primary text-on-primary py-4 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform glow-emerald hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                  Launch Camera
                </button>
                <label className="flex-grow bg-surface-container-high border border-outline-variant/30 text-on-surface-variant py-4 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-surface-variant cursor-pointer text-center select-none">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                  Upload File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}

            {cameraState === 'linking' && (
              <div className="w-full bg-surface-container py-4 rounded-lg font-bold flex items-center justify-center gap-2 border border-outline-variant/30 text-primary">
                <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                Linking Telemetry...
              </div>
            )}

            {cameraState === 'active' && (
              <div className="space-y-4">
                {/* Simulated Camera Viewfinder */}
                <div className="relative rounded-lg overflow-hidden h-40 border border-primary/30 bg-surface-container-lowest/50 flex flex-col justify-center items-center">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:12px_12px]"></div>
                  
                  {/* Panning line reticle */}
                  <div className="absolute top-[20%] w-[80%] h-[1px] bg-primary/20 border-dashed border-b animate-pulse"></div>
                  <div className="absolute top-[80%] w-[80%] h-[1px] bg-primary/20 border-dashed border-b animate-pulse"></div>
                  <div className="absolute left-[20%] h-[80%] w-[1px] bg-primary/20 border-dashed border-r"></div>
                  <div className="absolute left-[80%] h-[80%] w-[1px] bg-primary/20 border-dashed border-r"></div>

                  <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
                  <span className="font-mono text-[9px] text-primary/60 mt-1 uppercase tracking-widest animate-pulse">Live Viewfinder Active</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCapturePhoto}
                    className="flex-1 bg-secondary text-on-secondary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-secondary-container"
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                    Click a photo
                  </button>
                  <button 
                    onClick={() => setCameraState('inactive')}
                    className="px-4 bg-surface-container-high text-on-surface-variant py-3 rounded-lg font-semibold active:scale-95 transition-transform hover:bg-surface-variant"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div className="flex-1">
                    <p className="font-mono text-[9px] text-primary font-bold uppercase tracking-wider">Telemetry Sample Secured</p>
                    <p className="text-[10px] text-on-surface-variant font-mono">Format: base64 Image Data Link</p>
                  </div>
                </div>

                <button 
                  onClick={handleResetCamera}
                  className="w-full bg-surface-container-high text-on-surface-variant py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-xl">restart_alt</span>
                  Retake Photo / Clear Feed
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20">
              <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-sans text-[11px] leading-tight text-primary/90">
                Real-time visual data capture or verified system telemetry file uploads are fully supported.
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
        
        {capturedImage === null ? (
          /* Placeholder State: Before Photo is Clicked */
          <div className="glass-panel rounded-xl p-8 flex flex-col justify-center items-center h-48 border border-outline-variant/20 relative select-none overflow-hidden bg-surface-container-low/20">
            {/* Grid lines background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            {/* Pulsing warning radar line */}
            <div className="absolute w-full h-[1px] bg-primary/10 top-1/2 left-0 animate-scanline"></div>
            
            <div className="z-10 text-center space-y-2">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl opacity-60 animate-pulse">sensors_off</span>
              <p className="font-mono text-xs text-on-surface-variant tracking-wider uppercase font-bold">Awaiting live camera capture telemetry...</p>
              <p className="text-[10px] text-on-surface-variant/60 max-w-sm">Please launch the optical telemetry system above and capture an atmospheric sample photo to engage particulate analysis pipelines.</p>
            </div>
          </div>
        ) : (
          /* Split View State: After Photo is Clicked */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Frame: Raw captured image */}
            <div className="relative rounded-xl overflow-hidden glass-panel h-48 border border-primary/20 flex flex-col justify-center items-center bg-surface-container-lowest/30">
              <img src={capturedImage} alt="Raw Captured Frame" className="w-full h-full object-cover opacity-90" />
              <div className="absolute top-2 left-2 flex items-center gap-2 bg-background/80 px-2 py-1 rounded border border-outline-variant/30 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-mono text-[8px] font-bold uppercase text-on-surface">RAW_CAMERA_CAPTURE</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-0.5 rounded border border-outline-variant/20 z-20">
                <span className="font-mono text-[7px] text-on-surface-variant uppercase font-bold">SAMPLE_SECURED</span>
              </div>
            </div>

            {/* Right Frame: Processing Canvas area */}
            <div className="relative rounded-xl overflow-hidden glass-panel h-48 border border-secondary/20 bg-surface-container-lowest/30 flex flex-col justify-center items-center">
              
              {isProcessing ? (
                /* Processing State with progress bar */
                <div className="z-10 text-center space-y-3 p-4 w-full max-w-xs select-none">
                  <span className="material-symbols-outlined text-secondary text-2xl animate-spin">sync</span>
                  <p className="font-mono text-[10px] text-secondary tracking-widest block uppercase font-bold">Neural Engine Analysis...</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden border border-outline-variant/20 relative">
                    <div className="bg-gradient-to-r from-secondary to-primary h-full transition-all duration-150" style={{ width: `${processingProgress}%` }}></div>
                  </div>
                  <span className="font-mono text-[10px] text-secondary font-bold">{processingProgress}% Complete</span>
                </div>
              ) : (
                /* Complete State: Real Canvas rendering */
                <>
                  {/* The actual Canvas */}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover"></canvas>
                  
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-secondary/90 px-2 py-1 rounded border border-on-secondary/30 z-20">
                    <span className="font-mono text-[8px] uppercase text-on-secondary font-bold">Neural_Map_Active</span>
                  </div>
                  <div className="absolute bottom-2 right-2 z-20 bg-background/80 px-2 py-0.5 rounded border border-outline-variant/20">
                    <span className="font-mono text-[8px] text-primary font-bold">SCAN COMPLETE</span>
                  </div>
                </>
              )}

            </div>

          </div>
        )}
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
