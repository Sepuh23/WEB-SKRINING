import React, { useState } from 'react';
import { Appointment, StudentProfile } from '../types';
import { useLiveChat } from '../utils/useLiveChat';

const PSI_STUDENTS = [
  {
    id: 'u2',
    name: 'Ayu Lestari (Siswa 2)',
    role: 'Siswa SMA',
    school: 'SMA Negeri 1 Kota Bengkulu',
    topic: 'Kecemasan Presentasi di Sekolah',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'u1',
    name: 'Farel (Siswa 1)',
    role: 'Siswa SMA',
    school: 'SMA Negeri 1 Kota Bengkulu',
    topic: 'Rujukan Klinis Stres & Insomnia',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kqcMzG3sGVMZatNUT_jMqxlZPkCZ_4x8DhohMirEEiFtw-_eeISBn9toFc7JFlcbm8wLEqn0iajJ4HF35xsJm6t2YVI1PIV55XGkZYdJDioaOSr5fkqkLH5TpNpBZk0Ed3Jy7mdy0Mz3m64HGOGuMKRBprtMo3-JaNqQks2pjU3TsiT1uDVgake2AG59-P2vHtCbpRKjM2vxIsWv4vHl7SOiQmU1X37NCeRCwY4',
  },
];

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
  onOpenEditProfile?: () => void;
}

export const PsikologPortal: React.FC<PsikologPortalProps> = ({
  currentPsikolog,
  appointments,
  onUpdateAppointmentStatus,
  onNavigateHome,
  onLogout,
  onSwitchRole,
  onOpenEditProfile,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'janji_temu' | 'chat_konseling'>('janji_temu');

  // Live Chat state for Psikolog (Connected via WebSocket & Server REST)
  const [activeChatStudentId, setActiveChatStudentId] = useState<string>('u2');
  const [chatMessageInput, setChatMessageInput] = useState('');

  const activeStudent = PSI_STUDENTS.find((s) => s.id === activeChatStudentId) || PSI_STUDENTS[0];
  const activeChannelId = `chat_${[currentPsikolog.id, activeStudent.id].sort().join('_')}`;

  const {
    messages,
    onlineUsers,
    connectionStatus,
    sendMessage,
  } = useLiveChat(currentPsikolog, activeChannelId);

  const currentChannelMessages = messages.filter((m) => m.channelId === activeChannelId);

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
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer border border-purple-200"
                title="Edit Profil & Password Saya"
              >
                <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                <span>Edit Akun</span>
              </button>
            )}
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
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-rose-200 shadow-xs"
              title="Keluar dari Portal Psikolog"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-purple-100 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('janji_temu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'janji_temu'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-purple-50'
            }`}
          >
            <span>📅 Janji Temu Konseling Klinis</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-black">
              {psiAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chat_konseling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'chat_konseling'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-300 text-purple-900'
            }`}
          >
            <span>💬 Chat Konseling Direct &amp; Klinis</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-extrabold animate-pulse">
              LIVE
            </span>
          </button>
        </div>

        {/* Content 1: Janji Temu Tab */}
        {activeTab === 'janji_temu' && (
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

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setActiveChatStudentId(selectedAppointment.studentId === 'u1' || selectedAppointment.studentId === 's1' ? 'u1' : 'u2');
                      setActiveTab('chat_konseling');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">forum</span>
                    <span>💬 Buka Ruang Chat Direct Pasien / Siswa</span>
                  </button>

                  <div className="flex items-center gap-2">
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
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                Pilih salah satu jadwal konsultasi di sebelah kiri untuk melihat detail klinis.
              </div>
            )}
          </div>

        </div>
        )}

        {/* Content 2: Live Chat Konseling Tab for Psikolog */}
        {activeTab === 'chat_konseling' && (
          <div className="bg-white rounded-3xl border border-purple-200 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] text-left">
            {/* Left Student List Sidebar */}
            <div className="lg:col-span-4 border-r border-purple-100 bg-purple-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-purple-950 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-purple-600">forum</span>
                  Konseling Direct Psikolog
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    connectionStatus === 'connected'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {connectionStatus === 'connected' ? 'Server Live 🟢' : 'Connecting...'}
                </span>
              </div>

              <div className="space-y-2">
                {PSI_STUDENTS.map((st) => {
                  const isSelected = activeChatStudentId === st.id;
                  const isOnline = onlineUsers.includes(st.id);

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveChatStudentId(st.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-white border-purple-500 shadow-sm ring-1 ring-purple-300'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-purple-300"
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
                          <span className="text-[10px] text-purple-600 font-semibold">{st.role}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 block truncate">{st.topic}</span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {isOnline ? '🟢 Siswa sedang online' : 'Koneksi real-time server aktif'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Chat Box */}
            <div className="lg:col-span-8 flex flex-col h-full bg-white">
              <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeStudent.avatar}
                      alt={activeStudent.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-400"
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        Konseling Klinis
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
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <span className="material-symbols-outlined text-[16px]">video_call</span>
                  <span>Mulai Google Meet</span>
                </a>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[380px] bg-slate-50/30">
                {currentChannelMessages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <span className="material-symbols-outlined text-[32px] text-slate-300 mb-1">
                      chat_bubble_outline
                    </span>
                    <p className="text-xs font-semibold text-slate-600">Belum ada riwayat konsultasi klinis</p>
                    <p className="text-[11px] text-slate-400">
                      Mulai sesi intervensi psikologis dengan {activeStudent.name}.
                    </p>
                  </div>
                ) : (
                  currentChannelMessages.map((msg) => {
                    const isPsikolog = msg.senderId === currentPsikolog.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isPsikolog ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isPsikolog
                              ? 'bg-purple-700 text-white rounded-br-xs shadow-sm'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <div className="font-semibold text-[10px] opacity-80 flex items-center justify-between gap-2">
                            <span>{isPsikolog ? 'Anda (Psikolog Klinis)' : msg.senderName}</span>
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

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  placeholder="Tuliskan respon terapi, saran CBT, atau pesan untuk siswa..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
