// Mathematical Jalali <-> Gregorian Converter

export function g2j(gy: number, gm: number, gd: number): [number, number, number] {
  let g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy: number, jm: number, jd: number;
  if ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) {
    g_d_m[2] = 29;
  }
  let gy2 = gy - 1600;
  let gm2 = gm - 1;
  let gd2 = gd - 1;
  let g_day_no = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400);
  for (let i = 0; i < gm2; ++i) {
    g_day_no += g_d_m[i + 1];
  }
  g_day_no += gd2;
  let j_day_no = g_day_no - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;
  jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  if (j_day_no < 186) {
    jm = 1 + Math.floor(j_day_no / 31);
    jd = 1 + (j_day_no % 31);
  } else {
    jm = 7 + Math.floor((j_day_no - 186) / 30);
    jd = 1 + ((j_day_no - 186) % 30);
  }
  return [jy, jm, jd];
}

export function j2g(jy: number, jm: number, jd: number): [number, number, number] {
  let jy2 = jy - 979;
  let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4) + jd - 1;
  if (jm < 7) {
    j_day_no += (jm - 1) * 31;
  } else {
    j_day_no += (jm - 1) * 30 + 6;
  }
  let g_day_no = j_day_no + 79;
  let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no %= 146097;
  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no %= 36524;
    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }
  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no %= 365;
  }
  let g_d_m = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (leap && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    g_d_m[2] = 29;
  }
  let gm: number, gd: number;
  for (gm = 1; gm <= 12; gm++) {
    if (g_day_no < g_d_m[gm]) {
      break;
    }
    g_day_no -= g_d_m[gm];
  }
  gd = g_day_no + 1;
  return [gy, gm, gd];
}

export function isJalaliLeap(jy: number): boolean {
  let remainder = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(remainder);
}

export const SHAMSI_MONTH_NAMES = {
  fa: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
  en: ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"],
  de: ["Farwardin", "Ordibehesht", "Chordad", "Tir", "Mordad", "Schahriwar", "Mehr", "Aban", "Asar", "Dey", "Bahman", "Esfand"]
};

export const GREGORIAN_MONTH_NAMES = {
  fa: ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
};

// Convert string/number digits from Western to Persian conditionally based on active language
export function digitsToPersian(val: string | number, lang?: string): string {
  const activeLang = lang || (typeof window !== 'undefined' ? (localStorage.getItem('productivity_language') || 'fa') : 'fa');
  if (activeLang !== 'fa') {
    return String(val);
  }
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(val).replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

// Convert string digits from Persian/Arabic to English
export function persianToEnglishDigits(str: string): string {
  if (!str) return "";
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  return res;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatGregorianToPersianDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const [jy, jm, jd] = g2j(y, m, d);
  return `${jy}/${jm}/${jd}`;
}
