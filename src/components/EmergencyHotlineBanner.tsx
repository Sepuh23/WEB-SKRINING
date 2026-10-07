import React from 'react';

interface EmergencyHotlineBannerProps {
  onOpenEmergencyModal: () => void;
}

export const EmergencyHotlineBanner: React.FC<EmergencyHotlineBannerProps> = ({
  onOpenEmergencyModal,
}) => {
  return (
    <section className="w-full px-6 md:px-10 pb-12">
      <div className="max-w-7xl mx-auto rounded-[24px] bg-[#ffdad6] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs border border-[#ffb4ab]">
        <div className="flex items-start md:items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#ba1a1a] shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[32px]">emergency</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] md:text-[20px] font-bold text-[#93000a]">
                Butuh Bantuan Krisis Cepat?
              </span>
              <span className="bg-[#ba1a1a] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                24 Jam
              </span>
            </div>
            <p className="text-[14px] text-[#93000a]/90 mt-1 leading-relaxed">
              Layanan tanggap darurat bebas biaya pulsa untuk krisis emosional mendesak. Kamu berharga dan kamu tidak sendirian.
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenEmergencyModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#ba1a1a] text-white font-bold text-[14px] shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
            <span>Hubungi Hotline Sejiwa 119</span>
          </button>
        </div>
      </div>
    </section>
  );
};
