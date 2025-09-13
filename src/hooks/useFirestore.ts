import { useState, useEffect } from 'react';
import { FirestoreService, PhysicalTestsService } from '../services/mockDataService';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// Hook للتعامل مع البيانات العامة
export const useFirestoreData = <T>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await FirestoreService.getAll<T>(collectionName);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionName]);

  const refresh = async () => {
    try {
      setLoading(true);
      const result = await FirestoreService.getAll<T>(collectionName);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
};

// Hook للتعامل مع بيانات النادي المحددة
export const useClubData = <T>(collectionName: string, clubId: string, field: string = 'clubId') => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await FirestoreService.getWhere<T>(collectionName, field, '==', clubId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل البيانات');
        console.error('Error loading club data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      loadData();
    }
  }, [collectionName, clubId, field]);

  const refresh = async () => {
    if (!clubId) return;
    
    try {
      setLoading(true);
      const result = await FirestoreService.getWhere<T>(collectionName, field, '==', clubId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
};

// Hook للحضور
export const useAttendance = (clubId: string) => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        if (!clubId) { setAttendanceData([]); setError(null); return; }
        const ref = doc(collection(db, 'coach_attendance_simple'), String(clubId));
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data()?.records ?? []) : [];
        setAttendanceData(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل بيانات الحضور');
        console.error('Error loading attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) { loadAttendance(); }
  }, [clubId]);

  const saveAttendance = async (data: any[]) => {
    try {
      const ref = doc(collection(db, 'coach_attendance_simple'), String(clubId));
      await setDoc(ref, { records: data }, { merge: true });
      setAttendanceData(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ بيانات الحضور');
      throw err;
    }
  };

  return { attendanceData, setAttendanceData, loading, error, saveAttendance };
};

// Hook للجدول الأسبوعي
export const useWeeklySchedule = (clubId: string) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        if (!clubId) { setSchedule([]); setError(null); return; }
        const ref = doc(collection(db, 'coach_weekly_schedule_simple'), String(clubId));
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data()?.schedule ?? []) : [];
        setSchedule(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل الجدول الأسبوعي');
        console.error('Error loading schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) { loadSchedule(); }
  }, [clubId]);

  const saveSchedule = async (scheduleData: any[]) => {
    try {
      const ref = doc(collection(db, 'coach_weekly_schedule_simple'), String(clubId));
      await setDoc(ref, { schedule: scheduleData }, { merge: true });
      setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ الجدول الأسبوعي');
      throw err;
    }
  };

  return { schedule, setSchedule, loading, error, saveSchedule };
};

// Hook للاختبارات البدنية
export const usePhysicalTests = (testType: string, clubId: string) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestResults = async () => {
      try {
        setLoading(true);
        const data = await PhysicalTestsService.getTestResults(testType, clubId);
        setTestResults(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل نتائج الاختبار');
        console.error('Error loading test results:', err);
      } finally {
        setLoading(false);
      }
    };

    if (testType && clubId) {
      loadTestResults();
    }
  }, [testType, clubId]);

  const saveTestResults = async (results: any[]) => {
    try {
      await PhysicalTestsService.saveTestResults(testType, clubId, results);
      setTestResults(results);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ نتائج الاختبار');
      throw err;
    }
  };

  const deleteTestResults = async () => {
    try {
      await PhysicalTestsService.deleteTestResults(testType, clubId);
      setTestResults([]);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حذف نتائج الاختبار');
      throw err;
    }
  };

  return { testResults, loading, error, saveTestResults, deleteTestResults };
};

// Hook للبطاقة الفنية
export const useTechnicalCard = (clubId: string) => {
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCardData = async () => {
      try {
        setLoading(true);
        if (!clubId) {
          setCardData(null);
          setError(null);
          return;
        }
        const ref = doc(collection(db, 'technicalCards'), String(clubId));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCardData(snap.data());
        } else {
          setCardData(null);
        }
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل البطاقة الفنية');
        console.error('Error loading technical card:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      loadCardData();
    }
  }, [clubId]);

  const saveTechnicalCard = async (data: any) => {
    try {
      const ref = doc(collection(db, 'technicalCards'), String(clubId));
      await setDoc(ref, data, { merge: true });
      setCardData(data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ البطاقة الفنية');
      throw err;
    }
  };

  return { cardData, setCardData, loading, error, saveTechnicalCard };
};

// Hook لتقييم الجلسة
export const useSessionEvaluation = (clubId: string) => {
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvaluationData = async () => {
      try {
        setLoading(true);
        if (!clubId) { setEvaluationData(null); setError(null); return; }
        const ref = doc(collection(db, 'coach_session_evaluations_simple'), String(clubId));
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data()?.data ?? null) : null;
        setEvaluationData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل تقييم الجلسة');
        console.error('Error loading session evaluation:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) { loadEvaluationData(); }
  }, [clubId]);

  const saveSessionEvaluation = async (data: any) => {
    try {
      const ref = doc(collection(db, 'coach_session_evaluations_simple'), String(clubId));
      await setDoc(ref, { data }, { merge: true });
      setEvaluationData(data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ تقييم الجلسة');
      throw err;
    }
  };

  return { evaluationData, setEvaluationData, loading, error, saveSessionEvaluation };
};

// Hook للخطة السنوية
export const useAnnualPlan = (clubId: string, year: number) => {
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setLoading(true);
        if (!clubId || !year) { setPlanData(null); setError(null); return; }
        const ref = doc(collection(db, 'coach_annual_plans_simple'), `${clubId}_${year}`);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data()?.data ?? null) : null;
        setPlanData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل الخطة السنوية');
        console.error('Error loading annual plan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId && year) { loadPlanData(); }
  }, [clubId, year]);

  const saveAnnualPlan = async (data: any) => {
    try {
      const ref = doc(collection(db, 'coach_annual_plans_simple'), `${clubId}_${year}`);
      await setDoc(ref, { data, meta: { clubId, year } }, { merge: true });
      setPlanData(data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ الخطة السنوية');
      throw err;
    }
  };

  return { planData, setPlanData, loading, error, saveAnnualPlan };
};

// Hook لتوزيع الأحمال التدريبية
export const useTrainingLoad = (clubId: string) => {
  const [loadData, setLoadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainingLoadData = async () => {
      try {
        setLoading(true);
        if (!clubId) { setLoadData(null); setError(null); return; }
        const ref = doc(collection(db, 'coach_training_load_distribution'), String(clubId));
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data()?.data ?? null) : null;
        setLoadData(data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل توزيع الأحمال التدريبية');
        console.error('Error loading training load:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) { loadTrainingLoadData(); }
  }, [clubId]);

  const saveTrainingLoad = async (data: any) => {
    try {
      const ref = doc(collection(db, 'coach_training_load_distribution'), String(clubId));
      await setDoc(ref, { data }, { merge: true });
      setLoadData(data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ توزيع الأحمال التدريبية');
      throw err;
    }
  };

  return { loadData, setLoadData, loading, error, saveTrainingLoad };
};

// Generic Firestore hook
export const useFirestore = <T>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (path.includes('/')) {
          // Single document
          const ref = doc(db, path);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setData({ id: snap.id, ...snap.data() } as T);
          } else {
            setData(null);
          }
        } else {
          // Collection
          const colRef = collection(db, path);
          const snap = await getDocs(colRef);
          const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setData(items as T);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (path) {
      loadData();
    }
  }, [path]);

  return { data, isLoading, error };
};
