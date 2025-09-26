import React, { useState } from 'react';
import { Container, Row, Col, Nav, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import PeriodisationAnnuelle from './PeriodisationAnnuelle';
import { UsersService } from '../../services/firestoreService';

interface TechnicalDirectorDashboardProps {
  technicalDirector: Staff;
  club: Club;
}

const TechnicalDirectorDashboard: React.FC<TechnicalDirectorDashboardProps> = ({ 
  technicalDirector, 
  club,
}) => {
  const [activeSection, setActiveSection] = useState<string>('periodisation');
  const navigate = useNavigate();

  const handleLogout = () => {
    try { UsersService.logout(); } catch {}
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'periodisation':
        return <PeriodisationAnnuelle clubId={club.id} />;

      case 'training-programs':
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0 text-center" dir="rtl">
                <i className="fas fa-clipboard-list me-2"></i>
                البرامج التدريبية
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>سيتم إضافة هذه الميزة قريباً</p>
              </div>
            </Card.Body>
          </Card>
        );

      case 'coach-evaluation':
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0 text-center" dir="rtl">
                <i className="fas fa-user-check me-2"></i>
                تقييم المدربين
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>سيتم إضافة هذه الميزة قريباً</p>
              </div>
            </Card.Body>
          </Card>
        );

      case 'technical-reports':
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0 text-center" dir="rtl">
                <i className="fas fa-file-alt me-2"></i>
                التقارير الفنية
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>سيتم إضافة هذه الميزة قريباً</p>
              </div>
            </Card.Body>
          </Card>
        );

      case 'athlete-development':
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0 text-center" dir="rtl">
                <i className="fas fa-chart-line me-2"></i>
                تطوير الرياضيين
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>سيتم إضافة هذه الميزة قريباً</p>
              </div>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <section className="bg-success text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={9}>
              <h1 className="h3 mb-0 d-flex align-items-center" dir="rtl">
                <i className="fas fa-cogs me-3"></i>
                لوحة تحكم المدير التقني - {technicalDirector.firstNameAr} {technicalDirector.lastNameAr}
              </h1>
            </Col>
            <Col md={3} className="text-center">
              <img
                src={technicalDirector.image || '/images/default-avatar.jpg'}
                alt={`${technicalDirector.firstNameAr} ${technicalDirector.lastNameAr}`}
                className="img-fluid rounded-circle shadow"
                style={{ width: '96px', height: '96px', objectFit: 'cover' }}
              />
              <div className="mt-3">
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  تسجيل الخروج
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation Section */}
      <section className="bg-light py-3">
        <Container>
          <Nav variant="pills" className="justify-content-center flex-wrap">
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'periodisation'}
                onClick={() => setActiveSection('periodisation')}
                className="mx-2 fw-bold mb-2"
              >
                <i className="fas fa-calendar-alt me-2"></i>
                Périodisation Annuelle
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'training-programs'}
                onClick={() => setActiveSection('training-programs')}
                className="mx-2 fw-bold mb-2"
              >
                <i className="fas fa-clipboard-list me-2"></i>
                البرامج التدريبية
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'coach-evaluation'}
                onClick={() => setActiveSection('coach-evaluation')}
                className="mx-2 fw-bold mb-2"
              >
                <i className="fas fa-user-check me-2"></i>
                تقييم المدربين
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'technical-reports'}
                onClick={() => setActiveSection('technical-reports')}
                className="mx-2 fw-bold mb-2"
              >
                <i className="fas fa-file-alt me-2"></i>
                التقارير الفنية
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'athlete-development'}
                onClick={() => setActiveSection('athlete-development')}
                className="mx-2 fw-bold mb-2"
              >
                <i className="fas fa-chart-line me-2"></i>
                تطوير الرياضيين
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-4">
        <Container>
          <Row>
            <Col>
              {renderContent()}
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default TechnicalDirectorDashboard;
