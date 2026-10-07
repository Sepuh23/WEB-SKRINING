import React, { useState } from 'react';
import { Appointment, StudentProfile } from '../types';

interface PsikologPortalProps {
  currentPsikolog: StudentProfile;
  appointments: Appointment[];
  onUpdateAppointmentStatus: (
    id: string,
    status: Appointment['status'],
    counselorNotes?: string,
    actionPlan?: string
  ) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: 'siswa' | 'guru_bk' | 'psikolog' | 'admin') => void;
}

export const PsikologPortal: React.FC<PsikologPortalProps> = ({
  currentPsikolog,
  appointments,
  onUpdateAppointmentStatus,
  onNavigateHome,
  onLogout,
  onSwitchRole,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter appointments for clinical psychology
  const psiAppointments = appointments.filter(
    (apt) => apt.counselorType === 'psikolog' || apt.counselorId === 'c3' || apt.counselorId === 'c4'
  );

  const filteredList = psiAppointments.filter((apt) => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.studentName.toLowerCase().includes(q) ||
        apt.topic.toLowerCase().includes(q) ||
        apt.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setClinicalNotes(apt.counselorNotes || '');
    setTreatmentPlan(apt.actionPlan || '');
  };

  const handleSaveClinicalNotes = (statusToSet: Appointment['status']) => {
    if (!selectedAppointment) return;
    onUpdateAppointmentStatus(selectedAppointment.id, statusToSet, clinicalNotes, treatmentPlan);
    setSelectedAppointment({
      ...selectedAppointment,
      status: statusToSet,
      counselorNotes: clinicalNotes,
      actionPlan: treatmentPlan,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                🧠
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 leading-tight block">
                  PORTAL PSIKOLOG KLINIS
                </span>
                <span className="text-[10px] font-semibold text-purple-700 block">
                  Biro Psikologi Lentera Jiwa & Mitra Klinis PSY-VIBE
                </span>
              </div>
            </button>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Mode Role:</span>
            {onSwitchRole && (
              <>
                <button
                  onClick={() => onSwitchRole('siswa')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-white transition cursor-pointer font-medium"
                >
                  🎒 Siswa 1 / 2
                </button>
                <button
                  onClick={() => onSwitchRole('guru_bk')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-white transition cursor-pointer font-medium"
                >
                  🏫 Guru BK
                </button>
                <button
                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  🧠 Psikolog
                </button>
                <button
                  onClick={() => onSwitchRole('admin')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-white transition cursor-pointer font-medium"
                >
                  ⚡ Admin
                </button>
              </>
            )}
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-right">
              <img
                src={currentPsikolog.avatar}
                alt={currentPsikolog.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-purple-400"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentPsikolog.name}</div>
                <div className="text-[10px] text-purple-700 font-semibold">Psikolog Klinis Berlisensi</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-purple-100 text-xs font-semibold backdrop-blur mb-2">
                <span>🛡️ Ruang Asesmen & Telekonseling Klinis Remaja</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                Selamat Datang, {currentPsikolog.name}
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
                Kelola sesi konseling klinis mendalam, asesmen risiko depresi terselubung (smiling depression), dan rencana intervensi CBT untuk siswa.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/20 text-center min-w-[120px]">
                <div className="text-2xl font-black text-amber-300">
                  {psiAppointments.filter((a) => a.status === 'confirmed').length}
                </div>
                <div className="text-[11px] font-semibold text-purple-100">Sesi Terjadwal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List Left */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(['all', 'confirmed', 'pending', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                      filterStatus === st
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st === 'confirmed' ? 'Terjadwal' : st === 'pending' ? 'Menunggu' : 'Selesai'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari janji temu..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-400 bg-slate-50"
                />
                <span className="material-symbols-outlined text-[14px] text-slate-400 absolute left-2 top-2">
                  search
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredList.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => handleOpenDetail(apt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
                    selectedAppointment?.id === apt.id
                      ? 'border-purple-500 ring-2 ring-purple-300 shadow-md'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={apt.studentAvatar}
                        alt={apt.studentName}
                        className="w-11 h-11 rounded-full object-cover border border-purple-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{apt.studentName}</h3>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {apt.category}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">{apt.topic}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-700">📅 {apt.date}</span>
                      <span className="font-medium text-slate-700">⏰ {apt.time}</span>
                      <span className="text-purple-700 font-semibold">
                        {apt.mode === 'online_video' ? '📹 Telekonseling GMeet' : '🏥 Tatap Muka Klinik'}
                      </span>
                    </div>

                    {apt.mode === 'online_video' && (
                      <a
                        href={apt.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <span>🔗 Buka Ruang Meet</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Detail */}
          <div className="lg:col-span-5">
            {selectedAppointment ? (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm text-left space-y-4 sticky top-20">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      Rekam Sesi Psikologi
                    </span>
                    <h2 className="font-bold text-base text-slate-900">
                      {selectedAppointment.studentName}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {selectedAppointment.studentSchool}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                    <div className="text-purple-900 font-bold mb-1">Topik & Keluhan Klinis:</div>
                    <div className="text-slate-800 font-medium">{selectedAppointment.topic}</div>
                    {selectedAppointment.notes && (
                      <div className="text-slate-600 mt-2 text-[11px] pt-2 border-t border-purple-200/60">
                        {selectedAppointment.notes}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Catatan Asesmen & Observasi Klinis:
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Tuliskan catatan dinamika psikologis, mekanisme koping, atau hasil wawancara..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Rencana Intervensi & Terapi (Treatment Plan):
                    </label>
                    <input
                      type="text"
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      placeholder="Contoh: CBT Cognitive Restructuring & Reframing ekspresi wajah"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleSaveClinicalNotes('confirmed')}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    ✓ Konfirmasi Sesi
                  </button>
                  <button
                    onClick={() => handleSaveClinicalNotes('completed')}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    ✓ Tandai Selesai
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                Pilih salah satu jadwal konsultasi di sebelah kiri untuk melihat detail klinis.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
