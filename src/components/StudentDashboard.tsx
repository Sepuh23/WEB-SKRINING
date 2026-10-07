import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MoodEntry, StudentProfile, TelemetryData } from '../types';
import { MOCK_FASKES } from '../data/mockData';
import {
  INDONESIA_CITIES,
  calculateDistanceKm,
  findClosestCity,
  detectUserLocation,
} from '../utils/locationHelper';
import { TicTacToeGame } from './TicTacToeGame';
import { FacialScanAnalytics } from './FacialScanAnalytics';

interface StudentDashboardProps {
  student: StudentProfile;
  moodEntries: MoodEntry[];
  onAddMoodEntry: (entry: MoodEntry) => void;
  onOpenCurhat: (initialMessage?: string) => void;
  onOpenScreening: () => void;
  onOpenJournal: () => void;
  onOpenCounselor: () => void;
  onOpenDirectory: () => void;
  onOpenEmergency: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

interface ActivitySession {
  id: string;
  name: string;
  category: 'Game Pereda Stres' | 'Curhat AI' | 'Live FACS Scan' | 'Konseling BK' | 'Jurnal Mood';
  icon: string;
  iconBg: string;
  time: string;
  stressBadgeText: string;
  stressBadgeType: 'low' | 'medium' | 'high';
  statusScore: string;
  progressPercent: number;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  moodEntries,
  onAddMoodEntry,
  onOpenCurhat,
  onOpenScreening,
  onOpenJournal,
  onOpenCounselor,
  onOpenDirectory,
  onOpenEmergency,
  onNavigateHome,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'scan' | 'curhat' | 'game' | 'journal' | 'counselor' | 'directory'>('dashboard');
  const [activeTabWidget, setActiveTabWidget] = useState<'scan' | 'game'>('scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'area' | 'realtime' | 'radar'>('realtime');
  const [dashboardGpsCoords, setDashboardGpsCoords] = useState<{ lat: number; lng: number; accuracy: number; city: string }>({
    lat: -3.7928,
    lng: 102.2608,
    accuracy: 8,
    city: 'Kota Bengkulu, Bengkulu',
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const mainWidgetRef = useRef<HTMLDivElement>(null);
  const dashGraphRef = useRef<HTMLCanvasElement>(null);
  const dashAnimRef = useRef<number | null>(null);

  // Auto-fetch GPS or IP on Dashboard mount and start realtime watcher
  const refreshDashboardGPS = async () => {
    setIsDetectingLocation(true);
    try {
      const res = await detectUserLocation();
      setDashboardGpsCoords({
        lat: res.lat,
        lng: res.lng,
        accuracy: res.accuracy,
        city: res.cityName,
      });
    } catch {
      // Bengkulu fallback
      setDashboardGpsCoords({
        lat: -3.7928,
        lng: 102.2608,
        accuracy: 10,
        city: 'Kota Bengkulu, Bengkulu',
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    refreshDashboardGPS();

    // Register active realtime GPS watcher
    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const closest = findClosestCity(lat, lng);
            const city = closest.distance < 45 ? `${closest.key}, ${closest.province}` : `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setDashboardGpsCoords({
              lat,
              lng,
              accuracy: Math.round(pos.coords.accuracy) || 5,
              city,
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
        );
      } catch {}
    }

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Compute closest faskes dynamically
  const nearestFaskes = useMemo(() => {
    const list = MOCK_FASKES.map((f) => {
      const dist = calculateDistanceKm(dashboardGpsCoords.lat, dashboardGpsCoords.lng, f.lat, f.lng);
      return { ...f, distanceKm: dist, distance: `${dist} km` };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
    return list[0] || MOCK_FASKES[0];
  }, [dashboardGpsCoords.lat, dashboardGpsCoords.lng]);

  // Realtime Dashboard Oscilloscope Streaming Loop
  useEffect(() => {
    if (chartViewMode !== 'realtime' || !dashGraphRef.current) {
      if (dashAnimRef.current) {
        cancelAnimationFrame(dashAnimRef.current);
      }
      return;
    }

    const canvas = dashGraphRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const streamBuffer1: number[] = new Array(100).fill(65);
    const streamBuffer2: number[] = new Array(100).fill(25);

    const renderDashboardStream = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      // Live streaming points
      const calmingPt = 75 + Math.sin(time * 2.5) * 12 + Math.random() * 4;
      const tensionPt = 22 + Math.cos(time * 3.2) * 8 + Math.random() * 3;

      streamBuffer1.push(Math.max(10, Math.min(95, calmingPt)));
      streamBuffer1.shift();

      streamBuffer2.push(Math.max(5, Math.min(90, tensionPt)));
      streamBuffer2.shift();

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Stream 1: Calming Index (Emerald)
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < streamBuffer1.length; i++) {
        const x = (i / (streamBuffer1.length - 1)) * w;
        const y = h - (streamBuffer1[i] / 100) * (h - 20) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Stream 2: FACS Tension (Sky Blue)
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      for (let i = 0; i < streamBuffer2.length; i++) {
        const x = (i / (streamBuffer2.length - 1)) * w;
        const y = h - (streamBuffer2[i] / 100) * (h - 20) - 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Head Dots
      const curX = w - 4;
      const curY1 = h - (streamBuffer1[streamBuffer1.length - 1] / 100) * (h - 20) - 10;
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(curX, curY1, 4.5, 0, Math.PI * 2);
      ctx.fill();

      dashAnimRef.current = requestAnimationFrame(renderDashboardStream);
    };

    dashAnimRef.current = requestAnimationFrame(renderDashboardStream);

    return () => {
      if (dashAnimRef.current) {
        cancelAnimationFrame(dashAnimRef.current);
      }
    };
  }, [chartViewMode]);

  // Recent venting, scan & game activity sessions
  const [recentActivities, setRecentActivities] = useState<ActivitySession[]>([
    {
      id: 'act-1',
      name: 'Scan Muka FACS (Sedikit Lelah)',
      category: 'Live FACS Scan',
      icon: 'face',
      iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
      time: 'Baru saja',
      stressBadgeText: '14% Rendah / Aman',
      stressBadgeType: 'low',
      statusScore: 'Mimik Wajah: Sedikit Lelah (94%)',
      progressPercent: 96,
    },
    {
      id: 'act-2',
      name: 'Mini Game XO (Pereda Stres)',
      category: 'Game Pereda Stres',
      icon: 'videogame_asset',
      iconBg: 'bg-[#DCFCE7] text-[#15803D]',
      time: '15 Menit lalu',
      stressBadgeText: '10% Sangat Tenang',
      stressBadgeType: 'low',
      statusScore: '+350 Poin Relaksasi',
      progressPercent: 92,
    },
    {
      id: 'act-3',
      name: 'Curhat Bebas: Tugas Numpuk & Ekspektasi',
      category: 'Curhat AI',
      icon: 'smart_toy',
      iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
      time: 'Hari ini, 14:20',
      stressBadgeText: '64% Teratasi',
      stressBadgeType: 'medium',
      statusScore: 'Smiling Depression Aman',
      progressPercent: 78,
    },
    {
      id: 'act-4',
      name: 'Konseling BK: Ibu Ratna, M.Pd',
      category: 'Konseling BK',
      icon: 'support_agent',
      iconBg: 'bg-[#FEF3C7] text-[#B45309]',
      time: '05 Okt 2026',
      stressBadgeText: '40% Terkendali',
      stressBadgeType: 'medium',
      statusScore: 'Sesi Selesai (9/10)',
      progressPercent: 88,
    },
    {
      id: 'act-5',
      name: 'Jurnal Mood & Refleksi Harian',
      category: 'Jurnal Mood',
      icon: 'edit_calendar',
      iconBg: 'bg-[#F0FDF4] text-[#166534]',
      time: '04 Okt 2026',
      stressBadgeText: '12% Optimal',
      stressBadgeType: 'low',
      statusScore: 'Afirmasi Tersimpan',
      progressPercent: 95,
    },
  ]);

  const handleSwitchToScan = () => {
    setActiveMenu('scan');
    setActiveTabWidget('scan');
    setSidebarOpen(false);
    if (mainWidgetRef.current) {
      mainWidgetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSwitchToGame = () => {
    setActiveMenu('game');
    setActiveTabWidget('game');
    setSidebarOpen(false);
    if (mainWidgetRef.current) {
      mainWidgetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScanComplete = (telemetry: TelemetryData) => {
    const newSession: ActivitySession = {
      id: `scan-${Date.now()}`,
      name: `Scan Muka FACS (${telemetry.facialExpression})`,
      category: 'Live FACS Scan',
      icon: 'face',
      iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
      time: 'Baru saja',
      stressBadgeText: `${telemetry.microTension}% Ketegangan`,
      stressBadgeType: telemetry.microTension < 30 ? 'low' : telemetry.microTension < 60 ? 'medium' : 'high',
      statusScore: `Ekspresi: ${telemetry.facialExpression} (${telemetry.microTension < 30 ? 'Aman' : 'Perlu Rehat'})`,
      progressPercent: 98,
    };
    setRecentActivities((prev) => [newSession, ...prev]);
  };

  const filteredActivities = recentActivities.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.statusScore.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-[#1E293B] flex font-sans antialiased overflow-x-hidden">
      {/* ========================================================= */}
      {/* 1. DARK SIDEBAR (LEFT) - Deep Slate Navy (#1E293B)        */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E293B] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#334155] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Logo */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#334155]">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                onNavigateHome();
              }}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#38BDF8] flex items-center justify-center text-slate-900 shadow-[0_4px_14px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px] text-white">favorite</span>
              </div>
              <div>
                <span className="font-bold text-[19px] tracking-tight text-white block leading-tight">
                  PSY-VIBE
                </span>
                <span className="text-[10px] font-semibold text-[#38BDF8] tracking-widest uppercase block -mt-0.5">
                  Youth Sanctuary
                </span>
              </div>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 space-y-6 text-left">
            <div>
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">
                Main Menu
              </span>
              <nav className="space-y-1">
                {/* 1. Dashboard */}
                <button
                  onClick={() => {
                    setActiveMenu('dashboard');
                    setActiveTabWidget('scan');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'dashboard'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">dashboard</span>
                    <span>Dashboard</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                </button>

                {/* 2. Scan Muka & Analitik FACS */}
                <button
                  onClick={handleSwitchToScan}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'scan' && activeTabWidget === 'scan'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">face</span>
                    <span>Scan Muka &amp; Analitik</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    FACS 📷
                  </span>
                </button>

                {/* 3. Curhat VibeBot AI */}
                <button
                  onClick={() => {
                    setActiveMenu('curhat');
                    onOpenCurhat();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'curhat'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">forum</span>
                    <span>Curhat VibeBot AI</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#38BDF8]/20 text-[#38BDF8]">
                    24/7
                  </span>
                </button>

                {/* 4. Game Pereda Stres (XO) */}
                <button
                  onClick={handleSwitchToGame}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'game' && activeTabWidget === 'game'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">grid_3x3</span>
                    <span>Game XO Pereda Stres</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                    XO 🎮
                  </span>
                </button>

                {/* 4. Jurnal Mood */}
                <button
                  onClick={() => {
                    setActiveMenu('journal');
                    onOpenJournal();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'journal'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">edit_calendar</span>
                    <span>Jurnal Mood</span>
                  </div>
                </button>

                {/* 5. Konsultasi BK */}
                <button
                  onClick={() => {
                    setActiveMenu('counselor');
                    onOpenCounselor();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'counselor'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">support_agent</span>
                    <span>Konsultasi BK</span>
                  </div>
                </button>

                {/* 6. Faskes Terdekat */}
                <button
                  onClick={() => {
                    setActiveMenu('directory');
                    onOpenDirectory();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    activeMenu === 'directory'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] border-l-4 border-[#38BDF8] font-bold'
                      : 'text-slate-300 hover:bg-[#334155]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">near_me</span>
                    <span>Faskes Terdekat</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    GPS
                  </span>
                </button>
              </nav>
            </div>

            {/* Support section */}
            <div>
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">
                Emergency &amp; Web
              </span>
              <nav className="space-y-1">
                <button
                  onClick={onOpenEmergency}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[19px]">emergency</span>
                    <span>Krisis Hotline 119</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-900/60 text-rose-200">
                    24 Jam
                  </span>
                </button>

                <button
                  onClick={onNavigateHome}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-300 hover:bg-[#334155]/60 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">public</span>
                  <span>Beranda Landing Page</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-[#334155] bg-[#0F172A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-9 h-9 rounded-full object-cover border border-[#38BDF8] shrink-0"
              />
              <div className="text-left overflow-hidden">
                <span className="text-[13px] font-bold text-white block truncate leading-tight">
                  {student.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {student.school}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#334155] transition-colors cursor-pointer"
              title="Keluar / Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* ========================================================= */}
        {/* 2. TOP NAVBAR                                             */}
        {/* ========================================================= */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="Buka Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sesi curhat, game, atau faskes..."
                className="w-full pl-9 pr-12 py-2 rounded-full bg-[#F0F9FF] border border-[#CBD5E1] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#38BDF8] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[12px] font-bold"
                >
                  ✕
                </button>
              )}
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>

              {/* Quick Search Dropdown suggestions */}
              {searchQuery && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-left animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                    Pintas Navigasi Cepat:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchToScan();
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl hover:bg-[#F0F9FF] text-slate-700 flex items-center gap-1.5 font-semibold text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">face</span>
                      <span>Scan Muka FACS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchToGame();
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl hover:bg-[#F0F9FF] text-slate-700 flex items-center gap-1.5 font-semibold text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#15803D]">grid_3x3</span>
                      <span>Game XO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCurhat();
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl hover:bg-[#F0F9FF] text-slate-700 flex items-center gap-1.5 font-semibold text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#0284C7]">forum</span>
                      <span>Curhat VibeBot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenJournal();
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl hover:bg-[#F0F9FF] text-slate-700 flex items-center gap-1.5 font-semibold text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#166534]">edit_calendar</span>
                      <span>Jurnal Mood</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sensor indicator, notification bell, user profile avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSwitchToScan}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] text-[11px] font-bold border border-[#BAE6FD] cursor-pointer transition-colors"
              title="Klik untuk buka Live Scan Muka"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]"></span>
              </span>
              <span>Dual-Sensing Aktif (Pindai Muka)</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer relative"
                title="Notifikasi Siswa"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38BDF8]"></span>
              </button>

              {showNotificationPopup && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 z-50 text-left animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="font-bold text-[12px] text-slate-900">Notifikasi</span>
                    <span className="text-[10px] text-[#0284C7] font-semibold">Tandai Dibaca</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchToGame();
                        setShowNotificationPopup(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] text-slate-800 text-left transition-colors cursor-pointer block"
                    >
                      <b className="block text-[#0284C7]">Mini Game XO (Pereda Stres) 🎮</b>
                      Rehat sejenak dengan permainan Tic-Tac-Toe yang santai. Klik untuk mulai main.
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenJournal();
                        setShowNotificationPopup(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-left transition-colors cursor-pointer block"
                    >
                      <b className="block text-slate-900">Afirmasi Hari Ini ✨</b>
                      "Satu langkah kecil hari ini sudah sangat berharga." Klik untuk catat mood.
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Greeting Avatar ("Halo Farel! ⛅") */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#38BDF8]"
              />
              <div className="text-left hidden md:block">
                <span className="block text-[13px] font-bold text-slate-900 leading-none">
                  Halo {student.name}! ⛅
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {student.school}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 3. SOFT SKY BLUE HEADER BANNER (#38BDF8)                  */}
        {/* ========================================================= */}
        <section className="w-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white pt-8 pb-20 px-6 sm:px-10 relative overflow-hidden shadow-sm">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-[#38BDF8]/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/30">
                <span className="material-symbols-outlined text-[14px]">sports_esports</span>
                <span>Ruang Bermain &amp; Regulasi Emosi Siswa</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-white">
                Dashboard Kesehatan Mental &amp; Ruang Main
              </h1>
              <p className="text-[14px] sm:text-[15px] text-sky-100 leading-relaxed max-w-xl">
                Lakukan skrining emosi lewat curhat atau mini-game interaktif.
              </p>
            </div>

            {/* Header Action Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleSwitchToScan}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0284C7] font-bold text-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-[#F0F9FF] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] active:scale-98 transition-all cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[20px] text-[#0284C7] group-hover:scale-110 transition-transform">
                  face
                </span>
                <span>Start Live Scan Muka 📷</span>
              </button>

              <button
                onClick={handleSwitchToGame}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md font-semibold text-[14px] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">grid_3x3</span>
                <span>Game XO Pereda Stres 🎮</span>
              </button>

              <button
                onClick={() => onOpenCurhat()}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#0284C7]/40 hover:bg-[#0284C7]/60 text-white border border-white/30 backdrop-blur-md font-semibold text-[14px] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                <span>Curhat VibeBot AI</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. 4 METRIC CARDS OVERLAPPING HEADER BANNER               */}
        {/* ========================================================= */}
        <section className="max-w-7xl w-full mx-auto px-6 sm:px-10 -mt-12 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Curhat & Game */}
            <div
              onClick={handleSwitchToGame}
              className="bg-white rounded-[22px] p-5 shadow-[0_10px_25px_-5px_rgba(56,189,248,0.12)] border border-[#E2E8F0] hover:-translate-y-1 hover:border-[#38BDF8] transition-all text-left flex flex-col justify-between cursor-pointer group"
              title="Klik untuk buka Game XO"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#0284C7] transition-colors">
                  Total Curhat &amp; Game
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">videogame_asset</span>
                </div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E293B]">24 Sesi</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">+6 sesi &amp; game minggu ini</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1]">
                    Buka ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Status Mood / Stres */}
            <div
              onClick={onOpenJournal}
              className="bg-white rounded-[22px] p-5 shadow-[0_10px_25px_-5px_rgba(56,189,248,0.12)] border border-[#E2E8F0] hover:-translate-y-1 hover:border-[#10B981] transition-all text-left flex flex-col justify-between cursor-pointer group"
              title="Klik untuk buka Jurnal Mood"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#15803D] transition-colors">
                  Status Mood / Stres
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">sentiment_satisfied</span>
                </div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E293B]">12% Rendah</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Kondisi Stabil &amp; Bahagia</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    Jurnal ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Screen Time */}
            <div
              onClick={handleSwitchToScan}
              className="bg-white rounded-[22px] p-5 shadow-[0_10px_25px_-5px_rgba(56,189,248,0.12)] border border-[#E2E8F0] hover:-translate-y-1 hover:border-[#38BDF8] transition-all text-left flex flex-col justify-between cursor-pointer group"
              title="Klik untuk Scan Muka FACS"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#0284C7] transition-colors">
                  Screen Time &amp; FACS
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">devices</span>
                </div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E293B]">3.8 Jam / hari</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Mata &amp; otot wajah terjaga</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1]">
                    Pindai ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Langkah Harian */}
            <div
              onClick={() => {
                onOpenJournal();
              }}
              className="bg-white rounded-[22px] p-5 shadow-[0_10px_25px_-5px_rgba(56,189,248,0.12)] border border-[#E2E8F0] hover:-translate-y-1 hover:border-[#10B981] transition-all text-left flex flex-col justify-between cursor-pointer group"
              title="Klik untuk catat aktivitas harian"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#15803D] transition-colors">
                  Langkah Harian
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">directions_walk</span>
                </div>
              </div>
              <div>
                <div className="text-[26px] font-extrabold text-[#1E293B]">7,420 Langkah</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Target 8k • 92% tercapai</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                    Sehat 🌟
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MAIN CONTENT GRID (60% Game Widget & 40% History)     */}
        {/* ========================================================= */}
        <section className="max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ===================================================== */}
            {/* LEFT WIDGET (60% width): Interactive Tool Tabs        */}
            {/* ===================================================== */}
            <div ref={mainWidgetRef} className="lg:col-span-7 space-y-4">
              {/* Tab Selector Pills */}
              <div className="bg-white p-1.5 rounded-2xl border border-[#CBD5E1] shadow-xs flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveTabWidget('scan')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTabWidget === 'scan'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">face</span>
                    <span>Live Scan Muka &amp; FACS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTabWidget('game')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTabWidget === 'game'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">grid_3x3</span>
                    <span>Game XO Pereda Stres</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenScreening}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] transition-colors cursor-pointer"
                  title="Buka Skrining 3 Menit Lengkap"
                >
                  <span className="material-symbols-outlined text-[15px]">vital_signs</span>
                  <span>Skrining 3 Menit</span>
                </button>
              </div>

              {/* Active Widget View */}
              {activeTabWidget === 'scan' ? (
                <FacialScanAnalytics
                  onStartCurhatWithTelemetry={(msg) => onOpenCurhat(msg)}
                  onOpenFullScreening={onOpenScreening}
                  onScanComplete={handleScanComplete}
                  onOpenDirectory={onOpenDirectory}
                />
              ) : (
                <TicTacToeGame
                  onGameEnd={(winner) => {
                    console.log('XO Game finished. Result:', winner);
                  }}
                />
              )}
            </div>

            {/* ===================================================== */}
            {/* RIGHT WIDGET (40% width): Catatan Aktivitas           */}
            {/* ===================================================== */}
            <div className="lg:col-span-5 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(56,189,248,0.08)] border border-[#E2E8F0] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-bold text-[16px] text-[#1E293B] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0284C7]">history</span>
                      Catatan Aktivitas &amp; Skrining
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Riwayat sesi curhat &amp; pereda stres terkini.
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-bold text-[11px]">
                    {filteredActivities.length} Sesi
                  </span>
                </div>

                {/* Activity List Cards */}
                <div className="space-y-3">
                  {filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0F9FF] border border-slate-100 hover:border-[#BAE6FD] transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {act.icon}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[13px] text-[#1E293B] block leading-tight">
                              {act.name}
                            </span>
                            <span className="text-[11px] text-slate-500">{act.time}</span>
                          </div>
                        </div>

                        {/* Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            act.stressBadgeType === 'low'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#E0F2FE] text-[#0369A1]'
                          }`}
                        >
                          {act.stressBadgeText}
                        </span>
                      </div>

                      {/* Progress and Score */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-600 font-medium">{act.statusScore}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#38BDF8] rounded-full"
                              style={{ width: `${act.progressPercent}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-[#0284C7] text-[10px]">
                            {act.progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Hub Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenCurhat()}
                  className="py-2.5 px-3 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0284C7] font-bold text-[12px] border border-[#BAE6FD] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  <span>Curhat AI</span>
                </button>
                <button
                  onClick={onOpenJournal}
                  className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold text-[12px] border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  <span>Kalender Mood</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. ENHANCED ADJUSTED REALTIME CHARTS & MAPS LOCATION HUB  */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* Dynamic Realtime Charts Container */}
            <div className="lg:col-span-7 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(56,189,248,0.08)] border border-[#E2E8F0] text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider block">
                    Analitik Fluktuasi Mental &amp; Biosensing
                  </span>
                  <h3 className="font-extrabold text-[16px] text-[#1E293B]">
                    Grafik Tren Suasana Hati &amp; Biosensing Realtime
                  </h3>
                </div>

                {/* Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setChartViewMode('realtime')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartViewMode === 'realtime'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Live 10Hz
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('area')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartViewMode === 'area'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📈 7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('radar')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      chartViewMode === 'radar'
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎯 Radar
                  </button>
                </div>
              </div>

              {/* View 1: Realtime Live Oscilloscope (10 Hz Stream) */}
              {chartViewMode === 'realtime' && (
                <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-sky-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>TELEMETRI GELOMBANG BIO-SENSORIK REALTIME</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      LIVE STREAM • BUFFER: 100 PTS
                    </span>
                  </div>

                  <div className="h-44 w-full flex items-center justify-center relative">
                    <canvas ref={dashGraphRef} width={650} height={170} className="w-full h-full rounded-xl" />
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">― Indeks Ketenangan Pikiran (Calming Index 82%)</span>
                    <span className="text-sky-400 font-semibold">--- Tegangan Mikro FACS (AU4/AU12 18%)</span>
                    <span className="text-slate-300">Frekuensi: 10 Hz Realtime</span>
                  </div>
                </div>
              )}

              {/* View 2: 7-Day Area Chart */}
              {chartViewMode === 'area' && (
                <div className="w-full bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 relative">
                  <div className="h-44 w-full flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160">
                      <defs>
                        <linearGradient id="dashMoodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="30" x2="700" y2="30" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="80" x2="700" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="130" x2="700" y2="130" stroke="#CBD5E1" />

                      {(() => {
                        const recent = moodEntries.slice(-7);
                        if (recent.length === 0) return null;
                        const points = recent.map((item, i) => {
                          const x = (i / Math.max(recent.length - 1, 1)) * 600 + 50;
                          const y = 130 - (item.score / 10) * 100;
                          return { x, y, item };
                        });
                        const pathData = points.reduce((acc, pt, i) => {
                          return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
                        }, '');
                        const areaData = `${pathData} L ${points[points.length - 1].x},130 L ${points[0].x},130 Z`;

                        return (
                          <>
                            <path d={areaData} fill="url(#dashMoodGrad)" />
                            <path d={pathData} fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                            {points.map((pt, i) => (
                              <g key={i}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="5.5"
                                  fill="#FFFFFF"
                                  stroke={pt.item.score >= 7 ? '#10B981' : pt.item.score >= 5 ? '#0284C7' : '#F59E0B'}
                                  strokeWidth="2.5"
                                />
                                <text x={pt.x} y={pt.y - 10} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                                  {pt.item.moodEmoji} {pt.item.score}
                                </text>
                                <text x={pt.x} y="146" fontSize="10" fontWeight="600" textAnchor="middle" fill="#64748B">
                                  {pt.item.dayName.slice(0, 3)}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {/* View 3: Radar 5-Dimensi */}
              {chartViewMode === 'radar' && (
                <div className="w-full bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center justify-around h-48">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon points="50,10 90,38 75,85 25,85 10,38" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                      <polygon points="50,25 75,44 65,75 35,75 25,44" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                      {/* Active biometric polygon */}
                      <polygon points="50,18 78,42 62,70 32,80 20,40" fill="#0284C7" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="text-[11px] space-y-1.5 text-slate-600">
                    <div><b>Ketenangan (Valence):</b> 85% (Optimal)</div>
                    <div><b>Stabilitas Wajah:</b> 92% (Tinggi)</div>
                    <div><b>Kekuatan Vokal:</b> 78% (Jelas)</div>
                    <div><b>Ketahanan Stres:</b> 80% (Kuat)</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-emerald-700 font-bold block">Status Rileks</span>
                  <span className="text-emerald-900 font-extrabold text-[13px]">82% Dominan</span>
                </div>
                <div className="p-2 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-sky-700 font-bold block">Rata-Rata Mood</span>
                  <span className="text-sky-900 font-extrabold text-[13px]">6.8 / 10</span>
                </div>
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-purple-700 font-bold block">Supresi Emosi</span>
                  <span className="text-purple-900 font-extrabold text-[13px]">Rendah (Aman)</span>
                </div>
              </div>
            </div>

            {/* Google Maps GPS Faskes Hub Card */}
            <div className="lg:col-span-5 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(56,189,248,0.08)] border border-[#E2E8F0] text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                    GPS &amp; Google Maps Terhubung
                  </span>
                  <h3 className="font-extrabold text-[16px] text-[#1E293B] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">location_on</span>
                    Faskes Terdekat Realtime
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={refreshDashboardGPS}
                  disabled={isDetectingLocation}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer hover:bg-emerald-200 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isDetectingLocation ? 'animate-spin' : 'animate-ping'}`}></span>
                  <span>{isDetectingLocation ? 'Mencari...' : 'Sync GPS'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
                <div className="flex items-start justify-between text-[11px] gap-2">
                  <span className="text-sky-300 font-bold">📍 {nearestFaskes.name}</span>
                  <span className="text-emerald-400 font-mono font-bold whitespace-nowrap bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {nearestFaskes.distance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {nearestFaskes.address}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-700/60">
                  <span>GPS: {dashboardGpsCoords.lat.toFixed(4)}, {dashboardGpsCoords.lng.toFixed(4)}</span>
                  <span className="text-sky-300 font-semibold">{dashboardGpsCoords.city}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenDirectory}
                    className="flex-1 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">map</span>
                    <span>Buka Peta &amp; Rute Google Maps</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenEmergency}
                    className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">emergency</span>
                    <span>119</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Status Sensor Realtime:</span>
                  <span className="text-emerald-600 font-bold">● Semua Aktif (Online)</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                  <span className="bg-white p-1 rounded border border-slate-200 text-center font-medium">📷 FACS ON</span>
                  <span className="bg-white p-1 rounded border border-slate-200 text-center font-medium">🎤 Mic Audio</span>
                  <span className="bg-white p-1 rounded border border-slate-200 text-center font-medium">📍 Bengkulu / GPS</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
