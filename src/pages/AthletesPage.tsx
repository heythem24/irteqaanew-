import React, { useState, useEffect } from 'react';
import { Navigate, useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { clubs as mockClubs } from '../data/mockData';
import AthleteProfile from '../components/athlete/AthleteProfile';
import BeltsAndPromotions from '../components/athlete/BeltsAndPromotions';
import TechnicalProfile from '../components/athlete/TechnicalProfile';
import AthleteMedicalDashboard from '../components/athlete/AthleteMedicalDashboard';
import { UsersService as UserService, ClubsService } from '../services/firestoreService';
import '../components/athlete/AthleteProfile.css';

const AthletePage: React.FC = () => {
  const { clubId, athleteId } = useParams<{ clubId: string; athleteId: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      
      setLoading(true);
      try {
        console.log('===AthletePage Debug: Fetching club data===', clubId);
        
        // First try to get club from Firestore
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===AthletePage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===AthletePage Debug: Falling back to mock data===');
          const mockClub = mockClubs.find(c => c.id === clubId);
          setClub(mockClub || null);
        }
      } catch (err) {
        console.error('===AthletePage Debug: Error fetching club===', err);
        setError('Failed to load club data');
        
        // Fallback to mock data on error
        const mockClub = mockClubs.find(c => c.id === clubId);
        setClub(mockClub || null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClub();
  }, [clubId]);

  // Fetch fresh current user details so profile reflects saved Firestore values
  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const fresh = await UserService.getCurrentUserWithDetails();
        setUserDetails(fresh);
      } catch (e) {
        console.warn('===AthletePage Debug: Failed to fetch user details, will use cached current user===', e);
        setUserDetails(null);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [athleteId]);
  
  // Check if user is logged in
  const currentUser = UserService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to={`/club/${clubId}/athlete/login?clubId=${clubId}`} replace />;
  }

  // Check if user is an athlete and this is their own page
  if (currentUser.role !== 'athlete' || currentUser.id !== athleteId) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>غير مصرح بالوصول</h2>
          <p className="text-muted">هذه الصفحة مخصصة للرياضي فقط</p>
        </div>
      </Container>
    );
  }
  
  const [activeTab, setActiveTab] = useState<string>('profile');

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">جاري تحميل بيانات النادي...</p>
        </div>
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
      <Container className="py-5">
        <div className="text-center">
          <h2>النادي غير موجود</h2>
          <p className="text-muted">لم يتم العثور على النادي المطلوب</p>
        </div>
      </Container>
    );
  }

  // While loading fresh user details, show a spinner (after auth/club checks)
  if (userLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">جاري تحميل بيانات الرياضي...</p>
        </div>
      </Container>
    );
  }

  // Merge fresh Firestore user data (if available) with cached current user
  const baseUser = userDetails ?? currentUser;

  // Create athlete data from user profile (Firestore-backed)
  const athlete = {
    id: baseUser.id,
    firstName: baseUser.firstName,
    lastName: baseUser.lastName,
    firstNameAr: baseUser.firstNameAr || baseUser.firstName,
    lastNameAr: baseUser.lastNameAr || baseUser.lastName,
    dateOfBirth: baseUser.dateOfBirth ? new Date(baseUser.dateOfBirth) : new Date('2000-01-01'),
    gender: (baseUser.gender as 'male' | 'female') || 'male',
    belt: baseUser.belt || 'أبيض',
    beltAr: baseUser.beltAr || baseUser.belt || 'أبيض',
    weight: typeof baseUser.weight === 'number' ? baseUser.weight : 70,
    height: typeof baseUser.height === 'number' ? baseUser.height : 175,
    clubId: baseUser.clubId || clubId || 'club-01',
    bio: baseUser.bio || 'رياضي جودو',
    bioAr: baseUser.bioAr || baseUser.bio || 'رياضي جودو',
    image: baseUser.image || '/images/default-athlete.jpg',
    achievements: baseUser.achievements || [],
    achievementsAr: baseUser.achievementsAr || [],
    isActive: baseUser.isActive ?? true,
    createdAt: baseUser.createdAt ? new Date(baseUser.createdAt) : new Date()
  };

  const getBeltColor = (belt: string) => {
    if (belt.includes('أبيض')) return 'light';
    if (belt.includes('أصفر')) return 'warning';
    if (belt.includes('برتقالي')) return 'warning';
    if (belt.includes('أخضر')) return 'success';
    if (belt.includes('أزرق')) return 'primary';
    if (belt.includes('بني')) return 'secondary';
    if (belt.includes('أسود')) return 'dark';
    return 'secondary';
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? 'fas fa-mars text-primary' : 'fas fa-venus text-danger';
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const beltColor = getBeltColor(athlete.beltAr);
  // Unified theme for this page and tabs - Modern attractive colors
  const themeGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const handleLogout = () => {
    try {
      UserService.logout();
    } catch {}
    navigate(`/club/${clubId}/athlete/login?clubId=${clubId}`);
  };

  return (
    <div className="athlete-theme">
      <style>
        {`
          /* Scoped theme for athlete page */
          .athlete-theme .themed-surface {
            background: linear-gradient(180deg, #edf2ff 0%, #e0e7ff 100%);
            border-radius: 16px;
          }
          .athlete-theme .themed-card {
            background: linear-gradient(180deg, #eef2ff 0%, #e6eaff 100%);
            color: #0f172a;
            border: none;
          }
          /* Apply theme to all cards within tab content */
          .athlete-theme .tab-content .card {
            background: linear-gradient(180deg, #eef2ff 0%, #e6eaff 100%);
            color: #0f172a;
            border: none;
          }
          .athlete-theme .themed-card .card-header {
            background: transparent;
            color: #0f172a;
            border: none;
          }
          .athlete-theme .themed-card .card-body {
            background: transparent;
            color: #0f172a;
          }
          .athlete-theme .tab-content .card .card-header,
          .athlete-theme .tab-content .card .card-body {
            background: transparent;
            color: #0f172a;
          }
          .athlete-theme .themed-card .table th,
          .athlete-theme .themed-card .table td {
            background-color: transparent !important;
            color: #0f172a !important;
            border-color: rgba(15, 23, 42, 0.1);
          }
          .athlete-theme .tab-content .card .table th,
          .athlete-theme .tab-content .card .table td {
            background-color: transparent !important;
            color: #0f172a !important;
            border-color: rgba(15, 23, 42, 0.1);
          }
          .athlete-theme .themed-text {
            color: #0f172a !important;
          }
          /* Bright and excellent text colors with perfect visibility */
          .athlete-theme .themed-surface *,
          .athlete-theme .themed-card *,
          .athlete-theme .tab-content *,
          .athlete-theme .card *,
          .athlete-theme .modal *,
          .athlete-theme .form-control,
          .athlete-theme .form-select,
          .athlete-theme .btn,
          .athlete-theme .badge,
          .athlete-theme .text-muted {
            color: #1e40af !important;
          }
          /* Override any light colors with bright ones */
          .athlete-theme .text-light,
          .athlete-theme .text-white {
            color: #059669 !important;
          }
          /* Bright headings with excellent colors */
          .athlete-theme h1, .athlete-theme h2, .athlete-theme h3,
          .athlete-theme h4, .athlete-theme h5, .athlete-theme h6 {
            color: #0cc2c2ff !important;
          }
          .athlete-theme p, .athlete-theme span, .athlete-theme div {
            color: #0cc2c2ff !important;
          }
          /* Bright and attractive table colors */
          .athlete-theme .table th, .athlete-theme .table td,
          .athlete-theme .table thead th, .athlete-theme .table tbody td {
            color: #1e40af !important;
          }
          /* Bright secondary text */
          .athlete-theme .text-muted {
            color: #059669 !important;
          }
          /* Special bright colors for specific content elements */
          .athlete-theme .card-title,
          .athlete-theme .card-subtitle,
          .athlete-theme .list-group-item {
            color: #be123c !important;
          }
        `}
      </style>
      {/* Header Section */}
      <section
        className={`text-white py-5`}
        style={{
          background: themeGradient
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center mb-3">
                <Link
                  to={`/club/${clubId}`}
                  className="btn btn-outline-light me-3"
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للنادي
                </Link>
                <Button
                  variant="danger"
                  className="me-2"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  تسجيل الخروج
                </Button>
              </div>
              <h1 className="display-5 fw-bold mb-3" dir="rtl">
                <i className={getGenderIcon(athlete.gender)} style={{ fontSize: '0.8em' }}></i>
                {' '}
                {athlete.firstNameAr} {athlete.lastNameAr}
              </h1>
              <p className="lead mb-3" dir="rtl">
                رياضي جودو في {club.nameAr}
              </p>
              <Badge bg="light" text="dark" className="fs-6 me-2">
                {athlete.beltAr}
              </Badge>
              <Badge bg="light" text="dark" className="fs-6">
                {calculateAge(athlete.dateOfBirth)} سنة
              </Badge>
            </Col>
            <Col lg={4} className="text-center">
              <img
                src={athlete.image || '/images/default-athlete.jpg'}
                alt={`${athlete.firstNameAr} ${athlete.lastNameAr}`}
                className="img-fluid rounded-circle shadow"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Container
        className="py-5 themed-surface"
        style={{
          background: 'linear-gradient(180deg, #edf2ff 0%, #e0e7ff 100%)'
        }}
      >
        {/* Navigation Tabs */}
        <Card className="shadow-lg mb-4 border-0">
          <Card.Header className={`text-white p-0`} style={{ background: themeGradient }}>
            <Nav variant="tabs" className="border-0 justify-content-center">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-3 fw-bold ${activeTab === 'profile' ? 'bg-white text-primary shadow' : ''}`}
                  style={{
                    border: 'none',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'profile' ? 'white' : 'transparent',
                    color: activeTab === 'profile' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                  }}
                  dir="rtl"
                >
                  <i className="fas fa-user-circle me-2"></i>
                  الملف الشخصي
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'belts'}
                  onClick={() => setActiveTab('belts')}
                  className={`px-4 py-3 fw-bold ${activeTab === 'belts' ? 'bg-white text-primary shadow' : ''}`}
                  style={{
                    border: 'none',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'belts' ? 'white' : 'transparent',
                    color: activeTab === 'belts' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                  }}
                  dir="rtl"
                >
                  <i className="fas fa-medal me-2"></i>
                  الأحزمة والترقيات
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'technical'}
                  onClick={() => setActiveTab('technical')}
                  className={`px-4 py-3 fw-bold ${activeTab === 'technical' ? 'bg-white text-primary shadow' : ''}`}
                  style={{
                    border: 'none',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'technical' ? 'white' : 'transparent',
                    color: activeTab === 'technical' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                  }}
                  dir="rtl"
                >
                  <i className="fas fa-cogs me-2"></i>
                  البطاقة الفنية
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'medical'}
                  onClick={() => setActiveTab('medical')}
                  className={`px-4 py-3 fw-bold ${activeTab === 'medical' ? 'bg-white text-primary shadow' : ''}`}
                  style={{
                    border: 'none',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'medical' ? 'white' : 'transparent',
                    color: activeTab === 'medical' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                  }}
                  dir="rtl"
                >
                  <i className="fas fa-heartbeat me-2"></i>
                  المركز الصحي
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={Link}
                  to={`/club/${clubId}/athlete/${athlete.id}/chat`}
                  className={`px-4 py-3 fw-bold`}
                  style={{
                    border: 'none',
                    borderRadius: '0.5rem 0.5rem 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: 'rgba(255,255,255,0.9)'
                  }}
                  dir="rtl"
                >
                  <i className="fas fa-comments me-2"></i>
                  الدردشة
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>

        {/* Tab Content */}
        <div className="tab-content fade-in-up">
          <Card className="shadow border-0 themed-card">
            <div style={{ height: '6px', background: themeGradient, borderRadius: '6px 6px 0 0' }} />
            <Card.Body className="p-4 themed-text rounded-bottom-3">
              {activeTab === 'profile' && (
                <div className="fade-in-up">
                  <AthleteProfile athlete={athlete} club={club} beltColor={beltColor} />
                </div>
              )}
              {activeTab === 'belts' && (
                <div className="fade-in-up">
                  <BeltsAndPromotions athlete={athlete} beltColor={beltColor} />
                </div>
              )}
              {activeTab === 'technical' && (
                <div className="fade-in-up">
                  <TechnicalProfile athlete={athlete} />
                </div>
              )}
              {activeTab === 'medical' && (
                <div className="fade-in-up">
                  <AthleteMedicalDashboard 
                    athleteId={athlete.id} 
                    athleteName={`${athlete.firstNameAr} ${athlete.lastNameAr}`} 
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>


      </Container>
    </div>
  );
};

export default AthletePage;
