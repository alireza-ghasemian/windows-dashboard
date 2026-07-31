import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  Flame, 
  Droplet, 
  Moon, 
  Dumbbell, 
  Scale, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingDown,
  Info,
  Lock,
  Unlock,
  Edit2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  X,
  Download,
  Upload
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Language, FitnessProfile, DailyFitnessLog, BodyMeasurementLog, Workout, LoggedFood } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FitnessTrackerProps {
  language: Language;
}

const TRANSLATIONS = {
  fa: {
    title: "سامانه سلامت، تناسب اندام و تغذیه",
    subtitle: "محاسبه انرژی روزانه • ثبت تغذیه و تمرین • پایش روند تغییرات بدنی",
    profileTitle: "پروفایل کاربری و محاسبات علمی",
    gender: "جنسیت",
    male: "مرد",
    female: "زن",
    age: "سن (سال)",
    height: "قد (سانتی‌متر)",
    weight: "وزن (کیلوگرم)",
    waist: "دور کمر (سانتی‌متر)",
    arm: "دور بازو (سانتی‌متر)",
    activityLevel: "سطح فعالیت بدنی",
    targetWeight: "وزن هدف (کیلوگرم)",
    goalType: "نوع هدف بدنی",
    saveProfile: "ذخیره و محاسبه مجدد شاخص‌ها",
    bmr: "متابولیسم پایه (BMR)",
    tdee: "انرژی مصرفی روزانه (TDEE)",
    recommendedCalories: "کالری پیشنهادی روزانه",
    macrosTitle: "تفکیک مکرومغذی‌های پیشنهادی",
    protein: "پروتئین",
    carbs: "کربوهیدرات",
    fat: "چربی",
    grams: "گرم",
    calories: "کالری",
    activityLevels: {
      sedentary: "بدون تحرک (بیشتر روز نشسته، بدون ورزش)",
      light: "فعالیت کم (ورزش سبک ۱ تا ۳ روز در هفته)",
      moderate: "فعالیت متوسط (ورزش متوسط ۳ تا ۵ روز در هفته)",
      very_active: "بسیار فعال (تمرینات سنگین ۶ تا ۷ روز در هفته)"
    },
    goalTypes: {
      lose: "کاهش چربی و وزن",
      gain: "افزایش حجم عضلانی",
      maintain: "تثبیت وزن و سلامت عمومی"
    },
    dailyLogTitle: "ثبت روزانه تغذیه، آب و خواب",
    quickAddTitle: "ثبت سریع میانبر",
    waterTitle: "میزان آب مصرفی",
    sleepTitle: "ساعت خواب دیشب",
    workoutTitle: "ورزش و فعالیت‌های امروز",
    addExercise: "افزودن ورزش جدید",
    exerciseName: "نام ورزش / حرکت",
    durationMin: "مدت زمان (دقیقه)",
    burnedCalories: "کالری سوخته شده (تخمینی)",
    addFood: "افزودن غذا / کالری مصرفی",
    foodPlaceholder: "مثلا: سینه مرغ، برنج، شیک...",
    logSuccess: "با موفقیت ثبت شد!",
    weeklyWeightTitle: "ثبت هفتگی وزن و اندازه بدنی",
    weekendPrompt: "⚖️ آخر هفته است! زمان ثبت و پایش وزن هفتگی و اندازه‌های دور کمر و بازو فرا رسیده است.",
    smartWarningTitle: "هشدار علمی نرخ کاهش وزن",
    smartWarningText: "کاهش وزن شما بیش از ۱ کیلوگرم در این هفته بوده است. از نظر علمی کاهش بین ۰.۵ تا ۱ کیلوگرم در هفته برای جلوگیری از کاهش حجم عضلانی و افت متابولیسم ایمن‌تر و پایدارتر است.",
    chartsTitle: "نمودارها و تحلیل روندهای بدنی",
    timeRange: "بازه زمانی",
    days30: "۳۰ روز اخیر",
    days90: "۹۰ روز اخیر",
    allTime: "کل دوره",
    customizeCharts: "شخصی‌سازی نمایش خطوط نمودارها",
    showWeight: "نمایش خط وزن واقعی",
    showTarget: "نمایش خط وزن هدف",
    showWaist: "نمایش دور کمر",
    showArm: "نمایش دور بازو",
    showIntake: "نمایش کالری دریافتی",
    showBurned: "نمایش کالری سوخته",
    colorCustomization: "انتخاب تم رنگ خطوط",
    caloriesConsumedLabel: "کالری دریافتی (غذا)",
    caloriesBurnedLabel: "کالری مصرف شده (TDEE + ورزش)",
    waterGlasses: "لیوان",
    sleepHours: "ساعت",
    noDataYet: "هنوز اطلاعاتی برای این بازه ثبت نشده است. ثبت سریع را امتحان کنید!",
    clearLogsPrompt: "سیستم به صورت خودکار داده‌های ثبت روزانه قدیمی‌تر از ۳۰ روز را پاکسازی کرد تا فضای ذخیره‌سازی محلی بهینه بماند (وزن و اهداف حفظ شده‌اند).",
    waterGoal: "هدف آب روزانه (۸ لیوان)"
  },
  en: {
    title: "Fitness & Nutrition Tracker",
    subtitle: "Daily Calorie Budgeting • Macro Tracking • Body Measurement Analytics",
    profileTitle: "User Profile & Calculations",
    gender: "Gender",
    male: "Male",
    female: "Female",
    age: "Age (Years)",
    height: "Height (cm)",
    weight: "Weight (kg)",
    waist: "Waist Circumference (cm)",
    arm: "Arm Circumference (cm)",
    activityLevel: "Activity Level",
    targetWeight: "Target Weight (kg)",
    goalType: "Goal Type",
    saveProfile: "Save Profile & Calculate",
    bmr: "Basal Metabolic Rate (BMR)",
    tdee: "Daily Energy Expenditure (TDEE)",
    recommendedCalories: "Recommended Daily Calories",
    macrosTitle: "Recommended Macronutrients Breakdown",
    protein: "Protein",
    carbs: "Carbohydrates",
    fat: "Fats",
    grams: "g",
    calories: "kcal",
    activityLevels: {
      sedentary: "Sedentary (Mostly sitting, little to no exercise)",
      light: "Lightly Active (Light exercise/sports 1-3 days/week)",
      moderate: "Moderately Active (Moderate exercise/sports 3-5 days/week)",
      very_active: "Very Active (Hard exercise/sports 6-7 days/week)"
    },
    goalTypes: {
      lose: "Lose Body Fat",
      gain: "Gain Muscle Mass",
      maintain: "Maintain & General Fitness"
    },
    dailyLogTitle: "Daily Nutrition, Hydration & Sleep",
    quickAddTitle: "Quick Shortcuts Log",
    waterTitle: "Water Intake",
    sleepTitle: "Sleep Duration",
    workoutTitle: "Workouts & Exercises",
    addExercise: "Add New Workout",
    exerciseName: "Exercise Name",
    durationMin: "Duration (minutes)",
    burnedCalories: "Estimated Burned Calories",
    addFood: "Add Food / Meal",
    foodPlaceholder: "e.g., Chicken breast, brown rice...",
    logSuccess: "Logged successfully!",
    weeklyWeightTitle: "Weight & Measurements Tracking",
    weekendPrompt: "⚖️ It's the weekend! Time to check and log your weight & body measurement statistics.",
    smartWarningTitle: "Scientific Weight Loss Warning",
    smartWarningText: "Your weight loss is over 1kg (2.2 lbs) this week. Scientifically, losing 0.5kg - 1.0kg per week is safer to preserve lean muscle mass and prevent metabolic adaptation.",
    chartsTitle: "Body Analytics & Dynamic Charts",
    timeRange: "Timeframe",
    days30: "30 Days",
    days90: "90 Days",
    allTime: "All Time",
    customizeCharts: "Customize Chart Line Visibility",
    showWeight: "Show Actual Weight Line",
    showTarget: "Show Target Weight Line",
    showWaist: "Show Waist Line",
    showArm: "Show Arm Line",
    showIntake: "Show Calorie Intake",
    showBurned: "Show Burned Energy",
    colorCustomization: "Change Line Theme Colors",
    caloriesConsumedLabel: "Calories Intake (Food)",
    caloriesBurnedLabel: "Calories Expended (TDEE + Workouts)",
    waterGlasses: "Glasses",
    sleepHours: "Hours",
    noDataYet: "No log records found for this timeframe. Log your parameters below!",
    clearLogsPrompt: "System has cleaned up daily logs older than 30 days automatically (goals and measurement history are safely preserved).",
    waterGoal: "Daily Water Target (8 Glasses)"
  },
  de: {
    title: "Fitness- & Ernährungs-Tracker",
    subtitle: "Tägliches Kalorienbudget • Makronährstoffe • Körperanalyse-Visualisierung",
    profileTitle: "Benutzerprofil & Wissenschaftliche Berechnungen",
    gender: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    age: "Alter (Jahre)",
    height: "Größe (cm)",
    weight: "Gewicht (kg)",
    waist: "Taillenumfang (cm)",
    arm: "Armumfang (cm)",
    activityLevel: "Aktivitätsniveau",
    targetWeight: "Zielgewicht (kg)",
    goalType: "Zielart",
    saveProfile: "Profil speichern & Berechnen",
    bmr: "Grundumsatz (BMR)",
    tdee: "Täglicher Gesamtenergiebedarf (TDEE)",
    recommendedCalories: "Empfohlene tägliche Kalorien",
    macrosTitle: "Empfohlene Makronährstoff-Aufteilung",
    protein: "Protein",
    carbs: "Kohlenhydrate",
    fat: "Fett",
    grams: "g",
    calories: "kcal",
    activityLevels: {
      sedentary: "Sedentär (Überwiegend sitzend, fast kein Training)",
      light: "Leicht aktiv (Leichtes Training 1-3 Tage/Woche)",
      moderate: "Mäßig aktiv (Mäßiges Training 3-5 Tage/Woche)",
      very_active: "Sehr aktiv (Hartes Training 6-7 Tage/Woche)"
    },
    goalTypes: {
      lose: "Körperfett abbauen",
      gain: "Muskelmasse aufbauen",
      maintain: "Gewicht halten & Fitness"
    },
    dailyLogTitle: "Tägliche Ernährung, Wasser & Schlaf",
    quickAddTitle: "Schnelle Abkürzungen",
    waterTitle: "Wasseraufnahme",
    sleepTitle: "Schlafdauer",
    workoutTitle: "Workouts & Sportübungen",
    addExercise: "Neue Übung hinzufügen",
    exerciseName: "Übungsname",
    durationMin: "Dauer (Minuten)",
    burnedCalories: "Geschätzte verbrannte Kalorien",
    addFood: "Lebensmittel hinzufügen",
    foodPlaceholder: "z.B. Hühnerbrust, Reis, Shake...",
    logSuccess: "Erfolgreich eingetragen!",
    weeklyWeightTitle: "Wöchentliche Gewichts- & Maßerfassung",
    weekendPrompt: "⚖️ Es ist Wochenende! Zeit, Ihr Gewicht und Ihre Körpermaße (Taille & Arm) einzutragen.",
    smartWarningTitle: "Wissenschaftlicher Warnhinweis",
    smartWarningText: "Ihr Gewichtsverlust beträgt in dieser Woche mehr als 1 kg. Wissenschaftlich gesehen ist ein Verlust von 0,5 kg bis 1,0 kg pro Woche sicherer, um Muskelmasse zu erhalten.",
    chartsTitle: "Körperanalyse & Dynamische Diagramme",
    timeRange: "Zeitrahmen",
    days30: "30 Tage",
    days90: "90 Tage",
    allTime: "Gesamter Zeitraum",
    customizeCharts: "Diagrammlinien-Sichtbarkeit anpassen",
    showWeight: "Gewichtslinie anzeigen",
    showTarget: "Zielgewichtslinie anzeigen",
    showWaist: "Taillenlinie anzeigen",
    showArm: "Armlinie anzeigen",
    showIntake: "Kalorienaufnahme anzeigen",
    showBurned: "Kalorienverbrauch anzeigen",
    colorCustomization: "Linienfarben ändern",
    caloriesConsumedLabel: "Kalorienzufuhr (Essen)",
    caloriesBurnedLabel: "Energieverbrauch (TDEE + Sport)",
    waterGlasses: "Gläser",
    sleepHours: "Stunden",
    noDataYet: "Keine Protokolle für diesen Zeitraum gefunden. Tragen Sie Ihre Werte unten ein!",
    clearLogsPrompt: "Das System hat tägliche Protokolle, die älter als 30 Tage sind, automatisch bereinigt (Ziele und Messwerte wurden sicher aufbewahrt).",
    waterGoal: "Tägliches Wasserziel (8 Gläser)"
  }
};

const DEFAULT_PROFILE: FitnessProfile = {
  height: 175,
  weight: 70,
  age: 25,
  gender: 'male',
  waist: 80,
  arm: 32,
  activityLevel: 'moderate',
  targetWeight: 68,
  goalType: 'lose'
};

const FOOD_PRESETS = [
  { name: 'Apple / سیب / Apfel', kcal: 80, p: 0.5, c: 20, f: 0.2 },
  { name: 'Chicken Breast / سینه مرغ / Hühnerbrust (150g)', kcal: 250, p: 46, c: 0, f: 5 },
  { name: 'White Rice / برنج پخته / Weißer Reis (150g)', kcal: 200, p: 4, c: 44, f: 0.5 },
  { name: 'Protein Shake / شیک پروتئین / Eiweißshake', kcal: 150, p: 25, c: 5, f: 2 },
  { name: 'Egg / تخم‌مرغ / Ei (x2)', kcal: 140, p: 12, c: 1, f: 10 },
  { name: 'Oatmeal / جو دوسر / Haferflocken (100g)', kcal: 380, p: 13, c: 68, f: 7 }
];

const WORKOUT_PRESETS = [
  { name: 'Running / دویدن / Laufen', kcalPerMin: 10 },
  { name: 'Weightlifting / بدنسازی / Krafttraining', kcalPerMin: 6 },
  { name: 'Cycling / دوچرخه‌سواری / Radfahren', kcalPerMin: 8 },
  { name: 'Walking / پیاده‌روی / Gehen', kcalPerMin: 3.5 },
  { name: 'Swimming / شنا / Schwimmen', kcalPerMin: 9 }
];

export default function FitnessTracker({ language }: FitnessTrackerProps) {
  const trans = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'fa';

  // 1. States for user data
  const [profile, setProfile] = useState<FitnessProfile>(() => {
    const saved = localStorage.getItem('fitness_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyFitnessLog[]>(() => {
    const saved = localStorage.getItem('fitness_daily_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [measurementLogs, setMeasurementLogs] = useState<BodyMeasurementLog[]>(() => {
    const saved = localStorage.getItem('fitness_measurement_logs');
    if (saved) return JSON.parse(saved);
    // Seed default first measurement from profile if empty
    const defaultLog: BodyMeasurementLog = {
      date: new Date().toISOString().split('T')[0],
      weight: DEFAULT_PROFILE.weight,
      waist: DEFAULT_PROFILE.waist,
      arm: DEFAULT_PROFILE.arm
    };
    return [defaultLog];
  });

  // Active dates
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Profile Lock State
  const [isProfileLocked, setIsProfileLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('fitness_profile_locked');
    return saved !== 'false'; // default to locked
  });

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/fitness');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            profile: serverProfile,
            dailyLogs: serverDailyLogs,
            measurementLogs: serverMeasurementLogs,
            profileLocked: serverProfileLocked,
          } = result.data;
          
          if (serverProfile) setProfile(serverProfile);
          if (serverDailyLogs) setDailyLogs(serverDailyLogs);
          if (serverMeasurementLogs) setMeasurementLogs(serverMeasurementLogs);
          if (serverProfileLocked !== undefined) setIsProfileLocked(serverProfileLocked);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load fitness tracker data from JSON file:", error);
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
        const response = await fetch('/api/fitness', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            dailyLogs,
            measurementLogs,
            profileLocked: isProfileLocked,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save fitness tracker data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [
    profile,
    dailyLogs,
    measurementLogs,
    isProfileLocked,
    isInitialLoaded,
  ]);

  const handleExportFitnessJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          profile,
          dailyLogs,
          measurementLogs,
          isProfileLocked
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fitness_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export fitness JSON:", error);
    }
  };

  const handleImportFitnessJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.profile || Array.isArray(parsed.dailyLogs))) {
          if (parsed.profile) setProfile(parsed.profile);
          if (Array.isArray(parsed.dailyLogs)) setDailyLogs(parsed.dailyLogs);
          if (Array.isArray(parsed.measurementLogs)) setMeasurementLogs(parsed.measurementLogs);
          if (parsed.isProfileLocked !== undefined) setIsProfileLocked(parsed.isProfileLocked);
          
          alert(isRtl ? "اطلاعات تناسب اندام با موفقیت از فایل JSON بازیابی شد!" : "Fitness tracker data successfully restored from JSON backup!");
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

  // Update localStorage whenever states change locally
  useEffect(() => {
    localStorage.setItem('fitness_profile_locked', isProfileLocked ? 'true' : 'false');
  }, [isProfileLocked]);

  // Food log new state
  const [customFoodUnit, setCustomFoodUnit] = useState<'gram' | 'glass' | 'spoon' | 'palm'>('gram');
  const [customFoodAmount, setCustomFoodAmount] = useState('100');
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // Custom Dropdown Open States
  const [genderOpen, setGenderOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [goalTypeOpen, setGoalTypeOpen] = useState(false);
  const [customUnitOpen, setCustomUnitOpen] = useState(false);

  // Close Day Report state
  const [closeDayReportOpen, setCloseDayReportOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<{
    score: number;
    title: string;
    description: string;
    tips: string[];
    analysis: { label: string; value: string; status: 'good' | 'warning' | 'info' }[];
  } | null>(null);

  // Profile Edit fields
  const [editHeight, setEditHeight] = useState(profile.height);
  const [editWeight, setEditWeight] = useState(profile.weight);
  const [editAge, setEditAge] = useState(profile.age);
  const [editGender, setEditGender] = useState(profile.gender);
  const [editWaist, setEditWaist] = useState(profile.waist);
  const [editArm, setEditArm] = useState(profile.arm);
  const [editActivity, setEditActivity] = useState(profile.activityLevel);
  const [editTargetWeight, setEditTargetWeight] = useState(profile.targetWeight);
  const [editGoalType, setEditGoalType] = useState(profile.goalType);

  // New Food custom input state
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodKcal, setCustomFoodKcal] = useState('');
  const [customFoodP, setCustomFoodP] = useState('');
  const [customFoodC, setCustomFoodC] = useState('');
  const [customFoodF, setCustomFoodF] = useState('');

  // New Exercise custom input state
  const [customExName, setCustomExName] = useState('');
  const [customExDuration, setCustomExDuration] = useState('30');
  const [customExBurned, setCustomExBurned] = useState('200');

  // Chart Customizer states
  const [timeframe, setTimeframe] = useState<'30' | '90' | 'all'>('30');
  const [lineVisibility, setLineVisibility] = useState({
    weight: true,
    target: true,
    waist: true,
    arm: true,
    intake: true,
    burned: true
  });
  
  const [chartTheme, setChartTheme] = useState({
    weight: '#22d3ee', // cyan
    target: '#a855f7', // purple
    waist: '#f59e0b', // amber
    arm: '#10b981', // emerald
    intake: '#3b82f6', // blue
    burned: '#ef4444' // red
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Perform Scientific Calculations
  // BMR: Mifflin-St Jeor Formula
  const calculateBmr = () => {
    const { weight, height, age, gender } = profile;
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const bmr = calculateBmr();

  // TDEE multipliers
  const getActivityMultiplier = (level: string) => {
    switch (level) {
      case 'sedentary': return 1.2;
      case 'light': return 1.375;
      case 'moderate': return 1.55;
      case 'very_active': return 1.725;
      default: return 1.2;
    }
  };

  const tdee = Math.round(bmr * getActivityMultiplier(profile.activityLevel));

  // Recommended Daily Calories based on Goal
  const getRecommendedCalories = () => {
    switch (profile.goalType) {
      case 'lose': return Math.max(1200, tdee - 500); // 500 kcal deficit (safe minimum 1200kcal)
      case 'gain': return tdee + 300; // 300 kcal surplus
      case 'maintain': return tdee;
      default: return tdee;
    }
  };

  const recommendedCalories = getRecommendedCalories();

  // BMI calculation
  const heightInMeters = profile.height / 100;
  const bmiValue = heightInMeters > 0 ? Number((profile.weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { 
      label: isRtl ? 'کم‌وزن' : (language === 'de' ? 'Untergewicht' : 'Underweight'), 
      color: 'text-sky-400', 
      bg: 'bg-sky-500', 
      desc: isRtl ? 'نیاز به رژیم افزایش وزن اصولی' : (language === 'de' ? 'Untergewicht' : 'Need systematic surplus') 
    };
    if (val < 25) return { 
      label: isRtl ? 'نرمال (سالم)' : (language === 'de' ? 'Normalgewicht' : 'Normal Weight'), 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500', 
      desc: isRtl ? 'محدوده کاملاً سالم و ایده‌آل' : (language === 'de' ? 'Gesunder Bereich' : 'Perfect healthy range') 
    };
    if (val < 30) return { 
      label: isRtl ? 'اضافه وزن' : (language === 'de' ? 'Übergewicht' : 'Overweight'), 
      color: 'text-amber-400', 
      bg: 'bg-amber-500', 
      desc: isRtl ? 'توصیه به فعالیت بیشتر و رژیم اصولی' : (language === 'de' ? 'Leichtes Übergewicht' : 'Mild surplus, active lifestyle recommended') 
    };
    return { 
      label: isRtl ? 'چاقی مفرط' : (language === 'de' ? 'چاقی مفرط' : 'Obese'), 
      color: 'text-rose-400', 
      bg: 'bg-rose-500', 
      desc: isRtl ? 'نیازمند اصلاح سبک زندگی و تغذیه' : (language === 'de' ? 'Erhebliche Fettleibigkeit' : 'Lifestyle modification recommended') 
    };
  };

  const bmiCat = getBmiCategory(bmiValue);

  // Macro Breakdown Grams
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const getRecommendedMacros = () => {
    let proteinPct = 0.30;
    let carbsPct = 0.40;
    let fatPct = 0.30;

    if (profile.goalType === 'gain') {
      carbsPct = 0.45;
      proteinPct = 0.30;
      fatPct = 0.25;
    } else if (profile.goalType === 'maintain') {
      carbsPct = 0.50;
      proteinPct = 0.20;
      fatPct = 0.30;
    }

    const proteinGrams = Math.round((recommendedCalories * proteinPct) / 4);
    const carbsGrams = Math.round((recommendedCalories * carbsPct) / 4);
    const fatGrams = Math.round((recommendedCalories * fatPct) / 9);

    return {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      proteinPct: Math.round(proteinPct * 100),
      carbsPct: Math.round(carbsPct * 100),
      fatPct: Math.round(fatPct * 100)
    };
  };

  const recommendedMacros = getRecommendedMacros();

  // 3. Auto Cleanup Daily Logs older than 30 days
  useEffect(() => {
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 30);

    const filtered = dailyLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= cutoffDate;
    });

    if (filtered.length !== dailyLogs.length) {
      setDailyLogs(filtered);
      localStorage.setItem('fitness_daily_logs', JSON.stringify(filtered));
      showToast(trans.clearLogsPrompt);
    }
  }, []);

  const addAppNotification = (title: string, message: string) => {
    const saved = localStorage.getItem('productivity_notifications');
    let notifs = [];
    if (saved) {
      try {
        notifs = JSON.parse(saved);
      } catch (e) {}
    }
    const newNotif = {
      id: `notif-fitness-${Date.now()}-${Math.random()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'fitness'
    };
    const updated = [newNotif, ...notifs];
    localStorage.setItem('productivity_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('sync-notifications'));
  };

  // 6:00 AM Daily Reminder check
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const triggerKey = `daily-fitness-morning-rem-${todayStr}`;
    const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
    if (!triggered[triggerKey]) {
      triggered[triggerKey] = true;
      localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

      const title = language === 'fa' 
        ? '⏰ شروع روز و ثبت سلامتی!' 
        : (language === 'de' ? '⏰ Tag starten & Fitness loggen!' : '⏰ Day Started! Log your health!');
      const msg = language === 'fa'
        ? 'ساعت ۶ صبح شده! روزت رو پرانرژی شروع کن و مقادیر سلامت، تغذیه و آب مصرفی خودت رو در طول روز وارد کن تا پایش دقیقی داشته باشی.'
        : (language === 'de' 
           ? 'Es ist 6 Uhr morgens! Starten Sie voller Energie und loggen Sie heute Ihre Ernährung, Wasser und Schlaf.'
           : 'It is 6:00 AM! Start your day energized and log your nutrition, water, and sleep throughout the day.');

      addAppNotification(title, msg);
    }
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 4. Save profile updates
  const handleSaveProfile = () => {
    const updated: FitnessProfile = {
      height: Number(editHeight),
      weight: Number(editWeight),
      age: Number(editAge),
      gender: editGender,
      waist: Number(editWaist),
      arm: Number(editArm),
      activityLevel: editActivity,
      targetWeight: Number(editTargetWeight),
      goalType: editGoalType
    };

    setProfile(updated);
    localStorage.setItem('fitness_profile', JSON.stringify(updated));

    // Also automatically log body measurement check-in for today if it matches
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = measurementLogs.some(m => m.date === todayStr);
    let updatedMeasurements = [...measurementLogs];

    if (exists) {
      updatedMeasurements = measurementLogs.map(m => m.date === todayStr ? {
        ...m,
        weight: Number(editWeight),
        waist: Number(editWaist),
        arm: Number(editArm)
      } : m);
    } else {
      updatedMeasurements.push({
        date: todayStr,
        weight: Number(editWeight),
        waist: Number(editWaist),
        arm: Number(editArm)
      });
    }

    setMeasurementLogs(updatedMeasurements);
    localStorage.setItem('fitness_measurement_logs', JSON.stringify(updatedMeasurements));

    showToast(trans.logSuccess);
  };

  // 5. Daily Logger actions
  const getOrCreateDayLog = (dateStr: string): DailyFitnessLog => {
    const found = dailyLogs.find(l => l.date === dateStr);
    if (found) {
      return {
        ...found,
        foods: found.foods || [],
        workouts: found.workouts || []
      };
    }

    return {
      date: dateStr,
      caloriesConsumed: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      sleep: 8,
      workouts: [],
      foods: []
    };
  };

  const saveDayLog = (updatedLog: DailyFitnessLog) => {
    let newLogs = [...dailyLogs];
    const idx = dailyLogs.findIndex(l => l.date === updatedLog.date);
    if (idx >= 0) {
      newLogs[idx] = updatedLog;
    } else {
      newLogs.push(updatedLog);
    }
    setDailyLogs(newLogs);
    localStorage.setItem('fitness_daily_logs', JSON.stringify(newLogs));

    // Exceeding recommended calories alarm
    if (updatedLog.caloriesConsumed > recommendedCalories) {
      const todayStr = new Date().toISOString().split('T')[0];
      const triggerKey = `cal-limit-exceeded-${todayStr}`;
      const triggered = JSON.parse(localStorage.getItem('productivity_triggered_events') || '{}');
      if (!triggered[triggerKey]) {
        triggered[triggerKey] = true;
        localStorage.setItem('productivity_triggered_events', JSON.stringify(triggered));

        const title = language === 'fa'
          ? '⚠️ هشدار تجاوز از حد کالری مصرفی!'
          : (language === 'de' ? '⚠️ Kalorienlimit überschritten!' : '⚠️ Calorie Limit Exceeded!');
        const msg = language === 'fa'
          ? `میزان کالری مصرفی امروز شما (${updatedLog.caloriesConsumed} ک‌کال) از کالری پیشنهادی روزانه (${recommendedCalories} ک‌کال) فراتر رفت.`
          : (language === 'de'
             ? `Ihre Kalorienaufnahme (${updatedLog.caloriesConsumed} kcal) hat das empfohlene Limit von ${recommendedCalories} kcal überschritten.`
             : `Your calorie intake (${updatedLog.caloriesConsumed} kcal) has exceeded your recommended budget of ${recommendedCalories} kcal.`);

        addAppNotification(title, msg);
      }
    }
  };

  const handleQuickAddFood = (preset: typeof FOOD_PRESETS[0]) => {
    const log = getOrCreateDayLog(selectedDate);
    const newFood: LoggedFood = {
      id: `food-${Date.now()}-${Math.random()}`,
      name: preset.name.split('/')[isRtl ? 1 : 0].trim(),
      amount: 1,
      unit: 'glass', // default
      calories: preset.kcal,
      protein: preset.p,
      carbs: preset.c,
      fat: preset.f
    };
    log.foods = log.foods || [];
    log.foods.push(newFood);
    
    // Recalculate totals
    log.caloriesConsumed = log.foods.reduce((sum, f) => sum + f.calories, 0);
    log.protein = log.foods.reduce((sum, f) => sum + f.protein, 0);
    log.carbs = log.foods.reduce((sum, f) => sum + f.carbs, 0);
    log.fat = log.foods.reduce((sum, f) => sum + f.fat, 0);

    saveDayLog(log);
    showToast(`${newFood.name} - ${trans.logSuccess}`);
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName) return;

    const amount = Number(customFoodAmount) || 1;
    const kcal = Number(customFoodKcal) || 0;
    const p = Number(customFoodP) || 0;
    const c = Number(customFoodC) || 0;
    const f = Number(customFoodF) || 0;

    const log = getOrCreateDayLog(selectedDate);
    log.foods = log.foods || [];

    if (editingFoodId) {
      log.foods = log.foods.map(item => item.id === editingFoodId ? {
        ...item,
        name: customFoodName,
        amount,
        unit: customFoodUnit,
        calories: kcal,
        protein: p,
        carbs: c,
        fat: f
      } : item);
      setEditingFoodId(null);
    } else {
      const newFood: LoggedFood = {
        id: `food-${Date.now()}-${Math.random()}`,
        name: customFoodName,
        amount,
        unit: customFoodUnit,
        calories: kcal,
        protein: p,
        carbs: c,
        fat: f
      };
      log.foods.push(newFood);
    }

    // Recalculate totals
    log.caloriesConsumed = log.foods.reduce((sum, f) => sum + f.calories, 0);
    log.protein = log.foods.reduce((sum, f) => sum + f.protein, 0);
    log.carbs = log.foods.reduce((sum, f) => sum + f.carbs, 0);
    log.fat = log.foods.reduce((sum, f) => sum + f.fat, 0);

    saveDayLog(log);

    setCustomFoodName('');
    setCustomFoodKcal('');
    setCustomFoodP('');
    setCustomFoodC('');
    setCustomFoodF('');
    setCustomFoodAmount('100');
    setCustomFoodUnit('gram');
    showToast(trans.logSuccess);
  };

  const handleDeleteFood = (foodId: string) => {
    const log = getOrCreateDayLog(selectedDate);
    log.foods = log.foods?.filter(f => f.id !== foodId) || [];

    // Recalculate totals
    log.caloriesConsumed = log.foods.reduce((sum, f) => sum + f.calories, 0);
    log.protein = log.foods.reduce((sum, f) => sum + f.protein, 0);
    log.carbs = log.foods.reduce((sum, f) => sum + f.carbs, 0);
    log.fat = log.foods.reduce((sum, f) => sum + f.fat, 0);

    saveDayLog(log);
    showToast(trans.logSuccess);
  };

  const handleStartEditFood = (food: LoggedFood) => {
    setEditingFoodId(food.id);
    setCustomFoodName(food.name);
    setCustomFoodKcal(String(food.calories));
    setCustomFoodP(String(food.protein));
    setCustomFoodC(String(food.carbs));
    setCustomFoodF(String(food.fat));
    setCustomFoodAmount(String(food.amount));
    setCustomFoodUnit(food.unit);
  };

  const handleWaterClick = (change: number) => {
    const log = getOrCreateDayLog(selectedDate);
    log.water = Math.max(0, log.water + change);
    saveDayLog(log);
  };

  const handleSleepChange = (hours: number) => {
    const log = getOrCreateDayLog(selectedDate);
    log.sleep = hours;
    saveDayLog(log);
  };

  const handleQuickAddWorkout = (preset: typeof WORKOUT_PRESETS[0], duration: number) => {
    const log = getOrCreateDayLog(selectedDate);
    const kcal = Math.round(preset.kcalPerMin * duration);

    const newWorkout: Workout = {
      id: `workout-${Date.now()}-${Math.random()}`,
      name: preset.name,
      duration,
      caloriesBurned: kcal
    };

    log.workouts.push(newWorkout);
    saveDayLog(log);
    showToast(`${preset.name} (${duration}m) - ${trans.logSuccess}`);
  };

  const handleAddCustomWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName) return;

    const duration = Number(customExDuration) || 0;
    const burned = Number(customExBurned) || 0;

    const log = getOrCreateDayLog(selectedDate);
    log.workouts = log.workouts || [];

    if (editingWorkoutId) {
      log.workouts = log.workouts.map(w => w.id === editingWorkoutId ? {
        ...w,
        name: customExName,
        duration,
        caloriesBurned: burned
      } : w);
      setEditingWorkoutId(null);
    } else {
      const newWorkout: Workout = {
        id: `workout-${Date.now()}-${Math.random()}`,
        name: customExName,
        duration,
        caloriesBurned: burned
      };
      log.workouts.push(newWorkout);
    }
    
    saveDayLog(log);

    setCustomExName('');
    setCustomExDuration('30');
    setCustomExBurned('200');
    showToast(trans.logSuccess);
  };

  const handleStartEditWorkout = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setCustomExName(workout.name);
    setCustomExDuration(String(workout.duration));
    setCustomExBurned(String(workout.caloriesBurned));
  };

  const handleDeleteWorkout = (id: string) => {
    const log = getOrCreateDayLog(selectedDate);
    log.workouts = log.workouts.filter(w => w.id !== id);
    saveDayLog(log);
  };

  // 6. Manual Check-in for Measurements (Weekly weight)
  const handleManualMeasurementCheckin = (weightVal: number, waistVal: number, armVal: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const exists = measurementLogs.some(m => m.date === todayStr);
    let updated = [...measurementLogs];

    if (exists) {
      updated = measurementLogs.map(m => m.date === todayStr ? {
        ...m,
        weight: weightVal,
        waist: waistVal,
        arm: armVal
      } : m);
    } else {
      updated.push({
        date: todayStr,
        weight: weightVal,
        waist: waistVal,
        arm: armVal
      });
    }

    setMeasurementLogs(updated);
    localStorage.setItem('fitness_measurement_logs', JSON.stringify(updated));

    // Update main profile values too
    const updatedProfile = {
      ...profile,
      weight: weightVal,
      waist: waistVal,
      arm: armVal
    };
    setProfile(updatedProfile);
    localStorage.setItem('fitness_profile', JSON.stringify(updatedProfile));

    setEditWeight(weightVal);
    setEditWaist(waistVal);
    setEditArm(armVal);

    showToast(trans.logSuccess);
  };

  const handleCloseDayAndGenerateReport = () => {
    const log = getOrCreateDayLog(selectedDate);
    
    let score = 100;
    const analysis: { label: string; value: string; status: 'good' | 'warning' | 'info' }[] = [];
    const tips: string[] = [];

    // 1. Sleep Analysis
    const sleep = log.sleep || 8;
    if (sleep >= 7 && sleep <= 9) {
      analysis.push({
        label: isRtl ? 'میزان خواب شبانه' : 'Sleep Duration',
        value: isRtl ? `کافی و عالی (${sleep} ساعت)` : `Perfect & Healthy (${sleep} hrs)`,
        status: 'good'
      });
    } else if (sleep < 7) {
      score -= 15;
      analysis.push({
        label: isRtl ? 'میزان خواب شبانه' : 'Sleep Duration',
        value: isRtl ? `کمبود خواب شدید (${sleep} ساعت)` : `Short Sleep (${sleep} hrs)`,
        status: 'warning'
      });
      tips.push(isRtl 
        ? 'کمبود خواب باعث کاهش متابولیسم و افزایش هورمون کورتیزول می‌شود. امشب حداقل ۷.۵ ساعت بخوابید.'
        : 'Lack of sleep impairs fat loss & recovery. Aim for at least 7.5 hours tonight.');
    } else {
      analysis.push({
        label: isRtl ? 'میزان خواب شبانه' : 'Sleep Duration',
        value: isRtl ? `خواب زیاد (${sleep} ساعت)` : `Slightly excessive (${sleep} hrs)`,
        status: 'info'
      });
    }

    // 2. Hydration Analysis
    const water = log.water || 0;
    if (water >= 8) {
      analysis.push({
        label: isRtl ? 'هیدراتاسیون (آب مصرفی)' : 'Water Hydration',
        value: isRtl ? `بسیار عالی (${water} لیوان)` : `Excellent Hydration (${water} glasses)`,
        status: 'good'
      });
    } else {
      const diff = 8 - water;
      score -= (diff * 5);
      analysis.push({
        label: isRtl ? 'هیدراتاسیون (آب مصرفی)' : 'Water Hydration',
        value: isRtl ? `ناکافی (${water} لیوان - کمبود ${diff} لیوان)` : `Inadequate (${water} glasses - missing ${diff})`,
        status: 'warning'
      });
      tips.push(isRtl 
        ? 'تامین آب کافی باعث سرعت هضم و کاهش ولع به شیرینی‌جات می‌شود. فردا یک بطری آب روی میز خود بگذارید.'
        : 'Water keeps your cellular metabolism high. Place a designated water bottle on your desk tomorrow.');
    }

    // 3. Calorie Budget Analysis
    const cConsumed = log.caloriesConsumed || 0;
    const cBurned = tdee + log.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    if (cConsumed === 0) {
      analysis.push({
        label: isRtl ? 'کالری دریافتی' : 'Calories Consumed',
        value: isRtl ? 'ثبت نشده!' : 'Not Logged!',
        status: 'warning'
      });
      tips.push(isRtl 
        ? 'فراموش نکنید که حتما تمام وعده‌ها و میان‌وعده‌های خود را ثبت کنید تا محاسبات دقیق باشد.'
        : 'Be sure to log every meal and beverage to ensure statistical accuracy.');
    } else if (cConsumed > recommendedCalories) {
      score -= 20;
      analysis.push({
        label: isRtl ? 'کالری دریافتی' : 'Calories Consumed',
        value: isRtl ? `بیشتر از حد مجاز (${cConsumed} از ${recommendedCalories})` : `Over Budget (${cConsumed}/${recommendedCalories} kcal)`,
        status: 'warning'
      });
      tips.push(isRtl 
        ? 'شما امروز بیشتر از حد مجاز کالری مصرف کرده‌اید. فردا روی غذاهای پرپروتئین و کم‌کالری تمرکز کنید تا جبران شود.'
        : 'Your calories exceeded recommendation. Emphasize high-volume, low-calorie foods tomorrow.');
    } else {
      analysis.push({
        label: isRtl ? 'بودجه کالری روزانه' : 'Daily Calorie Budget',
        value: isRtl ? `عالی و مهندسی شده (${cConsumed} از ${recommendedCalories})` : `Perfect Budgeting (${cConsumed}/${recommendedCalories} kcal)`,
        status: 'good'
      });
    }

    // 4. Macro Balance (Protein target)
    if (cConsumed > 0) {
      const pGrams = log.protein || 0;
      const targetProtein = recommendedMacros.protein;
      if (pGrams >= targetProtein * 0.8) {
        analysis.push({
          label: isRtl ? 'مصرف پروتئین روزانه' : 'Protein Goal',
          value: isRtl ? `بسیار عالی (${Math.round(pGrams)}g)` : `Adequate & Strong (${Math.round(pGrams)}g)`,
          status: 'good'
        });
      } else {
        score -= 10;
        analysis.push({
          label: isRtl ? 'مصرف پروتئین روزانه' : 'Protein Goal',
          value: isRtl ? `کمتر از هدف (${Math.round(pGrams)}g از ${targetProtein}g)` : `Low Protein (${Math.round(pGrams)}g/${targetProtein}g)`,
          status: 'warning'
        });
        tips.push(isRtl 
          ? `برای حفظ و ساخت عضلات، مصرف پروتئین بسیار حیاتی است. تخم‌مرغ، مرغ، فیله یا لبنیات بیشتری مصرف کنید.`
          : `Protein prevents muscle breakdown. Try incorporating eggs, chicken breasts, or low-fat dairy tomorrow.`);
      }
    }

    // 5. Workouts check
    if (log.workouts.length > 0) {
      analysis.push({
        label: isRtl ? 'فعالیت بدنی و ورزش' : 'Physical Workouts',
        value: isRtl ? `فعال و پرانرژی (${log.workouts.length} تمرین)` : `Active & Energetic (${log.workouts.length} exercise)`,
        status: 'good'
      });
    } else {
      analysis.push({
        label: isRtl ? 'فعالیت بدنی و ورزش' : 'Physical Workouts',
        value: isRtl ? 'بدون ورزش امروز' : 'No workout sessions today',
        status: 'info'
      });
      tips.push(isRtl 
        ? 'حتی ۱۰ دقیقه پیاده‌روی سریع هم متابولیسم شما را ارتقا می‌دهد. فردا یک حرکت کوچک انجام دهید!'
        : 'Even a 15-minute brisk walk boosts recovery & insulin sensitivity. Try setting a reminder for tomorrow!');
    }

    // Default tips if none generated
    if (tips.length === 0) {
      tips.push(
        isRtl ? 'برنامه شما کاملاً بی‌نقص بود! همین روند فوق‌العاده را فردا هم ادامه دهید.' : 'Your day was absolutely flawless! Maintain this spectacular momentum tomorrow.',
        isRtl ? 'نوشیدن آب را اول صبح شروع کنید تا انرژی سلولی شما افزایش یابد.' : 'Start tomorrow morning with a tall glass of water to refresh cellular hydration.',
        isRtl ? 'سعی کنید همواره راس یک ساعت مشخص بخوابید تا ریتم شبانه‌روزی منظمی داشته باشید.' : 'Maintain a consistent sleeping schedule to synchronize your circadian rhythm.'
      );
    }

    score = Math.max(20, Math.min(100, score));

    let title = "";
    let description = "";

    if (score >= 90) {
      title = isRtl ? '🏆 عملکرد افسانه‌ای و بی‌نقص!' : '🏆 Legendary Flawless Performance!';
      description = isRtl 
        ? 'شما امروز قهرمان تناسب اندام خود بودید! تمام شاخص‌ها در بالاترین استاندارد علمی قرار دارد.' 
        : 'You absolutely crushed your health goals today! Everything conforms to top scientific standards.';
    } else if (score >= 70) {
      title = isRtl ? '💪 عملکرد خوب و روبه‌رشد' : '💪 Good Solid Effort';
      description = isRtl 
        ? 'بسیار خوب عمل کردید. چند تنظیم کوچک در خواب یا هیدراتاسیون می‌تواند شما را عالی‌تر کند.' 
        : 'A very respectable day. A few minor tweaks to sleep or water will put you in the elite zone.';
    } else {
      title = isRtl ? '⚠️ نیاز به توجه و مراقبت بیشتر' : '⚠️ Attention & Self-Care Needed';
      description = isRtl 
        ? 'امروز کمی از مسیر خارج شدید اما جای نگرانی نیست! فردا یک فرصت جدید برای جبران و بازگشت پرقدرت است.' 
        : 'You drifted slightly off-course today, but every sunrise offers a fresh start. Leverage the tips below!';
    }

    setGeneratedReport({ score, title, description, tips, analysis });
    setCloseDayReportOpen(true);
  };

  // Is it weekend?
  const isWeekend = () => {
    const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
  };

  // Smart Warning Engine
  // Find weekly loss. Compare latest weight with the weight of ~7 days ago.
  const getWeeklyWeightLossWarning = () => {
    if (measurementLogs.length < 2) return false;
    
    // Sort logs chronologically
    const sorted = [...measurementLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    
    // Find a log closest to 7 days before latest
    const latestDate = new Date(latest.date);
    const targetDate = new Date(latestDate);
    targetDate.setDate(latestDate.getDate() - 7);

    // Look for any log in the range of 5-9 days before
    const previousLog = sorted.find(m => {
      const d = new Date(m.date);
      const diffDays = Math.abs(latestDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 5 && diffDays <= 10;
    });

    if (previousLog) {
      const loss = previousLog.weight - latest.weight;
      // If losing fat and loss is more than 1kg
      if (loss > 1.0) {
        return true;
      }
    }
    return false;
  };

  const hasWeightLossWarning = getWeeklyWeightLossWarning();

  // 7. Graph Seeding & Filtering
  const getChartData = () => {
    // Generate daily logs & measurements aggregated chronology
    // Merge them by Date
    const allDatesSet = new Set<string>();
    dailyLogs.forEach(l => allDatesSet.add(l.date));
    measurementLogs.forEach(m => allDatesSet.add(m.date));

    const sortedDates = Array.from(allDatesSet).sort();
    
    let compiled = sortedDates.map(dStr => {
      const daily = dailyLogs.find(l => l.date === dStr);
      const measure = measurementLogs.find(m => m.date === dStr);

      // Workouts calorie calculation
      const workoutsCal = daily ? daily.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0) : 0;
      const totalBurned = tdee + workoutsCal;

      return {
        date: dStr,
        weight: measure ? measure.weight : null,
        targetWeight: profile.targetWeight,
        waist: measure ? measure.waist : null,
        arm: measure ? measure.arm : null,
        intake: daily ? daily.caloriesConsumed : 0,
        burned: totalBurned,
        water: daily ? daily.water : 0,
        sleep: daily ? daily.sleep : 0
      };
    });

    // Interpolate weight / measurements for clean graph lines if there are holes
    let lastKnownWeight = profile.weight;
    let lastKnownWaist = profile.waist;
    let lastKnownArm = profile.arm;

    compiled = compiled.map(item => {
      if (item.weight !== null) lastKnownWeight = item.weight;
      if (item.waist !== null) lastKnownWaist = item.waist;
      if (item.arm !== null) lastKnownArm = item.arm;

      return {
        ...item,
        weight: item.weight ?? lastKnownWeight,
        waist: item.waist ?? lastKnownWaist,
        arm: item.arm ?? lastKnownArm
      };
    });

    // Filter by timeframe
    const now = new Date();
    if (timeframe === '30') {
      const cut = new Date();
      cut.setDate(now.getDate() - 30);
      compiled = compiled.filter(item => new Date(item.date) >= cut);
    } else if (timeframe === '90') {
      const cut = new Date();
      cut.setDate(now.getDate() - 90);
      compiled = compiled.filter(item => new Date(item.date) >= cut);
    }

    return compiled;
  };

  const chartData = getChartData();

  // Active Day Log representation
  const activeLog = getOrCreateDayLog(selectedDate);
  const activeWorkoutsKcal = activeLog.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  // Calorie ring progress
  const adjustedRecommendedCalories = recommendedCalories + activeWorkoutsKcal;
  const caloriePct = Math.min(100, Math.round((activeLog.caloriesConsumed / Math.max(1, adjustedRecommendedCalories)) * 100));
  const proteinPctLog = Math.min(100, Math.round((activeLog.protein / Math.max(1, recommendedMacros.protein)) * 100));
  const carbsPctLog = Math.min(100, Math.round((activeLog.carbs / Math.max(1, recommendedMacros.carbs)) * 100));
  const fatPctLog = Math.min(100, Math.round((activeLog.fat / Math.max(1, recommendedMacros.fat)) * 100));
  const waterPctLog = Math.min(100, Math.round((activeLog.water / 8) * 100));

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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در fitness_data.json' : 'Saved to fitness_data.json'}>
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
    <section className="space-y-8 animate-fade-in relative pb-16">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-4 right-4 md:left-auto md:right-12 z-50 max-w-sm bg-cyan-950/95 border border-cyan-400/40 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Headline Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0825] to-[#040212] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.06),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.06),transparent_60%)]"></div>

        <div className="space-y-2 relative text-center md:text-right">
          <div className="flex justify-center md:justify-start items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
            <Activity className="w-4 h-4 animate-bounce" />
            <span>FITNESS MODULE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span>{trans.title}</span>
            {getSyncBadge()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">{trans.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 bg-white/[0.02] border border-white/5 rounded-2xl p-3 relative font-sans">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportFitnessJSON}
            className="h-8 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
            title={isRtl ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isRtl ? 'خروجی JSON' : 'Export JSON'}</span>
          </button>

          <label className="h-8 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isRtl ? 'وارد کردن JSON' : 'Import JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFitnessJSON}
              className="hidden"
            />
          </label>

          <span className="text-xs text-slate-400 font-bold uppercase">{isRtl ? 'انتخاب تاریخ:' : 'Date:'}</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#0b0820] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none cursor-pointer font-mono"
          />
        </div>
      </div>

      {/* Weekend Check-in Banner / Weekly Reminder */}
      {isWeekend() && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/15 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <Scale className="w-6 h-6 text-amber-400 shrink-0 animate-bounce" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-amber-400">{isRtl ? 'یادآوری سنجش هفتگی' : 'Weekend Check-in'}</h4>
            <p className="text-[11px] text-slate-200">{trans.weekendPrompt}</p>
          </div>
        </div>
      )}

      {/* Smart Warning Banner */}
      {hasWeightLossWarning && (
        <div className="bg-gradient-to-r from-rose-500/10 to-red-600/15 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3 shadow-lg" dir={isRtl ? 'rtl' : 'ltr'}>
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-rose-400">{trans.smartWarningTitle}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{trans.smartWarningText}</p>
          </div>
        </div>
      )}

      {/* Core Grid Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Profile Inputs & Scientific Calculations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black text-cyan-400 flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-cyan-400" />
                <span>{trans.profileTitle}</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const val = !isProfileLocked;
                  setIsProfileLocked(val);
                  localStorage.setItem('fitness_profile_locked', String(val));
                }}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[10px]"
                title={isProfileLocked ? (isRtl ? 'باز کردن قفل ویرایش' : 'Unlock Profile') : (isRtl ? 'قفل کردن ویرایش' : 'Lock Profile')}
              >
                {isProfileLocked ? (
                  <>
                    <span className="text-amber-500 font-bold">{isRtl ? 'قفل' : 'Locked'}</span>
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-bold">{isRtl ? 'باز' : 'Unlocked'}</span>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  </>
                )}
              </button>
            </h3>

            {/* Inputs list */}
            <div className={`grid grid-cols-2 gap-3.5 text-xs transition-all duration-300 ${isProfileLocked ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-1 relative">
                <label className="text-slate-400 font-bold block">{trans.gender}</label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={isProfileLocked}
                    onClick={() => setGenderOpen(!genderOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none flex items-center justify-between transition-all hover:bg-white/10"
                  >
                    <span>{editGender === 'male' ? trans.male : trans.female}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300" style={{ transform: genderOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {genderOpen && !isProfileLocked && (
                    <div className="absolute top-10 left-0 right-0 bg-[#0d0a21] border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setEditGender('male');
                          setGenderOpen(false);
                        }}
                        className={`w-full text-right ${language !== 'fa' ? 'sm:text-left' : ''} px-3 py-1.5 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${editGender === 'male' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                      >
                        {trans.male}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditGender('female');
                          setGenderOpen(false);
                        }}
                        className={`w-full text-right ${language !== 'fa' ? 'sm:text-left' : ''} px-3 py-1.5 text-xs rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${editGender === 'female' ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                      >
                        {trans.female}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.age}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.height}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  value={editHeight}
                  onChange={(e) => setEditHeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.weight}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.waist}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  placeholder={isRtl ? 'اختیاری' : 'Optional'}
                  value={editWaist || ''}
                  onChange={(e) => setEditWaist(e.target.value ? Number(e.target.value) : undefined as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.arm}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  placeholder={isRtl ? 'اختیاری' : 'Optional'}
                  value={editArm || ''}
                  onChange={(e) => setEditArm(e.target.value ? Number(e.target.value) : undefined as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1 col-span-2 relative">
                <label className="text-slate-400 font-bold block">{trans.activityLevel}</label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={isProfileLocked}
                    onClick={() => setActivityOpen(!activityOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none flex items-center justify-between text-[11px] transition-all hover:bg-white/10"
                  >
                    <span className="truncate">{trans.activityLevels[editActivity]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0 transition-transform duration-300" style={{ transform: activityOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {activityOpen && !isProfileLocked && (
                    <div className="absolute top-10 left-0 right-0 bg-[#0d0a21] border border-white/10 rounded-xl max-h-56 overflow-y-auto z-50 p-1 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                      {(['sedentary', 'light', 'moderate', 'very_active'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setEditActivity(level);
                            setActivityOpen(false);
                          }}
                          className={`w-full text-right ${language !== 'fa' ? 'sm:text-left' : ''} px-3 py-2 text-[10px] sm:text-[11px] rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${editActivity === level ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                        >
                          {trans.activityLevels[level]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{trans.targetWeight}</label>
                <input 
                  type="number" 
                  disabled={isProfileLocked}
                  value={editTargetWeight}
                  onChange={(e) => setEditTargetWeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-slate-400 font-bold block">{trans.goalType}</label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={isProfileLocked}
                    onClick={() => setGoalTypeOpen(!goalTypeOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none flex items-center justify-between text-[11px] transition-all hover:bg-white/10"
                  >
                    <span className="truncate">{trans.goalTypes[editGoalType]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0 transition-transform duration-300" style={{ transform: goalTypeOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {goalTypeOpen && !isProfileLocked && (
                    <div className="absolute top-10 left-0 right-0 bg-[#0d0a21] border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                      {(['lose', 'gain', 'maintain'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setEditGoalType(g);
                            setGoalTypeOpen(false);
                          }}
                          className={`w-full text-right ${language !== 'fa' ? 'sm:text-left' : ''} px-3 py-2 text-[10px] sm:text-[11px] rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${editGoalType === g ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                        >
                          {trans.goalTypes[g]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isProfileLocked ? (
              <button
                onClick={handleSaveProfile}
                className="w-full h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all mt-2 cursor-pointer"
              >
                {trans.saveProfile}
              </button>
            ) : (
              <div className="text-[10px] text-center text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl font-bold mt-2">
                {isRtl ? '🔒 برای ویرایش اطلاعات ابتدا قفل بالا را باز کنید' : '🔒 Unlock the profile above to make changes'}
              </div>
            )}
          </article>

          {/* Scientific Calculations Output Card */}
          <article className="bg-gradient-to-br from-[#120b33]/90 to-[#060413]/90 border border-purple-500/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-purple-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              <span>{isRtl ? 'شاخص‌های محاسبه شده شما' : 'Calculated Metrics'}</span>
            </h3>

            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs text-slate-300">{trans.bmr}</span>
                <span className="text-sm font-black text-white font-mono">{bmr} <span className="text-[10px] text-slate-500 font-sans">{trans.calories}</span></span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-xs text-slate-300">{trans.tdee}</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{tdee} <span className="text-[10px] text-slate-500 font-sans">{trans.calories}</span></span>
              </div>

              <div className="flex justify-between items-center p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-xl shadow-inner">
                <span className="text-xs text-cyan-300 font-bold">{trans.recommendedCalories}</span>
                <span className="text-base font-black text-white font-mono">{recommendedCalories} <span className="text-[11px] text-cyan-400 font-sans">{trans.calories}</span></span>
              </div>
            </div>

            {/* Macros target visualization */}
            <div className="space-y-3.5 pt-2">
              <h4 className="text-xs font-black text-slate-200">{trans.macrosTitle}</h4>
              
              <div className="space-y-2.5">
                {/* Protein */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-red-400">{trans.protein} ({recommendedMacros.proteinPct}%)</span>
                    <span className="text-white font-mono">{recommendedMacros.protein}{trans.grams}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${recommendedMacros.proteinPct}%` }} />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-amber-400">{trans.carbs} ({recommendedMacros.carbsPct}%)</span>
                    <span className="text-white font-mono">{recommendedMacros.carbs}{trans.grams}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${recommendedMacros.carbsPct}%` }} />
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-400">{trans.fat} ({recommendedMacros.fatPct}%)</span>
                    <span className="text-white font-mono">{recommendedMacros.fat}{trans.grams}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${recommendedMacros.fatPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Bar Widget */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">{isRtl ? 'شاخص توده بدنی (BMI)' : (language === 'de' ? 'Body-Mass-Index (BMI)' : 'Body Mass Index (BMI)')}</span>
                <span className={`font-black text-sm font-mono ${bmiCat.color}`}>
                  {bmiValue} <span className="text-[10px] font-sans font-bold">({bmiCat.label})</span>
                </span>
              </div>
              
              {/* Scale track with dynamic marker */}
              <div className="relative pt-4 pb-2" dir="ltr">
                {bmiValue > 0 && (
                  <div 
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                    style={{ left: `${Math.max(5, Math.min(95, ((bmiValue - 15) / (35 - 15)) * 100))}%` }}
                  >
                    <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded ${bmiCat.bg} shadow-md font-mono mb-0.5`}>
                      {bmiValue}
                    </span>
                    <div className="w-1.5 h-1.5 rotate-45 bg-white shrink-0 -mt-0.5" />
                  </div>
                )}
                
                {/* Segmented bar */}
                <div className="h-2 w-full rounded-full bg-white/5 flex overflow-hidden">
                  <div className="h-full bg-sky-400" style={{ width: '17.5%' }} title="Underweight < 18.5" />
                  <div className="h-full bg-emerald-400" style={{ width: '32.5%' }} title="Normal 18.5 - 25" />
                  <div className="h-full bg-amber-400" style={{ width: '25%' }} title="Overweight 25 - 30" />
                  <div className="h-full bg-rose-500" style={{ width: '25%' }} title="Obese > 30" />
                </div>

                {/* Scale range labels */}
                <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1 px-0.5">
                  <span>15</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35+</span>
                </div>
              </div>

              {/* BMI Description label */}
              <p className="text-[10px] text-slate-400 leading-relaxed text-center italic bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                {bmiCat.desc}
              </p>
            </div>
          </article>
        </div>

        {/* Middle Column: Daily Progress Rings & Quick Logging Short-cuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-cyan-400" />
                <span>{isRtl ? 'پیشرفت روزانه اهداف بدنی' : 'Daily Progress Goals'}</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseDayAndGenerateReport}
                className="px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-[10px] rounded-lg shadow-md hover:shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>🏁</span>
                <span>{isRtl ? 'اتمام روز و دریافت کارنامه' : (language === 'de' ? 'Tag beenden' : 'End Day & Report')}</span>
              </button>
            </div>

            {/* Circular Progress Rings Dashboard */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 items-center text-center">
              {/* Calorie Ring */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 sm:hidden" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-white/5 hidden sm:block" strokeWidth="4.5" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-cyan-400 transition-all duration-500 sm:hidden" strokeWidth="4" fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * caloriePct) / 100}
                    />
                    <circle cx="32" cy="32" r="28" className="stroke-cyan-400 transition-all duration-500 hidden sm:block" strokeWidth="4.5" fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * caloriePct) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-black text-white font-mono">{caloriePct}%</span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{trans.calories}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400">{activeLog.caloriesConsumed}/{adjustedRecommendedCalories}</span>
              </div>

              {/* Protein Ring */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 sm:hidden" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-white/5 hidden sm:block" strokeWidth="4.5" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-red-400 transition-all duration-500 sm:hidden" strokeWidth="4" fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * proteinPctLog) / 100}
                    />
                    <circle cx="32" cy="32" r="28" className="stroke-red-400 transition-all duration-500 hidden sm:block" strokeWidth="4.5" fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * proteinPctLog) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-black text-white font-mono">{proteinPctLog}%</span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{trans.protein}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-red-400">{Math.round(activeLog.protein)}g/{recommendedMacros.protein}g</span>
              </div>

              {/* Carbs Ring */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 sm:hidden" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-white/5 hidden sm:block" strokeWidth="4.5" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-amber-400 transition-all duration-500 sm:hidden" strokeWidth="4" fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * carbsPctLog) / 100}
                    />
                    <circle cx="32" cy="32" r="28" className="stroke-amber-400 transition-all duration-500 hidden sm:block" strokeWidth="4.5" fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * carbsPctLog) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-black text-white font-mono">{carbsPctLog}%</span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{trans.carbs}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-amber-400">{Math.round(activeLog.carbs)}g/{recommendedMacros.carbs}g</span>
              </div>

              {/* Fat Ring */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 sm:hidden" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-white/5 hidden sm:block" strokeWidth="4.5" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-emerald-400 transition-all duration-500 sm:hidden" strokeWidth="4" fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * fatPctLog) / 100}
                    />
                    <circle cx="32" cy="32" r="28" className="stroke-emerald-400 transition-all duration-500 hidden sm:block" strokeWidth="4.5" fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * fatPctLog) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-black text-white font-mono">{fatPctLog}%</span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{trans.fat}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400">{Math.round(activeLog.fat)}g/{recommendedMacros.fat}g</span>
              </div>

              {/* Water Ring */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-white/5 sm:hidden" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-white/5 hidden sm:block" strokeWidth="4.5" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-blue-400 transition-all duration-500 sm:hidden" strokeWidth="4" fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * waterPctLog) / 100}
                    />
                    <circle cx="32" cy="32" r="28" className="stroke-blue-400 transition-all duration-500 hidden sm:block" strokeWidth="4.5" fill="transparent"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * waterPctLog) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-black text-white font-mono">{waterPctLog}%</span>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{trans.waterTitle}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-blue-400">{activeLog.water}/8 {trans.waterGlasses}</span>
              </div>
            </div>

            {/* Calories Intake vs Burned Simple Bar visualization */}
            <div className="space-y-1.5 bg-white/[0.02] border border-white/5 p-3 rounded-xl font-sans">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">{isRtl ? 'دریافتی غذا:' : 'Food Intake:'} <span className="text-cyan-400 font-mono">{activeLog.caloriesConsumed} kcal</span></span>
                <span className="text-slate-400">{isRtl ? 'مصرف کل:' : 'Total Expended:'} <span className="text-rose-400 font-mono">{tdee + activeWorkoutsKcal} kcal</span></span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full flex overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500" 
                  style={{ width: `${Math.min(100, (activeLog.caloriesConsumed / Math.max(1, tdee + activeWorkoutsKcal)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Water and Sleep direct controls */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#110e34]/60 border border-white/5 p-3 rounded-xl flex flex-col justify-between items-center gap-2">
                <span className="text-[11px] text-blue-300 font-bold flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" />
                  {trans.waterTitle}
                </span>
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => handleWaterClick(-1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm active:scale-90 transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-white font-mono">{activeLog.water}</span>
                  <button 
                    onClick={() => handleWaterClick(1)}
                    className="w-7 h-7 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-sm active:scale-90 transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#110e34]/60 border border-white/5 p-3 rounded-xl flex flex-col justify-between items-center gap-2">
                <span className="text-[11px] text-purple-300 font-bold flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  {trans.sleepTitle}
                </span>
                <div className="flex items-center gap-2.5">
                  <button 
                    type="button"
                    onClick={() => {
                      const log = getOrCreateDayLog(selectedDate);
                      log.sleep = Math.max(0, parseFloat((Math.max(0, log.sleep - 0.5)).toFixed(1)));
                      saveDayLog(log);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm active:scale-90 transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-white font-mono">{activeLog.sleep}h</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const log = getOrCreateDayLog(selectedDate);
                      log.sleep = Math.min(24, parseFloat((Math.min(24, log.sleep + 0.5)).toFixed(1)));
                      saveDayLog(log);
                    }}
                    className="w-7 h-7 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-sm active:scale-90 transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Quick Add Food Preset & Custom addition panel */}
          <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Flame className="w-4.5 h-4.5 text-cyan-400" />
              <span>{trans.addFood}</span>
            </h3>

            {/* Presets grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {FOOD_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAddFood(p)}
                  className="p-2 bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 rounded-xl text-slate-300 text-right hover:text-white transition-all text-xs active:scale-95 flex flex-col justify-between gap-1 cursor-pointer"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <span className="font-bold truncate max-w-full text-[11px]">{p.name.split('/')[isRtl ? 1 : 0].trim()}</span>
                  <span className="text-cyan-400 font-mono font-bold">{p.kcal} kcal</span>
                </button>
              ))}
            </div>

            {/* Custom food form */}
            <form onSubmit={handleAddCustomFood} className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="col-span-2">
                  <input 
                    type="text"
                    required
                    placeholder={trans.foodPlaceholder}
                    value={customFoodName}
                    onChange={(e) => setCustomFoodName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{isRtl ? 'مقدار عددی' : 'Amount value'}</label>
                  <input 
                    type="number"
                    required
                    placeholder="100..."
                    value={customFoodAmount}
                    onChange={(e) => setCustomFoodAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div className="relative">
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{isRtl ? 'واحد اندازه‌گیری' : 'Measurement unit'}</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCustomUnitOpen(!customUnitOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none flex items-center justify-between text-[11px] hover:bg-white/10 transition-all"
                    >
                      <span>
                        {customFoodUnit === 'gram' && (isRtl ? 'گرم' : 'gram')}
                        {customFoodUnit === 'glass' && (isRtl ? 'لیوان' : 'cup')}
                        {customFoodUnit === 'spoon' && (isRtl ? 'قاشق' : 'spoon')}
                        {customFoodUnit === 'palm' && (isRtl ? 'کف دست' : 'palm')}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300" style={{ transform: customUnitOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {customUnitOpen && (
                      <div className="absolute top-10 left-0 right-0 bg-[#0d0a21] border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                        {([
                          { value: 'gram', label: isRtl ? 'گرم' : 'gram' },
                          { value: 'glass', label: isRtl ? 'لیوان' : 'cup' },
                          { value: 'spoon', label: isRtl ? 'قاشق' : 'spoon' },
                          { value: 'palm', label: isRtl ? 'کف دست' : 'palm' }
                        ] as const).map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setCustomFoodUnit(item.value);
                              setCustomUnitOpen(false);
                            }}
                            className={`w-full text-right ${language !== 'fa' ? 'sm:text-left' : ''} px-3 py-2 text-[10px] sm:text-[11px] rounded-lg hover:bg-cyan-400/10 hover:text-white transition-all ${customFoodUnit === item.value ? 'bg-cyan-400/20 text-cyan-400 font-bold' : 'text-slate-300'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{trans.calories} (kcal)</label>
                  <input 
                    type="number"
                    required
                    placeholder={`${trans.calories}...`}
                    value={customFoodKcal}
                    onChange={(e) => setCustomFoodKcal(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{trans.protein} (g)</label>
                  <input 
                    type="number"
                    placeholder={`${trans.protein} (g)...`}
                    value={customFoodP}
                    onChange={(e) => setCustomFoodP(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{trans.carbs} (g)</label>
                  <input 
                    type="number"
                    placeholder={`${trans.carbs} (g)...`}
                    value={customFoodC}
                    onChange={(e) => setCustomFoodC(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{trans.fat} (g)</label>
                  <input 
                    type="number"
                    placeholder={`${trans.fat} (g)...`}
                    value={customFoodF}
                    onChange={(e) => setCustomFoodF(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full h-8.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white text-xs font-black rounded-xl transition-all border border-cyan-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                {editingFoodId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingFoodId ? (isRtl ? 'بروزرسانی تغییرات غذا' : 'Update Logged Food') : (isRtl ? 'ثبت غذای دلخواه' : 'Add Custom Food')}</span>
              </button>
            </form>

            {/* Logged Foods list */}
            {activeLog.foods && activeLog.foods.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-white/5 font-sans">
                <h4 className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mb-1">{isRtl ? 'غذاهای ثبت شده امروز:' : 'Logged Foods Today:'}</h4>
                {activeLog.foods.map(f => (
                  <div key={f.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {f.amount} {f.unit === 'gram' ? (isRtl ? 'گرم' : 'g') : f.unit === 'glass' ? (isRtl ? 'لیوان' : 'cup') : f.unit === 'spoon' ? (isRtl ? 'قاشق' : 'spoon') : (isRtl ? 'کف دست' : 'palm')} • {f.calories} kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => handleStartEditFood(f)}
                        className="p-1.5 hover:bg-cyan-500/15 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                        title={isRtl ? 'ویرایش' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteFood(f.id)}
                        className="p-1.5 hover:bg-rose-500/15 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        {/* Right Column: Workouts Log & Weekly Measurement Trackers (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Dumbbell className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              <span>{trans.workoutTitle}</span>
            </h3>

            {/* Exercise quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {WORKOUT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAddWorkout(preset, 30)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/15 border border-white/5 rounded-xl text-[11px] text-slate-300 hover:text-cyan-300 transition-all active:scale-95 cursor-pointer"
                >
                  +{preset.name.split('/')[isRtl ? 1 : 0].trim()} (30m)
                </button>
              ))}
            </div>

            {/* Custom workout form */}
            <form onSubmit={handleAddCustomWorkout} className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
              <div className="col-span-2">
                <input 
                  type="text"
                  required
                  placeholder={isRtl ? 'نام ورزش (مثلا: پیلاتس، تنیس)' : 'Exercise name...'}
                  value={customExName}
                  onChange={(e) => setCustomExName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{trans.durationMin}</label>
                <input 
                  type="number"
                  value={customExDuration}
                  onChange={(e) => setCustomExDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">{isRtl ? 'کالری سوخته' : 'Calories Burned'}</label>
                <input 
                  type="number"
                  value={customExBurned}
                  onChange={(e) => setCustomExBurned(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
              <button 
                type="submit"
                className="col-span-2 h-8.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white text-xs font-black rounded-xl transition-all border border-cyan-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                {editingWorkoutId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingWorkoutId ? (isRtl ? 'بروزرسانی اطلاعات ورزش' : 'Update Workout') : trans.addExercise}</span>
              </button>
            </form>

            {/* Workouts list logged today */}
            {activeLog.workouts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5 font-sans">
                {activeLog.workouts.map(w => (
                  <div key={w.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded-xl text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{w.name.split('/')[isRtl ? 1 : 0].trim()}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{w.duration} mins • {w.caloriesBurned} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => handleStartEditWorkout(w)}
                        className="p-1.5 hover:bg-cyan-500/15 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                        title={isRtl ? 'ویرایش' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="p-1.5 hover:bg-rose-500/15 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Scale & Circumferences Check-in Log Card */}
          <article className="bg-[#0d0925]/90 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Scale className="w-4.5 h-4.5 text-cyan-400" />
              <span>{trans.weeklyWeightTitle}</span>
            </h3>

            {/* Manual weekly input fields */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">{trans.weight}</label>
                  <input 
                    type="number" 
                    id="weekly-weight-input"
                    step="0.1"
                    defaultValue={profile.weight}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">{trans.waist}</label>
                  <input 
                    type="number" 
                    id="weekly-waist-input"
                    step="0.5"
                    defaultValue={profile.waist}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">{trans.arm}</label>
                  <input 
                    type="number" 
                    id="weekly-arm-input"
                    step="0.5"
                    defaultValue={profile.arm}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const wEl = document.getElementById('weekly-weight-input') as HTMLInputElement;
                  const waEl = document.getElementById('weekly-waist-input') as HTMLInputElement;
                  const aEl = document.getElementById('weekly-arm-input') as HTMLInputElement;
                  if (wEl && waEl && aEl) {
                    handleManualMeasurementCheckin(Number(wEl.value), Number(waEl.value), Number(aEl.value));
                  }
                }}
                className="w-full h-9 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white text-xs font-black rounded-xl border border-purple-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {isRtl ? 'ثبت مقادیر هفتگی بدنی' : 'Log Measurements'}
              </button>
            </div>
          </article>
        </div>

      </div>

      {/* Customizable Dynamic Chart Analytics Board (12 cols full width) */}
      <div className="bg-[#0c0825]/90 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        {/* Chart Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-cyan-400 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>{trans.chartsTitle}</span>
            </h3>
            <p className="text-xs text-slate-400">{isRtl ? 'نمایش تحلیل پیشرفت کالری، وزن و تغییرات اندازه ها به تفکیک تم رنگ خطوط' : 'Analyze calorie budgets, bodyweight trends and circumferences logs over time.'}</p>
          </div>

          {/* Timeframe toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1 font-mono text-xs">
            <button
              onClick={() => setTimeframe('30')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === '30' ? 'bg-cyan-500 text-black font-black' : 'text-slate-400 hover:text-white'}`}
            >
              {trans.days30}
            </button>
            <button
              onClick={() => setTimeframe('90')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === '90' ? 'bg-cyan-500 text-black font-black' : 'text-slate-400 hover:text-white'}`}
            >
              {trans.days90}
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === 'all' ? 'bg-cyan-500 text-black font-black' : 'text-slate-400 hover:text-white'}`}
            >
              {trans.allTime}
            </button>
          </div>
        </div>

        {/* Customizable visibility panel */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300">
            <Info className="w-4 h-4 text-purple-400" />
            <span>{trans.customizeCharts}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Weight line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.weight}
                  onChange={(e) => setLineVisibility({...lineVisibility, weight: e.target.checked})}
                  className="rounded border-white/10 accent-cyan-400"
                />
                <span>{isRtl ? 'وزن واقعی' : 'Actual Weight'}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.weight}
                onChange={(e) => setChartTheme({...chartTheme, weight: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            {/* Target line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.target}
                  onChange={(e) => setLineVisibility({...lineVisibility, target: e.target.checked})}
                  className="rounded border-white/10 accent-purple-400"
                />
                <span>{isRtl ? 'وزن هدف' : 'Target Weight'}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.target}
                onChange={(e) => setChartTheme({...chartTheme, target: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            {/* Waist line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.waist}
                  onChange={(e) => setLineVisibility({...lineVisibility, waist: e.target.checked})}
                  className="rounded border-white/10 accent-amber-500"
                />
                <span>{trans.waist}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.waist}
                onChange={(e) => setChartTheme({...chartTheme, waist: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            {/* Arm line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.arm}
                  onChange={(e) => setLineVisibility({...lineVisibility, arm: e.target.checked})}
                  className="rounded border-white/10 accent-emerald-500"
                />
                <span>{trans.arm}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.arm}
                onChange={(e) => setChartTheme({...chartTheme, arm: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            {/* Calorie Intake line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.intake}
                  onChange={(e) => setLineVisibility({...lineVisibility, intake: e.target.checked})}
                  className="rounded border-white/10 accent-blue-500"
                />
                <span>{isRtl ? 'دریافت غذا' : 'Cal Intake'}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.intake}
                onChange={(e) => setChartTheme({...chartTheme, intake: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            {/* Calorie Burned line visibility & color theme */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={lineVisibility.burned}
                  onChange={(e) => setLineVisibility({...lineVisibility, burned: e.target.checked})}
                  className="rounded border-white/10 accent-rose-500"
                />
                <span>{isRtl ? 'انرژی سوخته' : 'Cal Burned'}</span>
              </label>
              <input 
                type="color" 
                value={chartTheme.burned}
                onChange={(e) => setChartTheme({...chartTheme, burned: e.target.value})}
                className="w-4 h-4 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white/[0.01] border border-white/5 rounded-2xl">
            <Info className="w-8 h-8 mx-auto text-slate-500 mb-2 animate-bounce" />
            <p className="text-xs">{trans.noDataYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* Chart 1: Weight & Measurements Trend chart */}
            <div className="bg-[#0b0722]/40 border border-white/5 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1">
                <Scale className="w-4 h-4" />
                <span>{isRtl ? 'روند پایش وزن و تغییر اندازه‌های بدنی' : 'Weight & Measurements History'}</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0925', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    {lineVisibility.weight && (
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        name={isRtl ? 'وزن (kg)' : 'Weight (kg)'} 
                        stroke={chartTheme.weight} 
                        strokeWidth={2.5} 
                        dot={{ r: 4 }} 
                      />
                    )}
                    {lineVisibility.target && (
                      <Line 
                        type="monotone" 
                        dataKey="targetWeight" 
                        name={isRtl ? 'وزن هدف (kg)' : 'Target Weight (kg)'} 
                        stroke={chartTheme.target} 
                        strokeWidth={1.5} 
                        strokeDasharray="5 5" 
                        dot={false} 
                      />
                    )}
                    {lineVisibility.waist && (
                      <Line 
                        type="monotone" 
                        dataKey="waist" 
                        name={isRtl ? 'کمر (cm)' : 'Waist (cm)'} 
                        stroke={chartTheme.waist} 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                      />
                    )}
                    {lineVisibility.arm && (
                      <Line 
                        type="monotone" 
                        dataKey="arm" 
                        name={isRtl ? 'بازو (cm)' : 'Arm (cm)'} 
                        stroke={chartTheme.arm} 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Calorie Intake vs Expended Energy Chart */}
            <div className="bg-[#0b0722]/40 border border-white/5 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1">
                <Flame className="w-4 h-4" />
                <span>{isRtl ? 'مقایسه انرژی دریافتی غذا و انرژی مصرفی روزانه' : 'Calorie Intake vs Expenditure Budget'}</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d0925', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    {lineVisibility.intake && (
                      <Bar 
                        dataKey="intake" 
                        name={trans.caloriesConsumedLabel} 
                        fill={chartTheme.intake} 
                        radius={[4, 4, 0, 0]} 
                      />
                    )}
                    {lineVisibility.burned && (
                      <Bar 
                        dataKey="burned" 
                        name={trans.caloriesBurnedLabel} 
                        fill={chartTheme.burned} 
                        radius={[4, 4, 0, 0]} 
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Scientific End of Day Report Modal Overlay */}
      {closeDayReportOpen && generatedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0a25] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-250 max-h-[90vh] overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Close Button */}
            <button
              onClick={() => setCloseDayReportOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Score Meter */}
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                {isRtl ? 'کارنامه علمی سلامت امروز' : (language === 'de' ? 'Täglicher Gesundheitsbericht' : 'Daily Scientific Health Report')}
              </span>
              
              {/* Radial Score Indicator */}
              <div className="relative w-24 h-24 flex items-center justify-center mx-auto mt-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" className="stroke-white/5" strokeWidth="6" fill="transparent" />
                  <circle cx="48" cy="48" r="42" 
                    className={`transition-all duration-1000 ${
                      generatedReport.score >= 90 ? 'stroke-emerald-400' :
                      generatedReport.score >= 70 ? 'stroke-amber-400' : 'stroke-rose-500'
                    }`} 
                    strokeWidth="6.5" 
                    fill="transparent"
                    strokeDasharray={263.8}
                    strokeDashoffset={263.8 - (263.8 * generatedReport.score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white font-mono">{generatedReport.score}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{isRtl ? 'امتیاز' : 'SCORE'}</span>
                </div>
              </div>

              {/* Title & Performance summary */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">{generatedReport.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">{generatedReport.description}</p>
              </div>
            </div>

            {/* Diagnostic Parameters Analysis List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-400 border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                <span>📊</span>
                <span>{isRtl ? 'آنالیز دقیق متغیرهای حیاتی' : (language === 'de' ? 'Parameteranalyse' : 'Vital Parameters Diagnostics')}</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {generatedReport.analysis.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs transition-all hover:bg-white/[0.03]"
                  >
                    <span className="text-slate-300 font-bold flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'good' ? 'bg-emerald-400' :
                        item.status === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                      }`} />
                      {item.label}
                    </span>
                    <span className={`font-black font-mono ${
                      item.status === 'good' ? 'text-emerald-400' :
                      item.status === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Coaching Actionable Tips for tomorrow */}
            <div className="space-y-2.5 bg-gradient-to-r from-purple-950/10 to-indigo-950/10 border border-purple-500/10 p-4 rounded-2xl">
              <h4 className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'توصیه‌های هوشمند مربی برای فردا' : (language === 'de' ? 'Tipps für morgen' : 'Smart Coaching Tips for Tomorrow')}</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                {generatedReport.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-purple-400 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            <button
              onClick={() => setCloseDayReportOpen(false)}
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{isRtl ? 'متوجه شدم، فردا قوی‌تر خواهم بود!' : (language === 'de' ? 'Verstanden!' : 'Got it, tomorrow will be stronger!')}</span>
            </button>

          </div>
        </div>
      )}

    </section>
  );
}
