import React, { useState } from 'react';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

const DiscountCertificate: React.FC = () => {
  const [formData, setFormData] = useState({
    // القسم 1: التعريف بالمؤسسة
    institutionAddress: '',
    mainActivity: '',
    commercialRegister: '',
    taxId: '',
    // القسم 2: التعريف بالهيئة المستفيدة
    beneficiaryEntity: '',
    decreeNumber: '',
    decreeDate: '',
    entityCommercialRegister: '',
    entityRegisterDate: '',
    entityTaxId: '',
    // القسم 3: تعيين النشاط المحقق
    expenseAmount: '',
    proofDocuments: '',
    // التوقيع
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-certificate me-3"></i>
          شهادة التعريف بالمؤسسة المستفيدة من الخصم
        </h2>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4" dir="rtl">
          {/* الترويسة */}
          <div className="text-center mb-4 p-3 bg-light rounded">
            <p className="text-muted mb-1">الجريدة الرسمية للجمهورية الجزائرية</p>
            <h4 className="text-primary mb-2">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
            <h5 className="border-bottom border-primary pb-2 d-inline-block">
              شهادة التعريف بالمؤسسة المستفيدة من الخصم والهيئة المستفيدة من الإشهار المالي والكفالة أو الرعاية والنشاط الرياضي
            </h5>
          </div>

          {/* القسم 1: التعريف بالمؤسسة المستفيدة من الخصم */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <span className="badge bg-light text-primary me-2">1</span>
                التعريف بالمؤسسة المستفيدة من الخصم
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>العنوان الاجتماعي للمؤسسة:</Form.Label>
                    <Form.Control
                      value={formData.institutionAddress}
                      onChange={(e) => updateForm('institutionAddress', e.target.value)}
                      placeholder="أدخل العنوان الاجتماعي للمؤسسة"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>النشاط الرئيسي:</Form.Label>
                    <Form.Control
                      value={formData.mainActivity}
                      onChange={(e) => updateForm('mainActivity', e.target.value)}
                      placeholder="أدخل النشاط الرئيسي"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>رقم السجل التجاري:</Form.Label>
                    <Form.Control
                      value={formData.commercialRegister}
                      onChange={(e) => updateForm('commercialRegister', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>رقم التعريف الجبائي:</Form.Label>
                    <Form.Control
                      value={formData.taxId}
                      onChange={(e) => updateForm('taxId', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* القسم 2: التعريف بالهيئة المستفيدة */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <span className="badge bg-light text-success me-2">2</span>
                التعريف بالهيئة المستفيدة من الإشهار المالي أو الكفالة أو الرعاية
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>الهيئة المستفيدة:</Form.Label>
                    <Form.Control
                      value={formData.beneficiaryEntity}
                      onChange={(e) => updateForm('beneficiaryEntity', e.target.value)}
                      placeholder="أدخل اسم الهيئة المستفيدة"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>مرسوم / قرار الإنشاء / اعتماد:</Form.Label>
                    <Form.Control
                      value={formData.decreeNumber}
                      onChange={(e) => updateForm('decreeNumber', e.target.value)}
                      placeholder="رقم المرسوم أو القرار"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>مؤرخ في:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.decreeDate}
                      onChange={(e) => updateForm('decreeDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم السجل التجاري:</Form.Label>
                    <Form.Control
                      value={formData.entityCommercialRegister}
                      onChange={(e) => updateForm('entityCommercialRegister', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تاريخ التسليم:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.entityRegisterDate}
                      onChange={(e) => updateForm('entityRegisterDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم التعريف الجبائي:</Form.Label>
                    <Form.Control
                      value={formData.entityTaxId}
                      onChange={(e) => updateForm('entityTaxId', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* القسم 3: تعيين النشاط المحقق */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <span className="badge bg-light text-info me-2">3</span>
                تعيين النشاط المحقق
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>مبلغ النفقات الموظفة من طرف المؤسسة:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.expenseAmount}
                      onChange={(e) => updateForm('expenseAmount', e.target.value)}
                      placeholder="أدخل مبلغ النفقات بالأرقام والحروف"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>وثائق ومستندات الإثبات:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.proofDocuments}
                      onChange={(e) => updateForm('proofDocuments', e.target.value)}
                      placeholder="اذكر الوثائق والمستندات المرفقة للإثبات"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* التوقيع */}
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

              <Row className="justify-content-center">
                <Col md={6}>
                  <Card className="text-center">
                    <Card.Header className="bg-warning text-dark">
                      المؤسسة / الهيئة المستفيدة
                      <br />
                      <small>(التأشيرة والإمضاء)</small>
                    </Card.Header>
                    <Card.Body style={{ minHeight: '150px', border: '2px dashed #ffc107', borderRadius: '8px' }}>
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

export default DiscountCertificate;
