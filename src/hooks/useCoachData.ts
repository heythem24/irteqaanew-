import { useState, useEffect, useCallback } from 'react';
import { CoachFirebaseService } from '../services/coachFirebaseService';
import type {
  CoachPersonalSection,
  AthleteRosterData,
  AttendanceRecord,
  WeeklySchedule,
  SessionEvaluation,
  AnnualPlan,
  TechnicalCard,
  TrainingLoad
} from '../services/coachFirebaseService';

export interface UseCoachDataOptions {
  clubId: string;
  coachId: string;
  enableRealtime?: boolean;
}

export interface UseCoachDataReturn {
  // Personal Sections
  personalSections: CoachPersonalSection[];
  loadingPersonalSections: boolean;
  savePersonalSection: (section: Omit<CoachPersonalSection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePersonalSection: (sectionId: string, updates: Partial<CoachPersonalSection>) => Promise<void>;
  deletePersonalSection: (sectionId: string) => Promise<void>;

  // Athlete Roster
  athleteRoster: AthleteRosterData[];
  loadingAthleteRoster: boolean;
  addAthleteToRoster: (data: Omit<AthleteRosterData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAthleteRoster: (rosterId: string, updates: Partial<AthleteRosterData>) => Promise<void>;
  removeAthleteFromRoster: (rosterId: string) => Promise<void>;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  loadingAttendance: boolean;
  getAttendance: (startDate?: Date, endDate?: Date) => Promise<void>;
  saveAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAttendanceRecord: (recordId: string, updates: Partial<AttendanceRecord>) => Promise<void>;
  deleteAttendanceRecord: (recordId: string) => Promise<void>;
  batchSaveAttendance: (records: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<string[]>;

  // Weekly Schedule
  weeklySchedule: WeeklySchedule | null;
  loadingWeeklySchedule: boolean;
  getWeeklySchedule: (weekStartDate: Date) => Promise<void>;
  saveWeeklySchedule: (schedule: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateWeeklySchedule: (scheduleId: string, updates: Partial<WeeklySchedule>) => Promise<void>;

  // Session Evaluations
  sessionEvaluations: SessionEvaluation[];
  loadingSessionEvaluations: boolean;
  getSessionEvaluations: (startDate?: Date, endDate?: Date) => Promise<void>;
  saveSessionEvaluation: (evaluation: Omit<SessionEvaluation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSessionEvaluation: (evaluationId: string, updates: Partial<SessionEvaluation>) => Promise<void>;
  deleteSessionEvaluation: (evaluationId: string) => Promise<void>;

  // Annual Plan
  annualPlan: AnnualPlan | null;
  loadingAnnualPlan: boolean;
  getAnnualPlan: (year: number) => Promise<void>;
  saveAnnualPlan: (plan: Omit<AnnualPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAnnualPlan: (planId: string, updates: Partial<AnnualPlan>) => Promise<void>;

  // Technical Card
  technicalCard: TechnicalCard | null;
  loadingTechnicalCard: boolean;
  getTechnicalCard: () => Promise<void>;
  saveTechnicalCard: (card: Omit<TechnicalCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTechnicalCard: (cardId: string, updates: Partial<TechnicalCard>) => Promise<void>;

  // Training Loads
  trainingLoads: TrainingLoad[];
  loadingTrainingLoads: boolean;
  getTrainingLoads: (athleteId?: string, startDate?: Date, endDate?: Date) => Promise<void>;
  saveTrainingLoad: (load: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTrainingLoad: (loadId: string, updates: Partial<TrainingLoad>) => Promise<void>;
  deleteTrainingLoad: (loadId: string) => Promise<void>;
  batchSaveTrainingLoads: (loads: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<string[]>;

  // General
  refreshAll: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export const useCoachData = ({
  clubId,
  coachId,
  enableRealtime = false
}: UseCoachDataOptions): UseCoachDataReturn => {
  // State
  const [personalSections, setPersonalSections] = useState<CoachPersonalSection[]>([]);
  const [loadingPersonalSections, setLoadingPersonalSections] = useState(false);

  const [athleteRoster, setAthleteRoster] = useState<AthleteRosterData[]>([]);
  const [loadingAthleteRoster, setLoadingAthleteRoster] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [loadingWeeklySchedule, setLoadingWeeklySchedule] = useState(false);

  const [sessionEvaluations, setSessionEvaluations] = useState<SessionEvaluation[]>([]);
  const [loadingSessionEvaluations, setLoadingSessionEvaluations] = useState(false);

  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null);
  const [loadingAnnualPlan, setLoadingAnnualPlan] = useState(false);

  const [technicalCard, setTechnicalCard] = useState<TechnicalCard | null>(null);
  const [loadingTechnicalCard, setLoadingTechnicalCard] = useState(false);

  const [trainingLoads, setTrainingLoads] = useState<TrainingLoad[]>([]);
  const [loadingTrainingLoads, setLoadingTrainingLoads] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Error handling
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    setError(`حدث خطأ في ${operation}: ${error.message || 'خطأ غير معروف'}`);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Personal Sections
  const loadPersonalSections = useCallback(async () => {
    setLoadingPersonalSections(true);
    try {
      const sections = await CoachFirebaseService.getPersonalSections(clubId, coachId);
      setPersonalSections(sections);
    } catch (error) {
      handleError(error, 'تحميل الأقسام الشخصية');
    } finally {
      setLoadingPersonalSections(false);
    }
  }, [clubId, coachId, handleError]);

  const savePersonalSection = useCallback(async (section: Omit<CoachPersonalSection, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.savePersonalSection({
        ...section,
        clubId,
        coachId
      });
      await loadPersonalSections(); // Refresh list
      return id;
    } catch (error) {
      handleError(error, 'حفظ القسم الشخصي');
      throw error;
    }
  }, [clubId, coachId, loadPersonalSections, handleError]);

  const updatePersonalSection = useCallback(async (sectionId: string, updates: Partial<CoachPersonalSection>) => {
    try {
      await CoachFirebaseService.updatePersonalSection(sectionId, updates);
      await loadPersonalSections(); // Refresh list
    } catch (error) {
      handleError(error, 'تحديث القسم الشخصي');
      throw error;
    }
  }, [loadPersonalSections, handleError]);

  const deletePersonalSection = useCallback(async (sectionId: string) => {
    try {
      await CoachFirebaseService.deletePersonalSection(sectionId);
      await loadPersonalSections(); // Refresh list
    } catch (error) {
      handleError(error, 'حذف القسم الشخصي');
      throw error;
    }
  }, [loadPersonalSections, handleError]);

  // Athlete Roster
  const loadAthleteRoster = useCallback(async () => {
    setLoadingAthleteRoster(true);
    try {
      const roster = await CoachFirebaseService.getAthleteRoster(clubId, coachId);
      setAthleteRoster(roster);
    } catch (error) {
      handleError(error, 'تحميل قائمة الرياضيين');
    } finally {
      setLoadingAthleteRoster(false);
    }
  }, [clubId, coachId, handleError]);

  const addAthleteToRoster = useCallback(async (data: Omit<AthleteRosterData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.addAthleteToRoster({
        ...data,
        clubId,
        coachId
      });
      await loadAthleteRoster(); // Refresh list
      return id;
    } catch (error) {
      handleError(error, 'إضافة رياضي للقائمة');
      throw error;
    }
  }, [clubId, coachId, loadAthleteRoster, handleError]);

  const updateAthleteRoster = useCallback(async (rosterId: string, updates: Partial<AthleteRosterData>) => {
    try {
      await CoachFirebaseService.updateAthleteRoster(rosterId, updates);
      await loadAthleteRoster(); // Refresh list
    } catch (error) {
      handleError(error, 'تحديث قائمة الرياضيين');
      throw error;
    }
  }, [loadAthleteRoster, handleError]);

  const removeAthleteFromRoster = useCallback(async (rosterId: string) => {
    try {
      await CoachFirebaseService.removeAthleteFromRoster(rosterId);
      await loadAthleteRoster(); // Refresh list
    } catch (error) {
      handleError(error, 'إزالة رياضي من القائمة');
      throw error;
    }
  }, [loadAthleteRoster, handleError]);

  // Attendance
  const getAttendance = useCallback(async (startDate?: Date, endDate?: Date) => {
    setLoadingAttendance(true);
    try {
      const records = await CoachFirebaseService.getAttendanceRecords(clubId, coachId, startDate, endDate);
      setAttendanceRecords(records);
    } catch (error) {
      handleError(error, 'تحميل سجلات الحضور');
    } finally {
      setLoadingAttendance(false);
    }
  }, [clubId, coachId, handleError]);

  const saveAttendanceRecord = useCallback(async (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveAttendanceRecord({
        ...record,
        clubId,
        coachId
      });
      await getAttendance(); // Refresh list
      return id;
    } catch (error) {
      handleError(error, 'حفظ سجل الحضور');
      throw error;
    }
  }, [clubId, coachId, getAttendance, handleError]);

  const updateAttendanceRecord = useCallback(async (recordId: string, updates: Partial<AttendanceRecord>) => {
    try {
      await CoachFirebaseService.updateAttendanceRecord(recordId, updates);
      await getAttendance(); // Refresh list
    } catch (error) {
      handleError(error, 'تحديث سجل الحضور');
      throw error;
    }
  }, [getAttendance, handleError]);

  const deleteAttendanceRecord = useCallback(async (recordId: string) => {
    try {
      await CoachFirebaseService.deleteAttendanceRecord(recordId);
      await getAttendance(); // Refresh list
    } catch (error) {
      handleError(error, 'حذف سجل الحضور');
      throw error;
    }
  }, [getAttendance, handleError]);

  const batchSaveAttendance = useCallback(async (records: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const recordsWithIds = records.map(record => ({
        ...record,
        clubId,
        coachId
      }));
      const ids = await CoachFirebaseService.batchSaveAttendance(recordsWithIds);
      await getAttendance(); // Refresh list
      return ids;
    } catch (error) {
      handleError(error, 'حفظ سجلات الحضور');
      throw error;
    }
  }, [clubId, coachId, getAttendance, handleError]);

  // Weekly Schedule
  const getWeeklySchedule = useCallback(async (weekStartDate: Date) => {
    setLoadingWeeklySchedule(true);
    try {
      const schedule = await CoachFirebaseService.getWeeklySchedule(clubId, coachId, weekStartDate);
      setWeeklySchedule(schedule);
    } catch (error) {
      handleError(error, 'تحميل البرنامج الأسبوعي');
    } finally {
      setLoadingWeeklySchedule(false);
    }
  }, [clubId, coachId, handleError]);

  const saveWeeklySchedule = useCallback(async (schedule: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveWeeklySchedule({
        ...schedule,
        clubId,
        coachId
      });
      await getWeeklySchedule(schedule.weekStartDate); // Refresh
      return id;
    } catch (error) {
      handleError(error, 'حفظ البرنامج الأسبوعي');
      throw error;
    }
  }, [clubId, coachId, getWeeklySchedule, handleError]);

  const updateWeeklySchedule = useCallback(async (scheduleId: string, updates: Partial<WeeklySchedule>) => {
    try {
      await CoachFirebaseService.updateWeeklySchedule(scheduleId, updates);
      if (updates.weekStartDate) {
        await getWeeklySchedule(updates.weekStartDate);
      }
    } catch (error) {
      handleError(error, 'تحديث البرنامج الأسبوعي');
      throw error;
    }
  }, [getWeeklySchedule, handleError]);

  // Session Evaluations
  const getSessionEvaluations = useCallback(async (startDate?: Date, endDate?: Date) => {
    setLoadingSessionEvaluations(true);
    try {
      const evaluations = await CoachFirebaseService.getSessionEvaluations(clubId, coachId, startDate, endDate);
      setSessionEvaluations(evaluations);
    } catch (error) {
      handleError(error, 'تحميل تقييمات الحصص');
    } finally {
      setLoadingSessionEvaluations(false);
    }
  }, [clubId, coachId, handleError]);

  const saveSessionEvaluation = useCallback(async (evaluation: Omit<SessionEvaluation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveSessionEvaluation({
        ...evaluation,
        clubId,
        coachId
      });
      await getSessionEvaluations(); // Refresh list
      return id;
    } catch (error) {
      handleError(error, 'حفظ تقييم الحصة');
      throw error;
    }
  }, [clubId, coachId, getSessionEvaluations, handleError]);

  const updateSessionEvaluation = useCallback(async (evaluationId: string, updates: Partial<SessionEvaluation>) => {
    try {
      await CoachFirebaseService.updateSessionEvaluation(evaluationId, updates);
      await getSessionEvaluations(); // Refresh list
    } catch (error) {
      handleError(error, 'تحديث تقييم الحصة');
      throw error;
    }
  }, [getSessionEvaluations, handleError]);

  const deleteSessionEvaluation = useCallback(async (evaluationId: string) => {
    try {
      await CoachFirebaseService.deleteSessionEvaluation(evaluationId);
      await getSessionEvaluations(); // Refresh list
    } catch (error) {
      handleError(error, 'حذف تقييم الحصة');
      throw error;
    }
  }, [getSessionEvaluations, handleError]);

  // Annual Plan
  const getAnnualPlan = useCallback(async (year: number) => {
    setLoadingAnnualPlan(true);
    try {
      const plan = await CoachFirebaseService.getAnnualPlan(clubId, coachId, year);
      setAnnualPlan(plan);
    } catch (error) {
      handleError(error, 'تحميل المخطط السنوي');
    } finally {
      setLoadingAnnualPlan(false);
    }
  }, [clubId, coachId, handleError]);

  const saveAnnualPlan = useCallback(async (plan: Omit<AnnualPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveAnnualPlan({
        ...plan,
        clubId,
        coachId
      });
      await getAnnualPlan(plan.year); // Refresh
      return id;
    } catch (error) {
      handleError(error, 'حفظ المخطط السنوي');
      throw error;
    }
  }, [clubId, coachId, getAnnualPlan, handleError]);

  const updateAnnualPlan = useCallback(async (planId: string, updates: Partial<AnnualPlan>) => {
    try {
      await CoachFirebaseService.updateAnnualPlan(planId, updates);
      if (updates.year) {
        await getAnnualPlan(updates.year);
      }
    } catch (error) {
      handleError(error, 'تحديث المخطط السنوي');
      throw error;
    }
  }, [getAnnualPlan, handleError]);

  // Technical Card
  const getTechnicalCard = useCallback(async () => {
    setLoadingTechnicalCard(true);
    try {
      const card = await CoachFirebaseService.getTechnicalCard(clubId, coachId);
      setTechnicalCard(card);
    } catch (error) {
      handleError(error, 'تحميل البطاقة الفنية');
    } finally {
      setLoadingTechnicalCard(false);
    }
  }, [clubId, coachId, handleError]);

  const saveTechnicalCard = useCallback(async (card: Omit<TechnicalCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveTechnicalCard({
        ...card,
        clubId,
        coachId
      });
      await getTechnicalCard(); // Refresh
      return id;
    } catch (error) {
      handleError(error, 'حفظ البطاقة الفنية');
      throw error;
    }
  }, [clubId, coachId, getTechnicalCard, handleError]);

  const updateTechnicalCard = useCallback(async (cardId: string, updates: Partial<TechnicalCard>) => {
    try {
      await CoachFirebaseService.updateTechnicalCard(cardId, updates);
      await getTechnicalCard(); // Refresh
    } catch (error) {
      handleError(error, 'تحديث البطاقة الفنية');
      throw error;
    }
  }, [getTechnicalCard, handleError]);

  // Training Loads
  const getTrainingLoads = useCallback(async (athleteId?: string, startDate?: Date, endDate?: Date) => {
    setLoadingTrainingLoads(true);
    try {
      const loads = await CoachFirebaseService.getTrainingLoads(clubId, coachId, athleteId, startDate, endDate);
      setTrainingLoads(loads);
    } catch (error) {
      handleError(error, 'تحميل أحمال التدريب');
    } finally {
      setLoadingTrainingLoads(false);
    }
  }, [clubId, coachId, handleError]);

  const saveTrainingLoad = useCallback(async (load: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await CoachFirebaseService.saveTrainingLoad({
        ...load,
        clubId,
        coachId
      });
      await getTrainingLoads(); // Refresh list
      return id;
    } catch (error) {
      handleError(error, 'حفظ حمل التدريب');
      throw error;
    }
  }, [clubId, coachId, getTrainingLoads, handleError]);

  const updateTrainingLoad = useCallback(async (loadId: string, updates: Partial<TrainingLoad>) => {
    try {
      await CoachFirebaseService.updateTrainingLoad(loadId, updates);
      await getTrainingLoads(); // Refresh list
    } catch (error) {
      handleError(error, 'تحديث حمل التدريب');
      throw error;
    }
  }, [getTrainingLoads, handleError]);

  const deleteTrainingLoad = useCallback(async (loadId: string) => {
    try {
      await CoachFirebaseService.deleteTrainingLoad(loadId);
      await getTrainingLoads(); // Refresh list
    } catch (error) {
      handleError(error, 'حذف حمل التدريب');
      throw error;
    }
  }, [getTrainingLoads, handleError]);

  const batchSaveTrainingLoads = useCallback(async (loads: Omit<TrainingLoad, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const loadsWithIds = loads.map(load => ({
        ...load,
        clubId,
        coachId
      }));
      const ids = await CoachFirebaseService.batchSaveTrainingLoads(loadsWithIds);
      await getTrainingLoads(); // Refresh list
      return ids;
    } catch (error) {
      handleError(error, 'حفظ أحمال التدريب');
      throw error;
    }
  }, [clubId, coachId, getTrainingLoads, handleError]);

  // Refresh All Data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        loadPersonalSections(),
        loadAthleteRoster(),
        getAttendance(),
        getSessionEvaluations(),
        getTechnicalCard(),
        getTrainingLoads()
      ]);
    } catch (error) {
      handleError(error, 'تحديث جميع البيانات');
    }
  }, [
    loadPersonalSections,
    loadAthleteRoster,
    getAttendance,
    getSessionEvaluations,
    getTechnicalCard,
    getTrainingLoads,
    handleError
  ]);

  // Initial load and real-time subscriptions
  useEffect(() => {
    if (enableRealtime) {
      // Set up real-time listeners
      const unsubscribePersonalSections = CoachFirebaseService.subscribeToPersonalSections(
        clubId,
        coachId,
        setPersonalSections
      );

      const unsubscribeAthleteRoster = CoachFirebaseService.subscribeToAthleteRoster(
        clubId,
        coachId,
        setAthleteRoster
      );

      return () => {
        unsubscribePersonalSections();
        unsubscribeAthleteRoster();
      };
    } else {
      // Load initial data
      refreshAll();
    }
  }, [clubId, coachId, enableRealtime, refreshAll]);

  return {
    // Personal Sections
    personalSections,
    loadingPersonalSections,
    savePersonalSection,
    updatePersonalSection,
    deletePersonalSection,

    // Athlete Roster
    athleteRoster,
    loadingAthleteRoster,
    addAthleteToRoster,
    updateAthleteRoster,
    removeAthleteFromRoster,

    // Attendance
    attendanceRecords,
    loadingAttendance,
    getAttendance,
    saveAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    batchSaveAttendance,

    // Weekly Schedule
    weeklySchedule,
    loadingWeeklySchedule,
    getWeeklySchedule,
    saveWeeklySchedule,
    updateWeeklySchedule,

    // Session Evaluations
    sessionEvaluations,
    loadingSessionEvaluations,
    getSessionEvaluations,
    saveSessionEvaluation,
    updateSessionEvaluation,
    deleteSessionEvaluation,

    // Annual Plan
    annualPlan,
    loadingAnnualPlan,
    getAnnualPlan,
    saveAnnualPlan,
    updateAnnualPlan,

    // Technical Card
    technicalCard,
    loadingTechnicalCard,
    getTechnicalCard,
    saveTechnicalCard,
    updateTechnicalCard,

    // Training Loads
    trainingLoads,
    loadingTrainingLoads,
    getTrainingLoads,
    saveTrainingLoad,
    updateTrainingLoad,
    deleteTrainingLoad,
    batchSaveTrainingLoads,

    // General
    refreshAll,
    error,
    clearError
  };
};