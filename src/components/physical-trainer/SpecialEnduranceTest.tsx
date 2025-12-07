import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useSpecialEnduranceTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  rounds: string[]; // 6 جولات
  restPeriod: string; // فترة الراحة
  heartRateIntensity: string; // شدة نبض القلب
  averages: string; // أوساط
  age: number;
  evaluation: string; // التقدير
}

interface SpecialEnduranceTestProps {
  clubId: string;
}

const SpecialEnduranceTest: React.FC<SpecialEnduranceTestProps> = ({ clubId }) => {
  // البيانات الأولية
  const initializeAthletes = (): AthleteTestData[] => {
    const athletes: AthleteTestData[] = [];
    
    for (let i = 1; i <= 8; i++) {
      if (i === 1) {
        // الصف الأول مع البيانات المثال
        athletes.push({
          id: i,
          name: '',
          rounds: ['5', '', '', '', '', ''], // 6 جولات
          restPeriod: '4 دقائق', // فترة الراحة
          heartRateIntensity: '75%',
          averages: '',
          age: 0,
          evaluation: 'متحمل'
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          rounds: ['', '', '', '', '', ''], // 6 جولات فارغة
          restPeriod: '4 دقائق', // فترة الراحة ثابتة
          heartRateIntensity: '75%',
          averages: '',
          age: 0,
          evaluation: ''
        });
      }
    }
    
    return athletes;
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

  const { data: firestoreData, saveData } = useSpecialEnduranceTest(clubId);
  const [athletesList, setAthletesList] = useState<AthleteTestData[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);
  const { athletes: clubAthletes } = useClubAthletes(clubId);

  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletesList(firestoreData);
    } else if (clubAthletes.length > 0) {
      // Initialize from club athletes
      const initialized = clubAthletes.map((athlete, index) => ({
        id: index + 1,
        athleteId: athlete.id,
        name: athlete.fullNameAr || athlete.fullNameEn,
        rounds: ['', '', '', '', '', ''],
        restPeriod: '4 دقائق',
        heartRateIntensity: '75%',
        averages: '',
        age: calcAgeFromDob(athlete.dateOfBirth),
        evaluation: ''
      }));
      setAthletesList(initialized);
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
      };
    });
    setAthletesList(filled);
  }, [clubAthletes, athletesList]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number | string[]) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // حساب المتوسط عند تغيير الجولات
        if (field === 'rounds') {
          const rounds = value as string[];
          const validRounds = rounds.filter(round => round && !isNaN(Number(round))).map(Number);
          if (validRounds.length > 0) {
            const average = (validRounds.reduce((sum, val) => sum + val, 0) / validRounds.length).toFixed(1);
            updated.averages = average;
            
            // تحديد التقدير بناءً على المتوسط
            const avgNum = Number(average);
            if (avgNum >= 4) {
              updated.evaluation = 'متحمل';
            } else if (avgNum >= 3) {
              updated.evaluation = 'جيد';
            } else if (avgNum >= 2) {
              updated.evaluation = 'متوسط';
            } else {
              updated.evaluation = 'ضعيف';
            }
          } else {
            updated.averages = '';
            updated.evaluation = '';
          }
        }
        
        return updated;
      }
      return athlete;
    }));
  };

  // تحديث جولة محددة
  const updateRound = (athleteId: number, roundIndex: number, value: string) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const newRounds = [...athlete.rounds];
        newRounds[roundIndex] = value;
        const updated = { ...athlete, rounds: newRounds };
        
        // حساب المتوسط
        const validRounds = newRounds.filter(round => round && !isNaN(Number(round))).map(Number);
        if (validRounds.length > 0) {
          const average = (validRounds.reduce((sum, val) => sum + val, 0) / validRounds.length).toFixed(1);
          updated.averages = average;
          
          // تحديد التقدير
          const avgNum = Number(average);
          if (avgNum >= 4) {
            updated.evaluation = 'متحمل';
          } else if (avgNum >= 3) {
            updated.evaluation = 'جيد';
          } else if (avgNum >= 2) {
            updated.evaluation = 'متوسط';
          } else {
            updated.evaluation = 'ضعيف';
          }
        } else {
          updated.averages = '';
          updated.evaluation = '';
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
      await saveData(athletesList);
      alert('تم حفظ البيانات بنجاح');
    } catch (err) {
      console.error('Error saving special endurance test:', err);
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
        <title>اختبار المداومة الخاصة</title>
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
          .evaluation-good { color: #17a2b8; font-weight: bold; }
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
        <h2>اختبار المداومة الخاصة: إختبار (6) مباراة X (4) دقائق</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="2">الإسم واللقب</th>
              <th rowspan="2">أوساط</th>
              <th rowspan="2">الفئة</th>
              <th rowspan="2">شدة نبض القلب</th>
              <th rowspan="2">الراحة</th>
              <th colspan="6">عدد الهجمات التي عرضت العضم المطة في آخر مباراة</th>
              <th rowspan="2">التقدير</th>
            </tr>
            <tr>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
              <th>6</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.averages || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>75%</td>
                <td>4 دقائق</td>
                ${athlete.rounds.map((round) => `<td>${round || ''}</td>`).join('')}
                <td class="${athlete.evaluation === 'متحمل' ? 'evaluation-excellent' :
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
          <i className="fas fa-heartbeat me-2"></i>
          اختبار المداومة الخاصة: إختبار (6) مباراة X (4) دقائق
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التقييم */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معايير التقييم:</strong>
              <ul className="mb-0 mt-2">
                <li>متوسط 4 فأكثر: متحمل</li>
                <li>متوسط 3-3.9: جيد</li>
                <li>متوسط 2-2.9: متوسط</li>
                <li>متوسط أقل من 2: ضعيف</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>ملاحظات:</strong>
              <ul className="mb-0 mt-2">
                <li>6 مباريات كل مباراة 4 دقائق</li>
                <li>فترات راحة محددة بين المباريات</li>
                <li>شدة نبض القلب: 75%</li>
                <li>يتم حساب المتوسط تلقائياً</li>
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
          <Table bordered className="endurance-test-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th rowSpan={2} className="text-center align-middle">الإسم واللقب</th>
                <th rowSpan={2} className="text-center align-middle">أوساط</th>
                <th rowSpan={2} className="text-center align-middle">الفئة</th>
                <th rowSpan={2} className="text-center align-middle">شدة نبض القلب</th>
                <th rowSpan={2} className="text-center align-middle">الراحة</th>
                <th colSpan={6} className="text-center bg-info text-white">عدد الهجمات التي عرضت العضم المطة في آخر مباراة</th>
                <th rowSpan={2} className="text-center align-middle">التقدير</th>
              </tr>
              <tr className="table-secondary">
                <th className="text-center small">1</th>
                <th className="text-center small">2</th>
                <th className="text-center small">3</th>
                <th className="text-center small">4</th>
                <th className="text-center small">5</th>
                <th className="text-center small">6</th>
              </tr>
            </thead>
            <tbody>
              {athletesList.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="text-center align-middle">
                    <span className="fw-semibold">{athlete.name}</span>
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold text-primary">
                      {athlete.averages}
                    </span>
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.age || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'age', Number(e.target.value))}
                      className="text-center"
                      placeholder="الفئة"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold">75%</span>
                  </td>
                  <td className="text-center align-middle bg-light">
                    <span className="fw-bold">4 دقائق</span>
                  </td>
                  {athlete.rounds.map((round, index) => (
                    <td key={index} className="text-center">
                      <Form.Control
                        type="number"
                        value={round}
                        onChange={(e) => updateRound(athlete.id, index, e.target.value)}
                        className="text-center"
                        placeholder="عدد"
                        min="0"
                        size="sm"
                      />
                    </td>
                  ))}
                  <td className="text-center align-middle bg-light">
                    <span className={`fw-bold ${
                      athlete.evaluation === 'متحمل' ? 'text-success' :
                      athlete.evaluation === 'جيد' ? 'text-info' :
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
            .endurance-test-table {
              font-size: 12px;
              table-layout: auto !important;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .endurance-test-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 18px !important;
              border: 2px solid #1976d2;
              white-space: nowrap !important;
              min-width: 120px !important;
            }
            
            .endurance-test-table td {
              vertical-align: middle !important;
              padding: 10px 15px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 100px !important;
            }
            
            .endurance-test-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 6px 10px;
              font-size: 12px;
              width: auto;
              min-width: 70px;
            }
            
            .endurance-test-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
            }

            .endurance-test-table .small {
              font-size: 11px;
              line-height: 1.2;
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .endurance-test-table {
                font-size: 9px;
              }
              
              .endurance-test-table th,
              .endurance-test-table td {
                padding: 2px;
              }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default SpecialEnduranceTest;
