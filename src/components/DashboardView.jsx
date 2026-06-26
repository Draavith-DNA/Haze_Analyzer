import { useState, useEffect, useRef, useCallback } from 'react';
import AeroMap from './AeroMap';
import { loadTensorFlow, createPredictorModel, initializeModelWeights, predictAQI } from '../utils/AeroPredictor';

// Optimized 3-digit Pincode Prefix Map geocoding engine with weather parameters
const PINCODE_PREFIX_MAP = {
  "110": { district: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, temp: 32, humidity: 45 },
  "400": { district: "Mumbai", state: "Maharashtra", lat: 18.9220, lng: 72.8347, temp: 29, humidity: 78 },
  "560": { district: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, temp: 26, humidity: 55 },
  "700": { district: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, temp: 31, humidity: 82 },
  "500": { district: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, temp: 33, humidity: 40 },
  "600": { district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, temp: 30, humidity: 80 },
  "411": { district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, temp: 28, humidity: 50 },
  "380": { district: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, temp: 36, humidity: 35 },
  "302": { district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, temp: 35, humidity: 30 },
  "226": { district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, temp: 34, humidity: 42 },
  "800": { district: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, temp: 33, humidity: 55 },
  "190": { district: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, temp: 18, humidity: 60 },
  "682": { district: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, temp: 31, humidity: 75 },
  "781": { district: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, temp: 27, humidity: 85 }
};

function DashboardView() {
  const [pinCode, setPinCode] = useState('');
  const [district, setDistrict] = useState('Awaiting PIN...');
  const [state, setState] = useState('Awaiting PIN...');
  const [coordinates, setCoordinates] = useState(null);
  const [temperature, setTemperature] = useState(27);
  const [humidity, setHumidity] = useState(60);
  const [predictedAQI, setPredictedAQI] = useState(null);

  const tfInstanceRef = useRef(null);
  const mlModelRef = useRef(null);

  // Camera state management
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraState, setCameraState] = useState('inactive'); // 'inactive' | 'linking' | 'active'
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Image Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const canvasRef = useRef(null);
  const latestPinRef = useRef('');

  // Keep region in sync for canvas HUD telemetry and fallback references locally
  const region = (() => {
    if (!district || !state) return 'Awaiting Location...';
    if (district === 'Invalid PIN' || state === 'Invalid PIN') return 'Invalid Location';
    if (district === 'Awaiting PIN...' || state === 'Awaiting PIN...') return 'Awaiting Location...';
    if (district === 'Resolving...' || state === 'Resolving...') return 'Resolving...';
    return `${district}, ${state}`;
  })();

  // Initialize dynamic TensorFlow.js loader on mount
  useEffect(() => {
    const initTF = async () => {
      try {
        const tf = await loadTensorFlow();
        tfInstanceRef.current = tf;
        const model = createPredictorModel(tf);
        initializeModelWeights(tf, model);
        mlModelRef.current = model;
        console.log("TensorFlow.js dynamic ML Engine loaded and model initialized with pre-baked urban weights.");
      } catch (err) {
        console.error("Failed to load/initialize TensorFlow.js prediction model:", err);
      }
    };
    initTF();
  }, []);

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
    ctx.fillText('HAZE ANALYZER TELEMETRY FRAME - RAW', 20, 30);
    
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

  // Dynamic canvas particulate overlay renderer executing Dark Channel Prior (DCP) & tile-based CLAHE approximations
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      // 1. Set main canvas dimensions
      canvas.width = 640;
      canvas.height = 480;
      
      // Draw the original raw cityscape on the main canvas
      ctx.drawImage(img, 0, 0, 640, 480);
      
      // 2. Perform DCP & CLAHE on an offscreen downsampled 160x120 buffer to secure under 2ms runtimes
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 160;
      offscreenCanvas.height = 120;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCtx.drawImage(img, 0, 0, 160, 120);
      
      const imgData = offscreenCtx.getImageData(0, 0, 160, 120);
      const data = imgData.data;
      
      // Pass 1: Compute pixel-wise min channel & clear sky check arrays
      const minChannel = new Uint8Array(160 * 120);
      const isClearSky = new Uint8Array(160 * 120);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const idx = i / 4;
        
        minChannel[idx] = Math.min(r, g, b);
        
        // Sky mask filter: Clear sunny skies present highly positive (Blue - Red) difference and Blue > Green
        isClearSky[idx] = (b - r > 20 && b > g) ? 1 : 0;
      }
      
      // Pass 2: Calculate true physical Dark Channel Prior (DCP) using a local 15x15 pixel window slide
      const dcpMatrix = new Uint8Array(160 * 120);
      const wSize = 7; // Radius of 15x15 window
      
      for (let y = 0; y < 120; y++) {
        for (let x = 0; x < 160; x++) {
          let minNeighborhoodVal = 255;
          
          for (let dy = -wSize; dy <= wSize; dy++) {
            for (let dx = -wSize; dx <= wSize; dx++) {
              const nx = Math.min(159, Math.max(0, x + dx));
              const ny = Math.min(119, Math.max(0, y + dy));
              const val = minChannel[ny * 160 + nx];
              if (val < minNeighborhoodVal) {
                minNeighborhoodVal = val;
              }
            }
          }
          dcpMatrix[y * 160 + x] = minNeighborhoodVal;
        }
      }
      
      // Pass 3: Apply 8x8 Tile grid CLAHE adaptive contrast-limiting equalization
      const claheMatrix = new Uint8Array(160 * 120);
      const tileWidth = 20;
      const tileHeight = 15;
      const tilesX = 8;
      const tilesY = 8;
      
      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          const startX = tx * tileWidth;
          const startY = ty * tileHeight;
          
          let localMin = 255;
          let localMax = 0;
          
          for (let y = startY; y < startY + tileHeight; y++) {
            for (let x = startX; x < startX + tileWidth; x++) {
              const idx = y * 160 + x;
              const val = dcpMatrix[idx];
              if (val < localMin) localMin = val;
              if (val > localMax) localMax = val;
            }
          }
          
          const range = localMax - localMin;
          const clipLimit = 2.0;
          let scaleFactor = range > 0 ? 255 / range : 0;
          if (scaleFactor > clipLimit) scaleFactor = clipLimit;
          
          for (let y = startY; y < startY + tileHeight; y++) {
            for (let x = startX; x < startX + tileWidth; x++) {
              const idx = y * 160 + x;
              const val = dcpMatrix[idx];
              let equalized = Math.round(localMin + (val - localMin) * scaleFactor);
              claheMatrix[idx] = Math.min(255, Math.max(0, equalized));
            }
          }
        }
      }
      
      // Pass 4: Translate spatial metrics into Jet Colormap array layer
      const heatmapImgData = offscreenCtx.createImageData(160, 120);
      const hData = heatmapImgData.data;
      
      for (let i = 0; i < claheMatrix.length; i++) {
        let density = claheMatrix[i] / 255.0;
        if (isClearSky[i] === 1) density = 0.0;
        
        let r, g, b;
        
        if (density < 0.25) {
          const factor = density / 0.25;
          r = 0; g = Math.round(factor * 255); b = 255;
        } else if (density < 0.5) {
          const factor = (density - 0.25) / 0.25;
          r = 0; g = 255; b = Math.round(255 - factor * 255);
        } else if (density < 0.75) {
          const factor = (density - 0.5) / 0.25;
          r = Math.round(factor * 255); g = Math.round(255 - factor * 128); b = 0;
        } else {
          const factor = (density - 0.75) / 0.25;
          r = 255; g = Math.round(127 - factor * 127); b = Math.round(factor * 50);
        }
        
        const hIdx = i * 4;
        hData[hIdx] = r; hData[hIdx + 1] = g; hData[hIdx + 2] = b; hData[hIdx + 3] = 255;
      }
      
      offscreenCtx.putImageData(heatmapImgData, 0, 0);
      
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreenCanvas, 0, 0, 640, 480);
      ctx.restore();
      
      // ... (HUD UI logic remains) ...
      
      let sumDcp = 0;
      for (let i = 0; i < claheMatrix.length; i++) sumDcp += claheMatrix[i];
      const meanDcpVal = sumDcp / (claheMatrix.length * 255.0);

      const gray = new Uint8Array(160 * 120);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      }

      const lapEdges = new Float32Array(160 * 120);
      let lapSum = 0;
      for (let y = 1; y < 119; y++) {
        for (let x = 1; x < 159; x++) {
          const idx = y * 160 + x;
          const lapVal = gray[idx - 160] + gray[idx - 1] - 4 * gray[idx] + gray[idx + 1] + gray[idx + 160];
          lapEdges[idx] = lapVal;
          lapSum += lapVal;
        }
      }
      const lapMean = lapSum / (160 * 120);

      let varianceSum = 0;
      for (let i = 0; i < lapEdges.length; i++) {
        const diff = lapEdges[i] - lapMean;
        varianceSum += diff * diff;
      }
      const lapVariance = varianceSum / lapEdges.length;
      
      const normLaplacianVal = Math.max(0, Math.min(1, lapVariance / 500.0));

      if (tfInstanceRef.current && mlModelRef.current) {
        try {
          const predicted = predictAQI(tfInstanceRef.current, mlModelRef.current, meanDcpVal, normLaplacianVal, temperature, humidity);
          setPredictedAQI(predicted);
        } catch (err) {
          console.error("Failed to execute TensorFlow.js ML prediction:", err);
          const fallbackVal = Math.max(10, Math.min(480, Math.round((meanDcpVal * 250) + ((1 - normLaplacianVal) * 150) + (temperature * 1.5) + (humidity * 0.5))));
          setPredictedAQI(fallbackVal);
        }
      } else {
        const fallbackVal = Math.max(10, Math.min(480, Math.round((meanDcpVal * 250) + ((1 - normLaplacianVal) * 150) + (temperature * 1.5) + (humidity * 0.5))));
        setPredictedAQI(fallbackVal);
      }
    };
  }, [capturedImage, temperature, humidity]);

  // Re-run CV analysis and ML geocoding prediction when weather metrics update
  useEffect(() => {
    if (capturedImage && !isProcessing) {
      drawHeatmap();
    }
  }, [temperature, humidity, capturedImage, isProcessing, drawHeatmap]);

  // Trigger CV Particulate Heatmap processing when capturedImage updates
  useEffect(() => {
    if (!capturedImage) return;

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setTimeout(() => {
            drawHeatmap();
          }, 50);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [capturedImage, drawHeatmap]);

  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("Error stopping camera tracks:", err);
      }
      streamRef.current = null;
    }
    setCameraStreamActive(false);
  };

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Bind camera stream dynamically to video element when viewfinder mounts
  useEffect(() => {
    if (cameraState === 'active' && cameraStreamActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraState, cameraStreamActive]);

  const handleLaunchCamera = async () => {
    setCameraState('linking');
    setCameraError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser context");
      }

      // Race getUserMedia against a 3-second timeout to prevent indefinite hangs in headless testing
      const streamPromise = navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Camera access timed out")), 3000)
      );

      const stream = await Promise.race([streamPromise, timeoutPromise]);
      streamRef.current = stream;
      setCameraStreamActive(true);
      
      setTimeout(() => {
        setCameraState('active');
      }, 1000);
    } catch (err) {
      console.warn("Failed to request native device camera, using simulator mode fallback:", err);
      setCameraError(err.name === 'NotAllowedError' ? 'Permission Denied' : err.message || 'Insecure Context');
      setCameraStreamActive(false);
      
      setTimeout(() => {
        setCameraState('active');
      }, 1000);
    }
  };

  const handleCapturePhoto = () => {
    if (cameraStreamActive && streamRef.current && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      } catch (err) {
        console.error("Failed to capture frame from live video stream. Falling back to simulator mode:", err);
        const dataUrl = generateMockPhoto();
        setCapturedImage(dataUrl);
      }
    } else {
      const dataUrl = generateMockPhoto();
      setCapturedImage(dataUrl);
    }
    
    stopCamera();
    setCameraState('inactive');
    setIsProcessing(true);
    setProcessingProgress(0);
  };

  const handleCancelCamera = () => {
    stopCamera();
    setCameraState('inactive');
    setCameraError(null);
  };

  const handleResetCamera = () => {
    setCapturedImage(null);
    setCameraState('inactive');
    setIsProcessing(false);
    setProcessingProgress(0);
    setCameraError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setIsProcessing(true);
        setProcessingProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Offline-first live weather sync helper using WeatherAPI or OpenWeatherMap endpoints
  const fetchLiveWeather = useCallback(async (lat, lng, fallbackTemp, fallbackHumidity) => {
    const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
    if (!weatherApiKey) {
      console.warn("VITE_WEATHER_API_KEY is not defined. Falling back to local offline climate metrics.");
      setTemperature(fallbackTemp);
      setHumidity(fallbackHumidity);
      return;
    }

    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lng}`);
      if (!res.ok) throw new Error(`Weather API returned status: ${res.status}`);
      
      const data = await res.json();
      if (data && data.current) {
        setTemperature(Math.round(data.current.temp_c));
        setHumidity(Math.round(data.current.humidity));
        console.log(`Live weather synchronized successfully: ${data.current.temp_c}°C, ${data.current.humidity}% humidity.`);
      } else {
        throw new Error("Invalid payload format received from Weather API");
      }
    } catch (err) {
      console.warn("Weather API synchronization deferred due to connection/payload failure. Engaging local climate offline fallback:", err.message);
      setTemperature(fallbackTemp);
      setHumidity(fallbackHumidity);
    }
  }, []);

  // Fetch initial live weather conditions for geographical center of India on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveWeather(20.5937, 78.9629, 27, 60);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLiveWeather]);

  // Pin Code auto-resolve via local 3-digit prefix lookup engine
  const handlePinChange = async (e) => {
    const val = e.target.value;
    setPinCode(val);
    latestPinRef.current = val;

    if (val.length !== 6) {
      setDistrict('Awaiting PIN...');
      setState('Awaiting PIN...');
      setCoordinates(null);
      return;
    }

    if (/^\d{6}$/.test(val)) {
      const prefix = val.slice(0, 3);
      const match = PINCODE_PREFIX_MAP[prefix];

      setDistrict('Resolving...');
      setState('Resolving...');

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (!response.ok) throw new Error("API network response was not ok");
        const data = await response.json();

        // Check if this request is still the latest typed pincode
        if (latestPinRef.current !== val) return;

        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const firstOffice = data[0].PostOffice[0];
          const resolvedDistrict = firstOffice.District;
          const resolvedState = firstOffice.State;

          setDistrict(resolvedDistrict);
          setState(resolvedState);

          // Helper function for geocoding coordinates of the resolved District & State
          const resolveGeoLocation = async () => {
            let geoLat = null;
            let geoLng = null;

            // 1. Try Google Maps Geocoder if Google Maps JS SDK is loaded
            if (window.google && window.google.maps && window.google.maps.Geocoder) {
              try {
                const geocoder = new window.google.maps.Geocoder();
                const geoResult = await new Promise((resolveGeo) => {
                  geocoder.geocode({ address: `${resolvedDistrict}, ${resolvedState}, India` }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                      const loc = results[0].geometry.location;
                      resolveGeo({ lat: loc.lat(), lng: loc.lng() });
                    } else {
                      resolveGeo(null);
                    }
                  });
                });
                if (geoResult) {
                  geoLat = geoResult.lat;
                  geoLng = geoResult.lng;
                }
              } catch (geoErr) {
                console.warn("Google Maps Geocoder failed, falling back:", geoErr);
              }
            }

            // 2. Try Nominatim (OpenStreetMap) if Google Geocoder wasn't successful or loaded
            if (geoLat === null || geoLng === null) {
              try {
                const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${resolvedDistrict}, ${resolvedState}, India`)}&limit=1`);
                if (nominatimRes.ok) {
                  const nominatimData = await nominatimRes.json();
                  if (nominatimData && nominatimData.length > 0) {
                    geoLat = parseFloat(nominatimData[0].lat);
                    geoLng = parseFloat(nominatimData[0].lon);
                  }
                }
              } catch (nomErr) {
                console.warn("Nominatim geocoding fallback failed:", nomErr);
              }
            }

            // Verify again if this request is still the latest one before setting coordinates
            if (latestPinRef.current !== val) return;

            if (geoLat !== null && geoLng !== null) {
              setCoordinates({ lat: geoLat, lng: geoLng, zoom: 11 });
              fetchLiveWeather(geoLat, geoLng, match?.temp || 27, match?.humidity || 60);
            } else {
              // Last resort fallback: local prefix map or center of India
              if (match) {
                setCoordinates({ lat: match.lat, lng: match.lng, zoom: 11 });
                fetchLiveWeather(match.lat, match.lng, match.temp, match.humidity);
              } else {
                setCoordinates({ lat: 20.5937, lng: 78.9629, zoom: 5 });
                fetchLiveWeather(20.5937, 78.9629, 27, 60);
              }
            }
          };

          await resolveGeoLocation();
          return;
        } else {
          throw new Error("Invalid pincode response from API");
        }
      } catch (err) {
        console.warn("Pincode API failed, trying offline/local prefix match fallback:", err);

        if (latestPinRef.current !== val) return;

        // Fallback to local map if API fails
        if (match) {
          setDistrict(match.district);
          setState(match.state);
          setCoordinates({ lat: match.lat, lng: match.lng, zoom: 11 });
          fetchLiveWeather(match.lat, match.lng, match.temp, match.humidity);
        } else {
          setDistrict('Invalid PIN');
          setState('Invalid PIN');
          setCoordinates({ lat: 20.5937, lng: 78.9629, zoom: 5 });
          setTemperature(27);
          setHumidity(60);
        }
      }
    } else {
      setDistrict('Invalid PIN');
      setState('Invalid PIN');
      setCoordinates({ lat: 20.5937, lng: 78.9629, zoom: 5 });
      setTemperature(27);
      setHumidity(60);
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
                {/* Viewfinder: Real Video Stream or Simulator Fallback */}
                <div className="relative rounded-lg overflow-hidden h-52 border border-primary/30 bg-surface-container-lowest/50 flex flex-col justify-center items-center">
                  {cameraStreamActive ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:12px_12px]"></div>
                      <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>center_focus_strong</span>
                      <span className="font-mono text-[9px] text-primary/60 mt-1 uppercase tracking-widest animate-pulse">Simulator Active</span>
                    </>
                  )}
                  
                  {/* Viewfinder Overlay telemetry */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[8px] text-primary/80 bg-[#0b1326]/60 px-1.5 py-0.5 rounded border border-primary/25 uppercase tracking-widest">
                        {cameraStreamActive ? 'Live Camera Feed' : 'Simulator Mode'}
                      </span>
                      {cameraError && (
                        <span className="font-mono text-[8px] text-error bg-[#0b1326]/60 px-1.5 py-0.5 rounded border border-error/25 uppercase">
                          {cameraError}
                        </span>
                      )}
                    </div>

                    {/* HUD Reticle */}
                    <div className="self-center flex items-center justify-center relative w-full h-[60%]">
                      <div className="absolute top-[20%] w-[80%] h-[1px] bg-primary/25 border-dashed border-b"></div>
                      <div className="absolute top-[80%] w-[80%] h-[1px] bg-primary/25 border-dashed border-b"></div>
                      <div className="absolute left-[20%] h-[80%] w-[1px] bg-primary/25 border-dashed border-r"></div>
                      <div className="absolute left-[80%] h-[80%] w-[1px] bg-primary/25 border-dashed border-r"></div>
                      <span className="material-symbols-outlined text-primary text-xl opacity-60">add</span>
                    </div>
                    
                    <span className="font-mono text-[7px] text-on-surface-variant/60 uppercase tracking-tighter">
                      FACING_MODE: ENVIRONMENT
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCapturePhoto}
                    className="flex-1 bg-secondary text-on-secondary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-secondary-container shadow-lg shadow-secondary/15"
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                    Capture Frame
                  </button>
                  <button 
                    onClick={handleCancelCamera}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="font-mono text-label-caps text-on-surface-variant mb-2 block uppercase">District</label>
              <div className={`w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded px-2 py-1 font-mono text-data-sm select-none transition-colors ${
                district === 'Invalid PIN' 
                  ? 'text-error font-bold' 
                  : (district && district !== 'Awaiting PIN...' && district !== 'Resolving...' ? 'text-primary font-semibold' : 'text-on-surface-variant/40')
              }`}>
                {district}
              </div>
            </div>
            <div className="glass-panel rounded-lg p-3">
              <label className="font-mono text-label-caps text-on-surface-variant mb-2 block uppercase">State</label>
              <div className={`w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded px-2 py-1 font-mono text-data-sm select-none transition-colors ${
                state === 'Invalid PIN' 
                  ? 'text-error font-bold' 
                  : (state && state !== 'Awaiting PIN...' && state !== 'Resolving...' ? 'text-primary font-semibold' : 'text-on-surface-variant/40')
              }`}>
                {state}
              </div>
            </div>
          </div>

        </div>

        {/* Card 2: Neural Network Inference & Weather */}
        <div className="glass-panel rounded-xl p-5 flex flex-col items-center">
          <p className="font-mono text-label-caps text-on-surface-variant self-start mb-4 uppercase">Neural Network Inference</p>
          
          <div className="relative w-48 h-48 flex items-center justify-center animate-fade-in">
            {/* Custom circular progress using dynamic styles based on predicted AQI */}
            <div className={`w-full h-full rounded-full flex items-center justify-center border-8 transition-all duration-500 relative ${
              predictedAQI === null 
                ? 'border-surface-container glow-gray' 
                : predictedAQI <= 50 
                  ? 'border-primary/40 glow-emerald' 
                  : predictedAQI <= 100 
                    ? 'border-secondary/40 glow-orange' 
                    : predictedAQI <= 200 
                      ? 'border-tertiary-container/40 glow-orange' 
                      : 'border-error/40 glow-error'
            }`}
                 style={{
                   background: 'radial-gradient(closest-side, #0b1326 79%, transparent 80% 100%)',
                   borderColor: predictedAQI === null ? '#171f33' : undefined
                 }}>
              
              {/* Colored conic indicator */}
              <div className={`absolute inset-0 rounded-full border-8 border-transparent opacity-80 rotate-45 transition-all duration-500 ${
                predictedAQI === null 
                  ? 'border-t-outline-variant border-r-outline-variant' 
                  : predictedAQI <= 50 
                    ? 'border-t-primary border-r-primary' 
                    : predictedAQI <= 100 
                      ? 'border-t-secondary border-r-secondary' 
                      : predictedAQI <= 200 
                        ? 'border-t-tertiary-container border-r-tertiary-container' 
                        : 'border-t-error border-r-error'
              }`}></div>

              <div className="flex flex-col items-center z-10 text-center px-4">
                {predictedAQI === null ? (
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider animate-pulse">Awaiting Telemetry...</span>
                ) : (
                  <>
                    <span className={`font-headline text-[44px] font-bold leading-none transition-colors duration-500 ${
                      predictedAQI <= 50 
                        ? 'text-primary' 
                        : predictedAQI <= 100 
                          ? 'text-secondary' 
                          : predictedAQI <= 200 
                            ? 'text-tertiary-container' 
                            : 'text-error'
                    }`}>{predictedAQI}</span>
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.2em] mt-1 transition-colors duration-500 ${
                      predictedAQI <= 50 
                        ? 'text-primary' 
                        : predictedAQI <= 100 
                          ? 'text-secondary' 
                          : predictedAQI <= 200 
                            ? 'text-tertiary-container' 
                            : 'text-error'
                    }`}>
                      {predictedAQI <= 50 
                        ? 'Good AQI' 
                        : predictedAQI <= 100 
                          ? 'Moderate' 
                          : predictedAQI <= 200 
                            ? 'Poor AQI' 
                            : 'Hazardous'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Micro-Sparkline Decorative Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <path className={
                  predictedAQI === null 
                    ? 'text-outline-variant' 
                    : predictedAQI <= 50 
                      ? 'text-primary' 
                      : predictedAQI <= 100 
                        ? 'text-secondary' 
                        : predictedAQI <= 200 
                          ? 'text-tertiary-container' 
                          : 'text-error'
                } d="M 10 50 Q 25 40, 40 60 T 70 30 T 90 50" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
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
                <p className="font-mono text-base font-semibold text-on-surface">{temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>humidity_percentage</span>
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant uppercase">Humidity</p>
                <p className="font-mono text-base font-semibold text-on-surface">{humidity}%</p>
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
        
        <AeroMap pinCode={pinCode} district={district} state={state} coordinates={coordinates} />
      </section>

    </div>
  );
}

export default DashboardView;
