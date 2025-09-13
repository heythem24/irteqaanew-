import { useState, useEffect } from 'react';
import { MedicalService } from '../services/medicalService';
import type { 
  DailyWellness, 
  InjuryRecord, 
  WellnessAlert, 
  WellnessReport,
  MedicalProfile 
} from '../types/medical';

export const useMedicalData = (athleteId: string) => {
  const [loading, setLoading] = useState(false);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [todayWellness, setTodayWellness] = useState<DailyWellness | null>(null);
  const [recentWellness, setRecentWellness] = useState<DailyWellness[]>([]);
  const [activeInjuries, setActiveInjuries] = useState<InjuryRecord[]>([]);
  const [alerts, setAlerts] = useState<WellnessAlert[]>([]);
  const [wellnessReport, setWellnessReport] = useState<WellnessReport | null>(null);

  const loadMedicalData = async () => {
    if (!athleteId) return;
    
    setLoading(true);
    try {
      // تحميل البيانات من التخزين المحلي
      const profile = MedicalService.getMedicalProfile(athleteId);
      setMedicalProfile(profile);

      // بيانات اليوم
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysData = MedicalService.getDailyWellness(athleteId, today, today);
      setTodayWellness(todaysData[0] || null);

      // بيانات آخر 30 يوم
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentData = MedicalService.getDailyWellness(athleteId, thirtyDaysAgo);
      setRecentWellness(recentData);

      // الإصابات النشطة
      const injuries = MedicalService.getInjuryRecords(athleteId);
      const activeInjuriesData = injuries.filter(injury => 
        injury.status === 'active' || injury.status === 'recovering'
      );
      setActiveInjuries(activeInjuriesData);

      // التنبيهات
      const alertsData = MedicalService.getAlerts(athleteId);
      setAlerts(alertsData.slice(0, 5));

      // تقرير الصحة
      const report = MedicalService.generateWellnessReport(athleteId, 30);
      setWellnessReport(report);

    } catch (error) {
      console.error('Error loading medical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyWellness = async (wellness: DailyWellness) => {
    try {
      MedicalService.saveDailyWellness(wellness);
      await loadMedicalData(); // إعادة تحميل البيانات
      return true;
    } catch (error) {
      console.error('Error saving wellness data:', error);
      return false;
    }
  };

  const saveInjuryRecord = async (injury: InjuryRecord) => {
    try {
      MedicalService.saveInjuryRecord(injury);
      await loadMedicalData(); // إعادة تحميل البيانات
      return true;
    } catch (error) {
      console.error('Error saving injury record:', error);
      return false;
    }
  };

  const saveMedicalProfile = async (profile: MedicalProfile) => {
    try {
      MedicalService.saveMedicalProfile(profile);
      await loadMedicalData(); // إعادة تحميل البيانات
      return true;
    } catch (error) {
      console.error('Error saving medical profile:', error);
      return false;
    }
  };

  useEffect(() => {
    loadMedicalData();
  }, [athleteId]);

  return {
    loading,
    medicalProfile,
    todayWellness,
    recentWellness,
    activeInjuries,
    alerts,
    wellnessReport,
    saveDailyWellness,
    saveInjuryRecord,
    saveMedicalProfile,
    refreshData: loadMedicalData
  };
};

// Hook للحصول على إحصائيات طبية عامة
export const useMedicalStats = () => {
  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeInjuries: 0,
    lowWellnessScores: 0,
    pendingAlerts: 0
  });

  const loadStats = () => {
    try {
      // يمكن تطوير هذا لاحقاً للحصول على إحصائيات شاملة
      // من جميع الرياضيين في النظام
      
      // مؤقتاً نعيد قيم افتراضية
      setStats({
        totalAthletes: 0,
        activeInjuries: 0,
        lowWellnessScores: 0,
        pendingAlerts: 0
      });
    } catch (error) {
      console.error('Error loading medical stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    refreshStats: loadStats
  };
};

// Hook لإدارة البيانات الطبية للطاقم الطبي
export const useMedicalStaff = () => {
  const [athletes, setAthletes] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<WellnessAlert[]>([]);

  const loadMedicalStaffData = () => {
    try {
      // يمكن تطوير هذا لاحقاً للحصول على:
      // 1. قائمة الرياضيين المتابعين
      // 2. التنبيهات العامة
      // 3. المواعيد الطبية
      
      setAthletes([]);
      setAlerts([]);
    } catch (error) {
      console.error('Error loading medical staff data:', error);
    }
  };

  const markAlertAsRead = (alertId: string) => {
    // تنفيذ وضع علامة "مقروء" على التنبيه
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  useEffect(() => {
    loadMedicalStaffData();
  }, []);

  return {
    athletes,
    alerts,
    markAlertAsRead,
    refreshData: loadMedicalStaffData
  };
};
