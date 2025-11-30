import React from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminTechnicalCard from '../../components/admin/AdminTechnicalCard';

const TechnicalCardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="technical-card-page" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container fluid className="py-4">
        {/* شريط العنوان */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-right me-2"></i>
                  رجوع
                </Button>
                <h2 className="mb-0" style={{ color: '#1976d2' }}>
                  <i className="fas fa-clipboard-list me-2"></i>
                  البطاقة الفنية للمدرب - قوالب الإدارة
                </h2>
              </div>
            </div>
          </Col>
        </Row>

        {/* رسالة توضيحية */}
        <Row className="mb-3">
          <Col>
            <Alert variant="info" className="d-flex align-items-center">
              <i className="fas fa-info-circle me-2 fa-lg"></i>
              <div>
                <strong>ملاحظة:</strong> البطاقات الفنية التي تحفظها هنا ستظهر كقوالب افتراضية لجميع المدربين.
                عند اختيار رقم حصة معين وحفظ البطاقة، سيراها كل مدرب عند فتح نفس رقم الحصة في صفحته.
                يمكن للمدرب بعد ذلك التعديل عليها حسب احتياجاته.
              </div>
            </Alert>
          </Col>
        </Row>

        {/* البطاقة الفنية */}
        <Row>
          <Col>
            <AdminTechnicalCard />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TechnicalCardPage;
