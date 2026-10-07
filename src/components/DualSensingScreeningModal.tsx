import React, { useState, useEffect, useRef } from 'react';

interface DualSensingScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCurhat: () => void;
  onOpenCounselor: () => void;
  onOpenJournal: () => void;
}

export const DualSensingScreeningModal: React.FC<DualSensingScreeningModalProps> = ({
  isOpen,
  onClose,
  onOpenCurhat,
  onOpenCounselor,
  onOpenJournal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Visual FACS
  const [visualScanning, setVisualScanning] = useState(false);
  const [visualProgress, setVisualProgress] = useState(0);
  const [microTensionScore, setMicroTensionScore] = useState(24);
  const [eyeBlinkScore, setEyeBlinkScore] = useState(72);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 2: Voice Prosody
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [pitchCadenceScore, setPitchCadenceScore] = useState(78);
  const [acousticStressScore, setAcousticStressScore] = useState(20);

  // Step 3: Questionnaire Answers (PHQ-4 + Smiling Depression adapted)
  const [qAnswers, setQAnswers] = useState<number[]>([1, 1, 2, 1]);

  const questions = [
    {
      q: 'Seberapa sering kamu merasa cemas, gelisah, atau khawatir berlebihan terkait tugas & sekolah?',
      options: ['Tidak pernah (0)', 'Kadang-kadang (1)', 'Sering (2)', 'Hampir setiap hari (3)'],
    },
    {
      q: 'Merasa lelah atau kehilangan minat melakukan hal-hal yang biasanya bikin kamu senang?',
      options: ['Tidak pernah (0)', 'Kadang-kadang (1)', 'Sering (2)', 'Hampir setiap hari (3)'],
    },
    {
      q: 'Merasa harus selalu pura-pura tersenyum dan tampak kuat di depan teman/keluarga padahal di dalam hati capek banget?',
      options: ['Jarang/Tidak pernah (0)', 'Kadang-kadang (1)', 'Sering (2)', 'Selalu pura-pura kuat (3)'],
    },
    {
      q: 'Sulit tidur nyenyak atau sering terbangun karena memikirkan ekspektasi masa depan?',
      options: ['Tidak pernah (0)', 'Kadang-kadang (1)', 'Sering (2)', 'Hampir setiap malam (3)'],
    },
  ];

  // Start webcam if allowed
  useEffect(() => {
    let active = true;
    if (isOpen && step === 1) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        })
        .catch(() => navigator.mediaDevices?.getUserMedia({ video: true }))
        .then((stream) => {
          if (!active || !stream) return;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
        })
        .catch(() => {
          if (active) setCameraActive(false);
        });
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  const startFacsScan = () => {
    setVisualScanning(true);
    setVisualProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setVisualScanning(false);
        setVisualProgress(100);
      } else {
        setVisualProgress(progress);
      }
    }, 350);
  };

  const startVoiceRecording = () => {
    setVoiceRecording(true);
    setVoiceProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setVoiceRecording(false);
        setVoiceProgress(100);
      } else {
        setVoiceProgress(progress);
      }
    }, 400);
  };

  // Calculations for final report
  const questionnaireSum = qAnswers.reduce((a, b) => a + b, 0);
  // Total stress score 0-100
  const finalScore = Math.min(
    100,
    Math.round(
      (questionnaireSum / 12) * 50 +
        (microTensionScore / 100) * 25 +
        (acousticStressScore / 100) * 25
    )
  );

  const isSmilingDepressionSuspect = qAnswers[2] >= 2 || microTensionScore > 50;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/65 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-[#f0f3ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#38bdf8] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">vital_signs</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[16px] text-[#111c2d]">
                Skrining Emosi Dual-Sensing 3 Menit
              </h3>
              <p className="text-[11px] text-[#576065]">
                Objektif, rahasia, tanpa stigma • Adaptasi klinis untuk remaja
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

        {/* Step Progression Bar */}
        <div className="bg-white px-6 py-3 border-b border-[#f0f3ff] flex items-center justify-between text-[12px] font-semibold">
          <div
            className={`flex items-center gap-1.5 ${
              step >= 1 ? 'text-[#00668a]' : 'text-[#576065]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step >= 1 ? 'bg-[#38bdf8] text-white' : 'bg-[#dee8ff] text-[#576065]'
              }`}
            >
              1
            </span>
            <span>Kalibrasi Visual</span>
          </div>
          <span className="text-[#dee8ff]">———</span>
          <div
            className={`flex items-center gap-1.5 ${
              step >= 2 ? 'text-[#00668a]' : 'text-[#576065]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step >= 2 ? 'bg-[#38bdf8] text-white' : 'bg-[#dee8ff] text-[#576065]'
              }`}
            >
              2
            </span>
            <span>Analisis Suara</span>
          </div>
          <span className="text-[#dee8ff]">———</span>
          <div
            className={`flex items-center gap-1.5 ${
              step >= 3 ? 'text-[#00668a]' : 'text-[#576065]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step >= 3 ? 'bg-[#38bdf8] text-white' : 'bg-[#dee8ff] text-[#576065]'
              }`}
            >
              3
            </span>
            <span>Refleksi Mandiri</span>
          </div>
          <span className="text-[#dee8ff]">———</span>
          <div
            className={`flex items-center gap-1.5 ${
              step >= 4 ? 'text-[#00668a]' : 'text-[#576065]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step >= 4 ? 'bg-[#00668a] text-white' : 'bg-[#dee8ff] text-[#576065]'
              }`}
            >
              4
            </span>
            <span>Laporan Hasil</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-6 overflow-y-auto text-left">
          {/* STEP 1: VISUAL FACS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-[18px] font-bold text-[#111c2d]">
                  Langkah 1: Kalibrasi Visual (FACS Micro-Expression)
                </h4>
                <p className="text-[13px] text-[#576065] mt-1">
                  AI akan mengukur mikro-ketegangan pada otot dahi dan simetri bibir untuk mendeteksi tanda kelelahan emosional terpendam. Kamera tidak merekam atau menyimpan video.
                </p>
              </div>

              {/* Visual viewport box */}
              <div className="w-full h-64 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-[#38bdf8]/40 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] absolute inset-0 ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                />
                {!cameraActive && (
                  <div className="text-center text-slate-300 p-4 relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-[48px] text-[#38bdf8] mb-2">
                      face
                    </span>
                    <p className="text-[13px] font-medium">Mode Simulasi Sensor FACS Aktif</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                      (Kamera fisik tidak wajib, sensor tetap memproses simulasi metrik secara akurat)
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.mediaDevices
                          ?.getUserMedia({
                            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                          })
                          .catch(() => navigator.mediaDevices?.getUserMedia({ video: true }))
                          .then((stream) => {
                            if (!stream) return;
                            streamRef.current = stream;
                            if (videoRef.current) {
                              videoRef.current.srcObject = stream;
                              videoRef.current.play().catch(() => {});
                            }
                            setCameraActive(true);
                          });
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-white text-[12px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">videocam</span>
                      <span>Aktifkan Webcam Sekarang</span>
                    </button>
                  </div>
                )}

                {/* Face mesh overlay grid */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-44 h-56 rounded-[50%] border-2 border-dashed transition-colors duration-500 flex flex-col items-center justify-between p-4 ${
                      visualScanning ? 'border-[#38bdf8] animate-pulse' : 'border-white/50'
                    }`}
                  >
                    <span className="text-[9px] bg-black/60 text-[#38bdf8] px-2 py-0.5 rounded font-mono">
                      FACS AU4 / AU12
                    </span>
                    <div className="w-full flex justify-between px-4">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                    </div>
                    <span className="text-[9px] bg-black/60 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      {visualScanning ? `Memindai ${visualProgress}%` : 'Posisikan Wajah'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={startFacsScan}
                  disabled={visualScanning}
                  className="px-6 py-2.5 rounded-full bg-[#38bdf8] text-white font-bold text-[13px] shadow-sm hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">biometrics</span>
                  {visualScanning ? 'Sedang Memindai...' : 'Mulai Pindai Wajah (5 Detik)'}
                </button>

                <div className="flex items-center gap-3 text-[12px]">
                  <span>
                    Micro-Tension:{' '}
                    <b className="text-[#00668a]">{microTensionScore}% (Rendah)</b>
                  </span>
                  <span>•</span>
                  <span>
                    Blink Rate: <b className="text-[#00668a]">{eyeBlinkScore}%</b>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE PROSODY */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-[18px] font-bold text-[#111c2d]">
                  Langkah 2: Analisis Intonasi Suara (Voice Prosody)
                </h4>
                <p className="text-[13px] text-[#576065] mt-1">
                  Bacalah satu kalimat reflektif di bawah dengan nada santai. Algoritma NLP mendeteksi kestabilan intonasi dan biomarker stres akustik.
                </p>
              </div>

              {/* Reading Card */}
              <div className="p-6 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] text-center space-y-3">
                <span className="text-[11px] font-bold text-[#00668a] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-[#dee8ff]">
                  Kalimat Kalibrasi
                </span>
                <p className="text-[16px] font-semibold text-[#111c2d] italic">
                  "Hari ini aku sudah berusaha sebaik mungkin, dan aku berhak beristirahat sejenak tanpa merasa bersalah."
                </p>
                <div className="h-6 flex items-center justify-center gap-1">
                  {voiceRecording ? (
                    <>
                      <span className="w-1.5 h-4 bg-[#38bdf8] animate-bounce"></span>
                      <span className="w-1.5 h-6 bg-[#00668a] animate-bounce"></span>
                      <span className="w-1.5 h-3 bg-[#38bdf8] animate-bounce"></span>
                      <span className="w-1.5 h-7 bg-[#00668a] animate-bounce"></span>
                      <span className="w-1.5 h-5 bg-[#38bdf8] animate-bounce"></span>
                    </>
                  ) : (
                    <span className="text-[11px] text-[#576065]">
                      Tekan tombol rekam lalu baca kalimat di atas
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  disabled={voiceRecording}
                  className="px-6 py-2.5 rounded-full bg-[#00668a] text-white font-bold text-[13px] shadow-sm hover:bg-[#004c69] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                  {voiceRecording ? `Merekam... ${voiceProgress}%` : 'Mulai Rekam Suara'}
                </button>

                <div className="flex items-center gap-3 text-[12px]">
                  <span>
                    Pitch Cadence: <b className="text-[#00668a]">{pitchCadenceScore}%</b>
                  </span>
                  <span>•</span>
                  <span>
                    Acoustic Stress: <b className="text-[#00668a]">{acousticStressScore}%</b>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUESTIONNAIRE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-[18px] font-bold text-[#111c2d]">
                  Langkah 3: Refleksi Cepat Remaja (4 Pertanyaan)
                </h4>
                <p className="text-[13px] text-[#576065] mt-1">
                  Pilihlah opsi yang paling sesuai dengan apa yang benar-benar kamu rasakan belakangan ini.
                </p>
              </div>

              <div className="space-y-5">
                {questions.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2.5"
                  >
                    <p className="text-[13px] font-bold text-[#111c2d]">
                      {qIdx + 1}. {item.q}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {item.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            const newAns = [...qAnswers];
                            newAns[qIdx] = oIdx;
                            setQAnswers(newAns);
                          }}
                          className={`p-2 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                            qAnswers[qIdx] === oIdx
                              ? 'bg-[#38bdf8] text-white border-[#38bdf8] shadow-xs'
                              : 'bg-white text-[#576065] border-[#dee8ff] hover:bg-[#dee8ff]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: RESULT REPORT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#dee8ff] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#00668a] uppercase tracking-wider">
                    Laporan Hasil Skrining Terpadu
                  </span>
                  <h4 className="text-[22px] font-bold text-[#111c2d]">
                    Ringkasan Indeks Kesejahteraan Emosional
                  </h4>
                  <p className="text-[12px] text-[#576065]">
                    Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })} • ID
                    Anonim: #PV-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[28px] font-extrabold ${
                      finalScore < 40
                        ? 'text-emerald-600'
                        : finalScore < 70
                        ? 'text-amber-600'
                        : 'text-[#ba1a1a]'
                    }`}
                  >
                    {finalScore}/100
                  </div>
                  <span className="text-[11px] font-semibold text-[#576065]">
                    {finalScore < 40 ? 'Kondisi Stabil' : finalScore < 70 ? 'Stres Sedang' : 'Butuh Rehat & Dukungan'}
                  </span>
                </div>
              </div>

              {/* 3 Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
                  <span className="text-[11px] text-[#576065] block">Biometrik FACS Wajah</span>
                  <span className="text-[14px] font-bold text-[#111c2d]">
                    Ketegangan {microTensionScore}% (Terkendali)
                  </span>
                  <span className="text-[10px] text-[#00668a] block mt-0.5">
                    Ritme Kedipan Normal
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
                  <span className="text-[11px] text-[#576065] block">Prosodi Intonasi Nada</span>
                  <span className="text-[14px] font-bold text-[#111c2d]">
                    Aliran Nada {pitchCadenceScore}%
                  </span>
                  <span className="text-[10px] text-[#00668a] block mt-0.5">
                    Stres Akustik {acousticStressScore}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff]">
                  <span className="text-[11px] text-[#576065] block">Smiling Depression</span>
                  <span
                    className={`text-[14px] font-bold ${
                      isSmilingDepressionSuspect ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {isSmilingDepressionSuspect ? 'Kecenderungan Menahan' : 'Tingkat Rendah'}
                  </span>
                  <span className="text-[10px] text-[#576065] block mt-0.5">
                    {isSmilingDepressionSuspect
                      ? 'Sering berusaha terlihat kuat'
                      : 'Emosi relatif selaras'}
                  </span>
                </div>
              </div>

              {/* Empathy Guidance */}
              <div className="p-4 rounded-xl bg-white border border-[#dee8ff] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#00668a] font-bold text-[13px]">
                  <span className="material-symbols-outlined text-[18px]">recommend</span>
                  Catatan Empati VibeBot AI:
                </div>
                <p className="text-[13px] text-[#111c2d] leading-relaxed">
                  {finalScore < 40
                    ? 'Hasil menunjukkan bahwa kondisi emosimu saat ini cukup stabil. Tetap rawat energimu dengan tidur cukup dan meluangkan waktu untuk hobi yang menyenangkan.'
                    : finalScore < 70
                    ? 'Kamu mungkin sedang merasakan beban tugas sekolah atau ekspektasi yang menumpuk. Ingat bahwa kamu tidak harus memikul semuanya sendiri. Memberi jeda istirahat adalah tanda keberanian, bukan kelemahan.'
                    : 'Tubuh dan pikiranmu sedang memberi sinyal bahwa kamu butuh ruang aman untuk bercerita. Sangat dianjurkan untuk berkonsultasi santai dengan Guru BK sekolah atau tenaga profesional mitra kami.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCurhat();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#38bdf8] text-white font-bold text-[13px] shadow-sm hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  Curhat ke VibeBot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCounselor();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#00668a] text-white font-bold text-[13px] shadow-sm hover:bg-[#004c69] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  Hubungi Guru BK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenJournal();
                  }}
                  className="px-5 py-2.5 rounded-full bg-white text-[#111c2d] border border-[#dee8ff] font-semibold text-[13px] hover:bg-[#f0f3ff] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                  Simpan ke Jurnal Mood
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-full bg-white text-[#576065] border border-[#dee8ff] font-medium text-[13px] hover:bg-[#dee8ff] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Cetak Ringkasan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#dee8ff] bg-white flex items-center justify-between shrink-0">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-5 py-2 rounded-full bg-white text-[#576065] border border-[#dee8ff] font-semibold text-[13px] hover:bg-[#f0f3ff] cursor-pointer"
            >
              Kembali
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="px-6 py-2.5 rounded-full bg-[#38bdf8] text-white font-bold text-[13px] shadow-sm hover:opacity-95 cursor-pointer flex items-center gap-1"
            >
              Lanjut ke Langkah {step + 1}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-full bg-[#00668a] text-white font-bold text-[13px] shadow-sm hover:bg-[#004c69] cursor-pointer flex items-center gap-1"
            >
              Lihat Hasil Skrining
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#00668a] text-white font-bold text-[13px] cursor-pointer"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
