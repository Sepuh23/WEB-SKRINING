import React, { useState, useEffect } from 'react';

interface EmergencyHotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectory: () => void;
}

export const EmergencyHotlineModal: React.FC<EmergencyHotlineModalProps> = ({
  isOpen,
  onClose,
  onOpenDirectory,
}) => {
  const [activeTab, setActiveTab] = useState<'hotline' | 'breathing' | 'grounding'>('hotline');

  // Breathing Box Timer
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'inhale') return 'hold1';
              if (currentPhase === 'hold1') return 'exhale';
              if (currentPhase === 'exhale') return 'hold2';
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Tarik Napas Perlahan (4s)';
      case 'hold1':
        return 'Tahan di Dada (4s)';
      case 'exhale':
        return 'Hembuskan Halus Lewat Mulut (4s)';
      case 'hold2':
        return 'Tahan Sejenak & Rileks (4s)';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(186,26,26,0.35)] border border-[#ffb4ab] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ffdad6] bg-[#ffdad6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">emergency</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[16px] text-[#93000a]">
                Bantuan Krisis &amp; Regulasi Emosi
              </h3>
              <p className="text-[11px] text-[#93000a]/80">
                Kamu sangat berharga, dan kamu tidak sendirian menghadapi saat ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#93000a] hover:bg-[#ffdad6] flex items-center justify-center border border-[#ffb4ab] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#f0f3ff] bg-[#f0f3ff]">
          <button
            onClick={() => setActiveTab('hotline')}
            className={`flex-1 py-3 text-[13px] font-bold text-center border-b-2 cursor-pointer transition-colors ${
              activeTab === 'hotline'
                ? 'border-[#ba1a1a] text-[#ba1a1a] bg-white'
                : 'border-transparent text-[#576065]'
            }`}
          >
            Hotline Darurat 119
          </button>
          <button
            onClick={() => {
              setActiveTab('breathing');
              setIsBreathingActive(true);
            }}
            className={`flex-1 py-3 text-[13px] font-bold text-center border-b-2 cursor-pointer transition-colors ${
              activeTab === 'breathing'
                ? 'border-[#00668a] text-[#00668a] bg-white'
                : 'border-transparent text-[#576065]'
            }`}
          >
            Latihan Napas Kotak 4-4-4-4
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-3 text-[13px] font-bold text-center border-b-2 cursor-pointer transition-colors ${
              activeTab === 'grounding'
                ? 'border-[#38bdf8] text-[#00668a] bg-white'
                : 'border-transparent text-[#576065]'
            }`}
          >
            Grounding 5-4-3-2-1
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-left">
          {/* TAB 1: HOTLINE */}
          {activeTab === 'hotline' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#ffdad6]/60 border border-[#ffb4ab] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold text-[#93000a]">
                    Hotline Sejiwa Kemenkes RI 119
                  </span>
                  <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    24 Jam Bebas Pulsa
                  </span>
                </div>
                <p className="text-[13px] text-[#93000a] leading-relaxed">
                  Layanan tanggap darurat psikologis resmi Kementerian Kesehatan Republik Indonesia. Dikelola oleh psikolog klinis profesional yang siap mendengar dan menjaga kerahasiaan penuh.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href="tel:119"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ba1a1a] text-white font-bold text-[14px] shadow-md hover:opacity-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                    Panggil 119 Sekarang (Gratis)
                  </a>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDirectory();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#93000a] border border-[#ffb4ab] font-bold text-[13px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">near_me</span>
                    Lihat RS / IGD Terdekat
                  </button>
                </div>
              </div>

              {/* Additional Youth Helplines */}
              <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
                <h4 className="text-[13px] font-bold text-[#111c2d]">
                  Kontak Dukungan Alternatif Lainnya:
                </h4>
                <ul className="text-[12px] text-[#576065] space-y-1.5">
                  <li className="flex justify-between">
                    <span>Yayasan Pulih (Trauma &amp; Remaja):</span>
                    <a href="tel:02178842580" className="text-[#00668a] font-bold">
                      (021) 7884-2580
                    </a>
                  </li>
                  <li className="flex justify-between">
                    <span>LISA Suicide Prevention Hotline:</span>
                    <a href="tel:08111929119" className="text-[#00668a] font-bold">
                      0811-1929-119
                    </a>
                  </li>
                  <li className="flex justify-between">
                    <span>Layanan Anak &amp; Remaja TePSA Kemensos:</span>
                    <a href="tel:1500771" className="text-[#00668a] font-bold">
                      1500-771
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: BOX BREATHING */}
          {activeTab === 'breathing' && (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div>
                <h4 className="text-[18px] font-bold text-[#111c2d]">Latihan Napas Kotak 4-4-4-4</h4>
                <p className="text-[12px] text-[#576065]">
                  Teknik pernapasan ini merangsang saraf parasimpatis untuk menurunkan detak jantung dan kecemasan dalam 2 menit.
                </p>
              </div>

              {/* Animated breathing circle */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'scale-115 bg-[#38bdf8]/30 border-4 border-[#38bdf8]'
                      : breathPhase === 'hold1'
                      ? 'scale-115 bg-[#00668a]/30 border-4 border-[#00668a]'
                      : breathPhase === 'exhale'
                      ? 'scale-85 bg-emerald-200/40 border-4 border-emerald-400'
                      : 'scale-85 bg-slate-200/50 border-4 border-slate-300'
                  }`}
                ></div>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-[#111c2d]">{breathSeconds}</span>
                  <span className="text-[12px] font-bold text-[#00668a] mt-1 max-w-[120px]">
                    {getPhaseText()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className="px-5 py-2 rounded-full bg-[#00668a] text-white font-bold text-[13px] cursor-pointer"
                >
                  {isBreathingActive ? 'Jeda Latihan' : 'Mulai Latihan Napas'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GROUNDING 5-4-3-2-1 */}
          {activeTab === 'grounding' && (
            <div className="space-y-3">
              <h4 className="text-[16px] font-bold text-[#111c2d]">
                Teknik Grounding 5-4-3-2-1 untuk Meredakan Panik
              </h4>
              <p className="text-[12px] text-[#576065]">
                Saat pikiran terasa meluap atau panik, alihkan fokusmu secara perlahan ke panca indra di sekelilingmu:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-[12px]">
                    5
                  </span>
                  <span className="text-[13px] text-[#111c2d]">
                    Sebutkan <b>5 benda</b> yang bisa kamu lihat di ruanganmu saat ini.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-[12px]">
                    4
                  </span>
                  <span className="text-[13px] text-[#111c2d]">
                    Rasakan <b>4 hal</b> yang bisa kamu sentuh (misal: tekstur meja, kain baju, lantai).
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-[12px]">
                    3
                  </span>
                  <span className="text-[13px] text-[#111c2d]">
                    Dengarkan <b>3 suara</b> di sekitarmu (misal: suara kipas angin, kendaraan, detak jam).
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-[12px]">
                    2
                  </span>
                  <span className="text-[13px] text-[#111c2d]">
                    Kenali <b>2 aroma</b> yang bisa kamu cium di sekitarmu saat ini.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-[12px]">
                    1
                  </span>
                  <span className="text-[13px] text-[#111c2d]">
                    Rasakan <b>1 rasa</b> di mulutmu (teguk air putih dingin atau rasakan napasmu).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
