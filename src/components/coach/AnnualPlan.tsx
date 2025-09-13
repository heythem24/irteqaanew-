import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import type { Club } from '../../types';
import { useAnnualPlan, useSessionEvaluation } from '../../hooks/useFirestore';
import './AnnualPlan.css';

interface AnnualPlanProps {
  club: Club;
}

interface WeekData {
  week: number;
  sessions: number;
  hours: number;
  physical: number;
  technical: number;
  tactical: number;
  physicalTest: boolean;
  technicalTest: boolean;
  medicalTest: boolean;
}

interface MonthData {
  month: string;
  monthNumber: number;
  weeks: WeekData[];
  completed: number;
  notCompleted: number;
  percentage: number;
  total: number;
}

// الأشهر للسنة الدراسية
const months = [
  { name: 'سبتمبر', number: 9 },
  { name: 'أكتوبر', number: 10 },
  { name: 'نوفمبر', number: 11 },
  { name: 'ديسمبر', number: 12 },
  { name: 'جانفي', number: 1 },
  { name: 'فيفري', number: 2 },
  { name: 'مارس', number: 3 },
  { name: 'أفريل', number: 4 },
  { name: 'ماي', number: 5 },
  { name: 'جوان', number: 6 }
];

// صفوف التدريب
const trainingRows = [
  'الأسابيع',
  'عدد الحصص',
  'الحجم الساعي',
  'البدني',
  'التقني',
  'التكتيكي',
  'الاختبار البدني',
  'الاختبار التقني',
  'الاختبار الطبي'
];

const AnnualPlan: React.FC<AnnualPlanProps> = ({ club }) => {
  const [planData, setPlanData] = useState<MonthData[]>([]);
  const [currentYear, setCurrentYear] = useState(2024);
  const [sessionEvaluationData, setSessionEvaluationData] = useState<any[]>([]);

  // حساب عدد الأسابيع الحقيقية في الشهر
  const getWeeksInMonth = (year: number, month: number): number => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // حساب عدد الأسابيع بناءً على أيام الشهر
    const totalDays = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // حساب عدد الأسابيع الكاملة
    const weeks = Math.ceil((totalDays + firstDayOfWeek) / 7);
    
    return Math.min(weeks, 5); // الحد الأقصى 5 أسابيع
  };

  // تهيئة البيانات
  useEffect(() => {
    const initializeData = () => {
      const data: MonthData[] = months.map(({ name, number }) => {
        const weeksCount = getWeeksInMonth(
          number <= 6 ? currentYear + 1 : currentYear, 
          number
        );
        
        const weeks: WeekData[] = Array.from({ length: weeksCount }, (_, index) => ({
          week: index + 1,
          sessions: 2,
          hours: 3,
          physical: 30,
          technical: 40,
          tactical: 30,
          physicalTest: false,
          technicalTest: false,
          medicalTest: false
        }));

        const total = weeks.reduce((sum, week) => sum + week.sessions, 0);
        
        return {
          month: name,
          monthNumber: number,
          weeks,
          completed: 0,
          notCompleted: total,
          percentage: 0,
          total
        };
      });
      
      setPlanData(data);
    };

    initializeData();
  }, [currentYear]);

  // تحميل البيانات المحفوظة
  // استخدام Firestore بدلاً من localStorage
  const { planData: savedPlanData, saveAnnualPlan } = useAnnualPlan(club.id, currentYear);
  const { evaluationData } = useSessionEvaluation(club.id);

  useEffect(() => {
    if (savedPlanData) {
      setPlanData(savedPlanData);
    }
  }, [savedPlanData]);

  useEffect(() => {
    if (evaluationData) {
      setSessionEvaluationData(evaluationData);
    }
  }, [evaluationData]);

  // حفظ البيانات
  const saveData = async () => {
    try {
      await saveAnnualPlan(planData);
      alert('تم حفظ المخطط السنوي بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ المخطط السنوي');
      console.error('Error saving annual plan:', err);
    }
  };

  // تحديث بيانات الأسبوع مع التحقق من الحد الأقصى
  const updateWeekData = (monthIndex: number, weekIndex: number, field: keyof WeekData, value: any) => {
    setPlanData(prev => prev.map((month, mIndex) => {
      if (mIndex !== monthIndex) return month;

      // إذا كان التحديث لعدد الحصص، نحتاج للتحقق من الحد الأقصى
      if (field === 'sessions') {
        const newValue = Math.min(value, getMaxSessionsForWeek(monthIndex, weekIndex));

        return {
          ...month,
          weeks: month.weeks.map((week, wIndex) =>
            wIndex === weekIndex
              ? { ...week, [field]: Math.max(0, newValue) }
              : week
          )
        };
      }

      // للحقول الأخرى، التحديث العادي
      return {
        ...month,
        weeks: month.weeks.map((week, wIndex) =>
          wIndex === weekIndex
            ? { ...week, [field]: value }
            : week
        )
      };
    }));
  };

  // تحديث الإحصائيات
  const updateStats = (monthIndex: number, field: 'completed' | 'notCompleted', value: number) => {
    setPlanData(prev => prev.map((month, index) =>
      index === monthIndex
        ? {
            ...month,
            [field]: value,
            percentage: Math.round((field === 'completed' ? value : month.completed) / month.total * 100)
          }
        : month
    ));
  };

  // ربط البيانات مع تقييم الحصص
  const getSessionDataForMonth = (monthName: string) => {
    const sessionMonth = sessionEvaluationData.find(item => item.month === monthName);
    return sessionMonth || { plannedSessions: 0, executedSessions: 0, percentage: 0 };
  };

  // حساب المجموع الحالي للحصص في الشهر
  const getCurrentSessionsTotal = (monthIndex: number) => {
    return planData[monthIndex]?.weeks.reduce((sum, week) => sum + week.sessions, 0) || 0;
  };

  // حساب الحد الأقصى المتبقي للحصص في أسبوع معين
  const getMaxSessionsForWeek = (monthIndex: number, weekIndex: number) => {
    const sessionData = getSessionDataForMonth(planData[monthIndex]?.month || '');
    const maxSessionsForMonth = sessionData.executedSessions || planData[monthIndex]?.completed || 0;
    const currentTotalExcludingThisWeek = planData[monthIndex]?.weeks.reduce((sum, week, index) =>
      index === weekIndex ? sum : sum + week.sessions, 0
    ) || 0;

    return Math.max(0, maxSessionsForMonth - currentTotalExcludingThisWeek);
  };

  // طباعة المخطط السنوي - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printAnnualPlan = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>المخطط السنوي - ${currentYear + 1}/${currentYear}</title>
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
            font-size: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 9px;
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 14px;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 8px; }
            th, td { padding: 2px; }
          }
        </style>
      </head>
      <body>
        <h2>المخطط السنوي - الموسم الرياضي ${currentYear + 1}/${currentYear}</h2>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">الصفوف</th>
              ${planData.map((monthData, index) => 
                `<th colSpan="${monthData.weeks.length + 4}">${monthData.month}</th>`
              ).join('')}
            </tr>
            <tr>
              ${planData.map((monthData) => 
                monthData.weeks.map((_, weekIndex) => `<th>${weekIndex + 1}</th>`).join('') +
                '<th>منجزة</th><th>غير منجزة</th><th>نسبة %</th><th>المجموع</th>'
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${trainingRows.map((rowName, rowIndex) => `
              <tr>
                <td>${rowName}</td>
                ${planData.map((monthData, monthIndex) => {
                  let cells = '';
                  
                  // أسابيع الشهر
                  monthData.weeks.forEach((week, weekIndex) => {
                    if (rowIndex === 0) { // الأسابيع
                      cells += `<td>${week.week}</td>`;
                    } else if (rowIndex === 1) { // عدد الحصص
                      cells += `<td>${week.sessions}</td>`;
                    } else if (rowIndex === 2) { // الحجم الساعي
                      cells += `<td>${week.hours}</td>`;
                    } else if (rowIndex === 3) { // البدني
                      cells += `<td>${week.physical}%</td>`;
                    } else if (rowIndex === 4) { // التقني
                      cells += `<td>${week.technical}%</td>`;
                    } else if (rowIndex === 5) { // التكتيكي
                      cells += `<td>${week.tactical}%</td>`;
                    } else if (rowIndex >= 6) { // الاختبارات
                      const isChecked = rowIndex === 6 ? week.physicalTest : 
                                       rowIndex === 7 ? week.technicalTest : week.medicalTest;
                      cells += `<td>${isChecked ? '✓' : ''}</td>`;
                    }
                  });
                  
                  // أعمدة الإحصائيات
                  if (rowIndex === 1) { // فقط لصف عدد الحصص
                    cells += `<td>${monthData.completed}</td>`;
                    cells += `<td>${monthData.notCompleted}</td>`;
                    cells += `<td>${monthData.percentage}%</td>`;
                    cells += `<td>${monthData.total}</td>`;
                  } else {
                    cells += '<td></td><td></td><td></td><td></td>';
                  }
                  
                  return cells;
                }).join('')}
              </tr>
            `).join('')}
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

  // إعادة توزيع الحصص بالتساوي على الأسابيع
  const redistributeSessions = (monthIndex: number, totalSessions: number) => {
    const month = planData[monthIndex];
    if (!month) return;

    const weeksCount = month.weeks.length;
    const sessionsPerWeek = Math.floor(totalSessions / weeksCount);
    const remainingSessions = totalSessions % weeksCount;

    const updatedWeeks = month.weeks.map((week, index) => ({
      ...week,
      sessions: sessionsPerWeek + (index < remainingSessions ? 1 : 0)
    }));

    setPlanData(prev => prev.map((m, index) =>
      index === monthIndex
        ? { ...m, weeks: updatedWeeks }
        : m
    ));
  };

  // تحديث البيانات تلقائياً من تقييم الحصص
  useEffect(() => {
    if (sessionEvaluationData.length > 0 && planData.length > 0) {
      const updatedData = planData.map((month, monthIndex) => {
        const sessionData = getSessionDataForMonth(month.month);
        const newCompleted = sessionData.executedSessions || month.completed;

        // إعادة توزيع الحصص إذا تغير العدد المنفذ
        if (newCompleted !== month.completed) {
          setTimeout(() => redistributeSessions(monthIndex, newCompleted), 100);
        }

        return {
          ...month,
          completed: newCompleted,
          notCompleted: (sessionData.plannedSessions || month.total) - newCompleted,
          percentage: sessionData.percentage || month.percentage,
          total: sessionData.plannedSessions || month.total
        };
      });
      setPlanData(updatedData);
    }
  }, [sessionEvaluationData]);

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <Row>
          <Col>
            <h5 className="mb-0 text-center" dir="rtl">
              <i className="fas fa-calendar-alt me-2"></i>
              المخطط السنوي الخاص بالمدارس
            </h5>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md={6}>
            <div className="text-end" dir="rtl">
              <strong>اسم الجهة:</strong> ................................
            </div>
          </Col>
          <Col md={6}>
            <div className="text-start" dir="rtl">
              <strong>الموسم الرياضي:</strong> {currentYear + 1}/{currentYear}
            </div>
          </Col>
        </Row>
        <Row className="mt-1">
          <Col md={6}>
            <div className="text-end" dir="rtl">
              <strong>الاختصاص:</strong> جودو
            </div>
          </Col>
          <Col md={6}>
            <div className="text-start d-flex justify-content-between align-items-center" dir="rtl">
              <div>
                <strong>المدرب الرياضي:</strong> ................................
              </div>
            </div>
          </Col>
        </Row>
      </Card.Header>
      
      <Card.Body className="p-2">
        <Row className="mb-3">
          <Col md={6}>
            <Button
              variant="info"
              onClick={printAnnualPlan}
              size="sm"
              dir="rtl"
            >
              <i className="fas fa-print me-2"></i>
              طباعة المخطط
            </Button>
          </Col>
          <Col md={6} className="text-end">
            <Button
              variant="success"
              onClick={saveData}
              size="sm"
              dir="rtl"
            >
              <i className="fas fa-save me-2"></i>
              حفظ المخطط
            </Button>
          </Col>
        </Row>

        {/* الجدول الرئيسي */}
        <div className="table-responsive">
          <Table bordered className="annual-plan-table">
            <thead>
              <tr>
                <th rowSpan={2} className="row-label align-middle" dir="rtl">
                  الشهر
                </th>
                {planData.map((monthData, index) => (
                  <th key={index} className="month-header" colSpan={monthData.weeks.length + 4} dir="rtl">
                    {monthData.month}
                  </th>
                ))}
              </tr>
              <tr>
                {planData.map((monthData, monthIndex) => (
                  <React.Fragment key={monthIndex}>
                    {monthData.weeks.map((_, weekIndex) => (
                      <th key={weekIndex} className="week-header">
                        {weekIndex + 1}
                      </th>
                    ))}
                    <th className="stats-header" dir="rtl">منجزة</th>
                    <th className="stats-header" dir="rtl">غير منجزة</th>
                    <th className="stats-header" dir="rtl">نسبة %</th>
                    <th className="stats-header" dir="rtl">المجموع</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {trainingRows.map((rowName, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="row-label" dir="rtl">
                    {rowName}
                  </td>
                  {planData.map((monthData, monthIndex) => (
                    <React.Fragment key={monthIndex}>
                      {monthData.weeks.map((week, weekIndex) => (
                        <td key={weekIndex} className="p-1">
                          {rowIndex === 0 && (
                            <span className="fw-bold">{week.week}</span>
                          )}
                          {rowIndex === 1 && (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max={getMaxSessionsForWeek(monthIndex, weekIndex)}
                              value={week.sessions}
                              onChange={(e) => updateWeekData(monthIndex, weekIndex, 'sessions', parseInt(e.target.value) || 0)}
                              className="week-input"
                              title={`الحد الأقصى: ${getMaxSessionsForWeek(monthIndex, weekIndex)} حصص`}
                            />
                          )}
                          {rowIndex === 2 && (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="20"
                              value={week.hours}
                              onChange={(e) => updateWeekData(monthIndex, weekIndex, 'hours', parseInt(e.target.value) || 0)}
                              className="week-input"
                            />
                          )}
                          {rowIndex === 3 && (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="100"
                              value={week.physical}
                              onChange={(e) => updateWeekData(monthIndex, weekIndex, 'physical', parseInt(e.target.value) || 0)}
                              className="week-input"
                            />
                          )}
                          {rowIndex === 4 && (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="100"
                              value={week.technical}
                              onChange={(e) => updateWeekData(monthIndex, weekIndex, 'technical', parseInt(e.target.value) || 0)}
                              className="week-input"
                            />
                          )}
                          {rowIndex === 5 && (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="100"
                              value={week.tactical}
                              onChange={(e) => updateWeekData(monthIndex, weekIndex, 'tactical', parseInt(e.target.value) || 0)}
                              className="week-input"
                            />
                          )}
                          {(rowIndex === 6 || rowIndex === 7 || rowIndex === 8) && (
                            <Form.Check
                              type="checkbox"
                              checked={
                                rowIndex === 6 ? week.physicalTest :
                                rowIndex === 7 ? week.technicalTest : week.medicalTest
                              }
                              onChange={(e) => updateWeekData(
                                monthIndex, 
                                weekIndex, 
                                rowIndex === 6 ? 'physicalTest' : 
                                rowIndex === 7 ? 'technicalTest' : 'medicalTest',
                                e.target.checked
                              )}
                              style={{ transform: 'scale(0.8)' }}
                            />
                          )}
                        </td>
                      ))}
                      
                      {/* أعمدة الإحصائيات */}
                      {rowIndex === 1 && (
                        <>
                          <td className="stats-cell">
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              value={monthData.completed}
                              onChange={(e) => updateStats(monthIndex, 'completed', parseInt(e.target.value) || 0)}
                              className="stats-input"
                            />
                          </td>
                          <td className="stats-cell">
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              value={monthData.notCompleted}
                              onChange={(e) => updateStats(monthIndex, 'notCompleted', parseInt(e.target.value) || 0)}
                              className="stats-input"
                            />
                          </td>
                          <td className="stats-cell">
                            <span className={`badge percentage-badge ${
                              monthData.percentage >= 90 ? 'bg-success' :
                              monthData.percentage >= 70 ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {monthData.percentage}%
                            </span>
                          </td>
                          <td className="total-cell">
                            <div>
                              <strong>{monthData.total}</strong>
                              <br />
                              <small className={`total-indicator ${
                                getCurrentSessionsTotal(monthIndex) > monthData.completed ? 'over-limit' :
                                getCurrentSessionsTotal(monthIndex) < monthData.completed ? 'under-limit' : 'exact-match'
                              }`}>
                                ({getCurrentSessionsTotal(monthIndex)}/{monthData.completed})
                              </small>
                            </div>
                          </td>
                        </>
                      )}
                      {rowIndex !== 1 && (
                        <>
                          <td className="stats-cell empty-cell"></td>
                          <td className="stats-cell empty-cell"></td>
                          <td className="stats-cell empty-cell"></td>
                          <td className="total-cell empty-cell"></td>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* قسم التحضير */}
        <Row className="mt-4">
          <Col md={4}>
            <Card className="h-100">
              <Card.Header className="bg-success text-white text-center" dir="rtl">
                <h6 className="mb-0">التحضير البدني</h6>
              </Card.Header>
              <Card.Body className="p-2">
                <div className="small" dir="rtl">
                  <div className="mb-2">
                    <strong>01- تربية الصفة البدنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div>
                    <strong>02- تطوير الصفة البدنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100">
              <Card.Header className="bg-warning text-dark text-center" dir="rtl">
                <h6 className="mb-0">التحضير التقني</h6>
              </Card.Header>
              <Card.Body className="p-2">
                <div className="small" dir="rtl">
                  <div className="mb-2">
                    <strong>01- التعود على الحركة التقنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div className="mb-2">
                    <strong>02- تلقين الحركة التقنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div className="mb-2">
                    <strong>03- إتقان الحركة التقنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div>
                    <strong>04- التعمق في الحركة التقنية:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100">
              <Card.Header className="bg-danger text-white text-center" dir="rtl">
                <h6 className="mb-0">التحضير التكتيكي</h6>
              </Card.Header>
              <Card.Body className="p-2">
                <div className="small" dir="rtl">
                  <div className="mb-2">
                    <strong>01- التفكير التكتيكي:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div className="mb-2">
                    <strong>02- اللعب مع تطبيق القوانين:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                  <div>
                    <strong>03- معارف حول الوسط الفضائي:</strong>
                    <Form.Control type="number" size="sm" placeholder="%" className="mt-1" />
                    <Form.Control type="text" size="sm" placeholder="سا" className="mt-1" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* معلومات إضافية */}
        <Row className="mt-3">
          <Col>
            <div className="text-muted small text-center" dir="rtl">
              <i className="fas fa-info-circle me-1"></i>
              المخطط السنوي مرتبط ديناميكياً مع تقييم الحصص المنفذة
              <br />
              <i className="fas fa-sync-alt me-1"></i>
              عدد الحصص في الأسابيع محدود بعدد الحصص المنفذة من جدول التقييم
              <br />
              <i className="fas fa-calculator me-1"></i>
              المؤشر الملون:
              <span className="total-indicator exact-match ms-1">أخضر = مطابق</span>
              <span className="total-indicator under-limit ms-1">أصفر = أقل</span>
              <span className="total-indicator over-limit ms-1">أحمر = أكثر</span>
              <br />
              <i className="fas fa-calendar-check me-1"></i>
              عدد الأسابيع محسوب بناءً على التقويم الحقيقي لكل شهر
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AnnualPlan;
