import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 text-primary" dir="rtl">من نحن</h1>
            <p className="lead text-muted" dir="rtl">
              منصة شاملة لتطوير وتنظيم الأنشطة الرياضية في الجزائر
            </p>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-5">
              <h3 className="text-primary mb-4" dir="rtl">رؤيتنا</h3>
              <p className="text-end" dir="rtl">
                نسعى لأن نكون المنصة الرائدة في تطوير الرياضة الجزائرية وتنظيم الأنشطة الرياضية 
                على مستوى جميع الولايات، مع التركيز على اكتشاف المواهب الشابة وتطويرها لتحقيق 
                الإنجازات على المستوى الوطني والدولي.
              </p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-5">
              <h3 className="text-primary mb-4" dir="rtl">مهمتنا</h3>
              <p className="text-end" dir="rtl">
                توفير منصة تقنية متطورة تربط بين جميع الرابطات الولائية والنوادي الرياضية 
                في الجزائر، وتسهل عملية التواصل والتنسيق بين مختلف الأطراف المعنية بالرياضة، 
                مع ضمان الشفافية والتنظيم الفعال للأنشطة الرياضية.
              </p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-5">
              <h3 className="text-primary mb-4" dir="rtl">أهدافنا</h3>
              <ul className="text-end" dir="rtl">
                <li className="mb-2">تنظيم وإدارة الأنشطة الرياضية على مستوى جميع الولايات الجزائرية</li>
                <li className="mb-2">ربط الرابطات الولائية بالنوادي التابعة لها بطريقة فعالة ومنظمة</li>
                <li className="mb-2">توفير معلومات شاملة عن الطاقم الإداري والفني لكل رابطة ونادي</li>
                <li className="mb-2">نشر الأخبار والفعاليات الرياضية بطريقة منظمة وسهلة الوصول</li>
                <li className="mb-2">دعم تطوير المواهب الرياضية الشابة في جميع أنحاء الجزائر</li>
                <li className="mb-2">تعزيز التواصل بين مختلف الأطراف المعنية بالرياضة</li>
              </ul>
            </Card.Body>
          </Card>

          <Row className="text-center">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-primary mb-3">
                    <i className="fas fa-users fa-3x"></i>
                  </div>
                  <h5>فريق متخصص</h5>
                  <p className="text-muted">
                    فريق من المختصين في الرياضة والتكنولوجيا
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-success mb-3">
                    <i className="fas fa-trophy fa-3x"></i>
                  </div>
                  <h5>خبرة واسعة</h5>
                  <p className="text-muted">
                    سنوات من الخبرة في تنظيم الأنشطة الرياضية
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="text-info mb-3">
                    <i className="fas fa-heart fa-3x"></i>
                  </div>
                  <h5>شغف بالرياضة</h5>
                  <p className="text-muted">
                    حب حقيقي للرياضة والتطوير المستمر
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
