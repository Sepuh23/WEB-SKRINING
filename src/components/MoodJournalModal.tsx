import React, { useState } from 'react';
import { MoodEntry } from '../types';

interface MoodJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MoodEntry[];
  onAddEntry: (entry: MoodEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenCurhat: () => void;
}

export const MoodJournalModal: React.FC<MoodJournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  onAddEntry,
  onDeleteEntry,
  onOpenCurhat,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'write' | 'analytics' | 'history'>('calendar');
  const [selectedEmoji, setSelectedEmoji] = useState('😌');
  const [selectedMoodLabel, setSelectedMoodLabel] = useState('Tenang');
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Refleksi', 'Santai']);
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [generatingAffirmation, setGeneratingAffirmation] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(
    'Ketenangan adalah kekuatan tersembunyi. Satu tarikan napas perlahan membuat pikiranmu lebih jernih.'
  );

  // Calendar State
  const [currentCalDate, setCurrentCalDate] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const quickPrompts = [
    'Tugas sekolah numpuk dan takut nilainya jelek.',
    'Capek harus selalu pura-pura ceria di depan temen.',
    'Hari ini ada kabar baik yang bikin hatiku lega!',
    'Merasa overwhelmed dengan ekspektasi orang tua.',
    'Mulai merasa lebih rileks setelah istirahat dan mendengarkan musik.',
  ];

  const moodOptions = [
    { emoji: '😊', label: 'Senang', defaultScore: 8, color: 'bg-emerald-500', textCol: 'text-emerald-700', bgLight: 'bg-emerald-50' },
    { emoji: '😌', label: 'Tenang', defaultScore: 7, color: 'bg-sky-500', textCol: 'text-sky-700', bgLight: 'bg-sky-50' },
    { emoji: '🥺', label: 'Cemas', defaultScore: 4, color: 'bg-amber-500', textCol: 'text-amber-700', bgLight: 'bg-amber-50' },
    { emoji: '😔', label: 'Sedih / Berat', defaultScore: 3, color: 'bg-rose-500', textCol: 'text-rose-700', bgLight: 'bg-rose-50' },
    { emoji: '😤', label: 'Kesal', defaultScore: 4, color: 'bg-orange-500', textCol: 'text-orange-700', bgLight: 'bg-orange-50' },
    { emoji: '😴', label: 'Lelah / Burnout', defaultScore: 5, color: 'bg-indigo-500', textCol: 'text-indigo-700', bgLight: 'bg-indigo-50' },
  ];

  const availableTags = [
    'TugasSekolah',
    'Ujian',
    'Teman',
    'Keluarga',
    'Ekskul',
    'SelfCare',
    'MasaDepan',
    'Musik',
    'PuraPuraKuat',
    'CurhatAI',
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerateAffirmation = async () => {
    setGeneratingAffirmation(true);
    try {
      const res = await fetch('/api/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMoodLabel,
          topic: selectedTags.join(', ') || 'keseharian',
        }),
      });
      const data = await res.json();
      setCurrentAffirmation(data.affirmation);
    } catch {
      setCurrentAffirmation(
        'Kamu sudah berusaha dengan hebat hari ini. Luapkan perasaanmu tanpa ragu, kamu berharga apa adanya.'
      );
    } finally {
      setGeneratingAffirmation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const targetDate = new Date(customDate);
    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}`,
      date: customDate,
      dayName: days[targetDate.getDay()],
      moodEmoji: selectedEmoji,
      moodLabel: selectedMoodLabel,
      score: score,
      tags: selectedTags,
      note: note.trim() || 'Refleksi emosi tersimpan.',
      aiAffirmation: currentAffirmation,
    };
    onAddEntry(newEntry);
    setNote('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Google Calendar Integration URL generator
  const getGoogleCalendarUrl = (entry?: MoodEntry) => {
    const title = encodeURIComponent(entry ? `Refleksi Mood: ${entry.moodEmoji} ${entry.moodLabel} (PSY-VIBE)` : 'Jurnal Mood Harian PSY-VIBE');
    const details = encodeURIComponent(
      entry
        ? `Catatan Mood: "${entry.note}"\nSkor: ${entry.score}/10\nTopik: ${entry.tags.join(', ')}\nAfirmasi: ${entry.aiAffirmation || ''}\n\nTercatat di Aplikasi Kesehatan Mental PSY-VIBE.`
        : 'Waktu hening 3 menit untuk refleksi suasana hati, cek ketegangan emosi, dan afirmasi diri di PSY-VIBE.'
    );
    const dateStr = (entry ? entry.date : customDate).replace(/-/g, '');
    const startTime = `${dateStr}T190000`;
    const endTime = `${dateStr}T191500`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startTime}/${endTime}&recur=RRULE:FREQ=DAILY`;
  };

  // Export iCal .ics file
  const handleExportIcs = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PSY-VIBE//Mood Journal//ID\nCALSCALE:GREGORIAN\n";
    entries.forEach((entry, idx) => {
      const dt = entry.date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nUID:psyvibe-mood-${entry.id || idx}@psyvibe.app\nDTSTAMP:${dt}T120000Z\nDTSTART:${dt}T120000Z\nDTEND:${dt}T121500Z\nSUMMARY:Mood ${entry.moodEmoji} ${entry.moodLabel} (${entry.score}/10)\nDESCRIPTION:${entry.note.replace(/\n/g, ' ')}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'jurnal-mood-psyvibe.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calendar Helpers
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const adjustedFirstDay = (firstDayIndex === 0 ? 6 : firstDayIndex - 1); // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentCalDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentCalDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedCalendarDate(today.toISOString().split('T')[0]);
  };

  // Filter entries for currently selected date
  const selectedDateEntries = entries.filter((e) => e.date === selectedCalendarDate);
  const totalEntriesCount = entries.length;
  const avgScore = (
    entries.reduce((acc, curr) => acc + curr.score, 0) / (totalEntriesCount || 1)
  ).toFixed(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/70 backdrop-blur-md p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[28px] shadow-[0_24px_70px_-12px_rgba(2,132,199,0.35)] border border-[#dee8ff] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f3ff] bg-gradient-to-r from-[#f0f9ff] via-[#f0f3ff] to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[17px] text-[#111c2d]">Jurnal Mood Terkoneksi Kalender</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  📅 Sync Ready
                </span>
              </div>
              <p className="text-[11px] text-[#576065]">
                Pantau riwayat suasana hati harian, integrasi Google Calendar &amp; afirmasi reflektif AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#576065] hover:text-[#111c2d] hover:bg-slate-100 flex items-center justify-center border border-[#dee8ff] cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white px-5 py-2.5 border-b border-[#dee8ff] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-[#f0f3ff] rounded-2xl border border-[#dee8ff]">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#576065] hover:text-[#111c2d] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Kalender Mood</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#576065] hover:text-[#111c2d] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Tulis Mood Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#576065] hover:text-[#111c2d] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">insights</span>
              <span>Grafik &amp; Analitik</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#576065] hover:text-[#111c2d] hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Riwayat ({entries.length})</span>
            </button>
          </div>

          {/* Quick Calendar Export Actions */}
          <div className="flex items-center gap-2">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[#0284C7] border border-[#bae6fd] text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Tambahkan Pengingat Jurnal Harian ke Google Calendar"
            >
              <span className="material-symbols-outlined text-[15px] text-[#0284C7]">event</span>
              <span>+ Google Calendar</span>
            </a>
            <button
              type="button"
              onClick={handleExportIcs}
              className="px-3 py-1.5 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#dee8ff]"
              title="Unduh file kalender .ics untuk Outlook / Apple Calendar"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Ekspor iCal</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-left">
          
          {/* TAB 1: CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Top Calendar Controls & Streak Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Month Navigator */}
                <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 rounded-xl bg-white text-[#0284C7] hover:bg-[#0284C7] hover:text-white border border-[#bae6fd] transition-all cursor-pointer"
                      title="Bulan Sebelumnya"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <span className="font-extrabold text-[16px] text-[#111c2d] min-w-[150px] text-center">
                      {monthNames[month]} {year}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 rounded-xl bg-white text-[#0284C7] hover:bg-[#0284C7] hover:text-white border border-[#bae6fd] transition-all cursor-pointer"
                      title="Bulan Selanjutnya"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={jumpToToday}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-[#0284C7] text-[11px] font-bold border border-[#bae6fd] transition-all cursor-pointer"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDate(selectedCalendarDate);
                        setActiveTab('write');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Catat Hari Ini</span>
                    </button>
                  </div>
                </div>

                {/* Mood Streak & Stats Pill */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1">
                      <span>🔥 Mood Streak</span>
                      <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded text-[9px]">Aktif</span>
                    </span>
                    <div className="text-[18px] font-black text-amber-900 mt-0.5">7 Hari Berturut-turut</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-700 block">Rata-rata Mood</span>
                    <span className="font-extrabold text-[15px] text-[#0284C7]">{avgScore} / 10</span>
                  </div>
                </div>
              </div>

              {/* Monthly Calendar Grid & Side Detail Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 7-Columns Calendar Matrix */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-[#dee8ff] p-4 shadow-xs">
                  {/* Weekdays Header */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 pb-2 border-b border-slate-100 uppercase tracking-wider">
                    <span className="text-slate-700">Sen</span>
                    <span className="text-slate-700">Sel</span>
                    <span className="text-slate-700">Rab</span>
                    <span className="text-slate-700">Kam</span>
                    <span className="text-slate-700">Jum</span>
                    <span className="text-amber-600">Sab</span>
                    <span className="text-rose-600">Min</span>
                  </div>

                  {/* Days Matrix */}
                  <div className="grid grid-cols-7 gap-1.5 pt-2">
                    {/* Previous Month Padding Days */}
                    {Array.from({ length: adjustedFirstDay }).map((_, idx) => {
                      const prevDateNum = daysInPrevMonth - adjustedFirstDay + idx + 1;
                      return (
                        <div
                          key={`prev-${idx}`}
                          className="h-16 sm:h-20 p-1.5 rounded-xl bg-slate-50/60 border border-slate-100 opacity-40 text-left flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-semibold text-slate-400">{prevDateNum}</span>
                        </div>
                      );
                    })}

                    {/* Current Month Active Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const dayEntries = entries.filter((e) => e.date === dayString);
                      const isSelected = selectedCalendarDate === dayString;
                      const isToday = dayString === new Date().toISOString().split('T')[0];

                      return (
                        <div
                          key={dayString}
                          onClick={() => setSelectedCalendarDate(dayString)}
                          className={`h-16 sm:h-20 p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group relative ${
                            isSelected
                              ? 'bg-[#f0f9ff] border-[#0284C7] ring-2 ring-[#0284C7]/30 shadow-xs'
                              : isToday
                              ? 'bg-amber-50/50 border-amber-300 hover:border-[#0284C7]'
                              : dayEntries.length > 0
                              ? 'bg-white border-slate-200 hover:border-[#0284C7] hover:bg-slate-50'
                              : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold rounded-md px-1 ${
                                isToday
                                  ? 'bg-[#0284C7] text-white'
                                  : isSelected
                                  ? 'text-[#0284C7]'
                                  : 'text-slate-700'
                              }`}
                            >
                              {dayNum}
                            </span>
                            {isToday && (
                              <span className="text-[8px] font-extrabold text-[#0284C7] uppercase">Hari Ini</span>
                            )}
                          </div>

                          {/* Entry Badges */}
                          {dayEntries.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {dayEntries.slice(0, 1).map((e) => (
                                <div
                                  key={e.id}
                                  className={`px-1.5 py-0.5 rounded-lg flex items-center justify-between text-[10px] font-bold shadow-2xs ${
                                    e.score >= 7
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : e.score >= 5
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                  title={`${e.moodLabel} (${e.score}/10): ${e.note}`}
                                >
                                  <span className="text-[13px]">{e.moodEmoji}</span>
                                  <span className="text-[9px]">{e.score}/10</span>
                                </div>
                              ))}
                              {dayEntries.length > 1 && (
                                <span className="text-[8px] text-slate-500 font-bold">+{dayEntries.length - 1} lagi</span>
                              )}
                            </div>
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                              <button
                                type="button"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setCustomDate(dayString);
                                  setSelectedCalendarDate(dayString);
                                  setActiveTab('write');
                                }}
                                className="w-5 h-5 rounded-md bg-[#0284C7] text-white flex items-center justify-center text-[11px] cursor-pointer"
                                title="Catat Mood untuk tanggal ini"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Date Detailed View Card (Right Panel) */}
                <div className="lg:col-span-4 bg-[#f8fafc] rounded-2xl border border-[#dee8ff] p-4 text-left flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Detail Catatan Kalender
                        </span>
                        <h4 className="font-extrabold text-[15px] text-[#111c2d]">
                          {selectedCalendarDate}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomDate(selectedCalendarDate);
                          setActiveTab('write');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0284C7] text-white text-[11px] font-bold hover:bg-[#0369a1] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">add</span>
                        <span>Tulis</span>
                      </button>
                    </div>

                    {/* Entries on this date */}
                    <div className="mt-3 space-y-3">
                      {selectedDateEntries.length === 0 ? (
                        <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
                          <span className="text-3xl block mb-2">📝</span>
                          <p className="text-[12px] font-bold text-slate-700">Belum ada catatan mood pada tanggal ini.</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Klik tombol di bawah untuk mencatat jurnal.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomDate(selectedCalendarDate);
                              setActiveTab('write');
                            }}
                            className="mt-3 px-4 py-2 rounded-xl bg-[#0284C7] text-white text-[12px] font-bold hover:bg-[#0369a1] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit_note</span>
                            <span>Catat Mood {selectedCalendarDate}</span>
                          </button>
                        </div>
                      ) : (
                        selectedDateEntries.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl bg-white border border-[#dee8ff] shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{item.moodEmoji}</span>
                                <div>
                                  <span className="font-bold text-[13px] text-[#111c2d] block">
                                    {item.moodLabel}
                                  </span>
                                  <span className="text-[10px] text-slate-500">Skor: {item.score}/10</span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.score >= 7
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.score >= 5
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.score >= 7 ? 'Sangat Baik' : item.score >= 5 ? 'Cukup Stabil' : 'Perlu Rehat'}
                              </span>
                            </div>

                            <p className="text-[12px] text-slate-700 bg-[#f8fafc] p-2.5 rounded-lg border border-slate-100">
                              "{item.note}"
                            </p>

                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[10px] text-[#0284C7] bg-[#f0f9ff] px-2 py-0.5 rounded-md font-semibold"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.aiAffirmation && (
                              <div className="p-2 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-sky-900 italic">
                                💡 Afirmasi: "{item.aiAffirmation}"
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[11px]">
                              <a
                                href={getGoogleCalendarUrl(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284C7] hover:underline font-bold flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[13px]">calendar_add_on</span>
                                <span>Sync Google Calendar</span>
                              </a>
                              {onDeleteEntry && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteEntry(item.id)}
                                  className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold cursor-pointer"
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Curhat Quick Trigger */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#e0f2fe] to-[#f0f9ff] border border-[#bae6fd]">
                    <span className="text-[11px] font-bold text-[#0284C7] block mb-1">
                      Butuh teman cerita sekarang?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCurhat();
                      }}
                      className="w-full py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-[12px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>Buka Curhat VibeBot AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WRITE NEW MOOD ENTRY */}
          {activeTab === 'write' && (
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#dee8ff] shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-[17px] font-bold text-[#111c2d]">
                    Bagaimana Perasaanmu Hari Ini?
                  </h4>
                  <p className="text-[12px] text-slate-500">
                    Catatan ini terhubung otomatis ke kalender bulanan dan grafik tren kesehatan mentalmu.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-bold text-slate-600">Tanggal:</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {/* Emoji Selection */}
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-2">
                  Pilih Suasana Hati:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {moodOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(opt.emoji);
                        setSelectedMoodLabel(opt.label);
                        setScore(opt.defaultScore);
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                        selectedMoodLabel === opt.label
                          ? 'bg-[#f0f9ff] border-[#0284C7] ring-2 ring-[#0284C7]/30 shadow-xs scale-102 font-bold'
                          : 'bg-[#f8fafc] border-slate-200 hover:bg-[#f0f3ff]'
                      }`}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-[11px] text-[#111c2d]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Score */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-bold text-[#111c2d]">
                    Tingkat Intensitas Mood / Kepuasan:
                  </span>
                  <span className="text-[14px] font-extrabold text-[#0284C7] bg-sky-100 px-3 py-0.5 rounded-full">
                    {score} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-[#0284C7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                  <span>1 (Sangat Tertekan)</span>
                  <span>5 (Netral / Biasa Saja)</span>
                  <span>10 (Sangat Bahagia &amp; Optimal)</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-[13px] font-bold text-[#111c2d] block mb-2">
                  Pilih Topik Terkait:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-[#0284C7] text-white border-[#0284C7]'
                          : 'bg-[#f0f3ff] text-[#576065] border-[#dee8ff] hover:bg-[#dee8ff]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Note Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-bold text-[#111c2d]">
                    Cerita / Refleksi Singkat Hari Ini:
                  </label>
                  <span className="text-[11px] text-slate-400">Pilih inspirasi cerita:</span>
                </div>

                {/* Quick prompt suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNote(prompt)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#0284C7] hover:border-[#38BDF8] hover:bg-[#F0F9FF] transition-all cursor-pointer text-left"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tulis apa yang bikin kamu kepikiran hari ini... Rahasia, tersimpan lokal &amp; aman."
                  className="w-full p-3.5 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] text-[13px] text-[#111c2d] focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all"
                />
              </div>

              {saveSuccessNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-bold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">
                      check_circle
                    </span>
                    <span>Catatan mood berhasil disimpan &amp; terhubung ke kalender! ✨</span>
                  </div>
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700"
                  >
                    Tambahkan ke Google Calendar ➔
                  </a>
                </div>
              )}

              {/* Smart AI Affirmation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#f0f9ff] to-white border border-[#bae6fd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-left space-y-1 flex-1">
                  <span className="text-[11px] font-bold text-[#0284C7] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    Afirmasi Pintar Menenangkan:
                  </span>
                  <p className="text-[13px] text-[#111c2d] italic font-medium">"{currentAffirmation}"</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAffirmation}
                  disabled={generatingAffirmation}
                  className="px-4 py-2 rounded-full bg-white border border-[#bae6fd] text-[#0284C7] text-[12px] font-bold hover:bg-[#f0f9ff] transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  {generatingAffirmation ? 'Menyusun...' : 'Ubah Afirmasi'}
                </button>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[13px] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Kembali ke Kalender
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-[13px] shadow-sm hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Simpan ke Kalender Mood</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADVANCED MOOD TREND & ANALYTICS GRAPH */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs text-left">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Rata-Rata Suasana Hati
                  </span>
                  <div className="text-2xl font-black text-[#0284C7] mt-1">{avgScore} / 10</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    ↗ Stabil &amp; Terkendali (+0.4 minggu ini)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs text-left">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Dominan Emosi Terdeteksi
                  </span>
                  <div className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-2">
                    <span>😌 Tenang</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    58% dari total 7 hari terakhir
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#dee8ff] shadow-xs text-left">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Indeks Stabilitas Mental
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">88% Optimal</div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    Tingkat supresi emosi: Rendah
                  </span>
                </div>
              </div>

              {/* Enhanced Interactive Mood Trajectory Area Chart */}
              <div className="p-5 rounded-2xl bg-white border border-[#dee8ff] shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider block">
                      Grafik Fluktuasi &amp; Tren Emosi
                    </span>
                    <h4 className="text-[16px] font-extrabold text-[#111c2d]">
                      Kurva Dinamis Suasana Hati 7 Hari Terakhir
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span> Skor Mood (1-10)
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Zona Tenang (&ge;7)
                    </span>
                  </div>
                </div>

                {/* SVG Smooth Area Chart */}
                <div className="w-full bg-[#f8fafc] p-4 rounded-2xl border border-slate-100 relative">
                  <div className="h-44 w-full flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160">
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="20" x2="700" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="700" y2="60" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="700" y2="100" stroke="#E2E8F0" strokeDasharray="4 4" />
                      <line x1="0" y1="140" x2="700" y2="140" stroke="#CBD5E1" />

                      {/* Grid Labels */}
                      <text x="5" y="24" fontSize="10" fill="#94A3B8">10 (Optimal)</text>
                      <text x="5" y="64" fontSize="10" fill="#94A3B8">7 (Tenang)</text>
                      <text x="5" y="104" fontSize="10" fill="#94A3B8">4 (Cemas)</text>

                      {/* Area and Line */}
                      {(() => {
                        const recent = entries.slice(-7);
                        if (recent.length === 0) return null;
                        const points = recent.map((item, i) => {
                          const x = (i / Math.max(recent.length - 1, 1)) * 600 + 50;
                          const y = 140 - (item.score / 10) * 120;
                          return { x, y, item };
                        });

                        const pathData = points.reduce((acc, pt, i) => {
                          return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
                        }, '');

                        const areaData = `${pathData} L ${points[points.length - 1].x},140 L ${points[0].x},140 Z`;

                        return (
                          <>
                            <path d={areaData} fill="url(#moodGradient)" />
                            <path d={pathData} fill="none" stroke="#0284C7" strokeWidth="3.5" strokeLinecap="round" />
                            {points.map((pt, i) => (
                              <g key={i}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="6"
                                  fill="#FFFFFF"
                                  stroke={pt.item.score >= 7 ? '#10B981' : pt.item.score >= 5 ? '#0284C7' : '#F59E0B'}
                                  strokeWidth="3"
                                />
                                <text
                                  x={pt.x}
                                  y={pt.y - 12}
                                  fontSize="11"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  fill="#1E293B"
                                >
                                  {pt.item.moodEmoji} {pt.item.score}
                                </text>
                                <text
                                  x={pt.x}
                                  y="155"
                                  fontSize="10"
                                  fontWeight="600"
                                  textAnchor="middle"
                                  fill="#64748B"
                                >
                                  {pt.item.dayName.slice(0, 3)} ({pt.item.date.slice(8)})
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY LIST */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[15px] font-bold text-[#111c2d]">Riwayat Semua Catatan Jurnal</h4>
                <span className="text-[11px] text-slate-500 font-semibold">{entries.length} Catatan Tersimpan</span>
              </div>
              <div className="space-y-2.5">
                {entries
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border border-[#dee8ff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-[#0284C7] transition-all"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl p-2 bg-[#f0f3ff] rounded-xl shrink-0">
                          {item.moodEmoji}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[13px] text-[#111c2d]">
                              {item.moodLabel} ({item.score}/10)
                            </span>
                            <span className="text-[11px] text-[#576065]">
                              📅 {item.dayName}, {item.date}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#576065] mt-1">{item.note}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] text-[#00668a] bg-[#f0f3ff] px-2 py-0.5 rounded-md"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                          {item.aiAffirmation && (
                            <p className="text-[11px] text-sky-800 italic mt-1 bg-sky-50 p-2 rounded-lg border border-sky-100">
                              "{item.aiAffirmation}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#0284C7] text-[11px] font-bold hover:bg-sky-50 transition-colors flex items-center gap-1"
                          title="Simpan ke Google Calendar"
                        >
                          <span className="material-symbols-outlined text-[14px]">event</span>
                          <span>Sync</span>
                        </a>
                        {onDeleteEntry && (
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(item.id)}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
