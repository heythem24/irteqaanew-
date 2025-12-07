import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useSpeedStrengthTests } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteTestData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  // الأطراف العلوية
  upperLimbsReps: number; // ضغطة / 20 ثانية
  upperLimbsEvaluation: string; // التقييم
  // الأطراف السفلية  
  lowerLimbsReps: number; // ضغطة / 20 ثانية
  lowerLimbsEvaluation: string; // التقييم
  notes: string; // الملاحظة
}

interface SpeedStrengthTestsProps {
  clubId: string;
}

const SpeedStrengthTests: React.FC<SpeedStrengthTestsProps> = ({ clubId }) => {
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
          upperLimbsReps: 17,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 2) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 20,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 3) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 16,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 4) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 11,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 5) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 15,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 6) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 12,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else if (i === 7) {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 14,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          category: '',
          age: 0,
          upperLimbsReps: 10,
          upperLimbsEvaluation: '',
          lowerLimbsReps: 0,
          lowerLimbsEvaluation: '',
          notes: ''
        });
      }
    }
    
    return athletes;
  };

  const { data: firestoreData, saveData } = useSpeedStrengthTests(clubId);
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
        upperLimbsReps: 0,
        upperLimbsEvaluation: '',
        lowerLimbsReps: 0,
        lowerLimbsEvaluation: '',
        notes: ''
      }));
      setAthletesData(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteTestData, value: string | number) => {
    setAthletesData(prev => prev.map(athlete => {
      if (athlete.id === id) {
        return { ...athlete, [field]: value };
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
      await saveData(athletesData);
    } catch (err) {
      console.error('Error saving speed strength tests:', err);
    } finally {
      setSaving(false);
    }
  };

  // مسح البيانات
  const clearData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      setAthletesData(initializeAthletes());
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
        <title>اختبارات القوة المميزة بالسرعة</title>
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
            font-size: 12px;
          }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 11px; }
          }
        </style>
      </head>
      <body>
        <h2>اختبارات القوة المميزة بالسرعة</h2>
        <table>
          <thead>
            <tr>
              <th>الإسم واللقب</th>
              <th>الصنف</th>
              <th>الفئة</th>
              <th>ضغطة / 20 ثانية<br/>الأطراف العلوية</th>
              <th>التقييم</th>
              <th>ضغطة / 20 ثانية<br/>الأطراف السفلية</th>
              <th>التقييم</th>
              <th>الملاحظة</th>
            </tr>
          </thead>
          <tbody>
            ${athletesData.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.upperLimbsReps || ''}</td>
                <td>${athlete.upperLimbsEvaluation || ''}</td>
                <td>${athlete.lowerLimbsReps || ''}</td>
                <td>${athlete.lowerLimbsEvaluation || ''}</td>
                <td>${athlete.notes || ''}</td>
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
          <i className="fas fa-bolt me-2"></i>
          اختبارات القوة المميزة بالسرعة
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات إرشادية */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>اختبارات القوة المميزة بالسرعة:</strong>
              <ul className="mb-0 mt-2">
                <li>الأطراف العلوية: ضغطة / 20 ثانية</li>
                <li>الأطراف السفلية: ضغطة / 20 ثانية</li>
                <li>يتم تسجيل عدد الضربات في الوقت المحدد</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>ملاحظات:</strong>
              <ul className="mb-0 mt-2">
                <li>جدول ثابت بدون حسابات تلقائية</li>
                <li>يمكن إدخال التقييم يدوياً</li>
                <li>إضافة ملاحظات خاصة لكل رياضي</li>
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
          <Table bordered className="speed-strength-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th className="text-center">الإسم واللقب</th>
                <th className="text-center">الصنف</th>
                <th className="text-center">الفئة</th>
                <th className="text-center bg-success text-white">ضغطة / 20 ثانية<br/>الأطراف العلوية</th>
                <th className="text-center">التقييم</th>
                <th className="text-center bg-warning text-dark">ضغطة / 20 ثانية<br/>الأطراف السفلية</th>
                <th className="text-center">التقييم</th>
                <th className="text-center">الملاحظة</th>
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
                  <td className="text-center bg-light">
                    <Form.Control
                      type="number"
                      value={athlete.upperLimbsReps || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'upperLimbsReps', Number(e.target.value))}
                      className="text-center"
                      placeholder="عدد الضربات"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="text"
                      value={athlete.upperLimbsEvaluation}
                      onChange={(e) => updateAthlete(athlete.id, 'upperLimbsEvaluation', e.target.value)}
                      className="text-center"
                      placeholder="التقييم"
                      size="sm"
                    />
                  </td>
                  <td className="text-center bg-light">
                    <Form.Control
                      type="number"
                      value={athlete.lowerLimbsReps || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'lowerLimbsReps', Number(e.target.value))}
                      className="text-center"
                      placeholder="عدد الضربات"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="text"
                      value={athlete.lowerLimbsEvaluation}
                      onChange={(e) => updateAthlete(athlete.id, 'lowerLimbsEvaluation', e.target.value)}
                      className="text-center"
                      placeholder="التقييم"
                      size="sm"
                    />
                  </td>
                  <td className="text-center">
                    <Form.Control
                      type="text"
                      value={athlete.notes}
                      onChange={(e) => updateAthlete(athlete.id, 'notes', e.target.value)}
                      className="text-center"
                      placeholder="ملاحظات"
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <style>
          {`
            .speed-strength-table {
              font-size: 12px;
              table-layout: auto !important;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .speed-strength-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 20px !important;
              border: 2px solid #1976d2;
              white-space: nowrap !important;
              min-width: 160px !important;
            }
            
            .speed-strength-table td {
              vertical-align: middle !important;
              padding: 10px 18px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 140px !important;
            }
            
            .speed-strength-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 11px;
              width: auto;
              min-width: 80px;
            }
            
            .speed-strength-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .speed-strength-table {
                font-size: 10px;
              }
              
              .speed-strength-table th,
              .speed-strength-table td {
                padding: 3px;
              }
              
              .speed-strength-table input {
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

export default SpeedStrengthTests;
