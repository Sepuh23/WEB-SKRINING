import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { LocationPermissionBanner } from './LocationPermissionBanner';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenDashboard?: () => void;
  currentStudent: StudentProfile | null;
  onLocationUpdate?: (coords: { lat: number; lng: number; accuracy: number; city: string; source: string }) => void;
  onOpenDirectory?: () => void;
  onOpenEditProfile?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  onOpenLogin,
  onOpenDashboard,
  currentStudent,
  onLocationUpdate,
  onOpenDirectory,
  onOpenEditProfile,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardInfo = () => {
    if (!currentStudent) return { label: 'Dashboard', icon: 'dashboard', color: 'bg-[#38bdf8]' };
    if (currentStudent.userRoleType === 'guru_bk') return { label: 'Portal Guru BK', icon: 'school', color: 'bg-amber-600' };
    if (currentStudent.userRoleType === 'psikolog') return { label: 'Portal Psikolog', icon: 'psychology', color: 'bg-purple-600' };
    if (currentStudent.userRoleType === 'admin') return { label: 'Portal Admin', icon: 'admin_panel_settings', color: 'bg-slate-900' };
    return { label: 'Dashboard Siswa', icon: 'dashboard', color: 'bg-[#0284c7]' };
  };

  const dashInfo = getDashboardInfo();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-b border-[#f0f3ff]">
      {/* Realtime GPS Status & Permission Action Bar */}
      <LocationPermissionBanner
        onLocationUpdate={onLocationUpdate}
        onOpenDirectory={onOpenDirectory || (() => onNavigate('faskes-terdekat'))}
      />

      <div className="h-16 md:h-18 w-full px-4 sm:px-6 md:px-10 flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#38bdf8] flex items-center justify-center text-[#004965] shadow-[0_4px_14px_rgba(56,189,248,0.28)] transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[22px] text-white">favorite</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[20px] leading-tight tracking-tight text-[#111c2d]">
                PSY-VIBE
              </span>
              <span className="text-[11px] font-semibold text-[#00668a] -mt-0.5 tracking-wide">
                Youth Sanctuary
              </span>
            </div>
          </button>
        </div>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#f0f3ff] border border-[#e7eeff]">
          <button
            onClick={() => onNavigate('beranda')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'beranda'
                ? 'bg-[#dee8ff] text-[#111c2d] shadow-xs'
                : 'text-[#3e484f] hover:text-[#111c2d] hover:bg-[#e7eeff]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onNavigate('fitur-utama')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'fitur-utama'
                ? 'bg-[#dee8ff] text-[#111c2d] shadow-xs'
                : 'text-[#3e484f] hover:text-[#111c2d] hover:bg-[#e7eeff]'
            }`}
          >
            Fitur Utama
          </button>
          <button
            onClick={() => onNavigate('cara-kerja')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'cara-kerja'
                ? 'bg-[#dee8ff] text-[#111c2d] shadow-xs'
                : 'text-[#3e484f] hover:text-[#111c2d] hover:bg-[#e7eeff]'
            }`}
          >
            Cara Kerja
          </button>
          <button
            onClick={() => onNavigate('faskes-terdekat')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all cursor-pointer ${
              activeTab === 'faskes-terdekat'
                ? 'bg-[#dee8ff] text-[#111c2d] shadow-xs'
                : 'text-[#3e484f] hover:text-[#111c2d] hover:bg-[#e7eeff]'
            }`}
          >
            Faskes Terdekat
          </button>
          {currentStudent && onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? `${dashInfo.color} text-white shadow-xs`
                  : 'text-[#00668a] hover:bg-[#dee8ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{dashInfo.icon}</span>
              <span>{dashInfo.label}</span>
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {currentStudent ? (
            <>
              {onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${dashInfo.color} text-white hover:opacity-95 font-bold text-[13px] shadow-xs transition-all cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[16px]">{dashInfo.icon}</span>
                  <span>{dashInfo.label}</span>
                </button>
              )}
              {onOpenEditProfile && (
                <button
                  onClick={onOpenEditProfile}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#e0f2fe] text-[#0284c7] hover:bg-[#bae6fd] font-bold text-[12px] transition-all cursor-pointer"
                  title="Edit Nama, Username & Password Saya"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  <span>Edit Akun</span>
                </button>
              )}
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#f0f3ff] border border-[#dee8ff] hover:bg-[#dee8ff] transition-all cursor-pointer"
                title="Buka / Ganti Akun"
              >
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#38bdf8]"
                />
                <div className="text-left hidden sm:block">
                  <span className="block text-[12px] font-bold text-[#111c2d] leading-none">
                    {currentStudent.name}
                  </span>
                  <span className="block text-[10px] text-[#00668a] leading-tight">
                    {currentStudent.school}
                  </span>
                </div>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[12px] border border-rose-200 transition-all cursor-pointer"
                  title="Keluar dari akun"
                >
                  <span className="material-symbols-outlined text-[15px]">logout</span>
                  <span>Keluar</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="hidden sm:inline-flex px-4 py-2 rounded-full text-[14px] font-semibold text-[#00668a] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
              >
                Login Akun Siswa
              </button>
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#38bdf8] text-white font-semibold text-[14px] shadow-[0_4px_14px_rgba(56,189,248,0.28)] hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              >
                Login / Masuk
              </button>
            </>
          )}

          <div
            onClick={onOpenLogin}
            title={currentStudent ? currentStudent.name : 'Profil Pengguna'}
            className="w-8 h-8 rounded-full bg-[#00668a] flex items-center justify-center text-white cursor-pointer hover:bg-[#004c69] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#576065] hover:text-[#111c2d] rounded-lg"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#f0f3ff] bg-white px-6 py-4 flex flex-col gap-3 shadow-lg">
          {currentStudent && onOpenDashboard && (
            <button
              onClick={() => {
                onOpenDashboard();
                setMobileMenuOpen(false);
              }}
              className="text-left font-bold text-[15px] py-1 text-[#00668a] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Dashboard Siswa ({currentStudent.name})
            </button>
          )}
          <button
            onClick={() => {
              onNavigate('beranda');
              setMobileMenuOpen(false);
            }}
            className="text-left font-semibold text-[15px] py-1 text-[#111c2d]"
          >
            Beranda
          </button>
          <button
            onClick={() => {
              onNavigate('fitur-utama');
              setMobileMenuOpen(false);
            }}
            className="text-left font-semibold text-[15px] py-1 text-[#111c2d]"
          >
            5 Fitur Utama Platform
          </button>
          <button
            onClick={() => {
              onNavigate('cara-kerja');
              setMobileMenuOpen(false);
            }}
            className="text-left font-semibold text-[15px] py-1 text-[#111c2d]"
          >
            Teknologi Dual-Sensing
          </button>
          <button
            onClick={() => {
              onNavigate('faskes-terdekat');
              setMobileMenuOpen(false);
            }}
            className="text-left font-semibold text-[15px] py-1 text-[#111c2d]"
          >
            Direktori Faskes &amp; Psikolog (GPS)
          </button>
          <div className="pt-2 border-t border-[#f0f3ff] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center rounded-full bg-[#f0f3ff] text-[#00668a] font-semibold text-[14px]"
            >
              {currentStudent ? `Profil / Ganti: ${currentStudent.name}` : 'Login Akun Siswa'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
