import React, { useState } from 'react';

interface DualSensingSectionProps {
  onStartScreening: () => void;
  onOpenCurhat: () => void;
}

export const DualSensingSection: React.FC<DualSensingSectionProps> = ({
  onStartScreening,
  onOpenCurhat,
}) => {
  const [activeSimulation, setActiveSimulation] = useState<'normal' | 'smilingDepression' | 'fatigued'>('normal');

  const simulationPresets = {
    normal: {
      tension: 14,
      tensionLabel: '14% (Rendah / Aman)',
      blink: 72,
      blinkLabel: '72% (Stabil / Normal)',
      pitch: 80,
      pitchLabel: '80% (Tenang & Mengalir)',
      stress: 12,
      stressLabel: '12% (Terkendali / 0.12)',
      nlp: 'Contextual Sentiment NLP: Reflektif Positif',
      facsTag: 'Real-time FACS Validated Engine: Otot Zygomatic Relaks',
    },
    smilingDepression: {
      tension: 68,
      tensionLabel: '68% (Tegang / Senyum Palsu Terdeteksi)',
      blink: 44,
      blinkLabel: '44% (Tidak Teratur / Supresi Emosi)',
      pitch: 35,
      pitchLabel: '35% (Monoton / Nada Datar)',
      stress: 64,
      stressLabel: '64% (Tinggi / 0.64 Biomarker Stres)',
      nlp: 'Contextual Sentiment NLP: Kontradiksi Kata vs Akustik',
      facsTag: 'FACS Alert: AU12 (Lip Corner) aktif tanpa AU6 (Orbicularis Oculi)',
    },
    fatigued: {
      tension: 52,
      tensionLabel: '52% (Kelelahan Otot Wajah)',
      blink: 85,
      blinkLabel: '85% (Frekuensi Cepat / Mata Lelah)',
      pitch: 48,
      pitchLabel: '48% (Lemas / Jeda Bicara Panjang)',
      stress: 45,
      stressLabel: '45% (Sedang / 0.45 Burnout Pelajar)',
      nlp: 'Contextual Sentiment NLP: Energi Rendah & Butuh Rehat',
      facsTag: 'FACS Alert: Kelopak Mata Menurun & Penurunan Mikro-Gerak',
    },
  };

  const current = simulationPresets[activeSimulation];

  return (
    <section id="cara-kerja" className="w-full px-6 md:px-10 py-16 lg:py-24 bg-[#f0f3ff]">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center gap-2">
          <span className="text-[12px] font-bold text-[#00668a] tracking-widest uppercase bg-white px-4 py-1.5 rounded-full shadow-xs border border-[#dee8ff]">
            TEKNOLOGI AI MULTIMODAL
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] text-[#111c2d] font-bold mt-2">
            Bagaimana PSY-VIBE Memahami Perasaanmu?
          </h2>
          <p className="text-[16px] text-[#576065] leading-relaxed">
            Kombinasi analisis audio dan visual cerdas untuk mendeteksi kondisi mental lebih awal secara presisi langsung lewat peramban webmu tanpa instalasi.
          </p>

          {/* Preset Simulator Switch */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 bg-white/80 p-1.5 rounded-full border border-[#dee8ff]">
            <span className="text-[11px] font-bold text-[#576065] px-2.5">Simulasi Mode:</span>
            <button
              onClick={() => setActiveSimulation('normal')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                activeSimulation === 'normal'
                  ? 'bg-[#38bdf8] text-white shadow-xs'
                  : 'text-[#576065] hover:bg-[#f0f3ff]'
              }`}
            >
              Normal / Aman
            </button>
            <button
              onClick={() => setActiveSimulation('smilingDepression')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                activeSimulation === 'smilingDepression'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'text-[#576065] hover:bg-[#ffdad6]'
              }`}
            >
              Smiling Depression
            </button>
            <button
              onClick={() => setActiveSimulation('fatigued')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                activeSimulation === 'fatigued'
                  ? 'bg-[#00668a] text-white shadow-xs'
                  : 'text-[#576065] hover:bg-[#f0f3ff]'
              }`}
            >
              Kelelahan Belajar
            </button>
          </div>
        </div>

        {/* 2 Cards Side-by-Side */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Facial Action Coding */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_24px_-4px_rgba(56,189,248,0.12)] border border-[#e7eeff] flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#f0f3ff] flex items-center justify-center text-[#00668a] mb-6 shadow-inner border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[32px]">videocam</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#111c2d] mb-2">
                Kamera Web (Micro-Expression)
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed mb-6">
                Menganalisis ketegangan wajah, kerutan dahi, dan pola senyum palsu (<em>smiling depression</em>) via FACS (Facial Action Coding System) secara real-time.
              </p>
            </div>

            {/* Interactive Progress Metrics */}
            <div className="space-y-4 pt-4 bg-[#f0f3ff]/60 rounded-2xl p-5 border border-[#dee8ff]">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-bold text-[#111c2d]">Micro-Tension Index</span>
                  <span
                    className={`text-[12px] font-bold ${
                      current.tension > 40 ? 'text-[#ba1a1a]' : 'text-[#00668a]'
                    }`}
                  >
                    {current.tensionLabel}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#dee8ff] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      current.tension > 40 ? 'bg-[#ba1a1a]' : 'bg-[#38bdf8]'
                    }`}
                    style={{ width: `${current.tension}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-bold text-[#111c2d]">Eye-Blink Rhythm Rate</span>
                  <span className="text-[12px] text-[#00668a] font-bold">
                    {current.blinkLabel}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#dee8ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00668a] rounded-full transition-all duration-500"
                    style={{ width: `${current.blink}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#dee8ff]">
                <span className="material-symbols-outlined text-[#00668a] text-[18px]">verified</span>
                <span className="text-[12px] text-[#111c2d] font-semibold">
                  {current.facsTag}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Voice Prosody & NLP */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_24px_-4px_rgba(56,189,248,0.12)] border border-[#e7eeff] flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#f0f3ff] flex items-center justify-center text-[#00668a] mb-6 shadow-inner border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[32px]">graphic_eq</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#111c2d] mb-2">
                Mikrofon Web (Voice Prosody &amp; NLP)
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed mb-6">
                Menganalisis nada suara, jeda bicara, intonasi akustik, serta sentimen makna kata saat kamu bercerita tanpa ada penilaian menghakimi.
              </p>
            </div>

            {/* Interactive Progress Metrics */}
            <div className="space-y-4 pt-4 bg-[#f0f3ff]/60 rounded-2xl p-5 border border-[#dee8ff]">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-bold text-[#111c2d]">Pitch Cadence Dynamics</span>
                  <span className="text-[12px] text-[#00668a] font-bold">
                    {current.pitchLabel}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#dee8ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00668a] rounded-full transition-all duration-500"
                    style={{ width: `${current.pitch}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-bold text-[#111c2d]">Acoustic Stress Biomarker</span>
                  <span
                    className={`text-[12px] font-bold ${
                      current.stress > 40 ? 'text-[#ba1a1a]' : 'text-[#00668a]'
                    }`}
                  >
                    {current.stressLabel}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#dee8ff] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      current.stress > 40 ? 'bg-[#ba1a1a]' : 'bg-[#38bdf8]'
                    }`}
                    style={{ width: `${current.stress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#dee8ff]">
                <span className="material-symbols-outlined text-[#00668a] text-[18px]">psychology</span>
                <span className="text-[12px] text-[#111c2d] font-semibold">
                  {current.nlp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button below */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={onStartScreening}
            className="px-6 py-3 rounded-full bg-[#00668a] text-white font-semibold text-[14px] shadow-sm hover:bg-[#004c69] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">biometrics</span>
            Coba Skrining Mandiri 3 Menit
          </button>
          <button
            onClick={onOpenCurhat}
            className="px-6 py-3 rounded-full bg-white text-[#00668a] border border-[#dee8ff] font-semibold text-[14px] shadow-sm hover:bg-[#f0f3ff] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
            Mulai Cerita ke VibeBot
          </button>
        </div>
      </div>
    </section>
  );
};
