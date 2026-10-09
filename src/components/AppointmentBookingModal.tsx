import React, { useState } from 'react';
import { Appointment, AppointmentMode, AppointmentTargetType, Counselor, StudentProfile } from '../types';
import { MOCK_COUNSELORS } from '../data/mockData';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  initialTargetType?: AppointmentTargetType;
  initialCounselorId?: string;
  onSaveAppointment: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  student,
  initialTargetType = 'guru_bk',
  initialCounselorId,
  onSaveAppointment,
}) => {
  const [targetType, setTargetType] = useState<AppointmentTargetType>(initialTargetType);
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    initialCounselorId || (initialTargetType === 'guru_bk' ? 'c1' : 'c3')
  );
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<
    'Stres Akademik & Ujian' | 'Masalah Pertemanan / Bullying' | 'Keluarga & Ekspektasi' | 'Kecemasan / Burnout' | 'Pengembangan Diri & Karir' | 'Curhat Umum'
  >('Stres Akademik & Ujian');
  const [mode, setMode] = useState<AppointmentMode>('tatap_muka');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 - 11:00 WIB');
  const [notes, setNotes] = useState('');
  const [stressLevel, setStressLevel] = useState<'rendah' | 'sedang' | 'tinggi'>('sedang');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const availableCounselors = MOCK_COUNSELORS.filter((c) => c.counselorType === targetType);
  const currentCounselor =
    availableCounselors.find((c) => c.id === selectedCounselorId) || availableCounselors[0] || MOCK_COUNSELORS[0];

  const handleTargetTypeChange = (type: AppointmentTargetType) => {
    setTargetType(type);
    const filtered = MOCK_COUNSELORS.filter((c) => c.counselorType === type);
    if (filtered.length > 0) {
      setSelectedCounselorId(filtered[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setFormError('Silakan tuliskan topik atau hal yang ingin dikonsultasikan terlebih dahulu.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      studentId: student.id,
      studentName: isAnonymous ? `Siswa Anonim (#${student.id.slice(0, 4)})` : student.name,
      studentSchool: student.school,
      studentClass: student.classGrade || 'XI MIPA',
      studentAvatar: isAnonymous
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'
        : student.avatar,
      counselorType: targetType,
      counselorId: currentCounselor.id,
      counselorName: currentCounselor.name,
      counselorRole: currentCounselor.role,
      counselorAvatar: currentCounselor.avatar,
      topic: topic.trim(),
      category: category,
      mode: mode,
      locationOrLink:
        mode === 'tatap_muka'
          ? currentCounselor.location || 'Ruang BK Sekolah'
          : `https://meet.google.com/psy-${Math.random().toString(36).substring(2, 8)}`,
      date: date,
      time: timeSlot,
      notes: notes.trim(),
      status: 'confirmed',
      stressLevel: stressLevel,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSaveAppointment(newAppointment);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50 via-white to-sky-50 border-b border-[#dee8ff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-[#111c2d]">Buat Janji Temu Konseling</h2>
              <p className="text-[12px] text-[#00668a]">
                Pilih janji temu dengan <b>Guru BK Sekolah</b> atau <b>Psikolog Klinis</b>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f0f3ff] text-[#576065] hover:text-[#111c2d] hover:bg-[#dee8ff] transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900">Janji Temu Berhasil Dibuat!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Permintaan janji temu Anda telah tersimpan dan terkirim ke <b>{currentCounselor.name}</b>. Anda dapat memantau status sesi di dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-left flex-1">
            
            {/* Step 1: Target Selector (Guru BK vs Psikolog Klinis) */}
            <div>
              <label className="block text-[13px] font-bold text-[#111c2d] mb-2">
                1. Pilih Tujuan Janji Temu:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('guru_bk')}
                  className={`p-3.5 rounded-2xl border-2 transition-all text-left flex items-start gap-3 cursor-pointer ${
                    targetType === 'guru_bk'
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold text-base">
                    🏫
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Guru BK Sekolah</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Untuk masalah akademik, pertemanan, motivasi belajar, & konseling sekolah.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('psikolog')}
                  className={`p-3.5 rounded-2xl border-2 transition-all text-left flex items-start gap-3 cursor-pointer ${
                    targetType === 'psikolog'
                      ? 'border-purple-500 bg-purple-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-base">
                    🧠
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Psikolog / Konselor Klinis</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Untuk regulasi emosi mendalam, kecemasan klinis, smiling depression, & CBT.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Counselor Selection */}
            <div>
              <label className="block text-[13px] font-bold text-[#111c2d] mb-2">
                2. Pilih Konselor / {targetType === 'guru_bk' ? 'Guru BK' : 'Psikolog'}:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCounselors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCounselorId(c.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedCounselorId === c.id
                        ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-300'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover border border-sky-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{c.name}</div>
                      <div className="text-[11px] text-sky-700 truncate">{c.role}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.institution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Category & Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#111c2d] mb-1.5">
                  Kategori Masalah:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none bg-white"
                >
                  <option value="Stres Akademik & Ujian">📚 Stres Akademik & Ujian</option>
                  <option value="Masalah Pertemanan / Bullying">👥 Masalah Pertemanan / Bullying</option>
                  <option value="Keluarga & Ekspektasi">🏡 Keluarga & Ekspektasi Orang Tua</option>
                  <option value="Kecemasan / Burnout">⚡ Kecemasan / Burnout / Lelah Emosional</option>
                  <option value="Pengembangan Diri & Karir">🎯 Pengembangan Diri & Minat Karir</option>
                  <option value="Curhat Umum">💬 Curhat & Konseling Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#111c2d] mb-1.5">
                  Tingkat Beban / Stres yang Dirasakan:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['rendah', 'sedang', 'tinggi'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStressLevel(lvl)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        stressLevel === lvl
                          ? lvl === 'tinggi'
                            ? 'bg-rose-500 text-white shadow'
                            : lvl === 'sedang'
                            ? 'bg-amber-500 text-white shadow'
                            : 'bg-emerald-500 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Topic Title */}
            <div>
              {formError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{formError}</span>
                </div>
              )}
              <label className="block text-[12px] font-bold text-[#111c2d] mb-1">
                Topik Singkat Konsultasi: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="Contoh: Kesulitan mengatur waktu belajar & merasa sering cemas saat ulangan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            {/* Step 5: Mode, Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#111c2d] mb-1.5">
                  Metode Sesi:
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as AppointmentMode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none bg-white"
                >
                  <option value="tatap_muka">🏫 Tatap Muka ({targetType === 'guru_bk' ? 'Ruang BK' : 'Klinik'})</option>
                  <option value="online_video">📹 Online Video Call</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#111c2d] mb-1.5">
                  Pilih Tanggal:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#111c2d] mb-1.5">
                  Slot Waktu:
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none bg-white"
                >
                  {(currentCounselor.scheduleSlots || ['09:00 - 10:00 WIB', '10:30 - 11:30 WIB', '13:30 - 14:30 WIB', '15:00 - 16:00 WIB']).map(
                    (slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Step 6: Detail Notes */}
            <div>
              <label className="block text-[12px] font-bold text-[#111c2d] mb-1">
                Catatan Tambahan atau Keluhan yang Ingin Disampaikan: (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan gambaran singkat situasi atau harapan yang ingin kamu dapatkan dari sesi ini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none resize-none"
              />
            </div>

            {/* Privacy Anonymous Option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-base">🔒</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">Mode Anonim / Rahasia</div>
                  <div className="text-[10px] text-slate-500">Nama lengkap Anda disamarkan saat proses pendaftaran awal</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-400 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi & Simpan Janji Temu'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
