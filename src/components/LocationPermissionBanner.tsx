import React, { useState, useEffect, useRef } from 'react';
import {
  detectUserLocation,
  getGeolocationPermissionStatus,
  findClosestCity,
  reverseGeocodeCoordinates,
  INDONESIA_CITIES,
} from '../utils/locationHelper';

interface LocationPermissionBannerProps {
  onLocationUpdate?: (coords: { lat: number; lng: number; accuracy: number; city: string; source: string }) => void;
  onOpenDirectory?: () => void;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  onLocationUpdate,
  onOpenDirectory,
}) => {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [liveCoords, setLiveCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    city: string;
    source: 'gps' | 'ip' | 'preset';
    timestamp: number;
  }>({
    lat: -3.7928,
    lng: 102.2608,
    accuracy: 8,
    city: 'Kota Bengkulu, Bengkulu',
    source: 'preset',
    timestamp: Date.now(),
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  // Check initial permission status & trigger auto-detection
  useEffect(() => {
    let isMounted = true;

    const initPermissionAndLocation = async () => {
      const status = await getGeolocationPermissionStatus();
      if (!isMounted) return;
      setPermissionState(status);

      // Auto-trigger detection
      requestLiveGPS();
    };

    initPermissionAndLocation();

    return () => {
      isMounted = false;
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestLiveGPS = async () => {
    setIsRequesting(true);
    setStatusMessage('Meminta izin akses GPS ke browser...');

    // 1. If navigator.geolocation available, start watching position
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = Math.round(pos.coords.accuracy) || 5;

            // Geocode to Indonesian district / city
            let cityName = 'GPS Realtime';
            try {
              cityName = await reverseGeocodeCoordinates(lat, lng);
            } catch {
              const closest = findClosestCity(lat, lng);
              cityName = `${closest.key}, ${closest.province}`;
            }

            const payload = {
              lat,
              lng,
              accuracy: acc,
              city: cityName,
              source: 'gps' as const,
              timestamp: pos.timestamp || Date.now(),
            };

            setLiveCoords(payload);
            setPermissionState('granted');
            setStatusMessage(`GPS Aktif: ${cityName}`);
            setIsRequesting(false);

            if (onLocationUpdate) {
              onLocationUpdate(payload);
            }
          },
          async (err) => {
            console.warn('GPS watch error:', err.message);
            if (err.code === 1) {
              setPermissionState('denied');
              setStatusMessage('Izin GPS ditolak di browser. Menggunakan estimasi IP / Bengkulu.');
            }

            // Fallback to IP detection
            const ipRes = await detectUserLocation();
            const payload = {
              lat: ipRes.lat,
              lng: ipRes.lng,
              accuracy: ipRes.accuracy,
              city: ipRes.cityName,
              source: ipRes.source,
              timestamp: ipRes.timestamp,
            };
            setLiveCoords(payload);
            setIsRequesting(false);

            if (onLocationUpdate) {
              onLocationUpdate(payload);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          }
        );
      } catch (e) {
        console.error('Error starting GPS watch:', e);
        setIsRequesting(false);
      }
    } else {
      // Fallback
      const res = await detectUserLocation();
      const payload = {
        lat: res.lat,
        lng: res.lng,
        accuracy: res.accuracy,
        city: res.cityName,
        source: res.source,
        timestamp: res.timestamp,
      };
      setLiveCoords(payload);
      setIsRequesting(false);
      if (onLocationUpdate) onLocationUpdate(payload);
    }
  };

  const handleSelectQuickCity = (cityKey: string) => {
    const target = INDONESIA_CITIES[cityKey];
    if (!target) return;
    const payload = {
      lat: target.lat,
      lng: target.lng,
      accuracy: 10,
      city: `${cityKey}, ${target.province}`,
      source: 'preset' as const,
      timestamp: Date.now(),
    };
    setLiveCoords(payload);
    setStatusMessage(`Manual: ${cityKey}`);
    if (onLocationUpdate) onLocationUpdate(payload);
  };

  return (
    <div className="w-full bg-[#002f4a] text-white shadow-xs border-b border-sky-500/20 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: GPS Indicator & Live Coordinates */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/30">
                <span className="text-xs">🛰️</span>
                {liveCoords.source === 'gps' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#002f4a] animate-ping" />
                )}
              </div>

              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-sky-300">
                  {liveCoords.source === 'gps' ? 'GPS LIVE' : liveCoords.source === 'ip' ? 'JARINGAN IP' : 'LOKASI AKTIF'}
                </span>
                <span className="text-slate-400 text-[10px]">•</span>
                <span className="font-semibold text-slate-100 text-[11px] truncate max-w-[200px] md:max-w-xs">
                  {liveCoords.city}
                </span>
                <span className="text-sky-300 font-mono text-[10px] bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/60 hidden md:inline">
                  {liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)}
                </span>
                <span className="text-[9px] text-sky-200 bg-sky-600/30 px-1.5 py-0.2 rounded-full">
                  ±{liveCoords.accuracy}m
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Permission buttons */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
            {permissionState !== 'granted' ? (
              <button
                type="button"
                onClick={requestLiveGPS}
                disabled={isRequesting}
                className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition flex items-center space-x-1 active:scale-95 cursor-pointer"
              >
                <span>{isRequesting ? '🔄 Memeriksa...' : '⚡ Izinkan Akses GPS'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={requestLiveGPS}
                disabled={isRequesting}
                className="px-2 py-0.5 rounded-md bg-sky-800/80 hover:bg-sky-700 text-sky-100 text-[10px] font-medium transition flex items-center space-x-1 cursor-pointer"
                title="Perbarui koordinat realtime dari GPS perangkat"
              >
                <span>🔄 Sinkron GPS</span>
              </button>
            )}

            {/* Bengkulu Quick Switch */}
            <button
              type="button"
              onClick={() => handleSelectQuickCity('Kota Bengkulu')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                liveCoords.city.includes('Bengkulu')
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'bg-sky-900/60 hover:bg-sky-800 text-sky-200'
              }`}
            >
              ⭐ Bengkulu
            </button>

            {onOpenDirectory && (
              <button
                type="button"
                onClick={onOpenDirectory}
                className="px-2 py-0.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold transition cursor-pointer flex items-center space-x-1"
              >
                <span>🏥 Faskes</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
