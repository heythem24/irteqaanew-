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
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

import type { 
  MedicalProfile, 
  DailyWellness, 
  InjuryRecord, 
  PhysicalTest, 
  TrainingLoadEntry, 
  CompetitionEntry,
  WellnessReport,
  WellnessAlert,
  Treatment
} from '../types/medical';

import {
  AlertType,
  AlertSeverity
} from '../types/medical';

const STORAGE_KEYS = {
  MEDICAL_PROFILES: 'medical_profiles',
  DAILY_WELLNESS: 'daily_wellness',
  INJURY_RECORDS: 'injury_records',
  PHYSICAL_TESTS: 'physical_tests',
  TRAINING_LOAD: 'training_load',
  COMPETITIONS: 'competitions',
  WELLNESS_ALERTS: 'wellness_alerts',
  TREATMENTS: 'treatments',
  APPOINTMENTS: 'appointments'
};

export class MedicalService {
  // === Firestore Collections ===
  private static medicalProfilesRef = collection(db, 'medicalProfiles');
  private static dailyWellnessRef = collection(db, 'dailyWellness');
  private static injuryRecordsRef = collection(db, 'injuryRecords');
  private static treatmentsRef = collection(db, 'treatments');
  private static appointmentsRef = collection(db, 'appointments');
  private static staffNotificationsRef = collection(db, 'staffNotifications');
  private static athleteNotificationsRef = collection(db, 'athleteNotifications');

  // === Medical Profile Methods ===
  
  static async getMedicalProfile(athleteId: string): Promise<MedicalProfile | null> {
    try {
      const q = query(this.medicalProfilesRef, where('athleteId', '==', athleteId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          updatedAt: data.updatedAt?.toDate()
        } as MedicalProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting medical profile:', error);
      return null;
    }
  }

  static async saveMedicalProfile(profile: MedicalProfile): Promise<void> {
    try {
      const docRef = doc(this.medicalProfilesRef, profile.id || `profile_${profile.athleteId}`);
      const data = {
        ...profile,
        updatedAt: Timestamp.fromDate(new Date())
      };
      await setDoc(docRef, data);
      
      // Emit update event
      this.emitUpdate({ athleteId: profile.athleteId, source: 'medicalProfile' });
    } catch (error) {
      console.error('Error saving medical profile:', error);
      throw error;
    }
  }

  // Remove undefined values recursively to satisfy Firestore constraints
  private static sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
    const result: any = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined) {
        return; // drop undefined keys
      }
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = this.sanitizeForFirestore(value as any);
      } else {
        result[key] = value;
      }
    });
    return result as T;
  }

  // === Daily Wellness Methods ===
  
  static async getDailyWellness(athleteId: string, startDate?: Date, endDate?: Date): Promise<DailyWellness[]> {
    try {
      // First get all wellness records for this athlete (without date filter to avoid composite index)
      const q = query(this.dailyWellnessRef, where('athleteId', '==', athleteId));
      
      const querySnapshot = await getDocs(q);
      let wellnessData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      })) as DailyWellness[];

      // Filter by date range in memory (client-side filtering)
      if (startDate) {
        wellnessData = wellnessData.filter(w => new Date(w.date) >= startDate);
      }
      if (endDate) {
        wellnessData = wellnessData.filter(w => new Date(w.date) <= endDate);
      }
      
      return wellnessData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting daily wellness:', error);
      return [];
    }
  }

  static async saveDailyWellness(wellness: DailyWellness): Promise<void> {
    try {
      const docRef = doc(this.dailyWellnessRef, wellness.id || `wellness_${Date.now()}`);
      
      // Clean up data by removing undefined values and converting them to null or empty strings
      const cleanedData = this.sanitizeForFirestore({
        ...wellness,
        date: Timestamp.fromDate(new Date(wellness.date)),
        additionalNotes: wellness.additionalNotes || '', // Convert undefined to empty string
      });
      
      // حساب مؤشر الصحة
      cleanedData.wellnessScore = this.calculateWellnessScore(wellness);
      
      await setDoc(docRef, cleanedData);
      
      // فحص التنبيهات
      await this.checkWellnessAlerts(wellness);
      // Emit update event
      this.emitUpdate({ athleteId: wellness.athleteId, source: 'dailyWellness' });
    } catch (error) {
      console.error('Error saving daily wellness:', error);
      throw error;
    }
  }

  static calculateWellnessScore(wellness: DailyWellness): number {
    // الأوزان الافتراضية لحساب مؤشر الصحة
    const weights = {
      sleepQuality: 0.25,
      fatigueLevel: 0.20, // معكوس (كلما قل التعب كان أفضل)
      muscleSoreness: 0.15, // معكوس
      stressLevel: 0.20, // معكوس
      mood: 0.20
    };
    
    const score = (
      (wellness.sleepQuality * weights.sleepQuality) +
      ((6 - wellness.fatigueLevel) * weights.fatigueLevel) +
      ((6 - wellness.muscleSoreness) * weights.muscleSoreness) +
      ((6 - wellness.stressLevel) * weights.stressLevel) +
      (wellness.mood * weights.mood)
    );
    
    return Math.round(score * 100) / 100;
  }

  // === Injury Methods (Firestore) ===
  
  static async getInjuryRecords(athleteId: string): Promise<InjuryRecord[]> {
    try {
      const qInj = query(this.injuryRecordsRef, where('athleteId', '==', athleteId));
      const snap = await getDocs(qInj);
      const items = snap.docs.map(d => {
        const data: any = d.data();
        return {
          id: d.id,
          ...data,
          reportDate: data.reportDate?.toDate?.() || (data.reportDate ? new Date(data.reportDate) : new Date()),
          expectedReturnDate: data.expectedReturnDate ? (data.expectedReturnDate.toDate?.() || new Date(data.expectedReturnDate)) : undefined
        } as InjuryRecord;
      });
      return items.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    } catch (e) {
      console.error('Error getting injury records:', e);
      return [];
    }
  }

  static async saveInjuryRecord(injury: InjuryRecord): Promise<void> {
    try {
      const docRef = doc(this.injuryRecordsRef, injury.id || `injury_${Date.now()}`);
      const payload: any = this.sanitizeForFirestore({
        ...injury,
        reportDate: Timestamp.fromDate(new Date(injury.reportDate)),
        expectedReturnDate: injury.expectedReturnDate ? Timestamp.fromDate(new Date(injury.expectedReturnDate)) : null
      });
      await setDoc(docRef, payload);
      // إنشاء تنبيه للإصابة الجديدة (يحافظ على السلوك السابق)
      this.createInjuryAlert(injury);
      // Emit update event
      this.emitUpdate({ athleteId: injury.athleteId, source: 'injury' });
    } catch (e) {
      console.error('Error saving injury record:', e);
      throw e;
    }
  }

  // === Physical Tests Methods ===
  
  static getPhysicalTests(athleteId: string): PhysicalTest[] {
    const tests = this.getStoredData<PhysicalTest & { athleteId: string }>(STORAGE_KEYS.PHYSICAL_TESTS);
    return tests
      .filter(t => t.athleteId === athleteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static savePhysicalTest(test: PhysicalTest & { athleteId: string }): void {
    const tests = this.getStoredData<PhysicalTest & { athleteId: string }>(STORAGE_KEYS.PHYSICAL_TESTS);
    const existingIndex = tests.findIndex(t => t.id === test.id);
    
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    
    this.setStoredData(STORAGE_KEYS.PHYSICAL_TESTS, tests);
  }

  // === Training Load Methods ===
  
  static getTrainingLoad(athleteId: string, startDate?: Date, endDate?: Date): TrainingLoadEntry[] {
    const load = this.getStoredData<TrainingLoadEntry & { athleteId: string }>(STORAGE_KEYS.TRAINING_LOAD);
    let filtered = load.filter(l => l.athleteId === athleteId);
    
    if (startDate) {
      filtered = filtered.filter(l => new Date(l.date) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(l => new Date(l.date) <= endDate);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static saveTrainingLoad(load: TrainingLoadEntry & { athleteId: string }): void {
    const allLoad = this.getStoredData<TrainingLoadEntry & { athleteId: string }>(STORAGE_KEYS.TRAINING_LOAD);
    const existingIndex = allLoad.findIndex(l => l.id === load.id);
    
    // حساب حمل التدريب
    load.trainingLoad = load.duration * load.rpe;
    
    if (existingIndex >= 0) {
      allLoad[existingIndex] = load;
    } else {
      allLoad.push(load);
    }
    
    this.setStoredData(STORAGE_KEYS.TRAINING_LOAD, allLoad);
    
    // فحص مخاطر الإفراط في التدريب
    this.checkOvertrainingRisk(load.athleteId);
    // Emit update event
    this.emitUpdate({ athleteId: load.athleteId, source: 'trainingLoad' });
  }

  // === Competition Methods ===
  
  static getCompetitions(athleteId: string): CompetitionEntry[] {
    const competitions = this.getStoredData<CompetitionEntry & { athleteId: string }>(STORAGE_KEYS.COMPETITIONS);
    return competitions
      .filter(c => c.athleteId === athleteId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static saveCompetition(competition: CompetitionEntry & { athleteId: string }): void {
    const competitions = this.getStoredData<CompetitionEntry & { athleteId: string }>(STORAGE_KEYS.COMPETITIONS);
    const existingIndex = competitions.findIndex(c => c.id === competition.id);
    
    if (existingIndex >= 0) {
      competitions[existingIndex] = competition;
    } else {
      competitions.push(competition);
    }
    
    this.setStoredData(STORAGE_KEYS.COMPETITIONS, competitions);
    // Emit update event
    this.emitUpdate({ athleteId: competition.athleteId, source: 'competition' });
  }

  // === Alert Methods ===
  
  static getAlerts(athleteId: string): WellnessAlert[] {
    const alerts = this.getStoredData<WellnessAlert & { athleteId: string }>(STORAGE_KEYS.WELLNESS_ALERTS);
    return alerts
      .filter(a => a.athleteId === athleteId)
      .sort((a, b) => new Date(b.triggeredDate).getTime() - new Date(a.triggeredDate).getTime());
  }

  private static async checkWellnessAlerts(wellness: DailyWellness): Promise<void> {
    // فحص انخفاض مؤشر الصحة
    if (wellness.wellnessScore < 3) {
      const recentWellness = await this.getDailyWellness(wellness.athleteId, 
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      const lowScoreDays = recentWellness.filter((w: DailyWellness) => w.wellnessScore < 3).length;
      
      if (lowScoreDays >= 3) {
        this.createAlert({
          athleteId: wellness.athleteId,
          type: AlertType.LOW_WELLNESS_SCORE,
          severity: AlertSeverity.HIGH,
          message: `مؤشر الصحة منخفض لمدة ${lowScoreDays} أيام متتالية`,
          triggeredDate: new Date()
        });
      }
    }
  }

  private static checkOvertrainingRisk(athleteId: string): void {
    const lastWeekLoad = this.getTrainingLoad(athleteId, 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const totalLoad = lastWeekLoad.reduce((sum, load) => sum + load.trainingLoad, 0);
    const avgLoad = totalLoad / 7;
    
    if (avgLoad > 700) { // عتبة الحمل العالي
      this.createAlert({
        athleteId,
        type: AlertType.OVERTRAINING_RISK,
        severity: AlertSeverity.MEDIUM,
        message: `حمل تدريبي عالي: متوسط ${Math.round(avgLoad)} في الأسبوع الماضي`,
        triggeredDate: new Date()
      });
    }
  }

  private static createInjuryAlert(injury: InjuryRecord): void {
    this.createAlert({
      athleteId: injury.athleteId,
      type: AlertType.INJURY_REPORTED,
      severity: injury.painLevel >= 7 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
      message: `إصابة جديدة: ${injury.injuryLocation} - مستوى الألم ${injury.painLevel}/10`,
      triggeredDate: new Date()
    });
  }

  private static createAlert(alert: Omit<WellnessAlert, 'id'> & { athleteId: string }): void {
    const alerts = this.getStoredData<WellnessAlert & { athleteId: string }>(STORAGE_KEYS.WELLNESS_ALERTS);
    
    // تجنب التكرار - فحص إذا كان هناك تنبيه مشابه في آخر 24 ساعة
    const recentSimilar = alerts.find(a => 
      a.athleteId === alert.athleteId &&
      a.type === alert.type &&
      (new Date().getTime() - new Date(a.triggeredDate).getTime()) < 24 * 60 * 60 * 1000
    );
    
    if (!recentSimilar) {
      alerts.push({ ...alert, id: this.generateId() });
      this.setStoredData(STORAGE_KEYS.WELLNESS_ALERTS, alerts);
      // Emit update event for alerts
      this.emitUpdate({ athleteId: alert.athleteId, source: 'alert' });
    }
  }

  // === Report Methods ===
  
  static async generateWellnessReport(athleteId: string, days: number = 30): Promise<WellnessReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const wellness = await this.getDailyWellness(athleteId, startDate, endDate);
    
    // Filter alerts within the date range
    const alerts = this.getAlerts(athleteId).filter((alert: WellnessAlert) => 
      new Date(alert.triggeredDate) >= startDate
    );
    
    const avgScore = wellness.length > 0 
      ? wellness.reduce((sum: number, w: DailyWellness) => sum + w.wellnessScore, 0) / wellness.length
      : 0;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (wellness.length >= 7) {
      const recent = wellness.slice(0, 7).reduce((sum: number, w: DailyWellness) => sum + w.wellnessScore, 0) / 7;
      const older = wellness.slice(-7).reduce((sum: number, w: DailyWellness) => sum + w.wellnessScore, 0) / 7;
      
      if (recent > older + 0.5) trend = 'improving';
      else if (recent < older - 0.5) trend = 'declining';
    }
    
    const recommendations = this.generateRecommendations(wellness, alerts);
    
    return {
      athleteId,
      period: { start: startDate, end: endDate },
      averageWellnessScore: Math.round(avgScore * 100) / 100,
      wellnessTrend: trend,
      alerts,
      recommendations
    };
  }

  private static generateRecommendations(wellness: DailyWellness[], alerts: WellnessAlert[]): string[] {
    const recommendations: string[] = [];
    
    if (wellness.length === 0) return ['ابدأ بتسجيل التقييم اليومي للصحة'];
    
    const avgSleep = wellness.reduce((sum, w) => sum + w.sleepQuality, 0) / wellness.length;
    const avgFatigue = wellness.reduce((sum, w) => sum + w.fatigueLevel, 0) / wellness.length;
    const avgStress = wellness.reduce((sum, w) => sum + w.stressLevel, 0) / wellness.length;
    
    if (avgSleep < 3) {
      recommendations.push('تحسين جودة النوم - احرص على النوم 7-9 ساعات يومياً');
    }
    
    if (avgFatigue > 3.5) {
      recommendations.push('مراجعة حمل التدريب - قد تحتاج لفترات راحة إضافية');
    }
    
    if (avgStress > 3.5) {
      recommendations.push('إدارة التوتر - جرب تقنيات الاسترخاء والتأمل');
    }
    
    const highAlerts = alerts.filter(a => a.severity === AlertSeverity.HIGH);
    if (highAlerts.length > 0) {
      recommendations.push('مراجعة طبية عاجلة مطلوبة بسبب التنبيهات العالية');
    }
    
    return recommendations;
  }

  // === Utility Methods ===
  
  private static getStoredData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private static setStoredData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // === Data Management ===
  
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportData(): string {
    const data: any = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.getStoredData(key);
    });
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          this.setStoredData(key, data[name]);
        }
      });
      // Emit a general update event after importing data
      this.emitUpdate({ athleteId: undefined, source: 'import' });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // === Treatment Methods (Firestore) ===
  
  static async getTreatments(athleteId: string): Promise<Treatment[]> {
    try {
      const qT = query(this.treatmentsRef, where('athleteId', '==', athleteId));
      const snap = await getDocs(qT);
      const items = snap.docs.map(d => {
        const data: any = d.data();
        return {
          id: d.id,
          ...data,
          startDate: data.startDate?.toDate?.() || new Date(data.startDate),
          endDate: data.endDate ? (data.endDate.toDate?.() || new Date(data.endDate)) : undefined
        } as Treatment;
      });
      return items.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } catch (error) {
      console.error('Error getting treatments:', error);
      return [];
    }
  }

  static async saveTreatment(treatment: Treatment & { athleteId: string }): Promise<void> {
    try {
      const docRef = doc(this.treatmentsRef, treatment.id || `treatment_${Date.now()}`);
      const payload: any = this.sanitizeForFirestore({
        ...treatment,
        startDate: Timestamp.fromDate(new Date(treatment.startDate)),
        endDate: treatment.endDate ? Timestamp.fromDate(new Date(treatment.endDate)) : undefined
      });
      await setDoc(docRef, payload);
      // Emit update event
      this.emitUpdate({ athleteId: treatment.athleteId, source: 'treatment' });
    } catch (error) {
      console.error('Error saving treatment:', error);
      throw error;
    }
  }

  static async deleteTreatment(treatmentId: string, athleteId: string): Promise<void> {
    try {
      const ref = doc(this.treatmentsRef, treatmentId);
      await deleteDoc(ref);
      // Emit update event
      this.emitUpdate({ athleteId, source: 'treatment' });
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  }

  // === Appointment Methods (Firestore) ===
  
  static async getAppointments(athleteId: string): Promise<any[]> {
    try {
      const qA = query(this.appointmentsRef, where('athleteId', '==', athleteId));
      const snap = await getDocs(qA);
      const items = snap.docs.map(d => {
        const data: any = d.data();
        return {
          id: d.id,
          ...data,
          date: data.date?.toDate?.() || new Date(data.date)
        } as any;
      });
      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  static async saveAppointment(appointment: any): Promise<void> {
    try {
      const docRef = doc(this.appointmentsRef, appointment.id || `appointment_${Date.now()}`);
      const payload = this.sanitizeForFirestore({
        ...appointment,
        date: Timestamp.fromDate(new Date(appointment.date))
      });
      await setDoc(docRef, payload);
      // Emit update event
      this.emitUpdate({ athleteId: appointment.athleteId, source: 'appointment' });
    } catch (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
  }

  static async deleteAppointment(appointmentId: string, athleteId: string): Promise<void> {
    try {
      const ref = doc(this.appointmentsRef, appointmentId);
      await deleteDoc(ref);
      // Emit update event
      this.emitUpdate({ athleteId, source: 'appointment' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string, athleteId: string): Promise<void> {
    try {
      const ref = doc(this.appointmentsRef, appointmentId);
      await updateDoc(ref, { status });
      // Emit update event
      this.emitUpdate({ athleteId, source: 'appointment' });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // === Staff Notification Methods ===
  
  static getStaffNotifications(clubId?: string): any[] {
    try {
      const notifications = this.getStoredData<any>('staff_notifications');
      if (clubId) {
        return notifications.filter(n => n.clubId === clubId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error getting staff notifications:', error);
      return [];
    }
  }

  static createStaffNotification(notification: any & { clubId?: string }): void {
    try {
      const notifications = this.getStoredData<any>('staff_notifications');
      notifications.push({
        ...notification,
        id: this.generateId(),
        timestamp: new Date(),
        read: false
      });
      this.setStoredData('staff_notifications', notifications);
      // Emit update event for staff notifications
      this.emitUpdate({ source: 'staffNotification' });
    } catch (error) {
      console.error('Error creating staff notification:', error);
    }
  }

  static markNotificationAsRead(notificationId: string): void {
    try {
      const notifications = this.getStoredData<any>('staff_notifications');
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex >= 0) {
        notifications[notificationIndex].read = true;
        this.setStoredData('staff_notifications', notifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // === Athlete Notification Methods ===
  
  static getAthleteNotifications(athleteId: string): any[] {
    try {
      const notifications = this.getStoredData<any>('athlete_notifications');
      return notifications.filter(n => n.athleteId === athleteId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error getting athlete notifications:', error);
      return [];
    }
  }

  static createAthleteNotification(notification: any & { athleteId: string }): void {
    try {
      const notifications = this.getStoredData<any>('athlete_notifications');
      notifications.push({
        ...notification,
        id: this.generateId(),
        timestamp: new Date(),
        read: false
      });
      this.setStoredData('athlete_notifications', notifications);
      // Emit update event for athlete notifications
      this.emitUpdate({ athleteId: notification.athleteId, source: 'athleteNotification' });
    } catch (error) {
      console.error('Error creating athlete notification:', error);
    }
  }

  static markAthleteNotificationAsRead(notificationId: string, athleteId: string): void {
    try {
      const notifications = this.getStoredData<any>('athlete_notifications');
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex >= 0) {
        notifications[notificationIndex].read = true;
        this.setStoredData('athlete_notifications', notifications);
      }
    } catch (error) {
      console.error('Error marking athlete notification as read:', error);
    }
  }

  private static emitUpdate(detail: { athleteId?: string; source: string }): void {
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('medicalDataUpdated', { detail }));
      }
    } catch (e) {
      // no-op: events are best-effort
    }
  }
}
