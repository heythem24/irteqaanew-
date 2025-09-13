// Firestore Models for Dynamic Dashboard System
// This file contains the complete data models for Firestore integration

import { Timestamp } from 'firebase/firestore';

// Base interfaces for common fields
interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// User Management
export interface User extends BaseEntity {
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  permissions: Permission[];
  clubId?: string;
  leagueId?: string;
  lastLoginAt?: Timestamp;
  isEmailVerified: boolean;
}

export type UserRole = 
  | 'super_admin'
  | 'league_president'
  | 'league_general_secretary'
  | 'league_treasurer'
  | 'club_president'
  | 'club_general_secretary'
  | 'club_treasurer'
  | 'club_technical_director'
  | 'coach'
  | 'physical_trainer'
  | 'athlete'
  | 'staff_member';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  conditions?: Record<string, any>;
}

// Club Management
export interface Club extends BaseEntity {
  name: string;
  nameAr: string;
  leagueId: string;
  sportId: string;
  description?: string;
  descriptionAr?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  logo?: string;
  establishedYear?: number;
  colors?: {
    primary: string;
    secondary: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  statistics: ClubStatistics;
  settings: ClubSettings;
}

export interface ClubStatistics {
  totalMembers: number;
  totalAthletes: number;
  totalStaff: number;
  totalSections: number;
  totalAchievements: number;
  lastUpdated: Timestamp;
}

export interface ClubSettings {
  allowPublicRegistration: boolean;
  requireApproval: boolean;
  defaultMemberRole: UserRole;
  notificationPreferences: NotificationPreferences;
}

// League Management
export interface League extends BaseEntity {
  name: string;
  nameAr: string;
  wilayaId: number;
  wilayaName: string;
  wilayaNameAr: string;
  sportId: string;
  description?: string;
  descriptionAr?: string;
  logo?: string;
  contactInfo: {
    email: string;
    phone: string;
    address?: string;
  };
  settings: LeagueSettings;
}

export interface LeagueSettings {
  maxClubs: number;
  allowClubCreation: boolean;
  requireApproval: boolean;
  defaultClubSettings: ClubSettings;
}

// Staff Management
export interface Staff extends BaseEntity {
  userId: string;
  clubId: string;
  role: UserRole;
  position: string;
  positionAr?: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  permissions: Permission[];
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact?: string;
  };
  qualifications?: string[];
  experience?: string;
}

// Athlete Management
export interface Athlete extends BaseEntity {
  userId: string;
  clubId: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female';
  nationality: string;
  belt?: {
    current: string;
    currentAr?: string;
    dateAwarded?: Timestamp;
    awardedBy?: string;
  };
  weight?: number;
  height?: number;
  category: string;
  sectionId?: string;
  coachId?: string;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    emergencyContact?: string;
  };
  statistics: AthleteStatistics;
}

export interface AthleteStatistics {
  totalTrainings: number;
  totalCompetitions: number;
  totalWins: number;
  totalLosses: number;
  currentRanking?: number;
  lastUpdated: Timestamp;
}

// Section Management
export interface Section extends BaseEntity {
  clubId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  capacity: number;
  currentMembers: number;
  ageRange: {
    min: number;
    max: number;
  };
  schedule: Schedule[];
  coachId?: string;
  requirements?: string[];
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}

// Achievement Management
export interface Achievement extends BaseEntity {
  clubId: string;
  athleteId?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  type: 'tournament' | 'competition' | 'certification' | 'award';
  date: Timestamp;
  level: 'local' | 'regional' | 'national' | 'international';
  ranking?: number;
  certificateUrl?: string;
  images?: string[];
}

// Notification System
export interface Notification extends BaseEntity {
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Timestamp;
  actionUrl?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

// Audit Log
export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Real-time Data Sync
export interface RealtimeSubscription {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  filters?: Record<string, any>;
  lastSync: Timestamp;
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  userId: string;
  layout: DashboardLayout;
  widgets: WidgetConfig[];
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en' | 'fr';
  refreshInterval: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, any>;
  }>;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  titleAr?: string;
  dataSource: string;
  refreshInterval: number;
  filters?: Record<string, any>;
  displayOptions: Record<string, any>;
}

// Competition Management
export interface Competition extends BaseEntity {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  registrationDeadline: Timestamp;
  location: string;
  locationAr?: string;
  type: 'national' | 'regional' | 'provincial' | 'local';
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnailUrl?: string;
  organizerId: string;
  categories: Category[];
  settings: CompetitionSettings;
}

export interface Category extends BaseEntity {
  competitionId: string;
  name: string;
  nameAr?: string;
  weightClass?: string;
  weightClassAr?: string;
  ageGroup?: string;
  ageGroupAr?: string;
  gender?: 'male' | 'female' | 'mixed';
  bracket: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss_system';
  participants: string[]; // athleteIds
  matches: Match[];
}

export interface Match {
  id: string;
  round: number;
  order: number;
  participants: string[]; // athleteIds
  winner?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'scheduled' | 'in_progress' | 'completed';
  score?: Record<string, any>;
}

export interface CompetitionSettings {
  allowOnlineRegistration: boolean;
  maxParticipants: number;
  requireMedicalCertificate: boolean;
  allowLiveUpdates: boolean;
  notificationPreferences: NotificationPreferences;
}

// Data Migration
export interface MigrationRecord extends BaseEntity {
  source: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  startedAt: Timestamp;
  completedAt?: Timestamp;
}