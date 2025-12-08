import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { useCardioCirculatoryMeasurements } from '../../hooks/usePhysicalTests';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface CardioRow {
  id: number;
  athleteId?: string;
  name: string;
  category: string; // الصنف
  group: string; // الفئة
  hrRest: string;
  hrDuring: string;
  hrAfter: string;
  hrMax: string;
  hrRecovery: string;
  bloodPressure: string;
  evaluation: string;
  notes: string;
}

interface CardioCirculatoryMeasurementsProps {
  clubId: string;
}

const CardioCirculatoryMeasurements: React.FC<CardioCirculatoryMeasurementsProps> = ({ clubId }) => {
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  const { data: firestoreData, saveData } = useCardioCirculatoryMeasurements(clubId);
  const [rows, setRows] = useState<CardioRow[]>([]);
  const [saving, setSaving] = useState(false);

  // تحميل البيانات من فايرستور إن وُجدت
  useEffect(() => {
    if (Array.isArray(firestoreData) && firestoreData.length > 0) {
      setRows(firestoreData as CardioRow[]);
    }
  }, [firestoreData]);

  // دالة مساعدة لحساب العمر من تاريخ الميلاد
  const calcAgeFromDob = (dob?: Date): number => {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // مزامنة الصفوف مع قائمة رياضيي النادي (أسماء، صنف، فئة) مع الحفاظ على القيم المدخلة
  useEffect(() => {
    if (!clubAthletes || clubAthletes.length === 0) return;
    setRows(prev => {
      let updated: CardioRow[] = [...prev];

      // التأكد من وجود صفوف كافية لجميع الرياضيين
      while (updated.length < clubAthletes.length) {
        const newIndex = updated.length;
        const a = clubAthletes[newIndex];
        const name = a ? (a.fullNameAr || a.fullNameEn || '').trim() : '';
        const age = calcAgeFromDob(a?.dateOfBirth);
        const cat = getCategoryByDOBToday(a?.dateOfBirth)?.nameAr || '';

        updated.push({
          id: newIndex + 1,
          athleteId: a?.id,
          name,
          category: cat,
          group: age > 0 ? String(age) : '',
          hrRest: '',
          hrDuring: '',
          hrAfter: '',
          hrMax: '',
          hrRecovery: '',
          bloodPressure: '',
          evaluation: '',
          notes: ''
        });
      }

      // تحديث الصفوف الحالية بمعلومات الرياضيين (بدون مسح القياسات المدخلة)
      updated = updated.map((row, idx) => {
        const a = clubAthletes[idx];
        if (!a) return row;
        const name = (a.fullNameAr || a.fullNameEn || '').trim();
        const age = calcAgeFromDob(a.dateOfBirth);
        const cat = getCategoryByDOBToday(a.dateOfBirth)?.nameAr || row.category;
        return {
          ...row,
          athleteId: row.athleteId || a.id,
          name: row.name || name,
          category: row.category || cat,
          group: row.group || (age > 0 ? String(age) : '')
        };
      });

      return updated;
    });
  }, [clubAthletes]);

  const updateRow = (id: number, field: keyof CardioRow, value: string) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveData(rows);
      alert('تم حفظ قياسات القلب والجهاز الدوري بنجاح');
    } catch (err) {
      console.error('Error saving cardio circulatory measurements:', err);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          قياسات القلب والجهاز الدوري
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="mb-4" dir="rtl">
          <Col className="text-end">
            <Button
              variant="success"
              onClick={handleSave}
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
          </Col>
        </Row>

        <div className="table-responsive">
          <Table bordered className="cardio-table coach-table" dir="rtl">
            <thead>
              <tr className="table-primary">
                <th className="text-center align-middle" rowSpan={2}>الإسم واللقب</th>
                <th className="text-center align-middle" rowSpan={2}>الصنف</th>
                <th className="text-center align-middle" rowSpan={2}>الفئة</th>
                <th className="text-center align-middle" colSpan={5}>معدل ضربات القلب (HR)</th>
                <th className="text-center align-middle" rowSpan={2}>الضغط الدموي</th>
                <th className="text-center align-middle" rowSpan={2}>التقييم</th>
                <th className="text-center align-middle" rowSpan={2}>ملاحظات</th>
              </tr>
              <tr className="table-primary">
                <th className="text-center align-middle">في الراحة</th>
                <th className="text-center align-middle">أثناء التمرين</th>
                <th className="text-center align-middle">بعد التمرين</th>
                <th className="text-center align-middle">الأقصى</th>
                <th className="text-center align-middle">عند التعافي</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.name}
                      readOnly
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.category}
                      onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.group}
                      onChange={(e) => updateRow(row.id, 'group', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.hrRest}
                      onChange={(e) => updateRow(row.id, 'hrRest', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.hrDuring}
                      onChange={(e) => updateRow(row.id, 'hrDuring', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.hrAfter}
                      onChange={(e) => updateRow(row.id, 'hrAfter', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.hrMax}
                      onChange={(e) => updateRow(row.id, 'hrMax', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.hrRecovery}
                      onChange={(e) => updateRow(row.id, 'hrRecovery', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.bloodPressure}
                      onChange={(e) => updateRow(row.id, 'bloodPressure', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.evaluation}
                      onChange={(e) => updateRow(row.id, 'evaluation', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <style>{`
          .cardio-table {
            font-size: 12px;
            table-layout: auto !important;
            border-collapse: separate !important;
            border-spacing: 2px !important;
          }

          .cardio-table th {
            background-color: #e3f2fd;
            font-weight: bold;
            text-align: center;
            vertical-align: middle !important;
            padding: 12px 16px !important;
            border: 2px solid #1976d2;
            white-space: nowrap !important;
          }

          .cardio-table td {
            vertical-align: middle !important;
            padding: 8px 12px !important;
            border: 1px solid #ddd;
            white-space: nowrap !important;
          }

          .cardio-table input {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
          }

          @media print {
            .btn, .alert {
              display: none !important;
            }

            .cardio-table {
              font-size: 10px;
            }

            .cardio-table th,
            .cardio-table td {
              padding: 3px !important;
            }

            .cardio-table input {
              border: none;
              background: transparent;
              font-size: 9px;
            }
          }
        `}</style>
      </Card.Body>
    </Card>
  );
};

export default CardioCirculatoryMeasurements;
