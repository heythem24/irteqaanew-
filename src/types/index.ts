// Core data models for the sports platform

export interface Sport {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

// ===== Pairings (Random Draw) =====
export interface PairMatch {
  athlete1Id: string;
  athlete2Id?: string | null; // إذا كان العدد فردياً
  mat?: 1 | 2 | 3; // رقم البساط (لاجودو عادة 3 بسطات)
  status?: 'pending' | 'finished';
  winnerId?: string | null; // معرّف الفائز عند الانتهاء
  edits?: Array<{
    at: Date;
    reason: string;
    previousWinnerId?: string | null;
    updatedBy?: string; // اسم المستخدم الذي عدّل
  }>;
  // رقم الدور (1 = الدور الأول، ثم 2، ... حتى النهائي)
  round?: number;
  // ربط للمباراة التالية: أين يذهب الفائز من هذه المباراة
  nextIndex?: number; // فهرس المباراة التالية داخل نفس المصفوفة
  nextSlot?: 1 | 2;   // أي خانة سيشغلها الفائز في المباراة التالية (1 أو 2)
  // نشر الخاسر إلى مباراة البرونزية
  loserNextIndex?: number;
  loserNextSlot?: 1 | 2;
  // من أين تأتي مدخلات هذه المباراة (اختياري للدورات اللاحقة)
  from1?: number; // فهرس المباراة السابقة التي تزوّد athlete1Id
  from2?: number; // فهرس المباراة السابقة التي تزوّد athlete2Id
  // المرحلة: رئيسية أو برونزية
  stage?: 'main' | 'bronze';
  // Grouping information for tournament brackets
  groupKey?: string; // Key identifying the category/gender/weight group
  groupIndex?: number; // Index of the group for ordering
}

export interface Pairings {
  id: string; // معرف الوثيقة (مثلاً 'current')
  competitionId: string;
  matches: PairMatch[];
  createdAt: Date;
}

// ===== Competition Organizers (per competition) =====
export type OrganizerRole = 'table_official' | 'supervisor';

export interface CompetitionOrganizer {
  id: string;
  competitionId: string;
  username: string;
  password: string; // تنبيه: للتبسيط فقط. يُفضل التخزين المشفّر في الإنتاج.
  role: OrganizerRole;
  mat?: 1 | 2 | 3; // خاص بمسؤول الطاولة
  isActive: boolean;
  createdAt: Date;
}

// Athlete participation in competitions
export type ParticipationStatus = 'pending' | 'approved' | 'rejected';

export interface Participation {
  id: string;
  competitionId: string;
  athleteId: string; // maps to User.id with role 'athlete'
  clubId: string;
  status: ParticipationStatus;
  createdAt: Date;
}

export interface League {
  id: string;
  sportId: string;
  wilayaId: number;
  wilayaName: string;
  wilayaNameAr: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  presidentId?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Club {
  id: string;
  leagueId: string;
  sportId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
  coachId?: string;
  physicalTrainerId?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

export interface News {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  excerpt?: string;
  excerptAr?: string;
  image?: string;
  author: string;
  authorAr: string;
  sportId?: string;
  leagueId?: string;
  clubId?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  position: StaffPosition;
  positionAr: string;
  bio?: string;
  bioAr?: string;
  image?: string;
  phone?: string;
  email?: string;
  leagueId?: string; // For league staff
  clubId?: string;   // For club staff
  isActive: boolean;
  createdAt: Date;
}

export const StaffPosition = {
  LEAGUE_PRESIDENT: 'league_president',
  CLUB_PRESIDENT: 'club_president',
  TECHNICAL_DIRECTOR: 'technical_director',
  GENERAL_SECRETARY: 'general_secretary',
  TREASURER: 'treasurer',
  COACH: 'coach',
  PHYSICAL_TRAINER: 'physical_trainer'
} as const;

export type StaffPosition = typeof StaffPosition[keyof typeof StaffPosition];

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  firstNameAr: string;
  lastNameAr: string;
  name?: string; // Computed field: firstName + lastName
  dateOfBirth: Date;
  placeOfBirth?: string;
  gender: 'male' | 'female';
  belt: string;
  beltAr: string;
  weight: number;
  height: number;
  weightCategory?: string;
  clubId: string;
  club?: string; // Computed field from clubId
  bio?: string;
  bioAr?: string;
  image?: string;
  phone?: string;
  email?: string;
  achievements?: string[];
  achievementsAr?: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface NewsCard extends News {} // Re-export for clarity in dashboard usage

export interface FeaturedLeague {
  id: string;
  leagueId: string;
  wilayaId?: string; // Added for compatibility with league page routing
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  highlight: string;
  highlightAr: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RecentAchievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  athleteName: string;
  athleteNameAr: string;
  clubName?: string;
  clubNameAr?: string;
  leagueName?: string;
  leagueNameAr?: string;
  achievementType: 'medal' | 'championship' | 'tournament' | 'record' | 'other';
  achievementTypeAr: string;
  image?: string;
  achievementDate: Date;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
}

// Dashboard management interfaces
export interface DashboardContent {
  news: NewsCard[];
  featuredLeagues: FeaturedLeague[];
  recentAchievements: RecentAchievement[];
}

export interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  code: string;
}

// Navigation and UI types
export interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  children?: NavItem[];
}

export interface CarouselItem {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  image: string;
  link?: string;
}

// User authentication and authorization types
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  email?: string;
  phone?: string;
  image?: string;
  leagueId?: string;
  clubId?: string; // This will link the user to a specific club
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  // Additional fields for athletes
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  weight?: number;
  height?: number;
  belt?: string;
  beltAr?: string;
  fatherName?: string;
  motherName?: string;
  birthPlace?: string;
  bloodType?: string;
  updatedAt: Date;
}

export const UserRole = {
  ADMIN: 'admin',
  LEAGUE_PRESIDENT: 'league_president',
  LEAGUE_TECHNICAL_DIRECTOR: 'league_technical_director',
  TECHNICAL_DIRECTOR: 'technical_director',
  GENERAL_SECRETARY: 'general_secretary',
  TREASURER: 'treasurer',
  CLUB_PRESIDENT: 'club_president',
  COACH: 'coach',
  PHYSICAL_TRAINER: 'physical_trainer',
  CLUB_GENERAL_SECRETARY: 'club_general_secretary',
  CLUB_TREASURER: 'club_treasurer',
  MEDICAL_STAFF: 'medical_staff',
  ATHLETE: 'athlete'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Training data types
export interface TrainingData {
  maximum: {
    weeks: Array<{
      percentages: (number | null)[];
      heartRates: (number | null)[];
    }>;
  };
  high: {
    weeks: Array<{
      percentages: (number | null)[];
      heartRates: (number | null)[];
    }>;
  };
  medium: {
    weeks: Array<{
      percentages: (number | null)[];
      heartRates: (number | null)[];
    }>;
  };
}

// ===== Competitions (Tournaments) =====
export type CompetitionStatus = 'upcoming' | 'ongoing' | 'finished';

export type CompetitionLevel = 'national' | 'regional' | 'league';

export interface CompetitionCategory {
  id: string;        // e.g., 'ashbal_-50'
  name: string;      // e.g., 'U13 -50kg'
  nameAr: string;    // e.g., 'أشبال -50كغ'
}

export interface Competition {
  id: string;
  name: string;
  nameAr: string;
  leagueId?: string; // optional association to a league
  place?: string;
  placeAr?: string;
  description?: string;
  descriptionAr?: string;
  level?: CompetitionLevel; // national/regional/league
  wilayaId?: number;
  image?: string;    // cloudinary url
  registrationDeadline?: Date; // موعد انتهاء التسجيل
  // اختيارية: أوقات بصيغة HH:mm لدمجها مع التواريخ عند الحاجة
  registrationDeadlineTime?: string; // مثال: "17:30"
  startDate: Date;
  startTime?: string; // مثال: "09:00"
  endDate: Date;
  endTime?: string; // مثال: "18:00"
  status: CompetitionStatus;
  categories: string[]; // store by category id
  // الأوزان المختارة لكل فئة حسب الجنس. المفتاح هو معرف الفئة (id في categoryUtils) أو الاسم بالعربية، والقيم قوائم أوزان نصية مثل "-60", "+100"
  weights?: Record<string, { male: string[]; female: string[] }>;
  isActive: boolean;
  createdAt: Date;
}
