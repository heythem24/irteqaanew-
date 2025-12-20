import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Row, Col, Form, Table, Alert } from 'react-bootstrap';
import type { Club, TrainingData } from '../../types';
import { useTrainingLoad } from '../../hooks/useTrainingData';
import { useHeartRateData } from '../../hooks/useHeartRateData';
import { UsersService as UserService } from '../../services/firestoreService';
import { CATEGORIES } from '../../utils/categoryUtils';
import './TrainingLoadDistribution.css';
import './coach-responsive.css';

interface Props {
  club: Club;
  onApplyToTechnicalCard?: (data: { unitNumber: number; intensity: number; heartRate: number }) => void;
}

const TrainingLoadDistribution: React.FC<Props> = ({ club, onApplyToTechnicalCard }) => {
  // الحصول على المستخدم الحالي لاسم المدرب
  const currentUser = UserService.getCurrentUser();
  const trainerName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'المدرب' : 'المدرب';

  // استقبال بيانات نبضات القلب من المحضر البدني
  const { heartRateData, loading: heartRateLoading } = useHeartRateData(club.id);

  // تتبع البيانات المستلمة
  useEffect(() => {
    console.log('Heart Rate Data Updated:', heartRateData);
    console.log('Loading:', heartRateLoading);
    console.log('Club ID:', club.id);
  }, [heartRateData, heartRateLoading, club.id]);

  // معلومات النموذج
  const [formData, setFormData] = useState({
    trainer: trainerName,
    category: '',
    location: '',
    selectedMonth: 10, // أكتوبر
    selectedYear: 2025
  });

  // قائمة الأشهر من سبتمبر إلى جوان
  const months = [
    { value: 9, name: 'سبتمبر' },
    { value: 10, name: 'أكتوبر' },
    { value: 11, name: 'نوفمبر' },
    { value: 12, name: 'ديسمبر' },
    { value: 1, name: 'جانفي' },
    { value: 2, name: 'فيفري' },
    { value: 3, name: 'مارس' },
    { value: 4, name: 'أفريل' },
    { value: 5, name: 'ماي' },
    { value: 6, name: 'جوان' }
  ];

  // توليد قائمة السنوات من 2010 إلى 2050
  const years = Array.from({ length: 41 }, (_, i) => 2010 + i);

  // أيام الأسبوع الثابتة للتدريب (3 أيام في كل أسبوع) - مرتبة حسب التسلسل الزمني
  const trainingDays = ['الثلاثاء', 'الجمعة', 'السبت'];

  // أسماء أيام الأسبوع
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // دالة لإيجاد تاريخ يوم معين في أسبوع معين من الشهر (بناءً على التقويم الحقيقي)
  const findDateForDayInWeek = (month: number, year: number, weekNumber: number, targetDayName: string) => {
    try {
      // للأشهر من سبتمبر إلى ديسمبر: نفس السنة
      // للأشهر من جانفي إلى جوان: السنة التالية
      const actualYear = month <= 6 ? year + 1 : year;

      // فهرس اليوم المطلوب (0 = أحد، 1 = اثنين، إلخ)
      const targetDayIndex = dayNames.indexOf(targetDayName);

      if (targetDayIndex === -1) {
        return '';
      }

      // الحصول على أول يوم في الشهر
      const firstDayOfMonth = new Date(actualYear, month - 1, 1);
      const firstDayOfWeek = firstDayOfMonth.getDay(); // يوم الأسبوع لأول يوم في الشهر

      // حساب بداية الأسبوع الأول (الأحد)
      const firstSundayDate = new Date(actualYear, month - 1, 1);
      if (firstDayOfWeek !== 0) { // إذا لم يكن أول يوم هو الأحد
        firstSundayDate.setDate(firstSundayDate.getDate() - firstDayOfWeek);
      }

      // حساب تاريخ اليوم المطلوب في الأسبوع المحدد
      const targetDate = new Date(firstSundayDate.getTime());
      targetDate.setDate(targetDate.getDate() + (weekNumber * 7) + targetDayIndex);

      // التحقق من أن التاريخ في نفس الشهر المطلوب
      const resultMonth = targetDate.getMonth() + 1;
      const resultYear = targetDate.getFullYear();

      // إذا كان التاريخ خارج الشهر أو السنة المطلوبة، إرجاع فارغ
      if (resultMonth !== month || resultYear !== actualYear) {
        return '';
      }

      // إرجاع التاريخ بصيغة "اليوم/الشهر"
      const day = targetDate.getDate().toString().padStart(2, '0');
      const monthNum = resultMonth.toString().padStart(2, '0');
      const result = `${day}/${monthNum}`;

      return result;
    } catch (error) {
      return '';
    }
  };

  // دالة لحساب عدد الأسابيع في الشهر بناءً على التقويم الحقيقي
  const getWeeksInMonth = (month: number, year: number) => {
    const actualYear = month <= 6 ? year + 1 : year;
    const firstDayOfMonth = new Date(actualYear, month - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // يوم الأسبوع لأول يوم في الشهر

    // حساب بداية الأسبوع الأول (الأحد)
    const firstSundayDate = new Date(actualYear, month - 1, 1);
    if (firstDayOfWeek !== 0) { // إذا لم يكن أول يوم هو الأحد
      firstSundayDate.setDate(firstSundayDate.getDate() - firstDayOfWeek);
    }

    // حساب عدد الأسابيع بناءً على أيام التدريب الموجودة فعلياً في الشهر
    let maxWeek = 0;
    let weekNumber = 0;

    // فحص كل أسبوع حتى 6 أسابيع كحد أقصى
    while (weekNumber < 6) {
      let hasTrainingDayInWeek = false;

      // فحص كل يوم تدريب في هذا الأسبوع
      for (const dayName of trainingDays) {
        const targetDayIndex = dayNames.indexOf(dayName);
        if (targetDayIndex === -1) continue;

        // حساب تاريخ هذا اليوم في الأسبوع الحالي
        const targetDate = new Date(firstSundayDate.getTime());
        targetDate.setDate(targetDate.getDate() + (weekNumber * 7) + targetDayIndex);

        // التحقق من أن التاريخ في نفس الشهر والسنة المطلوبة
        const resultMonth = targetDate.getMonth() + 1;
        const resultYear = targetDate.getFullYear();

        if (resultMonth === month && resultYear === actualYear) {
          hasTrainingDayInWeek = true;
          break;
        }
      }

      if (hasTrainingDayInWeek) {
        maxWeek = weekNumber;
      } else if (weekNumber > 0) {
        // إذا لم نجد أي يوم تدريب في هذا الأسبوع ووجدنا أسابيع سابقة، نتوقف
        break;
      }

      weekNumber++;
    }

    return maxWeek + 1; // إرجاع عدد الأسابيع (مفهرس من 0)
  };

  // دالة لحساب تواريخ التدريب للشهر المحدد
  const getTrainingDates = (month: number, year: number) => {
    const dates = [];
    const daysOfWeek = [];
    const weeksCount = getWeeksInMonth(month, year);

    // لكل أسبوع في الشهر (ديناميكي)
    for (let week = 0; week < weeksCount; week++) {
      // لكل يوم تدريب في الأسبوع
      for (let dayIndex = 0; dayIndex < 3; dayIndex++) {
        const dayName = trainingDays[dayIndex];
        const date = findDateForDayInWeek(month, year, week, dayName);

        dates.push(date);
        daysOfWeek.push(dayName);
      }
    }

    return { dates, daysOfWeek, weeksCount };
  };

  // دالة لحساب عدد الوحدات السابقة منذ بداية الموسم (سبتمبر → قبل الشهر الحالي)
  const getSeasonUnitOffset = (month: number, year: number) => {
    // ترتيب أشهر الموسم كما في القائمة months
    const seasonMonths = months.map(m => m.value);
    const currentIndex = seasonMonths.indexOf(month);

    if (currentIndex <= 0) {
      return 0;
    }

    let offset = 0;

    for (let i = 0; i < currentIndex; i++) {
      const prevMonth = seasonMonths[i];
      const { dates: prevDates } = getTrainingDates(prevMonth, year);
      offset += prevDates.filter((d: string) => d && d.trim() !== '').length;
    }

    return offset;
  };

  // حساب التواريخ وأيام الأسبوع للشهر المحدد
  const { dates, daysOfWeek, weeksCount } = getTrainingDates(formData.selectedMonth, formData.selectedYear);

  // حساب الترقيم المتسلسل للوحدات في الشهر الحالي مع مراعاة الأشهر السابقة في الموسم
  const seasonUnitOffset = getSeasonUnitOffset(formData.selectedMonth, formData.selectedYear);
  const unitNumbers: (number | '')[] = [];
  {
    let counter = seasonUnitOffset;
    for (let i = 0; i < dates.length; i++) {
      const hasDate = dates[i] && (dates[i] as string).trim() !== '';
      if (hasDate) {
        counter += 1;
        unitNumbers.push(counter);
      } else {
        unitNumbers.push('');
      }
    }
  }

  // فئات العمر
  const STATIC_AGE_CATEGORY_OPTIONS = Array.from(new Set(CATEGORIES.map(c => c.nameAr)));
  const [ageCategoryOptions, setAgeCategoryOptions] = useState<string[]>(STATIC_AGE_CATEGORY_OPTIONS);

  // استخدام جميع الفئات العمرية المتاحة
  useEffect(() => {
    setAgeCategoryOptions(STATIC_AGE_CATEGORY_OPTIONS);
  }, []);

  // تحديث اسم المدرب عند تغيير المستخدم
  useEffect(() => {
    setFormData(prev => ({ ...prev, trainer: trainerName }));
  }, [trainerName]);

  // حدود القيم لكل مستوى - النطاقات ثابتة
  const limits = useMemo(() => ({
    maximum: {
      percentage: { min: 86, max: 95 },
      heartRate: { min: 185, max: 198 }
    },
    high: { percentage: { min: 76, max: 85 }, heartRate: { min: 171, max: 184 } },
    medium: { percentage: { min: 65, max: 75 }, heartRate: { min: 156, max: 170 } }
  }), []);

  // حساب الشدة من نبضات القلب (العكس)
  const calculatePercentageFromHeartRate = (heartRate: number, loadLevel: 'maximum' | 'high' | 'medium'): number => {
    const levelLimits = limits[loadLevel];

    // التأكد من أن نبضات القلب ضمن النطاق المسموح
    if (heartRate < levelLimits.heartRate.min || heartRate > levelLimits.heartRate.max) {
      return 0;
    }

    // حساب النسبة المئوية بناءً على التناسب الخطي
    const heartRateRange = levelLimits.heartRate.max - levelLimits.heartRate.min;
    const percentageRange = levelLimits.percentage.max - levelLimits.percentage.min;
    const relativePosition = (heartRate - levelLimits.heartRate.min) / heartRateRange;
    const percentage = levelLimits.percentage.min + (percentageRange * relativePosition);

    return Math.round(percentage);
  };



  const [trainingData, setTrainingData] = useState<TrainingData>({
    maximum: {
      weeks: [
        { percentages: [null, 90, 90], heartRates: [null, 191, 191] },
        { percentages: [null, 90, 90], heartRates: [null, 191, 191] },
        { percentages: [null, 90, null], heartRates: [null, 191, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] }
      ]
    },
    high: {
      weeks: [
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] }
      ]
    },
    medium: {
      weeks: [
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, 70], heartRates: [null, null, 163] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] },
        { percentages: [null, null, null], heartRates: [null, null, null] }
      ]
    }
  });

  // تتبع آخر وقت تم فيه تطبيق بيانات المحضر البدني
  const [lastAppliedHeartRateTime, setLastAppliedHeartRateTime] = useState<string | null>(null);

  // تطبيق بيانات المحضر البدني على جميع الخلايا (مسح القديم وتطبيق الجديد)
  useEffect(() => {
    if (heartRateData?.averageMaxHR && heartRateData?.sentAt) {
      // تحقق من أن هذه بيانات جديدة لم يتم تطبيقها من قبل
      if (lastAppliedHeartRateTime === heartRateData.sentAt) {
        console.log('البيانات مطبقة مسبقاً، تخطي...');
        return;
      }

      const receivedHeartRate = heartRateData.averageMaxHR;
      const calculatedPercentage = calculatePercentageFromHeartRate(receivedHeartRate, 'maximum');

      console.log(`بيانات المحضر البدني الجديدة: ${receivedHeartRate} ن/د → شدة ${calculatedPercentage}%`);

      if (calculatedPercentage > 0) {
        setTrainingData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));

          // مسح جميع القيم في العالي والمتوسط
          newData.high.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((_: any, dayIndex: number) => {
              newData.high.weeks[weekIndex].percentages[dayIndex] = null;
              newData.high.weeks[weekIndex].heartRates[dayIndex] = null;
            });
          });

          newData.medium.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((_: any, dayIndex: number) => {
              newData.medium.weeks[weekIndex].percentages[dayIndex] = null;
              newData.medium.weeks[weekIndex].heartRates[dayIndex] = null;
            });
          });

          // تحديث جميع خلايا المستوى الأقصى التي لها قيم
          newData.maximum.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((percentage: number | null, dayIndex: number) => {
              if (percentage !== null && percentage !== undefined) {
                newData.maximum.weeks[weekIndex].percentages[dayIndex] = calculatedPercentage;
                newData.maximum.weeks[weekIndex].heartRates[dayIndex] = receivedHeartRate;
                console.log(`تحديث خلية [${weekIndex}][${dayIndex}]: ${calculatedPercentage}% → ${receivedHeartRate} ن/د`);
              }
            });
          });

          return newData;
        });

        // تحديث وقت آخر تطبيق
        setLastAppliedHeartRateTime(heartRateData.sentAt);
      }
    }
  }, [heartRateData?.averageMaxHR, heartRateData?.sentAt, lastAppliedHeartRateTime]);

  // حساب نبضات القلب من النسبة المئوية بناءً على النطاقات المحددة
  const calculateHeartRate = (percentage: number, loadLevel: 'maximum' | 'high' | 'medium'): number => {
    const levelLimits = limits[loadLevel];

    console.log(`حساب نبضات القلب: ${percentage}% للمستوى ${loadLevel}`, levelLimits);

    // التأكد من أن النسبة ضمن النطاق المسموح
    if (percentage < levelLimits.percentage.min || percentage > levelLimits.percentage.max) {
      console.log('النسبة خارج النطاق المسموح');
      return 0; // إرجاع 0 إذا كانت النسبة خارج النطاق
    }

    // حساب نبضات القلب بناءً على التناسب الخطي ضمن النطاق (لجميع المستويات)
    const percentageRange = levelLimits.percentage.max - levelLimits.percentage.min;
    const heartRateRange = levelLimits.heartRate.max - levelLimits.heartRate.min;

    // حساب الموقع النسبي للنسبة المئوية ضمن النطاق
    const relativePosition = (percentage - levelLimits.percentage.min) / percentageRange;

    // حساب نبضات القلب المقابلة
    const heartRate = levelLimits.heartRate.min + (heartRateRange * relativePosition);
    const roundedHeartRate = Math.round(heartRate);

    console.log(`النتيجة: ${percentage}% → ${roundedHeartRate} ن/د`);
    return roundedHeartRate;
  };



  // تحديد مستوى الحمل بناءً على النسبة المئوية
  const getLoadLevel = (percentage: number): string => {
    if (percentage >= limits.maximum.percentage.min && percentage <= limits.maximum.percentage.max) {
      return 'أقصى';
    } else if (percentage >= limits.high.percentage.min && percentage <= limits.high.percentage.max) {
      return 'عالي';
    } else if (percentage >= limits.medium.percentage.min && percentage <= limits.medium.percentage.max) {
      return 'متوسط';
    }
    return 'متوسط';
  };

  // حساب متوسط الأسبوع لجميع المستويات
  const calculateWeeklyAverage = (weekIndex: number): number => {
    if (!trainingData) return 0;

    const allPercentages: number[] = [];

    // جمع جميع النسب من كل المستويات
    [trainingData.maximum, trainingData.high, trainingData.medium].forEach(level => {
      if (level && level.weeks && level.weeks[weekIndex]) {
        const week = level.weeks[weekIndex];
        week.percentages.forEach(p => {
          if (p !== null && p !== undefined) allPercentages.push(p);
        });
      }
    });

    if (allPercentages.length === 0) return 0;
    return Math.round((allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length) * 100) / 100;
  };

  // حساب زمن التدريب الأسبوعي
  const calculateWeeklyTrainingTime = (weekIndex: number): { time: number; level: string } => {
    const average = calculateWeeklyAverage(weekIndex);
    const level = getLoadLevel(average);
    return { time: 270, level };
  };

  // فحص ما إذا كان العمود محجوز بواسطة مستوى آخر
  const isColumnBlocked = (targetLoadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number): boolean => {
    const levels: ('maximum' | 'high' | 'medium')[] = ['maximum', 'high', 'medium'];

    for (const level of levels) {
      if (level !== targetLoadLevel) {
        const value = trainingData[level].weeks[weekIndex].percentages[dayIndex];
        if (value !== null && value !== undefined) {
          return true; // العمود محجوز بواسطة مستوى آخر
        }
      }
    }
    return false; // العمود متاح
  };

  // تنظيف العمود من القيم الأخرى عند إدخال قيمة جديدة
  const clearOtherLevelsInColumn = (targetLoadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number) => {
    const levels: ('maximum' | 'high' | 'medium')[] = ['maximum', 'high', 'medium'];

    setTrainingData(prev => {
      const newData = { ...prev };

      for (const level of levels) {
        if (level !== targetLoadLevel) {
          newData[level].weeks[weekIndex].percentages[dayIndex] = null;
          newData[level].weeks[weekIndex].heartRates[dayIndex] = null;
        }
      }

      return newData;
    });
  };

  // تحديث النسبة المئوية مع فحص قيود العمود
  const updatePercentage = (loadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number, value: string) => {
    // إزالة رمز % إذا كان موجوداً وتنظيف القيمة
    const cleanValue = value.replace('%', '').trim();

    // إذا كانت القيمة فارغة، اجعل القيمة null
    if (cleanValue === '') {
      setTrainingData(prev => {
        const newData = { ...prev };
        newData[loadLevel].weeks[weekIndex].percentages[dayIndex] = null;
        newData[loadLevel].weeks[weekIndex].heartRates[dayIndex] = null;
        return newData;
      });
      return;
    }

    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue)) return;

    // فحص ما إذا كان العمود محجوز بواسطة مستوى آخر
    if (isColumnBlocked(loadLevel, weekIndex, dayIndex)) {
      alert('هذا العمود محجوز بواسطة مستوى آخر. يرجى مسح القيمة الأخرى أولاً أو استخدام عمود آخر.');
      return;
    }

    // تنظيف المستويات الأخرى في نفس العمود عند إدخال قيمة جديدة
    clearOtherLevelsInColumn(loadLevel, weekIndex, dayIndex);

    // حفظ القيمة مع حساب نبضات القلب
    setTrainingData(prev => {
      const newData = { ...prev };
      newData[loadLevel].weeks[weekIndex].percentages[dayIndex] = numValue;

      // حساب نبضات القلب فقط إذا كانت القيمة في النطاق المقبول
      if (numValue >= 0 && numValue <= 100) {
        const levelLimits = limits[loadLevel];
        const isValid = (numValue >= levelLimits.percentage.min && numValue <= levelLimits.percentage.max);

        if (isValid) {
          // حساب نبضات القلب بناءً على الشدة والحدود المحدثة
          const heartRate = calculateHeartRate(numValue, loadLevel);
          newData[loadLevel].weeks[weekIndex].heartRates[dayIndex] = heartRate;
        } else {
          // لا نحسب نبضات القلب إذا كانت القيمة خارج النطاق
          newData[loadLevel].weeks[weekIndex].heartRates[dayIndex] = null;
        }
      } else {
        newData[loadLevel].weeks[weekIndex].heartRates[dayIndex] = null;
      }

      return newData;
    });
  };

  // التحقق من صحة القيمة عند فقدان التركيز
  const validateValue = (loadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number) => {
    if (!trainingData || !trainingData[loadLevel] || !trainingData[loadLevel].weeks[weekIndex]) {
      return;
    }

    const currentValue = trainingData[loadLevel].weeks[weekIndex].percentages[dayIndex];

    if (currentValue !== null) {
      // التحقق من الحدود العامة
      if (currentValue < 0 || currentValue > 100) {
        alert('النسبة المئوية يجب أن تكون بين 0% و 100%');
        return;
      }

      // التحقق من الحدود حسب المستوى
      const levelLimits = limits[loadLevel];
      const isValid = (currentValue >= levelLimits.percentage.min && currentValue <= levelLimits.percentage.max);

      if (!isValid) {
        const levelName = loadLevel === 'maximum' ? 'الأقصى' : loadLevel === 'high' ? 'العالي' : 'المتوسط';
        alert(`للمستوى ${levelName}: القيمة يجب أن تكون بين ${levelLimits.percentage.min}% و ${levelLimits.percentage.max}%`);
      }
    }
  };

  // تنسيق نبضات القلب للعرض
  const formatHeartRate = (value: number | null): string => {
    return value !== null ? `${value} ن/د` : '';
  };

  // حالة لتتبع الحقل المركز عليه
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // معالج التركيز
  const handleFocus = (loadLevel: string, weekIndex: number, dayIndex: number) => {
    setFocusedField(`${loadLevel}-${weekIndex}-${dayIndex}`);
  };

  // معالج فقدان التركيز
  const handleBlur = (loadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number) => {
    setFocusedField(null);
    validateValue(loadLevel, weekIndex, dayIndex);
  };

  // تنسيق القيمة للعرض (مع أو بدون %)
  const formatValueForDisplay = (value: number | null, loadLevel: string, weekIndex: number, dayIndex: number): string => {
    if (value === null || value === undefined) return '';
    const fieldKey = `${loadLevel}-${weekIndex}-${dayIndex}`;
    const isFocused = focusedField === fieldKey;
    return isFocused ? value.toString() : `${value}%`;
  };

  // فحص ما إذا كان الحقل معطل (العمود محجوز بواسطة مستوى آخر)
  const isFieldDisabled = (targetLoadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number): boolean => {
    // إذا كان الحقل الحالي يحتوي على قيمة، فهو غير معطل
    const currentValue = trainingData[targetLoadLevel].weeks[weekIndex].percentages[dayIndex];
    if (currentValue !== null && currentValue !== undefined) {
      return false;
    }

    // فحص ما إذا كان العمود محجوز بواسطة مستوى آخر
    return isColumnBlocked(targetLoadLevel, weekIndex, dayIndex);
  };

  // الحصول على كلاس CSS للحقل
  const getFieldClassName = (targetLoadLevel: 'maximum' | 'high' | 'medium', weekIndex: number, dayIndex: number): string => {
    let className = 'load-input';

    if (isFieldDisabled(targetLoadLevel, weekIndex, dayIndex)) {
      className += ' disabled-field';
    }

    return className;
  };

  // استخدام Firestore بدلاً من localStorage
  const { loadData, saveTrainingLoad } = useTrainingLoad(club.id);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    if (loadData) {
      // تحميل معلومات النموذج
      setFormData({
        trainer: loadData.trainer || trainerName,
        category: loadData.category || '',
        location: loadData.location || '',
        selectedMonth: loadData.selectedMonth || 10,
        selectedYear: loadData.selectedYear || 2025
      });

      // تحميل بيانات درجات الحمل إذا كانت موجودة
      if (loadData.trainingData) {
        setTrainingData(loadData.trainingData);

        // إعادة تعيين وقت آخر تطبيق لضمان تطبيق بيانات المحضر البدني بعد التحميل
        setLastAppliedHeartRateTime(null);
      }
    }
  }, [loadData, trainerName]);

  const saveData = async () => {
    try {
      // إنشاء كائن يحتوي على جميع البيانات المطلوبة للحفظ
      const dataToSave = {
        ...formData,
        trainingData: trainingData, // إضافة بيانات درجات الحمل
        weeksCount: weeksCount, // إضافة عدد الأسابيع
        dates: dates, // إضافة التواريخ
        daysOfWeek: daysOfWeek, // إضافة أيام الأسبوع
        savedAt: new Date().toISOString() // إضافة تاريخ الحفظ
      };

      await saveTrainingLoad(dataToSave);
      alert('تم حفظ توزيع درجة حمل التدريب بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ توزيع درجة حمل التدريب');
      console.error('Error saving training load:', err);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // دالة لإعادة تطبيق بيانات المحضر البدني على جميع الخلايا
  const reapplyHeartRateData = () => {
    if (heartRateData?.averageMaxHR) {
      const receivedHeartRate = heartRateData.averageMaxHR;
      const calculatedPercentage = calculatePercentageFromHeartRate(receivedHeartRate, 'maximum');

      if (calculatedPercentage > 0) {
        setTrainingData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          let updatedCount = 0;

          // مسح جميع القيم في العالي والمتوسط
          newData.high.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((_: any, dayIndex: number) => {
              newData.high.weeks[weekIndex].percentages[dayIndex] = null;
              newData.high.weeks[weekIndex].heartRates[dayIndex] = null;
            });
          });

          newData.medium.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((_: any, dayIndex: number) => {
              newData.medium.weeks[weekIndex].percentages[dayIndex] = null;
              newData.medium.weeks[weekIndex].heartRates[dayIndex] = null;
            });
          });

          // تحديث جميع خلايا المستوى الأقصى التي لها قيم
          newData.maximum.weeks.forEach((week: any, weekIndex: number) => {
            week.percentages.forEach((percentage: number | null, dayIndex: number) => {
              if (percentage !== null && percentage !== undefined) {
                newData.maximum.weeks[weekIndex].percentages[dayIndex] = calculatedPercentage;
                newData.maximum.weeks[weekIndex].heartRates[dayIndex] = receivedHeartRate;
                updatedCount++;
              }
            });
          });

          return newData;
        });

        alert(`تم إعادة تطبيق بيانات المحضر البدني:\n- نبضات القلب: ${receivedHeartRate} ن/د\n- الشدة: ${calculatedPercentage}%\n\nتم مسح قيم العالي والمتوسط وتحديث المستوى الأقصى`);
      }
    }
  };

  // دالة لمعالجة النقر على رقم الوحدة
  const handleUnitClick = (index: number) => {
    if (!onApplyToTechnicalCard) return;

    const unitNumber = unitNumbers[index];
    if (!unitNumber || typeof unitNumber !== 'number') {
      return;
    }

    const weekIndex = Math.floor(index / 3);
    const dayIndex = index % 3;
    const levels: ('maximum' | 'high' | 'medium')[] = ['maximum', 'high', 'medium'];

    let selectedLevel: 'maximum' | 'high' | 'medium' | null = null;
    let selectedIntensity: number | null = null;
    let selectedHeartRate: number | null = null;

    for (const level of levels) {
      const week = trainingData[level]?.weeks?.[weekIndex];
      if (!week) continue;
      const percentage = week.percentages?.[dayIndex];
      if (percentage !== null && percentage !== undefined) {
        selectedLevel = level;
        selectedIntensity = percentage;
        selectedHeartRate = week.heartRates?.[dayIndex] ?? null;
        break;
      }
    }

    if (!selectedLevel || selectedIntensity === null) {
      alert('لا توجد شدة مسجلة لهذه الوحدة في جدول درجة الحمل.');
      return;
    }

    const heartRateValue = selectedHeartRate !== null
      ? selectedHeartRate
      : calculateHeartRate(selectedIntensity, selectedLevel);

    const confirmed = window.confirm(
      `تطبيق بيانات وحدة رقم ${unitNumber} على البطاقة الفنية؟\n` +
      `الشدة: ${selectedIntensity}%\n` +
      `نبض القلب: ${heartRateValue} ن/د`
    );

    if (!confirmed) return;

    onApplyToTechnicalCard({
      unitNumber: Number(unitNumber),
      intensity: selectedIntensity,
      heartRate: heartRateValue,
    });

    alert('تم إرسال بيانات الوحدة إلى البطاقة الفنية، يمكنك فتح البطاقة لمشاهدة التغييرات.');
  };

  // طباعة توزيع درجة حمل التدريب
  const printTrainingLoad = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // حساب التواريخ للطباعة
    const { dates: printDates, daysOfWeek: printDaysOfWeek, weeksCount: printWeeksCount } = getTrainingDates(formData.selectedMonth, formData.selectedYear);
    // حساب تعويض رقم الوحدة عبر الموسم للطباعة (نفس منطق الواجهة)
    const printSeasonUnitOffset = getSeasonUnitOffset(formData.selectedMonth, formData.selectedYear);

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>توزيع درجة حمل التدريب - ${formData.trainer || 'المدرب'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
            font-size: 16px;
            border: 2px solid #000;
            page-break-inside: avoid;
          }
          th, td {
            border: 1px solid #000;
            padding: 12px 8px; /* تكبير المساحة الداخلية للخلايا */
            text-align: center;
            line-height: 1.6; /* تحسين المسافة بين الأسطر */
            font-weight: bold;
            font-size: 16px;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 18px; /* تكبير حجم خط العناوين */
            padding: 15px 10px;
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 22px; /* تكبير حجم العنوان الرئيسي */
            font-weight: bold;
          }
          .load-label {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 16px; /* تكبير حجم نص درجة الحمل */
            padding: 15px 10px;
          }
          .input-cell {
            background-color: #f8f9fa;
            font-size: 16px; /* تكبير حجم النص في خلايا الإدخال */
            font-weight: bold;
          }
          .heart-rate-display {
            background-color: #fef3c7;
            font-weight: bold;
            font-size: 16px; /* تكبير حجم النص في خلايا نبضات القلب */
          }
          @media print {
            @page {
              margin: 8mm;
              size: landscape;
            }
            
            body { 
              margin: 0 !important; 
              padding: 0 !important;
              font-family: Arial, sans-serif;
              direction: rtl;
            }
            
            h2 {
              font-size: 20px !important;
              font-weight: bold !important;
              text-align: center !important;
              margin: 5px 0 10px 0 !important;
            }
            
            /* معلومات الرأس */
            .header-info {
              margin-bottom: 10px !important;
              padding: 8px !important;
              font-size: 12px !important;
            }
            
            table { 
              width: 100% !important;
              border-collapse: collapse !important;
              border: 2px solid #000 !important;
              font-size: 14px !important;
              margin: 0 !important;
              height: auto !important;
            }
            
            th, td { 
              padding: 10px 8px !important; 
              font-weight: bold !important;
              font-size: 15px !important;
              border: 1px solid #000 !important;
              text-align: center !important;
              vertical-align: middle !important;
              line-height: 1.3 !important;
            }
            
            th {
              font-size: 16px !important;
              font-weight: bold !important;
              padding: 12px 10px !important;
              background-color: #e3f2fd !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .load-label {
              font-size: 12px !important;
              padding: 10px 6px !important;
              background-color: #667eea !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .input-cell {
              font-size: 13px !important;
              font-weight: bold !important;
            }
            
            .heart-rate-display {
              font-size: 11px !important;
              font-weight: bold !important;
              background-color: #fef3c7 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          
          /* تحسينات خاصة للوضع الأفقي */
          @media print and (orientation: landscape) {
            @page {
              margin: 8mm !important;
            }
            
            h2 {
              font-size: 18px !important;
              margin: 3px 0 8px 0 !important;
            }
            
            .header-info {
              margin-bottom: 8px !important;
              padding: 6px !important;
              font-size: 12px !important;
            }
            
            table { 
              font-size: 15px !important;
              width: 100% !important;
              height: auto !important;
            }
            
            th, td { 
              padding: 12px 10px !important; 
              font-size: 14px !important;
              font-weight: bold !important;
              line-height: 1.3 !important;
            }
            
            th {
              font-size: 15px !important;
              padding: 14px 12px !important;
              font-weight: bold !important;
            }
            
            .load-label {
              font-size: 13px !important;
              padding: 14px 10px !important;
              font-weight: bold !important;
            }
            
            .input-cell {
              font-size: 14px !important;
              font-weight: bold !important;
              padding: 10px 8px !important;
            }
            
            .heart-rate-display {
              font-size: 12px !important;
              font-weight: bold !important;
              padding: 8px 6px !important;
            }
            
            /* تحسين الصفوف بدون إفراط */
            tbody tr {
              height: auto !important;
            }
            
            thead tr {
              height: auto !important;
            }
          }
          

        </style>
      </head>
      <body>
        <h2>توزيع درجة حمل التدريب - ${formData.trainer || 'المدرب'}</h2>
        
        <!-- معلومات الرأس -->
        <div class="header-info" style="margin-bottom: 15px; padding: 10px; border: 2px solid #667eea; border-radius: 8px; background-color: #f8f9fa;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold;">
            <div><strong>المدرب:</strong> ${formData.trainer || ''}</div>
            <div><strong>الفئة العمرية:</strong> ${formData.category || ''}</div>
            <div><strong>المكان:</strong> ${formData.location || ''}</div>
            <div style="color: #1976d2;"><strong>الشهر:</strong> ${months.find(m => m.value === formData.selectedMonth)?.name || ''} ${formData.selectedYear}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 80px;">درجة الحمل</th>
              ${Array.from({ length: printWeeksCount }, (_, index) =>
      `<th colspan="3">الأسبوع ${['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][index]}</th>`
    ).join('')}
            </tr>
            <tr>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => `<th>${index + 1}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- زمن الوحدة التدريبية -->
            <tr>
              <td>زمن الوحدة التدريبية</td>
              ${Array.from({ length: printWeeksCount * 3 }, () => '<td>90</td>').join('')}
            </tr>
            <!-- رقم الوحدة -->
            <tr>
              <td>رقم الوحدة</td>
              ${(() => {
        let counter = printSeasonUnitOffset;
        return Array.from({ length: printWeeksCount * 3 }, (_, index) => {
          const date = printDates[index];
          if (date && date.trim() !== '') {
            counter += 1;
            return `<td>${counter}</td>`;
          }
          return '<td></td>';
        }).join('');
      })()}
            </tr>
            <!-- التاريخ -->
            <tr>
              <td>التاريخ</td>
              ${printDates.map(date => `<td style="font-weight: bold; color: #1976d2; font-size: 30px; text-align: center; padding: 8px 4px;">${date || '-'}</td>`).join('')}
            </tr>
            <!-- أيام الأسبوع -->
            <tr>
              <td>أيام الأسبوع</td>
              ${printDaysOfWeek.map(day => `<td>${day}</td>`).join('')}
            </tr>

            <!-- الأقصى -->
            <tr>
              <td class="load-label" rowspan="2">
                <div>
                  <div>أقصى</div>
                  <small>% 95:86</small><br/>
                  <small>ن/د 198:185</small>
                </div>
              </td>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const percentage = trainingData.maximum.weeks[weekIndex]?.percentages[dayInWeek];
        return `<td class="input-cell">${percentage || ''}</td>`;
      }).join('')}
            </tr>
            <tr>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const heartRate = trainingData.maximum.weeks[weekIndex]?.heartRates[dayInWeek];
        return `<td class="heart-rate-display">${heartRate ? heartRate + ' ن/د' : ''}</td>`;
      }).join('')}
            </tr>

            <!-- العالي -->
            <tr>
              <td class="load-label" rowspan="2">
                <div>
                  <div>عالي</div>
                  <small>% 85:76</small><br/>
                  <small>ن/د 184:171</small>
                </div>
              </td>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const percentage = trainingData.high.weeks[weekIndex]?.percentages[dayInWeek];
        return `<td class="input-cell">${percentage || ''}</td>`;
      }).join('')}
            </tr>
            <tr>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const heartRate = trainingData.high.weeks[weekIndex]?.heartRates[dayInWeek];
        return `<td class="heart-rate-display">${heartRate ? heartRate + ' ن/د' : ''}</td>`;
      }).join('')}
            </tr>

            <!-- المتوسط -->
            <tr>
              <td class="load-label" rowspan="2">
                <div>
                  <div>متوسط</div>
                  <small>% 75:65</small><br/>
                  <small>ن/د 170:156</small>
                </div>
              </td>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const percentage = trainingData.medium.weeks[weekIndex]?.percentages[dayInWeek];
        return `<td class="input-cell">${percentage || ''}</td>`;
      }).join('')}
            </tr>
            <tr>
              ${Array.from({ length: printWeeksCount * 3 }, (_, index) => {
        const weekIndex = Math.floor(index / 3);
        const dayInWeek = index % 3;
        const heartRate = trainingData.medium.weeks[weekIndex]?.heartRates[dayInWeek];
        return `<td class="heart-rate-display">${heartRate ? heartRate + ' ن/د' : ''}</td>`;
      }).join('')}
            </tr>

            <!-- زمن التدريب الأسبوعي -->
            <tr>
              <td class="row-label">زمن التدريب الأسبوعي</td>
              ${Array.from({ length: printWeeksCount }, (_, weekIndex) => {
        const weeklyTime = calculateWeeklyTrainingTime(weekIndex);
        return `<td colspan="3" class="weekly-time">${weeklyTime.time}<br/>${weeklyTime.level}</td>`;
      }).join('')}
            </tr>

            <!-- متوسط درجة الحمل الأسبوعية -->
            <tr>
              <td class="row-label">متوسط درجة الحمل الأسبوعية</td>
              ${Array.from({ length: printWeeksCount }, (_, weekIndex) => {
        const average = calculateWeeklyAverage(weekIndex);
        return `<td colspan="3" class="weekly-average">% ${average}</td>`;
      }).join('')}
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white d-flex align-items-center justify-content-between">
        <div className="text-end" dir="rtl">
          <h4 className="mb-0" dir="rtl">
            <i className="fas fa-chart-line me-2"></i>
            توزيع درجة حمل التدريب - {months.find(m => m.value === formData.selectedMonth)?.name} {formData.selectedYear}
          </h4>

        </div>
        <div className="text-start">
          <Button variant="outline-light" size="sm" onClick={printTrainingLoad}>
            <i className="fas fa-print me-2"></i>
            طباعة الجدول
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات الرأس */}
        <Row className="mb-4" dir="rtl">
          <Col md={3} className="text-end">
            <strong>المدرب:</strong>
            <Form.Control
              type="text"
              value={formData.trainer}
              onChange={(e) => updateField('trainer', e.target.value)}
              placeholder="اسم المدرب"
              className="mt-1"
              dir="rtl"
            />
          </Col>
          <Col md={3} className="text-center">
            <strong>الفئة العمرية:</strong>
            <Form.Select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="mt-1"
              dir="rtl"
            >
              <option value="">اختر الفئة العمرية</option>
              {ageCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} className="text-start">
            <strong>المكان:</strong>
            <Form.Control
              type="text"
              value={formData.location}
              placeholder="مكان التدريب"
              className="mt-1"
              dir="rtl"
              onChange={(e) => updateField('location', e.target.value)}
            />
          </Col>
          <Col md={3} className="text-start">
            <Row>
              <Col md={6}>
                <strong>الشهر:</strong>
                <Form.Select
                  value={formData.selectedMonth}
                  onChange={(e) => updateField('selectedMonth', parseInt(e.target.value))}
                  className="mt-1"
                  dir="rtl"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <strong>السنة:</strong>
                <Form.Select
                  value={formData.selectedYear}
                  onChange={(e) => updateField('selectedYear', parseInt(e.target.value))}
                  className="mt-1"
                  dir="rtl"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* زر الحفظ */}
        <Row className="mb-3">
          <Col className="text-end">
            <Button
              variant="success"
              onClick={saveData}
              size="sm"
              dir="rtl"
            >
              <i className="fas fa-save me-2"></i>
              حفظ التوزيع
            </Button>
          </Col>
        </Row>

        {/* عرض معلومات نبضات القلب المستلمة من المحضر البدني */}



        {heartRateData && (
          <Alert variant="success" className="mb-3" dir="rtl">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <i className="fas fa-heartbeat me-2"></i>
                <strong>متوسط نبضات القلب الأقصى من المحضر البدني:</strong> {heartRateData.averageMaxHR} ن/د
                <span className="badge bg-success ms-2">مُطبق</span>
              </div>
              <div className="d-flex align-items-center">
                <small className="text-muted me-3">
                  {new Date(heartRateData.sentAt).toLocaleString('fr-FR')}
                </small>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={reapplyHeartRateData}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  إعادة تطبيق
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {!heartRateData && !heartRateLoading && (
          <Alert variant="warning" className="mb-3" dir="rtl">
            <i className="fas fa-exclamation-triangle me-2"></i>
            لم يتم استلام بيانات نبضات القلب من المحضر البدني بعد. سيتم استخدام القيم الافتراضية (185-198 ن/د).
          </Alert>
        )}

        {/* الجدول الرئيسي */}
        <div className="table-responsive" style={{ overflowX: 'auto', minHeight: '600px' }}>
          <Table bordered className="training-load-table coach-table" dir="rtl" style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th rowSpan={2} className="main-header">
                  <div className="header-content">
                    <div className="weeks-label">البيانات</div>
                    <div className="data-label">الأسابيع</div>
                  </div>
                </th>
                {Array.from({ length: weeksCount }, (_, index) => (
                  <th key={index} colSpan={3} className="week-header">
                    الأسبوع {['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][index]}
                  </th>
                ))}
              </tr>
              <tr>
                {Array.from({ length: weeksCount * 3 }, (_, index) => (
                  <th key={index} className="day-header">{index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* صف زمن الوحدة التدريبية */}
              <tr>
                <td className="row-label">زمن الوحدة التدريبية</td>
                {Array.from({ length: weeksCount * 3 }, () => (
                  <td key={Math.random()}>90</td>
                ))}
              </tr>
              {/* صف رقم الوحدة */}
              <tr>
                <td className="row-label">رقم الوحدة</td>
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const value = unitNumbers[index];
                  const isClickable = !!value && onApplyToTechnicalCard;
                  return (
                    <td
                      key={index}
                      className={isClickable ? 'unit-number-cell clickable' : 'unit-number-cell'}
                      onClick={() => {
                        if (isClickable) {
                          handleUnitClick(index);
                        }
                      }}
                    >
                      {value ?? ''}
                    </td>
                  );
                })}
              </tr>
              {/* صف التاريخ */}
              <tr>
                <td className="row-label">التاريخ</td>
                {dates.map((date, index) => (
                  <td
                    key={index}
                    style={{
                      fontWeight: 'bold',
                      color: '#1976d2',
                      fontSize: '16px',
                      textAlign: 'center',
                      padding: '8px 4px',
                      writingMode: 'horizontal-tb',
                      textOrientation: 'mixed',
                      minHeight: '30px',
                      lineHeight: '1.5'
                    }}
                    className="date-cell"
                  >
                    {date || '-'}
                  </td>
                ))}
              </tr>
              {/* صف أيام الأسبوع */}
              <tr>
                <td className="row-label">أيام الأسبوع</td>
                {daysOfWeek.map((day, index) => (
                  <td key={index} className="vertical-text">{day}</td>
                ))}
              </tr>

              {/* درجة الحمل */}
              <tr>
                <td rowSpan={6} className="load-label">
                  <div className="load-header">
                    <div className="load-main-text">درجة الحمل</div>
                    <div className="load-divider"></div>
                    <div className="load-sub-labels" style={{ marginRight: '-15px' }}>
                      <div className="load-sub-item">
                        <span>أقصى</span>
                        <small>% 95 : 86</small>
                        <small>ن/د 198 : 185</small>
                      </div>
                      <div className="load-sub-item">
                        <span>عالي</span>
                        <small>% 85 : 76</small>
                        <small>ن/د 184 : 171</small>
                      </div>
                      <div className="load-sub-item">
                        <span>متوسط</span>
                        <small>% 75 : 65</small>
                        <small>ن/د 170 : 156</small>
                      </div>
                    </div>
                  </div>
                </td>
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.maximum.weeks[weekIndex]) {
                    return <td key={index} className="input-cell">-</td>;
                  }

                  return (
                    <td key={index} className="input-cell">
                      <input
                        type="text"
                        className={getFieldClassName('maximum', weekIndex, dayIndex)}
                        value={formatValueForDisplay(trainingData.maximum.weeks[weekIndex].percentages[dayIndex], 'maximum', weekIndex, dayIndex)}
                        onChange={(e) => updatePercentage('maximum', weekIndex, dayIndex, e.target.value)}
                        onFocus={() => handleFocus('maximum', weekIndex, dayIndex)}
                        onBlur={() => handleBlur('maximum', weekIndex, dayIndex)}
                        placeholder="%"
                        disabled={isFieldDisabled('maximum', weekIndex, dayIndex)}
                      />
                    </td>
                  );
                })}
              </tr>
              <tr>
                {/* صف نبضات القلب للمستوى الأقصى - ديناميكي */}
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.maximum.weeks[weekIndex]) {
                    return <td key={index} className="heart-rate-display">-</td>;
                  }

                  return (
                    <td key={index} className="heart-rate-display">
                      {formatHeartRate(trainingData.maximum.weeks[weekIndex].heartRates[dayIndex])}
                    </td>
                  );
                })}
              </tr>

              <tr>
                {/* صف المستوى العالي - ديناميكي */}
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.high.weeks[weekIndex]) {
                    return <td key={index} className="input-cell">-</td>;
                  }

                  return (
                    <td key={index} className="input-cell">
                      <input
                        type="text"
                        className={getFieldClassName('high', weekIndex, dayIndex)}
                        value={formatValueForDisplay(trainingData.high.weeks[weekIndex].percentages[dayIndex], 'high', weekIndex, dayIndex)}
                        onChange={(e) => updatePercentage('high', weekIndex, dayIndex, e.target.value)}
                        onFocus={() => handleFocus('high', weekIndex, dayIndex)}
                        onBlur={() => handleBlur('high', weekIndex, dayIndex)}
                        placeholder="%"
                        disabled={isFieldDisabled('high', weekIndex, dayIndex)}
                      />
                    </td>
                  );
                })}
              </tr>
              <tr>
                {/* صف نبضات القلب للمستوى العالي - ديناميكي */}
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.high.weeks[weekIndex]) {
                    return <td key={index} className="heart-rate-display">-</td>;
                  }

                  return (
                    <td key={index} className="heart-rate-display">
                      {formatHeartRate(trainingData.high.weeks[weekIndex].heartRates[dayIndex])}
                    </td>
                  );
                })}
              </tr>

              <tr>
                {/* صف المستوى المتوسط - ديناميكي */}
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.medium.weeks[weekIndex]) {
                    return <td key={index} className="input-cell">-</td>;
                  }

                  return (
                    <td key={index} className="input-cell">
                      <input
                        type="text"
                        className={getFieldClassName('medium', weekIndex, dayIndex)}
                        value={formatValueForDisplay(trainingData.medium.weeks[weekIndex].percentages[dayIndex], 'medium', weekIndex, dayIndex)}
                        onChange={(e) => updatePercentage('medium', weekIndex, dayIndex, e.target.value)}
                        onFocus={() => handleFocus('medium', weekIndex, dayIndex)}
                        onBlur={() => handleBlur('medium', weekIndex, dayIndex)}
                        placeholder="%"
                        disabled={isFieldDisabled('medium', weekIndex, dayIndex)}
                      />
                    </td>
                  );
                })}
              </tr>
              <tr>
                {/* صف نبضات القلب للمستوى المتوسط - ديناميكي */}
                {Array.from({ length: weeksCount * 3 }, (_, index) => {
                  const weekIndex = Math.floor(index / 3);
                  const dayIndex = index % 3;

                  // التأكد من وجود البيانات للأسبوع
                  if (!trainingData.medium.weeks[weekIndex]) {
                    return <td key={index} className="heart-rate-display">-</td>;
                  }

                  return (
                    <td key={index} className="heart-rate-display">
                      {formatHeartRate(trainingData.medium.weeks[weekIndex].heartRates[dayIndex])}
                    </td>
                  );
                })}
              </tr>

              {/* زمن التدريب الأسبوعي */}
              <tr>
                <td className="row-label">زمن التدريب الأسبوعي</td>
                {Array.from({ length: weeksCount }, (_, weekIndex) => (
                  <td key={weekIndex} colSpan={3} className="weekly-time">
                    {calculateWeeklyTrainingTime(weekIndex).time}<br />
                    {calculateWeeklyTrainingTime(weekIndex).level}
                  </td>
                ))}
              </tr>

              {/* متوسط درجة الحمل الأسبوعية */}
              <tr>
                <td className="row-label">متوسط درجة الحمل الأسبوعية</td>
                {Array.from({ length: weeksCount }, (_, weekIndex) => (
                  <td key={weekIndex} colSpan={3} className="weekly-average">
                    % {calculateWeeklyAverage(weekIndex)}
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TrainingLoadDistribution;
