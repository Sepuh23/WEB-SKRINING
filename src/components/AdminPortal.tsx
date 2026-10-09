import React, { useState } from 'react';
import { Appointment, StudentProfile, UserAccount } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

interface AdminPortalProps {
  currentAdmin: StudentProfile;
  appointments: Appointment[];
  users: UserAccount[];
  onNavigateHome: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: 'siswa' | 'guru_bk' | 'psikolog' | 'admin') => void;
  onOpenEditProfile?: () => void;
  onUpdateUserAccount?: (updatedUser: UserAccount) => void;
  onAddUserAccount?: (newUser: UserAccount) => void;
  onDeleteUserAccount?: (userId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentAdmin,
  appointments,
  users,
  onNavigateHome,
  onLogout,
  onSwitchRole,
  onOpenEditProfile,
  onUpdateUserAccount,
  onAddUserAccount,
  onDeleteUserAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'janji_temu' | 'pengguna' | 'analitik'>('janji_temu');
  const [filterType, setFilterType] = useState<'all' | 'guru_bk' | 'psikolog'>('all');
  const [userSearch, setUserSearch] = useState('');
  
  // State for Admin Editing a user
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'siswa' | 'guru_bk' | 'psikolog' | 'admin'>('siswa');
  const [editSchool, setEditSchool] = useState('');
  const [adminNotice, setAdminNotice] = useState('');

  // State for Add User modal/form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123');
  const [newRoleType, setNewRoleType] = useState<'siswa' | 'guru_bk' | 'psikolog' | 'admin'>('siswa');
  const [newSchool, setNewSchool] = useState('SMA Negeri 1 Bengkulu');

  const activeUsersList = users && users.length > 0 ? users : DEFAULT_USERS;

  const filteredUsers = activeUsersList.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const handleStartEditUser = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditPassword(u.password);
    setEditRole(u.userRoleType || 'siswa');
    setEditSchool(u.school || '');
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    let roleLabel = 'Siswa SMA';
    if (editRole === 'guru_bk') roleLabel = 'Guru BK Sekolah';
    if (editRole === 'psikolog') roleLabel = 'Psikolog Klinis Mitra';
    if (editRole === 'admin') roleLabel = 'Admin Utama Platform';

    const updated: UserAccount = {
      ...editingUser,
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
      userRoleType: editRole,
      role: roleLabel,
      school: editSchool.trim(),
    };

    if (onUpdateUserAccount) {
      onUpdateUserAccount(updated);
    }
    setAdminNotice(`✅ Akun ${updated.name} (@${updated.username}) berhasil diperbarui!`);
    setEditingUser(null);
    setTimeout(() => setAdminNotice(''), 4000);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    let roleLabel = 'Siswa SMA';
    if (newRoleType === 'guru_bk') roleLabel = 'Guru BK Sekolah';
    if (newRoleType === 'psikolog') roleLabel = 'Psikolog Klinis Mitra';
    if (newRoleType === 'admin') roleLabel = 'Admin Utama Platform';

    const newUserObj: UserAccount = {
      id: 'u_' + Date.now(),
      name: newName.trim(),
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      userRoleType: newRoleType,
      role: roleLabel,
      school: newSchool.trim(),
      avatar: newRoleType === 'guru_bk'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
        : newRoleType === 'psikolog'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    };

    if (onAddUserAccount) {
      onAddUserAccount(newUserObj);
    }
    setAdminNotice(`✅ Akun baru ${newUserObj.name} berhasil ditambahkan!`);
    setShowAddUserModal(false);
    setNewName('');
    setNewUsername('');
    setNewPassword('123');
    setTimeout(() => setAdminNotice(''), 4000);
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterType !== 'all' && a.counselorType !== filterType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onNavigateHome} className="flex items-center gap-2 text-left cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow font-black text-lg">
                ⚡
              </div>
              <div>
                <span className="font-extrabold text-base text-white leading-tight block">
                  ADMIN PUSAT KENDALI PSY-VIBE
                </span>
                <span className="text-[10px] font-semibold text-amber-400 block">
                  Master System Administration &amp; Multi-Role Management
                </span>
              </div>
            </button>
          </div>

          {/* Role Simulator Switcher */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Simulasi Role:</span>
            {onSwitchRole && (
              <>
                <button
                  onClick={() => onSwitchRole('siswa')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🎒 Siswa 1 / 2
                </button>
                <button
                  onClick={() => onSwitchRole('guru_bk')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🏫 Guru BK
                </button>
                <button
                  onClick={() => onSwitchRole('psikolog')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-700 transition cursor-pointer font-medium"
                >
                  🧠 Psikolog
                </button>
                <button
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs transition cursor-pointer"
                >
                  ⚡ Admin
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer border border-amber-500/30"
                title="Edit Profil & Password Saya"
              >
                <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                <span>Edit Akun Saya</span>
              </button>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{currentAdmin.name}</div>
              <div className="text-[10px] text-amber-400 font-semibold">Super Admin</div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-rose-500/40 shadow-xs"
              title="Keluar dari Control Panel Admin"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {adminNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              {adminNotice}
            </span>
            <button onClick={() => setAdminNotice('')} className="text-amber-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Total Janji Temu Terdaftar</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{appointments.length}</div>
            <div className="text-[10px] text-emerald-400 mt-1">✓ Termasuk BK &amp; Psikolog</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Janji Temu ke Guru BK</div>
            <div className="text-2xl font-black text-sky-400 mt-1">
              {appointments.filter((a) => a.counselorType === 'guru_bk').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Konseling Akademik &amp; Sekolah</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Janji Temu ke Psikolog</div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {appointments.filter((a) => a.counselorType === 'psikolog').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Konseling Klinis &amp; CBT</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium">Pengguna Aktif (Multi-Role)</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{activeUsersList.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Siswa, BK, Psikolog, Admin</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('janji_temu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'janji_temu' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Seluruh Janji Temu Platform
          </button>
          <button
            onClick={() => setActiveTab('pengguna')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pengguna' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👥 Manajemen Akun &amp; Role ({activeUsersList.length})
          </button>
        </div>

        {/* Tab 1: All Appointments */}
        {activeTab === 'janji_temu' && (
          <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-md space-y-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-base text-white">
                Daftar Seluruh Janji Temu Siswa ke Guru BK &amp; Psikolog
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('guru_bk')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'guru_bk' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  🏫 Guru BK Saja
                </button>
                <button
                  onClick={() => setFilterType('psikolog')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterType === 'psikolog' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  🧠 Psikolog Saja
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-300 font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Siswa</th>
                    <th className="p-3">Tujuan Konseling</th>
                    <th className="p-3">Konselor / Guru</th>
                    <th className="p-3">Topik</th>
                    <th className="p-3">Jadwal</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-700/40">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <img
                          src={apt.studentAvatar}
                          alt={apt.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-600"
                        />
                        {apt.studentName}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            apt.counselorType === 'guru_bk'
                              ? 'bg-sky-900/80 text-sky-200 border border-sky-700'
                              : 'bg-purple-900/80 text-purple-200 border border-purple-700'
                          }`}
                        >
                          {apt.counselorType === 'guru_bk' ? '🏫 Guru BK' : '🧠 Psikolog'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-medium">{apt.counselorName}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{apt.topic}</td>
                      <td className="p-3 text-slate-300">
                        {apt.date} <span className="text-slate-400">({apt.time})</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {apt.mode === 'online_video' ? '📹 Video Call' : '🏫 Tatap Muka'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                              : apt.status === 'pending'
                              ? 'bg-amber-900/80 text-amber-300 border border-amber-700 animate-pulse'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'pengguna' && (
          <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-md space-y-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base text-white">Manajemen Akun &amp; Kredensial Multi-Role Platform</h2>
                <p className="text-xs text-slate-400">Admin dapat melihat, menambah, mengubah nama, username, password, atau role pengguna</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama/username..."
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Tambah Akun Baru</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3 relative group">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/60"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{u.name}</div>
                      <div className="text-xs text-amber-400 font-semibold truncate">{u.role}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.school}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] font-mono text-slate-300 space-y-1">
                    <div>Username: <span className="text-amber-300 font-bold">{u.username}</span></div>
                    <div>Password: <span className="text-emerald-300 font-bold">{u.password}</span></div>
                    <div>Role: <span className="text-sky-300 font-bold uppercase">{u.userRoleType}</span></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => handleStartEditUser(u)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit Kredensial</span>
                    </button>
                    {onDeleteUserAccount && u.id !== currentAdmin.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Yakin hapus akun ${u.name}?`)) {
                            onDeleteUserAccount(u.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Hapus Akun"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit User Modal for Admin */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base">Edit Akun: {editingUser.name}</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Username ID</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password Baru</label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role Platform</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="siswa">🎒 Siswa SMA</option>
                    <option value="guru_bk">🏫 Guru BK Sekolah</option>
                    <option value="psikolog">🧠 Psikolog Klinis</option>
                    <option value="admin">⚡ Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sekolah / Instansi</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base">Tambah Akun Baru</h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Username ID</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: budi_siswa"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contoh: 123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role Akun</label>
                  <select
                    value={newRoleType}
                    onChange={(e) => setNewRoleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="siswa">🎒 Siswa SMA</option>
                    <option value="guru_bk">🏫 Guru BK Sekolah</option>
                    <option value="psikolog">🧠 Psikolog Klinis Mitra</option>
                    <option value="admin">⚡ Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sekolah / Instansi</label>
                  <input
                    type="text"
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
                  >
                    Buat Akun Sekarang
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
