import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  Check, 
  Activity, 
  Brain, 
  Award, 
  Sparkles, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Camera, 
  Percent, 
  RotateCcw, 
  Edit2, 
  Info, 
  X, 
  Star,
  DollarSign as DollarIcon,
  Search,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  FileDown,
  FileUp,
  Upload,
  Download,
  Zap,
  HelpCircle,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Trade, Language } from '../types';
import { digitsToPersian } from '../utils/dateUtils';

interface TradingJournalProps {
  language: Language;
}

// Preset assets for easy selection
const POPULAR_ASSETS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'AAPL', 'TSLA', 'EUR/USD', 'XAU/USD'];

// Preset setups
const POPULAR_SETUPS = [
  'Support Bounce', 
  'Resistance Breakout', 
  'Bull Flag Pullback', 
  'EMA Cross', 
  'VWAP Retest', 
  'Fibonacci Retracement',
  'Trendline Liquidity Run',
  'Mean Reversion Divergence'
];

// Preset psychological states
const PSYCHOLOGICAL_STATES = [
  '🧠 Focused & Calm',
  '😌 Patient & Rested',
  '😰 Anxious & Stressed',
  '😡 Revenge & Angry',
  '🤑 Greedy & FOMO',
  '🥱 Tired & Distracted',
  '⚡ Impulsive'
];

const MOCK_CHARTS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'
];

const t = {
  fa: {
    title: "مغز متفکر معامله‌گری",
    subtitle: "ثبت هوشمند، تحلیل الگوهای روان‌شناختی و حسابداری خودکار تریدها",
    initialBalance: "سرمایه اولیه",
    liveBalance: "دارایی زنده حساب",
    netROI: "نرخ بازدهی کل (ROI)",
    winRate: "نسبت بردهای معامله",
    totalPnL: "کل سود/زیان (PnL)",
    profitFactor: "فاکتور سود (Profit Factor)",
    maxDrawdown: "بیشترین افت سرمایه (Max DD)",
    equityCurve: "منحنی رشد سرمایه (Equity Curve)",
    setupPerformance: "عملکرد بر اساس نوع استراتژی (PnL)",
    psyWinRate: "توزیع حالات روانی معامله‌گر",
    setupLabel: "استراتژی ورود",
    psyLabel: "حالت روان‌شناختی",
    disciplineLabel: "نظم و انضباط",
    addTradeBtn: "ثبت موقعیت جدید",
    noTrades: "هنوز هیچ معامله‌ای ثبت نکرده‌اید.",
    preTradeTitle: "۱. قبل از معامله (Pre-Trade)",
    asset: "نماد معاملاتی (مثلا BTC/USDT)",
    direction: "جهت معامله",
    long: "خرید (Long)",
    short: "فروش (Short)",
    entryPrice: "قیمت ورود",
    stopLoss: "حد ضرر (SL)",
    takeProfit: "حد سود (TP)",
    riskPct: "ریسک روی سرمایه (%)",
    positionSize: "حجم معامله (Size)",
    postTradeTitle: "۲. بعد از معامله (Post-Trade)",
    exitPrice: "قیمت خروج",
    exitDate: "تاریخ خروج",
    exitTime: "ساعت خروج",
    netPnL: "سود/زیان خالص ($)",
    leverage: "اهرم (Leverage)",
    autoCalc: "محاسبه خودکار",
    psyTitle: "۳. روان‌شناسی و قوانین",
    notes: "یادداشت‌ها و سناریو ترید...",
    notesPlaceholder: "مثلاً: ورود روی تست مجدد سطح کلیدی، خروج زودهنگام به دلیل اخبار...",
    disciplineRating: "امتیاز پایبندی به پلن (۱-۵)",
    saveBtn: "ذخیره و ثبت در دفتر معامله",
    cancelBtn: "انصراف",
    date: "تاریخ",
    assetCol: "نماد",
    setupCol: "استراتژی",
    rrCol: "ضریب R:R",
    pnlPctCol: "بازدهی (%)",
    newBalCol: "دارایی پس از معامله",
    actions: "عملیات",
    details: "جزئیات تحلیل معامله",
    screenshots: "تصاویر تحلیل نمودار",
    validationError: "لطفاً مقادیر ورودی را به درستی بررسی کنید.",
    confirmDelete: "آیا مطمئن هستید که این ترید حذف شود؟",
    setCapitalTitle: "ویرایش دارایی اولیه",
    setCapitalDesc: "لطفا سرمایه اولیه حساب خود را وارد کنید:",
    pftFactorDesc: "نسبت سودهای ناخالص به زیان‌های ناخالص. بالای ۱.۵ عالی است.",
    maxDDDesc: "بزرگترین افت سرمایه از قله تا دره در طول فعالیت.",
    tradeLedgerTitle: "دفتر کل حسابداری معاملات (Automated Accounting)",
    balanceBefore: "دارایی قبل از ترید",
    balanceAfter: "دارایی بعد از ترید",
    growthPerTrade: "رشد ترید",
    rMultipleTitle: "ضریب ریسک به ریوارد واقعی (R-Multiple)",
    psychState: "وضعیت ذهنی هنگام ورود",
    viewChart: "مشاهده نمودار",
    enterMockUrl: "آدرس تصویر تحلیل (دلخواه)",
    searchPlaceholder: "جستجو در نماد، استراتژی یا یادداشت...",
    allSetups: "همه استراتژی‌ها",
    filterTitle: "فیلتر پیشرفته",
    activeTradesCount: "تعداد کل معاملات",
    winRateAnalysis: "سهم سودآوری حالات ذهنی",
    successMsg: "ترید با موفقیت در دفتر کل ثبت شد!",
    changeBalanceBtn: "تغییر سرمایه",
    saveBalance: "ذخیره",
    exportData: "خروجی اکسل/CSV"
  },
  en: {
    title: "Trading Journal & Analytics",
    subtitle: "Automated accounting, equity curves, and psychological state analysis",
    initialBalance: "Initial Capital",
    liveBalance: "Live Balance",
    netROI: "Total Net ROI",
    winRate: "Win Rate",
    totalPnL: "Total Net P&L",
    profitFactor: "Profit Factor",
    maxDrawdown: "Max Drawdown",
    equityCurve: "Equity Curve (Account Growth)",
    setupPerformance: "Performance by Setup Type (PnL)",
    psyWinRate: "Psychological State Distribution",
    setupLabel: "Setup Type",
    psyLabel: "Psychological State",
    disciplineLabel: "Discipline",
    addTradeBtn: "Log New Trade",
    noTrades: "No logged trades found.",
    preTradeTitle: "1. Pre-Trade Setup",
    asset: "Asset Symbol (e.g. BTC/USDT)",
    direction: "Direction",
    long: "Long (Buy)",
    short: "Short (Sell)",
    entryPrice: "Entry Price",
    stopLoss: "Stop Loss (SL)",
    takeProfit: "Take Profit (TP)",
    riskPct: "Capital Risk %",
    positionSize: "Position Size",
    postTradeTitle: "2. Post-Trade Resolution",
    exitPrice: "Exit Price",
    exitDate: "Exit Date",
    exitTime: "Exit Time",
    netPnL: "Net P&L ($)",
    leverage: "Leverage",
    autoCalc: "Auto Calculate",
    psyTitle: "3. Psychology & Rules",
    notes: "Trade Notes & Observations...",
    notesPlaceholder: "e.g. Entry on key level retest, exited early due to high impact news...",
    disciplineRating: "Discipline Rating (1-5)",
    saveBtn: "Log Trade to Ledger",
    cancelBtn: "Cancel",
    date: "Date",
    assetCol: "Asset",
    setupCol: "Setup",
    rrCol: "R-Multiple",
    pnlPctCol: "P&L (%)",
    newBalCol: "Post-Trade Balance",
    actions: "Actions",
    details: "Trade Analysis Details",
    screenshots: "Chart Analysis Screenshots",
    validationError: "Please check all form fields and inputs.",
    confirmDelete: "Are you sure you want to delete this trade?",
    setCapitalTitle: "Update Starting Capital",
    setCapitalDesc: "Please enter your starting account balance:",
    pftFactorDesc: "Ratio of gross profits to gross losses. Above 1.5 is excellent.",
    maxDDDesc: "Maximum peak-to-trough drop in account equity.",
    tradeLedgerTitle: "Dynamic Trade Accounting Ledger",
    balanceBefore: "Balance Before",
    balanceAfter: "Balance After",
    growthPerTrade: "Growth / Trade",
    rMultipleTitle: "Realized Risk-Reward (R-Multiple)",
    psychState: "Psychological Mindset",
    viewChart: "View Chart Analysis",
    enterMockUrl: "Chart Image URL (Optional)",
    searchPlaceholder: "Search symbol, setup, notes...",
    allSetups: "All Setups",
    filterTitle: "Advanced Filter",
    activeTradesCount: "Total Logged Trades",
    winRateAnalysis: "Mental State Profit Distribution",
    successMsg: "Trade logged to ledger successfully!",
    changeBalanceBtn: "Change Capital",
    saveBalance: "Save",
    exportData: "Export to CSV/Excel"
  },
  de: {
    title: "Handelsjournal & Analyse",
    subtitle: "Automatisierte Buchhaltung, Equity-Kurven und mentale Analyse",
    initialBalance: "Startkapital",
    liveBalance: "Live-Kontostand",
    netROI: "Netto-ROI (%)",
    winRate: "Gewinnquote (Win Rate)",
    totalPnL: "Gesamt P&L",
    profitFactor: "Profit-Faktor",
    maxDrawdown: "Max. Drawdown",
    equityCurve: "Equity-Kurve (Wachstum)",
    setupPerformance: "Performance nach Setup (PnL)",
    psyWinRate: "Verteilung der mentalen Zustände",
    setupLabel: "Setup-Typ",
    psyLabel: "Mentaler Zustand",
    disciplineLabel: "Disziplin",
    addTradeBtn: "Neuen Trade erfassen",
    noTrades: "Keine Trades erfasst.",
    preTradeTitle: "1. Vor dem Trade",
    asset: "Handelspaar (z.B. BTC/USDT)",
    direction: "Richtung",
    long: "Long (Kauf)",
    short: "Short (Verkauf)",
    entryPrice: "Einstiegspreis",
    stopLoss: "Stop-Loss (SL)",
    takeProfit: "Take-Profit (TP)",
    riskPct: "Risiko %",
    positionSize: "Positionsgröße",
    postTradeTitle: "2. Nach dem Trade",
    exitPrice: "Ausstiegspreis",
    exitDate: "Ausstiegsdatum",
    exitTime: "Ausstiegszeit",
    netPnL: "Netto-P&L ($)",
    leverage: "Hebel (Leverage)",
    autoCalc: "Automatisch berechnen",
    psyTitle: "3. Psychologie & Regeln",
    notes: "Notizen & Beobachtungen...",
    notesPlaceholder: "z.B. Einstieg bei Retest, vorzeitig wegen News geschlossen...",
    disciplineRating: "Disziplin-Bewertung (1-5)",
    saveBtn: "Trade ins Journal eintragen",
    cancelBtn: "Abbrechen",
    date: "Datum",
    assetCol: "Wert",
    setupCol: "Setup",
    rrCol: "R-Multiple",
    pnlPctCol: "P&L (%)",
    newBalCol: "Neuer Kontostand",
    actions: "Aktionen",
    details: "Detaillierte Analyse",
    screenshots: "Chart-Screenshots",
    validationError: "Bitte alle Felder korrekt ausfüllen.",
    confirmDelete: "Möchten Sie diesen Trade wirklich löschen?",
    setCapitalTitle: "Startkapital anpassen",
    setCapitalDesc: "Bitte geben Sie das Startkapital Ihres Kontos ein:",
    pftFactorDesc: "Verhältnis von Bruttogewinnen zu Bruttoverlusten. Über 1,5 ist exzellent.",
    maxDDDesc: "Maximaler prozentualer Rückgang des Kapitals vom Höchststand.",
    tradeLedgerTitle: "Automatisches Handels-Konto-Register",
    balanceBefore: "Kontostand Vorher",
    balanceAfter: "Kontostand Nachher",
    growthPerTrade: "Wachstum / Trade",
    rMultipleTitle: "Realisierter R-Multiple",
    psychState: "Mentaler Zustand",
    viewChart: "Chart-Analyse anzeigen",
    enterMockUrl: "Chart-Bild URL (optional)",
    searchPlaceholder: "Nach Symbol, Setup, Notizen suchen...",
    allSetups: "Alle Setups",
    filterTitle: "Erweiterter Filter",
    activeTradesCount: "Gesamte Trades",
    winRateAnalysis: "Gewinn nach mentalem Zustand",
    successMsg: "Trade erfolgreich erfasst!",
    changeBalanceBtn: "Kapital ändern",
    saveBalance: "Speichern",
    exportData: "Daten exportieren"
  }
};

const defaultTrades: Trade[] = [
  {
    id: 't-1',
    date: '2026-07-01',
    time: '14:30',
    asset: 'BTC/USDT',
    direction: 'Long',
    entryPrice: 60500,
    stopLoss: 59500,
    takeProfit: 63500,
    exitPrice: 63000,
    riskPercentage: 2,
    positionSize: 0.2,
    netPnL: 500,
    R_Multiple: 2.5,
    setupType: 'Support Bounce',
    psychologicalState: '🧠 Focused & Calm',
    disciplineRating: 5,
    screenshots: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80'],
    notes: 'Perfect bounce off the 4H demand zone. Discipline was high, trailed my stop loss to protect profits.',
    leverage: 10
  },
  {
    id: 't-2',
    date: '2026-07-02',
    time: '09:15',
    asset: 'ETH/USDT',
    direction: 'Long',
    entryPrice: 3400,
    stopLoss: 3320,
    takeProfit: 3600,
    exitPrice: 3320,
    riskPercentage: 1.5,
    positionSize: 2.0,
    netPnL: -160,
    R_Multiple: -1.0,
    setupType: 'Resistance Breakout',
    psychologicalState: '😰 Anxious & Stressed',
    disciplineRating: 4,
    screenshots: ['https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80'],
    notes: 'Entered breakout of flag pattern. Fakeout occurred and got stopped out immediately. Respected stop loss.',
    leverage: 20
  },
  {
    id: 't-3',
    date: '2026-07-03',
    time: '16:45',
    asset: 'SOL/USDT',
    direction: 'Short',
    entryPrice: 145,
    stopLoss: 150,
    takeProfit: 130,
    exitPrice: 132,
    riskPercentage: 2,
    positionSize: 50,
    netPnL: 650,
    R_Multiple: 2.6,
    setupType: 'EMA Cross',
    psychologicalState: '😌 Patient & Rested',
    disciplineRating: 5,
    screenshots: ['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80'],
    notes: 'Hourly death cross on EMA. Entered short on retest of 20 EMA. Smashed take profit zone near major daily support.',
    leverage: 50
  },
  {
    id: 't-4',
    date: '2026-07-04',
    time: '11:00',
    asset: 'BTC/USDT',
    direction: 'Short',
    entryPrice: 62800,
    stopLoss: 63300,
    takeProfit: 61000,
    exitPrice: 63300,
    riskPercentage: 1,
    positionSize: 0.25,
    netPnL: -125,
    R_Multiple: -1.0,
    setupType: 'Mean Reversion Divergence',
    psychologicalState: '😡 Revenge & Angry',
    disciplineRating: 2,
    screenshots: ['https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=600&q=80'],
    notes: 'Felt frustrated by missing the earlier move and forced a short counter-trend. Got stopped out. Do not FOMO trade.',
    leverage: 10
  },
  {
    id: 't-5',
    date: '2026-07-05',
    time: '10:30',
    asset: 'AAPL',
    direction: 'Long',
    entryPrice: 180,
    stopLoss: 176,
    takeProfit: 192,
    exitPrice: 188,
    riskPercentage: 1,
    positionSize: 75,
    netPnL: 600,
    R_Multiple: 2.0,
    setupType: 'Bull Flag Pullback',
    psychologicalState: '🧠 Focused & Calm',
    disciplineRating: 5,
    screenshots: ['https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'],
    notes: 'Standard morning gapped pullback to VWAP. Solid risk-reward ratio, disciplined execution.',
    leverage: 1
  }
];

export default function TradingJournal({ language }: TradingJournalProps) {
  const trans = t[language] || t.en;
  const isRtl = language === 'fa';

  // State Management
  const [journalCurrency, setJournalCurrency] = useState<'USD' | 'EUR'>(() => {
    const saved = localStorage.getItem('trading_journal_currency');
    return (saved === 'EUR' || saved === 'USD') ? saved : 'USD';
  });

  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('trading_initial_balance');
    return saved ? Number(saved) : 10000;
  });

  // Helpers to prevent RTL jumbling of math operators and currency signs
  const formatJournalValue = (val: number, customClass?: string) => {
    const symbol = journalCurrency === 'USD' ? '$' : '€';
    const isNeg = val < 0;
    const absStr = digitsToPersian(Math.abs(val).toLocaleString('en-US'));
    return (
      <span className={`inline-flex items-center gap-0.5 ${customClass || ''}`} dir="ltr">
        {isNeg ? <span>-</span> : null}
        <span>{absStr}</span>
        <span className="text-[10px] ml-0.5 opacity-75">{symbol}</span>
      </span>
    );
  };

  const formatJournalPnL = (val: number, customClass?: string) => {
    const symbol = journalCurrency === 'USD' ? '$' : '€';
    const isNeg = val < 0;
    const isZero = val === 0;
    const absStr = digitsToPersian(Math.abs(val).toLocaleString('en-US'));
    return (
      <span className={`inline-flex items-center gap-0.5 ${customClass || (isZero ? 'text-slate-300' : isNeg ? 'text-rose-400' : 'text-emerald-400')}`} dir="ltr">
        {!isZero && <span>{isNeg ? '-' : '+'}</span>}
        <span>{absStr}</span>
        <span className="text-xs ml-0.5 opacity-75">{symbol}</span>
      </span>
    );
  };
  
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('productivity_trades_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTrades;
      }
    }
    return defaultTrades;
  });

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Modal / Log Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formTab, setFormTab] = useState<'pre' | 'post' | 'psy'>('pre');
  
  // Balance Editor State
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(initialBalance.toString());

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/trading');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            journalCurrency: serverCurrency,
            initialBalance: serverBalance,
            trades: serverTrades,
            quickCalcBalance: serverQuickCalcBalance,
            riskPresets: serverRiskPresets,
            forexLeverages: serverForexLeverages,
            cryptoLeverages: serverCryptoLeverages,
          } = result.data;
          
          if (serverCurrency) setJournalCurrency(serverCurrency);
          if (serverBalance !== undefined) {
            setInitialBalance(serverBalance);
            setBalanceInput(serverBalance.toString());
          }
          if (serverTrades) setTrades(serverTrades);
          if (serverQuickCalcBalance !== undefined) setQuickCalcBalance(serverQuickCalcBalance);
          if (serverRiskPresets) setRiskPresets(serverRiskPresets);
          if (serverForexLeverages) setForexLeverages(serverForexLeverages);
          if (serverCryptoLeverages) setCryptoLeverages(serverCryptoLeverages);
          
          setSyncStatus('synced');
        } else {
          // Fallback to localStorage is already loaded
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load trading journal from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  // Form Fields
  const [formAsset, setFormAsset] = useState('');
  const [formDirection, setFormDirection] = useState<'Long' | 'Short'>('Long');
  const [formEntry, setFormEntry] = useState('');
  const [formSL, setFormSL] = useState('');
  const [formTP, setFormTP] = useState('');
  const [formRisk, setFormRisk] = useState('1');
  const [formSize, setFormSize] = useState('');
  const [formLeverage, setFormLeverage] = useState('1');
  
  const [formExit, setFormExit] = useState('');
  const [formExitDate, setFormExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [formExitTime, setFormExitTime] = useState('12:00');
  const [formPnL, setFormPnL] = useState('');

  const [formSetups, setFormSetups] = useState<string[]>([POPULAR_SETUPS[0]]);
  const [formCustomSetup, setFormCustomSetup] = useState('');
  const [formPsy, setFormPsy] = useState(PSYCHOLOGICAL_STATES[0]);
  const [formDiscipline, setFormDiscipline] = useState<number>(5);
  const [formScreenshot, setFormScreenshot] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Table Sorting, Searching & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [setupFilter, setSetupFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Custom premium dropdown states
  const [isSetupFilterOpen, setIsSetupFilterOpen] = useState(false);
  const [isDirectionFilterOpen, setIsDirectionFilterOpen] = useState(false);
  const [isFormSetupOpen, setIsFormSetupOpen] = useState(false);
  const [isFormPsyOpen, setIsFormPsyOpen] = useState(false);

  // Deletion and validation states
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Risk Calculator States
  const [isQuickCalcOpen, setIsQuickCalcOpen] = useState(false);
  const [quickCalcMode, setQuickCalcMode] = useState<'forex' | 'crypto'>('forex');
  const [quickCalcBalance, setQuickCalcBalance] = useState<string>(() => {
    return localStorage.getItem('quick_calc_balance') || initialBalance.toString();
  });
  const [quickCalcDirection, setQuickCalcDirection] = useState<'Long' | 'Short'>('Long');
  const [quickCalcEntry, setQuickCalcEntry] = useState('');
  const [quickCalcSL, setQuickCalcSL] = useState('');
  const [quickCalcTP, setQuickCalcTP] = useState('');
  const [quickCalcLeverage, setQuickCalcLeverage] = useState<number>(100);
  const [quickCalcPipSize, setQuickCalcPipSize] = useState<number>(0.0001);
  const [quickCalcPipValue, setQuickCalcPipValue] = useState<number>(10);
  const [quickCalcCoin, setQuickCalcCoin] = useState('BTC');

  // New advanced features states
  const [quickCalcInputMode, setQuickCalcInputMode] = useState<'price' | 'pips'>('price');
  const [quickCalcSLPips, setQuickCalcSLPips] = useState('30');
  const [isCustomLeverage, setIsCustomLeverage] = useState(false);
  const [customLeverageVal, setCustomLeverageVal] = useState('100');

  // Dropdown menus states
  const [isRiskDropdownOpen, setIsRiskDropdownOpen] = useState(false);
  const [isLeverageDropdownOpen, setIsLeverageDropdownOpen] = useState(false);
  const [isPipSizeDropdownOpen, setIsPipSizeDropdownOpen] = useState(false);

  // Risk presets list state
  const [riskPresets, setRiskPresets] = useState<any[]>(() => {
    const saved = localStorage.getItem('quick_calc_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.value - a.value);
        }
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: '1', name: isRtl ? 'اطمینان بالا (۱.۵٪)' : 'High Conviction (1.5%)', value: 1.5 },
      { id: '2', name: isRtl ? 'راه اندازی خوب (۱.۰٪)' : 'Good Setup (1.0%)', value: 1.0 },
      { id: '3', name: isRtl ? 'ریسک متوسط (۰.۵٪)' : 'Medium Risk (0.5%)', value: 0.5 },
      { id: '4', name: isRtl ? 'ریسک بالا (۰.۲۵٪)' : 'High Risk (0.25%)', value: 0.25 },
    ];
  });
  const [quickCalcRiskPresetId, setQuickCalcRiskPresetId] = useState<string>('2');

  // Preset management state
  const [isManagingPresets, setIsManagingPresets] = useState(false);
  const [presetManagerTab, setPresetManagerTab] = useState<'risk' | 'forex' | 'crypto'>('risk');
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetValue, setNewPresetValue] = useState('');
  const [newLeverageValue, setNewLeverageValue] = useState('');

  // Editing state for risk presets
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');
  const [editingPresetValue, setEditingPresetValue] = useState('');

  // Editing state for leverages
  const [editingLeverageIndex, setEditingLeverageIndex] = useState<number | null>(null);
  const [editingLeverageValStr, setEditingLeverageValStr] = useState<string>('');

  // Confirmation states for deletions (no window.confirm, fully in-app state-based)
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
  const [deletingLeverageIndex, setDeletingLeverageIndex] = useState<number | null>(null);

  // In-app alert error message for preset manager
  const [presetMgrError, setPresetMgrError] = useState<string | null>(null);

  // Dynamic leverage presets state
  const [forexLeverages, setForexLeverages] = useState<number[]>(() => {
    const saved = localStorage.getItem('quick_calc_forex_leverages');
    return saved ? JSON.parse(saved) : [10, 25, 50, 100, 200, 500];
  });
  const [cryptoLeverages, setCryptoLeverages] = useState<number[]>(() => {
    const saved = localStorage.getItem('quick_calc_crypto_leverages');
    return saved ? JSON.parse(saved) : [5, 10, 20, 50, 100];
  });

  // Persist quick calc balance
  useEffect(() => {
    localStorage.setItem('quick_calc_balance', quickCalcBalance);
  }, [quickCalcBalance]);

  // Persist presets
  useEffect(() => {
    localStorage.setItem('quick_calc_presets', JSON.stringify(riskPresets));
  }, [riskPresets]);

  // Persist leverages lists
  useEffect(() => {
    localStorage.setItem('quick_calc_forex_leverages', JSON.stringify(forexLeverages));
  }, [forexLeverages]);

  useEffect(() => {
    localStorage.setItem('quick_calc_crypto_leverages', JSON.stringify(cryptoLeverages));
  }, [cryptoLeverages]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('productivity_trades_v2', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('trading_initial_balance', initialBalance.toString());
  }, [initialBalance]);

  useEffect(() => {
    localStorage.setItem('trading_journal_currency', journalCurrency);
  }, [journalCurrency]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/trading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journalCurrency,
            initialBalance,
            trades,
            quickCalcBalance,
            riskPresets,
            forexLeverages,
            cryptoLeverages,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save trading journal data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    journalCurrency,
    initialBalance,
    trades,
    quickCalcBalance,
    riskPresets,
    forexLeverages,
    cryptoLeverages,
    isInitialLoaded,
  ]);

  // Handle capital change
  const handleSaveCapital = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val > 0) {
      setInitialBalance(val);
      setIsEditingBalance(false);
    }
  };

  // Quick Risk Calculator Translations Dictionary
  const calcTransDict = {
    fa: {
      title: "محاسبه‌گر سریع ریسک",
      subtitle: "محاسبه آنی حجم معامله و مدیریت سرمایه",
      forex: "فارکس",
      crypto: "کریپتو",
      balance: "سرمایه کل حساب",
      riskPreset: "سطح ریسک معامله",
      entryPrice: "قیمت ورود (Entry)",
      stopLoss: "حد ضرر (Stop Loss)",
      takeProfit: "حد سود اختیاری (Take Profit)",
      direction: "جهت معامله",
      long: "خرید (Long)",
      short: "فروش (Short)",
      leverage: "اهرم معاملاتی (Leverage)",
      pipSize: "واحد حرکت (Pip Size)",
      pipValue: "ارزش پیپ (به ازای لات استاندارد)",
      coin: "نام ارز / کوین",
      outputs: "خروجی‌های محاسبه شده",
      riskAmount: "مبلغ در معرض ریسک",
      positionSize: "حجم معامله (واحد)",
      positionSizeLots: "حجم معامله (لات)",
      rrRatio: "نسبت سود به ضرر (R:R)",
      requiredMargin: "مارجین مورد نیاز",
      liqPrice: "قیمت لیکوئید تقریبی",
      useInNewTrade: "اعمال در فرم ثبت معامله",
      copySize: "کپی حجم معامله",
      copied: "کپی شد!",
      presetMgr: "مدیریت سطوح ریسک",
      addPreset: "افزودن سطح ریسک",
      presetName: "عنوان ریسک",
      presetVal: "درصد ریسک (٪)",
      save: "ذخیره",
      cancel: "انصراف",
      pipMajor: "جفت ارزهای اصلی (0.0001)",
      pipJpy: "ین ژاپن و طلا (0.01)",
      pipOil: "نفت و شاخص‌ها (0.1)",
      pipCustom: "دلخواه / شاخص‌ها (1.0)",
      inputMode: "روش محاسباتی حد ضرر",
      byPrice: "براساس قیمت ورود/حد ضرر",
      byPips: "براساس فاصله تا استاپ (پیپ/٪)",
      customLeverage: "اهرم دلخواه...",
      noLeverage: "بدون اهرم (1x)",
      slDistancePips: "فاصله تا استاپ (پیپ)",
      slDistancePct: "فاصله تا استاپ (درصد ٪)",
    },
    en: {
      title: "Quick Risk Calculator",
      subtitle: "Instant position sizing & risk management",
      forex: "Forex",
      crypto: "Crypto",
      balance: "Account Balance",
      riskPreset: "Risk % Level",
      entryPrice: "Entry Price",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit (Optional)",
      direction: "Trade Direction",
      long: "Long / Buy",
      short: "Short / Sell",
      leverage: "Leverage",
      pipSize: "Pip Size",
      pipValue: "Pip Value (Per Standard Lot)",
      coin: "Coin Name",
      outputs: "Calculated Outputs",
      riskAmount: "Amount at Risk",
      positionSize: "Position Size (Units)",
      positionSizeLots: "Position Size (Lots)",
      rrRatio: "Risk:Reward Ratio",
      requiredMargin: "Required Margin",
      liqPrice: "Est. Liquidation Price",
      useInNewTrade: "Use in New Trade",
      copySize: "Copy Position Size",
      copied: "Copied!",
      presetMgr: "Manage Risk Presets",
      addPreset: "Add Risk Preset",
      presetName: "Preset Name",
      presetVal: "Risk % Value",
      save: "Save",
      cancel: "Cancel",
      pipMajor: "Major FX Pairs (0.0001)",
      pipJpy: "Gold & JPY Pairs (0.01)",
      pipOil: "Oil & Indices (0.1)",
      pipCustom: "Custom / Indices (1.0)",
      inputMode: "SL Calculation Mode",
      byPrice: "By Price (Entry/SL)",
      byPips: "By SL Distance (Pips/%)",
      customLeverage: "Custom Leverage...",
      noLeverage: "No Leverage (1x)",
      slDistancePips: "SL Distance (Pips)",
      slDistancePct: "SL Distance (%)",
    },
    de: {
      title: "Risiko-Rechner",
      subtitle: "Echtzeit-Positionsgröße & Risikomanagement",
      forex: "Forex",
      crypto: "Krypto",
      balance: "Kontostand",
      riskPreset: "Risikostufe %",
      entryPrice: "Einstiegspreis",
      stopLoss: "Stop Loss",
      takeProfit: "Take Profit (Optional)",
      direction: "Richtung",
      long: "Long / Kaufen",
      short: "Short / Verkaufen",
      leverage: "Hebel (Leverage)",
      pipSize: "Pip-Größe",
      pipValue: "Pip-Wert (pro Standard-Lot)",
      coin: "Coin-Name",
      outputs: "Berechnete Ergebnisse",
      riskAmount: "Risikobetrag",
      positionSize: "Positionsgröße (Einheiten)",
      positionSizeLots: "Positionsgröße (Lots)",
      rrRatio: "Risiko-Rendite-Verhältnis (R:R)",
      requiredMargin: "Erforderliche Margin",
      liqPrice: "Geschätzter Liquidation Price",
      useInNewTrade: "In neuem Trade nutzen",
      copySize: "Größe kopieren",
      copied: "Kopiert!",
      presetMgr: "Risikostufen verwalten",
      addPreset: "Stufe hinzufügen",
      presetName: "Bezeichnung",
      presetVal: "Risiko %",
      save: "Speichern",
      cancel: "Abbrechen",
      pipMajor: "Haupt-FX-Paare (0.0001)",
      pipJpy: "Gold & JPY-Paare (0.01)",
      pipOil: "Öl & Indizes (0.1)",
      pipCustom: "Benutzerdefiniert (1.0)",
      inputMode: "SL-Modus",
      byPrice: "Nach Preis (Einstieg & SL)",
      byPips: "Nach SL-Abstand (Pips/%)",
      customLeverage: "Benutzerdefinierter Hebel...",
      noLeverage: "Kein Hebel (1x)",
      slDistancePips: "SL-Abstand (Pips)",
      slDistancePct: "SL-Abstand (%)",
    }
  };
  const calcTrans = calcTransDict[language as 'fa' | 'en' | 'de'] || calcTransDict.en;

  // Quick Risk Calculator Dynamic Calculations
  const qCalcBalance = Number(quickCalcBalance) || initialBalance || 10000;
  const qCalcSelectedPreset = riskPresets.find(p => p.id === quickCalcRiskPresetId);
  const qCalcRiskPercent = qCalcSelectedPreset ? qCalcSelectedPreset.value : 1.0;
  const qCalcRiskAmount = qCalcBalance * (qCalcRiskPercent / 100);

  const qCalcEntryNum = parseFloat(quickCalcEntry) || 0;
  const qCalcSLNum = parseFloat(quickCalcSL) || 0;
  const qCalcTPNum = parseFloat(quickCalcTP) || 0;

  const [copiedSizeText, setCopiedSizeText] = useState(false);

  // Determine effective leverage
  const effectiveLeverage = isCustomLeverage ? (Number(customLeverageVal) || 1) : quickCalcLeverage;

  // Determine effective Stop Loss Price based on Input Mode (Price vs Pips/Distance)
  const effectiveSL = useMemo(() => {
    const entry = parseFloat(quickCalcEntry) || 0;
    if (entry <= 0) return 0;

    if (quickCalcInputMode === 'price') {
      return parseFloat(quickCalcSL) || 0;
    } else {
      // Pips Mode / Distance Mode
      const distVal = parseFloat(quickCalcSLPips) || 0;
      if (distVal <= 0) return 0;

      if (quickCalcMode === 'forex') {
        // SL Distance in Pips
        if (quickCalcDirection === 'Long') {
          return entry - (distVal * quickCalcPipSize);
        } else {
          return entry + (distVal * quickCalcPipSize);
        }
      } else {
        // SL Distance in Percent (%) for Crypto
        if (quickCalcDirection === 'Long') {
          return entry * (1 - (distVal / 100));
        } else {
          return entry * (1 + (distVal / 100));
        }
      }
    }
  }, [quickCalcInputMode, quickCalcSL, quickCalcSLPips, quickCalcEntry, quickCalcMode, quickCalcDirection, quickCalcPipSize]);

  // Real-time calculated results memoized
  const qCalcResults = useMemo(() => {
    let rrRatio = 0;
    const entry = parseFloat(quickCalcEntry) || 0;
    const tp = parseFloat(quickCalcTP) || 0;
    const sl = effectiveSL;

    if (entry > 0 && sl > 0 && tp > 0) {
      const rDistance = Math.abs(entry - sl);
      const wDistance = Math.abs(tp - entry);
      if (rDistance > 0) {
        rrRatio = wDistance / rDistance;
      }
    }

    let positionSizeLots = 0;
    let positionSizeUnits = 0;
    let requiredMargin = 0;
    let estLiqPrice = 0;

    if (quickCalcMode === 'forex') {
      if (entry > 0 && sl > 0) {
        const pipDistance = Math.abs(entry - sl) / quickCalcPipSize;
        if (pipDistance > 0) {
          // Lots = Risk Amount / (Pip Distance * Pip Value per lot)
          positionSizeLots = qCalcRiskAmount / (pipDistance * quickCalcPipValue);
          positionSizeUnits = positionSizeLots * 100000;
          requiredMargin = (positionSizeUnits * entry) / effectiveLeverage;
        }
      }
    } else {
      // Crypto Mode
      if (entry > 0 && sl > 0) {
        const priceDistancePct = Math.abs(entry - sl) / entry;
        if (priceDistancePct > 0) {
          const positionSizeUSD = qCalcRiskAmount / priceDistancePct;
          positionSizeUnits = positionSizeUSD / entry; // In Coin units (like BTC)
          requiredMargin = positionSizeUSD / effectiveLeverage;
          
          if (quickCalcDirection === 'Long') {
            estLiqPrice = entry * (1 - 1 / effectiveLeverage);
          } else {
            estLiqPrice = entry * (1 + 1 / effectiveLeverage);
          }
        }
      }
    }

    return {
      riskAmount: qCalcRiskAmount,
      rrRatio,
      positionSizeLots,
      positionSizeUnits,
      requiredMargin,
      estLiqPrice,
      effectiveSLPrice: sl
    };
  }, [
    quickCalcMode,
    qCalcBalance,
    qCalcRiskPercent,
    qCalcRiskAmount,
    quickCalcEntry,
    quickCalcTP,
    effectiveSL,
    effectiveLeverage,
    quickCalcPipSize,
    quickCalcPipValue,
    quickCalcDirection
  ]);

  const handleCopyPositionSize = () => {
    const valueToCopy = quickCalcMode === 'forex' 
      ? qCalcResults.positionSizeLots.toFixed(2) 
      : qCalcResults.positionSizeUnits.toFixed(4);
    navigator.clipboard.writeText(valueToCopy);
    setCopiedSizeText(true);
    setTimeout(() => setCopiedSizeText(false), 1500);
  };

  const handleUseInNewTrade = () => {
    let assetName = '';
    if (quickCalcMode === 'forex') {
      assetName = 'EUR/USD';
    } else {
      assetName = `${quickCalcCoin.toUpperCase()}/USDT`;
    }

    const slVal = qCalcResults.effectiveSLPrice > 0 
      ? (quickCalcMode === 'forex' ? qCalcResults.effectiveSLPrice.toFixed(5) : qCalcResults.effectiveSLPrice.toFixed(2))
      : quickCalcSL;

    // Set form fields
    setFormAsset(assetName);
    setFormDirection(quickCalcDirection);
    setFormEntry(quickCalcEntry);
    setFormSL(slVal);
    setFormTP(quickCalcTP);
    setFormRisk(qCalcRiskPercent.toString());
    setFormSize(parseFloat(qCalcResults.positionSizeUnits.toFixed(4)).toString());

    // Clean outputs
    setFormExit('');
    setFormPnL('');
    setFormNotes(isRtl ? `محاسبه شده با مدیریت ریسک: ${qCalcRiskPercent}%` : `Calculated using Risk Calculator: ${qCalcRiskPercent}%`);

    // Toggle view
    setIsFormOpen(true);
    setFormTab('pre');
    setIsQuickCalcOpen(false);
  };

  const handleAddPreset = () => {
    setPresetMgrError(null);
    const val = parseFloat(newPresetValue);
    if (!newPresetName.trim() || isNaN(val) || val <= 0) {
      setPresetMgrError(isRtl ? 'لطفا نام و درصد ریسک معتبری وارد کنید.' : 'Please enter a valid name and risk percentage.');
      return;
    }
    const newPreset = {
      id: Date.now().toString(),
      name: `${newPresetName.trim()} (${val}%)`,
      value: val
    };
    setRiskPresets(prev => [...prev, newPreset].sort((a, b) => b.value - a.value));
    setQuickCalcRiskPresetId(newPreset.id);
    setNewPresetName('');
    setNewPresetValue('');
  };

  const handleSaveEditPreset = (id: string) => {
    setPresetMgrError(null);
    const val = parseFloat(editingPresetValue);
    if (!editingPresetName.trim() || isNaN(val) || val <= 0) {
      setPresetMgrError(isRtl ? 'مقادیر وارد شده معتبر نیستند.' : 'The values entered are not valid.');
      return;
    }
    setRiskPresets(prev => prev.map(p => p.id === id ? { ...p, name: `${editingPresetName.trim()} (${val}%)`, value: val } : p).sort((a, b) => b.value - a.value));
    setEditingPresetId(null);
  };

  const handleDeletePreset = (id: string) => {
    setPresetMgrError(null);
    if (riskPresets.length <= 1) {
      setPresetMgrError(isRtl ? 'حداقل باید یک سطح ریسک وجود داشته باشد.' : 'You must keep at least one risk preset.');
      return;
    }
    setRiskPresets(prev => prev.filter(p => p.id !== id));
    if (quickCalcRiskPresetId === id) {
      const remaining = riskPresets.filter(p => p.id !== id);
      setQuickCalcRiskPresetId(remaining[0].id);
    }
    setDeletingPresetId(null);
  };

  const handleAddLeveragePreset = (val: number, type: 'forex' | 'crypto') => {
    setPresetMgrError(null);
    if (isNaN(val) || val <= 0) {
      setPresetMgrError(isRtl ? 'لطفا اهرم معتبری وارد کنید.' : 'Please enter a valid leverage.');
      return;
    }
    if (type === 'forex') {
      if (forexLeverages.includes(val)) {
        setPresetMgrError(isRtl ? 'این اهرم از قبل در لیست وجود دارد.' : 'This leverage already exists in the list.');
        return;
      }
      setForexLeverages(prev => [...prev, val].sort((a, b) => a - b));
    } else {
      if (cryptoLeverages.includes(val)) {
        setPresetMgrError(isRtl ? 'این اهرم از قبل در لیست وجود دارد.' : 'This leverage already exists in the list.');
        return;
      }
      setCryptoLeverages(prev => [...prev, val].sort((a, b) => a - b));
    }
  };

  const handleDeleteLeverage = (index: number, type: 'forex' | 'crypto') => {
    setPresetMgrError(null);
    if (type === 'forex') {
      if (forexLeverages.length <= 1) {
        setPresetMgrError(isRtl ? 'حداقل باید یک اهرم وجود داشته باشد.' : 'You must keep at least one leverage preset.');
        return;
      }
      const valToRemove = forexLeverages[index];
      setForexLeverages(prev => prev.filter((_, i) => i !== index));
      if (quickCalcLeverage === valToRemove) {
        const remaining = forexLeverages.filter((_, i) => i !== index);
        setQuickCalcLeverage(remaining[0] || 1);
      }
    } else {
      if (cryptoLeverages.length <= 1) {
        setPresetMgrError(isRtl ? 'حداقل باید یک اهرم وجود داشته باشد.' : 'You must keep at least one leverage preset.');
        return;
      }
      const valToRemove = cryptoLeverages[index];
      setCryptoLeverages(prev => prev.filter((_, i) => i !== index));
      if (quickCalcLeverage === valToRemove) {
        const remaining = cryptoLeverages.filter((_, i) => i !== index);
        setQuickCalcLeverage(remaining[0] || 1);
      }
    }
    setDeletingLeverageIndex(null);
  };

  const handleSaveEditLeverage = (index: number, newValStr: string, type: 'forex' | 'crypto') => {
    setPresetMgrError(null);
    const newVal = parseInt(newValStr, 10);
    if (isNaN(newVal) || newVal <= 0) {
      setPresetMgrError(isRtl ? 'لطفا اهرم معتبری وارد کنید.' : 'Please enter a valid leverage.');
      return;
    }
    
    if (type === 'forex') {
      const oldVal = forexLeverages[index];
      if (forexLeverages.includes(newVal) && newVal !== oldVal) {
        setPresetMgrError(isRtl ? 'این اهرم از قبل وجود دارد.' : 'This leverage already exists.');
        return;
      }
      setForexLeverages(prev => prev.map((l, i) => i === index ? newVal : l).sort((a, b) => a - b));
      if (quickCalcLeverage === oldVal) {
        setQuickCalcLeverage(newVal);
      }
    } else {
      const oldVal = cryptoLeverages[index];
      if (cryptoLeverages.includes(newVal) && newVal !== oldVal) {
        setPresetMgrError(isRtl ? 'این اهرم از قبل وجود دارد.' : 'This leverage already exists.');
        return;
      }
      setCryptoLeverages(prev => prev.map((l, i) => i === index ? newVal : l).sort((a, b) => a - b));
      if (quickCalcLeverage === oldVal) {
        setQuickCalcLeverage(newVal);
      }
    }
    setEditingLeverageIndex(null);
  };

  // Reset Form Fields helper
  const resetForm = () => {
    setFormAsset('');
    setFormDirection('Long');
    setFormEntry('');
    setFormSL('');
    setFormTP('');
    setFormRisk('1');
    setFormSize('');
    setFormLeverage('1');
    setFormExit('');
    setFormExitDate(new Date().toISOString().split('T')[0]);
    setFormExitTime('12:00');
    setFormPnL('');
    setFormSetups([POPULAR_SETUPS[0]]);
    setFormCustomSetup('');
    setFormPsy(PSYCHOLOGICAL_STATES[0]);
    setFormDiscipline(5);
    setFormScreenshot('');
    setFormNotes('');
    setFormTab('pre');
    setFormError(null);
  };

  // Pre-fill size and auto calculate helper
  const handleAutoCalcPositionSize = () => {
    const ent = parseFloat(formEntry);
    const sl = parseFloat(formSL);
    const rsk = parseFloat(formRisk);
    if (!isNaN(ent) && !isNaN(sl) && !isNaN(rsk) && ent !== sl) {
      const dollarRisk = (initialBalance * rsk) / 100;
      const riskPerAsset = Math.abs(ent - sl);
      const calculatedSize = dollarRisk / riskPerAsset;
      setFormSize(parseFloat(calculatedSize.toFixed(4)).toString());
    }
  };

  // Auto calculate net P&L
  const handleAutoCalcPnL = () => {
    const ent = parseFloat(formEntry);
    const ex = parseFloat(formExit);
    const sz = parseFloat(formSize);
    if (!isNaN(ent) && !isNaN(ex) && !isNaN(sz)) {
      const pnl = formDirection === 'Long' ? (ex - ent) * sz : (ent - ex) * sz;
      setFormPnL(parseFloat(pnl.toFixed(2)).toString());
    }
  };

  // Log Trade submission
  const handleSaveTrade = () => {
    const asset = formAsset.trim().toUpperCase();
    const entry = parseFloat(formEntry);
    const sl = parseFloat(formSL);
    const tp = parseFloat(formTP);
    const exit = parseFloat(formExit);
    const size = parseFloat(formSize);
    const pnl = parseFloat(formPnL);
    const risk = parseFloat(formRisk);

    const lev = parseFloat(formLeverage) || 1;

    if (!asset || isNaN(entry) || isNaN(sl) || isNaN(tp) || isNaN(exit) || isNaN(size) || isNaN(pnl)) {
      setFormError(trans.validationError);
      return;
    }

    // Determine Setup Name (can be multiple selected joined by comma)
    let finalSetupsList = [...formSetups].filter(s => s !== 'Custom');
    if (formSetups.includes('Custom') && formCustomSetup.trim()) {
      finalSetupsList.push(formCustomSetup.trim());
    }
    const finalSetup = finalSetupsList.length > 0 ? finalSetupsList.join(', ') : 'General';

    // R-Multiple
    const denominator = formDirection === 'Long' ? (entry - sl) : (sl - entry);
    const change = formDirection === 'Long' ? (exit - entry) : (entry - exit);
    const rMultiple = denominator !== 0 ? parseFloat((change / denominator).toFixed(2)) : 0;

    // Pick Screenshot
    const screenshot = formScreenshot.trim() || MOCK_CHARTS[Math.floor(Math.random() * MOCK_CHARTS.length)];

    const newTrade: Trade = {
      id: `t-${Date.now()}`,
      date: formExitDate,
      time: formExitTime,
      asset,
      direction: formDirection,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit: tp,
      exitPrice: exit,
      riskPercentage: isNaN(risk) ? 1 : risk,
      positionSize: size,
      netPnL: pnl,
      R_Multiple: rMultiple,
      setupType: finalSetup || 'General',
      psychologicalState: formPsy,
      disciplineRating: formDiscipline,
      screenshots: [screenshot],
      notes: formNotes.trim(),
      leverage: lev
    };

    setTrades(prev => [newTrade, ...prev]);
    setIsFormOpen(false);
    resetForm();
  };

  // Delete trade
  const handleDeleteTrade = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTradeToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (tradeToDelete) {
      setTrades(prev => prev.filter(t => t.id !== tradeToDelete));
      if (expandedRowId === tradeToDelete) setExpandedRowId(null);
      setTradeToDelete(null);
    }
  };

  // Export to CSV Format
  const handleExportToCSVFile = () => {
    const headers = [
      'Trade ID',
      'Date & Time',
      'Asset/Pair',
      'Leverage',
      'Direction (Long/Short)',
      'Setup Type',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'Exit Price',
      'Net P&L',
      'Growth %',
      'Final Balance',
      'Risk/Reward (R)',
      'Discipline Rating',
      'Mental State',
      'Notes'
    ];

    const currencySymbol = journalCurrency === 'USD' ? '$' : '€';

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = sortedChronologicalTrades.map((trade) => {
      const ledger = ledgerMap[trade.id] || { before: initialBalance, after: initialBalance, growth: 0 };
      
      let formattedPnL = '0.00';
      if (trade.netPnL > 0) {
        formattedPnL = `+${currencySymbol}${trade.netPnL.toFixed(2)}`;
      } else if (trade.netPnL < 0) {
        formattedPnL = `-${currencySymbol}${Math.abs(trade.netPnL).toFixed(2)}`;
      }

      let formattedGrowth = '0.00%';
      if (ledger.growth > 0) {
        formattedGrowth = `+${ledger.growth.toFixed(2)}%`;
      } else if (ledger.growth < 0) {
        formattedGrowth = `${ledger.growth.toFixed(2)}%`;
      }

      const formattedDateTime = `${trade.date} ${trade.time || '12:00'}`;

      return [
        trade.id,
        formattedDateTime,
        trade.asset,
        trade.leverage ? `${trade.leverage}x` : '1x',
        trade.direction,
        trade.setupType,
        trade.entryPrice,
        trade.stopLoss,
        trade.takeProfit,
        trade.exitPrice,
        formattedPnL,
        formattedGrowth,
        `${currencySymbol}${ledger.after.toFixed(2)}`,
        `${trade.R_Multiple > 0 ? '+' : ''}${trade.R_Multiple}R`,
        trade.disciplineRating,
        trade.psychologicalState,
        trade.notes || ''
      ].map(escapeCSV);
    });

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trading_journal_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- IMPORT EXCEL/CSV FOR TRADING JOURNAL ---
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error' | null; message: string; data?: Trade[] }>({ type: null, message: '' });

  const handleDownloadTradeTemplate = () => {
    const headers = ['date', 'asset', 'direction', 'entryPrice', 'exitPrice', 'stopLoss', 'takeProfit', 'netPnL', 'positionSize', 'setupType', 'psychologicalState', 'notes'];
    const sampleData = [
      {
        date: '2026-07-09',
        asset: 'BTC/USDT',
        direction: 'Long',
        entryPrice: 58500,
        exitPrice: 61200,
        stopLoss: 57200,
        takeProfit: 62000,
        netPnL: 270,
        positionSize: 0.1,
        setupType: 'Support Bounce',
        psychologicalState: '🧠 Focused & Calm',
        notes: 'Sample entry on daily support test'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trades Template");
    XLSX.writeFile(wb, "trading_journal_template.xlsx");
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json<any>(ws);

        if (!jsonData || jsonData.length === 0) {
          setImportFeedback({
            type: 'error',
            message: isRtl ? 'فایل خالی است یا فرمت آن پشتیبانی نمی‌شود.' : 'File is empty or format is unsupported.'
          });
          return;
        }

        const parsedTrades: Trade[] = [];

        jsonData.forEach((row: any, index: number) => {
          // Normalize keys to lowercase and remove spaces/underscores
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const normKey = key.toLowerCase().replace(/[\s_-]/g, '').trim();
            normalizedRow[normKey] = row[key];
          });

          // Match relevant fields
          // Date
          const rawDate = normalizedRow['date'] || normalizedRow['تاریخ'] || normalizedRow['time'] || normalizedRow['زمان'] || new Date().toISOString().split('T')[0];
          // Asset
          const asset = String(normalizedRow['asset'] || normalizedRow['نماد'] || normalizedRow['جفتارز'] || 'UNKNOWN').toUpperCase();
          // Direction
          let direction: 'Long' | 'Short' = 'Long';
          const rawDirection = String(normalizedRow['direction'] || normalizedRow['جهت'] || '').toLowerCase();
          if (rawDirection.includes('short') || rawDirection.includes('sell') || rawDirection.includes('فروش') || rawDirection.includes('شورت') || rawDirection.includes('s')) {
            direction = 'Short';
          }

          // Prices
          const entryPrice = parseFloat(String(normalizedRow['entryprice'] || normalizedRow['قیمتورود'] || normalizedRow['entry'] || 0).replace(/,/g, '')) || 0;
          const exitPrice = parseFloat(String(normalizedRow['exitprice'] || normalizedRow['قیمتخروج'] || normalizedRow['exit'] || 0).replace(/,/g, '')) || 0;
          const stopLoss = parseFloat(String(normalizedRow['stoploss'] || normalizedRow['حدضرر'] || normalizedRow['sl'] || 0).replace(/,/g, '')) || 0;
          const takeProfit = parseFloat(String(normalizedRow['takeprofit'] || normalizedRow['حدسود'] || normalizedRow['tp'] || 0).replace(/,/g, '')) || 0;
          
          // Net PnL
          let netPnL = parseFloat(String(normalizedRow['netpnl'] || normalizedRow['سودزیان'] || normalizedRow['pnl'] || normalizedRow['سود'] || 0).replace(/,/g, '')) || 0;

          // Position size
          const positionSize = parseFloat(String(normalizedRow['positionsize'] || normalizedRow['حجم'] || normalizedRow['size'] || normalizedRow['حجممعامله'] || 1).replace(/,/g, '')) || 1;

          // Leverage
          const leverage = parseFloat(String(normalizedRow['leverage'] || normalizedRow['اهرم'] || 1)) || 1;

          // Risk percentage
          const riskPercentage = parseFloat(String(normalizedRow['riskpercentage'] || normalizedRow['riskpct'] || normalizedRow['ریسک'] || 1)) || 1;

          // R multiple
          let rMultiple = parseFloat(String(normalizedRow['rmultiple'] || normalizedRow['r'] || 0)) || 0;
          if (rMultiple === 0 && entryPrice !== stopLoss) {
            const riskAmount = Math.abs(entryPrice - stopLoss);
            const profitAmount = exitPrice - entryPrice;
            rMultiple = riskAmount > 0 ? (direction === 'Long' ? profitAmount / riskAmount : -profitAmount / riskAmount) : 0;
          }

          // Setup
          const setupType = String(normalizedRow['setuptype'] || normalizedRow['استراتژی'] || normalizedRow['setup'] || 'Imported Setup');
          
          // Psy
          const psychologicalState = String(normalizedRow['psychologicalstate'] || normalizedRow['روانشناسی'] || normalizedRow['psy'] || '🧠 Focused & Calm');

          // Notes
          const notes = String(normalizedRow['notes'] || normalizedRow['یادداشت'] || normalizedRow['توضیحات'] || '');

          // Discipline rating
          const disciplineRating = parseInt(String(normalizedRow['disciplinerating'] || normalizedRow['نظم'] || normalizedRow['امتیاز'] || 5)) || 5;

          // Push
          parsedTrades.push({
            id: 'imported-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(2, 8),
            date: String(rawDate),
            time: '12:00',
            asset,
            direction,
            entryPrice,
            stopLoss,
            takeProfit,
            exitPrice,
            riskPercentage,
            positionSize,
            netPnL,
            R_Multiple: parseFloat(rMultiple.toFixed(2)),
            setupType,
            psychologicalState,
            disciplineRating,
            screenshots: [],
            notes,
            leverage
          });
        });

        if (parsedTrades.length > 0) {
          setImportFeedback({
            type: 'success',
            message: isRtl 
              ? `تعداد ${parsedTrades.length} معامله با موفقیت شناسایی شد. برای ثبت نهایی روی دکمه ذخیره کلیک کنید.` 
              : `Found ${parsedTrades.length} trades. Click Save below to confirm import.`,
            data: parsedTrades
          });
        } else {
          setImportFeedback({
            type: 'error',
            message: isRtl ? 'هیچ معامله معتبری یافت نشد.' : 'No valid trades found in file.'
          });
        }
      } catch (err) {
        setImportFeedback({
          type: 'error',
          message: isRtl ? 'خطا در خواندن فایل. لطفاً از فرمت استاندارد استفاده کنید.' : 'Failed to parse file. Please use a valid spreadsheet.'
        });
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input value so same file can be imported again and prevent double triggers
    try {
      event.target.value = '';
    } catch (err) {
      console.warn('Could not reset file input value', err);
    }
  };

  const handleExportTradingJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          trades,
          journalCurrency,
          initialBalance
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export trading journal JSON:", error);
    }
  };

  const handleImportTradingJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.trades)) {
          setTrades(parsed.trades);
          if (parsed.journalCurrency) setJournalCurrency(parsed.journalCurrency);
          if (parsed.initialBalance !== undefined) setInitialBalance(Number(parsed.initialBalance));
          
          alert(isRtl ? "ژورنال معامله با موفقیت از فایل JSON بازیابی شد!" : "Trading journal successfully restored from JSON backup!");
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

  const handleConfirmImport = () => {
    const dataToImport = importFeedback.data;
    if (!dataToImport || dataToImport.length === 0) return;

    // Reset feedback synchronously so subsequent clicks do nothing!
    setImportFeedback({ type: null, message: '' });
    setImportModalOpen(false);

    setTrades(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const uniqueImported = dataToImport.filter(t => !existingIds.has(t.id));
      const combined = [...uniqueImported, ...prev];
      
      // Strict de-duplication of the entire array by ID to guarantee no duplicate keys
      const finalTrades: Trade[] = [];
      const seen = new Set<string>();
      combined.forEach(t => {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          finalTrades.push(t);
        }
      });
      return finalTrades;
    });
  };

  // Export to Excel (.xlsx format with native columns and auto-fitting)
  const handleExportToExcelFile = () => {
    const headers = [
      'Trade ID',
      'Date & Time',
      'Asset/Pair',
      'Leverage',
      'Direction (Long/Short)',
      'Setup Type',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'Exit Price',
      'Net P&L',
      'Growth %',
      'Final Balance',
      'Risk/Reward (R)',
      'Discipline Rating',
      'Mental State',
      'Notes'
    ];

    const currencySymbol = journalCurrency === 'USD' ? '$' : '€';

    const rows = sortedChronologicalTrades.map((trade) => {
      const ledger = ledgerMap[trade.id] || { before: initialBalance, after: initialBalance, growth: 0 };
      
      let formattedPnL = '0.00';
      if (trade.netPnL > 0) {
        formattedPnL = `+${currencySymbol}${trade.netPnL.toFixed(2)}`;
      } else if (trade.netPnL < 0) {
        formattedPnL = `-${currencySymbol}${Math.abs(trade.netPnL).toFixed(2)}`;
      }

      let formattedGrowth = '0.00%';
      if (ledger.growth > 0) {
        formattedGrowth = `+${ledger.growth.toFixed(2)}%`;
      } else if (ledger.growth < 0) {
        formattedGrowth = `${ledger.growth.toFixed(2)}%`;
      }

      const formattedDateTime = `${trade.date} ${trade.time || '12:00'}`;

      return [
        trade.id,
        formattedDateTime,
        trade.asset,
        trade.leverage ? `${trade.leverage}x` : '1x',
        trade.direction,
        trade.setupType,
        trade.entryPrice,
        trade.stopLoss,
        trade.takeProfit,
        trade.exitPrice,
        formattedPnL,
        formattedGrowth,
        `${currencySymbol}${ledger.after.toFixed(2)}`,
        `${trade.R_Multiple > 0 ? '+' : ''}${trade.R_Multiple}R`,
        trade.disciplineRating,
        trade.psychologicalState,
        trade.notes || ''
      ];
    });

    const wsData = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit column widths
    const max_cols = headers.length;
    const wscols = [];
    for (let i = 0; i < max_cols; i++) {
      let max_len = headers[i].length;
      for (let r = 1; r < wsData.length; r++) {
        const val_len = wsData[r][i] ? String(wsData[r][i]).length : 0;
        if (val_len > max_len) max_len = val_len;
      }
      wscols.push({ wch: max_len + 3 }); // add margin
    }
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Trading Journal');
    XLSX.writeFile(wb, `trading_journal_export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // CHRONOLOGICAL METRICS & LEDGER MAP CALCULATIONS
  const sortedChronologicalTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return timeA - timeB;
    });
  }, [trades]);

  const { ledgerMap, liveBalance } = useMemo(() => {
    const map: { [id: string]: { before: number; after: number; growth: number } } = {};
    let running = initialBalance;
    sortedChronologicalTrades.forEach((t) => {
      const before = running;
      const after = running + t.netPnL;
      const growth = before > 0 ? (t.netPnL / before) * 100 : 0;
      map[t.id] = { before, after, growth };
      running = after;
    });
    return { ledgerMap: map, liveBalance: running };
  }, [sortedChronologicalTrades, initialBalance]);

  // EXECUTIVE ANALYTICS CARD VALUES
  const totalPnL = useMemo(() => trades.reduce((sum, t) => sum + t.netPnL, 0), [trades]);
  const netROI = useMemo(() => (initialBalance > 0 ? (totalPnL / initialBalance) * 100 : 0), [totalPnL, initialBalance]);
  const winCount = useMemo(() => trades.filter(t => t.netPnL > 0).length, [trades]);
  const lossCount = useMemo(() => trades.filter(t => t.netPnL < 0).length, [trades]);
  const winRate = useMemo(() => (trades.length > 0 ? (winCount / trades.length) * 100 : 0), [winCount, trades]);

  const profitFactor = useMemo(() => {
    const grossProfits = trades.filter(t => t.netPnL > 0).reduce((sum, t) => sum + t.netPnL, 0);
    const grossLosses = Math.abs(trades.filter(t => t.netPnL < 0).reduce((sum, t) => sum + t.netPnL, 0));
    return grossLosses > 0 ? parseFloat((grossProfits / grossLosses).toFixed(2)) : (grossProfits > 0 ? grossProfits : 1.0);
  }, [trades]);

  const maxDrawdown = useMemo(() => {
    let peak = initialBalance;
    let maxDD = 0;
    let current = initialBalance;
    sortedChronologicalTrades.forEach((t) => {
      current += t.netPnL;
      if (current > peak) {
        peak = current;
      }
      const dd = peak > 0 ? ((peak - current) / peak) * 100 : 0;
      if (dd > maxDD) {
        maxDD = dd;
      }
    });
    return parseFloat(maxDD.toFixed(2));
  }, [sortedChronologicalTrades, initialBalance]);

  // CHARTS DATA COMPILATION
  const equityCurveData = useMemo(() => {
    let current = initialBalance;
    const curve = [{ name: 'Start', balance: initialBalance, date: '', asset: '', netPnL: 0 }];
    sortedChronologicalTrades.forEach((t, i) => {
      current += t.netPnL;
      curve.push({
        name: `T-${i+1}`,
        balance: parseFloat(current.toFixed(2)),
        date: t.date,
        asset: t.asset,
        netPnL: t.netPnL
      });
    });
    return curve;
  }, [sortedChronologicalTrades, initialBalance]);

  const setupPerformanceData = useMemo(() => {
    const group: { [setup: string]: number } = {};
    trades.forEach((t) => {
      if (t.setupType) {
        // Split multi-setup trades and allocate netPnL to each setup strategy
        const parts = t.setupType.split(', ').map(s => s.trim()).filter(Boolean);
        parts.forEach(s => {
          group[s] = (group[s] || 0) + t.netPnL;
        });
      }
    });
    return Object.entries(group).map(([name, pnl]) => ({
      name,
      PnL: parseFloat(pnl.toFixed(2))
    })).sort((a, b) => b.PnL - a.PnL);
  }, [trades]);

  const psychologyPieData = useMemo(() => {
    const group: { [psy: string]: { value: number; pnl: number } } = {};
    trades.forEach((t) => {
      const corePsy = t.psychologicalState.split(' ').slice(1).join(' ') || t.psychologicalState;
      if (!group[corePsy]) {
        group[corePsy] = { value: 0, pnl: 0 };
      }
      group[corePsy].value += 1;
      group[corePsy].pnl += t.netPnL;
    });

    return Object.entries(group).map(([name, data]) => ({
      name,
      value: data.value,
      pnl: parseFloat(data.pnl.toFixed(2))
    }));
  }, [trades]);

  const PSY_COLORS = ['#38bdf8', '#34d399', '#f87171', '#fb923c', '#f472b6', '#a78bfa', '#fb7185'];

  // SEARCH AND FILTER TRADES
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchSearch = 
        t.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.setupType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchSetup = setupFilter === 'All' || 
        t.setupType.split(', ').map(s => s.trim().toLowerCase()).includes(setupFilter.toLowerCase());
      const matchDirection = directionFilter === 'All' || t.direction === directionFilter;
      
      return matchSearch && matchSetup && matchDirection;
    });
  }, [trades, searchQuery, setupFilter, directionFilter]);

  // Unique setups for filtering
  const allUniqueSetups = useMemo(() => {
    const set = new Set<string>();
    trades.forEach(t => {
      if (t.setupType) {
        t.setupType.split(', ').forEach(s => {
          if (s.trim()) set.add(s.trim());
        });
      }
    });
    return Array.from(set);
  }, [trades]);

  // Recharts Custom Tooltip for Equity Curve
  const CustomEquityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.name === 'Start') {
        return (
          <div className="bg-[#110e2e]/95 border border-white/10 p-3 rounded-xl shadow-2xl font-mono text-xs text-white">
            <p className="text-slate-400 font-bold mb-1">Account Starting Point</p>
            <p className="flex justify-between gap-6" dir="ltr">
              <span>Capital:</span> 
              {formatJournalValue(data.balance, "font-bold text-yellow-400")}
            </p>
          </div>
        );
      }
      return (
        <div className="bg-[#110e2e]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl font-mono text-xs text-white">
          <p className="text-indigo-300 font-bold mb-1" dir="ltr">{digitsToPersian(data.date)}</p>
          <p className="flex justify-between gap-6 mb-1" dir="ltr">
            <span>Asset:</span> 
            <span className="font-bold text-cyan-400">{data.asset}</span>
          </p>
          <p className="flex justify-between gap-6 mb-1" dir="ltr">
            <span>Trade P&L:</span> 
            {formatJournalPnL(data.netPnL, `font-bold ${data.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`)}
          </p>
          <div className="border-t border-white/10 mt-1.5 pt-1.5 flex justify-between gap-6" dir="ltr">
            <span>Account Equity:</span> 
            {formatJournalValue(data.balance, "font-bold text-yellow-400")}
          </div>
        </div>
      );
    }
    return null;
  };

  const getSyncBadge = () => {
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در trading_data.json' : 'Saved to trading_data.json'}>
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
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Title & Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-5 glass-panel gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 flex flex-wrap items-center gap-2.5">
            <Brain className="w-6 h-6 text-cyan-400 animate-pulse shrink-0" />
            <span>{trans.title}</span>
            {getSyncBadge()}
          </h1>
          <p className="text-xs text-slate-400 font-vazir">{trans.subtitle}</p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportTradingJSON}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 hover:text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title={isRtl ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
          >
            <Download className="w-4 h-4 text-cyan-300" />
            <span>{isRtl ? 'خروجی JSON' : 'Export JSON'}</span>
          </button>

          <label className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 hover:text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-300" />
            <span>{isRtl ? 'وارد کردن JSON' : 'Import JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTradingJSON}
              className="hidden"
            />
          </label>

          <button 
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title={trans.exportData}
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>{trans.exportData}</span>
          </button>

          <button 
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            title={isRtl ? 'ورود اکسل/CSV' : 'Import Excel/CSV'}
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{isRtl ? 'ورود اکسل/CSV' : 'Import Excel/CSV'}</span>
          </button>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{trans.addTradeBtn}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE ANALYTICS: SUMMARY GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Metric 1: Live Account Balance */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="space-y-1.5">
            <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.liveBalance}</span>
            <div className="text-xl md:text-2xl lg:text-3xl font-black font-mono text-white flex items-baseline gap-1 break-all">
              {formatJournalValue(liveBalance)}
            </div>
            
            {/* Start Balance Editable Inline Toggle */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
              {isEditingBalance ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-1 w-full">
                    <input 
                      type="number"
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded px-1.5 py-1 text-xs text-white font-mono outline-none focus:border-cyan-400"
                    />
                    <button 
                      onClick={handleSaveCapital}
                      className="bg-emerald-500 hover:bg-emerald-400 p-1.5 rounded text-white text-xs cursor-pointer shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Currency selector inside editing mode */}
                  <div className="grid grid-cols-2 gap-1 bg-black/40 border border-white/5 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setJournalCurrency('USD')}
                      className={`py-1 rounded text-[10px] font-black transition-all ${journalCurrency === 'USD' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {language === 'fa' ? 'دلار ($)' : 'USD ($)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalCurrency('EUR')}
                      className={`py-1 rounded text-[10px] font-black transition-all ${journalCurrency === 'EUR' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {language === 'fa' ? 'یورو (€)' : 'EUR (€)'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full text-xs text-slate-400 font-vazir">
                  <span className="flex items-center gap-1">
                    <span>{trans.initialBalance}:</span> 
                    {formatJournalValue(initialBalance, "font-bold text-slate-300")}
                  </span>
                  <button 
                    onClick={() => {
                      setBalanceInput(initialBalance.toString());
                      setIsEditingBalance(true);
                    }}
                    className="hover:text-cyan-400 transition cursor-pointer"
                    title={trans.changeBalanceBtn}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Net ROI (%) */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="space-y-1.5">
            <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.netROI}</span>
            <div className={`text-xl md:text-2xl lg:text-3xl font-black font-mono flex items-center gap-0.5 ${netROI >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
              <span>{netROI >= 0 ? '+' : ''}</span>
              <span>{digitsToPersian(netROI.toFixed(2))}%</span>
            </div>
            <p className="text-xs text-slate-400">Based on capital</p>
          </div>
        </div>

        {/* Metric 3: Win Rate (%) */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="space-y-1.5">
            <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.winRate}</span>
            <div className="text-xl md:text-2xl lg:text-3xl font-black font-mono text-emerald-400 flex items-center gap-0.5" dir="ltr">
              <span>{digitsToPersian(winRate.toFixed(1))}%</span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1" dir="ltr">
              <span>W: {digitsToPersian(winCount)}</span>
              <span>/</span>
              <span>L: {digitsToPersian(lossCount)}</span>
            </p>
          </div>
        </div>

        {/* Metric 4: Total Net P&L */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="space-y-1.5">
            <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.totalPnL}</span>
            <div className="text-xl md:text-2xl lg:text-3xl font-black font-mono break-all flex items-center gap-1">
              {formatJournalPnL(totalPnL)}
            </div>
            <p className="text-xs text-slate-400 font-mono">Net financial gain</p>
          </div>
        </div>

        {/* Metric 5: Profit Factor */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full rounded-tr-2xl pointer-events-none"></div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.profitFactor}</span>
              <div className="group/tooltip relative">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0d0723] border border-white/20 p-3 rounded-xl text-xs text-slate-200 w-56 z-50 invisible group-hover/tooltip:visible pointer-events-none leading-relaxed shadow-2xl font-vazir text-center">
                  {trans.pftFactorDesc}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d0723]"></div>
                </div>
              </div>
            </div>
            <div className={`text-xl md:text-2xl lg:text-3xl font-black font-mono ${profitFactor >= 1.5 ? 'text-emerald-400' : profitFactor >= 1.0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {digitsToPersian(profitFactor)}
            </div>
            <p className="text-xs text-slate-400">Target &gt; 1.5 Pf</p>
          </div>
        </div>

        {/* Metric 6: Max Drawdown */}
        <div className="bg-[#12102e]/60 border border-white/10 rounded-2xl p-4 glass-panel relative group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full rounded-tr-2xl pointer-events-none"></div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs md:text-sm font-black text-slate-300 uppercase block">{trans.maxDrawdown}</span>
              <div className="group/tooltip relative">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0d0723] border border-white/20 p-3 rounded-xl text-xs text-slate-200 w-56 z-50 invisible group-hover/tooltip:visible pointer-events-none leading-relaxed shadow-2xl font-vazir text-center">
                  {trans.maxDDDesc}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d0723]"></div>
                </div>
              </div>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-black font-mono text-rose-400">
              {digitsToPersian(maxDrawdown)}%
            </div>
            <p className="text-xs text-slate-400">Historical peak-to-valley</p>
          </div>
        </div>

      </div>

      {/* ANALYTICS VISUALIZATION CHARTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Equity curve growth over time */}
        <div className="lg:col-span-7 bg-[#12102e]/40 border border-white/10 rounded-2xl p-5 glass-panel flex flex-col lg:h-full min-w-0 overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/5 pb-3 shrink-0">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>{trans.equityCurve}</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 font-bold">
              {digitsToPersian(trades.length)} Trades
            </span>
          </div>

          <div className="flex-grow min-h-[300px] h-0 w-full font-mono text-xs mt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  tickLine={false} 
                  domain={['auto', 'auto']} 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                />
                <Tooltip content={<CustomEquityTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Setup & Psychology breakdowns */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 min-w-0">
          
          {/* Chart 1: Setup Performance Bar Chart */}
          <div className="bg-[#12102e]/40 border border-white/10 rounded-2xl p-5 glass-panel space-y-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>{trans.setupPerformance}</span>
            </h3>

            {setupPerformanceData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 py-12 font-vazir">
                {trans.noTrades}
              </div>
            ) : (
              <div className="h-[200px] w-full font-mono text-xs mt-2" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={setupPerformanceData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="rgba(255,255,255,0.4)" 
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="rgba(255,255,255,0.4)" 
                      tickLine={false} 
                      width={125}
                      tick={{ fill: 'rgba(255,255,255,0.9)', fontSize: 11 }}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value: any) => [`$${value}`, 'PnL']} />
                    <Bar dataKey="PnL" radius={[0, 4, 4, 0]}>
                      {setupPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.PnL >= 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Psychology Distribution Pie Chart */}
          <div className="bg-[#12102e]/40 border border-white/10 rounded-2xl p-5 glass-panel space-y-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-white/5 pb-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span>{trans.winRateAnalysis}</span>
            </h3>

            {psychologyPieData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 py-12 font-vazir">
                {trans.noTrades}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 mt-2">
                <div className="h-[130px] w-[130px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={psychologyPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                      >
                        {psychologyPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PSY_COLORS[index % PSY_COLORS.length]}
                            style={{
                              cursor: 'pointer',
                              filter: activePieIndex === index ? 'brightness(1.2) drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'none',
                              transform: activePieIndex === index ? 'scale(1.05)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[240px] text-xs font-mono leading-tight">
                  {psychologyPieData.slice(0, 5).map((entry, i) => (
                    <div 
                      key={entry.name} 
                      className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${activePieIndex === i ? 'bg-white/5' : ''}`}
                      onMouseEnter={() => setActivePieIndex(i)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PSY_COLORS[i % PSY_COLORS.length] }}></span>
                      <span className="text-slate-300 truncate font-vazir text-xs font-medium">{entry.name}:</span>
                      <span className="font-bold text-white shrink-0 ml-auto">
                        {digitsToPersian(entry.value)} ({digitsToPersian(entry.pnl >= 0 ? '+' : '')}{digitsToPersian(entry.pnl.toLocaleString('en-US'))} $)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FILTER & JOURNAL TABLE SECTION */}
      <div className="bg-[#12102e]/40 border border-white/10 rounded-2xl p-5 glass-panel space-y-4">
        
        {/* Table Title & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>{trans.tradeLedgerTitle}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-vazir">Automated balance updates and realized R-Multiple log</p>
          </div>

          {/* Filtering controls */}
          <div className="flex flex-wrap items-center gap-3 font-vazir text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder={trans.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-black/40 border border-white/10 focus:border-cyan-400/50 rounded-xl pl-9 pr-4 text-xs text-white outline-none"
              />
            </div>

            {/* Setup filter select */}
            <div className="flex items-center gap-1 relative z-30">
              <span className="text-slate-400 hidden sm:inline">{trans.setupLabel}:</span>
              <button
                type="button"
                onClick={() => {
                  setIsSetupFilterOpen(!isSetupFilterOpen);
                  setIsDirectionFilterOpen(false);
                }}
                className="h-9 bg-black/40 border border-white/10 hover:border-cyan-400/50 rounded-xl px-3 text-xs text-slate-300 flex items-center gap-2 outline-none cursor-pointer select-none font-vazir"
              >
                <span>{setupFilter === 'All' ? trans.allSetups : setupFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              {isSetupFilterOpen && (
                <div className="absolute top-10 right-0 mt-1 min-w-[160px] bg-[#0c0922] border border-white/15 rounded-xl max-h-60 overflow-y-auto z-40 p-1 shadow-2xl font-vazir">
                  <button
                    type="button"
                    onClick={() => {
                      setSetupFilter('All');
                      setIsSetupFilterOpen(false);
                    }}
                    className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${setupFilter === 'All' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    {trans.allSetups}
                  </button>
                  {allUniqueSetups.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSetupFilter(s);
                        setIsSetupFilterOpen(false);
                      }}
                      className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${setupFilter === s ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direction filter select */}
            <div className="flex items-center gap-1 relative z-30">
              <span className="text-slate-400 hidden sm:inline">{trans.direction}:</span>
              <button
                type="button"
                onClick={() => {
                  setIsDirectionFilterOpen(!isDirectionFilterOpen);
                  setIsSetupFilterOpen(false);
                }}
                className="h-9 bg-black/40 border border-white/10 hover:border-cyan-400/50 rounded-xl px-3 text-xs text-slate-300 flex items-center gap-2 outline-none cursor-pointer select-none font-vazir"
              >
                <span>
                  {directionFilter === 'All' 
                    ? (isRtl ? 'همه جهت‌ها' : 'All Directions') 
                    : (directionFilter === 'Long' ? trans.long : trans.short)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              {isDirectionFilterOpen && (
                <div className="absolute top-10 right-0 mt-1 min-w-[140px] bg-[#0c0922] border border-white/15 rounded-xl z-40 p-1 shadow-2xl font-vazir">
                  <button
                    type="button"
                    onClick={() => {
                      setDirectionFilter('All');
                      setIsDirectionFilterOpen(false);
                    }}
                    className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${directionFilter === 'All' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    {isRtl ? 'همه جهت‌ها' : 'All Directions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDirectionFilter('Long');
                      setIsDirectionFilterOpen(false);
                    }}
                    className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${directionFilter === 'Long' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    {trans.long}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDirectionFilter('Short');
                      setIsDirectionFilterOpen(false);
                    }}
                    className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${directionFilter === 'Short' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                  >
                    {trans.short}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* JOURNAL INTERACTIVE TABLE GRID */}
        {filteredTrades.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-16 font-vazir">
            {trans.noTrades}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-vazir" style={{ minWidth: '840px' }}>
              <thead>
                <tr className="border-b border-white/10 text-xs md:text-sm text-indigo-200/80 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">{trans.date}</th>
                  <th className="py-3.5 px-4">{trans.assetCol}</th>
                  <th className="py-3.5 px-4 text-center">{trans.leverage}</th>
                  <th className="py-3.5 px-4 text-center">{trans.direction}</th>
                  <th className="py-3.5 px-4">{trans.setupCol}</th>
                  <th className="py-3.5 px-4 text-center">{trans.rrCol}</th>
                  <th className="py-3.5 px-4 text-right">{trans.netPnL}</th>
                  <th className="py-3.5 px-4 text-right">{trans.newBalCol}</th>
                  <th className="py-3.5 px-4 text-center w-20">{trans.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-sm text-slate-200">
                {filteredTrades.map((trade, idx) => {
                  const isExpanded = expandedRowId === trade.id;
                  const win = trade.netPnL >= 0;
                  const ledgerData = ledgerMap[trade.id] || { before: initialBalance, after: initialBalance, growth: 0 };
                  
                  return (
                    <React.Fragment key={trade.id}>
                      {/* Standard row */}
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : trade.id)}
                        className={`cursor-pointer transition-all hover:bg-white/5 ${win ? 'bg-emerald-500/[0.015]' : 'bg-rose-500/[0.015]'} ${isExpanded ? 'bg-white/[0.04]' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {digitsToPersian(idx + 1)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-100">{digitsToPersian(trade.date)}</span>
                            {trade.time && <span className="text-xs text-slate-400 mt-0.5">{digitsToPersian(trade.time)}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-white text-sm md:text-base">
                          {trade.asset}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                          {trade.leverage ? `${digitsToPersian(trade.leverage)}x` : '1x'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${trade.direction === 'Long' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-vazir text-slate-200 text-xs md:text-sm">
                          {trade.setupType}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-xs md:text-sm">
                          <span className={`px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${trade.R_Multiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                            <span>{trade.R_Multiple > 0 ? '+' : ''}</span>
                            <span>{digitsToPersian(trade.R_Multiple)}</span>
                            <span>R</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-sm md:text-base">
                          {formatJournalPnL(trade.netPnL)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-indigo-300 text-sm md:text-base">
                          {formatJournalValue(ledgerData.after)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                               onClick={() => setExpandedRowId(isExpanded ? null : trade.id)}
                               className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={(e) => handleDeleteTrade(trade.id, e)}
                              className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expansion Row with beautiful details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="p-0 bg-black/20 border-l border-r border-b border-white/5">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                                  
                                  {/* Left Panel: Ledger accounting calculations & Stats */}
                                  <div className="md:col-span-4 space-y-4 font-vazir text-sm">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                      <SlidersHorizontal className="w-4 h-4" />
                                      <span>{trans.details}</span>
                                    </h4>

                                    <div className="space-y-2.5 font-mono text-xs md:text-sm">
                                      <div className="flex justify-between py-1 border-b border-white/5" dir="ltr">
                                        <span className="text-slate-400">{trans.balanceBefore}:</span>
                                        {formatJournalValue(ledgerData.before, "font-bold text-slate-200")}
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-white/5" dir="ltr">
                                        <span className="text-slate-400">{trans.balanceAfter}:</span>
                                        {formatJournalValue(ledgerData.after, "font-bold text-indigo-300")}
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-white/5" dir="ltr">
                                        <span className="text-slate-400">{trans.growthPerTrade}:</span>
                                        <span className={`font-black flex items-center gap-0.5 ${ledgerData.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          <span>{ledgerData.growth >= 0 ? '+' : ''}</span>
                                          <span>{digitsToPersian(ledgerData.growth.toFixed(2))}%</span>
                                        </span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-white/5" dir="ltr">
                                        <span className="text-slate-400">{trans.entryPrice}:</span>
                                        {formatJournalValue(trade.entryPrice, "font-bold text-slate-300")}
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-white/5">
                                        <span className="text-slate-400">{trans.positionSize}:</span>
                                        <span className="font-bold text-slate-300">{digitsToPersian(trade.positionSize)} Unit</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-white/5">
                                        <span className="text-slate-400">{trans.leverage}:</span>
                                        <span className="font-bold text-cyan-400">{digitsToPersian(trade.leverage || 1)}x</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-slate-400">Risked Amount:</span>
                                        <span className="font-bold text-rose-400">{digitsToPersian(trade.riskPercentage)}%</span>
                                      </div>
                                    </div>

                                    {/* Stop Loss / Take profit range visuals */}
                                    <div className="space-y-1.5 mt-4 pt-2">
                                      <div className="flex justify-between text-xs text-slate-300 font-mono">
                                        <span className="text-rose-400">SL: {digitsToPersian(trade.stopLoss.toLocaleString('en-US'))}</span>
                                        <span className="text-yellow-400">Entry: {digitsToPersian(trade.entryPrice.toLocaleString('en-US'))}</span>
                                        <span className="text-emerald-400">TP: {digitsToPersian(trade.takeProfit.toLocaleString('en-US'))}</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex relative">
                                        <div className="bg-rose-500 absolute h-full rounded-l-full" style={{ left: '0%', width: '30%' }}></div>
                                        <div className="bg-yellow-400 absolute h-full" style={{ left: '30%', width: '10%' }}></div>
                                        <div className="bg-emerald-500 absolute h-full rounded-r-full" style={{ left: '40%', width: '60%' }}></div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Middle Panel: Psychological reviews, Rating, Notes */}
                                  <div className="md:col-span-4 space-y-4 text-sm font-vazir">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                      <Brain className="w-4 h-4" />
                                      <span>{trans.psyTitle}</span>
                                    </h4>

                                    <div className="space-y-3.5">
                                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                        <p className="text-xs text-slate-400 block mb-1">{trans.psychState}:</p>
                                        <span className="font-bold text-white text-sm">{trade.psychologicalState}</span>
                                      </div>

                                      <div>
                                        <p className="text-xs md:text-sm text-indigo-300 font-bold mb-1.5">{trans.disciplineRating}:</p>
                                        <div className="flex items-center gap-1.5">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                              key={star} 
                                              className={`w-4 h-4 ${star <= trade.disciplineRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                                            />
                                          ))}
                                          <span className="text-xs text-slate-300 font-mono font-bold ml-1">
                                            {digitsToPersian(trade.disciplineRating)}/5
                                          </span>
                                        </div>
                                      </div>

                                      {trade.notes && (
                                        <div className="space-y-1">
                                          <p className="text-xs text-slate-400 block">Observational Journal Entry:</p>
                                          <p className="text-sm text-slate-200 italic bg-black/20 p-3 rounded-lg border border-white/5 leading-relaxed">
                                            {trade.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Panel: Trading Chart preview */}
                                  <div className="md:col-span-4 space-y-3 text-sm">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                                      <Camera className="w-4 h-4" />
                                      <span>{trans.screenshots}</span>
                                    </h4>
                                    
                                    {trade.screenshots && trade.screenshots[0] ? (
                                      <div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-lg">
                                        <img 
                                          src={trade.screenshots[0]} 
                                          alt="Trade screenshot" 
                                          className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                        <a 
                                          href={trade.screenshots[0]} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-xs font-black text-white gap-1"
                                        >
                                          {trans.viewChart} <ArrowUpRight className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="h-36 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs">
                                        No Image Provided
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED ADVANCED SMART LOGGER DIALOG / MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal glass background overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body Container */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#09071c] border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>{trans.addTradeBtn}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-vazir">Step-by-step interactive configuration</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step / Tab navigation buttons */}
              <div className="grid grid-cols-3 bg-black/30 border-b border-white/10 p-2 items-center text-xs font-bold gap-2">
                <button 
                  onClick={() => setFormTab('pre')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition ${formTab === 'pre' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span className="truncate">{trans.preTradeTitle.split(' ')[1] || trans.preTradeTitle}</span>
                </button>
                <button 
                  onClick={() => setFormTab('post')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition ${formTab === 'post' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="truncate">{trans.postTradeTitle.split(' ')[1] || trans.postTradeTitle}</span>
                </button>
                <button 
                  onClick={() => setFormTab('psy')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition ${formTab === 'psy' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span className="truncate">{trans.psyTitle.split(' ')[1] || trans.psyTitle}</span>
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                
                {/* TAB 1: PRE-TRADE */}
                {formTab === 'pre' && (
                  <motion.div 
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Asset */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.asset}</label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={formAsset}
                            onChange={(e) => setFormAsset(e.target.value)}
                            className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white uppercase outline-none font-bold"
                            placeholder="BTC/USDT"
                          />
                        </div>
                        {/* Preset Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {POPULAR_ASSETS.map(asset => (
                            <button
                              key={asset}
                              type="button"
                              onClick={() => setFormAsset(asset)}
                              className={`text-[9px] px-2 py-0.5 rounded-full border transition ${formAsset.toUpperCase() === asset ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-slate-500'}`}
                            >
                              {asset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Direction toggle */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.direction}</label>
                        <div className="grid grid-cols-2 bg-black/40 border border-white/10 p-1 rounded-xl h-10 items-center">
                          <button 
                            type="button"
                            onClick={() => setFormDirection('Long')}
                            className={`h-full text-xs font-black rounded-lg transition-all ${formDirection === 'Long' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {trans.long}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormDirection('Short')}
                            className={`h-full text-xs font-black rounded-lg transition-all ${formDirection === 'Short' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {trans.short}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      
                      {/* Entry Price */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.entryPrice}</label>
                        <input 
                          type="number"
                          step="any"
                          value={formEntry}
                          onChange={(e) => setFormEntry(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-2.5 text-xs text-center font-mono text-white outline-none"
                          placeholder="e.g. 60500"
                        />
                      </div>

                      {/* Stop Loss */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-rose-300 font-bold block">{trans.stopLoss}</label>
                        <input 
                          type="number"
                          step="any"
                          value={formSL}
                          onChange={(e) => setFormSL(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-rose-400 rounded-xl px-2.5 text-xs text-center font-mono text-white outline-none"
                          placeholder="e.g. 59500"
                        />
                      </div>

                      {/* Take Profit */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-emerald-300 font-bold block">{trans.takeProfit}</label>
                        <input 
                          type="number"
                          step="any"
                          value={formTP}
                          onChange={(e) => setFormTP(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-emerald-400 rounded-xl px-2.5 text-xs text-center font-mono text-white outline-none"
                          placeholder="e.g. 63500"
                        />
                      </div>

                      {/* Capital Risk % */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.riskPct}</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={formRisk}
                          onChange={(e) => setFormRisk(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-2.5 text-xs text-center font-mono text-white outline-none"
                          placeholder="e.g. 2"
                        />
                      </div>

                      {/* Leverage */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-cyan-300 font-bold block">{trans.leverage}</label>
                        <input 
                          type="number"
                          step="1"
                          min="1"
                          value={formLeverage}
                          onChange={(e) => setFormLeverage(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-2.5 text-xs text-center font-mono text-white outline-none"
                          placeholder="e.g. 10"
                        />
                      </div>

                    </div>

                    {/* Position Size Row with helper */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-indigo-300">{trans.positionSize} Calculator</span>
                        <button 
                          type="button"
                          onClick={handleAutoCalcPositionSize}
                          className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-1 rounded transition flex items-center gap-1 font-bold"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Auto Calc Size</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          step="any"
                          value={formSize}
                          onChange={(e) => setFormSize(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none font-mono font-bold"
                          placeholder="Units (e.g. 0.2 BTC)"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">units</span>
                      </div>

                      {/* Live leverage calculations */}
                      {parseFloat(formEntry) > 0 && parseFloat(formSize) > 0 && (
                        <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] font-vazir">
                          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                            <span className="text-slate-400 block text-[10px]">{isRtl ? 'ارزش کل موقعیت:' : 'Total Exposure / Value:'}</span>
                            <span className="font-mono text-slate-300 font-bold block text-xs">
                              ${((parseFloat(formEntry) || 0) * (parseFloat(formSize) || 0)).toLocaleString('en-US', {maximumFractionDigits: 2})}
                            </span>
                          </div>
                          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                            <span className="text-slate-400 block text-[10px]">{isRtl ? 'مارجین مورد نیاز:' : 'Required Margin:'}</span>
                            <span className="font-mono text-cyan-400 font-bold block text-xs">
                              ${(((parseFloat(formEntry) || 0) * (parseFloat(formSize) || 0)) / (parseFloat(formLeverage) || 1)).toLocaleString('en-US', {maximumFractionDigits: 2})}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* TAB 2: POST-TRADE */}
                {formTab === 'post' && (
                  <motion.div 
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Exit Price */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.exitPrice}</label>
                        <input 
                          type="number"
                          step="any"
                          value={formExit}
                          onChange={(e) => setFormExit(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none font-mono"
                          placeholder="e.g. 63000"
                        />
                      </div>

                      {/* Net PnL ($) */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] text-slate-300 font-bold block">{trans.netPnL}</label>
                          <button 
                            type="button"
                            onClick={handleAutoCalcPnL}
                            className="text-[9px] bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded transition"
                          >
                            ⚡ {trans.autoCalc}
                          </button>
                        </div>
                        <input 
                          type="number"
                          step="any"
                          value={formPnL}
                          onChange={(e) => setFormPnL(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none font-mono font-bold"
                          placeholder="e.g. 500"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Exit Date */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.exitDate}</label>
                        <input 
                          type="date"
                          value={formExitDate}
                          onChange={(e) => setFormExitDate(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-white outline-none font-mono"
                        />
                      </div>

                      {/* Exit Time */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.exitTime}</label>
                        <input 
                          type="time"
                          value={formExitTime}
                          onChange={(e) => setFormExitTime(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-white outline-none font-mono"
                        />
                      </div>

                    </div>

                  </motion.div>
                )}

                {/* TAB 3: PSYCHOLOGY & RULES */}
                {formTab === 'psy' && (
                  <motion.div 
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Setup type selection */}
                      <div className="space-y-1 relative">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.setupLabel}</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormSetupOpen(!isFormSetupOpen);
                            setIsFormPsyOpen(false);
                          }}
                          className="w-full min-h-10 py-2 bg-black/40 border border-white/10 hover:border-cyan-400/50 rounded-xl px-3 text-xs text-white flex items-center justify-between outline-none cursor-pointer font-vazir select-none"
                        >
                          <span className="truncate pr-2">
                            {formSetups.length === 0 
                              ? (isRtl ? 'انتخاب استراتژی...' : 'Select Setup(s)...') 
                              : formSetups.map(s => s === 'Custom' ? (isRtl ? 'سفارشی' : 'Custom') : s).join(', ')}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        </button>
                        
                        {isFormSetupOpen && (
                          <div className="absolute top-16 left-0 right-0 bg-[#0d0a21] border border-white/15 rounded-xl max-h-56 overflow-y-auto z-50 p-1 shadow-2xl space-y-0.5">
                            {POPULAR_SETUPS.map(s => {
                              const isSelected = formSetups.includes(s);
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    setFormSetups(prev => 
                                      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                                    );
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${isSelected ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                                >
                                  <span>{s}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => {
                                setFormSetups(prev => 
                                  prev.includes('Custom') ? prev.filter(x => x !== 'Custom') : [...prev, 'Custom']
                                );
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${formSetups.includes('Custom') ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                            >
                              <span>{isRtl ? 'استراتژی سفارشی...' : 'Custom Setup...'}</span>
                              {formSetups.includes('Custom') && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                            
                            <div className="border-t border-white/10 mt-1.5 pt-1.5 px-1">
                              <button
                                type="button"
                                onClick={() => setIsFormSetupOpen(false)}
                                className="w-full py-1.5 text-center text-[10px] text-cyan-400 hover:text-cyan-300 font-bold bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                              >
                                {isRtl ? 'تایید و بستن' : 'Done'}
                              </button>
                            </div>
                          </div>
                        )}

                        {formSetups.includes('Custom') && (
                          <input 
                            type="text"
                            placeholder={isRtl ? "نام استراتژی را بنویسید" : "Enter Setup Name"}
                            value={formCustomSetup}
                            onChange={(e) => setFormCustomSetup(e.target.value)}
                            className="w-full h-9 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none mt-1.5"
                          />
                        )}
                      </div>

                      {/* Psychological Mindset */}
                      <div className="space-y-1 relative">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.psychState}</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormPsyOpen(!isFormPsyOpen);
                            setIsFormSetupOpen(false);
                          }}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-cyan-400/50 rounded-xl px-3 text-xs text-white flex items-center justify-between outline-none cursor-pointer font-vazir select-none"
                        >
                          <span>{formPsy}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        
                        {isFormPsyOpen && (
                          <div className="absolute top-16 left-0 right-0 bg-[#0d0a21] border border-white/15 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl">
                            {PSYCHOLOGICAL_STATES.map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setFormPsy(p);
                                  setIsFormPsyOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${formPsy === p ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Discipline Rating Stars */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.disciplineRating}</label>
                        <div className="flex items-center gap-1 bg-black/30 h-10 px-3.5 rounded-xl border border-white/10">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormDiscipline(star)}
                              className="hover:scale-110 transition shrink-0"
                            >
                              <Star 
                                className={`w-5 h-5 ${star <= formDiscipline ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Screenshot Mock Link */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-bold block">{trans.enterMockUrl}</label>
                        <input 
                          type="text"
                          value={formScreenshot}
                          onChange={(e) => setFormScreenshot(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none font-mono"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>

                    </div>

                    {/* Trade Notes */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold block">{trans.notes}</label>
                      <textarea 
                        rows={3}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none font-vazir leading-relaxed"
                        placeholder={trans.notesPlaceholder}
                      />
                    </div>

                  </motion.div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between p-5 border-t border-white/10 bg-white/5 font-vazir text-xs">
                {/* Cancel & Error Message */}
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition"
                  >
                    {trans.cancelBtn}
                  </button>

                  {formError && (
                    <span className="text-rose-400 font-bold font-vazir animate-pulse">
                      {formError}
                    </span>
                  )}
                </div>

                {/* Submit / Next navigation */}
                <div className="flex items-center gap-2">
                  {formTab !== 'psy' ? (
                    <button 
                      type="button"
                      onClick={() => {
                        if (formTab === 'pre') setFormTab('post');
                        else if (formTab === 'post') setFormTab('psy');
                      }}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSaveTrade}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-xl transition shadow flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{trans.saveBtn}</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM BEAUTIFUL DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {tradeToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTradeToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#09071c] border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-6 space-y-4 text-center font-vazir z-50"
            >
              <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white">{isRtl ? 'حذف معامله' : 'Delete Trade'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {trans.confirmDelete}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs font-bold">
                <button 
                  type="button"
                  onClick={() => setTradeToDelete(null)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition"
                >
                  {trans.cancelBtn}
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-xl transition shadow-lg shadow-rose-950/25"
                >
                  {isRtl ? 'بله، حذف شود' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT FORMAT SELECTOR MODAL */}
      <AnimatePresence>
        {exportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#09071c]/95 border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-6 space-y-5 text-center font-vazir z-50"
            >
              <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center">
                <FileDown className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white">
                  {isRtl ? 'انتخاب فرمت خروجی گزارش' : 'Export Trading Ledger'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isRtl 
                    ? 'لطفاً فرمت دلخواه خود را برای دانلود گزارش معاملات انتخاب نمایید.' 
                    : 'Choose your preferred file format to download your trading ledger.'}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 text-xs font-bold">
                <button 
                  type="button"
                  onClick={() => {
                    handleExportToExcelFile();
                    setExportModalOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition shadow-lg shadow-emerald-950/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  <span>{isRtl ? 'دانلود فایل اکسل مرتب شده (EXCEL)' : 'Download Clean Excel (.xlsx)'}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    handleExportToCSVFile();
                    setExportModalOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isRtl ? 'دانلود فایل متنی استاندارد (CSV)' : 'Download Text Format (.csv)'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="w-full py-2 text-slate-500 hover:text-slate-300 transition text-xs font-medium cursor-pointer"
                >
                  {trans.cancelBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMPORT FORMAT SELECTOR MODAL */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setImportModalOpen(false);
                setImportFeedback({ type: null, message: '' });
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#09071c]/95 border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-6 space-y-5 text-center font-vazir z-50 my-8"
            >
              {/* Close Button */}
              <button 
                type="button" 
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFeedback({ type: null, message: '' });
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                <FileUp className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">
                  {isRtl ? 'ورود معاملات از فایل اکسل یا CSV' : 'Import Trades from Excel or CSV'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isRtl 
                    ? 'شما می‌توانید فایل‌های اکسل (.xlsx) یا متنی (.csv) خود را آپلود کنید. نام سرستون‌ها به صورت خودکار شناسایی می‌شود.' 
                    : 'Upload your Excel (.xlsx) or CSV (.csv) trading journals. Header columns will be detected automatically.'}
                </p>
              </div>

              {/* Template Section */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-right flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="space-y-1 text-right w-full">
                  <h4 className="text-xs font-black text-indigo-300">
                    {isRtl ? 'قالب استاندارد مورد نیاز' : 'Standard Excel Template'}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {isRtl 
                      ? 'برای وارد کردن بی‌دردسر اطلاعات، قالب بهینه شده استاندارد ژورنال را دانلود کنید.' 
                      : 'Download our pre-formatted template to ensure accurate column matching.'}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={handleDownloadTradeTemplate}
                  className="w-full md:w-auto shrink-0 py-2 px-3 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isRtl ? 'دانلود قالب نمونه' : 'Template .xlsx'}</span>
                </button>
              </div>

              {/* Grid of recognized columns info */}
              <div className="space-y-2 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isRtl ? '📌 سرستون‌های مورد پشتیبانی:' : '📌 Supported Column Headers:'}
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 max-h-24 overflow-y-auto">
                  <span className="bg-slate-800/50 p-1 rounded">date | تاریخ</span>
                  <span className="bg-slate-800/50 p-1 rounded">asset | نماد</span>
                  <span className="bg-slate-800/50 p-1 rounded">direction | جهت</span>
                  <span className="bg-slate-800/50 p-1 rounded">entryPrice | ورود</span>
                  <span className="bg-slate-800/50 p-1 rounded">exitPrice | خروج</span>
                  <span className="bg-slate-800/50 p-1 rounded">stopLoss | حدضرر</span>
                  <span className="bg-slate-800/50 p-1 rounded">takeProfit | حدسود</span>
                  <span className="bg-slate-800/50 p-1 rounded">netPnL | سودزیان</span>
                  <span className="bg-slate-800/50 p-1 rounded">positionSize | حجم</span>
                  <span className="bg-slate-800/50 p-1 rounded">setupType | استراتژی</span>
                  <span className="bg-slate-800/50 p-1 rounded">psychologicalState</span>
                  <span className="bg-slate-800/50 p-1 rounded">notes | یادداشت</span>
                </div>
              </div>

              {/* Upload Drop Zone / Input */}
              <div className="relative border-2 border-dashed border-white/10 hover:border-indigo-500/30 transition-all rounded-xl p-6 bg-white/5 flex flex-col items-center justify-center group cursor-pointer min-h-32">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleImportFile}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors mb-2" />
                <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">
                  {isRtl ? 'انتخاب یا رها کردن فایل' : 'Drag & Drop or Click to Upload'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  XLSX, XLS, CSV
                </span>
              </div>

              {/* Feedback Message */}
              {importFeedback.type && (
                <div className={`p-3.5 rounded-xl text-xs font-bold text-right border ${
                  importFeedback.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  <p className="leading-relaxed">{importFeedback.message}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex gap-3 pt-2 text-xs font-bold">
                <button 
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importFeedback.type !== 'success' || !importFeedback.data || importFeedback.data.length === 0}
                  className={`flex-1 py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    importFeedback.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/25'
                      : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRtl ? 'تایید و اضافه کردن به لیست ژورنال' : 'Confirm & Save to Journal'}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportFeedback({ type: null, message: '' });
                  }}
                  className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition cursor-pointer"
                >
                  {trans.cancelBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Risk Calculator Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80] group flex items-center gap-2">
        {/* Tooltip (hidden on mobile to prevent clutter) */}
        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#09071c] border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap font-vazir select-none">
          {isRtl ? 'محاسبه‌گر سریع ریسک ⚡' : 'Quick Risk Calculator ⚡'}
        </div>
        <button
          type="button"
          onClick={() => setIsQuickCalcOpen(true)}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/40 relative group/btn"
          title={isRtl ? 'محاسبه‌گر سریع ریسک' : 'Quick Risk Calculator'}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover/btn:rotate-12 transition-transform duration-200" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </button>
      </div>

      {/* Quick Risk Calculator Modal */}
      <AnimatePresence>
        {isQuickCalcOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickCalcOpen(false)}
              className="absolute inset-0 cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#09071c]/95 border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col font-vazir"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/45">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{calcTrans.title}</h2>
                    <p className="text-xs text-slate-400">{calcTrans.subtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuickCalcOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content split in 2 columns: inputs vs outputs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[75vh]">
                
                {/* INPUTS COLUMN */}
                <div className="lg:col-span-7 p-6 space-y-4 border-r lg:border-r border-b lg:border-b-0 border-white/5">
                  
                  {/* Mode tabs: Forex vs Crypto */}
                  <div className="flex bg-black/50 border border-white/10 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setQuickCalcMode('forex')}
                      className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                        quickCalcMode === 'forex'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950/25'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {calcTrans.forex}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCalcMode('crypto')}
                      className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                        quickCalcMode === 'crypto'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950/25'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {calcTrans.crypto}
                    </button>
                  </div>

                  {/* Account Balance & Preset row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.balance}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">
                          {journalCurrency === 'USD' ? '$' : '€'}
                        </span>
                        <input
                          type="number"
                          value={quickCalcBalance}
                          onChange={(e) => setQuickCalcBalance(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-8 text-xs text-white outline-none font-mono"
                          placeholder="10,000"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.riskPreset}</label>
                        <button
                          type="button"
                          onClick={() => setIsManagingPresets(!isManagingPresets)}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          {calcTrans.presetMgr}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRiskDropdownOpen(!isRiskDropdownOpen);
                            setIsLeverageDropdownOpen(false);
                            setIsPipSizeDropdownOpen(false);
                          }}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-xl px-3 text-xs text-slate-300 flex items-center justify-between outline-none cursor-pointer select-none font-vazir"
                        >
                          <span>{qCalcSelectedPreset ? qCalcSelectedPreset.name : 'Select Risk'}</span>
                          <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${isRiskDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isRiskDropdownOpen && (
                          <div className="absolute top-11 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0c0922] border border-white/15 rounded-xl z-[160] p-1 shadow-2xl font-vazir">
                            {riskPresets.map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setQuickCalcRiskPresetId(preset.id);
                                  setIsRiskDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${quickCalcRiskPresetId === preset.id ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manage Presets Section */}
                  {isManagingPresets && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-cyan-400">
                          {isRtl ? 'مدیریت ریسک و اهرم‌ها' : 'Manage Risk & Leverages'}
                        </h4>
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsManagingPresets(false);
                            setPresetMgrError(null);
                            setEditingPresetId(null);
                            setDeletingPresetId(null);
                            setEditingLeverageIndex(null);
                            setDeletingLeverageIndex(null);
                          }} 
                          className="text-slate-500 hover:text-white text-xs cursor-pointer"
                        >
                          {calcTrans.cancel}
                        </button>
                      </div>

                      {/* Manager Tabs */}
                      <div className="flex bg-black/30 border border-white/5 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setPresetManagerTab('risk');
                            setPresetMgrError(null);
                            setEditingPresetId(null);
                            setDeletingPresetId(null);
                            setEditingLeverageIndex(null);
                            setDeletingLeverageIndex(null);
                          }}
                          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                            presetManagerTab === 'risk'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isRtl ? 'سطوح ریسک' : 'Risk Levels'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPresetManagerTab('forex');
                            setPresetMgrError(null);
                            setEditingPresetId(null);
                            setDeletingPresetId(null);
                            setEditingLeverageIndex(null);
                            setDeletingLeverageIndex(null);
                          }}
                          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                            presetManagerTab === 'forex'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isRtl ? 'اهرم فارکس' : 'Forex Lev'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPresetManagerTab('crypto');
                            setPresetMgrError(null);
                            setEditingPresetId(null);
                            setDeletingPresetId(null);
                            setEditingLeverageIndex(null);
                            setDeletingLeverageIndex(null);
                          }}
                          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                            presetManagerTab === 'crypto'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isRtl ? 'اهرم کریپتو' : 'Crypto Lev'}
                        </button>
                      </div>

                      {/* Error Alert */}
                      {presetMgrError && (
                        <div className="p-2 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center font-vazir">
                          {presetMgrError}
                        </div>
                      )}

                      {/* Tab Contents */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {presetManagerTab === 'risk' && riskPresets.map(p => {
                          const isEditing = editingPresetId === p.id;
                          const isDeleting = deletingPresetId === p.id;
                          return (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs gap-2">
                              {isDeleting ? (
                                <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-1 px-2 rounded-md text-[11px] font-vazir text-rose-300">
                                  <span>{isRtl ? 'آیا از حذف مطمئن هستید؟' : 'Are you sure?'}</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePreset(p.id)}
                                      className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      {isRtl ? 'بله' : 'Yes'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingPresetId(null)}
                                      className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] cursor-pointer"
                                    >
                                      {isRtl ? 'خیر' : 'No'}
                                    </button>
                                  </div>
                                </div>
                              ) : isEditing ? (
                                <div className="flex-1 flex gap-1.5 items-center">
                                  <input
                                    type="text"
                                    value={editingPresetName}
                                    onChange={(e) => setEditingPresetName(e.target.value)}
                                    className="flex-1 h-7 bg-black/50 border border-white/25 rounded px-1.5 text-xs text-white outline-none"
                                    placeholder={calcTrans.presetName}
                                  />
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editingPresetValue}
                                    onChange={(e) => setEditingPresetValue(e.target.value)}
                                    className="w-16 h-7 bg-black/50 border border-white/25 rounded px-1.5 text-xs text-white outline-none font-mono"
                                    placeholder="%"
                                  />
                                </div>
                              ) : (
                                <span className="text-white font-medium flex-1 truncate">{p.name}</span>
                              )}

                              {!isDeleting && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditPreset(p.id)}
                                        className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ذخیره تغییرات' : 'Save changes'}
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingPresetId(null)}
                                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'لغو' : 'Cancel'}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPresetId(p.id);
                                          const cleanName = p.name.replace(/\s*\(\d+(\.\d+)?%\)\s*$/, '');
                                          setEditingPresetName(cleanName);
                                          setEditingPresetValue(p.value.toString());
                                          setDeletingPresetId(null);
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ویرایش' : 'Edit'}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeletingPresetId(p.id);
                                          setEditingPresetId(null);
                                        }}
                                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'حذف' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {presetManagerTab === 'forex' && forexLeverages.map((lev, idx) => {
                          const isEditing = editingLeverageIndex === idx;
                          const isDeleting = deletingLeverageIndex === idx;
                          return (
                            <div key={`forex-${idx}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs gap-2">
                              {isDeleting ? (
                                <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-1 px-2 rounded-md text-[11px] font-vazir text-rose-300">
                                  <span>{isRtl ? 'آیا از حذف مطمئن هستید؟' : 'Are you sure?'}</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLeverage(idx, 'forex')}
                                      className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      {isRtl ? 'بله' : 'Yes'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingLeverageIndex(null)}
                                      className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] cursor-pointer"
                                    >
                                      {isRtl ? 'خیر' : 'No'}
                                    </button>
                                  </div>
                                </div>
                              ) : isEditing ? (
                                <div className="flex-1 flex gap-1.5 items-center">
                                  <input
                                    type="number"
                                    value={editingLeverageValStr}
                                    onChange={(e) => setEditingLeverageValStr(e.target.value)}
                                    className="flex-1 h-7 bg-black/50 border border-white/25 rounded px-1.5 text-xs text-white outline-none font-mono"
                                    placeholder="e.g. 100"
                                  />
                                </div>
                              ) : (
                                <span className="text-white font-mono font-medium">{lev}x</span>
                              )}

                              {!isDeleting && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditLeverage(idx, editingLeverageValStr, 'forex')}
                                        className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ذخیره تغییرات' : 'Save changes'}
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingLeverageIndex(null)}
                                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'لغو' : 'Cancel'}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingLeverageIndex(idx);
                                          setEditingLeverageValStr(lev.toString());
                                          setDeletingLeverageIndex(idx); // Just clears any previous delete, doesn't delete
                                          setDeletingLeverageIndex(null);
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ویرایش' : 'Edit'}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeletingLeverageIndex(idx);
                                          setEditingLeverageIndex(null);
                                        }}
                                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'حذف' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {presetManagerTab === 'crypto' && cryptoLeverages.map((lev, idx) => {
                          const isEditing = editingLeverageIndex === idx;
                          const isDeleting = deletingLeverageIndex === idx;
                          return (
                            <div key={`crypto-${idx}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs gap-2">
                              {isDeleting ? (
                                <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-1 px-2 rounded-md text-[11px] font-vazir text-rose-300">
                                  <span>{isRtl ? 'آیا از حذف مطمئن هستید؟' : 'Are you sure?'}</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLeverage(idx, 'crypto')}
                                      className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      {isRtl ? 'بله' : 'Yes'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingLeverageIndex(null)}
                                      className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] cursor-pointer"
                                    >
                                      {isRtl ? 'خیر' : 'No'}
                                    </button>
                                  </div>
                                </div>
                              ) : isEditing ? (
                                <div className="flex-1 flex gap-1.5 items-center">
                                  <input
                                    type="number"
                                    value={editingLeverageValStr}
                                    onChange={(e) => setEditingLeverageValStr(e.target.value)}
                                    className="flex-1 h-7 bg-black/50 border border-white/25 rounded px-1.5 text-xs text-white outline-none font-mono"
                                    placeholder="e.g. 50"
                                  />
                                </div>
                              ) : (
                                <span className="text-white font-mono font-medium">{lev}x</span>
                              )}

                              {!isDeleting && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditLeverage(idx, editingLeverageValStr, 'crypto')}
                                        className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ذخیره تغییرات' : 'Save changes'}
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingLeverageIndex(null)}
                                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'لغو' : 'Cancel'}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingLeverageIndex(idx);
                                          setEditingLeverageValStr(lev.toString());
                                          setDeletingLeverageIndex(null);
                                        }}
                                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'ویرایش' : 'Edit'}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeletingLeverageIndex(idx);
                                          setEditingLeverageIndex(null);
                                        }}
                                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
                                        title={isRtl ? 'حذف' : 'Delete'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Forms */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-white/5">
                        {presetManagerTab === 'risk' ? (
                          <>
                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                placeholder={calcTrans.presetName}
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                className="w-full h-9 bg-black/60 border border-white/10 rounded-lg px-2 text-xs text-white outline-none"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <input
                                type="number"
                                step="0.1"
                                placeholder={calcTrans.presetVal}
                                value={newPresetValue}
                                onChange={(e) => setNewPresetValue(e.target.value)}
                                className="w-full h-9 bg-black/60 border border-white/10 rounded-lg px-2 text-xs text-white outline-none font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <button
                                type="button"
                                onClick={handleAddPreset}
                                className="w-full h-9 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="sm:col-span-10">
                              <input
                                type="number"
                                placeholder={isRtl ? 'اهرم معتبر (مثلا ۵۰)' : 'Valid leverage (e.g. 50)'}
                                value={newLeverageValue}
                                onChange={(e) => setNewLeverageValue(e.target.value)}
                                className="w-full h-9 bg-black/60 border border-white/10 rounded-lg px-2 text-xs text-white outline-none font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const val = parseInt(newLeverageValue, 10);
                                  if (!isNaN(val) && val > 0) {
                                    handleAddLeveragePreset(val, presetManagerTab);
                                    setNewLeverageValue('');
                                  } else {
                                    setPresetMgrError(isRtl ? 'لطفا اهرم معتبری وارد کنید.' : 'Please enter a valid leverage.');
                                  }
                                }}
                                className="w-full h-9 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trade Direction & Calculation Mode Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Trade Direction selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.direction}</label>
                      <div className="flex bg-black/30 border border-white/5 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setQuickCalcDirection('Long')}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            quickCalcDirection === 'Long'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{calcTrans.long}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCalcDirection('Short')}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            quickCalcDirection === 'Short'
                              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{calcTrans.short}</span>
                        </button>
                      </div>
                    </div>

                    {/* Calculation Mode Selector: Price vs Pips */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.inputMode}</label>
                      <div className="flex bg-black/30 border border-white/5 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setQuickCalcInputMode('price')}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center ${
                            quickCalcInputMode === 'price'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{calcTrans.byPrice}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickCalcInputMode('pips')}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center ${
                            quickCalcInputMode === 'pips'
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{calcTrans.byPips}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.entryPrice}</label>
                      <input
                        type="number"
                        step="any"
                        value={quickCalcEntry}
                        onChange={(e) => setQuickCalcEntry(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                        placeholder="1.08500"
                      />
                    </div>

                    {quickCalcInputMode === 'price' ? (
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.stopLoss}</label>
                        <input
                          type="number"
                          step="any"
                          value={quickCalcSL}
                          onChange={(e) => setQuickCalcSL(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                          placeholder={quickCalcMode === 'forex' ? "1.08200" : "60000"}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">
                          {quickCalcMode === 'forex' ? calcTrans.slDistancePips : calcTrans.slDistancePct}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={quickCalcSLPips}
                          onChange={(e) => setQuickCalcSLPips(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                          placeholder={quickCalcMode === 'forex' ? "30" : "2"}
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.takeProfit}</label>
                      <input
                        type="number"
                        step="any"
                        value={quickCalcTP}
                        onChange={(e) => setQuickCalcTP(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                        placeholder="1.09400"
                      />
                    </div>
                  </div>

                  {/* FOREX SPECIFIC INPUTS */}
                  {quickCalcMode === 'forex' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5"
                    >
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.leverage}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLeverageDropdownOpen(!isLeverageDropdownOpen);
                              setIsRiskDropdownOpen(false);
                              setIsPipSizeDropdownOpen(false);
                            }}
                            className="w-full h-10 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-xl px-3 text-xs text-slate-300 flex items-center justify-between outline-none cursor-pointer select-none font-vazir"
                          >
                            <span>
                              {isCustomLeverage 
                                ? `${calcTrans.customLeverage} (${customLeverageVal}x)` 
                                : (quickCalcLeverage === 1 ? calcTrans.noLeverage : `${quickCalcLeverage}x`)}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${isLeverageDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isLeverageDropdownOpen && (
                            <div className="absolute top-11 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0c0922] border border-white/15 rounded-xl z-[160] p-1 shadow-2xl font-vazir">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcLeverage(1);
                                  setIsCustomLeverage(false);
                                  setIsLeverageDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!isCustomLeverage && quickCalcLeverage === 1 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.noLeverage}
                              </button>
                              {forexLeverages.map(lev => (
                                <button
                                  key={lev}
                                  type="button"
                                  onClick={() => {
                                    setQuickCalcLeverage(lev);
                                    setIsCustomLeverage(false);
                                    setIsLeverageDropdownOpen(false);
                                  }}
                                  className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!isCustomLeverage && quickCalcLeverage === lev ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                                >
                                  {lev}x
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomLeverage(true);
                                  setIsLeverageDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${isCustomLeverage ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.customLeverage}
                              </button>
                            </div>
                          )}
                        </div>
                        {isCustomLeverage && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-1.5"
                          >
                            <div className="flex gap-1.5">
                              <input
                                type="number"
                                value={customLeverageVal}
                                onChange={(e) => setCustomLeverageVal(e.target.value)}
                                className="flex-1 h-10 bg-black/40 border border-cyan-500/30 hover:border-cyan-500 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                                placeholder="e.g. 100"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = Number(customLeverageVal);
                                  if (val > 0) {
                                    handleAddLeveragePreset(val, 'forex');
                                    setQuickCalcLeverage(val);
                                    setIsCustomLeverage(false);
                                  }
                                }}
                                className="h-10 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 hover:text-white border border-cyan-500/30 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0"
                                title={isRtl ? 'افزودن به لیست اصلی' : 'Add to main list'}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.pipSize}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPipSizeDropdownOpen(!isPipSizeDropdownOpen);
                              setIsRiskDropdownOpen(false);
                              setIsLeverageDropdownOpen(false);
                            }}
                            className="w-full h-10 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-xl px-3 text-xs text-slate-300 flex items-center justify-between outline-none cursor-pointer select-none font-vazir"
                          >
                            <span>
                              {quickCalcPipSize === 0.0001 ? calcTrans.pipMajor :
                               quickCalcPipSize === 0.01 ? calcTrans.pipJpy :
                               quickCalcPipSize === 0.1 ? calcTrans.pipOil :
                               calcTrans.pipCustom}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${isPipSizeDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isPipSizeDropdownOpen && (
                            <div className="absolute top-11 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0c0922] border border-white/15 rounded-xl z-[160] p-1 shadow-2xl font-vazir">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcPipSize(0.0001);
                                  setIsPipSizeDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${quickCalcPipSize === 0.0001 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.pipMajor}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcPipSize(0.01);
                                  setIsPipSizeDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${quickCalcPipSize === 0.01 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.pipJpy}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcPipSize(0.1);
                                  setIsPipSizeDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${quickCalcPipSize === 0.1 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.pipOil}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcPipSize(1.0);
                                  setIsPipSizeDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${quickCalcPipSize === 1.0 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.pipCustom}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.pipValue}</label>
                          <div className="group relative">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400 cursor-pointer" />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-black/90 border border-white/10 rounded-xl shadow-2xl text-[10px] text-slate-300 leading-relaxed pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 z-50">
                              {isRtl 
                                ? 'ارزش پیپ به ازای ۱ لات استاندارد (۱۰۰,۰۰۰ واحد) است. برای EURUSD معمولاً ۱۰ دلار است.' 
                                : 'Pip Value depends on your broker. For EURUSD standard lot usually = $10.'}
                            </div>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={quickCalcPipValue}
                          onChange={(e) => setQuickCalcPipValue(Number(e.target.value))}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                          placeholder="10"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* CRYPTO SPECIFIC INPUTS */}
                  {quickCalcMode === 'crypto' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5"
                    >
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.leverage}</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLeverageDropdownOpen(!isLeverageDropdownOpen);
                              setIsRiskDropdownOpen(false);
                              setIsPipSizeDropdownOpen(false);
                            }}
                            className="w-full h-10 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-xl px-3 text-xs text-slate-300 flex items-center justify-between outline-none cursor-pointer select-none font-vazir"
                          >
                            <span>
                              {isCustomLeverage 
                                ? `${calcTrans.customLeverage} (${customLeverageVal}x)` 
                                : (quickCalcLeverage === 1 ? calcTrans.noLeverage : `${quickCalcLeverage}x`)}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${isLeverageDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isLeverageDropdownOpen && (
                            <div className="absolute top-11 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0c0922] border border-white/15 rounded-xl z-[160] p-1 shadow-2xl font-vazir">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickCalcLeverage(1);
                                  setIsCustomLeverage(false);
                                  setIsLeverageDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!isCustomLeverage && quickCalcLeverage === 1 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.noLeverage}
                              </button>
                              {cryptoLeverages.map(lev => (
                                <button
                                  key={lev}
                                  type="button"
                                  onClick={() => {
                                    setQuickCalcLeverage(lev);
                                    setIsCustomLeverage(false);
                                    setIsLeverageDropdownOpen(false);
                                  }}
                                  className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!isCustomLeverage && quickCalcLeverage === lev ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                                >
                                  {lev}x
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomLeverage(true);
                                  setIsLeverageDropdownOpen(false);
                                }}
                                className={`w-full ${isRtl ? 'text-right' : 'text-left'} px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${isCustomLeverage ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {calcTrans.customLeverage}
                              </button>
                            </div>
                          )}
                        </div>
                        {isCustomLeverage && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-1.5"
                          >
                            <div className="flex gap-1.5">
                              <input
                                type="number"
                                value={customLeverageVal}
                                onChange={(e) => setCustomLeverageVal(e.target.value)}
                                className="flex-1 h-10 bg-black/40 border border-cyan-500/30 hover:border-cyan-500 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono"
                                placeholder="e.g. 50"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = Number(customLeverageVal);
                                  if (val > 0) {
                                    handleAddLeveragePreset(val, 'crypto');
                                    setQuickCalcLeverage(val);
                                    setIsCustomLeverage(false);
                                  }
                                }}
                                className="h-10 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 hover:text-white border border-cyan-500/30 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0"
                                title={isRtl ? 'افزودن به لیست اصلی' : 'Add to main list'}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-bold block">{calcTrans.coin}</label>
                        <input
                          type="text"
                          value={quickCalcCoin}
                          onChange={(e) => setQuickCalcCoin(e.target.value)}
                          className="w-full h-10 bg-black/40 border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl px-3 text-xs text-white outline-none font-mono uppercase"
                          placeholder="BTC"
                        />
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* CALCULATIONS OUTPUTS COLUMN */}
                <div className="lg:col-span-5 p-6 bg-black/25 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-cyan-400 tracking-wider uppercase border-b border-white/5 pb-2">
                      {calcTrans.outputs}
                    </h3>

                    {/* Results Bento Grid */}
                    <div className="grid grid-cols-1 gap-3.5">
                      
                      {/* Risk Amount */}
                      <div className="p-3.5 bg-[#141031]/30 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">{calcTrans.riskAmount}</span>
                          <span className="text-lg font-black text-white font-mono">
                            {formatJournalValue(qCalcResults.riskAmount)}
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold font-mono">
                          -{qCalcRiskPercent}%
                        </div>
                      </div>

                      {/* Position Size */}
                      <div className="p-3.5 bg-gradient-to-br from-[#12102e]/60 to-[#141031]/30 border border-cyan-500/20 rounded-2xl space-y-2 relative group shadow-lg shadow-cyan-950/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
                              {quickCalcMode === 'forex' ? calcTrans.positionSizeLots : calcTrans.positionSize}
                            </span>
                            <span className="text-2xl font-black text-white font-mono block mt-1">
                              {quickCalcMode === 'forex' 
                                ? digitsToPersian(qCalcResults.positionSizeLots.toFixed(2)) 
                                : digitsToPersian(qCalcResults.positionSizeUnits.toFixed(4))}
                              <span className="text-[10px] text-slate-400 ml-1.5 font-sans font-medium">
                                {quickCalcMode === 'forex' ? (isRtl ? 'لات' : 'Lots') : quickCalcCoin.toUpperCase()}
                              </span>
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleCopyPositionSize}
                            className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px]"
                            title={calcTrans.copySize}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedSizeText ? calcTrans.copied : ''}</span>
                          </button>
                        </div>

                        {quickCalcMode === 'forex' && (
                          <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 flex justify-between">
                            <span>{calcTrans.positionSize}:</span>
                            <span className="font-mono text-white">
                              {digitsToPersian(qCalcResults.positionSizeUnits.toLocaleString('en-US', { maximumFractionDigits: 0 }))} {isRtl ? 'واحد' : 'Units'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* R:R Ratio */}
                      <div className="p-3.5 bg-[#141031]/30 border border-white/5 rounded-2xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">{calcTrans.rrRatio}</span>
                            <span className="text-sm font-black text-white font-mono">
                              1 : {qCalcResults.rrRatio > 0 ? qCalcResults.rrRatio.toFixed(2) : '-'}
                            </span>
                          </div>
                          {qCalcResults.rrRatio >= 2 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                              {isRtl ? 'عالی' : 'Excellent'}
                            </span>
                          )}
                        </div>
                        
                        {/* Dynamic TP & SL Prices Display */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                          <div className="text-start text-emerald-400/80">
                            <span className="text-[9px] text-slate-500 block font-sans">{isRtl ? 'حد سود (TP)' : 'Take Profit (TP)'}</span>
                            <span className="font-bold">
                              {parseFloat(quickCalcTP) > 0 
                                ? digitsToPersian(quickCalcMode === 'forex' ? (parseFloat(quickCalcTP)).toFixed(5) : (parseFloat(quickCalcTP)).toFixed(2)) 
                                : '-'}
                            </span>
                          </div>
                          <div className="text-end text-rose-400/80">
                            <span className="text-[9px] text-slate-500 block font-sans">{isRtl ? 'حد ضرر (SL)' : 'Stop Loss (SL)'}</span>
                            <span className="font-bold">
                              {qCalcResults.effectiveSLPrice > 0 
                                ? digitsToPersian(quickCalcMode === 'forex' ? qCalcResults.effectiveSLPrice.toFixed(5) : qCalcResults.effectiveSLPrice.toFixed(2)) 
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Required Margin */}
                      <div className="p-3.5 bg-[#141031]/30 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">{calcTrans.requiredMargin}</span>
                          <span className="text-sm font-black text-white font-mono">
                            {formatJournalValue(qCalcResults.requiredMargin)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {digitsToPersian(effectiveLeverage)}x {isRtl ? 'اهرم' : 'Leverage'}
                        </span>
                      </div>

                      {/* Crypto Liquidation Price */}
                      {quickCalcMode === 'crypto' && qCalcResults.estLiqPrice > 0 && (
                        <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-rose-400 font-bold block">{calcTrans.liqPrice}</span>
                            <span className="text-sm font-black text-rose-300 font-mono">
                              {formatJournalValue(qCalcResults.estLiqPrice)}
                            </span>
                          </div>
                          <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold">
                            {quickCalcDirection === 'Long' ? 'Long Liq' : 'Short Liq'}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleUseInNewTrade}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-cyan-950/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{calcTrans.useInNewTrade}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsQuickCalcOpen(false)}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {trans.cancelBtn}
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

