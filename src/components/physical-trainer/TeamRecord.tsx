import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useTeamRecord } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';

interface AthleteRecord {
  id: number;
  name: string;
  // الذراعين
  armsRight: number;
  armsLeft: number;
  armsGrade: number;
  // الجذع
  trunkRight: number;
  trunkLeft: number;
  trunkGrade: number;
  // الرجلين
  legsRight: number;
  legsLeft: number;
  legsGrade: number;
  // التحمل العضلي
  enduranceRight: number;
  enduranceLeft: number;
  enduranceGrade: number;
  // 1RM
  oneRMRight: number;
  oneRMLeft: number;
  oneRMGrade: number;
  // مستوى الرياضي
  totalSum: number;
  totalGrade: number;
  standard: string;
}

interface TeamRecordProps {
  clubId: string;
}

const TeamRecord: React.FC<TeamRecordProps> = ({ clubId }) => {
  const {
    data: firestoreAthletes,
    saveData
  } = useTeamRecord(clubId);

  const { athletes: clubAthletes, loading: loadingAthletes } = useClubAthletes(clubId);

  const [athletes, setAthletes] = useState<AthleteRecord[]>([
    {
      id: 1,
      name: '',
      armsRight: 0, armsLeft: 0, armsGrade: 0,
      trunkRight: 0, trunkLeft: 0, trunkGrade: 0,
      legsRight: 0, legsLeft: 0, legsGrade: 0,
      enduranceRight: 0, enduranceLeft: 0, enduranceGrade: 0,
      oneRMRight: 0, oneRMLeft: 0, oneRMGrade: 0,
      totalSum: 0, totalGrade: 0, standard: ''
    }
  ]);

  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load data from Firestore when available
  useEffect(() => {
    if (firestoreAthletes.length > 0) {
      setAthletes(firestoreAthletes);
    } else if (clubAthletes.length > 0) {
      // Initialize athletes from club data if no firestore data
      const initializedAthletes = clubAthletes.map((athlete, index) => ({
        id: index + 1,
        name: athlete.fullNameAr || athlete.fullNameEn,
        armsRight: 0, armsLeft: 0, armsGrade: 0,
        trunkRight: 0, trunkLeft: 0, trunkGrade: 0,
        legsRight: 0, legsLeft: 0, legsGrade: 0,
        enduranceRight: 0, enduranceLeft: 0, enduranceGrade: 0,
        oneRMRight: 0, oneRMLeft: 0, oneRMGrade: 0,
        totalSum: 0, totalGrade: 0, standard: ''
      }));
      setAthletes(initializedAthletes);
    }
  }, [firestoreAthletes, clubAthletes]);

  // حساب المجموع (قيمة اليمين + قيمة اليسار)
  const calculateSum = (right: number, left: number): number => {
    // التأكد من أن كل قيمة لا تتعدى 50
    const rightValue = Math.min(right, 50);
    const leftValue = Math.min(left, 50);
    return rightValue + leftValue;
  };



  // حساب المعامل: 100 / أعلى مجموع
  const calculateCoefficient = (maxSum: number): number => {
    return maxSum > 0 ? 100 / maxSum : 0;
  };



  // حساب الدرجة مع تمرير قائمة الرياضيين المحدثة
  const calculateGradeWithAthletes = (right: number, left: number, category: 'arms' | 'trunk' | 'legs' | 'endurance' | 'oneRM', athletesList: AthleteRecord[]): number => {
    const sum = calculateSum(right, left);
    const maxSum = findMaxSumWithAthletes(category, athletesList);
    const coefficient = calculateCoefficient(maxSum);
    return Math.round(sum * coefficient * 100) / 100; // تقريب لرقمين عشريين
  };

  // إيجاد أعلى مجموع مع تمرير قائمة الرياضيين
  const findMaxSumWithAthletes = (category: 'arms' | 'trunk' | 'legs' | 'endurance' | 'oneRM', athletesList: AthleteRecord[]): number => {
    let maxSum = 0;
    athletesList.forEach(athlete => {
      let sum = 0;
      switch (category) {
        case 'arms':
          sum = calculateSum(athlete.armsRight, athlete.armsLeft);
          break;
        case 'trunk':
          sum = calculateSum(athlete.trunkRight, athlete.trunkLeft);
          break;
        case 'legs':
          sum = calculateSum(athlete.legsRight, athlete.legsLeft);
          break;
        case 'endurance':
          sum = calculateSum(athlete.enduranceRight, athlete.enduranceLeft);
          break;
        case 'oneRM':
          sum = calculateSum(athlete.oneRMRight, athlete.oneRMLeft);
          break;
      }
      if (sum > maxSum) {
        maxSum = sum;
      }
    });
    return maxSum;
  };

  // تحديد المعيار بناءً على الدرجة الإجمالية
  const getStandard = (totalGrade: number): string => {
    if (totalGrade >= 90) return 'ممتاز';
    if (totalGrade >= 80) return 'جيد جداً';
    if (totalGrade >= 70) return 'جيد';
    if (totalGrade >= 60) return 'مقبول';
    return 'ضعيف';
  };

  // تحديث بيانات الرياضي
  const updateAthlete = (id: number, field: keyof AthleteRecord, value: any) => {
    setAthletes(prev => {
      // أولاً نحدث القيمة
      const updatedAthletes = prev.map(athlete => {
        if (athlete.id === id) {
          return { ...athlete, [field]: value };
        }
        return athlete;
      });

      // ثم نعيد حساب جميع الدرجات لجميع الرياضيين
      return updatedAthletes.map(athlete => {
        const updatedAthlete = { ...athlete };

        // إعادة حساب الدرجات بناءً على البيانات المحدثة
        updatedAthlete.armsGrade = calculateGradeWithAthletes(updatedAthlete.armsRight, updatedAthlete.armsLeft, 'arms', updatedAthletes);
        updatedAthlete.trunkGrade = calculateGradeWithAthletes(updatedAthlete.trunkRight, updatedAthlete.trunkLeft, 'trunk', updatedAthletes);
        updatedAthlete.legsGrade = calculateGradeWithAthletes(updatedAthlete.legsRight, updatedAthlete.legsLeft, 'legs', updatedAthletes);
        updatedAthlete.enduranceGrade = calculateGradeWithAthletes(updatedAthlete.enduranceRight, updatedAthlete.enduranceLeft, 'endurance', updatedAthletes);
        updatedAthlete.oneRMGrade = calculateGradeWithAthletes(updatedAthlete.oneRMRight, updatedAthlete.oneRMLeft, 'oneRM', updatedAthletes);

        // حساب المجموع الإجمالي
        updatedAthlete.totalSum = updatedAthlete.armsGrade + updatedAthlete.trunkGrade +
                                  updatedAthlete.legsGrade + updatedAthlete.enduranceGrade +
                                  updatedAthlete.oneRMGrade;

        // حساب الدرجة الإجمالية (متوسط الدرجات)
        updatedAthlete.totalGrade = updatedAthlete.totalSum / 5;

        // تحديد المعيار
        updatedAthlete.standard = getStandard(updatedAthlete.totalGrade);

        return updatedAthlete;
      });
    });
  };

  // تم نقل إعادة الحساب إلى دالة updateAthlete لضمان التحديث الفوري

  // حفظ البيانات في Firestore
  const handleSaveData = async () => {
    setSaving(true);
    try {
      await saveData(athletes);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('Error saving team record:', err);
    } finally {
      setSaving(false);
    }
  };



  // إضافة صف جديد
  const addNewRow = () => {
    const newId = Math.max(...athletes.map(a => a.id)) + 1;
    const newAthlete: AthleteRecord = {
      id: newId,
      name: '',
      armsRight: 0, armsLeft: 0, armsGrade: 0,
      trunkRight: 0, trunkLeft: 0, trunkGrade: 0,
      legsRight: 0, legsLeft: 0, legsGrade: 0,
      enduranceRight: 0, enduranceLeft: 0, enduranceGrade: 0,
      oneRMRight: 0, oneRMLeft: 0, oneRMGrade: 0,
      totalSum: 0, totalGrade: 0, standard: ''
    };
    setAthletes(prev => [...prev, newAthlete]);
  };

  // حذف صف
  const deleteRow = (id: number) => {
    if (athletes.length > 1) {
      setAthletes(prev => prev.filter(athlete => athlete.id !== id));
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
        <title>سجل الرياضي</title>
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
            font-size: 9px;
          }
          h2 { text-align: center; margin-bottom: 20px; color: #1976d2; font-size: 14px; }
          @media print {
            body { margin: 0; }
            table { font-size: 8px; }
          }
        </style>
      </head>
      <body>
        <h2>سجل الرياضي (استخدام التكرارات لتقنين حمل التدريب الرياضي الاختصاص: جودو)</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="2">الرياضي</th>
              <th colspan="3">الذراعين</th>
              <th colspan="3">الجذع</th>
              <th colspan="3">الرجلين</th>
              <th colspan="3">التحمل العضلي</th>
              <th colspan="3">1RM</th>
              <th colspan="3">مستوى الرياضي</th>
            </tr>
            <tr>
              <th>قيمة اليمين</th>
              <th>قيمة اليسار</th>
              <th>الدرجة</th>
              <th>قيمة اليمين</th>
              <th>قيمة اليسار</th>
              <th>الدرجة</th>
              <th>قيمة اليمين</th>
              <th>قيمة اليسار</th>
              <th>الدرجة</th>
              <th>قيمة اليمين</th>
              <th>قيمة اليسار</th>
              <th>الدرجة</th>
              <th>قيمة اليمين</th>
              <th>قيمة اليسار</th>
              <th>الدرجة</th>
              <th>مجموع الحساب</th>
              <th>الدرجة</th>
              <th>المعيار</th>
            </tr>
          </thead>
          <tbody>
            ${athletes.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.armsRight || ''}</td>
                <td>${athlete.armsLeft || ''}</td>
                <td>${athlete.armsGrade.toFixed(2)}</td>
                <td>${athlete.trunkRight || ''}</td>
                <td>${athlete.trunkLeft || ''}</td>
                <td>${athlete.trunkGrade.toFixed(2)}</td>
                <td>${athlete.legsRight || ''}</td>
                <td>${athlete.legsLeft || ''}</td>
                <td>${athlete.legsGrade.toFixed(2)}</td>
                <td>${athlete.enduranceRight || ''}</td>
                <td>${athlete.enduranceLeft || ''}</td>
                <td>${athlete.enduranceGrade.toFixed(2)}</td>
                <td>${athlete.oneRMRight || ''}</td>
                <td>${athlete.oneRMLeft || ''}</td>
                <td>${athlete.oneRMGrade.toFixed(2)}</td>
                <td>${athlete.totalSum.toFixed(2)}</td>
                <td>${athlete.totalGrade.toFixed(2)}</td>
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
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-clipboard-list me-2"></i>
          سجل الرياضي ( استخدام التكرارات لتقنين حمل التدريب الرياضي الاختصاص: جودو )
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {showAlert && (
          <Alert variant="success" className="text-center" dir="rtl">
            <i className="fas fa-check-circle me-2"></i>
            تم حفظ البيانات بنجاح!
          </Alert>
        )}

        {/* شرح طريقة الحساب */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>
            طريقة الحساب:
          </h6>
          <ol className="mb-0">
            <li><strong>قيود الإدخال:</strong> أعلى قيمة في اليمين أو اليسار = 50 (أعلى مجموع = 100)</li>
            <li><strong>حساب المجموع:</strong> قيمة اليمين + قيمة اليسار</li>
            <li><strong>إيجاد أعلى مجموع</strong> بين جميع الرياضيين لكل فئة</li>
            <li><strong>حساب المعامل:</strong> 100 ÷ أعلى مجموع</li>
            <li><strong>حساب الدرجة:</strong> المجموع × المعامل</li>
            <li><strong>النتيجة:</strong> أعلى رياضي يحصل على 100 درجة، والباقي يحسب نسبياً</li>
          </ol>
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
                إضافة رياضي
              </Button>
              <Button variant="info" onClick={printResults} className="me-2">
                <i className="fas fa-print me-2"></i>
                طباعة النتائج
              </Button>
            </div>
          </Col>
        </Row>

        {/* الجدول */}
        <div className="table-responsive">
          <Table bordered className="text-center coach-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#e3f2fd' }}>
                <th rowSpan={2} style={{ verticalAlign: 'middle', backgroundColor: '#f5f5f5', minWidth: '120px' }}>
                  بيانات الرياضي
                </th>
                <th colSpan={3} style={{ backgroundColor: '#2196f3', color: 'white' }}>الذراعين</th>
                <th colSpan={3} style={{ backgroundColor: '#4caf50', color: 'white' }}>الجذع</th>
                <th colSpan={3} style={{ backgroundColor: '#ff9800', color: 'white' }}>الرجلين</th>
                <th colSpan={3} style={{ backgroundColor: '#9c27b0', color: 'white' }}>التحمل العضلي</th>
                <th colSpan={3} style={{ backgroundColor: '#f44336', color: 'white' }}>1RM</th>
                <th colSpan={3} style={{ backgroundColor: '#ffeb3b', color: '#000' }}>مستوى الرياضي</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', backgroundColor: '#f5f5f5' }}>إجراءات</th>
              </tr>
              <tr>
                {/* بيانات الرياضي - لا نحتاج لإضافة شيء هنا لأنه rowSpan={2} */}
                {/* الذراعين */}
                <th style={{ backgroundColor: '#2196f3', color: 'white', minWidth: '80px' }}>قيمة اليمين</th>
                <th style={{ backgroundColor: '#2196f3', color: 'white', minWidth: '80px' }}>قيمة اليسار</th>
                <th style={{ backgroundColor: '#2196f3', color: 'white', minWidth: '60px' }}>الدرجة</th>
                {/* الجذع */}
                <th style={{ backgroundColor: '#4caf50', color: 'white', minWidth: '80px' }}>قيمة اليمين</th>
                <th style={{ backgroundColor: '#4caf50', color: 'white', minWidth: '80px' }}>قيمة اليسار</th>
                <th style={{ backgroundColor: '#4caf50', color: 'white', minWidth: '60px' }}>الدرجة</th>
                {/* الرجلين */}
                <th style={{ backgroundColor: '#ff9800', color: 'white', minWidth: '80px' }}>قيمة اليمين</th>
                <th style={{ backgroundColor: '#ff9800', color: 'white', minWidth: '80px' }}>قيمة اليسار</th>
                <th style={{ backgroundColor: '#ff9800', color: 'white', minWidth: '60px' }}>الدرجة</th>
                {/* التحمل العضلي */}
                <th style={{ backgroundColor: '#9c27b0', color: 'white', minWidth: '80px' }}>قيمة اليمين</th>
                <th style={{ backgroundColor: '#9c27b0', color: 'white', minWidth: '80px' }}>قيمة اليسار</th>
                <th style={{ backgroundColor: '#9c27b0', color: 'white', minWidth: '60px' }}>الدرجة</th>
                {/* 1RM */}
                <th style={{ backgroundColor: '#f44336', color: 'white', minWidth: '80px' }}>قيمة اليمين</th>
                <th style={{ backgroundColor: '#f44336', color: 'white', minWidth: '80px' }}>قيمة اليسار</th>
                <th style={{ backgroundColor: '#f44336', color: 'white', minWidth: '60px' }}>الدرجة</th>
                {/* مستوى الرياضي */}
                <th style={{ backgroundColor: '#ffeb3b', color: '#000', minWidth: '80px' }}>مجموع الحساب</th>
                <th style={{ backgroundColor: '#ffeb3b', color: '#000', minWidth: '60px' }}>الدرجة</th>
                <th style={{ backgroundColor: '#ffeb3b', color: '#000', minWidth: '80px' }}>المعيار</th>
                {/* إجراءات - لا نحتاج لإضافة شيء هنا لأنه rowSpan={2} */}
              </tr>
            </thead>
            <tbody>
              {athletes.map((athlete) => (
                <tr key={athlete.id}>
                  {/* بيانات الرياضي */}
                  <td style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 text-end fw-bold" dir="rtl">
                        {loadingAthletes ? (
                          <small className="text-muted">جاري تحميل...</small>
                        ) : (
                          athlete.name || ''
                        )}
                      </div>
                    </div>
                  </td>

                  {/* الذراعين */}
                  <td style={{ backgroundColor: '#e3f2fd' }}>
                    <Form.Control
                      type="number"
                      value={athlete.armsRight || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'armsRight', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#e3f2fd' }}>
                    <Form.Control
                      type="number"
                      value={athlete.armsLeft || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'armsLeft', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#e3f2fd' }}>
                    <strong className="text-primary">{athlete.armsGrade.toFixed(2)}</strong>
                  </td>
                  
                  {/* الجذع */}
                  <td style={{ backgroundColor: '#e8f5e8' }}>
                    <Form.Control
                      type="number"
                      value={athlete.trunkRight || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'trunkRight', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#e8f5e8' }}>
                    <Form.Control
                      type="number"
                      value={athlete.trunkLeft || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'trunkLeft', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#e8f5e8' }}>
                    <strong className="text-success">{athlete.trunkGrade.toFixed(2)}</strong>
                  </td>
                  
                  {/* الرجلين */}
                  <td style={{ backgroundColor: '#fff3e0' }}>
                    <Form.Control
                      type="number"
                      value={athlete.legsRight || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'legsRight', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#fff3e0' }}>
                    <Form.Control
                      type="number"
                      value={athlete.legsLeft || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'legsLeft', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#fff3e0' }}>
                    <strong className="text-warning">{athlete.legsGrade.toFixed(2)}</strong>
                  </td>
                  
                  {/* التحمل العضلي */}
                  <td style={{ backgroundColor: '#f3e5f5' }}>
                    <Form.Control
                      type="number"
                      value={athlete.enduranceRight || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'enduranceRight', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#f3e5f5' }}>
                    <Form.Control
                      type="number"
                      value={athlete.enduranceLeft || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'enduranceLeft', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#f3e5f5' }}>
                    <strong style={{ color: '#9c27b0' }}>{athlete.enduranceGrade.toFixed(2)}</strong>
                  </td>
                  
                  {/* 1RM */}
                  <td style={{ backgroundColor: '#ffebee' }}>
                    <Form.Control
                      type="number"
                      value={athlete.oneRMRight || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'oneRMRight', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#ffebee' }}>
                    <Form.Control
                      type="number"
                      value={athlete.oneRMLeft || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'oneRMLeft', Math.min(parseFloat(e.target.value) || 0, 50))}
                      placeholder="0"
                      size="sm"
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </td>
                  <td style={{ backgroundColor: '#ffebee' }}>
                    <strong className="text-danger">{athlete.oneRMGrade.toFixed(2)}</strong>
                  </td>
                  
                  {/* مستوى الرياضي */}
                  <td style={{ backgroundColor: '#fffde7' }}>
                    <strong>{athlete.totalSum.toFixed(2)}</strong>
                  </td>
                  <td style={{ backgroundColor: '#fffde7' }}>
                    <strong>{athlete.totalGrade.toFixed(2)}</strong>
                  </td>
                  <td style={{ backgroundColor: '#fffde7' }}>
                    <strong>{athlete.standard}</strong>
                  </td>

                  {/* إجراءات */}
                  <td style={{ backgroundColor: '#f5f5f5' }}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteRow(athlete.id)}
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

export default TeamRecord;
