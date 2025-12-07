import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useBodyCompositionCalculator } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import '../coach/coach-responsive.css';

interface AthleteBodyComposition {
  id: number;
  athleteId?: string;
  name: string;
  age: number;
  weight: number; // بالكيلوغرام
  weightPounds: number; // بالرطل
  bodyFatPercentage: number; // نسبة الدهون %
  fatWeightPounds: number; // نسبة الدهون بالرطل
  fatWeightKg: number; // نسبة الدهون بالكغ
  leanMassPounds: number; // كتلة الجسم بالرطل
  leanMassKg: number; // كتلة الجسم بالكغ
  standard: string; // المعيار حسب العمر
}

interface BodyCompositionCalculatorProps {
  clubId: string;
}

const BodyCompositionCalculator: React.FC<BodyCompositionCalculatorProps> = ({ clubId }) => {
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
  // تحويل الكيلوغرام إلى رطل
  const kgToPounds = (kg: number): number => {
    return kg * 2.20462;
  };

  // تحويل الرطل إلى كيلوغرام
  const poundsToKg = (pounds: number): number => {
    return (pounds * 453) / 1000;
  };

  // حساب نسبة الدهون بالرطل
  const calculateFatWeightPounds = (weightPounds: number, fatPercentage: number): number => {
    if (weightPounds === 0 || fatPercentage === 0) return 0;
    return (weightPounds * fatPercentage) / 100;
  };

  // حساب نسبة الدهون بالكغ
  const calculateFatWeightKg = (fatWeightPounds: number): number => {
    return poundsToKg(fatWeightPounds);
  };

  // حساب كتلة الجسم بالرطل
  const calculateLeanMassPounds = (weightPounds: number, fatWeightPounds: number): number => {
    return weightPounds - fatWeightPounds;
  };

  // حساب كتلة الجسم بالكغ
  const calculateLeanMassKg = (leanMassPounds: number): number => {
    return poundsToKg(leanMassPounds);
  };

  // تحديد المعيار بناءً على العمر
  const getStandardRange = (age: number): string => {
    if (age === 0) return '';
    if (age < 11) return '7-9';
    if (age >= 11 && age <= 15) return '6-8';
    if (age > 15) return '5-7';
    return '';
  };

  // البيانات الأولية
  const initializeAthletes = (): AthleteBodyComposition[] => {
    const initialData = [
      { id: 1, name: '', age: 27, weight: 100.00, bodyFatPercentage: 7.5 },
      { id: 2, name: '', age: 12, weight: 68.00, bodyFatPercentage: 8.6 },
      { id: 3, name: '', age: 16, weight: 68.00, bodyFatPercentage: 7.5 }
    ];

    const athletes: AthleteBodyComposition[] = [];
    
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        const data = initialData[i - 1];
        const weightPounds = kgToPounds(data.weight);
        const fatWeightPounds = calculateFatWeightPounds(weightPounds, data.bodyFatPercentage);
        const fatWeightKg = calculateFatWeightKg(fatWeightPounds);
        const leanMassPounds = calculateLeanMassPounds(weightPounds, fatWeightPounds);
        const leanMassKg = calculateLeanMassKg(leanMassPounds);
        
        athletes.push({
          id: i,
          name: data.name,
          age: data.age,
          weight: data.weight,
          weightPounds: Number(weightPounds.toFixed(2)),
          bodyFatPercentage: data.bodyFatPercentage,
          fatWeightPounds: Number(fatWeightPounds.toFixed(2)),
          fatWeightKg: Number(fatWeightKg.toFixed(2)),
          leanMassPounds: Number(leanMassPounds.toFixed(2)),
          leanMassKg: Number(leanMassKg.toFixed(2)),
          standard: getStandardRange(data.age)
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          age: 0,
          weight: 0,
          weightPounds: 0,
          bodyFatPercentage: 0,
          fatWeightPounds: 0,
          fatWeightKg: 0,
          leanMassPounds: 0,
          leanMassKg: 0,
          standard: ''
        });
      }
    }
    
    return athletes;
  };

  const { data: firestoreData, saveData } = useBodyCompositionCalculator(clubId);
  const { athletes: clubAthletes } = useClubAthletes(clubId);

  const [athletesList, setAthletesList] = useState<AthleteBodyComposition[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (amount: number) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Load data from Firestore when available
  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletesList(firestoreData);
    }
  }, [firestoreData]);

  // املأ الصفوف تلقائياً بأسماء وأعمار الرياضيين من الروستر عند التوفر ولمرة واحدة
  useEffect(() => {
    if (!clubAthletes.length) return;
    setAthletesList(prev => {
      const allEmpty = prev.every(a => !a.name);
      if (!allEmpty) return prev;
      let list = [...prev];
      while (list.length < clubAthletes.length) {
        list.push({
          id: list.length + 1,
          name: '',
          age: 0,
          weight: 0,
          weightPounds: 0,
          bodyFatPercentage: 0,
          fatWeightPounds: 0,
          fatWeightKg: 0,
          leanMassPounds: 0,
          leanMassKg: 0,
          standard: ''
        });
      }
      list = list.map((row, idx) => {
        const a = clubAthletes[idx];
        if (!a) return row;
        const age = calcAgeFromDob(a.dateOfBirth);
        const weightKg = typeof a.weight === 'number' && a.weight > 0 ? a.weight : row.weight;
        const weightLb = weightKg > 0 ? Number(kgToPounds(weightKg).toFixed(2)) : row.weightPounds;
        return {
          ...row,
          athleteId: row.athleteId || a.id,
          name: a.fullNameAr || a.fullNameEn,
          age: age > 0 ? age : row.age,
          weight: weightKg,
          weightPounds: weightLb,
          standard: getStandardRange(age > 0 ? age : row.age)
        };
      });
      return list;
    });
  }, [clubAthletes]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteBodyComposition, value: string | number) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // إعادة حساب الوزن بالرطل دائماً عند تغيير الوزن
        if (field === 'weight') {
          const weight = Number(value) || 0;
          updated.weightPounds = weight > 0 ? Number(kgToPounds(weight).toFixed(2)) : 0;
          // إذا كانت نسبة الدهون مدخلة، احسب بقية المؤشرات
          const fatPercentage = updated.bodyFatPercentage || 0;
          if (updated.weightPounds > 0 && fatPercentage > 0) {
            const fatWeightPounds = calculateFatWeightPounds(updated.weightPounds, fatPercentage);
            const fatWeightKg = calculateFatWeightKg(fatWeightPounds);
            const leanMassPounds = calculateLeanMassPounds(updated.weightPounds, fatWeightPounds);
            const leanMassKg = calculateLeanMassKg(leanMassPounds);
            updated.fatWeightPounds = Number(fatWeightPounds.toFixed(2));
            updated.fatWeightKg = Number(fatWeightKg.toFixed(2));
            updated.leanMassPounds = Number(leanMassPounds.toFixed(2));
            updated.leanMassKg = Number(leanMassKg.toFixed(2));
          } else {
            updated.fatWeightPounds = 0;
            updated.fatWeightKg = 0;
            updated.leanMassPounds = 0;
            updated.leanMassKg = 0;
          }
        }

        // إعادة حساب مؤشرات الدهون عند تغيير نسبة الدهون
        if (field === 'bodyFatPercentage') {
          const fatPercentage = Number(value) || 0;
          // تأكد من توفر الوزن بالرطل أو احسبه من الوزن بالكغ إن لزم
          const currentWeightPounds = updated.weightPounds > 0
            ? updated.weightPounds
            : (updated.weight > 0 ? Number(kgToPounds(updated.weight).toFixed(2)) : 0);
          updated.weightPounds = currentWeightPounds;
          if (currentWeightPounds > 0 && fatPercentage > 0) {
            const fatWeightPounds = calculateFatWeightPounds(currentWeightPounds, fatPercentage);
            const fatWeightKg = calculateFatWeightKg(fatWeightPounds);
            const leanMassPounds = calculateLeanMassPounds(currentWeightPounds, fatWeightPounds);
            const leanMassKg = calculateLeanMassKg(leanMassPounds);
            updated.fatWeightPounds = Number(fatWeightPounds.toFixed(2));
            updated.fatWeightKg = Number(fatWeightKg.toFixed(2));
            updated.leanMassPounds = Number(leanMassPounds.toFixed(2));
            updated.leanMassKg = Number(leanMassKg.toFixed(2));
          } else {
            updated.fatWeightPounds = 0;
            updated.fatWeightKg = 0;
            updated.leanMassPounds = 0;
            updated.leanMassKg = 0;
          }
        }

        // تحديث المعيار عند تغيير العمر
        if (field === 'age') {
          updated.standard = getStandardRange(Number(value));
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
      alert('تم حفظ بيانات حساب الدهون ووزن كتلة الجسم بنجاح');
    } catch (err) {
      console.error('Error saving body composition data:', err);
    } finally {
      setSaving(false);
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
        <title>حساب الدهون ووزن كتلة الجسم</title>
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
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <h2>حساب الدهون ووزن كتلة الجسم</h2>
        <table>
          <thead>
            <tr>
              <th>الإسم واللقب</th>
              <th>السن</th>
              <th>الوزن (كغ)</th>
              <th>الوزن بالرطل</th>
              <th>نسبة الدهون (%)</th>
              <th>نسبة الدهون بالرطل</th>
              <th>نسبة الدهون بالكغ</th>
              <th>كتلة الجسم بالرطل</th>
              <th>كتلة الجسم بالكغ</th>
              <th>المعيار</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.weight || ''}</td>
                <td>${athlete.weightPounds > 0 ? athlete.weightPounds.toFixed(2) : ''}</td>
                <td>${athlete.bodyFatPercentage || ''}</td>
                <td>${athlete.fatWeightPounds > 0 ? athlete.fatWeightPounds.toFixed(2) : ''}</td>
                <td>${athlete.fatWeightKg > 0 ? athlete.fatWeightKg.toFixed(2) : ''}</td>
                <td>${athlete.leanMassPounds > 0 ? athlete.leanMassPounds.toFixed(2) : ''}</td>
                <td>${athlete.leanMassKg > 0 ? athlete.leanMassKg.toFixed(2) : ''}</td>
                <td>${athlete.standard || ''}</td>
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
      <Card.Header className="bg-warning text-dark">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-weight me-2"></i>
          حساب الدهون ووزن كتلة الجسم
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات الحساب */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معادلات الحساب:</strong>
              <ul className="mb-0 mt-2 small">
                <li>نسبة الدهون بالرطل = الوزن بالرطل × نسبة الدهون ÷ 100</li>
                <li>نسبة الدهون بالكغ = نسبة الدهون بالرطل × 453 ÷ 1000</li>
                <li>كتلة الجسم بالرطل = الوزن بالرطل - نسبة الدهون بالرطل</li>
                <li>كتلة الجسم بالكغ = كتلة الجسم بالرطل × 453 ÷ 1000</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>المعيار حسب العمر:</strong>
              <ul className="mb-0 mt-2">
                <li>أقل من 11 سنة: 7-9</li>
                <li>من 11 إلى 15 سنة: 6-8</li>
                <li>أكبر من 15 سنة: 5-7</li>
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
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
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
          </Col>
        </Row>

        {/* الجدول داخل كاروسيل أفقي */}
        <div className="scroll-carousel">
          <button type="button" className="scroll-btn left" aria-label="يسار" onClick={() => scrollByAmount(-320)}>
            <i className="fas fa-chevron-right"></i>
          </button>
          <div className="table-responsive scroll-area" ref={scrollAreaRef}>
            <Table bordered className="body-composition-table coach-table" dir="rtl">
              <thead>
                <tr className="table-warning">
                  <th className="text-center">الإسم واللقب</th>
                  <th className="text-center">السن</th>
                  <th className="text-center">الوزن (كغ)</th>
                  <th className="text-center bg-success text-white">الوزن بالرطل</th>
                  <th className="text-center">نسبة الدهون (%)</th>
                  <th className="text-center bg-info text-white">نسبة الدهون بالرطل</th>
                  <th className="text-center bg-info text-white">نسبة الدهون بالكغ</th>
                  <th className="text-center bg-primary text-white">كتلة الجسم بالرطل</th>
                  <th className="text-center bg-primary text-white">كتلة الجسم بالكغ</th>
                  <th className="text-center bg-secondary text-white">المعيار</th>
                </tr>
              </thead>
              <tbody>
                {athletesList.map((athlete) => (
                  <tr key={athlete.id}>
                    <td className="text-center">
                      <div className="py-1">{athlete.name}</div>
                    </td>
                    <td className="text-center">
                      <Form.Control
                        type="number"
                        value={athlete.age || ''}
                        onChange={(e) => updateAthlete(athlete.id, 'age', Number(e.target.value))}
                        className="text-center"
                        placeholder="السن"
                        min="0"
                      />
                    </td>
                    <td className="text-center">
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={athlete.weight || ''}
                        onChange={(e) => updateAthlete(athlete.id, 'weight', Number(e.target.value))}
                        className="text-center"
                        placeholder="الوزن"
                        min="0"
                      />
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-success">
                        {athlete.weightPounds > 0 ? athlete.weightPounds.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center">
                      <Form.Control
                        type="number"
                        step="0.1"
                        value={athlete.bodyFatPercentage || ''}
                        onChange={(e) => updateAthlete(athlete.id, 'bodyFatPercentage', Number(e.target.value))}
                        className="text-center"
                        placeholder="نسبة الدهون"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-info">
                        {athlete.fatWeightPounds > 0 ? athlete.fatWeightPounds.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-info">
                        {athlete.fatWeightKg > 0 ? athlete.fatWeightKg.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-primary">
                        {athlete.leanMassPounds > 0 ? athlete.leanMassPounds.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-primary">
                        {athlete.leanMassKg > 0 ? athlete.leanMassKg.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle bg-light">
                      <span className="fw-bold text-secondary">
                        {athlete.standard}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <button type="button" className="scroll-btn right" aria-label="يمين" onClick={() => scrollByAmount(320)}>
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>

        <style>
          {`
            .body-composition-table {
              font-size: 12px;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .body-composition-table th {
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 20px !important;
              border: 2px solid #dee2e6;
              white-space: nowrap !important;
              min-width: 140px !important;
              overflow: visible !important;
              text-overflow: unset !important;
            }
            
            .body-composition-table td {
              vertical-align: middle !important;
              padding: 10px 18px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 130px !important;
            }
            
            .body-composition-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px 10px;
              font-size: 12px;
              min-width: 100px;
            }
            
            .body-composition-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            /* حاوية الكاروسيل */
            .scroll-carousel { position: relative; }
            .scroll-area {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              scroll-snap-type: x proximity;
            }
            .scroll-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              background: rgba(255,255,255,0.9);
              border: 1px solid #ddd;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              z-index: 2;
            }
            .scroll-btn.left { left: 4px; }
            .scroll-btn.right { right: 4px; }

            @media (max-width: 576px) {
              .body-composition-table.coach-table {
                min-width: 1100px; /* إجبار التمرير الأفقي بدل تكسير الأحرف */
                font-size: 12px;
              }
              /* اجعل أغلب الأعمدة لا تلتف لتجنب نزول الحروف تحت بعضها */
              .body-composition-table.coach-table th,
              .body-composition-table.coach-table td {
                padding: 0.45rem;
                white-space: nowrap;
              }
              /* اسم الرياضي يسمح له بالالتفاف الطبيعي */
              .body-composition-table.coach-table th:nth-child(1),
              .body-composition-table.coach-table td:nth-child(1) {
                min-width: 220px;
                white-space: normal;
              }
              /* توزيع أعرض أدنى لباقي الأعمدة */
              .body-composition-table.coach-table th:nth-child(2),
              .body-composition-table.coach-table td:nth-child(2) { min-width: 120px; }
              .body-composition-table.coach-table th:nth-child(3),
              .body-composition-table.coach-table td:nth-child(3) { min-width: 140px; }
              .body-composition-table.coach-table th:nth-child(4),
              .body-composition-table.coach-table td:nth-child(4) { min-width: 160px; }
              .body-composition-table.coach-table th:nth-child(5),
              .body-composition-table.coach-table td:nth-child(5) { min-width: 180px; }
              .body-composition-table.coach-table th:nth-child(6),
              .body-composition-table.coach-table td:nth-child(6) { min-width: 180px; }
              .body-composition-table.coach-table th:nth-child(7),
              .body-composition-table.coach-table td:nth-child(7) { min-width: 180px; }
              .body-composition-table.coach-table th:nth-child(8),
              .body-composition-table.coach-table td:nth-child(8) { min-width: 180px; }
              .body-composition-table.coach-table th:nth-child(9),
              .body-composition-table.coach-table td:nth-child(9) { min-width: 180px; }
              .body-composition-table.coach-table th:nth-child(10),
              .body-composition-table.coach-table td:nth-child(10) { min-width: 160px; }

              /* إظهار أزرار التمرير على الهاتف فقط */
              .scroll-btn { display: flex; }
            }

            @media (min-width: 577px) {
              .scroll-btn { display: none; }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default BodyCompositionCalculator;
