import React, { useState } from 'react';
import { Appointment, StudentProfile, UserAccount } from '../types';
import { useLiveChat } from '../utils/useLiveChat';

const BK_STUDENTS = [
  {
    id: 'u1',
    name: 'Farel (Siswa 1)',
    kelas: 'XI MIPA 2',
    school: 'SMA Negeri 1 Kota Bengkulu',
    topic: 'Stres Ujian Try Out & Beban Tugas',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kqcMzG3sGVMZatNUT_jMqxlZPkCZ_4x8DhohMirEEiFtw-_eeISBn9toFc7JFlcbm8wLEqn0iajJ4HF35xsJm6t2YVI1PIV55XGkZYdJDioaOSr5fkqkLH5TpNpBZk0Ed3Jy7mdy0Mz3m64HGOGuMKRBprtMo3-JaNqQks2pjU3TsiT1uDVgake2AG59-P2vHtCbpRKjM2vxIsWv4vHl7SOiQmU1X37NCeRCwY4',
  },
  {
    id: 'u2',
    name: 'Ayu Lestari (Siswa 2)',
    kelas: 'X IPS 1',
    school: 'SMA Negeri 1 Kota Bengkulu',
    topic: 'Pilihan Jurusan Kuliah & Karir',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
];

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
  onOpenEditProfile?: () => void;
}

export const GuruBKPortal: React.FC<GuruBKPortalProps> = ({
  currentGuru,
  appointments,
  onUpdateAppointmentStatus,
  onNavigateHome,
  onLogout,
  onSwitchRole,
  onOpenEditProfile,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [counselorNoteInput, setCounselorNoteInput] = useState('');
  const [actionPlanInput, setActionPlanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'janji_temu' | 'chat_konseling' | 'skrining_siswa' | 'jadwal_bk'>('janji_temu');

  // Live Chat state for Guru BK (Connected via WebSocket & Server REST)
  const [activeChatStudentId, setActiveChatStudentId] = useState<string>('u1');
  const [chatMessageInput, setChatMessageInput] = useState('');

  const activeStudent = BK_STUDENTS.find((s) => s.id === activeChatStudentId) || BK_STUDENTS[0];
  const activeChannelId = `chat_${[currentGuru.id, activeStudent.id].sort().join('_')}`;

  const {
    messages,
    onlineUsers,
    connectionStatus,
    sendMessage,
  } = useLiveChat(currentGuru, activeChannelId);

  const currentChatMessages = messages.filter((m) => m.channelId === activeChannelId);

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessageInput.trim()) return;
    const textToSend = chatMessageInput.trim();
    setChatMessageInput('');
    await sendMessage(
      {
        id: activeStudent.id,
        name: activeStudent.name,
        role: 'siswa',
      },
      textToSend,
      activeStudent.topic
    );
  };

  const handleInsertTemplate = (tmpl: string) => {
    setChatMessageInput(tmpl);
  };
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
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition cursor-pointer border border-sky-200"
                title="Edit Profil & Password Saya"
              >
                <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                <span>Edit Akun</span>
              </button>
            )}
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
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-rose-200 shadow-xs"
              title="Keluar dari Portal Guru BK"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
            onClick={() => setActiveTab('chat_konseling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'chat_konseling'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-sky-300 text-sky-800'
            }`}
          >
            <span>💬 Chat Konseling Direct</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold animate-pulse">
              LIVE
            </span>
          </button>
          <button
            onClick={() => setActiveTab('skrining_siswa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'skrining_siswa'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📊 Skrining FACS & Emosi Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('jadwal_bk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setActiveChatStudentId(selectedAppointment.studentId === 'u2' || selectedAppointment.studentId === 's2' ? 'u2' : 'u1');
                        setActiveTab('chat_konseling');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>💬 Buka Ruang Chat Direct Siswa</span>
                    </button>

                    <div className="flex items-center gap-2">
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

        {/* Content: Live Chat Konseling Tab */}
        {activeTab === 'chat_konseling' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] text-left">
            {/* Left Student List Sidebar */}
            <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-sky-600">forum</span>
                  Daftar Sesi Chat Siswa
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {connectionStatus === 'connected' ? 'Server Live 🟢' : 'Connecting...'}
                </span>
              </div>

              <div className="space-y-2">
                {BK_STUDENTS.map((st) => {
                  const isSelected = activeChatStudentId === st.id;
                  const isOnline = onlineUsers.includes(st.id);

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveChatStudentId(st.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-white border-sky-500 shadow-sm ring-1 ring-sky-300'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-sky-300"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">{st.name}</span>
                          <span className="text-[10px] text-sky-600 font-semibold">{st.kelas}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-sky-700 block truncate">{st.topic}</span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {isOnline ? '🟢 Siswa sedang online' : 'Koneksi real-time server aktif'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Chat Conversation Box */}
            <div className="lg:col-span-8 flex flex-col h-full bg-white">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeStudent.avatar}
                      alt={activeStudent.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        onlineUsers.includes(activeStudent.id) ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{activeStudent.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                        {activeStudent.kelas}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Topik: {activeStudent.topic}</span>
                      <span
                        className={`font-bold ${
                          onlineUsers.includes(activeStudent.id) ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {onlineUsers.includes(activeStudent.id) ? '● Online di Website' : '● Tersimpan di Server'}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://meet.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <span className="material-symbols-outlined text-[16px]">video_call</span>
                  <span>Buka Video Call</span>
                </a>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[380px] bg-slate-50/30">
                {currentChatMessages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <span className="material-symbols-outlined text-[32px] text-slate-300 mb-1">
                      chat_bubble_outline
                    </span>
                    <p className="text-xs font-semibold text-slate-600">Belum ada riwayat pesan langsung</p>
                    <p className="text-[11px] text-slate-400">
                      Ketik sapaan untuk memulai bimbingan dengan {activeStudent.name}.
                    </p>
                  </div>
                ) : (
                  currentChatMessages.map((msg) => {
                    const isCounselor = msg.senderId === currentGuru.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCounselor ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isCounselor
                              ? 'bg-sky-600 text-white rounded-br-xs shadow-sm'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <div className="font-semibold text-[10px] opacity-80 flex items-center justify-between gap-2">
                            <span>{isCounselor ? 'Anda (Guru BK)' : msg.senderName}</span>
                            {msg.categoryTag && (
                              <span className="text-[9px] opacity-75">{msg.categoryTag}</span>
                            )}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <div className="text-[9px] opacity-70 text-right">{msg.time}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Template Prompts */}
              <div className="p-2 border-t border-slate-100 bg-slate-50 overflow-x-auto flex items-center gap-1.5 text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 px-1">Pintas Response:</span>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('Halo, terima kasih sudah cerita. Jangan khawatir, kita cari solusinya bersama.')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 shrink-0 font-medium cursor-pointer"
                >
                  👋 Sapaan Hangat
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('Apakah besok jam 10.00 WIB kamu bisa tatap muka di Ruang BK?')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 shrink-0 font-medium cursor-pointer"
                >
                  🏫 Undangan Tatap Muka
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('Mari kita coba latihan teknik relaksasi napas 4-7-8 untuk meredakan cemas.')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 shrink-0 font-medium cursor-pointer"
                >
                  🧘 Tips Relaksasi
                </button>
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  placeholder="Ketik balasan atau pesan bimbingan untuk siswa di sini..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>
        )}
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
