import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';
import InventoryTable from '../president/InventoryTable';
import MissionOrder from '../president/MissionOrder';

const ProfileHeader: React.FC<{ president: Staff; clubName: string }> = ({ president, clubName }) => (
  <Card className="mb-4">
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <img src={president.image || '/images/default-avatar.png'} alt={`${president.firstName} ${president.lastName}`} className="rounded-circle" width="80" height="80" />
        </Col>
        <Col>
          <h4 className="mb-0">{`${president.firstName} ${president.lastName}`}</h4>
          <p className="text-muted mb-0">{president.positionAr} - {clubName}</p>
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

interface ClubPresidentDashboardProps {
  president: Staff;
  club: Club;
}

const ClubPresidentDashboard: React.FC<ClubPresidentDashboardProps> = ({ president, club }) => {
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

      <ProfileHeader president={president} clubName={club.nameAr} />

      <Tab.Container defaultActiveKey="dashboard">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="dashboard">
              <i className="fas fa-tachometer-alt me-2"></i>
              لوحة التحكم
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="inventory">
              <i className="fas fa-list me-2"></i>
              جدول الجرد
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="mission-order">
              <i className="fas fa-file-alt me-2"></i>
              أمر القيام بمهمة
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="dashboard">
            <Row>
              <Col md={4}>
                <InfoCard title="عدد الأعضاء">
                  <h3 className="text-success">250 عضو</h3>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="الأنشطة الجارية">
                  <h3 className="text-info">5 أنشطة</h3>
                </InfoCard>
              </Col>
              <Col md={4}>
                <InfoCard title="الميزانية السنوية">
                  <h3 className="text-warning">150,000 دج</h3>
                </InfoCard>
              </Col>
            </Row>
            <InfoCard title="آخر الإجراءات">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الإجراء</th>
                    <th>المسؤول</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-08-20</td>
                    <td>اجتماع المكتب التنفيذي</td>
                    <td>الرئيس</td>
                    <td><Badge bg="success">مكتمل</Badge></td>
                  </tr>
                  <tr>
                    <td>2024-08-15</td>
                    <td>جرد الأملاك والمعدات</td>
                    <td>أمين المال</td>
                    <td><Badge bg="warning">قيد الإنجاز</Badge></td>
                  </tr>
                  <tr>
                    <td>2024-08-10</td>
                    <td>تقرير مالي شهري</td>
                    <td>أمين المال</td>
                    <td><Badge bg="success">مكتمل</Badge></td>
                  </tr>
                </tbody>
              </Table>
            </InfoCard>
          </Tab.Pane>
          <Tab.Pane eventKey="inventory">
            <InventoryTable />
          </Tab.Pane>
          <Tab.Pane eventKey="mission-order">
            <MissionOrder />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ClubPresidentDashboard;
