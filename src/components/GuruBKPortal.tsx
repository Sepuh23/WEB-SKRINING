import React, { useState } from 'react';
import { Appointment, StudentProfile, UserAccount } from '../types';

interface GuruBKPortalProps {
  currentGuru: StudentProfile;
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

export const GuruBKPortal: React.FC<GuruBKPortalProps> = ({
  currentGuru,
  appointments,
  onUpdateAppointmentStatus,
  onNavigateHome,
  onLogout,
  onSwitchRole,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [counselorNoteInput, setCounselorNoteInput] = useState('');
  const [actionPlanInput, setActionPlanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'janji_temu' | 'skrining_siswa' | 'jadwal_bk'>('janji_temu');

  // Filter appointments specifically for Guru BK or school BK
  const bkAppointments = appointments.filter(
    (apt) => apt.counselorType === 'guru_bk' || apt.counselorId === 'c1' || apt.counselorId === 'c2'
  );

  const filteredList = bkAppointments.filter((apt) => {
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

  const pendingCount = bkAppointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = bkAppointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = bkAppointments.filter((a) => a.status === 'completed').length;

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setCounselorNoteInput(apt.counselorNotes || '');
    setActionPlanInput(apt.actionPlan || '');
  };

  const handleSaveNotes = (statusToSet: Appointment['status']) => {
    if (!selectedAppointment) return;
    onUpdateAppointmentStatus(selectedAppointment.id, statusToSet, counselorNoteInput, actionPlanInput);
    setSelectedAppointment({
      ...selectedAppointment,
      status: statusToSet,
      counselorNotes: counselorNoteInput,
      actionPlan: actionPlanInput,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm font-bold">
                🏫
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 leading-tight block">
                  PORTAL GURU BK
                </span>
                <span className="text-[10px] font-semibold text-sky-700 block">
                  SMA Negeri 1 • Bimbingan Konseling Siswa
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
                  className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  🏫 Guru BK
                </button>
                <button
                  onClick={() => onSwitchRole('psikolog')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-white transition cursor-pointer font-medium"
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
                src={currentGuru.avatar}
                alt={currentGuru.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-sky-400"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentGuru.name}</div>
                <div className="text-[10px] text-sky-600 font-semibold">Guru BK Aktif</div>
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

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* Welcome Banner & Stats Card */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-sky-100 text-xs font-semibold backdrop-blur mb-2">
                <span>📍 Bengkulu Digital Guidance Sanctuary</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">
                Selamat Bertugas, {currentGuru.name}!
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
                Pantau janji temu konseling siswa binaan, berikan catatan tindak lanjut, dan deteksi dini indikator stres akademik maupun pertemanan.
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</div>
                <div className="text-[10px] font-semibold text-sky-100">Menunggu</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-300">{confirmedCount}</div>
                <div className="text-[10px] font-semibold text-sky-100">Terjadwal</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                <div className="text-xl sm:text-2xl font-black text-sky-200">{completedCount}</div>
                <div className="text-[10px] font-semibold text-sky-100">Selesai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('janji_temu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'janji_temu'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📅 Janji Temu Masuk Siswa</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-black">
              {bkAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('skrining_siswa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'skrining_siswa'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📊 Skrining FACS & Emosi Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('jadwal_bk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'jadwal_bk'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🕒 Slot Jadwal Konseling BK</span>
          </button>
        </div>

        {/* Content: Janji Temu Tab */}
        {activeTab === 'janji_temu' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* List Left Column */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'pending', 'confirmed', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                        filterStatus === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all'
                        ? 'Semua'
                        : st === 'pending'
                        ? 'Menunggu'
                        : st === 'confirmed'
                        ? 'Disetujui'
                        : 'Selesai'}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari siswa/topik..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 bg-slate-50"
                  />
                  <span className="material-symbols-outlined text-[14px] text-slate-400 absolute left-2 top-2">
                    search
                  </span>
                </div>
              </div>

              {/* List Cards */}
              <div className="space-y-3">
                {filteredList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                    Tidak ada data janji temu untuk filter ini.
                  </div>
                ) : (
                  filteredList.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenDetail(apt)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left ${
                        selectedAppointment?.id === apt.id
                          ? 'border-sky-500 ring-2 ring-sky-300 shadow-md'
                          : 'border-slate-200 hover:border-sky-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={apt.studentAvatar}
                            alt={apt.studentName}
                            className="w-11 h-11 rounded-full object-cover border border-sky-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900">{apt.studentName}</h3>
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {apt.studentClass || 'Siswa SMA 1'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-sky-800 mt-0.5">{apt.topic}</div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : apt.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {apt.status === 'confirmed'
                            ? '✓ Disetujui'
                            : apt.status === 'pending'
                            ? '⏳ Menunggu'
                            : 'Selesai'}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            📅 {apt.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            ⏰ {apt.time}
                          </span>
                          <span className="text-sky-700 font-medium">
                            {apt.mode === 'tatap_muka' ? '🏫 Tatap Muka' : '📹 Video Call'}
                          </span>
                        </div>

                        {apt.stressLevel && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              apt.stressLevel === 'tinggi'
                                ? 'bg-rose-100 text-rose-700'
                                : apt.stressLevel === 'sedang'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            Stres {apt.stressLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Detail Right Column */}
            <div className="lg:col-span-5">
              {selectedAppointment ? (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm text-left space-y-4 sticky top-20">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                        Detail Janji Temu BK
                      </span>
                      <h2 className="font-bold text-base text-slate-900">
                        {selectedAppointment.studentName}
                      </h2>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        selectedAppointment.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedAppointment.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>

                  {/* Info Table */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                      <div className="text-slate-500 font-medium">Topik Konsultasi:</div>
                      <div className="font-bold text-slate-900">{selectedAppointment.topic}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50">
                        <div className="text-slate-500 font-medium text-[10px]">Jadwal:</div>
                        <div className="font-bold text-slate-800 text-xs">
                          {selectedAppointment.date} ({selectedAppointment.time})
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50">
                        <div className="text-slate-500 font-medium text-[10px]">Lokasi / Media:</div>
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {selectedAppointment.locationOrLink}
                        </div>
                      </div>
                    </div>

                    {selectedAppointment.notes && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
                        <div className="text-amber-800 font-bold text-[11px]">Catatan Keluhan Siswa:</div>
                        <div className="text-slate-700 text-xs mt-1">{selectedAppointment.notes}</div>
                      </div>
                    )}
                  </div>

                  {/* Form Catatan Guru BK */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Catatan & Hasil Konseling Guru BK:
                      </label>
                      <textarea
                        rows={3}
                        value={counselorNoteInput}
                        onChange={(e) => setCounselorNoteInput(e.target.value)}
                        placeholder="Tuliskan ringkasan hasil bimbingan atau observasi terhadap siswa..."
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Rencana Aksi / Tindak Lanjut (Action Plan):
                      </label>
                      <input
                        type="text"
                        value={actionPlanInput}
                        onChange={(e) => setActionPlanInput(e.target.value)}
                        placeholder="Contoh: Latihan relaksasi harian & sesi evaluasi pekan depan"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {selectedAppointment.status === 'pending' && (
                      <button
                        onClick={() => handleSaveNotes('confirmed')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        ✓ Setujui Janji Temu
                      </button>
                    )}

                    {selectedAppointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleSaveNotes('completed')}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        ✓ Selesaikan Sesi Bimbingan
                      </button>
                    )}

                    <button
                      onClick={() => handleSaveNotes(selectedAppointment.status)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      💾 Simpan Catatan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">
                    touch_app
                  </span>
                  Pilih salah satu janji temu di sebelah kiri untuk melihat rincian dan menulis catatan konseling.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Content: Skrining Siswa Tab */}
        {activeTab === 'skrining_siswa' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-left space-y-4">
            <h2 className="font-bold text-base text-slate-900">
              📊 Data Skrining FACS & Deteksi Dini Siswa SMA Negeri 1
            </h2>
            <p className="text-xs text-slate-500">
              Hasil deteksi telemetri emosi siswa secara anonim & terenkripsi untuk pencegahan smiling depression di lingkungan sekolah.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Status FACS</th>
                    <th className="p-3">Mikrotensi</th>
                    <th className="p-3">Nada Suara</th>
                    <th className="p-3 rounded-r-xl">Aksi Rekomendasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Farel (Siswa 1)
                    </td>
                    <td className="p-3 text-slate-600">XI MIPA 2</td>
                    <td className="p-3 text-slate-700">Tenang / Stabil</td>
                    <td className="p-3 font-semibold text-sky-700">14% (Aman)</td>
                    <td className="p-3 text-slate-600">Tenang (88%)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Bimbingan Rutin
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      Ayu Lestari (Siswa 2)
                    </td>
                    <td className="p-3 text-slate-600">X IPS 1</td>
                    <td className="p-3 font-bold text-rose-600">⚠️ Pura-pura Senyum</td>
                    <td className="p-3 font-semibold text-rose-600">68% (Tinggi)</td>
                    <td className="p-3 text-amber-700">Monoton / Lelah</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Rujukan Konseling Psikolog
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content: Jadwal BK Tab */}
        {activeTab === 'jadwal_bk' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-left space-y-4">
            <h2 className="font-bold text-base text-slate-900">🕒 Manajemen Slot Jam Bimbingan Guru BK</h2>
            <p className="text-xs text-slate-500">
              Atur ketersediaan waktu tatap muka di Ruang BK lantai 2 atau sesi daring untuk siswa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {['08:30 - 09:30 WIB', '10:00 - 11:00 WIB', '13:00 - 14:00 WIB', '14:30 - 15:30 WIB'].map((slot, i) => (
                <div key={i} className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 space-y-2">
                  <div className="font-bold text-sm text-sky-950">{slot}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Slot Terbuka
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
