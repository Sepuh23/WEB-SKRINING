import React, { useState } from 'react';
import { Appointment, StudentProfile, UserAccount } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

interface AdminPortalProps {
  currentAdmin: StudentProfile;
  appointments: Appointment[];
  users: UserAccount[];
  onNavigateHome: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: 'siswa' | 'guru_bk' | 'psikolog' | 'admin') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentAdmin,
  appointments,
  users,
  onNavigateHome,
  onLogout,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'janji_temu' | 'pengguna' | 'analitik'>('janji_temu');
  const [filterType, setFilterType] = useState<'all' | 'guru_bk' | 'psikolog'>('all');

  const filteredAppointments = appointments.filter((a) => {
    if (filterType !== 'all' && a.counselorType !== filterType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onNavigateHome} className="flex items-center gap-2 text-left cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow font-black text-lg">
                ⚡
              </div>
              <div>
                <span className="font-extrabold text-base text-white leading-tight block">
                  ADMIN PUSAT KENDALI PSY-VIBE
                </span>
                <span className="text-[10px] font-semibold text-amber-400 block">
                  Master System Administration &amp; Multi-Role Management
                </span>
              </div>
            </button>
          </div>

          {/* Role Simulator Switcher */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Simulasi Role:</span>
            {onSwitchRole && (
              <>
                <button
                  onClick={() => onSwitchRole('siswa')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🎒 Siswa 1 / 2
                </button>
                <button
                  onClick={() => onSwitchRole('guru_bk')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🏫 Guru BK
                </button>
                <button
                  onClick={() => onSwitchRole('psikolog')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🧠 Psikolog
                </button>
                <button
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs transition cursor-pointer"
                >
                  ⚡ Admin
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{currentAdmin.name}</div>
              <div className="text-[10px] text-amber-400 font-semibold">Super Admin</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition cursor-pointer"
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* Top Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Total Janji Temu Terdaftar</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{appointments.length}</div>
            <div className="text-[10px] text-emerald-400 mt-1">✓ Termasuk BK &amp; Psikolog</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Janji Temu ke Guru BK</div>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {appointments.filter((a) => a.counselorType === 'guru_bk').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Konseling Akademik &amp; Sekolah</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Janji Temu ke Psikolog</div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {appointments.filter((a) => a.counselorType === 'psikolog').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Konseling Klinis &amp; CBT</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Pengguna Aktif (Multi-Role)</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{users.length || DEFAULT_USERS.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Siswa, BK, Psikolog, Admin</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('janji_temu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'janji_temu' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Seluruh Janji Temu Platform
          </button>
          <button
            onClick={() => setActiveTab('pengguna')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pengguna' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👥 Manajemen Akun &amp; Role
          </button>
        </div>

        {/* Tab 1: All Appointments */}
        {activeTab === 'janji_temu' && (
          <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-md space-y-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-base text-white">
                Daftar Seluruh Janji Temu Siswa ke Guru BK &amp; Psikolog
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('guru_bk')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'guru_bk' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  🏫 Guru BK Saja
                </button>
                <button
                  onClick={() => setFilterType('psikolog')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'psikolog' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  🧠 Psikolog Saja
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-300 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Siswa</th>
                    <th className="p-3">Tujuan Konseling</th>
                    <th className="p-3">Konselor / Guru</th>
                    <th className="p-3">Topik</th>
                    <th className="p-3">Jadwal</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-700/40">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <img
                          src={apt.studentAvatar}
                          alt={apt.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-600"
                        />
                        {apt.studentName}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            apt.counselorType === 'guru_bk'
                              ? 'bg-sky-900/80 text-sky-200 border border-sky-700'
                              : 'bg-purple-900/80 text-purple-200 border border-purple-700'
                          }`}
                        >
                          {apt.counselorType === 'guru_bk' ? '🏫 Guru BK' : '🧠 Psikolog'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-medium">{apt.counselorName}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{apt.topic}</td>
                      <td className="p-3 text-slate-300">
                        {apt.date} <span className="text-slate-400">({apt.time})</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {apt.mode === 'online_video' ? '📹 Video Call' : '🏫 Tatap Muka'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                              : apt.status === 'pending'
                              ? 'bg-amber-900/80 text-amber-300 border border-amber-700 animate-pulse'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'pengguna' && (
          <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-md space-y-4 text-left">
            <h2 className="font-bold text-base text-white">Manajemen Akun Multi-Role Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_USERS.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/60"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{u.name}</div>
                      <div className="text-xs text-amber-400 font-semibold">{u.role}</div>
                      <div className="text-[10px] text-slate-400">{u.school}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] font-mono text-slate-300 space-y-1">
                    <div>Username: <span className="text-amber-300">{u.username}</span></div>
                    <div>Password: <span className="text-emerald-300">{u.password}</span></div>
                    <div>Role Type: <span className="text-sky-300 font-bold uppercase">{u.userRoleType}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
