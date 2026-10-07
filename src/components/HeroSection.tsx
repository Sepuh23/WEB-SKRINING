import React, { useState } from 'react';

interface HeroSectionProps {
  onStartCurhat: (initialMessage?: string) => void;
  onOpenLogin: () => void;
  onStartScreening: () => void;
  isLoggedIn?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCurhat,
  onOpenLogin,
  onStartScreening,
  isLoggedIn = false,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onStartCurhat(quickInput.trim());
      setQuickInput('');
    } else {
      onStartCurhat();
    }
  };

  return (
    <section className="w-full px-6 md:px-10 py-12 lg:py-20 relative overflow-hidden bg-white">
      {/* Ambient luminous gradients */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#c4e7ff]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0f3ff] shadow-[0_2px_12px_rgba(56,189,248,0.18)] border border-[#dee8ff]">
            <span className="material-symbols-outlined text-[#00668a] text-[18px]">auto_awesome</span>
            <span className="text-[12px] font-bold text-[#00668a] tracking-wider uppercase">
              AI Emosi &amp; Ruang Curhat Aman untuk Remaja
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[50px] text-[#111c2d] font-bold tracking-tight">
            Ruang Aman Curhat AI &amp; Skrining Emosi{' '}
            <span className="bg-gradient-to-r from-[#00668a] to-[#38bdf8] bg-clip-text text-transparent">
              Tanpa Stigma
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] md:text-[18px] text-[#576065] max-w-2xl leading-relaxed">
            Bicara bebas di web tanpa rasa takut dihakimi. AI multimodal membaca mikro-ekspresi wajah dan intonasi nada suaramu secara objektif, aman, serta 100% rahasia langsung dari perambanmu.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1 w-full sm:w-auto">
            <button
              onClick={() => onStartCurhat()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#38bdf8] text-white font-semibold text-[15px] shadow-[0_8px_20px_rgba(56,189,248,0.32)] hover:opacity-95 hover:shadow-[0_12px_28px_rgba(56,189,248,0.4)] transition-all active:scale-98 cursor-pointer"
            >
              <span>Mulai Curhat Sekarang</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#f0f3ff] text-[#111c2d] font-semibold text-[15px] hover:bg-[#dee8ff] transition-all cursor-pointer border border-[#dee8ff]"
            >
              {isLoggedIn ? 'Buka Dashboard Siswa' : 'Login Akun Siswa'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3ff] border border-[#e7eeff]">
              <span className="material-symbols-outlined text-[#00668a] text-[16px]">lock</span>
              <span className="text-[12px] font-medium text-[#111c2d]">100% Rahasia &amp; Anonim</span>
            </div>
            <button
              onClick={onStartScreening}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3ff] border border-[#e7eeff] hover:bg-[#dee8ff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#00668a] text-[16px]">bolt</span>
              <span className="text-[12px] font-medium text-[#111c2d]">Skrining Cepat 3 Menit</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3ff] border border-[#e7eeff]">
              <span className="material-symbols-outlined text-[#00668a] text-[16px]">verified_user</span>
              <span className="text-[12px] font-medium text-[#111c2d]">E2E Terenkripsi</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Web Preview Card */}
        <div className="lg:col-span-5 relative flex justify-center">
          {/* Floating Ambient Background Card */}
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-[0_16px_40px_-8px_rgba(56,189,248,0.22)] relative backdrop-blur-md border border-[#e7eeff]/60">
            {/* Top Pill Status Bar */}
            <div className="flex items-center justify-between pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#00668a]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00668a]"></span>
                </span>
                <span className="text-[12px] font-semibold">Dual-Sensing Aktif</span>
              </div>
              <span className="text-[11px] text-[#576065] bg-[#e7eeff] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">lock</span> E2E Terenkripsi
              </span>
            </div>

            {/* AI Companion Visualizer Frame */}
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#f0f3ff] via-white to-[#f0f3ff] p-6 flex flex-col items-center justify-center relative my-2 overflow-hidden border border-[#dee8ff]">
              <div className="absolute inset-0 bg-[#38bdf8]/10 rounded-2xl blur-xl"></div>

              {/* Bot Avatar Illustration */}
              <div className="relative w-28 h-28 rounded-full bg-white shadow-[0_8px_24px_rgba(56,189,248,0.25)] flex items-center justify-center p-2 mb-3 border-2 border-[#38bdf8]/40 animate-float">
                <img
                  className="w-full h-full object-cover rounded-full"
                  alt="VibeBot Empathy Companion Robot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoTWu--wp5meTLIpxAbLIdRjQ31nqWftLfvjhKOZ8pylG5fdbtkQPSMWWz4VG7Ljy3H0mZBzLvJY4WGZdpp1oBYl-ReiyUInQOYZubjiFSVJxY80a9SnwbCEMM7xKurmxd5b_RX9SmhnMDCMhFwEv5Jbo75e4amqsyXKVjiKtnlzA3foW4_tYwNz-EDygGaa0IyOK4YONMETrw1jpHZIsafHbNuMCAAytFqLZKGks"
                />
                <div className="absolute -bottom-1 bg-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-[#dee8ff]">
                  <span className="material-symbols-outlined text-[#00668a] text-[12px]">graphic_eq</span>
                  <span className="text-[10px] text-[#00668a] font-bold">Mendengarkan</span>
                </div>
              </div>

              {/* Animated Audio Waveform */}
              <div className="flex items-center justify-center gap-1 h-8 px-4 my-2">
                <span className="w-1.5 h-3 bg-[#38bdf8] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-6 bg-[#00668a] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-8 bg-[#38bdf8] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-4 bg-[#00668a] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-7 bg-[#38bdf8] rounded-full animate-pulse" style={{ animationDelay: '0.25s' }}></span>
                <span className="w-1.5 h-3 bg-[#00668a] rounded-full animate-bounce"></span>
              </div>

              {/* Sentiment Status Badge */}
              <div className="w-full bg-white/95 backdrop-blur-sm rounded-full py-1.5 px-3 flex items-center justify-center gap-2 shadow-xs border border-[#dee8ff]">
                <span className="text-[11px] text-[#111c2d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#00668a] text-[14px]">volume_up</span>
                  Nada: <b className="text-[#00668a] font-semibold">Tenang (88%)</b>
                </span>
                <span className="text-[#bdc8d1]">•</span>
                <span className="text-[11px] text-[#111c2d] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#00668a] text-[14px]">face</span>
                  Mimik: <b className="text-[#576065] font-semibold">Sedikit Cemas</b>
                </span>
              </div>
            </div>

            {/* AI Speech Bubble Card */}
            <div className="bg-[#f0f3ff] rounded-2xl p-4 mt-3 flex items-start gap-3 text-left border border-[#dee8ff]">
              <div className="w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center shrink-0 text-white shadow-xs">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#00668a] font-bold">VibeBot Empathy</span>
                  <span className="text-[10px] text-[#576065] font-medium">Real-time</span>
                </div>
                <p className="text-[13px] text-[#111c2d] mt-1 leading-snug">
                  "Hai! Cerita aja apa yang bikin kamu ganjel hari ini, aku dengerin kok tanpa nge-judge apapun."
                </p>
              </div>
            </div>

            {/* Mock Interactive Input Bar */}
            <form onSubmit={handleHeroSubmit} className="mt-4 pt-2 flex items-center gap-2">
              <div className="flex-1 bg-[#f0f3ff] rounded-full px-4 py-2 flex items-center justify-between text-[#576065] border border-[#dee8ff] focus-within:border-[#38bdf8] transition-colors">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Mulai ketik atau bicara..."
                  className="w-full bg-transparent text-[13px] text-[#111c2d] focus:outline-none placeholder:text-[#576065]"
                />
                <button
                  type="button"
                  onClick={() => onStartCurhat()}
                  className="material-symbols-outlined text-[18px] text-[#00668a] hover:text-[#38bdf8] transition-colors ml-2"
                  title="Gunakan Suara"
                >
                  mic
                </button>
              </div>
              <button
                type="submit"
                aria-label="Kirim"
                className="w-10 h-10 rounded-full bg-[#38bdf8] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
