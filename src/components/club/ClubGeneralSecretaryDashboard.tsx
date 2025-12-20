import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';
import TrainingContract from '../league-general-secretary/TrainingContract';
import HandoverReport from '../league-general-secretary/HandoverReport';
import FoundingMembersList from '../league-general-secretary/FoundingMembersList';
import ExecutiveBoardList from '../league-general-secretary/ExecutiveBoardList';
import OrderVoucher from '../league-general-secretary/OrderVoucher';
import DiscountCertificate from '../league-general-secretary/DiscountCertificate';
import MeetingMinutes from '../league-general-secretary/MeetingMinutes';

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

      <Tab.Container defaultActiveKey="training-contract">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="training-contract">
              <i className="fas fa-file-contract me-2"></i>
              عقد تدريب
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="handover-report">
              <i className="fas fa-file-signature me-2"></i>
              محضر تسليم واستلام
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="founding-members">
              <i className="fas fa-users me-2"></i>
              قائمة الأعضاء المؤسسين
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="executive-board">
              <i className="fas fa-user-tie me-2"></i>
              قائمة أعضاء المكتب التنفيذي
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="order-voucher">
              <i className="fas fa-file-invoice me-2"></i>
              سند طلبية
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="discount-certificate">
              <i className="fas fa-certificate me-2"></i>
              شهادة التعريف بالمؤسسة
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="meeting-minutes">
              <i className="fas fa-file-alt me-2"></i>
              مستخرج مداولة
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="training-contract">
            <TrainingContract />
          </Tab.Pane>
          <Tab.Pane eventKey="handover-report">
            <HandoverReport />
          </Tab.Pane>
          <Tab.Pane eventKey="founding-members">
            <FoundingMembersList />
          </Tab.Pane>
          <Tab.Pane eventKey="executive-board">
            <ExecutiveBoardList />
          </Tab.Pane>
          <Tab.Pane eventKey="order-voucher">
            <OrderVoucher />
          </Tab.Pane>
          <Tab.Pane eventKey="discount-certificate">
            <DiscountCertificate />
          </Tab.Pane>
          <Tab.Pane eventKey="meeting-minutes">
            <MeetingMinutes />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ClubGeneralSecretaryDashboard;
