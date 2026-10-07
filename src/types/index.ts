export type UserRoleType = 'siswa' | 'guru_bk' | 'psikolog' | 'admin';

export interface TelemetryData {
  microTension: number; // 0-100%
  eyeBlink: number; // 0-100%
  facialExpression: 'Tenang' | 'Sedikit Lelah' | 'Sedikit Cemas' | 'Tegang' | 'Pura-pura Senyum';
  pitchCadence: number; // 0-100%
  acousticStress: number; // 0-100% (or 0.xx)
  vocalTone: string; // e.g. "Tenang (88%)", "Monoton (Datar)", "Gemetar"
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  telemetrySnapshot?: TelemetryData;
  smilingDepressionFlag?: boolean;
  crisisFlag?: boolean;
  suggestedFeature?: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  dayName: string;
  moodEmoji: string;
  moodLabel: string;
  score: number; // 1-10
  tags: string[];
  note: string;
  aiAffirmation?: string;
}

export interface Counselor {
  id: string;
  name: string;
  role: 'Guru BK Sekolah' | 'Psikolog Klinis' | 'Psikolog Remaja' | 'Konselor Sebaya';
  counselorType: 'guru_bk' | 'psikolog';
  institution: string;
  avatar: string;
  specialty: string[];
  available: boolean;
  rating: number;
  consultationCount: number;
  bio: string;
  location: string;
  scheduleSlots?: string[];
}

export interface Faskes {
  id: string;
  name: string;
  type: 'Puskesmas PKPR' | 'Rumah Sakit' | 'Biro Psikologi' | 'Klinik Pratama';
  distance: string;
  distanceKm: number;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  reviewsCount: number;
  isYouthFriendly: boolean;
  emergencyHotline?: string;
  lat: number;
  lng: number;
}

export interface StudentProfile {
  id: string;
  username?: string;
  name: string;
  role: string;
  userRoleType: UserRoleType;
  school: string;
  avatar: string;
  isAnonymous: boolean;
  email?: string;
  phone?: string;
  classGrade?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  userRoleType: UserRoleType;
  school: string;
  avatar: string;
  isAnonymous?: boolean;
  email?: string;
  phone?: string;
  specialty?: string[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type AppointmentMode = 'tatap_muka' | 'online_video';
export type AppointmentTargetType = 'guru_bk' | 'psikolog';

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  studentSchool: string;
  studentAvatar: string;
  studentClass?: string;
  counselorType: AppointmentTargetType;
  counselorId: string;
  counselorName: string;
  counselorRole: string;
  counselorAvatar: string;
  topic: string;
  category: 'Stres Akademik & Ujian' | 'Masalah Pertemanan / Bullying' | 'Keluarga & Ekspektasi' | 'Kecemasan / Burnout' | 'Pengembangan Diri & Karir' | 'Curhat Umum';
  mode: AppointmentMode;
  locationOrLink: string;
  date: string;
  time: string;
  notes: string;
  counselorNotes?: string;
  actionPlan?: string;
  status: AppointmentStatus;
  stressLevel?: 'rendah' | 'sedang' | 'tinggi';
  createdAt: string;
}
