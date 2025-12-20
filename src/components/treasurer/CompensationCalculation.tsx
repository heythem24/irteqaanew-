import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface CompensationRow {
  id: string;
  foodExpenses: string;
  accommodationExpenses: string;
  carKilometerCompensation: string;
  transportKilometerCompensation: string;
  fuelExpenses: string;
  otherExpenses: string;
  totalExpenses: string;
}

const CompensationCalculation: React.FC = () => {
  const [compensations, setCompensations] = useState<CompensationRow[]>([
    {
      id: '1',
      foodExpenses: '',
      accommodationExpenses: '',
      carKilometerCompensation: '',
      transportKilometerCompensation: '',
      fuelExpenses: '',
      otherExpenses: '',
      totalExpenses: ''
    }
  ]);

  const [totalAmount, setTotalAmount] = useState('');
  const [totalAmountWords, setTotalAmountWords] = useState('');
  const [beneficiarySignature, setBeneficiarySignature] = useState('');

  const updateCompensation = (id: string, field: string, value: string) => {
    const updated = compensations.map(comp => {
      if (comp.id === id) {
        const newComp = { ...comp, [field]: value };
        // حساب المجموع تلقائياً
        if (field !== 'totalExpenses') {
          const total =
            (parseFloat(newComp.foodExpenses) || 0) +
            (parseFloat(newComp.accommodationExpenses) || 0) +
            (parseFloat(newComp.carKilometerCompensation) || 0) +
            (parseFloat(newComp.transportKilometerCompensation) || 0) +
            (parseFloat(newComp.fuelExpenses) || 0) +
            (parseFloat(newComp.otherExpenses) || 0);
          newComp.totalExpenses = total.toFixed(2);
        }
        return newComp;
      }
      return comp;
    });
    setCompensations(updated);
  };

  const addCompensationRow = () => {
    setCompensations([
      ...compensations,
      {
        id: Date.now().toString(),
        foodExpenses: '',
        accommodationExpenses: '',
        carKilometerCompensation: '',
        transportKilometerCompensation: '',
        fuelExpenses: '',
        otherExpenses: '',
        totalExpenses: ''
      }
    ]);
  };

  const deleteCompensationRow = (id: string) => {
    if (compensations.length > 1) {
      setCompensations(compensations.filter(comp => comp.id !== id));
    }
  };

  const calculateGrandTotal = () => {
    const total = compensations.reduce((sum, comp) => {
      return sum + (parseFloat(comp.totalExpenses) || 0);
    }, 0);
    return total.toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">حساب التعويضات</h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* جدول التعويضات */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">تفاصيل التعويضات</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover size="sm" style={{ minWidth: '1100px', marginBottom: 0 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصاريف الإطعام</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصاريف المبيت</div>
                      </th>
                      <th style={{ width: '140px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تعويض بالكيلومتر سيارة خاصة</div>
                      </th>
                      <th style={{ width: '140px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تعويض بالكيلومتر تنقل بوسائل خاصة</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصاريف الوقود</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصاريف أخرى</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مجموع المصاريف</div>
                      </th>
                      <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compensations.map((comp) => (
                      <tr key={comp.id}>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.foodExpenses}
                            onChange={(e) => updateCompensation(comp.id, 'foodExpenses', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.accommodationExpenses}
                            onChange={(e) => updateCompensation(comp.id, 'accommodationExpenses', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '140px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.carKilometerCompensation}
                            onChange={(e) => updateCompensation(comp.id, 'carKilometerCompensation', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '140px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.transportKilometerCompensation}
                            onChange={(e) => updateCompensation(comp.id, 'transportKilometerCompensation', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.fuelExpenses}
                            onChange={(e) => updateCompensation(comp.id, 'fuelExpenses', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={comp.otherExpenses}
                            onChange={(e) => updateCompensation(comp.id, 'otherExpenses', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={comp.totalExpenses}
                            readOnly
                            className="bg-light"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '60px', textAlign: 'center' }}>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteCompensationRow(comp.id)}
                            disabled={compensations.length === 1}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={addCompensationRow}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة صف
              </button>
            </Card.Body>
          </Card>

          {/* المبلغ الإجمالي */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">المبلغ الإجمالي</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-info">
                <strong>تم قفل هذا التعويض بمبلغ إجمالي مقدر بـ:</strong>
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>المبلغ (دج):</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          value={calculateGrandTotal()}
                          readOnly
                          className="bg-light fw-bold"
                        />
                        <span className="input-group-text">دج</span>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>بالأحرف:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={totalAmountWords}
                        onChange={(e) => setTotalAmountWords(e.target.value)}
                        placeholder="اكتب المبلغ بالحروف"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيع والبصمة */}
          <Card className="border-secondary">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">إمضاء و بصمة المستفيد</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>الإمضاء والبصمة:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={beneficiarySignature}
                      onChange={(e) => setBeneficiarySignature(e.target.value)}
                      placeholder="مكان الإمضاء والبصمة"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <div
                    style={{
                      minHeight: '120px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <p className="text-muted mb-0">مكان الإمضاء والبصمة</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CompensationCalculation;
