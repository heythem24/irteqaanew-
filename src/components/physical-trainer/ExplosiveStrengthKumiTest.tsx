import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useExplosiveStrengthKumiTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  firstAttempt: number; // المحاولة الأولى/30ث
  secondAttempt: number; // المحاولة الثانية/30ث
  thirdAttempt: number; // المحاولة الثالثة/30ث
  bestResult: number; // أحسن نتيجة
  evaluation: string; // التقييم
}

interface ExplosiveStrengthKumiTestProps {
  clubId: string;
}

const ExplosiveStrengthKumiTest: React.FC<ExplosiveStrengthKumiTestProps> = ({ clubId }) => {
  // تحديد التقييم بناءً على النتيجة
  const getEvaluation = (result: number): string => {
    if (result === 0) return '';
    if (result >= 1 && result <= 4) return 'ممتاز';
    if (result >= 5 && result <= 9) return 'حسن';
    if (result >= 10 && result <= 19) return 'متوسط';
    if (result >= 20) return 'ضعيف';
    return '';
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
          firstAttempt: 1,
          secondAttempt: 1,
          thirdAttempt: 5,
          bestResult: 5,
          evaluation: 'حسن'
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

  const { data: firestoreData, saveData } = useExplosiveStrengthKumiTest(clubId);
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  const [athletesData, setAthletesData] = useState<AthleteTestData[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletesData(firestoreData);
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
      setAthletesData(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // حساب أفضل نتيجة من المحاولات الثلاث
  const calculateBestResult = (attempt1: number, attempt2: number, attempt3: number): number => {
    const attempts = [attempt1, attempt2, attempt3].filter(attempt => attempt > 0);
    if (attempts.length === 0) return 0;
    return Math.max(...attempts); // أكبر رقم هو الأفضل (أكثر تكرارات)
  };

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number) => {
    setAthletesData(prev => prev.map(athlete => {
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

  // حفظ البيانات في Firestore
  const handleSaveData = async () => {
    setSaving(true);
    try {
      await saveData(athletesData);
      alert('تم حفظ البيانات بنجاح');
    } catch (err) {
      console.error('Error saving explosive strength kumi test:', err);
      alert('حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  // مسح البيانات
  const clearData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      setAthletesData(initializeAthletes());
      alert('تم مسح البيانات بنجاح');
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
        <title>اختبار القوة الانفجارية - التخلص من المسكة</title>
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
        <h2>اختبار القوة الانفجارية: اختبار التخلص من المسكة (kumi kata)</h2>
        <table>
          <thead>
            <tr>
              <th>الإسم واللقب</th>
              <th>الصنف</th>
              <th>الفئة</th>
              <th>المحاولة الأولى/30ث</th>
              <th>المحاولة الثانية/30ث</th>
              <th>المحاولة الثالثة/30ث</th>
              <th>أحسن نتيجة</th>
              <th>التقييم</th>
            </tr>
          </thead>
          <tbody>
            ${athletesData.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.firstAttempt || ''}</td>
                <td>${athlete.secondAttempt || ''}</td>
                <td>${athlete.thirdAttempt || ''}</td>
                <td>${athlete.bestResult > 0 ? athlete.bestResult : ''}</td>
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
          <i className="fas fa-fist-raised me-2"></i>
          اختبار القوة الانفجارية الخاصة: اختبار التخلص من المسكة (kumi kata)
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التقييم */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معايير التقييم:</strong>
              <ul className="mb-0 mt-2">
                <li>1-4 تكرارات: ممتاز</li>
                <li>5-9 تكرارات: حسن</li>
                <li>10-19 تكرار: متوسط</li>
                <li>20 تكرار فأكثر: ضعيف</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>ملاحظات:</strong>
              <ul className="mb-0 mt-2">
                <li>يتم أخذ أفضل نتيجة من المحاولات الثلاث</li>
                <li>العدد الأكبر يعني أداء أفضل</li>
                <li>كل محاولة مدتها 30 ثانية</li>
                <li>اختبار التخلص من المسكة (kumi-kata)</li>
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
          <Table bordered className="explosive-strength-test-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th className="text-center">الإسم واللقب</th>
                <th className="text-center">الصنف</th>
                <th className="text-center">الفئة</th>
                <th className="text-center">المحاولة الأولى/30ث</th>
                <th className="text-center">المحاولة الثانية/30ث</th>
                <th className="text-center">المحاولة الثالثة/30ث</th>
                <th className="text-center">أحسن نتيجة</th>
                <th className="text-center">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {athletesData.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="text-center">
                    <span>{athlete.name || ''}</span>
                  </td>
                  <td className="text-center align-middle">
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const cat = getCategoryByDOBToday(roster?.dateOfBirth)?.nameAr || athlete.category;
                      return <span className="fw-semibold">{cat}</span>;
                    })()}
                  </td>
                  <td className="text-center align-middle">
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const a = calcAgeFromDob(roster?.dateOfBirth);
                      return <span className="fw-semibold">{a || ''}</span>;
                    })()}
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.firstAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'firstAttempt', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.secondAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'secondAttempt', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.thirdAttempt || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'thirdAttempt', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                    />
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold text-primary">
                      {athlete.bestResult > 0 ? athlete.bestResult : ''}
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
            .explosive-strength-test-table {
              font-size: 13px;
            }
            
            .explosive-strength-test-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 12px 8px;
              border: 2px solid #1976d2;
              white-space: normal;
              word-break: break-word;
            }
            
            .explosive-strength-test-table td {
              vertical-align: middle;
              padding: 8px;
              border: 1px solid #ddd;
              white-space: normal;
              word-break: break-word;
            }
            
            .explosive-strength-test-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 6px;
              font-size: 12px;
            }
            
            .explosive-strength-test-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .explosive-strength-test-table {
                font-size: 11px;
              }
              
              .explosive-strength-test-table th,
              .explosive-strength-test-table td {
                padding: 4px;
              }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default ExplosiveStrengthKumiTest;
