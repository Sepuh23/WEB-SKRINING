import React, { useState } from 'react';
import { StudentProfile } from '../types';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: StudentProfile | null) => void;
  currentStudent: StudentProfile | null;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  currentStudent,
}) => {
  const [customName, setCustomName] = useState('');
  const [customSchool, setCustomSchool] = useState('');

  const demoStudents: StudentProfile[] = [
    {
      id: 's1',
      name: 'Farel',
      role: 'Siswa SMA',
      userRoleType: 'siswa',
      school: 'SMA Negeri 1',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kqcMzG3sGVMZatNUT_jMqxlZPkCZ_4x8DhohMirEEiFtw-_eeISBn9toFc7JFlcbm8wLEqn0iajJ4HF35xsJm6t2YVI1PIV55XGkZYdJDioaOSr5fkqkLH5TpNpBZk0Ed3Jy7mdy0Mz3m64HGOGuMKRBprtMo3-JaNqQks2pjU3TsiT1uDVgake2AG59-P2vHtCbpRKjM2vxIsWv4vHl7SOiQmU1X37NCeRCwY4',
      isAnonymous: false,
    },
    {
      id: 's2',
      name: 'Ayu Lestari',
      role: 'Siswa SMP',
      userRoleType: 'siswa',
      school: 'SMP Merdeka',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      isAnonymous: false,
    },
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onSelectStudent({
      id: Date.now().toString(),
      name: customName.trim(),
      role: 'Pelajar',
      userRoleType: 'siswa',
      school: customSchool.trim() || 'Sekolah Siswa',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      isAnonymous: false,
    });
    onClose();
  };

  const handleAnonymousLogin = () => {
    onSelectStudent({
      id: 'anon',
      name: 'Siswa Anonim #412',
      role: 'Mode Rahasia',
      userRoleType: 'siswa',
      school: 'Identitas Disamarkan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      isAnonymous: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/65 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-[0_24px_60px_-12px_rgba(56,189,248,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0f3ff] bg-[#f0f3ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#38bdf8] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-[16px] text-[#111c2d]">Masuk ke PSY-VIBE</h3>
              <p className="text-[11px] text-[#576065]">Akses profil, jurnal emosi, dan ruang curhat</p>
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
        <div className="p-6 space-y-5 text-left">
          {currentStudent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-400"
                />
                <div>
                  <span className="text-[13px] font-bold text-[#111c2d] block leading-tight">
                    {currentStudent.name}
                  </span>
                  <span className="text-[11px] text-[#576065]">{currentStudent.school}</span>
                </div>
              </div>
              <button
                onClick={() => onSelectStudent(null)}
                className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer"
              >
                Keluar
              </button>
            </div>
          )}

          <div>
            <span className="text-[12px] font-bold text-[#111c2d] block mb-2">
              Pilih Profil Siswa Cepat (Demo):
            </span>
            <div className="space-y-2">
              {demoStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectStudent(s);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] transition-colors flex items-center gap-3 cursor-pointer text-left"
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#38bdf8]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-[13px] text-[#111c2d] block leading-tight">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-[#00668a]">{s.school}</span>
                  </div>
                  <span className="material-symbols-outlined text-[#576065] text-[18px]">
                    arrow_forward
                  </span>
                </button>
              ))}

              {/* Anonymous Mode Button */}
              <button
                onClick={handleAnonymousLogin}
                className="w-full p-3 rounded-2xl bg-white hover:bg-[#f0f3ff] border-2 border-dashed border-[#38bdf8] transition-colors flex items-center gap-3 cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#38bdf8]/15 text-[#00668a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-[13px] text-[#00668a] block leading-tight">
                    Masuk Sebagai Tamu Anonim
                  </span>
                  <span className="text-[11px] text-[#576065]">
                    100% Rahasia &amp; Tanpa Nama
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#00668a] text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#dee8ff]"></div>
            <span className="flex-shrink mx-3 text-[#576065] text-[11px]">
              atau masuk dengan namamu
            </span>
            <div className="flex-grow border-t border-[#dee8ff]"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                Nama Panggilan Siswa:
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Contoh: Bima"
                className="w-full p-2.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                Asal Sekolah / Kelas:
              </label>
              <input
                type="text"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                placeholder="Contoh: SMA 2 Jakarta - Kelas 11"
                className="w-full p-2.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#38bdf8] text-white font-bold text-[13px] shadow-sm hover:opacity-95 transition-opacity cursor-pointer mt-2"
            >
              Masuk Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
