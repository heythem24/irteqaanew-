import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface OrderItem {
  id: number;
  quantity: string;
  nature: string;
  unitPrice: string;
  total: string;
  notes: string;
}

const OrderVoucher: React.FC = () => {
  const [formData, setFormData] = useState({
    associationName: '',
    address: '',
    supplierName: '',
    activity: '',
    commercialAddress: '',
    commercialRegister: '',
    taxNumber: '',
    bankAccount: '',
    totalAmount: '',
    totalAmountWords: '',
    place: '',
    date: ''
  });

  const [items, setItems] = useState<OrderItem[]>([
    { id: 1, quantity: '', nature: '', unitPrice: '', total: '', notes: '' }
  ]);

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateItem = (id: number, field: keyof OrderItem, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.unitPrice) || 0;
          updated.total = (qty * price).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), quantity: '', nature: '', unitPrice: '', total: '', notes: '' }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-file-invoice me-3"></i>
          سند طلبية
        </h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* معلومات الجمعية */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات الجمعية</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>إسم الجمعية:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                      placeholder="أدخل إسم الجمعية"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>العنوان (المقر):</Form.Label>
                    <Form.Control
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="أدخل العنوان"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* معلومات الممون */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">معلومات الممون</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>اسم ولقب الممون:</Form.Label>
                    <Form.Control
                      value={formData.supplierName}
                      onChange={(e) => updateForm('supplierName', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>النشاط:</Form.Label>
                    <Form.Control
                      value={formData.activity}
                      onChange={(e) => updateForm('activity', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>العنوان التجاري:</Form.Label>
                    <Form.Control
                      value={formData.commercialAddress}
                      onChange={(e) => updateForm('commercialAddress', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم السجل التجاري:</Form.Label>
                    <Form.Control
                      value={formData.commercialRegister}
                      onChange={(e) => updateForm('commercialRegister', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الرقم الجبائي:</Form.Label>
                    <Form.Control
                      value={formData.taxNumber}
                      onChange={(e) => updateForm('taxNumber', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم الحساب البنكي:</Form.Label>
                    <Form.Control
                      value={formData.bankAccount}
                      onChange={(e) => updateForm('bankAccount', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول الطلبية */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">تفاصيل الطلبية</h5>
              <Button variant="light" size="sm" onClick={addItem}>
                <i className="fas fa-plus me-1"></i> إضافة صف
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover className="mb-0" style={{ minWidth: '800px' }}>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '100px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>العدد</div>
                      </th>
                      <th style={{ width: '200px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>طبيعة الطلبية</div>
                      </th>
                      <th style={{ width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>سعر الوحدة</div>
                      </th>
                      <th style={{ width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المجموع</div>
                      </th>
                      <th style={{ width: '180px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الملاحظات</div>
                      </th>
                      <th style={{ width: '70px', textAlign: 'center', verticalAlign: 'middle' }}>حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            size="sm"
                            style={{ fontSize: '0.9rem' }}
                          />
                        </td>
                        <td style={{ width: '200px' }}>
                          <Form.Control
                            value={item.nature}
                            onChange={(e) => updateItem(item.id, 'nature', e.target.value)}
                            size="sm"
                            style={{ fontSize: '0.9rem' }}
                          />
                        </td>
                        <td style={{ width: '130px' }}>
                          <Form.Control
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                            size="sm"
                            style={{ fontSize: '0.9rem' }}
                          />
                        </td>
                        <td style={{ width: '130px' }}>
                          <Form.Control value={item.total} readOnly size="sm" className="bg-light" style={{ fontSize: '0.9rem' }} />
                        </td>
                        <td style={{ width: '180px' }}>
                          <Form.Control
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            size="sm"
                            style={{ fontSize: '0.9rem' }}
                          />
                        </td>
                        <td style={{ width: '70px', textAlign: 'center' }}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '0.8rem' }}></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="table-warning">
                      <td colSpan={3} className="text-end fw-bold">المجموع الكلي:</td>
                      <td className="fw-bold">{calculateTotal()} دج</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* المبلغ بالحروف */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">أوقف هذا السند بمبلغ قدره</h5>
            </Card.Header>
            <Card.Body>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.totalAmountWords}
                onChange={(e) => updateForm('totalAmountWords', e.target.value)}
                placeholder="اكتب المبلغ بالحروف..."
              />
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>حرر بـ:</Form.Label>
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
                <Col md={6}>
                  <Card className="text-center h-100">
                    <Card.Header className="bg-light">تأشيرة الممون أو مقدم الخدمات</Card.Header>
                    <Card.Body style={{ minHeight: '120px', border: '2px dashed #ccc', borderRadius: '8px' }}>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center h-100">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '120px', border: '2px dashed #ccc', borderRadius: '8px' }}>
                    </Card.Body>
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

export default OrderVoucher;
