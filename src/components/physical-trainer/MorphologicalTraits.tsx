import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useMorphologicalTraits } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  age: number;
  bodyType: string; // نوع الجسم
  stature: string; // شكل القامة
  gripStrength: string; // قوة القبضة
  physicalFlexibility: string; // المرونة البدنية
  reactionSpeed: string; // سرعة رد الفعل
  enduranceStrength: string; // قوة التحمل
}

interface MorphologicalTraitsProps {
  clubId: string;
}

const MorphologicalTraits: React.FC<MorphologicalTraitsProps> = ({ clubId }) => {
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
  const initializeAthletes = (): AthleteData[] => {
    const athletes: AthleteData[] = [];
    
    for (let i = 1; i <= 8; i++) {
      athletes.push({
        id: i,
        name: '',
        category: '',
        age: 0,
        bodyType: '',
        stature: '',
        gripStrength: '',
        physicalFlexibility: '',
        reactionSpeed: '',
        enduranceStrength: ''
      });
    }
    
    return athletes;
  };

  const { data: firestoreData, saveData } = useMorphologicalTraits(clubId);
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  const [athletesList, setAthletesList] = useState<AthleteData[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletesList(firestoreData);
    }
  }, [firestoreData]);

  // Auto-fill roster names and ages once when club athletes load
  useEffect(() => {
    if (!clubAthletes || clubAthletes.length === 0) return;
    setAthletesList(prev => {
      const allEmpty = prev.every(a => !a.name);
      if (!allEmpty) return prev;
      let list = [...prev];
      // Ensure enough rows for all club athletes
      while (list.length < clubAthletes.length) {
        list.push({
          id: list.length + 1,
          name: '',
          category: '',
          age: 0,
          bodyType: '',
          stature: '',
          gripStrength: '',
          physicalFlexibility: '',
          reactionSpeed: '',
          enduranceStrength: ''
        });
      }
      // Map roster into rows
      list = list.map((row, idx) => {
        const a = clubAthletes[idx];
        if (!a) return row;
        const age = calcAgeFromDob(a.dateOfBirth);
        return {
          ...row,
          athleteId: row.athleteId || a.id,
          name: a.fullNameAr || a.fullNameEn,
          age: age > 0 ? age : row.age,
          category: getCategoryByDOBToday(a.dateOfBirth)?.nameAr || row.category,
        };
      });
      return list;
    });
  }, [clubAthletes]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteData, value: string | number) => {
    setAthletesList(prev => prev.map(athlete => {
      if (athlete.id === id) {
        return { ...athlete, [field]: value };
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
      console.error('Error saving morphological traits:', err);
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
        <title>الصفات المورفولوجية</title>
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
        <h2>الصفات المورفولوجية</h2>
        <table>
          <thead>
            <tr>
              <th>الإسم واللقب</th>
              <th>الصنف</th>
              <th>الفئة</th>
              <th>نوع الجسم</th>
              <th>شكل القامة</th>
              <th>قوة القبضة</th>
              <th>المرونة البدنية</th>
              <th>سرعة رد الفعل</th>
              <th>قوة التحمل</th>
            </tr>
          </thead>
          <tbody>
            ${athletesList.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.bodyType || ''}</td>
                <td>${athlete.stature || ''}</td>
                <td>${athlete.gripStrength || ''}</td>
                <td>${athlete.physicalFlexibility || ''}</td>
                <td>${athlete.reactionSpeed || ''}</td>
                <td>${athlete.enduranceStrength || ''}</td>
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
          <i className="fas fa-ruler me-2"></i>
          الصفات المورفولوجية
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* معلومات إرشادية */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <Row>
            <Col md={6}>
              <strong>الصفات المورفولوجية تشمل:</strong>
              <ul className="mb-0 mt-2">
                <li>نوع الجسم (إكتومورف، ميزومورف، إندومورف)</li>
                <li>شكل القامة (طويل، متوسط، قصير)</li>
                <li>قوة القبضة (قوية، متوسطة، ضعيفة)</li>
              </ul>
            </Col>
            <Col md={6}>
              <strong>الصفات البدنية تشمل:</strong>
              <ul className="mb-0 mt-2">
                <li>المرونة البدنية (ممتازة، جيدة، متوسطة، ضعيفة)</li>
                <li>سرعة رد الفعل (سريع، متوسط، بطيء)</li>
                <li>قوة التحمل (عالية، متوسطة، منخفضة)</li>
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
          <Table bordered className="morphological-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th className="text-center">الإسم واللقب</th>
                <th className="text-center">الصنف</th>
                <th className="text-center">الفئة</th>
                <th className="text-center">نوع الجسم</th>
                <th className="text-center">شكل القامة</th>
                <th className="text-center">قوة القبضة</th>
                <th className="text-center">المرونة البدنية</th>
                <th className="text-center">سرعة رد الفعل</th>
                <th className="text-center">قوة التحمل</th>
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
                    <Form.Select
                      value={athlete.bodyType}
                      onChange={(e) => updateAthlete(athlete.id, 'bodyType', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر نوع الجسم</option>
                      <option value="إكتومورف">إكتومورف (نحيف)</option>
                      <option value="ميزومورف">ميزومورف (عضلي)</option>
                      <option value="إندومورف">إندومورف (ممتلئ)</option>
                      <option value="مختلط">مختلط</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.stature}
                      onChange={(e) => updateAthlete(athlete.id, 'stature', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر شكل القامة</option>
                      <option value="طويل">طويل</option>
                      <option value="متوسط">متوسط</option>
                      <option value="قصير">قصير</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.gripStrength}
                      onChange={(e) => updateAthlete(athlete.id, 'gripStrength', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر قوة القبضة</option>
                      <option value="قوية جداً">قوية جداً</option>
                      <option value="قوية">قوية</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="ضعيفة">ضعيفة</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.physicalFlexibility}
                      onChange={(e) => updateAthlete(athlete.id, 'physicalFlexibility', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر المرونة البدنية</option>
                      <option value="ممتازة">ممتازة</option>
                      <option value="جيدة">جيدة</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="ضعيفة">ضعيفة</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.reactionSpeed}
                      onChange={(e) => updateAthlete(athlete.id, 'reactionSpeed', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر سرعة رد الفعل</option>
                      <option value="سريع جداً">سريع جداً</option>
                      <option value="سريع">سريع</option>
                      <option value="متوسط">متوسط</option>
                      <option value="بطيء">بطيء</option>
                    </Form.Select>
                  </td>
                  <td className="text-center">
                    <Form.Select
                      value={athlete.enduranceStrength}
                      onChange={(e) => updateAthlete(athlete.id, 'enduranceStrength', e.target.value)}
                      className="text-center"
                      size="sm"
                    >
                      <option value="">اختر قوة التحمل</option>
                      <option value="عالية جداً">عالية جداً</option>
                      <option value="عالية">عالية</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="منخفضة">منخفضة</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <style>
          {`
            .morphological-table {
              font-size: 12px;
              table-layout: auto !important;
              border-collapse: separate !important;
              border-spacing: 2px !important;
            }
            
            .morphological-table th {
              background-color: #e3f2fd;
              font-weight: bold;
              text-align: center;
              vertical-align: middle !important;
              padding: 12px 20px !important;
              border: 2px solid #1976d2;
              white-space: nowrap !important;
              min-width: 150px !important;
            }
            
            .morphological-table td {
              vertical-align: middle !important;
              padding: 10px 18px !important;
              border: 1px solid #ddd;
              white-space: nowrap !important;
              min-width: 140px !important;
            }
            
            .morphological-table input,
            .morphological-table select {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 6px 10px;
              font-size: 12px;
              width: auto;
              min-width: 120px;
            }
            
            .morphological-table input:focus,
            .morphological-table select:focus {
              border-color: #007bff;
              box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
            }

            .morphological-table select {
              cursor: pointer;
            }

            @media print {
              .btn, .alert {
                display: none !important;
              }
              
              .morphological-table {
                font-size: 10px;
              }
              
              .morphological-table th,
              .morphological-table td {
                padding: 3px;
              }
              
              .morphological-table input,
              .morphological-table select {
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

export default MorphologicalTraits;
