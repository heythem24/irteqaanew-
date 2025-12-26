import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface ExpenseItem {
  id: number;
  number: string;
  chapitre: string;
  section: string;
  accountNumber: string;
  amountPaid: string;
  beneficiaryName: string;
  recapAccountNumber: string;
  recapTotal: string;
}

const PaidExpenses: React.FC = () => {
  const [formData, setFormData] = useState({
    season: '',
    exercice: '',
    associationName: '',
    mandatNumber: '530000',
    accountNumber: '',
    chapitre: 'Caisse',
    journalCaisse: '',
    moisDe: '',
    occasion: '',
    executionPlace: '',
    personsCount: '',
    transportMeans: '',
    foodCoverage: '',
    accommodationCoverage: '',
    operationDate: '',
    grandTotal: '',
    place: '',
    date: ''
  });

  const [items, setItems] = useState<ExpenseItem[]>([
    { id: 1, number: '1', chapitre: '', section: '', accountNumber: '', amountPaid: '', beneficiaryName: '', recapAccountNumber: '', recapTotal: '' }
  ]);

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateItem = (id: number, field: keyof ExpenseItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newNumber = (items.length + 1).toString();
    setItems([...items, { id: Date.now(), number: newNumber, chapitre: '', section: '', accountNumber: '', amountPaid: '', beneficiaryName: '', recapAccountNumber: '', recapTotal: '' }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-money-bill-wave me-3"></i>
          المصاريف المدفوعة مجمعة
        </h2>
        <span className="text-muted">Dépenses engagées cumulées</span>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* معلومات الرأس */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">معلومات عامة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>الموسم:</Form.Label>
                    <Form.Control
                      value={formData.season}
                      onChange={(e) => updateForm('season', e.target.value)}
                      placeholder="مثال: 2024/2025"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Exercice:</Form.Label>
                    <Form.Control
                      value={formData.exercice}
                      onChange={(e) => updateForm('exercice', e.target.value)}
                      placeholder="2020"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تعيين الجمعية / Désignation de l'Association:</Form.Label>
                    <Form.Control
                      value={formData.associationName}
                      onChange={(e) => updateForm('associationName', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>حوالة رقم / Mandat N°:</Form.Label>
                    <Form.Control
                      value={formData.mandatNumber}
                      onChange={(e) => updateForm('mandatNumber', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>N° de compte:</Form.Label>
                    <Form.Control
                      value={formData.accountNumber}
                      onChange={(e) => updateForm('accountNumber', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>CHAPITRE:</Form.Label>
                    <Form.Control
                      value={formData.chapitre}
                      onChange={(e) => updateForm('chapitre', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Journal de caisse / Mois de:</Form.Label>
                    <Form.Control
                      value={formData.moisDe}
                      onChange={(e) => updateForm('moisDe', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* تفاصيل العملية */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">تفاصيل العملية</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>المناسبة:</Form.Label>
                    <Form.Control
                      value={formData.occasion}
                      onChange={(e) => updateForm('occasion', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>مكان تنفيذ العملية:</Form.Label>
                    <Form.Control
                      value={formData.executionPlace}
                      onChange={(e) => updateForm('executionPlace', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>عدد الأشخاص المتكفل بهم:</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.personsCount}
                      onChange={(e) => updateForm('personsCount', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>وسائل النقل المستعملة:</Form.Label>
                    <Form.Control
                      value={formData.transportMeans}
                      onChange={(e) => updateForm('transportMeans', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>التكفل بالإطعام:</Form.Label>
                    <Form.Control
                      value={formData.foodCoverage}
                      onChange={(e) => updateForm('foodCoverage', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>التكفل بالمبيت:</Form.Label>
                    <Form.Control
                      value={formData.accommodationCoverage}
                      onChange={(e) => updateForm('accommodationCoverage', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>تاريخ العملية:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.operationDate}
                      onChange={(e) => updateForm('operationDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* جدول المصاريف */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">جدول المصاريف</h5>
              <Button variant="light" size="sm" onClick={addItem}>
                <i className="fas fa-plus me-1"></i> إضافة صف
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ overflowX: 'auto' }}>
                <Table bordered hover className="mb-0" style={{ minWidth: '1100px', fontSize: '0.85rem' }}>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ minWidth: '60px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>الرقم</th>
                      <th style={{ minWidth: '120px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>Chapitre</th>
                      <th style={{ minWidth: '100px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>الباب</th>
                      <th style={{ minWidth: '120px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>رقم الحساب</th>
                      <th style={{ minWidth: '130px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>المبلغ المسدد</th>
                      <th style={{ minWidth: '220px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>اسم ولقب التاجر أو المستفيد</th>
                      <th colSpan={2} className="text-center bg-warning text-dark" style={{ minWidth: '250px', whiteSpace: 'normal', wordWrap: 'break-word', verticalAlign: 'middle' }}>الحوصلة Récapitulation</th>
                      <th style={{ minWidth: '60px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>حذف</th>
                    </tr>
                    <tr>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className="bg-warning text-dark" style={{ minWidth: '125px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>رقم الحساب</th>
                      <th className="bg-warning text-dark" style={{ minWidth: '125px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center', verticalAlign: 'middle' }}>المجموع Total</th>
                      <th></th>
                    </tr>
                  </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.number}</td>
                      <td>
                        <Form.Control size="sm" value={item.chapitre} onChange={(e) => updateItem(item.id, 'chapitre', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={item.section} onChange={(e) => updateItem(item.id, 'section', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={item.accountNumber} onChange={(e) => updateItem(item.id, 'accountNumber', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" type="number" value={item.amountPaid} onChange={(e) => updateItem(item.id, 'amountPaid', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={item.beneficiaryName} onChange={(e) => updateItem(item.id, 'beneficiaryName', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" value={item.recapAccountNumber} onChange={(e) => updateItem(item.id, 'recapAccountNumber', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control size="sm" type="number" value={item.recapTotal} onChange={(e) => updateItem(item.id, 'recapTotal', e.target.value)} />
                      </td>
                      <td className="text-center">
                        <Button variant="outline-danger" size="sm" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="table-warning fw-bold">
                    <td colSpan={4} className="text-end">المجموع العام:</td>
                    <td>{calculateGrandTotal()} دج</td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </Table>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="border-secondary">
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>حرر بـ:</Form.Label>
                    <Form.Control value={formData.place} onChange={(e) => updateForm('place', e.target.value)} placeholder="المدينة" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>في:</Form.Label>
                    <Form.Control type="date" value={formData.date} onChange={(e) => updateForm('date', e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">أمين المال</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">منفذ المصاريف</Card.Header>
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

export default PaidExpenses;
