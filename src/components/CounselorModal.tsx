import React, { useState } from 'react';
import { Counselor } from '../types';
import { MOCK_COUNSELORS } from '../data/mockData';

interface CounselorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCurhat: () => void;
  onOpenBooking?: (targetType: 'guru_bk' | 'psikolog', counselorId?: string) => void;
}

export const CounselorModal: React.FC<CounselorModalProps> = ({
  isOpen,
  onClose,
  onOpenCurhat,
  onOpenBooking,
}) => {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor>(MOCK_COUNSELORS[0]);
  const [consultType, setConsultType] = useState<'chat' | 'call' | 'inPerson'>('chat');
  const [selectedDay, setSelectedDay] = useState('Hari ini (14.00 - 15.00 WIB)');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeChatView, setActiveChatView] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [counselorMessages, setCounselorMessages] = useState<
    Array<{ sender: 'user' | 'counselor'; text: string; time: string }>
  >([
    {
      sender: 'counselor',
      text: 'Halo! Saya Ibu Ratna dari Ruang BK Sekolah. Kamu aman di sini, semua percakapan kita 100% rahasia. Mau mulai cerita dari mana, Nak?',
      time: '14.02',
    },
  ]);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setActiveChatView(true);
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setCounselorMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');

    setTimeout(() => {
      setCounselorMessages((prev) => [
        ...prev,
        {
          sender: 'counselor',
          text: `Terima kasih sudah berani membuka diri dan bercerita. Ibu sangat menghargai kejujuranmu. Beban yang kamu bawa ini memang berat, tapi kita urai pelan-pelan bersama ya. Mau kita jadwalkan sesi ngobrol santai di ruang BK besok istirahat kedua?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/65 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-[#f0f3ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00668a] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[16px] text-[#111c2d]">
                Konsultasi Guru BK &amp; Psikolog Mitra
              </h3>
              <p className="text-[11px] text-[#576065]">
                Dukungan konseling aman, tersertifikasi, dan rahasia bagi siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#576065] hover:text-[#111c2d] flex items-center justify-center border border-[#dee8ff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto text-left">
          {activeChatView ? (
            /* Live Counselor Chat View */
            <div className="h-[550px] flex flex-col">
              {/* Top counselor header */}
              <div className="p-3 bg-[#f0f3ff] rounded-xl border border-[#dee8ff] flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCounselor.avatar}
                    alt={selectedCounselor.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#00668a]"
                  />
                  <div>
                    <span className="font-bold text-[14px] text-[#111c2d] block">
                      {selectedCounselor.name}
                    </span>
                    <span className="text-[11px] text-[#00668a]">
                      {selectedCounselor.role} • {isAnonymous ? 'Mode Anonim Aktif' : 'Terhubung'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChatView(false)}
                  className="text-[12px] text-[#00668a] font-semibold hover:underline"
                >
                  Ubah Jadwal
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f3ff]/40 rounded-xl border border-[#dee8ff]">
                {counselorMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] ${
                        msg.sender === 'user'
                          ? 'bg-[#00668a] text-white rounded-tr-none'
                          : 'bg-white text-[#111c2d] border border-[#dee8ff] rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] block text-right mt-1 ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-[#576065]'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {[
                  'Beban tugas & ujian bikin cemas',
                  'Merasa burnout dan kehilangan motivasi',
                  'Konflik atau diasingkan teman sekolah',
                  'Sulit tidur mikirin ekspektasi masa depan',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#00668a] hover:border-[#38bdf8] hover:bg-[#F0F9FF] transition-all cursor-pointer"
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ketik pesan aman ke konselor..."
                  className="flex-1 p-3 rounded-full bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#00668a] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-[#00668a] hover:bg-[#004c69] text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          ) : (
            /* Booking Flow */
            <div className="space-y-6">
              {/* Counselor Cards */}
              <div>
                <h4 className="text-[15px] font-bold text-[#111c2d] mb-3">
                  Pilih Konselor atau Psikolog Mitra:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_COUNSELORS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCounselor(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        selectedCounselor.id === c.id
                          ? 'bg-[#dee8ff]/50 border-[#00668a] shadow-xs ring-1 ring-[#00668a]'
                          : 'bg-white border-[#dee8ff] hover:bg-[#f0f3ff]'
                      }`}
                    >
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#dee8ff] shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] text-[#111c2d]">{c.name}</span>
                          <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                            ★ {c.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#00668a] font-semibold block">
                          {c.role}
                        </span>
                        <p className="text-[11px] text-[#576065] line-clamp-2 mt-1">{c.bio}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.specialty.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] bg-[#f0f3ff] text-[#00668a] px-2 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation Options */}
              <form onSubmit={handleBook} className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-4">
                <h4 className="text-[14px] font-bold text-[#111c2d]">Pengaturan Sesi Konseling</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType('chat')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      consultType === 'chat'
                        ? 'bg-white border-[#00668a] text-[#00668a] font-bold shadow-xs'
                        : 'bg-white/60 border-[#dee8ff] text-[#576065]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mb-1">chat</span>
                    <span className="text-[12px] block">Chat Online Anonim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('call')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      consultType === 'call'
                        ? 'bg-white border-[#00668a] text-[#00668a] font-bold shadow-xs'
                        : 'bg-white/60 border-[#dee8ff] text-[#576065]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mb-1">call</span>
                    <span className="text-[12px] block">Panggilan Audio Aman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('inPerson')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      consultType === 'inPerson'
                        ? 'bg-white border-[#00668a] text-[#00668a] font-bold shadow-xs'
                        : 'bg-white/60 border-[#dee8ff] text-[#576065]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] block mb-1">meeting_room</span>
                    <span className="text-[12px] block">Tatap Muka di Ruang BK</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                      Pilih Waktu Konseling:
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#dee8ff] text-[13px] text-[#111c2d]"
                    >
                      <option>Hari ini (14.00 - 15.00 WIB)</option>
                      <option>Besok Istirahat 1 (10.00 - 10.30 WIB)</option>
                      <option>Besok Pulang Sekolah (15.00 - 16.00 WIB)</option>
                      <option>Jumat Sore (15.30 - 16.30 WIB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                      Privasi Pengguna:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#dee8ff] text-[13px] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-[#111c2d]">
                        <span className="material-symbols-outlined text-[16px] text-[#00668a]">
                          {isAnonymous ? 'visibility_off' : 'visibility'}
                        </span>
                        {isAnonymous ? 'Identitas Disamarkan (Anonim)' : 'Gunakan Nama Asli'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAnonymous ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isAnonymous ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </button>
                  </div>
                </div>

                {bookingSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[12px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">
                      check_circle
                    </span>
                    Jadwal terkonfirmasi! Mengalihkan ke ruang obrolan aman dengan konselor...
                  </div>
                ) : (
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onOpenCurhat}
                      className="px-4 py-2 rounded-full bg-white text-[#00668a] border border-[#dee8ff] text-[12px] font-semibold cursor-pointer"
                    >
                      Curhat ke AI dulu
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#00668a] text-white font-bold text-[13px] shadow-sm hover:bg-[#004c69] cursor-pointer"
                    >
                      Konfirmasi &amp; Mulai Konseling
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
