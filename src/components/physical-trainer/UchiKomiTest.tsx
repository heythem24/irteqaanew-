import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useUchiKomiTest } from '../../hooks/usePhysicalTests';
import { useClubAthletes } from '../../hooks/useClubAthletes';
import { getCategoryByDOBToday } from '../../utils/categoryUtils';

//

interface UchiKomiTestProps {
  clubId: string;
}

const UchiKomiTest: React.FC<UchiKomiTestProps> = ({ clubId }) => {
  const {
    athletes,
    loading,
    updateAthlete,
    addNewRow,
    deleteRow
  } = useUchiKomiTest(clubId);
  const { athletes: clubAthletes } = useClubAthletes(clubId);
  
  const [localAthletes, setLocalAthletes] = useState<any[]>([]);

  // Load athletes data from club list if no data from firestore
  useEffect(() => {
    if (clubAthletes.length > 0 && localAthletes.length === 0) {
      // Initialize athletes from club data
      const initializedAthletes = clubAthletes.slice(0, 8).map((athlete, index) => ({
        id: index + 1,
        athleteId: athlete.id,
        name: athlete.fullNameAr || athlete.fullNameEn || '',
        category: getCategoryByDOBToday(athlete.dateOfBirth)?.nameAr || '',
        ageGroup: '',
        age: (function(){
          if (!athlete.dateOfBirth) return 0;
          const today = new Date();
          const birth = new Date(athlete.dateOfBirth);
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
          return age;
        })(),
        result10s: 0,
        evaluation10s: 0,
        result20s: 0,
        evaluation20s: 0,
        result30s: 0,
        evaluation30s: 0
      }));
      
      setLocalAthletes(initializedAthletes);
    }
  }, [clubAthletes, localAthletes]);

  // Use local athletes if available, otherwise use hook athletes
  const displayAthletes = localAthletes.length > 0 ? localAthletes : athletes;

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
        <title>اختبار الأوتشي-كومي</title>
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
        <h2>اختبار الأوتشي-كومي</h2>
        <table>
          <thead>
            <tr>
              <th rowspan="2">الاسم واللقب</th>
              <th rowspan="2">الصنف</th>
              <th rowspan="2">الفئة</th>
              <th rowspan="2">العمر</th>
              <th colspan="6">الأوتشي-كومي</th>
            </tr>
            <tr>
              <th>10ث</th>
              <th>تقييم (%)</th>
              <th>20ث</th>
              <th>تقييم (%)</th>
              <th>30ث</th>
              <th>تقييم (%)</th>
            </tr>
          </thead>
          <tbody>
            ${displayAthletes.map((athlete) => `
              <tr>
                <td>${athlete.name || ''}</td>
                <td>${athlete.category || ''}</td>
                <td>${athlete.ageGroup || ''}</td>
                <td>${athlete.age || ''}</td>
                <td>${athlete.result10s || ''}</td>
                <td>${athlete.evaluation10s || ''}%</td>
                <td>${athlete.result20s || ''}</td>
                <td>${athlete.evaluation20s || ''}%</td>
                <td>${athlete.result30s || ''}</td>
                <td>${athlete.evaluation30s || ''}%</td>
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

  // معالجة حالة التحميل
  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0 text-center" dir="rtl">
            <i className="fas fa-redo me-2"></i>
            اختبار الأوتشي-كومي
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
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-success text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-redo me-2"></i>
          اختبار الأوتشي-كومي
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {/* شرح الاختبار */}
        <Alert variant="info" className="mb-4" dir="rtl">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>
            معايير التقييم:
          </h6>
          <ul className="mb-0">
            <li><strong>8-12 سنة:</strong> 10ث (8 حركات = 100%)، 20ث (16 حركة = 100%)، 30ث (24 حركة = 100%)</li>
            <li><strong>13-16 سنة:</strong> 10ث (10 حركات = 100%)، 20ث (20 حركة = 100%)، 30ث (30 حركة = 100%)</li>
            <li><strong>17+ سنة:</strong> 10ث (12 حركة = 100%)، 20ث (24 حركة = 100%)، 30ث (36 حركة = 100%)</li>
          </ul>
        </Alert>

        {/* أزرار التحكم */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <Button variant="success" onClick={addNewRow}>
                <i className="fas fa-plus me-2"></i>
                إضافة صف
              </Button>
              <Button variant="info" onClick={printResults}>
                <i className="fas fa-print me-2"></i>
                طباعة النتائج
              </Button>
            </div>
          </Col>
        </Row>

        {/* الجدول */}
        <div className="table-responsive">
          <Table striped bordered hover className="text-center">
            <thead className="table-dark">
              <tr>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>الاسم واللقب</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>الصنف</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>الفئة</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>العمر</th>
                <th colSpan={6} className="bg-success">الأوتشي-كومي</th>
                <th rowSpan={2} style={{ verticalAlign: 'middle' }}>إجراءات</th>
              </tr>
              <tr>
                <th className="bg-success">10ث</th>
                <th className="bg-success">تقييم (%)</th>
                <th className="bg-success">20ث</th>
                <th className="bg-success">تقييم (%)</th>
                <th className="bg-success">30ث</th>
                <th className="bg-success">تقييم (%)</th>
              </tr>
            </thead>
            <tbody>
              {displayAthletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td>
                    <div className="text-center py-1">{athlete.name}</div>
                  </td>
                  <td>
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === (athlete as any).athleteId) || clubAthletes[(athlete as any).id - 1];
                      const cat = getCategoryByDOBToday(roster?.dateOfBirth)?.nameAr || (athlete as any).category;
                      return <span className="fw-semibold">{cat}</span>;
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const roster = clubAthletes.find(a => a.id === (athlete as any).athleteId) || clubAthletes[(athlete as any).id - 1];
                      const d = roster?.dateOfBirth ? new Date(roster.dateOfBirth) : undefined;
                      let age = 0;
                      if (d) {
                        const today = new Date();
                        age = today.getFullYear() - d.getFullYear();
                        const m = today.getMonth() - d.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
                      }
                      return <span className="fw-semibold">{age || ''}</span>;
                    })()}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={(athlete as any).result10s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'result10s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{(athlete as any).evaluation10s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={(athlete as any).result20s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'result20s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{(athlete as any).evaluation20s}%</strong>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={(athlete as any).result30s || ''}
                      onChange={(e) => updateAthlete(athlete.id, 'result30s', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      size="sm"
                    />
                  </td>
                  <td className="bg-light">
                    <strong className="text-success">{(athlete as any).evaluation30s}%</strong>
                  </td>
                  <td>
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

export default UchiKomiTest;
