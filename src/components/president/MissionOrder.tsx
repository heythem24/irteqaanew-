import React, { useState } from 'react';
import { Container, Card, Form, Row, Col } from 'react-bootstrap';

const MissionOrder: React.FC = () => {
  const [formData, setFormData] = useState({
    state: 'سطيف',
    associationName: '',
    address: '',
    firstName: '',
    lastName: '',
    position: '',
    administrativeResidence: '',
    destination: '',
    missionReason: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    transportMeans: '',
    registrationNumber: '',
    companions: '',
    place: '',
    date: ''
  });

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <div className="text-center mb-3">
          <p className="mb-2"><strong>الجمهورية الجزائرية الديمقراطية الشعبية</strong></p>
          <p className="mb-3"><strong></strong></p>
          <h2>أمر القيام بمهمة - Ordre de Mission</h2>
        </div>
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
            </Card.Body>
          </Card>

          {/* بيانات المكلف بالمهمة */}
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">بيانات المكلف بالمهمة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>الاسم:</Form.Label>
                    <Form.Control
                      value={formData.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      placeholder="الاسم الأول"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>اللقب:</Form.Label>
                    <Form.Control
                      value={formData.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      placeholder="اللقب"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>الصفة:</Form.Label>
                    <Form.Control
                      value={formData.position}
                      onChange={(e) => updateForm('position', e.target.value)}
                      placeholder="الصفة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>الإقامة الإدارية:</Form.Label>
                    <Form.Control
                      value={formData.administrativeResidence}
                      onChange={(e) => updateForm('administrativeResidence', e.target.value)}
                      placeholder="الإقامة الإدارية"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* تفاصيل المهمة */}
          <Card className="mb-4 border-success">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">تفاصيل المهمة</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>الاتجاه إلى:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.destination}
                      onChange={(e) => updateForm('destination', e.target.value)}
                      placeholder="الوجهة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>سبب المهمة:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.missionReason}
                      onChange={(e) => updateForm('missionReason', e.target.value)}
                      placeholder="سبب المهمة"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تاريخ الذهاب:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => updateForm('departureDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الساعة:</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => updateForm('departureTime', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>تاريخ الرجوع:</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => updateForm('returnDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>الساعة:</Form.Label>
                    <Form.Control
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => updateForm('returnTime', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>وسائل النقل المستعملة:</Form.Label>
                    <Form.Control
                      value={formData.transportMeans}
                      onChange={(e) => updateForm('transportMeans', e.target.value)}
                      placeholder="وسائل النقل"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>رقم التسجيل:</Form.Label>
                    <Form.Control
                      value={formData.registrationNumber}
                      onChange={(e) => updateForm('registrationNumber', e.target.value)}
                      placeholder="رقم التسجيل"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>المرافقون:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.companions}
                      onChange={(e) => updateForm('companions', e.target.value)}
                      placeholder="أسماء المرافقين"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* التوقيع والملاحظة */}
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

              <div className="text-center mb-4">
                <Card className="text-center">
                  <Card.Header className="bg-light">الرئيس</Card.Header>
                  <Card.Body style={{ minHeight: '80px', border: '2px dashed #ccc', borderRadius: '8px' }}></Card.Body>
                </Card>
              </div>

              <div className="alert alert-info">
                <p className="mb-2"><strong>هام:</strong></p>
                <p className="mb-0">
                  على السلطات المدنية و العسكرية تسهيل مهمة الحامل لأمر القيام بمهمة و مده يد العون و المساعدة إن اقتضت الضرورة لذلك.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MissionOrder;
