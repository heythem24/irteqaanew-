import React, { useState } from 'react';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

const FinancialDischarge: React.FC = () => {
  const [formData, setFormData] = useState({
    associationName: '',
    address: '',
    season: '',
    witnessName: '',
    witnessPosition: '',
    idNumber: '',
    idIssueDate: '',
    idIssuingAuthority: '',
    receivedFromEntity: '',
    amount: '',
    amountWords: '',
    paymentRepresents: '',
    checkNumber: '',
    checkDate: '',
    bankName: '',
    paymentMethod: 'check',
    place: '',
    date: '',
    municipalityApproval: false,
    vendorApproval: false
  });

  const updateForm = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="text-center mb-3">مخالصة مالية - Décharge Financière</h2>
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
                    <Form.Label>العنوان:</Form.Label>
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

          {/* بيانات الشاهد */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">بيانات الشاهد / المستلم</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>يشهد السيد (ة):</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.witnessName}
                      onChange={(e) => updateForm('witnessName', e.target.value)}
                      placeholder="اسم الشاهد"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الصفة:</Form.Label>
                    <Form.Control
                      value={formData.witnessPosition}
                      onChange={(e) => updateForm('witnessPosition', e.target.value)}
                      placeholder="الصفة"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم بطاقة التعريف:</Form.Label>
                    <Form.Control
                      value={formData.idNumber}
                      onChange={(e) => updateForm('idNumber', e.target.value)}
                      placeholder="رقم البطاقة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الصادرة بتاريخ:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.idIssueDate}
                      onChange={(e) => updateForm('idIssueDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>من طرف دائرة:</Form.Label>
                    <Form.Control
                      value={formData.idIssuingAuthority}
                      onChange={(e) => updateForm('idIssuingAuthority', e.target.value)}
                      placeholder="جهة الإصدار"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* بيانات الدفع */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">بيانات الدفع</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>بأنني استلمت من طرف الجمعية / الرابطة / النادي:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.receivedFromEntity}
                      onChange={(e) => updateForm('receivedFromEntity', e.target.value)}
                      placeholder="من استلمت منه"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="alert alert-warning">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>مبلغ:</strong></Form.Label>
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

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label><strong>و الذي يمثل تسديد:</strong></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.paymentRepresents}
                        onChange={(e) => updateForm('paymentRepresents', e.target.value)}
                        placeholder="وصف ما يمثله الدفع"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="alert alert-info">
                <p className="mb-3"><strong>طريقة الدفع:</strong></p>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Check
                      type="radio"
                      label="بواسطة شيك"
                      name="paymentMethod"
                      value="check"
                      checked={formData.paymentMethod === 'check'}
                      onChange={(e) => updateForm('paymentMethod', e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="radio"
                      label="نقداً"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => updateForm('paymentMethod', e.target.value)}
                    />
                  </Col>
                </Row>

                {formData.paymentMethod === 'check' && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>رقم الشيك:</Form.Label>
                        <Form.Control
                          value={formData.checkNumber}
                          onChange={(e) => updateForm('checkNumber', e.target.value)}
                          placeholder="رقم الشيك"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>المؤرخ في:</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.checkDate}
                          onChange={(e) => updateForm('checkDate', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {formData.paymentMethod === 'check' && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>سحب من بنك:</Form.Label>
                        <Form.Control
                          value={formData.bankName}
                          onChange={(e) => updateForm('bankName', e.target.value)}
                          placeholder="اسم البنك"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* الملاحظة الختامية */}
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">ملاحظة ختامية</h6>
            </Card.Header>
            <Card.Body className="bg-light">
              <p className="mb-0">
                <strong>على هذا الأساس تم تحرير هذه المخالصة لتبرئة الجهة المانحة.</strong>
              </p>
            </Card.Body>
          </Card>

          {/* التوقيعات والمصادقة */}
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

              <div className="alert alert-info mb-3">
                <strong>المصادقة:</strong>
              </div>

              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-info">
                    <Card.Header className="bg-info text-white">
                      <Form.Check
                        type="checkbox"
                        label="المصادقة لدى مصالح البلدية (بالنسبة للأشخاص الطبيعيين)"
                        checked={formData.municipalityApproval}
                        onChange={(e) => updateForm('municipalityApproval', e.target.checked)}
                      />
                    </Card.Header>
                    <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-success">
                    <Card.Header className="bg-success text-white">
                      <Form.Check
                        type="checkbox"
                        label="بالنسبة للموردين أو مقدمي الخدمات (الإمضاء والختم)"
                        checked={formData.vendorApproval}
                        onChange={(e) => updateForm('vendorApproval', e.target.checked)}
                      />
                    </Card.Header>
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

export default FinancialDischarge;
