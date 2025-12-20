import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  notes: string;
}

const ExpenseCertificate: React.FC = () => {
  const [formData, setFormData] = useState({
    associationName: '',
    address: '',
    season: '',
    certifierName: '',
    certifierPosition: '',
    amount: '',
    amountWords: '',
    occasion: '',
    invoiceIssues: '',
    expenses: [
      {
        id: '1',
        date: '',
        description: '',
        quantity: '',
        unitPrice: '',
        totalAmount: '',
        notes: ''
      }
    ],
    correctAmount: '',
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateExpense = (id: string, field: string, value: string) => {
    const updated = formData.expenses.map(exp => {
      if (exp.id === id) {
        const newExp = { ...exp, [field]: value };
        // حساب المبلغ الإجمالي تلقائياً
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = parseFloat(newExp.quantity) || 0;
          const price = parseFloat(newExp.unitPrice) || 0;
          newExp.totalAmount = (qty * price).toFixed(2);
        }
        return newExp;
      }
      return exp;
    });
    setFormData({ ...formData, expenses: updated });
  };

  const addExpense = () => {
    setFormData({
      ...formData,
      expenses: [
        ...formData.expenses,
        {
          id: Date.now().toString(),
          date: '',
          description: '',
          quantity: '',
          unitPrice: '',
          totalAmount: '',
          notes: ''
        }
      ]
    });
  };

  const deleteExpense = (id: string) => {
    if (formData.expenses.length > 1) {
      setFormData({
        ...formData,
        expenses: formData.expenses.filter(exp => exp.id !== id)
      });
    }
  };

  const calculateTotal = () => {
    return formData.expenses.reduce((sum, exp) => {
      return sum + (parseFloat(exp.totalAmount) || 0);
    }, 0).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">شهادة إدارية لإثبات مصاريف</h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* رأس الشهادة */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات الشهادة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تعيين الجمعية:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                      placeholder="أدخل اسم الجمعية"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>العنوان (المقر):</Form.Label>
                    <Form.Control
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="أدخل العنوان"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>الموسم:</Form.Label>
                    <Form.Control
                      value={formData.season}
                      onChange={(e) => updateForm('season', e.target.value)}
                      placeholder="أدخل الموسم"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* بيانات المصرح */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">بيانات المصرح</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>يشهد السيد:</Form.Label>
                    <Form.Control
                      value={formData.certifierName}
                      onChange={(e) => updateForm('certifierName', e.target.value)}
                      placeholder="اسم المصرح"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الصفة:</Form.Label>
                    <Form.Control
                      value={formData.certifierPosition}
                      onChange={(e) => updateForm('certifierPosition', e.target.value)}
                      placeholder="الصفة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="alert alert-warning">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>المبلغ المدفوع:</strong></Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          value={formData.amount}
                          onChange={(e) => updateForm('amount', e.target.value)}
                          placeholder="0.00"
                        />
                        <span className="input-group-text">دج</span>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>بالأحرف:</strong></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.amountWords}
                        onChange={(e) => updateForm('amountWords', e.target.value)}
                        placeholder="اكتب المبلغ بالحروف"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label><strong>بمناسبة:</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.occasion}
                    onChange={(e) => updateForm('occasion', e.target.value)}
                    placeholder="وصف المناسبة"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label><strong>ملاحظات حول الفاتورة:</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.invoiceIssues}
                    onChange={(e) => updateForm('invoiceIssues', e.target.value)}
                    placeholder="أي أخطاء أو عدم مطابقة أو أسباب أخرى"
                  />
                </Form.Group>
              </div>
            </Card.Body>
          </Card>

          {/* جدول المصاريف */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">تفاصيل المصاريف</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover size="sm" style={{ minWidth: '900px', marginBottom: 0 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>التاريخ</div>
                      </th>
                      <th style={{ width: '130px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>تعيين العتاد</div>
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الكمية</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>سعر الوحدة</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المبلغ الإجمالي</div>
                      </th>
                      <th style={{ width: '120px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الملاحظات</div>
                      </th>
                      <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            type="date"
                            value={expense.date}
                            onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '130px' }}>
                          <Form.Control
                            size="sm"
                            value={expense.description}
                            onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                            placeholder="الوصف"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={expense.quantity}
                            onChange={(e) => updateExpense(expense.id, 'quantity', e.target.value)}
                            placeholder="الكمية"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={expense.unitPrice}
                            onChange={(e) => updateExpense(expense.id, 'unitPrice', e.target.value)}
                            placeholder="السعر"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={expense.totalAmount}
                            readOnly
                            className="bg-light"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            size="sm"
                            value={expense.notes}
                            onChange={(e) => updateExpense(expense.id, 'notes', e.target.value)}
                            placeholder="ملاحظات"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '60px', textAlign: 'center' }}>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteExpense(expense.id)}
                            disabled={formData.expenses.length === 1}
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
                className="btn btn-sm btn-outline-success mt-2"
                onClick={addExpense}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة مصروف
              </button>
            </Card.Body>
          </Card>

          {/* المبلغ الصحيح المدفوع */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">المبلغ الصحيح المدفوع</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-light">
                <Row>
                  <Col md={6}>
                    <h6>المجموع من الجدول:</h6>
                    <h4 className="text-success">{calculateTotal()} دج</h4>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>المبلغ الصحيح المدفوع:</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          value={formData.correctAmount}
                          onChange={(e) => updateForm('correctAmount', e.target.value)}
                          placeholder="0.00"
                        />
                        <span className="input-group-text">دج</span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>حرر:</Form.Label>
                    <Form.Control
                      value={formData.place}
                      onChange={(e) => updateForm('place', e.target.value)}
                      placeholder="المدينة"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>في:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">منفذ المصاريف</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">تأشيرة أمين المال</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
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

export default ExpenseCertificate;
