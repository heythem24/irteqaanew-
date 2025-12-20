import React from 'react';
import { Container, Card, Row, Col, Nav, Tab, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService } from '../../services/firestoreService';
import PaidExpenses from '../treasurer/PaidExpenses';
import ClubFinancialStatus from '../treasurer/ClubFinancialStatus';
import BankToCashTransfer from '../treasurer/BankToCashTransfer';
import CashToBankTransfer from '../treasurer/CashToBankTransfer';
import MissionExpenseStatus from '../treasurer/MissionExpenseStatus';
import CompensationCalculation from '../treasurer/CompensationCalculation';
import ExpenseCertificate from '../treasurer/ExpenseCertificate';
import RevenueCertificate from '../treasurer/RevenueCertificate';
import OperationReport from '../treasurer/OperationReport';
import CashClosureReport from '../treasurer/CashClosureReport';
import PhysicalDischarge from '../treasurer/PhysicalDischarge';
import FinancialDischarge from '../treasurer/FinancialDischarge';
import DischargeReceiptExtract from '../treasurer/DischargeReceiptExtract';

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

      <Tab.Container defaultActiveKey="dashboard">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="dashboard">
              <i className="fas fa-tachometer-alt me-2"></i>
              لوحة التحكم
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="paid-expenses">
              <i className="fas fa-money-bill-wave me-2"></i>
              المصاريف المدفوعة
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="financial-status">
              <i className="fas fa-chart-pie me-2"></i>
              الوضعية المالية
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="bank-to-cash">
              <i className="fas fa-exchange-alt me-2"></i>
              تحويل من البنك للصندوق
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="cash-to-bank">
              <i className="fas fa-university me-2"></i>
              تحويل من الصندوق للبنك
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="mission-expense">
              <i className="fas fa-tasks me-2"></i>
              حالة مصاريف المهمة
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="compensation">
              <i className="fas fa-calculator me-2"></i>
              حساب التعويضات
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="expense-certificate">
              <i className="fas fa-certificate me-2"></i>
              شهادة إثبات مصاريف
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="revenue-certificate">
              <i className="fas fa-file-invoice-dollar me-2"></i>
              شهادة إثبات إيرادات
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="operation-report">
              <i className="fas fa-file-alt me-2"></i>
              عرض حال
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="cash-closure">
              <i className="fas fa-lock me-2"></i>
              محضر قفل الصندوق
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="physical-discharge">
              <i className="fas fa-box me-2"></i>
              مخالصة مادية
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="financial-discharge">
              <i className="fas fa-receipt me-2"></i>
              مخالصة مالية
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="discharge-receipt">
              <i className="fas fa-file-contract me-2"></i>
              مستخرج وصل تبرئة الذمة
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="dashboard">
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
          <Tab.Pane eventKey="paid-expenses">
            <PaidExpenses />
          </Tab.Pane>
          <Tab.Pane eventKey="financial-status">
            <ClubFinancialStatus />
          </Tab.Pane>
          <Tab.Pane eventKey="bank-to-cash">
            <BankToCashTransfer />
          </Tab.Pane>
          <Tab.Pane eventKey="cash-to-bank">
            <CashToBankTransfer />
          </Tab.Pane>
          <Tab.Pane eventKey="mission-expense">
            <MissionExpenseStatus />
          </Tab.Pane>
          <Tab.Pane eventKey="compensation">
            <CompensationCalculation />
          </Tab.Pane>
          <Tab.Pane eventKey="expense-certificate">
            <ExpenseCertificate />
          </Tab.Pane>
          <Tab.Pane eventKey="revenue-certificate">
            <RevenueCertificate />
          </Tab.Pane>
          <Tab.Pane eventKey="operation-report">
            <OperationReport />
          </Tab.Pane>
          <Tab.Pane eventKey="cash-closure">
            <CashClosureReport />
          </Tab.Pane>
          <Tab.Pane eventKey="physical-discharge">
            <PhysicalDischarge />
          </Tab.Pane>
          <Tab.Pane eventKey="financial-discharge">
            <FinancialDischarge />
          </Tab.Pane>
          <Tab.Pane eventKey="discharge-receipt">
            <DischargeReceiptExtract />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ClubTreasurerDashboard;
