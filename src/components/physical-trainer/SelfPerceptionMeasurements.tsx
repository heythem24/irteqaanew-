import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { useSelfPerceptionMeasurements } from '../../hooks/usePhysicalTests';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface SelfPerceptionRow {
  id: number;
  athleteId?: string;
  name: string;
  category: string; // الصنف
  group: string; // الفئة
  rpe: string; // معدل الاحساس بشدة الجهد-RPE
  wellensSleep: string;
  wellensStress: string;
  wellensMood: string;
  wellensMuscles: string;
  notes: string;
}

interface SelfPerceptionMeasurementsProps {
  clubId: string;
}

const SelfPerceptionMeasurements: React.FC<SelfPerceptionMeasurementsProps> = ({ clubId }) => {
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  const { data: firestoreData, saveData } = useSelfPerceptionMeasurements(clubId);
  const [rows, setRows] = useState<SelfPerceptionRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(firestoreData) && firestoreData.length > 0) {
      setRows(firestoreData as SelfPerceptionRow[]);
    }
  }, [firestoreData]);

  const calcAgeFromDob = (dob?: Date): number => {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  useEffect(() => {
    if (!clubAthletes || clubAthletes.length === 0) return;
    setRows(prev => {
      let updated: SelfPerceptionRow[] = [...prev];

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
          rpe: '',
          wellensSleep: '',
          wellensStress: '',
          wellensMood: '',
          wellensMuscles: '',
          notes: ''
        });
      }

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

  const updateRow = (id: number, field: keyof SelfPerceptionRow, value: string) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveData(rows);
      alert('تم حفظ مقاييس الإدراك الذاتي بنجاح');
    } catch (err) {
      console.error('Error saving self perception measurements:', err);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          مقاييس الإدراك الذاتي
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
                <th className="text-center align-middle" rowSpan={2}>معدل الاحساس بشدة الجهد-RPE</th>
                <th className="text-center align-middle" colSpan={4}>استبيان ويلينز</th>
                <th className="text-center align-middle" rowSpan={2}>ملاحظات</th>
              </tr>
              <tr className="table-primary">
                <th className="text-center align-middle">النوم</th>
                <th className="text-center align-middle">الإجهاد</th>
                <th className="text-center align-middle">المزاج</th>
                <th className="text-center align-middle">العضلات</th>
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
                      value={row.rpe}
                      onChange={(e) => updateRow(row.id, 'rpe', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.wellensSleep}
                      onChange={(e) => updateRow(row.id, 'wellensSleep', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.wellensStress}
                      onChange={(e) => updateRow(row.id, 'wellensStress', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.wellensMood}
                      onChange={(e) => updateRow(row.id, 'wellensMood', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.wellensMuscles}
                      onChange={(e) => updateRow(row.id, 'wellensMuscles', e.target.value)}
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
            padding: 12px 21px !important;
            border: 2px solid #1976d2;
            white-space: nowrap !important;
            min-width: 160px !important;
          }

          .cardio-table td {
            vertical-align: middle !important;
            padding: 12px 17px !important;
            border: 1px solid #ddd;
            white-space: nowrap !important;
            min-width: 150px !important;
          }

          .cardio-table input {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            min-width: 140px;
          }

          /* عمود معدل الاحساس بشدة الجهد-RPE - توسيع أكبر */
          .cardio-table th:nth-child(4),
          .cardio-table td:nth-child(4) {
            min-width: 220px !important;
            padding: 12px 25px !important;
          }

          .cardio-table th:nth-child(4) input,
          .cardio-table td:nth-child(4) input {
            min-width: 200px !important;
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

export default SelfPerceptionMeasurements;

// placeholder, will be replaced
