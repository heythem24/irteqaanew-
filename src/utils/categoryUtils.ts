// Utilities for age categories, Arabic labels, and weight classes (2025 reference)
// Make sure all tabs use the same logic

export type Gender = 'male' | 'female';

export interface CategorySpec {
  id: 'eveil' | 'mini-poussin' | 'poussin' | 'benjamin' | 'minime' | 'cadet' | 'junior' | 'senior';
  nameAr: string;
  years: number[]; // birth years that belong to the category for referenceYear=2025
  minGrade: string;
  weights: { male: string[]; female: string[] };
}

// Reference year for category computation. Keep 2025 as provided.
const REFERENCE_YEAR = 2025;

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

export const CATEGORIES: CategorySpec[] = [
  {
    id: 'eveil',
    nameAr: 'مصغر',
    years: [2021, 2022], // 4-5 years in 2025
    minGrade: 'بدون',
    weights: { male: [], female: [] },
  },
  {
    id: 'mini-poussin',
    nameAr: 'براعم صغار',
    years: [2019, 2020], // 6-7 years in 2025
    minGrade: 'أبيض/أصفر',
    weights: { male: [], female: [] },
  },
  {
    id: 'poussin',
    nameAr: 'براعم',
    years: [2017, 2018], // 8-9 years in 2025
    minGrade: 'أبيض/أصفر',
    weights: { male: [], female: [] },
  },
  {
    id: 'benjamin',
    nameAr: 'أصاغر',
    years: [2015, 2016], // 10-11 years in 2025
    minGrade: 'أصفر/برتقالي',
    weights: {
      male: ['-26', '-30', '-34', '-38', '-42', '-46', '-50', '-55', '-60', '-66', '+66'],
      female: ['-25', '-32', '-36', '-40', '-44', '-48', '-52', '-57', '-63', '+63'],
    },
  },
  {
    id: 'minime',
    nameAr: 'صغار',
    years: [2013, 2014], // 12-13 years in 2025
    minGrade: 'برتقالي',
    weights: {
      male: ['-34', '-38', '-42', '-46', '-50', '-55', '-60', '-66', '-73', '-81', '+81'],
      female: ['-36', '-40', '-44', '-48', '-52', '-57', '-63', '-70', '+70'],
    },
  },
  {
    id: 'cadet',
    nameAr: 'ناشئين',
    years: [2010, 2011, 2012], // 14-16 years in 2025
    minGrade: 'أخضر',
    weights: {
      male: ['-46', '-50', '-55', '-60', '-66', '-73', '-81', '-90', '-100', '+100'],
      female: ['-40', '-44', '-48', '-52', '-57', '-63', '-70', '-78', '+78'],
    },
  },
  {
    id: 'junior',
    nameAr: 'أواسط',
    years: [2007, 2008, 2009], // 17-18 years in 2025
    minGrade: 'أخضر',
    weights: {
      male: ['-55', '-60', '-66', '-73', '-81', '-90', '-100', '+100'],
      female: ['-44', '-48', '-52', '-57', '-63', '-70', '-78', '+78'],
    },
  },
  {
    id: 'senior',
    nameAr: 'أكابر',
    years: [...range(1900, 2006)], // 19+ years in 2025
    minGrade: 'أخضر',
    weights: {
      male: ['-60', '-66', '-73', '-81', '-90', '-100', '+100'],
      female: ['-48', '-52', '-57', '-63', '-70', '-78', '+78'],
    },
  },
];

// Remove Arabic diacritics and normalize hamza/taa marbuta variants for robust mapping
function normalizeArabic(input: string): string {
  return input
    .normalize('NFKD')
    // Remove diacritics
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '')
    // Normalize alef/hamza forms
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Normalize taa marbuta to haa for mapping consistency
    .replace(/\u0629/g, '\u0647')
    // Remove tatweel
    .replace(/\u0640/g, '')
    .toLowerCase()
    .trim();
}

// Map various inputs (case-insensitive) to Arabic labels
const CATEGORY_LABEL_MAP: Record<string, string> = {
  'senior': 'أكابر',
  'junior': 'أشبال',
  'cadet': 'أواسط',
  'youth': 'شباب',
  'mini': 'براعم',
  'minime': 'براعم',
  'benjamin': 'أصاغر',
  'poussin': 'براعم',
  'mini-poussin': 'براعم صغار',
  'eveil': 'مصغر',
  'Senior': 'أكابر',
  'Junior': 'أشبال',
  'Cadet': 'أواسط',
  'Youth': 'شباب',
  'Mini': 'براعم',
  'Minime': 'براعم',
  'Benjamin': 'أصاغر',
  'Poussin': 'براعم',
  'Mini-poussin': 'براعم صغار',
  'Eveil': 'مصغر',
  // Arabic variants without hamza/diacritics
  'اكابر': 'أكابر',
  'اواسط': 'أواسط',
  'ناشئين': 'ناشئين',
  'اشبال': 'أشبال',
  'صغار': 'صغار',
  'اصاغر': 'أصاغر',
  'براعم': 'براعم',
  'براعم صغار': 'براعم صغار',
  'مصغر': 'مصغر',
};

export function normalizeCategoryLabel(category: string): string {
  if (!category) return '';
  const direct = CATEGORY_LABEL_MAP[category] || CATEGORY_LABEL_MAP[category.toLowerCase()];
  if (direct) return direct;
  // Arabic normalization fallback
  const ar = normalizeArabic(category);
  // Build a normalized map for Arabic keys
  const normalizedMap: Record<string, string> = {};
  Object.entries(CATEGORY_LABEL_MAP).forEach(([k, v]) => {
    normalizedMap[normalizeArabic(k)] = v;
  });
  return normalizedMap[ar] || category;
}

export interface ComputedCategory {
  id: CategorySpec['id'];
  nameAr: string;
  minGrade: string;
  weights: { male: string[]; female: string[] };
}

// Compute category by date of birth, using REFERENCE_YEAR=2025 logic
export function getCategoryByDOB(dob?: Date): ComputedCategory | null {
  if (!dob) return null;
  const birthYear = new Date(dob).getFullYear();

  const found = CATEGORIES.find(cat => cat.years.includes(birthYear));
  if (found) {
    return { id: found.id, nameAr: found.nameAr, minGrade: found.minGrade, weights: found.weights };
  }

  // For any year not explicitly listed, fall back by age calculation relative to 2025
  const age = REFERENCE_YEAR - birthYear;
  if (age >= 19) {
    const s = CATEGORIES.find(c => c.id === 'senior')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 17) {
    const s = CATEGORIES.find(c => c.id === 'junior')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 14) {
    const s = CATEGORIES.find(c => c.id === 'cadet')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 12) {
    const s = CATEGORIES.find(c => c.id === 'minime')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 10) {
    const s = CATEGORIES.find(c => c.id === 'benjamin')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 8) {
    const s = CATEGORIES.find(c => c.id === 'poussin')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  if (age >= 6) {
    const s = CATEGORIES.find(c => c.id === 'mini-poussin')!;
    return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
  }
  const s = CATEGORIES.find(c => c.id === 'eveil')!;
  return { id: s.id, nameAr: s.nameAr, minGrade: s.minGrade, weights: s.weights };
}

// Dynamic precise category based on today's date (birthday-aware)
export function getCategoryByDOBToday(dob?: Date): ComputedCategory | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  let id: CategorySpec['id'];
  if (age >= 19) id = 'senior';
  else if (age >= 17) id = 'junior';
  else if (age >= 14) id = 'cadet';
  else if (age >= 12) id = 'minime';
  else if (age >= 10) id = 'benjamin';
  else if (age >= 8) id = 'poussin';
  else if (age >= 6) id = 'mini-poussin';
  else id = 'eveil';

  const c = CATEGORIES.find(c => c.id === id)!;
  return { id: c.id, nameAr: c.nameAr, minGrade: c.minGrade, weights: c.weights };
}

export function getWeightClasses(categoryId: CategorySpec['id'], gender: Gender): string[] {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  return cat.weights[gender] || [];
}
