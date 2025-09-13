import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import StaffMemberPage from '../../components/staff/StaffMemberPage';
import TechnicalDirectorDashboard from '../../components/technical-director/TechnicalDirectorDashboard';
import { staff as mockStaff, clubs as mockClubs } from '../../data/mockData';
import { StaffPosition } from '../../types';
import { ClubsService, UsersService } from '../../services/firestoreService';
import type { Club, Staff, User } from '../../types';

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
  positionAr: 'المدير التقني',
  positionEn: 'Technical Director',
  email: 'technical.director@club.dz',
  phone: '+213 555 345 678',
  bioAr: 'مدير تقني للنادي بخبرة واسعة في تطوير البرامج التدريبية والإشراف على المدربين. متخصص في تحليل الأداء وتطوير المهارات الفنية للرياضيين.',
  bioEn: 'Technical Director of the club with extensive experience in developing training programs and supervising coaches. Specialized in performance analysis and developing technical skills for athletes.',
  image: '/images/staff/technical-director.jpg',
  isActive: true,
  createdAt: new Date()
};

const ClubTechnicalDirectorPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [club, setClub] = useState<Club | null>(null);
  const [technicalDirector, setTechnicalDirector] = useState<Staff | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!clubId) {
          throw new Error('clubId is missing');
        }

        console.log('===ClubTechnicalDirectorPage Debug: Fetching club data===', clubId);
        
        // Fetch current user data
        const userData = await UsersService.getCurrentUserWithDetails();
        console.log('===ClubTechnicalDirectorPage Debug: Current user data===', userData);
        if (mounted) setCurrentUser(userData);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===ClubTechnicalDirectorPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===ClubTechnicalDirectorPage Debug: Falling back to mock data===');
          const mockClub = mockClubs.find(c => c.id === clubId);
          setClub(mockClub || null);
        }

        // Use current user data if they are a technical director
        let directorData: Staff | null = null;
        if (userData && userData.role === 'technical_director') {
          console.log('===ClubTechnicalDirectorPage Debug: Using current user as technical director===');
          directorData = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            firstNameAr: userData.firstName,
            lastNameAr: userData.lastName,
            position: StaffPosition.TECHNICAL_DIRECTOR,
            positionAr: 'المدير التقني',
            email: userData.email,
            phone: userData.phone,
            bioAr: 'مدير تقني للنادي بخبرة واسعة في تطوير البرامج التدريبية والإشراف على المدربين. متخصص في تحليل الأداء وتطوير المهارات الفنية للرياضيين.',
            image: userData.image,
            isActive: true,
            createdAt: new Date()
          };
        } else {
          // Fallback to mock by clubId if current user is not a technical director
          console.log('===ClubTechnicalDirectorPage Debug: Current user is not a technical director, using fallback===');
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            directorData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.TECHNICAL_DIRECTOR
            ) || null;
          }
        }

        if (mounted) setTechnicalDirector(directorData);
      } catch (e) {
        console.error('Error loading club technical director:', e);
        // Fallback to mock data on error
        try {
          const club = mockClubs.find(c => c.id === clubId);
          setClub(club || null);
          
          // Try to get current user as fallback
          const userData = await UsersService.getCurrentUserWithDetails();
          if (mounted) setCurrentUser(userData);
          
          let directorData: Staff | null = null;
          if (userData && userData.role === 'technical_director') {
            directorData = {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              firstNameAr: userData.firstName,
              lastNameAr: userData.lastName,
              position: StaffPosition.TECHNICAL_DIRECTOR,
              positionAr: 'المدير التقني',
              email: userData.email,
              phone: userData.phone,
              bioAr: 'مدير تقني للنادي بخبرة واسعة في تطوير البرامج التدريبية والإشراف على المدربين. متخصص في تحليل الأداء وتطوير المهارات الفنية للرياضيين.',
              image: userData.image,
              isActive: true,
              createdAt: new Date()
            };
          } else if (club) {
            directorData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.TECHNICAL_DIRECTOR
            ) || null;
          }
          if (mounted) setTechnicalDirector(directorData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات المدير التقني');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clubId]);
  
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

  if (!club) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">النادي غير موجود.</Alert>
      </Container>
    );
  }

  // Use the director data from state or fallback to mock data
  const finalDirectorData = technicalDirector || technicalDirectorData;

  // Additional information for the technical director
  const additionalInfo = {
    experience: '12+ سنة خبرة تقنية',
    achievements: [
      'تطوير منهج تدريبي متقدم للنادي',
      'تدريب أكثر من 30 مدرب مساعد',
      'إشراف على تأهيل 10 رياضيين للمنتخب الوطني',
      'حاصل على جائزة أفضل مدير تقني محلي 2022',
      'بطل سابق في الجودو على المستوى الوطني',
      'مؤلف دليل "التدريب الحديث في الجودو"'
    ],
    responsibilities: [
      'وضع البرامج التدريبية للنادي',
      'الإشراف على تأهيل وتدريب المدربين',
      'تطوير المناهج الفنية والتقنية',
      'تقييم أداء الرياضيين والمدربين',
      'التنسيق مع الرابطة للشؤون التقنية',
      'إعداد التقارير الفنية الدورية',
      'تنظيم الدورات التدريبية المتخصصة',
      'الإشراف على اختيار المواهب الشابة',
      'وضع معايير الأداء والتقييم',
      'تطوير استراتيجيات التدريب للنادي'
    ],
    education: [
      'ماجستير في علوم الرياضة - المعهد العالي للرياضة',
      'ليسانس في التربية البدنية والرياضية',
      'دبلوم في التدريب الرياضي المتقدم'
    ],
    certifications: [
      'مدرب معتمد من الاتحاد الدولي للجودو - المستوى الثاني',
      'حكم محلي معتمد في الجودو',
      'شهادة في التحليل الحركي الرياضي',
      'دورة متقدمة في إعداد البرامج التدريبية',
      'شهادة في علم النفس الرياضي'
    ],
    projects: [
      'مشروع تطوير مركز التدريب في النادي',
      'برنامج إعداد المدربين الشباب',
      'مبادرة التدريب الرقمي والتحليل الفني',
      'مشروع الشراكة مع الأندية الدولية',
      'برنامج اكتشاف وتطوير المواهب المحلية'
    ],
    socialMedia: {
      facebook: 'https://facebook.com/club.technical.director',
      linkedin: 'https://linkedin.com/in/club-technical-director'
    }
  };

  // إذا كان المستخدم يريد عرض لوحة التحكم
  if (showDashboard) {
    return (
      <TechnicalDirectorDashboard
        technicalDirector={finalDirectorData}
        club={club}
      />
    );
  }

  // إضافة زر للانتقال إلى لوحة التحكم
  const dashboardButton = (
    <div className="text-center mt-4">
      <Button
        variant="success"
        size="lg"
        onClick={() => setShowDashboard(true)}
        className="px-4 py-2"
      >
        <i className="fas fa-cogs me-2"></i>
        الانتقال إلى لوحة التحكم التقنية
      </Button>
    </div>
  );

  return (
    <div>
      <StaffMemberPage
        staff={finalDirectorData}
        clubId={clubId}
        additionalInfo={additionalInfo}
      />
      {dashboardButton}
    </div>
  );
};

export default ClubTechnicalDirectorPage;
