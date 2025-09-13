import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';

const ProfileHeader: React.FC<{ treasurer: Staff; clubName: string }> = ({ treasurer, clubName }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <img src={treasurer.image || '/images/default-avatar.png'} alt={`${treasurer.firstName} ${treasurer.lastName}`} className="rounded-circle" width="80" height="80" />
        </Col>
        <Col>
          <h4 className="mb-0">{`${treasurer.firstName} ${treasurer.lastName}`}</h4>
          <p className="text-muted mb-0">{treasurer.positionAr} - {clubName}</p>
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

interface ClubTreasurerDashboardProps {
  treasurer: Staff;
  club: Club;
}

const ClubTreasurerDashboard: React.FC<ClubTreasurerDashboardProps> = ({ treasurer, club }) => {
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

      <ProfileHeader treasurer={treasurer} clubName={club.nameAr} />

      <Tab.Container defaultActiveKey="financials">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="financials">البيانات المالية</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="profile">الملف الشخصي</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="contact">معلومات الاتصال</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="financials">
            <Row>
              <Col md={4}>
                <InfoCard title="الميزانية السنوية">
                  <h3 className="text-success">{Math.floor(Math.random() * 50000) + 100000} دج</h3>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="الإيرادات الشهرية">
                  <h3 className="text-info">{Math.floor(Math.random() * 20000) + 50000} دج</h3>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="المصاريف الشهرية">
                  <h3 className="text-danger">{Math.floor(Math.random() * 15000) + 30000} دج</h3>
                </InfoCard>
              </Col>
            </Row>
            <InfoCard title="آخر المعاملات">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الوصف</th>
                    <th>المبلغ</th>
                    <th>النوع</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-08-01</td>
                    <td>اشتراك أعضاء الشهر</td>
                    <td className="text-success">+25,000 دج</td>
                    <td><Badge bg="success">إيراد</Badge></td>
                  </tr>
                  <tr>
                    <td>2024-07-28</td>
                    <td>شراء معدات تدريب</td>
                    <td className="text-danger">-15,000 دج</td>
                    <td><Badge bg="danger">مصروف</Badge></td>
                  </tr>
                  <tr>
                    <td>2024-07-25</td>
                    <td>رسوم تسجيل البطولة</td>
                    <td className="text-success">+8,000 دج</td>
                    <td><Badge bg="success">إيراد</Badge></td>
                  </tr>
                </tbody>
              </Table>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="profile">
            <InfoCard title="السيرة الذاتية">
              <p>{treasurer.bioAr || 'لا توجد سيرة ذاتية متاحة.'}</p>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="contact">
            <InfoCard title="معلومات الاتصال">
              <p><strong>البريد الإلكتروني:</strong> {treasurer.email || 'غير متوفر'}</p>
              <p><strong>الهاتف:</strong> {treasurer.phone || 'غير متوفر'}</p>
            </InfoCard>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ClubTreasurerDashboard;
