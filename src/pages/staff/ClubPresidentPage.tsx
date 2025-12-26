import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { UsersService, ClubsService } from '../../services/firestoreService';
import { StaffService } from '../../services/mockDataService';
import ClubPresidentDashboard from '../../components/club/ClubPresidentDashboard';
import type { Staff, Club } from '../../types';
import { StaffPosition } from '../../types';

// Mock data for the president as fallback
const presidentDataMock = {
  id: 'cp-001',
  firstName: 'Ali',
  lastName: 'Benali',
  firstNameAr: 'علي',
  lastNameAr: 'بن علي',
  firstNameEn: 'Ali',
  lastNameEn: 'Benali',
  position: StaffPosition.CLUB_PRESIDENT,
  positionAr: 'رئيس النادي',
  positionEn: 'Club President',
  email: 'president@club.dz',
  phone: '+213 555 123 456',
  bioAr: 'رئيس نادي بخبرة واسعة في إدارة الأندية الرياضية وتطوير الرياضة على المستوى المحلي والوطني.',
  bioEn: 'Club president with extensive experience in managing sports clubs and developing sports at the local and national level.',
  image: '/images/staff/club-president.jpg',
  isActive: true,
  createdAt: new Date()
};

const ClubPresidentPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [president, setPresident] = useState<Staff | null>(null);
  const [club, setClub] = useState<Club | null>(null);
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

        console.log('===ClubPresidentPage Debug: Fetching club data===', clubId);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===ClubPresidentPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          if (mounted) setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===ClubPresidentPage Debug: Falling back to mock data===');
          if (mounted) {
            setClub({
              id: clubId,
              name: 'نادي الرياضة',
              nameAr: 'نادي الرياضة',
              leagueId: '',
              sportId: 'judo-001',
              description: '',
              descriptionAr: '',
              address: '',
              addressAr: '',
              phone: '',
              email: '',
              image: '',
              isActive: true,
              isFeatured: false,
              createdAt: new Date()
            });
          }
        }

        // Fetch president data
        let presidentData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'club_president') {
            // Convert User to Staff format
            presidentData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.CLUB_PRESIDENT,
              positionAr: 'رئيس النادي',
              bioAr: 'رئيس النادي بخبرة في إدارة الأندية الرياضية وتطوير الرياضة على المستوى المحلي والوطني.',
              image: currentUser.image,
              email: currentUser.email,
              phone: currentUser.phone,
              clubId: clubData?.id,
              isActive: currentUser.isActive,
              createdAt: currentUser.createdAt
            };
          }
        } catch (e) {
          console.log('Error getting current user:', e);
        }
        
        // If no current user, try to find president by clubId
        if (!presidentData && clubData) {
          try {
            const staff = await StaffService.getStaffByClub(clubId);
            const p = staff.find((s) => s.position === StaffPosition.CLUB_PRESIDENT) || null;
            presidentData = p;
          } catch (e) {
            console.log('Error getting president from staff service:', e);
          }
        }

        if (mounted) {
          setPresident(presidentData);
        }
      } catch (e) {
        console.error('ClubPresidentPage: failed to load data', e);
        if (mounted) {
          setError('حدث خطأ أثناء تحميل البيانات');
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

  // Use the president data from state or fallback to mock data
  const finalPresidentData = president || presidentDataMock;

  return <ClubPresidentDashboard president={finalPresidentData} club={club} />;
};

export default ClubPresidentPage;
