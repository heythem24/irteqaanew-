import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Staff } from '../../types';

interface StaffMemberPageProps {
  staff: Staff;
  leagueId?: string;
  clubId?: string;
  additionalInfo?: {
    achievements?: string[];
    experience?: string;
    responsibilities?: string[];
    education?: string[];
    certifications?: string[];
    projects?: string[];
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
}

const StaffMemberPage: React.FC<StaffMemberPageProps> = ({ 
  staff, 
  leagueId, 
  clubId, 
  additionalInfo 
}) => {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'league_president':
        return 'success';
      case 'technical_director':
        return 'danger';
      case 'general_secretary':
        return 'warning';
      case 'treasurer':
        return 'info';
      case 'coach':
        return 'primary';
      case 'physical_trainer':
        return 'secondary';
      default:
        return 'dark';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'league_president':
        return 'fas fa-crown';
      case 'technical_director':
        return 'fas fa-cogs';
      case 'general_secretary':
        return 'fas fa-file-alt';
      case 'treasurer':
        return 'fas fa-calculator';
      case 'coach':
        return 'fas fa-user-graduate';
      case 'physical_trainer':
        return 'fas fa-dumbbell';
      default:
        return 'fas fa-user';
    }
  };

  const positionColor = getPositionColor(staff.position);
  const positionIcon = getPositionIcon(staff.position);

  return (
    <div>
      {/* Header Section */}
      <section className={`bg-${positionColor} text-white py-5`}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center mb-3">
                <Button
                  as={Link as any}
                  to={leagueId ? `/league/${leagueId}` : `/club/${clubId}`}
                  variant="outline-light"
                  className="me-3"
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة
                </Button>
              </div>
              <h1 className="display-5 fw-bold mb-3" dir="rtl">
                <i className={`${positionIcon} me-3`}></i>
                {staff.firstNameAr} {staff.lastNameAr}
              </h1>
              <p className="lead mb-3" dir="rtl">
                {staff.positionAr}
              </p>
              {additionalInfo?.experience && (
                <Badge bg="light" text="dark" className="fs-6 me-2">
                  {additionalInfo.experience}
                </Badge>
              )}
            </Col>
            <Col lg={4} className="text-center">
              <img 
                src={staff.image || '/images/default-avatar.jpg'} 
                alt={`${staff.firstNameAr} ${staff.lastNameAr}`}
                className="img-fluid rounded-circle shadow"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Biography Section */}
            <Card className="shadow-sm mb-4">
              <Card.Header className={`bg-${positionColor} text-white`}>
                <h3 className="mb-0" dir="rtl">
                  <i className="fas fa-user-circle me-2"></i>
                  السيرة الذاتية
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-end lead" dir="rtl">
                  {staff.bioAr || 'لا توجد معلومات متاحة حالياً.'}
                </p>
              </Card.Body>
            </Card>

            {/* Responsibilities Section */}
            {additionalInfo?.responsibilities && additionalInfo.responsibilities.length > 0 && (
              <Card className="shadow-sm mb-4">
                <Card.Header className={`bg-${positionColor} text-white`}>
                  <h3 className="mb-0" dir="rtl">
                    <i className="fas fa-tasks me-2"></i>
                    المسؤوليات والواجبات
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <ul className="list-unstyled">
                    {additionalInfo.responsibilities.map((responsibility, index) => (
                      <li key={index} className="mb-3 text-end" dir="rtl">
                        <i className={`fas fa-check-circle text-${positionColor} me-2`}></i>
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}

            {/* Achievements Section */}
            {additionalInfo?.achievements && additionalInfo.achievements.length > 0 && (
              <Card className="shadow-sm mb-4">
                <Card.Header className={`bg-${positionColor} text-white`}>
                  <h3 className="mb-0" dir="rtl">
                    <i className="fas fa-trophy me-2"></i>
                    الإنجازات والجوائز
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    {additionalInfo.achievements.map((achievement, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <div className={`border-start border-${positionColor} border-3 ps-3`}>
                          <h6 className={`text-${positionColor} text-end`} dir="rtl">
                            <i className="fas fa-medal me-2"></i>
                            {achievement}
                          </h6>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Education & Certifications */}
            {(additionalInfo?.education || additionalInfo?.certifications) && (
              <Card className="shadow-sm mb-4">
                <Card.Header className={`bg-${positionColor} text-white`}>
                  <h3 className="mb-0" dir="rtl">
                    <i className="fas fa-graduation-cap me-2"></i>
                    التعليم والشهادات
                  </h3>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    {additionalInfo?.education && (
                      <Col md={6}>
                        <h5 className={`text-${positionColor} text-end mb-3`} dir="rtl">التعليم</h5>
                        <ul className="list-unstyled">
                          {additionalInfo.education.map((edu, index) => (
                            <li key={index} className="mb-2 text-end" dir="rtl">
                              <i className="fas fa-university me-2"></i>
                              {edu}
                            </li>
                          ))}
                        </ul>
                      </Col>
                    )}
                    {additionalInfo?.certifications && (
                      <Col md={6}>
                        <h5 className={`text-${positionColor} text-end mb-3`} dir="rtl">الشهادات</h5>
                        <ul className="list-unstyled">
                          {additionalInfo.certifications.map((cert, index) => (
                            <li key={index} className="mb-2 text-end" dir="rtl">
                              <i className="fas fa-certificate me-2"></i>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Contact Information */}
            <Card className="shadow-sm mb-4">
              <Card.Header className={`bg-${positionColor} text-white`}>
                <h4 className="mb-0" dir="rtl">
                  <i className="fas fa-address-card me-2"></i>
                  معلومات الاتصال
                </h4>
              </Card.Header>
              <Card.Body>
                {staff.email && (
                  <div className="mb-3">
                    <strong className="text-end d-block" dir="rtl">البريد الإلكتروني:</strong>
                    <a href={`mailto:${staff.email}`} className={`text-${positionColor}`}>
                      {staff.email}
                    </a>
                  </div>
                )}
                {staff.phone && (
                  <div className="mb-3">
                    <strong className="text-end d-block" dir="rtl">الهاتف:</strong>
                    <a href={`tel:${staff.phone}`} className={`text-${positionColor}`}>
                      {staff.phone}
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Social Media */}
            {additionalInfo?.socialMedia && (
              <Card className="shadow-sm mb-4">
                <Card.Header className={`bg-${positionColor} text-white`}>
                  <h4 className="mb-0" dir="rtl">
                    <i className="fas fa-share-alt me-2"></i>
                    وسائل التواصل
                  </h4>
                </Card.Header>
                <Card.Body className="text-center">
                  {additionalInfo.socialMedia.facebook && (
                    <a 
                      href={additionalInfo.socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary me-2 mb-2"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                  {additionalInfo.socialMedia.twitter && (
                    <a 
                      href={additionalInfo.socialMedia.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-info me-2 mb-2"
                    >
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  {additionalInfo.socialMedia.linkedin && (
                    <a 
                      href={additionalInfo.socialMedia.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary me-2 mb-2"
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="shadow-sm">
              <Card.Header className={`bg-${positionColor} text-white`}>
                <h4 className="mb-0" dir="rtl">
                  <i className="fas fa-chart-bar me-2"></i>
                  إحصائيات سريعة
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="mb-3">
                    <h5 className={`text-${positionColor} mb-1`}>
                      {additionalInfo?.experience || 'غير محدد'}
                    </h5>
                    <small className="text-muted">سنوات الخبرة</small>
                  </div>
                  <div className="mb-3">
                    <h5 className={`text-${positionColor} mb-1`}>
                      {additionalInfo?.achievements?.length || 0}
                    </h5>
                    <small className="text-muted">الإنجازات</small>
                  </div>
                  <div>
                    <h5 className={`text-${positionColor} mb-1`}>
                      {additionalInfo?.certifications?.length || 0}
                    </h5>
                    <small className="text-muted">الشهادات</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StaffMemberPage;
