// Medical Types and Interfaces

export interface MedicalRecord {
  id: string;
  athleteId: string;
  date: Date;
  type: 'checkup' | 'injury' | 'treatment' | 'assessment';
  notes?: string;
}

export interface DailyWellness {
  id: string;
  athleteId: string;
  date: Date;
  wellnessScore: number;
  sleepQuality: number;
  fatigueLevel: number;
  muscleSoreness: number;
  stressLevel: number;
  mood: number;
  additionalNotes?: string;
}

export interface Injury {
  id: string;
  athleteId: string;
  injuryLocation: BodyPart;
  injuryType: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: InjuryStatus;
  painLevel: number;
  reportDate: Date;
  recoveryDate?: Date;
  treatmentNotes?: string;
}

// Extend Injury shape used in services/components when extra fields are needed
export type InjuryRecord = Injury & {
  expectedReturnDate?: Date;
};

export interface Treatment {
  id: string;
  injuryId: string;
  treatmentType: string;
  startDate: Date;
  endDate?: Date;
  // عدد الأيام المتوقع للعلاج؛ يُستخدم لحساب "الأيام المتبقية" إن لم تُحدد endDate
  expectedDuration?: number;
  frequency: string;
  notes?: string;
}

export interface RestPeriod {
  id: string;
  athleteId: string;
  startDate: Date;
  endDate: Date;
  restType: RestType;
  reason: string;
  approvedBy: string;
}

export interface MedicalAppointment {
  id: string;
  athleteId: string;
  appointmentType: AppointmentType;
  date: Date;
  time: string;
  location: string;
  doctorName: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface PhysicalExam {
  id: string;
  athleteId: string;
  date: Date;
  height: number;
  weight: number;
  bloodPressure: string;
  heartRate: number;
  visionTest: string;
  notes?: string;
}

// Minimal medical profile used by services
export interface MedicalProfile {
  id?: string;
  athleteId: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  updatedAt?: Date;
}

// Simple physical test entry used by services
export interface PhysicalTest {
  id: string;
  date: Date;
  testName: string;
  result: number | string;
  unit?: string;
  notes?: string;
}

// Training load entry used by services
export interface TrainingLoadEntry {
  id: string;
  date: Date;
  duration: number; // minutes
  rpe: number; // 1-10
  trainingLoad: number; // computed: duration * rpe
}

// Competition entry used by services
export interface CompetitionEntry {
  id: string;
  date: Date;
  name?: string;
  location?: string;
  result?: string;
}

// Enum types
export type BodyPart = 
  | 'head' 
  | 'neck' 
  | 'shoulder' 
  | 'elbow' 
  | 'wrist' 
  | 'hand' 
  | 'chest' 
  | 'back' 
  | 'abdomen' 
  | 'hip' 
  | 'thigh' 
  | 'knee' 
  | 'calf' 
  | 'ankle' 
  | 'foot';

// Provide both value and type for InjuryStatus so it can be used at runtime and for typing
export const InjuryStatus = {
  ACTIVE: 'active',
  RECOVERING: 'recovering',
  RECOVERED: 'recovered',
  CHRONIC: 'chronic'
} as const;
export type InjuryStatus = typeof InjuryStatus[keyof typeof InjuryStatus];

export type RestType = 
  | 'injury' 
  | 'illness' 
  | 'fatigue' 
  | 'medical' 
  | 'personal';

export type AppointmentType = 
  | 'checkup' 
  | 'specialist' 
  | 'imaging' 
  | 'therapy' 
  | 'followup';

// Wellness tracking
export interface WellnessTrend {
  date: Date;
  wellnessScore: number;
  sleepQuality: number;
  fatigueLevel: number;
  muscleSoreness: number;
  stressLevel: number;
  mood: number;
}

// Medical alerts
export interface MedicalAlert {
  id: string;
  athleteId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredDate: Date;
  resolvedDate?: Date;
  category: 'wellness' | 'injury' | 'performance' | 'medical';
}

// Alerts used by wellness system
export const AlertType = {
  LOW_WELLNESS_SCORE: 'LOW_WELLNESS_SCORE',
  OVERTRAINING_RISK: 'OVERTRAINING_RISK',
  INJURY_REPORTED: 'INJURY_REPORTED',
  HIGH_PAIN_LEVEL: 'HIGH_PAIN_LEVEL',
  POOR_SLEEP_QUALITY: 'POOR_SLEEP_QUALITY',
  HIGH_FATIGUE: 'HIGH_FATIGUE',
  HIGH_STRESS: 'HIGH_STRESS'
} as const;

export const AlertSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];
export type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

// Wellness alert item
export interface WellnessAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggeredDate: Date;
}

// Wellness report returned by service
export interface WellnessReport {
  athleteId: string;
  period: { start: Date; end: Date };
  averageWellnessScore: number;
  wellnessTrend: 'improving' | 'stable' | 'declining';
  alerts: WellnessAlert[];
  recommendations: string[];
}

// Medical history summary
export interface MedicalHistory {
  athleteId: string;
  totalInjuries: number;
  activeInjuries: number;
  lastCheckup: Date;
  wellnessTrend: WellnessTrend[];
  recentAlerts: MedicalAlert[];
}

// API response types
export interface MedicalApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
