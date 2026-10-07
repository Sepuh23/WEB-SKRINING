import React, { useState, useEffect } from 'react';
import { StudentProfile, UserAccount } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

interface LoginPageProps {
  onLoginSuccess: (profile: StudentProfile) => void;
  onBackToHome: () => void;
  initialMode?: 'login' | 'register';
  redirectReason?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
  initialMode = 'login',
  redirectReason,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'anonymous'>(initialMode);

  // Registered accounts stored in localStorage
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Login form inputs
  const [loginUsername, setLoginUsername] = useState('farel');
  const [loginPassword, setLoginPassword] = useState('123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form inputs
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'Siswa SMA' | 'Siswa SMP' | 'Guru BK Sekolah'>('Siswa SMA');
  const [regSchool, setRegSchool] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing users from localStorage or initialize with DEFAULT_USERS
  useEffect(() => {
    try {
      const stored = localStorage.getItem('psy_vibe_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUsers(parsed);
      } else {
        localStorage.setItem('psy_vibe_users', JSON.stringify(DEFAULT_USERS));
        setUsers(DEFAULT_USERS);
      }
    } catch {
      setUsers(DEFAULT_USERS);
    }
  }, []);

  // Handle Login with Username & Password
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = loginUsername.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Harap masukkan username dan password!');
      return;
    }

    // Find matching user in registered users
    const matched = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
    );

    if (matched) {
      setSuccessMessage(`Login berhasil! Selamat datang kembali, ${matched.name}.`);
      if (rememberMe) {
        localStorage.setItem('psy_vibe_active_user', JSON.stringify(matched));
      }
      setTimeout(() => {
        onLoginSuccess({
          id: matched.id,
          username: matched.username,
          name: matched.name,
          role: matched.role,
          userRoleType: matched.userRoleType || 'siswa',
          school: matched.school,
          avatar: matched.avatar,
          isAnonymous: false,
        });
      }, 600);
    } else {
      setErrorMessage(
        'Username atau password salah! Belum punya akun? Klik tab "Buat Akun Baru" di bawah.'
      );
    }
  };

  // Handle Create New User & Password (Register)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = regName.trim();
    const cleanSchool = regSchool.trim() || 'Sekolah Siswa';
    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setErrorMessage('Harap masukkan nama panggilan atau nama lengkap!');
      return;
    }
    if (!cleanUsername) {
      setErrorMessage('Harap buat username yang unik!');
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Username minimal harus 3 karakter!');
      return;
    }
    if (cleanPassword.length < 3) {
      setErrorMessage('Password minimal harus 3 karakter!');
      return;
    }
    if (cleanPassword !== regConfirmPassword.trim()) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password yang dibuat!');
      return;
    }

    // Check if username already exists
    const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setErrorMessage(`Username "${cleanUsername}" sudah digunakan! Silakan pilih username lain.`);
      return;
    }

    // Pick avatar based on role
    const defaultAvatar =
      regRole === 'Guru BK Sekolah'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
        : regRole === 'Siswa SMP'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kqcMzG3sGVMZatNUT_jMqxlZPkCZ_4x8DhohMirEEiFtw-_eeISBn9toFc7JFlcbm8wLEqn0iajJ4HF35xsJm6t2YVI1PIV55XGkZYdJDioaOSr5fkqkLH5TpNpBZk0Ed3Jy7mdy0Mz3m64HGOGuMKRBprtMo3-JaNqQks2pjU3TsiT1uDVgake2AG59-P2vHtCbpRKjM2vxIsWv4vHl7SOiQmU1X37NCeRCwY4';

    const newUser: UserAccount = {
      id: 'u_' + Date.now(),
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      role: regRole,
      userRoleType: regRole === 'Guru BK Sekolah' ? 'guru_bk' : 'siswa',
      school: cleanSchool,
      avatar: defaultAvatar,
      isAnonymous: false,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('psy_vibe_users', JSON.stringify(updatedUsers));
    localStorage.setItem('psy_vibe_active_user', JSON.stringify(newUser));

    setSuccessMessage(`Akun "${cleanUsername}" berhasil dibuat! Mengalihkan ke Dashboard Siswa...`);

    setTimeout(() => {
      onLoginSuccess({
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        userRoleType: newUser.userRoleType,
        school: newUser.school,
        avatar: newUser.avatar,
        isAnonymous: false,
      });
    }, 900);
  };

  // Quick fill demo credentials
  const fillDemo = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setMode('login');
    setErrorMessage(null);
  };

  // Handle Anonymous Access
  const handleAnonymousSubmit = () => {
    const anonProfile: StudentProfile = {
      id: 'anon_' + Date.now(),
      username: 'tamu_anonim',
      name: 'Siswa Anonim #' + Math.floor(100 + Math.random() * 900),
      role: 'Tamu Anonim',
      userRoleType: 'siswa',
      school: 'Identitas Disamarkan',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      isAnonymous: true,
    };
    onLoginSuccess(anonProfile);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f0f3ff] via-white to-[#f0f3ff] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full px-6 md:px-12 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#38bdf8] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(56,189,248,0.28)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">favorite</span>
          </div>
          <div>
            <span className="font-bold text-[20px] leading-tight tracking-tight text-[#111c2d] block">
              PSY-VIBE
            </span>
            <span className="text-[11px] font-semibold text-[#00668a] tracking-wide block -mt-1">
              Youth Sanctuary
            </span>
          </div>
        </button>

        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#00668a] border border-[#dee8ff] font-semibold text-[13px] hover:bg-[#dee8ff] transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali ke Beranda</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-[32px] bg-white shadow-[0_20px_50px_-10px_rgba(56,189,248,0.22)] border border-[#dee8ff] overflow-hidden">
          {/* Left Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between text-left">
            <div>
              {/* Redirect Notice if user was blocked from Dashboard */}
              {redirectReason && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] flex items-center gap-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">
                    lock
                  </span>
                  <span>{redirectReason}</span>
                </div>
              )}

              {/* Security Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f3ff] text-[#00668a] text-[11px] font-bold border border-[#dee8ff] mb-3">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                Dashboard Wajib Login • Privasi Siswa Terjamin
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
                {mode === 'login'
                  ? 'Masuk ke Dashboard ⛅'
                  : mode === 'register'
                  ? 'Buat Akun Siswa Baru 🚀'
                  : 'Mode Tamu Anonim 🕵️'}
              </h2>
              <p className="text-[13px] text-[#576065] mt-1.5 leading-relaxed">
                {mode === 'login'
                  ? 'Masukkan username dan password akunmu untuk mengakses dasbor emosi pribadi.'
                  : mode === 'register'
                  ? 'Belum punya akun? Buat username dan password barumu secara gratis dalam 1 menit.'
                  : 'Masuk tanpa rekam jejak identitas untuk akses cepat dan 100% rahasia.'}
              </p>

              {/* Mode Switcher Tabs */}
              <div className="mt-5 flex p-1 bg-[#f0f3ff] rounded-2xl border border-[#dee8ff] gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#00668a] shadow-xs'
                      : 'text-[#576065] hover:text-[#111c2d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#00668a] shadow-xs'
                      : 'text-[#576065] hover:text-[#111c2d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Buat Akun Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('anonymous');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'anonymous'
                      ? 'bg-white text-[#00668a] shadow-xs'
                      : 'text-[#576065] hover:text-[#111c2d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  <span>Anonim</span>
                </button>
              </div>

              {/* Alert Messages */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#ba1a1a] text-[12px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TAB 1: LOGIN WITH USERNAME & PASSWORD */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                      Username Siswa / Email:
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Masukkan username (contoh: farel)"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[12px] font-bold text-[#111c2d]">Password:</label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            'Tips Akun Demo:\nUsername: farel / ayu / ratnabk\nPassword: 123\n\nAtau buat akun baru pada tombol "Buat Akun Baru".'
                          )
                        }
                        className="text-[11px] text-[#00668a] font-semibold hover:underline"
                      >
                        Bantuan kata sandi
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#576065] hover:text-[#111c2d] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showLoginPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-[#576065] pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-[#38bdf8] focus:ring-[#38bdf8]"
                      />
                      <span>Ingat saya di perangkat ini</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-[#38bdf8] text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(56,189,248,0.35)] hover:opacity-95 transition-opacity cursor-pointer mt-2"
                  >
                    Masuk ke Dashboard
                  </button>

                  {/* Fast 1-Click Credentials Helper */}
                  <div className="pt-4 border-t border-[#f0f3ff]">
                    <span className="text-[11px] font-bold text-[#576065] block mb-2">
                      💡 Coba Akun Demo Cepat (1-Klik Isi):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fillDemo('farel', '123')}
                        className="px-3 py-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] text-[11px] font-semibold text-[#111c2d] cursor-pointer"
                      >
                        👤 Siswa: <b>farel</b> (pass: 123)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo('ayu', '123')}
                        className="px-3 py-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] text-[11px] font-semibold text-[#111c2d] cursor-pointer"
                      >
                        👤 SMP: <b>ayu</b> (pass: 123)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo('ratnabk', '123')}
                        className="px-3 py-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] text-[11px] font-semibold text-[#00668a] cursor-pointer"
                      >
                        🎓 Guru BK: <b>ratnabk</b> (pass: 123)
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER NEW USER & PASSWORD */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                        Nama Panggilan / Lengkap:
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Farhan"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                        Peran Pengguna:
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] font-semibold focus:outline-none"
                      >
                        <option value="Siswa SMA">Siswa SMA / SMK</option>
                        <option value="Siswa SMP">Siswa SMP</option>
                        <option value="Guru BK Sekolah">Guru BK / Konselor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                      Asal Sekolah:
                    </label>
                    <input
                      type="text"
                      required
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="Contoh: SMA Negeri 3 Surabaya"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                      Buat Username Baru:
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Contoh: farhan_2026 (huruf kecil & angka)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                        Buat Password Baru:
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 3 karakter"
                          className="w-full px-3.5 py-2 pr-9 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#576065] hover:text-[#111c2d]"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {showRegPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-[#111c2d] block mb-1">
                        Ulangi Password:
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Samakan password"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-[#00668a] text-white font-bold text-[14px] shadow-sm hover:bg-[#004c69] transition-colors cursor-pointer mt-3"
                  >
                    Simpan Akun &amp; Buka Dashboard
                  </button>
                </form>
              )}

              {/* TAB 3: ANONYMOUS ACCESS */}
              {mode === 'anonymous' && (
                <div className="mt-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#dee8ff] space-y-2">
                    <div className="flex items-center gap-2 text-[#00668a] font-bold text-[13px]">
                      <span className="material-symbols-outlined text-[18px]">security</span>
                      Akses Anonim Tanpa Buat User &amp; Password
                    </div>
                    <p className="text-[12px] text-[#576065] leading-relaxed">
                      Kamu dapat langsung masuk ke dashboard dengan mode anonim. Sesi curhat dan hasil skrining tetap berjalan aman di perangkatmu tanpa perlu mengingat akun atau kata sandi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnonymousSubmit}
                    className="w-full py-3.5 rounded-full bg-[#00668a] text-white font-bold text-[14px] shadow-sm hover:bg-[#004c69] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                    <span>Masuk Langsung Sebagai Tamu Anonim</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Mode Switch Link */}
            <div className="mt-6 pt-4 border-t border-[#f0f3ff] text-center text-[12px] text-[#576065]">
              {mode === 'login' ? (
                <>
                  Belum punya username &amp; password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#00668a] hover:underline cursor-pointer"
                  >
                    Buat akun baru gratis di sini
                  </button>
                </>
              ) : (
                <>
                  Sudah punya username &amp; password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#00668a] hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Visual Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#c4e7ff]/60 via-[#f0f3ff] to-[#dee8ff]/50 p-8 lg:p-10 flex flex-col justify-between items-center text-center border-t lg:border-t-0 lg:border-l border-[#dee8ff] relative overflow-hidden">
            <div className="w-full flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#00668a] bg-white px-3 py-1 rounded-full shadow-xs border border-[#dee8ff]">
                VibeBot Empathy AI
              </span>
              <span className="text-[11px] text-[#576065] flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Proteksi Aktif
              </span>
            </div>

            {/* Robot Illustration and Floating Halos */}
            <div className="my-6 relative flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-white shadow-[0_12px_32px_rgba(56,189,248,0.3)] p-2 border-2 border-[#38bdf8] animate-float relative z-10">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoTWu--wp5meTLIpxAbLIdRjQ31nqWftLfvjhKOZ8pylG5fdbtkQPSMWWz4VG7Ljy3H0mZBzLvJY4WGZdpp1oBYl-ReiyUInQOYZubjiFSVJxY80a9SnwbCEMM7xKurmxd5b_RX9SmhnMDCMhFwEv5Jbo75e4amqsyXKVjiKtnlzA3foW4_tYwNz-EDygGaa0IyOK4YONMETrw1jpHZIsafHbNuMCAAytFqLZKGks"
                  alt="VibeBot"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Pulsing Audio Waveform Mini */}
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1.5 h-3 bg-[#38bdf8] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-6 bg-[#00668a] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-8 bg-[#38bdf8] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-4 bg-[#00668a] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-7 bg-[#38bdf8] rounded-full animate-pulse"></span>
              </div>
            </div>

            {/* Quote Card */}
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#dee8ff] shadow-xs text-left w-full space-y-1.5">
              <p className="text-[12px] text-[#111c2d] italic leading-relaxed">
                "Di PSY-VIBE, setiap siswa memiliki ruang aman pribadi. Data skrining dan curhatmu dilindungi ketat dan hanya kamu yang bisa mengaksesnya."
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#00668a] font-bold pt-1">
                <span>Ruang Siswa Bebas Stigma</span>
                <span>E2E Enkripsi</span>
              </div>
            </div>

            {/* Trust Badges bottom */}
            <div className="w-full pt-4 flex items-center justify-around text-[11px] text-[#576065]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#00668a]">lock</span>
                Wajib Login
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#00668a]">
                  verified
                </span>
                FACS Biometrik
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#00668a]">
                  support_agent
                </span>
                Guru BK Mitra
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="w-full py-4 text-center text-[12px] text-[#576065]">
        © 2026 PSY-VIBE Youth Sanctuary • Akses Dashboard Terproteksi Sandi.
      </footer>
    </div>
  );
};
