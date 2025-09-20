import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Table } from 'react-bootstrap';
import type { Club, TrainingData } from '../../types';
import { useTrainingLoad } from '../../hooks/useTrainingData';
import './TrainingLoadDistribution.css';
import './coach-responsive.css';

interface Props {
  club: Club;
}

const TrainingLoadDistribution: React.FC<Props> = ({ club }) => {
  // معلومات النموذج
  const [formData, setFormData] = useState({
    trainer: '',
    category: '',
    location: ''
  });

  // حدود القيم لكل مستوى
  const limits = {
    maximum: { percentage: { min: 86, max: 95 }, heartRate: { min: 185, max: 198 } },
    high: { percentage: { min: 76, max: 85 }, heartRate: { min: 171, max: 184 } },
    medium: { percentage: { min: 65, max: 75 }, heartRate: { min: 156, max: 170 } }
  };

  const [trainingData, setTrainingData] = useState<TrainingData>(() => {
    // دالة مساعدة لحساب نبضات القلب أثناء التهيئة
    const calculateHeartRateForInit = (percentage: number, level: 'maximum' | 'high' | 'medium'): number => {
      const levelLimits = limits[level];

      if (percentage < levelLimits.percentage.min || percentage > levelLimits.percentage.max) {
        return 0;
      }

      const percentageRange = levelLimits.percentage.max - levelLimits.percentage.min;
      const heartRateRange = levelLimits.heartRate.max - levelLimits.heartRate.min;
      const relativePosition = (percentage - levelLimits.percentage.min) / percentageRange;
      const heartRate = levelLimits.heartRate.min + (heartRateRange * relativePosition);

      return Math.round(heartRate);
    };

    return {
      maximum: {
        weeks: [
          { percentages: [null, 90, 90], heartRates: [null, calculateHeartRateForInit(90, 'maximum'), calculateHeartRateForInit(90, 'maximum')] },
          { percentages: [null, 90, 90], heartRates: [null, calculateHeartRateForInit(90, 'maximum'), calculateHeartRateForInit(90, 'maximum')] },
          { percentages: [null, 90, null], heartRates: [null, calculateHeartRateForInit(90, 'maximum'), null] },
          { percentages: [null, null, null], heartRates: [null, null, null] }
        ]
      },
      high: {
        weeks: [
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
          { percentages: [null, null, 70], heartRates: [null, null, calculateHeartRateForInit(70, 'medium')] },
          { percentages: [null, null, null], heartRates: [null, null, null] }
        ]
      }
    };
  });

  // حساب نبضات القلب من النسبة المئوية بناءً على النطاقات المحددة
  const calculateHeartRate = (percentage: number, loadLevel: 'maximum' | 'high' | 'medium'): number => {
    const levelLimits = limits[loadLevel];

    // التأكد من أن النسبة ضمن النطاق المسموح
    if (percentage < levelLimits.percentage.min || percentage > levelLimits.percentage.max) {
      return 0; // إرجاع 0 إذا كانت النسبة خارج النطاق
    }

    // حساب نبضات القلب بناءً على التناسب الخطي ضمن النطاق
    const percentageRange = levelLimits.percentage.max - levelLimits.percentage.min;
    const heartRateRange = levelLimits.heartRate.max - levelLimits.heartRate.min;

    // حساب الموقع النسبي للنسبة المئوية ضمن النطاق
    const relativePosition = (percentage - levelLimits.percentage.min) / percentageRange;

    // حساب نبضات القلب المقابلة
    const heartRate = levelLimits.heartRate.min + (heartRateRange * relativePosition);

    return Math.round(heartRate);
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
      setFormData(loadData);
    }
  }, [loadData]);

  const saveData = async () => {
    try {
      await saveTrainingLoad(formData);
      alert('تم حفظ توزيع درجة حمل التدريب بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ توزيع درجة حمل التدريب');
      console.error('Error saving training load:', err);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  // طباعة توزيع درجة حمل التدريب - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printTrainingLoad = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
            font-size: 12px; /* تكبير حجم النص */
            height: 200%; /* تكبير الجدول ليملأ نصف الصفحة على الأقل */
            min-height: 60vh; /* الحد الأدنى للارتفاع */
          }
          th, td {
            border: 1px solid #000;
            padding: 8px 4px; /* تكبير المساحة الداخلية للخلايا */
            text-align: center;
            line-height: 1.6; /* تحسين المسافة بين الأسطر */
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 10px; /* تكبير حجم خط العناوين */
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 16px; /* تكبير حجم العنوان الرئيسي */
          }
          .load-label {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 10px; /* تكبير حجم نص درجة الحمل */
          }
          .input-cell {
            background-color: #f8f9fa;
            font-size: 10px; /* تكبير حجم النص في خلايا الإدخال */
          }
          .heart-rate-display {
            background-color: #fef3c7;
            font-weight: bold;
            font-size: 10px; /* تكبير حجم النص في خلايا نبضات القلب */
          }
          @media print {
            body { margin: 0; }
            table { font-size: 6px; }
            th, td { padding: 1px; }
          }
        </style>
      </head>
      <body>
        <h2>توزيع درجة حمل التدريب - ${formData.trainer || 'المدرب'}</h2>
        <div style="margin-bottom: 10px; font-size: 10px;">
          <strong>الفئة:</strong> ${formData.category || ''} | 
          <strong>المكان:</strong> ${formData.location || ''}
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 80px;">درجة الحمل</th>
              <th colspan="3">الأسبوع الأول</th>
              <th colspan="3">الأسبوع الثاني</th>
              <th colspan="3">الأسبوع الثالث</th>
              <th colspan="3">الأسبوع الرابع</th>
            </tr>
            <tr>
              <th>1</th><th>2</th><th>3</th>
              <th>4</th><th>5</th><th>6</th>
              <th>7</th><th>8</th><th>9</th>
              <th>10</th><th>11</th><th>12</th>
            </tr>
          </thead>
          <tbody>
            <!-- زمن الوحدة التدريبية -->
            <tr>
              <td>زمن الوحدة التدريبية</td>
              <td>3</td><td>2</td><td>1</td>
              <td>6</td><td>5</td><td>4</td>
              <td>9</td><td>8</td><td>7</td>
              <td>12</td><td>11</td><td>10</td>
            </tr>
            <!-- رقم الوحدة -->
            <tr>
              <td>رقم الوحدة</td>
              <td>09/03</td><td>09/06</td><td>09/07</td>
              <td>09/10</td><td>09/13</td><td>09/14</td>
              <td>09/17</td><td>09/20</td><td>09/21</td>
              <td>09/24</td><td>09/27</td><td>09/28</td>
            </tr>
            <!-- التاريخ -->
            <tr>
              <td>التاريخ</td>
              <td>الاثنين</td><td>الخميس</td><td>السبت</td>
              <td>الأحد</td><td>الاثنين</td><td>الخميس</td>
              <td>السبت</td><td>الأحد</td><td>الاثنين</td>
              <td>الخميس</td><td>السبت</td><td>الأحد</td>
            </tr>
            <!-- أيام الأسبوع -->
            <tr>
              <td>أيام الأسبوع</td>
              <td></td><td></td><td></td>
              <td></td><td></td><td></td>
              <td></td><td></td><td></td>
              <td></td><td></td><td></td>
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
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const percentage = trainingData.maximum.weeks[weekIndex].percentages[dayInWeek];
                return `<td class="input-cell">${percentage || ''}</td>`;
              }).join('')}
            </tr>
            <tr>
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const heartRate = trainingData.maximum.weeks[weekIndex].heartRates[dayInWeek];
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
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const percentage = trainingData.high.weeks[weekIndex].percentages[dayInWeek];
                return `<td class="input-cell">${percentage || ''}</td>`;
              }).join('')}
            </tr>
            <tr>
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const heartRate = trainingData.high.weeks[weekIndex].heartRates[dayInWeek];
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
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const percentage = trainingData.medium.weeks[weekIndex].percentages[dayInWeek];
                return `<td class="input-cell">${percentage || ''}</td>`;
              }).join('')}
            </tr>
            <tr>
              ${Array.from({length: 12}, (_, index) => {
                const weekIndex = Math.floor(index / 3);
                const dayInWeek = index % 3;
                const heartRate = trainingData.medium.weeks[weekIndex].heartRates[dayInWeek];
                return `<td class="heart-rate-display">${heartRate ? heartRate + ' ن/د' : ''}</td>`;
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
              توزيع درجة حمل التدريب بالنسبة لزمن الوحدات خلال أسابيع البرنامج المقترح
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
            <Col md={4} className="text-end">
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
            <Col md={4} className="text-center">
              <strong>الفئة:</strong>
              <Form.Control
                type="text"
                value={formData.category}
                placeholder="الفئة العمرية"
                className="mt-1"
                dir="rtl"
                onChange={(e) => updateField('category', e.target.value)}
              />
            </Col>
            <Col md={4} className="text-start">
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

          {/* الجدول الرئيسي */}
          <div className="table-responsive">
            <Table bordered className="training-load-table coach-table" dir="rtl">
              <thead>
                <tr>
                  <th rowSpan={2} className="main-header">
                    <div className="header-content">
                      <div className="weeks-label">الأسابيع</div>
                      <div className="data-label">البيانات</div>
                    </div>
                  </th>
                  <th colSpan={3} className="week-header">الأسبوع الأول</th>
                  <th colSpan={3} className="week-header">الأسبوع الثاني</th>
                  <th colSpan={3} className="week-header">الأسبوع الثالث</th>
                  <th colSpan={3} className="week-header">الأسبوع الرابع</th>
                </tr>
                <tr>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                  <th className="day-header">90</th>
                </tr>
              </thead>
              <tbody>
                {/* صف زمن الوحدة التدريبية */}
                <tr>
                  <td className="row-label">زمن الوحدة التدريبية</td>
                  <td>3</td><td>2</td><td>1</td>
                  <td>6</td><td>5</td><td>4</td>
                  <td>9</td><td>8</td><td>7</td>
                  <td>12</td><td>11</td><td>10</td>
                </tr>
                {/* صف رقم الوحدة */}
                <tr>
                  <td className="row-label">رقم الوحدة</td>
                  <td>09/03</td><td>09/06</td><td>09/07</td>
                  <td>09/10</td><td>09/13</td><td>09/14</td>
                  <td>09/17</td><td>09/20</td><td>09/21</td>
                  <td>09/24</td><td>09/27</td><td>09/28</td>
                </tr>
                {/* صف التاريخ */}
                <tr>
                  <td className="row-label">التاريخ</td>
                  <td className="vertical-text">الاثنين</td>
                  <td className="vertical-text">الخميس</td>
                  <td className="vertical-text">السبت</td>
                  <td className="vertical-text">الأحد</td>
                  <td className="vertical-text">الاثنين</td>
                  <td className="vertical-text">الخميس</td>
                  <td className="vertical-text">السبت</td>
                  <td className="vertical-text">الأحد</td>
                  <td className="vertical-text">الاثنين</td>
                  <td className="vertical-text">الخميس</td>
                  <td className="vertical-text">السبت</td>
                  <td className="vertical-text">الأحد</td>
                </tr>
                {/* صف أيام الأسبوع */}
                <tr>
                  <td className="row-label">أيام الأسبوع</td>
                  <td></td><td></td><td></td>
                  <td></td><td></td><td></td>
                  <td></td><td></td><td></td>
                  <td></td><td></td><td></td>
                </tr>

                {/* درجة الحمل */}
                <tr>
                  <td rowSpan={6} className="load-label">
                    <div className="load-header">
                      <div className="load-main-text">درجة الحمل</div>
                      <div className="load-divider"></div>
                      <div className="load-sub-labels">
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
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 0, 0)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[0].percentages[0], 'maximum', 0, 0)}
                      onChange={(e) => updatePercentage('maximum', 0, 0, e.target.value)}
                      onFocus={() => handleFocus('maximum', 0, 0)}
                      onBlur={() => handleBlur('maximum', 0, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 0, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 0, 1)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[0].percentages[1], 'maximum', 0, 1)}
                      onChange={(e) => updatePercentage('maximum', 0, 1, e.target.value)}
                      onFocus={() => handleFocus('maximum', 0, 1)}
                      onBlur={() => handleBlur('maximum', 0, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 0, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 0, 2)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[0].percentages[2], 'maximum', 0, 2)}
                      onChange={(e) => updatePercentage('maximum', 0, 2, e.target.value)}
                      onFocus={() => handleFocus('maximum', 0, 2)}
                      onBlur={() => handleBlur('maximum', 0, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 0, 2)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 1, 0)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[1].percentages[0], 'maximum', 1, 0)}
                      onChange={(e) => updatePercentage('maximum', 1, 0, e.target.value)}
                      onFocus={() => handleFocus('maximum', 1, 0)}
                      onBlur={() => handleBlur('maximum', 1, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 1, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 1, 1)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[1].percentages[1], 'maximum', 1, 1)}
                      onChange={(e) => updatePercentage('maximum', 1, 1, e.target.value)}
                      onFocus={() => handleFocus('maximum', 1, 1)}
                      onBlur={() => handleBlur('maximum', 1, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 1, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('maximum', 1, 2)}
                      value={formatValueForDisplay(trainingData.maximum.weeks[1].percentages[2], 'maximum', 1, 2)}
                      onChange={(e) => updatePercentage('maximum', 1, 2, e.target.value)}
                      onFocus={() => handleFocus('maximum', 1, 2)}
                      onBlur={() => handleBlur('maximum', 1, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 1, 2)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[2].percentages[0], 'maximum', 2, 0)}
                      onChange={(e) => updatePercentage('maximum', 2, 0, e.target.value)}
                      onFocus={() => handleFocus('maximum', 2, 0)}
                      onBlur={() => handleBlur('maximum', 2, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 2, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[2].percentages[1], 'maximum', 2, 1)}
                      onChange={(e) => updatePercentage('maximum', 2, 1, e.target.value)}
                      onFocus={() => handleFocus('maximum', 2, 1)}
                      onBlur={() => handleBlur('maximum', 2, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 2, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[2].percentages[2], 'maximum', 2, 2)}
                      onChange={(e) => updatePercentage('maximum', 2, 2, e.target.value)}
                      onFocus={() => handleFocus('maximum', 2, 2)}
                      onBlur={() => handleBlur('maximum', 2, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 2, 2)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[3].percentages[0], 'maximum', 3, 0)}
                      onChange={(e) => updatePercentage('maximum', 3, 0, e.target.value)}
                      onFocus={() => handleFocus('maximum', 3, 0)}
                      onBlur={() => handleBlur('maximum', 3, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 3, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[3].percentages[1], 'maximum', 3, 1)}
                      onChange={(e) => updatePercentage('maximum', 3, 1, e.target.value)}
                      onFocus={() => handleFocus('maximum', 3, 1)}
                      onBlur={() => handleBlur('maximum', 3, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 3, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className="load-input"
                      value={formatValueForDisplay(trainingData.maximum.weeks[3].percentages[2], 'maximum', 3, 2)}
                      onChange={(e) => updatePercentage('maximum', 3, 2, e.target.value)}
                      onFocus={() => handleFocus('maximum', 3, 2)}
                      onBlur={() => handleBlur('maximum', 3, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('maximum', 3, 2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[0].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[0].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[0].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[1].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[1].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[1].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[2].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[2].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[2].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[3].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[3].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.maximum.weeks[3].heartRates[2])}</td>
                </tr>

                <tr>
                  {/* الأسبوع الأول - عالي */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 0, 0)}
                      value={formatValueForDisplay(trainingData.high.weeks[0].percentages[0], 'high', 0, 0)}
                      onChange={(e) => updatePercentage('high', 0, 0, e.target.value)}
                      onFocus={() => handleFocus('high', 0, 0)}
                      onBlur={() => handleBlur('high', 0, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 0, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 0, 1)}
                      value={formatValueForDisplay(trainingData.high.weeks[0].percentages[1], 'high', 0, 1)}
                      onChange={(e) => updatePercentage('high', 0, 1, e.target.value)}
                      onFocus={() => handleFocus('high', 0, 1)}
                      onBlur={() => handleBlur('high', 0, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 0, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 0, 2)}
                      value={formatValueForDisplay(trainingData.high.weeks[0].percentages[2], 'high', 0, 2)}
                      onChange={(e) => updatePercentage('high', 0, 2, e.target.value)}
                      onFocus={() => handleFocus('high', 0, 2)}
                      onBlur={() => handleBlur('high', 0, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 0, 2)}
                    />
                  </td>
                  {/* الأسبوع الثاني - عالي */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 1, 0)}
                      value={formatValueForDisplay(trainingData.high.weeks[1].percentages[0], 'high', 1, 0)}
                      onChange={(e) => updatePercentage('high', 1, 0, e.target.value)}
                      onFocus={() => handleFocus('high', 1, 0)}
                      onBlur={() => handleBlur('high', 1, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 1, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 1, 1)}
                      value={formatValueForDisplay(trainingData.high.weeks[1].percentages[1], 'high', 1, 1)}
                      onChange={(e) => updatePercentage('high', 1, 1, e.target.value)}
                      onFocus={() => handleFocus('high', 1, 1)}
                      onBlur={() => handleBlur('high', 1, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 1, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 1, 2)}
                      value={formatValueForDisplay(trainingData.high.weeks[1].percentages[2], 'high', 1, 2)}
                      onChange={(e) => updatePercentage('high', 1, 2, e.target.value)}
                      onFocus={() => handleFocus('high', 1, 2)}
                      onBlur={() => handleBlur('high', 1, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 1, 2)}
                    />
                  </td>
                  {/* الأسبوع الثالث - عالي */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 2, 0)}
                      value={formatValueForDisplay(trainingData.high.weeks[2].percentages[0], 'high', 2, 0)}
                      onChange={(e) => updatePercentage('high', 2, 0, e.target.value)}
                      onFocus={() => handleFocus('high', 2, 0)}
                      onBlur={() => handleBlur('high', 2, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 2, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 2, 1)}
                      value={formatValueForDisplay(trainingData.high.weeks[2].percentages[1], 'high', 2, 1)}
                      onChange={(e) => updatePercentage('high', 2, 1, e.target.value)}
                      onFocus={() => handleFocus('high', 2, 1)}
                      onBlur={() => handleBlur('high', 2, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 2, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 2, 2)}
                      value={formatValueForDisplay(trainingData.high.weeks[2].percentages[2], 'high', 2, 2)}
                      onChange={(e) => updatePercentage('high', 2, 2, e.target.value)}
                      onFocus={() => handleFocus('high', 2, 2)}
                      onBlur={() => handleBlur('high', 2, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 2, 2)}
                    />
                  </td>
                  {/* الأسبوع الرابع - عالي */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 3, 0)}
                      value={formatValueForDisplay(trainingData.high.weeks[3].percentages[0], 'high', 3, 0)}
                      onChange={(e) => updatePercentage('high', 3, 0, e.target.value)}
                      onFocus={() => handleFocus('high', 3, 0)}
                      onBlur={() => handleBlur('high', 3, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 3, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 3, 1)}
                      value={formatValueForDisplay(trainingData.high.weeks[3].percentages[1], 'high', 3, 1)}
                      onChange={(e) => updatePercentage('high', 3, 1, e.target.value)}
                      onFocus={() => handleFocus('high', 3, 1)}
                      onBlur={() => handleBlur('high', 3, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 3, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('high', 3, 2)}
                      value={formatValueForDisplay(trainingData.high.weeks[3].percentages[2], 'high', 3, 2)}
                      onChange={(e) => updatePercentage('high', 3, 2, e.target.value)}
                      onFocus={() => handleFocus('high', 3, 2)}
                      onBlur={() => handleBlur('high', 3, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('high', 3, 2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[0].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[0].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[0].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[1].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[1].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[1].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[2].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[2].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[2].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[3].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[3].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.high.weeks[3].heartRates[2])}</td>
                </tr>

                <tr>
                  {/* الأسبوع الأول - متوسط */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 0, 0)}
                      value={formatValueForDisplay(trainingData.medium.weeks[0].percentages[0], 'medium', 0, 0)}
                      onChange={(e) => updatePercentage('medium', 0, 0, e.target.value)}
                      onFocus={() => handleFocus('medium', 0, 0)}
                      onBlur={() => handleBlur('medium', 0, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 0, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 0, 1)}
                      value={formatValueForDisplay(trainingData.medium.weeks[0].percentages[1], 'medium', 0, 1)}
                      onChange={(e) => updatePercentage('medium', 0, 1, e.target.value)}
                      onFocus={() => handleFocus('medium', 0, 1)}
                      onBlur={() => handleBlur('medium', 0, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 0, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 0, 2)}
                      value={formatValueForDisplay(trainingData.medium.weeks[0].percentages[2], 'medium', 0, 2)}
                      onChange={(e) => updatePercentage('medium', 0, 2, e.target.value)}
                      onFocus={() => handleFocus('medium', 0, 2)}
                      onBlur={() => handleBlur('medium', 0, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 0, 2)}
                    />
                  </td>
                  {/* الأسبوع الثاني - متوسط */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 1, 0)}
                      value={formatValueForDisplay(trainingData.medium.weeks[1].percentages[0], 'medium', 1, 0)}
                      onChange={(e) => updatePercentage('medium', 1, 0, e.target.value)}
                      onFocus={() => handleFocus('medium', 1, 0)}
                      onBlur={() => handleBlur('medium', 1, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 1, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 1, 1)}
                      value={formatValueForDisplay(trainingData.medium.weeks[1].percentages[1], 'medium', 1, 1)}
                      onChange={(e) => updatePercentage('medium', 1, 1, e.target.value)}
                      onFocus={() => handleFocus('medium', 1, 1)}
                      onBlur={() => handleBlur('medium', 1, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 1, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 1, 2)}
                      value={formatValueForDisplay(trainingData.medium.weeks[1].percentages[2], 'medium', 1, 2)}
                      onChange={(e) => updatePercentage('medium', 1, 2, e.target.value)}
                      onFocus={() => handleFocus('medium', 1, 2)}
                      onBlur={() => handleBlur('medium', 1, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 1, 2)}
                    />
                  </td>
                  {/* الأسبوع الثالث - متوسط */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 2, 0)}
                      value={formatValueForDisplay(trainingData.medium.weeks[2].percentages[0], 'medium', 2, 0)}
                      onChange={(e) => updatePercentage('medium', 2, 0, e.target.value)}
                      onFocus={() => handleFocus('medium', 2, 0)}
                      onBlur={() => handleBlur('medium', 2, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 2, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 2, 1)}
                      value={formatValueForDisplay(trainingData.medium.weeks[2].percentages[1], 'medium', 2, 1)}
                      onChange={(e) => updatePercentage('medium', 2, 1, e.target.value)}
                      onFocus={() => handleFocus('medium', 2, 1)}
                      onBlur={() => handleBlur('medium', 2, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 2, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 2, 2)}
                      value={formatValueForDisplay(trainingData.medium.weeks[2].percentages[2], 'medium', 2, 2)}
                      onChange={(e) => updatePercentage('medium', 2, 2, e.target.value)}
                      onFocus={() => handleFocus('medium', 2, 2)}
                      onBlur={() => handleBlur('medium', 2, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 2, 2)}
                    />
                  </td>
                  {/* الأسبوع الرابع - متوسط */}
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 3, 0)}
                      value={formatValueForDisplay(trainingData.medium.weeks[3].percentages[0], 'medium', 3, 0)}
                      onChange={(e) => updatePercentage('medium', 3, 0, e.target.value)}
                      onFocus={() => handleFocus('medium', 3, 0)}
                      onBlur={() => handleBlur('medium', 3, 0)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 3, 0)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 3, 1)}
                      value={formatValueForDisplay(trainingData.medium.weeks[3].percentages[1], 'medium', 3, 1)}
                      onChange={(e) => updatePercentage('medium', 3, 1, e.target.value)}
                      onFocus={() => handleFocus('medium', 3, 1)}
                      onBlur={() => handleBlur('medium', 3, 1)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 3, 1)}
                    />
                  </td>
                  <td className="input-cell">
                    <input
                      type="text"
                      className={getFieldClassName('medium', 3, 2)}
                      value={formatValueForDisplay(trainingData.medium.weeks[3].percentages[2], 'medium', 3, 2)}
                      onChange={(e) => updatePercentage('medium', 3, 2, e.target.value)}
                      onFocus={() => handleFocus('medium', 3, 2)}
                      onBlur={() => handleBlur('medium', 3, 2)}
                      placeholder="%"
                      disabled={isFieldDisabled('medium', 3, 2)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[0].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[0].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[0].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[1].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[1].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[1].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[2].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[2].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[2].heartRates[2])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[3].heartRates[0])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[3].heartRates[1])}</td>
                  <td className="heart-rate-display">{formatHeartRate(trainingData.medium.weeks[3].heartRates[2])}</td>
                </tr>

                {/* زمن التدريب الأسبوعي */}
                <tr>
                  <td className="row-label">زمن التدريب الأسبوعي</td>
                  <td colSpan={3} className="weekly-time">
                    {calculateWeeklyTrainingTime(0).time}<br/>
                    {calculateWeeklyTrainingTime(0).level}
                  </td>
                  <td colSpan={3} className="weekly-time">
                    {calculateWeeklyTrainingTime(1).time}<br/>
                    {calculateWeeklyTrainingTime(1).level}
                  </td>
                  <td colSpan={3} className="weekly-time">
                    {calculateWeeklyTrainingTime(2).time}<br/>
                    {calculateWeeklyTrainingTime(2).level}
                  </td>
                  <td colSpan={3} className="weekly-time">
                    {calculateWeeklyTrainingTime(3).time}<br/>
                    {calculateWeeklyTrainingTime(3).level}
                  </td>
                </tr>

                {/* متوسط درجة الحمل الأسبوعية */}
                <tr>
                  <td className="row-label">متوسط درجة الحمل الأسبوعية</td>
                  <td colSpan={3} className="weekly-average">% {calculateWeeklyAverage(0)}</td>
                  <td colSpan={3} className="weekly-average">% {calculateWeeklyAverage(1)}</td>
                  <td colSpan={3} className="weekly-average">% {calculateWeeklyAverage(2)}</td>
                  <td colSpan={3} className="weekly-average">% {calculateWeeklyAverage(3)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
  );
};

export default TrainingLoadDistribution;
