import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, League } from '../../types';
import { UsersService } from '../../services/firestoreService';

const ProfileHeader: React.FC<{ president: Staff; leagueName: string }> = ({ president, leagueName }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <img src={president.image || '/images/default-avatar.png'} alt={`${president.firstName} ${president.lastName}`} className="rounded-circle" width="80" height="80" />
        </Col>
        <Col>
          <h4 className="mb-0">{`${president.firstName} ${president.lastName}`}</h4>
          <p className="text-muted mb-0">{president.positionAr} - {leagueName}</p>
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

interface LeaguePresidentDashboardProps {
  president: Staff;
  league: League;
}

const LeaguePresidentDashboard: React.FC<LeaguePresidentDashboardProps> = ({ president, league }) => {
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

      <ProfileHeader president={president} leagueName={league.nameAr} />

      <Tab.Container defaultActiveKey="profile">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="profile">الملف الشخصي</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="contact">معلومات الاتصال</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="responsibilities">المسؤوليات</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <InfoCard title="السيرة الذاتية">
              <p>{president.bioAr || 'لا توجد سيرة ذاتية متاحة.'}</p>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="contact">
            <InfoCard title="معلومات الاتصال">
              <p><strong>البريد الإلكتروني:</strong> {president.email || 'غير متوفر'}</p>
              <p><strong>الهاتف:</strong> {president.phone || 'غير متوفر'}</p>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="responsibilities">
            <Row>
              <Col md={4}>
                <InfoCard title="التمثيل الرسمي">
                  <p>تمثيل الرابطة رسمياً في المحافل الرياضية والإدارية.</p>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="الإشراف العام">
                  <p>الإشراف على كافة أنشطة الرابطة واللجان العاملة.</p>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="العلاقات العامة">
                  <p>بناء وتعزيز العلاقات مع الهيئات الرياضية والشركاء.</p>
                </InfoCard>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default LeaguePresidentDashboard;
