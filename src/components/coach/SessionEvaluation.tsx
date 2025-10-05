import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, ProgressBar, Table } from 'react-bootstrap';
import type { Club } from '../../types';
import { useSessionEvaluation } from '../../hooks/useFirestore';
import './SessionEvaluation.css';
import './coach-responsive.css';

interface SessionEvaluationProps {
  club: Club;
}

interface MonthData {
  month: string;
  plannedSessions: number;
  executedSessions: number;
  percentage: number;
}

// الأشهر العشرة للسنة الدراسية
const months = [
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان'
];

const SessionEvaluation: React.FC<SessionEvaluationProps> = ({ club }) => {
  const [sessionData, setSessionData] = useState<MonthData[]>(() =>
    months.map(month => ({
      month,
      plannedSessions: 10,
      executedSessions: 10,
      percentage: 100
    }))
  );

  // استخدام Firestore بدلاً من localStorage
  const { evaluationData, saveSessionEvaluation } = useSessionEvaluation(club.id);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    if (evaluationData) {
      setSessionData(evaluationData);
    }
  }, [evaluationData]);

  // حفظ البيانات
  const saveData = async () => {
    try {
      await saveSessionEvaluation(sessionData);
      alert('تم حفظ تقييم الحصص بنجاح');
    } catch (err) {
      alert('حدث خطأ في حفظ تقييم الحصص');
      console.error('Error saving session evaluation:', err);
    }
  };

  // حساب النسبة المئوية
  const calculatePercentage = (executed: number, planned: number): number => {
    if (planned === 0) return 0;
    return (Math.round((executed / planned) * 100));
  };

  // تحديث الحصص المبرمجة
  const updatePlannedSessions = (monthIndex: number, value: number) => {
    const newValue = Math.max(10, Math.min(24, value));
    setSessionData(prev => prev.map((item, index) =>
      index === monthIndex
        ? {
          ...item,
          plannedSessions: newValue,
          percentage: calculatePercentage(item.executedSessions, newValue)
        }
        : item
    ));
  };

  // تحديث الحصص المنفذة
  const updateExecutedSessions = (monthIndex: number, value: number) => {
    const newValue = Math.max(10, Math.min(24, value));
    setSessionData(prev => prev.map((item, index) =>
      index === monthIndex
        ? {
          ...item,
          executedSessions: newValue,
          percentage: calculatePercentage(newValue, item.plannedSessions)
        }
        : item
    ));
  };

  // حساب المجاميع
  const getTotals = () => {
    const totalPlanned = sessionData.reduce((sum, item) => sum + item.plannedSessions, 0);
    const totalExecuted = sessionData.reduce((sum, item) => sum + item.executedSessions, 0);
    const totalPercentage = calculatePercentage(totalExecuted, totalPlanned);

    return { totalPlanned, totalExecuted, totalPercentage };
  };

  const totals = getTotals();

  // طباعة تقييم الحصص المنفذة - طباعة الجدول فقط بدون الهيدر والفوتر والقوائم العلوية
  const printSessionEvaluation = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقييم الحصص المنفذة - ${club.nameAr}</title>
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
            font-size: 16px;
            border: 2px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            line-height: 1.4;
          }
          th {
            background-color: #e3f2fd;
            font-weight: bold;
            font-size: 18px;
            padding: 15px 10px;
          }
          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1976d2; 
            font-size: 22px;
            font-weight: bold;
          }
          .total-row {
            background-color: #fff3cd;
            font-weight: bold;
            font-size: 18px;
          }
          @media print {
            @page {
              margin: 8mm;
              size: landscape;
            }
            
            body { 
              margin: 0 !important; 
              padding: 0 !important;
              font-family: Arial, sans-serif;
              direction: rtl;
            }
            
            h2 {
              font-size: 20px !important;
              font-weight: bold !important;
              text-align: center !important;
              margin: 5px 0 15px 0 !important;
            }
            
            table { 
              font-size: 16px !important;
              width: 100% !important;
              border: 2px solid #000 !important;
              border-collapse: collapse !important;
            }
            
            th, td { 
              padding: 12px 10px !important;
              font-weight: bold !important;
              font-size: 16px !important;
              border: 1px solid #000 !important;
              text-align: center !important;
              line-height: 1.4 !important;
            }
            
            th {
              font-size: 18px !important;
              padding: 15px 12px !important;
              background-color: #e3f2fd !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .total-row {
              font-size: 18px !important;
              font-weight: bold !important;
              background-color: #fff3cd !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <h2>تقييم الحصص المنفذة - ${club.nameAr}</h2>
        <table>
          <thead>
            <tr>
              <th>الشهر</th>
              <th>عدد الحصص المبرمجة</th>
              <th>عدد الحصص المنفذة</th>
              <th>النسبة المئوية للحصص المنفذة</th>
            </tr>
          </thead>
          <tbody>
            ${sessionData.map((monthData) => `
              <tr>
                <td>${monthData.month}</td>
                <td>${monthData.plannedSessions}</td>
                <td>${monthData.executedSessions}</td>
                <td>${monthData.percentage}%</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td><strong>المجموع</strong></td>
              <td><strong>${totals.totalPlanned}</strong></td>
              <td><strong>${totals.totalExecuted}</strong></td>
              <td><strong>${totals.totalPercentage}%</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(tableContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  return (
    <Card className="shadow-sm session-evaluation">
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0 text-center" dir="rtl">
          <i className="fas fa-star me-2"></i>
          تقييم الحصص المنفذة - {club.nameAr}
        </h5>
      </Card.Header>
      <Card.Body className="p-4">
        {/* زر الحفظ */}
        <Row className="mb-4">
          <Col md={6}>
            <Button
              variant="success"
              onClick={saveData}
              dir="rtl"
            >
              <i className="fas fa-save me-2"></i>
              حفظ التقييم
            </Button>
          </Col>
          <Col md={6} className="text-end">
            <Button
              variant="info"
              onClick={printSessionEvaluation}
              dir="rtl"
            >
              <i className="fas fa-print me-2"></i>
              طباعة التقييم
            </Button>
          </Col>
        </Row>

        {/* جدول تقييم الحصص */}
        <div className="table-responsive">
          <Table bordered hover className="session-table text-center coach-table">
            <thead>
              <tr>
                <th className="text-center fw-bold" dir="rtl">الشهر</th>
                <th className="text-center fw-bold" dir="rtl">عدد الحصص المبرمجة</th>
                <th className="text-center fw-bold" dir="rtl">عدد الحصص المنفذة</th>
                <th className="text-center fw-bold" dir="rtl">النسبة المئوية للحصص المنفذة</th>
              </tr>
            </thead>
            <tbody>
              {sessionData.map((monthData, index) => (
                <tr key={monthData.month}>
                  <td className="month-cell fw-bold text-center align-middle" dir="rtl">
                    {monthData.month}
                  </td>
                  <td className="p-2">
                    <Form.Control
                      type="number"
                      min="10"
                      max="24"
                      value={monthData.plannedSessions}
                      onChange={(e) => updatePlannedSessions(index, parseInt(e.target.value) || 10)}
                      className="session-input"
                    />
                  </td>
                  <td className="p-2">
                    <Form.Control
                      type="number"
                      min="10"
                      max="24"
                      value={monthData.executedSessions}
                      onChange={(e) => updateExecutedSessions(index, parseInt(e.target.value) || 10)}
                      className="session-input"
                    />
                  </td>
                  <td className="fw-bold text-center align-middle">
                    <span
                      className={`badge percentage-badge ${monthData.percentage >= 90 ? 'bg-success' :
                        monthData.percentage >= 70 ? 'bg-warning' : 'bg-danger'
                        }`}
                      style={{
                        fontSize: '1.6rem',
                        padding: '1rem 1.5rem',
                        fontWeight: '900',
                        borderRadius: '30px',
                        minWidth: '90px',
                        minHeight: '60px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <strong style={{ fontWeight: '900', fontSize: '1.8rem' }}>{monthData.percentage}%</strong>
                    </span>
                  </td>
                </tr>
              ))}

              {/* صف المجموع */}
              <tr className="total-row">
                <td className="fw-bold text-center" dir="rtl">
                  <strong>المجموع</strong>
                </td>
                <td className="fw-bold text-center">
                  <strong>{totals.totalPlanned}</strong>
                </td>
                <td className="fw-bold text-center">
                  <strong>{totals.totalExecuted}</strong>
                </td>
                <td className="fw-bold text-center">
                  <span
                    className={`badge percentage-badge ${totals.totalPercentage >= 90 ? 'bg-success' :
                      totals.totalPercentage >= 70 ? 'bg-warning' : 'bg-danger'
                      }`}
                    style={{
                      fontSize: '1.6rem',
                      padding: '1.2rem 1.8rem',
                      fontWeight: '900',
                      borderRadius: '35px',
                      minWidth: '110px',
                      minHeight: '70px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <strong style={{ fontWeight: '900', fontSize: '2.2rem' }}>{totals.totalPercentage}%</strong>
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* معلومات إضافية */}
        <div className="info-section">
          <Row>
            <Col>
              <div className="text-muted small text-end" dir="rtl">
                <i className="fas fa-info-circle me-1"></i>
                الحد الأدنى للحصص: 10 حصص شهرياً
                <br />
                <i className="fas fa-info-circle me-1"></i>
                الحد الأقصى للحصص: 24 حصة شهرياً
                <br />
                <i className="fas fa-chart-line me-1"></i>
                النسب المئوية:
                <span className="badge bg-success badge-legend">90%+ ممتاز</span>
                <span className="badge bg-warning badge-legend">70-89% جيد</span>
                <span className="badge bg-danger badge-legend">أقل من 70% يحتاج تحسين</span>
              </div>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SessionEvaluation;
