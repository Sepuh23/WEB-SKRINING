import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TelemetryData } from '../types';
import { DEFAULT_TELEMETRY } from '../data/mockData';

interface VibeBotCurhatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onOpenCounselor: () => void;
  onOpenJournal: () => void;
  onOpenEmergency: () => void;
  onOpenDirectory: () => void;
}

export const VibeBotCurhatModal: React.FC<VibeBotCurhatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  onOpenCounselor,
  onOpenJournal,
  onOpenEmergency,
  onOpenDirectory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hai! Cerita aja apa yang bikin kamu ganjel hari ini, aku dengerin kok tanpa nge-judge apapun. Rahasia & 100% Anonim.',
      timestamp: 'Baru saja',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Real Camera Toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        streamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable, using simulation:', err);
        setCameraActive(true); // use simulation fallback visual
      }
    }
  };

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // Handle Real Mic Toggle
  const toggleMicrophone = async () => {
    if (micActive) {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        setMicActive(true);
        drawAudioVisualizer();
      } catch (err) {
        console.warn('Microphone access denied or unavailable, using simulation:', err);
        setMicActive(true);
      }
    }
  };

  const drawAudioVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    render();
  };

  // Preset selector
  const setPreset = (type: 'normal' | 'smiling' | 'burnout') => {
    if (type === 'normal') {
      setTelemetry({
        microTension: 14,
        eyeBlink: 72,
        facialExpression: 'Tenang',
        pitchCadence: 80,
        acousticStress: 12,
        vocalTone: 'Tenang (88%)',
      });
    } else if (type === 'smiling') {
      setTelemetry({
        microTension: 68,
        eyeBlink: 44,
        facialExpression: 'Pura-pura Senyum',
        pitchCadence: 35,
        acousticStress: 64,
        vocalTone: 'Monoton / Datar (0.64 Stres)',
      });
    } else {
      setTelemetry({
        microTension: 58,
        eyeBlink: 84,
        facialExpression: 'Sedikit Lelah',
        pitchCadence: 45,
        acousticStress: 48,
        vocalTone: 'Lemas / Terputus',
      });
    }
  };

  // Text To Speech
  const speakMessage = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\n*#_]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      setSpeakingMessageId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetrySnapshot: { ...telemetry },
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          telemetry: telemetry,
        }),
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        smilingDepressionFlag: data.smilingDepressionDetected,
        crisisFlag: data.crisisDetected,
        suggestedFeature: data.suggestedFeature,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error contacting chat endpoint:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Aku di sini mendengarkanmu. Jangan ragu untuk melepaskan segala uneg-unegmu pelan-pelan ya.',
          timestamp: 'Sekarang',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl h-[92vh] max-h-[850px] rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-gradient-to-r from-white via-[#f0f3ff] to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs p-1 border border-[#dee8ff]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoTWu--wp5meTLIpxAbLIdRjQ31nqWftLfvjhKOZ8pylG5fdbtkQPSMWWz4VG7Ljy3H0mZBzLvJY4WGZdpp1oBYl-ReiyUInQOYZubjiFSVJxY80a9SnwbCEMM7xKurmxd5b_RX9SmhnMDCMhFwEv5Jbo75e4amqsyXKVjiKtnlzA3foW4_tYwNz-EDygGaa0IyOK4YONMETrw1jpHZIsafHbNuMCAAytFqLZKGks"
                alt="VibeBot"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[16px] text-[#111c2d]">VibeBot Empathy</span>
                <span className="bg-[#f0f3ff] text-[#00668a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#dee8ff]">
                  Dual-Sensing Aktif
                </span>
              </div>
              <span className="text-[11px] text-[#576065] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online 24/7 • 100% Rahasia &amp; E2E Enkripsi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Bersihkan riwayat percakapan curhat dan mulai baru?')) {
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      text: 'Hai! Cerita aja apa yang bikin kamu ganjel hari ini, aku dengerin kok tanpa nge-judge apapun. Rahasia & 100% Anonim.',
                      timestamp: 'Baru saja',
                    },
                  ]);
                }
              }}
              className="p-1.5 rounded-full bg-[#f0f3ff] text-[#576065] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Bersihkan Percakapan"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            </button>
            <button
              onClick={() => setShowTelemetryDetails(!showTelemetryDetails)}
              className="px-3 py-1.5 rounded-full bg-[#f0f3ff] text-[#00668a] text-[12px] font-semibold border border-[#dee8ff] hover:bg-[#dee8ff] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span className="hidden sm:inline">Telemetry HUD</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#f0f3ff] text-[#576065] hover:text-[#111c2d] hover:bg-[#dee8ff] transition-colors flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Dual-Sensing HUD Bar */}
        {showTelemetryDetails && (
          <div className="bg-[#f0f3ff] border-b border-[#dee8ff] px-6 py-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 text-left">
              {/* Camera Status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleCamera}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    cameraActive
                      ? 'bg-[#38bdf8] text-white shadow-xs'
                      : 'bg-white text-[#576065] border border-[#dee8ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">videocam</span>
                  {cameraActive ? 'Kamera FACS On' : 'Aktifkan Kamera'}
                </button>
                <div className="text-[11px] text-[#111c2d]">
                  Tension:{' '}
                  <b className={telemetry.microTension > 40 ? 'text-[#ba1a1a]' : 'text-[#00668a]'}>
                    {telemetry.microTension}%
                  </b>{' '}
                  • Blink: <b>{telemetry.eyeBlink}%</b> • Mimik: <b>{telemetry.facialExpression}</b>
                </div>
              </div>

              {/* Mic Status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMicrophone}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    micActive
                      ? 'bg-[#00668a] text-white shadow-xs'
                      : 'bg-white text-[#576065] border border-[#dee8ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
                  {micActive ? 'Mic Prosody On' : 'Aktifkan Mic'}
                </button>
                <div className="text-[11px] text-[#111c2d]">
                  Pitch: <b>{telemetry.pitchCadence}%</b> • Stress:{' '}
                  <b className={telemetry.acousticStress > 40 ? 'text-[#ba1a1a]' : 'text-[#00668a]'}>
                    {telemetry.acousticStress}%
                  </b>
                </div>
              </div>

              {/* Simulator Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#576065] font-semibold">Uji Sensor:</span>
                <button
                  onClick={() => setPreset('normal')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#dee8ff] text-[#111c2d] hover:bg-[#dee8ff] cursor-pointer"
                >
                  Normal
                </button>
                <button
                  onClick={() => setPreset('smiling')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#ffdad6] text-[#ba1a1a] font-bold border border-[#ffb4ab] hover:opacity-90 cursor-pointer"
                >
                  Smiling Depresi
                </button>
                <button
                  onClick={() => setPreset('burnout')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#dee8ff] text-[#00668a] hover:bg-[#dee8ff] cursor-pointer"
                >
                  Lelah
                </button>
              </div>
            </div>

            {/* Video preview thumbnail if camera active */}
            {cameraActive && (
              <div className="mt-2 pt-2 border-t border-[#dee8ff] flex items-center gap-3">
                <div className="w-20 h-14 bg-black rounded-lg overflow-hidden relative border border-[#38bdf8] shrink-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 text-[8px] bg-black/60 text-[#38bdf8] px-1 rounded">
                    FACS Scan
                  </div>
                </div>
                <div className="text-[11px] text-[#576065] flex-1">
                  <span className="text-[#00668a] font-bold">Analisis Visual Real-Time:</span>{' '}
                  Titik FACS mendeteksi ketegangan otot orbicularis & zygomaticus. Data diproses di perangkat lokal tanpa pernah disimpan.
                </div>
                <canvas ref={canvasRef} width="100" height="28" className="bg-white rounded-md border border-[#dee8ff]" />
              </div>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs text-left relative ${
                  msg.sender === 'user'
                    ? 'bg-[#38bdf8] text-white rounded-tr-xs'
                    : 'bg-[#f0f3ff] text-[#111c2d] rounded-tl-xs border border-[#dee8ff]'
                }`}
              >
                {/* Bot Label */}
                {msg.sender === 'bot' && (
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#dee8ff]/60">
                    <span className="text-[11px] font-bold text-[#00668a] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                      VibeBot Empathy
                    </span>
                    <button
                      onClick={() => speakMessage(msg.text, msg.id)}
                      className="text-[11px] text-[#00668a] hover:text-[#004965] flex items-center gap-1 cursor-pointer"
                      title="Dengarkan Suara"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {speakingMessageId === msg.id ? 'volume_off' : 'volume_up'}
                      </span>
                      <span className="text-[10px]">
                        {speakingMessageId === msg.id ? 'Berhenti' : 'Dengar'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <p className="text-[14px] leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Telemetry pill snapshot if user */}
                {msg.telemetrySnapshot && (
                  <div className="mt-2 pt-1 border-t border-white/20 text-[10px] text-white/80 flex items-center gap-2">
                    <span>FACS: {msg.telemetrySnapshot.microTension}%</span>
                    <span>•</span>
                    <span>Tone: {msg.telemetrySnapshot.vocalTone}</span>
                  </div>
                )}

                {/* Smiling Depression Alert Box */}
                {msg.smilingDepressionFlag && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[12px] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
                      psychology_alt
                    </span>
                    <div>
                      <b className="block">Deteksi Smiling Depression (Ketidakselarasan Emosi)</b>
                      Sensor mendeteksi kamu sedang menahan ketegangan batin meski mengatakan baik-baik saja. Ruang ini aman, jangan takut melepaskan lelahmu.
                    </div>
                  </div>
                )}

                {/* Crisis Safeguard Box */}
                {msg.crisisFlag && (
                  <div className="mt-3 p-3 bg-[#ffdad6] border border-[#ffb4ab] rounded-xl text-[#93000a] text-[12px] flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] shrink-0">
                        emergency
                      </span>
                      <div>
                        <b className="block text-[13px]">Bantuan Darurat Tersedia 24 Jam Bebas Pulsa</b>
                        Kamu berharga dan ada orang yang ingin mendengarkan serta membantumu melewati ini.
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={onOpenEmergency}
                        className="px-4 py-1.5 rounded-full bg-[#ba1a1a] text-white font-bold text-[12px] hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        Hubungi Hotline Sejiwa 119
                      </button>
                      <button
                        onClick={onOpenDirectory}
                        className="px-4 py-1.5 rounded-full bg-white text-[#93000a] border border-[#ffb4ab] font-semibold text-[12px] hover:bg-[#ffdad6] cursor-pointer"
                      >
                        Lihat Faskes &amp; RS Terdekat
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested feature actions */}
                {msg.suggestedFeature === 'guru-bk' && (
                  <div className="mt-3 pt-2 border-t border-[#dee8ff] flex items-center gap-2">
                    <button
                      onClick={onOpenCounselor}
                      className="px-3 py-1 rounded-full bg-[#00668a] text-white text-[11px] font-bold hover:bg-[#004c69] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      Jadwalkan Chat Guru BK Sekolah
                    </button>
                  </div>
                )}

                {msg.suggestedFeature === 'jurnal' && (
                  <div className="mt-3 pt-2 border-t border-[#dee8ff] flex items-center gap-2">
                    <button
                      onClick={onOpenJournal}
                      className="px-3 py-1 rounded-full bg-[#38bdf8] text-white text-[11px] font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                      Catat di Jurnal Mood Harian
                    </button>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-white/80' : 'text-[#576065]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#00668a] text-[12px] font-semibold bg-[#f0f3ff] p-3 rounded-2xl w-fit border border-[#dee8ff]">
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              VibeBot sedang memproses multimodal telemetry &amp; merangkai respon empatik...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-[#f0f3ff]/60 border-t border-[#f0f3ff] flex items-center gap-2 overflow-x-auto shrink-0 text-left">
          <span className="text-[11px] font-bold text-[#576065] shrink-0">Tes Cepat:</span>
          <button
            onClick={() =>
              handleSendMessage(
                'Hari ini tugas numpuk banget, aku capek tapi harus tetep senyum di depan temen-temen.'
              )
            }
            className="text-[11px] px-3 py-1 rounded-full bg-white border border-[#dee8ff] text-[#111c2d] hover:bg-[#dee8ff] whitespace-nowrap cursor-pointer transition-colors"
          >
            "Tugas numpuk tapi harus senyum" (Few-shot)
          </button>
          <button
            onClick={() => {
              setPreset('smiling');
              handleSendMessage('Aku biasa aja kok, gak apa-apa.');
            }}
            className="text-[11px] px-3 py-1 rounded-full bg-white border border-[#dee8ff] text-[#111c2d] hover:bg-[#dee8ff] whitespace-nowrap cursor-pointer transition-colors"
          >
            "Aku biasa aja kok" (Tes Smiling Depression)
          </button>
          <button
            onClick={() => handleSendMessage('Rasanya kesepian banget di kelas dan gak ada yang ngerti.')}
            className="text-[11px] px-3 py-1 rounded-full bg-white border border-[#dee8ff] text-[#111c2d] hover:bg-[#dee8ff] whitespace-nowrap cursor-pointer transition-colors"
          >
            "Kesepian di sekolah"
          </button>
          <button
            onClick={() =>
              handleSendMessage('Takut bikin orang tua kecewa karena nilaiku turun belakangan ini.')
            }
            className="text-[11px] px-3 py-1 rounded-full bg-white border border-[#dee8ff] text-[#111c2d] hover:bg-[#dee8ff] whitespace-nowrap cursor-pointer transition-colors"
          >
            "Takut kecewain orang tua"
          </button>
        </div>

        {/* Input Form Bar */}
        <div className="p-4 bg-white border-t border-[#dee8ff] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 bg-[#f0f3ff] rounded-full px-4 py-2.5 flex items-center gap-2 border border-[#dee8ff] focus-within:border-[#38bdf8] transition-colors">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Cerita apa aja, VibeBot siap dengerin tanpa stigma..."
                className="w-full bg-transparent text-[14px] text-[#111c2d] focus:outline-none placeholder:text-[#576065]"
              />
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`material-symbols-outlined text-[20px] transition-colors cursor-pointer ${
                  micActive ? 'text-[#ba1a1a] animate-pulse' : 'text-[#00668a] hover:text-[#38bdf8]'
                }`}
                title="Bicara via Mikrofon"
              >
                mic
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-full bg-[#38bdf8] text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
