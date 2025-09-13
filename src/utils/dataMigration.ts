import { PhysicalTestsService, TrainingDataService } from '../services/mockDataService';

// قائمة بجميع مفاتيح localStorage المستخدمة في النظام
const LOCAL_STORAGE_KEYS = [
  // اختبارات الرياضيين
  'uchi-komi-test-data',
  'throwing-skills-test-data',
  'team-record-data',
  'speed-strength-tests-data',
  'special-speed-test-data',
  'special-endurance-test-data',
  'morphological-traits-data',
  'max-static-strength-test-data',
  'max-dynamic-strength-test-data',
  'groundwork-skills-test-data',
  'explosive-strength-kumi-test-data',
  'body-type-calculator-data',
  'body-composition-calculator-data',
  
  // بيانات المدربين
  'attendance-tracker-data',
  'weekly-schedule-data',
  'training-load-distribution-data',
  'technical-card-data',
  'session-evaluation-data',
  'annual-plan-data'
];

// ربط كل مفتاح بنوع الاختبار المقابل
const KEY_TO_TEST_TYPE_MAP: { [key: string]: string } = {
  'uchi-komi-test-data': 'uchi-komi-test',
  'throwing-skills-test-data': 'throwing-skills-test',
  'team-record-data': 'team-record',
  'speed-strength-tests-data': 'speed-strength-tests',
  'special-speed-test-data': 'special-speed-test',
  'special-endurance-test-data': 'special-endurance-test',
  'morphological-traits-data': 'morphological-traits',
  'max-static-strength-test-data': 'max-static-strength-test',
  'max-dynamic-strength-test-data': 'max-dynamic-strength-test',
  'groundwork-skills-test-data': 'groundwork-skills-test',
  'explosive-strength-kumi-test-data': 'explosive-strength-kumi-test',
  'body-type-calculator-data': 'body-type-calculator',
  'body-composition-calculator-data': 'body-composition-calculator'
};

export interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: Array<{ key: string; error: string }>;
  totalItems: number;
}

/**
 * نقل البيانات من localStorage إلى Firestore
 */
export const migrateLocalStorageToFirestore = async (clubId: string): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedKeys: [],
    errors: [],
    totalItems: 0
  };

  console.log(`بدء نقل البيانات للنادي: ${clubId}`);

  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        console.log(`لا توجد بيانات لـ: ${key}`);
        continue;
      }

      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.log(`البيانات فارغة لـ: ${key}`);
        continue;
      }

      // نقل البيانات البدنية
      if (KEY_TO_TEST_TYPE_MAP[key]) {
        const testType = KEY_TO_TEST_TYPE_MAP[key];
        await PhysicalTestsService.saveTestResults(testType, clubId, parsedData);
        console.log(`✅ تم نقل ${testType}: ${parsedData.length} عناصر`);
      }
      // نقل البيانات التدريبية
      else if (key === 'attendance-tracker-data') {
        await TrainingDataService.saveAttendance(clubId, parsedData);
        console.log(`✅ تم نقل بيانات الحضور: ${parsedData.length} عناصر`);
      }
      else if (key === 'weekly-schedule-data') {
        await TrainingDataService.saveWeeklySchedule(clubId, parsedData);
        console.log(`✅ تم نقل الجدول الأسبوعي: ${parsedData.length} عناصر`);
      }
      else if (key === 'training-load-distribution-data') {
        await TrainingDataService.saveTrainingLoad(clubId, parsedData);
        console.log(`✅ تم نقل توزيع الأحمال التدريبية`);
      }
      else if (key === 'technical-card-data') {
        await TrainingDataService.saveTechnicalCard(clubId, parsedData);
        console.log(`✅ تم نقل البطاقة الفنية`);
      }
      else if (key === 'session-evaluation-data') {
        await TrainingDataService.saveSessionEvaluation(clubId, parsedData);
        console.log(`✅ تم نقل تقييم الجلسة`);
      }
      else if (key === 'annual-plan-data') {
        const currentYear = new Date().getFullYear();
        await TrainingDataService.saveAnnualPlan(clubId, currentYear, parsedData);
        console.log(`✅ تم نقل الخطة السنوية`);
      }

      result.migratedKeys.push(key);
      result.totalItems += Array.isArray(parsedData) ? parsedData.length : 1;

    } catch (error) {
      console.error(`❌ خطأ في نقل ${key}:`, error);
      result.errors.push({
        key,
        error: error instanceof Error ? error.message : String(error)
      });
      result.success = false;
    }
  }

  console.log(`انتهى النقل: ${result.migratedKeys.length} مفاتيح، ${result.totalItems} عناصر، ${result.errors.length} أخطاء`);
  return result;
};

/**
 * تنظيف localStorage بعد النقل الناجح
 */
export const clearLocalStorageData = (keysToKeep: string[] = []): void => {
  const keysToRemove = LOCAL_STORAGE_KEYS.filter(key => !keysToKeep.includes(key));
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ تم حذف ${key} من localStorage`);
  });
  
  console.log(`تم تنظيف ${keysToRemove.length} مفاتيح من localStorage`);
};

/**
 * إنشاء نسخة احتياطية من بيانات localStorage
 */
export const createLocalStorageBackup = (): { [key: string]: any } => {
  const backup: { [key: string]: any } = {};
  
  LOCAL_STORAGE_KEYS.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        backup[key] = JSON.parse(data);
      } catch (error) {
        backup[key] = data; // في حالة كانت البيانات نص خام
      }
    }
  });
  
  console.log(`تم إنشاء نسخة احتياطية من ${Object.keys(backup).length} مفاتيح`);
  return backup;
};

/**
 * استعادة البيانات من النسخة الاحتياطية
 */
export const restoreFromBackup = (backup: { [key: string]: any }): void => {
  Object.entries(backup).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ تم استعادة ${key}`);
    } catch (error) {
      console.error(`❌ خطأ في استعادة ${key}:`, error);
    }
  });
  
  console.log(`تم استعادة ${Object.keys(backup).length} مفاتيح إلى localStorage`);
};

/**
 * التحقق من وجود بيانات في localStorage
 */
export const checkLocalStorageData = (): { [key: string]: number } => {
  const summary: { [key: string]: number } = {};
  
  LOCAL_STORAGE_KEYS.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        summary[key] = Array.isArray(parsedData) ? parsedData.length : 1;
      } catch (error) {
        summary[key] = 1; // بيانات نص خام
      }
    }
  });
  
  return summary;
};

/**
 * تصدير جميع البيانات كملف JSON
 */
export const exportAllData = (filename: string = 'irteqaa-backup.json'): void => {
  const backup = createLocalStorageBackup();
  const dataStr = JSON.stringify(backup, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = filename;
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  console.log(`تم تصدير البيانات إلى ${filename}`);
};
