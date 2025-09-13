import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';

const ProfileHeader: React.FC<{ secretary: Staff; clubName: string }> = ({ secretary, clubName }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <img src={secretary.image || '/images/default-avatar.png'} alt={`${secretary.firstName} ${secretary.lastName}`} className="rounded-circle" width="80" height="80" />
        </Col>
        <Col>
          <h4 className="mb-0">{`${secretary.firstName} ${secretary.lastName}`}</h4>
          <p className="text-muted mb-0">{secretary.positionAr} - {clubName}</p>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="mb-3">
    <Card.Header>{title}</Card.Header>
    <Card.Body>
      {children}
    </Card.Body>
  </Card>
);

interface ClubGeneralSecretaryDashboardProps {
  secretary: Staff;
  club: Club;
}

const ClubGeneralSecretaryDashboard: React.FC<ClubGeneralSecretaryDashboardProps> = ({ secretary, club }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    UsersService.logout();
    navigate('/login');
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-end mb-4">
        <Button variant="outline-danger" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>
          تسجيل الخروج
        </Button>
      </div>

      <ProfileHeader secretary={secretary} clubName={club.nameAr} />

      <Tab.Container defaultActiveKey="responsibilities">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="responsibilities">المسؤوليات الإدارية</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="profile">الملف الشخصي</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="contact">معلومات الاتصال</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="responsibilities">
            <Row>
              <Col md={3}>
                <InfoCard title="إدارة الملفات">
                  <p>توثيق وإدارة جميع ملفات النادي الإدارية والفنية.</p>
                </InfoCard>
              </Col>
              <Col md={3}>
                <InfoCard title="تنظيم الاجتماعات">
                  <p>تنسيق وتنظيم اجتماعات مجلس الإدارة والجمعيات العمومية.</p>
                </InfoCard>
              </Col>
              <Col md={3}>
                <InfoCard title="التواصل الرسمي">
                  <p>إدارة المراسلات الرسمية والتواصل مع الهيئات الخارجية.</p>
                </InfoCard>
              </Col>
              <Col md={3}>
                <InfoCard title="إعداد التقارير">
                  <p>إعداد التقارير الدورية والإحصائيات الخاصة بأنشطة النادي.</p>
                </InfoCard>
              </Col>
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="profile">
            <InfoCard title="السيرة الذاتية">
              <p>{secretary.bioAr || 'لا توجد سيرة ذاتية متاحة.'}</p>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="contact">
            <InfoCard title="معلومات الاتصال">
              <p><strong>البريد الإلكتروني:</strong> {secretary.email || 'غير متوفر'}</p>
              <p><strong>الهاتف:</strong> {secretary.phone || 'غير متوفر'}</p>
            </InfoCard>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ClubGeneralSecretaryDashboard;
