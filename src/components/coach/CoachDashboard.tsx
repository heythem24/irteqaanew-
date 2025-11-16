import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import type { Staff, Club } from '../../types';
import { UsersService as UserService } from '../../services/firestoreService';
import AthleteManagement from './AthleteManagement';
import TechnicalCard from './TechnicalCard';
import TrainingLoadDistribution from './TrainingLoadDistribution';
import BeltManagement from './BeltManagement';

interface CoachDashboardProps {
  coach: Staff;
  club: Club;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ coach, club }) => {
  const [activeSection, setActiveSection] = useState<string>('technical-profile');
  const navigate = useNavigate();

  const [linkedLoadData, setLinkedLoadData] = useState<{ unitNumber: number; intensity: number; heartRate: number } | null>(null);

  const handleLogout = () => {
    UserService.logout();
    navigate('/login');
  };


  // Simple state management instead of complex hook
  const [personalSections, setPersonalSections] = useState<any[]>([]);
  const [loadingPersonalSections, setLoadingPersonalSections] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const refreshAll = async () => {
    setLoadingPersonalSections(true);
    try {
      // Simple placeholder data - this can be enhanced later
      setPersonalSections([]);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل البيانات');
    } finally {
      setLoadingPersonalSections(false);
    }
  };

  const handleApplyTrainingLoadToCard = (data: { unitNumber: number; intensity: number; heartRate: number }) => {
    setLinkedLoadData(data);
  };

  // Load data on mount
  useEffect(() => {
    refreshAll();
  }, []);

  const renderPersonalSection = (section: any) => (
    <Card className="shadow-sm" key={section.id}>
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0 text-center" dir="rtl">
          <i className={`${section.icon || 'fas fa-info-circle'} me-2`}></i>
          {section.titleAr}
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="text-end" dir="rtl">
          <div dangerouslySetInnerHTML={{ __html: section.contentAr?.replace(/\n/g, '<br>') }} />
        </div>
      </Card.Body>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'technical-profile':
        return <TechnicalCard club={club} linkedLoadData={linkedLoadData} />;

      case 'training-load':
        return <TrainingLoadDistribution club={club} onApplyToTechnicalCard={handleApplyTrainingLoadToCard} />;

      case 'athlete-management':
        return <AthleteManagement club={club} />;

      case 'belt-promotions':
        return <BeltManagement club={club} />;


      default:
        // Check if it's a dynamic personal section
        const section = personalSections.find(s => activeSection === `personal-${s.id}`);
        if (section) {
          return renderPersonalSection(section);
        }
        return null;
    }
  };

  // Show loading state
  if (loadingPersonalSections) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">جاري التحميل...</span>
          </Spinner>
          <div>جاري تحميل بيانات المدرب...</div>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          <Alert.Heading>خطأ</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      {/* Header Section */}
      <section className="bg-primary text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={9}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <Link
                  to={`/club/${club.id}`}
                  className="btn btn-outline-light me-3"
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للنادي
                </Link>
                <Button variant="outline-danger" onClick={handleLogout}>
                  تسجيل الخروج
                </Button>
              </div>
              <h1 className="h3 mb-0 d-flex align-items-center" dir="rtl">
                <i className="fas fa-user-graduate me-3"></i>
                <span>لوحة تحكم المدرب - {coach.firstNameAr} {coach.lastNameAr}</span>
              </h1>
            </Col>
            <Col md={3} className="text-center">
              <img
                src={coach.image || '/images/default-avatar.jpg'}
                alt={`${coach.firstNameAr} ${coach.lastNameAr}`}
                className="img-fluid rounded-circle shadow"
                style={{ width: '96px', height: '96px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation Section */}
      <section className="bg-light py-3">
        <Container>
          <Nav variant="pills" className="justify-content-center">
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'technical-profile'}
                onClick={() => setActiveSection('technical-profile')}
                className="mx-2 fw-bold"
              >
                <i className="fas fa-id-card me-2"></i>
                البطاقة الفنية
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'training-load'}
                onClick={() => setActiveSection('training-load')}
                className="mx-2 fw-bold"
              >
                <i className="fas fa-chart-line me-2"></i>
                توزيع درجة حمل التدريب
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'athlete-management'}
                onClick={() => setActiveSection('athlete-management')}
                className="mx-2 fw-bold"
              >
                <i className="fas fa-users me-2"></i>
                إدارة الرياضيين
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeSection === 'belt-promotions'}
                onClick={() => setActiveSection('belt-promotions')}
                className="mx-2 fw-bold"
              >
                <i className="fas fa-medal me-2"></i>
                ترقيات الأحزمة
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/coach/competitions"
                className="mx-2 fw-bold"
              >
                <i className="fas fa-trophy me-2"></i>
                المنافسات
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Link}
                to={`/club/${club.id}/staff/coach/chat`}
                className="mx-2 fw-bold"
              >
                <i className="fas fa-comments me-2"></i>
                الدردشة
              </Nav.Link>
            </Nav.Item>
            {/* Dynamic personal sections navigation */}
            {personalSections.map((section) => (
              <Nav.Item key={section.id}>
                <Nav.Link
                  active={activeSection === `personal-${section.id}`}
                  onClick={() => setActiveSection(`personal-${section.id}`)}
                  className="mx-2 fw-bold"
                >
                  <i className={`${section.icon || 'fas fa-info-circle'} me-2`}></i>
                  {section.titleAr}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-4">
        <Container>
          {renderContent()}
        </Container>
      </section>
    </div>
  );
};

export default CoachDashboard;