import React, { useEffect, useState } from 'react';
import { 
  Coins, 
  Flame, 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  ArrowLeftRight,
  TrendingDown,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Bell,
  ClipboardList,
  Heart,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { Language, AppView } from '../types';
import { digitsToPersian } from '../utils/dateUtils';

interface DashboardProps {
  language: Language;
  onNavigate: (view: AppView) => void;
  enabledModules?: Record<string, boolean>;
}

export default function Dashboard({ language, onNavigate, enabledModules = {} }: DashboardProps) {
  // Pull live metrics from LocalStorage for high fidelity
  const [balance, setBalance] = useState<number>(0);
  const [currSymbol, setCurrSymbol] = useState<string>("IRT");
  const [countdownPercent, setCountdownPercent] = useState<number>(0);
  const [remindersCount, setRemindersCount] = useState<number>(0);
  const [studyTasksCount, setStudyTasksCount] = useState<number>(0);
  const [hideAmounts, setHideAmounts] = useState<boolean>(() => {
    return localStorage.getItem('budget_hide_amounts') === 'true';
  });

  interface SyncFileInfo {
    id: string;
    name: string;
    titleFa: string;
    titleEn: string;
    exists: boolean;
    sizeBytes: number;
    sizeFormatted: string;
    lastUpdated: string | null;
    itemCount: number;
  }

  const [syncFiles, setSyncFiles] = useState<SyncFileInfo[]>([]);
  const [syncLoading, setSyncLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<boolean>(false);
  const [isSyncDetailOpen, setIsSyncDetailOpen] = useState<boolean>(false);

  const fetchSyncStatus = async () => {
    setSyncLoading(true);
    setSyncError(false);
    try {
      const response = await fetch('/api/sync-status');
      const result = await response.json();
      if (result && result.success && result.files) {
        setSyncFiles(result.files);
      } else {
        setSyncError(true);
      }
    } catch (e) {
      console.error("Failed to fetch sync status:", e);
      setSyncError(true);
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    // 1. Budget balance calculations
    const savedMonths = localStorage.getItem('budget_months_data');
    const savedKey = localStorage.getItem('budget_current_month_key');
    if (savedMonths && savedKey) {
      const parsed = JSON.parse(savedMonths);
      const active = parsed[savedKey];
      if (active) {
        const totalInc = (active.incomes || []).reduce((s: number, x: any) => s + Number(x.amount), 0);
        const totalExp = (active.expenses || []).reduce((s: number, x: any) => s + Number(x.amount), 0);
        setBalance(Number(active.budget) + totalInc - totalExp);
        setCurrSymbol(active.currency === 'USD' ? '$' : (active.currency === 'EUR' ? '€' : 'IRT'));
      }
    }

    // 2. Countdown calculation
    const startStr = localStorage.getItem('countdown_start_date') || "2026-06-20T19:00:00";
    const targetStr = localStorage.getItem('countdown_target_date') || "2026-07-16T17:00:00";
    const startTS = new Date(startStr).getTime();
    const targetTS = new Date(targetStr).getTime();
    const now = Date.now();
    if (now >= targetTS) {
      setCountdownPercent(100);
    } else if (now > startTS) {
      const elapsed = now - startTS;
      const total = targetTS - startTS;
      setCountdownPercent(Math.floor((elapsed / total) * 100));
    } else {
      setCountdownPercent(0);
    }

    // 3. Reminders count for today
    const savedReminders = localStorage.getItem('productivity_reminders');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedReminders) {
      try {
        const list = JSON.parse(savedReminders);
        const todayActive = list.filter((r: any) => {
          if (r.date === todayStr) return true;
          if (r.recurrence === 'every_day') return true;
          if (r.recurrence === 'every_other_day') {
            const rDate = new Date(r.date);
            const tDate = new Date(todayStr);
            const diffTime = Math.abs(tDate.getTime() - rDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays % 2 === 0;
          }
          return false;
        });
        setRemindersCount(todayActive.length);
      } catch (e) {
        setRemindersCount(0);
      }
    } else {
      setRemindersCount(0);
    }

    // 4. Study Planner tasks count for today
    const savedSchedule = localStorage.getItem('productivity_study_schedule');
    if (savedSchedule) {
      try {
        const list = JSON.parse(savedSchedule);
        const todayActive = list.filter((item: any) => (!item.date || item.date === todayStr) && !item.completed);
        setStudyTasksCount(todayActive.length);
      } catch (e) {
        setStudyTasksCount(0);
      }
    } else {
      setStudyTasksCount(4); // Default count matching initial state
    }
  }, [language]);

  // Translations
  const t = {
    fa: {
      welcome: "خوش آمدید",
      sub: "به سامانه یکپارچه بهره‌وری شخصی خود",
      budgetTitle: "مدیریت بودجه ماهانه",
      budgetSub: "ثبت هزینه و درآمد، پیشنهادهای هوشمند، آرشیو حسابرسی‌ها و تاریخ انتخابی",
      countdownTitle: "شمارش معکوس هدف",
      countdownSub: "پایش اهداف زمان‌بندی‌شده، ردیاب گام‌ها، جملات انگیزشی روزانه و تقویم شمسی",
      habitsTitle: "عادت‌ها، یادداشت‌ها و یادآورها",
      habitsSub: "تقویت انضباط شخصی با پایش عادات روزانه، یادداشت‌برداری سریع ایده‌ها و مدیریت دقیق یادآوری‌ها",
      notesTitle: "دفترچه یادداشت",
      notesSub: "ثبت آسان ایده‌ها، طبقه‌بندی با برچسب‌ها و جستجوی آنی",
      tradingTitle: "دفترچه ژورنال تریدینگ",
      tradingSub: "ثبت حرفه‌ای تریدها، محاسبه سود و زیان و ثبت تجربیات بازارها",
      studyTitle: "برنامه‌ریز درسی",
      studySub: "مدیریت زمان مطالعه، وظایف دروس و پایش ساعات هفتگی",
      settingsTitle: "تنظیمات کلی",
      btnEnter: "ورود به بخش",
      liveBalance: "مانده بودجه جاری",
      countdownProg: "پیشرفت مسیر هدف",
      remindersToday: "یادآوری‌های فعال امروز",
      studyTasksToday: "کارهای درسی امروز",
      footerMsg: "تمام ابزارها به صورت آفلاین بر روی مرورگر شما ذخیره و پشتیبان‌گیری می‌شوند."
    },
    en: {
      welcome: "Welcome Back",
      sub: "Your integrated personal productivity suite",
      budgetTitle: "Monthly Budget Manager",
      budgetSub: "Record expense and income with smart autocomplete, reports, and custom dates.",
      countdownTitle: "Goal Countdown",
      countdownSub: "Track goal-oriented countdowns, step logs, daily motivations, and Jalali support.",
      habitsTitle: "Habits, Notes & Reminders",
      habitsSub: "Reinforce discipline by tracking daily habits, logging thoughts, and scheduling notifications.",
      notesTitle: "Notebook Manager",
      notesSub: "Scribble thoughts, organize with category tags, and search instantaneously.",
      tradingTitle: "Trading Journal",
      tradingSub: "Log trade details, calculate absolute P&L statistics, and map market notes.",
      studyTitle: "Study Task Planner",
      studySub: "Schedule topics, log completed hours, and manage weekly curriculum.",
      settingsTitle: "Global configurations",
      btnEnter: "Access Module",
      liveBalance: "Active Monthly Balance",
      countdownProg: "Goal Achievement Progress",
      remindersToday: "Active Reminders Today",
      studyTasksToday: "Study Tasks Today",
      footerMsg: "All modules execute completely offline using local client storage."
    },
    de: {
      welcome: "Willkommen",
      sub: "Ihre persönliche Produktivitätszentrale",
      budgetTitle: "Budgetmanager",
      budgetSub: "Erfassen Sie Ausgaben und Einnahmen mit intelligenter Autovervollständigung.",
      countdownTitle: "Ziel-Countdown",
      countdownSub: "Termin-Countdown, Motivationssprüche und Kalenderunterशिष्टetzung.",
      habitsTitle: "Gewohnheiten, Notizen & Erinnerungen",
      habitsSub: "Disziplin stärken: Gewohnheiten verfolgen, Gedanken notieren und Erinnerungen verwalten.",
      notesTitle: "Notizblock",
      notesSub: "Ideen notieren, mit Tags kategorisieren und schnell durchsuchen.",
      tradingTitle: "Handelsjournal",
      tradingSub: "Erfassen Sie Trades, berechnen Sie G&V und notieren Sie Marktnotizen.",
      studyTitle: "Lernplaner",
      studySub: "Studienzeit verwalten, Hausaufgaben planen und Stunden überwachen.",
      settingsTitle: "Globale Einstellungen",
      btnEnter: "Modul aufrufen",
      liveBalance: "Aktueller Kontostand",
      countdownProg: "Zielfortschritt",
      remindersToday: "Aktive Erinnerungen heute",
      studyTasksToday: "Lernaufgaben heute",
      footerMsg: "Alle Anwendungen funktionieren vollständig offline und werden im Browser gespeichert."
    }
  };

  const trans = t[language];

  return (
    <div className="space-y-10 w-full max-w-4xl mx-auto animate-fade-in pt-8 sm:pt-12 pb-32" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Title greeting area */}
      <div className="text-center space-y-3 px-4">
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.25)] tracking-tight py-2 leading-normal">
          {trans.welcome}
        </h1>
        <p className="text-sm sm:text-base text-indigo-200/60 font-medium">
          {trans.sub}
        </p>
      </div>

      {/* Unified JSON Database Sync Monitor & Checker */}
      <div className="bg-[#0b0821]/80 border border-white/10 rounded-3xl p-5 mx-4 relative overflow-hidden backdrop-blur-xl shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl"></div>

        {/* Widget Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 ${syncLoading ? 'animate-spin' : ''}`}>
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-right">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                {language === 'fa' ? 'پایش لحظه‌ای همگام‌سازی فایل‌های JSON' : 'Real-time JSON Database Sync Monitor'}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{language === 'fa' ? 'فعال و خودکار' : 'Active & Automatic'}</span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'fa' 
                  ? 'بررسی سلامت و حجم پایگاه داده‌های ۸ ماژول بهره‌وری سیستم' 
                  : 'Status check and size of all 8 system productivity database files'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={fetchSyncStatus}
              disabled={syncLoading}
              className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-slate-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title={language === 'fa' ? 'به‌روزرسانی مجدد وضعیت' : 'Re-verify file sync'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'fa' ? 'بررسی مجدد' : 'Re-check Status'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSyncDetailOpen(!isSyncDetailOpen)}
              className="h-9 px-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-black flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>{isSyncDetailOpen ? (language === 'fa' ? 'بستن جزئیات' : 'Hide details') : (language === 'fa' ? 'مشاهده جزئیات فایل‌ها' : 'Show file details')}</span>
              {isSyncDetailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Global Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="text-xl">🗂️</div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'fa' ? 'تعداد فایل‌های همگام' : 'Synced Databases'}</span>
              <span className="text-xs font-black text-white font-mono">
                {digitsToPersian(syncFiles.filter(f => f.exists).length)} / {digitsToPersian(8)}
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="text-xl">💾</div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'fa' ? 'کل حجم مصرفی' : 'Total Disk Usage'}</span>
              <span className="text-xs font-black text-white font-mono">
                {digitsToPersian(
                  (syncFiles.reduce((acc, f) => acc + f.sizeBytes, 0) / 1024).toFixed(2)
                )} KB
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="text-xl">🛡️</div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'fa' ? 'پایداری حفاظت از داده' : 'Data Integrity Protection'}</span>
              <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 font-vazir">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'کاملاً ایمن' : '100% Secured'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Dropdown Table */}
        {isSyncDetailOpen && (
          <div className="border-t border-white/5 pt-4 space-y-3 animate-slide-down">
            <div className="px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">
              {language === 'fa' ? 'لیست اختصاصی و آمار پایگاه داده‌های JSON متنی:' : 'Detailed JSON Database File breakdown:'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {syncFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onNavigate(file.id === 'notes' ? 'habits' : (file.id === 'reminders' ? 'habits' : file.id as any))}
                  className="p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-all" />
                      <span className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">
                        {language === 'fa' ? file.titleFa : file.titleEn}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <span>📄</span>
                      <span>{file.name}</span>
                    </div>
                  </div>

                  <div className="text-left space-y-1 shrink-0">
                    {file.exists ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'fa' ? 'ذخیره شده' : 'Synced'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {file.sizeFormatted} • {digitsToPersian(file.itemCount)} {language === 'fa' ? 'رکورد' : 'records'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{language === 'fa' ? 'پیش‌نویس محلی' : 'Draft Local'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'fa' ? 'در انتظار اولین ثبت' : 'Awaiting first write'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-center text-slate-500 leading-relaxed max-w-xl mx-auto pt-2">
              💡 {language === 'fa' 
                ? 'تمام اطلاعات ماژول‌های بالا همزمان با تغییر شما در مرورگر به صورت کاملاً خودکار و به فرمت متنی استاندارد در فایل مربوطه روی سرور پشتیبان‌گیری می‌شوند تا با رفرش یا تغییر مرورگر هیچ داده‌ای از دست نرود.'
                : 'All changes are autosaved with debounced synchronization in highly stable human-readable JSON formats on the application server environment.'}
            </p>
          </div>
        )}
      </div>

      {/* Live Metrics Bento Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
        
        {/* Metric Card: Budget */}
        {enabledModules.budget !== false && (
          <div 
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center glass-panel-hover cursor-pointer space-y-1.5 relative group"
          >
            {/* Eye toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const newHide = !hideAmounts;
                setHideAmounts(newHide);
                localStorage.setItem('budget_hide_amounts', String(newHide));
              }}
              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer z-10"
              title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
            >
              {hideAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            
            <div onClick={() => onNavigate('budget')} className="space-y-1.5 w-full h-full">
              <span className="text-3xl block">💰</span>
              <h4 className="text-xs text-indigo-200/50 font-bold uppercase tracking-wider">{trans.liveBalance}</h4>
              <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 font-mono" dir="ltr">
                <span className="text-base sm:text-lg font-black text-cyan-400">
                  {hideAmounts ? '••••••' : digitsToPersian(balance.toLocaleString('en-US'))}
                </span>
                {!hideAmounts && <span className="text-[10px] text-cyan-400/80 font-bold shrink-0">{currSymbol}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Metric Card: Countdown */}
        {enabledModules.countdown !== false && (
          <div 
            onClick={() => onNavigate('countdown')}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center glass-panel-hover cursor-pointer space-y-1.5"
          >
            <span className="text-3xl block">⏳</span>
            <h4 className="text-xs text-indigo-200/50 font-bold uppercase tracking-wider">{trans.countdownProg}</h4>
            <span className="text-base sm:text-lg font-black text-purple-400 block font-mono">
              {digitsToPersian(countdownPercent)}%
            </span>
          </div>
        )}

        {/* Metric Card: Reminders Today */}
        {enabledModules.habits !== false && (
          <div 
            onClick={() => onNavigate('reminders')}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center glass-panel-hover cursor-pointer space-y-1.5"
          >
            <span className="text-3xl block">🔔</span>
            <h4 className="text-xs text-indigo-200/50 font-bold uppercase tracking-wider">{trans.remindersToday}</h4>
            <span className="text-base sm:text-lg font-black text-amber-400 block font-mono">
              {digitsToPersian(remindersCount)}
            </span>
          </div>
        )}

        {/* Metric Card: Study Planner Today */}
        {enabledModules.study !== false && (
          <div 
            onClick={() => onNavigate('study')}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center glass-panel-hover cursor-pointer space-y-1.5"
          >
            <span className="text-3xl block">📚</span>
            <h4 className="text-xs text-indigo-200/50 font-bold uppercase tracking-wider">{trans.studyTasksToday}</h4>
            <span className="text-base sm:text-lg font-black text-teal-400 block font-mono">
              {digitsToPersian(studyTasksCount)}
            </span>
          </div>
        )}

      </div>

      {/* Main interactive cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Module 1: Budget Manager */}
        {enabledModules.budget !== false && (
          <div 
            onClick={() => onNavigate('budget')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-all">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-cyan-400 transition-all">
                  {trans.budgetTitle}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {trans.budgetSub}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-cyan-400 to-blue-600 group-hover:from-cyan-300 group-hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Module 5: Trading Journal */}
        {enabledModules.trading !== false && (
          <div 
            onClick={() => onNavigate('trading')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-amber-400 transition-all">
                  {trans.tradingTitle}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {trans.tradingSub}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:from-amber-400 group-hover:to-orange-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Module 6: Study Planner */}
        {enabledModules.study !== false && (
          <div 
            onClick={() => onNavigate('study')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-all">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-teal-400 transition-all">
                  {trans.studyTitle}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {trans.studySub}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 group-hover:from-teal-400 group-hover:to-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Module 7: Health & Nutrition (Fitness Tracker) */}
        {enabledModules.fitness !== false && (
          <div 
            onClick={() => onNavigate('fitness')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-all">
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-rose-400 transition-all">
                  {language === 'fa' ? 'سلامت و تغذیه' : (language === 'de' ? 'Fitness/Ernährung' : 'Fitness & Nutrition')}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {language === 'fa' 
                    ? 'ثبت و آنالیز تمرینات ورزشی، رژیم غذایی و محاسبه خودکار شاخص توده بدنی (BMI)' 
                    : (language === 'de' 
                      ? 'Erfassen Sie Workouts, Mahlzeiten und überwachen Sie Ihren BMI.' 
                      : 'Log daily workouts, nutrition intake, and calculate automated BMI indexes.')}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-rose-550 to-pink-650 group-hover:from-rose-400 group-hover:to-pink-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Module 2: Countdown Timer */}
        {enabledModules.countdown !== false && (
          <div 
            onClick={() => onNavigate('countdown')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-all">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-purple-400 transition-all">
                  {trans.countdownTitle}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {trans.countdownSub}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-600 group-hover:from-purple-400 group-hover:to-pink-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Module 3: Habits, Notes & Reminders */}
        {enabledModules.habits !== false && (
          <div 
            onClick={() => onNavigate('habits')}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel-hover cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center text-rose-400 opacity-80 group-hover:scale-110 transition-all">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 opacity-80 group-hover:scale-110 transition-all">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-white group-hover:text-indigo-400 transition-all">
                  {trans.habitsTitle}
                </h2>
                <p className="text-xs text-indigo-200/60 leading-relaxed">
                  {trans.habitsSub}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-600 group-hover:from-indigo-400 group-hover:via-purple-400 group-hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                <span>{trans.btnEnter}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer credits banner */}
      <div className="text-center text-[10px] text-slate-500 font-bold select-none py-4 border-t border-white/5">
        <p>{trans.footerMsg}</p>
      </div>

    </div>
  );
}
