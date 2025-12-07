import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useMaxDynamicStrengthTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  firstAttempt: number; // المحاولة الأولى/20ث
  secondAttempt: number; // المحاولة الثانية/20ث
  thirdAttempt: number; // المحاولة الثالثة/20ث
  bestResult: number; // أحسن نتيجة
  evaluation: string; // التقييم
}

interface MaxDynamicStrengthTestProps {
  clubId: string;
}

const MaxDynamicStrengthTest: React.FC<MaxDynamicStrengthTestProps> = ({ clubId }) => {
  // تحديد التقييم بناءً على النتيجة
  const getEvaluation = (result: number): string => {
    if (result === 0) return '';
    if (result >= 1 && result <= 4) return 'ممتاز';
    if (result >= 5 && result <= 9) return 'حسن';
    if (result >= 10 && result <= 19) return 'متوسط';
    if (result === 20) return 'ضعيف';
    return '';
  };

  // البيانات الأولية
  const initializeAthletes = (): AthleteTestData[] => {
    const athletes: AthleteTestData[] = [];
    
    for (let i = 1; i <= 8; i++) {
      if (i === 1) {
        // الصف الأول مع البيانات المثال
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          firstAttempt: 20,
          secondAttempt: 20,
          thirdAttempt: 20,
          bestResult: 20,
          evaluation: 'ضعيف'
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          firstAttempt: 0,
          secondAttempt: 0,
          thirdAttempt: 0,
          bestResult: 0,
          evaluation: ''
        });
      }
    }
    
    return athletes;
  };

  const { data: firestoreData, saveData } = useMaxDynamicStrengthTest(clubId);
  const [athletesList, setAthletesList] = useState<AthleteTestData[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);
  const { athletes: clubAthletes } = useClubAthletes(clubId);

  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletesList(firestoreData);
    } else if (clubAthletes.length > 0) {
      // Initialize athletes from club data if no firestore data
      const initializedAthletes = clubAthletes.map((athlete, index) => ({
        id: index + 1,
        athleteId: athlete.id,
        name: athlete.fullNameAr || athlete.fullNameEn,
        category: getCategoryByDOBToday(athlete.dateOfBirth)?.nameAr || '',
        age: calcAgeFromDob(athlete.dateOfBirth),
        firstAttempt: 0,
        secondAttempt: 0,
        thirdAttempt: 0,
        bestResult: 0,
        evaluation: ''
      }));
      setAthletesList(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // تعبئة تلقائية مرة واحدة من قائمة النادي إذا كانت القائمة الحالية فارغة الأسماء
  useEffect(() => {
    if (!clubAthletes || clubAthletes.length === 0) return;
    const hasAnyName = athletesList.some(a => a.name && a.name.trim() !== '');
    if (hasAnyName) return;

    const filled = athletesList.map((row, idx) => {
      const rosterAthlete = clubAthletes[idx];
      if (!rosterAthlete) return row;
      const age = calcAgeFromDob(rosterAthlete.dateOfBirth);
      return {
        ...row,
        athleteId: row.athleteId || rosterAthlete.id,
        name: rosterAthlete.fullNameAr || rosterAthlete.fullNameEn || '',
        age: age > 0 ? age : row.age,
        category: getCategoryByDOBToday(rosterAthlete.dateOfBirth)?.nameAr || row.category,
      };
    });
    setAthletesList(filled);
  }, [clubAthletes, athletesList]);

  // حساب أفضل نتيجة من المحاولات الثلاث
  const calculateBestResult = (attempt1: number, attempt2: number, attempt3: number): number => {
    const attempts = [attempt1, attempt2, attempt3].filter(attempt => attempt > 0);
    if (attempts.length === 0) return 0;
    return Math.min(...attempts); // أقل رقم هو الأفضل (أقل وقت)
  };

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // إعادة حساب أفضل نتيجة والتقييم عند تغيير المحاولات
        if (field === 'firstAttempt' || field === 'secondAttempt' || field === 'thirdAttempt') {
          const attempt1 = field === 'firstAttempt' ? Number(value) : updated.firstAttempt;
          const attempt2 = field === 'secondAttempt' ? Number(value) : updated.secondAttempt;
          const attempt3 = field === 'thirdAttempt' ? Number(value) : updated.thirdAttempt;
          
          const bestResult = calculateBestResult(attempt1, attempt2, attempt3);
          updated.bestResult = bestResult;
          updated.evaluation = getEvaluation(bestResult);
        }
        
        return updated;
      }
      return athlete;
    }));
  };

  // حساب العمر من تاريخ الميلاد
  const calcAgeFromDob = (dob?: Date): number => {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // حفظ البيانات في Firestore
  const handleSaveData = async () => {
    setSaving(true);
    try {
      await saveData(athletesList);
      alert('تم حفظ البيانات بنجاح');
    } catch (err) {
      console.error('Error saving max dynamic strength test:', err);
      alert('حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };



  // مسح البيانات
  const clearData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      setAthletesList(initializeAthletes());
    }
  };

  // طباعة النتائج - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printResults = () => {
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // إنشاء محتوى الجدول للطباعة
    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>اختبار القوة القصوى المتحركة - التخلص من التطبيق</title>
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
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
          }
          .evaluation-excellent { color: #28a745; font-weight: bold; }
          .evaluation-good { color: #17a2b8; font-weight: bold; }
          .evaluation-average { color: #ffc107; font-weight: bold; }
          .evaluation-weak { color: #dc3545; font-weight: bold; }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <h2>اختبار القوة القصوى المتحركة: اختبار التخلص من التطبيق</h2>
        <table>
          <thead>
            <tr>
              <th>الإسم واللقب</th>
              <th>الصنف</th>
              <th>الفئة</th>
              <th>المحاولة الأولى/20ث</th>
              <th>المحاولة الثانية/20ث</th>
              <th>المحاولة الثالثة/20ث</th>
              <th>أحسن نتيجة</th>
              <th>التقييم</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.firstAttempt || ''}</td>
                <td>${athlete.secondAttempt || ''}</td>
                <td>${athlete.thirdAttempt || ''}</td>
                <td>${athlete.bestResult > 0 ? `${athlete.bestResult}ث` : ''}</td>
                <td class="${athlete.evaluation === 'ممتاز' ? 'evaluation-excellent' :
                          athlete.evaluation === 'حسن' ? 'evaluation-good' :
                          athlete.evaluation === 'متوسط' ? 'evaluation-average' :
                          athlete.evaluation === 'ضعيف' ? 'evaluation-weak' : ''}">
                  ${athlete.evaluation}
                </td>
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

    // طباعة النافذة الجديدة
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-dumbbell me-2"></i>
          اختبار القوة القصوى المتحركة: اختبار التخلص من التطبيق
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التقييم */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معايير التقييم:</strong>
              <ul className="mb-0 mt-2">
                <li>1-4 ثانية: ممتاز</li>
                <li>5-9 ثانية: حسن</li>
                <li>10-19 ثانية: متوسط</li>
                <li>20 ثانية: ضعيف</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>ملاحظات:</strong>
              <ul className="mb-0 mt-2">
                <li>يتم أخذ أفضل نتيجة من المحاولات الثلاث</li>
                <li>الوقت الأقل يعني أداء أفضل</li>
                <li>كل محاولة مدتها 20 ثانية كحد أقصى</li>
              </ul>
            </Col>
          </Row>
        </Alert>

        {/* أزرار التحكم */}
        <Row className="mb-4" dir="rtl">
          <Col className="text-end">
            <Button 
              variant="success" 
              onClick={handleSaveData}
              disabled={saving}
              className="me-2"
            >
              {saving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  جار الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  حفظ البيانات
                </>
              )}
            </Button>

            <Button variant="info" onClick={printResults} className="me-2">
              <i className="fas fa-print me-2"></i>
              طباعة النتائج
            </Button>
            <Button variant="danger" onClick={clearData}>
              <i className="fas fa-trash me-2"></i>
              مسح البيانات
            </Button>
          </Col>
        </Row>

        {/* الجدول */}
        <div className="table-responsive">
          <Table bordered className="strength-test-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th className="text-center">الإسم واللقب</th>
                <th className="text-center">الصنف</th>
                <th className="text-center">الفئة</th>
                <th className="text-center">المحاولة الأولى/20ث</th>
                <th className="text-center">المحاولة الثانية/20ث</th>
                <th className="text-center">المحاولة الثالثة/20ث</th>
                <th className="text-center">أحسن نتيجة</th>
                <th className="text-center">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {athletesList.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="text-center align-middle">
                    <span className="fw-semibold">{athlete.name}</span>
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="text"
                      value={athlete.category}
                      onChange={(e) => updateAthlete(athlete.id, 'category', e.target.value)}
                      className="text-center"
                      placeholder="الصنف"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.age || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'age', Number(e.target.value))}
                      className="text-center"
                      placeholder="الفئة"
                      min="0"
                    />
                  </td>
                  <td className="text-center" style={{ minWidth: '140px' }}>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={athlete.firstAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'firstAttempt', Number(e.target.value))}
                      className="text-center"
                      placeholder="ثانية"
                      min="0"
                      max="20"
                    />
                  </td>
                  <td className="text-center" style={{ minWidth: '140px' }}>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={athlete.secondAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'secondAttempt', Number(e.target.value))}
                      placeholder="ثانية"
                      min="0"
                      max="20"
                    />
                  </td>
                  <td className="text-center" style={{ minWidth: '140px' }}>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={athlete.thirdAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'thirdAttempt', Number(e.target.value))}
                      placeholder="ثانية"
                      min="0"
                      max="20"
                    />
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold text-primary">
                      {athlete.bestResult > 0 ? `${athlete.bestResult}ث` : ''}
                    </span>
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className={`fw-bold ${
                      athlete.evaluation === 'ممتاز' ? 'text-success' :
                      athlete.evaluation === 'حسن' ? 'text-info' :
                      athlete.evaluation === 'متوسط' ? 'text-warning' :
                      athlete.evaluation === 'ضعيف' ? 'text-danger' : ''
                    }`}>
                      {athlete.evaluation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <style>
          {`
            .strength-test-table {
              font-size: 13px;
              table-layout: auto !important;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .strength-test-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 20px !important;
              border: 2px solid #1976d2;
              white-space: nowrap !important;
              min-width: 160px !important;
            }
            
            .strength-test-table td {
              vertical-align: middle !important;
              padding: 10px 18px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 140px !important;
            }
            
            .strength-test-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 12px;
              min-width: 100px;
              padding: 8px 10px;
            }
            
            .strength-test-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .strength-test-table {
                font-size: 11px;
              }
              
              .strength-test-table th,
              .strength-test-table td {
                padding: 4px;
              }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default MaxDynamicStrengthTest;
