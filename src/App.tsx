import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DualSensingSection } from './components/DualSensingSection';
import { FeaturesGridSection } from './components/FeaturesGridSection';
import { MobileShowcaseSection } from './components/MobileShowcaseSection';
import { EmergencyHotlineBanner } from './components/EmergencyHotlineBanner';
import { Footer } from './components/Footer';

import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { GuruBKPortal } from './components/GuruBKPortal';
import { PsikologPortal } from './components/PsikologPortal';
import { AdminPortal } from './components/AdminPortal';
import { AppointmentBookingModal } from './components/AppointmentBookingModal';
import { EditProfileModal } from './components/EditProfileModal';

import { VibeBotCurhatModal } from './components/VibeBotCurhatModal';
import { DualSensingScreeningModal } from './components/DualSensingScreeningModal';
import { MoodJournalModal } from './components/MoodJournalModal';
import { CounselorModal } from './components/CounselorModal';
import { DirectoryFaskesModal } from './components/DirectoryFaskesModal';
import { EmergencyHotlineModal } from './components/EmergencyHotlineModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';

import { Appointment, AppointmentTargetType, MoodEntry, StudentProfile, UserAccount, UserRoleType } from './types';
import { INITIAL_MOOD_ENTRIES, DEFAULT_USERS, INITIAL_APPOINTMENTS } from './data/mockData';

export default function App() {
  // Navigation / View state: 'landing' | 'login' | 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [activeNavTab, setActiveNavTab] = useState('beranda');
  const [loginRedirectReason, setLoginRedirectReason] = useState<string | undefined>(undefined);

  // Live Location state (shared across app)
  const [sharedLocation, setSharedLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    city: string;
    source: string;
  }>({
    lat: -3.7928,
    lng: 102.2608,
    accuracy: 8,
    city: 'Kota Bengkulu, Bengkulu',
    source: 'preset',
  });

  // Modals state
  const [isCurhatOpen, setIsCurhatOpen] = useState(false);
  const [curhatInitialPrompt, setCurhatInitialPrompt] = useState('');
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isCounselorOpen, setIsCounselorOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Appointment Booking Modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTargetType, setBookingTargetType] = useState<AppointmentTargetType>('guru_bk');
  const [bookingCounselorId, setBookingCounselorId] = useState<string | undefined>(undefined);

  // Data state with localStorage persistence
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('psy_vibe_mood_entries');
      return saved ? JSON.parse(saved) : INITIAL_MOOD_ENTRIES;
    } catch {
      return INITIAL_MOOD_ENTRIES;
    }
  });

  // Appointments state with localStorage persistence
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('psy_vibe_appointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Users state with localStorage persistence
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('psy_vibe_users');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const handleAddMoodEntry = (entry: MoodEntry) => {
    setMoodEntries((prev) => {
      const updated = [...prev, entry];
      try {
        localStorage.setItem('psy_vibe_mood_entries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteMoodEntry = (id: string) => {
    setMoodEntries((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('psy_vibe_mood_entries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSaveAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => {
      const updated = [newAppointment, ...prev];
      try {
        localStorage.setItem('psy_vibe_appointments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateAppointmentStatus = (
    id: string,
    status: Appointment['status'],
    counselorNotes?: string,
    actionPlan?: string
  ) => {
    setAppointments((prev) => {
      const updated = prev.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status,
            counselorNotes: counselorNotes !== undefined ? counselorNotes : apt.counselorNotes,
            actionPlan: actionPlan !== undefined ? actionPlan : apt.actionPlan,
          };
        }
        return apt;
      });
      try {
        localStorage.setItem('psy_vibe_appointments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Authentication State: Check if user is logged in from localStorage
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('psy_vibe_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleUpdateProfile = (updatedData: {
    name: string;
    username: string;
    password?: string;
    school?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }) => {
    if (!currentStudent) return;

    const updatedProfile: StudentProfile = {
      ...currentStudent,
      name: updatedData.name,
      username: updatedData.username,
      school: updatedData.school !== undefined ? updatedData.school : currentStudent.school,
      email: updatedData.email !== undefined ? updatedData.email : currentStudent.email,
      phone: updatedData.phone !== undefined ? updatedData.phone : currentStudent.phone,
      avatar: updatedData.avatar ? updatedData.avatar : currentStudent.avatar,
    };

    setCurrentStudent(updatedProfile);
    try {
      localStorage.setItem('psy_vibe_active_user', JSON.stringify(updatedProfile));
    } catch {}

    // Update matching user in users list
    setUsers((prev) => {
      const updatedList = prev.map((u) => {
        if (
          u.id === currentStudent.id ||
          u.username === currentStudent.username ||
          (currentStudent.email && u.email === currentStudent.email)
        ) {
          return {
            ...u,
            name: updatedData.name,
            username: updatedData.username,
            password: updatedData.password ? updatedData.password : u.password,
            school: updatedData.school !== undefined ? updatedData.school : u.school,
            email: updatedData.email !== undefined ? updatedData.email : u.email,
            phone: updatedData.phone !== undefined ? updatedData.phone : u.phone,
            avatar: updatedData.avatar ? updatedData.avatar : u.avatar,
          };
        }
        return u;
      });

      try {
        localStorage.setItem('psy_vibe_users', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
  };

  const handleUpdateUserAccount = (updatedUser: UserAccount) => {
    setUsers((prev) => {
      const updatedList = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      try {
        localStorage.setItem('psy_vibe_users', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (currentStudent && (currentStudent.id === updatedUser.id || currentStudent.username === updatedUser.username)) {
      const updatedProfile: StudentProfile = {
        ...currentStudent,
        name: updatedUser.name,
        username: updatedUser.username,
        school: updatedUser.school,
        userRoleType: updatedUser.userRoleType,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      };
      setCurrentStudent(updatedProfile);
      try {
        localStorage.setItem('psy_vibe_active_user', JSON.stringify(updatedProfile));
      } catch {}
    }
  };

  const handleAddUserAccount = (newUser: UserAccount) => {
    setUsers((prev) => {
      const updatedList = [...prev, newUser];
      try {
        localStorage.setItem('psy_vibe_users', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
  };

  const handleDeleteUserAccount = (userId: string) => {
    setUsers((prev) => {
      const updatedList = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('psy_vibe_users', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
  };

  // Ensure default users exist in localStorage on mount
  useEffect(() => {
    try {
      if (!localStorage.getItem('psy_vibe_users')) {
        localStorage.setItem('psy_vibe_users', JSON.stringify(DEFAULT_USERS));
      }
      if (!localStorage.getItem('psy_vibe_appointments')) {
        localStorage.setItem('psy_vibe_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'beranda') {
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'fitur-utama') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('fitur-utama');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'cara-kerja') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('cara-kerja');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tab === 'faskes-terdekat') {
      setIsDirectoryOpen(true);
    } else if (tab === 'konseling') {
      setIsCounselorOpen(true);
    } else if (tab === 'faq') {
      setIsPrivacyOpen(true);
    }
  };

  const handleOpenDashboardGuarded = () => {
    if (!currentStudent) {
      setLoginRedirectReason(
        '⚠️ Dashboard ini wajib login terlebih dahulu. Silakan masukkan username & password atau buat akun baru di bawah.'
      );
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginRedirectReason(undefined);
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLogin = () => {
    setLoginRedirectReason(undefined);
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCurhat = (initialMsg?: string) => {
    setCurhatInitialPrompt(initialMsg || '');
    setIsCurhatOpen(true);
  };

  const handleOpenBookingModal = (targetType: AppointmentTargetType = 'guru_bk', counselorId?: string) => {
    setBookingTargetType(targetType);
    setBookingCounselorId(counselorId);
    setIsBookingOpen(true);
  };

  const handleLoginSuccess = (profile: StudentProfile) => {
    setCurrentStudent(profile);
    setLoginRedirectReason(undefined);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('psy_vibe_active_user');
    } catch {}
    setCurrentStudent(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchRole = (newRoleType: UserRoleType) => {
    if (!currentStudent) return;
    let roleLabel = 'Siswa SMA';
    if (newRoleType === 'guru_bk') roleLabel = 'Guru BK Sekolah';
    if (newRoleType === 'psikolog') roleLabel = 'Psikolog Klinis Mitra';
    if (newRoleType === 'admin') roleLabel = 'Super Admin System';

    const updatedProfile: StudentProfile = {
      ...currentStudent,
      userRoleType: newRoleType,
      role: roleLabel,
    };
    setCurrentStudent(updatedProfile);
    try {
      localStorage.setItem('psy_vibe_active_user', JSON.stringify(updatedProfile));
    } catch {}
  };

  // Render Login Page view
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setCurrentView('landing')}
        redirectReason={loginRedirectReason}
      />
    );
  }

  // Render Dashboard view (Guarded - Wajib Login)
  if (currentView === 'dashboard') {
    if (!currentStudent) {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentView('landing')}
          redirectReason="Dashboard ini wajib login terlebih dahulu! Masukkan username & password atau buat akun baru."
        />
      );
    }

    const roleType = currentStudent.userRoleType || 'siswa';

    // Render Portal based on User Role Type
    if (roleType === 'guru_bk') {
      return (
        <>
          <GuruBKPortal
            currentGuru={currentStudent}
            appointments={appointments}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onNavigateHome={() => setCurrentView('landing')}
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
          {currentStudent && (
            <EditProfileModal
              isOpen={isEditProfileOpen}
              onClose={() => setIsEditProfileOpen(false)}
              currentUser={currentStudent}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </>
      );
    }

    if (roleType === 'psikolog') {
      return (
        <>
          <PsikologPortal
            currentPsikolog={currentStudent}
            appointments={appointments}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onNavigateHome={() => setCurrentView('landing')}
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
          {currentStudent && (
            <EditProfileModal
              isOpen={isEditProfileOpen}
              onClose={() => setIsEditProfileOpen(false)}
              currentUser={currentStudent}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </>
      );
    }

    if (roleType === 'admin') {
      return (
        <>
          <AdminPortal
            currentAdmin={currentStudent}
            appointments={appointments}
            users={users}
            onNavigateHome={() => setCurrentView('landing')}
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onUpdateUserAccount={handleUpdateUserAccount}
            onAddUserAccount={handleAddUserAccount}
            onDeleteUserAccount={handleDeleteUserAccount}
          />
          {currentStudent && (
            <EditProfileModal
              isOpen={isEditProfileOpen}
              onClose={() => setIsEditProfileOpen(false)}
              currentUser={currentStudent}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </>
      );
    }

    // Default: Siswa Dashboard
    return (
      <>
        <StudentDashboard
          student={currentStudent}
          moodEntries={moodEntries}
          onAddMoodEntry={handleAddMoodEntry}
          onOpenCurhat={(msg?: string) => handleStartCurhat(msg)}
          onOpenScreening={() => setIsScreeningOpen(true)}
          onOpenJournal={() => setIsJournalOpen(true)}
          onOpenCounselor={() => setIsCounselorOpen(true)}
          onOpenDirectory={() => setIsDirectoryOpen(true)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onNavigateHome={() => setCurrentView('landing')}
          onLogout={handleLogout}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        {currentStudent && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentUser={currentStudent}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* Global Floating Appointment Shortcut Button for Siswa */}
        <div className="fixed bottom-24 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => handleOpenBookingModal('guru_bk')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] shadow-lg transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            <span>Janji Temu Konseling</span>
          </button>
        </div>

        {/* Appointment Booking Modal */}
        <AppointmentBookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          student={currentStudent}
          initialTargetType={bookingTargetType}
          initialCounselorId={bookingCounselorId}
          onSaveAppointment={handleSaveAppointment}
        />

        {/* Global Modals accessible from dashboard */}
        <VibeBotCurhatModal
          isOpen={isCurhatOpen}
          onClose={() => setIsCurhatOpen(false)}
          initialPrompt={curhatInitialPrompt}
          onOpenCounselor={() => {
            setIsCurhatOpen(false);
            setIsCounselorOpen(true);
          }}
          onOpenJournal={() => {
            setIsCurhatOpen(false);
            setIsJournalOpen(true);
          }}
          onOpenEmergency={() => {
            setIsCurhatOpen(false);
            setIsEmergencyOpen(true);
          }}
          onOpenDirectory={() => {
            setIsCurhatOpen(false);
            setIsDirectoryOpen(true);
          }}
        />

        <DualSensingScreeningModal
          isOpen={isScreeningOpen}
          onClose={() => setIsScreeningOpen(false)}
          onOpenCurhat={() => handleStartCurhat()}
          onOpenCounselor={() => setIsCounselorOpen(true)}
          onOpenJournal={() => setIsJournalOpen(true)}
        />

        <MoodJournalModal
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          entries={moodEntries}
          onAddEntry={handleAddMoodEntry}
          onDeleteEntry={handleDeleteMoodEntry}
          onOpenCurhat={() => {
            setIsJournalOpen(false);
            handleStartCurhat();
          }}
        />

        <CounselorModal
          isOpen={isCounselorOpen}
          onClose={() => setIsCounselorOpen(false)}
          onOpenCurhat={() => {
            setIsCounselorOpen(false);
            handleStartCurhat();
          }}
        />

        <DirectoryFaskesModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          onOpenEmergency={() => {
            setIsDirectoryOpen(false);
            setIsEmergencyOpen(true);
          }}
        />

        <EmergencyHotlineModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
          onOpenDirectory={() => {
            setIsEmergencyOpen(false);
            setIsDirectoryOpen(true);
          }}
        />
      </>
    );
  }

  // Render Landing Page view
  return (
    <div className="min-h-screen bg-white text-[#111c2d] flex flex-col font-sans selection:bg-[#38bdf8]/30 selection:text-[#00668a]">
      {/* Fixed Header with embedded GPS Banner */}
      <Header
        activeTab={activeNavTab}
        onNavigate={handleNavigate}
        onOpenLogin={handleOpenLogin}
        onOpenDashboard={handleOpenDashboardGuarded}
        currentStudent={currentStudent}
        onLocationUpdate={(loc) => setSharedLocation(loc)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="w-full pt-28 sm:pt-32 bg-white flex-1">
        {/* SECTION 1: HERO SECTION */}
        <HeroSection
          onStartCurhat={handleStartCurhat}
          onOpenLogin={currentStudent ? handleOpenDashboardGuarded : handleOpenLogin}
          onStartScreening={() => setIsScreeningOpen(true)}
          isLoggedIn={Boolean(currentStudent)}
        />

        {/* SECTION 2: DUAL-SENSING FEATURE OVERVIEW */}
        <DualSensingSection
          onStartScreening={() => setIsScreeningOpen(true)}
          onOpenCurhat={() => handleStartCurhat()}
        />

        {/* SECTION 3: 5 CORE WEB FEATURES GRID */}
        <FeaturesGridSection
          onOpenScreening={() => setIsScreeningOpen(true)}
          onOpenCurhat={() => handleStartCurhat()}
          onOpenCounselor={() => setIsCounselorOpen(true)}
          onOpenJournal={() => setIsJournalOpen(true)}
          onOpenDirectory={() => setIsDirectoryOpen(true)}
        />

        {/* SECTION 4: FEATURED MOBILE APP PREVIEW & SHOWCASE */}
        <MobileShowcaseSection
          onStartCurhat={() => handleStartCurhat()}
          onOpenCounselor={() => setIsCounselorOpen(true)}
        />

        {/* SECTION 5: EMERGENCY HOTLINE BANNER */}
        <EmergencyHotlineBanner onOpenEmergencyModal={() => setIsEmergencyOpen(true)} />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
      />

      {/* FLOATING ACTION BUTTON (AI Curhat Shortcut) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => handleStartCurhat()}
          className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#38bdf8] text-white font-bold text-[14px] shadow-[0_8px_24px_rgba(56,189,248,0.45)] hover:bg-[#0ea5e9] hover:shadow-[0_12px_28px_rgba(56,189,248,0.55)] transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
            forum
          </span>
          <span>Curhat ke VibeBot</span>
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      </div>

      {/* MODALS */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        student={currentStudent || {
          id: 'temp',
          name: 'Siswa',
          role: 'Siswa SMA',
          userRoleType: 'siswa',
          school: 'SMA Negeri 1 Kota Bengkulu',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
          isAnonymous: false,
        }}
        initialTargetType={bookingTargetType}
        initialCounselorId={bookingCounselorId}
        onSaveAppointment={handleSaveAppointment}
      />

      <VibeBotCurhatModal
        isOpen={isCurhatOpen}
        onClose={() => setIsCurhatOpen(false)}
        initialPrompt={curhatInitialPrompt}
        onOpenCounselor={() => {
          setIsCurhatOpen(false);
          setIsCounselorOpen(true);
        }}
        onOpenJournal={() => {
          setIsCurhatOpen(false);
          setIsJournalOpen(true);
        }}
        onOpenEmergency={() => {
          setIsCurhatOpen(false);
          setIsEmergencyOpen(true);
        }}
        onOpenDirectory={() => {
          setIsCurhatOpen(false);
          setIsDirectoryOpen(true);
        }}
      />

      <DualSensingScreeningModal
        isOpen={isScreeningOpen}
        onClose={() => setIsScreeningOpen(false)}
        onOpenCurhat={() => handleStartCurhat()}
        onOpenCounselor={() => setIsCounselorOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
      />

      <MoodJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={moodEntries}
        onAddEntry={handleAddMoodEntry}
        onDeleteEntry={handleDeleteMoodEntry}
        onOpenCurhat={() => {
          setIsJournalOpen(false);
          handleStartCurhat();
        }}
      />

      <CounselorModal
        isOpen={isCounselorOpen}
        onClose={() => setIsCounselorOpen(false)}
        onOpenCurhat={() => {
          setIsCounselorOpen(false);
          handleStartCurhat();
        }}
        onOpenBooking={(targetType, counselorId) => {
          setIsCounselorOpen(false);
          handleOpenBookingModal(targetType, counselorId);
        }}
      />

      <DirectoryFaskesModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onOpenEmergency={() => {
          setIsDirectoryOpen(false);
          setIsEmergencyOpen(true);
        }}
      />

      <EmergencyHotlineModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onOpenDirectory={() => {
          setIsEmergencyOpen(false);
          setIsDirectoryOpen(true);
        }}
      />

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {currentStudent && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentStudent}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}
