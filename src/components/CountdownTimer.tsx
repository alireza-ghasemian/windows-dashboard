import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Sliders, 
  X, 
  SlidersHorizontal, 
  Trash2, 
  Check, 
  Edit3, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Award,
  Plus,
  Minus,
  Download,
  Upload
} from 'lucide-react';
import { Language } from '../types';
import { 
  g2j, 
  j2g, 
  isJalaliLeap, 
  SHAMSI_MONTH_NAMES, 
  GREGORIAN_MONTH_NAMES, 
  digitsToPersian 
} from '../utils/dateUtils';

// System default dates (Fallback)
const DEFAULT_START = "2026-06-20T19:00:00";
const DEFAULT_TARGET = "2026-07-16T17:00:00";

const quotes = [
  "هر شروع تازه چالش‌برانگیز است، اما تصمیم تو برای قوی بودن، شکوهمند است.\nEvery new beginning is tough, but your decision to be strong is magnificent.\nJedes neue Anfang ist schwer, aber deine Entscheidung, stark zu sein, ist großartig.",
  "فشار بیرونی موقتی است؛ پایداری ذهن توست که سرنوشت را می‌نویسد.\nExternal pressure is temporary; it is your mind's resilience that writes destiny.\nÄußerer Druck ist vorübergehend; die Widerstandskraft deines Geistes schreibt das Schicksal.",
  "رنج امروز، سازندهٔ قدرت بی‌همتای فرداست. ادامه بده.\nToday's pain is the architect of tomorrow's unique strength. Keep moving.\nDer Schmerz von heute ist der Architekt der einzigartigen Stärke von morgen. Geh weiter.",
  "شجاعت یعنی ادامه دادن در سکوت، حتی وقتی کسی تماشاچی تو نیست.\nCourage is continuing in silence, even when nobody is watching you.\nMut bedeutet, im Stillen weiterzubachen, auch wenn dir niemand zusieht.",
  "حتی تاریک‌ترین شب‌ها نیز در برابر نور ارادهٔ انسان فرو می‌پاشند.\nEven the darkest nights crumble before the light of human will.\nSelbst die dunklen Nächte zerfallen vor dem Licht des menschlichen Willens.",
  "گام‌های کوچک و مداوم، مسیرهای بزرگ را مغلوب خود می‌کنند.\nSmall and consistent steps conquer the greatest paths.\nKleine und beständige Schritte erobern die größten Wege.",
  "آنها تلاش کردند تو را بشکنند، اما متوجه نشدند تو از فولاد ساخته شده‌ای.\nThey tried to break you, but they didn't realize you are made of steel.\nSie haben versucht dich zu brechen, aber sie wussten nicht, dass du aus Stahl bist.",
  "انضباط شخصی یعنی انتخاب بین لذت‌های آنی و افتخارات جاودانی.\nSelf-discipline is choosing between instant pleasures and eternal triumphs.\nSelbstdisziplin ist die Wahl zwischen sofortigem Vergnügen und ewigem Triumph.",
  "چشمانت را به خط پایان بدوز و بگذار هیاهوی مسیر محو شود.\nKeep your eyes on the finish line and let the noise of the path fade away.\nBehalte das Ziel im Auge und lass den Lärm des Weges verblassen.",
  "تو مسدود نشده‌ای، بلکه در حال پی‌ریزی یک بنای باشکوه هستی.\nYou are not blocked, you are laying the foundation of a magnificent structure.\nDu bist nicht blockiert, du legst das Fundament für ein großartiges Bauwerk.",
  "طوفان می‌گذرد و آنچه باقی می‌ماند، قدرت ریشه‌های توست.\nThe storm passes, and what remains is the strength of your roots.\nDer Sturm geht vorbei, und was bleibt, ist die Stärke deiner Wurzeln.",
  "برای پیروز شدن در زندگی، ابتدا باید ذهن خود را تسخیر کنی.\nTo conquer life, you must first conquer your own mind.\nUm das Leben zu erobern, musst du zuerst deinen eigenen Geist erobern."
];

interface CountdownTimerProps {
  language: Language;
}

export default function CountdownTimer({ language }: CountdownTimerProps) {
  // Configured date states loaded from LocalStorage
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    return localStorage.getItem('countdown_start_date') || DEFAULT_START;
  });
  const [targetDateStr, setTargetDateStr] = useState<string>(() => {
    return localStorage.getItem('countdown_target_date') || DEFAULT_TARGET;
  });

  // Customized title states
  const [mainTitle, setMainTitle] = useState(() => {
    return localStorage.getItem('countdown_main_title') || (language === 'fa' ? "شمارش معکوس هدف" : "Goal Countdown");
  });
  const [mainSubtitle, setMainSubtitle] = useState(() => {
    return localStorage.getItem('countdown_main_subtitle') || (language === 'fa' ? "تا لحظهٔ دست‌یابی به هدف و موفقیت نهایی" : "Until the sweet moment of achieving your goal");
  });
  const [trackerTitle, setTrackerTitle] = useState(() => {
    return localStorage.getItem('countdown_tracker_title') || (language === 'fa' ? "نقشهٔ گام‌های موفقیت" : "Steps to Success Map");
  });

  // Edit states for inline titles
  const [isEditingTitles, setIsEditingTitles] = useState(false);

  // Settings custom calendar picker states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [calendarType, setCalendarType] = useState<'jalali' | 'gregorian'>(() => {
    return (localStorage.getItem('countdown_calendar_type') as 'jalali' | 'gregorian') || 'jalali';
  });
  const [pickingTarget, setPickingTarget] = useState<'start' | 'target'>('start');

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/countdown');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            startDateStr: serverStart,
            targetDateStr: serverTarget,
            mainTitle: serverTitle,
            mainSubtitle: serverSubtitle,
            trackerTitle: serverTracker,
            calendarType: serverCalendarType,
          } = result.data;
          
          if (serverStart) setStartDateStr(serverStart);
          if (serverTarget) setTargetDateStr(serverTarget);
          if (serverTitle) setMainTitle(serverTitle);
          if (serverSubtitle) setMainSubtitle(serverSubtitle);
          if (serverTracker) setTrackerTitle(serverTracker);
          if (serverCalendarType) setCalendarType(serverCalendarType);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load countdown from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/countdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDateStr,
            targetDateStr,
            mainTitle,
            mainSubtitle,
            trackerTitle,
            calendarType,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save countdown data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    startDateStr,
    targetDateStr,
    mainTitle,
    mainSubtitle,
    trackerTitle,
    calendarType,
    isInitialLoaded,
  ]);

  const handleExportCountdownJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          startDateStr,
          targetDateStr,
          mainTitle,
          mainSubtitle,
          trackerTitle,
          calendarType
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `countdown_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export countdown JSON:", error);
    }
  };

  const handleImportCountdownJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.startDateStr && parsed.targetDateStr) {
          setStartDateStr(parsed.startDateStr);
          setTargetDateStr(parsed.targetDateStr);
          if (parsed.mainTitle) setMainTitle(parsed.mainTitle);
          if (parsed.mainSubtitle) setMainSubtitle(parsed.mainSubtitle);
          if (parsed.trackerTitle) setTrackerTitle(parsed.trackerTitle);
          if (parsed.calendarType) setCalendarType(parsed.calendarType);
          
          alert(language === 'fa' ? "شمارش معکوس با موفقیت از فایل JSON بازیابی شد!" : "Countdown successfully restored from JSON backup!");
        } else {
          alert(language === 'fa' ? "ساختار فایل پشتیبان نامعتبر است." : "Invalid backup file structure.");
        }
      } catch (err) {
        alert(language === 'fa' ? "خواندن فایل با خطا مواجه شد." : "An error occurred while parsing the file.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };
  
  // Local calendar view parameters
  const [viewYear, setViewYear] = useState(1405);
  const [viewMonth, setViewMonth] = useState(1);
  const [pickerHour, setPickerHour] = useState(19);
  const [pickerMinute, setPickerMinute] = useState(0);

  // Buffer timestamps
  const [tempStartTS, setTempStartTS] = useState<number>(0);
  const [tempTargetTS, setTempTargetTS] = useState<number>(0);

  // Active live ticker calculations
  const [now, setNow] = useState<number>(Date.now());
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);
  const [circlesPage, setCirclesPage] = useState(0);

  useEffect(() => {
    setTempStartTS(new Date(startDateStr).getTime());
    setTempTargetTS(new Date(targetDateStr).getTime());
  }, [startDateStr, targetDateStr]);

  // Master countdown clock ticker loop
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage
  const saveConfiguration = (start: string, target: string) => {
    localStorage.setItem('countdown_start_date', start);
    localStorage.setItem('countdown_target_date', target);
    setStartDateStr(start);
    setTargetDateStr(target);
  };

  const saveTitles = (title: string, subtitle: string, tracker: string) => {
    localStorage.setItem('countdown_main_title', title);
    localStorage.setItem('countdown_main_subtitle', subtitle);
    localStorage.setItem('countdown_tracker_title', tracker);
    setMainTitle(title);
    setMainSubtitle(subtitle);
    setTrackerTitle(tracker);
  };

  // Dual countdown state flags
  const startTS = new Date(startDateStr).getTime();
  const targetTS = new Date(targetDateStr).getTime();
  const isWaitingToStart = now < startTS;
  const isCompleted = now >= targetTS;

  const activeDifference = isWaitingToStart ? (startTS - now) : (targetTS - now);
  const totalDuration = targetTS - startTS;

  // Convert difference to standard units
  const daysLeft = Math.floor(activeDifference / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((activeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((activeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((activeDifference % (1000 * 60)) / 1000);

  // Total days span
  const dayDifference = totalDuration / (1000 * 60 * 60 * 24);
  const totalDays = Math.max(1, Math.ceil(dayDifference));
  const passedDays = isWaitingToStart ? -1 : Math.floor((now - startTS) / (1000 * 60 * 60 * 24));

  // Overall percentage
  const elapsed = now - startTS;
  const overallProgress = isWaitingToStart ? 0 : Math.max(0, Math.min((elapsed / totalDuration) * 100, 100));

  const pageSize = 30;
  const totalPages = Math.ceil(totalDays / pageSize);

  useEffect(() => {
    if (passedDays >= 0 && passedDays < totalDays) {
      setCirclesPage(Math.floor(passedDays / pageSize));
    } else {
      setCirclesPage(0);
    }
  }, [passedDays, totalDays]);

  // Format quotes split by newline for FA/EN/DE
  const formatQuoteText = (raw: string) => {
    const lines = raw.split('\n');
    if (language === 'fa') return lines[0] || lines[1] || lines[2];
    if (language === 'de') return lines[2] || lines[1] || lines[0];
    return lines[1] || lines[0] || lines[2];
  };

  const activeQuoteIndex = passedDays < 0 ? 0 : (passedDays % quotes.length);
  const activeQuote = quotes[selectedQuoteIndex !== null ? selectedQuoteIndex : activeQuoteIndex];

  // Calendar render functions
  useEffect(() => {
    if (showSettingsModal) {
      const activeTime = (pickingTarget === 'start') ? tempStartTS : tempTargetTS;
      const d = new Date(activeTime);
      if (calendarType === 'jalali') {
        const j = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
        setViewYear(j[0]);
        setViewMonth(j[1]);
      } else {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth() + 1);
      }
      setPickerHour(d.getHours());
      setPickerMinute(d.getMinutes());
    }
  }, [pickingTarget, calendarType, showSettingsModal]);

  const handleDaySelect = (dayNum: number) => {
    let finalD: Date;
    if (calendarType === 'jalali') {
      const g = j2g(viewYear, viewMonth, dayNum);
      finalD = new Date(g[0], g[1] - 1, g[2], pickerHour, pickerMinute, 0);
    } else {
      finalD = new Date(viewYear, viewMonth - 1, dayNum, pickerHour, pickerMinute, 0);
    }

    if (pickingTarget === 'start') {
      setTempStartTS(finalD.getTime());
      setPickingTarget('target');
    } else {
      setTempTargetTS(finalD.getTime());
    }
  };

  const handleTimeChange = (type: 'h' | 'm', change: number) => {
    let h = pickerHour;
    let m = pickerMinute;
    if (type === 'h') {
      h = (h + change + 24) % 24;
      setPickerHour(h);
    } else {
      m = (m + change + 60) % 60;
      setPickerMinute(m);
    }

    const currentActiveTS = (pickingTarget === 'start') ? tempStartTS : tempTargetTS;
    const updated = new Date(currentActiveTS);
    updated.setHours(h, m, 0, 0);

    if (pickingTarget === 'start') {
      setTempStartTS(updated.getTime());
    } else {
      setTempTargetTS(updated.getTime());
    }
  };

  const saveModalSettings = () => {
    if (tempTargetTS <= tempStartTS) {
      alert(language === 'fa' ? "تاریخ پایان هدف نمی‌تواند قبل یا همزمان با تاریخ شروع باشد!" : "End date must be after start date!");
      return;
    }
    saveConfiguration(new Date(tempStartTS).toISOString(), new Date(tempTargetTS).toISOString());
    localStorage.setItem('countdown_calendar_type', calendarType);
    setShowSettingsModal(false);
  };

  // Build grid blocks
  const daysArray = Array.from({ length: totalDays }, (_, i) => i);

  // Calendar rendering helper values
  let daysInMonth = 30;
  let firstDayIndex = 0;
  if (calendarType === 'jalali') {
    if (viewMonth <= 6) daysInMonth = 31;
    else if (viewMonth <= 11) daysInMonth = 30;
    else daysInMonth = isJalaliLeap(viewYear) ? 30 : 29;

    const gFirst = j2g(viewYear, viewMonth, 1);
    const firstDate = new Date(gFirst[0], gFirst[1] - 1, gFirst[2]);
    firstDayIndex = (firstDate.getDay() + 1) % 7; // Saturday first alignment
  } else {
    daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDate = new Date(viewYear, viewMonth - 1, 1);
    firstDayIndex = firstDate.getDay(); // Sunday first alignment
  }

  const calDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getDayTimestamp = (dNum: number) => {
    if (calendarType === 'jalali') {
      const g = j2g(viewYear, viewMonth, dNum);
      return new Date(g[0], g[1] - 1, g[2]).getTime();
    }
    return new Date(viewYear, viewMonth - 1, dNum).getTime();
  };

  const isSelectedCalendarDay = (dNum: number) => {
    const activeTS = (pickingTarget === 'start') ? tempStartTS : tempTargetTS;
    const dateObj = new Date(activeTS);
    if (calendarType === 'jalali') {
      const j = g2j(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());
      return j[0] === viewYear && j[1] === viewMonth && j[2] === dNum;
    } else {
      return dateObj.getFullYear() === viewYear && (dateObj.getMonth() + 1) === viewMonth && dateObj.getDate() === dNum;
    }
  };

  const isSecondaryCalendarDay = (dNum: number) => {
    const secondaryTS = (pickingTarget === 'start') ? tempTargetTS : tempStartTS;
    const dateObj = new Date(secondaryTS);
    if (calendarType === 'jalali') {
      const j = g2j(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());
      return j[0] === viewYear && j[1] === viewMonth && j[2] === dNum;
    } else {
      return dateObj.getFullYear() === viewYear && (dateObj.getMonth() + 1) === viewMonth && dateObj.getDate() === dNum;
    }
  };

  // Convert standard date string to shamsi display
  const formatTSDisplay = (ts: number) => {
    const d = new Date(ts);
    const pad = (v: number) => String(v).padStart(2, '0');
    if (calendarType === 'jalali') {
      const j = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
      return `${digitsToPersian(j[0])}/${digitsToPersian(pad(j[1]))}/${digitsToPersian(pad(j[2]))} (${digitsToPersian(pad(d.getHours()))}:${digitsToPersian(pad(d.getMinutes()))})`;
    }
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} (${pad(d.getHours())}:${pad(d.getMinutes())})`;
  };

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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در countdown_data.json' : 'Saved to countdown_data.json'}>
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
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Header and Controls Buttons */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 glass-panel">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {language === 'fa' ? "سیستم پایش زمان هوشمند" : "LIVE MONITORING ACTIVE"}
            </span>
          </div>
          {getSyncBadge()}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportCountdownJSON}
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
              onChange={handleImportCountdownJSON}
              className="hidden"
            />
          </label>

          <button 
            onClick={() => {
              if (isEditingTitles) {
                saveTitles(mainTitle, mainSubtitle, trackerTitle);
              }
              setIsEditingTitles(!isEditingTitles);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isEditingTitles ? 'bg-emerald-500 text-white shadow' : 'bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10'}`}
            title="Edit titles text"
          >
            {isEditingTitles ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-9 h-9 bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-xl flex items-center justify-center transition-all"
            title="Calendar settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Countdown Card view */}
      <div className="bg-[#0e092b]/40 border border-white/10 rounded-3xl p-6 sm:p-8 glass-panel relative overflow-hidden">
        
        {/* Dynamic completed layout overlay */}
        {isCompleted ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              {language === 'fa' ? "تبریک! هدف شما محقق شد 🎉" : "Congratulations! Goal Achieved 🎉"}
            </h1>
            <p className="text-xs text-indigo-200/70 leading-relaxed px-4">
              {language === 'fa' 
                ? "دورهٔ زمانی شما با موفقیت پایان یافت. اکنون به هدف ارزشمند خود دست یافته‌اید!" 
                : "Your targeted course completed successfully. You have now reached your valuable goal!"}
            </p>
            <button 
              onClick={() => {
                const s = new Date().toISOString();
                const t = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                saveConfiguration(s, t);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition-all"
            >
              {language === 'fa' ? "آغاز یک دوره جدید" : "Start a New Target"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Titles (Inline editable) */}
            <div className="text-center space-y-2">
              {isEditingTitles ? (
                <div className="space-y-3 px-4">
                  <input 
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full text-center text-sm font-black text-white px-3 py-1.5 shake-edit"
                    placeholder="Main Title"
                  />
                  <input 
                    type="text"
                    value={mainSubtitle}
                    onChange={(e) => setMainSubtitle(e.target.value)}
                    className="w-full text-center text-xs text-slate-300 px-3 py-1 shake-edit"
                    placeholder="Subtitle"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                    {mainTitle}
                  </h1>
                  <p className="text-xs text-indigo-200/50">
                    {isWaitingToStart ? (language === 'fa' ? "زمان باقی‌مانده تا شروع رسمی مسیر" : "Time until official start") : mainSubtitle}
                  </p>
                </>
              )}
            </div>

            {/* Glowing Time counter tiles */}
            <div className="grid grid-cols-4 gap-2.5 select-none" dir="ltr">
              
              {/* Unit: Days */}
              <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center hover:border-cyan-400/20 transition-all">
                <span className="block text-2xl font-black text-white font-mono tracking-wider">
                  {digitsToPersian(String(daysLeft).padStart(2, '0'))}
                </span>
                <span className="block text-xs text-slate-300 uppercase tracking-widest font-bold mt-1">
                  {language === 'fa' ? "روز" : "Days"}
                </span>
              </div>

              {/* Unit: Hours */}
              <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center hover:border-cyan-400/20 transition-all">
                <span className="block text-2xl font-black text-white font-mono tracking-wider">
                  {digitsToPersian(String(hoursLeft).padStart(2, '0'))}
                </span>
                <span className="block text-xs text-slate-300 uppercase tracking-widest font-bold mt-1">
                  {language === 'fa' ? "ساعت" : "Hours"}
                </span>
              </div>

              {/* Unit: Minutes */}
              <div className="bg-white/5 border border-white/5 rounded-2xl py-3 text-center hover:border-cyan-400/20 transition-all">
                <span className="block text-2xl font-black text-white font-mono tracking-wider">
                  {digitsToPersian(String(minutesLeft).padStart(2, '0'))}
                </span>
                <span className="block text-xs text-slate-300 uppercase tracking-widest font-bold mt-1">
                  {language === 'fa' ? "دقیقه" : "Minutes"}
                </span>
              </div>

              {/* Unit: Seconds (Highlighted Cyan Glow) */}
              <div className={`rounded-2xl py-3 text-center border transition-all ${isWaitingToStart ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]' : 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.08)]'}`}>
                <span className={`block text-2xl font-black font-mono tracking-wider ${isWaitingToStart ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {digitsToPersian(String(secondsLeft).padStart(2, '0'))}
                </span>
                <span className={`block text-xs uppercase tracking-widest font-bold mt-1 ${isWaitingToStart ? 'text-amber-400/80' : 'text-cyan-400/80'}`}>
                  {language === 'fa' ? "ثانیه" : "Seconds"}
                </span>
              </div>

            </div>

            {/* Sleek Progress bar with Percentage */}
            <div className="space-y-2">
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isWaitingToStart ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse' : 'bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]'}`}
                  style={{ width: `${isWaitingToStart ? 100 : overallProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center px-1 text-xs text-slate-300 font-bold">
                <span>
                  {language === 'fa' ? "آغاز:" : "Start:"} {formatTSDisplay(startTS).split(' ')[0]}
                </span>
                <span className={`font-mono font-bold ${isWaitingToStart ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                  {isWaitingToStart ? (language === 'fa' ? "در انتظار شروع" : "Pending Start") : `${digitsToPersian(Math.floor(overallProgress))}%`}
                </span>
              </div>
            </div>

            {/* Interactive Daily Motivational Message card */}
            <div className="relative group p-4 bg-white/5 border border-white/5 hover:border-cyan-400/20 rounded-2xl space-y-2.5 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                  <span>{language === 'fa' ? "الهام‌بخش روزانه موفقیت" : "DAILY GOAL MOTIVATION"}</span>
                </span>
                
                <span className="text-xs text-slate-400 font-bold">
                  {language === 'fa' ? "کلیک روی گام‌ها برای تغییر متن" : "Click dots below to change"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-vazir text-justify">
                {formatQuoteText(activeQuote)}
              </p>
            </div>

            {/* Steps Tracking dot matrix grid */}
            <div className="border-t border-white/5 pt-5 space-y-3">
              <div className="flex justify-between items-center">
                {isEditingTitles ? (
                  <input 
                    type="text"
                    value={trackerTitle}
                    onChange={(e) => setTrackerTitle(e.target.value)}
                    className="text-xs font-black text-white py-1 shake-edit w-1/2"
                  />
                ) : (
                  <h3 className="text-xs font-black text-indigo-200/70">{trackerTitle}</h3>
                )}

                <div className="flex items-center gap-1.5">
                  {totalDays > 30 && (
                    <div className="flex items-center gap-1 bg-black/30 border border-white/5 rounded-lg px-1.5 py-0.5" dir="ltr">
                      <button
                        type="button"
                        onClick={() => setCirclesPage(prev => Math.max(0, prev - 1))}
                        disabled={circlesPage === 0}
                        className="p-1 hover:bg-white/10 text-cyan-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all"
                        title={language === 'fa' ? 'صفحه قبل' : 'Previous Page'}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-slate-400 font-mono font-bold px-1 select-none">
                        {digitsToPersian(circlesPage + 1)} / {digitsToPersian(totalPages)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCirclesPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={circlesPage === totalPages - 1}
                        className="p-1 hover:bg-white/10 text-cyan-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all"
                        title={language === 'fa' ? 'صفحه بعد' : 'Next Page'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-full font-bold">
                    {isWaitingToStart ? (language === 'fa' ? "شروع نشده" : "Not Started") : `${language === 'fa' ? 'گام' : 'Step'} ${digitsToPersian(Math.min(passedDays + 1, totalDays))} ${language === 'fa' ? 'از' : 'of'} ${digitsToPersian(totalDays)}`}
                  </span>
                </div>
              </div>

              {/* Nodes grid */}
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {daysArray.slice(circlesPage * 30, (circlesPage + 1) * 30).map((dayIdx) => {
                  let cellStyle = "bg-white/5 border-white/5 text-slate-500";
                  let isCurrent = false;

                  if (isWaitingToStart) {
                    cellStyle = "bg-white/5 border-white/5 text-slate-600";
                  } else if (dayIdx < passedDays) {
                    cellStyle = "bg-gradient-to-r from-cyan-400 to-purple-500 border-none text-black font-black";
                  } else if (dayIdx === passedDays) {
                    cellStyle = "bg-cyan-400/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.25)] animate-pulse";
                    isCurrent = true;
                  } else {
                    cellStyle = "bg-white/5 border-white/5 hover:border-purple-500/30 text-slate-500";
                  }

                  const isActiveSelected = selectedQuoteIndex === dayIdx;

                  return (
                    <button 
                      key={dayIdx}
                      onClick={() => {
                        setSelectedQuoteIndex(dayIdx);
                      }}
                      className={`aspect-square w-full rounded-full flex items-center justify-center text-[10px] font-mono border transition-all ${cellStyle} ${isActiveSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0e092b] transform scale-110' : 'hover:scale-105 active:scale-95'}`}
                      title={`${language === 'fa' ? 'روز' : 'Day'} ${dayIdx + 1}`}
                    >
                      <span>{digitsToPersian(dayIdx + 1)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* DETAILED DATE/CALENDAR EDIT SETTINGS DRAWER OVERLAY */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#10082c]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative my-auto">
            
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>

            <h2 className="text-lg font-black text-cyan-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>{language === 'fa' ? 'تنظیمات شخصی مانیتورینگ' : 'Personal Monitoring Settings'}</span>
            </h2>

            {/* Jalali / Gregorian Toggle switch */}
            <div className="grid grid-cols-2 bg-black/40 border border-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setCalendarType('jalali')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${calendarType === 'jalali' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                {language === 'fa' ? 'تقویم هجری شمسی' : 'Jalali Solar'}
              </button>
              <button 
                onClick={() => setCalendarType('gregorian')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${calendarType === 'gregorian' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                {language === 'fa' ? 'تقویم میلادی' : 'Gregorian'}
              </button>
            </div>

            {/* Target picker switcher tabs */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setPickingTarget('start')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${pickingTarget === 'start' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-400'}`}
              >
                {language === 'fa' ? 'تنظیم تاریخ آغاز' : 'Set Start Date'}
              </button>
              <button
                onClick={() => setPickingTarget('target')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${pickingTarget === 'target' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' : 'text-slate-400'}`}
              >
                {language === 'fa' ? 'تنظیم نقطه هدف' : 'Set Target Date'}
              </button>
            </div>

            {/* Calendar grid view */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4">
              
              {/* Month navigation */}
              <div className="flex justify-between items-center gap-2">
                <button 
                  onClick={() => {
                    let m = viewMonth - 1;
                    let y = viewYear;
                    if (m < 1) {
                      m = 12;
                      y--;
                    }
                    setViewMonth(m);
                    setViewYear(y);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <span className="text-xs font-black text-white">
                  {calendarType === 'jalali' ? SHAMSI_MONTH_NAMES[language][viewMonth - 1] : GREGORIAN_MONTH_NAMES[language][viewMonth - 1]} {digitsToPersian(viewYear)}
                </span>

                <button 
                  onClick={() => {
                    let m = viewMonth + 1;
                    let y = viewYear;
                    if (m > 12) {
                      m = 1;
                      y++;
                    }
                    setViewMonth(m);
                    setViewYear(y);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500">
                {calendarType === 'jalali' ? (
                  ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => <span key={d}>{d}</span>)
                ) : (
                  ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)
                )}
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1">
                {paddingArray.map((_, idx) => <div key={idx} />)}
                {calDaysArray.map((dNum) => {
                  const isSel = isSelectedCalendarDay(dNum);
                  const isSec = isSecondaryCalendarDay(dNum);
                  
                  let cellClass = "bg-white/5 text-slate-200 border-white/5";
                  if (isSel) {
                    cellClass = "bg-gradient-to-r from-cyan-400 to-blue-600 border-none text-white font-bold";
                  } else if (isSec) {
                    cellClass = "bg-purple-500/10 border-purple-500/30 text-purple-300";
                  }

                  return (
                    <button 
                      key={dNum}
                      onClick={() => handleDaySelect(dNum)}
                      className={`aspect-square w-full rounded-full flex items-center justify-center text-[10px] font-bold border transition-all hover:scale-110 active:scale-95 ${cellClass}`}
                    >
                      {digitsToPersian(dNum)}
                    </button>
                  );
                })}
              </div>

              {/* Hour/Minute selection widgets */}
              <div className="border-t border-white/5 pt-3 mt-2 space-y-2">
                <span className="block text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'fa' ? 'تنظیم دقیق زمان' : 'Time Selection'}</span>
                </span>

                <div className="flex items-center justify-center gap-4">
                  {/* Minutes */}
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden" title={language === 'fa' ? 'دقیقه' : 'Minute'}>
                    <button 
                      onClick={() => handleTimeChange('m', -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-black text-cyan-400">
                      {digitsToPersian(String(pickerMinute).padStart(2, '0'))}
                    </span>
                    <button 
                      onClick={() => handleTimeChange('m', 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-slate-400 font-bold">:</span>

                  {/* Hours */}
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden" title={language === 'fa' ? 'ساعت' : 'Hour'}>
                    <button 
                      onClick={() => handleTimeChange('h', -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-black text-cyan-400">
                      {digitsToPersian(String(pickerHour).padStart(2, '0'))}
                    </span>
                    <button 
                      onClick={() => handleTimeChange('h', 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Display formatted values */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1 text-[11px] font-bold">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'fa' ? 'آغاز مسیر:' : 'Start Date:'}</span>
                <span className="text-cyan-400 font-mono">{formatTSDisplay(tempStartTS)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'fa' ? 'پایان مسیر هدف:' : 'Target Date:'}</span>
                <span className="text-cyan-400 font-mono">{formatTSDisplay(tempTargetTS)}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={saveModalSettings}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs shadow-lg transition-all"
              >
                {language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'}
              </button>
              <button 
                onClick={() => {
                  setTempStartTS(new Date(DEFAULT_START).getTime());
                  setTempTargetTS(new Date(DEFAULT_TARGET).getTime());
                }}
                className="py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-xl text-xs font-bold transition-all"
              >
                {language === 'fa' ? 'پیش‌فرض' : 'Reset'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
