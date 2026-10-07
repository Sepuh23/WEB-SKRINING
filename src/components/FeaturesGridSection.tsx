import React from 'react';

interface FeaturesGridSectionProps {
  onOpenScreening: () => void;
  onOpenCurhat: () => void;
  onOpenCounselor: () => void;
  onOpenJournal: () => void;
  onOpenDirectory: () => void;
}

export const FeaturesGridSection: React.FC<FeaturesGridSectionProps> = ({
  onOpenScreening,
  onOpenCurhat,
  onOpenCounselor,
  onOpenJournal,
  onOpenDirectory,
}) => {
  return (
    <section id="fitur-utama" className="w-full px-6 md:px-10 py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Title */}
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center gap-2">
          <span className="text-[12px] font-bold text-[#00668a] tracking-widest uppercase bg-[#f0f3ff] px-4 py-1.5 rounded-full border border-[#dee8ff]">
            EKOSISTEM DIGITAL
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] text-[#111c2d] font-bold mt-2">
            5 Fitur Unggulan Platform Web
          </h2>
          <p className="text-[16px] text-[#576065] leading-relaxed">
            Solusi terpadu pendampingan emosi dan kesehatan mental siswa di era digital, mudah diakses langsung tanpa repot.
          </p>
        </div>

        {/* Bento-style 5 features grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#f0f3ff] rounded-[22px] p-7 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)] hover:-translate-y-1 transition-all flex flex-col justify-between border border-[#dee8ff]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#00668a] flex items-center justify-center shadow-xs mb-5 border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[26px]">vital_signs</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111c2d] mb-2">
                Skrining Dual-Sensing
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed">
                Deteksi dini kelelahan emosional dan tingkat stres via peramban web tanpa perlu instalasi aplikasi tambahan apa pun.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenScreening}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00668a] hover:text-[#004965] transition-colors group cursor-pointer"
              >
                Mulai Skrining 3 Menit{' '}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#f0f3ff] rounded-[22px] p-7 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)] hover:-translate-y-1 transition-all flex flex-col justify-between border border-[#dee8ff]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#00668a] flex items-center justify-center shadow-xs mb-5 border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[26px]">forum</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111c2d] mb-2">
                Teman Curhat AI 24/7
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed">
                VibeBot, asisten empatik yang selalu siap mendengarkan cerita dan uneg-uneg kapan pun dengan respon hangat serta non-judgmental.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenCurhat}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00668a] hover:text-[#004965] transition-colors group cursor-pointer"
              >
                Buka Ruang Curhat{' '}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#f0f3ff] rounded-[22px] p-7 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)] hover:-translate-y-1 transition-all flex flex-col justify-between border border-[#dee8ff]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#00668a] flex items-center justify-center shadow-xs mb-5 border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[26px]">school</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111c2d] mb-2">
                Konsultasi Guru BK &amp; Psikolog
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed">
                Hubungkan curhatanmu ke konselor bimbingan konseling sekolah atau psikolog mitra secara aman dan terkontrol bila membutuhkan bantuan.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenCounselor}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00668a] hover:text-[#004965] transition-colors group cursor-pointer"
              >
                Pilih Jadwal Konselor{' '}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#f0f3ff] rounded-[22px] p-7 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)] hover:-translate-y-1 transition-all flex flex-col justify-between border border-[#dee8ff]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#00668a] flex items-center justify-center shadow-xs mb-5 border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[26px]">edit_calendar</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111c2d] mb-2">
                Jurnal Mood Harian
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed">
                Pantau grafik fluktuasi suasana hatimu setiap hari disertai panduan refleksi pintar serta rekomendasi afirmasi menenangkan.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenJournal}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00668a] hover:text-[#004965] transition-colors group cursor-pointer"
              >
                Buka Jurnal Mood{' '}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Feature 5 (Spans 2 columns on desktop) */}
          <div className="bg-[#f0f3ff] rounded-[22px] p-7 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.18)] hover:-translate-y-1 transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2 border border-[#dee8ff]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#00668a] flex items-center justify-center shadow-xs mb-5 border border-[#dee8ff]">
                <span className="material-symbols-outlined text-[26px]">explore</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111c2d] mb-2">
                Direktori Psikolog &amp; RS Terdekat
              </h3>
              <p className="text-[14px] text-[#576065] leading-relaxed max-w-xl">
                Temukan fasilitas kesehatan mental, puskesmas ramah remaja, dan klinik rujukan profesional terdekat berbasis lokasi GPS secara instan dan tepercaya ketika membutuhkan penanganan medis langsung.
              </p>
            </div>
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={onOpenDirectory}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00668a] hover:text-[#004965] transition-colors group cursor-pointer"
              >
                Cari Faskes Terdekat{' '}
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  near_me
                </span>
              </button>
              <span className="text-[11px] font-bold text-[#576065] bg-white px-3 py-1 rounded-full border border-[#dee8ff] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                GPS Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
