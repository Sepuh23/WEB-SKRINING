import React, { useState } from 'react';

interface MobileShowcaseSectionProps {
  onStartCurhat: () => void;
  onOpenCounselor: () => void;
}

export const MobileShowcaseSection: React.FC<MobileShowcaseSectionProps> = ({
  onStartCurhat,
  onOpenCounselor,
}) => {
  const [contactInput, setContactInput] = useState('');
  const [registered, setRegistered] = useState(false);
  const [selectedMoodMini, setSelectedMoodMini] = useState<'senang' | 'tenang' | 'cemas'>('tenang');

  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInput.trim()) {
      setRegistered(true);
      setTimeout(() => {
        // keep registered state
      }, 3000);
    }
  };

  return (
    <section className="w-full px-6 md:px-10 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto rounded-[32px] bg-gradient-to-br from-[#f0f3ff] via-white to-[#f0f3ff] p-8 lg:p-14 shadow-[0_16px_40px_-10px_rgba(56,189,248,0.15)] border border-[#dee8ff] relative overflow-hidden">
        {/* Ambient light blur behind mockup */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xs border border-[#dee8ff]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping"></span>
              <span className="text-[11px] text-[#00668a] font-bold uppercase tracking-wider">
                Segera Hadir di Android &amp; iOS
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[32px] text-[#111c2d] font-bold leading-tight">
              Akses PSY-VIBE Kapan Saja Langsung dari Genggamanmu.
            </h2>

            <p className="text-[16px] text-[#576065] leading-relaxed">
              Versi mobile app sedang dirancang untuk menghadirkan pengalaman curhat yang lebih personal, notifikasi pengingat mindful, pelacak napas interaktif, dan widget harian.
            </p>

            {/* Pre-Register Form */}
            <div className="w-full max-w-md pt-2">
              {registered ? (
                <div className="bg-[#f0fdf4] border border-[#86efac] p-3.5 rounded-2xl flex items-center gap-3 text-[#166534]">
                  <span className="material-symbols-outlined text-[24px] text-[#22c55e]">check_circle</span>
                  <div className="text-left">
                    <p className="text-[13px] font-bold">Terima kasih sudah mendaftar!</p>
                    <p className="text-[11px] text-[#15803d]">Kami akan mengabari saat aplikasi siap diunduh.</p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handlePreRegister}
                  className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-full shadow-[0_4px_16px_rgba(56,189,248,0.15)] border border-[#dee8ff]"
                >
                  <input
                    type="text"
                    required
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="Masukkan email atau WhatsApp"
                    className="w-full px-5 py-3 rounded-full text-[#111c2d] placeholder:text-[#576065] focus:outline-none bg-transparent text-[13px]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-full bg-[#38bdf8] text-white font-semibold text-[14px] shadow-md hover:opacity-95 transition-all cursor-pointer"
                  >
                    Ingatkan Saya
                  </button>
                </form>
              )}
              <p className="text-[11px] text-[#576065] mt-2 pl-4">
                Gratis untuk siswa &amp; remaja. Kami menghormati privasimu tanpa spam.
              </p>
            </div>

            {/* Store Badges Coming Soon */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#dee8ff] text-[#576065] shadow-xs">
                <span className="material-symbols-outlined text-[22px] text-[#00668a]">shop</span>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-[#576065] font-semibold">Coming Soon</span>
                  <span className="block text-[13px] font-bold text-[#111c2d]">Google Play</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#dee8ff] text-[#576065] shadow-xs">
                <span className="material-symbols-outlined text-[22px] text-[#00668a]">phone_iphone</span>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-[#576065] font-semibold">Coming Soon</span>
                  <span className="block text-[13px] font-bold text-[#111c2d]">App Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup Frame */}
          <div className="lg:col-span-5 flex justify-center py-6">
            <div className="w-72 sm:w-80 rounded-[44px] p-3 bg-[#d8e3fb] shadow-[0_24px_50px_-10px_rgba(56,189,248,0.3)] border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Inner screen bezel */}
              <div className="w-full bg-white rounded-[36px] overflow-hidden p-4 flex flex-col justify-between h-[520px] relative border border-[#dee8ff]">
                {/* Screen Notch / Island */}
                <div className="w-28 h-4 bg-[#111c2d]/90 rounded-full mx-auto mb-3"></div>

                {/* Top Bar Inside Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#38bdf8] border border-[#38bdf8]">
                      <img
                        className="w-full h-full object-cover"
                        alt="Farel avatar"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8kqcMzG3sGVMZatNUT_jMqxlZPkCZ_4x8DhohMirEEiFtw-_eeISBn9toFc7JFlcbm8wLEqn0iajJ4HF35xsJm6t2YVI1PIV55XGkZYdJDioaOSr5fkqkLH5TpNpBZk0Ed3Jy7mdy0Mz3m64HGOGuMKRBprtMo3-JaNqQks2pjU3TsiT1uDVgake2AG59-P2vHtCbpRKjM2vxIsWv4vHl7SOiQmU1X37NCeRCwY4"
                      />
                    </div>
                    <div className="text-left">
                      <span className="block text-[13px] font-bold text-[#111c2d] leading-none">
                        Halo Farel! ⛅
                      </span>
                      <span className="block text-[10px] text-[#576065]">
                        Gimana kabarmu hari ini?
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#576065] text-[20px]">
                    notifications
                  </span>
                </div>

                {/* Mini Widget 1: Mood Carousel Tracker */}
                <div className="bg-[#f0f3ff] rounded-2xl p-3 my-2 border border-[#dee8ff]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#111c2d]">Mood Hari Ini</span>
                    <span className="text-[10px] text-[#00668a] font-semibold">Real-time</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMoodMini('senang')}
                      className={`rounded-xl p-1.5 text-center transition-all cursor-pointer ${
                        selectedMoodMini === 'senang'
                          ? 'bg-[#38bdf8] text-white shadow-xs font-bold'
                          : 'bg-white text-[#111c2d] border border-[#dee8ff]'
                      }`}
                    >
                      <span className="text-lg block">😊</span>
                      <span className="text-[9px]">Senang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMoodMini('tenang')}
                      className={`rounded-xl p-1.5 text-center transition-all cursor-pointer ${
                        selectedMoodMini === 'tenang'
                          ? 'bg-[#38bdf8] text-white shadow-xs font-bold'
                          : 'bg-white text-[#111c2d] border border-[#dee8ff]'
                      }`}
                    >
                      <span className="text-lg block">😌</span>
                      <span className="text-[9px]">Tenang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMoodMini('cemas')}
                      className={`rounded-xl p-1.5 text-center transition-all cursor-pointer ${
                        selectedMoodMini === 'cemas'
                          ? 'bg-[#38bdf8] text-white shadow-xs font-bold'
                          : 'bg-white text-[#111c2d] border border-[#dee8ff]'
                      }`}
                    >
                      <span className="text-lg block">🥺</span>
                      <span className="text-[9px]">Cemas</span>
                    </button>
                  </div>
                </div>

                {/* Mini Widget 2: Active Venting AI Card */}
                <div
                  onClick={onStartCurhat}
                  className="bg-gradient-to-r from-[#c4e7ff] to-[#f0f3ff] rounded-2xl p-3 flex-1 flex flex-col justify-between my-1 border border-[#dee8ff] cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#00668a] font-bold">Ruang Curhat AI</span>
                    <span className="material-symbols-outlined text-[#00668a] text-[14px]">
                      graphic_eq
                    </span>
                  </div>
                  <div className="py-1 text-center">
                    <div className="w-11 h-11 rounded-full bg-white mx-auto flex items-center justify-center shadow-xs mb-1 text-[#00668a] hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">mic</span>
                    </div>
                    <span className="text-[10px] text-[#576065] font-semibold">
                      Mendengarkan aktif...
                    </span>
                  </div>
                  <div className="bg-white/90 rounded-lg p-1.5 text-[9px] text-center text-[#111c2d] font-medium border border-[#dee8ff]">
                    Nada: Tenang (88%) • Sedikit Lelah
                  </div>
                </div>

                {/* Quick Action Card inside Phone */}
                <button
                  type="button"
                  onClick={onOpenCounselor}
                  className="w-full bg-[#f0f3ff] rounded-xl p-2.5 flex items-center justify-between mb-2 border border-[#dee8ff] hover:bg-[#dee8ff] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00668a] text-[18px]">
                      support_agent
                    </span>
                    <span className="text-[11px] font-bold text-[#111c2d]">
                      Chat Guru BK Sekolah
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#576065] text-[14px]">
                    chevron_right
                  </span>
                </button>

                {/* Fixed Bottom Tab Bar */}
                <div className="bg-white pt-2 border-t border-[#f0f3ff] flex items-center justify-around">
                  <div className="flex flex-col items-center text-[#00668a]">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span className="text-[9px] font-bold">Home</span>
                  </div>
                  <button
                    onClick={onStartCurhat}
                    className="flex flex-col items-center text-[#576065] hover:text-[#00668a] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span className="text-[9px]">Curhat</span>
                  </button>
                  <div className="flex flex-col items-center text-[#576065]">
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    <span className="text-[9px]">Jurnal</span>
                  </div>
                  <div className="flex flex-col items-center text-[#576065]">
                    <span className="material-symbols-outlined text-[18px]">person_outline</span>
                    <span className="text-[9px]">Profil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
