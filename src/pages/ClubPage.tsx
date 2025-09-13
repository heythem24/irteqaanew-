import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { leagues } from '../data/mockData';
import { wilayas } from '../data/wilayas';
import { ClubsService, UsersService } from '../services/firestoreService';
import type { Club, User } from '../types';
import { ClubHomepageService, type ClubHomepageContent } from '../services/clubHomepageService';
import './ClubPage.css';

const ClubPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeTab, setActiveTab] = useState('about');
  const [club, setClub] = useState<Club | null>(null);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubContent, setClubContent] = useState<ClubHomepageContent>({});

  useEffect(() => {
    const fetchClubData = async () => {
      if (clubId) {
        setLoading(true);
        setError(null);
        try {
          const clubData = await ClubsService.getClubById(clubId);
          setClub(clubData);

          if (clubData) {
            const athleteData = await UsersService.getAthletesByClub(clubId);
            setAthletes(athleteData);
          }
        } catch (err) {
          console.error("Failed to fetch club data:", err);
          setError("فشل تحميل بيانات النادي.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchClubData();
  }, [clubId]);

  // Load dynamic club homepage content
  useEffect(() => {
    const loadClubHomepage = async () => {
      if (!clubId) return;
      try {
        const data = await ClubHomepageService.getContent(String(clubId));
        setClubContent(data || {});
      } catch (e) {
        console.warn('ClubPage: failed to load club homepage content', e);
        setClubContent({});
      }
    };
    loadClubHomepage();

    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (!detail || !detail.clubId) {
          loadClubHomepage();
        } else if (String(detail.clubId) === String(clubId)) {
          loadClubHomepage();
        }
      } catch {
        loadClubHomepage();
      }
    };
    window.addEventListener('clubHomepageUpdated', handler as EventListener);
    return () => window.removeEventListener('clubHomepageUpdated', handler as EventListener);
  }, [clubId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="py-5 text-center">
        <h2>النادي غير موجود</h2>
      </Container>
    );
  }

  const league = leagues.find(l => l.id === club.leagueId);
  const wilaya = wilayas.find(w => w.id === league?.wilayaId);

  const clubStats = {
    founded: clubContent.foundedYear ? String(clubContent.foundedYear) : '—',
    athletes: typeof clubContent.athletesCount === 'number' ? clubContent.athletesCount : athletes.length,
  } as const;

  return (
    <div className="club-page">
      {/* Club Header */}
      <section className="bg-gradient-primary text-white py-5 position-relative overflow-hidden" style={{ paddingTop: '4.5rem' }}>
        <div className="header-overlay"></div>
        <Container className="position-relative">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="mb-3">
                <Badge bg="light" text="dark" className="me-2 px-3 py-2 rounded-pill animate__animated animate__fadeInUp">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {wilaya?.nameAr}
                </Badge>
              </div>
              <h1 className="display-4 fw-bold mb-4 animate__animated animate__fadeInUp animate__delay-1s" dir="rtl">
                {club.nameAr}
              </h1>
              <p className="lead mb-4 animate__animated animate__fadeInUp animate__delay-2s" dir="rtl">
                {club.descriptionAr || `نادي متخصص في رياضة الجودو في ولاية ${wilaya?.nameAr}`}
              </p>
              <div className="animate__animated animate__fadeInUp animate__delay-3s">
                <Button variant="light" size="lg" className="rounded-pill me-3 px-4">
                  <i className="fas fa-info-circle me-2"></i>
                  معرفة المزيد
                </Button>
                <Button variant="outline-light" size="lg" className="rounded-pill px-4">
                  <i className="fas fa-phone-alt me-2"></i>
                  اتصل بنا
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center animate__animated animate__fadeIn">
              <img
                src={club.image || '/images/default-club.jpg'}
                alt={club.nameAr}
                className="img-fluid rounded-3 shadow-lg border border-4 border-white"
                style={{ width: '250px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        {/* Club Info Card */}
        <section className="mb-5 animate__animated animate__fadeInUp">
          <Card className="shadow-lg border-0 rounded-3 overflow-hidden">
            <Card.Body className="p-5">
                <h2 className="text-primary mb-4 fw-bold" dir="rtl">{club.nameAr}</h2>
                <Row className="mb-4">
                    <Col sm={6} md={3}>
                        <div className="text-center stat-card">
                            <div className="stat-icon bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                <i className="fas fa-calendar-alt text-white"></i>
                            </div>
                            <h6 className="fw-bold">تأسس</h6>
                            <p className="text-muted">{clubStats.founded}</p>
                        </div>
                    </Col>
                    <Col sm={6} md={3}>
                        <div className="text-center stat-card">
                            <div className="stat-icon bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                <i className="fas fa-users text-white"></i>
                            </div>
                            <h6 className="fw-bold">عدد الرياضيين</h6>
                            <p className="text-muted">{clubStats.athletes} رياضي</p>
                        </div>
                    </Col>
                    <Col sm={6} md={3}>
                        <div className="text-center stat-card">
                            <div className="stat-icon bg-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                <i className="fas fa-trophy text-white"></i>
                            </div>
                            <h6 className="fw-bold">المنافسات</h6>
                            <p className="text-muted">12 منافسة</p>
                        </div>
                    </Col>
                    <Col sm={6} md={3}>
                        <div className="text-center stat-card">
                            <div className="stat-icon bg-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                                <i className="fas fa-medal text-white"></i>
                            </div>
                            <h6 className="fw-bold">الإنجازات</h6>
                            <p className="text-muted">8 إنجازات</p>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
          </Card>
        </section>

        {/* Navigation Tabs */}
        <section className="mb-4 animate__animated animate__fadeInUp animate__delay-1s">
          <Nav variant="pills" className="justify-content-center bg-light rounded-3 p-2 nav-custom">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'about'} 
                onClick={() => setActiveTab('about')}
                className="rounded-pill px-4 py-2 mx-2"
              >
                عن النادي
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'athletes'} 
                onClick={() => setActiveTab('athletes')}
                className="rounded-pill px-4 py-2 mx-2"
              >
                الرياضيون
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </section>

        {/* Tab Content */}
        <section className="animate__animated animate__fadeInUp animate__delay-2s">
          {activeTab === 'about' && (
            <Card className="shadow-lg border-0 rounded-3 overflow-hidden">
              <Card.Header className="bg-light py-3">
                <h4 className="mb-0 fw-bold">نبذة عن {club.nameAr}</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <p dir="rtl">{clubContent.aboutAr || club.descriptionAr || 'لا يوجد وصف حاليا.'}</p>
                {(clubContent.aboutExtraAr || []).filter(Boolean).map((para, idx) => (
                  <p key={idx} dir="rtl" className="mb-2">{para}</p>
                ))}
              </Card.Body>
            </Card>
          )}
          {activeTab === 'athletes' && (
            <Card className="shadow-lg border-0 rounded-3 overflow-hidden">
                <Card.Header className="bg-light py-3">
                  <h4 className="mb-0 fw-bold">الرياضيون</h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {athletes.map((athlete) => (
                          <Col md={4} key={athlete.id} className="mb-4">
                            <Card className="h-100 shadow-sm rounded-3 overflow-hidden athlete-card">
                              <div className="athlete-img-container">
                                {/* Large square image (~60% of the card body height) */}
                                <div
                                  className="w-100"
                                  style={{
                                    aspectRatio: '1 / 1',
                                    maxHeight: '240px',
                                  }}
                                >
                                  <img
                                    src={athlete.image || '/images/default-athlete.jpg'}
                                    alt={`${athlete.firstNameAr || athlete.firstName || ''} ${athlete.lastNameAr || athlete.lastName || ''}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    className="shadow-sm"
                                  />
                                </div>
                              </div>
                              {/* Name and small details below */}
                              <Card.Body className="text-center" dir="rtl">
                                <div className="fw-bold fs-5 mb-1">
                                  {athlete.firstNameAr || athlete.firstName} {athlete.lastNameAr || athlete.lastName}
                                </div>
                                <div className="text-muted small mb-2">
                                  {athlete.beltAr || athlete.belt || '—'}
                                </div>
                                <Badge bg="primary" className="rounded-pill">
                                  {athlete.clubId ? 'رياضي نشط' : 'رياضي'}
                                </Badge>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
          )}
        </section>
      </Container>
    </div>
  );
};

export default ClubPage;