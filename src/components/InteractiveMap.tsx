import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Compass, Route, Layers, Locate, Info, CheckCircle2, AlertCircle } from "lucide-react";

const LOCATIONIQ_KEY = "pk.c90371a3bbd58b2b07e04a44a01a2f28";

interface InteractiveMapProps {
  donorLat: number;
  donorLng: number;
  isSimulatingMove: boolean;
  onProgressComplete?: () => void;
  hospitalName?: string;
  onLocationClick?: (lat: number, lng: number, name: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  donorLat,
  donorLng,
  isSimulatingMove,
  onProgressComplete,
  hospitalName = "California Pacific Medical Center",
  onLocationClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const donorMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [percent, setPercent] = useState(0);
  const [mapStyle, setMapStyle] = useState<"streets" | "dark">("streets");
  const [clickedAddress, setClickedAddress] = useState<string | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // GPS Device State
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "acquiring" | "active" | "denied" | "error">("idle");
  const [gpsAddress, setGpsAddress] = useState<string | null>(null);

  // Active base coordinates: use device GPS if active, otherwise donor props, fallback to SF default
  const baseLat = gpsCoords ? gpsCoords.lat : (donorLat || 37.7749);
  const baseLng = gpsCoords ? gpsCoords.lng : (donorLng || -122.4194);

  // Hospital ER location relative to current base position
  const targetHospitalLat = baseLat + 0.012;
  const targetHospitalLng = baseLng + 0.018;

  // Calculate current animated position of donor courier along the vector
  const currentLat = baseLat + (targetHospitalLat - baseLat) * (percent / 100);
  const currentLng = baseLng + (targetHospitalLng - baseLng) * (percent / 100);

  // 1. Function to request real-time browser GPS location
  const requestGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    setGpsStatus("acquiring");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsStatus("active");

        // Pan map smoothly to new GPS position
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }

        // Reverse Geocode using LocationIQ
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setGpsAddress(addr);
            if (onLocationClick) {
              onLocationClick(latitude, longitude, addr);
            }
          }
        } catch (err) {
          console.warn("LocationIQ reverse geocode for GPS failed:", err);
        }
      },
      (error) => {
        console.warn("Geolocation permission error or unavailable:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus("denied");
        } else {
          setGpsStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationClick]);

  // Request browser GPS automatically on component mount
  useEffect(() => {
    requestGPSLocation();
  }, [requestGPSLocation]);

  // 2. Simulation timer for GPS vehicle move
  useEffect(() => {
    if (!isSimulatingMove) {
      setPercent(0);
      return;
    }

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onProgressComplete) onProgressComplete();
          return 100;
        }
        return prev + 2;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isSimulatingMove, onProgressComplete]);

  // 3. Initialize Leaflet Map with LocationIQ Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [baseLat, baseLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Attribution
      L.control
        .attribution({
          position: "bottomright",
          prefix: '<a href="https://locationiq.com" target="_blank" rel="noreferrer" class="text-blue-600 font-semibold">LocationIQ</a>',
        })
        .addTo(map);

      // Add LocationIQ Tile Layer
      const tileUrl = `https://{s}-tiles.locationiq.com/v3/${mapStyle}/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;
      const layer = L.tileLayer(tileUrl, {
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = layer;

      // Hospital Destination Icon
      const hospitalHtml = `
        <div class="relative flex items-center justify-center w-9 h-9 bg-red-600 text-white rounded-full border-2 border-white shadow-lg animate-pulse">
          <div class="font-bold text-xs">ER</div>
          <div class="absolute -bottom-1 w-2 h-2 bg-red-600 rotate-45"></div>
        </div>
      `;
      const hospitalIcon = L.divIcon({
        html: hospitalHtml,
        className: "custom-hospital-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const hospitalMarker = L.marker([targetHospitalLat, targetHospitalLng], { icon: hospitalIcon }).addTo(map);
      hospitalMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #dc2626; font-size: 13px;">${hospitalName}</strong>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Emergency Blood Reception Site</div>
        </div>
      `);
      hospitalMarkerRef.current = hospitalMarker;

      // Donor / Courier Vehicle Icon
      const vehicleHtml = `
        <div class="relative flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full border-2 border-white shadow-xl">
          <svg class="w-5 h-5 fill-current transform rotate-45" viewBox="0 0 24 24">
            <path d="M12 2L2 22l10-6 10 6L12 2z"/>
          </svg>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-ping"></div>
        </div>
      `;
      const vehicleIcon = L.divIcon({
        html: vehicleHtml,
        className: "custom-vehicle-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const donorMarker = L.marker([baseLat, baseLng], { icon: vehicleIcon }).addTo(map);
      donorMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #059669; font-size: 12px;">Active GPS Courier Position</strong>
          <div style="font-size: 11px; color: #64748b;">Live Telemetry Sync</div>
        </div>
      `);
      donorMarkerRef.current = donorMarker;

      // Route Polyline
      const routeLine = L.polyline(
        [
          [baseLat, baseLng],
          [targetHospitalLat, targetHospitalLng],
        ],
        {
          color: "#dc2626",
          weight: 4,
          opacity: 0.7,
          dashArray: "8, 8",
        }
      ).addTo(map);
      routeLineRef.current = routeLine;

      // Map Click Event -> LocationIQ Reverse Geocoding
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setGeocodingLoading(true);
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            setClickedAddress(address);

            // Add transient popup at click site
            L.popup()
              .setLatLng([lat, lng])
              .setContent(`
                <div style="font-family: sans-serif; font-size: 11px;">
                  <strong style="color: #1e293b;">LocationIQ Pinpoint</strong>
                  <p style="margin-top: 4px; color: #475569;">${address}</p>
                </div>
              `)
              .openOn(map);

            if (onLocationClick) {
              onLocationClick(lat, lng, address);
            }
          }
        } catch (err) {
          console.warn("LocationIQ reverse geocoding failed:", err);
          const fallback = `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setClickedAddress(fallback);
          if (onLocationClick) onLocationClick(lat, lng, fallback);
        } finally {
          setGeocodingLoading(false);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 4. Update Tile style when user toggles style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileUrl = `https://{s}-tiles.locationiq.com/v3/${mapStyle}/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;
    const newLayer = L.tileLayer(tileUrl, {
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 5. Update markers and route line when baseLat / baseLng or simulation percent changes
  useEffect(() => {
    if (!donorMarkerRef.current || !hospitalMarkerRef.current || !routeLineRef.current) return;

    donorMarkerRef.current.setLatLng([currentLat, currentLng]);
    hospitalMarkerRef.current.setLatLng([targetHospitalLat, targetHospitalLng]);

    // Dynamic Polyline update
    routeLineRef.current.setLatLngs([
      [currentLat, currentLng],
      [targetHospitalLat, targetHospitalLng],
    ]);

    // Recenter smoothly if simulating move
    if (isSimulatingMove && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true });
    }
  }, [currentLat, currentLng, targetHospitalLat, targetHospitalLng, isSimulatingMove]);

  // Recenter handler
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentLat, currentLng], 15, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[340px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner group">
      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP LEFT HUD: GPS Status Badge */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 max-w-[70%]">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-[11px] font-mono px-3 py-1.5 rounded-xl shadow-lg">
          {gpsStatus === "active" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-emerald-400">GPS LIVE</span>
              <span className="text-[9px] text-slate-300">
                ({baseLat.toFixed(4)}, {baseLng.toFixed(4)})
              </span>
            </>
          ) : gpsStatus === "acquiring" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-300">ACQUIRING GPS...</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-slate-300">PRESET LOCATION</span>
            </>
          )}
        </div>

        {gpsAddress && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur border border-slate-800 text-slate-200 text-[10px] px-2.5 py-1 rounded-lg truncate max-w-xs font-mono">
            <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
            <span className="truncate">{gpsAddress}</span>
          </div>
        )}
      </div>

      {/* TOP RIGHT MAP CONTROLS */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
        {/* Real-time GPS Trigger Button */}
        <button
          type="button"
          onClick={requestGPSLocation}
          className={`backdrop-blur border p-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition cursor-pointer ${
            gpsStatus === "active"
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-300 hover:bg-emerald-900"
              : "bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800"
          }`}
          title="Get device GPS location"
        >
          <Locate className={`w-3.5 h-3.5 ${gpsStatus === "acquiring" ? "animate-spin text-amber-400" : "text-emerald-400"}`} />
          <span className="hidden sm:inline">GPS</span>
        </button>

        {/* Style Toggle */}
        <button
          type="button"
          onClick={() => setMapStyle(mapStyle === "streets" ? "dark" : "streets")}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur border border-slate-700 text-slate-200 p-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition cursor-pointer"
          title="Toggle Map Style"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline capitalize">{mapStyle}</span>
        </button>

        {/* Recenter Map */}
        <button
          type="button"
          onClick={handleRecenter}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur border border-slate-700 text-slate-200 p-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition cursor-pointer"
          title="Recenter Map"
        >
          <Navigation className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* BOTTOM OVERLAY DISPATCH STATUS */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center flex-shrink-0 text-red-500">
            <Route className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Destination ER</p>
            <p className="text-xs font-bold text-slate-100 truncate">{hospitalName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right flex-shrink-0 font-mono">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">ETA</p>
            <p className="text-xs font-bold text-emerald-400">
              {isSimulatingMove ? Math.max(0, Math.ceil(15 - (15 * percent) / 100)) : 15} Mins
            </p>
          </div>
          {isSimulatingMove && percent < 100 && (
            <div className="px-2 py-1 bg-red-600 text-white font-sans text-[10px] font-bold rounded-full animate-pulse">
              EN ROUTE ({percent}%)
            </div>
          )}
        </div>
      </div>

      {/* CLICKED ADDRESS BANNER */}
      {clickedAddress && (
        <div className="absolute top-14 left-3 right-3 z-[400] bg-emerald-950/95 border border-emerald-800 text-emerald-200 text-xs px-3 py-2 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate font-mono">{clickedAddress}</span>
          </div>
          <button
            onClick={() => setClickedAddress(null)}
            className="text-emerald-400 hover:text-white font-bold ml-2 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {geocodingLoading && (
        <div className="absolute top-14 left-3 bg-slate-900/90 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl z-[400] flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-slate-400 border-t-blue-500 rounded-full animate-spin" />
          <span>LocationIQ Reverse Geocoding...</span>
        </div>
      )}
    </div>
  );
};
