import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';

const BankToCashTransfer: React.FC = () => {
  const [formData, setFormData] = useState({
    season: '',
    exercice: '',
    associationName: '',
    mandatNumber: '512000',
    accountNumber: '',
    chapitre: 'BANQUE',
    imputation: 'Compte : 581000',
    bankAccountNumber: '',
    transferAmount: '',
    transferAmountWords: '',
    checkNumber: '',
    checkDate: '',
    bankName: '',
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-exchange-alt me-3"></i>
          تحويل الأموال من حساب البنك
        </h2>
        <span className="badge bg-primary fs-6">07</span>
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
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>تدوين / Imputation:</Form.Label>
                    <Form.Control
                      value={formData.imputation}
                      onChange={(e) => updateForm('imputation', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* العنوان الرئيسي */}
          <div className="text-center mb-4 p-3 bg-info text-white rounded">
            <h4 className="mb-0">تحويل الأموال من حساب البنك لتزويد الصندوق</h4>
          </div>

          {/* تفاصيل التحويل */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">تفاصيل التحويل</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4 p-3 bg-light rounded">
                <p className="mb-3 fw-bold">بقرار من الرئيس وأمين المال، تم تحويل:</p>
                
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>من حساب بنك رقم:</Form.Label>
                      <Form.Control
                        value={formData.bankAccountNumber}
                        onChange={(e) => updateForm('bankAccountNumber', e.target.value)}
                        placeholder="أدخل رقم الحساب البنكي"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>إلى حساب الصندوق مبلغ:</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          value={formData.transferAmount}
                          onChange={(e) => updateForm('transferAmount', e.target.value)}
                          placeholder="0.00"
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
                        value={formData.transferAmountWords}
                        onChange={(e) => updateForm('transferAmountWords', e.target.value)}
                        placeholder="اكتب المبلغ بالحروف"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>بواسطة شيك يحمل رقم:</Form.Label>
                      <Form.Control
                        value={formData.checkNumber}
                        onChange={(e) => updateForm('checkNumber', e.target.value)}
                        placeholder="رقم الشيك"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>والمؤرخ في:</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.checkDate}
                        onChange={(e) => updateForm('checkDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>من الحساب المفتوح ببنك:</Form.Label>
                      <Form.Control
                        value={formData.bankName}
                        onChange={(e) => updateForm('bankName', e.target.value)}
                        placeholder="اسم البنك"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="alert alert-info mt-3">
                  <strong>الغرض:</strong> للتكفل بنفقات الصندوق المدفوعة نقداً.
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* التوقيعات */}
          <Card className="mb-4 border-secondary">
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
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">أمين المال</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-light">الرئيس</Card.Header>
                    <Card.Body style={{ minHeight: '100px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* الملاحظة */}
          <Card className="border-warning mb-4">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>ملاحظة</h6>
            </Card.Header>
            <Card.Body className="bg-light">
              <p className="mb-2"><strong>وثيقة تحرر في نسختين:</strong></p>
              <ul className="mb-0">
                <li><strong>أ –</strong> لحساب البنك (-).</li>
                <li><strong>ب –</strong> لحساب الصندوق (+).</li>
              </ul>
            </Card.Body>
          </Card>

        </Card.Body>
      </Card>
    </Container>
  );
};

export default BankToCashTransfer;
