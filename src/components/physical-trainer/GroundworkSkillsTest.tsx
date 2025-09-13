import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useGroundworkSkillsTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  // مهارات اللعب الأرضي/20ث
  kesaGatame: number; // كيسا-جاتاميه
  yokoShihoGatame: number; // يوكو-شيهو-جاتاميه
  kamiShihoGatame: number; // كامي-شيهو-جاتاميه
  evaluation: string; // التقييم
}

interface GroundworkSkillsTestProps {
  clubId: string;
}

const GroundworkSkillsTest: React.FC<GroundworkSkillsTestProps> = ({ clubId }) => {
  // تحديد التقييم بناءً على النتيجة
  const getEvaluation = (result: number): string => {
    if (result === 0) return '';
    if (result >= 1 && result <= 4) return 'ضعيف';
    if (result >= 5 && result <= 9) return 'متوسط';
    if (result >= 10 && result <= 19) return 'حسن';
    if (result >= 20) return 'ممتاز';
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

  // حساب أفضل نتيجة من التقنيات الثلاث
  const calculateBestResult = (kesa: number, yoko: number, kami: number): number => {
    const results = [kesa, yoko, kami].filter(result => result > 0);
    if (results.length === 0) return 0;
    return Math.max(...results); // أكبر رقم هو الأفضل
  };

  // البيانات الأولية
  const initializeAthletes = (): AthleteTestData[] => {
    const athletes: AthleteTestData[] = [];
    
    for (let i = 1; i <= 8; i++) {
      athletes.push({
        id: i,
        name: '',
        category: '',
        age: 0,
        kesaGatame: 0,
        yokoShihoGatame: 0,
        kamiShihoGatame: 0,
        evaluation: ''
      });
    }
    
    return athletes;
  };

  const { data: firestoreData, saveData } = useGroundworkSkillsTest(clubId);
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
        kesaGatame: 0,
        yokoShihoGatame: 0,
        kamiShihoGatame: 0,
        evaluation: ''
      }));
      setAthletesList(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // إعادة حساب التقييم عند تغيير أي من التقنيات
        if (field === 'kesaGatame' || field === 'yokoShihoGatame' || field === 'kamiShihoGatame') {
          const kesa = field === 'kesaGatame' ? Number(value) : updated.kesaGatame;
          const yoko = field === 'yokoShihoGatame' ? Number(value) : updated.yokoShihoGatame;
          const kami = field === 'kamiShihoGatame' ? Number(value) : updated.kamiShihoGatame;
          
          const bestResult = calculateBestResult(kesa, yoko, kami);
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
      await saveData(athletesList);
      alert('تم حفظ البيانات بنجاح');
    } catch (err) {
      console.error('Error saving groundwork skills test:', err);
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

  // طباعة النتائج
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
        <title>مهارات اللعب الأرضي</title>
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
            font-size: 12px;
          }
          .evaluation-excellent { color: #28a745; font-weight: bold; }
          .evaluation-good { color: #17a2b8; font-weight: bold; }
          .evaluation-average { color: #ffc107; font-weight: bold; }
          .evaluation-weak { color: #dc3545; font-weight: bold; }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 11px; }
          }
        </style>
      </head>
      <body>
        <h2>مهارات اللعب الأرضي/20ث</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="2">الإسم واللقب</th>
              <th rowspan="2">الصنف</th>
              <th rowspan="2">الفئة</th>
              <th colspan="3">مهارات اللعب الأرضي/20ث</th>
              <th rowspan="2">التقييم</th>
            </tr>
            <tr>
              <th>كيسا-جاتاميه</th>
              <th>يوكو-شيهو-جاتاميه</th>
              <th>كامي-شيهو-جاتاميه</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.kesaGatame || ''}</td>
                <td>${athlete.yokoShihoGatame || ''}</td>
                <td>${athlete.kamiShihoGatame || ''}</td>
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
          <i className="fas fa-user-ninja me-2"></i>
          مهارات اللعب الأرضي/20ث
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التقييم */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معايير التقييم:</strong>
              <ul className="mb-0 mt-2">
                <li>1-4 تكرارات: ضعيف</li>
                <li>5-9 تكرارات: متوسط</li>
                <li>10-19 تكرار: حسن</li>
                <li>20 تكرار فأكثر: ممتاز</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>التقنيات المختبرة:</strong>
              <ul className="mb-0 mt-2">
                <li>كيسا-جاتاميه (Kesa-Gatame)</li>
                <li>يوكو-شيهو-جاتاميه (Yoko-Shiho-Gatame)</li>
                <li>كامي-شيهو-جاتاميه (Kami-Shiho-Gatame)</li>
                <li>التقييم بناءً على أفضل نتيجة</li>
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
          <Table bordered className="groundwork-skills-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th rowSpan={2} className="text-center align-middle">الإسم واللقب</th>
                <th rowSpan={2} className="text-center align-middle">الصنف</th>
                <th rowSpan={2} className="text-center align-middle">الفئة</th>
                <th colSpan={3} className="text-center bg-info text-white">مهارات اللعب الأرضي/20ث</th>
                <th rowSpan={2} className="text-center align-middle">التقييم</th>
              </tr>
              <tr className="table-secondary">
                <th className="text-center small">كيسا-جاتاميه</th>
                <th className="text-center small">يوكو-شيهو-جاتاميه</th>
                <th className="text-center small">كامي-شيهو-جاتاميه</th>
              </tr>
            </thead>
            <tbody>
              {athletesList.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="text-center align-middle">
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
                      value={athlete.kesaGatame || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'kesaGatame', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.yokoShihoGatame || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'yokoShihoGatame', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="number"
                      value={athlete.kamiShihoGatame || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'kamiShihoGatame', Number(e.target.value))}
                      className="text-center"
                      placeholder="تكرارات"
                      min="0"
                      size="sm"
                    />
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
            .groundwork-skills-table {
              font-size: 12px;
            }
            
            .groundwork-skills-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: 10px 6px;
              border: 2px solid #1976d2;
              white-space: nowrap;
            }
            
            .groundwork-skills-table td {
              vertical-align: middle;
              padding: 6px;
              border: 1px solid #ddd;
            }
            
            .groundwork-skills-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 4px;
              font-size: 11px;
              width: 100%;
              min-width: 80px;
            }
            
            .groundwork-skills-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .groundwork-skills-table {
                font-size: 10px;
              }
              
              .groundwork-skills-table th,
              .groundwork-skills-table td {
                padding: 3px;
              }
              
              .groundwork-skills-table input {
                border: none;
                background: transparent;
                font-size: 9px;
              }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default GroundworkSkillsTest;
