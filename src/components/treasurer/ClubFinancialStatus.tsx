import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table } from 'react-bootstrap';

interface DebtItem {
  id: number;
  description: string;
  amount: string;
}

const ClubFinancialStatus: React.FC = () => {
  const [formData, setFormData] = useState({
    statusDate: '',
    openingBalanceDate: '',
    openingBalance: '',
    seasonIncome: '',
    seasonExpenses: '',
    endSeasonBalance: '',
    bankBalanceDate: '',
    bankBalance: '',
    cashBalanceDate: '',
    cashBalance: '',
    auditorExpenses: '',
    rentExpenses: ''
  });

  const [pendingExpenses, setPendingExpenses] = useState<DebtItem[]>([
    { id: 1, description: '', amount: '' }
  ]);

  const [debts, setDebts] = useState<DebtItem[]>([
    { id: 1, description: '', amount: '' }
  ]);

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updatePendingExpense = (id: number, field: keyof DebtItem, value: string) => {
    setPendingExpenses(pendingExpenses.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addPendingExpense = () => {
    setPendingExpenses([...pendingExpenses, { id: Date.now(), description: '', amount: '' }]);
  };

  const updateDebt = (id: number, field: keyof DebtItem, value: string) => {
    setDebts(debts.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addDebt = () => {
    setDebts([...debts, { id: Date.now(), description: '', amount: '' }]);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-chart-pie me-3"></i>
          الوضعية المالية للنادي
        </h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          <h4 className="text-center mb-4 text-primary">4 – الوضعية المالية للنادي</h4>

          {/* جدول الوضعية المالية */}
          <Card className="mb-4 border-primary">
            <Card.Body className="p-0">
              <Table bordered hover responsive className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th style={{ width: '60px' }}>الرقم</th>
                    <th>البيان</th>
                    <th style={{ width: '200px' }}>المبلغ (دج)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center fw-bold">1</td>
                    <td>
                      الوضعية المالية للنادي إلى غاية
                      <Form.Control
                        type="date"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '150px' }}
                        value={formData.statusDate}
                        onChange={(e) => updateForm('statusDate', e.target.value)}
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold">2</td>
                    <td>
                      الرصيد الابتدائي بتاريخ
                      <Form.Control
                        type="date"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '150px' }}
                        value={formData.openingBalanceDate}
                        onChange={(e) => updateForm('openingBalanceDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.openingBalance}
                        onChange={(e) => updateForm('openingBalance', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold">3</td>
                    <td>
                      مداخيل النادي خلال الموسم الرياضي
                      <Form.Control
                        type="text"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '100px' }}
                        placeholder="السنة"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.seasonIncome}
                        onChange={(e) => updateForm('seasonIncome', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold">4</td>
                    <td>
                      نفقات النادي خلال الموسم الرياضي
                      <Form.Control
                        type="text"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '100px' }}
                        placeholder="السنة"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.seasonExpenses}
                        onChange={(e) => updateForm('seasonExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr className="table-success">
                    <td className="text-center fw-bold">5</td>
                    <td className="fw-bold">رصيد النادي عند نهاية الموسم الرياضي</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.endSeasonBalance}
                        onChange={(e) => updateForm('endSeasonBalance', e.target.value)}
                        placeholder="0.00"
                        className="fw-bold"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold">6</td>
                    <td>
                      رصيد البنك إلى غاية
                      <Form.Control
                        type="date"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '150px' }}
                        value={formData.bankBalanceDate}
                        onChange={(e) => updateForm('bankBalanceDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.bankBalance}
                        onChange={(e) => updateForm('bankBalance', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-center fw-bold">7</td>
                    <td>
                      رصيد الصندوق إلى غاية
                      <Form.Control
                        type="date"
                        size="sm"
                        className="d-inline-block mx-2"
                        style={{ width: '150px' }}
                        value={formData.cashBalanceDate}
                        onChange={(e) => updateForm('cashBalanceDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={formData.cashBalance}
                        onChange={(e) => updateForm('cashBalance', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* نفقات قيد التسوية */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="mb-0">– نفقات قيد التسوية :</h5>
              <button className="btn btn-sm btn-light" onClick={addPendingExpense}>
                <i className="fas fa-plus me-1"></i> إضافة
              </button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>✓ نفقات محافظ الحسابات:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={formData.auditorExpenses}
                        onChange={(e) => updateForm('auditorExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>✓ نفقات الإيجار:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={formData.rentExpenses}
                        onChange={(e) => updateForm('rentExpenses', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              {pendingExpenses.map((item) => (
                <Row key={item.id} className="mb-2">
                  <Col md={8}>
                    <Form.Control
                      value={item.description}
                      onChange={(e) => updatePendingExpense(item.id, 'description', e.target.value)}
                      placeholder="✓ وصف النفقة..."
                    />
                  </Col>
                  <Col md={4}>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={item.amount}
                        onChange={(e) => updatePendingExpense(item.id, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>

          {/* حسابات المداينة */}
          <Card className="mb-4 border-danger">
            <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">– حسابات المداينة :</h5>
              <button className="btn btn-sm btn-light" onClick={addDebt}>
                <i className="fas fa-plus me-1"></i> إضافة
              </button>
            </Card.Header>
            <Card.Body>
              {debts.map((item) => (
                <Row key={item.id} className="mb-2">
                  <Col md={8}>
                    <Form.Control
                      value={item.description}
                      onChange={(e) => updateDebt(item.id, 'description', e.target.value)}
                      placeholder="✓ وصف الدين..."
                    />
                  </Col>
                  <Col md={4}>
                    <div className="input-group">
                      <Form.Control
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateDebt(item.id, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="input-group-text">دج</span>
                    </div>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">رئيس النادي</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">أمين المال</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClubFinancialStatus;
