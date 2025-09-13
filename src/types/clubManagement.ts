// Comprehensive Club Management Types

import type { Club, Staff, Athlete, News } from './index';

// Extended club data for comprehensive management
export interface ClubManagementData extends Club {
  // Club Sections
  sections: ClubSection[];
  
  // Club Cards & Content
  cards: ClubCard[];
  
  // Club Tabs Configuration
  tabs: ClubTab[];
  
  // Detailed Personnel
  detailedStaff: DetailedStaff[];
  detailedAthletes: DetailedAthlete[];
  
  // Club Gallery
  gallery: GalleryItem[];
  
  // Club Achievements
  achievements: ClubAchievement[];
  
  // Club News & Updates
  clubNews: ClubNews[];
  
  // Club Documents
  documents: ClubDocument[];
  
  // Club Facilities
  facilities: ClubFacility[];
  
  // Club Schedule
  schedule: ClubSchedule[];
  
  // Club Statistics
  statistics: ClubStatistics;
  
  // Additional properties for comprehensive management
  website?: string;
  socialMedia?: string;
  keywords?: string;
  notes?: string;
}

// Club Sections
export interface ClubSection {
  id: string;
  type: SectionType;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  order: number;
  isActive: boolean;
  image?: string;
  icon?: string;
}

export const SectionType = {
  ABOUT: 'about',
  HISTORY: 'history',
  MISSION: 'mission',
  VISION: 'vision',
  VALUES: 'values',
  FACILITIES: 'facilities',
  TRAINING: 'training',
  COMPETITIONS: 'competitions',
  CONTACT: 'contact'
} as const;

export type SectionType = typeof SectionType[keyof typeof SectionType];

// Club Cards
export interface ClubCard {
  id: string;
  type: CardType;
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  content: string;
  contentAr: string;
  image?: string;
  icon?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

export const CardType = {
  FEATURE: 'feature',
  SERVICE: 'service',
  PROGRAM: 'program',
  EVENT: 'event',
  ANNOUNCEMENT: 'announcement',
  STATISTIC: 'statistic'
} as const;

export type CardType = typeof CardType[keyof typeof CardType];

// Club Tabs
export interface ClubTab {
  id: string;
  key: string;
  label: string;
  labelAr: string;
  icon: string;
  order: number;
  isActive: boolean;
  content?: TabContent;
}

export interface TabContent {
  type: 'staff' | 'athletes' | 'achievements' | 'gallery' | 'news' | 'schedule' | 'custom';
  data?: any;
  customContent?: string;
  customContentAr?: string;
}

// Detailed Staff with extended information
export interface DetailedStaff extends Staff {
  biography: string;
  biographyAr: string;
  qualifications: string[];
  qualificationsAr: string[];
  achievements: string[];
  achievementsAr: string[];
  socialLinks: SocialLink[];
  schedule?: StaffSchedule[];
  department: string;
  departmentAr: string;
  order: number;
}

// Detailed Athlete with extended information
export interface DetailedAthlete extends Athlete {
  biography: string;
  biographyAr: string;
  weightClass: string;
  weightClassAr: string;
  category: string;
  categoryAr: string;
  coach: string;
  trainingSchedule: string[];
  competitionHistory: CompetitionRecord[];
  socialLinks: SocialLink[];
  gallery: string[];
  order: number;
}

// Gallery Items
export interface GalleryItem {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  image: string;
  thumbnail: string;
  category: GalleryCategory;
  date: Date;
  tags: string[];
  isFeatured: boolean;
  order: number;
}

export const GalleryCategory = {
  TRAINING: 'training',
  COMPETITION: 'competition',
  EVENT: 'event',
  FACILITY: 'facility',
  TEAM: 'team',
  AWARDS: 'awards'
} as const;

export type GalleryCategory = typeof GalleryCategory[keyof typeof GalleryCategory];

// Club Achievements
export interface ClubAchievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: AchievementCategory;
  year: number;
  position?: string;
  positionAr?: string;
  image?: string;
  athletes?: string[];
  staff?: string[];
  isFeatured: boolean;
  order: number;
}

export const AchievementCategory = {
  NATIONAL: 'national',
  REGIONAL: 'regional',
  LOCAL: 'local',
  INTERNATIONAL: 'international',
  CHAMPIONSHIP: 'championship',
  TOURNAMENT: 'tournament',
  CUP: 'cup'
} as const;

export type AchievementCategory = typeof AchievementCategory[keyof typeof AchievementCategory];

// Club News
export interface ClubNews extends News {
  category: NewsCategory;
  priority: NewsPriority;
  expiryDate?: Date;
  gallery?: string[];
  attachments?: string[];
}

export const NewsCategory = {
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event',
  RESULT: 'result',
  UPDATE: 'update',
  GENERAL: 'general'
} as const;

export type NewsCategory = typeof NewsCategory[keyof typeof NewsCategory];

export const NewsPriority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
} as const;

export type NewsPriority = typeof NewsPriority[keyof typeof NewsPriority];

// Club Documents
export interface ClubDocument {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  fileUrl: string;
  fileType: string;
  category: DocumentCategory;
  uploadDate: Date;
  version: string;
  isPublic: boolean;
  downloadCount: number;
}

export const DocumentCategory = {
  REGULATIONS: 'regulations',
  FORMS: 'forms',
  REPORTS: 'reports',
  CERTIFICATES: 'certificates',
  POLICIES: 'policies',
  OTHER: 'other'
} as const;

export type DocumentCategory = typeof DocumentCategory[keyof typeof DocumentCategory];

// Club Facilities
export interface ClubFacility {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: FacilityType;
  capacity?: number;
  equipment: string[];
  equipmentAr: string[];
  images: string[];
  schedule?: FacilitySchedule[];
  isActive: boolean;
  order: number;
}

export const FacilityType = {
  DOJO: 'dojo',
  GYM: 'gym',
  WEIGHT_ROOM: 'weight_room',
  CHANGING_ROOM: 'changing_room',
  OFFICE: 'office',
  MEETING_ROOM: 'meeting_room',
  STORAGE: 'storage',
  MEDICAL_ROOM: 'medical_room'
} as const;

export type FacilityType = typeof FacilityType[keyof typeof FacilityType];

// Club Schedule
export interface ClubSchedule {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  type: ScheduleType;
  startDate: Date;
  endDate: Date;
  recurring?: RecurringSchedule;
  location: string;
  locationAr: string;
  instructor?: string;
  maxParticipants?: number;
  isActive: boolean;
}

export const ScheduleType = {
  TRAINING: 'training',
  COMPETITION: 'competition',
  EVENT: 'event',
  MEETING: 'meeting',
  WORKSHOP: 'workshop',
  CAMP: 'camp'
} as const;

export type ScheduleType = typeof ScheduleType[keyof typeof ScheduleType];

export interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

// Club Statistics
export interface ClubStatistics {
  totalMembers: number;
  totalAthletes: number;
  totalStaff: number;
  totalAchievements: number;
  totalEvents: number;
  totalNews: number;
  totalGalleryItems: number;
  totalDocuments: number;
  lastUpdated: Date;
}

// Social Links
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Competition Records
export interface CompetitionRecord {
  competition: string;
  competitionAr: string;
  date: Date;
  result: string;
  resultAr: string;
  category: string;
  categoryAr: string;
  medal?: string;
  medalAr?: string;
}

// Staff Schedule
export interface StaffSchedule {
  day: string;
  dayAr: string;
  startTime: string;
  endTime: string;
  activity: string;
  activityAr: string;
}

// Facility Schedule
export interface FacilitySchedule {
  day: string;
  dayAr: string;
  startTime: string;
  endTime: string;
  activity: string;
  activityAr: string;
  capacity: number;
}

// Form Data Types for Dashboard
export interface ClubFormData {
  basicInfo: Partial<Club>;
  sections: ClubSection[];
  cards: ClubCard[];
  tabs: ClubTab[];
  staff: DetailedStaff[];
  athletes: DetailedAthlete[];
  gallery: GalleryItem[];
  achievements: ClubAchievement[];
  news: ClubNews[];
  documents: ClubDocument[];
  facilities: ClubFacility[];
  schedule: ClubSchedule[];
}

// Dashboard State Management
export interface DashboardState {
  currentClub: ClubManagementData | null;
  isLoading: boolean;
  isSaving: boolean;
  activeTab: string;
  unsavedChanges: boolean;
  validationErrors: Record<string, string>;
}

// API Response Types
export interface ClubManagementResponse {
  success: boolean;
  club: ClubManagementData;
  message?: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: Record<string, string>;
}
