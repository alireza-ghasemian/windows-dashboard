import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar as CalendarIcon, 
  CloudSun, 
  Sun, 
  CloudRain, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Volume2, 
  User, 
  LayoutDashboard, 
  Folder, 
  BarChart2, 
  Settings, 
  Moon, 
  Compass,
  X,
  VolumeX,
  Sparkles,
  Upload,
  Download,
  ChevronDown,
  Lock,
  Unlock
} from 'lucide-react';
import { StudyTask, Language } from '../types';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { 
  digitsToPersian, 
  g2j, 
  j2g, 
  SHAMSI_MONTH_NAMES, 
  GREGORIAN_MONTH_NAMES, 
  getTodayDateString, 
  formatGregorianToPersianDisplay 
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';

// Helpers for solar Shamsi calendar computation and rendering
function isShamsiLeap(jy: number): boolean {
  const remainder = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder);
}

function getShamsiDaysInMonth(year: number, month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  if (month === 12) {
    return isShamsiLeap(year) ? 30 : 29;
  }
  return 30;
}

function getShamsiFirstDayIndex(year: number, month: number): number {
  const [gy, gm, gd] = j2g(year, month, 1);
  return new Date(gy, gm - 1, gd).getDay();
}

function getFormattedDateDisplay(dateStr: string, language: Language) {
  try {
    const [gy, gm, gd] = dateStr.split('-').map(Number);
    const [jy, jm, jd] = g2j(gy, gm, gd);
    const shamsiStr = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')} (${SHAMSI_MONTH_NAMES[language][jm - 1]})`;
    const miladiStr = `${gy}/${String(gm).padStart(2, '0')}/${String(gd).padStart(2, '0')} (${GREGORIAN_MONTH_NAMES[language][gm - 1]})`;
    return { shamsi: shamsiStr, miladi: miladiStr };
  } catch (e) {
    return { shamsi: dateStr, miladi: dateStr };
  }
}

function isEventTimePassed(item: any): boolean {
  try {
    const todayStr = getTodayDateString();
    const itemDate = item.date || todayStr;
    
    if (itemDate < todayStr) {
      return true;
    }
    if (itemDate > todayStr) {
      return false;
    }
    
    const rangeParts = item.time.split('-');
    const endStr = rangeParts[1] ? rangeParts[1].trim() : "";
    if (!endStr) return false;
    
    const [ehStr, emStr] = endStr.split(':');
    const endMinutes = parseInt(ehStr, 10) * 60 + parseInt(emStr, 10);
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return currentMinutes > endMinutes;
  } catch (e) {
    return false;
  }
}

interface StudyPlannerProps {
  language: Language;
}

// Full multi-language dictionary for professional localized copy
const TRANSLATIONS = {
  fa: {
    title: "داشبورد برنامه‌ریزی مطالعه",
    greeting: "صبح بخیر",
    subtitle: "تمرکز • برنامه‌ریزی • اجرا • موفقیت",
    calendarTitle: "تقویم",
    scheduleTitle: "برنامه امروز",
    weatherTitle: "هواشناسی",
    myTasksTitle: "کارهای من",
    focusTimerTitle: "تایمر تمرکز",
    deadlinesTitle: "مهلت‌های تحویل",
    playlistTitle: "پخش موسیقی مطالعه",
    all: "همه",
    today: "امروز",
    upcoming: "آینده",
    completed: "تکمیل شده",
    high: "فوری",
    medium: "متوسط",
    low: "کم",
    taskPlaceholder: "وظیفه جدید خود را بنویسید...",
    deadlinePlaceholder: "عنوان ددلاین تحویل...",
    addBtn: "افزودن کار",
    addDeadlineBtn: "افزودن مهلت تحویل",
    cancelBtn: "لغو",
    dueIn: "تحویل در",
    days: "روز",
    nowPlaying: "درحال پخش",
    focusMode: "تمرکز",
    breakMode: "استراحت",
    partlyCloudy: "کمی ابری",
    highLow: "بیشینه و کمینه",
    lofiBeats: "بیت‌های لوفای (کافئین)",
    synthwave: "سینث‌ویو متمرکز (تند)",
    rainyCafe: "باران ملایم (آفلاین)",
    deepZen: "ذن عمیق (امواج آلفا)",
    customName: "الکس",
    physicsLecture: "سخنرانی فیزیک",
    quantumMechanics: "مکانیک کوانتومی",
    projectMeeting: "جلسه تیمی",
    teamSync: "هماهنگی پروژه",
    lunchBreak: "استراحت ناهار",
    takeShortBreak: "کمی استراحت کنید",
    studySession: "جلسه مطالعه مستقل",
    dataStructures: "ساختمان داده و الگوریتم",
    forecastWed: "چهارشنبه",
    forecastThu: "پنجشنبه",
    forecastFri: "جمعه",
    clickToEditName: "جهت تغییر نام دوبار کلیک کنید",
    addScheduleBtn: "افزودن رویداد",
    schedulePlaceholder: "عنوان رویداد...",
    activeFocusTitle: "تمرکز فعال فعلی",
    nextUpTitle: "رویداد بعدی امروز",
    noActiveEvent: "در حال حاضر رویداد زمان‌بندی‌شده‌ای ندارید",
    freeStudyRest: "زمان مطالعه آزاد یا استراحت",
    noUpcomingEvent: "رویداد بعدی برای امروز وجود ندارد",
    deleteConfirmTitle: "تایید حذف مورد",
    deleteConfirmDesc: "آیا مطمئن هستید که می‌خواهید «{title}» را حذف کنید؟ این عمل غیرقابل بازگشت است.",
    deleteConfirmYes: "بله، حذف شود",
    deleteConfirmNo: "انصراف",
    localAudioLoad: "بارگذاری فایل صوتی",
    localAudioTitle: "فایل صوتی محلی"
  },
  en: {
    title: "Study Planning Dashboard",
    greeting: "Good Morning",
    subtitle: "Focus • Plan • Execute • Succeed",
    calendarTitle: "Calendar",
    scheduleTitle: "Today's Schedule",
    weatherTitle: "Weather",
    myTasksTitle: "My Tasks",
    focusTimerTitle: "Focus Timer",
    deadlinesTitle: "Upcoming Deadlines",
    playlistTitle: "Study Playlist",
    all: "All",
    today: "Today",
    upcoming: "Upcoming",
    completed: "Completed",
    high: "High",
    medium: "Medium",
    low: "Low",
    taskPlaceholder: "Create a new task...",
    deadlinePlaceholder: "Deadline task title...",
    addBtn: "Add Task",
    addDeadlineBtn: "Add Deadline",
    cancelBtn: "Cancel",
    dueIn: "Due in",
    days: "days",
    nowPlaying: "Now Playing",
    focusMode: "Focus",
    breakMode: "Break",
    partlyCloudy: "Partly Cloudy",
    highLow: "High / Low",
    lofiBeats: "Lo-Fi Beats (Caffeine)",
    synthwave: "Synthwave Focus (Upbeat)",
    rainyCafe: "Rainy Cafe (Offline Synth)",
    deepZen: "Deep Zen (Alpha Waves)",
    customName: "Alex",
    physicsLecture: "Physics Lecture",
    quantumMechanics: "Quantum Mechanics",
    projectMeeting: "Project Meeting",
    teamSync: "Team Sync",
    lunchBreak: "Lunch Break",
    takeShortBreak: "Take a short break",
    studySession: "Study Session",
    dataStructures: "Data Structures",
    forecastWed: "Wed",
    forecastThu: "Thu",
    forecastFri: "Fri",
    clickToEditName: "Double-click to change name",
    addScheduleBtn: "Add Event",
    schedulePlaceholder: "Event description...",
    activeFocusTitle: "Current Active Focus",
    nextUpTitle: "Next Up Today",
    noActiveEvent: "No scheduled event right now",
    freeStudyRest: "Free Study or Rest Time",
    noUpcomingEvent: "No upcoming events for today",
    deleteConfirmTitle: "Confirm Deletion",
    deleteConfirmDesc: "Are you sure you want to delete \"{title}\"? This action cannot be undone.",
    deleteConfirmYes: "Yes, Delete",
    deleteConfirmNo: "Cancel",
    localAudioLoad: "Load Audio File",
    localAudioTitle: "Local Audio File"
  },
  de: {
    title: "Lernplanungs-Dashboard",
    greeting: "Guten Morgen",
    subtitle: "Fokus • Planen • Ausführen • Erfolg",
    calendarTitle: "Kalender",
    scheduleTitle: "Tagesplan",
    weatherTitle: "Wetter",
    myTasksTitle: "Meine Aufgaben",
    focusTimerTitle: "Fokus-Timer",
    deadlinesTitle: "Anstehende Fristen",
    playlistTitle: "Lern-Playlist",
    all: "Alle",
    today: "Heute",
    upcoming: "Anstehend",
    completed: "Erledigt",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
    taskPlaceholder: "Neue Aufgabe erstellen...",
    deadlinePlaceholder: "Titel der Frist...",
    addBtn: "Aufgabe hinzufügen",
    addDeadlineBtn: "Frist hinzufügen",
    cancelBtn: "Abbrechen",
    dueIn: "Fällig in",
    days: "Tagen",
    nowPlaying: "Läuft gerade",
    focusMode: "Fokus",
    breakMode: "Pause",
    partlyCloudy: "Teils wolkig",
    highLow: "Hoch / Tief",
    lofiBeats: "Lo-Fi Beats (Koffein)",
    synthwave: "Synthwave Fokus (Schnell)",
    rainyCafe: "Regnerisches Café (Offline)",
    deepZen: "Deep Zen (Alpha-Wellen)",
    customName: "Alex",
    physicsLecture: "Physik-Vorlesung",
    quantumMechanics: "Quantenmechanik",
    projectMeeting: "Projektbesprechung",
    teamSync: "Team-Synchronisation",
    lunchBreak: "Mittagspause",
    takeShortBreak: "Kurze Pause machen",
    studySession: "Lernsitzung",
    dataStructures: "Datenstrukturen",
    forecastWed: "Mit",
    forecastThu: "Don",
    forecastFri: "Frei",
    clickToEditName: "Doppelklick zum Ändern",
    addScheduleBtn: "Ereignis hinzufügen",
    schedulePlaceholder: "Ereignistitel...",
    activeFocusTitle: "Aktueller Fokus",
    nextUpTitle: "Als nächstes heute",
    noActiveEvent: "Gerade kein geplantes Ereignis",
    freeStudyRest: "Freies Lernen oder Pause",
    noUpcomingEvent: "Keine anstehenden Ereignisse heute",
    deleteConfirmTitle: "Löschen bestätigen",
    deleteConfirmDesc: "Sind Sie sicher, dass Sie \"{title}\" löschen möchten?",
    deleteConfirmYes: "Ja, löschen",
    deleteConfirmNo: "Abbrechen",
    localAudioLoad: "Audiodatei laden",
    localAudioTitle: "Lokale Audiodatei"
  }
};

const MONTH_NAMES = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  fa: ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"]
};

const WEEKDAYS = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  de: ["S", "M", "D", "M", "D", "F", "S"],
  fa: ["ی", "د", "س", "چ", "پ", "ج", "ش"]
};

const POMO_LANG = {
  fa: {
    studyDuration: "زمان مطالعه (دقیقه)",
    shortBreak: "استراحت کوتاه (دقیقه)",
    longBreak: "استراحت طولانی (دقیقه)",
    totalSessions: "تعداد کل جلسات",
    enableLongBreak: "فعال‌سازی استراحت طولانی",
    autoLoop: "شروع خودکار چرخه بعدی",
    alarmSound: "صدای هشدار",
    historyTitle: "تاریخچه تمرکز امروز",
    noHistory: "هنوز جلسه تمرکزی ثبت نشده است.",
    settingsTitle: "تنظیمات تایمر تمرکز",
    closeBtn: "اعمال و بستن",
    skipBtn: "رد کردن فاز",
    soundWarmChime: "زنگوله ملایم",
    soundZenBowl: "کاسه تبتی ذن",
    soundDigitalBeep: "بوق دیجیتال",
    soundSuccess: "فانفار پیروزی",
    soundCustom: "صوت سفارشی 📂",
    sessionLabel: "جلسه {current} از {total}",
    longBreakMode: "استراحت طولانی",
    shortBreakMode: "استراحت کوتاه",
    focusMode: "زمان تمرکز",
    completedCount: "تعداد جلسات: {count}"
  },
  en: {
    studyDuration: "Study Duration (min)",
    shortBreak: "Short Break (min)",
    longBreak: "Long Break (min)",
    totalSessions: "Total Sessions",
    enableLongBreak: "Enable Long Break",
    autoLoop: "Auto-Loop Sessions",
    alarmSound: "Alarm Sound",
    historyTitle: "Today's Focus History",
    noHistory: "No sessions completed yet.",
    settingsTitle: "Focus Timer Settings",
    closeBtn: "Close & Apply",
    skipBtn: "Skip Phase",
    soundWarmChime: "Warm Chime",
    soundZenBowl: "Zen Singing Bowl",
    soundDigitalBeep: "Digital Beep",
    soundSuccess: "Success Fanfare",
    soundCustom: "Custom Audio 📂",
    sessionLabel: "Session {current} of {total}",
    longBreakMode: "Long Break",
    shortBreakMode: "Short Break",
    focusMode: "Focusing",
    completedCount: "Completed: {count}"
  }
};

const playSynthesizedSound = (soundType: string) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;

    if (soundType === 'warm-chime') {
      const playBell = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.15, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playBell(now, 523.25, 1.5);
      playBell(now + 0.15, 659.25, 1.5);
      playBell(now + 0.30, 783.99, 1.5);
      playBell(now + 0.45, 1046.50, 2.0);
    } else if (soundType === 'zen-bowl') {
      const now = ctx.currentTime;
      const duration = 3.5;
      const freqs = [180, 270, 360, 450, 540];
      const gains = [0.15, 0.08, 0.05, 0.03, 0.01];
      
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gains[idx], now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        osc.start(now);
        osc.stop(now + duration);
      });
    } else if (soundType === 'digital-beep') {
      const now = ctx.currentTime;
      const playBeep = (time: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.08, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        osc.start(time);
        osc.stop(time + 0.15);
      };
      playBeep(now);
      playBeep(now + 0.25);
    } else if (soundType === 'success') {
      const playNote = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.12, time + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gainNode);
        gainNode.connect(dest);
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playNote(now, 523.25, 0.4);
      playNote(now + 0.1, 659.25, 0.4);
      playNote(now + 0.2, 783.99, 0.4);
      playNote(now + 0.3, 1046.50, 0.8);
    }
  } catch (error) {
    console.error('Failed to play synthesized sound:', error);
  }
};

export default function StudyPlanner({ language }: StudyPlannerProps) {
  const trans = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'fa';

  // Local audio and file selection states/refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Deletion confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'schedule' | 'task' | 'deadline' | 'schedule-all';
    id: string;
    title: string;
  } | null>(null);

  // Custom Dropdowns states
  const [showTaskCategoryDropdown, setShowTaskCategoryDropdown] = useState(false);
  const [showSchedColorDropdown, setShowSchedColorDropdown] = useState(false);
  const [showDeadlinePriorityDropdown, setShowDeadlinePriorityDropdown] = useState(false);

  // New States for Popups, All Events List, and Dropdowns
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  
  // Modal calendar picker states
  const [modalCalSys, setModalCalSys] = useState<'shamsi' | 'miladi'>('shamsi');
  const [modalCalYear, setModalCalYear] = useState(1405);
  const [modalCalMonth, setModalCalMonth] = useState(1);
  const [modalSelectedDate, setModalSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Active Focus and Next Up event states
  const [activeFocusEvent, setActiveFocusEvent] = useState<any | null>(null);
  const [nextUpEvent, setNextUpEvent] = useState<any | null>(null);

  // State: Personalized name
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('productivity_study_user_name') || trans.customName;
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/study');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            userName: serverName,
            schedule: serverSchedule,
            studyDragLocked: serverStudyDragLocked,
            deadlineDragLocked: serverDeadlineDragLocked,
            tasks: serverTasks,
            studyDuration: serverStudyDuration,
            shortBreakDuration: serverShortBreakDuration,
            longBreakDuration: serverLongBreakDuration,
            totalSessions: serverTotalSessions,
            longBreakEnabled: serverLongBreakEnabled,
            loopEnabled: serverLoopEnabled,
            alarmSound: serverAlarmSound,
            customSoundUrl: serverCustomSoundUrl,
            pomoHistory: serverPomoHistory,
            deadlines: serverDeadlines,
          } = result.data;
          
          if (serverName) {
            setUserName(serverName);
            setNameInput(serverName);
          }
          if (serverSchedule) setSchedule(serverSchedule);
          if (serverStudyDragLocked !== undefined) setStudyDragLocked(serverStudyDragLocked);
          if (serverDeadlineDragLocked !== undefined) setDeadlineDragLocked(serverDeadlineDragLocked);
          if (serverTasks) setTasks(serverTasks);
          if (serverStudyDuration !== undefined) {
            setStudyDuration(serverStudyDuration);
            setTimeLeft(serverStudyDuration * 60);
          }
          if (serverShortBreakDuration !== undefined) setShortBreakDuration(serverShortBreakDuration);
          if (serverLongBreakDuration !== undefined) setLongBreakDuration(serverLongBreakDuration);
          if (serverTotalSessions !== undefined) setTotalSessions(serverTotalSessions);
          if (serverLongBreakEnabled !== undefined) setLongBreakEnabled(serverLongBreakEnabled);
          if (serverLoopEnabled !== undefined) setLoopEnabled(serverLoopEnabled);
          if (serverAlarmSound) setAlarmSound(serverAlarmSound);
          if (serverCustomSoundUrl !== undefined) setCustomSoundUrl(serverCustomSoundUrl);
          if (serverPomoHistory) setHistory(serverPomoHistory);
          if (serverDeadlines) setDeadlines(serverDeadlines);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load study planner from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  // Real-time Clock and Date state
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Time format: HH:MM AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour 0 should be 12
      const formattedHours = String(hours).padStart(2, '0');
      setTimeStr(`${formattedHours}:${minutes} ${ampm}`);

      // Date format: Tuesday, May 28, 2024 (or translated)
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let dLocale = 'en-US';
      if (language === 'de') dLocale = 'de-DE';
      if (language === 'fa') dLocale = 'fa-IR';
      
      let formattedDate = now.toLocaleDateString(dLocale, options);
      if (language === 'fa') {
        formattedDate = digitsToPersian(formattedDate);
      }
      setDateStr(formattedDate);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Handle name save
  const saveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      localStorage.setItem('productivity_study_user_name', nameInput.trim());
    }
    setIsEditingName(false);
  };

  // State: Interactive Dynamic Calendar
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calYear, calMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calYear, calMonth + 1, 1));
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  // State: Today's interactive schedule
  const [schedule, setSchedule] = useState<any[]>(() => {
    const saved = localStorage.getItem('productivity_study_schedule');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'sc-1', time: '09:30 - 10:30', title: trans.physicsLecture, detail: trans.quantumMechanics, color: 'border-purple-500 text-purple-400' },
      { id: 'sc-2', time: '11:00 - 12:00', title: trans.projectMeeting, detail: trans.teamSync, color: 'border-cyan-500 text-cyan-400' },
      { id: 'sc-3', time: '13:00 - 14:00', title: trans.lunchBreak, detail: trans.takeShortBreak, color: 'border-amber-500 text-amber-400' },
      { id: 'sc-4', time: '15:00 - 17:00', title: trans.studySession, detail: trans.dataStructures, color: 'border-emerald-500 text-emerald-400' }
    ];
  });
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchedTitle, setNewSchedTitle] = useState("");
  const [newSchedDetail, setNewSchedDetail] = useState("");
  const [newSchedColor, setNewSchedColor] = useState("border-purple-500 text-purple-400");
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(30);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(30);

  const [studyDragLocked, setStudyDragLocked] = useState<boolean>(() => {
    return localStorage.getItem('study_schedule_drag_locked') !== 'false';
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [deadlineDragLocked, setDeadlineDragLocked] = useState<boolean>(() => {
    return localStorage.getItem('study_deadline_drag_locked') !== 'false';
  });
  const [draggedDeadlineIndex, setDraggedDeadlineIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('study_schedule_drag_locked', studyDragLocked ? 'true' : 'false');
  }, [studyDragLocked]);

  useEffect(() => {
    localStorage.setItem('study_deadline_drag_locked', deadlineDragLocked ? 'true' : 'false');
  }, [deadlineDragLocked]);

  useEffect(() => {
    localStorage.setItem('productivity_study_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Real-time timeline updater: parses the hours/minutes of schedule intervals to find active & upcoming events
  useEffect(() => {
    const updateTimeline = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (tStr: string): number => {
        try {
          const [hStr, mStr] = tStr.split(':');
          return parseInt(hStr, 10) * 60 + (mStr ? parseInt(mStr, 10) : 0);
        } catch (e) {
          return 0;
        }
      };

      const parseRange = (rangeStr: string) => {
        try {
          const [startStr, endStr] = rangeStr.split('-').map(s => s.trim());
          return {
            start: parseTimeToMinutes(startStr),
            end: parseTimeToMinutes(endStr)
          };
        } catch (e) {
          return { start: 9999, end: 9999 };
        }
      };

      // Find current active event
      const active = schedule.find(item => {
        const { start, end } = parseRange(item.time);
        return currentMinutes >= start && currentMinutes <= end;
      });

      // Find upcoming events (sorted by start time)
      const upcoming = schedule
        .filter(item => {
          const { start } = parseRange(item.time);
          return start > currentMinutes;
        })
        .sort((a, b) => {
          const startA = parseRange(a.time).start;
          const startB = parseRange(b.time).start;
          return startA - startB;
        });

      setActiveFocusEvent(active || null);
      setNextUpEvent(upcoming[0] || null);
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [schedule]);

  // Initialize modal calendar representation based on any selected Gregorian date string
  const initModalCalendar = (initialDateStr: string) => {
    try {
      const [gy, gm, gd] = initialDateStr.split('-').map(Number);
      if (modalCalSys === 'shamsi') {
        const [jy, jm, jd] = g2j(gy, gm, gd);
        setModalCalYear(jy);
        setModalCalMonth(jm);
      } else {
        setModalCalYear(gy);
        setModalCalMonth(gm);
      }
    } catch (e) {
      setModalCalYear(1405);
      setModalCalMonth(1);
    }
    setModalSelectedDate(initialDateStr);
  };

  // Handle date selections inside the pop-up modal
  const handleModalDaySelectShamsi = (dayNum: number) => {
    const [gy, gm, gd] = j2g(modalCalYear, modalCalMonth, dayNum);
    const dateStr = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    setModalSelectedDate(dateStr);
  };

  const handleModalDaySelectMiladi = (dayNum: number, year: number, month: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setModalSelectedDate(dateStr);
  };

  // Pre-populate input fields and open the edit popup modal
  const handleEditScheduleItem = (item: any) => {
    setEditingSchedule(item);
    setNewSchedTitle(item.title);
    setNewSchedDetail(item.detail || "");
    setNewSchedColor(item.color || "border-purple-500 text-purple-400");
    
    try {
      const [startStr, endStr] = item.time.split('-').map((s: string) => s.trim());
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      setStartHour(sh);
      setStartMinute(sm);
      setEndHour(eh);
      setEndMinute(em);
    } catch (e) {
      setStartHour(9);
      setStartMinute(30);
      setEndHour(10);
      setEndMinute(30);
    }
    
    // Set target date and open modal
    const itemDate = item.date || getTodayDateString();
    setModalSelectedDate(itemDate);
    const [gy, gm, gd] = itemDate.split('-').map(Number);
    const [jy, jm, jd] = g2j(gy, gm, gd);
    setModalCalYear(jy);
    setModalCalMonth(jm);
    setModalCalSys(language === 'fa' ? 'shamsi' : 'miladi');
    setIsAddingSchedule(true);
  };

  // Handles both Adding and Editing a schedule item
  const handleSaveScheduleItem = () => {
    if (!newSchedTitle.trim()) return;
    const tStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
    if (editingSchedule) {
      // Edit mode
      setSchedule(prev => prev.map(item => {
        if (item.id === editingSchedule.id) {
          return {
            ...item,
            time: tStr,
            title: newSchedTitle.trim(),
            detail: newSchedDetail.trim(),
            color: newSchedColor,
            date: modalSelectedDate
          };
        }
        return item;
      }));
      setEditingSchedule(null);
    } else {
      // Add mode
      const item = {
        id: `sc-${Date.now()}`,
        time: tStr,
        title: newSchedTitle.trim(),
        detail: newSchedDetail.trim(),
        color: newSchedColor,
        date: modalSelectedDate
      };
      setSchedule(prev => [...prev, item]);
    }
    
    setNewSchedTitle("");
    setNewSchedDetail("");
    setIsAddingSchedule(false);
  };

  const handleDeleteScheduleItem = (id: string) => {
    const item = schedule.find(s => s.id === id);
    if (item) {
      setDeleteConfirm({ isOpen: true, type: 'schedule', id, title: item.title });
    }
  };

  // State: My Tasks / To-Do List (Fully interactive with tab filtering)
  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('productivity_study_planner_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 't-1', title: 'Finish Math Assignment', category: 'Today', starred: true, completed: true },
      { id: 't-2', title: 'Review Physics Notes', category: 'Today', starred: false, completed: false },
      { id: 't-3', title: 'Prepare for Chemistry Lab', category: 'Tomorrow', starred: false, completed: false },
      { id: 't-4', title: 'Read 20 pages of Book', category: 'May 30', starred: false, completed: false },
      { id: 't-5', title: 'Workout', category: 'May 30', starred: false, completed: false }
    ];
  });
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Today");
  const [newTaskStarred, setNewTaskStarred] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    localStorage.setItem('productivity_study_planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      starred: newTaskStarred,
      completed: false
    };
    setTasks(prev => [task, ...prev]);
    setNewTaskTitle("");
    setNewTaskStarred(false);
    setIsAddingTask(false);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleTaskStarred = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setDeleteConfirm({ isOpen: true, type: 'task', id, title: task.title });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'completed') return task.completed;
    if (taskFilter === 'today') return !task.completed && task.category === 'Today';
    if (taskFilter === 'upcoming') return !task.completed && task.category !== 'Today';
    return true; // 'all'
  });

  // State: Focus Timer (Pomodoro) with ticking and circle progress ring
  const [studyDuration, setStudyDuration] = useState<number>(() => {
    return Number(localStorage.getItem('pomo_study_duration') || '25');
  });
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('pomo_short_break_duration') || '5');
  });
  const [longBreakDuration, setLongBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('pomo_long_break_duration') || '15');
  });
  const [totalSessions, setTotalSessions] = useState<number>(() => {
    return Number(localStorage.getItem('pomo_total_sessions') || '4');
  });
  const [longBreakEnabled, setLongBreakEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pomo_long_break_enabled') !== 'false';
  });
  const [loopEnabled, setLoopEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pomo_loop_enabled') !== 'false';
  });
  const [alarmSound, setAlarmSound] = useState<string>(() => {
    return localStorage.getItem('pomo_alarm_sound') || 'warm-chime';
  });
  const [customSoundUrl, setCustomSoundUrl] = useState<string>(() => {
    return localStorage.getItem('pomo_custom_sound_url') || '';
  });

  // Pomodoro Runtime States
  const [currentSession, setCurrentSession] = useState<number>(1);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(studyDuration * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState<boolean>(false);

  // Completed History
  const [history, setHistory] = useState<{ id: string; timestamp: string; type: 'focus'; duration: number }[]>(() => {
    const saved = localStorage.getItem('pomo_completed_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem('pomo_study_duration', String(studyDuration));
    localStorage.setItem('pomo_short_break_duration', String(shortBreakDuration));
    localStorage.setItem('pomo_long_break_duration', String(longBreakDuration));
    localStorage.setItem('pomo_total_sessions', String(totalSessions));
    localStorage.setItem('pomo_long_break_enabled', String(longBreakEnabled));
    localStorage.setItem('pomo_loop_enabled', String(loopEnabled));
    localStorage.setItem('pomo_alarm_sound', alarmSound);
    localStorage.setItem('pomo_custom_sound_url', customSoundUrl);
    localStorage.setItem('pomo_completed_history', JSON.stringify(history));
  }, [studyDuration, shortBreakDuration, longBreakDuration, totalSessions, longBreakEnabled, loopEnabled, alarmSound, customSoundUrl, history]);

  const playAlarm = () => {
    if (alarmSound === 'custom' && customSoundUrl) {
      const audio = new Audio(customSoundUrl);
      audio.volume = 0.5;
      audio.play().catch(e => {
        console.error("Failed to play custom alarm, playing fallback:", e);
        playSynthesizedSound('warm-chime');
      });
    } else {
      playSynthesizedSound(alarmSound);
    }
  };

  const resetTimerToMode = (mode: 'focus' | 'shortBreak' | 'longBreak', sessionIndex?: number) => {
    setTimerRunning(false);
    setTimerMode(mode);
    if (sessionIndex !== undefined) {
      setCurrentSession(sessionIndex);
    }
    
    if (mode === 'focus') {
      setTimeLeft(studyDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Trigger alarm sound!
            playAlarm();

            // Store completed focus history
            if (timerMode === 'focus') {
              const newHistoryItem = {
                id: 'pomo-' + Date.now(),
                timestamp: new Date().toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'focus' as const,
                duration: studyDuration
              };
              setHistory(prevHist => [newHistoryItem, ...prevHist].slice(0, 10));
            }

            // State Transitions
            if (timerMode === 'focus') {
              if (currentSession >= totalSessions) {
                if (longBreakEnabled) {
                  setTimerMode('longBreak');
                  return longBreakDuration * 60;
                } else {
                  if (loopEnabled) {
                    setCurrentSession(1);
                    setTimerMode('focus');
                    return studyDuration * 60;
                  } else {
                    setTimerRunning(false);
                    setCurrentSession(1);
                    return studyDuration * 60;
                  }
                }
              } else {
                setTimerMode('shortBreak');
                return shortBreakDuration * 60;
              }
            } else if (timerMode === 'shortBreak') {
              setCurrentSession(prev => prev + 1);
              setTimerMode('focus');
              return studyDuration * 60;
            } else if (timerMode === 'longBreak') {
              if (loopEnabled) {
                setCurrentSession(1);
                setTimerMode('focus');
                return studyDuration * 60;
              } else {
                setTimerRunning(false);
                setCurrentSession(1);
                setTimerMode('focus');
                return studyDuration * 60;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode, currentSession, totalSessions, studyDuration, shortBreakDuration, longBreakDuration, longBreakEnabled, loopEnabled, alarmSound, customSoundUrl]);

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    resetTimerToMode(timerMode, currentSession);
  };

  const handleSkip = () => {
    playSynthesizedSound('digital-beep');
    if (timerMode === 'focus') {
      if (currentSession >= totalSessions) {
        if (longBreakEnabled) {
          resetTimerToMode('longBreak');
        } else {
          resetTimerToMode('focus', 1);
        }
      } else {
        resetTimerToMode('shortBreak');
      }
    } else if (timerMode === 'shortBreak') {
      resetTimerToMode('focus', currentSession + 1);
    } else if (timerMode === 'longBreak') {
      resetTimerToMode('focus', 1);
    }
  };

  const formattedTimerTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // State: Upcoming Deadlines (with priority badges)
  const [deadlines, setDeadlines] = useState<any[]>(() => {
    const saved = localStorage.getItem('productivity_study_deadlines');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'd-1', title: 'Data Structures Assignment', due: `${trans.dueIn} 2 ${trans.days} • May 30, 2024`, priority: 'High', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
      { id: 'd-2', title: 'Chemistry Lab Report', due: `${trans.dueIn} 4 ${trans.days} • June 1, 2024`, priority: 'Medium', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
      { id: 'd-3', title: 'Physics Quiz', due: `${trans.dueIn} 7 ${trans.days} • June 4, 2024`, priority: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
    ];
  });
  const [isAddingDeadline, setIsAddingDeadline] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState("");
  const [newDeadlinePriority, setNewDeadlinePriority] = useState("High");
  const [newDeadlineDate, setNewDeadlineDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('productivity_study_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/study', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName,
            schedule,
            studyDragLocked,
            deadlineDragLocked,
            tasks,
            studyDuration,
            shortBreakDuration,
            longBreakDuration,
            totalSessions,
            longBreakEnabled,
            loopEnabled,
            alarmSound,
            customSoundUrl,
            pomoHistory: history,
            deadlines,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save study planner data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    userName,
    schedule,
    studyDragLocked,
    deadlineDragLocked,
    tasks,
    studyDuration,
    shortBreakDuration,
    longBreakDuration,
    totalSessions,
    longBreakEnabled,
    loopEnabled,
    alarmSound,
    customSoundUrl,
    history,
    deadlines,
    isInitialLoaded,
  ]);

  const handleExportStudyJSON = () => {
    try {
      const isRtl = language === 'fa';
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          userName,
          schedule,
          studyDragLocked,
          deadlineDragLocked,
          tasks,
          studyDuration,
          shortBreakDuration,
          longBreakDuration,
          totalSessions,
          longBreakEnabled,
          loopEnabled,
          alarmSound,
          customSoundUrl,
          pomoHistory: history,
          deadlines
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `study_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export study planner JSON:", error);
    }
  };

  const handleImportStudyJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isRtl = language === 'fa';
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (Array.isArray(parsed.schedule) || Array.isArray(parsed.tasks) || Array.isArray(parsed.deadlines))) {
          if (parsed.userName) setUserName(parsed.userName);
          if (Array.isArray(parsed.schedule)) setSchedule(parsed.schedule);
          if (parsed.studyDragLocked !== undefined) setStudyDragLocked(parsed.studyDragLocked);
          if (parsed.deadlineDragLocked !== undefined) setDeadlineDragLocked(parsed.deadlineDragLocked);
          if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
          if (parsed.studyDuration !== undefined) setStudyDuration(parsed.studyDuration);
          if (parsed.shortBreakDuration !== undefined) setShortBreakDuration(parsed.shortBreakDuration);
          if (parsed.longBreakDuration !== undefined) setLongBreakDuration(parsed.longBreakDuration);
          if (parsed.totalSessions !== undefined) setTotalSessions(parsed.totalSessions);
          if (parsed.longBreakEnabled !== undefined) setLongBreakEnabled(parsed.longBreakEnabled);
          if (parsed.loopEnabled !== undefined) setLoopEnabled(parsed.loopEnabled);
          if (parsed.alarmSound) setAlarmSound(parsed.alarmSound);
          if (parsed.customSoundUrl !== undefined) setCustomSoundUrl(parsed.customSoundUrl);
          if (Array.isArray(parsed.pomoHistory)) setHistory(parsed.pomoHistory);
          if (Array.isArray(parsed.deadlines)) setDeadlines(parsed.deadlines);
          
          alert(isRtl ? "برنامه ریزی تحصیلی با موفقیت از فایل JSON بازیابی شد!" : "Study planner successfully restored from JSON backup!");
        } else {
          alert(isRtl ? "ساختار فایل پشتیبان نامعتبر است." : "Invalid backup file structure.");
        }
      } catch (err) {
        alert(isRtl ? "خواندن فایل با خطا مواجه شد." : "An error occurred while parsing the file.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  const handleAddDeadline = () => {
    if (!newDeadlineTitle.trim()) return;
    const badgeColor = newDeadlinePriority === 'High' 
      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      : (newDeadlinePriority === 'Medium' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20');
    
    const target = new Date(newDeadlineDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    const diff = target.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    let dueMsg = "";
    if (days < 0) {
      dueMsg = language === 'fa' ? 'منقضی شده' : 'Overdue';
    } else if (days === 0) {
      dueMsg = language === 'fa' ? 'امروز' : 'Today';
    } else if (days === 1) {
      dueMsg = language === 'fa' ? 'فردا' : 'Tomorrow';
    } else {
      dueMsg = language === 'fa' ? `تحویل در ${digitsToPersian(days)} روز دیگر` : `Due in ${days} days • ${newDeadlineDate}`;
    }

    const item = {
      id: `d-${Date.now()}`,
      title: newDeadlineTitle.trim(),
      due: dueMsg,
      priority: newDeadlinePriority,
      color: badgeColor
    };
    setDeadlines(prev => [...prev, item]);
    setNewDeadlineTitle("");
    setIsAddingDeadline(false);
  };

  const handleDeleteDeadline = (id: string) => {
    const d = deadlines.find(item => item.id === id);
    if (d) {
      setDeleteConfirm({ isOpen: true, type: 'deadline', id, title: d.title });
    }
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'schedule') {
      setSchedule(prev => prev.filter(item => item.id !== id));
    } else if (type === 'schedule-all') {
      setSchedule([]);
    } else if (type === 'task') {
      setTasks(prev => prev.filter(t => t.id !== id));
    } else if (type === 'deadline') {
      setDeadlines(prev => prev.filter(d => d.id !== id));
    }
    setDeleteConfirm(null);
  };


  // State & Logic: Unified Global Background Audio Player
  const {
    isAudioPlaying,
    activeTrackIndex,
    isMuted,
    localTracks,
    allTracks,
    currentTrack,
    currentTime,
    duration,
    volume,
    setVolume,
    isPlayerVisible,
    setIsPlayerVisible,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    setMute,
    uploadLocalTracks,
    seek,
    getAnalyserData,
    stopAndClear
  } = useAudioPlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const playerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlayerVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (playerElementRef.current) {
      observer.observe(playerElementRef.current);
    }

    return () => {
      observer.disconnect();
      setIsPlayerVisible(false);
    };
  }, [setIsPlayerVisible]);

  const handleLocalAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadLocalTracks(files);
    }
  };

  const getTrackTitle = (track: any) => {
    if (!track) return '';
    if (track.isLocal) return track.title;
    if (track.id === 'lofi') return trans.lofiBeats;
    if (track.id === 'rain') return trans.rainyCafe;
    if (track.id === 'synthwave') return trans.synthwave;
    if (track.id === 'zen') return trans.deepZen;
    return track.title;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const visualizerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    const updateVisualizer = () => {
      const data = getAnalyserData();
      if (data && visualizerContainerRef.current) {
        const barElements = visualizerContainerRef.current.children;
        const totalBars = barElements.length;
        
        for (let i = 0; i < totalBars; i++) {
          const bar = barElements[i] as HTMLElement;
          if (bar) {
            // Focus on lower/mid frequencies
            const dataIndex = Math.min(
              Math.floor((i / totalBars) * data.length * 0.75),
              data.length - 1
            );
            const value = data[dataIndex];
            
            let heightPercent = 15;
            if (isAudioPlaying) {
              heightPercent = 15 + (value / 255) * 85;
            }
            
            if (isAudioPlaying && value === 0) {
              heightPercent = 15 + Math.sin(Date.now() * 0.006 + i) * 12;
            }
            
            bar.style.height = `${heightPercent}%`;
          }
        }
      } else if (visualizerContainerRef.current) {
        const barElements = visualizerContainerRef.current.children;
        for (let i = 0; i < barElements.length; i++) {
          const bar = barElements[i] as HTMLElement;
          if (bar) {
            bar.style.height = '15%';
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAudioPlaying, getAnalyserData]);

  const getSyncBadge = () => {
    const isRtl = language === 'fa';
    switch (syncStatus) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[9px]">{isRtl ? 'بارگذاری...' : 'Loading...'}</span>
          </span>
        );
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" />
            <span className="text-[9px]">{isRtl ? 'ذخیره‌سازی...' : 'Saving...'}</span>
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در study_data.json' : 'Saved to study_data.json'}>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[9px]">{isRtl ? 'همگام با فایل' : 'Synced with JSON'}</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-rose-400" />
            <span className="text-[9px]">{isRtl ? 'خطا' : 'Sync error'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full text-slate-100 rounded-3xl overflow-hidden p-1 sm:p-2 bg-[#060410]" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* MAIN PLANNING WORKSPACE CONTENT */}
      <section className="space-y-6">
        
        {/* HEADER: Personalized greeting and Clock/Date */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0d0925]/40 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle cosmic background glow in header */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="space-y-1.5 z-10 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2 group">
              <h1 className="text-2.5xl sm:text-3xl font-black text-white leading-tight">
                {trans.greeting},{" "}
                {isEditingName ? (
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="bg-purple-950/80 border border-purple-500/50 rounded-xl px-2 py-0.5 text-white outline-none text-2xl font-black inline-block w-36"
                    autoFocus
                  />
                ) : (
                  <span 
                    onDoubleClick={() => {
                      setNameInput(userName);
                      setIsEditingName(true);
                    }}
                    className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent cursor-pointer border-b border-dashed border-purple-400/30 hover:border-purple-400"
                    title={trans.clickToEditName}
                  >
                    {userName}
                  </span>
                )}
                {" "}👋
              </h1>
              {getSyncBadge()}
              <span className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                ({trans.clickToEditName})
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium">
              {trans.subtitle}
            </p>
          </div>

          {/* JSON Export/Import buttons */}
          <div className="flex gap-2 flex-wrap items-center z-10 my-2 sm:my-0">
            <button
              onClick={handleExportStudyJSON}
              className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title={language === 'fa' ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>{language === 'fa' ? 'خروجی JSON' : 'Export JSON'}</span>
            </button>

            <label className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-cyan-300" />
              <span>{language === 'fa' ? 'وارد کردن JSON' : 'Import JSON'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportStudyJSON}
                className="hidden"
              />
            </label>
          </div>

          {/* Clock matching exact screenshot visual with YYYY-MM-DD underneath */}
          <div className="text-right z-10 mt-3 sm:mt-0 self-end sm:self-auto font-mono">
            <h2 className="text-2.5xl sm:text-3.5xl font-black text-white tracking-wider flex items-center justify-end gap-1.5 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
              {timeStr || "07:45 AM"}
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-wide mt-1 flex items-center justify-end gap-1.5 select-none">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-400/80" />
              <span>{dateStr || "Tuesday, May 28, 2024"}</span>
            </p>
          </div>
        </header>

        {/* TOP ROW: [Calendar] | [Today's Schedule] | [Weather] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Calendar Card (Left - 5 cols) */}
          <article className="lg:col-span-4 bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[320px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 relative select-none">
                <CalendarIcon className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                
                {/* Modern Month Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold border border-white/5 hover:border-white/15 cursor-pointer"
                  >
                    <span>{MONTH_NAMES[language][calMonth]}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute top-full mt-1.5 left-0 w-32 max-h-60 overflow-y-auto bg-[#0b0821]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5 custom-scrollbar">
                      {MONTH_NAMES[language].map((mName, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCalendarDate(new Date(calYear, idx, 1));
                            setShowMonthDropdown(false);
                          }}
                          className={`w-full text-right px-2.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                            idx === calMonth
                              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {mName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modern Year Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold border border-white/5 hover:border-white/15 cursor-pointer"
                  >
                    <span>{isRtl ? digitsToPersian(calYear) : calYear}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  {showYearDropdown && (
                    <div className="absolute top-full mt-1.5 left-0 w-24 max-h-60 overflow-y-auto bg-[#0b0821]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5 custom-scrollbar">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const y = new Date().getFullYear() - 5 + i;
                        return (
                          <button
                            key={y}
                            onClick={() => {
                              setCalendarDate(new Date(y, calMonth, 1));
                              setShowYearDropdown(false);
                            }}
                            className={`w-full text-center px-2.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                              y === calYear
                                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {isRtl ? digitsToPersian(y) : y}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Swapped order of next and prev month buttons as requested */}
                <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all" title={language === 'fa' ? 'ماه بعد' : 'Next Month'}>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all" title={language === 'fa' ? 'ماه قبل' : 'Previous Month'}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days row */}
            <div className="grid grid-cols-7 text-center gap-1 text-xs font-black text-slate-400 mt-3">
              {WEEKDAYS[language].map((day, idx) => (
                <div key={idx} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar Numbers dynamic matching exact theme */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-sm font-bold text-slate-300 mt-2.5">
              {/* Blank initial dates */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="py-2 opacity-0"></div>
              ))}
              
              {/* Day numbers */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isTodaySelected = dayNum === selectedDay;
                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-2 text-center rounded-lg hover:bg-purple-500/10 hover:text-white transition-all select-none relative font-bold ${
                      isTodaySelected 
                        ? 'bg-purple-500 text-white font-black shadow-[0_0_12px_rgba(168,85,247,0.6)]' 
                        : 'text-slate-300'
                    }`}
                  >
                    {isRtl ? digitsToPersian(dayNum) : dayNum}
                  </button>
                );
              })}
            </div>
          </article>

          {/* Today's Schedule Card (Middle - 4 cols) */}
          <article className="lg:col-span-4 bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[320px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 gap-1.5">
              <span className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                {trans.scheduleTitle}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStudyDragLocked(!studyDragLocked)}
                  className={`p-1 px-1.5 sm:px-2.5 text-[10px] sm:text-xs border rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer ${
                    studyDragLocked 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
                  }`}
                  title={studyDragLocked ? (language === 'fa' ? 'باز کردن قفل حرکت' : 'Unlock Dragging') : (language === 'fa' ? 'قفل کردن حرکت' : 'Lock Dragging')}
                >
                  {studyDragLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{studyDragLocked ? (language === 'fa' ? 'قفل' : 'Lock') : (language === 'fa' ? 'حرکت' : 'Drag')}</span>
                </button>
                <button 
                  onClick={() => setShowAllEventsModal(true)}
                  className="p-1 px-2 text-[10px] sm:text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-lg font-bold transition-all flex items-center gap-1"
                  title={language === 'fa' ? 'نمایش همه رویدادها' : 'Show All Events'}
                >
                  <Folder className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'fa' ? 'بیشتر' : 'More'}</span>
                </button>
                <button 
                  onClick={() => {
                    setEditingSchedule(null);
                    setNewSchedTitle("");
                    setNewSchedDetail("");
                    setStartHour(9);
                    setStartMinute(30);
                    setEndHour(10);
                    setEndMinute(30);
                    setNewSchedColor("border-purple-500 text-purple-400");
                    initModalCalendar(getTodayDateString());
                    setIsAddingSchedule(true);
                  }}
                  className="p-1 px-2 text-[10px] sm:text-xs bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 rounded-lg font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{trans.addScheduleBtn}</span>
                </button>
              </div>
            </div>

            {/* Schedule Items with Left Accent Borders showing strictly today's items */}
            <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-[190px] pr-1">
              {(() => {
                const todayDateStr = getTodayDateString();
                const todaysSchedule = schedule.filter(item => (!item.date || item.date === todayDateStr));

                if (todaysSchedule.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-500 text-xs space-y-1">
                      <CalendarIcon className="w-7 h-7 text-slate-600 opacity-40" />
                      <span>{language === 'fa' ? 'هیچ رویدادی برای امروز ثبت نشده است' : 'No schedule items for today'}</span>
                    </div>
                  );
                }

                return todaysSchedule.map((item, index) => {
                  const isPassed = isEventTimePassed(item);
                  const isCompleted = item.completed;

                  let cardBgClass = "bg-[#141031]/50";
                  let cardBorderClass = `border-l-3 ${item.color}`;
                  let opacityClass = "";

                  if (isPassed) {
                    if (isCompleted) {
                      cardBgClass = "bg-[#141031]/30";
                      opacityClass = "opacity-60";
                    } else {
                      cardBgClass = "bg-rose-950/10 border-rose-950/20";
                      cardBorderClass = "border-l-3 border-rose-500 text-rose-400";
                    }
                  } else if (isCompleted) {
                    cardBgClass = "bg-[#141031]/30";
                    opacityClass = "opacity-60";
                  }

                  let titleClass = "text-xs sm:text-sm font-black text-white leading-tight break-words";

                  if (isPassed) {
                    if (isCompleted) {
                      titleClass = "text-xs sm:text-sm font-black text-slate-400 leading-tight break-words line-through decoration-emerald-500 decoration-1.5";
                    } else {
                      titleClass = "text-xs sm:text-sm font-black text-rose-300/90 leading-tight break-words line-through decoration-rose-500 decoration-2";
                    }
                  } else if (isCompleted) {
                    titleClass = "text-xs sm:text-sm font-black text-slate-400 leading-tight break-words line-through decoration-slate-400";
                  }

                  return (
                    <div 
                      key={item.id}
                      draggable={!studyDragLocked}
                      onDragStart={(e) => {
                        if (studyDragLocked) {
                          e.preventDefault();
                          return;
                        }
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input')) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (studyDragLocked) return;
                        if (draggedIndex !== null && draggedIndex !== index) {
                          const draggedItem = todaysSchedule[draggedIndex];
                          const targetItem = todaysSchedule[index];
                          if (draggedItem && targetItem) {
                            setSchedule(prev => {
                              const fromIdx = prev.findIndex(s => s.id === draggedItem.id);
                              const toIdx = prev.findIndex(s => s.id === targetItem.id);
                              if (fromIdx !== -1 && toIdx !== -1) {
                                const updated = [...prev];
                                const [removed] = updated.splice(fromIdx, 1);
                                updated.splice(toIdx, 0, removed);
                                return updated;
                              }
                              return prev;
                            });
                          }
                        }
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`${cardBgClass} ${cardBorderClass} ${opacityClass} p-3 rounded-r-xl flex items-center justify-between group transition-all hover:bg-[#141031]/80 select-none ${studyDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${draggedIndex === index ? 'opacity-40 border-purple-500 border-dashed scale-95' : ''}`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => {
                            setSchedule(prev => prev.map(s => s.id === item.id ? { ...s, completed: !s.completed } : s));
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer mt-0.5 shrink-0 ${
                            item.completed 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                              : 'border-slate-500 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                          }`}
                          title={item.completed ? (language === 'fa' ? 'علامت به عنوان انجام نشده' : 'Mark incomplete') : (language === 'fa' ? 'علامت به عنوان انجام شده' : 'Mark completed')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold font-mono text-slate-400 block">
                              {isRtl ? digitsToPersian(item.time) : item.time}
                            </span>
                            {isPassed && isCompleted && (
                              <span className="px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/25 font-sans">
                                {language === 'fa' ? '✓ انجام شده' : '✓ Completed'}
                              </span>
                            )}
                            {isPassed && !isCompleted && (
                              <span className="px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black bg-rose-500/10 text-rose-400 rounded border border-rose-500/25 font-sans animate-pulse">
                                {language === 'fa' ? '⚠️ منقضی‌شده / انجام نشده' : '⚠️ Overdue / Missed'}
                              </span>
                            )}
                          </div>
                          <h4 className={titleClass}>{item.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.detail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => handleEditScheduleItem(item)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400 transition"
                          title={language === 'fa' ? 'ویرایش' : 'Edit'}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteScheduleItem(item.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-rose-400 transition"
                          title={language === 'fa' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </article>

          {/* Real-time Active Focus & Next Up Timeline Card (Right - 4 cols) */}
          <article className="lg:col-span-4 bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[320px]">
            {/* Top ambient color spot */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl"></div>

            <span className="text-sm font-black text-slate-200 flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              {trans.activeFocusTitle}
            </span>

            {/* Current Active Event Content */}
            <div className="flex-1 flex flex-col justify-center my-3">
              {activeFocusEvent ? (
                <div className="space-y-2.5 bg-purple-500/5 border border-purple-500/20 p-4.5 rounded-2xl relative overflow-hidden shadow-[inset_0_0_12px_rgba(168,85,247,0.05)]">
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold text-purple-400">{activeFocusEvent.time}</span>
                    <div className="flex items-center gap-1.5 bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest shrink-0">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
                      ACTIVE
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mt-1">{activeFocusEvent.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{activeFocusEvent.detail}</p>
                </div>
              ) : (
                <div className="text-center py-5 space-y-3">
                  <div className="w-12 h-12 bg-slate-500/5 border border-slate-500/10 rounded-xl flex items-center justify-center mx-auto text-slate-400 animate-pulse">
                    <Moon className="w-5.5 h-5.5 text-purple-400/80" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-300">{trans.noActiveEvent}</h4>
                    <p className="text-xs text-slate-500 mt-1">{trans.freeStudyRest}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Up Event Section - Extremely Faded Bottom Layer */}
            <div className="border-t border-white/5 pt-3.5 mt-2 opacity-40 hover:opacity-75 transition-opacity duration-300">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                {trans.nextUpTitle}
              </span>
              {nextUpEvent ? (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="font-bold text-slate-300">{nextUpEvent.title}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{nextUpEvent.time}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">{trans.noUpcomingEvent}</p>
              )}
            </div>
          </article>

        </div>

        {/* NEW GRID LAYOUT: [Deadlines + Focus Timer] | [Study Playlist] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
          
          {/* Deadlines on top of Focus Timer (Left - 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Upcoming Deadlines Card */}
            <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[280px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                    <CalendarIcon className="w-4.5 h-4.5 text-purple-400" />
                    {trans.deadlinesTitle}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Drag Lock Button */}
                    <button
                      type="button"
                      onClick={() => setDeadlineDragLocked(!deadlineDragLocked)}
                      className={`p-1 px-2.5 text-[10px] border rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer font-sans ${
                        deadlineDragLocked 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                          : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
                      }`}
                      title={deadlineDragLocked ? (language === 'fa' ? 'باز کردن قفل حرکت' : 'Unlock Dragging') : (language === 'fa' ? 'قفل کردن حرکت' : 'Lock Dragging')}
                    >
                      {deadlineDragLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{deadlineDragLocked ? (language === 'fa' ? 'قفل حرکت' : 'Locked') : (language === 'fa' ? 'حرکت آزاد' : 'Unlocked')}</span>
                    </button>

                    <button 
                      onClick={() => setIsAddingDeadline(!isAddingDeadline)}
                      className="p-1 px-2.5 text-xs bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 rounded-lg font-black transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{trans.addDeadlineBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Deadlines List with Amber Badges matching screenshot */}
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {deadlines.map((item, index) => (
                    <div 
                      key={item.id}
                      draggable={!deadlineDragLocked}
                      onDragStart={(e) => {
                        if (deadlineDragLocked) {
                          e.preventDefault();
                          return;
                        }
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input')) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedDeadlineIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (deadlineDragLocked) return;
                        if (draggedDeadlineIndex !== null && draggedDeadlineIndex !== index) {
                          setDeadlines(prev => {
                            const updated = [...prev];
                            const [removed] = updated.splice(draggedDeadlineIndex, 1);
                            updated.splice(index, 0, removed);
                            return updated;
                          });
                        }
                        setDraggedDeadlineIndex(null);
                      }}
                      onDragEnd={() => setDraggedDeadlineIndex(null)}
                      className={`flex items-center justify-between p-3.5 bg-[#141031]/40 border border-white/5 rounded-xl hover:bg-[#141031]/80 transition group select-none ${deadlineDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${draggedDeadlineIndex === index ? 'opacity-40 border-purple-400 border-dashed scale-95' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                          <Folder className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400">{item.due}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded border ${item.color}`}>
                          {item.priority === 'High' ? trans.high : trans.medium}
                        </span>
                        <button 
                          onClick={() => handleDeleteDeadline(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline popover to add deadlines */}
              <AnimatePresence>
                {isAddingDeadline && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 bg-[#0d0925] border border-white/10 p-3.5 rounded-xl space-y-3 overflow-hidden text-xs"
                  >
                    <input 
                      type="text" 
                      placeholder={trans.deadlinePlaceholder}
                      value={newDeadlineTitle}
                      onChange={(e) => setNewDeadlineTitle(e.target.value)}
                      className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-3 text-white outline-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowDeadlinePriorityDropdown(!showDeadlinePriorityDropdown)}
                            className="bg-black/40 border border-white/10 h-8 rounded-lg px-2.5 text-white outline-none flex items-center justify-between gap-1.5 min-w-[95px] text-[10px]"
                          >
                            <span>{newDeadlinePriority === 'High' ? trans.high : (newDeadlinePriority === 'Medium' ? trans.medium : trans.low)}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>
                          <AnimatePresence>
                            {showDeadlinePriorityDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-50 left-0 mt-1 bg-[#141031] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1 min-w-[100px]"
                              >
                                {[
                                  { label: trans.high, val: 'High' },
                                  { label: trans.medium, val: 'Medium' },
                                  { label: trans.low, val: 'Low' }
                                ].map((opt) => (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => {
                                      setNewDeadlinePriority(opt.val);
                                      setShowDeadlinePriorityDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-slate-200 transition text-[10px]"
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <input 
                          type="date" 
                          value={newDeadlineDate}
                          onChange={(e) => setNewDeadlineDate(e.target.value)}
                          className="bg-black/40 border border-white/10 focus:border-purple-500 h-8 rounded-lg px-2 text-white outline-none w-36 text-[10px] font-mono cursor-pointer"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setIsAddingDeadline(false)}
                          className="px-3 py-1 text-slate-400 hover:text-white transition"
                        >
                          {trans.cancelBtn}
                        </button>
                        <button 
                          onClick={handleAddDeadline}
                          className="px-4 py-1 bg-purple-500 text-white font-bold rounded-xl transition"
                        >
                          {trans.addBtn}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>

            {/* Focus Timer (Pomodoro) Card */}
            <article className={`bg-[#0d0925]/90 border rounded-2xl p-5 flex flex-col items-center justify-between shadow-xl min-h-[420px] transition-all duration-500 relative overflow-hidden ${
              timerMode === 'focus' 
                ? 'border-purple-500/20 shadow-purple-500/5' 
                : timerMode === 'shortBreak' 
                  ? 'border-emerald-500/20 shadow-emerald-500/5' 
                  : 'border-blue-500/20 shadow-blue-500/5'
            }`}>
              {/* Animated Mode Aura background */}
              <div className={`absolute -inset-10 bg-gradient-to-br rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000 ${
                timerMode === 'focus' 
                  ? 'from-purple-500/30 to-transparent' 
                  : timerMode === 'shortBreak' 
                    ? 'from-emerald-500/30 to-transparent' 
                    : 'from-blue-500/30 to-transparent'
              }`} />

              <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 z-10">
                <span className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                  <Clock className={`w-4.5 h-4.5 ${
                    timerMode === 'focus' 
                      ? 'text-purple-400' 
                      : timerMode === 'shortBreak' 
                        ? 'text-emerald-400' 
                        : 'text-blue-400'
                  }`} />
                  {trans.focusTimerTitle}
                </span>

                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    showSettings 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showSettings ? (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex-1 flex flex-col justify-between mt-3 gap-3 z-10 text-xs text-slate-200"
                  >
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-1">
                        {language === 'fa' ? POMO_LANG.fa.settingsTitle : POMO_LANG.en.settingsTitle}
                      </h4>
                      
                      {/* Durations Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            {language === 'fa' ? POMO_LANG.fa.studyDuration : POMO_LANG.en.studyDuration}
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            value={studyDuration} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setStudyDuration(val);
                              if (timerMode === 'focus' && !timerRunning) setTimeLeft(val * 60);
                            }}
                            className="w-full h-11 bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl px-3 text-sm font-mono text-center text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            {language === 'fa' ? POMO_LANG.fa.shortBreak : POMO_LANG.en.shortBreak}
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="60"
                            value={shortBreakDuration} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setShortBreakDuration(val);
                              if (timerMode === 'shortBreak' && !timerRunning) setTimeLeft(val * 60);
                            }}
                            className="w-full h-11 bg-black/40 border border-white/10 focus:border-emerald-500 rounded-xl px-3 text-sm font-mono text-center text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            {language === 'fa' ? POMO_LANG.fa.longBreak : POMO_LANG.en.longBreak}
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            value={longBreakDuration} 
                            disabled={!longBreakEnabled}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setLongBreakDuration(val);
                              if (timerMode === 'longBreak' && !timerRunning) setTimeLeft(val * 60);
                            }}
                            className="w-full h-11 bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3 text-sm font-mono text-center text-white outline-none disabled:opacity-40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">
                            {language === 'fa' ? POMO_LANG.fa.totalSessions : POMO_LANG.en.totalSessions}
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            value={totalSessions} 
                            onChange={(e) => setTotalSessions(Math.max(1, Number(e.target.value)))}
                            className="w-full h-11 bg-black/40 border border-white/10 focus:border-purple-500 rounded-xl px-3 text-sm font-mono text-center text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Sound settings and sample player with custom dropdown style */}
                      <div className="space-y-1 relative z-50">
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">
                          {language === 'fa' ? POMO_LANG.fa.alarmSound : POMO_LANG.en.alarmSound}
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <button 
                              type="button"
                              onClick={() => setSoundDropdownOpen(!soundDropdownOpen)}
                              className="w-full h-11 bg-black/40 border border-white/10 hover:border-purple-400 rounded-xl px-3 text-xs flex items-center justify-between text-white text-right"
                            >
                              <span className="truncate">
                                {(() => {
                                  const soundOptions = [
                                    { value: 'warm-chime', label: language === 'fa' ? POMO_LANG.fa.soundWarmChime : POMO_LANG.en.soundWarmChime },
                                    { value: 'zen-bowl', label: language === 'fa' ? POMO_LANG.fa.soundZenBowl : POMO_LANG.en.soundZenBowl },
                                    { value: 'digital-beep', label: language === 'fa' ? POMO_LANG.fa.soundDigitalBeep : POMO_LANG.en.soundDigitalBeep },
                                    { value: 'success', label: language === 'fa' ? POMO_LANG.fa.soundSuccess : POMO_LANG.en.soundSuccess },
                                    { value: 'custom', label: language === 'fa' ? POMO_LANG.fa.soundCustom : POMO_LANG.en.soundCustom }
                                  ];
                                  return soundOptions.find(o => o.value === alarmSound)?.label || alarmSound;
                                })()}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            </button>

                            {soundDropdownOpen && (
                              <div className="absolute bottom-12 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl">
                                {[
                                  { value: 'warm-chime', label: language === 'fa' ? POMO_LANG.fa.soundWarmChime : POMO_LANG.en.soundWarmChime },
                                  { value: 'zen-bowl', label: language === 'fa' ? POMO_LANG.fa.soundZenBowl : POMO_LANG.en.soundZenBowl },
                                  { value: 'digital-beep', label: language === 'fa' ? POMO_LANG.fa.soundDigitalBeep : POMO_LANG.en.soundDigitalBeep },
                                  { value: 'success', label: language === 'fa' ? POMO_LANG.fa.soundSuccess : POMO_LANG.en.soundSuccess },
                                  { value: 'custom', label: language === 'fa' ? POMO_LANG.fa.soundCustom : POMO_LANG.en.soundCustom }
                                ].map((opt) => (
                                  <button 
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setAlarmSound(opt.value);
                                      setSoundDropdownOpen(false);
                                    }}
                                    className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-purple-500/10 hover:text-white transition-all ${alarmSound === opt.value ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-slate-300'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => playAlarm()}
                            className="w-11 h-11 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-300 transition-all flex items-center justify-center text-sm"
                            title="Play Sample"
                          >
                            🔊
                          </button>
                        </div>

                        {alarmSound === 'custom' && (
                          <div className="mt-2 flex items-center gap-2">
                            <input 
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      setCustomSoundUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="pomo-custom-sound-file"
                            />
                            <label 
                              htmlFor="pomo-custom-sound-file"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg cursor-pointer text-[10px] font-bold text-slate-300 transition animate-pulse"
                            >
                              <Upload className="w-3 h-3 text-purple-400" />
                              {customSoundUrl ? 'Change Custom File' : 'Upload Audio File'}
                            </label>
                            {customSoundUrl && <span className="text-[10px] text-emerald-400">✓ Uploaded</span>}
                          </div>
                        )}
                      </div>

                      {/* Checkboxes */}
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={longBreakEnabled} 
                            onChange={(e) => setLongBreakEnabled(e.target.checked)}
                            className="rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>{language === 'fa' ? POMO_LANG.fa.enableLongBreak : POMO_LANG.en.enableLongBreak}</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={loopEnabled} 
                            onChange={(e) => setLoopEnabled(e.target.checked)}
                            className="rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>{language === 'fa' ? POMO_LANG.fa.autoLoop : POMO_LANG.en.autoLoop}</span>
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowSettings(false)}
                      className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                    >
                      {language === 'fa' ? POMO_LANG.fa.closeBtn : POMO_LANG.en.closeBtn}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="timer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex-1 flex flex-col items-center justify-between mt-1 z-10"
                  >
                    {/* Session Tracker */}
                    <div className="text-center mt-1">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                        timerMode === 'focus' 
                          ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20' 
                          : timerMode === 'shortBreak'
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                      }`}>
                        {language === 'fa' 
                          ? POMO_LANG.fa.sessionLabel.replace('{current}', digitsToPersian(currentSession)).replace('{total}', digitsToPersian(totalSessions)) 
                          : POMO_LANG.en.sessionLabel.replace('{current}', String(currentSession)).replace('{total}', String(totalSessions))
                        }
                      </span>
                    </div>

                    {/* Glowing circular progress and digital display timer inside the circle */}
                    <div className="relative w-44 h-44 flex items-center justify-center my-4 select-none">
                      <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                        {/* Background Track */}
                        <circle
                          cx="88"
                          cy="88"
                          r="74"
                          className="stroke-[#19153a]/75 fill-[#0e0a2b]/40"
                          strokeWidth="5.5"
                        />
                        {/* Dynamic Progress Ring */}
                        <circle
                          cx="88"
                          cy="88"
                          r="74"
                          className={`fill-none transition-all duration-300 stroke-[5.5] stroke-linecap-round ${
                            timerMode === 'focus' 
                              ? 'stroke-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
                              : timerMode === 'shortBreak'
                                ? 'stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                : 'stroke-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                          }`}
                          strokeDasharray={465}
                          strokeDashoffset={(() => {
                            const maxSecs = timerMode === 'focus' 
                              ? studyDuration * 60 
                              : timerMode === 'shortBreak' 
                                ? shortBreakDuration * 60 
                                : longBreakDuration * 60;
                            return 465 - (465 * timeLeft) / maxSecs;
                          })()}
                        />
                      </svg>

                      {/* Digital Timer Overlay inside the ring */}
                      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-[-4px]">
                        <h3 className="text-3xl font-black text-white tracking-widest font-mono drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
                          {formattedTimerTime()}
                        </h3>
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full mt-2 inline-block border ${
                          timerMode === 'focus' 
                            ? 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                            : timerMode === 'shortBreak'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                              : 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                        }`}>
                          {timerMode === 'focus' 
                            ? (language === 'fa' ? POMO_LANG.fa.focusMode : POMO_LANG.en.focusMode)
                            : timerMode === 'shortBreak'
                              ? (language === 'fa' ? POMO_LANG.fa.shortBreakMode : POMO_LANG.en.shortBreakMode)
                              : (language === 'fa' ? POMO_LANG.fa.longBreakMode : POMO_LANG.en.longBreakMode)
                          }
                        </span>
                      </div>
                    </div>

                    {/* Controls panel */}
                    <div className="flex items-center gap-3.5 mt-1">
                      <button 
                        onClick={handleTimerReset}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-all active:scale-95"
                        title="Reset"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={handleTimerToggle}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                          timerMode === 'focus'
                            ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : timerMode === 'shortBreak'
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                              : 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        }`}
                      >
                        {timerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>

                      <button 
                        onClick={handleSkip}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-all active:scale-95"
                        title={language === 'fa' ? POMO_LANG.fa.skipBtn : POMO_LANG.en.skipBtn}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* History panel */}
                    {history.length > 0 && (
                      <div className="w-full mt-3.5 pt-2.5 border-t border-white/5 text-center">
                        <span className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                          {language === 'fa' ? POMO_LANG.fa.historyTitle : POMO_LANG.en.historyTitle}
                        </span>
                        <div className="flex flex-wrap justify-center gap-1 max-h-12 overflow-y-auto">
                          {history.map((item) => (
                            <span 
                              key={item.id} 
                              className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md font-mono"
                              title={`${item.duration}m at ${item.timestamp}`}
                            >
                              ✓ {digitsToPersian(item.timestamp)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </article>

          </div>

          {/* Study Playlist / Music Player (Right - 4 cols) */}
          <article ref={playerElementRef} className="lg:col-span-4 bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[290px] h-fit lg:self-start relative overflow-hidden">
            {/* Top right ambient glow decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                <Music className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                {trans.playlistTitle}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Local offline audio file loader */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLocalAudioUpload} 
                  accept="audio/*" 
                  multiple 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-purple-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
                  title={trans.localAudioLoad}
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>{trans.localAudioLoad}</span>
                </button>

                {/* Audio Volume mute toggle */}
                <button 
                  onClick={() => setMute(!isMuted)}
                  className={`p-1.5 hover:bg-white/5 border border-white/10 rounded-lg transition-all focus:outline-none flex items-center justify-center ${isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'}`}
                  title="Mute/Unmute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                </button>

                {/* Close/Stop/Clear Button */}
                <button 
                  onClick={stopAndClear}
                  className="p-1.5 hover:bg-rose-500/20 border border-white/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all active:scale-90"
                  title="Stop Playback"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Centered track metadata */}
            <div className="flex items-center gap-4 py-3 z-10">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg relative group shrink-0">
                <Music className="w-5.5 h-5.5 text-white animate-bounce" />
                {isAudioPlaying && (
                  <span className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-xs animate-ping"></span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs text-purple-400 font-mono font-bold tracking-widest block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {trans.nowPlaying}
                </span>
                <h4 className="text-base font-black text-white truncate">{getTrackTitle(currentTrack) || trans.lofiBeats}</h4>
                <p className="text-xs text-slate-400 truncate">{currentTrack?.subtitle || 'Focus Track'}</p>
              </div>
            </div>

            {/* Draggable (seekable) progress bar for local/uploaded tracks */}
            {currentTrack?.isLocal ? (
              <div className="w-full space-y-1.5 py-1 z-10 font-mono" dir="ltr">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold select-none">
                  <span>{formatTime(localTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={localTime}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={() => {
                    setIsSeeking(false);
                    seek(localTime);
                  }}
                  onTouchStart={() => setIsSeeking(true)}
                  onTouchEnd={() => {
                    setIsSeeking(false);
                    seek(localTime);
                  }}
                  onChange={(e) => {
                    const newVal = parseFloat(e.target.value);
                    setLocalTime(newVal);
                    seek(newVal);
                  }}
                  className="w-full h-1 bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 focus:outline-none transition-all"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(localTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.1) ${(localTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                  }}
                />
              </div>
            ) : (
              <div className="w-full py-1.5 flex items-center justify-center">
                <span className="text-[10px] font-mono text-purple-400/55 uppercase tracking-widest font-bold">
                  {isAudioPlaying ? '✨ Live Synthesizer Playing ✨' : '💤 Standby Loop Ready 💤'}
                </span>
              </div>
            )}

            {/* Interactive soundwave visualization (animated dynamically at 60fps via requestAnimationFrame) */}
            <div 
              ref={visualizerContainerRef}
              className="h-9 w-full flex items-end justify-center gap-1 mt-1 pb-1 z-10"
            >
              {Array.from({ length: 24 }).map((_, idx) => (
                <span 
                  key={idx} 
                  className="w-1 rounded-t bg-gradient-to-t from-purple-600 via-purple-400 to-cyan-400 transition-all duration-150 shrink-0"
                  style={{
                    height: '15%',
                    minHeight: '6px'
                  }}
                />
              ))}
            </div>

            {/* Player track controls bar */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-xs">
              <div className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">
                {isAudioPlaying 
                  ? (currentTrack?.isLocal ? 'LOCAL AUDIO' : 'SYNTH ACTIVE') 
                  : 'STANDBY'}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={prevTrack} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90"
                  title="Previous Track"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-950/50 transition-all hover:scale-105 active:scale-90"
                >
                  {isAudioPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                </button>

                <button 
                  onClick={nextTrack} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90"
                  title="Next Track"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>

        </div>

      </section>

      {/* Deletion Confirmation Popup Modal */}
      <AnimatePresence>
        {deleteConfirm && deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-[#0f092b] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.2)] relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-rose-500"></div>

              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white">{trans.deleteConfirmTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {trans.deleteConfirmDesc.replace('{title}', deleteConfirm.title)}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition text-xs font-bold"
                >
                  {trans.deleteConfirmNo}
                </button>
                <button
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition shadow-[0_0_15px_rgba(244,63,94,0.3)] text-xs"
                >
                  {trans.deleteConfirmYes}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Add / Edit Event Popup Modal with Embedded Dual Calendar Picker */}
      <AnimatePresence>
        {isAddingSchedule && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0e0a29]/95 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>
                    {editingSchedule 
                      ? (language === 'fa' ? 'ویرایش رویداد مطالعه' : 'Edit Study Event')
                      : (language === 'fa' ? 'افزودن رویداد جدید' : 'Add New Event')}
                  </span>
                </h3>
                <button 
                  onClick={() => setIsAddingSchedule(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                    {language === 'fa' ? 'عنوان درس یا فعالیت' : 'Subject / Activity Title'}
                  </label>
                  <input 
                    type="text" 
                    placeholder={trans.schedulePlaceholder}
                    value={newSchedTitle}
                    onChange={(e) => setNewSchedTitle(e.target.value)}
                    className="bg-black/30 border border-white/10 h-10 w-full rounded-xl px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 transition-all font-sans"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                    {language === 'fa' ? 'توضیحات و جزئیات مطالعه' : 'Study Details / Notes'}
                  </label>
                  <textarea 
                    placeholder={language === 'fa' ? 'مثلا: حل تمارین فصل ۲ یا مطالعه صفحات ۴۰ تا ۵۰...' : 'e.g. Solve exercises in chapter 2...'}
                    value={newSchedDetail}
                    onChange={(e) => setNewSchedDetail(e.target.value)}
                    rows={2}
                    className="bg-black/30 border border-white/10 w-full rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 transition-all resize-none font-sans"
                  />
                </div>

                {/* Hour and color selections */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Start hour dropdown (Minute and Hour swapped as requested) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                      {language === 'fa' ? 'ساعت شروع' : 'Start Time'}
                    </label>
                    <div className="flex items-center justify-center gap-1 bg-black/30 border border-white/10 h-10 rounded-xl px-1.5 text-slate-300">
                      <select 
                        value={startMinute} 
                        onChange={e => setStartMinute(Number(e.target.value))}
                        className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono"
                      >
                        {Array.from({ length: 12 }).map((_, m) => {
                          const min = m * 5;
                          return <option key={min} value={min} className="bg-[#141031]">{String(min).padStart(2, '0')}</option>;
                        })}
                      </select>
                      <span className="font-mono text-slate-400">:</span>
                      <select 
                        value={startHour} 
                        onChange={e => setStartHour(Number(e.target.value))}
                        className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h} className="bg-[#141031]">{String(h).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End hour dropdown (Minute and Hour swapped as requested) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                      {language === 'fa' ? 'ساعت پایان' : 'End Time'}
                    </label>
                    <div className="flex items-center justify-center gap-1 bg-black/30 border border-white/10 h-10 rounded-xl px-1.5 text-slate-300">
                      <select 
                        value={endMinute} 
                        onChange={e => setEndMinute(Number(e.target.value))}
                        className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono"
                      >
                        {Array.from({ length: 12 }).map((_, m) => {
                          const min = m * 5;
                          return <option key={min} value={min} className="bg-[#141031]">{String(min).padStart(2, '0')}</option>;
                        })}
                      </select>
                      <span className="font-mono text-slate-400">:</span>
                      <select 
                        value={endHour} 
                        onChange={e => setEndHour(Number(e.target.value))}
                        className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none cursor-pointer font-mono"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h} className="bg-[#141031]">{String(h).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                      {language === 'fa' ? 'رنگ دسته‌بندی' : 'Color Tag'}
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSchedColorDropdown(!showSchedColorDropdown)}
                        className="bg-black/30 border border-white/10 h-10 rounded-xl px-2.5 text-white outline-none text-xs sm:text-sm flex items-center justify-between gap-1 w-full"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${newSchedColor.includes('purple') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : newSchedColor.includes('cyan') ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : newSchedColor.includes('amber') ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                          <span className="truncate">{newSchedColor.includes('purple') ? 'Purple' : newSchedColor.includes('cyan') ? 'Blue' : newSchedColor.includes('amber') ? 'Amber' : 'Green'}</span>
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      <AnimatePresence>
                        {showSchedColorDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute z-50 left-0 right-0 mt-1 bg-[#141031] border border-white/10 rounded-lg shadow-2xl overflow-hidden text-xs py-1"
                          >
                            {[
                              { label: 'Purple', val: 'border-purple-500 text-purple-400', bg: 'bg-purple-500' },
                              { label: 'Blue', val: 'border-cyan-500 text-cyan-400', bg: 'bg-cyan-500' },
                              { label: 'Amber', val: 'border-amber-500 text-amber-400', bg: 'bg-amber-500' },
                              { label: 'Green', val: 'border-emerald-500 text-emerald-400', bg: 'bg-emerald-500' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => {
                                  setNewSchedColor(opt.val);
                                  setShowSchedColorDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-white/10 text-slate-200 flex items-center gap-1.5 transition font-sans"
                              >
                                <span className={`w-2 h-2 rounded-full ${opt.bg}`} />
                                <span>{opt.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Inline Pop-up Date Picker Calendar Inside Modal */}
                <div className="bg-black/25 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-purple-400" />
                      <span>
                        {modalCalSys === 'shamsi' 
                          ? `${SHAMSI_MONTH_NAMES[language][modalCalMonth - 1]} ${modalCalYear}`
                          : `${GREGORIAN_MONTH_NAMES[language][modalCalMonth - 1]} ${modalCalYear}`}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* System Switcher */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextSys = modalCalSys === 'shamsi' ? 'miladi' : 'shamsi';
                          setModalCalSys(nextSys);
                          const [gy, gm, gd] = modalSelectedDate.split('-').map(Number);
                          if (nextSys === 'shamsi') {
                            const [jy, jm, jd] = g2j(gy, gm, gd);
                            setModalCalYear(jy);
                            setModalCalMonth(jm);
                          } else {
                            setModalCalYear(gy);
                            setModalCalMonth(gm);
                          }
                        }}
                        className="px-2 py-0.5 text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 rounded font-black transition uppercase"
                      >
                        {modalCalSys === 'shamsi' ? 'Miladi' : 'Shamsi'}
                      </button>
                      
                      {/* Swapped order of next and prev month buttons inside the modal calendar picker */}
                      <button 
                        type="button"
                        onClick={() => {
                          if (modalCalMonth === 12) {
                            setModalCalMonth(1);
                            setModalCalYear(p => p + 1);
                          } else {
                            setModalCalMonth(p => p + 1);
                          }
                        }} 
                        className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition"
                        title={language === 'fa' ? 'ماه بعد' : 'Next Month'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (modalCalMonth === 1) {
                            setModalCalMonth(12);
                            setModalCalYear(p => p - 1);
                          } else {
                            setModalCalMonth(p => p - 1);
                          }
                        }} 
                        className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition"
                        title={language === 'fa' ? 'ماه قبل' : 'Previous Month'}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
                    {WEEKDAYS[language].map((d, i) => <div key={i}>{d}</div>)}
                  </div>

                  {/* Date Numbers inside modal */}
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-slate-300">
                    {(() => {
                      let days = 30;
                      let firstIdx = 0;
                      if (modalCalSys === 'shamsi') {
                        days = getShamsiDaysInMonth(modalCalYear, modalCalMonth);
                        firstIdx = getShamsiFirstDayIndex(modalCalYear, modalCalMonth);
                      } else {
                        days = new Date(modalCalYear, modalCalMonth, 0).getDate();
                        firstIdx = new Date(modalCalYear, modalCalMonth - 1, 1).getDay();
                      }

                      // Selected day detection
                      const [sGy, sGm, sGd] = modalSelectedDate.split('-').map(Number);
                      let isDaySelected = (dayNum: number): boolean => {
                        if (modalCalSys === 'shamsi') {
                          const [jy, jm, jd] = g2j(sGy, sGm, sGd);
                          return jy === modalCalYear && jm === modalCalMonth && jd === dayNum;
                        } else {
                          return sGy === modalCalYear && sGm === modalCalMonth && sGd === dayNum;
                        }
                      };

                      return (
                        <>
                          {Array.from({ length: firstIdx }).map((_, i) => (
                            <div key={`modal-empty-${i}`} className="opacity-0 py-1"></div>
                          ))}
                          {Array.from({ length: days }).map((_, i) => {
                            const dNum = i + 1;
                            const active = isDaySelected(dNum);
                            return (
                              <button
                                key={`modal-day-${dNum}`}
                                type="button"
                                onClick={() => {
                                  if (modalCalSys === 'shamsi') {
                                    handleModalDaySelectShamsi(dNum);
                                  } else {
                                    handleModalDaySelectMiladi(dNum, modalCalYear, modalCalMonth);
                                  }
                                }}
                                className={`py-1 rounded hover:bg-purple-500/20 hover:text-white transition-all font-bold ${
                                  active 
                                    ? 'bg-purple-500 text-white font-extrabold shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
                                    : 'text-slate-300'
                                }`}
                              >
                                {isRtl ? digitsToPersian(dNum) : dNum}
                              </button>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>

                  {/* Summary of selected date in both systems */}
                  <div className="text-xs bg-black/40 border border-white/5 rounded-lg p-2.5 mt-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{language === 'fa' ? 'تاریخ شمسی انتخاب شده:' : 'Selected Shamsi:'}</span>
                      <span className="font-bold text-purple-300 font-sans">
                        {(() => {
                          const [gy, gm, gd] = modalSelectedDate.split('-').map(Number);
                          const [jy, jm, jd] = g2j(gy, gm, gd);
                          const display = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')} (${SHAMSI_MONTH_NAMES[language][jm - 1]})`;
                          return isRtl ? digitsToPersian(display) : display;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{language === 'fa' ? 'تاریخ میلادی انتخاب شده:' : 'Selected Gregorian:'}</span>
                      <span className="font-bold text-cyan-300 font-mono">
                        {modalSelectedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingSchedule(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition text-xs font-bold font-sans"
                >
                  {trans.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleSaveScheduleItem}
                  disabled={!newSchedTitle.trim()}
                  className={`px-4.5 py-2 rounded-xl text-white font-black transition text-xs font-sans ${
                    newSchedTitle.trim() 
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                      : 'bg-purple-800/40 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {editingSchedule 
                    ? (language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes')
                    : trans.addBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. "More" Modal to view ALL schedule events (with search & inline formatting) */}
      <AnimatePresence>
        {showAllEventsModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0d0925]/95 border border-white/10 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative h-[80vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-sans">
                  <Folder className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'fa' ? 'مدیریت و دسترسی به تمام برنامه‌ها' : 'All Planned Events'}</span>
                </h3>
                <button 
                  onClick={() => setShowAllEventsModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Top Filters & Controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
                <input 
                  type="text"
                  placeholder={language === 'fa' ? 'جستجوی برنامه‌ها...' : 'Search study events...'}
                  className="bg-black/40 border border-white/10 h-8.5 rounded-xl px-3 text-xs text-white placeholder-slate-500 outline-none w-full sm:max-w-xs font-sans focus:border-cyan-500/50"
                  onChange={(e) => {
                    // We'll filter directly in rendering block
                    (window as any)._allSchedSearch = e.target.value;
                    setSchedule(prev => [...prev]); // Trigger re-render safely
                  }}
                />
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Drag Lock Button */}
                  <button
                    type="button"
                    onClick={() => setStudyDragLocked(!studyDragLocked)}
                    className={`p-1 px-2.5 text-[10px] border rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer font-sans ${
                      studyDragLocked 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
                    }`}
                    title={studyDragLocked ? (language === 'fa' ? 'باز کردن قفل حرکت' : 'Unlock Dragging') : (language === 'fa' ? 'قفل کردن حرکت' : 'Lock Dragging')}
                  >
                    {studyDragLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{studyDragLocked ? (language === 'fa' ? 'قفل حرکت' : 'Locked') : (language === 'fa' ? 'حرکت آزاد' : 'Unlocked')}</span>
                  </button>

                  {/* Bulk Delete All */}
                  {schedule.length > 0 && (
                    <button
                      onClick={() => {
                        setDeleteConfirm({
                          isOpen: true,
                          type: 'schedule-all',
                          id: 'all',
                          title: language === 'fa' ? 'تمام برنامه‌ها و رویدادهای درسی' : 'All Study Schedule Events'
                        });
                      }}
                      className="p-1 px-2.5 text-[10px] bg-rose-500/20 hover:bg-rose-500/35 text-rose-400 border border-rose-500/30 rounded-lg font-black transition-all flex items-center gap-1 font-sans"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'fa' ? 'حذف کلی' : 'Delete All'}</span>
                    </button>
                  )}

                  {/* Quick Add inside the view all list */}
                  <button
                    onClick={() => {
                      setShowAllEventsModal(false);
                      setEditingSchedule(null);
                      setNewSchedTitle("");
                      setNewSchedDetail("");
                      setStartHour(9);
                      setStartMinute(30);
                      setEndHour(10);
                      setEndMinute(30);
                      setNewSchedColor("border-purple-500 text-purple-400");
                      initModalCalendar(getTodayDateString());
                      setIsAddingSchedule(true);
                    }}
                    className="p-1 px-2.5 text-[10px] bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-black transition-all flex items-center gap-1 font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{trans.addScheduleBtn}</span>
                  </button>
                </div>
              </div>

              {/* Scrollable list of items */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-sm">
                {(() => {
                  const searchTerm = ((window as any)._allSchedSearch || "").toLowerCase();
                  const filtered = schedule.filter(item => {
                    const matchText = (item.title + " " + (item.detail || "")).toLowerCase();
                    return matchText.includes(searchTerm);
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-500 space-y-2 font-sans">
                        <Folder className="w-10 h-10 text-slate-600 opacity-40" />
                        <span className="text-sm">{language === 'fa' ? 'هیچ برنامه‌ای یافت نشد' : 'No planned events found'}</span>
                      </div>
                    );
                  }

                  const sorted = filtered;

                  return sorted.map((item, index) => {
                    const { shamsi, miladi } = getFormattedDateDisplay(item.date || getTodayDateString(), language);
                    const isPassed = isEventTimePassed(item);
                    const isCompleted = item.completed;

                    let cardBgClass = "bg-[#141031]/60";
                    let cardBorderClass = `border-l-4 ${item.color}`;
                    let opacityClass = "";

                    if (isPassed) {
                      if (isCompleted) {
                        cardBgClass = "bg-[#141031]/40";
                        opacityClass = "opacity-60";
                      } else {
                        cardBgClass = "bg-rose-950/10 border-rose-950/25";
                        cardBorderClass = "border-l-4 border-rose-500 text-rose-400";
                      }
                    } else if (isCompleted) {
                      cardBgClass = "bg-[#141031]/40";
                      opacityClass = "opacity-60";
                    }

                    let titleClass = "text-sm font-black leading-tight break-words text-white";

                    if (isPassed) {
                      if (isCompleted) {
                        titleClass = "text-sm font-black leading-tight break-words text-slate-400 line-through decoration-emerald-500 decoration-1.5";
                      } else {
                        titleClass = "text-sm font-black leading-tight break-words text-rose-300/90 line-through decoration-rose-500 decoration-2";
                      }
                    } else if (isCompleted) {
                      titleClass = "text-sm font-black leading-tight break-words text-slate-400 line-through decoration-slate-400";
                    }

                    return (
                      <div 
                        key={item.id}
                        draggable={!studyDragLocked}
                        onDragStart={(e) => {
                          if (studyDragLocked) {
                            e.preventDefault();
                            return;
                          }
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('input')) {
                            e.preventDefault();
                            return;
                          }
                          setDraggedIndex(index);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          if (studyDragLocked) return;
                          if (draggedIndex !== null && draggedIndex !== index) {
                            const draggedItem = sorted[draggedIndex];
                            const targetItem = sorted[index];
                            if (draggedItem && targetItem) {
                              setSchedule(prev => {
                                const fromIdx = prev.findIndex(s => s.id === draggedItem.id);
                                const toIdx = prev.findIndex(s => s.id === targetItem.id);
                                if (fromIdx !== -1 && toIdx !== -1) {
                                  const updated = [...prev];
                                  const [removed] = updated.splice(fromIdx, 1);
                                  updated.splice(toIdx, 0, removed);
                                  return updated;
                                }
                                return prev;
                              });
                            }
                          }
                          setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`${cardBgClass} ${cardBorderClass} ${opacityClass} p-4 rounded-r-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all hover:bg-[#141031]/90 select-none ${studyDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${draggedIndex === index ? 'opacity-40 border-purple-400 border-dashed scale-95' : ''}`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-bold font-mono text-purple-300">
                              {isRtl ? digitsToPersian(item.time) : item.time}
                            </span>
                            <span className="text-xs text-slate-400 font-sans flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{isRtl ? digitsToPersian(shamsi) : miladi}</span>
                            </span>
                            {isPassed && isCompleted && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/25 font-sans">
                                {language === 'fa' ? '✓ انجام شده' : '✓ Completed'}
                              </span>
                            )}
                            {isPassed && !isCompleted && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-500/10 text-rose-400 rounded border border-rose-500/25 font-sans animate-pulse">
                                {language === 'fa' ? '⚠️ منقضی‌شده / انجام نشده' : '⚠️ Overdue / Missed'}
                              </span>
                            )}
                          </div>
                          <h4 className={titleClass}>{item.title}</h4>
                          {item.detail && <p className="text-xs text-slate-400 leading-normal break-words">{item.detail}</p>}
                        </div>
                        
                        {/* Control actions */}
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
                          <button 
                            onClick={() => {
                              setSchedule(prev => prev.map(s => s.id === item.id ? { ...s, completed: !s.completed } : s));
                            }}
                            className={`p-1.5 px-2 rounded-xl border transition flex items-center gap-1 font-sans text-xs font-bold ${item.completed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'}`}
                            title={item.completed ? (language === 'fa' ? 'علامت به عنوان انجام نشده' : 'Mark incomplete') : (language === 'fa' ? 'علامت به عنوان انجام شده' : 'Mark completed')}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{item.completed ? (language === 'fa' ? 'انجام شده' : 'Completed') : (language === 'fa' ? 'انجام' : 'Done')}</span>
                          </button>
                          <button 
                            onClick={() => {
                              setShowAllEventsModal(false);
                              handleEditScheduleItem(item);
                            }}
                            className="p-1.5 px-2 bg-white/5 hover:bg-cyan-500/10 rounded-xl text-cyan-400 border border-white/10 hover:border-cyan-500/20 transition flex items-center gap-1 font-sans text-xs font-bold"
                            title={language === 'fa' ? 'ویرایش' : 'Edit'}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>{language === 'fa' ? 'ویرایش' : 'Edit'}</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteScheduleItem(item.id)}
                            className="p-1.5 px-2 bg-white/5 hover:bg-rose-500/10 rounded-xl text-rose-400 border border-white/10 hover:border-rose-500/20 transition flex items-center gap-1 font-sans text-xs font-bold"
                            title={language === 'fa' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{language === 'fa' ? 'حذف' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="flex justify-end border-t border-white/5 pt-2.5">
                <button
                  onClick={() => {
                    (window as any)._allSchedSearch = ""; // Clear search
                    setShowAllEventsModal(false);
                  }}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition text-xs font-bold font-sans"
                >
                  {language === 'fa' ? 'بستن' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled inline animation rules for waveform */}
      <style>{`
        @keyframes wavePulse {
          0% { height: 12%; }
          100% { height: 90%; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
