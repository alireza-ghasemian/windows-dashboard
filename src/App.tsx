import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Coins, 
  Flame, 
  CheckSquare, 
  FileText, 
  TrendingUp, 
  BookOpen, 
  Languages,
  ChevronDown,
  Menu,
  X,
  Bell,
  Volume2,
  VolumeX,
  Trash2,
  Check,
  AlertCircle,
  Heart
} from 'lucide-react';
import { AppView, Language, AppNotification, Reminder } from './types';
import Dashboard from './components/Dashboard';
import BudgetManager from './components/BudgetManager';
import CountdownTimer from './components/CountdownTimer';
import HabitTracker from './components/HabitTracker';
import TradingJournal from './components/TradingJournal';
import StudyPlanner from './components/StudyPlanner';
import FitnessTracker from './components/FitnessTracker';
import TopAudioBar from './components/TopAudioBar';
import { digitsToPersian } from './utils/dateUtils';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import AuthPage from './components/AuthPage';
import { backupUserData, restoreUserData, clearLocalStorageForLogout, UserProfile } from './utils/authUtils';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalTimeHoursMinutes = (d: Date) => {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function App() {
  // Multi-user Authentication states
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    let savedId = localStorage.getItem('currentUserId');
    if (!savedId) {
      savedId = 'guest';
      localStorage.setItem('currentUserId', 'guest');
      
      // Also make sure 'guest' exists in the users record
      const usersStr = localStorage.getItem('users') || '{}';
      try {
        const users = JSON.parse(usersStr);
        if (!users['guest']) {
          users['guest'] = {
            id: 'guest',
            username: 'guest',
            email: 'guest@example.com',
            fullName: 'کاربر مهمان',
            avatar: '👤',
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('users', JSON.stringify(users));
        }
      } catch (e) {}
    }
    return savedId;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const userSwitcherRef = useRef<HTMLDivElement>(null);

  // Confirmation Modals States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Account Switching Security states
  const [switchTargetUser, setSwitchTargetUser] = useState<UserProfile | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [forgetTargetUser, setForgetTargetUser] = useState<UserProfile | null>(null);

  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('productivity_enabled_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      budget: true,
      trading: true,
      study: true,
      fitness: true,
      countdown: true,
      habits: true,
    };
  });

  const handleToggleModule = (key: string) => {
    const updated = {
      ...enabledModules,
      [key]: !enabledModules[key]
    };
    setEnabledModules(updated);
    localStorage.setItem('productivity_enabled_modules', JSON.stringify(updated));

    // Redirect to dashboard if active view gets disabled
    if (currentView === key && !updated[key]) {
      setCurrentView('dashboard');
    }
  };

  const [currentView, setCurrentView] = useState<AppView>(() => {
    return (localStorage.getItem('productivity_active_view') as AppView) || 'dashboard';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('productivity_language') as Language) || 'fa';
  });

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMenuOpen] = useState(false);

  // Notification System States
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('productivity_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('productivity_notification_sound');
    return saved !== 'false';
  });

  const [soundType, setSoundType] = useState<string>(() => {
    return localStorage.getItem('productivity_notification_sound_type') || 'chime';
  });

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('productivity_active_view', currentView);
    setMenuOpen(false);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('productivity_language', language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('productivity_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('productivity_notification_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('productivity_notification_sound_type', soundType);
  }, [soundType]);

  // Sync notifications from other components (like Fitness Tracker)
  useEffect(() => {
    const handleSyncNotifs = () => {
      const saved = localStorage.getItem('productivity_notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
          playChime();
        } catch (e) {}
      }
    };
    window.addEventListener('sync-notifications', handleSyncNotifs);
    return () => window.removeEventListener('sync-notifications', handleSyncNotifs);
  }, [soundEnabled]);

  // Click outside listener for notification dropdown and sound customization
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (soundRef.current && !soundRef.current.contains(event.target as Node)) {
        setSoundDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load current user profile & list of all users
  useEffect(() => {
    const loadUsers = () => {
      const usersStr = localStorage.getItem('users') || '{}';
      try {
        const users = JSON.parse(usersStr);
        setAllUsers(users);
        if (currentUserId && users[currentUserId]) {
          setCurrentUser(users[currentUserId]);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {}
    };

    loadUsers();
    
    window.addEventListener('auth-update', loadUsers);
    return () => window.removeEventListener('auth-update', loadUsers);
  }, [currentUserId]);

  // Click outside listener for user switcher dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSwitcherRef.current && !userSwitcherRef.current.contains(event.target as Node)) {
        setUserSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-backup user data every 5 seconds while logged in
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      backupUserData(currentUserId);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // User auth actions handlers
  const handleLoginSuccess = (userId: string) => {
    setCurrentUserId(userId);
    window.location.reload();
  };

  const handleSwitchUser = (newUserId: string) => {
    if (currentUserId) {
      backupUserData(currentUserId);
    }
    restoreUserData(newUserId);
    localStorage.setItem('currentUserId', newUserId);
    setCurrentUserId(newUserId);
    setUserSwitcherOpen(false);
    window.location.reload();
  };

  const handleForgetAccount = (targetId: string) => {
    const usersStr = localStorage.getItem('users') || '{}';
    try {
      const users = JSON.parse(usersStr);
      delete users[targetId];
      localStorage.setItem('users', JSON.stringify(users));
      setAllUsers(users);
      localStorage.removeItem(`auth_pwd_${targetId}`);
    } catch (e) {
      console.error(e);
    }
    setForgetTargetUser(null);
  };

  const handleAddNewAccount = () => {
    if (currentUserId) {
      backupUserData(currentUserId);
    }
    clearLocalStorageForLogout();
    setCurrentUserId(null);
    setCurrentUser(null);
    setUserSwitcherOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    if (currentUserId) {
      backupUserData(currentUserId);
    }
    clearLocalStorageForLogout();
    setCurrentUserId(null);
    setCurrentUser(null);
    setUserSwitcherOpen(false);
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    if (!currentUserId) return;
    const usersStr = localStorage.getItem('users') || '{}';
    try {
      const users = JSON.parse(usersStr);
      delete users[currentUserId];
      localStorage.setItem('users', JSON.stringify(users));
    } catch (e) {
      console.error("Failed to delete user", e);
    }
    clearLocalStorageForLogout();
    setCurrentUserId(null);
    setCurrentUser(null);
    setShowDeleteConfirm(false);
    window.location.reload();
  };

  const playChime = (overrideType?: string) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const currentSound = overrideType || soundType;
      
      if (currentSound === 'chime') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
        osc1.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.08); // G6 note
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6 note
        osc2.frequency.exponentialRampToValueAtTime(1975.53, ctx.currentTime + 0.15); // B6 note
        
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
      } else if (currentSound === 'laser') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (currentSound === 'sonar') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1300, ctx.currentTime);
        osc.frequency.setValueAtTime(1300, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.6);
        
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.02);
      } else if (currentSound === 'ring') {
        const playRing = (delay: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime + delay);
          
          gainNode.gain.setValueAtTime(0.0, ctx.currentTime + delay);
          gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.01);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime + delay + 0.07);
          gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + delay + 0.09);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.1);
        };
        playRing(0);
        playRing(0.12);
      } else if (currentSound === 'zen') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(441.5, ctx.currentTime); // detuned chorus
        
        gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.4);
        osc2.stop(ctx.currentTime + 1.4);
      } else if (currentSound === 'crystal') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (currentSound === 'success') {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gainNode.gain.setValueAtTime(0.0, now + idx * 0.08);
          gainNode.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      }
    } catch (e) {
      console.warn("Sound blocked or not supported:", e);
    }
  };

  // Real-time reminder & event checkers polling loop (every 4 seconds)
  useEffect(() => {
    const checkAllRemindersAndSchedules = () => {
      const dNow = new Date();
      const currentDateStr = getLocalDateString(dNow);
      const currentTimeStr = getLocalTimeHoursMinutes(dNow);
      const currentTimestamp = dNow.getTime();

      let newNotificationsAdded = false;
      const addedNotifications: AppNotification[] = [];

      // 1. Check Reminders
      const savedRemindersStr = localStorage.getItem('productivity_reminders');
      if (savedRemindersStr) {
        try {
          const rems: Reminder[] = JSON.parse(savedRemindersStr);
          rems.forEach(rem => {
            let shouldNotify = false;
            let triggerKey = "";

            if (rem.recurrence === 'once') {
              if (rem.date === currentDateStr && rem.time === currentTimeStr) {
                shouldNotify = true;
                triggerKey = `rem-trig-${rem.id}`;
              }
            } else if (rem.recurrence === 'every_day') {
              if (rem.time === currentTimeStr) {
                shouldNotify = true;
                triggerKey = `rem-trig-${rem.id}-${currentDateStr}`;
              }
            } else if (rem.recurrence === 'every_other_day') {
              const startDateObj = new Date(rem.date);
              startDateObj.setHours(0,0,0,0);
              const todayDateObj = new Date(currentDateStr);
              todayDateObj.setHours(0,0,0,0);
              
              const diffTime = Math.abs(todayDateObj.getTime() - startDateObj.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays % 2 === 0 && rem.time === currentTimeStr) {
                shouldNotify = true;
                triggerKey = `rem-trig-${rem.id}-${currentDateStr}`;
              }
            }

            if (shouldNotify && triggerKey) {
              const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
              if (!triggered[triggerKey]) {
                triggered[triggerKey] = true;
                localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

                const titleLang = language === 'fa' ? `یادآوری: ${rem.title}` : `Reminder: ${rem.title}`;
                const msgLang = rem.description || (language === 'fa' ? 'زمان یادآوری شما فرا رسیده است.' : 'The scheduled time has arrived.');
                
                addedNotifications.push({
                  id: `notif-${Date.now()}-${Math.random()}`,
                  title: titleLang,
                  message: msgLang,
                  timestamp: new Date().toISOString(),
                  read: false,
                  type: 'reminder'
                });
                newNotificationsAdded = true;
              }
            }
          });
        } catch (e) {
          console.error("Error checking reminders:", e);
        }
      }

      // 2. Check Study Planner schedules
      const savedStudyStr = localStorage.getItem('productivity_study_schedule');
      if (savedStudyStr) {
        try {
          const schedItems: any[] = JSON.parse(savedStudyStr);
          schedItems.forEach(item => {
            const [startTimeStr] = item.time.split('-').map((s: string) => s.trim());
            const matchesDate = !item.date || item.date === currentDateStr;

            if (matchesDate && startTimeStr === currentTimeStr) {
              const triggerKey = `study-trig-${item.id}-${currentDateStr}`;
              const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
              
              if (!triggered[triggerKey]) {
                triggered[triggerKey] = true;
                localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

                const titleLang = language === 'fa' ? `برنامه درسی: ${item.title}` : `Study Plan: ${item.title}`;
                const detailLang = item.detail || (language === 'fa' ? `زمان مطالعه و برنامه درسی فرارسیده است` : `Scheduled study time is active now`);

                addedNotifications.push({
                  id: `notif-${Date.now()}-${Math.random()}`,
                  title: titleLang,
                  message: detailLang,
                  timestamp: new Date().toISOString(),
                  read: false,
                  type: 'study_start'
                });
                newNotificationsAdded = true;
              }
            }
          });
        } catch (e) {
          console.error("Error checking study schedules:", e);
        }
      }

      // 3. Check Countdowns (Start & End)
      const cStart = localStorage.getItem('countdown_start_date');
      const cTarget = localStorage.getItem('countdown_target_date');
      const cTitle = localStorage.getItem('countdown_main_title') || (language === 'fa' ? "شمارش معکوس" : "Countdown");

      if (cStart) {
        try {
          const startTime = new Date(cStart).getTime();
          if (currentTimestamp >= startTime) {
            const triggerKey = `countdown-start-${cStart}`;
            const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
            
            if (!triggered[triggerKey]) {
              triggered[triggerKey] = true;
              localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

              const titleLang = language === 'fa' ? `شمارش معکوس شروع شد` : `Countdown Started`;
              const msgLang = language === 'fa' ? `شمارش معکوس "${cTitle}" آغاز شده است.` : `Countdown "${cTitle}" has successfully started.`;

              addedNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}`,
                title: titleLang,
                message: msgLang,
                timestamp: new Date().toISOString(),
                read: false,
                type: 'countdown_start'
              });
              newNotificationsAdded = true;
            }
          }
        } catch(e) {}
      }

      if (cTarget) {
        try {
          const targetTime = new Date(cTarget).getTime();
          if (currentTimestamp >= targetTime) {
            const triggerKey = `countdown-end-${cTarget}`;
            const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
            
            if (!triggered[triggerKey]) {
              triggered[triggerKey] = true;
              localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

              const titleLang = language === 'fa' ? `شمارش معکوس به پایان رسید` : `Countdown Reached`;
              const msgLang = language === 'fa' ? `زمان هدف شمارش معکوس "${cTitle}" فرا رسید!` : `Target goal for "${cTitle}" has been reached!`;

              addedNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}`,
                title: titleLang,
                message: msgLang,
                timestamp: new Date().toISOString(),
                read: false,
                type: 'countdown_end'
              });
              newNotificationsAdded = true;
            }
          }
        } catch(e) {}
      }

      if (newNotificationsAdded && addedNotifications.length > 0) {
        setNotifications(prev => {
          const updated = [...addedNotifications, ...prev];
          localStorage.setItem('productivity_notifications', JSON.stringify(updated));
          return updated;
        });
        playChime();
      }
    };

    checkAllRemindersAndSchedules();
    const intervalId = setInterval(checkAllRemindersAndSchedules, 4000);
    return () => clearInterval(intervalId);
  }, [language, soundEnabled]);

  const handleLangChange = (lang: Language) => {
    localStorage.setItem('productivity_language', lang);
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'notes') {
      localStorage.setItem('habits_active_tab', 'notes');
      setCurrentView('habits');
    } else if (view === 'reminders') {
      localStorage.setItem('habits_active_tab', 'reminders');
      setCurrentView('habits');
    } else {
      setCurrentView(view);
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Nav items configuration
  const navItems = [
    { view: 'dashboard' as AppView, label: language === 'fa' ? 'داشبورد' : (language === 'de' ? 'Dashboard' : 'Dashboard'), icon: Home, color: 'text-cyan-400' },
    { view: 'budget' as AppView, label: language === 'fa' ? 'مدیریت بودجه' : (language === 'de' ? 'Budget' : 'Budget Manager'), icon: Coins, color: 'text-emerald-400' },
    { view: 'trading' as AppView, label: language === 'fa' ? 'ژورنال ترید' : (language === 'de' ? 'Trading' : 'Trading Journal'), icon: TrendingUp, color: 'text-amber-400' },
    { view: 'study' as AppView, label: language === 'fa' ? 'برنامه درسی' : (language === 'de' ? 'Lernplaner' : 'Study Planner'), icon: BookOpen, color: 'text-purple-400' },
    { view: 'fitness' as AppView, label: language === 'fa' ? 'سلامت و تغذیه' : (language === 'de' ? 'Fitness/Ernährung' : 'Fitness & Nutrition'), icon: Heart, color: 'text-rose-400' },
    { view: 'countdown' as AppView, label: language === 'fa' ? 'شمارش معکوس' : (language === 'de' ? 'Countdown' : 'Countdown'), icon: Flame, color: 'text-teal-400' },
    { view: 'habits' as AppView, label: language === 'fa' ? 'عادت، یادداشت، یادآور' : (language === 'de' ? 'Habits/Notes/Reminders' : 'Habits/Notes/Reminders'), icon: CheckSquare, color: 'text-indigo-400' },
  ].filter(item => item.view === 'dashboard' || enabledModules[item.view] !== false);

  if (!currentUserId) {
    return (
      <AuthPage 
        language={language} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen flex flex-col relative pb-24 font-sans text-slate-100 bg-[#060410]" dir={language === 'fa' ? 'rtl' : 'ltr'}>
        
        {/* Sticky Header & Top Bar Container */}
        <div className="sticky top-0 z-40 w-full flex flex-col">
          <header className="bg-[#060410]/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-lg select-none shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            🎯
          </div>
          <div className="text-right">
            <h2 className="text-xs font-black text-white tracking-wide uppercase">
              {language === 'fa' ? 'سامانه یکپارچه پروداکتیویتی' : 'PERSONAL SUITE'}
            </h2>
            <span className="text-[9px] text-cyan-400 font-mono font-bold">V1.6.0 • OFFLINE CORE</span>
          </div>
        </div>

        {/* Configurations Actions panel (Language / Notification Bell / Menu) */}
        <div className="flex items-center gap-2.5 sm:gap-3 relative">
          
          {/* Notification Bell Dropdown Widget */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400 rounded-xl flex items-center justify-center text-cyan-400 transition-all cursor-pointer relative"
              title={language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
            >
              <Bell className="w-5 h-5 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                  {digitsToPersian(unreadCount)}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className={`absolute top-12 ${language === 'fa' ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-[#0c0821]/95 border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3.5 max-h-[460px] overflow-y-auto`}>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'fa' ? 'اعلان‌های سیستم' : 'System Notifications'}</span>
                  </h3>
                  
                  {/* Sound & Clear Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-all"
                      title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                    <button 
                      onClick={handleClearAllNotifications}
                      className="p-1.5 bg-white/5 hover:bg-[#ef4444]/15 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      title="Clear All"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sound Customization Settings Button and Dropdown */}
                <div className="relative flex flex-col gap-1.5" ref={soundRef} style={{ direction: language === 'fa' ? 'rtl' : 'ltr' }}>
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5">
                    <span className="text-[10px] font-bold text-cyan-400">
                      {language === 'fa' ? '🎵 زنگوله اعلان:' : '🎵 Alert Sound:'}
                    </span>
                    
                    <button 
                      type="button"
                      onClick={() => setSoundDropdownOpen(!soundDropdownOpen)}
                      className="flex items-center gap-1.5 bg-black/40 border border-white/10 hover:border-cyan-400 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white transition-all"
                    >
                      <span>
                        {
                          [
                            { id: 'chime', fa: 'ناقوس 🔔', en: 'Chime 🔔' },
                            { id: 'laser', fa: 'لیزر ⚡', en: 'Laser ⚡' },
                            { id: 'sonar', fa: 'سونار 📡', en: 'Sonar 📡' },
                            { id: 'ring', fa: 'تلفن 📞', en: 'Ring 📞' },
                            { id: 'zen', fa: 'ذن 🧘', en: 'Zen 🧘' },
                            { id: 'crystal', fa: 'بلور 💎', en: 'Crystal 💎' },
                            { id: 'success', fa: 'موفقیت ✨', en: 'Success ✨' }
                          ].find(s => s.id === soundType)?.[language === 'fa' ? 'fa' : 'en'] || soundType
                        }
                      </span>
                      <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0" />
                    </button>
                  </div>

                  {soundDropdownOpen && (
                    <div className="absolute top-11 left-0 right-0 bg-[#0d0a21]/95 border border-white/15 rounded-xl shadow-2xl p-1.5 z-[60] max-h-48 overflow-y-auto space-y-1">
                      {[
                        { id: 'chime', fa: 'ناقوس 🔔', en: 'Chime' },
                        { id: 'laser', fa: 'لیزر ⚡', en: 'Laser' },
                        { id: 'sonar', fa: 'سونار 📡', en: 'Sonar' },
                        { id: 'ring', fa: 'تلفن 📞', en: 'Ring' },
                        { id: 'zen', fa: 'ذن 🧘', en: 'Zen' },
                        { id: 'crystal', fa: 'بلور 💎', en: 'Crystal' },
                        { id: 'success', fa: 'موفقیت ✨', en: 'Success' }
                      ].map(snd => (
                        <button
                          key={snd.id}
                          type="button"
                          onClick={() => {
                            setSoundType(snd.id);
                            playChime(snd.id);
                            setSoundDropdownOpen(false);
                          }}
                          className={`w-full text-right px-3 py-1.5 text-[10px] font-black rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all flex items-center justify-between ${
                            soundType === snd.id 
                              ? 'bg-cyan-400/20 text-cyan-400 font-bold' 
                              : 'text-slate-300'
                          }`}
                        >
                          <span>{language === 'fa' ? snd.fa : snd.en}</span>
                          {soundType === snd.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-8 space-y-1 text-slate-400">
                    <p className="text-xs">{language === 'fa' ? 'هیچ اعلانی یافت نشد.' : 'No notifications yet.'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'fa' ? 'یادآوری‌ها به صورت خودکار اینجا اضافه می‌شوند.' : 'Reminders automatically appear here.'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div 
                        key={n.id}
                        className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between gap-1.5 ${n.read ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.05)]'}`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-0.5">
                            <h4 className={`text-xs font-black ${n.read ? 'text-slate-300' : 'text-cyan-300'}`}>{n.title}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                          </div>
                          
                          {!n.read && (
                            <button 
                              onClick={(e) => handleMarkAsRead(n.id, e)}
                              className="px-2 py-1 bg-cyan-400 text-black font-black rounded-lg text-[9px] hover:bg-cyan-300 hover:scale-105 transition-all shrink-0"
                            >
                              {language === 'fa' ? 'خواندم' : 'Read'}
                            </button>
                          )}
                        </div>

                        <span className="text-[9px] text-slate-500 font-mono text-left self-end">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="w-full h-9 bg-white/5 hover:bg-cyan-500/10 hover:text-white rounded-xl text-[11px] text-slate-400 font-bold transition-all flex items-center justify-center gap-1 border border-white/5 hover:border-cyan-500/20"
                  >
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'fa' ? 'خواندن همه اعلان‌ها' : 'Mark all as read'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Switcher Dropdown Widget */}
          {currentUser && (
            <div className="relative font-sans" ref={userSwitcherRef}>
              <button 
                onClick={() => setUserSwitcherOpen(!userSwitcherOpen)}
                className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400 rounded-xl px-2.5 sm:px-3 flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                {currentUser.avatar.length <= 2 ? (
                  <span className="text-base select-none leading-none">{currentUser.avatar}</span>
                ) : (
                  <img src={currentUser.avatar} alt={currentUser.fullName} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                )}
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              {userSwitcherOpen && (
                <div 
                  className={`absolute top-12 ${language === 'fa' ? 'left-0' : 'right-0'} w-64 sm:w-72 bg-[#0c0821]/98 border border-white/15 rounded-2xl p-3 shadow-2xl z-50 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150`}
                  dir={language === 'fa' ? 'rtl' : 'ltr'}
                >
                  {/* Active Account Info Card */}
                  <div className="p-2.5 bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-2.5">
                    {currentUser.avatar.length <= 2 ? (
                      <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-sm select-none shrink-0 font-bold text-cyan-400">
                        {currentUser.avatar}
                      </div>
                    ) : (
                      <img src={currentUser.avatar} alt={currentUser.fullName} className="w-9 h-9 rounded-full object-cover border border-cyan-400/20 shrink-0" referrerPolicy="no-referrer" />
                    )}
                    <div className="space-y-0.5 text-right min-w-0 flex-1">
                      <h4 className="text-xs font-black text-white truncate">{currentUser.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">@{currentUser.username}</p>
                    </div>
                  </div>

                  {/* Other accounts section */}
                  <div className="space-y-1">
                    <div className="px-1 py-0.5 text-[9px] text-indigo-300/50 font-black uppercase tracking-wider text-right">
                      {language === 'fa' ? 'سوئیچ حساب کاربری' : 'Switch Account'}
                    </div>
                    
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
                      {(Object.values(allUsers) as UserProfile[]).filter(u => u.id !== currentUser.id).map(u => (
                        <div
                          key={u.id}
                          className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.03] text-xs text-slate-300 transition-all flex items-center justify-between group/user-item"
                        >
                          <button
                            onClick={() => {
                              setSwitchTargetUser(u);
                              setSwitchPassword('');
                              setSwitchError('');
                              setUserSwitcherOpen(false);
                            }}
                            className="flex-1 flex items-center gap-2 min-w-0 text-right justify-start cursor-pointer group-hover/user-item:text-cyan-400 transition-colors"
                          >
                            {u.avatar.length <= 2 ? (
                              <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-xs select-none font-bold shrink-0">{u.avatar}</span>
                            ) : (
                              <img src={u.avatar} alt={u.fullName} className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                            )}
                            <div className="truncate text-right min-w-0 flex-1">
                              <span className="truncate font-medium block leading-tight text-slate-200">{u.fullName}</span>
                              <span className="text-[8px] text-slate-500 font-mono block">@{u.username}</span>
                            </div>
                          </button>
                          
                          {/* Forget user icon button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setForgetTargetUser(u);
                              setUserSwitcherOpen(false);
                            }}
                            title={language === 'fa' ? 'حذف از لیست' : 'Forget Account'}
                            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 opacity-0 group-hover/user-item:opacity-100 transition-all shrink-0 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {(Object.values(allUsers) as UserProfile[]).filter(u => u.id !== currentUser.id).length === 0 && (
                        <div className="text-center py-2 text-[10px] text-slate-500/70 italic">
                          {language === 'fa' ? 'حساب دیگری یافت نشد' : 'No other accounts'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5">
                    <button
                      onClick={() => {
                        setUserSwitcherOpen(false);
                        setShowCustomizeModal(true);
                      }}
                      className="p-2 rounded-xl bg-cyan-400/5 hover:bg-cyan-400/15 text-cyan-400 text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/10 hover:border-cyan-400/30 text-center"
                    >
                      <span className="text-sm">⚙️</span>
                      <span className="font-extrabold text-[10px] leading-tight">{language === 'fa' ? 'شخصی‌سازی' : 'Customize'}</span>
                    </button>
                    
                    <button
                      onClick={handleAddNewAccount}
                      className="p-2 rounded-xl bg-cyan-400/5 hover:bg-cyan-400/15 text-cyan-400 text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-cyan-400/10 hover:border-cyan-400/30 text-center"
                    >
                      <span className="text-sm">➕</span>
                      <span className="font-extrabold text-[10px] leading-tight">{language === 'fa' ? 'حساب جدید' : 'New Account'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserSwitcherOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="p-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-amber-500/10 hover:border-amber-500/30 text-center"
                    >
                      <span className="text-sm">🚪</span>
                      <span className="font-extrabold text-[10px] leading-tight">{language === 'fa' ? 'خروج' : 'Sign Out'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserSwitcherOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 text-xs transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-rose-500/10 hover:border-rose-500/30 text-center"
                    >
                      <span className="text-sm">🗑️</span>
                      <span className="font-extrabold text-[10px] leading-tight">{language === 'fa' ? 'حذف حساب' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language selection Dropdown widget */}
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400 rounded-xl px-2.5 sm:px-3 flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              <Languages className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">
                {language === 'fa' ? '🇮🇷 فارسی' : language === 'de' ? '🇩🇪 Deutsch' : '🇺🇸 English'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-12 left-0 right-0 sm:left-auto sm:w-36 bg-[#0c0821]/95 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 space-y-1">
                <button 
                  onClick={() => handleLangChange('fa')}
                  className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${language === 'fa' ? 'bg-cyan-400/15 text-cyan-400 font-black' : 'text-slate-300'}`}
                >
                  🇮🇷 فارسی
                </button>
                <button 
                  onClick={() => handleLangChange('en')}
                  className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${language === 'en' ? 'bg-cyan-400/15 text-cyan-400 font-black' : 'text-slate-300'}`}
                >
                  🇺🇸 English
                </button>
                <button 
                  onClick={() => handleLangChange('de')}
                  className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${language === 'de' ? 'bg-cyan-400/15 text-cyan-400 font-black' : 'text-slate-300'}`}
                >
                  🇩🇪 Deutsch
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-cyan-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
          </header>
          <TopAudioBar language={language} />
        </div>

      {/* Main Container Content */}
      <main className="flex-1 px-4 sm:px-8 py-8 md:py-10 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' && <Dashboard language={language} onNavigate={handleNavigate} enabledModules={enabledModules} />}
        {currentView === 'budget' && <BudgetManager language={language} />}
        {currentView === 'countdown' && <CountdownTimer language={language} />}
        {currentView === 'habits' && <HabitTracker language={language} />}
        {currentView === 'trading' && <TradingJournal language={language} />}
        {currentView === 'study' && <StudyPlanner language={language} />}
        {currentView === 'fitness' && <FitnessTracker language={language} />}
      </main>

      {/* Mobile Drawer Slide-out Nav */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-[#060410]/95 border-b border-white/10 p-4 md:hidden z-50 shadow-2xl flex flex-col gap-2.5 animate-slide-down">
          {navItems.map((item) => {
            const isSel = currentView === item.view;
            return (
              <button 
                key={item.view}
                onClick={() => handleNavigate(item.view)}
                className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 transition-all ${isSel ? 'bg-gradient-to-r from-cyan-400/10 to-blue-600/15 border border-cyan-400/30 text-cyan-400 font-black' : 'hover:bg-white/5 text-slate-300'}`}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs font-vazir">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Floating Navigation bar for quick swapping */}
      <nav className="fixed bottom-6 inset-x-4 max-w-3xl mx-auto h-[74px] bg-[#070514]/85 border border-white/10 rounded-2xl flex items-center justify-around px-2 sm:px-4 z-40 backdrop-blur-xl shadow-[0_20px_50px_-5px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isSel = currentView === item.view;
          return (
            <button 
              key={item.view}
              onClick={() => handleNavigate(item.view)}
              className={`flex flex-col items-center justify-center w-12 sm:w-16 h-14 rounded-xl transition-all cursor-pointer ${isSel ? 'bg-cyan-400/10 text-cyan-400 scale-105' : 'text-slate-400 hover:text-white hover:scale-105 active:scale-95'}`}
              title={item.label}
            >
              <item.icon className={`w-5 h-5 ${isSel ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider mt-1 block max-w-full truncate text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Confirm Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xl mx-auto">
                🚪
              </div>
              <h3 className="text-base font-black text-white">
                {language === 'fa' ? 'خروج از حساب کاربری' : (language === 'de' ? 'Abmelden' : 'Sign Out')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fa' ? 'آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟ تمامی اطلاعات شما تا این لحظه پشتیبان‌گیری شده است.' : (language === 'de' ? 'Sind Sie sicher, dass Sie sich abmelden möchten? Alle Ihre Daten wurden gesichert.' : 'Are you sure you want to sign out? Your session data is safely backed up.')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {language === 'fa' ? 'انصراف' : (language === 'de' ? 'Abbrechen' : 'Cancel')}
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/15 transition-all cursor-pointer"
              >
                {language === 'fa' ? 'بله، خارج شو' : (language === 'de' ? 'Ja, abmelden' : 'Yes, Sign Out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center text-xl mx-auto animate-bounce">
                ⚠️
              </div>
              <h3 className="text-base font-black text-rose-400">
                {language === 'fa' ? 'حذف دائمی حساب کاربری' : (language === 'de' ? 'Konto löschen' : 'Delete Account Permanently')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fa' 
                  ? 'هشدار جدی: با حذف حساب کاربری، تمامی اطلاعات، فعالیت‌ها، برنامه‌های درسی، ژورنال‌های ترید و سایر داده‌های شما برای همیشه پاک شده و هرگز قابل بازیابی نخواهند بود!' 
                  : (language === 'de' 
                    ? 'Achtung: Das Löschen Ihres Kontos entfernt alle Ihre Daten dauerhaft und unwiderruflich!' 
                    : 'Warning: Deleting your account will permanently wipe out all of your logged data, trackers, notes, and records. This action cannot be undone!')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {language === 'fa' ? 'انصراف' : (language === 'de' ? 'Abbrechen' : 'Cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 h-10 bg-rose-500 hover:bg-rose-400 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                {language === 'fa' ? 'بله، برای همیشه پاک کن' : (language === 'de' ? 'Ja, unwiderruflich löschen' : 'Yes, Delete Forever')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Modules Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>⚙️</span>
                <span>{language === 'fa' ? 'شخصی‌سازی ابزارهای داشبورد' : (language === 'de' ? 'Dashboard-Module anpassen' : 'Customize Dashboard Modules')}</span>
              </h3>
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-indigo-200/60 leading-relaxed">
              {language === 'fa' 
                ? 'در این بخش می‌توانید ابزارهای دلخواه خود را فعال یا غیرفعال کنید. ابزارهای غیرفعال‌شده از داشبورد اصلی و نوارهای ناوبری مخفی خواهند شد.'
                : (language === 'de'
                  ? 'Hier können Sie gewünschte Module aktivieren oder deaktivieren. Deaktivierte Module werden vom Haupt-Dashboard und von den Navigationsleisten ausgeblendet.'
                  : 'Toggle specific tools on or off. Disabled modules will be hidden from the main dashboard and navigation menus.')}
            </p>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {[
                { key: 'budget', label: language === 'fa' ? 'مدیریت بودجه ماهانه' : (language === 'de' ? 'Budgetmanager' : 'Monthly Budget Manager'), desc: language === 'fa' ? 'ثبت درآمد، مخارج و تراکنش‌های جاری' : 'Track incomes, expenses, and monthly ledger', emoji: '💰' },
                { key: 'trading', label: language === 'fa' ? 'دفترچه ژورنال تریدینگ' : (language === 'de' ? 'Handelsjournal' : 'Trading Journal'), desc: language === 'fa' ? 'ثبت و آنالیز معاملات بازارهای مالی' : 'Log trades and calculate absolute performance statistics', emoji: '📈' },
                { key: 'study', label: language === 'fa' ? 'برنامه‌ریز درسی' : (language === 'de' ? 'Lernplaner' : 'Study Task Planner'), desc: language === 'fa' ? 'برنامه‌ریزی ساعات درسی و وظایف آموزشی' : 'Schedule topics and track study hours', emoji: '📚' },
                { key: 'fitness', label: language === 'fa' ? 'سلامت و تغذیه' : (language === 'de' ? 'Fitness & Ernährung' : 'Fitness & Nutrition'), desc: language === 'fa' ? 'تمرینات ورزشی، رژیم غذایی و گزارش سلامت' : 'Track workouts, meals, calories, and BMI', emoji: '❤️' },
                { key: 'countdown', label: language === 'fa' ? 'شمارش معکوس هدف' : (language === 'de' ? 'Ziel-Countdown' : 'Goal Countdown'), desc: language === 'fa' ? 'پایش پیشرفت گام‌ها تا تاریخ هدف جاری' : 'Monitor step logs and motivational countdowns', emoji: '⏳' },
                { key: 'habits', label: language === 'fa' ? 'عادات، یادداشت و یادآور' : (language === 'de' ? 'Gewohnheiten & Notizen' : 'Habits, Notes & Reminders'), desc: language === 'fa' ? 'ردیاب انضباط شخصی، یادداشت‌ها و یادآورهای سیستمی' : 'Form healthy habits, scribble notes, and setup reminders', emoji: '🔔' }
              ].map((mod) => {
                const isEnabled = enabledModules[mod.key] !== false;
                return (
                  <div key={mod.key} className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl select-none">{mod.emoji}</span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-white">{mod.label}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">{mod.desc}</p>
                      </div>
                    </div>
                    
                    {/* Beautiful custom switch */}
                    <button
                      onClick={() => handleToggleModule(mod.key)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative cursor-pointer outline-none shrink-0 ${isEnabled ? 'bg-cyan-500' : 'bg-slate-800'}`}
                    >
                      <div 
                        className={`w-4 h-4 bg-slate-950 rounded-full shadow-md transition-all duration-300 absolute top-1 ${
                          isEnabled ? 'left-6' : 'left-1'
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-full h-11 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                {language === 'fa' ? 'ذخیره و تایید تغییرات' : (language === 'de' ? 'Speichern und bestätigen' : 'Save & Confirm Changes')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Account Switching Security: Password Verification Modal */}
      {switchTargetUser && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="text-center space-y-3">
              {switchTargetUser.avatar.length <= 2 ? (
                <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl select-none font-bold text-cyan-400 mx-auto">
                  {switchTargetUser.avatar}
                </div>
              ) : (
                <img src={switchTargetUser.avatar} alt={switchTargetUser.fullName} className="w-14 h-14 rounded-full object-cover border border-cyan-400/20 shrink-0 mx-auto" referrerPolicy="no-referrer" />
              )}
              <h3 className="text-base font-black text-white">
                {language === 'fa' ? `ورود به حساب ${switchTargetUser.fullName}` : `Log into ${switchTargetUser.fullName}`}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fa'
                  ? 'جهت امنیت داده‌های شخصی، لطفا رمز عبور این حساب کاربری را وارد نمایید.'
                  : 'For security and privacy, please enter the password for this account.'}
              </p>
            </div>

            {switchError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs text-center flex items-center justify-center gap-1.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{switchError}</span>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const savedPwd = localStorage.getItem(`auth_pwd_${switchTargetUser.id}`);
              if (savedPwd === switchPassword) {
                handleSwitchUser(switchTargetUser.id);
                setSwitchTargetUser(null);
              } else {
                setSwitchError(language === 'fa' ? 'رمز عبور وارد شده نادرست است.' : 'The password entered is incorrect.');
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold block">
                  {language === 'fa' ? 'رمز عبور' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={switchPassword}
                  onChange={(e) => { setSwitchPassword(e.target.value); setSwitchError(''); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all font-mono text-center"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSwitchTargetUser(null)}
                  className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {language === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-cyan-500/15 transition-all cursor-pointer"
                >
                  {language === 'fa' ? 'تایید و ورود' : 'Confirm & Switch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forget/Remove Account from Switcher confirmation Modal */}
      {forgetTargetUser && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center text-xl mx-auto">
                🗑️
              </div>
              <h3 className="text-base font-black text-white">
                {language === 'fa' ? 'حذف حساب کاربری از این سیستم' : 'Forget Account from This Device'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'fa'
                  ? `آیا مطمئن هستید که می‌خواهید حساب کاربری ${forgetTargetUser.fullName} را از حافظه سوئیچ سریع این دستگاه حذف کنید؟ این عمل داده‌های شما را حذف دائمی نمی‌کند، اما دسترسی سریع را برمی‌دارد.`
                  : `Are you sure you want to remove ${forgetTargetUser.fullName} from the quick-switch menu on this device? This will not permanently wipe data but removes the account list shortcut.`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setForgetTargetUser(null)}
                className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {language === 'fa' ? 'انصراف' : 'Cancel'}
              </button>
              <button
                onClick={() => handleForgetAccount(forgetTargetUser.id)}
                className="flex-1 h-10 bg-red-500 hover:bg-red-400 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/15 transition-all cursor-pointer"
              >
                {language === 'fa' ? 'بله، حذف کن' : 'Yes, Forget'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </AudioPlayerProvider>
  );
}
