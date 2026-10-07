import React from 'react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenEmergencyModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenEmergencyModal,
  onOpenPrivacyModal,
}) => {
  return (
    <footer className="w-full bg-white border-t border-[#f0f3ff]">
      <div className="w-full px-6 md:px-10 pt-12 pb-8 max-w-7xl mx-auto">
        {/* Top Emergency Prompt Box */}
        <div className="w-full p-6 rounded-[20px] bg-[#f0f3ff] shadow-[0_8px_24px_-4px_rgba(56,189,248,0.15)] border border-[#dee8ff] flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">emergency</span>
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#111c2d]">Butuh Bantuan Cepat?</p>
              <p className="text-[13px] text-[#576065]">
                Jangan ragu untuk mencari dukungan krisis kapan saja secara rahasia.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenEmergencyModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#111c2d] font-bold text-[13px] shadow-xs border border-[#dee8ff] hover:bg-[#dee8ff] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#00668a] text-[20px]">
              support_agent
            </span>
            Hubungi Hotline Sejiwa Kemenkes 119 (Bebas Pulsa)
          </button>
        </div>

        {/* 4 Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#38bdf8] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </div>
              <span className="text-[18px] font-bold text-[#111c2d]">PSY-VIBE</span>
            </div>
            <p className="text-[13px] text-[#576065] leading-relaxed">
              Ruang aman digital dan asisten AI berempati tinggi untuk kesehatan mental dan ketahanan emosional generasi muda.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#00668a] text-[11px] font-semibold border border-[#dee8ff]">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Privasi &amp; Kerahasiaan Terjamin
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <p className="text-[14px] font-bold text-[#111c2d] mb-3">Eksplorasi Platform</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('beranda')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Ruang Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fitur-utama')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Fitur AI Mood &amp; Jurnal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cara-kerja')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Panduan Cara Kerja
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faskes-terdekat')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Direktori Faskes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <p className="text-[14px] font-bold text-[#111c2d] mb-3">Bantuan &amp; Konseling</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('konseling')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Konseling Sekolah
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergencyModal}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Dukungan Darurat 24/7
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Tanya Jawab (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <p className="text-[14px] font-bold text-[#111c2d] mb-3">Legalitas &amp; Kebijakan</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Kebijakan Privasi Remaja
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Syarat &amp; Ketentuan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  className="text-[13px] text-[#576065] hover:text-[#00668a] transition-colors cursor-pointer"
                >
                  Standar Etika AI
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#f0f3ff] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[12px] text-[#576065]">
          <p>© 2026 PSY-VIBE Team. Seluruh Hak Cipta Dilindungi.</p>
          <p>Dibuat dengan kepedulian untuk kesehatan emosional generasi penerus.</p>
        </div>
      </div>
    </footer>
  );
};
