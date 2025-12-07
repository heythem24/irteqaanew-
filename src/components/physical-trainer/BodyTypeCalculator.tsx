import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useBodyTypeCalculator } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';

interface AthleteData {
  id: number;
  athleteId?: string;
  name: string;
  licenseNumber: string;
  age: number;
  height: number; // بالسنتيمتر
  weight: number; // بالكيلوغرام
  heightInches: number; // بالبوصة
  weightPounds: number; // بالرطل
  bodyTypeIndex: number;
  bodyType: string;
}

interface BodyTypeCalculatorProps {
  clubId: string;
}

const BodyTypeCalculator: React.FC<BodyTypeCalculatorProps> = ({ clubId }) => {
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
  // تحويل السنتيمتر إلى بوصة
  const cmToInches = (cm: number): number => {
    return cm / 2.54;
  };

  // تحويل الكيلوغرام إلى رطل
  const kgToPounds = (kg: number): number => {
    return kg * 2.20462; // 1 كيلو = 2.20462 رطل (أكثر دقة من 453 غرام للرطل)
  };

  // حساب مؤشر نمط الجسم (الوزن بالرطل ÷ البوصة)
  const calculateBodyTypeIndex = (heightInches: number, weightPounds: number): number => {
    if (heightInches === 0 || weightPounds === 0) return 0;
    return weightPounds / heightInches;
  };

  // تحديد نمط الجسم
  const getBodyType = (index: number): string => {
    if (index === 0) return '';
    if (index < 2) return 'نحيف';
    if (index >= 2 && index <= 2.8) return 'متوسط';
    return 'ممتلئ';
  };

  const [athletes] = useState<AthleteData[]>([
    {
      id: 1,
      name: '',
      licenseNumber: '',
      age: 0,
      height: 183,
      weight: 91.30,
      heightInches: 72.05,
      weightPounds: 201.55,
      bodyTypeIndex: 2.80, // سيتم إعادة حسابها تلقائياً
      bodyType: 'متوسط'
    },
    {
      id: 2,
      name: '',
      licenseNumber: '',
      age: 0,
      height: 175,
      weight: 70.00,
      heightInches: 68.90,
      weightPounds: 154.53,
      bodyTypeIndex: 2.24, // سيتم إعادة حسابها تلقائياً
      bodyType: 'متوسط'
    },
    {
      id: 3,
      name: '',
      licenseNumber: '',
      age: 0,
      height: 200,
      weight: 100.00,
      heightInches: 78.74,
      weightPounds: 220.75,
      bodyTypeIndex: 2.80, // سيتم إعادة حسابها تلقائياً
      bodyType: 'متوسط'
    }
  ]);

  // إضافة صفوف فارغة للوصول إلى 9 صفوف
  const initializeAthletes = () => {
    const initialAthletes: AthleteData[] = [];
    for (let i = 1; i <= 9; i++) {
      if (i <= 3) {
        // إعادة حساب القيم بالمعادلة الصحيحة
        const athlete = { ...athletes[i - 1] };
        athlete.bodyTypeIndex = Number(calculateBodyTypeIndex(athlete.heightInches, athlete.weightPounds).toFixed(2));
        athlete.bodyType = getBodyType(athlete.bodyTypeIndex);
        initialAthletes.push(athlete);
      } else {
        initialAthletes.push({
          id: i,
          name: '',
          licenseNumber: '',
          age: 0,
          height: 0,
          weight: 0,
          heightInches: 0,
          weightPounds: 0,
          bodyTypeIndex: 0,
          bodyType: ''
        });
      }
    }
    return initialAthletes;
  };

  const {
    data: athletesList,
    loading,
    saveData
  } = useBodyTypeCalculator(clubId);
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  
  const [localAthletes, setLocalAthletes] = useState<AthleteData[]>(athletesList.length > 0 ? athletesList : initializeAthletes());
  
  const [saving, setSaving] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (amount: number) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Update local state when Firestore data changes - MOVED BEFORE CONDITIONAL RETURN
  React.useEffect(() => {
    if (athletesList.length > 0) {
      setLocalAthletes(athletesList);
    }
  }, [athletesList]);

  // املأ الصفوف تلقائياً بأسماء وأعمار الرياضيين من الروستر عند التوفر ولمرة واحدة
  useEffect(() => {
    if (!clubAthletes.length) return;
    setLocalAthletes(prev => {
      const allEmpty = prev.every(a => !a.name);
      if (!allEmpty) return prev;
      let list = [...prev];
      while (list.length < clubAthletes.length) {
        list.push({
          id: list.length + 1,
          name: '',
          licenseNumber: '',
          age: 0,
          height: 0,
          weight: 0,
          heightInches: 0,
          weightPounds: 0,
          bodyTypeIndex: 0,
          bodyType: ''
        });
      }
      list = list.map((row, idx) => {
        const a = clubAthletes[idx];
        if (!a) return row;
        const age = calcAgeFromDob(a.dateOfBirth);
        // اجلب الطول/الوزن من بيانات الرياضي إن وُجدت، ثم أعد حساب القيم المشتقة
        const heightCm = typeof a.height === 'number' && a.height > 0 ? a.height : row.height;
        const weightKg = typeof a.weight === 'number' && a.weight > 0 ? a.weight : row.weight;
        const heightIn = heightCm > 0 ? Number(cmToInches(heightCm).toFixed(2)) : row.heightInches;
        const weightLb = weightKg > 0 ? Number(kgToPounds(weightKg).toFixed(2)) : row.weightPounds;
        const bodyIdx = heightIn > 0 && weightLb > 0 ? Number(calculateBodyTypeIndex(heightIn, weightLb).toFixed(2)) : row.bodyTypeIndex;
        const bodyTp = bodyIdx > 0 ? getBodyType(bodyIdx) : row.bodyType;
        return {
          ...row,
          athleteId: row.athleteId || a.id,
          name: a.fullNameAr || a.fullNameEn,
          age: age > 0 ? age : row.age,
          height: heightCm,
          weight: weightKg,
          heightInches: heightIn,
          weightPounds: weightLb,
          bodyTypeIndex: bodyIdx,
          bodyType: bodyTp
        };
      });
      return list;
    });
  }, [clubAthletes]);

  // معالجة حالة التحميل - MOVED AFTER ALL HOOKS
  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h4 className="mb-0 text-center" dir="rtl">
            <i className="fas fa-calculator me-2"></i>
            حاسبة نوع الجسم
          </h4>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">جار التحميل...</span>
          </Spinner>
          <p className="mt-2" dir="rtl">جار تحميل البيانات...</p>
        </Card.Body>
      </Card>
    );
  }

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteData, value: string | number) => {
    setLocalAthletes(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updated = { ...athlete, [field]: value };
        
        // إعادة حساب القيم عند تغيير الطول أو الوزن
        if (field === 'height' || field === 'weight') {
          const height = field === 'height' ? Number(value) : updated.height;
          const weight = field === 'weight' ? Number(value) : updated.weight;
          
          if (height > 0 && weight > 0) {
            updated.heightInches = Number(cmToInches(height).toFixed(2));
            updated.weightPounds = Number(kgToPounds(weight).toFixed(2));
            updated.bodyTypeIndex = Number(calculateBodyTypeIndex(updated.heightInches, updated.weightPounds).toFixed(2));
            updated.bodyType = getBodyType(updated.bodyTypeIndex);
          }
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
      await saveData(localAthletes);
    } catch (err) {
      console.error('Error saving data:', err);
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
        <title>حساب نمط الجسم</title>
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
        <h2>حساب نمط الجسم</h2>
        <table>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الإسم واللقب</th>
              <th>السن</th>
              <th>الوزن كغ</th>
              <th>الوزن بالرطل</th>
              <th>الطول/ سم</th>
              <th>البوصة</th>
              <th>رطل\البوصة</th>
              <th>نمط الجسم</th>
            </tr>
          </thead>
          <tbody>
            ${localAthletes.map((athlete) => `
              <tr>
                <td>${athlete.id}</td>
                <td>${athlete.name || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.weight || ''}</td>
                <td>${athlete.weightPounds > 0 ? athlete.weightPounds.toFixed(2) : ''}</td>
                <td>${athlete.height || ''}</td>
                <td>${athlete.heightInches > 0 ? athlete.heightInches.toFixed(2) : ''}</td>
                <td>${athlete.bodyTypeIndex > 0 ? athlete.bodyTypeIndex.toFixed(2) : ''}</td>
                <td>${athlete.bodyType || ''}</td>
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
          <i className="fas fa-user-md me-2"></i>
          حساب نمط الجسم
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات التحويل */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>معادلات التحويل:</strong>
              <ul className="mb-0 mt-2">
                <li>الرطل = 453 غرام</li>
                <li>البوصة = 2.54 سم</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>تصنيف نمط الجسم:</strong>
              <ul className="mb-0 mt-2">
                <li>&lt; 2: جسم نحيف</li>
                <li>2 إلى 2.8: جسم متوسط</li>
                <li>&gt; 2.8: جسم ممتلئ</li>
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
            <Table bordered className="body-type-table coach-table" dir="rtl">
              <thead>
                <tr className="table-primary">
                  <th className="text-center">الرقم</th>
                  <th className="text-center">الإسم واللقب</th>
                  <th className="text-center">السن</th>
                  <th className="text-center">الوزن كغ</th>
                  <th className="text-center">الوزن بالرطل</th>
                  <th className="text-center">الطول/ سم</th>
                  <th className="text-center">البوصة</th>
                  <th className="text-center">رطل\\البوصة</th>
                  <th className="text-center">نمط الجسم</th>
                </tr>
              </thead>
              <tbody>
                {localAthletes.map((athlete) => (
                  <tr key={athlete.id}>
                    <td className="text-center align-middle">
                      <strong>{athlete.id}</strong>
                    </td>
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
                    <td className="text-center align-middle">
                      <span className="fw-bold text-primary">
                        {athlete.weightPounds > 0 ? athlete.weightPounds.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center">
                      <Form.Control
                        type="number"
                        value={athlete.height || ''}
                        onChange={(e) => updateAthlete(athlete.id, 'height', Number(e.target.value))}
                        className="text-center"
                        placeholder="الطول"
                        min="0"
                      />
                    </td>
                    <td className="text-center align-middle">
                      <span className="fw-bold text-primary">
                        {athlete.heightInches > 0 ? athlete.heightInches.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span className="fw-bold text-success">
                        {athlete.bodyTypeIndex > 0 ? athlete.bodyTypeIndex.toFixed(2) : ''}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      <span className={`fw-bold ${
                        athlete.bodyType === 'نحيف' ? 'text-info' :
                        athlete.bodyType === 'متوسط' ? 'text-success' :
                        athlete.bodyType === 'ممتلئ' ? 'text-warning' : ''
                      }`}>
                        {athlete.bodyType}
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
            .body-type-table {
              font-size: 14px;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .body-type-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 20px !important;
              border: 2px solid #1976d2;
              white-space: nowrap !important;
              min-width: 130px !important;
              overflow: visible !important;
              text-overflow: unset !important;
            }
            
            .body-type-table td {
              vertical-align: middle !important;
              padding: 10px 18px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 120px !important;
            }
            
            .body-type-table input {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px 10px;
              font-size: 13px;
              min-width: 100px;
            }
            
            .body-type-table input:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            /* حاوية الكاروسيل */
            .scroll-carousel {
              position: relative;
            }
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
              .body-type-table.coach-table {
                min-width: 980px; /* إجبار التمرير الأفقي بدل تكسير الأحرف */
                font-size: 12px;
              }

              /* اجعل أغلب الأعمدة لا تلتف لتجنب نزول الحروف تحت بعضها */
              .body-type-table.coach-table th,
              .body-type-table.coach-table td {
                padding: 0.45rem;
                white-space: nowrap;
              }

              /* اسم الرياضي يسمح له بالالتفاف الطبيعي */
              .body-type-table.coach-table th:nth-child(2),
              .body-type-table.coach-table td:nth-child(2) {
                min-width: 200px;
                white-space: normal;
              }

              /* الأعمدة الرقمية تعطيها عرضاً أدنى مناسباً */
              .body-type-table.coach-table th:nth-child(3),
              .body-type-table.coach-table td:nth-child(3) { min-width: 120px; }
              .body-type-table.coach-table th:nth-child(4),
              .body-type-table.coach-table td:nth-child(4) { min-width: 130px; }
              .body-type-table.coach-table th:nth-child(5),
              .body-type-table.coach-table td:nth-child(5) { min-width: 150px; }
              .body-type-table.coach-table th:nth-child(6),
              .body-type-table.coach-table td:nth-child(6) { min-width: 130px; }
              .body-type-table.coach-table th:nth-child(7),
              .body-type-table.coach-table td:nth-child(7) { min-width: 150px; }
              .body-type-table.coach-table th:nth-child(8),
              .body-type-table.coach-table td:nth-child(8) { min-width: 150px; }
              .body-type-table.coach-table th:nth-child(9),
              .body-type-table.coach-table td:nth-child(9) { min-width: 150px; }

              /* إظهار أزرار التمرير على الهاتف فقط */
              .scroll-btn { display: flex; }
            }

            @media (min-width: 577px) {
              /* إخفاء الأزرار على الشاشات المتوسطة والكبيرة */
              .scroll-btn { display: none; }
            }
          `}
        </style>
      </Card.Body>
    </Card>
  );
};

export default BodyTypeCalculator;
