import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, League } from '../../types';
import { UsersService } from '../../services/firestoreService';

const ProfileHeader: React.FC<{ treasurer: Staff; leagueName: string }> = ({ treasurer, leagueName }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <img src={treasurer.image || '/images/default-avatar.png'} alt={`${treasurer.firstName} ${treasurer.lastName}`} className="rounded-circle" width="80" height="80" />
        </Col>
        <Col>
          <h4 className="mb-0">{`${treasurer.firstName} ${treasurer.lastName}`}</h4>
          <p className="text-muted mb-0">{treasurer.positionAr} - {leagueName}</p>
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

interface LeagueTreasurerDashboardProps {
  treasurer: Staff;
  league: League;
}

const LeagueTreasurerDashboard: React.FC<LeagueTreasurerDashboardProps> = ({ treasurer, league }) => {
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

      <ProfileHeader treasurer={treasurer} leagueName={league.nameAr} />

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
              <Col md={6}>
                <InfoCard title="ملخص الميزانية">
                  <p><strong>الميزانية السنوية:</strong> 500,000 دج</p>
                  <p><strong>الإيرادات:</strong> 150,000 دج</p>
                  <p><strong>المصروفات:</strong> 120,000 دج</p>
                  <p><strong>الرصيد الحالي:</strong> 530,000 دج</p>
                </InfoCard>
              </Col>
              <Col md={6}>
                <InfoCard title="آخر المعاملات">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2023-10-26</td>
                        <td>دعم الأندية</td>
                        <td>-50,000 دج</td>
                        <td><Badge bg="success">مكتملة</Badge></td>
                      </tr>
                      <tr>
                        <td>2023-10-20</td>
                        <td>رسوم التسجيل</td>
                        <td>+25,000 دج</td>
                        <td><Badge bg="success">مكتملة</Badge></td>
                      </tr>
                      <tr>
                        <td>2023-10-15</td>
                        <td>مصاريف إدارية</td>
                        <td>-5,000 دج</td>
                        <td><Badge bg="warning">قيد المراجعة</Badge></td>
                      </tr>
                    </tbody>
                  </Table>
                </InfoCard>
              </Col>
            </Row>
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

export default LeagueTreasurerDashboard;
