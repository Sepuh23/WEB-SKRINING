import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/65 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-[#f0f3ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00668a] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[16px] text-[#111c2d]">
                Kebijakan Privasi Remaja &amp; Etika AI
              </h3>
              <p className="text-[11px] text-[#576065]">Standar perlindungan data pribadi dan ruang aman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#576065] hover:text-[#111c2d] flex items-center justify-center border border-[#dee8ff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-left text-[13px] text-[#576065] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
            <h4 className="font-bold text-[#00668a] text-[14px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              1. 100% Bebas Rekaman Video &amp; Suara
            </h4>
            <p>
              Sensor multimodal web (Kamera FACS &amp; Mikrofon) di PSY-VIBE hanya menghitung koordinat matematis dan frekuensi gelombang secara lokal tanpa pernah merekam, menyimpan, atau mengirim berkas foto/suara ke basis data luar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
            <h4 className="font-bold text-[#00668a] text-[14px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              2. Ruang Curhat Anonim &amp; Terenkripsi
            </h4>
            <p>
              Setiap siswa memiliki hak penuh untuk menggunakan mode anonim. Guru BK atau pihak sekolah tidak dapat melihat isi obrolan personalmu dengan AI kecuali jika kamu sendiri yang memilih untuk membagikannya saat memesan sesi konseling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
            <h4 className="font-bold text-[#00668a] text-[14px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              3. Etika &amp; Batasan AI VibeBot
            </h4>
            <p>
              VibeBot dirancang sebagai pendamping empatik (active listener) dan penyaring dini kesejahteraan emosional, bukan pengganti diagnosis klinis dokter atau psikiater. Bila terdeteksi krisis akut, sistem akan otomatis memprioritaskan rujukan langsung ke manusia profesional.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#dee8ff] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#00668a] text-white font-bold text-[13px] cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
