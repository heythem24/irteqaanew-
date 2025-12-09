import { useState, useEffect } from 'react';
import { PhysicalTestsService } from '../services/mockDataService';

// Hook عام للاختبارات البدنية
export const usePhysicalTest = (testType: string, clubId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      if (!testType || !clubId) return;
      
      try {
        setLoading(true);
        const results = await PhysicalTestsService.getTestResults(testType, clubId);
        setData(results);
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل البيانات');
        console.error('Error loading physical test data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [testType, clubId]);

  // حفظ البيانات
  const saveData = async (newData: any[]) => {
    try {
      setLoading(true);
      await PhysicalTestsService.saveTestResults(testType, clubId, newData);
      setData(newData);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حفظ البيانات');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف البيانات
  const deleteData = async () => {
    try {
      setLoading(true);
      await PhysicalTestsService.deleteTestResults(testType, clubId);
      setData([]);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في حذف البيانات');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, saveData, deleteData };
};

// Hook لاختبار الأوتشي-كومي
export const useUchiKomiTest = (clubId: string) => {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!clubId) return;
      
      try {
        setLoading(true);
        const data = await PhysicalTestsService.getUchiKomiTest(clubId);
        if (data.length === 0) {
          // إنشاء البيانات الأولية
          setAthletes(initializeUchiKomiAthletes());
        } else {
          setAthletes(data);
        }
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل بيانات اختبار الأوتشي-كومي');
        console.error('Error loading Uchi Komi test:', err);
        setAthletes(initializeUchiKomiAthletes());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clubId]);

  const saveData = async () => {
    try {
      await PhysicalTestsService.saveUchiKomiTest(clubId, athletes);
      setError(null);
      return true;
    } catch (err) {
      setError('حدث خطأ في حفظ البيانات');
      return false;
    }
  };

  const updateAthlete = (id: number, field: string, value: any) => {
    setAthletes(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updatedAthlete = { ...athlete, [field]: value };
        
        // تحديث الحسابات التلقائية
        if (field === 'age') {
          updatedAthlete.ageGroup = getAgeGroup(value);
          updatedAthlete.evaluation10s = calculateEvaluation(value, updatedAthlete.result10s, '10s');
          updatedAthlete.evaluation20s = calculateEvaluation(value, updatedAthlete.result20s, '20s');
          updatedAthlete.evaluation30s = calculateEvaluation(value, updatedAthlete.result30s, '30s');
        }
        
        if (field === 'result10s') {
          updatedAthlete.evaluation10s = calculateEvaluation(updatedAthlete.age, value, '10s');
        }
        if (field === 'result20s') {
          updatedAthlete.evaluation20s = calculateEvaluation(updatedAthlete.age, value, '20s');
        }
        if (field === 'result30s') {
          updatedAthlete.evaluation30s = calculateEvaluation(updatedAthlete.age, value, '30s');
        }
        
        return updatedAthlete;
      }
      return athlete;
    }));
  };

  const addNewRow = () => {
    const newId = Math.max(...athletes.map(a => a.id)) + 1;
    const newAthlete = {
      id: newId,
      name: '',
      category: '',
      ageGroup: '',
      age: 0,
      result10s: 0,
      evaluation10s: 0,
      result20s: 0,
      evaluation20s: 0,
      result30s: 0,
      evaluation30s: 0
    };
    setAthletes(prev => [...prev, newAthlete]);
  };

  const deleteRow = (id: number) => {
    if (athletes.length > 1) {
      setAthletes(prev => prev.filter(athlete => athlete.id !== id));
    }
  };

  const clearAllData = () => {
    setAthletes(initializeUchiKomiAthletes());
  };

  return {
    athletes,
    loading,
    error,
    saveData,
    updateAthlete,
    addNewRow,
    deleteRow,
    clearAllData
  };
};

// Hook لاختبار مهارات الرمي
export const useThrowingSkillsTest = (clubId: string) => {
  return usePhysicalTest('throwing-skills-test', clubId);
};

// Hook لاختبارات السرعة والقوة
export const useSpeedStrengthTests = (clubId: string) => {
  return usePhysicalTest('speed-strength-tests', clubId);
};

// Hook لاختبار السرعة الخاصة
export const useSpecialSpeedTest = (clubId: string) => {
  return usePhysicalTest('special-speed-test', clubId);
};

// Hook لاختبار التحمل الخاص
export const useSpecialEnduranceTest = (clubId: string) => {
  return usePhysicalTest('special-endurance-test', clubId);
};

// Hook للقياسات المورفولوجية
export const useMorphologicalTraits = (clubId: string) => {
  return usePhysicalTest('morphological-traits', clubId);
};

// Hook لقياسات القلب والجهاز الدوري
export const useCardioCirculatoryMeasurements = (clubId: string) => {
  return usePhysicalTest('cardio-circulatory-measurements', clubId);
};

// Hook لقياسات الجهاز التنفسي
export const useRespiratoryMeasurements = (clubId: string) => {
  return usePhysicalTest('respiratory-measurements', clubId);
};

// Hook لقياسات الاستقلاب
export const useMetabolicMeasurements = (clubId: string) => {
  return usePhysicalTest('metabolic-measurements', clubId);
};

// Hook لقياسات الجهاز العصبي والوظائف العصبية العضلية
export const useNeuromuscularMeasurements = (clubId: string) => {
  return usePhysicalTest('neuromuscular-measurements', clubId);
};

// Hook لقياسات الحرارة والتوازن المائي
export const useThermalWaterBalanceMeasurements = (clubId: string) => {
  return usePhysicalTest('thermal-water-balance-measurements', clubId);
};

// Hook لقياسات الهرمونات
export const useHormonalMeasurements = (clubId: string) => {
  return usePhysicalTest('hormonal-measurements', clubId);
};

// Hook لمقاييس الإدراك الذاتي
export const useSelfPerceptionMeasurements = (clubId: string) => {
  return usePhysicalTest('self-perception-measurements', clubId);
};

// Hook لاختبار القوة الثابتة القصوى
export const useMaxStaticStrengthTest = (clubId: string) => {
  return usePhysicalTest('max-static-strength-test', clubId);
};

// Hook لاختبار القوة الديناميكية القصوى
export const useMaxDynamicStrengthTest = (clubId: string) => {
  return usePhysicalTest('max-dynamic-strength-test', clubId);
};

// Hook لاختبار مهارات الأرضية
export const useGroundworkSkillsTest = (clubId: string) => {
  return usePhysicalTest('groundwork-skills-test', clubId);
};

// Hook لاختبار القوة الانفجارية
export const useExplosiveStrengthKumiTest = (clubId: string) => {
  return usePhysicalTest('explosive-strength-kumi-test', clubId);
};

// Hook لحاسبة نوع الجسم
export const useBodyTypeCalculator = (clubId: string) => {
  return usePhysicalTest('body-type-calculator', clubId);
};

// Hook لحاسبة تركيب الجسم
export const useBodyCompositionCalculator = (clubId: string) => {
  return usePhysicalTest('body-composition-calculator', clubId);
};

// Hook لسجلات الفريق
export const useTeamRecord = (clubId: string) => {
  return usePhysicalTest('team-record', clubId);
};

// دوال مساعدة لاختبار الأوتشي-كومي
const initializeUchiKomiAthletes = () => {
  const athletes = [];
  for (let i = 1; i <= 8; i++) {
    if (i === 1) {
      athletes.push({
        id: i,
        name: '',
        category: '',
        ageGroup: '13-16 سنة',
        age: 14,
        result10s: 8,
        evaluation10s: 80,
        result20s: 16,
        evaluation20s: 80,
        result30s: 24,
        evaluation30s: 80
      });
    } else {
      athletes.push({
        id: i,
        name: '',
        category: '',
        ageGroup: '',
        age: 0,
        result10s: 0,
        evaluation10s: 0,
        result20s: 0,
        evaluation20s: 0,
        result30s: 0,
        evaluation30s: 0
      });
    }
  }
  return athletes;
};

const getAgeGroup = (age: number): string => {
  if (age >= 8 && age <= 12) return '8-12 سنة';
  if (age >= 13 && age <= 16) return '13-16 سنة';
  if (age >= 17) return '17+ سنة';
  return 'غير محدد';
};

const calculateEvaluation = (age: number, result: number, timeInterval: '10s' | '20s' | '30s'): number => {
  if (result === 0 || age === 0) return 0;

  let maxValue = 0;
  
  if (age >= 8 && age <= 12) {
    switch (timeInterval) {
      case '10s': maxValue = 8; break;
      case '20s': maxValue = 16; break;
      case '30s': maxValue = 24; break;
    }
  } else if (age >= 13 && age <= 16) {
    switch (timeInterval) {
      case '10s': maxValue = 10; break;
      case '20s': maxValue = 20; break;
      case '30s': maxValue = 30; break;
    }
  } else if (age >= 17) {
    switch (timeInterval) {
      case '10s': maxValue = 12; break;
      case '20s': maxValue = 24; break;
      case '30s': maxValue = 36; break;
    }
  }

  const percentage = Math.min(100, (result * 100) / maxValue);
  return Math.round(percentage * 100) / 100;
};
