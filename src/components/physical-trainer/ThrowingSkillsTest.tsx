import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useThrowingSkillsTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface AthleteThrowingData {
  id: number;
  athleteId?: string;
  name: string;
  category: string;
  ageGroup: string;
  age: number;
  // ايبون سيوناجي
  ipponSeoi10s: number;
  ipponSeoiEval10s: number;
  ipponSeoi20s: number;
  ipponSeoiEval20s: number;
  ipponSeoi30s: number;
  ipponSeoiEval30s: number;
  // مورتيه-سيوناجي
  moroteSeoi10s: number;
  moroteSeoiEval10s: number;
  moroteSeoi20s: number;
  moroteSeoiEval20s: number;
  moroteSeoi30s: number;
  moroteSeoiEval30s: number;
  // أو-أوتشي-جاري
  oUchiGari10s: number;
  oUchiGariEval10s: number;
  oUchiGari20s: number;
  oUchiGariEval20s: number;
  oUchiGari30s: number;
  oUchiGariEval30s: number;
  // كو-أوتشي-جاري
  koUchiGari10s: number;
  koUchiGariEval10s: number;
  koUchiGari20s: number;
  koUchiGariEval20s: number;
  koUchiGari30s: number;
  koUchiGariEval30s: number;
}

interface ThrowingSkillsTestProps {
  clubId: string;
}

const ThrowingSkillsTest: React.FC<ThrowingSkillsTestProps> = ({ clubId }) => {
  // حساب التقييم بناءً على العمر والنتيجة
  const calculateEvaluation = (age: number, result: number, timeInterval: '10s' | '20s' | '30s'): number => {
    if (result === 0 || age === 0) return 0;

    let maxValue = 0;
    
    // تحديد القيم القصوى بناءً على العمر والفترة الزمنية
    if (age >= 8 && age <= 12) {
      switch (timeInterval) {
        case '10s': maxValue = 6; break;
        case '20s': maxValue = 16; break;
        case '30s': maxValue = 24; break;
      }
    } else if (age >= 13 && age <= 16) {
      switch (timeInterval) {
        case '10s': maxValue = 8; break;
        case '20s': maxValue = 16; break;
        case '30s': maxValue = 24; break;
      }
    } else if (age >= 17) {
      switch (timeInterval) {
        case '10s': maxValue = 9; break;
        case '20s': maxValue = 18; break;
        case '30s': maxValue = 24; break;
      }
    }

    // حساب النسبة المئوية (الحد الأقصى 100%)
    const percentage = Math.min(100, (result * 100) / maxValue);
    return Math.round(percentage * 100) / 100; // تقريب لرقمين عشريين
  };

  // تحديد الفئة العمرية
  const getAgeGroup = (age: number): string => {
    if (age >= 8 && age <= 12) return '8-12 سنة';
    if (age >= 13 && age <= 16) return '13-16 سنة';
    if (age >= 17) return '17+ سنة';
    return 'غير محدد';
  };

  // حساب العمر من تاريخ الميلاد بدقة (يوم/شهر/سنة)
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
  const initializeAthletes = (): AthleteThrowingData[] => {
    const athletes: AthleteThrowingData[] = [];
    
    for (let i = 1; i <= 8; i++) {
      if (i === 1) {
        // الصف الأول مع بيانات مثال
        athletes.push({
          id: i,
          name: '',
          category: '',
          ageGroup: '13-16 سنة',
          age: 15,
          // ايبون سيوناجي
          ipponSeoi10s: 6,
          ipponSeoiEval10s: 75,
          ipponSeoi20s: 12,
          ipponSeoiEval20s: 75,
          ipponSeoi30s: 18,
          ipponSeoiEval30s: 75,
          // مورتيه-سيوناجي
          moroteSeoi10s: 6,
          moroteSeoiEval10s: 75,
          moroteSeoi20s: 12,
          moroteSeoiEval20s: 75,
          moroteSeoi30s: 18,
          moroteSeoiEval30s: 75,
          // أو-أوتشي-جاري
          oUchiGari10s: 6,
          oUchiGariEval10s: 75,
          oUchiGari20s: 12,
          oUchiGariEval20s: 75,
          oUchiGari30s: 18,
          oUchiGariEval30s: 75,
          // كو-أوتشي-جاري
          koUchiGari10s: 6,
          koUchiGariEval10s: 75,
          koUchiGari20s: 12,
          koUchiGariEval20s: 75,
          koUchiGari30s: 18,
          koUchiGariEval30s: 75
        });
      } else {
        athletes.push({
          id: i,
          name: '',
          category: '',
          ageGroup: '',
          age: 0,
          // ايبون سيوناجي
          ipponSeoi10s: 0,
          ipponSeoiEval10s: 0,
          ipponSeoi20s: 0,
          ipponSeoiEval20s: 0,
          ipponSeoi30s: 0,
          ipponSeoiEval30s: 0,
          // مورتيه-سيوناجي
          moroteSeoi10s: 0,
          moroteSeoiEval10s: 0,
          moroteSeoi20s: 0,
          moroteSeoiEval20s: 0,
          moroteSeoi30s: 0,
          moroteSeoiEval30s: 0,
          // أو-أوتشي-جاري
          oUchiGari10s: 0,
          oUchiGariEval10s: 0,
          oUchiGari20s: 0,
          oUchiGariEval20s: 0,
          oUchiGari30s: 0,
          oUchiGariEval30s: 0,
          // كو-أوتشي-جاري
          koUchiGari10s: 0,
          koUchiGariEval10s: 0,
          koUchiGari20s: 0,
          koUchiGariEval20s: 0,
          koUchiGari30s: 0,
          koUchiGariEval30s: 0
        });
      }
    }
    return athletes;
  };

  const { data: firestoreData, saveData } = useThrowingSkillsTest(clubId);

  const [athletes, setAthletes] = useState<AthleteThrowingData[]>(initializeAthletes());
  const [saving, setSaving] = useState(false);
  const { athletes: clubAthletes } = useClubAthletes(clubId);

  const [showAlert, setShowAlert] = useState(false);

  // Load data from Firestore when available
  useEffect(() => {
    if (firestoreData.length > 0) {
      setAthletes(firestoreData);
    } else if (clubAthletes.length > 0) {
      // Initialize athletes from club data if no firestore data
      const initializedAthletes = clubAthletes.map((athlete, index) => ({
        id: index + 1,
        athleteId: athlete.id,
        name: athlete.fullNameAr || athlete.fullNameEn,
        category: getCategoryByDOBToday(athlete.dateOfBirth)?.nameAr || '',
        ageGroup: getAgeGroup(calcAgeFromDob(athlete.dateOfBirth)),
        age: calcAgeFromDob(athlete.dateOfBirth),
        ipponSeoi10s: 0,
        ipponSeoiEval10s: 0,
        ipponSeoi20s: 0,
        ipponSeoiEval20s: 0,
        ipponSeoi30s: 0,
        ipponSeoiEval30s: 0,
        moroteSeoi10s: 0,
        moroteSeoiEval10s: 0,
        moroteSeoi20s: 0,
        moroteSeoiEval20s: 0,
        moroteSeoi30s: 0,
        moroteSeoiEval30s: 0,
        oUchiGari10s: 0,
        oUchiGariEval10s: 0,
        oUchiGari20s: 0,
        oUchiGariEval20s: 0,
        oUchiGari30s: 0,
        oUchiGariEval30s: 0,
        koUchiGari10s: 0,
        koUchiGariEval10s: 0,
        koUchiGari20s: 0,
        koUchiGariEval20s: 0,
        koUchiGari30s: 0,
        koUchiGariEval30s: 0,
      }));
      setAthletes(initializedAthletes);
    }
  }, [firestoreData, clubAthletes]);

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteThrowingData, value: any) => {
    setAthletes(prev => prev.map(athlete => {
      if (athlete.id === id) {
        const updatedAthlete = { ...athlete, [field]: value };
        
        // إذا تم تحديث العمر، نحدث الفئة العمرية والتقييمات
        if (field === 'age') {
          updatedAthlete.ageGroup = getAgeGroup(value);
          // تحديث جميع التقييمات
          updatedAthlete.ipponSeoiEval10s = calculateEvaluation(value, updatedAthlete.ipponSeoi10s, '10s');
          updatedAthlete.ipponSeoiEval20s = calculateEvaluation(value, updatedAthlete.ipponSeoi20s, '20s');
          updatedAthlete.ipponSeoiEval30s = calculateEvaluation(value, updatedAthlete.ipponSeoi30s, '30s');
          
          updatedAthlete.moroteSeoiEval10s = calculateEvaluation(value, updatedAthlete.moroteSeoi10s, '10s');
          updatedAthlete.moroteSeoiEval20s = calculateEvaluation(value, updatedAthlete.moroteSeoi20s, '20s');
          updatedAthlete.moroteSeoiEval30s = calculateEvaluation(value, updatedAthlete.moroteSeoi30s, '30s');
          
          updatedAthlete.oUchiGariEval10s = calculateEvaluation(value, updatedAthlete.oUchiGari10s, '10s');
          updatedAthlete.oUchiGariEval20s = calculateEvaluation(value, updatedAthlete.oUchiGari20s, '20s');
          updatedAthlete.oUchiGariEval30s = calculateEvaluation(value, updatedAthlete.oUchiGari30s, '30s');
          
          updatedAthlete.koUchiGariEval10s = calculateEvaluation(value, updatedAthlete.koUchiGari10s, '10s');
          updatedAthlete.koUchiGariEval20s = calculateEvaluation(value, updatedAthlete.koUchiGari20s, '20s');
          updatedAthlete.koUchiGariEval30s = calculateEvaluation(value, updatedAthlete.koUchiGari30s, '30s');
        }
        
        // تحديث التقييمات عند تغيير النتائج
        // ايبون سيوناجي
        if (field === 'ipponSeoi10s') {
          updatedAthlete.ipponSeoiEval10s = calculateEvaluation(updatedAthlete.age, value, '10s');
        }
        if (field === 'ipponSeoi20s') {
          updatedAthlete.ipponSeoiEval20s = calculateEvaluation(updatedAthlete.age, value, '20s');
        }
        if (field === 'ipponSeoi30s') {
          updatedAthlete.ipponSeoiEval30s = calculateEvaluation(updatedAthlete.age, value, '30s');
        }
        
        // مورتيه-سيوناجي
        if (field === 'moroteSeoi10s') {
          updatedAthlete.moroteSeoiEval10s = calculateEvaluation(updatedAthlete.age, value, '10s');
        }
        if (field === 'moroteSeoi20s') {
          updatedAthlete.moroteSeoiEval20s = calculateEvaluation(updatedAthlete.age, value, '20s');
        }
        if (field === 'moroteSeoi30s') {
          updatedAthlete.moroteSeoiEval30s = calculateEvaluation(updatedAthlete.age, value, '30s');
        }
        
        // أو-أوتشي-جاري
        if (field === 'oUchiGari10s') {
          updatedAthlete.oUchiGariEval10s = calculateEvaluation(updatedAthlete.age, value, '10s');
        }
        if (field === 'oUchiGari20s') {
          updatedAthlete.oUchiGariEval20s = calculateEvaluation(updatedAthlete.age, value, '20s');
        }
        if (field === 'oUchiGari30s') {
          updatedAthlete.oUchiGariEval30s = calculateEvaluation(updatedAthlete.age, value, '30s');
        }
        
        // كو-أوتشي-جاري
        if (field === 'koUchiGari10s') {
          updatedAthlete.koUchiGariEval10s = calculateEvaluation(updatedAthlete.age, value, '10s');
        }
        if (field === 'koUchiGari20s') {
          updatedAthlete.koUchiGariEval20s = calculateEvaluation(updatedAthlete.age, value, '20s');
        }
        if (field === 'koUchiGari30s') {
          updatedAthlete.koUchiGariEval30s = calculateEvaluation(updatedAthlete.age, value, '30s');
        }
        
        return updatedAthlete;
      }
      return athlete;
    }));
  };

  // حفظ البيانات في Firestore
  const handleSaveData = async () => {
    setSaving(true);
    try {
      await saveData(athletes);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('Error saving throwing skills test:', err);
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
        <title>اختبار مهارات الرمي</title>
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
            font-size: 10px;
          }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; }
          @media print {
            body { margin: 0; }
            table { font-size: 9px; }
          }
        </style>
      </head>
      <body>
        <h2>اختبار مهارات الرمي</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="3">الاسم واللقب</th>
              <th rowspan="3">الصنف</th>
              <th rowspan="3">الفئة</th>
              <th rowspan="3">العمر</th>
              <th colspan="6">ايبون سيوناجي</th>
              <th colspan="6">مورتيه-سيوناجي</th>
              <th colspan="6">أو-أوتشي-جاري</th>
              <th colspan="6">كو-أوتشي-جاري</th>
            </tr>
            <tr>
              <th colspan="2">10ث</th>
              <th colspan="2">20ث</th>
              <th colspan="2">30ث</th>
              <th colspan="2">10ث</th>
              <th colspan="2">20ث</th>
              <th colspan="2">30ث</th>
              <th colspan="2">10ث</th>
              <th colspan="2">20ث</th>
              <th colspan="2">30ث</th>
              <th colspan="2">10ث</th>
              <th colspan="2">20ث</th>
              <th colspan="2">30ث</th>
            </tr>
            <tr>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
              <th>نتيجة</th><th>تقييم</th>
            </tr>
          </thead>
          <tbody>
            ${athletes.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.ageGroup || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.ipponSeoi10s || ''}</td>
                <td>${athlete.ipponSeoiEval10s || ''}%</td>
                <td>${athlete.ipponSeoi20s || ''}</td>
                <td>${athlete.ipponSeoiEval20s || ''}%</td>
                <td>${athlete.ipponSeoi30s || ''}</td>
                <td>${athlete.ipponSeoiEval30s || ''}%</td>
                <td>${athlete.moroteSeoi10s || ''}</td>
                <td>${athlete.moroteSeoiEval10s || ''}%</td>
                <td>${athlete.moroteSeoi20s || ''}</td>
                <td>${athlete.moroteSeoiEval20s || ''}%</td>
                <td>${athlete.moroteSeoi30s || ''}</td>
                <td>${athlete.moroteSeoiEval30s || ''}%</td>
                <td>${athlete.oUchiGari10s || ''}</td>
                <td>${athlete.oUchiGariEval10s || ''}%</td>
                <td>${athlete.oUchiGari20s || ''}</td>
                <td>${athlete.oUchiGariEval20s || ''}%</td>
                <td>${athlete.oUchiGari30s || ''}</td>
                <td>${athlete.oUchiGariEval30s || ''}%</td>
                <td>${athlete.koUchiGari10s || ''}</td>
                <td>${athlete.koUchiGariEval10s || ''}%</td>
                <td>${athlete.koUchiGari20s || ''}</td>
                <td>${athlete.koUchiGariEval20s || ''}%</td>
                <td>${athlete.koUchiGari30s || ''}</td>
                <td>${athlete.koUchiGariEval30s || ''}%</td>
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

  // إضافة صف جديد
  const addNewRow = () => {
    const newId = Math.max(...athletes.map(a => a.id)) + 1;
    const newAthlete: AthleteThrowingData = {
      id: newId,
      name: '',
      category: '',
      ageGroup: '',
      age: 0,
      // ايبون سيوناجي
      ipponSeoi10s: 0,
      ipponSeoiEval10s: 0,
      ipponSeoi20s: 0,
      ipponSeoiEval20s: 0,
      ipponSeoi30s: 0,
      ipponSeoiEval30s: 0,
      // مورتيه-سيوناجي
      moroteSeoi10s: 0,
      moroteSeoiEval10s: 0,
      moroteSeoi20s: 0,
      moroteSeoiEval20s: 0,
      moroteSeoi30s: 0,
      moroteSeoiEval30s: 0,
      // أو-أوتشي-جاري
      oUchiGari10s: 0,
      oUchiGariEval10s: 0,
      oUchiGari20s: 0,
      oUchiGariEval20s: 0,
      oUchiGari30s: 0,
      oUchiGariEval30s: 0,
      // كو-أوتشي-جاري
      koUchiGari10s: 0,
      koUchiGariEval10s: 0,
      koUchiGari20s: 0,
      koUchiGariEval20s: 0,
      koUchiGari30s: 0,
      koUchiGariEval30s: 0
    };
    setAthletes(prev => [...prev, newAthlete]);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-warning text-dark">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-hand-rock me-2"></i>
          اختبار مهارات الرمي
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {showAlert && (
          <Alert variant="success" className="text-center" dir="rtl">
            <i className="fas fa-check-circle me-2"></i>
            تم حفظ البيانات بنجاح!
          </Alert>
        )}

        {/* شرح الاختبار */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>
            معايير التقييم لمهارات الرمي:
          </h6>
          <ul className="mb-0">
            <li><strong>8-12 سنة:</strong> 10ث (6 حركات = 100%)، 20ث (16 حركة = 100%)، 30ث (24 حركة = 100%)</li>
            <li><strong>13-16 سنة:</strong> 10ث (8 حركات = 100%)، 20ث (16 حركة = 100%)، 30ث (24 حركة = 100%)</li>
            <li><strong>17+ سنة:</strong> 10ث (9 حركات = 100%)، 20ث (18 حركة = 100%)، 30ث (24 حركة = 100%)</li>
          </ul>
        </Alert>

        {/* أزرار التحكم */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex gap-2 flex-wrap justify-content-center">
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
              <Button variant="success" onClick={addNewRow}>
                <i className="fas fa-plus me-2"></i>
                إضافة صف
              </Button>
            </div>
          </Col>
        </Row>

        {/* الجدول */}
        <div className="table-responsive">
          <Table striped bordered hover className="text-center coach-table" style={{ fontSize: '0.85rem' }}>
            <thead className="table-dark">
              <tr>
                <th rowSpan={3} style={{ verticalAlign: 'middle', minWidth: '120px' }}>الاسم واللقب</th>
                <th rowSpan={3} style={{ verticalAlign: 'middle' }}>الصنف</th>
                <th rowSpan={3} style={{ verticalAlign: 'middle' }}>الفئة</th>
                <th rowSpan={3} style={{ verticalAlign: 'middle' }}>العمر</th>
                <th colSpan={6} className="bg-primary">ايبون سيوناجي</th>
                <th colSpan={6} className="bg-success">مورتيه-سيوناجي</th>
                <th colSpan={6} className="bg-warning text-dark">أو-أوتشي-جاري</th>
                <th colSpan={6} className="bg-info">كو-أوتشي-جاري</th>
                <th rowSpan={3} style={{ verticalAlign: 'middle' }}>إجراءات</th>
              </tr>
              <tr>
                <th colSpan={2} className="bg-primary">10ث</th>
                <th colSpan={2} className="bg-primary">20ث</th>
                <th colSpan={2} className="bg-primary">30ث</th>
                <th colSpan={2} className="bg-success">10ث</th>
                <th colSpan={2} className="bg-success">20ث</th>
                <th colSpan={2} className="bg-success">30ث</th>
                <th colSpan={2} className="bg-warning text-dark">10ث</th>
                <th colSpan={2} className="bg-warning text-dark">20ث</th>
                <th colSpan={2} className="bg-warning text-dark">30ث</th>
                <th colSpan={2} className="bg-info">10ث</th>
                <th colSpan={2} className="bg-info">20ث</th>
                <th colSpan={2} className="bg-info">30ث</th>
              </tr>
              <tr>
                {/* ايبون سيوناجي */}
                <th className="bg-primary" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-primary" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-primary" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-primary" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-primary" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-primary" style={{ minWidth: '60px' }}>تقييم</th>
                {/* مورتيه-سيوناجي */}
                <th className="bg-success" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-success" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-success" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-success" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-success" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-success" style={{ minWidth: '60px' }}>تقييم</th>
                {/* أو-أوتشي-جاري */}
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-warning text-dark" style={{ minWidth: '60px' }}>تقييم</th>
                {/* كو-أوتشي-جاري */}
                <th className="bg-info" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-info" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-info" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-info" style={{ minWidth: '60px' }}>تقييم</th>
                <th className="bg-info" style={{ minWidth: '60px' }}>نتيجة</th>
                <th className="bg-info" style={{ minWidth: '60px' }}>تقييم</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="align-middle">
                    <span>{athlete.name || ''}</span>
                  </td>
                  <td>
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const cat = getCategoryByDOBToday(roster?.dateOfBirth)?.nameAr || athlete.category;
                      return <span className="fw-semibold">{cat}</span>;
                    })()}
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={athlete.ageGroup}
                      readOnly
                      className="bg-light"
                      size="sm"
                    />
                  </td>
                  <td>
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === athlete.athleteId) || clubAthletes[athlete.id - 1];
                      const a = calcAgeFromDob(roster?.dateOfBirth);
                      return <span className="fw-semibold">{a || ''}</span>;
                    })()}
                  </td>
                  
                  {/* ايبون سيوناجي */}
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.ipponSeoi10s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'ipponSeoi10s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-primary">{athlete.ipponSeoiEval10s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.ipponSeoi20s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'ipponSeoi20s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-primary">{athlete.ipponSeoiEval20s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.ipponSeoi30s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'ipponSeoi30s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-primary">{athlete.ipponSeoiEval30s}%</strong>
                  </td>
                  
                  {/* مورتيه-سيوناجي */}
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.moroteSeoi10s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'moroteSeoi10s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{athlete.moroteSeoiEval10s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.moroteSeoi20s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'moroteSeoi20s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{athlete.moroteSeoiEval20s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.moroteSeoi30s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'moroteSeoi30s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{athlete.moroteSeoiEval30s}%</strong>
                  </td>
                  
                  {/* أو-أوتشي-جاري */}
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.oUchiGari10s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'oUchiGari10s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-warning">{athlete.oUchiGariEval10s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.oUchiGari20s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'oUchiGari20s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-warning">{athlete.oUchiGariEval20s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.oUchiGari30s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'oUchiGari30s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-warning">{athlete.oUchiGariEval30s}%</strong>
                  </td>
                  
                  {/* كو-أوتشي-جاري */}
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.koUchiGari10s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'koUchiGari10s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-info">{athlete.koUchiGariEval10s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.koUchiGari20s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'koUchiGari20s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-info">{athlete.koUchiGariEval20s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={athlete.koUchiGari30s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'koUchiGari30s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-info">{athlete.koUchiGariEval30s}%</strong>
                  </td>
                  
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setAthletes(prev => prev.filter(a => a.id !== athlete.id))}
                      disabled={athletes.length <= 1}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ThrowingSkillsTest;
