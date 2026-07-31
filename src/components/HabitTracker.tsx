import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Check, Star, Flame, Award, Calendar, CheckSquare, FileText, Bell, ChevronUp, ChevronDown, Pin, Lock, Unlock, Download, Upload } from 'lucide-react';
import { Habit, Language } from '../types';
import { digitsToPersian } from '../utils/dateUtils';
import Notes from './Notes';
import Reminders from './Reminders';

interface HabitTrackerProps {
  language: Language;
}

const COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
  { name: 'cyan', bg: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' },
  { name: 'purple', bg: 'bg-purple-500/20 border-purple-500/30 text-purple-300' },
  { name: 'amber', bg: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
  { name: 'rose', bg: 'bg-rose-500/20 border-rose-500/30 text-rose-300' }
];

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HabitTracker({ language }: HabitTrackerProps) {
  const [activeTab, setActiveTab] = useState<'habits' | 'notes' | 'reminders'>(() => {
    return (localStorage.getItem('habits_active_tab') as 'habits' | 'notes' | 'reminders') || 'habits';
  });

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('productivity_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to defaults
      }
    }
    // Default initial habits
    return [
      { id: 'h-1', name: 'مطالعه روزانه کتاب', color: 'cyan', streak: 3, history: {} },
      { id: 'h-2', name: 'ورزش و پیاده‌روی', color: 'emerald', streak: 5, history: {} },
      { id: 'h-3', name: 'بودجه‌ریزی مالی', color: 'amber', streak: 2, history: {} }
    ];
  });

  const [newHabitName, setNewHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState("cyan");
  const [calendarType, setCalendarType] = useState<'shamsi' | 'gregorian'>(() => {
    return (localStorage.getItem('habits_calendar_type') as 'shamsi' | 'gregorian') || 'shamsi';
  });

  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragLocked, setDragLocked] = useState<boolean>(() => localStorage.getItem('habits_drag_locked') !== 'false');
  
  // Custom Confirmation Modal State
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/habits');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            activeTab: serverActiveTab,
            habits: serverHabits,
            dragLocked: serverDragLocked,
            calendarType: serverCalendarType,
          } = result.data;
          
          if (serverActiveTab) setActiveTab(serverActiveTab);
          if (serverHabits) setHabits(serverHabits);
          if (serverDragLocked !== undefined) setDragLocked(serverDragLocked);
          if (serverCalendarType) setCalendarType(serverCalendarType);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load habits from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  const togglePinHabit = (id: string) => {
    setHabits(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, pinned: !h.pinned } : h);
      const pinned = updated.filter(h => h.pinned);
      const unpinned = updated.filter(h => !h.pinned);
      return [...pinned, ...unpinned];
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setHabits(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === habits.length - 1) return;
    setHabits(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem('habits_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('productivity_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habits_drag_locked', dragLocked ? 'true' : 'false');
  }, [dragLocked]);

  useEffect(() => {
    localStorage.setItem('habits_calendar_type', calendarType);
  }, [calendarType]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/habits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activeTab,
            habits,
            dragLocked,
            calendarType,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save habits data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    activeTab,
    habits,
    dragLocked,
    calendarType,
    isInitialLoaded,
  ]);

  const handleExportHabitsJSON = () => {
    try {
      const isRtl = language === 'fa';
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          activeTab,
          habits,
          dragLocked,
          calendarType
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `habits_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export habits JSON:", error);
    }
  };

  const handleImportHabitsJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isRtl = language === 'fa';
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.habits)) {
          setHabits(parsed.habits);
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
          if (parsed.dragLocked !== undefined) setDragLocked(parsed.dragLocked);
          if (parsed.calendarType) setCalendarType(parsed.calendarType);
          
          alert(isRtl ? "عادت‌ها با موفقیت از فایل JSON بازیابی شدند!" : "Habits successfully restored from JSON backup!");
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

  // Translate days of the week starting from Mon-Sun or Sat-Fri
  const getWeekDays = () => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // Normalize to avoid timezoneDST shifts
    const currentDay = d.getDay(); // 0 (Sun) to 6 (Sat)
    const list = [];

    if (calendarType === 'gregorian') {
      // Monday to Sunday
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(d);
      monday.setDate(d.getDate() + distanceToMonday);
      for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        list.push(day);
      }
    } else {
      // Shamsi (Saturday to Friday)
      const distanceToSaturday = currentDay === 6 ? 0 : -(currentDay + 1);
      const saturday = new Date(d);
      saturday.setDate(d.getDate() + distanceToSaturday);
      for (let i = 0; i < 7; i++) {
        const day = new Date(saturday);
        day.setDate(saturday.getDate() + i);
        list.push(day);
      }
    }
    return list;
  };

  const weekDays = getWeekDays();

  const getDayName = (date: Date) => {
    const daysFA = ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
    const daysEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysDE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    
    const idx = date.getDay();
    if (language === 'fa') return daysFA[idx];
    if (language === 'de') return daysDE[idx];
    return daysEN[idx];
  };

  const handleToggleDay = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const history = { ...h.history };
        const currentlyDone = !!history[dateStr];
        
        if (currentlyDone) {
          delete history[dateStr];
        } else {
          history[dateStr] = true;
        }

        // Recalculate streak properly based on local date
        let streak = 0;
        const checkDate = new Date();
        const todayStr = getLocalDateString(checkDate);
        
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterdayDate);

        // A streak can start from today or yesterday
        let startFrom = checkDate;
        if (!history[todayStr] && history[yesterdayStr]) {
          startFrom = yesterdayDate;
        }

        while (true) {
          const checkStr = getLocalDateString(startFrom);
          if (history[checkStr]) {
            streak++;
            startFrom.setDate(startFrom.getDate() - 1);
          } else {
            break;
          }
        }

        return { ...h, history, streak };
      }
      return h;
    }));
  };

  const handleCreateOrUpdateHabit = () => {
    if (!newHabitName.trim()) return;

    if (editingHabitId) {
      setHabits(prev => prev.map(h => {
        if (h.id === editingHabitId) {
          return {
            ...h,
            name: newHabitName.trim(),
            color: selectedColor
          };
        }
        return h;
      }));
      setEditingHabitId(null);
    } else {
      const item: Habit = {
        id: `h-${Date.now()}`,
        name: newHabitName.trim(),
        color: selectedColor,
        streak: 0,
        history: {}
      };
      setHabits(prev => [...prev, item]);
    }

    setNewHabitName("");
    setSelectedColor("cyan");
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setNewHabitName(habit.name);
    setSelectedColor(habit.color);
  };

  const handleCancelEdit = () => {
    setEditingHabitId(null);
    setNewHabitName("");
    setSelectedColor("cyan");
  };

  const handleDeleteHabitClick = (habit: Habit) => {
    setConfirmPopup({
      isOpen: true,
      title: trans.deleteConfirmTitle,
      message: trans.deleteConfirmMsg.replace('{name}', habit.name),
      onConfirm: () => {
        setHabits(prev => prev.filter(h => h.id !== habit.id));
        if (editingHabitId === habit.id) {
          handleCancelEdit();
        }
        setConfirmPopup(null);
      }
    });
  };

  const t = {
    fa: {
      title: "ردیاب عادات روزانه",
      placeholder: "عادت جدید (مثال: ورزش روزانه)",
      add: "افزودن عادت",
      saveChanges: "ذخیره تغییرات",
      cancel: "انصراف",
      weeklyCount: "این هفته: {count} از ۷ روز",
      noHabits: "هنوز عادتی ثبت نکرده‌اید. همین حالا اولین را بسازید!",
      total: "کل عادت‌ها",
      completedToday: "تکمیل شده امروز",
      habitsTab: "عادت‌ها",
      notesTab: "یادداشت‌ها",
      remindersTab: "یادآوری‌ها",
      calendarType: "نوع تقویم",
      shamsi: "شمسی (شنبه تا جمعه)",
      gregorian: "میلادی (دوشنبه تا یکشنبه)",
      deleteConfirmTitle: "تایید حذف عادت",
      deleteConfirmMsg: "آیا مطمئن هستید که می‌خواهید عادت «{name}» را حذف کنید؟ این عمل غیرقابل بازگشت است.",
      yes: "بله، حذف شود",
      no: "خیر، انصراف"
    },
    en: {
      title: "Daily Habit Tracker",
      placeholder: "New habit name (e.g. Gym workout)",
      add: "Add Habit",
      saveChanges: "Save Changes",
      cancel: "Cancel",
      weeklyCount: "This week: {count} of 7 days",
      noHabits: "No habits added yet. Create your first habit!",
      total: "Total Habits",
      completedToday: "Completed Today",
      habitsTab: "Habit Tracker",
      notesTab: "My Notebook",
      remindersTab: "Reminders",
      calendarType: "Calendar System",
      shamsi: "Solar Shamsi (Sat - Fri)",
      gregorian: "Gregorian (Mon - Sun)",
      deleteConfirmTitle: "Confirm Delete",
      deleteConfirmMsg: "Are you sure you want to delete the habit '{name}'? This action cannot be undone.",
      yes: "Yes, delete",
      no: "No, cancel"
    },
    de: {
      title: "Gewohnheits-Tracker",
      placeholder: "Neue Gewohnheit (z.B. 10k Schritte)",
      add: "Hinzufügen",
      saveChanges: "Änderungen speichern",
      cancel: "Abbrechen",
      weeklyCount: "Diese Woche: {count} von 7 Tagen",
      noHabits: "Noch keine Gewohnheiten. Erstellen Sie Ihre erste!",
      total: "Gewohnheiten gesamt",
      completedToday: "Heute erledigt",
      habitsTab: "Gewohnheiten",
      notesTab: "Notizen",
      remindersTab: "Erinnerungen",
      calendarType: "Kalendersystem",
      shamsi: "Solar Schamsi (Sa - Fr)",
      gregorian: "Gregorianisch (Mo - So)",
      deleteConfirmTitle: "Löschen bestätigen",
      deleteConfirmMsg: "Sind Sie sicher, dass Sie die Gewohnheit '{name}' löschen möchten? Dies kann nicht rückgängig gemacht werden.",
      yes: "Ja, löschen",
      no: "Nein, abbrechen"
    }
  };

  const trans = t[language];
  const todayStr = getLocalDateString(new Date());

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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در habits_data.json' : 'Saved to habits_data.json'}>
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
    <div className="w-full max-w-5xl mx-auto space-y-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Tab Switcher */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 max-w-lg mx-auto justify-between shadow-lg">
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black transition-all ${activeTab === 'habits' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{trans.habitsTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black transition-all ${activeTab === 'notes' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
        >
          <FileText className="w-4 h-4" />
          <span>{trans.notesTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black transition-all ${activeTab === 'reminders' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-white'}`}
        >
          <Bell className="w-4 h-4" />
          <span>{trans.remindersTab}</span>
        </button>
      </div>

      {activeTab === 'notes' ? (
        <Notes language={language} />
      ) : activeTab === 'reminders' ? (
        <Reminders language={language} />
      ) : (
        <div className="space-y-6 px-4">
          {/* Title and Calendar Switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 gap-4 glass-panel">
            <h1 className="text-xl font-black text-cyan-400 flex flex-wrap items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
              <span>{trans.title}</span>
              {getSyncBadge()}
            </h1>

            {/* Action buttons and Calendar Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* JSON Export/Import */}
              <button
                onClick={handleExportHabitsJSON}
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
                  onChange={handleImportHabitsJSON}
                  className="hidden"
                />
              </label>

              {/* Calendar Selector (Gregorian vs Shamsi) */}
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setCalendarType('shamsi')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${calendarType === 'shamsi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow scale-105' : 'text-slate-400 hover:text-white'}`}
                >
                  {trans.shamsi}
                </button>
                <button
                  onClick={() => setCalendarType('gregorian')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${calendarType === 'gregorian' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow scale-105' : 'text-slate-400 hover:text-white'}`}
                >
                  {trans.gregorian}
                </button>
              </div>
            </div>

            <span className="text-xs text-indigo-200/50 font-mono font-bold">
              {digitsToPersian(habits.filter(h => h.history[todayStr]).length)} / {digitsToPersian(habits.length)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left column: Create Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* New/Edit habit form */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 glass-panel">
                <h3 className="text-xs font-bold text-slate-400 block border-b border-white/5 pb-1.5">
                  {editingHabitId ? trans.saveChanges : trans.add}
                </h3>
                
                <input 
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder={trans.placeholder}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm text-white outline-none"
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  {/* Colors */}
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button 
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-7 h-7 rounded-full border transition-all ${c.name === 'emerald' ? 'bg-emerald-500' : c.name === 'cyan' ? 'bg-cyan-500' : c.name === 'purple' ? 'bg-purple-500' : c.name === 'amber' ? 'bg-amber-500' : 'bg-rose-500'} ${selectedColor === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d0723]' : 'opacity-65 hover:opacity-100'}`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {editingHabitId && (
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 sm:flex-initial h-10 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{trans.cancel}</span>
                      </button>
                    )}
                    <button 
                      onClick={handleCreateOrUpdateHabit}
                      className="flex-1 sm:flex-initial h-10 px-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow"
                    >
                      {editingHabitId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingHabitId ? trans.saveChanges : trans.add}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Habits list */}
            <div className="lg:col-span-7 space-y-4">
              {habits.length > 0 && (
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-slate-400">
                    {language === 'fa' ? 'عادت‌های فعال' : 'Active Habits'}
                  </span>
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
                </div>
              )}

              {habits.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">
                  {trans.noHabits}
                </div>
              ) : (
                habits.map((habit, index) => {
                  const completedDaysThisWeek = weekDays.filter(day => {
                    const str = getLocalDateString(day);
                    return !!habit.history[str];
                  }).length;

                  return (
                    <div 
                      key={habit.id}
                      draggable={!dragLocked}
                      onDragStart={(e) => {
                        if (dragLocked) {
                          e.preventDefault();
                          return;
                        }
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('input') || target.closest('label')) {
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
                          setHabits(prev => {
                            const updated = [...prev];
                            const [removed] = updated.splice(draggedIndex, 1);
                            updated.splice(index, 0, removed);
                            return updated;
                          });
                        }
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`bg-[#0e0a29]/40 border rounded-2xl p-4 sm:p-5 glass-panel space-y-4 relative animate-fade-in transition-all duration-300 ${dragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${draggedIndex === index ? 'opacity-40 border-cyan-400 border-dashed scale-95' : habit.pinned ? 'border-cyan-400/50 bg-[#0d1637]/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/25 hover:shadow-lg'}`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-white flex items-center gap-2 select-none">
                            <span className={`w-2.5 h-2.5 rounded-full ${habit.color === 'emerald' ? 'bg-emerald-500' : habit.color === 'cyan' ? 'bg-cyan-500' : habit.color === 'purple' ? 'bg-purple-500' : habit.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            {habit.pinned && <Pin className="w-3.5 h-3.5 text-cyan-400 fill-current shrink-0 rotate-45" />}
                            <span>{habit.name}</span>
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-lg w-fit select-none">
                            <Star className="w-3.5 h-3.5 fill-current text-cyan-400" />
                            <span>{trans.weeklyCount.replace('{count}', String(digitsToPersian(completedDaysThisWeek)))}</span>
                          </div>
                        </div>

                        <div className="flex gap-1 items-center">
                          {/* Pin Button */}
                          <button 
                            onClick={() => togglePinHabit(habit.id)}
                            className={`p-1.5 rounded-lg transition-all ${habit.pinned ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            title={habit.pinned ? (language === 'fa' ? 'برداشتن پین' : 'Unpin Habit') : (language === 'fa' ? 'پین کردن عادت' : 'Pin Habit')}
                          >
                            <Pin className={`w-3.5 h-3.5 ${habit.pinned ? 'fill-current' : ''}`} />
                          </button>

                          {/* Reordering buttons */}
                          <button 
                            onClick={() => handleMoveUp(index)}
                            disabled={dragLocked || index === 0}
                            className={`p-1.5 rounded-lg transition-all ${dragLocked || index === 0 ? 'opacity-20 cursor-not-allowed text-slate-500' : 'text-cyan-400 hover:bg-white/5 hover:text-cyan-300'}`}
                            title={language === 'fa' ? 'انتقال به بالا' : 'Move Up'}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleMoveDown(index)}
                            disabled={dragLocked || index === habits.length - 1}
                            className={`p-1.5 rounded-lg transition-all ${dragLocked || index === habits.length - 1 ? 'opacity-20 cursor-not-allowed text-slate-500' : 'text-cyan-400 hover:bg-white/5 hover:text-cyan-300'}`}
                            title={language === 'fa' ? 'انتقال به پایین' : 'Move Down'}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          <button 
                            onClick={() => handleEditHabit(habit)}
                            className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all"
                            title={trans.saveChanges}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteHabitClick(habit)}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 7 Day grid checklist */}
                      <div className="grid grid-cols-7 gap-2 pt-2 border-t border-white/5">
                        {weekDays.map((day) => {
                          const str = getLocalDateString(day);
                          const isDone = !!habit.history[str];
                          const isToday = str === todayStr;

                          return (
                            <button 
                              key={str}
                              onClick={() => handleToggleDay(habit.id, str)}
                              className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${isDone ? 'bg-gradient-to-b from-cyan-400 to-blue-600 border-none text-black font-bold transform scale-105' : 'bg-black/30 border-white/10 text-slate-400 hover:border-cyan-400/20'} ${isToday ? 'ring-1 ring-cyan-400 ring-offset-1 ring-offset-[#0d0723]' : ''}`}
                              title={day.toLocaleDateString()}
                            >
                              <span className="text-[10px] font-bold block mb-1 opacity-80">
                                {getDayName(day).slice(0, 3)}
                              </span>
                              
                              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                               ) : (
                                  <span className="text-xs font-mono font-bold">
                                    {digitsToPersian(day.getDate())}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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
                {trans.yes}
              </button>
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs transition-all"
              >
                {trans.no}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
