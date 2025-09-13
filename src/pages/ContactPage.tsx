import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 text-primary" dir="rtl">اتصل بنا</h1>
            <p className="lead text-muted" dir="rtl">
              نحن هنا للإجابة على استفساراتكم ومساعدتكم
            </p>
          </div>

          <Row>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body className="p-4">
                  <h4 className="text-primary mb-4" dir="rtl">معلومات الاتصال</h4>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="text-primary me-3">
                        <i className="fas fa-map-marker-alt fa-lg"></i>
                      </div>
                      <div className="text-end" dir="rtl">
                        <h6 className="mb-1">العنوان</h6>
                        <p className="text-muted mb-0">عين البيضاء , ولاية أم البواقي</p>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="text-primary me-3">
                        <i className="fas fa-phone fa-lg"></i>
                      </div>
                      <div className="text-end" dir="rtl">
                        <h6 className="mb-1">الهاتف</h6>
                        <p className="text-muted mb-0">+213 21 123 456</p>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="text-primary me-3">
                        <i className="fas fa-envelope fa-lg"></i>
                      </div>
                      <div className="text-end" dir="rtl">
                        <h6 className="mb-1">البريد الإلكتروني</h6>
                        <p className="text-muted mb-0">info@sports-algeria.dz</p>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="text-primary me-3">
                        <i className="fas fa-clock fa-lg"></i>
                      </div>
                      <div className="text-end" dir="rtl">
                        <h6 className="mb-1">ساعات العمل</h6>
                        <p className="text-muted mb-0">
                          الأحد - الخميس: 8:00 - 17:00<br />
                          السبت: 8:00 - 12:00
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="social-links text-center">
                    <h6 className="mb-3" dir="rtl">تابعونا على</h6>
                    <div className="d-flex justify-content-center gap-3">
                      <a href="#" className="text-primary">
                        <i className="fab fa-facebook-f fa-2x"></i>
                      </a>
                      <a href="#" className="text-info">
                        <i className="fab fa-twitter fa-2x"></i>
                      </a>
                      <a href="#" className="text-danger">
                        <i className="fab fa-instagram fa-2x"></i>
                      </a>
                      <a href="#" className="text-danger">
                        <i className="fab fa-youtube fa-2x"></i>
                      </a>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body className="p-4">
                  <h4 className="text-primary mb-4" dir="rtl">أرسل لنا رسالة</h4>
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-end d-block" dir="rtl">الاسم الأول</Form.Label>
                          <Form.Control 
                            type="text" 
                            required 
                            className="text-end"
                            dir="rtl"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-end d-block" dir="rtl">اسم العائلة</Form.Label>
                          <Form.Control 
                            type="text" 
                            required 
                            className="text-end"
                            dir="rtl"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="text-end d-block" dir="rtl">البريد الإلكتروني</Form.Label>
                      <Form.Control 
                        type="email" 
                        required 
                        className="text-end"
                        dir="rtl"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="text-end d-block" dir="rtl">رقم الهاتف</Form.Label>
                      <Form.Control 
                        type="tel" 
                        className="text-end"
                        dir="rtl"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="text-end d-block" dir="rtl">الموضوع</Form.Label>
                      <Form.Select className="text-end" dir="rtl">
                        <option value="">اختر الموضوع</option>
                        <option value="general">استفسار عام</option>
                        <option value="league">حول الرابطات</option>
                        <option value="club">حول النوادي</option>
                        <option value="technical">مشكلة تقنية</option>
                        <option value="suggestion">اقتراح</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="text-end d-block" dir="rtl">الرسالة</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4} 
                        required 
                        className="text-end"
                        dir="rtl"
                        placeholder="اكتب رسالتك هنا..."
                      />
                    </Form.Group>
                    
                    <div className="text-center">
                      <Button type="submit" variant="primary" size="lg">
                        إرسال الرسالة
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
