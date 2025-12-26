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
                البرنامج السنوي
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
