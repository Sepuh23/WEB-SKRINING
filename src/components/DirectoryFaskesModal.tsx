import React, { useState, useEffect, useRef } from 'react';
import { Faskes } from '../types';
import { MOCK_FASKES } from '../data/mockData';
import {
  INDONESIA_CITIES,
  calculateDistanceKm,
  findClosestCity,
  detectUserLocation,
} from '../utils/locationHelper';

interface DirectoryFaskesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmergency: () => void;
}

export const DirectoryFaskesModal: React.FC<DirectoryFaskesModalProps> = ({
  isOpen,
  onClose,
  onOpenEmergency,
}) => {
  const [faskesList, setFaskesList] = useState<Faskes[]>(MOCK_FASKES);
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedCity, setSelectedCity] = useState<string>('Kota Bengkulu');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFaskes, setSelectedFaskes] = useState<Faskes | null>(null);
  
  // Realtime GPS states (Default to Bengkulu coordinates)
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [gpsDetecting, setGpsDetecting] = useState<boolean>(false);
  const [gpsMode, setGpsMode] = useState<'gps' | 'ip' | 'preset'>('gps');
  const [userLocationLabel, setUserLocationLabel] = useState<string>('Kota Bengkulu, Bengkulu');
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number | null;
    altitude?: number | null;
    timestamp?: number;
  }>({
    lat: -3.7928,
    lng: 102.2608,
    accuracy: 8,
    speed: 0,
    altitude: 18,
    timestamp: Date.now(),
  });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [mapViewType, setMapViewType] = useState<'faskes' | 'user'>('faskes');
  const watchIdRef = useRef<number | null>(null);

  const filterTypes = ['Semua', 'Puskesmas PKPR', 'Rumah Sakit', 'Biro Psikologi', 'Klinik Pratama'];

  // Re-calculate distances when userCoords change & sort closest first
  useEffect(() => {
    if (!userCoords) return;
    const updated = MOCK_FASKES.map((f) => {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, f.lat, f.lng);
      return {
        ...f,
        distanceKm: dist,
        distance: `${dist} km`,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    setFaskesList(updated);
    if (updated.length > 0) {
      // Set to first nearest faskes if current selection is invalid or far
      if (!selectedFaskes || !updated.find((x) => x.id === selectedFaskes.id)) {
        setSelectedFaskes(updated[0]);
      }
    }
  }, [userCoords.lat, userCoords.lng]);

  // Request & Watch Realtime GPS with IP & Geocoding Detection
  const handleActivateGPS = async () => {
    setGpsDetecting(true);
    setGpsError(null);

    try {
      const result = await detectUserLocation();
      setUserCoords({
        lat: result.lat,
        lng: result.lng,
        accuracy: result.accuracy,
        speed: 0,
        altitude: 18,
        timestamp: result.timestamp,
      });
      setUserLocationLabel(result.cityName);
      setGpsMode(result.source);
      setGpsActive(true);

      const closest = findClosestCity(result.lat, result.lng);
      if (INDONESIA_CITIES[closest.key]) {
        setSelectedCity(closest.key);
      }
    } catch {
      // Bengkulu fallback
      const bengkulu = INDONESIA_CITIES['Kota Bengkulu'];
      setUserCoords({
        lat: bengkulu.lat,
        lng: bengkulu.lng,
        accuracy: 10,
        timestamp: Date.now(),
      });
      setSelectedCity('Kota Bengkulu');
      setUserLocationLabel('Kota Bengkulu, Bengkulu');
      setGpsMode('preset');
      setGpsActive(true);
    } finally {
      setGpsDetecting(false);
    }

    // Also register watchPosition if device GPS is available
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserCoords({
              lat,
              lng,
              accuracy: Math.round(pos.coords.accuracy) || 5,
              speed: pos.coords.speed,
              altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 15,
              timestamp: pos.timestamp || Date.now(),
            });
            const closest = findClosestCity(lat, lng);
            setUserLocationLabel(closest.distance < 40 ? `${closest.key}, ${closest.province}` : `GPS Live (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            setGpsActive(true);
            setGpsMode('gps');
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 3000 }
        );
      } catch {
        // ignore
      }
    }
  };

  // Auto-connect GPS on modal open
  useEffect(() => {
    if (isOpen) {
      handleActivateGPS();
    }
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    setGpsMode('preset');
    const city = INDONESIA_CITIES[cityName];
    if (city) {
      setUserCoords({
        lat: city.lat,
        lng: city.lng,
        accuracy: 10,
        speed: 0,
        altitude: 20,
        timestamp: Date.now(),
      });
      setUserLocationLabel(`${cityName}, ${city.province}`);
      setGpsActive(true);
      setGpsError(null);
    }
  };

  const filtered = faskesList.filter((item) => {
    const matchesType = selectedType === 'Semua' || item.type === selectedType;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopyPhone = (faskes: Faskes) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(faskes.phone);
      setCopiedId(faskes.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Google Maps Dynamic Route & Embed URLs
  const activeFaskes = selectedFaskes || filtered[0] || MOCK_FASKES[0];
  const googleMapsRouteUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeFaskes.lat},${activeFaskes.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeFaskes.name + ' ' + activeFaskes.address)}`;

  const currentMapTargetLat = mapViewType === 'user' ? userCoords.lat : activeFaskes.lat;
  const currentMapTargetLng = mapViewType === 'user' ? userCoords.lng : activeFaskes.lng;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${currentMapTargetLat},${currentMapTargetLng}&hl=id&z=${mapZoom}&output=embed`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/70 backdrop-blur-md p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[28px] shadow-[0_24px_70px_-12px_rgba(2,132,199,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-gradient-to-r from-[#f0f9ff] via-[#f0f3ff] to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <span className="material-symbols-outlined text-[22px]">map</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#111c2d]">
                  Direktori Faskes &amp; Google Maps Realtime
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Google Maps Live GPS</span>
                </span>
              </div>
              <p className="text-[11px] text-[#576065]">
                Puskesmas ramah remaja (PKPR), RS Jiwa, dan biro psikolog Bengkulu &amp; seluruh Indonesia dengan navigasi terdekat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#576065] hover:text-[#111c2d] hover:bg-slate-100 flex items-center justify-center border border-[#dee8ff] cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Realtime GPS Permission & Status Activator */}
        <div className="bg-[#f8fafc] px-6 py-3 border-b border-[#dee8ff] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  gpsActive ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' : 'bg-amber-400 ring-4 ring-amber-100'
                }`}
              ></div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-800">
                    📍 {userLocationLabel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    {gpsMode === 'gps' ? '🛰️ GPS Realtime' : gpsMode === 'ip' ? '🌐 IP Lokasi' : `📍 Preset Kota`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {`Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)} • Akurasi: ±${userCoords.accuracy || 8}m`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-[12px] font-semibold text-slate-800 focus:outline-none cursor-pointer shadow-xs"
              >
                {Object.keys(INDONESIA_CITIES).map((city) => (
                  <option key={city} value={city}>
                    {INDONESIA_CITIES[city].name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleActivateGPS}
                disabled={gpsDetecting}
                className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[15px] ${gpsDetecting ? 'animate-spin' : ''}`}>
                  {gpsDetecting ? 'sync' : 'my_location'}
                </span>
                <span>{gpsDetecting ? 'Mencari...' : 'Deteksi GPS Otomatis'}</span>
              </button>
            </div>
          </div>

          {/* Quick City Selector Bar (Featuring Bengkulu & Major Regions) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="font-bold text-slate-500 shrink-0 mr-1">Kota Cepat:</span>
            {[
              { id: 'Kota Bengkulu', label: '⭐ Bengkulu (Lokasi Anda)' },
              { id: 'Palembang', label: 'Palembang' },
              { id: 'Padang', label: 'Padang' },
              { id: 'Bandar Lampung', label: 'Lampung' },
              { id: 'Jakarta Pusat', label: 'Jakarta' },
              { id: 'Bandung', label: 'Bandung' },
              { id: 'Surabaya', label: 'Surabaya' },
              { id: 'Yogyakarta', label: 'Yogyakarta' },
              { id: 'Medan', label: 'Medan' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCityChange(c.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === c.id
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {gpsError && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
              <span>{gpsError}</span>
            </div>
            <button
              type="button"
              onClick={handleActivateGPS}
              className="text-[11px] font-bold text-[#0284C7] underline hover:text-[#0369a1] cursor-pointer"
            >
              Coba Ulang GPS
            </button>
          </div>
        )}

        {/* Content Body: Split Map & Facility Directory */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-left">
          
          {/* Interactive Google Map View & Quick Target */}
          <div className="rounded-2xl border border-[#dee8ff] overflow-hidden shadow-xs bg-slate-900 relative">
            <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">pin_drop</span>
                <span className="text-[13px] font-bold">
                  {mapViewType === 'user' ? `Lokasi Anda: ${userLocationLabel}` : `Faskes Terpilih: ${activeFaskes.name}`}
                </span>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md font-semibold border border-emerald-800">
                  {activeFaskes.distance} dari koordinatmu
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMapViewType('faskes')}
                    className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      mapViewType === 'faskes' ? 'bg-[#0284C7] text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Faskes ({activeFaskes.name.slice(0, 16)}...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapViewType('user')}
                    className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      mapViewType === 'user' ? 'bg-[#0284C7] text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    GPS Lokasiku
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setMapZoom((prev) => Math.min(prev + 1, 19))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
                  title="Perbesar Peta"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom((prev) => Math.max(prev - 1, 10))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold flex items-center justify-center border border-slate-700 cursor-pointer"
                  title="Perkecil Peta"
                >
                  -
                </button>
                <a
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-slate-950 hover:text-white text-[12px] font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">directions</span>
                  <span>Rute Google Maps</span>
                </a>
              </div>
            </div>

            {/* Google Maps Embed Iframe */}
            <div className="w-full h-64 sm:h-72 relative bg-slate-950">
              <iframe
                title="Google Maps Live Facility Embed"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
              ></iframe>

              {/* Map Floating HUD */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white p-2.5 rounded-xl border border-slate-700 text-[11px] shadow-lg max-w-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Google Maps Live Bengkulu / Indonesia</span>
                </div>
                <p className="text-slate-200 truncate">
                  Titik: <b>{activeFaskes.name}</b>
                </p>
                <p className="text-slate-400 text-[10px]">
                  Jarak: <b>{activeFaskes.distance}</b> • Estimasi: <b>{Math.max(3, Math.round(activeFaskes.distanceKm * 3.5))} Menit</b>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Category & Search Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {filterTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">
                search
              </span>
              <input
                type="text"
                placeholder="Cari faskes, kota, atau RS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>
          </div>

          {/* Facility List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((faskes) => {
              const isSelected = selectedFaskes?.id === faskes.id;
              return (
                <div
                  key={faskes.id}
                  onClick={() => setSelectedFaskes(faskes)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#F0F9FF] border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-md'
                      : 'bg-white border-[#dee8ff] hover:border-sky-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            faskes.type === 'Puskesmas PKPR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : faskes.type === 'Rumah Sakit'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {faskes.type}
                        </span>
                        {faskes.isYouthFriendly && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-[#0284C7]">
                            ⭐ Ramah Remaja
                          </span>
                        )}
                      </div>

                      <span className="text-[12px] font-bold text-[#0284C7] bg-white px-2.5 py-0.5 rounded-full border border-sky-200 shrink-0">
                        📍 {faskes.distance}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-[15px] text-[#111c2d] mb-1">
                      {faskes.name}
                    </h4>
                    <p className="text-[12px] text-slate-600 mb-2 leading-relaxed">
                      {faskes.address}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{faskes.rating} ({faskes.reviewsCount} Ulasan)</span>
                      </span>
                      <span>•</span>
                      <span>{faskes.isYouthFriendly ? 'Layanan Bebas Stigma' : 'Layanan Medis Terpadu'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>{faskes.hours}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPhone(faskes);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Salin Nomor Telepon"
                      >
                        <span className="material-symbols-outlined text-[13px]">call</span>
                        <span>{copiedId === faskes.id ? 'Tersalin!' : faskes.phone}</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${faskes.lat},${faskes.lng}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">navigation</span>
                        <span>Rute</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Helpline Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
              </div>
              <div>
                <h4 className="font-extrabold text-[14px]">Butuh Pertolongan Krisis Darurat Segera?</h4>
                <p className="text-[11px] text-rose-100">
                  Hubungi Layanan Kesehatan Jiwa Kemenkes Sejiwa 119 ext 8 atau kontak darurat sekolahmu.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEmergency}
              className="px-4 py-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-[12px] shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Hubungi Hotline 119</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
