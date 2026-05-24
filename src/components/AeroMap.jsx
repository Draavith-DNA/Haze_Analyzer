import React, { useEffect, useRef, useState } from 'react';

// Dark map style matching the slate-900 AeroSight UI
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0b1326" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1326" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#85948b" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5af0b3" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#dae2fd" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#131b2e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#171f33" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3c4a42" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bbcac0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#060e20" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#dae2fd" }],
  },
];


function AeroMap({ pinCode, district, state, coordinates }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const activeMarkersRef = useRef([]);

  // Load Google Maps API Key and WAQI Token from environment
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const waqiToken = import.meta.env.VITE_WAQI_TOKEN || 'demo';

  // Helper to color markers based on exact AQI
  const getAQIColor = (aqi) => {
    const num = parseInt(aqi, 10);
    if (isNaN(num)) return '#85948b'; // Gray fallback
    if (num <= 50) return '#5af0b3';  // Emerald Good
    if (num <= 100) return '#ffc640'; // Amber Moderate
    if (num <= 150) return '#ffa668'; // Orange Sensitive
    return '#ffb4ab';                 // Crimson Poor
  };

  // Dynamic Google Maps Script loader
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    if (!googleMapsKey) {
      console.warn("VITE_GOOGLE_MAPS_KEY is empty. Rendering dynamic radar hud fallback.");
      setLoadError(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Google Maps SDK script.");
        setLoadError(true);
      };
      document.head.appendChild(script);
    } else {
      // Script is already added but maps aren't loaded in window yet. Listen to its load event.
      const handleScriptLoad = () => {
        if (window.google && window.google.maps) {
          setIsGoogleLoaded(true);
        }
      };
      script.addEventListener('load', handleScriptLoad);
      
      // Double check periodically in case of rapid race conditions
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsGoogleLoaded(true);
          clearInterval(interval);
        }
      }, 500);

      return () => {
        script.removeEventListener('load', handleScriptLoad);
        clearInterval(interval);
      };
    }
  }, [googleMapsKey]);

  // Map Initialization
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || mapInstance) return;

    try {
      const initialCenter = new window.google.maps.LatLng(20.5937, 78.9629); // Center of India
      const map = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 5,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        backgroundColor: '#0b1326'
      });

      // WAQI Tile overlay integration
      const waqiTileOverlay = new window.google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
          return `https://tiles.waqi.info/tiles/usepa-aqi/${zoom}/${coord.x}/${coord.y}.png?token=${waqiToken}`;
        },
        tileSize: new window.google.maps.Size(256, 256),
        name: "WAQI Live Heatmap",
        opacity: 0.55
      });
      map.overlayMapTypes.insertAt(0, waqiTileOverlay);

      setMapInstance(map);

      // Event listener to fetch point markers when map is idle
      map.addListener("idle", () => {
        fetchNearbyStations(map);
      });

    } catch (e) {
      console.error("Error initializing Google Maps:", e);
      setLoadError(true);
    }
  }, [isGoogleLoaded]);

  // Fetch stations using the bounding box endpoint
  const fetchNearbyStations = async (map) => {
    if (!window.google || !map) return;

    try {
      const bounds = map.getBounds();
      if (!bounds) return;
      
      const SW = bounds.getSouthWest();
      const NE = bounds.getNorthEast();
      const boundingBox = `${SW.lat()},${SW.lng()},${NE.lat()},${NE.lng()}`;

      const response = await fetch(`https://api.waqi.info/map/bounds/?latlng=${boundingBox}&token=${waqiToken}`);
      const result = await response.json();

      if (result.status === 'ok' && Array.isArray(result.data)) {
        // Clean existing markers
        activeMarkersRef.current.forEach(m => m.setMap(null));
        activeMarkersRef.current = [];

        // Build new markers
        result.data.forEach(station => {
          const color = getAQIColor(station.aqi);
          
          const marker = new window.google.maps.Marker({
            position: { lat: parseFloat(station.lat), lng: parseFloat(station.lon) },
            map: map,
            title: station.station.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: "#0b1326",
              strokeWeight: 1.5,
              scale: 8
            }
          });

          // InfoWindow on click showing station name and AQI
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: #dae2fd; background-color: #171f33; padding: 10px; border-radius: 6px; border: 1px solid rgba(133, 148, 139, 0.2); font-family: monospace; font-size: 11px; line-height: 1.4;">
                <strong style="color: #5af0b3; display: block; margin-bottom: 4px;">${station.station.name}</strong>
                <span>AQI Rating: <strong style="color: ${color};">${station.aqi}</strong></span>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          activeMarkersRef.current.push(marker);
        });
      }
    } catch (e) {
      console.warn("Could not fetch WAQI bounding stations:", e);
    }
  };

  // Synchronous viewport coordinates update listening directly to optimized prop
  useEffect(() => {
    if (window.google && mapInstance) {
      if (coordinates) {
        mapInstance.panTo({ lat: coordinates.lat, lng: coordinates.lng });
        mapInstance.setZoom(coordinates.zoom || 11);
      } else {
        // Safe default: Center of India
        mapInstance.panTo({ lat: 20.5937, lng: 78.9629 });
        mapInstance.setZoom(5);
      }
    }
  }, [coordinates, mapInstance]);

  // Handle fallback rendering if keys are empty or maps fails to load
  if (loadError || !googleMapsKey) {
    return (
      <div className="relative rounded-2xl overflow-hidden glass-panel h-[320px] border border-outline-variant/30 select-none">
        <div className="absolute inset-0 bg-[#0b1326] flex flex-col justify-center items-center overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3c4a42 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }}></div>
          
          {/* Circular HUD radar rings */}
          <div className="absolute w-[240px] h-[240px] rounded-full border border-primary/10 animate-pulse"></div>
          <div className="absolute w-[140px] h-[140px] rounded-full border border-primary/20"></div>
          
          {/* Animated radar sweeping HUD bar line */}
          <div className="absolute w-full h-[1px] bg-primary/10 top-1/2 left-0 animate-scanline"></div>

          {/* Fallback pin point markers */}
          <div className="absolute top-[32%] left-[38%] flex flex-col items-center">
            <span className="w-3 h-3 rounded-full bg-error animate-ping absolute opacity-70"></span>
            <span className="w-3 h-3 rounded-full bg-error relative border border-white"></span>
            <span className="font-mono text-[7px] text-error font-bold mt-1 bg-background/80 px-1 rounded">Node-74 (AQI: 304)</span>
          </div>

          <div className="absolute top-[65%] left-[62%] flex flex-col items-center">
            <span className="w-3 h-3 rounded-full bg-secondary animate-pulse absolute opacity-70"></span>
            <span className="w-3 h-3 rounded-full bg-secondary relative border border-white"></span>
            <span className="font-mono text-[7px] text-secondary font-bold mt-1 bg-background/80 px-1 rounded">Node-09 (AQI: 142)</span>
          </div>

          <div className="absolute top-[20%] left-[80%] flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-primary relative border border-white"></span>
            <span className="font-mono text-[7px] text-primary font-bold mt-1 bg-background/80 px-1 rounded">Node-112 (AQI: 42)</span>
          </div>

          <div className="z-10 text-center space-y-2 pointer-events-none px-4 bg-background/60 py-3 rounded-xl border border-outline-variant/10 max-w-sm">
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-bold block">Dynamic GIS Radar Fallback</span>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Google Maps API load deferred (Key not set). Active local stations resolved for PIN: <strong className="text-secondary">{pinCode || '110001'}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden glass-panel h-[320px] border border-outline-variant/30">
      <div ref={mapRef} className="w-full h-full bg-[#0b1326]" />
      
      {/* Zoom HUD legend overlay */}
      <div className="absolute bottom-4 left-4 right-4 glass-panel p-2.5 rounded-lg border border-outline-variant/40 flex items-center justify-between pointer-events-none bg-background/80 z-10">
        <span className="font-mono text-[8px] text-on-surface-variant font-bold uppercase">USEPA AQI OVERLAY</span>
        <div className="flex-grow max-w-[200px] h-2 rounded bg-gradient-to-r from-primary via-secondary to-error relative ml-4">
          <span className="absolute -top-3.5 left-0 font-mono text-[6px] text-on-surface-variant font-bold">GOOD</span>
          <span className="absolute -top-3.5 right-0 font-mono text-[6px] text-on-surface-variant font-bold">HAZARD</span>
        </div>
      </div>
    </div>
  );
}

export default AeroMap;
