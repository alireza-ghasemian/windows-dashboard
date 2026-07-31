import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Calendar, Clock, Bell, RotateCcw, Check, X, Pin, Lock, Unlock, ChevronDown, Download, Upload } from 'lucide-react';
import { Reminder, Language } from '../types';
import { digitsToPersian, g2j, j2g, isJalaliLeap, SHAMSI_MONTH_NAMES, GREGORIAN_MONTH_NAMES } from '../utils/dateUtils';

interface RemindersProps {
  language: Language;
}

export default function Reminders({ language }: RemindersProps) {
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('productivity_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [pastReminders, setPastReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('productivity_past_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState("12:00");
  const [recurrence, setRecurrence] = useState<'once' | 'every_day' | 'every_other_day'>('once');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragLocked, setDragLocked] = useState<boolean>(() => localStorage.getItem('reminders_drag_locked') !== 'false');

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/reminders');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            reminders: serverReminders,
            pastReminders: serverPastReminders,
            dragLocked: serverDragLocked,
          } = result.data;
          
          if (serverReminders) setReminders(serverReminders);
          if (serverPastReminders) setPastReminders(serverPastReminders);
          if (serverDragLocked !== undefined) setDragLocked(serverDragLocked);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load reminders from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  const [inputCalendar, setInputCalendar] = useState<'shamsi' | 'miladi'>(language === 'fa' ? 'shamsi' : 'miladi');
  const [shamsiYear, setShamsiYear] = useState<number>(() => {
    const today = new Date();
    const [jy] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return jy;
  });
  const [shamsiMonth, setShamsiMonth] = useState<number>(() => {
    const today = new Date();
    const [, jm] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return jm;
  });
  const [shamsiDay, setShamsiDay] = useState<number>(() => {
    const today = new Date();
    const [, , jd] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return jd;
  });

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const getShamsiDaysInMonth = (jy: number, jm: number) => {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isJalaliLeap(jy) ? 30 : 29;
  };

  const syncShamsiToGregorian = (jy: number, jm: number, jd: number) => {
    try {
      const [gy, gm, gd] = j2g(jy, jm, jd);
      const dateStr = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
      setDate(dateStr);
    } catch (e) {}
  };

  // Custom confirmation popup state
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('productivity_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('reminders_drag_locked', dragLocked ? 'true' : 'false');
  }, [dragLocked]);

  useEffect(() => {
    localStorage.setItem('productivity_past_reminders', JSON.stringify(pastReminders));
  }, [pastReminders]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminders,
            pastReminders,
            dragLocked,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save reminders data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [reminders, pastReminders, dragLocked, isInitialLoaded]);

  // Migrate active "once" reminders that are past to "past reminders" automatically
  useEffect(() => {
    const migratePast = () => {
      const now = new Date();
      let changed = false;
      const active: Reminder[] = [];
      const newlyPast: Reminder[] = [];

      reminders.forEach(r => {
        if (r.recurrence === 'once') {
          const [ry, rm, rd] = r.date.split('-').map(Number);
          const [rh, rmin] = r.time.split(':').map(Number);
          const targetDate = new Date(ry, rm - 1, rd, rh, rmin);
          if (now.getTime() > targetDate.getTime()) {
            newlyPast.push(r);
            changed = true;
          } else {
            active.push(r);
          }
        } else {
          active.push(r);
        }
      });

      if (changed) {
        setReminders(active);
        setPastReminders(prev => {
          const filteredNewlyPast = newlyPast.filter(np => !prev.some(p => p.id === np.id));
          return [...filteredNewlyPast, ...prev];
        });
      }
    };

    migratePast();
    const interval = setInterval(migratePast, 5000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleSaveReminder = () => {
    if (!title.trim()) return;

    let finalDate = date;
    if (inputCalendar === 'shamsi') {
      try {
        const [gy, gm, gd] = j2g(shamsiYear, shamsiMonth, shamsiDay);
        finalDate = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
      } catch (e) {}
    }

    if (editingId) {
      setReminders(prev => prev.map(r => {
        if (r.id === editingId) {
          return {
            ...r,
            title: title.trim(),
            description: description.trim() || undefined,
            date: finalDate,
            time,
            recurrence,
            calendar: inputCalendar
          };
        }
        return r;
      }));
      setEditingId(null);
    } else {
      const newReminder: Reminder = {
        id: `rem-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        date: finalDate,
        time,
        recurrence,
        calendar: inputCalendar
      };
      setReminders(prev => [newReminder, ...prev]);
    }

    // Reset Form
    setTitle("");
    setDescription("");
    const todayStr = new Date().toISOString().split('T')[0];
    setDate(todayStr);
    setTime("12:00");
    setRecurrence('once');
    setInputCalendar(language === 'fa' ? 'shamsi' : 'miladi');
    const today = new Date();
    const [jy, jm, jd] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setShamsiYear(jy);
    setShamsiMonth(jm);
    setShamsiDay(jd);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleDeletePastReminder = (id: string) => {
    setPastReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAllPast = () => {
    setPastReminders([]);
  };

  const togglePinReminder = (id: string) => {
    setReminders(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, pinned: !r.pinned } : r);
      const pinned = updated.filter(r => r.pinned);
      const unpinned = updated.filter(r => !r.pinned);
      return [...pinned, ...unpinned];
    });
  };

  const handleEditReminder = (r: Reminder) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description || "");
    setDate(r.date);
    setTime(r.time);
    setRecurrence(r.recurrence);
    
    const cal = r.calendar || (language === 'fa' ? 'shamsi' : 'miladi');
    setInputCalendar(cal);
    
    try {
      const [gy, gm, gd] = r.date.split('-').map(Number);
      const [jy, jm, jd] = g2j(gy, gm, gd);
      setShamsiYear(jy);
      setShamsiMonth(jm);
      setShamsiDay(jd);
    } catch (e) {}
  };

  const getJalaliDisplayStr = (gregDate: string) => {
    try {
      const [gy, gm, gd] = gregDate.split('-').map(Number);
      const [jy, jm, jd] = g2j(gy, gm, gd);
      return `${digitsToPersian(jy)}/${digitsToPersian(String(jm).padStart(2, '0'))}/${digitsToPersian(String(jd).padStart(2, '0'))} (${SHAMSI_MONTH_NAMES[language][jm - 1]})`;
    } catch (e) {
      return gregDate;
    }
  };

  const getGregorianDisplayStr = (gregDate: string) => {
    try {
      const [gy, gm, gd] = gregDate.split('-').map(Number);
      return `${gy}/${String(gm).padStart(2, '0')}/${String(gd).padStart(2, '0')} (${GREGORIAN_MONTH_NAMES[language][gm - 1]})`;
    } catch (e) {
      return gregDate;
    }
  };

  const t = {
    fa: {
      title: "مدیریت یادآوری‌ها",
      addReminder: "ثبت یادآوری جدید",
      editReminder: "ویرایش یادآوری",
      reminderTitle: "عنوان یادآوری",
      reminderDesc: "توضیحات (اختیاری)",
      date: "تاریخ",
      time: "زمان یادآوری",
      recurrence: "نوع تکرار",
      once: "فقط یکبار",
      everyDay: "هر روز",
      everyOtherDay: "یک روز در میان",
      save: "ذخیره یادآوری",
      cancel: "لغو",
      noReminders: "هیچ یادآوری فعالی ثبت نشده است.",
      activeReminders: "یادآوری‌های فعال",
      recurrenceLabel: "تکرار: ",
      pastReminders: "یادآوری‌های گذشته",
      clearAllPast: "حذف همه گذشته‌ها",
      confirmClearAll: "آیا از حذف تمامی یادآوری‌های گذشته مطمئن هستید؟",
      yes: "بله، مطمئنم",
      no: "خیر، انصراف",
      deleteConfirm: "آیا مطمئنید؟",
      noPastReminders: "هیچ یادآوری گذشته‌ای وجود ندارد.",
      deleteActiveTitle: "تایید حذف یادآوری",
      deleteActiveMsg: "آیا مطمئن هستید که می‌خواهید یادآوری فعال «{title}» را حذف کنید؟",
      deletePastTitle: "تایید حذف تاریخچه",
      deletePastMsg: "آیا مطمئن هستید که می‌خواهید یادآوری گذشته «{title}» را از تاریخچه حذف کنید؟",
      clearAllPastTitle: "پاکسازی کل آرشیو یادآوری‌ها",
      clearAllPastMsg: "آیا مطمئن هستید که می‌خواهید کل یادآوری‌های گذشته را حذف کنید؟ این عمل غیرقابل بازگشت است."
    },
    en: {
      title: "Reminders Manager",
      addReminder: "Create New Reminder",
      editReminder: "Edit Reminder",
      reminderTitle: "Reminder Title",
      reminderDesc: "Description (Optional)",
      date: "Date",
      time: "Time",
      recurrence: "Recurrence",
      once: "Once only",
      everyDay: "Every day",
      everyOtherDay: "Every other day",
      save: "Save Reminder",
      cancel: "Cancel",
      noReminders: "No active reminders scheduled.",
      activeReminders: "Active Reminders",
      recurrenceLabel: "Recurrence: ",
      pastReminders: "Past Reminders",
      clearAllPast: "Clear All Past",
      confirmClearAll: "Are you sure you want to clear all past reminders?",
      yes: "Yes, I'm sure",
      no: "No, cancel",
      deleteConfirm: "Delete?",
      noPastReminders: "No past reminders.",
      deleteActiveTitle: "Delete Active Reminder",
      deleteActiveMsg: "Are you sure you want to delete the active reminder '{title}'?",
      deletePastTitle: "Delete Past Reminder",
      deletePastMsg: "Are you sure you want to delete the past reminder '{title}' from history?",
      clearAllPastTitle: "Clear All Past Reminders",
      clearAllPastMsg: "Are you sure you want to clear all past reminders? This action cannot be undone."
    },
    de: {
      title: "Erinnerungen verwalten",
      addReminder: "Neue Erinnerung erstellen",
      editReminder: "Erinnerung bearbeiten",
      reminderTitle: "Titel",
      reminderDesc: "Beschreibung (Optional)",
      date: "Datum",
      time: "Uhrzeit",
      recurrence: "Wiederholung",
      once: "Nur einmal",
      everyDay: "Jeden Tag",
      everyOtherDay: "Alle zwei Tage",
      save: "Speichern",
      cancel: "Abbrechen",
      noReminders: "Keine aktiven Erinnerungen geplant.",
      activeReminders: "Aktive Erinnerungen",
      recurrenceLabel: "Wiederholung: ",
      pastReminders: "Vergangene Erinnerungen",
      clearAllPast: "Alle vergangenen löschen",
      confirmClearAll: "Sind Sie sicher, dass Sie alle vergangenen Erinnerungen löschen möchten?",
      yes: "Ja, ich bin sicher",
      no: "Nein, abbrechen",
      deleteConfirm: "Löschen?",
      noPastReminders: "Keine vergangenen Erinnerungen.",
      deleteActiveTitle: "Aktive Erinnerung löschen",
      deleteActiveMsg: "Sind Sie sicher, dass Sie die aktive Erinnerung '{title}' löschen möchten?",
      deletePastTitle: "Vergangene Erinnerung löschen",
      deletePastMsg: "Sind Sie sicher, dass Sie die vergangene Erinnerung '{title}' aus dem Verlauf löschen möchten?",
      clearAllPastTitle: "Alle vergangenen Erinnerungen löschen",
      clearAllPastMsg: "Sind Sie sicher, dass Sie alle vergangenen Erinnerungen löschen möchten? Dies kann nicht rückgängig gemacht werden."
    }
  }[language];

  const handleDeleteReminderClick = (r: Reminder) => {
    setConfirmPopup({
      isOpen: true,
      title: t.deleteActiveTitle,
      message: t.deleteActiveMsg.replace('{title}', r.title),
      onConfirm: () => {
        handleDeleteReminder(r.id);
        setConfirmPopup(null);
      }
    });
  };

  const handleDeletePastReminderClick = (r: Reminder) => {
    setConfirmPopup({
      isOpen: true,
      title: t.deletePastTitle,
      message: t.deletePastMsg.replace('{title}', r.title),
      onConfirm: () => {
        handleDeletePastReminder(r.id);
        setConfirmPopup(null);
      }
    });
  };

  const handleClearAllPastClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: t.clearAllPastTitle,
      message: t.clearAllPastMsg,
      onConfirm: () => {
        handleClearAllPast();
        setConfirmPopup(null);
      }
    });
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در reminders_data.json' : 'Saved to reminders_data.json'}>
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

  const handleExportRemindersJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          reminders,
          pastReminders,
          dragLocked
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `reminders_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export reminders JSON:", error);
    }
  };

  const handleImportRemindersJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.reminders)) {
          setReminders(parsed.reminders);
          if (Array.isArray(parsed.pastReminders)) setPastReminders(parsed.pastReminders);
          if (parsed.dragLocked !== undefined) setDragLocked(parsed.dragLocked);
          
          setConfirmPopup({
            isOpen: true,
            title: language === 'fa' ? "بازیابی موفق" : "Restore Successful",
            message: language === 'fa' ? "یادآوری‌ها با موفقیت از فایل JSON بازیابی و همگام‌سازی شدند!" : "Reminders have been successfully restored from JSON file!",
            onConfirm: () => setConfirmPopup(null)
          });
        } else {
          setConfirmPopup({
            isOpen: true,
            title: language === 'fa' ? "خطا در بازیابی" : "Restore Error",
            message: language === 'fa' ? "ساختار فایل پشتیبان نامعتبر است." : "Invalid backup file structure.",
            onConfirm: () => setConfirmPopup(null)
          });
        }
      } catch (err) {
        setConfirmPopup({
          isOpen: true,
          title: language === 'fa' ? "خطا در خواندن فایل" : "File Read Error",
          message: language === 'fa' ? "خواندن فایل با خطا مواجه شد." : "An error occurred while parsing the file.",
          onConfirm: () => setConfirmPopup(null)
        });
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 gap-4 glass-panel">
        <h1 className="text-xl font-black text-cyan-400 flex flex-wrap items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
          <span>{t.title}</span>
          {getSyncBadge()}
        </h1>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportRemindersJSON}
            className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'fa' ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>{language === 'fa' ? 'خروجی JSON' : 'Export JSON'}</span>
          </button>

          <label className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>{language === 'fa' ? 'وارد کردن JSON' : 'Import JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportRemindersJSON}
              className="hidden"
            />
          </label>

          <span className="text-xs text-indigo-200/50 font-mono font-bold shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            {digitsToPersian(reminders.length + pastReminders.length)} {language === 'fa' ? 'مورد' : 'Reminders'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Add/Edit Reminder */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
          <h2 className="text-sm font-bold text-cyan-400 border-b border-white/5 pb-2">
            {editingId ? t.editReminder : t.addReminder}
          </h2>

          <div className="space-y-4">
            {/* Title field */}
            <div className="space-y-1">
              <label className="text-xs text-indigo-200/70 font-bold block">{t.reminderTitle}</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'fa' ? "مثال: مصرف قرص‌ها" : "e.g., Take vitamins"}
                className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm text-white outline-none transition-all"
              />
            </div>

            {/* Description field */}
            <div className="space-y-1">
              <label className="text-xs text-indigo-200/70 font-bold block">{t.reminderDesc}</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'fa' ? "توضیحات بیشتر یادآوری..." : "Details of reminder..."}
                className="w-full h-20 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-sm text-white outline-none resize-none transition-all"
              />
            </div>

            {/* Calendar System Switcher */}
            <div className="space-y-1">
              <label className="text-xs text-indigo-200/70 font-bold block">
                {language === 'fa' ? 'نوع تقویم' : 'Calendar System'}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setInputCalendar('shamsi');
                    try {
                      const [gy, gm, gd] = date.split('-').map(Number);
                      const [jy, jm, jd] = g2j(gy, gm, gd);
                      setShamsiYear(jy);
                      setShamsiMonth(jm);
                      setShamsiDay(jd);
                    } catch (e) {}
                  }}
                  className={`py-1.5 rounded-lg text-xs font-black transition-all ${inputCalendar === 'shamsi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold shadow scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
                >
                  {language === 'fa' ? 'شمسی' : 'Shamsi'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputCalendar('miladi');
                    try {
                      const [gy, gm, gd] = j2g(shamsiYear, shamsiMonth, shamsiDay);
                      setDate(`${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`);
                    } catch (e) {}
                  }}
                  className={`py-1.5 rounded-lg text-xs font-black transition-all ${inputCalendar === 'miladi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold shadow scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
                >
                  {language === 'fa' ? 'میلادی' : 'Gregorian'}
                </button>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold block">{t.date}</label>
                {inputCalendar === 'miladi' ? (
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      try {
                        const [gy, gm, gd] = e.target.value.split('-').map(Number);
                        const [jy, jm, jd] = g2j(gy, gm, gd);
                        setShamsiYear(jy);
                        setShamsiMonth(jm);
                        setShamsiDay(jd);
                      } catch (err) {}
                    }}
                    className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm text-white outline-none transition-all cursor-pointer"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Shamsi Year Select */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setYearDropdownOpen(!yearDropdownOpen);
                          setMonthDropdownOpen(false);
                          setDayDropdownOpen(false);
                        }}
                        className="w-full h-11 px-2.5 rounded-xl bg-[#160d35]/60 border border-white/10 text-white text-xs flex items-center justify-between transition hover:border-cyan-400 font-vazir text-right cursor-pointer"
                      >
                        <span className="truncate">{digitsToPersian(shamsiYear)}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>

                      {yearDropdownOpen && (
                        <div className="absolute top-12 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-fade-in">
                          {Array.from({ length: 15 }, (_, i) => {
                            const today = new Date();
                            const [currJy] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
                            const yVal = currJy - 2 + i;
                            return (
                              <button
                                key={yVal}
                                type="button"
                                onClick={() => {
                                  setShamsiYear(yVal);
                                  const maxDays = getShamsiDaysInMonth(yVal, shamsiMonth);
                                  const newDay = shamsiDay > maxDays ? maxDays : shamsiDay;
                                  if (newDay !== shamsiDay) setShamsiDay(newDay);
                                  syncShamsiToGregorian(yVal, shamsiMonth, newDay);
                                  setYearDropdownOpen(false);
                                }}
                                className={`w-full text-right px-2.5 py-2 text-xs rounded-lg hover:bg-[#160d35] hover:text-white transition-all ${shamsiYear === yVal ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {digitsToPersian(yVal)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Shamsi Month Select */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setMonthDropdownOpen(!monthDropdownOpen);
                          setYearDropdownOpen(false);
                          setDayDropdownOpen(false);
                        }}
                        className="w-full h-11 px-2.5 rounded-xl bg-[#160d35]/60 border border-white/10 text-white text-xs flex items-center justify-between transition hover:border-cyan-400 font-vazir text-right cursor-pointer"
                      >
                        <span className="truncate">
                          {language === 'fa' ? SHAMSI_MONTH_NAMES.fa[shamsiMonth - 1] : SHAMSI_MONTH_NAMES.en[shamsiMonth - 1]}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>

                      {monthDropdownOpen && (
                        <div className="absolute top-12 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-fade-in">
                          {Array.from({ length: 12 }, (_, i) => {
                            const mVal = i + 1;
                            const mLabel = language === 'fa' ? SHAMSI_MONTH_NAMES.fa[i] : SHAMSI_MONTH_NAMES.en[i];
                            return (
                              <button
                                key={mVal}
                                type="button"
                                onClick={() => {
                                  setShamsiMonth(mVal);
                                  const maxDays = getShamsiDaysInMonth(shamsiYear, mVal);
                                  const newDay = shamsiDay > maxDays ? maxDays : shamsiDay;
                                  if (newDay !== shamsiDay) setShamsiDay(newDay);
                                  syncShamsiToGregorian(shamsiYear, mVal, newDay);
                                  setMonthDropdownOpen(false);
                                }}
                                className={`w-full text-right px-2.5 py-2 text-xs rounded-lg hover:bg-[#160d35] hover:text-white transition-all ${shamsiMonth === mVal ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {mLabel}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Shamsi Day Select */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setDayDropdownOpen(!dayDropdownOpen);
                          setYearDropdownOpen(false);
                          setMonthDropdownOpen(false);
                        }}
                        className="w-full h-11 px-2.5 rounded-xl bg-[#160d35]/60 border border-white/10 text-white text-xs flex items-center justify-between transition hover:border-cyan-400 font-vazir text-right cursor-pointer"
                      >
                        <span className="truncate">{digitsToPersian(shamsiDay)}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>

                      {dayDropdownOpen && (
                        <div className="absolute top-12 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-fade-in">
                          {Array.from({ length: getShamsiDaysInMonth(shamsiYear, shamsiMonth) }, (_, i) => {
                            const dVal = i + 1;
                            return (
                              <button
                                key={dVal}
                                type="button"
                                onClick={() => {
                                  setShamsiDay(dVal);
                                  syncShamsiToGregorian(shamsiYear, shamsiMonth, dVal);
                                  setDayDropdownOpen(false);
                                }}
                                className={`w-full text-right px-2.5 py-2 text-xs rounded-lg hover:bg-[#160d35] hover:text-white transition-all ${shamsiDay === dVal ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {digitsToPersian(dVal)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold block">{t.time}</label>
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm text-white outline-none transition-all cursor-pointer animate-fade-in"
                />
              </div>
            </div>

            {/* Recurrence Selection - Modern Segmented Button Tabs */}
            <div className="space-y-2">
              <label className="text-xs text-indigo-200/70 font-bold block">{t.recurrence}</label>
              <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setRecurrence('once')}
                  className={`py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${recurrence === 'once' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold shadow scale-105' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.once}
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence('every_day')}
                  className={`py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${recurrence === 'every_day' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold shadow scale-105' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.everyDay}
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence('every_other_day')}
                  className={`py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${recurrence === 'every_other_day' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold shadow scale-105' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.everyOtherDay}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSaveReminder}
                disabled={!title.trim()}
                className="flex-1 h-11 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>{t.save}</span>
              </button>

              {editingId && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                    const todayStr = new Date().toISOString().split('T')[0];
                    setDate(todayStr);
                    setTime("12:00");
                    setRecurrence('once');
                    setInputCalendar(language === 'fa' ? 'shamsi' : 'miladi');
                    const today = new Date();
                    const [jy, jm, jd] = g2j(today.getFullYear(), today.getMonth() + 1, today.getDate());
                    setShamsiYear(jy);
                    setShamsiMonth(jm);
                    setShamsiDay(jd);
                  }}
                  className="h-11 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Lists of Reminders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Reminders */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold text-slate-400">
                {t.activeReminders}
              </h2>
              {reminders.length > 0 && (
                <button
                  onClick={() => setDragLocked(!dragLocked)}
                  className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs font-bold transition-all ${dragLocked ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20'}`}
                  title={dragLocked ? (language === 'fa' ? 'غیرفعال کردن قفل جابه‌جایی' : 'Unlock Dragging') : (language === 'fa' ? 'فعال کردن قفل جابه‌جایی' : 'Lock Dragging')}
                >
                  {dragLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>
                    {dragLocked 
                      ? (language === 'fa' ? 'قفل حرکت' : 'Locked') 
                      : (language === 'fa' ? 'حرکت آزاد' : 'Unlocked')}
                  </span>
                </button>
              )}
            </div>

            {reminders.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-xs text-slate-400 glass-panel">
                {t.noReminders}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {reminders.map((r, index) => (
                  <div 
                    key={r.id}
                    draggable={!dragLocked}
                    onDragStart={(e) => {
                      if (dragLocked) {
                        e.preventDefault();
                        return;
                      }
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('textarea')) {
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
                      if (dragLocked) return;
                      if (draggedIndex !== null && draggedIndex !== index) {
                        setReminders(prev => {
                          const updated = [...prev];
                          const [removed] = updated.splice(draggedIndex, 1);
                          updated.splice(index, 0, removed);
                          return updated;
                        });
                      }
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`bg-[#0e0a29]/40 border ${r.pinned ? 'border-cyan-400/50 bg-[#0d1637]/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10'} hover:border-cyan-400/20 rounded-2xl p-4 flex justify-between items-start gap-4 transition-all glass-panel ${dragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${draggedIndex === index ? 'opacity-40 border-cyan-400 border-dashed scale-95' : ''}`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5 select-none">
                        {r.pinned && <Pin className="w-3.5 h-3.5 text-cyan-400 fill-current shrink-0 rotate-45" />}
                        <span>{r.title}</span>
                      </h3>
                      {r.description && (
                        <p className="text-xs text-indigo-200/60 leading-relaxed select-none">{r.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[11px] text-slate-400 border-t border-white/5 select-none">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {(r.calendar || (language === 'fa' ? 'shamsi' : 'miladi')) === 'shamsi'
                              ? getJalaliDisplayStr(r.date)
                              : getGregorianDisplayStr(r.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{digitsToPersian(r.time)}</span>
                        </div>

                        <div className="text-purple-400 font-bold">
                          <span>{t.recurrenceLabel}</span>
                          <span className="underline">
                            {r.recurrence === 'once' ? t.once : r.recurrence === 'every_day' ? t.everyDay : r.recurrence === 'every_other_day' ? t.everyOtherDay : t.once}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0 items-center">
                      <button 
                        onClick={() => togglePinReminder(r.id)}
                        className={`p-2 hover:bg-white/10 rounded-xl transition-all ${r.pinned ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        title={r.pinned ? (language === 'fa' ? 'برداشتن پین' : 'Unpin') : (language === 'fa' ? 'پین کردن' : 'Pin')}
                      >
                        <Pin className={`w-3.5 h-3.5 ${r.pinned ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleEditReminder(r)}
                        className="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteReminderClick(r)}
                        className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Reminders (یادآوری‌های گذشته) */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold text-slate-500">
                {t.pastReminders}
              </h2>
              {pastReminders.length > 0 && (
                <button
                  onClick={handleClearAllPastClick}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearAllPast}</span>
                </button>
              )}
            </div>

            {pastReminders.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-xs text-slate-500">
                {t.noPastReminders}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 opacity-60">
                {pastReminders.map((r) => (
                  <div 
                    key={r.id}
                    className="bg-[#0e0a29]/20 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex justify-between items-start gap-4 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-black text-slate-400 line-through">{r.title}</h3>
                      {r.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[11px] text-slate-500 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {(r.calendar || (language === 'fa' ? 'shamsi' : 'miladi')) === 'shamsi'
                              ? getJalaliDisplayStr(r.date)
                              : getGregorianDisplayStr(r.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{digitsToPersian(r.time)}</span>
                        </div>

                        <div className="text-slate-500 font-bold">
                          <span>{t.recurrenceLabel}</span>
                          <span className="underline">
                            {r.recurrence === 'once' ? t.once : r.recurrence === 'every_day' ? t.everyDay : r.recurrence === 'every_other_day' ? t.everyOtherDay : t.once}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0 items-center">
                      <button 
                        onClick={() => handleDeletePastReminderClick(r)}
                        className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING CONFIRMATION OVERLAY POPUP */}
      {confirmPopup?.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#120826] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-fade-in animate-pop">
            <h3 className="text-base font-black text-rose-500 flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{confirmPopup.title}</span>
            </h3>
            <p className="text-xs text-indigo-200/70 leading-relaxed">{confirmPopup.message}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  confirmPopup.onConfirm();
                  setConfirmPopup(null);
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs transition-all shadow-lg"
              >
                {t.yes}
              </button>
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs transition-all"
              >
                {t.no}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
