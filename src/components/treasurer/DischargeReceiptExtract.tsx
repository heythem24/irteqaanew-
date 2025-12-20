import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Table, Button } from 'react-bootstrap';

interface RevenueItem {
  id: string;
  number: string;
  chapitre: string;
  chapter: string;
  accountNumber: string;
  amount: string;
  fundingSource: string;
}

const DischargeReceiptExtract: React.FC = () => {
  const [formData, setFormData] = useState({
    season: '',
    exercice: '',
    associationName: '',
    mandatNumber: '',
    accountNumber: '',
    chapitre: '',
    receiptNumber: '',
    treasurerStatement: '',
    accountName: '',
    totalAmount: '',
    totalAmountWords: '',
    represents: '',
    revenues: [
      {
        id: '1',
        number: '',
        chapitre: '',
        chapter: '',
        accountNumber: '',
        amount: '',
        fundingSource: ''
      }
    ],
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateRevenue = (id: string, field: string, value: string) => {
    const updated = formData.revenues.map(rev => {
      if (rev.id === id) {
        return { ...rev, [field]: value };
      }
      return rev;
    });
    setFormData({ ...formData, revenues: updated });
  };

  const addRevenue = () => {
    setFormData({
      ...formData,
      revenues: [
        ...formData.revenues,
        {
          id: Date.now().toString(),
          number: '',
          chapitre: '',
          chapter: '',
          accountNumber: '',
          amount: '',
          fundingSource: ''
        }
      ]
    });
  };

  const deleteRevenue = (id: string) => {
    if (formData.revenues.length > 1) {
      setFormData({
        ...formData,
        revenues: formData.revenues.filter(rev => rev.id !== id)
      });
    }
  };

  const calculateTotal = () => {
    return formData.revenues.reduce((sum, rev) => {
      return sum + (parseFloat(rev.amount) || 0);
    }, 0).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">مستخرج وصل تبرئة الذمة - Extrait de quittance</h2>
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
                      placeholder="2022"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Exercice:</Form.Label>
                    <Form.Control
                      value={formData.exercice}
                      onChange={(e) => updateForm('exercice', e.target.value)}
                      placeholder="2022"
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
              </Row>
            </Card.Body>
          </Card>

          {/* العنوان الرئيسي */}
          <div className="text-center mb-4 p-3 bg-info text-white rounded">
            <h4 className="mb-0">مستخرج وصل تبرئة الذمة</h4>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">رقم:</Form.Label>
                  <Form.Control
                    value={formData.receiptNumber}
                    onChange={(e) => updateForm('receiptNumber', e.target.value)}
                    placeholder="رقم الوصل"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Extrait de quittance N°:</Form.Label>
                  <Form.Control
                    value={formData.receiptNumber}
                    onChange={(e) => updateForm('receiptNumber', e.target.value)}
                    placeholder="رقم الوصل"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* محتوى الشهادة */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">محتوى الشهادة</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-light">
                <p className="mb-3">
                  <strong>يشهد أمين المال أن حساب:</strong>
                </p>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>اسم الحساب:</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.accountName}
                        onChange={(e) => updateForm('accountName', e.target.value)}
                        placeholder="اسم الحساب"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="alert alert-warning">
                  <p className="mb-3">
                    <strong>قد قيدت به عملية إيرادات بمبلغ:</strong>
                  </p>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label><strong>المبلغ:</strong></Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="number"
                            value={formData.totalAmount}
                            onChange={(e) => updateForm('totalAmount', e.target.value)}
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
                          value={formData.totalAmountWords}
                          onChange={(e) => updateForm('totalAmountWords', e.target.value)}
                          placeholder="اكتب المبلغ بالحروف"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label><strong>و الذي يمثل:</strong></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.represents}
                        onChange={(e) => updateForm('represents', e.target.value)}
                        placeholder="وصف ما يمثله المبلغ"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <p className="mb-3 text-muted">
                  <strong>مفصلة في الأسفل على النحو التالي:</strong>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* جدول مصادر الأموال */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">مصادر الأموال المستلمة - Resources des recettes</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table bordered hover size="sm" style={{ minWidth: '1000px', marginBottom: 0 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الرقم</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>Chapitre</div>
                      </th>
                      <th style={{ width: '100px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>الباب</div>
                      </th>
                      <th style={{ width: '110px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>رقم الحساب</div>
                      </th>
                      <th style={{ width: '110px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>المبلغ المستلم</div>
                      </th>
                      <th style={{ width: '150px', textAlign: 'center' }}>
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>مصادر التمويل</div>
                      </th>
                      <th style={{ width: '60px', textAlign: 'center' }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.revenues.map((revenue) => (
                      <tr key={revenue.id}>
                        <td style={{ width: '80px' }}>
                          <Form.Control
                            size="sm"
                            value={revenue.number}
                            onChange={(e) => updateRevenue(revenue.id, 'number', e.target.value)}
                            placeholder="الرقم"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            value={revenue.chapitre}
                            onChange={(e) => updateRevenue(revenue.id, 'chapitre', e.target.value)}
                            placeholder="Chapitre"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '100px' }}>
                          <Form.Control
                            size="sm"
                            value={revenue.chapter}
                            onChange={(e) => updateRevenue(revenue.id, 'chapter', e.target.value)}
                            placeholder="الباب"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <Form.Control
                            size="sm"
                            value={revenue.accountNumber}
                            onChange={(e) => updateRevenue(revenue.id, 'accountNumber', e.target.value)}
                            placeholder="رقم الحساب"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={revenue.amount}
                            onChange={(e) => updateRevenue(revenue.id, 'amount', e.target.value)}
                            placeholder="0.00"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '150px' }}>
                          <Form.Control
                            size="sm"
                            value={revenue.fundingSource}
                            onChange={(e) => updateRevenue(revenue.id, 'fundingSource', e.target.value)}
                            placeholder="مصدر التمويل"
                            style={{ fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ width: '60px', textAlign: 'center' }}>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteRevenue(revenue.id)}
                            disabled={formData.revenues.length === 1}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td colSpan={4}>المجموع العام</td>
                      <td>{calculateTotal()} دج</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <button
                className="btn btn-sm btn-outline-info mt-2"
                onClick={addRevenue}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة مصدر إيراد
              </button>
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
                  <Card className="text-center">
                    <Card.Header className="bg-light">تأشيرة الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">أمين المال</Card.Header>
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

export default DischargeReceiptExtract;
