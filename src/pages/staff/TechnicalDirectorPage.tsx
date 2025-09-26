import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Navbar, Nav, Button } from 'react-bootstrap';
import StaffMemberPage from '../../components/staff/StaffMemberPage';
import { staff as mockStaff, leagues as mockLeagues } from '../../data/mockData';
import { StaffPosition } from '../../types';
import { LeaguesService, UsersService } from '../../services/firestoreService';
import type { Staff, League } from '../../types';

// Mock data for the technical director as fallback
const technicalDirectorData = {
  id: 'td-001',
  firstName: 'Ahmed',
  lastName: 'Brahimi',
  firstNameAr: 'أحمد',
  lastNameAr: 'ابراهيمي',
  firstNameEn: 'Ahmed',
  lastNameEn: 'Brahimi',
  position: StaffPosition.TECHNICAL_DIRECTOR,
  positionAr: 'المدير التقني للرابطة',
  positionEn: 'League Technical Director',
  email: 'technical.director@league.dz',
  phone: '+213 555 987 654',
  bioAr: 'مدير تقني للرابطة الولائية للجودو بخبرة واسعة في تطوير البرامج التدريبية وتأهيل المدربين. متخصص في تحليل الأداء وتطوير المناهج الفنية.',
  bioEn: 'Technical Director of the State Judo League with extensive experience in developing training programs and qualifying coaches. Specialist in performance analysis and developing technical curricula.',
  image: '/images/staff/technical-director.jpg',
  isActive: true,
  createdAt: new Date()
};

const TechnicalDirectorPage: React.FC = () => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [technicalDirector, setTechnicalDirector] = useState<Staff | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Require authentication: if not logged in, redirect to login with role hint
  useEffect(() => {
    if (!UsersService.isAuthenticated()) {
      // Preserve intent to come back and hint the role
      navigate(`/login?role=league_technical_director`, { state: { from: location } as any });
    }
  }, [navigate, location]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!wilayaId) {
          throw new Error('wilayaId is missing');
        }

        console.log('===TechnicalDirectorPage Debug: Fetching league data===', wilayaId);
        
        // Fetch league from Firestore first
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
        console.log('===TechnicalDirectorPage Debug: League data from Firestore===', leagueData);
        
        if (leagueData) {
          setLeague(leagueData);
        } else {
          // Fallback to mock data
          console.log('===TechnicalDirectorPage Debug: Falling back to mock data===');
          const mockLeague = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(mockLeague || null);
        }

        let directorData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'technical_director') {
            // Convert User to Staff format
            directorData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.TECHNICAL_DIRECTOR,
              positionAr: 'المدير التقني للرابطة',
              bioAr: 'المدير التقني للرابطة الولائية للجودو',
              image: currentUser.image,
              email: currentUser.email,
              phone: currentUser.phone,
              leagueId: leagueData?.id,
              isActive: currentUser.isActive,
              createdAt: currentUser.createdAt
            };
          }
        } catch (e) {
          console.log('Error getting current user:', e);
        }
        
        // If no current user, try to find technical director by leagueId
        if (!directorData && leagueData) {
          try {
            // Try to find technical director by leagueId
            // Since getStaffMemberByLeagueAndPosition doesn't exist, we'll use a different approach
            // For now, we'll fall back to mock data
            console.log('===TechnicalDirectorPage Debug: getStaffMemberByLeagueAndPosition not available, using fallback===');
          } catch (e) {
            // ignore and fallback below
          }
        }

        // Fallback to mock by wilayaId if Firestore didn't yield a technical director
        if (!directorData) {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          if (league) {
            directorData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.TECHNICAL_DIRECTOR
            ) || null;
          }
        }

        if (mounted) setTechnicalDirector(directorData);
      } catch (e) {
        console.error('Error loading league technical director:', e);
        // Fallback to mock data on error
        try {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(league || null);
          let directorData: Staff | null = null;
          if (league) {
            directorData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.TECHNICAL_DIRECTOR
            ) || null;
          }
          if (mounted) setTechnicalDirector(directorData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات المدير التقني للرابطة');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [wilayaId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري تحميل البيانات...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!league) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">الرابطة غير موجودة.</Alert>
      </Container>
    );
  }

  // Use the technical director data from state or fallback to mock data
  const directorData = technicalDirector || technicalDirectorData;

  const handleLogout = () => {
    try { UsersService.logout(); } catch {}
    navigate('/login');
  };

  // Additional information for the technical director
  const additionalInfo = {
    experience: '15+ سنة خبرة تقنية',
    achievements: [
      'تطوير منهج تدريبي متقدم للجودو',
      'تدريب أكثر من 50 مدرب معتمد',
      'إشراف على تأهيل 20 رياضي للمنتخب الوطني',
      'حاصل على جائزة أفضل مدير تقني 2022',
      'بطل سابق في الجودو على المستوى الوطني',
      'مؤلف كتاب "أساسيات التدريب الحديث في الجودو"'
    ],
    responsibilities: [
      'وضع البرامج التدريبية للأندية التابعة للرابطة',
      'الإشراف على تأهيل وتدريب المدربين',
      'تطوير المناهج الفنية والتقنية',
      'تقييم أداء الرياضيين والمدربين',
      'التنسيق مع الاتحاد الوطني للشؤون التقنية',
      'إعداد التقارير الفنية الدورية',
      'تنظيم الدورات التدريبية المتخصصة',
      'الإشراف على اختيار المواهب الشابة',
      'وضع معايير الأداء والتقييم',
      'تطوير استراتيجيات التدريب طويلة المدى'
    ],
    education: [
      'ماجستير في علوم الرياضة - المعهد العالي للرياضة',
      'دبلوم في التدريب الرياضي المتقدم',
      'شهادة في علم النفس الرياضي'
    ],
    certifications: [
      'مدرب معتمد من الاتحاد الدولي للجودو - المستوى الأول',
      'حكم دولي معتمد في الجودو',
      'شهادة في التحليل الحركي الرياضي',
      'دورة متقدمة في إعداد البرامج التدريبية',
      'شهادة في الطب الرياضي الأساسي'
    ],
    projects: [
      'مشروع تطوير مركز التدريب المتقدم',
      'برنامج إعداد المدربين الشباب',
      'مبادرة التدريب الرقمي والتحليل الفني',
      'مشروع الشراكة مع الجامعات لتطوير البحث الرياضي',
      'برنامج اكتشاف وتطوير المواهب الاستثنائية'
    ],
    socialMedia: {
      facebook: 'https://facebook.com/technical.director',
      linkedin: 'https://linkedin.com/in/technical-director'
    }
  };

  return (
    <div>
      {/* Top Header with Logout */}
      <Navbar bg="light" expand="lg" className="mb-3 border-bottom">
        <Container>
          <Navbar.Brand className="fw-bold">المدير التقني للرابطة</Navbar.Brand>
          <Navbar.Toggle aria-controls="td-league-navbar" />
          <Navbar.Collapse id="td-league-navbar">
            <Nav className="ms-auto d-flex align-items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <StaffMemberPage
        staff={directorData}
        leagueId={wilayaId}
        additionalInfo={additionalInfo}
      />
    </div>
  );
};

export default TechnicalDirectorPage;
