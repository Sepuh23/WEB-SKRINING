import React, { useState, useEffect, useRef } from 'react';
import { LiveChatMessage, StudentProfile, UserRoleType } from '../types';
import { useLiveChat } from '../utils/useLiveChat';

interface CounselorContact {
  id: string;
  name: string;
  role: 'guru_bk' | 'psikolog';
  roleTitle: string;
  avatar: string;
  organization: string;
  specialty: string[];
  schedule: string;
}

const DEFAULT_COUNSELORS: CounselorContact[] = [
  {
    id: 'u3',
    name: 'Ibu Dra. Ratna Pratiwi, M.Pd',
    role: 'guru_bk',
    roleTitle: 'Guru BK Sekolah (SMAN 1 Kota Bengkulu)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    organization: 'Ruang Bimbingan Konseling Lantai 2',
    specialty: ['Akademik & Ujian', 'Masalah Pertemanan / Bullying', 'Manajemen Stres'],
    schedule: 'Senin - Jumat: 08.00 - 15.00 WIB',
  },
  {
    id: 'u4',
    name: 'Maya Indriani, M.Psi., Psikolog',
    role: 'psikolog',
    roleTitle: 'Psikolog Klinis Mitra PSY-VIBE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    organization: 'Biro Psikologi Lentera Jiwa',
    specialty: ['Smiling Depression', 'Gangguan Cemas (Anxiety)', 'Konseling Klinis Remaja'],
    schedule: 'Senin - Sabtu: 09.00 - 17.00 WIB',
  },
];

interface LiveConsultationChatProps {
  currentUser: StudentProfile;
  defaultCounselorId?: string;
  onBookAppointment?: (counselorId: string, counselorType: 'guru_bk' | 'psikolog') => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const LiveConsultationChat: React.FC<LiveConsultationChatProps> = ({
  currentUser,
  defaultCounselorId = 'u3',
  onBookAppointment,
  onClose,
  isEmbedded = false,
}) => {
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(defaultCounselorId);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Stres Akademik & Ujian');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCounselor =
    DEFAULT_COUNSELORS.find((c) => c.id === selectedCounselorId) || DEFAULT_COUNSELORS[0];

  const channelId = `chat_${[currentUser.id, selectedCounselor.id].sort().join('_')}`;

  const {
    messages,
    onlineUsers,
    connectionStatus,
    typingUsers,
    sendMessage,
    sendTyping,
  } = useLiveChat(currentUser, channelId);

  // Filter messages for current channel
  const channelMessages = messages.filter((m) => m.channelId === channelId);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const isCounselorOnline = onlineUsers.includes(selectedCounselor.id);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    sendTyping(selectedCounselor.id, false);

    await sendMessage(
      {
        id: selectedCounselor.id,
        name: selectedCounselor.name,
        role: selectedCounselor.role,
      },
      textToSend,
      selectedCategory
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    sendTyping(selectedCounselor.id, e.target.value.length > 0);
  };

  const quickTemplates = [
    'Selamat pagi Bu/Mbak, saya mau konsultasi terkait kecemasan ujian...',
    'Apakah ada waktu luang untuk sesi konseling tatap muka minggu ini?',
    'Saya merasa lelah dan sulit fokus belajar belakangan ini...',
    'Saya bingung memilih antara jurusan kuliah IPA atau IPS...',
  ];

  return (
    <div
      className={`flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl transition-all ${
        isEmbedded ? 'w-full h-[620px]' : 'w-full max-w-4xl mx-auto h-[680px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
            <span className="material-symbols-outlined text-[22px]">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Konsultasi Chat BK &amp; Konselor</h2>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {connectionStatus === 'connected' ? 'WebSocket Realtime Aktif' : 'Menghubungkan...'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Terhubung langsung ke server sekolah &amp; platform. Privasi 100% terjaga.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Main Body: Counselor Selector Tabs & Chat Window */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Counselor Target Switcher */}
        <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-2">
            <div className="px-2 pt-1 pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Pilih Konselor</span>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                2 Tersedia
              </span>
            </div>

            {DEFAULT_COUNSELORS.map((c) => {
              const isSelected = c.id === selectedCounselor.id;
              const isOnline = onlineUsers.includes(c.id);

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCounselorId(c.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-sky-400 shadow-sm ring-1 ring-sky-300/60'
                      : 'bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      title={isOnline ? 'Sedang Online' : 'Offline (Pesan tetap tersimpan di server)'}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate block">{c.name}</span>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                        c.role === 'guru_bk'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {c.role === 'guru_bk' ? 'Guru BK Sekolah' : 'Psikolog Mitra'}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-1">{c.organization}</p>
                  </div>
                </button>
              );
            })}

            {/* Counselor Info Card */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 mt-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="material-symbols-outlined text-[16px] text-sky-600">verified</span>
                <span>Fokus Penanganan:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCounselor.specialty.map((sp, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                  >
                    {sp}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700">Jadwal Tugas:</div>
                <div>{selectedCounselor.schedule}</div>
              </div>
            </div>
          </div>

          {/* Quick Appointment Booking button */}
          {onBookAppointment && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onBookAppointment(selectedCounselor.id, selectedCounselor.role)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                <span>Jadwalkan Janji Temu</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Chat Messages & Input */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {/* Active Contact Subheader */}
          <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedCounselor.avatar}
                alt={selectedCounselor.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedCounselor.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCounselorOnline
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isCounselorOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    />
                    {isCounselorOnline ? 'Online di Platform' : 'Tersambung (Server Siaga)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{selectedCounselor.roleTitle}</div>
              </div>
            </div>

            {/* Topic Category Selector Pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Topik:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-medium cursor-pointer transition-colors"
              >
                <option value="Stres Akademik & Ujian">📚 Stres Akademik &amp; Ujian</option>
                <option value="Masalah Pertemanan / Bullying">🤝 Pertemanan &amp; Bullying</option>
                <option value="Pengembangan Diri & Karir">🎯 Jurusan &amp; Karir</option>
                <option value="Kecemasan / Burnout">🌧️ Kecemasan / Burnout</option>
                <option value="Curhat Bebas">💬 Curhat Bebas</option>
              </select>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Encryption & Safety Banner */}
            <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3 text-center max-w-lg mx-auto text-xs text-sky-800">
              <div className="font-bold flex items-center justify-center gap-1 text-sky-900">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>Ruang Konsultasi Aman &amp; Terenkripsi</span>
              </div>
              <p className="text-[11px] text-sky-700 mt-0.5">
                Pesan ini tersinkronisasi otomatis dengan server bimbingan konseling. Guru BK dan Psikolog dapat membalas langsung di portal mereka.
              </p>
            </div>

            {channelMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-2">chat_bubble_outline</span>
                <p className="text-xs font-semibold text-slate-600">Belum ada pesan dengan {selectedCounselor.name}</p>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  Mulai sapa atau ceritakan kendala belajarmu. Pesanmu akan tersampaikan langsung ke akun Guru BK / Psikolog!
                </p>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={selectedCounselor.avatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-lg object-cover mb-1 border border-slate-200 shrink-0"
                      />
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {!isMe && (
                        <div className="font-bold text-[11px] text-sky-700 mb-1 flex items-center justify-between gap-2">
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded">
                            {msg.senderRole === 'guru_bk' ? 'Guru BK' : 'Psikolog'}
                          </span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div
                        className={`flex items-center justify-end gap-1.5 text-[10px] mt-1 pt-1 ${
                          isMe ? 'text-sky-100/80 border-t border-sky-500/40' : 'text-slate-400 border-t border-slate-100'
                        }`}
                      >
                        {msg.categoryTag && !isMe && (
                          <span className="font-medium mr-auto truncate max-w-[120px]">
                            • {msg.categoryTag}
                          </span>
                        )}
                        <span>{msg.time}</span>
                        {isMe && (
                          <span className="material-symbols-outlined text-[13px]">
                            {msg.isRead ? 'done_all' : 'done'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-lg object-cover mb-1 border border-slate-200 shrink-0"
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {typingUsers[selectedCounselor.id] && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                <span>{selectedCounselor.name} sedang mengetik...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
              Template:
            </span>
            {quickTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(tmpl)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 border border-slate-200 text-[11px] transition-colors cursor-pointer shrink-0"
              >
                {tmpl.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={`Tulis pesan konsultasi untuk ${selectedCounselor.name}...`}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-sky-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">
                chat
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <span>Kirim</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
