import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useSpecialSpeedTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  gender: string; // الجنس لتحديد نقاط الخطأ
  // Nage komi
  nageKomiCorrect: number; // 10 محاولات/أول رمي صحيح
  nageKomiWrong: number; // خاطئ
  nageKomiTime: number; // الزمن المحقق/ث
  // النتائج
  finalResult: number; // النتيجة/ث
  evaluation: string; // التقييم
  overallEvaluation: string; // التقييم العام
}

interface SpecialSpeedTestProps {
  clubId: string;
}

const SpecialSpeedTest: React.FC<SpecialSpeedTestProps> = ({ clubId }) => {
  // تحديد التقييم بناءً على النتيجة
  const getEvaluation = (result: number): string => {
    if (result === 0) return '';
    if (result < 19) return 'ممتاز';
    if (result >= 20 && result < 26) return 'جيد جدا';
    if (result >= 26 && result < 31) return 'جيد';
    if (result >= 31) return 'متوسط';
    return 'ضعيف';
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
          gender: '',
          nageKomiCorrect: 10,
          nageKomiWrong: 0,
          nageKomiTime: 27,
          finalResult: 27,
          evaluation: 'جيد',
          overallEvaluation: 'جيد جدا'
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          gender: '',
          nageKomiCorrect: 0,
          nageKomiWrong: 0,
          nageKomiTime: 0,
          finalResult: 0,
          evaluation: '',
          overallEvaluation: ''
        });
      }
    }
    
    return athletes;
  };

  const {
    data: firestoreData,
    saveData
  } = useSpecialSpeedTest(clubId);

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
        gender: (athlete.gender as 'male' | 'female' | '') || '',
        nageKomiCorrect: 0,
        nageKomiWrong: 0,
        nageKomiTime: 0,
        finalResult: 0,
        evaluation: '',
        overallEvaluation: ''
      }));
      setAthletesList(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // تعبئة تلقائية مرة واحدة من قائمة النادي إذا كانت الأسماء فارغة
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
        gender: (rosterAthlete.gender as 'male' | 'female' | '') || row.gender,
        category: getCategoryByDOBToday(rosterAthlete.dateOfBirth)?.nameAr || row.category,
      };
    });
    setAthletesList(filled);
  }, [clubAthletes, athletesList]);

  // حساب النتيجة النهائية
  const calculateFinalResult = (wrongAttempts: number, achievedTime: number, gender: string): number => {
    if (achievedTime === 0) return 0;

    let penaltyPerWrong = 0;
    if (gender === 'male') penaltyPerWrong = 3;
    else if (gender === 'female') penaltyPerWrong = 2;

    return achievedTime + (wrongAttempts * penaltyPerWrong);
  };

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // إعادة حساب النتيجة النهائية والتقييم عند تغيير البيانات ذات الصلة
        if (field === 'nageKomiWrong' || field === 'nageKomiTime' || field === 'gender') {
          const wrongAttempts = field === 'nageKomiWrong' ? Number(value) : updated.nageKomiWrong;
          const achievedTime = field === 'nageKomiTime' ? Number(value) : updated.nageKomiTime;
          const gender = field === 'gender' ? value as 'male' | 'female' | '' : updated.gender;
          
          const finalResult = calculateFinalResult(wrongAttempts, achievedTime, gender);
          updated.finalResult = Number(finalResult.toFixed(2));
          updated.evaluation = getEvaluation(finalResult);
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
      console.error('Error saving special speed test:', err);
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
        <title>اختبار السرعة الخاصة</title>
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
            padding: 6px;
            text-align: center;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 11px;
          }
          .evaluation-excellent { color: #28a745; font-weight: bold; }
          .evaluation-verygood { color: #17a2b8; font-weight: bold; }
          .evaluation-good { color: #007bff; font-weight: bold; }
          .evaluation-average { color: #ffc107; font-weight: bold; }
          .evaluation-weak { color: #dc3545; font-weight: bold; }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <h2>اختبار السرعة الخاصة</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="2">الإسم واللقب</th>
              <th rowspan="2">الصنف</th>
              <th rowspan="2">الفئة</th>
              <th rowspan="2">الجنس</th>
              <th colspan="3">Nage komi</th>
              <th rowspan="2">النتيجة/ث</th>
              <th rowspan="2">التقييم العام</th>
            </tr>
            <tr>
              <th>10 محاولات/أول رمي صحيح</th>
              <th>خاطئ</th>
              <th>الزمن المحقق/ث</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.gender === 'male' ? 'ذكر' : athlete.gender === 'female' ? 'أنثى' : ''}</td>
                <td>${athlete.nageKomiCorrect || ''}</td>
                <td>${athlete.nageKomiWrong || ''}</td>
                <td>${athlete.nageKomiTime || ''}</td>
                <td>${athlete.finalResult > 0 ? `${athlete.finalResult}ث` : ''}</td>
                <td class="${athlete.evaluation === 'ممتاز' ? 'evaluation-excellent' :
                          athlete.evaluation === 'جيد جدا' ? 'evaluation-verygood' :
                          athlete.evaluation === 'جيد' ? 'evaluation-good' :
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
          <i className="fas fa-running me-2"></i>
          اختبار السرعة الخاصة
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التقييم */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معايير التقييم:</strong>
              <ul className="mb-0 mt-2">
                <li>أقل من 19ث: ممتاز</li>
                <li>20-25ث: جيد جداً</li>
                <li>26-30ث: جيد</li>
                <li>31ث فأكثر: متوسط</li>
                <li>أكثر من ذلك: ضعيف</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>قواعد الحساب:</strong>
              <ul className="mb-0 mt-2">
                <li>النتيجة = الزمن المحقق + (عدد الأخطاء × نقاط الخطأ)</li>
                <li>ذكور: كل خطأ = +3 ثواني</li>
                <li>إناث: كل خطأ = +2 ثانية</li>
                <li>Nage komi: 10 محاولات لأول رمي صحيح</li>
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
          <Table bordered className="speed-test-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th rowSpan={2} className="text-center align-middle">الإسم واللقب</th>
                <th rowSpan={2} className="text-center align-middle">الصنف</th>
                <th rowSpan={2} className="text-center align-middle">الفئة</th>
                <th rowSpan={2} className="text-center align-middle">الجنس</th>
                <th colSpan={3} className="text-center bg-info text-white">Nage komi</th>
                <th rowSpan={2} className="text-center align-middle">النتيجة/ث</th>
                <th rowSpan={2} className="text-center align-middle">التقييم العام</th>
              </tr>
              <tr className="table-secondary">
                <th className="text-center small">10 محاولات/أول رمي صحيح</th>
                <th className="text-center small">خاطئ</th>
                <th className="text-center small">الزمن المحقق/ث</th>
              </tr>
            </thead>
            <tbody>
              {athletesList.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="text-center align-middle">
                    <span className="fw-semibold">{athlete.name}</span>
                  </td>
                  <td className="text-center">
                    {(() => {
                      // Derive live category from club athlete DOB
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const cat = getCategoryByDOBToday(roster?.dateOfBirth)?.nameAr || athlete.category;
                      return <span className="fw-semibold">{cat}</span>;
                    })()}
                  </td>
                  <td className="text-center">
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const a = calcAgeFromDob(roster?.dateOfBirth);
                      return <span className="fw-semibold">{a || ''}</span>;
                    })()}
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.gender}
                      onChange={(e) => updateAthlete(athlete.id, 'gender', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.nageKomiCorrect || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'nageKomiCorrect', Number(e.target.value))}
                      className="text-center"
                      placeholder="صحيح"
                      min="0"
                      max="10"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.nageKomiWrong || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'nageKomiWrong', Number(e.target.value))}
                      className="text-center"
                      placeholder="خاطئ"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={athlete.nageKomiTime || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'nageKomiTime', Number(e.target.value))}
                      className="text-center"
                      placeholder="ثانية"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold text-primary">
                      {athlete.finalResult > 0 ? `${athlete.finalResult}ث` : ''}
                    </span>
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className={`fw-bold ${
                      athlete.evaluation === 'ممتاز' ? 'text-success' :
                      athlete.evaluation === 'جيد جدا' ? 'text-info' :
                      athlete.evaluation === 'جيد' ? 'text-primary' :
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
            .speed-test-table {
              font-size: 11px;
            }
            
            .speed-test-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 8px 4px;
              border: 2px solid #1976d2;
            }
            
            .speed-test-table td {
              vertical-align: middle;
              padding: 4px;
              border: 1px solid #ddd;
            }
            
            .speed-test-table input,
            .speed-test-table select {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 4px;
              font-size: 10px;
              width: 100%;
            }
            
            .speed-test-table input:focus,
            .speed-test-table select:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .speed-test-table {
                font-size: 9px;
              }
              
              .speed-test-table th,
              .speed-test-table td {
                padding: 2px;
              }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default SpecialSpeedTest;
