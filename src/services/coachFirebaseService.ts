import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types for coach dashboard data
export interface CoachPersonalSection {
  id: string;
  clubId: string;
  coachId: string;
  type: 'technical_card' | 'achievements' | 'experience' | 'education' | 'projects' | 'testimonials' | 'custom';
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AthleteRosterData {
  id: string;
  athleteId: string;
  clubId: string;
  coachId: string;
  position?: string;
  notes?: string;
  joinDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceRecord {
  id: string;
  athleteId: string;
  clubId: string;
  coachId: string;
  date: Date;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
  sessionType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeeklySchedule {
  id: string;
  clubId: string;
  coachId: string;
  weekStartDate: Date;
  schedule: {
    [key: string]: { // day of week (monday, tuesday, etc.)
      sessions: {
        id: string;
        startTime: string;
        endTime: string;
        type: string;
        description: string;
        location?: string;
        targetGroup?: string;
      }[];
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SessionEvaluation {
  id: string;
  clubId: string;
  coachId: string;
  sessionDate: Date;
  sessionType: string;
  duration: number; // minutes
  participantsCount: number;
  objectives: string[];
  accomplishedObjectives: string[];
  difficulties: string[];
  notes: string;
  rating: number; // 1-5
  athleteEvaluations?: {
    athleteId: string;
    performance: number; // 1-5
    notes: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnnualPlan {
  id: string;
  clubId: string;
  coachId: string;
  year: number;
  phases: {
    id: string;
    name: string;
    nameAr: string;
    startDate: Date;
    endDate: Date;
    objectives: string[];
    focus: string[];
    trainingLoad: number; // 1-5
    competitions?: string[];
  }[];
  goals: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TechnicalCard {
  id: string;
  clubId: string;
  coachId: string;
  personalInfo: {
    name: string;
    nameAr: string;
    position: string;
    positionAr: string;
    experience: number;
    certifications: string[];
    specializations: string[];
  };
  achievements: {
    id: string;
    title: string;
    titleAr: string;
    date: Date;
    description: string;
    descriptionAr: string;
    type: 'certification' | 'competition' | 'training' | 'other';
  }[];
  skills: {
    technical: { skill: string; level: number }[];
    tactical: { skill: string; level: number }[];
    physical: { skill: string; level: number }[];
    mental: { skill: string; level: number }[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainingLoad {
  id: string;
  clubId: string;
  coachId: string;
  athleteId: string;
  date: Date;
  sessionType: string;
  duration: number; // minutes
  intensity: number; // 1-10
  load: number; // calculated: duration * intensity
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CoachFirebaseService {
  // === Personal Sections Management ===
  
  static async getPersonalSections(clubId: string, coachId: string): Promise<CoachPersonalSection[]> {
    try {
      const q = query(
        collection(db, 'coach_personal_sections'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as CoachPersonalSection));
      // Sort client-side by 'order' ascending
      return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
      console.error('Error fetching personal sections:', error);
      return [];
    }
  }

  static async savePersonalSection(section: Omit<CoachPersonalSection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_personal_sections'));
      const sectionData = {
        ...section,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, sectionData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving personal section:', error);
      throw error;
    }
  }

  static async updatePersonalSection(sectionId: string, updates: Partial<CoachPersonalSection>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_personal_sections', sectionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating personal section:', error);
      throw error;
    }
  }

  static async deletePersonalSection(sectionId: string): Promise<void> {
    try {
      const docRef = doc(db, 'coach_personal_sections', sectionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting personal section:', error);
      throw error;
    }
  }

  // === Athlete Roster Management ===
  
  static async getAthleteRoster(clubId: string, coachId: string): Promise<AthleteRosterData[]> {
    try {
      const q = query(
        collection(db, 'coach_athlete_roster'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as AthleteRosterData));
    } catch (error) {
      console.error('Error fetching athlete roster:', error);
      return [];
    }
  }

  static async addAthleteToRoster(data: Omit<AthleteRosterData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_athlete_roster'));
      const rosterData = {
        ...data,
        joinDate: Timestamp.fromDate(data.joinDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, rosterData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding athlete to roster:', error);
      throw error;
    }
  }

  static async updateAthleteRoster(rosterId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_athlete_roster', rosterId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.joinDate) {
        updateData.joinDate = Timestamp.fromDate(updates.joinDate as Date);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating athlete roster:', error);
      throw error;
    }
  }

  static async removeAthleteFromRoster(rosterId: string): Promise<void> {
    try {
      const docRef = doc(db, 'coach_athlete_roster', rosterId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing athlete from roster:', error);
      throw error;
    }
  }

  // === Attendance Management ===
  
  static async getAttendanceRecords(clubId: string, coachId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]> {
    try {
      let q = query(
        collection(db, 'coach_attendance'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId)
      );
      
      const querySnapshot = await getDocs(q);
      let records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as AttendanceRecord));

      // Filter by date range if provided
      if (startDate && endDate) {
        records = records.filter(record => 
          record.date >= startDate && record.date <= endDate
        );
      }

      // Sort client-side by date desc
      return records.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  }

  static async saveAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_attendance'));
      const recordData = {
        ...record,
        date: Timestamp.fromDate(record.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, recordData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving attendance record:', error);
      throw error;
    }
  }

  static async updateAttendanceRecord(recordId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_attendance', recordId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date as Date);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  }

  static async deleteAttendanceRecord(recordId: string): Promise<void> {
    try {
      const docRef = doc(db, 'coach_attendance', recordId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  }

  // === Weekly Schedule Management ===
  
  static async getWeeklySchedule(clubId: string, coachId: string, weekStartDate: Date): Promise<WeeklySchedule | null> {
    try {
      const q = query(
        collection(db, 'coach_weekly_schedule'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId),
        where('weekStartDate', '==', Timestamp.fromDate(weekStartDate))
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        weekStartDate: doc.data().weekStartDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as WeeklySchedule;
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      return null;
    }
  }

  static async saveWeeklySchedule(schedule: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_weekly_schedule'));
      const scheduleData = {
        ...schedule,
        weekStartDate: Timestamp.fromDate(schedule.weekStartDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, scheduleData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving weekly schedule:', error);
      throw error;
    }
  }

  static async updateWeeklySchedule(scheduleId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_weekly_schedule', scheduleId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.weekStartDate) {
        updateData.weekStartDate = Timestamp.fromDate(updates.weekStartDate as Date);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating weekly schedule:', error);
      throw error;
    }
  }

  // === Session Evaluation Management ===
  
  static async getSessionEvaluations(clubId: string, coachId: string, startDate?: Date, endDate?: Date): Promise<SessionEvaluation[]> {
    try {
      let q = query(
        collection(db, 'coach_session_evaluations'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId)
      );
      
      const querySnapshot = await getDocs(q);
      let evaluations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sessionDate: doc.data().sessionDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as SessionEvaluation));

      // Filter by date range if provided
      if (startDate && endDate) {
        evaluations = evaluations.filter(evaluation => 
          evaluation.sessionDate >= startDate && evaluation.sessionDate <= endDate
        );
      }

      // Sort client-side by sessionDate desc
      return evaluations.sort((a, b) => (b.sessionDate?.getTime() || 0) - (a.sessionDate?.getTime() || 0));
    } catch (error) {
      console.error('Error fetching session evaluations:', error);
      return [];
    }
  }

  static async saveSessionEvaluation(evaluation: Omit<SessionEvaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_session_evaluations'));
      const evaluationData = {
        ...evaluation,
        sessionDate: Timestamp.fromDate(evaluation.sessionDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, evaluationData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving session evaluation:', error);
      throw error;
    }
  }

  static async updateSessionEvaluation(evaluationId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_session_evaluations', evaluationId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.sessionDate) {
        updateData.sessionDate = Timestamp.fromDate(updates.sessionDate as Date);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating session evaluation:', error);
      throw error;
    }
  }

  static async deleteSessionEvaluation(evaluationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'coach_session_evaluations', evaluationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting session evaluation:', error);
      throw error;
    }
  }

  // === Annual Plan Management ===
  
  static async getAnnualPlan(clubId: string, coachId: string, year: number): Promise<AnnualPlan | null> {
    try {
      const q = query(
        collection(db, 'coach_annual_plans'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId),
        where('year', '==', year)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        phases: data.phases.map((phase: any) => ({
          ...phase,
          startDate: phase.startDate?.toDate(),
          endDate: phase.endDate?.toDate()
        })),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as AnnualPlan;
    } catch (error) {
      console.error('Error fetching annual plan:', error);
      return null;
    }
  }

  static async saveAnnualPlan(plan: Omit<AnnualPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_annual_plans'));
      const planData = {
        ...plan,
        phases: plan.phases.map(phase => ({
          ...phase,
          startDate: Timestamp.fromDate(phase.startDate),
          endDate: Timestamp.fromDate(phase.endDate)
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, planData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving annual plan:', error);
      throw error;
    }
  }

  static async updateAnnualPlan(planId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_annual_plans', planId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.phases) {
        updateData.phases = updates.phases.map((phase: any) => ({
          ...phase,
          startDate: Timestamp.fromDate(phase.startDate as Date),
          endDate: Timestamp.fromDate(phase.endDate as Date)
        }));
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating annual plan:', error);
      throw error;
    }
  }

  // === Technical Card Management ===
  
  static async getTechnicalCard(clubId: string, coachId: string): Promise<TechnicalCard | null> {
    try {
      const q = query(
        collection(db, 'coach_technical_cards'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        achievements: data.achievements?.map((achievement: any) => ({
          ...achievement,
          date: achievement.date?.toDate()
        })) || [],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as TechnicalCard;
    } catch (error) {
      console.error('Error fetching technical card:', error);
      return null;
    }
  }

  static async saveTechnicalCard(card: Omit<TechnicalCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_technical_cards'));
      const cardData = {
        ...card,
        achievements: card.achievements.map(achievement => ({
          ...achievement,
          date: Timestamp.fromDate(achievement.date)
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, cardData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving technical card:', error);
      throw error;
    }
  }

  static async updateTechnicalCard(cardId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_technical_cards', cardId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.achievements) {
        updateData.achievements = updates.achievements.map((achievement: any) => ({
          ...achievement,
          date: Timestamp.fromDate(achievement.date as Date)
        }));
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating technical card:', error);
      throw error;
    }
  }

  // === Training Load Management ===
  
  static async getTrainingLoads(clubId: string, coachId: string, athleteId?: string, startDate?: Date, endDate?: Date): Promise<TrainingLoad[]> {
    try {
      let q = query(
        collection(db, 'coach_training_loads'),
        where('clubId', '==', clubId),
        where('coachId', '==', coachId)
      );
      
      const querySnapshot = await getDocs(q);
      let loads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as TrainingLoad));

      // Filter by athlete if provided
      if (athleteId) {
        loads = loads.filter(load => load.athleteId === athleteId);
      }

      // Filter by date range if provided
      if (startDate && endDate) {
        loads = loads.filter(load => 
          load.date >= startDate && load.date <= endDate
        );
      }

      // Sort client-side by date desc
      return loads.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    } catch (error) {
      console.error('Error fetching training loads:', error);
      return [];
    }
  }

  static async saveTrainingLoad(load: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(collection(db, 'coach_training_loads'));
      const loadData = {
        ...load,
        date: Timestamp.fromDate(load.date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(docRef, loadData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving training load:', error);
      throw error;
    }
  }

  static async updateTrainingLoad(loadId: string, updates: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, 'coach_training_loads', loadId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date as Date);
      }
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating training load:', error);
      throw error;
    }
  }

  static async deleteTrainingLoad(loadId: string): Promise<void> {
    try {
      const docRef = doc(db, 'coach_training_loads', loadId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting training load:', error);
      throw error;
    }
  }

  // === Batch Operations ===
  
  static async batchSaveAttendance(records: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const ids: string[] = [];
      
      records.forEach(record => {
        const docRef = doc(collection(db, 'coach_attendance'));
        const recordData = {
          ...record,
          date: Timestamp.fromDate(record.date),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        batch.set(docRef, recordData);
        ids.push(docRef.id);
      });
      
      await batch.commit();
      return ids;
    } catch (error) {
      console.error('Error batch saving attendance:', error);
      throw error;
    }
  }

  static async batchSaveTrainingLoads(loads: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const ids: string[] = [];
      
      loads.forEach(load => {
        const docRef = doc(collection(db, 'coach_training_loads'));
        const loadData = {
          ...load,
          date: Timestamp.fromDate(load.date),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        batch.set(docRef, loadData);
        ids.push(docRef.id);
      });
      
      await batch.commit();
      return ids;
    } catch (error) {
      console.error('Error batch saving training loads:', error);
      throw error;
    }
  }

  // === Real-time Subscriptions ===
  
  static subscribeToPersonalSections(
    clubId: string, 
    coachId: string, 
    callback: (sections: CoachPersonalSection[]) => void
  ): () => void {
    const q = query(
      collection(db, 'coach_personal_sections'),
      where('clubId', '==', clubId),
      where('coachId', '==', coachId),
      where('isActive', '==', true)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const sections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as CoachPersonalSection)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      
      callback(sections);
    });
  }

  static subscribeToAthleteRoster(
    clubId: string, 
    coachId: string, 
    callback: (roster: AthleteRosterData[]) => void
  ): () => void {
    const q = query(
      collection(db, 'coach_athlete_roster'),
      where('clubId', '==', clubId),
      where('coachId', '==', coachId),
      where('isActive', '==', true)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const roster = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as AthleteRosterData));
      
      callback(roster);
    });
  }

  // === Utility Methods ===
  
  static generateId(): string {
    return doc(collection(db, 'temp')).id;
  }
}