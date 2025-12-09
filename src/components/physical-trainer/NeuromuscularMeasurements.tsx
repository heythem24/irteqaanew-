import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import '../coach/coach-responsive.css';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { useNeuromuscularMeasurements } from '../../hooks/usePhysicalTests';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

interface NeuromuscularRow {
  id: number;
  athleteId?: string;
  name: string;
  category: string; // الصنف
  group: string; // الفئة
  neuralResponse: string; // الاستجابة العصبية
  centralFatigue: string; // معدل التعب المركزي
  notes: string;
}

interface NeuromuscularMeasurementsProps {
  clubId: string;
}

const NeuromuscularMeasurements: React.FC<NeuromuscularMeasurementsProps> = ({ clubId }) => {
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  const { data: firestoreData, saveData } = useNeuromuscularMeasurements(clubId);
  const [rows, setRows] = useState<NeuromuscularRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(firestoreData) && firestoreData.length > 0) {
      setRows(firestoreData as NeuromuscularRow[]);
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
      let updated: NeuromuscularRow[] = [...prev];

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
          neuralResponse: '',
          centralFatigue: '',
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

  const updateRow = (id: number, field: keyof NeuromuscularRow, value: string) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveData(rows);
      alert('تم حفظ قياسات الجهاز العصبي والوظائف العصبية العضلية بنجاح');
    } catch (err) {
      console.error('Error saving neuromuscular measurements:', err);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          قياسات الجهاز العصبي والوظائف العصبية العضلية
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
                <th className="text-center align-middle">الإسم واللقب</th>
                <th className="text-center align-middle">الصنف</th>
                <th className="text-center align-middle">الفئة</th>
                <th className="text-center align-middle">الاستجابة العصبية</th>
                <th className="text-center align-middle">معدل التعب المركزي</th>
                <th className="text-center align-middle">ملاحظات</th>
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
                      value={row.neuralResponse}
                      onChange={(e) => updateRow(row.id, 'neuralResponse', e.target.value)}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="text"
                      size="sm"
                      value={row.centralFatigue}
                      onChange={(e) => updateRow(row.id, 'centralFatigue', e.target.value)}
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
            padding: 12px 18px !important;
            border: 2px solid #1976d2;
            white-space: nowrap !important;
            min-width: 140px !important;
          }

          .cardio-table td {
            vertical-align: middle !important;
            padding: 10px 15px !important;
            border: 1px solid #ddd;
            white-space: nowrap !important;
            min-width: 130px !important;
          }

          .cardio-table input {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 12px;
            min-width: 120px;
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

export default NeuromuscularMeasurements;

// placeholder, will be replaced
