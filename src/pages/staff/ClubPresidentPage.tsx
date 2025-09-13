import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import StaffMemberPage from '../../components/staff/StaffMemberPage';
import { staff, clubs as mockClubs } from '../../data/mockData';
import { ClubsService } from '../../services/firestoreService';
import { StaffPosition } from '../../types';
import type { Club, Staff } from '../../types';

// Mock data for the club president as fallback
const presidentData = {
  id: 'cp-001',
  firstName: 'Karim',
  lastName: 'Bensalah',
  firstNameAr: 'كريم',
  lastNameAr: 'بن صالح',
  firstNameEn: 'Karim',
  lastNameEn: 'Bensalah',
  position: StaffPosition.CLUB_PRESIDENT,
  positionAr: 'رئيس النادي',
  positionEn: 'Club President',
  email: 'president@club.dz',
  phone: '+213 555 123 456',
  bioAr: 'رئيس النادي بخبرة في الإدارة الرياضية وتطوير الأندية، متخصص في تطوير البنية التحتية الرياضية وإدارة الفعاليات.',
  bioEn: 'Club president with experience in sports management and club development, specialized in developing sports infrastructure and managing events.',
  image: '/images/staff/president.jpg',
  isActive: true,
  createdAt: new Date()
};

const ClubPresidentPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [president, setPresident] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        if (!clubId) {
          throw new Error('clubId is missing');
        }

        console.log('===ClubPresidentPage Debug: Fetching club with ID===', clubId);
        
        // First try to get the club from Firestore
        const firestoreClub = await ClubsService.getClubById(clubId);
        console.log('===ClubPresidentPage Debug: Club data from Firestore===', firestoreClub);
        
        if (firestoreClub) {
          setClub(firestoreClub);
        } else {
          console.log('===ClubPresidentPage Debug: Club not found in Firestore, checking mock data===');
          // Fallback to mock data
          const mockClub = mockClubs.find(c => c.id === clubId) || null;
          setClub(mockClub);
        }

        let presidentData: Staff | null = null;
        if (firestoreClub) {
          try {
            // Try to find president by clubId
            // Since getStaffMemberByClubAndPosition doesn't exist, we'll use a different approach
            // For now, we'll fall back to mock data
            console.log('===ClubPresidentPage Debug: getStaffMemberByClubAndPosition not available, using fallback===');
          } catch (e) {
            // ignore and fallback below
          }
        }

        // Fallback to mock by clubId if Firestore didn't yield a president
        if (!presidentData) {
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            presidentData = staff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.CLUB_PRESIDENT
            ) || null;
          }
        }

        if (mounted) setPresident(presidentData);
      } catch (error) {
        console.error('===ClubPresidentPage Debug: Error fetching club===', error);
        // Fallback to mock data
        try {
          const mockClub = mockClubs.find(c => c.id === clubId) || null;
          setClub(mockClub);
          let presidentData: Staff | null = null;
          if (mockClub) {
            presidentData = staff.find(s =>
              s.clubId === mockClub.id && s.position === StaffPosition.CLUB_PRESIDENT
            ) || null;
          }
          if (mounted) setPresident(presidentData);
        } catch {
          // Error handling is done in the render section
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clubId]);
  
  if (loading) {
    return (
      <Container className="py-5 d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
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

  // Use the president data from state or fallback to mock data
  const finalPresidentData = president || presidentData;

  // Additional information for the club president
  const additionalInfo = {
    experience: '15+ سنة خبرة إدارية',
    achievements: [
      'رئيس النادي لأكثر من 8 سنوات',
      'تطوير النادي وزيادة عدد الأعضاء بنسبة 200%',
      'تنظيم أكثر من 50 فعالية رياضية',
      'حاصل على جائزة أفضل إدارة نادي 2023',
      'عضو في مجلس إدارة الرابطة',
      'مؤسس برنامج الرعاية الرياضية للشباب'
    ],
    responsibilities: [
      'الإشراف العام على جميع أنشطة النادي',
      'تمثيل النادي في المحافل الرسمية والرياضية',
      'وضع الاستراتيجيات طويلة المدى لتطوير النادي',
      'الإشراف على الميزانية العامة للنادي',
      'التنسيق مع الرابطة والاتحاد الوطني',
      'اتخاذ القرارات الاستراتيجية المهمة',
      'الإشراف على انتخابات مجلس الإدارة',
      'تعيين وإشراف الطاقم الإداري والفني',
      'تطوير العلاقات مع الشركاء والرعاة',
      'ضمان تطبيق اللوائح والقوانين الرياضية'
    ],
    education: [
      'ماجستير في الإدارة الرياضية - جامعة الجزائر',
      'ليسانس في إدارة الأعمال',
      'دبلوم في القيادة الرياضية'
    ],
    certifications: [
      'شهادة في الإدارة الرياضية الحديثة',
      'دورة القيادة الرياضية المتقدمة',
      'شهادة في إدارة المشاريع الرياضية',
      'دورة في التسويق الرياضي',
      'شهادة في إدارة الفعاليات الرياضية'
    ],
    projects: [
      'مشروع تطوير البنية التحتية للنادي',
      'برنامج اكتشاف وتطوير المواهب الشابة',
      'مبادرة الشراكة مع المدارس المحلية',
      'مشروع تحديث المرافق الرياضية',
      'برنامج التدريب المجتمعي'
    ],
    socialMedia: {
      facebook: 'https://facebook.com/club.president',
      twitter: 'https://twitter.com/club_president',
      linkedin: 'https://linkedin.com/in/club-president'
    }
  };

  return (
    <StaffMemberPage
      staff={finalPresidentData}
      clubId={clubId}
      additionalInfo={additionalInfo}
    />
  );
};

export default ClubPresidentPage;
