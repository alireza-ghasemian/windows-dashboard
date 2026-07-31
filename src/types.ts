export type AppView = 'dashboard' | 'budget' | 'countdown' | 'habits' | 'notes' | 'trading' | 'study' | 'settings' | 'reminders' | 'fitness';

export type Language = 'fa' | 'en' | 'de';

export type CurrencyCode = 'IRT' | 'USD' | 'EUR';

export interface FitnessProfile {
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  waist?: number;
  arm?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  targetWeight: number;
  goalType: 'lose' | 'gain' | 'maintain';
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
}

export interface LoggedFood {
  id: string;
  name: string;
  amount: number; // quantity in chosen unit
  unit: 'gram' | 'glass' | 'spoon' | 'palm'; // گرم، لیوان، قاشق، کف دست
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyFitnessLog {
  date: string;
  caloriesConsumed: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // glass count
  sleep: number; // hours
  workouts: Workout[];
  foods?: LoggedFood[];
}

export interface BodyMeasurementLog {
  date: string;
  weight: number;
  waist?: number;
  arm?: number;
}

export interface Suggestion {
  id: string;
  text: string;
  type: 'expense' | 'income' | 'investment';
  useCount: number;
  lastUsedAt?: string; // ISO String
  price?: number; // Optional custom price/value for the asset
  priceCurrency?: 'IRT' | 'USD' | 'EUR'; // Currency of the unit price (defaults to IRT)
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface Investment {
  id: string;
  type: string; // e.g., Gold, Stocks, Real Estate
  amount: number; // quantity
  totalPrice: number; // purchase value / cost
  currency: CurrencyCode; // currency code
  date: string; // purchase date
}

export interface MonthlyArchive {
  key: string; // YYYY-MM
  calendar: 'shamsi' | 'miladi';
  year: number;
  month: number;
  budget: number;
  incomes: Transaction[];
  expenses: Transaction[];
  investments?: Investment[];
  closed: boolean;
  currency: CurrencyCode;
}

export interface MonthData {
  calendar: 'shamsi' | 'miladi';
  year: number;
  month: number;
  budget: number;
  incomes: Transaction[];
  expenses: Transaction[];
  investments?: Investment[];
  closed: boolean;
  currency: CurrencyCode;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  streak: number;
  history: { [date: string]: boolean }; // date: YYYY-MM-DD
  pinned?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  pinned?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  recurrence: 'once' | 'every_day' | 'every_other_day';
  pinned?: boolean;
  calendar?: 'miladi' | 'shamsi';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO String
  read: boolean;
  type: 'reminder' | 'countdown_start' | 'countdown_end' | 'study_start' | 'info';
}

export interface Trade {
  id: string;
  date: string;
  time?: string;
  asset: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice: number;
  riskPercentage: number;
  positionSize: number;
  netPnL: number;
  R_Multiple: number;
  setupType: string;
  psychologicalState: string;
  disciplineRating: number;
  screenshots: string[];
  notes?: string;
  leverage?: number;
}

export interface StudyTask {
  id: string;
  subject: string;
  duration: number; // in minutes
  completed: boolean;
  date: string;
  notes?: string;
}
