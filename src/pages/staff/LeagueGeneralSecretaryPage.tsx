import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LeagueGeneralSecretaryDashboard from '../../components/league-general-secretary/LeagueGeneralSecretaryDashboard';
import RespectCommitmentForm from '../../components/league-general-secretary/RespectCommitmentForm';
import SeasonCommitmentForm from '../../components/league-general-secretary/SeasonCommitmentForm';
import { Tab, Nav, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { StaffPosition } from '../../types';
import { LeaguesService, UsersService } from '../../services/firestoreService';
import { leagues as mockLeagues, staff as mockStaff } from '../../data/mockData';
import type { Staff, League } from '../../types';

// Mock data for the general secretary as fallback
const generalSecretaryData = {
  id: 'gs-001',
  firstName: 'Mohamed',
  lastName: 'Ben Ahmed',
  firstNameAr: 'محمد',
  lastNameAr: 'بن أحمد',
  firstNameEn: 'Mohamed',
  lastNameEn: 'Ben Ahmed',
  position: StaffPosition.GENERAL_SECRETARY,
  positionAr: 'الكاتب العام للرابطة',
  positionEn: 'League General Secretary',
  email: 'secretary@league.dz',
  phone: '+213 555 123 456',
  bioAr: 'كاتب عام للرابطة الولائية للجودو بخبرة واسعة في إدارة الشؤون الإدارية والقانونية للرياضة. متخصص في معالجة طلبات التحويل وإدارة الوثائق الرسمية.',
  bioEn: 'General Secretary of the State Judo League with extensive experience in managing administrative and legal sports affairs. Specialist in processing transfer requests and managing official documents.',
  image: '/images/staff/general-secretary.jpg',
  isActive: true,
  createdAt: new Date()
};

const additionalInfo = {
  experience: '8 سنوات',
  achievements: [
    'تطوير نظام إلكتروني لمعالجة طلبات التحويل',
    'تنظيم أكثر من 50 بطولة محلية',
    'إدارة ملفات أكثر من 500 رياضي',
    'تطوير قاعدة بيانات شاملة للرياضيين'
  ],
  responsibilities: [
    'معالجة طلبات تحويل الرياضيين بين النوادي',
    'إعداد التقارير الإدارية والإحصائية',
    'إدارة قاعدة بيانات الرياضيين والنوادي',
    'متابعة تحديث الوثائق الرسمية',
    'التنسيق مع الاتحادية الوطنية',
    'إعداد المراسلات الرسمية',
    'أرشفة جميع الوثائق والقرارات',
    'إعداد جداول البطولات والمسابقات'
  ],
  education: [
    'ماجستير في الإدارة الرياضية - جامعة الجزائر',
    'ليسانس في القانون - جامعة وهران',
    'دبلوم في إدارة الأعمال'
  ],
  certifications: [
    'شهادة في إدارة الرياضة من الاتحادية الدولية للجودو',
    'شهادة ISO في إدارة الجودة',
    'دورة في استخدام أنظمة إدارة قواعد البيانات',
    'شهادة في القانون الرياضي'
  ],
  socialMedia: {
    facebook: 'https://facebook.com/league.secretary',
    twitter: 'https://twitter.com/league_secretary',
    linkedin: 'https://linkedin.com/in/league-secretary'
  }
};

const LeagueGeneralSecretaryPage: React.FC = () => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [secretary, setSecretary] = useState<Staff | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!wilayaId) {
          throw new Error('wilayaId is missing');
        }

        console.log('===LeagueGeneralSecretaryPage Debug: Fetching league data===', wilayaId);
        
        // Fetch league from Firestore first
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
        console.log('===LeagueGeneralSecretaryPage Debug: League data from Firestore===', leagueData);
        
        if (leagueData) {
          setLeague(leagueData);
        } else {
          // Fallback to mock data
          console.log('===LeagueGeneralSecretaryPage Debug: Falling back to mock data===');
          const mockLeague = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(mockLeague || null);
        }

        let secretaryData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'general_secretary') {
            // Convert User to Staff format
            secretaryData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.GENERAL_SECRETARY,
              positionAr: 'الكاتب العام للرابطة',
              bioAr: 'الكاتب العام للرابطة الولائية للجودو',
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
        
        // If no current user, try to find secretary by leagueId
        if (!secretaryData && leagueData) {
          try {
            // Try to find secretary by leagueId
            // Since getStaffMemberByLeagueAndPosition doesn't exist, we'll use a different approach
            // For now, we'll fall back to mock data
            console.log('===LeagueGeneralSecretaryPage Debug: getStaffMemberByLeagueAndPosition not available, using fallback===');
          } catch (e) {
            // ignore and fallback below
          }
        }

        // Fallback to mock by wilayaId if Firestore didn't yield a secretary
        if (!secretaryData) {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          if (league) {
            secretaryData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.GENERAL_SECRETARY
            ) || null;
          }
        }

        if (mounted) setSecretary(secretaryData);
      } catch (e) {
        console.error('Error loading league general secretary:', e);
        // Fallback to mock data on error
        try {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(league || null);
          let secretaryData: Staff | null = null;
          if (league) {
            secretaryData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.GENERAL_SECRETARY
            ) || null;
          }
          if (mounted) setSecretary(secretaryData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات الكاتب العام للرابطة');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [wilayaId]);
  
  // الصفحة الافتراضية هي لوحة التحكم
  const defaultTab = 'dashboard';

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

  // Use the secretary data from state or fallback to mock data
  const secretaryData = secretary || generalSecretaryData;

  return (
    <div>
      <Tab.Container defaultActiveKey={defaultTab}>
        <Container fluid className="px-0">
          <Card className="rounded-0">
            <Card.Header className="bg-warning text-white px-4">
              <Nav variant="tabs" className="border-0">
                <Nav.Item>
                  <Nav.Link
                    eventKey="dashboard"
                    className="bg-transparent border-0 text-white"
                    style={{ borderRadius: '0' }}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    لوحة التحكم
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="respect-commitment"
                    className="bg-transparent border-0 text-white"
                    style={{ borderRadius: '0' }}
                  >
                    <i className="fas fa-file-contract me-2"></i>
                    إنخراط - إلتزام
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="season-commitment"
                    className="bg-transparent border-0 text-white"
                    style={{ borderRadius: '0' }}
                  >
                    <i className="fas fa-file-signature me-2"></i>
                    التزام للموسم الرياضي
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>

            <Card.Body className="p-0">
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <LeagueGeneralSecretaryDashboard leagueId={wilayaId} />
                </Tab.Pane>

                <Tab.Pane eventKey="respect-commitment">
                  <Container fluid className="py-4">
                    <RespectCommitmentForm leagueId={wilayaId} />
                  </Container>
                </Tab.Pane>

                <Tab.Pane eventKey="season-commitment">
                  <Container fluid className="py-4">
                    <SeasonCommitmentForm leagueId={wilayaId} />
                  </Container>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Container>
      </Tab.Container>
    </div>
  );
};

export default LeagueGeneralSecretaryPage;
