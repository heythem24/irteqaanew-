import { useState, useEffect } from 'react';
import { TrainingDataService } from '../services/mockDataService';

// Hook للجدول الأسبوعي
export const useWeeklySchedule = (clubId: string) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getWeeklySchedule(clubId);
        setSchedule(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل الجدول الأسبوعي');
        console.error('Error loading weekly schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [clubId]);

  const saveSchedule = async (scheduleData: any[]) => {
    try {
      setLoading(true);
      await TrainingDataService.saveWeeklySchedule(clubId, scheduleData);
      setSchedule(scheduleData);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ الجدول الأسبوعي');
      console.error('Error saving weekly schedule:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { schedule, loading, error, saveSchedule, setSchedule };
};

// Hook لبيانات الحضور
export const useAttendance = (clubId: string) => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getAttendance(clubId);
        setAttendanceData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل بيانات الحضور');
        console.error('Error loading attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [clubId]);

  const saveAttendance = async (data: any[]) => {
    try {
      await TrainingDataService.saveAttendance(clubId, data);
      setAttendanceData(data);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ بيانات الحضور');
      console.error('Error saving attendance:', err);
      return false;
    }
  };

  return { attendanceData, loading, error, saveAttendance, setAttendanceData };
};

// Hook للخطة السنوية
export const useAnnualPlan = (clubId: string, year?: number) => {
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentYear = year || new Date().getFullYear();

  useEffect(() => {
    const loadPlan = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getAnnualPlan(clubId, currentYear);
        setPlanData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل الخطة السنوية');
        console.error('Error loading annual plan:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [clubId, currentYear]);

  const savePlan = async (data: any) => {
    try {
      setLoading(true);
      await TrainingDataService.saveAnnualPlan(clubId, currentYear, data);
      setPlanData(data);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ الخطة السنوية');
      console.error('Error saving annual plan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { planData, loading, error, savePlan, setPlanData };
};

// Hook لتقييم الجلسة
export const useSessionEvaluation = (clubId: string) => {
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getSessionEvaluation(clubId);
        setEvaluationData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل تقييم الجلسة');
        console.error('Error loading session evaluation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [clubId]);

  const saveEvaluation = async (data: any) => {
    try {
      setLoading(true);
      await TrainingDataService.saveSessionEvaluation(clubId, data);
      setEvaluationData(data);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ تقييم الجلسة');
      console.error('Error saving session evaluation:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { evaluationData, loading, error, saveEvaluation, setEvaluationData };
};

// Hook للبطاقة الفنية
export const useTechnicalCard = (clubId: string) => {
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCard = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getTechnicalCard(clubId);
        setCardData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل البطاقة الفنية');
        console.error('Error loading technical card:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [clubId]);

  const saveCard = async (data: any) => {
    try {
      setLoading(true);
      await TrainingDataService.saveTechnicalCard(clubId, data);
      setCardData(data);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ البطاقة الفنية');
      console.error('Error saving technical card:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cardData, loading, error, saveCard, setCardData };
};

// Hook لتوزيع الأحمال التدريبية
export const useTrainingLoad = (clubId: string) => {
  const [loadData, setLoadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainingLoad = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await TrainingDataService.getTrainingLoad(clubId);
        setLoadData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل توزيع الأحمال التدريبية');
        console.error('Error loading training load:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingLoad();
  }, [clubId]);

  const saveTrainingLoad = async (data: any) => {
    try {
      setLoading(true);
      await TrainingDataService.saveTrainingLoad(clubId, data);
      setLoadData(data);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ توزيع الأحمال التدريبية');
      console.error('Error saving training load:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loadData, loading, error, saveTrainingLoad, setLoadData };
};
