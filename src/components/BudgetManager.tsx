import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Lock, 
  Unlock, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Languages, 
  Coins, 
  Sliders, 
  Check, 
  AlertCircle, 
  Settings,
  ArrowLeftRight,
  TrendingUp,
  FileDown,
  FileUp,
  Upload,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Suggestion, 
  Transaction, 
  MonthlyArchive, 
  CurrencyCode, 
  Language,
  Investment
} from '../types';
import { 
  g2j, 
  j2g, 
  isJalaliLeap, 
  SHAMSI_MONTH_NAMES, 
  GREGORIAN_MONTH_NAMES, 
  digitsToPersian, 
  persianToEnglishDigits, 
  getTodayDateString 
} from '../utils/dateUtils';

// Dictionary of translations
const t = {
  fa: {
    title: "مدیریت بودجه ماهانه",
    calendarType: "نوع تقویم",
    calendarShamsi: "شمسی",
    calendarMiladi: "میلادی",
    year: "سال",
    month: "ماه",
    selectMonth: "انتخاب ماه",
    goMonth: "رفتن به این ماه",
    budgetLabel: "بودجه ماه",
    budgetPlaceholder: "مثلاً ۲۰,۰۰۰,۰۰۰",
    saveBudget: "ثبت بودجه",
    summaryBudget: "بودجه",
    summaryExpenses: "هزینه‌ها",
    summaryIncome: "درآمد",
    summaryRemain: "مانده",
    addExpense: "افزودن هزینه",
    addIncome: "افزودن درآمد",
    closeMonth: "پایان حسابرسی و بایگانی",
    currentMonthHeader: "هزینه‌ها و درآمدهای این ماه",
    emptyTransactions: "هنوز هیچ هزینه یا درآمدی ثبت نشده است.",
    archiveHeader: "آرشیو ماه‌ها",
    emptyArchive: "هنوز ماهی بایگانی نشده است.",
    viewReport: "مشاهده گزارش",
    modalTitleExpense: "ثبت هزینه جدید",
    modalTitleIncome: "ثبت درآمد جدید",
    modalEditExpense: "ویرایش هزینه",
    modalEditIncome: "ویرایش درآمد",
    modalTextPlaceholder: "عنوان (مثال: خرید بنزین)",
    modalAmountPlaceholder: "مبلغ",
    modalDatePlaceholder: "تاریخ تراکنش",
    modalSave: "ذخیره",
    modalCancel: "انصراف",
    confirmTitle: "تایید عملیات",
    confirmYes: "بله، مطمئنم",
    confirmNo: "خیر",
    alertTitle: "توجه",
    alertClose: "متوجه شدم",
    archiveModalTitle: "گزارش مالی ماه",
    archiveModalBudget: "بودجه پایه:",
    archiveModalIncome: "درآمد کل:",
    archiveModalExpense: "هزینه‌ کل:",
    archiveModalRemain: "مانده نهایی:",
    archiveModalTransactions: "لیست تراکنش‌ها",
    archiveModalNoTransactions: "هیچ تراکنشی در این ماه ثبت نشده بود.",
    archiveModalClose: "بستن گزارش",
    alertSelectMonth: "ابتدا یک ماه انتخاب کنید یا بسازید.",
    alertMonthArchived: "این ماه بایگانی شده است و امکان تغییرات ندارد.",
    alertBudgetSaved: "بودجه این ماه با موفقیت ذخیره و قفل شد.",
    alertValidYear: "لطفاً سال معتبری وارد کنید.",
    alertValidBudget: "لطفاً یک بودجه معتبر بزرگتر از صفر وارد کنید.",
    alertValidTitle: "لطفاً عنوان را وارد کنید.",
    alertValidAmount: "لطفاً مبلغ معتبری وارد کنید.",
    alertConfirmDeleteExpense: "آیا مطمئن هستید که این هزینه حذف شود؟",
    alertConfirmDeleteIncome: "آیا مطمئن هستید که این درآمد حذف شود؟",
    alertConfirmCloseMonth: "آیا می‌خواهید حسابرسی این ماه را پایان داده و آن را بایگانی کنید؟ پس از پایان حسابرسی دیگر امکان هیچ تغییری نخواهد بود.",
    alertMonthClosedSuccess: "حساب این ماه با موفقیت بسته شد و به ماه جدید هدایت شدید.",
    txtExpense: "هزینه",
    txtIncome: "درآمد",
    addInvestment: "افزودن سرمایه‌گذاری",
    investmentsHeader: "سرمایه‌گذاری‌های این ماه",
    emptyInvestments: "هنوز هیچ سرمایه‌گذاری برای این ماه ثبت نشده است.",
    modalTitleInvestment: "ثبت سرمایه‌گذاری جدید",
    modalEditInvestment: "ویرایش سرمایه‌گذاری",
    modalTypePlaceholder: "نوع دارایی (مثال: طلا، دلار، خودرو)",
    modalInvestQtyPlaceholder: "مقدار / تعداد",
    modalTotalPricePlaceholder: "قیمت کل پرداختی",
    modalCurrencyLabel: "نوع ارز",
    alertConfirmDeleteInvestment: "آیا مطمئن هستید که این سرمایه‌گذاری حذف شود؟",
    archiveModalInvestments: "سرمایه‌گذاری‌های ماه:",
    suggestionsSettingsTitle: "مدیریت پیشنهادهای هوشمند",
    addSuggestionPlaceholder: "افزودن پیشنهاد جدید...",
    addNewSuggestionPrompt: "آیا می‌خواهید این مورد به لیست پیشنهادهای آینده اضافه شود؟",
    addSuggestionButton: "افزودن",
    suggestExpenseList: "پیشنهادهای هزینه",
    suggestIncomeList: "پیشنهادهای درآمد",
    suggestInvestmentList: "پیشنهادهای سرمایه‌گذاری",
    suggestSearchPlaceholder: "جستجو در پیشنهادها...",
    noSuggestionsYet: "هیچ پیشنهادی وجود ندارد.",
    suggestionUsedTimes: "بار استفاده شده"
  },
  en: {
    title: "Monthly Budget Manager",
    calendarType: "Calendar Type",
    calendarShamsi: "Solar (Shamsi)",
    calendarMiladi: "Gregorian",
    year: "Year",
    month: "Month",
    selectMonth: "Select Month",
    goMonth: "Go to Month",
    budgetLabel: "Monthly Budget",
    budgetPlaceholder: "e.g. 5,000",
    saveBudget: "Save Budget",
    summaryBudget: "Budget",
    summaryExpenses: "Expenses",
    summaryIncome: "Income",
    summaryRemain: "Balance",
    addExpense: "Add Expense",
    addIncome: "Add Income",
    closeMonth: "Archive & Close Month",
    currentMonthHeader: "Current Month Transactions",
    emptyTransactions: "No transactions recorded yet.",
    archiveHeader: "Months Archive",
    emptyArchive: "No months archived yet.",
    viewReport: "View Report",
    modalTitleExpense: "Add New Expense",
    modalTitleIncome: "Add New Income",
    modalEditExpense: "Edit Expense",
    modalEditIncome: "Edit Income",
    modalTextPlaceholder: "Title (e.g. Groceries)",
    modalAmountPlaceholder: "Amount",
    modalDatePlaceholder: "Transaction Date",
    modalSave: "Save",
    modalCancel: "Cancel",
    confirmTitle: "Confirm Action",
    confirmYes: "Yes, I'm sure",
    confirmNo: "No",
    alertTitle: "Info",
    alertClose: "Got it",
    archiveModalTitle: "Financial Report",
    archiveModalBudget: "Base Budget:",
    archiveModalIncome: "Total Income:",
    archiveModalExpense: "Total Expenses:",
    archiveModalRemain: "Final Balance:",
    archiveModalTransactions: "Transactions List",
    archiveModalNoTransactions: "No transactions recorded in this month.",
    archiveModalClose: "Close Report",
    alertSelectMonth: "Please select or create a month first.",
    alertMonthArchived: "This month is archived and cannot be modified.",
    alertBudgetSaved: "This month's budget has been successfully saved and locked.",
    alertValidYear: "Please enter a valid year.",
    alertValidBudget: "Please enter a valid budget greater than zero.",
    alertValidTitle: "Please enter a title.",
    alertValidAmount: "Please enter a valid amount.",
    alertConfirmDeleteExpense: "Are you sure you want to delete this expense?",
    alertConfirmDeleteIncome: "Are you sure you want to delete this income?",
    alertConfirmCloseMonth: "Do you want to end this month's accounting and archive it? No changes can be made after archiving.",
    alertMonthClosedSuccess: "Month closed successfully! Redirected to the next month.",
    txtExpense: "Expense",
    txtIncome: "Income",
    addInvestment: "Add Investment",
    investmentsHeader: "Investments of This Month",
    emptyInvestments: "No investments registered for this month yet.",
    modalTitleInvestment: "Add New Investment",
    modalEditInvestment: "Edit Investment",
    modalTypePlaceholder: "Asset Type (e.g., Gold, USD, Stock)",
    modalInvestQtyPlaceholder: "Amount / Qty",
    modalTotalPricePlaceholder: "Total Price / Cost",
    modalCurrencyLabel: "Currency Type",
    alertConfirmDeleteInvestment: "Are you sure you want to delete this investment?",
    archiveModalInvestments: "Month's Investments:",
    suggestionsSettingsTitle: "Smart Suggestions Manager",
    addSuggestionPlaceholder: "Add new suggestion...",
    addNewSuggestionPrompt: "Would you like to add this item to the suggestion autocomplete list?",
    addSuggestionButton: "Add",
    suggestExpenseList: "Expense Suggestions",
    suggestIncomeList: "Income Suggestions",
    suggestInvestmentList: "Investment Suggestions",
    suggestSearchPlaceholder: "Search suggestions...",
    noSuggestionsYet: "No suggestions found.",
    suggestionUsedTimes: "times used"
  },
  de: {
    title: "Budgetmanager",
    calendarType: "Kalendertyp",
    calendarShamsi: "Solar (Schamsi)",
    calendarMiladi: "Gregorianisch",
    year: "Jahr",
    month: "Monat",
    selectMonth: "Monat wählen",
    goMonth: "Gehe zum Monat",
    budgetLabel: "Monatliches Budget",
    budgetPlaceholder: "z.B. 5.000",
    saveBudget: "Speichern",
    summaryBudget: "Budget",
    summaryExpenses: "Ausgaben",
    summaryIncome: "Einnahmen",
    summaryRemain: "Saldo",
    addExpense: "Ausgabe hinzufügen",
    addIncome: "Einnahme hinzufügen",
    closeMonth: "Monat archivieren",
    currentMonthHeader: "Transaktionen dieses Monats",
    emptyTransactions: "Noch keine Transaktionen registriert.",
    archiveHeader: "Monatsarchiv",
    emptyArchive: "Noch keine Monate archiviert.",
    viewReport: "Bericht anzeigen",
    modalTitleExpense: "Neue Ausgabe hinzufügen",
    modalTitleIncome: "Neue Einnahme hinzufügen",
    modalEditExpense: "Ausgabe bearbeiten",
    modalEditIncome: "Einnahme bearbeiten",
    modalTextPlaceholder: "Titel (z.B. Lebensmittel)",
    modalAmountPlaceholder: "Betrag",
    modalDatePlaceholder: "Datum",
    modalSave: "Speichern",
    modalCancel: "Abbrechen",
    confirmTitle: "Vorgang bestätigen",
    confirmYes: "Ja, ich bin sicher",
    confirmNo: "Nein",
    alertTitle: "Hinweis",
    alertClose: "Verstanden",
    archiveModalTitle: "Finanzbericht für",
    archiveModalBudget: "Basisbudget:",
    archiveModalIncome: "Gesamteinnahmen:",
    archiveModalExpense: "Gesamtausgaben:",
    archiveModalRemain: "Endbestand:",
    archiveModalTransactions: "Transaktionsliste",
    archiveModalNoTransactions: "Keine Transaktionen erfasst.",
    archiveModalClose: "Bericht schließen",
    alertSelectMonth: "Bitte wählen oder erstellen Sie zuerst einen Monat.",
    alertMonthArchived: "Dieser Monat ist archiviert und kann nicht geändert werden.",
    alertBudgetSaved: "Das Budget wurde erfolgreich gespeichert und gesperrt.",
    alertValidYear: "Bitte geben Sie ein gültiges Jahr ein.",
    alertValidBudget: "Bitte geben Sie ein gültiges Budget größer als Null ein.",
    alertValidTitle: "Bitte geben Sie einen Titel ein.",
    alertValidAmount: "Bitte geben Sie einen gültigen Betrag ein.",
    alertConfirmDeleteExpense: "Ausgabe löschen?",
    alertConfirmDeleteIncome: "Einnahme löschen?",
    alertConfirmCloseMonth: "Möchten Sie diesen Monat archivieren? Danach sind keine Änderungen mehr möglich.",
    alertMonthClosedSuccess: "Monat erfolgreich abgeschlossen! Weiterleitung.",
    txtExpense: "Ausgabe",
    txtIncome: "Einnahme",
    addInvestment: "Investition hinzufügen",
    investmentsHeader: "Investitionen dieses Monats",
    emptyInvestments: "Noch keine Investitionen in diesem Monat registriert.",
    modalTitleInvestment: "Neue Investition hinzufügen",
    modalEditInvestment: "Investition bearbeiten",
    modalTypePlaceholder: "Vermögensart (z.B. Gold, USD, Aktie)",
    modalInvestQtyPlaceholder: "Menge / Anzahl",
    modalTotalPricePlaceholder: "Gesamtpreis / Kosten",
    modalCurrencyLabel: "Währungstyp",
    alertConfirmDeleteInvestment: "Möchten Sie diese Investition wirklich löschen?",
    archiveModalInvestments: "Monatsinvestitionen:",
    suggestionsSettingsTitle: "Vorschlagsverwaltung",
    addSuggestionPlaceholder: "Neuer Vorschlag...",
    addNewSuggestionPrompt: "Möchten Sie diesen Begriff zu Ihrer Vorschlagsliste hinzufügen?",
    addSuggestionButton: "Hinzufügen",
    suggestExpenseList: "Ausgabenvorschläge",
    suggestIncomeList: "Einnahmenvorschläge",
    suggestInvestmentList: "Investitionsvorschläge",
    suggestSearchPlaceholder: "Suchen...",
    noSuggestionsYet: "Keine Vorschläge.",
    suggestionUsedTimes: "Mal verwendet"
  }
};

const defaultExpenseSuggestions = [
  "اجاره خانه", "خرید سوپرمارکت", "بنزین خودرو", "کافه و رستوران", "قبوض خدماتی", "تاکسی و حمل‌ونقل", "بیمه و درمان", "خرید لباس", "اینترنت و شارژ"
];

const defaultIncomeSuggestions = [
  "حقوق ماهیانه", "پروژه فری‌لنس", "سود سرمایه‌گذاری", "یارانه معیشتی", "فروش وسایل", "جایزه و هدیه"
];

const defaultInvestmentSuggestions = [
  "طلا ۱۸ عیار", "سکه امامی", "دلار آمریکا", "یورو", "تتر (USDT)", "بیت‌کوین (BTC)", "سهام بورس", "زمین و ملک", "صندوق درآمد ثابت"
];

export interface AggregatedInvestment extends Investment {
  monthKey: string;
}

export interface GroupedInvestment {
  key: string;
  type: string;
  currency: CurrencyCode;
  totalAmount: number;
  totalPrice: number;
  items: AggregatedInvestment[];
}

interface BudgetManagerProps {
  language: Language;
}

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  language: Language;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view parameters based on current selected date
  const [calType, setCalType] = useState<'shamsi' | 'miladi'>(() => {
    return language === 'fa' ? 'shamsi' : 'miladi';
  });

  // Year & Month being viewed in the calendar picker
  const [viewYear, setViewYear] = useState<number>(1405);
  const [viewMonth, setViewMonth] = useState<number>(1);

  // Sync view parameters when value changes or when calendar is opened
  useEffect(() => {
    if (!value) return;
    const [y, m, d] = value.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      if (calType === 'shamsi') {
        const [jy, jm, jd] = g2j(y, m, d);
        setViewYear(jy);
        setViewMonth(jm);
      } else {
        setViewYear(y);
        setViewMonth(m);
      }
    }
  }, [value, calType, isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format button label
  const buttonLabel = useMemo(() => {
    if (!value) return language === 'fa' ? 'انتخاب تاریخ' : 'Select Date';
    const [y, m, d] = value.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return value;
    
    if (calType === 'shamsi') {
      const [jy, jm, jd] = g2j(y, m, d);
      const pad = (n: number) => String(n).padStart(2, '0');
      const formatted = `${jy}/${pad(jm)}/${pad(jd)}`;
      return digitsToPersian(formatted, language);
    } else {
      return digitsToPersian(value, language);
    }
  }, [value, calType, language]);

  // Calendar parameters
  let daysInMonth = 30;
  let firstDayIndex = 0;
  if (calType === 'shamsi') {
    if (viewMonth <= 6) daysInMonth = 31;
    else if (viewMonth <= 11) daysInMonth = 30;
    else daysInMonth = isJalaliLeap(viewYear) ? 30 : 29;

    const gFirst = j2g(viewYear, viewMonth, 1);
    const firstDate = new Date(gFirst[0], gFirst[1] - 1, gFirst[2]);
    firstDayIndex = (firstDate.getDay() + 1) % 7; // Sat-first alignment
  } else {
    daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDate = new Date(viewYear, viewMonth - 1, 1);
    firstDayIndex = firstDate.getDay(); // Sun-first alignment
  }

  const calDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const handleDaySelect = (dNum: number) => {
    let gy = 2026, gm = 7, gd = 10;
    if (calType === 'shamsi') {
      const g = j2g(viewYear, viewMonth, dNum);
      gy = g[0]; gm = g[1]; gd = g[2];
    } else {
      gy = viewYear; gm = viewMonth; gd = dNum;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${gy}-${pad(gm)}-${pad(gd)}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const isSelectedDay = (dNum: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return false;

    if (calType === 'shamsi') {
      const [jy, jm, jd] = g2j(y, m, d);
      return jy === viewYear && jm === viewMonth && jd === dNum;
    } else {
      return y === viewYear && m === viewMonth && d === dNum;
    }
  };

  const todayStr = getTodayDateString();
  const isToday = (dNum: number) => {
    const [y, m, d] = todayStr.split('-').map(Number);
    if (calType === 'shamsi') {
      const [jy, jm, jd] = g2j(y, m, d);
      return jy === viewYear && jm === viewMonth && jd === dNum;
    } else {
      return y === viewYear && m === viewMonth && d === dNum;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 bg-black/40 border border-white/10 hover:border-cyan-400 focus:border-cyan-400 rounded-xl px-3 text-sm text-white flex items-center justify-between outline-none text-left font-mono transition-all"
      >
        <span className="font-vazir text-xs sm:text-sm text-right flex-1">{buttonLabel}</span>
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-1.5 w-[280px] bg-[#100b26] border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3 ${language === 'fa' ? 'right-0 text-right' : 'left-0 text-left'}`} 
          style={{ direction: language === 'fa' ? 'rtl' : 'ltr' }}
        >
          {/* Calendar Type Toggles */}
          <div className="grid grid-cols-2 bg-black/40 border border-white/5 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCalType('shamsi')}
              className={`py-1 text-[10px] font-black rounded-lg transition-all ${calType === 'shamsi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {language === 'fa' ? 'هجری شمسی' : 'Solar Shamsi'}
            </button>
            <button
              type="button"
              onClick={() => setCalType('miladi')}
              className={`py-1 text-[10px] font-black rounded-lg transition-all ${calType === 'miladi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {language === 'fa' ? 'میلادی' : 'Gregorian'}
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex justify-between items-center gap-1.5">
            <button
              type="button"
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
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400 transition"
            >
              {language === 'fa' ? (
                <span className="text-sm font-bold">&gt;</span>
              ) : (
                <span className="text-sm font-bold">&lt;</span>
              )}
            </button>

            <span className="text-xs font-black text-white font-vazir">
              {calType === 'shamsi' ? SHAMSI_MONTH_NAMES[language === 'fa' ? 'fa' : 'en'][viewMonth - 1] : GREGORIAN_MONTH_NAMES[language === 'fa' ? 'fa' : 'en'][viewMonth - 1]} {digitsToPersian(viewYear, language)}
            </span>

            <button
              type="button"
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
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-400 transition"
            >
              {language === 'fa' ? (
                <span className="text-sm font-bold">&lt;</span>
              ) : (
                <span className="text-sm font-bold">&gt;</span>
              )}
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-500 font-vazir">
            {calType === 'shamsi' ? (
              ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => <span key={d}>{d}</span>)
            ) : (
              ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)
            )}
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1">
            {paddingArray.map((_, idx) => <div key={`pad-${idx}`} />)}
            {calDaysArray.map((dNum) => {
              const active = isSelectedDay(dNum);
              const isTdy = isToday(dNum);
              
              let cellClass = "text-slate-300 hover:bg-white/10";
              if (active) {
                cellClass = "bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold shadow";
              } else if (isTdy) {
                cellClass = "border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10";
              }

              return (
                <button
                  key={dNum}
                  type="button"
                  onClick={() => handleDaySelect(dNum)}
                  className={`aspect-square w-full rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${cellClass}`}
                >
                  {digitsToPersian(dNum, language)}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={() => {
              onChange(getTodayDateString());
              setIsOpen(false);
            }}
            className="w-full py-2 text-[10px] font-bold text-center text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/15 rounded-lg transition-all font-vazir"
          >
            {language === 'fa' ? 'انتخاب امروز' : 'Select Today'}
          </button>
        </div>
      )}
    </div>
  );
};

interface BudgetManagerProps {
  language: Language;
}

export default function BudgetManager({ language }: BudgetManagerProps) {
  const trans = t[language];

  // Primary state loaded from LocalStorage
  const [archives, setArchives] = useState<MonthlyArchive[]>(() => {
    const saved = localStorage.getItem('budget_archives');
    return saved ? JSON.parse(saved) : [];
  });

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  const [currentMonthKey, setCurrentMonthKey] = useState<string>(() => {
    const savedKey = localStorage.getItem('budget_current_month_key');
    if (savedKey) return savedKey;
    
    // Auto-generate current month key (default to current Shamsi year-month)
    const d = new Date();
    const [jy, jm] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jy}-${String(jm).padStart(2, '0')}`;
  });

  const [monthsData, setMonthsData] = useState<{ [key: string]: MonthlyArchive }>(() => {
    const saved = localStorage.getItem('budget_months_data');
    let data: { [key: string]: MonthlyArchive } = {};
    if (saved) {
      data = JSON.parse(saved);
    }
    
    // Auto-create current month if empty or not found in data
    const savedKey = localStorage.getItem('budget_current_month_key') || "";
    const activeKey = savedKey || (() => {
      const d = new Date();
      const [jy, jm] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
      return `${jy}-${String(jm).padStart(2, '0')}`;
    })();
    
    if (!data[activeKey]) {
      const d = new Date();
      const [jy, jm] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
      data[activeKey] = {
        key: activeKey,
        calendar: 'shamsi',
        year: jy,
        month: jm,
        budget: 0,
        incomes: [],
        expenses: [],
        closed: false,
        currency: 'IRT'
      };
    }
    return data;
  });

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/budget');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const { archives: serverArchives, monthsData: serverMonthsData, currentMonthKey: serverCurrentMonthKey, suggestions: serverSuggestions } = result.data;
          
          if (serverArchives) setArchives(serverArchives);
          if (serverMonthsData) setMonthsData(serverMonthsData);
          if (serverCurrentMonthKey) setCurrentMonthKey(serverCurrentMonthKey);
          if (serverSuggestions) setSuggestions(serverSuggestions);
          
          setSyncStatus('synced');
        } else {
          // If JSON file doesn't exist yet, we fall back to localStorage (which is already loaded via useState initializers)
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load budget from local JSON file:", error);
        // Fallback is already loaded via useState initializers
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  // Helper to compute original base budget before investment deductions
  const getOriginalBaseBudget = (m: MonthlyArchive | undefined): number => {
    if (!m) return 0;
    const totalInvPrice = (m.investments || []).reduce((sum, inv) => sum + inv.totalPrice, 0);
    return m.budget + totalInvPrice;
  };

  // Suggestion System State
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
    const saved = localStorage.getItem('budget_autocomplete_suggestions');
    let list: Suggestion[] = [];
    if (saved) {
      list = JSON.parse(saved);
    } else {
      // Generate initial suggestions
      defaultExpenseSuggestions.forEach((text, i) => {
        list.push({ id: `exp-${i}`, text, type: 'expense', useCount: 5 - Math.min(i, 4), lastUsedAt: new Date().toISOString() });
      });
      defaultIncomeSuggestions.forEach((text, i) => {
        list.push({ id: `inc-${i}`, text, type: 'income', useCount: 5 - Math.min(i, 4), lastUsedAt: new Date().toISOString() });
      });
      defaultInvestmentSuggestions.forEach((text, i) => {
        list.push({ id: `inv-sug-${i}`, text, type: 'investment', useCount: 5 - Math.min(i, 4), lastUsedAt: new Date().toISOString() });
      });
    }

    // Ensure default protected suggestions (USD, EUR) always exist
    const hasUsd = list.some(s => s.type === 'investment' && ['دلار آمریکا', 'دلار', 'usd'].includes(s.text.toLowerCase().trim()));
    if (!hasUsd) {
      list.push({ id: `inv-sug-usd-def`, text: 'دلار آمریکا', type: 'investment', useCount: 5, lastUsedAt: new Date().toISOString() });
    }
    const hasEur = list.some(s => s.type === 'investment' && ['یورو', 'eur'].includes(s.text.toLowerCase().trim()));
    if (!hasEur) {
      list.push({ id: `inv-sug-eur-def`, text: 'یورو', type: 'investment', useCount: 5, lastUsedAt: new Date().toISOString() });
    }

    return list;
  });

  const [editingSuggestPriceId, setEditingSuggestPriceId] = useState<string | null>(null);
  const [priceInputValue, setPriceInputValue] = useState<string>("");
  const [priceCurrencyInputValue, setPriceCurrencyInputValue] = useState<'IRT' | 'USD' | 'EUR'>('IRT');

  const formatNumberWithCommas = (val: string) => {
    const clean = persianToEnglishDigits(val).replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    const integerPart = parts[0];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      return formattedInteger + '.' + parts.slice(1).join('');
    }
    return formattedInteger;
  };

  const areStringsSimilar = (str1: string, str2: string): boolean => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return false;

    // Substring match
    if (s1.length >= 3 && s2.length >= 3) {
      if (s1.includes(s2) || s2.includes(s1)) {
        return true;
      }
    }

    // Common meaningful words
    const stopWords = new Set(['and', 'the', 'for', 'with', 'با', 'در', 'به', 'از', 'و', 'برای', 'روی', 'تا']);
    const getTokens = (s: string) => 
      s.split(/[\s_-]+/)
       .map(t => t.trim())
       .filter(t => t.length >= 2 && !stopWords.has(t));

    const tokens1 = getTokens(s1);
    const tokens2 = getTokens(s2);

    if (tokens1.length === 0 || tokens2.length === 0) return false;

    const intersection = tokens1.filter(t => tokens2.includes(t));
    if (intersection.length > 0) {
      return true;
    }

    // Jaccard bigram similarity
    const getBigrams = (s: string) => {
      const bigrams = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) {
        bigrams.add(s.substring(i, i + 2));
      }
      return bigrams;
    };

    const b1 = getBigrams(s1);
    const b2 = getBigrams(s2);
    if (b1.size === 0 || b2.size === 0) return false;

    let intersectCount = 0;
    b1.forEach(bg => {
      if (b2.has(bg)) intersectCount++;
    });

    const unionSize = b1.size + b2.size - intersectCount;
    const jaccard = intersectCount / unionSize;

    return jaccard >= 0.45;
  };

  // Calendar configuration states
  const [calendarSys, setCalendarSys] = useState<'shamsi' | 'miladi'>('shamsi');
  const [dateDisplayMode, setDateDisplayMode] = useState<'shamsi' | 'miladi' | 'both'>(() => {
    return (localStorage.getItem('budget_date_display_mode') as 'shamsi' | 'miladi' | 'both') || 'both';
  });

  useEffect(() => {
    localStorage.setItem('budget_date_display_mode', dateDisplayMode);
  }, [dateDisplayMode]);

  const formatBudgetEntryDate = (dateStr: string): React.ReactNode => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;

    // Convert to Shamsi
    const [jy, jm, jd] = g2j(y, m, d);
    const pad = (n: number) => String(n).padStart(2, '0');
    const shamsiStr = `${jy}/${pad(jm)}/${pad(jd)}`;
    const miladiStr = dateStr; // YYYY-MM-DD

    if (dateDisplayMode === 'shamsi') {
      return <span>{digitsToPersian(shamsiStr, language)}</span>;
    } else if (dateDisplayMode === 'miladi') {
      return <span dir="ltr" className="font-mono text-left">{miladiStr}</span>;
    } else {
      // 'both'
      if (language === 'fa') {
        return (
          <span className="inline-flex items-center gap-1" dir="rtl">
            <span className="font-sans text-[11px] text-indigo-100">{digitsToPersian(shamsiStr, language)}</span>
            <span className="text-[9px] text-slate-500 mx-0.5">|</span>
            <span dir="ltr" className="font-mono text-[9px] text-slate-400 text-left tracking-tight bg-white/5 px-1 py-0.5 rounded border border-white/5 select-all hover:bg-white/10 transition-colors">
              {miladiStr}
            </span>
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1">
            <span className="font-sans text-[11px] text-indigo-100">{shamsiStr}</span>
            <span className="text-[9px] text-slate-500 mx-0.5">|</span>
            <span dir="ltr" className="font-mono text-[9px] text-slate-400 text-left tracking-tight bg-white/5 px-1 py-0.5 rounded border border-white/5 select-all hover:bg-white/10 transition-colors">
              {miladiStr}
            </span>
          </span>
        );
      }
    }
  };
  const [selectedYear, setSelectedYear] = useState<number>(1405);
  const [selectedMonthVal, setSelectedMonthVal] = useState<number>(1);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [isBudgetLocked, setIsBudgetLocked] = useState(true);
  const [budgetValueInput, setBudgetValueInput] = useState("");

  // Transaction form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'expense' | 'income'>('expense');
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(getTodayDateString());
  const [txDescription, setTxDescription] = useState("");

  // Investment form states
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);
  const [invType, setInvType] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invTotalPrice, setInvTotalPrice] = useState("");
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>("IRT");
  const [invDate, setInvDate] = useState(getTodayDateString());

  // Suggestion overlay state
  const [suggestionFiltered, setSuggestionFiltered] = useState<Suggestion[]>([]);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Settings configuration overlay
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [newSuggestText, setNewSuggestText] = useState("");
  const [newSuggestType, setNewSuggestType] = useState<'expense' | 'income' | 'investment'>('expense');
  const [suggestSearchQuery, setSuggestSearchQuery] = useState("");
  const [activeSuggestTab, setActiveSuggestTab] = useState<'expense' | 'income' | 'investment'>('expense');

  // Prompts and custom dialogs state
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [pendingSuggestionText, setPendingSuggestionText] = useState("");
  const [pendingSuggestionType, setPendingSuggestionType] = useState<'expense' | 'income' | 'investment'>('expense');

  // Custom modals UI notifications
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertHeader, setAlertHeader] = useState("");
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmHeader, setConfirmHeader] = useState("");
  const [confirmCallback, setConfirmCallback] = useState<{ fn: () => void } | null>(null);

  // Archived month view details modal
  const [viewArchiveKey, setViewArchiveKey] = useState<string | null>(null);

  // Archive list filters
  const [archiveFilterYear, setArchiveFilterYear] = useState<string>(() => {
    const savedKey = localStorage.getItem('budget_current_month_key');
    if (savedKey) {
      return savedKey.split('-')[0];
    }
    const d = new Date();
    const [jy] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return String(jy);
  });
  const [archiveFilterMonth, setArchiveFilterMonth] = useState<string>("");
  const [archiveFiltersOpen, setArchiveFiltersOpen] = useState(false);
  const [archiveYearDropdownOpen, setArchiveYearDropdownOpen] = useState(false);
  const [archiveMonthDropdownOpen, setArchiveMonthDropdownOpen] = useState(false);

  // Investment Suggestion overlay states
  const [showInvSuggestionDropdown, setShowInvSuggestionDropdown] = useState(false);
  const [invSuggestionFiltered, setInvSuggestionFiltered] = useState<Suggestion[]>([]);
  const invSuggestionContainerRef = useRef<HTMLDivElement>(null);

  // All Investments Modal States
  const [allInvestmentsModalOpen, setAllInvestmentsModalOpen] = useState(false);
  const [invReportCurrency, setInvReportCurrency] = useState<'IRT' | 'USD' | 'EUR'>('IRT');
  const [editingInvestmentMonthKey, setEditingInvestmentMonthKey] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [invFilterStartDate, setInvFilterStartDate] = useState<string>("");
  const [invFilterEndDate, setInvFilterEndDate] = useState<string>("");
  const [invFiltersOpen, setInvFiltersOpen] = useState(false);

  // Export Modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'transaction' | 'investment'>('transaction');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error' | null; message: string; transactions?: Transaction[]; investments?: Investment[] }>({ type: null, message: '' });
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportIncludeIncomes, setExportIncludeIncomes] = useState(true);
  const [exportIncludeExpenses, setExportIncludeExpenses] = useState(true);
  const [exportIncludeInvestments, setExportIncludeInvestments] = useState(true);
  const [exportIncludeBudgets, setExportIncludeBudgets] = useState(true);
  const [exportIncludeBalances, setExportIncludeBalances] = useState(true);
  const [exportCurrency, setExportCurrency] = useState<'IRT' | 'USD' | 'EUR'>('IRT');

  // Chart customization states
  const [chartCustomizeModalOpen, setChartCustomizeModalOpen] = useState(false);
  const [hideAmounts, setHideAmounts] = useState<boolean>(() => {
    return localStorage.getItem('budget_hide_amounts') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('budget_hide_amounts', String(hideAmounts));
  }, [hideAmounts]);

  const [chartMarketColor, setChartMarketColor] = useState<string>(() => {
    return localStorage.getItem('chart_market_color') || '#22d3ee';
  });
  const [chartMarketStyle, setChartMarketStyle] = useState<'solid' | 'dashed' | 'dotted'>(() => {
    return (localStorage.getItem('chart_market_style') as any) || 'solid';
  });
  const [chartCostColor, setChartCostColor] = useState<string>(() => {
    return localStorage.getItem('chart_cost_color') || '#f43f5e';
  });
  const [chartCostStyle, setChartCostStyle] = useState<'solid' | 'dashed' | 'dotted'>(() => {
    return (localStorage.getItem('chart_cost_style') as any) || 'dashed';
  });
  const [chartShowMarket, setChartShowMarket] = useState<boolean>(() => {
    return localStorage.getItem('chart_show_market') !== 'false';
  });
  const [chartShowCost, setChartShowCost] = useState<boolean>(() => {
    return localStorage.getItem('chart_show_cost') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('chart_market_color', chartMarketColor);
  }, [chartMarketColor]);

  useEffect(() => {
    localStorage.setItem('chart_market_style', chartMarketStyle);
  }, [chartMarketStyle]);

  useEffect(() => {
    localStorage.setItem('chart_cost_color', chartCostColor);
  }, [chartCostColor]);

  useEffect(() => {
    localStorage.setItem('chart_cost_style', chartCostStyle);
  }, [chartCostStyle]);

  useEffect(() => {
    localStorage.setItem('chart_show_market', String(chartShowMarket));
  }, [chartShowMarket]);

  useEffect(() => {
    localStorage.setItem('chart_show_cost', String(chartShowCost));
  }, [chartShowCost]);

  // Grouped investment editing states
  const [editingGroup, setEditingGroup] = useState<GroupedInvestment | null>(null);
  const [editingGroupType, setEditingGroupType] = useState("");
  const [editingGroupAmount, setEditingGroupAmount] = useState("");
  const [editingGroupTotalPrice, setEditingGroupTotalPrice] = useState("");
  const [editingGroupModalOpen, setEditingGroupModalOpen] = useState(false);

  // Drag and drop states for transactions and investments
  const [budgetDragLocked, setBudgetDragLocked] = useState<boolean>(() => {
    return localStorage.getItem('budget_drag_locked') !== 'false';
  });
  const [draggedIncomeIndex, setDraggedIncomeIndex] = useState<number | null>(null);
  const [draggedExpenseIndex, setDraggedExpenseIndex] = useState<number | null>(null);
  const [draggedInvestmentIndex, setDraggedInvestmentIndex] = useState<number | null>(null);
  const [groupedInvestmentsOrder, setGroupedInvestmentsOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('budget_grouped_investments_order');
    return saved ? JSON.parse(saved) : [];
  });
  const [draggedGroupedInvestmentIndex, setDraggedGroupedInvestmentIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('budget_drag_locked', budgetDragLocked ? 'true' : 'false');
  }, [budgetDragLocked]);

  const handleDropIncome = (fromIndex: number, toIndex: number) => {
    if (budgetDragLocked) return;
    if (fromIndex === toIndex) return;
    setMonthsData(prev => {
      const currentMonth = prev[currentMonthKey];
      if (!currentMonth) return prev;
      const updatedIncomes = [...currentMonth.incomes];
      const [removed] = updatedIncomes.splice(fromIndex, 1);
      updatedIncomes.splice(toIndex, 0, removed);
      return {
        ...prev,
        [currentMonthKey]: {
          ...currentMonth,
          incomes: updatedIncomes
        }
      };
    });
  };

  const handleDropExpense = (fromIndex: number, toIndex: number) => {
    if (budgetDragLocked) return;
    if (fromIndex === toIndex) return;
    setMonthsData(prev => {
      const currentMonth = prev[currentMonthKey];
      if (!currentMonth) return prev;
      const updatedExpenses = [...currentMonth.expenses];
      const [removed] = updatedExpenses.splice(fromIndex, 1);
      updatedExpenses.splice(toIndex, 0, removed);
      return {
        ...prev,
        [currentMonthKey]: {
          ...currentMonth,
          expenses: updatedExpenses
        }
      };
    });
  };

  const handleDropInvestment = (fromIndex: number, toIndex: number) => {
    if (budgetDragLocked) return;
    if (fromIndex === toIndex) return;
    setMonthsData(prev => {
      const currentMonth = prev[currentMonthKey];
      if (!currentMonth || !currentMonth.investments) return prev;
      const updatedInvestments = [...currentMonth.investments];
      const [removed] = updatedInvestments.splice(fromIndex, 1);
      updatedInvestments.splice(toIndex, 0, removed);
      return {
        ...prev,
        [currentMonthKey]: {
          ...currentMonth,
          investments: updatedInvestments
        }
      };
    });
  };

  const handleDropGroupedInvestment = (fromIndex: number, toIndex: number) => {
    if (budgetDragLocked) return;
    if (fromIndex === toIndex) return;
    const updatedGroups = [...groupedInvestments];
    const [removed] = updatedGroups.splice(fromIndex, 1);
    updatedGroups.splice(toIndex, 0, removed);
    const newOrder = updatedGroups.map(g => g.key);
    setGroupedInvestmentsOrder(newOrder);
    localStorage.setItem('budget_grouped_investments_order', JSON.stringify(newOrder));
  };

  // Auto-close overlay listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target as Node)) {
        setShowSuggestionDropdown(false);
      }
      if (invSuggestionContainerRef.current && !invSuggestionContainerRef.current.contains(event.target as Node)) {
        setShowInvSuggestionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Smart investment suggestions filtering and sorting engine
  useEffect(() => {
    if (!invType) {
      const list = suggestions
        .filter(s => s.type === 'investment')
        .sort((a, b) => b.useCount - a.useCount);
      setInvSuggestionFiltered(list);
    } else {
      const query = invType.toLowerCase();
      const list = suggestions
        .filter(s => s.type === 'investment' && s.text.toLowerCase().includes(query))
        .sort((a, b) => b.useCount - a.useCount);
      setInvSuggestionFiltered(list);
    }
  }, [invType, suggestions]);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budget_archives', JSON.stringify(archives));
  }, [archives]);

  useEffect(() => {
    localStorage.setItem('budget_months_data', JSON.stringify(monthsData));
  }, [monthsData]);

  useEffect(() => {
    localStorage.setItem('budget_current_month_key', currentMonthKey);
  }, [currentMonthKey]);

  useEffect(() => {
    localStorage.setItem('budget_autocomplete_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/budget', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            archives,
            monthsData,
            currentMonthKey,
            suggestions,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save budget data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay to avoid overloading the disk/network on fast typing

    return () => clearTimeout(delayDebounceFn);
  }, [archives, monthsData, currentMonthKey, suggestions, isInitialLoaded]);

  // Initial load
  useEffect(() => {
    if (currentMonthKey && monthsData[currentMonthKey]) {
      const activeMonth = monthsData[currentMonthKey];
      setCalendarSys(activeMonth.calendar);
      setSelectedYear(activeMonth.year);
      setSelectedMonthVal(activeMonth.month);
      const baseBudget = getOriginalBaseBudget(activeMonth);
      setBudgetValueInput(baseBudget !== 0 ? baseBudget.toLocaleString('en-US') : "");
      setIsBudgetLocked(baseBudget !== 0);
    } else {
      // Fallback
      const d = new Date();
      const [jy, jm] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
      setSelectedYear(jy);
      setSelectedMonthVal(jm);
    }
  }, [currentMonthKey]);

  // Smart suggestions filtering and sorting engine
  useEffect(() => {
    if (!txTitle) {
      // Show default sorted lists when empty
      const list = suggestions
        .filter(s => s.type === modalMode)
        .sort((a, b) => {
          // Sort by useCount DESC
          if (b.useCount !== a.useCount) {
            return b.useCount - a.useCount;
          }
          // Sort by lastUsedAt DESC
          const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          if (bTime !== aTime) {
            return bTime - aTime;
          }
          return a.text.localeCompare(b.text);
        });
      setSuggestionFiltered(list);
    } else {
      // Filter dynamically (case-insensitive substring anywhere in suggestion text)
      const query = txTitle.toLowerCase();
      const list = suggestions
        .filter(s => s.type === modalMode && s.text.toLowerCase().includes(query))
        .sort((a, b) => {
          if (b.useCount !== a.useCount) {
            return b.useCount - a.useCount;
          }
          const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          if (bTime !== aTime) {
            return bTime - aTime;
          }
          return a.text.localeCompare(b.text);
        });
      setSuggestionFiltered(list);
    }
  }, [txTitle, suggestions, modalMode, modalOpen]);

  const triggerAlert = (msg: string, head?: string) => {
    setAlertMsg(msg);
    setAlertHeader(head || trans.alertTitle);
    setAlertOpen(true);
  };

  const handleExportBudgetJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          archives,
          monthsData,
          suggestions
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `budget_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export budget JSON:", error);
    }
  };

  const handleImportBudgetJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (Array.isArray(parsed.archives) || parsed.monthsData)) {
          if (Array.isArray(parsed.archives)) setArchives(parsed.archives);
          if (parsed.monthsData) setMonthsData(parsed.monthsData);
          if (Array.isArray(parsed.suggestions)) setSuggestions(parsed.suggestions);
          
          triggerAlert(
            language === 'fa' ? "بودجه و آرشیوها با موفقیت از فایل JSON بازیابی شدند!" : "Budget and archives successfully restored from JSON backup!",
            language === 'fa' ? "بازیابی موفق" : "Restore Successful"
          );
        } else {
          triggerAlert(
            language === 'fa' ? "ساختار فایل پشتیبان نامعتبر است." : "Invalid backup file structure.",
            language === 'fa' ? "خطای بازیابی" : "Restore Error"
          );
        }
      } catch (err) {
        triggerAlert(
          language === 'fa' ? "خواندن فایل با خطا مواجه شد." : "An error occurred while parsing the file.",
          language === 'fa' ? "خطا" : "Error"
        );
      }
    };
    fileReader.readAsText(file);
    e.target.value = '';
  };

  const triggerConfirm = (msg: string, onConfirm: () => void, head?: string) => {
    setConfirmMsg(msg);
    setConfirmHeader(head || trans.confirmTitle);
    setConfirmCallback({ fn: onConfirm });
    setConfirmOpen(true);
  };

  // Helper numbers
  const parseAmount = (val: string): number => {
    const clean = persianToEnglishDigits(val).replace(/,/g, '');
    return Number(clean) || 0;
  };

  const formatCurrency = (amount: number, curr: CurrencyCode) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: curr === 'IRT' ? 0 : 0, 
      maximumFractionDigits: curr === 'IRT' ? 0 : 2 
    });
  };

  const getCurrencySymbol = (curr: CurrencyCode) => {
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    return 'IRT';
  };

  // Switch months
  const handleGoToMonth = () => {
    const key = `${selectedYear}-${String(selectedMonthVal).padStart(2, '0')}`;
    
    // Create month if not exists
    if (!monthsData[key]) {
      const activeTab = document.querySelector(".currency-tab-active")?.getAttribute("data-currency") as CurrencyCode || "IRT";
      const newMonth: MonthlyArchive = {
        key,
        calendar: calendarSys,
        year: selectedYear,
        month: selectedMonthVal,
        budget: 0,
        incomes: [],
        expenses: [],
        closed: false,
        currency: 'IRT'
      };
      setMonthsData(prev => ({ ...prev, [key]: newMonth }));
    }

    setCurrentMonthKey(key);
    const mForGo = monthsData[key];
    const baseBudgetForGo = getOriginalBaseBudget(mForGo);
    setIsBudgetLocked(baseBudgetForGo !== 0);
    setBudgetValueInput(baseBudgetForGo !== 0 ? baseBudgetForGo.toLocaleString('en-US') : "");
  };

  const handleSaveBudget = () => {
    if (!currentMonthKey) {
      triggerAlert(trans.alertSelectMonth);
      return;
    }
    const current = monthsData[currentMonthKey];
    if (current?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }

    const value = parseAmount(budgetValueInput);
    if (value <= 0) {
      triggerAlert(trans.alertValidBudget);
      return;
    }

    setMonthsData(prev => {
      const m = { ...prev[currentMonthKey] };
      const totalInvPrice = (m.investments || []).reduce((sum, inv) => sum + inv.totalPrice, 0);
      m.budget = value - totalInvPrice;
      return { ...prev, [currentMonthKey]: m };
    });

    setIsBudgetLocked(true);
    triggerAlert(trans.alertBudgetSaved);
  };

  const handleToggleBudgetLock = () => {
    if (!currentMonthKey) {
      triggerAlert(trans.alertSelectMonth);
      return;
    }
    const current = monthsData[currentMonthKey];
    if (current?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }

    if (isBudgetLocked) {
      setIsBudgetLocked(false);
    } else {
      const value = parseAmount(budgetValueInput);
      if (value > 0) {
        setMonthsData(prev => {
          const m = { ...prev[currentMonthKey] };
          const totalInvPrice = (m.investments || []).reduce((sum, inv) => sum + inv.totalPrice, 0);
          m.budget = value - totalInvPrice;
          return { ...prev, [currentMonthKey]: m };
        });
        setIsBudgetLocked(true);
      } else {
        triggerAlert(trans.alertValidBudget);
      }
    }
  };

  const handleAddTransactionClick = (type: 'expense' | 'income') => {
    if (!currentMonthKey) {
      triggerAlert(trans.alertSelectMonth);
      return;
    }
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }

    setModalMode(type);
    setEditingTxId(null);
    setTxTitle("");
    setTxAmount("");
    setTxDate(getTodayDateString());
    setTxDescription("");
    setModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction, type: 'expense' | 'income') => {
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }
    setModalMode(type);
    setEditingTxId(tx.id);
    setTxTitle(tx.title);
    setTxAmount(tx.amount.toLocaleString('en-US'));
    setTxDate(tx.date || getTodayDateString());
    setTxDescription(tx.description || "");
    setModalOpen(true);
  };

  const handleDeleteTransaction = (id: string, type: 'expense' | 'income') => {
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }
    
    const msg = type === 'expense' ? trans.alertConfirmDeleteExpense : trans.alertConfirmDeleteIncome;
    triggerConfirm(msg, () => {
      setMonthsData(prev => {
        const m = { ...prev[currentMonthKey] };
        if (type === 'expense') {
          m.expenses = m.expenses.filter(e => e.id !== id);
        } else {
          m.incomes = m.incomes.filter(i => i.id !== id);
        }
        return { ...prev, [currentMonthKey]: m };
      });
    });
  };

  // Auto-complete selection click handler
  const handleSelectSuggestion = (s: Suggestion) => {
    setTxTitle(s.text);
    setShowSuggestionDropdown(false);
  };

  // Submit transaction details form
  const handleSaveTransaction = () => {
    if (txTitle.trim() === "") {
      triggerAlert(trans.alertValidTitle);
      return;
    }
    const amt = parseAmount(txAmount);
    if (amt <= 0) {
      triggerAlert(trans.alertValidAmount);
      return;
    }

    const txItem: Transaction = {
      id: editingTxId || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: txTitle.trim(),
      amount: amt,
      type: modalMode,
      date: txDate,
      description: txDescription.trim()
    };

    setMonthsData(prev => {
      const m = { ...prev[currentMonthKey] };
      if (modalMode === 'expense') {
        if (editingTxId) {
          m.expenses = (m.expenses || []).map(e => e.id === editingTxId ? txItem : e);
        } else {
          m.expenses = [...(m.expenses || []), txItem];
        }
      } else {
        if (editingTxId) {
          m.incomes = (m.incomes || []).map(i => i.id === editingTxId ? txItem : i);
        } else {
          m.incomes = [...(m.incomes || []), txItem];
        }
      }
      return { ...prev, [currentMonthKey]: m };
    });

    // Check if title is in suggestions list
    const exists = suggestions.some(s => s.type === modalMode && s.text.toLowerCase() === txTitle.trim().toLowerCase());
    
    // Increment usage count if it exists
    if (exists) {
      setSuggestions(prev => prev.map(s => {
        if (s.type === modalMode && s.text.toLowerCase() === txTitle.trim().toLowerCase()) {
          return {
            ...s,
            useCount: s.useCount + 1,
            lastUsedAt: new Date().toISOString()
          };
        }
        return s;
      }));
    } else {
      // Prompt modal to add to autocomplete suggestions list!
      setPendingSuggestionText(txTitle.trim());
      setPendingSuggestionType(modalMode);
      setCustomPromptOpen(true);
    }

    setModalOpen(false);
  };

  const handleConfirmAddPendingSuggestion = (add: boolean) => {
    if (add && pendingSuggestionText) {
      const newSug: Suggestion = {
        id: `sug-${Date.now()}`,
        text: pendingSuggestionText,
        type: pendingSuggestionType,
        useCount: 1,
        lastUsedAt: new Date().toISOString()
      };
      setSuggestions(prev => [newSug, ...prev]);
    }
    setCustomPromptOpen(false);
    setPendingSuggestionText("");
  };

  // Close accounts and archive current month
  const handleCloseAndArchiveMonth = () => {
    if (!currentMonthKey) {
      triggerAlert(trans.alertSelectMonth);
      return;
    }
    const current = monthsData[currentMonthKey];
    if (current?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }

    triggerConfirm(trans.alertConfirmCloseMonth, () => {
      setMonthsData(prev => {
        const m = { ...prev[currentMonthKey], closed: true };
        return { ...prev, [currentMonthKey]: m };
      });

      // Add to archive list if not present
      setArchives(prev => {
        const monthItem = { ...monthsData[currentMonthKey], closed: true };
        if (prev.some(a => a.key === currentMonthKey)) {
          return prev.map(a => a.key === currentMonthKey ? monthItem : a);
        }
        return [...prev, monthItem];
      });

      // Shift forward to next month
      let nextY = selectedYear;
      let nextM = selectedMonthVal + 1;
      if (nextM > 12) {
        nextM = 1;
        nextY += 1;
      }

      const nextKey = `${nextY}-${String(nextM).padStart(2, '0')}`;
      if (!monthsData[nextKey]) {
        const newMonth: MonthlyArchive = {
          key: nextKey,
          calendar: calendarSys,
          year: nextY,
          month: nextM,
          budget: 0,
          incomes: [],
          expenses: [],
          closed: false,
          currency: current.currency || 'IRT'
        };
        setMonthsData(p => ({ ...p, [nextKey]: newMonth }));
      }

      setCurrentMonthKey(nextKey);
      triggerAlert(trans.alertMonthClosedSuccess);
    });
  };

  // Suggestions Management Settings functions
  const handleAddCustomSuggestion = () => {
    const trimmedText = newSuggestText.trim();
    if (!trimmedText) return;

    // 1. Exact match check (case-insensitive, trimmed)
    const exactMatch = suggestions.find(s => s.type === newSuggestType && s.text.toLowerCase().trim() === trimmedText.toLowerCase());
    if (exactMatch) {
      triggerAlert(
        language === 'fa' 
          ? `پیشنهاد «${exactMatch.text}» از قبل در بخش ${newSuggestType === 'expense' ? 'هزینه‌ها' : newSuggestType === 'income' ? 'درآمدها' : 'سرمایه‌گذاری‌ها'} وجود دارد.` 
          : `The suggestion "${exactMatch.text}" already exists in the ${newSuggestType === 'expense' ? 'Expenses' : newSuggestType === 'income' ? 'Incomes' : 'Investments'} category.`
      );
      return;
    }

    // 2. Similarity check (substrings, common words, bigrams)
    const similarMatch = suggestions.find(s => s.type === newSuggestType && areStringsSimilar(s.text, trimmedText));
    if (similarMatch) {
      const confirmMsg = language === 'fa'
        ? `یک پیشنهاد مشابه با عنوان «${similarMatch.text}» در این دسته‌بندی وجود دارد. آیا مطمئن هستید که می‌خواهید پیشنهاد جدید «${trimmedText}» را ثبت کنید؟`
        : `A similar suggestion "${similarMatch.text}" already exists in this category. Are you sure you want to register "${trimmedText}"?`;
      
      triggerConfirm(confirmMsg, () => {
        const item: Suggestion = {
          id: `sug-custom-${Date.now()}`,
          text: trimmedText,
          type: newSuggestType,
          useCount: 0,
          lastUsedAt: new Date().toISOString()
        };
        setSuggestions(prev => [item, ...prev]);
        setNewSuggestText("");
      });
      return;
    }

    // 3. Simple immediate add
    const item: Suggestion = {
      id: `sug-custom-${Date.now()}`,
      text: trimmedText,
      type: newSuggestType,
      useCount: 0,
      lastUsedAt: new Date().toISOString()
    };

    setSuggestions(prev => [item, ...prev]);
    setNewSuggestText("");
  };

  const handleDeleteSuggestion = (id: string) => {
    const s = suggestions.find(x => x.id === id);
    if (s && s.type === 'investment' && ['دلار آمریکا', 'دلار', 'یورو', 'usd', 'eur'].includes(s.text.toLowerCase().trim())) {
      triggerAlert(language === 'fa' ? 'امکان حذف گزینه‌های پیش‌فرض ارز وجود ندارد.' : 'Default currency suggestions cannot be deleted.');
      return;
    }
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleAddInvestmentClick = () => {
    if (!currentMonthKey) {
      triggerAlert(trans.alertSelectMonth);
      return;
    }
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }
    setEditingInvestmentId(null);
    setEditingInvestmentMonthKey(null);
    setInvType("");
    setInvAmount("");
    setInvTotalPrice("");
    setInvCurrency("IRT");
    setInvDate(getTodayDateString());
    setInvestmentModalOpen(true);
  };

  const handleEditInvestmentFlex = (inv: Investment, targetMonthKey: string) => {
    setEditingInvestmentId(inv.id);
    setEditingInvestmentMonthKey(targetMonthKey);
    setInvType(inv.type);
    setInvAmount(inv.amount.toString());
    setInvTotalPrice(inv.totalPrice.toLocaleString('en-US'));
    setInvCurrency(inv.currency);
    setInvDate(inv.date || getTodayDateString());
    setInvestmentModalOpen(true);
  };

  const handleEditInvestment = (inv: Investment) => {
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }
    handleEditInvestmentFlex(inv, currentMonthKey);
  };

  const handleSelectInvSuggestion = (s: Suggestion) => {
    setInvType(s.text);
    setShowInvSuggestionDropdown(false);
  };

  const handleDeleteInvestmentFlex = (id: string, targetMonthKey: string) => {
    const isClosed = monthsData[targetMonthKey]?.closed;
    const confirmMsg = isClosed 
      ? (language === 'fa' ? 'این سرمایه‌گذاری مربوط به یک ماه بایگانی شده است. آیا مطمئنید که می‌خواهید آن را حذف کنید؟ (بودجه این ماه به صورت خودکار تعدیل خواهد شد)' : 'This investment belongs to an archived month. Are you sure you want to delete it? (The budget of that month will be auto-adjusted)')
      : trans.alertConfirmDeleteInvestment;

    triggerConfirm(confirmMsg, () => {
      let newBudget = 0;
      setMonthsData(prev => {
        const m = { ...prev[targetMonthKey] };
        if (!m) return prev;
        const deletedInv = (m.investments || []).find(inv => inv.id === id);
        const deletedPrice = deletedInv ? deletedInv.totalPrice : 0;
        m.budget = m.budget + deletedPrice;
        m.investments = (m.investments || []).filter(inv => inv.id !== id);
        newBudget = m.budget;
        return { ...prev, [targetMonthKey]: m };
      });
    });
  };

  const handleDeleteInvestment = (id: string) => {
    if (monthsData[currentMonthKey]?.closed) {
      triggerAlert(trans.alertMonthArchived);
      return;
    }
    handleDeleteInvestmentFlex(id, currentMonthKey);
  };

  const handleEditGroupedInvestment = (group: GroupedInvestment) => {
    setEditingGroup(group);
    setEditingGroupType(group.type);
    setEditingGroupAmount(group.totalAmount.toString());
    setEditingGroupTotalPrice(group.totalPrice.toString());
    setEditingGroupModalOpen(true);
  };

  const handleDeleteGroupedInvestment = (group: GroupedInvestment) => {
    const hasClosedMonth = group.items.some(item => monthsData[item.monthKey]?.closed);
    const confirmMsg = language === 'fa'
      ? `آیا مطمئن هستید که می‌خواهید تمام خریدهای مربوط به سهم «${group.type}» را حذف کنید؟ این کار تمام جزئیات خرید را از تمام ماه‌ها پاک کرده و بودجه آن‌ها را بازمی‌گرداند.`
      : `Are you sure you want to delete all purchases for "${group.type}"? This will delete all assets across all months and refund their prices to their respective budgets.`;

    triggerConfirm(confirmMsg, () => {
      setMonthsData(prev => {
        const updated = { ...prev };
        group.items.forEach(item => {
          const m = updated[item.monthKey];
          if (m) {
            const mCopy = { ...m };
            const oldInv = (mCopy.investments || []).find(inv => inv.id === item.id);
            const price = oldInv ? oldInv.totalPrice : 0;
            mCopy.budget = mCopy.budget + price;
            mCopy.investments = (mCopy.investments || []).filter(inv => inv.id !== item.id);
            updated[item.monthKey] = mCopy;
          }
        });
        return updated;
      });

      // Update budget value input if current month was impacted
      const hasCurrentMonth = group.items.some(item => item.monthKey === currentMonthKey);
      if (hasCurrentMonth) {
        setTimeout(() => {
          setMonthsData(latest => {
            const currentM = latest[currentMonthKey];
            if (currentM) {
              const baseBudget = getOriginalBaseBudget(currentM);
              setBudgetValueInput(baseBudget !== 0 ? baseBudget.toLocaleString('en-US') : "");
            }
            return latest;
          });
        }, 10);
      }
    });
  };

  const handleSaveGroupedInvestment = () => {
    if (!editingGroup) return;

    const newType = editingGroupType.trim();
    if (newType === "") {
      triggerAlert(trans.alertValidTitle);
      return;
    }

    const newTotalAmount = Number(persianToEnglishDigits(editingGroupAmount).replace(/,/g, '')) || 0;
    const newTotalPrice = Number(persianToEnglishDigits(editingGroupTotalPrice).replace(/,/g, '')) || 0;

    if (newTotalAmount <= 0) {
      triggerAlert(trans.alertValidAmount);
      return;
    }
    if (newTotalPrice <= 0) {
      triggerAlert(trans.alertValidAmount);
      return;
    }

    // Sort items oldest-to-newest so we can reduce/delete sequentially from oldest
    const sortedItems = [...editingGroup.items].sort((a, b) => a.date.localeCompare(b.date));
    const oldTotalAmount = editingGroup.totalAmount;
    
    // Store modifications to be made to each item
    const itemUpdates: { [id: string]: { amount: number; totalPrice: number; type: string; deleted?: boolean; monthKey: string } } = {};

    sortedItems.forEach(item => {
      itemUpdates[item.id] = {
        amount: item.amount,
        totalPrice: item.totalPrice,
        type: newType,
        monthKey: item.monthKey
      };
    });

    if (newTotalAmount < oldTotalAmount) {
      // REDUCE amount sequentially from oldest to newest
      let reductionAmount = oldTotalAmount - newTotalAmount;
      for (const item of sortedItems) {
        if (reductionAmount <= 0) break;
        const currentItemAmt = itemUpdates[item.id].amount;
        if (currentItemAmt <= reductionAmount) {
          // This item is completely removed!
          itemUpdates[item.id].deleted = true;
          itemUpdates[item.id].amount = 0;
          itemUpdates[item.id].totalPrice = 0;
          reductionAmount -= currentItemAmt;
        } else {
          // This item is partially reduced
          itemUpdates[item.id].amount = currentItemAmt - reductionAmount;
          reductionAmount = 0;
        }
      }
    } else if (newTotalAmount > oldTotalAmount) {
      // INCREASE amount on the newest item
      const increaseAmount = newTotalAmount - oldTotalAmount;
      if (sortedItems.length > 0) {
        const newestItem = sortedItems[sortedItems.length - 1];
        itemUpdates[newestItem.id].amount += increaseAmount;
      }
    }

    // Adjust prices proportionally according to new individual quantities
    const remainingItems = sortedItems.filter(item => !itemUpdates[item.id].deleted);
    const sumOfNewAmounts = remainingItems.reduce((sum, item) => sum + itemUpdates[item.id].amount, 0);

    if (sumOfNewAmounts > 0) {
      let allocatedPrice = 0;
      remainingItems.forEach((item, index) => {
        const updates = itemUpdates[item.id];
        if (index === remainingItems.length - 1) {
          updates.totalPrice = newTotalPrice - allocatedPrice;
        } else {
          const itemRatio = updates.amount / sumOfNewAmounts;
          const proportionalPrice = Math.round(itemRatio * newTotalPrice);
          updates.totalPrice = proportionalPrice;
          allocatedPrice += proportionalPrice;
        }
      });
    }

    // Apply adjustments to monthsData and update budgets
    setMonthsData(prev => {
      const updated = { ...prev };
      const affectedMonthKeys = Array.from(new Set(sortedItems.map(item => item.monthKey)));

      affectedMonthKeys.forEach(mKey => {
        const m = updated[mKey];
        if (m) {
          const mCopy = { ...m };
          let oldMonthSum = 0;
          let newMonthSum = 0;

          const monthItems = sortedItems.filter(item => item.monthKey === mKey);
          monthItems.forEach(item => {
            oldMonthSum += item.totalPrice;
            const update = itemUpdates[item.id];
            if (update && !update.deleted) {
              newMonthSum += update.totalPrice;
            }
          });

          const diff = newMonthSum - oldMonthSum;
          mCopy.budget = mCopy.budget - diff;

          mCopy.investments = (mCopy.investments || []).map(inv => {
            const update = itemUpdates[inv.id];
            if (update) {
              if (update.deleted) return null;
              return {
                ...inv,
                type: update.type,
                amount: update.amount,
                totalPrice: update.totalPrice
              };
            }
            return inv;
          }).filter((inv): inv is Investment => inv !== null);

          updated[mKey] = mCopy;
        }
      });

      return updated;
    });

    // Update current month budget input if affected
    const hasCurrentMonth = sortedItems.some(item => item.monthKey === currentMonthKey);
    if (hasCurrentMonth) {
      setTimeout(() => {
        setMonthsData(latest => {
          const currentM = latest[currentMonthKey];
          if (currentM) {
            const baseBudget = getOriginalBaseBudget(currentM);
            setBudgetValueInput(baseBudget !== 0 ? baseBudget.toLocaleString('en-US') : "");
          }
          return latest;
        });
      }, 10);
    }

    setEditingGroup(null);
    setEditingGroupModalOpen(false);
  };

  const handleSaveInvestment = () => {
    if (invType.trim() === "") {
      triggerAlert(trans.alertValidTitle);
      return;
    }
    const amt = Number(persianToEnglishDigits(invAmount).replace(/,/g, '')) || 0;
    const price = parseAmount(invTotalPrice);
    if (amt <= 0) {
      triggerAlert(trans.alertValidAmount);
      return;
    }
    if (price <= 0) {
      triggerAlert(trans.alertValidAmount);
      return;
    }

    const invItem: Investment = {
      id: editingInvestmentId || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: invType.trim(),
      amount: amt,
      totalPrice: price,
      currency: invCurrency,
      date: invDate
    };

    const targetKey = editingInvestmentMonthKey || currentMonthKey;

    let newBudget = 0;
    setMonthsData(prev => {
      const m = { ...prev[targetKey] };
      if (!m) return prev;
      const list = m.investments || [];
      if (editingInvestmentId) {
        const oldInv = list.find(item => item.id === editingInvestmentId);
        const oldPrice = oldInv ? oldInv.totalPrice : 0;
        m.budget = m.budget + oldPrice - price;
        m.investments = list.map(item => item.id === editingInvestmentId ? invItem : item);
      } else {
        m.budget = m.budget - price;
        m.investments = [...list, invItem];
      }
      newBudget = m.budget;
      return { ...prev, [targetKey]: m };
    });

    // Check if asset type is in suggestions list
    const exists = suggestions.some(s => s.type === 'investment' && s.text.toLowerCase() === invType.trim().toLowerCase());
    if (exists) {
      setSuggestions(prev => prev.map(s => {
        if (s.type === 'investment' && s.text.toLowerCase() === invType.trim().toLowerCase()) {
          return {
            ...s,
            useCount: s.useCount + 1,
            lastUsedAt: new Date().toISOString()
          };
        }
        return s;
      }));
    } else {
      setPendingSuggestionText(invType.trim());
      setPendingSuggestionType('investment');
      setCustomPromptOpen(true);
    }

    setEditingInvestmentId(null);
    setEditingInvestmentMonthKey(null);
    setInvestmentModalOpen(false);
  };

  const getUsdPriceInIrt = () => {
    const sug = suggestions.find(s => s.type === 'investment' && ['دلار آمریکا', 'دلار', 'usd'].includes(s.text.toLowerCase().trim()));
    if (!sug || !sug.price || sug.price <= 0) return 60000;
    if (sug.priceCurrency === 'USD') return 60000;
    if (sug.priceCurrency === 'EUR') return sug.price * 65000;
    return sug.price;
  };

  const getEurPriceInIrt = () => {
    const sug = suggestions.find(s => s.type === 'investment' && ['یورو', 'eur'].includes(s.text.toLowerCase().trim()));
    if (!sug || !sug.price || sug.price <= 0) return 65000;
    if (sug.priceCurrency === 'EUR') return 65000;
    if (sug.priceCurrency === 'USD') return sug.price * getUsdPriceInIrt();
    return sug.price;
  };

  const convertCurrency = (amount: number, from: 'IRT' | 'USD' | 'EUR', to: 'IRT' | 'USD' | 'EUR') => {
    if (from === to) return amount;
    const usdPriceInIrt = getUsdPriceInIrt();
    const eurPriceInIrt = getEurPriceInIrt();
    
    // Convert to IRT first
    let amountInIrt = amount;
    if (from === 'USD') {
      amountInIrt = amount * usdPriceInIrt;
    } else if (from === 'EUR') {
      amountInIrt = amount * eurPriceInIrt;
    }

    // Convert from IRT to target
    if (to === 'IRT') {
      return amountInIrt;
    } else if (to === 'USD') {
      return amountInIrt / usdPriceInIrt;
    } else if (to === 'EUR') {
      return amountInIrt / eurPriceInIrt;
    }
    return amount;
  };

  // Helper to calculate current value or cost value of an investment in a target currency
  const getInvestmentValue = (inv: Investment, targetCurr: 'IRT' | 'USD' | 'EUR', useCurrentPrice: boolean = true) => {
    if (useCurrentPrice) {
      // Find matching suggestion
      const matchingSug = suggestions.find(s => s.type === 'investment' && s.text.toLowerCase().trim() === inv.type.toLowerCase().trim());
      if (matchingSug && matchingSug.price !== undefined && matchingSug.price > 0) {
        const pCurr = matchingSug.priceCurrency || 'IRT';
        const rawValue = inv.amount * matchingSug.price;
        return convertCurrency(rawValue, pCurr, targetCurr);
      }
    }
    // Fallback to purchase cost (totalPrice)
    return convertCurrency(inv.totalPrice, inv.currency, targetCurr);
  };

  const allInvestments = useMemo(() => {
    const list: AggregatedInvestment[] = [];
    (Object.entries(monthsData) as [string, MonthlyArchive][]).forEach(([monthKey, m]) => {
      if (m.investments) {
        m.investments.forEach((inv) => {
          list.push({
            ...inv,
            monthKey
          });
        });
      }
    });
    return list;
  }, [monthsData]);

  const filteredInvestments = useMemo(() => {
    return allInvestments.filter((inv) => {
      if (invFilterStartDate && inv.date < invFilterStartDate) return false;
      if (invFilterEndDate && inv.date > invFilterEndDate) return false;
      return true;
    });
  }, [allInvestments, invFilterStartDate, invFilterEndDate]);

  const groupedInvestments = useMemo(() => {
    const groups: { [key: string]: GroupedInvestment } = {};

    filteredInvestments.forEach((inv) => {
      const typeKey = inv.type.trim().toLowerCase();
      const groupKey = typeKey;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          type: inv.type, // keep original casing
          currency: inv.currency,
          totalAmount: 0,
          totalPrice: 0,
          items: []
        };
      }
      groups[groupKey].totalAmount += inv.amount;
      groups[groupKey].items.push(inv);
    });

    // Calculate total price in the group's currency (converting any items with a different currency)
    Object.values(groups).forEach((g) => {
      g.totalPrice = g.items.reduce((sum, item) => {
        return sum + convertCurrency(item.totalPrice, item.currency, g.currency);
      }, 0);
    });

    // Sort items inside each group by date descending (newest first)
    Object.values(groups).forEach((g) => {
      g.items.sort((a, b) => b.date.localeCompare(a.date));
    });

    // Return groups sorted alphabetically or by custom drag-and-drop order
    const sortedGroups = Object.values(groups);
    if (groupedInvestmentsOrder.length > 0) {
      sortedGroups.sort((a, b) => {
        const indexA = groupedInvestmentsOrder.indexOf(a.key);
        const indexB = groupedInvestmentsOrder.indexOf(b.key);
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.type.localeCompare(b.type);
      });
    } else {
      sortedGroups.sort((a, b) => a.type.localeCompare(b.type));
    }
    return sortedGroups;
  }, [filteredInvestments, groupedInvestmentsOrder]);

  const chartData = useMemo(() => {
    const sorted = [...filteredInvestments].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return [];

    // Find all unique dates and sort them ascending
    const uniqueDates = Array.from(new Set(sorted.map(inv => inv.date))).sort();

    // For each unique date, calculate cumulative values of investments up to that date in selected currency
    const cumulativeData = uniqueDates.map((date) => {
      const investmentsOnOrBefore = sorted.filter(inv => inv.date <= date);

      const totalCurrentVal = investmentsOnOrBefore.reduce((sum, inv) => {
        return sum + getInvestmentValue(inv, invReportCurrency, true);
      }, 0);

      const totalCostVal = investmentsOnOrBefore.reduce((sum, inv) => {
        return sum + getInvestmentValue(inv, invReportCurrency, false);
      }, 0);

      return {
        date,
        displayDate: digitsToPersian(date),
        total: Math.round(totalCurrentVal),
        cost: Math.round(totalCostVal)
      };
    });

    if (cumulativeData.length === 1) {
      const singlePoint = cumulativeData[0];
      const prevDate = new Date(singlePoint.date || new Date());
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      return [
        {
          date: prevDateStr,
          displayDate: digitsToPersian(prevDateStr),
          total: 0,
          cost: 0
        },
        singlePoint
      ];
    }

    return cumulativeData;
  }, [filteredInvestments, invReportCurrency, suggestions]);

  // --- IMPORT EXCEL/CSV FOR BUDGET MANAGER ---
  const handleDownloadBudgetTxTemplate = () => {
    const headers = ['date', 'title', 'amount', 'type', 'description'];
    const sampleData = [
      {
        date: '1405-04-18',
        title: 'خرید سوپرمارکت',
        amount: 450000,
        type: 'expense',
        description: 'خرید هفتگی اقلام مصرفی خانه'
      },
      {
        date: '1405-04-20',
        title: 'حقوق ماهیانه',
        amount: 25000000,
        type: 'income',
        description: 'واریز حقوق پایه شرکت'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions Template");
    XLSX.writeFile(wb, "budget_transactions_template.xlsx");
  };

  const handleDownloadBudgetInvTemplate = () => {
    const headers = ['date', 'type', 'amount', 'totalPrice', 'currency'];
    const sampleData = [
      {
        date: '1405-04-18',
        type: 'طلا ۱۸ عیار',
        amount: 2.5,
        totalPrice: 8750000,
        currency: 'IRT'
      },
      {
        date: '1405-04-22',
        type: 'سهام بورس',
        amount: 1500,
        totalPrice: 12000000,
        currency: 'IRT'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Investments Template");
    XLSX.writeFile(wb, "budget_investments_template.xlsx");
  };

  const handleImportBudgetFile = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            message: language === 'fa' ? 'فایل خالی است یا فرمت آن پشتیبانی نمی‌شود.' : 'File is empty or format is unsupported.'
          });
          return;
        }

        if (importType === 'transaction') {
          const parsedTransactions: Transaction[] = [];
          jsonData.forEach((row: any, index: number) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              const normKey = key.toLowerCase().replace(/[\s_-]/g, '').trim();
              normalizedRow[normKey] = row[key];
            });

            const dateRaw = String(normalizedRow['date'] || normalizedRow['تاریخ'] || getTodayDateString());
            const title = String(normalizedRow['title'] || normalizedRow['عنوان'] || (language === 'fa' ? 'تراکنش وارد شده' : 'Imported Tx'));
            const amount = parseFloat(String(normalizedRow['amount'] || normalizedRow['مبلغ'] || 0).replace(/,/g, '')) || 0;
            const rawType = String(normalizedRow['type'] || normalizedRow['نوع'] || 'expense').toLowerCase();
            const type: 'income' | 'expense' = (rawType.includes('income') || rawType.includes('درآمد') || rawType.includes('دآمد') || rawType.includes('inc') || rawType.includes('i')) ? 'income' : 'expense';
            const description = String(normalizedRow['description'] || normalizedRow['توضیحات'] || '');

            parsedTransactions.push({
              id: 'imported-tx-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(2, 8),
              title,
              amount,
              type,
              date: dateRaw,
              description
            });
          });

          if (parsedTransactions.length > 0) {
            setImportFeedback({
              type: 'success',
              message: language === 'fa' 
                ? `تعداد ${parsedTransactions.length} تراکنش با موفقیت شناسایی شد. جهت تایید و ذخیره روی دکمه ثبت کلیک کنید.` 
                : `Found ${parsedTransactions.length} transactions. Click Confirm to import.`,
              transactions: parsedTransactions
            });
          } else {
            setImportFeedback({
              type: 'error',
              message: language === 'fa' ? 'هیچ تراکنش معتبری یافت نشد.' : 'No valid transactions found.'
            });
          }
        } else {
          // Investment import
          const parsedInvestments: Investment[] = [];
          jsonData.forEach((row: any, index: number) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              const normKey = key.toLowerCase().replace(/[\s_-]/g, '').trim();
              normalizedRow[normKey] = row[key];
            });

            const dateRaw = String(normalizedRow['date'] || normalizedRow['تاریخ'] || getTodayDateString());
            const type = String(normalizedRow['type'] || normalizedRow['نوع'] || (language === 'fa' ? 'سرمایه‌گذاری وارد شده' : 'Imported Investment'));
            const amount = parseFloat(String(normalizedRow['amount'] || normalizedRow['مقدار'] || normalizedRow['تعداد'] || 1).replace(/,/g, '')) || 1;
            const totalPrice = parseFloat(String(normalizedRow['totalprice'] || normalizedRow['قیمتخریدکل'] || normalizedRow['قیمتکل'] || normalizedRow['ارزشکل'] || 0).replace(/,/g, '')) || 0;
            const rawCurrency = String(normalizedRow['currency'] || normalizedRow['ارز'] || 'IRT').toUpperCase();
            const currency: CurrencyCode = (rawCurrency.includes('USD') || rawCurrency.includes('دلار')) 
              ? 'USD' 
              : (rawCurrency.includes('EUR') || rawCurrency.includes('یورو')) 
                ? 'EUR' 
                : 'IRT';

            parsedInvestments.push({
              id: 'imported-inv-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(2, 8),
              type,
              amount,
              totalPrice,
              currency,
              date: dateRaw
            });
          });

          if (parsedInvestments.length > 0) {
            setImportFeedback({
              type: 'success',
              message: language === 'fa' 
                ? `تعداد ${parsedInvestments.length} رکورد سرمایه‌گذاری با موفقیت شناسایی شد. جهت تایید و ذخیره روی دکمه ثبت کلیک کنید.` 
                : `Found ${parsedInvestments.length} investments. Click Confirm to import.`,
              investments: parsedInvestments
            });
          } else {
            setImportFeedback({
              type: 'error',
              message: language === 'fa' ? 'هیچ سرمایه‌گذاری معتبری یافت نشد.' : 'No valid investments found.'
            });
          }
        }
      } catch (err) {
        setImportFeedback({
          type: 'error',
          message: language === 'fa' ? 'خطا در پردازش فایل. لطفاً از قالب استاندارد استفاده کنید.' : 'Error parsing file. Please use a valid spreadsheet.'
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

  const handleConfirmBudgetImport = () => {
    if (importType === 'transaction' && importFeedback.transactions && importFeedback.transactions.length > 0) {
      const dataToImport = importFeedback.transactions;
      if (!dataToImport || dataToImport.length === 0) return;

      // Reset feedback immediately to prevent double click
      setImportFeedback({ type: null, message: '' });
      setImportModalOpen(false);

      setMonthsData(prev => {
        const updated = { ...prev };
        dataToImport.forEach(tx => {
          // Parse shamsi or gregorian date to get correct month key
          let year = selectedYear;
          let month = selectedMonthVal;

          const dateParts = tx.date.split('-');
          if (dateParts.length === 3) {
            const y = parseInt(dateParts[0]);
            const m = parseInt(dateParts[1]);
            const d = parseInt(dateParts[2]);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              if (y < 1600) {
                // Already Jalali/Shamsi
                year = y;
                month = m;
              } else {
                // Gregorian - convert to Jalali
                const [jy, jm] = g2j(y, m, d);
                year = jy;
                month = jm;
              }
            }
          }

          const targetKey = `${year}-${String(month).padStart(2, '0')}`;

          if (!updated[targetKey]) {
            updated[targetKey] = {
              key: targetKey,
              calendar: calendarSys,
              year,
              month,
              budget: 0,
              incomes: [],
              expenses: [],
              closed: false,
              currency: 'IRT'
            };
          }

          // Check if transaction with same id already exists in this month to avoid duplicates
          const exists = (tx.type === 'income' ? updated[targetKey].incomes : updated[targetKey].expenses)
            ?.some(existingTx => existingTx.id === tx.id);

          if (!exists) {
            if (tx.type === 'income') {
              updated[targetKey].incomes = [...(updated[targetKey].incomes || []), tx];
            } else {
              updated[targetKey].expenses = [...(updated[targetKey].expenses || []), tx];
            }
          }
        });

        // Strict de-duplication of transaction lists to ensure absolutely no duplicate keys
        Object.keys(updated).forEach(k => {
          if (updated[k].incomes) {
            const seen = new Set<string>();
            updated[k].incomes = updated[k].incomes.filter(tx => {
              if (seen.has(tx.id)) return false;
              seen.add(tx.id);
              return true;
            });
          }
          if (updated[k].expenses) {
            const seen = new Set<string>();
            updated[k].expenses = updated[k].expenses.filter(tx => {
              if (seen.has(tx.id)) return false;
              seen.add(tx.id);
              return true;
            });
          }
        });

        return updated;
      });

      // Synchronize closed archives as well if they exist
      setArchives(prev => {
        const updatedArchives = [...prev];
        dataToImport.forEach(tx => {
          let year = selectedYear;
          let month = selectedMonthVal;

          const dateParts = tx.date.split('-');
          if (dateParts.length === 3) {
            const y = parseInt(dateParts[0]);
            const m = parseInt(dateParts[1]);
            const d = parseInt(dateParts[2]);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              if (y < 1600) {
                year = y;
                month = m;
              } else {
                const [jy, jm] = g2j(y, m, d);
                year = jy;
                month = jm;
              }
            }
          }

          const targetKey = `${year}-${String(month).padStart(2, '0')}`;
          const existingArchiveIndex = updatedArchives.findIndex(a => a.key === targetKey);
          if (existingArchiveIndex !== -1) {
            const arch = { ...updatedArchives[existingArchiveIndex] };
            const exists = (tx.type === 'income' ? arch.incomes : arch.expenses)
              ?.some(existingTx => existingTx.id === tx.id);
            
            if (!exists) {
              if (tx.type === 'income') {
                arch.incomes = [...(arch.incomes || []), tx];
              } else {
                arch.expenses = [...(arch.expenses || []), tx];
              }
              updatedArchives[existingArchiveIndex] = arch;
            }
          }
        });

        // Strict de-duplication of archives
        updatedArchives.forEach(arch => {
          if (arch.incomes) {
            const seen = new Set<string>();
            arch.incomes = arch.incomes.filter(tx => {
              if (seen.has(tx.id)) return false;
              seen.add(tx.id);
              return true;
            });
          }
          if (arch.expenses) {
            const seen = new Set<string>();
            arch.expenses = arch.expenses.filter(tx => {
              if (seen.has(tx.id)) return false;
              seen.add(tx.id);
              return true;
            });
          }
        });

        return updatedArchives;
      });

    } else if (importType === 'investment' && importFeedback.investments && importFeedback.investments.length > 0) {
      const dataToImport = importFeedback.investments;
      if (!dataToImport || dataToImport.length === 0) return;

      // Reset feedback immediately to prevent double click
      setImportFeedback({ type: null, message: '' });
      setImportModalOpen(false);

      setMonthsData(prev => {
        const updated = { ...prev };
        dataToImport.forEach(inv => {
          let year = selectedYear;
          let month = selectedMonthVal;

          const dateParts = inv.date.split('-');
          if (dateParts.length === 3) {
            const y = parseInt(dateParts[0]);
            const m = parseInt(dateParts[1]);
            const d = parseInt(dateParts[2]);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              if (y < 1600) {
                year = y;
                month = m;
              } else {
                const [jy, jm] = g2j(y, m, d);
                year = jy;
                month = jm;
              }
            }
          }

          const targetKey = `${year}-${String(month).padStart(2, '0')}`;

          if (!updated[targetKey]) {
            updated[targetKey] = {
              key: targetKey,
              calendar: calendarSys,
              year,
              month,
              budget: 0,
              incomes: [],
              expenses: [],
              closed: false,
              currency: 'IRT'
            };
          }

          // Check if investment with same id already exists to avoid duplicates
          const exists = updated[targetKey].investments?.some(existingInv => existingInv.id === inv.id);

          if (!exists) {
            updated[targetKey].investments = [...(updated[targetKey].investments || []), inv];
          }
        });

        // Strict de-duplication of investments
        Object.keys(updated).forEach(k => {
          if (updated[k].investments) {
            const seen = new Set<string>();
            updated[k].investments = updated[k].investments.filter(inv => {
              if (seen.has(inv.id)) return false;
              seen.add(inv.id);
              return true;
            });
          }
        });

        return updated;
      });

      // Synchronize archives as well
      setArchives(prev => {
        const updatedArchives = [...prev];
        dataToImport.forEach(inv => {
          let year = selectedYear;
          let month = selectedMonthVal;

          const dateParts = inv.date.split('-');
          if (dateParts.length === 3) {
            const y = parseInt(dateParts[0]);
            const m = parseInt(dateParts[1]);
            const d = parseInt(dateParts[2]);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              if (y < 1600) {
                year = y;
                month = m;
              } else {
                const [jy, jm] = g2j(y, m, d);
                year = jy;
                month = jm;
              }
            }
          }

          const targetKey = `${year}-${String(month).padStart(2, '0')}`;
          const existingArchiveIndex = updatedArchives.findIndex(a => a.key === targetKey);
          if (existingArchiveIndex !== -1) {
            const arch = { ...updatedArchives[existingArchiveIndex] };
            const exists = arch.investments?.some(existingInv => existingInv.id === inv.id);
            if (!exists) {
              arch.investments = [...(arch.investments || []), inv];
              updatedArchives[existingArchiveIndex] = arch;
            }
          }
        });

        // Strict de-duplication of archives investments
        updatedArchives.forEach(arch => {
          if (arch.investments) {
            const seen = new Set<string>();
            arch.investments = arch.investments.filter(inv => {
              if (seen.has(inv.id)) return false;
              seen.add(inv.id);
              return true;
            });
          }
        });

        return updatedArchives;
      });
    }
  };

  // --- EXPORT TO EXCEL/CSV DATA GENERATION ---
  const getFilteredExportData = () => {
    interface ExportRow {
      id: string;
      date: string;
      monthKey: string;
      type: string;
      title: string;
      amount: number;
      currency: string;
      convertedAmount: number;
      targetCurrency: string;
      details: string;
    }

    const rows: ExportRow[] = [];

    // Filter date helper
    const isWithinRange = (gDateStr: string) => {
      if (exportStartDate && gDateStr < exportStartDate) return false;
      if (exportEndDate && gDateStr > exportEndDate) return false;
      return true;
    };

    // Iterate through all month records in monthsData
    (Object.entries(monthsData) as [string, MonthlyArchive][]).forEach(([monthKey, m]) => {
      const monthCurr = m.currency || 'IRT';

      // 1. Budgets
      if (exportIncludeBudgets) {
        // Compute first of month Gregorian date
        const [gy, gm, gd] = m.calendar === 'shamsi' ? j2g(m.year, m.month, 1) : [m.year, m.month, 1];
        const gDateStr = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;

        if (isWithinRange(gDateStr)) {
          const originalBudget = getOriginalBaseBudget(m);
          rows.push({
            id: `budget-${monthKey}`,
            date: gDateStr,
            monthKey,
            type: language === 'fa' ? 'بودجه پایه' : 'Base Budget',
            title: language === 'fa' ? `بودجه اولیه ماه ${digitsToPersian(m.year, 'en')}-${String(m.month).padStart(2, '0')}` : `Base Budget for ${monthKey}`,
            amount: originalBudget,
            currency: monthCurr,
            convertedAmount: convertCurrency(originalBudget, monthCurr, exportCurrency),
            targetCurrency: exportCurrency,
            details: language === 'fa' ? 'مبلغ بودجه اولیه ثبت شده بدون کسر سرمایه‌گذاری‌ها' : 'Base initial budget before investment deductions'
          });
        }
      }

      // 2. Incomes
      if (exportIncludeIncomes && m.incomes) {
        m.incomes.forEach((tx) => {
          if (isWithinRange(tx.date)) {
            rows.push({
              id: tx.id,
              date: tx.date,
              monthKey,
              type: language === 'fa' ? 'درآمد' : 'Income',
              title: tx.title,
              amount: tx.amount,
              currency: monthCurr,
              convertedAmount: convertCurrency(tx.amount, monthCurr, exportCurrency),
              targetCurrency: exportCurrency,
              details: tx.description || ''
            });
          }
        });
      }

      // 3. Expenses
      if (exportIncludeExpenses && m.expenses) {
        m.expenses.forEach((tx) => {
          if (isWithinRange(tx.date)) {
            rows.push({
              id: tx.id,
              date: tx.date,
              monthKey,
              type: language === 'fa' ? 'هزینه' : 'Expense',
              title: tx.title,
              amount: tx.amount,
              currency: monthCurr,
              convertedAmount: convertCurrency(tx.amount, monthCurr, exportCurrency),
              targetCurrency: exportCurrency,
              details: tx.description || ''
            });
          }
        });
      }

      // 4. Investments
      if (exportIncludeInvestments && m.investments) {
        m.investments.forEach((inv) => {
          if (isWithinRange(inv.date)) {
            rows.push({
              id: inv.id,
              date: inv.date,
              monthKey,
              type: language === 'fa' ? 'سرمایه‌گذاری' : 'Investment',
              title: inv.type,
              amount: inv.totalPrice,
              currency: inv.currency || 'IRT',
              convertedAmount: convertCurrency(inv.totalPrice, inv.currency || 'IRT', exportCurrency),
              targetCurrency: exportCurrency,
              details: `${language === 'fa' ? 'تعداد/مقدار' : 'Qty'}: ${inv.amount}`
            });
          }
        });
      }

      // 5. Balances (Net Remaining)
      if (exportIncludeBalances) {
        // Use first day or last day of month
        const [gy, gm, gd] = m.calendar === 'shamsi' ? j2g(m.year, m.month, 1) : [m.year, m.month, 1];
        const gDateStr = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;

        if (isWithinRange(gDateStr)) {
          const totalInc = (m.incomes || []).reduce((s, x) => s + x.amount, 0);
          const totalExp = (m.expenses || []).reduce((s, x) => s + x.amount, 0);
          const netBalVal = (m.budget || 0) + totalInc - totalExp;

          rows.push({
            id: `balance-${monthKey}`,
            date: gDateStr,
            monthKey,
            type: language === 'fa' ? 'مانده نهایی' : 'Final Balance',
            title: language === 'fa' ? `مانده نهایی ماه ${digitsToPersian(m.year, 'en')}-${String(m.month).padStart(2, '0')}` : `Final Net Balance for ${monthKey}`,
            amount: netBalVal,
            currency: monthCurr,
            convertedAmount: convertCurrency(netBalVal, monthCurr, exportCurrency),
            targetCurrency: exportCurrency,
            details: language === 'fa' ? 'موجودی خالص نهایی ماه پس از کسر تمامی هزینه‌ها و سرمایه‌گذاری‌ها' : 'Net remaining budget after all expenses and investments'
          });
        }
      }
    });

    // Sort rows chronologically by date
    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  };

  const handleExportToExcel = () => {
    const dataRows = getFilteredExportData();
    const headers = [
      language === 'fa' ? 'شناسه تراکنش' : 'Transaction ID',
      language === 'fa' ? 'تاریخ میلادی' : 'Gregorian Date',
      language === 'fa' ? 'تاریخ شمسی/محلی' : 'Local Date Display',
      language === 'fa' ? 'ماه مربوطه' : 'Month Key',
      language === 'fa' ? 'دسته‌بندی' : 'Category Type',
      language === 'fa' ? 'عنوان' : 'Title',
      language === 'fa' ? 'مبلغ (ارز اصلی)' : 'Original Amount',
      language === 'fa' ? 'ارز اصلی' : 'Original Currency',
      language === 'fa' ? `مبلغ نهایی (${exportCurrency})` : `Final Amount (${exportCurrency})`,
      language === 'fa' ? 'توضیحات و جزئیات' : 'Details'
    ];

    const mappedRows = dataRows.map(r => {
      // Convert date to shamsi display if calendar is shamsi, else gregorian
      let displayDate = r.date;
      try {
        const [y, m, d] = r.date.split('-').map(Number);
        if (calendarSys === 'shamsi') {
          const [jy, jm, jd] = g2j(y, m, d);
          displayDate = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
        }
      } catch (e) {}

      return [
        r.id,
        r.date,
        displayDate,
        r.monthKey,
        r.type,
        r.title,
        r.amount,
        r.currency,
        Math.round(r.convertedAmount * 100) / 100,
        r.details
      ];
    });

    const wsData = [headers, ...mappedRows];
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
      wscols.push({ wch: max_len + 3 });
    }
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Budget Log');
    XLSX.writeFile(wb, `budget_report_${exportCurrency}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleExportToCSV = () => {
    const dataRows = getFilteredExportData();
    const headers = [
      language === 'fa' ? 'شناسه تراکنش' : 'Transaction ID',
      language === 'fa' ? 'تاریخ میلادی' : 'Gregorian Date',
      language === 'fa' ? 'تاریخ شمسی/محلی' : 'Local Date Display',
      language === 'fa' ? 'ماه مربوطه' : 'Month Key',
      language === 'fa' ? 'دسته‌بندی' : 'Category Type',
      language === 'fa' ? 'عنوان' : 'Title',
      language === 'fa' ? 'مبلغ (ارز اصلی)' : 'Original Amount',
      language === 'fa' ? 'ارز اصلی' : 'Original Currency',
      language === 'fa' ? `مبلغ نهایی (${exportCurrency})` : `Final Amount (${exportCurrency})`,
      language === 'fa' ? 'توضیحات و جزئیات' : 'Details'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const mappedRows = dataRows.map(r => {
      let displayDate = r.date;
      try {
        const [y, m, d] = r.date.split('-').map(Number);
        if (calendarSys === 'shamsi') {
          const [jy, jm, jd] = g2j(y, m, d);
          displayDate = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
        }
      } catch (e) {}

      return [
        r.id,
        r.date,
        displayDate,
        r.monthKey,
        r.type,
        r.title,
        r.amount,
        r.currency,
        Math.round(r.convertedAmount * 100) / 100,
        r.details
      ].map(escapeCSV);
    });

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...mappedRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `budget_report_${exportCurrency}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const archiveYears = useMemo(() => {
    const years = archives.map((a: MonthlyArchive) => String(a.year));
    return Array.from(new Set(years)).sort((a: string, b: string) => b.localeCompare(a));
  }, [archives]);

  const archiveMonths = useMemo(() => {
    const months = archives.map((a: MonthlyArchive) => String(a.month));
    return Array.from(new Set(months)).sort((a: string, b: string) => Number(a) - Number(b));
  }, [archives]);

  const filteredArchives = useMemo(() => {
    return archives.filter((arch) => {
      if (archiveFilterYear && String(arch.year) !== archiveFilterYear) return false;
      if (archiveFilterMonth && String(arch.month) !== archiveFilterMonth) return false;
      return true;
    });
  }, [archives, archiveFilterYear, archiveFilterMonth]);

  // Calculated properties
  const activeMonth = monthsData[currentMonthKey];
  const activeCurrency = activeMonth?.currency || 'IRT';
  const currencySymbol = getCurrencySymbol(activeCurrency);

  const totalIncomes = activeMonth?.incomes.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpenses = activeMonth?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0;
  const netBalance = (activeMonth?.budget || 0) + totalIncomes - totalExpenses;

  const currentMonthName = activeMonth ? (
    activeMonth.calendar === 'shamsi' ? 
    SHAMSI_MONTH_NAMES[language][activeMonth.month - 1] : 
    GREGORIAN_MONTH_NAMES[language][activeMonth.month - 1]
  ) : "";

  const getSyncBadge = () => {
    switch (syncStatus) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span>{language === 'fa' ? 'بارگذاری فایل...' : 'Loading file...'}</span>
          </span>
        );
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce shrink-0" />
            <span>{language === 'fa' ? 'در حال ذخیره‌سازی...' : 'Saving...'}</span>
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={language === 'fa' ? 'ذخیره شده در budget_data.json' : 'Saved to budget_data.json'}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>{language === 'fa' ? 'همگام با فایل' : 'Synced with JSON'}</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>{language === 'fa' ? 'خطای همگام‌سازی' : 'Sync error'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Header and Control Switches */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 glass-panel">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-cyan-400 font-vazir tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              {trans.title}
            </h1>
            {getSyncBadge()}
          </div>
          <p className="text-xs text-indigo-200/50">
            {activeMonth ? `${currentMonthName} ${digitsToPersian(activeMonth.year)}` : trans.alertSelectMonth}
          </p>
        </div>

        {/* Action Panel Buttons */}
        <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-end">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportBudgetJSON}
            className="flex-1 sm:flex-initial h-[38px] px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title={language === 'fa' ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
          >
            <Download className="w-4 h-4 text-cyan-300" />
            <span>{language === 'fa' ? 'خروجی JSON' : 'Export JSON'}</span>
          </button>

          <label className="flex-1 sm:flex-initial h-[38px] px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-300" />
            <span>{language === 'fa' ? 'وارد کردن JSON' : 'Import JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBudgetJSON}
              className="hidden"
            />
          </label>

          <button 
            onClick={() => setExportModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-lg shadow-cyan-950/20 cursor-pointer"
            title={language === 'fa' ? 'خروجی اکسل و CSV' : 'Export Excel & CSV'}
          >
            <FileDown className="w-4 h-4" />
            <span>{language === 'fa' ? 'خروجی گزارش' : 'Export Report'}</span>
          </button>

          <button 
            onClick={() => {
              setImportModalOpen(true);
              setImportFeedback({ type: null, message: '' });
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-indigo-400 hover:text-indigo-400 text-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
            title={language === 'fa' ? 'وارد کردن اطلاعات از فایل اکسل یا CSV' : 'Import Excel & CSV'}
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{language === 'fa' ? 'ورود اطلاعات' : 'Import Data'}</span>
          </button>

          <button 
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
            title={trans.suggestionsSettingsTitle}
          >
            <Settings className="w-4 h-4 animate-spin-hover" />
            <span>{trans.suggestionsSettingsTitle}</span>
          </button>
        </div>
      </div>

      {/* Primary Layout Block split in 3 columns / 1 sidebar on wide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RIGHT COLUMN: Configuration / Select Month */}
        <div className="space-y-6">
          
          {/* Calendar Picker Block */}
          <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel relative ${monthDropdownOpen ? 'z-30' : 'z-10'}`}>
            <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{trans.calendarType}</span>
            </h2>

            {/* Calendar System Toggle Button */}
            <div className="grid grid-cols-2 bg-black/40 border border-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setCalendarSys('shamsi')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${calendarSys === 'shamsi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                {trans.calendarShamsi}
              </button>
              <button 
                onClick={() => setCalendarSys('miladi')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${calendarSys === 'miladi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                {trans.calendarMiladi}
              </button>
            </div>

            {/* Date Display Format Selector */}
            <div className="space-y-1.5 pt-2 border-t border-white/5 text-right" style={{ direction: language === 'fa' ? 'rtl' : 'ltr' }}>
              <span className="text-[10px] font-bold text-cyan-400 block mb-1">
                📅 {language === 'fa' ? 'نحوه نمایش تاریخ تراکنش‌ها:' : 'Transaction Date Display:'}
              </span>
              <div className="grid grid-cols-3 bg-black/40 border border-white/5 p-1 rounded-xl text-[9px] font-black">
                <button
                  type="button"
                  onClick={() => setDateDisplayMode('shamsi')}
                  className={`py-1.5 rounded-lg transition-all ${dateDisplayMode === 'shamsi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {language === 'fa' ? 'فقط شمسی' : 'Solar Only'}
                </button>
                <button
                  type="button"
                  onClick={() => setDateDisplayMode('miladi')}
                  className={`py-1.5 rounded-lg transition-all ${dateDisplayMode === 'miladi' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {language === 'fa' ? 'فقط میلادی' : 'Gregorian Only'}
                </button>
                <button
                  type="button"
                  onClick={() => setDateDisplayMode('both')}
                  className={`py-1.5 rounded-lg transition-all ${dateDisplayMode === 'both' ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {language === 'fa' ? 'هر دو تقویم' : 'Both'}
                </button>
              </div>
            </div>

            {/* Year Input and Month Selection box */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold">{trans.year}</label>
                <input 
                  type="text"
                  value={selectedYear}
                  onChange={(e) => {
                    const clean = persianToEnglishDigits(e.target.value).replace(/\D/g, '');
                    setSelectedYear(Number(clean) || 0);
                  }}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm font-mono text-center text-white outline-none"
                />
              </div>

              <div className="space-y-1 relative z-40">
                <label className="text-[10px] text-slate-400 font-bold">{trans.month}</label>
                <button 
                  onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                  className="w-full h-11 bg-black/40 border border-white/10 hover:border-cyan-400 rounded-xl px-3 text-xs flex items-center justify-between text-white text-right"
                >
                  <span className="truncate">
                    {calendarSys === 'shamsi' ? SHAMSI_MONTH_NAMES[language][selectedMonthVal - 1] : GREGORIAN_MONTH_NAMES[language][selectedMonthVal - 1]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                </button>

                {monthDropdownOpen && (
                  <div className="absolute top-20 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-40 p-1 shadow-2xl">
                    {(calendarSys === 'shamsi' ? SHAMSI_MONTH_NAMES[language] : GREGORIAN_MONTH_NAMES[language]).map((m, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSelectedMonthVal(idx + 1);
                          setMonthDropdownOpen(false);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${selectedMonthVal === idx + 1 ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleGoToMonth}
              className="w-full h-11 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{trans.goMonth}</span>
            </button>
          </div>

          {/* Monthly Base Budget block */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{trans.budgetLabel}</span>
              </h2>
              <button
                type="button"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-vazir"
                title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
              >
                {hideAmounts ? (
                  <>
                    <EyeOff className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] text-cyan-400 font-bold">{language === 'fa' ? 'پنهان' : 'Secret'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] text-slate-500">{language === 'fa' ? 'آشکار' : 'Visible'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type={hideAmounts ? "password" : "text"}
                  value={budgetValueInput}
                  disabled={isBudgetLocked}
                  onChange={(e) => {
                    const english = persianToEnglishDigits(e.target.value);
                    const cleanInput = english.replace(/,/g, '');
                    if (activeCurrency === 'IRT') {
                      const clean = cleanInput.replace(/\D/g, '');
                      setBudgetValueInput(clean === "" ? "" : Number(clean).toLocaleString('en-US'));
                    } else {
                      let clean = cleanInput.replace(/[^0-9.]/g, '');
                      const parts = clean.split('.');
                      if (parts.length > 2) {
                        clean = parts[0] + '.' + parts.slice(1).join('');
                      }
                      const p0 = parts[0] ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US') : '';
                      const p1 = parts[1];
                      const formatted = parts.length > 1 ? `${p0}.${p1 !== undefined ? p1 : ''}` : p0;
                      setBudgetValueInput(formatted);
                    }
                  }}
                  placeholder={trans.budgetPlaceholder}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-3 pl-12 text-sm font-bold text-white outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400/70 font-bold font-mono">
                  {currencySymbol}
                </span>
              </div>

              <button 
                onClick={handleToggleBudgetLock}
                className="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400 rounded-xl text-cyan-400 transition-all shrink-0"
                title={isBudgetLocked ? "Unlock/Edit" : "Lock"}
              >
                {isBudgetLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            {!isBudgetLocked && (
              <button 
                onClick={handleSaveBudget}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>{trans.saveBudget}</span>
              </button>
            )}
          </div>

          {/* Quick Currency Selection tab */}
          {activeMonth && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 glass-panel">
              <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>{language === 'fa' ? 'انتخاب واحد ارز ماه جاری' : 'Active Currency'}</span>
              </h2>
              <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                {(['IRT', 'USD', 'EUR'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setMonthsData(prev => {
                        const updated = { ...prev[currentMonthKey], currency: c };
                        return { ...prev, [currentMonthKey]: updated };
                      });
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-black tracking-wider transition-all ${activeCurrency === c ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' : 'text-slate-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* LEFT TWO COLUMNS: Dynamic Financial Summaries & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card: Base Budget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center glass-panel relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <button
                type="button"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer z-10"
                title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
              >
                {hideAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <div className="relative space-y-1">
                <span className="text-xl sm:text-2xl block">💰</span>
                <h3 className="text-[10px] sm:text-xs text-indigo-200/50 font-bold">{trans.summaryBudget}</h3>
                <div className="flex flex-wrap items-baseline justify-center gap-0.5 sm:gap-1 font-mono" dir="ltr">
                  <span className="text-sm xs:text-base sm:text-lg font-black text-white break-all">
                    {hideAmounts ? '••••••' : formatCurrency(getOriginalBaseBudget(activeMonth), activeCurrency)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-cyan-400/80 font-bold shrink-0">{currencySymbol}</span>
                </div>
              </div>
            </div>

            {/* Card: Total Income */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center glass-panel relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/10 to-green-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <button
                type="button"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer z-10"
                title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
              >
                {hideAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <div className="relative space-y-1">
                <span className="text-xl sm:text-2xl block">📈</span>
                <h3 className="text-[10px] sm:text-xs text-indigo-200/50 font-bold">{trans.summaryIncome}</h3>
                <div className="flex flex-wrap items-baseline justify-center gap-0.5 sm:gap-1 font-mono" dir="ltr">
                  <span className="text-sm xs:text-base sm:text-lg font-black text-emerald-400 break-all">
                    {hideAmounts ? '••••••' : `+ ${formatCurrency(totalIncomes, activeCurrency)}`}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-bold shrink-0">{currencySymbol}</span>
                </div>
              </div>
            </div>

            {/* Card: Total Expenses */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center glass-panel relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400/10 to-rose-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <button
                type="button"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer z-10"
                title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
              >
                {hideAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <div className="relative space-y-1">
                <span className="text-xl sm:text-2xl block">📉</span>
                <h3 className="text-[10px] sm:text-xs text-indigo-200/50 font-bold">{trans.summaryExpenses}</h3>
                <div className="flex flex-wrap items-baseline justify-center gap-0.5 sm:gap-1 font-mono" dir="ltr">
                  <span className="text-sm xs:text-base sm:text-lg font-black text-rose-400 break-all">
                    {hideAmounts ? '••••••' : `- ${formatCurrency(totalExpenses, activeCurrency)}`}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-rose-400/80 font-bold shrink-0">{currencySymbol}</span>
                </div>
              </div>
            </div>

            {/* Card: Net Balance */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center glass-panel relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/10 to-indigo-600/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <button
                type="button"
                onClick={() => setHideAmounts(!hideAmounts)}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer z-10"
                title={hideAmounts ? (language === 'fa' ? 'نمایش مقادیر' : 'Show amounts') : (language === 'fa' ? 'مخفی کردن مقادیر' : 'Hide amounts')}
              >
                {hideAmounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <div className="relative space-y-1">
                <span className="text-xl sm:text-2xl block">🏦</span>
                <h3 className="text-[10px] sm:text-xs text-indigo-200/50 font-bold">{trans.summaryRemain}</h3>
                <div className="flex flex-wrap items-baseline justify-center gap-0.5 sm:gap-1 font-mono" dir="ltr">
                  <span className={`text-sm xs:text-base sm:text-lg font-black break-all ${netBalance >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
                    {hideAmounts ? '••••••' : `${netBalance < 0 ? '-' : ''}${formatCurrency(Math.abs(netBalance), activeCurrency)}`}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold shrink-0 ${netBalance >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>{currencySymbol}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Operations Button Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleAddTransactionClick('expense')}
              className="flex-1 h-12 bg-rose-600/20 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-500/30 text-rose-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{trans.addExpense}</span>
            </button>
            <button 
              onClick={() => handleAddTransactionClick('income')}
              className="flex-1 h-12 bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/30 text-emerald-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{trans.addIncome}</span>
            </button>
            <button 
              onClick={handleAddInvestmentClick}
              className="flex-1 h-12 bg-amber-600/20 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/30 text-amber-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <Coins className="w-4 h-4" />
              <span>{trans.addInvestment}</span>
            </button>
            <button 
              onClick={handleCloseAndArchiveMonth}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{trans.closeMonth}</span>
            </button>
          </div>

          {/* Monthly Transaction Ledger Items */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm font-bold text-cyan-400 font-vazir">
                {trans.currentMonthHeader}
              </h2>
              {activeMonth && (activeMonth.expenses.length > 0 || activeMonth.incomes.length > 0) && (
                <button
                  type="button"
                  onClick={() => setBudgetDragLocked(!budgetDragLocked)}
                  className={`h-7 px-2 border rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    budgetDragLocked 
                      ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10' 
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:bg-cyan-500/30'
                  }`}
                  title={language === 'fa' ? (budgetDragLocked ? 'باز کردن قفل جابجایی' : 'قفل کردن جابجایی') : (budgetDragLocked ? 'Unlock dragging' : 'Lock dragging')}
                >
                  {budgetDragLocked ? <Lock className="w-3 h-3 text-slate-400" /> : <Unlock className="w-3 h-3 text-cyan-300 animate-pulse" />}
                  <span>{language === 'fa' ? (budgetDragLocked ? 'قفل جابه‌جایی' : 'جابه‌جایی فعال') : (budgetDragLocked ? 'Drag Locked' : 'Drag Enabled')}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(!activeMonth || (activeMonth.expenses.length === 0 && activeMonth.incomes.length === 0)) ? (
                <div className="text-center text-xs text-slate-400 py-10">
                  {trans.emptyTransactions}
                </div>
              ) : (
                <>
                  {/* Ledger Income Entries */}
                  {activeMonth.incomes.map((tx, index) => (
                    <div 
                      key={tx.id} 
                      draggable={!budgetDragLocked}
                      onDragStart={() => setDraggedIncomeIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropIncome(draggedIncomeIndex!, index)}
                      onDragEnd={() => setDraggedIncomeIndex(null)}
                      className={`flex justify-between items-center bg-emerald-500/5 hover:bg-emerald-500/10 border-r-4 border-emerald-500 border border-white/5 rounded-xl p-4 transition-all ${
                        budgetDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                      } ${draggedIncomeIndex === index ? 'opacity-40 border-dashed border-cyan-500 scale-95' : ''}`}
                    >
                      <div className="space-y-1">
                        <strong className="text-sm font-black text-white font-vazir">{tx.title}</strong>
                        <div className="flex items-center gap-2 text-[10px] text-indigo-200/50">
                          <span>{trans.txtIncome}</span>
                          {tx.date && (
                            <>
                              <span>•</span>
                              <span>{formatBudgetEntryDate(tx.date)}</span>
                            </>
                          )}
                          {tx.description && (
                            <>
                              <span>•</span>
                              <span className="italic">{tx.description}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-emerald-400" dir="ltr">
                          + {formatCurrency(tx.amount, activeCurrency)} <span className="text-[10px]">{currencySymbol}</span>
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleEditTransaction(tx, 'income')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-amber-400 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(tx.id, 'income')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Ledger Expense Entries */}
                  {activeMonth.expenses.map((tx, index) => (
                    <div 
                      key={tx.id} 
                      draggable={!budgetDragLocked}
                      onDragStart={() => setDraggedExpenseIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropExpense(draggedExpenseIndex!, index)}
                      onDragEnd={() => setDraggedExpenseIndex(null)}
                      className={`flex justify-between items-center bg-rose-500/5 hover:bg-rose-500/10 border-r-4 border-rose-500 border border-white/5 rounded-xl p-4 transition-all ${
                        budgetDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                      } ${draggedExpenseIndex === index ? 'opacity-40 border-dashed border-cyan-500 scale-95' : ''}`}
                    >
                      <div className="space-y-1">
                        <strong className="text-sm font-black text-white font-vazir">{tx.title}</strong>
                        <div className="flex items-center gap-2 text-[10px] text-indigo-200/50">
                          <span>{trans.txtExpense}</span>
                          {tx.date && (
                            <>
                              <span>•</span>
                              <span>{formatBudgetEntryDate(tx.date)}</span>
                            </>
                          )}
                          {tx.description && (
                            <>
                              <span>•</span>
                              <span className="italic">{tx.description}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-rose-400" dir="ltr">
                          - {formatCurrency(tx.amount, activeCurrency)} <span className="text-[10px]">{currencySymbol}</span>
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleEditTransaction(tx, 'expense')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-amber-400 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(tx.id, 'expense')}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-rose-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Monthly Investments Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-vazir">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{trans.investmentsHeader}</span>
              </h2>
              <div className="flex items-center gap-2">
                {currentMonthKey && monthsData[currentMonthKey]?.investments && monthsData[currentMonthKey]!.investments!.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBudgetDragLocked(!budgetDragLocked)}
                    className={`h-7 px-2 border rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      budgetDragLocked 
                        ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10' 
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:bg-cyan-500/30'
                    }`}
                    title={language === 'fa' ? (budgetDragLocked ? 'باز کردن قفل جابجایی' : 'قفل کردن جابجایی') : (budgetDragLocked ? 'Unlock dragging' : 'Lock dragging')}
                  >
                    {budgetDragLocked ? <Lock className="w-3 h-3 text-slate-400" /> : <Unlock className="w-3 h-3 text-cyan-300 animate-pulse" />}
                    <span>{language === 'fa' ? (budgetDragLocked ? 'قفل جابه‌جایی' : 'جابه‌جایی فعال') : (budgetDragLocked ? 'Drag Locked' : 'Drag Enabled')}</span>
                  </button>
                )}
                <button
                  onClick={() => setAllInvestmentsModalOpen(true)}
                  className="px-2.5 py-1 text-[10px] bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                  <span>{language === 'fa' ? 'نمودار و مدیریت کل' : 'All Graph & Manage'}</span>
                </button>
                {currentMonthKey && !monthsData[currentMonthKey]?.closed && (
                  <button
                    onClick={handleAddInvestmentClick}
                    className="px-2.5 py-1 text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 rounded-lg font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{trans.addInvestment}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {!currentMonthKey || !monthsData[currentMonthKey]?.investments || monthsData[currentMonthKey]?.investments?.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  {trans.emptyInvestments}
                </div>
              ) : (
                monthsData[currentMonthKey].investments!.map((inv, index) => {
                  const matchingSug = suggestions.find(s => s.type === 'investment' && s.text.toLowerCase() === inv.type.toLowerCase());
                  const configuredPrice = matchingSug?.price;
                  const totalCurrentValue = configuredPrice ? inv.amount * configuredPrice : null;
                  return (
                    <div 
                      key={inv.id} 
                      draggable={!budgetDragLocked}
                      onDragStart={() => setDraggedInvestmentIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropInvestment(draggedInvestmentIndex!, index)}
                      onDragEnd={() => setDraggedInvestmentIndex(null)}
                      className={`flex justify-between items-center bg-amber-500/5 hover:bg-amber-500/10 border-r-4 border-amber-500 border border-white/5 rounded-xl p-4 transition-all ${
                        budgetDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                      } ${draggedInvestmentIndex === index ? 'opacity-40 border-dashed border-cyan-500 scale-95' : ''}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm font-black text-white font-vazir">{inv.type}</strong>
                          {configuredPrice !== undefined && configuredPrice > 0 && (
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg font-bold">
                              {language === 'fa' ? `واحد: ${configuredPrice.toLocaleString('en-US')}` : `Unit: ${configuredPrice.toLocaleString('en-US')}`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-indigo-200/50 flex-wrap">
                          <span>{language === 'fa' ? 'مقدار:' : 'Amount:'} {digitsToPersian(inv.amount)}</span>
                          {inv.date && (
                            <>
                              <span>•</span>
                              <span>{formatBudgetEntryDate(inv.date)}</span>
                            </>
                          )}
                          {totalCurrentValue !== null && totalCurrentValue > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400 font-bold font-vazir">
                                {language === 'fa' ? 'ارزش فعلی: ' : 'Current Value: '}
                                {totalCurrentValue.toLocaleString('en-US')} تومان
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 font-mono" dir="ltr">
                        <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                          {formatCurrency(inv.totalPrice, inv.currency)}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black uppercase tracking-wider scale-90 select-none">
                            {inv.currency}
                          </span>
                        </span>
                        {currentMonthKey && !monthsData[currentMonthKey]?.closed && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleEditInvestment(inv)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-amber-400 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteInvestment(inv.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-rose-400 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Archived Closed Months Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{trans.archiveHeader}</span>
              </h2>
              {archives.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArchiveFiltersOpen(!archiveFiltersOpen)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer font-vazir ${
                      archiveFiltersOpen 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{language === 'fa' ? 'فیلتر سال و ماه' : 'Filter Year/Month'}</span>
                    {archiveFiltersOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {(archiveFilterYear || archiveFilterMonth) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </button>

                  {(archiveFilterYear || archiveFilterMonth) && (
                    <button
                      type="button"
                      onClick={() => {
                        setArchiveFilterYear("");
                        setArchiveFilterMonth("");
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-all cursor-pointer font-vazir"
                    >
                      <span>{language === 'fa' ? 'پاک کردن فیلترها' : 'Clear Filters'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {archives.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">
                {trans.emptyArchive}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Archive Filters */}
                {archiveFiltersOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-3 rounded-xl border border-white/5 animate-fade-in">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400 font-bold block font-vazir">
                        {language === 'fa' ? 'فیلتر سال:' : 'Filter Year:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setArchiveYearDropdownOpen(!archiveYearDropdownOpen);
                          setArchiveMonthDropdownOpen(false);
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs flex items-center justify-between transition hover:border-cyan-400 font-vazir text-right cursor-pointer"
                      >
                        <span>
                          {archiveFilterYear 
                            ? digitsToPersian(archiveFilterYear) 
                            : (language === 'fa' ? 'همه سال‌ها' : 'All Years')}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>

                      {archiveYearDropdownOpen && (
                        <div className="absolute top-16 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setArchiveFilterYear("");
                              setArchiveYearDropdownOpen(false);
                            }}
                            className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!archiveFilterYear ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                          >
                            {language === 'fa' ? 'همه سال‌ها' : 'All Years'}
                          </button>
                          {archiveYears.map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                setArchiveFilterYear(yr);
                                setArchiveYearDropdownOpen(false);
                              }}
                              className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${archiveFilterYear === yr ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                            >
                              {digitsToPersian(yr)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400 font-bold block font-vazir">
                        {language === 'fa' ? 'فیلتر ماه:' : 'Filter Month:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setArchiveMonthDropdownOpen(!archiveMonthDropdownOpen);
                          setArchiveYearDropdownOpen(false);
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs flex items-center justify-between transition hover:border-cyan-400 font-vazir text-right cursor-pointer"
                      >
                        <span className="truncate">
                          {(() => {
                            if (!archiveFilterMonth) {
                              return language === 'fa' ? 'همه ماه‌ها' : 'All Months';
                            }
                            const mIndex = Number(archiveFilterMonth) - 1;
                            const label = mIndex >= 0 && mIndex < 12 
                              ? (language === 'fa' ? SHAMSI_MONTH_NAMES.fa[mIndex] : GREGORIAN_MONTH_NAMES.en[mIndex])
                              : archiveFilterMonth;
                            return `${digitsToPersian(label)} (${digitsToPersian(archiveFilterMonth)})`;
                          })()}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>

                      {archiveMonthDropdownOpen && (
                        <div className="absolute top-16 right-0 left-0 bg-[#0d0a21]/95 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              setArchiveFilterMonth("");
                              setArchiveMonthDropdownOpen(false);
                            }}
                            className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${!archiveFilterMonth ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                          >
                            {language === 'fa' ? 'همه ماه‌ها' : 'All Months'}
                          </button>
                          {archiveMonths.map((m) => {
                            const mIndex = Number(m) - 1;
                            const label = mIndex >= 0 && mIndex < 12 
                              ? (language === 'fa' ? SHAMSI_MONTH_NAMES.fa[mIndex] : GREGORIAN_MONTH_NAMES.en[mIndex])
                              : m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setArchiveFilterMonth(m);
                                  setArchiveMonthDropdownOpen(false);
                                }}
                                className={`w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${archiveFilterMonth === m ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                              >
                                {digitsToPersian(label)} ({digitsToPersian(m)})
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {filteredArchives.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 bg-black/10 border border-dashed border-white/5 rounded-xl font-vazir">
                    {language === 'fa' 
                      ? 'ماه بایگانی شده‌ای با فیلترهای انتخابی یافت نشد.' 
                      : 'No archived months match the selected filters.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredArchives.map((arch) => {
                      const isShamsi = arch.calendar === 'shamsi';
                      const archMonthName = isShamsi ? SHAMSI_MONTH_NAMES[language][arch.month - 1] : GREGORIAN_MONTH_NAMES[language][arch.month - 1];
                      const keyDisplay = `${archMonthName} ${digitsToPersian(arch.year)}`;
                      return (
                        <button 
                          key={arch.key}
                          onClick={() => setViewArchiveKey(arch.key)}
                          className="flex items-center justify-between bg-black/40 hover:bg-white/5 border border-white/10 hover:border-cyan-400 rounded-xl p-4 transition-all text-right cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <strong className="text-xs text-white block">{keyDisplay}</strong>
                            <span className="text-[9px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              {arch.currency}
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-bold hover:underline">
                            {trans.viewReport}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* TRANSACTION ENTRY MODAL WITH AUTOCOMPLETE & DATE SELECTION */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start sm:items-center p-4">
          <div className="bg-[#120e2e]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative my-auto">
            <h2 className="text-lg font-black text-cyan-400 border-b border-white/10 pb-3">
              {modalMode === 'expense' ? (editingTxId ? trans.modalEditExpense : trans.modalTitleExpense) : (editingTxId ? trans.modalEditIncome : trans.modalTitleIncome)}
            </h2>

            <div className="space-y-4">
              
              {/* Field: Title (Autocomplete Trigger) */}
              <div className="space-y-1 relative" ref={suggestionContainerRef}>
                <label className="text-xs text-indigo-200/70 font-bold">{trans.modalTextPlaceholder}</label>
                <input 
                  type="text"
                  value={txTitle}
                  onChange={(e) => {
                    setTxTitle(e.target.value);
                    setShowSuggestionDropdown(true);
                  }}
                  onFocus={() => setShowSuggestionDropdown(true)}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-sm text-white outline-none"
                  placeholder={trans.modalTextPlaceholder}
                />

                {/* Autocomplete Suggestion Dropdown overlay */}
                {showSuggestionDropdown && suggestionFiltered.length > 0 && (
                  <div className="absolute top-20 left-0 right-0 bg-[#0d0723] border border-white/10 rounded-xl max-h-52 overflow-y-auto z-50 p-1 shadow-2xl space-y-0.5">
                    {suggestionFiltered.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-cyan-400 flex items-center justify-between group transition-all"
                      >
                        <span className="font-bold text-white group-hover:text-cyan-400">{sug.text}</span>
                        <span className="text-[9px] text-slate-500 font-bold">
                          {digitsToPersian(sug.useCount)} {trans.suggestionUsedTimes}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field: Amount */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold">{trans.modalAmountPlaceholder}</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={txAmount}
                    onChange={(e) => {
                      const english = persianToEnglishDigits(e.target.value);
                      const cleanInput = english.replace(/,/g, '');
                      if (activeCurrency === 'IRT') {
                        const clean = cleanInput.replace(/\D/g, '');
                        setTxAmount(clean === "" ? "" : Number(clean).toLocaleString('en-US'));
                      } else {
                        let clean = cleanInput.replace(/[^0-9.]/g, '');
                        const parts = clean.split('.');
                        if (parts.length > 2) {
                          clean = parts[0] + '.' + parts.slice(1).join('');
                        }
                        const p0 = parts[0] ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US') : '';
                        const p1 = parts[1];
                        const formatted = parts.length > 1 ? `${p0}.${p1 !== undefined ? p1 : ''}` : p0;
                        setTxAmount(formatted);
                      }
                    }}
                    className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 pl-12 text-sm font-mono text-white outline-none text-left"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 font-bold">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Field: Transaction Date (Required) */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold">{trans.modalDatePlaceholder}</label>
                <DatePicker 
                  value={txDate}
                  onChange={(val) => setTxDate(val)}
                  language={language}
                />
              </div>

              {/* Field: Description (Optional) */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold">{language === 'fa' ? 'توضیحات اختیاری' : 'Optional Notes'}</label>
                <textarea 
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none h-16 resize-none"
                  placeholder="..."
                />
              </div>

            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <button 
                onClick={handleSaveTransaction}
                className="flex-1 h-11 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>{trans.modalSave}</span>
              </button>
              <button 
                onClick={() => setModalOpen(false)}
                className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>{trans.modalCancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVESTMENT ENTRY MODAL */}
      {investmentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] overflow-y-auto flex justify-center items-start sm:items-center p-4">
          <div className="bg-[#120e2e]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative my-auto">
            <h2 className="text-lg font-black text-amber-400 border-b border-white/10 pb-3 font-vazir">
              {editingInvestmentId ? trans.modalEditInvestment : trans.modalTitleInvestment}
            </h2>

            <div className="space-y-4">
              {/* Field: Asset Type */}
              <div className="space-y-1 relative" ref={invSuggestionContainerRef}>
                <label className="text-xs text-indigo-200/70 font-bold font-vazir">{language === 'fa' ? 'نوع دارایی' : 'Asset Type'}</label>
                <input 
                  type="text"
                  value={invType}
                  onChange={(e) => {
                    setInvType(e.target.value);
                    setShowInvSuggestionDropdown(true);
                  }}
                  onFocus={() => setShowInvSuggestionDropdown(true)}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl px-3 text-sm text-white outline-none font-vazir text-right"
                  placeholder={trans.modalTypePlaceholder}
                />

                {/* Autocomplete Suggestion Dropdown overlay */}
                {showInvSuggestionDropdown && invSuggestionFiltered.length > 0 && (
                  <div className="absolute top-20 left-0 right-0 bg-[#0d0723] border border-white/10 rounded-xl max-h-52 overflow-y-auto z-50 p-1 shadow-2xl space-y-0.5 custom-scrollbar">
                    {invSuggestionFiltered.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => handleSelectInvSuggestion(sug)}
                        className="w-full text-right px-3 py-2 text-xs rounded-lg hover:bg-amber-400/10 hover:text-amber-400 flex items-center justify-between group transition-all"
                      >
                        <span className="font-bold text-white group-hover:text-amber-400">
                          {sug.text}
                          {sug.price !== undefined && sug.price > 0 ? (
                            <span className="text-[10px] text-amber-400/80 font-normal mr-2">
                              {language === 'fa' 
                                ? `(قیمت: ${Number(sug.price).toLocaleString('en-US')} ${sug.priceCurrency === 'USD' ? 'دلار' : sug.priceCurrency === 'EUR' ? 'یورو' : 'تومان'})` 
                                : `(Price: ${Number(sug.price).toLocaleString('en-US')} ${sug.priceCurrency || 'IRT'})`}
                            </span>
                          ) : ""}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">
                          {digitsToPersian(sug.useCount)} {trans.suggestionUsedTimes}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field: Amount/Qty */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold font-vazir">{trans.modalInvestQtyPlaceholder}</label>
                <input 
                  type="text"
                  value={invAmount}
                  onChange={(e) => {
                    const english = persianToEnglishDigits(e.target.value);
                    const clean = english.replace(/[^0-9.]/g, '');
                    setInvAmount(clean);
                  }}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl px-3 text-sm font-mono text-white outline-none text-left"
                  placeholder="0"
                />
              </div>

              {/* Field: Currency Type Toggle Segmented Control */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold font-vazir mb-1.5 block">{trans.modalCurrencyLabel}</label>
                <div className="grid grid-cols-3 bg-black/40 border border-white/5 p-1 rounded-xl">
                  {(['IRT', 'USD', 'EUR'] as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setInvCurrency(c)}
                      className={`py-2 rounded-lg text-xs font-black tracking-wider transition-all font-vazir ${invCurrency === c ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      {c === 'IRT' ? (language === 'fa' ? 'تومان (IRT)' : 'IRT') : c === 'USD' ? (language === 'fa' ? 'دلار (USD)' : 'USD') : (language === 'fa' ? 'یورو (EUR)' : 'EUR')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Total Price */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold font-vazir">{trans.modalTotalPricePlaceholder}</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={invTotalPrice}
                    onChange={(e) => {
                      const english = persianToEnglishDigits(e.target.value);
                      const cleanInput = english.replace(/,/g, '');
                      if (invCurrency === 'IRT') {
                        const clean = cleanInput.replace(/\D/g, '');
                        setInvTotalPrice(clean === "" ? "" : Number(clean).toLocaleString('en-US'));
                      } else {
                        let clean = cleanInput.replace(/[^0-9.]/g, '');
                        const parts = clean.split('.');
                        if (parts.length > 2) {
                          clean = parts[0] + '.' + parts.slice(1).join('');
                        }
                        const p0 = parts[0] ? Number(parts[0].replace(/,/g, '')).toLocaleString('en-US') : '';
                        const p1 = parts[1];
                        const formatted = parts.length > 1 ? `${p0}.${p1 !== undefined ? p1 : ''}` : p0;
                        setInvTotalPrice(formatted);
                      }
                    }}
                    className="w-full h-11 bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl px-3 pl-14 text-sm font-mono text-white outline-none text-left"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold">
                    {getCurrencySymbol(invCurrency)}
                  </span>
                </div>
              </div>

              {/* Field: Purchase Date */}
              <div className="space-y-1">
                <label className="text-xs text-indigo-200/70 font-bold font-vazir">{trans.modalDatePlaceholder}</label>
                <DatePicker 
                  value={invDate}
                  onChange={(val) => setInvDate(val)}
                  language={language}
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <button 
                onClick={handleSaveInvestment}
                className="flex-1 h-11 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg font-vazir"
              >
                <span>{trans.modalSave}</span>
              </button>
              <button 
                onClick={() => {
                  setEditingInvestmentId(null);
                  setEditingInvestmentMonthKey(null);
                  setInvestmentModalOpen(false);
                }}
                className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all font-vazir"
              >
                <span>{trans.modalCancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW SUGGESTION PROMPT POPUP */}
      {customPromptOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#120826] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-400/15 flex items-center justify-center mx-auto text-cyan-400">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-white">{trans.confirmTitle}</h3>
            <p className="text-xs text-indigo-200/70 leading-relaxed">
              {trans.addNewSuggestionPrompt}
              <br />
              <strong className="text-cyan-400 block mt-2">"{pendingSuggestionText}"</strong>
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleConfirmAddPendingSuggestion(true)}
                className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-xl text-xs transition-all"
              >
                {trans.confirmYes}
              </button>
              <button
                onClick={() => handleConfirmAddPendingSuggestion(false)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs transition-all"
              >
                {trans.confirmNo}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCED SUGGESTIONS CONFIGURATION OVERLAY PANEL */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto flex justify-center items-start sm:items-center p-4">
          <div className="bg-[#0f0a28]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-5 shadow-2xl relative my-auto">
            <button 
              onClick={() => setShowConfigPanel(false)}
              className="absolute top-4 left-4 sm:left-6 w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>
            
            <h2 className="text-lg font-black text-cyan-400 border-b border-white/10 pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>{trans.suggestionsSettingsTitle}</span>
            </h2>

            {/* Quick Add Custom Suggestion block */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 items-stretch sm:items-center justify-between">
              <div className="flex-1">
                <input 
                  type="text"
                  value={newSuggestText}
                  onChange={(e) => setNewSuggestText(e.target.value)}
                  placeholder={trans.addSuggestionPlaceholder}
                  className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-4 text-xs text-white outline-none"
                />
              </div>
              
              {/* Sleek Segment Selector */}
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1 self-stretch">
                <button
                  type="button"
                  onClick={() => {
                    setNewSuggestType('expense');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${newSuggestType === 'expense' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-inner' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  {trans.txtExpense}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewSuggestType('income');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${newSuggestType === 'income' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-inner' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  {trans.txtIncome}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewSuggestType('investment');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${newSuggestType === 'investment' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-inner' : 'text-slate-400 hover:text-white border border-transparent'}`}
                >
                  {language === 'fa' ? 'سرمایه‌گذاری' : 'Investment'}
                </button>
              </div>

              <button 
                onClick={handleAddCustomSuggestion}
                className="h-11 px-6 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs transition-all shrink-0 shadow-lg"
              >
                {trans.addSuggestionButton}
              </button>
            </div>

            {/* Sleek Tab Switcher for Suggestions Lists to completely resolve nested scrollbars */}
            <div className="flex border-b border-white/10 pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveSuggestTab('expense');
                  setNewSuggestType('expense');
                }}
                className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 text-center ${activeSuggestTab === 'expense' ? 'border-rose-500 text-rose-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {trans.suggestExpenseList} ({suggestions.filter(s => s.type === 'expense').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSuggestTab('income');
                  setNewSuggestType('income');
                }}
                className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 text-center ${activeSuggestTab === 'income' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {trans.suggestIncomeList} ({suggestions.filter(s => s.type === 'income').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSuggestTab('investment');
                  setNewSuggestType('investment');
                }}
                className={`flex-1 pb-3 text-xs font-black transition-all border-b-2 text-center ${activeSuggestTab === 'investment' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {trans.suggestInvestmentList} ({suggestions.filter(s => s.type === 'investment').length})
              </button>
            </div>

            {/* List and Search box */}
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="relative">
                <input 
                  type="text"
                  value={suggestSearchQuery}
                  onChange={(e) => setSuggestSearchQuery(e.target.value)}
                  placeholder={trans.suggestSearchPlaceholder}
                  className="w-full h-11 bg-black/30 border border-white/10 focus:border-cyan-400 rounded-xl px-4 text-xs text-white outline-none"
                />
              </div>

              {/* Single, Scrollable suggestions list container */}
              <div className="flex-1 overflow-y-auto pr-1 max-h-[350px] custom-scrollbar space-y-2 overscroll-contain">
                {suggestions
                  .filter(s => s.type === activeSuggestTab && s.text.toLowerCase().includes(suggestSearchQuery.toLowerCase()))
                  .length === 0 ? (
                    <div className="text-center text-xs text-slate-500 py-10">
                      {trans.noSuggestionsYet}
                    </div>
                  ) : (
                    suggestions
                      .filter(s => s.type === activeSuggestTab && s.text.toLowerCase().includes(suggestSearchQuery.toLowerCase()))
                      .map((s) => (
                        <div 
                          key={s.id} 
                          className={`flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3 text-xs hover:bg-white/10 transition-all ${
                            activeSuggestTab === 'expense' ? 'hover:border-rose-500/20' : 
                            activeSuggestTab === 'income' ? 'hover:border-emerald-500/20' : 
                            'hover:border-amber-500/20'
                          }`}
                        >
                          <div className="flex flex-col gap-1 truncate max-w-[55%]">
                            <span className="font-bold text-white truncate">{s.text}</span>
                            {s.type === 'investment' && s.price !== undefined && s.price > 0 && (
                              <span className="text-[10px] text-amber-400 font-mono">
                                {language === 'fa' ? 'قیمت واحد: ' : 'Unit Price: '}
                                {Number(s.price).toLocaleString('en-US')} {s.priceCurrency === 'USD' ? 'USD' : s.priceCurrency === 'EUR' ? 'EUR' : (language === 'fa' ? 'تومان' : 'IRT')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded font-mono">
                              {digitsToPersian(s.useCount)} {trans.suggestionUsedTimes}
                            </span>
                            {s.type === 'investment' && (
                              <button 
                                onClick={() => {
                                  setEditingSuggestPriceId(s.id);
                                  setPriceInputValue(s.price ? formatNumberWithCommas(s.price.toString()) : "");
                                  setPriceCurrencyInputValue(s.priceCurrency || "IRT");
                                }}
                                className="p-1.5 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-all cursor-pointer"
                                title={language === 'fa' ? 'تنظیم قیمت واحد' : 'Configure unit price'}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            )}
                            {!(s.type === 'investment' && ['دلار آمریکا', 'دلار', 'یورو', 'usd', 'eur'].includes(s.text.toLowerCase().trim())) && (
                              <button 
                                onClick={() => handleDeleteSuggestion(s.id)}
                                className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NESTED UNIT PRICE CONFIGURATION MODAL */}
      {editingSuggestPriceId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
          <div className="bg-[#12082b] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-vazir">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>
                {language === 'fa' 
                  ? `تنظیم قیمت: ${suggestions.find(s => s.id === editingSuggestPriceId)?.text || ""}` 
                  : `Set Price: ${suggestions.find(s => s.id === editingSuggestPriceId)?.text || ""}`}
              </span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs text-indigo-200/70 font-bold font-vazir">
                {language === 'fa' ? 'واحد ارز قیمت' : 'Price Currency'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['IRT', 'USD', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setPriceCurrencyInputValue(curr)}
                    className={`h-9 rounded-lg text-xs font-black transition-all border ${
                      priceCurrencyInputValue === curr
                        ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {curr === 'IRT' ? (language === 'fa' ? 'تومان (IRT)' : 'IRT') : curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-indigo-200/70 font-bold font-vazir">
                {language === 'fa' 
                  ? `قیمت واحد دارایی (${priceCurrencyInputValue === 'IRT' ? 'تومان' : priceCurrencyInputValue})` 
                  : `Unit Price of Asset (${priceCurrencyInputValue})`}
              </label>
              <input 
                type="text"
                value={priceInputValue}
                onChange={(e) => {
                  setPriceInputValue(formatNumberWithCommas(e.target.value));
                }}
                className="w-full h-11 bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl px-3 text-sm font-mono text-white outline-none"
                placeholder="0"
              />
              {priceInputValue && (
                <span className="text-[10px] text-slate-400 font-mono block">
                  {Number(priceInputValue.replace(/,/g, '')).toLocaleString('en-US')} {priceCurrencyInputValue === 'IRT' ? (language === 'fa' ? 'تومان' : 'IRT') : priceCurrencyInputValue}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const assetName = suggestions.find(s => s.id === editingSuggestPriceId)?.text || "";
                    const confirmMsg = language === 'fa' 
                      ? `آیا از ثبت قیمت جدید برای "${assetName}" مطمئن هستید؟` 
                      : `Are you sure you want to register a new price for "${assetName}"?`;
                    
                    triggerConfirm(confirmMsg, () => {
                      const numericPrice = Number(priceInputValue.replace(/,/g, '')) || 0;
                      setSuggestions(prev => prev.map(sug => {
                        if (sug.id === editingSuggestPriceId) {
                          return { 
                            ...sug, 
                            price: numericPrice > 0 ? numericPrice : undefined,
                            priceCurrency: numericPrice > 0 ? priceCurrencyInputValue : undefined
                          };
                        }
                        return sug;
                      }));
                      setEditingSuggestPriceId(null);
                      setPriceInputValue("");
                    });
                  }}
                  className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer flex items-center justify-center font-vazir"
                >
                  {language === 'fa' ? 'ثبت قیمت جدید' : 'Register Price'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSuggestPriceId(null);
                    setPriceInputValue("");
                  }}
                  className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition text-xs font-bold font-vazir cursor-pointer"
                >
                  {language === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
              </div>

              {suggestions.find(s => s.id === editingSuggestPriceId)?.price !== undefined && (
                <button
                  type="button"
                  onClick={() => {
                    const assetName = suggestions.find(s => s.id === editingSuggestPriceId)?.text || "";
                    const confirmMsg = language === 'fa' 
                      ? `آیا از حذف قیمت دارایی "${assetName}" مطمئن هستید؟` 
                      : `Are you sure you want to delete the price of "${assetName}"?`;

                    triggerConfirm(confirmMsg, () => {
                      setSuggestions(prev => prev.map(sug => {
                        if (sug.id === editingSuggestPriceId) {
                          return { ...sug, price: undefined, priceCurrency: undefined };
                        }
                        return sug;
                      }));
                      setEditingSuggestPriceId(null);
                      setPriceInputValue("");
                    });
                  }}
                  className="w-full h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs transition cursor-pointer flex items-center justify-center font-vazir"
                >
                  {language === 'fa' ? 'حذف قیمت فعلی' : 'Delete Current Price'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALL INVESTMENTS GRAPH & MANAGEMENT MODAL */}
      {allInvestmentsModalOpen && (() => {
        const usdSuggestion = suggestions.find(s => s.type === 'investment' && ['دلار آمریکا', 'دلار', 'usd'].includes(s.text.toLowerCase().trim()));
        const eurSuggestion = suggestions.find(s => s.type === 'investment' && ['یورو', 'eur'].includes(s.text.toLowerCase().trim()));
        const isUsdPriceMissing = !usdSuggestion || !usdSuggestion.price || usdSuggestion.price <= 0;
        const isEurPriceMissing = !eurSuggestion || !eurSuggestion.price || eurSuggestion.price <= 0;
        const hasCurrencyWarning = isUsdPriceMissing || isEurPriceMissing;

        const totalCostInSelected = filteredInvestments.reduce((sum, inv) => {
          return sum + getInvestmentValue(inv, invReportCurrency, false);
        }, 0);

        const totalCurrentValueInSelected = filteredInvestments.reduce((sum, inv) => {
          return sum + getInvestmentValue(inv, invReportCurrency, true);
        }, 0);

        const totalProfitLossInSelected = totalCurrentValueInSelected - totalCostInSelected;
        const totalProfitPercentage = totalCostInSelected > 0 ? (totalProfitLossInSelected / totalCostInSelected) * 100 : 0;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4 overflow-hidden">
            <div className="bg-[#100c2a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setAllInvestmentsModalOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer z-10"
              >
                ✕
              </button>

              <div className="border-b border-white/10 pb-3 shrink-0">
                <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 font-vazir">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>{language === 'fa' ? 'گزارش و مدیریت جامع سرمایه‌گذاری‌ها' : 'Investments Report & Management'}</span>
                </h2>
                <p className="text-[11px] text-indigo-200/50 mt-1 font-vazir">
                  {language === 'fa' 
                    ? 'نمودار رشد انباشته، مقایسه ارزش بازار و ابزار مدیریت تمام سرمایه‌گذاری‌های ثبت‌شده در تمامی ماه‌ها' 
                    : 'Cumulative growth chart, market value comparison, and management tool for all investments registered across all months'}
                </p>
              </div>

              {/* Scrollable Body Wrapper */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1.5 custom-scrollbar scroll-smooth overscroll-contain pb-2">

              {/* Currency Report Base Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white font-vazir block">
                    {language === 'fa' ? 'ارز پایه گزارش‌گیری:' : 'Base Currency for Reporting:'}
                  </span>
                  <span className="text-[10px] text-indigo-200/50 font-vazir block">
                    {language === 'fa' 
                      ? 'تبدیل خودکار ارزش فعلی و نمودارها بر اساس این ارز انتخابی صورت می‌گیرد.' 
                      : 'Current value and chart data are converted automatically based on this currency.'}
                  </span>
                </div>
                <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 self-stretch sm:self-auto justify-center">
                  {(['IRT', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setInvReportCurrency(curr)}
                      className={`h-9 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        invReportCurrency === curr
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {curr === 'IRT' ? (language === 'fa' ? 'تومان (IRT)' : 'IRT') : curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter Panel */}
              <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setInvFiltersOpen(!invFiltersOpen)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-400 font-vazir">
                      {language === 'fa' ? 'فیلتر تاریخ خرید سرمایه‌گذاری‌ها' : 'Filter Investments by Purchase Date'}
                    </span>
                    {(invFilterStartDate || invFilterEndDate) && (
                      <span className="text-[9px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold font-vazir">
                        {language === 'fa' ? 'فعال' : 'Active'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {invFiltersOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {invFiltersOpen && (
                  <div className="p-4 pt-0 border-t border-white/5 bg-black/20 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-end">
                      {(invFilterStartDate || invFilterEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setInvFilterStartDate("");
                            setInvFilterEndDate("");
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-all cursor-pointer font-vazir"
                        >
                          <span>{language === 'fa' ? 'پاک کردن فیلتر' : 'Clear Filter'}</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block font-vazir">
                          {language === 'fa' ? 'از تاریخ:' : 'From Date:'}
                        </label>
                        <DatePicker 
                          value={invFilterStartDate}
                          onChange={(val) => setInvFilterStartDate(val)}
                          language={language}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block font-vazir">
                          {language === 'fa' ? 'تا تاریخ:' : 'To Date:'}
                        </label>
                        <DatePicker 
                          value={invFilterEndDate}
                          onChange={(val) => setInvFilterEndDate(val)}
                          language={language}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Warnings Panel */}
              {hasCurrencyWarning && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-amber-400 font-vazir">
                      {language === 'fa' ? 'هشدار محاسبه: نرخ ارز ثبت نشده است!' : 'Calculation Warning: Exchange rates not configured!'}
                    </h4>
                    <p className="text-[10px] leading-relaxed text-amber-200/70 font-vazir">
                      {language === 'fa' ? (
                        <>
                          قیمت واحد برای {isUsdPriceMissing && <strong className="text-amber-300">«دلار آمریکا»</strong>} {isUsdPriceMissing && isEurPriceMissing && 'و'} {isEurPriceMissing && <strong className="text-amber-300">«یورو»</strong>} در بخش مدیریت پیشنهادهای هوشمند هنوز تنظیم نشده یا صفر است. به همین علت، تبدیل دارایی‌های ارزی و محاسبه ارزش بازار با خطا مواجه خواهد شد. لطفاً برای تصحیح محاسبات، قیمت آن‌ها را ثبت کنید.
                        </>
                      ) : (
                        <>
                          Unit price for {isUsdPriceMissing && <strong className="text-amber-300">USD</strong>} {isUsdPriceMissing && isEurPriceMissing && 'and'} {isEurPriceMissing && <strong className="text-amber-300">EUR</strong>} in Smart Suggestions is zero or missing. Currency conversion and market value calculation might be incorrect. Please configure their prices to fix the calculations.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Left-Aligned Graph Area */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-black text-cyan-400 flex items-center gap-1.5 font-vazir">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>
                      {language === 'fa' 
                        ? `روند رشد انباشته و مقایسه بهای تمام شده با ارزش فعلی (${invReportCurrency === 'IRT' ? 'تومان' : invReportCurrency})` 
                        : `Cumulative total growth & value comparison (${invReportCurrency})`}
                    </span>
                  </h3>
                  {chartData.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChartCustomizeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-[10px] font-black text-indigo-300 transition-all cursor-pointer font-vazir self-start sm:self-auto"
                    >
                      <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>{language === 'fa' ? 'شخصی‌سازی نمودار' : 'Customize Chart'}</span>
                    </button>
                  )}
                </div>
                
                <div className="w-full text-left font-mono" dir="ltr">
                  {chartData.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-12 font-vazir">
                      {language === 'fa' ? 'هنوز هیچ سرمایه‌گذاری ثبت نشده است تا نمودار نمایش داده شود.' : 'No investments registered yet to display chart.'}
                    </div>
                  ) : (
                    <div className="h-[180px] sm:h-[220px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotalAll" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartMarketColor} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={chartMarketColor} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCostAll" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartCostColor} stopOpacity={0.15}/>
                              <stop offset="95%" stopColor={chartCostColor} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="displayDate" 
                            stroke="#94a3b8" 
                            fontSize={9}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={9}
                            tickLine={false}
                            tickFormatter={(v) => v.toLocaleString('en-US')}
                            orientation="left"
                          />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: '#0d0723',
                              borderColor: 'rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              color: '#fff',
                              fontSize: '11px',
                              textAlign: 'left'
                            }}
                            formatter={(value: any, name: any) => [
                              `${Number(value).toLocaleString('en-US')} ${invReportCurrency === 'IRT' ? (language === 'fa' ? 'تومان' : 'IRT') : invReportCurrency}`,
                              name
                            ]}
                          />
                          {chartShowMarket && (
                            <Area 
                              type="monotone" 
                              dataKey="total" 
                              name={language === 'fa' ? 'ارزش بازار فعلی' : 'Current Market Value'}
                              stroke={chartMarketColor} 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#colorTotalAll)" 
                              strokeDasharray={chartMarketStyle === 'dashed' ? "5 5" : chartMarketStyle === 'dotted' ? "2 2" : undefined}
                            />
                          )}
                          {chartShowCost && (
                            <Area 
                              type="monotone" 
                              dataKey="cost" 
                              name={language === 'fa' ? 'بهای تمام شده خرید' : 'Purchase Cost'}
                              stroke={chartCostColor} 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorCostAll)" 
                              strokeDasharray={chartCostStyle === 'dashed' ? "5 5" : chartCostStyle === 'dotted' ? "2 2" : undefined}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Total investments per currency summary box */}
              <div className="grid grid-cols-3 gap-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1 font-vazir">
                    {language === 'fa' ? 'کل بهای تمام شده' : 'Total Purchase Cost'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-300 font-mono" dir="ltr">
                    {formatCurrency(totalCostInSelected, invReportCurrency)}
                  </span>
                </div>
                <div className="text-center border-x border-white/5">
                  <span className="text-[10px] text-cyan-400 font-bold block mb-1 font-vazir">
                    {language === 'fa' ? 'ارزش فعلی بازار' : 'Current Market Value'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-cyan-400 font-mono" dir="ltr">
                    {formatCurrency(totalCurrentValueInSelected, invReportCurrency)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 font-bold block mb-1 font-vazir">
                    {language === 'fa' ? 'بازدهی کل (سود / زیان)' : 'Total Yield (Profit/Loss)'}
                  </span>
                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-xs sm:text-sm font-black font-mono ${totalProfitLossInSelected >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                      {totalProfitLossInSelected >= 0 ? '+' : ''}{formatCurrency(totalProfitLossInSelected, invReportCurrency)}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${totalProfitLossInSelected >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {totalProfitLossInSelected >= 0 ? '▲' : '▼'} {digitsToPersian(totalProfitPercentage.toFixed(2))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Management List Container */}
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                  <h3 className="text-xs font-black text-slate-400 font-vazir">
                    {language === 'fa' ? 'مدیریت و پرتفوی سرمایه‌گذاری‌ها (دسته‌بندی شده)' : 'Investment Portfolio Management (Grouped)'}
                  </h3>
                  <button
                    onClick={() => setBudgetDragLocked(!budgetDragLocked)}
                    className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                      budgetDragLocked 
                        ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20' 
                        : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20'
                    }`}
                    title={budgetDragLocked ? (language === 'fa' ? 'باز کردن قفل جابه‌جایی' : 'Unlock Dragging') : (language === 'fa' ? 'قفل کردن جابه‌جایی' : 'Lock Dragging')}
                  >
                    {budgetDragLocked ? <Lock className="w-3 h-3 text-slate-400" /> : <Unlock className="w-3 h-3 text-cyan-300 animate-pulse" />}
                    <span>{budgetDragLocked ? (language === 'fa' ? 'قفل جابه‌جایی' : 'قفل') : (language === 'fa' ? 'جابه‌جایی فعال' : 'آزاد')}</span>
                  </button>
                </div>

                {groupedInvestments.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8 font-vazir">
                    {trans.emptyInvestments}
                  </div>
                ) : (
                  groupedInvestments.map((group, index) => {
                    const isExpanded = expandedGroups.includes(group.key);
                    const matchingSug = suggestions.find(s => s.type === 'investment' && s.text.toLowerCase().trim() === group.type.toLowerCase().trim());
                    const currentAssetPrice = matchingSug?.price;
                    const priceCurr = matchingSug?.priceCurrency || 'IRT';

                    const nativeCost = group.totalPrice;
                    const nativeValue = currentAssetPrice ? group.totalAmount * currentAssetPrice : null;

                    const convertedCost = convertCurrency(nativeCost, group.currency, invReportCurrency);
                    const convertedValue = currentAssetPrice ? convertCurrency(group.totalAmount * currentAssetPrice, priceCurr, invReportCurrency) : null;

                    return (
                      <div 
                        key={group.key} 
                        draggable={!budgetDragLocked}
                        onDragStart={() => setDraggedGroupedInvestmentIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropGroupedInvestment(draggedGroupedInvestmentIndex!, index)}
                        onDragEnd={() => setDraggedGroupedInvestmentIndex(null)}
                        className={`bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:border-indigo-500/20 ${
                          budgetDragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                        } ${draggedGroupedInvestmentIndex === index ? 'opacity-40 border-dashed border-cyan-500 scale-95' : ''}`}
                      >
                        {/* Group Header */}
                        <div className="flex justify-between items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm sm:text-base font-black text-white font-vazir">{group.type}</strong>
                              <span className="text-[10px] font-bold font-vazir bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg text-indigo-300">
                                {digitsToPersian(group.items.length)} {language === 'fa' ? 'خرید' : 'Purchases'}
                              </span>
                            </div>
                            <div className="text-xs text-indigo-200/60 font-medium font-vazir flex flex-col gap-0.5">
                              <div>
                                {language === 'fa' ? 'کل دارایی:' : 'Total Amount:'} <span className="font-bold text-amber-300 font-mono">{digitsToPersian(group.totalAmount)}</span> {language === 'fa' ? 'واحد' : 'units'}
                              </div>
                              {currentAssetPrice !== undefined && currentAssetPrice > 0 && (
                                <div className="text-[10px] text-amber-400 font-bold">
                                  {language === 'fa' ? `قیمت بازار: ` : `Market Unit Price: `}
                                  <span className="font-mono">{currentAssetPrice.toLocaleString('en-US')} {priceCurr === 'IRT' ? (language === 'fa' ? 'تومان' : 'IRT') : priceCurr}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="text-right space-y-1">
                              {/* Purchase Cost */}
                              <div className="space-y-0.5">
                                <div className="text-[9px] text-slate-500 font-black tracking-wider font-vazir text-right">
                                  {language === 'fa' ? 'بهای تمام شده:' : 'Purchase Cost:'}
                                </div>
                                <div className="text-xs font-bold text-slate-400 font-mono" dir="ltr">
                                  {formatCurrency(nativeCost, group.currency)}
                                </div>
                                {group.currency !== invReportCurrency && (
                                  <div className="text-[9px] text-slate-500 font-mono" dir="ltr">
                                    ≈ {formatCurrency(convertedCost, invReportCurrency)}
                                  </div>
                                )}
                              </div>

                              {/* Current Market Value */}
                              {currentAssetPrice !== undefined && currentAssetPrice > 0 && convertedValue !== null && (
                                <div className="space-y-0.5 pt-1 border-t border-white/5">
                                  <div className="text-[9px] text-cyan-400 font-black tracking-wider font-vazir text-right">
                                    {language === 'fa' ? 'ارزش فعلی بازار:' : 'Current Market Value:'}
                                  </div>
                                  <div className="text-sm sm:text-base font-black text-cyan-400 font-mono" dir="ltr">
                                    {formatCurrency(convertedValue, invReportCurrency)}
                                  </div>
                                  {priceCurr !== invReportCurrency && (
                                    <div className="text-[9px] text-cyan-500/80 font-mono" dir="ltr">
                                      ≈ {formatCurrency(nativeValue || 0, priceCurr)}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Profit/Loss for Group */}
                              {currentAssetPrice !== undefined && currentAssetPrice > 0 && convertedValue !== null && (() => {
                                const groupProfitLoss = convertedValue - convertedCost;
                                const groupProfitPercentage = convertedCost > 0 ? (groupProfitLoss / convertedCost) * 100 : 0;
                                return (
                                  <div className="space-y-0.5 pt-1 border-t border-white/5 text-right font-vazir select-none">
                                    <div className="text-[9px] text-amber-400 font-black tracking-wider text-right">
                                      {language === 'fa' ? 'بازدهی (سود / زیان):' : 'Yield (Profit/Loss):'}
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <span className={`text-xs font-black font-mono ${groupProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                                        {groupProfitLoss >= 0 ? '+' : ''}{formatCurrency(groupProfitLoss, invReportCurrency)}
                                      </span>
                                      <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${groupProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {groupProfitLoss >= 0 ? '▲' : '▼'} {digitsToPersian(groupProfitPercentage.toFixed(2))}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Group-level Actions */}
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditGroupedInvestment(group)}
                                className="p-2 hover:bg-white/10 rounded-xl text-amber-400 transition-all cursor-pointer flex items-center justify-center border border-white/5 bg-white/5"
                                title={language === 'fa' ? 'ویرایش کل این دارایی' : 'Edit overall holdings'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteGroupedInvestment(group)}
                                className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-all cursor-pointer flex items-center justify-center border border-white/5 bg-white/5"
                                title={language === 'fa' ? 'حذف کل این دارایی' : 'Delete all holdings'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                setExpandedGroups(prev =>
                                  prev.includes(group.key) ? prev.filter(k => k !== group.key) : [...prev, group.key]
                                );
                              }}
                              className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-all cursor-pointer"
                              title={language === 'fa' ? 'مشاهده جزئیات خریدها' : 'View purchase history'}
                            >
                              <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Sub-items (Transaction History) */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                            <h4 className="text-[10px] font-black text-indigo-200/40 uppercase tracking-wider font-vazir mb-1">
                              {language === 'fa' ? 'جزئیات خریدهای ثبت شده:' : 'Details of Recorded Purchases:'}
                            </h4>
                            <div className="space-y-2">
                              {group.items.map((inv) => {
                                const isClosed = monthsData[inv.monthKey]?.closed;
                                return (
                                  <div 
                                    key={inv.id}
                                    className="flex justify-between items-center bg-black/35 hover:bg-black/50 border border-white/5 rounded-xl p-3 gap-2 transition-all"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] font-black font-vazir bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-indigo-200/70">
                                          {language === 'fa' ? 'ماه:' : 'Month:'} {digitsToPersian(inv.monthKey)}
                                        </span>
                                        {isClosed && (
                                          <span className="text-[9px] font-black font-vazir bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded text-rose-300 uppercase">
                                            {language === 'fa' ? 'بایگانی' : 'Archived'}
                                          </span>
                                        )}
                                        {inv.date && (
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {formatBudgetEntryDate(inv.date)}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {language === 'fa' ? 'مقدار:' : 'Qty:'} <span className="font-bold text-slate-200 font-mono">{digitsToPersian(inv.amount)}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      {currentAssetPrice !== undefined && currentAssetPrice > 0 && (() => {
                                        const itemCost = getInvestmentValue(inv, invReportCurrency, false);
                                        const itemCurrentValue = getInvestmentValue(inv, invReportCurrency, true);
                                        const itemProfitLoss = itemCurrentValue - itemCost;
                                        const itemProfitPercentage = itemCost > 0 ? (itemProfitLoss / itemCost) * 100 : 0;
                                        return (
                                          <div className="flex flex-col items-end justify-center text-right font-vazir select-none px-2 border-r border-white/5">
                                            <span className={`text-[10px] font-black font-mono ${itemProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                                              {itemProfitLoss >= 0 ? '+' : ''}{formatCurrency(itemProfitLoss, invReportCurrency)}
                                            </span>
                                            <span className={`text-[9px] font-mono font-bold flex items-center gap-0.5 justify-end ${itemProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                              {itemProfitLoss >= 0 ? '▲' : '▼'} {digitsToPersian(itemProfitPercentage.toFixed(2))}%
                                            </span>
                                          </div>
                                        );
                                      })()}

                                      <div className="text-right">
                                        <div className="text-xs font-black text-yellow-400 font-mono" dir="ltr">
                                          {formatCurrency(inv.totalPrice, inv.currency)}
                                        </div>
                                        {inv.currency !== invReportCurrency && (
                                          <div className="text-[9px] text-slate-500 font-mono" dir="ltr">
                                            ≈ {formatCurrency(convertCurrency(inv.totalPrice, inv.currency, invReportCurrency), invReportCurrency)}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex gap-1 shrink-0">
                                        <button 
                                          onClick={() => handleEditInvestmentFlex(inv, inv.monthKey)}
                                          className="p-1.5 hover:bg-white/10 rounded-lg text-amber-400/80 hover:text-amber-400 transition-all cursor-pointer"
                                          title={language === 'fa' ? 'ویرایش' : 'Edit'}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteInvestmentFlex(inv.id, inv.monthKey)}
                                          className="p-1.5 hover:bg-white/10 rounded-lg text-rose-400/80 hover:text-rose-400 transition-all cursor-pointer"
                                          title={language === 'fa' ? 'حذف' : 'Delete'}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              </div>

              <div className="flex border-t border-white/10 pt-4 shrink-0">
                <button 
                  onClick={() => setAllInvestmentsModalOpen(false)}
                  className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all font-vazir cursor-pointer"
                >
                  <span>{language === 'fa' ? 'بستن' : 'Close'}</span>
                </button>
              </div>

              {/* Secondary Chart Style Customizer Modal */}
              {chartCustomizeModalOpen && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                  <div className="bg-[#120a32] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative space-y-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setChartCustomizeModalOpen(false)}
                      className="absolute top-4 left-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
                    >
                      ✕
                    </button>

                    <div className="border-b border-white/5 pb-2">
                      <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 font-vazir justify-start">
                        <Settings className="w-4 h-4 text-amber-400" />
                        <span>{language === 'fa' ? 'شخصی‌سازی ظاهر نمودار' : 'Customize Chart Appearance'}</span>
                      </h4>
                    </div>

                    <div className="space-y-4 font-vazir text-right" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                      {/* Market Value Customize */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 font-vazir flex items-center gap-1.5 justify-start">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartMarketColor }} />
                            {language === 'fa' ? 'ظاهر خط ارزش بازار فعلی:' : 'Current Market Value Line:'}
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={chartShowMarket}
                              onChange={(e) => setChartShowMarket(e.target.checked)}
                              className="accent-cyan-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[9px] font-bold text-slate-400">{language === 'fa' ? 'نمایش' : 'Show'}</span>
                          </label>
                        </div>
                        
                        {chartShowMarket ? (
                          <div className="flex flex-col gap-2 animate-fade-in">
                            {/* Colors */}
                            <div className="flex gap-1.5 flex-wrap justify-start">
                              {[
                                { name: 'cyan', hex: '#22d3ee', bgClass: 'bg-cyan-400' },
                                { name: 'emerald', hex: '#10b981', bgClass: 'bg-emerald-500' },
                                { name: 'amber', hex: '#fbbf24', bgClass: 'bg-amber-400' },
                                { name: 'violet', hex: '#a78bfa', bgClass: 'bg-violet-400' },
                                { name: 'rose', hex: '#f43f5e', bgClass: 'bg-rose-500' },
                                { name: 'slate', hex: '#94a3b8', bgClass: 'bg-slate-400' },
                                { name: 'pink', hex: '#ec4899', bgClass: 'bg-pink-500' },
                              ].map((color) => (
                                <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => setChartMarketColor(color.hex)}
                                  className={`w-6 h-6 rounded-full ${color.bgClass} transition-all relative cursor-pointer border ${
                                    chartMarketColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                  }`}
                                  title={color.name}
                                >
                                  {chartMarketColor === color.hex && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] text-black font-bold">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                            {/* Styles */}
                            <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 w-fit">
                              {[
                                { name: 'solid', labelFa: 'خط صاف', labelEn: 'Solid' },
                                { name: 'dashed', labelFa: 'خط‌چین', labelEn: 'Dashed' },
                                { name: 'dotted', labelFa: 'نقطه‌چین', labelEn: 'Dotted' },
                              ].map((style) => (
                                <button
                                  key={style.name}
                                  type="button"
                                  onClick={() => setChartMarketStyle(style.name as any)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    chartMarketStyle === style.name
                                      ? 'bg-white/15 text-white border border-white/10'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {language === 'fa' ? style.labelFa : style.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-bold italic font-vazir text-right py-1">
                            {language === 'fa' ? 'این خط از نمودار مخفی شده است.' : 'This line is hidden from the chart.'}
                          </div>
                        )}
                      </div>

                      {/* Purchase Cost Customize */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 font-vazir flex items-center gap-1.5 justify-start">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartCostColor }} />
                            {language === 'fa' ? 'ظاهر خط بهای تمام شده خرید:' : 'Purchase Cost Line:'}
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={chartShowCost}
                              onChange={(e) => setChartShowCost(e.target.checked)}
                              className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[9px] font-bold text-slate-400">{language === 'fa' ? 'نمایش' : 'Show'}</span>
                          </label>
                        </div>

                        {chartShowCost ? (
                          <div className="flex flex-col gap-2 animate-fade-in">
                            {/* Colors */}
                            <div className="flex gap-1.5 flex-wrap justify-start">
                              {[
                                { name: 'cyan', hex: '#22d3ee', bgClass: 'bg-cyan-400' },
                                { name: 'emerald', hex: '#10b981', bgClass: 'bg-emerald-500' },
                                { name: 'amber', hex: '#fbbf24', bgClass: 'bg-amber-400' },
                                { name: 'violet', hex: '#a78bfa', bgClass: 'bg-violet-400' },
                                { name: 'rose', hex: '#f43f5e', bgClass: 'bg-rose-500' },
                                { name: 'slate', hex: '#94a3b8', bgClass: 'bg-slate-400' },
                                { name: 'pink', hex: '#ec4899', bgClass: 'bg-pink-500' },
                              ].map((color) => (
                                <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => setChartCostColor(color.hex)}
                                  className={`w-6 h-6 rounded-full ${color.bgClass} transition-all relative cursor-pointer border ${
                                    chartCostColor === color.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                  }`}
                                  title={color.name}
                                >
                                  {chartCostColor === color.hex && (
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] text-black font-bold">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                            {/* Styles */}
                            <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 w-fit">
                              {[
                                { name: 'solid', labelFa: 'خط صاف', labelEn: 'Solid' },
                                { name: 'dashed', labelFa: 'خط‌چین', labelEn: 'Dashed' },
                                { name: 'dotted', labelFa: 'نقطه‌چین', labelEn: 'Dotted' },
                              ].map((style) => (
                                <button
                                  key={style.name}
                                  type="button"
                                  onClick={() => setChartCostStyle(style.name as any)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    chartCostStyle === style.name
                                      ? 'bg-white/15 text-white border border-white/10'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {language === 'fa' ? style.labelFa : style.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-bold italic font-vazir text-right py-1">
                            {language === 'fa' ? 'این خط از نمودار مخفی شده است.' : 'This line is hidden from the chart.'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setChartCustomizeModalOpen(false)}
                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-all font-vazir cursor-pointer"
                      >
                        {language === 'fa' ? 'تایید و ذخیره' : 'Confirm & Save'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* EDIT GROUPED INVESTMENT MODAL */}
      {editingGroupModalOpen && editingGroup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#100c2a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col space-y-5 shadow-2xl relative font-vazir">
            <button 
              onClick={() => {
                setEditingGroup(null);
                setEditingGroupModalOpen(false);
              }}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>{language === 'fa' ? 'ویرایش کلی دارایی' : 'Edit Overall Holding'}</span>
              </h2>
              <p className="text-[11px] text-indigo-200/50 mt-1">
                {language === 'fa' 
                  ? `در حال ویرایش تمام دارایی‌های «${editingGroup.type}»` 
                  : `Editing all assets under "${editingGroup.type}"`}
              </p>
            </div>

            <div className="space-y-4">
              {/* Asset Name / Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-indigo-200/80">
                  {language === 'fa' ? 'نام دارایی / سهم' : 'Asset / Share Name'}
                </label>
                <input 
                  type="text" 
                  value={editingGroupType}
                  onChange={(e) => setEditingGroupType(e.target.value)}
                  placeholder={trans.modalTypePlaceholder}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Total Quantity */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-indigo-200/80">
                    {language === 'fa' ? 'کل مقدار دارایی (تعداد/واحد)' : 'Total Quantity (Units)'}
                  </label>
                  <span className="text-[10px] text-amber-400/80">
                    {language === 'fa' ? `مقدار قبلی: ${digitsToPersian(editingGroup.totalAmount)}` : `Previous: ${editingGroup.totalAmount}`}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={editingGroupAmount}
                  onChange={(e) => setEditingGroupAmount(e.target.value)}
                  placeholder={language === 'fa' ? 'مقدار جدید' : 'New amount'}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  dir="ltr"
                />
                <p className="text-[9px] text-rose-300/70 leading-relaxed">
                  {language === 'fa' 
                    ? '⚠️ در صورت کاهش مقدار، خریدها به ترتیب از قدیمی‌ترین تا جدیدترین تعدیل یا حذف می‌شوند.' 
                    : '⚠️ If reduced, purchases will be adjusted/deleted sequentially from oldest to newest.'}
                </p>
              </div>

              {/* Total Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-indigo-200/80">
                    {language === 'fa' ? `کل ارزش خرید (${editingGroup.currency})` : `Total Invested Value (${editingGroup.currency})`}
                  </label>
                  <span className="text-[10px] text-amber-400/80">
                    {language === 'fa' ? `مجموع قبلی: ${digitsToPersian(editingGroup.totalPrice.toLocaleString('en-US'))}` : `Previous: ${editingGroup.totalPrice.toLocaleString('en-US')}`}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={editingGroupTotalPrice}
                  onChange={(e) => setEditingGroupTotalPrice(e.target.value)}
                  placeholder={language === 'fa' ? 'مبلغ جدید کل خرید' : 'New total price'}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  dir="ltr"
                />
                <p className="text-[9px] text-indigo-300/60 leading-relaxed">
                  {language === 'fa' 
                    ? '💡 تغییر مبلغ کل خرید، به طور تناسبی بین خریدهای باقی‌مانده تقسیم شده و بودجه ماه مربوطه خودکار تعدیل می‌گردد.' 
                    : '💡 Modifying total price distributes it proportionally among remaining items, adjusting respective monthly budgets.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={handleSaveGroupedInvestment}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{trans.modalSave}</span>
              </button>
              <button 
                onClick={() => {
                  setEditingGroup(null);
                  setEditingGroupModalOpen(false);
                }}
                className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{trans.modalCancel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOSED ARCHIVE DETAILS MODAL */}
      {viewArchiveKey && monthsData[viewArchiveKey] && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#100c2a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] flex flex-col space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setViewArchiveKey(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>

            <h2 className="text-lg font-black text-cyan-400 border-b border-white/10 pb-3">
              {trans.archiveModalTitle} {
                monthsData[viewArchiveKey].calendar === 'shamsi' ? 
                SHAMSI_MONTH_NAMES[language][monthsData[viewArchiveKey].month - 1] : 
                GREGORIAN_MONTH_NAMES[language][monthsData[viewArchiveKey].month - 1]
              } {digitsToPersian(monthsData[viewArchiveKey].year)}
            </h2>

            <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-xs space-y-1">
                <span className="text-indigo-200/50 font-bold block">{trans.summaryBudget}</span>
                <span className="font-mono text-sm font-black text-white" dir="ltr">
                  {formatCurrency(getOriginalBaseBudget(monthsData[viewArchiveKey]), monthsData[viewArchiveKey].currency)} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                </span>
              </div>
              <div className="text-xs space-y-1">
                <span className="text-indigo-200/50 font-bold block">{trans.summaryIncome}</span>
                <span className="font-mono text-sm font-black text-emerald-400" dir="ltr">
                  + {formatCurrency(monthsData[viewArchiveKey].incomes.reduce((s, x) => s + x.amount, 0), monthsData[viewArchiveKey].currency)} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                </span>
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-white/5">
                <span className="text-indigo-200/50 font-bold block">{trans.summaryExpenses}</span>
                <span className="font-mono text-sm font-black text-rose-400" dir="ltr">
                  - {formatCurrency(monthsData[viewArchiveKey].expenses.reduce((s, x) => s + x.amount, 0), monthsData[viewArchiveKey].currency)} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                </span>
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-white/5">
                <span className="text-indigo-200/50 font-bold block">{trans.summaryRemain}</span>
                {(() => {
                  const totalInc = monthsData[viewArchiveKey].incomes.reduce((s, x) => s + x.amount, 0);
                  const totalExp = monthsData[viewArchiveKey].expenses.reduce((s, x) => s + x.amount, 0);
                  const remainVal = monthsData[viewArchiveKey].budget + totalInc - totalExp;
                  return (
                    <span className={`font-mono text-sm font-black ${remainVal >= 0 ? 'text-cyan-400' : 'text-rose-500'}`} dir="ltr">
                      {remainVal < 0 ? '-' : ''}{formatCurrency(Math.abs(remainVal), monthsData[viewArchiveKey].currency)} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <h3 className="text-xs font-black text-slate-400 mb-2">{trans.archiveModalTransactions}</h3>
              {monthsData[viewArchiveKey].incomes.map(tx => (
                <div key={tx.id} className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-xs">
                  <div>
                    <strong className="text-white block">{tx.title}</strong>
                    <span className="text-[9px] text-slate-500">{formatBudgetEntryDate(tx.date)} • {trans.txtIncome}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400" dir="ltr">
                    + {tx.amount.toLocaleString('en-US')} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                  </span>
                </div>
              ))}
              {monthsData[viewArchiveKey].expenses.map(tx => (
                <div key={tx.id} className="flex justify-between items-center bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-xs">
                  <div>
                    <strong className="text-white block">{tx.title}</strong>
                    <span className="text-[9px] text-slate-500">{formatBudgetEntryDate(tx.date)} • {trans.txtExpense}</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400" dir="ltr">
                    - {tx.amount.toLocaleString('en-US')} {getCurrencySymbol(monthsData[viewArchiveKey].currency)}
                  </span>
                </div>
              ))}

              {monthsData[viewArchiveKey].investments && monthsData[viewArchiveKey].investments!.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <h3 className="text-xs font-black text-amber-400 mb-2">{trans.archiveModalInvestments}</h3>
                  {monthsData[viewArchiveKey].investments!.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs">
                      <div>
                        <strong className="text-white block">{inv.type}</strong>
                        <span className="text-[9px] text-slate-500">
                          {language === 'fa' ? 'مقدار:' : 'Amount:'} {digitsToPersian(inv.amount)} • {formatBudgetEntryDate(inv.date)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5" dir="ltr">
                        {formatCurrency(inv.totalPrice, inv.currency)}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase scale-90">
                          {inv.currency}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXPORT DATA FILTER & DOWNLOAD MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-[#0f092b] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-5 text-right font-vazir relative overflow-hidden" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">
                  {language === 'fa' ? 'فیلتر و خروجی گزارش بودجه' : 'Export Budget Report'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {language === 'fa' ? 'فیلترهای موردنظر را اعمال و فرمت خروجی را انتخاب نمایید.' : 'Configure filters and choose file format to export.'}
                </p>
              </div>
            </div>

            {/* Content Filters */}
            <div className="space-y-4 text-xs">
              
              {/* 1. Date range filter */}
              <div className="space-y-1.5 text-right">
                <label className="block text-[11px] font-bold text-cyan-400">
                  📅 {language === 'fa' ? 'فیلتر بازه زمانی:' : 'Date Range:'}
                </label>
                <div className="grid grid-cols-2 gap-3 text-right">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1">{language === 'fa' ? 'از تاریخ' : 'From Date'}</span>
                    <DatePicker 
                      value={exportStartDate}
                      onChange={(val) => setExportStartDate(val)}
                      language={language}
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1">{language === 'fa' ? 'تا تاریخ' : 'To Date'}</span>
                    <DatePicker 
                      value={exportEndDate}
                      onChange={(val) => setExportEndDate(val)}
                      language={language}
                    />
                  </div>
                </div>
                {(exportStartDate || exportEndDate) && (
                  <button 
                    type="button"
                    onClick={() => { setExportStartDate(""); setExportEndDate(""); }}
                    className="text-[9px] text-rose-400 hover:text-rose-300 transition-all font-bold mt-1 block mr-auto ml-0"
                  >
                    ✕ {language === 'fa' ? 'پاک کردن فیلتر تاریخ' : 'Clear Date Filter'}
                  </button>
                )}
              </div>

              {/* 2. Data Categories Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-[11px] font-bold text-cyan-400 mb-1">
                  🗂️ {language === 'fa' ? 'انتخاب نوع اطلاعات جهت خروجی:' : 'Select Data to Include:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={exportIncludeBudgets}
                      onChange={(e) => setExportIncludeBudgets(e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{language === 'fa' ? 'بودجه پایه' : 'Base Budgets'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={exportIncludeIncomes}
                      onChange={(e) => setExportIncludeIncomes(e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{language === 'fa' ? 'درآمدها' : 'Incomes'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={exportIncludeExpenses}
                      onChange={(e) => setExportIncludeExpenses(e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{language === 'fa' ? 'هزینه‌ها' : 'Expenses'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={exportIncludeInvestments}
                      onChange={(e) => setExportIncludeInvestments(e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{language === 'fa' ? 'سرمایه‌گذاری‌ها' : 'Investments'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none col-span-2">
                    <input 
                      type="checkbox" 
                      checked={exportIncludeBalances}
                      onChange={(e) => setExportIncludeBalances(e.target.checked)}
                      className="accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{language === 'fa' ? 'مانده‌های نهایی' : 'Final Balances'}</span>
                  </label>
                </div>
              </div>

              {/* 3. Currency Selector */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-[11px] font-bold text-cyan-400">
                  🪙 {language === 'fa' ? 'ارز مرجع خروجی (تبدیل خودکار مبالغ):' : 'Output Currency (Auto Conversion):'}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-1 rounded-xl">
                  {([
                    { code: 'IRT', label: language === 'fa' ? 'تومان' : 'IRT' },
                    { code: 'USD', label: language === 'fa' ? 'دلار ($)' : 'USD ($)' },
                    { code: 'EUR', label: language === 'fa' ? 'یورو (€)' : 'EUR (€)' }
                  ] as const).map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setExportCurrency(curr.code)}
                      className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        exportCurrency === curr.code 
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 italic mt-1 leading-relaxed">
                  {language === 'fa' 
                    ? '* مبالغ تراکنش‌ها، بودجه‌ها و سرمایه‌گذاری‌ها بر اساس نرخ پیشنهادهای شما تبدیل خواهند شد.' 
                    : '* Amounts are converted automatically using the rates specified in your suggestions.'}
                </p>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <button 
                type="button"
                onClick={() => {
                  handleExportToExcel();
                  setExportModalOpen(false);
                }}
                disabled={!exportIncludeBudgets && !exportIncludeIncomes && !exportIncludeExpenses && !exportIncludeInvestments && !exportIncludeBalances}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-lg shadow-emerald-950/25 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>{language === 'fa' ? 'دانلود فایل اکسل مرتب شده (EXCEL)' : 'Download Excel (.xlsx)'}</span>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  handleExportToCSV();
                  setExportModalOpen(false);
                }}
                disabled={!exportIncludeBudgets && !exportIncludeIncomes && !exportIncludeExpenses && !exportIncludeInvestments && !exportIncludeBalances}
                className="w-full py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
              >
                <span>{language === 'fa' ? 'دانلود فایل متنی استاندارد (CSV)' : 'Download Text Format (.csv)'}</span>
              </button>

              <button 
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="w-full py-1.5 text-slate-500 hover:text-slate-300 transition text-[11px] font-bold cursor-pointer text-center"
              >
                {language === 'fa' ? 'انصراف' : 'Cancel'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IMPORT EXCEL/CSV MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120826]/95 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 text-right shadow-2xl relative font-vazir my-8">
            {/* Close button */}
            <button 
              type="button"
              onClick={() => {
                setImportModalOpen(false);
                setImportFeedback({ type: null, message: '' });
              }}
              className="absolute top-4 left-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
              <FileUp className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5 text-center">
              <h3 className="text-lg font-black text-white">
                {language === 'fa' ? 'ورود اطلاعات از فایل اکسل یا CSV' : 'Import Financial Records'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'fa' 
                  ? 'نوع داده خود را انتخاب کرده و فایل حاوی اطلاعات را آپلود کنید تا به طور خودکار به بودجه شما اضافه شود.' 
                  : 'Select your import category and upload your spreadsheet to load your finances automatically.'}
              </p>
            </div>

            {/* Type Selector (Transaction vs Investment) */}
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => {
                  setImportType('transaction');
                  setImportFeedback({ type: null, message: '' });
                }}
                className={`py-2 px-3 text-xs font-black rounded-lg transition-all text-center cursor-pointer ${
                  importType === 'transaction' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'تراکنش‌ها (درآمد و هزینه)' : 'Transactions'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setImportType('investment');
                  setImportFeedback({ type: null, message: '' });
                }}
                className={`py-2 px-3 text-xs font-black rounded-lg transition-all text-center cursor-pointer ${
                  importType === 'investment' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'fa' ? 'سرمایه‌گذاری‌ها' : 'Investments'}
              </button>
            </div>

            {/* Template Section */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-right w-full">
                <h4 className="text-xs font-black text-indigo-300">
                  {language === 'fa' ? 'قالب نمونه بهینه شده' : 'Download Sample Template'}
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {language === 'fa' 
                    ? 'برای قرارگیری درست ستون‌ها، فایل الگو را دانلود کرده و مقادیر خود را بر اساس آن جایگذاری کنید.' 
                    : 'Download our pre-structured Excel template for seamless automatic mapping.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={importType === 'transaction' ? handleDownloadBudgetTxTemplate : handleDownloadBudgetInvTemplate}
                className="w-full md:w-auto shrink-0 py-2 px-3 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>{language === 'fa' ? 'دانلود قالب' : 'Template .xlsx'}</span>
              </button>
            </div>

            {/* Supported headers information */}
            <div className="space-y-1.5 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'fa' ? '📌 سرستون‌های قابل شناسایی:' : '📌 Recognized Columns:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[9px] font-mono text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                {importType === 'transaction' ? (
                  <>
                    <span className="bg-slate-800/50 p-1 rounded text-center">date | تاریخ</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">title | عنوان</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">amount | مبلغ</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">type | نوع (expense/income)</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center col-span-2 sm:col-span-1">description | توضیحات</span>
                  </>
                ) : (
                  <>
                    <span className="bg-slate-800/50 p-1 rounded text-center">date | تاریخ</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">type | نوع سرمایه</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">amount | مقدار / تعداد</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">totalPrice | قیمت خرید کل</span>
                    <span className="bg-slate-800/50 p-1 rounded text-center">currency | ارز</span>
                  </>
                )}
              </div>
            </div>

            {/* Drag & drop/click Upload target */}
            <div className="relative border-2 border-dashed border-white/10 hover:border-indigo-500/30 transition-all rounded-xl p-6 bg-white/5 flex flex-col items-center justify-center group cursor-pointer min-h-32">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleImportBudgetFile}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors mb-2" />
              <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">
                {language === 'fa' ? 'انتخاب یا رها کردن فایل اکسل/CSV' : 'Drag & Drop or Click to Upload'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                XLSX, XLS, CSV
              </span>
            </div>

            {/* Feedback message card */}
            {importFeedback.type && (
              <div className={`p-3.5 rounded-xl text-xs font-bold text-right border ${
                importFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <p className="leading-relaxed">{importFeedback.message}</p>
              </div>
            )}

            {/* Confirmation actions buttons */}
            <div className="flex gap-3 pt-2 text-xs font-bold">
              <button 
                type="button"
                onClick={handleConfirmBudgetImport}
                disabled={
                  importFeedback.type !== 'success' || 
                  (importType === 'transaction' && (!importFeedback.transactions || importFeedback.transactions.length === 0)) ||
                  (importType === 'investment' && (!importFeedback.investments || importFeedback.investments.length === 0))
                }
                className={`flex-1 py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  importFeedback.type === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/25'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'fa' ? 'تایید و افزودن به برنامه مالی' : 'Confirm & Save'}</span>
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFeedback({ type: null, message: '' });
                }}
                className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition cursor-pointer"
              >
                {language === 'fa' ? 'انصراف' : 'Cancel'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION OVERLAY POPUP */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#120826] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-pop">
            <h3 className="text-base font-black text-rose-500 flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{confirmHeader}</span>
            </h3>
            <p className="text-xs text-indigo-200/70 leading-relaxed">{confirmMsg}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  if (confirmCallback) confirmCallback.fn();
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs transition-all shadow-lg"
              >
                {trans.confirmYes}
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmCallback(null);
                }}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs transition-all"
              >
                {trans.confirmNo}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION ALERT POPUP */}
      {alertOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#120826] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-pop">
            <h3 className="text-base font-black text-cyan-400 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>{alertHeader}</span>
            </h3>
            <p className="text-xs text-indigo-200/70 leading-relaxed">{alertMsg}</p>
            <button
              onClick={() => setAlertOpen(false)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black rounded-xl text-xs transition-all shadow-lg"
            >
              {trans.alertClose}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
