import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { StaffService } from '../../services/mockDataService';
import { leagues as mockLeagues, staff as mockStaff } from '../../data/mockData';
import type { Staff, League, User } from '../../types';
import { StaffPosition } from '../../types';
import LeagueTreasurerDashboard from '../../components/league/LeagueTreasurerDashboard';
import { LeaguesService, UsersService } from '../../services/firestoreService';

// Mock data for the treasurer as fallback
const treasurerData = {
  id: 'tr-001',
  firstName: 'Rachid',
  lastName: 'Bouchama',
  firstNameAr: 'رشيد',
  lastNameAr: 'بوشامة',
  firstNameEn: 'Rachid',
  lastNameEn: 'Bouchama',
  position: StaffPosition.TREASURER,
  positionAr: 'أمين مال الرابطة',
  positionEn: 'League Treasurer',
  email: 'treasurer@league.dz',
  phone: '+213 555 456 789',
  bioAr: 'أمين مال للرابطة الولائية للجودو بخبرة واسعة في الإدارة المالية والمحاسبية. متخصص في إدارة الميزانيات والمصروفات وتحضير التقارير المالية.',
  bioEn: 'Treasurer of the State Judo League with extensive experience in financial and accounting management. Specialized in budget management, expenses, and preparing financial reports.',
  image: '/images/staff/treasurer.jpg',
  isActive: true,
  createdAt: new Date()
};

const TreasurerPage: React.FC = () => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [treasurer, setTreasurer] = useState<Staff | null>(null);
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

        console.log('===TreasurerPage Debug: Fetching league data===', wilayaId);
        
        // Fetch league from Firestore first
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
        console.log('===TreasurerPage Debug: League data from Firestore===', leagueData);
        
        if (leagueData) {
          setLeague(leagueData);
        } else {
          // Fallback to mock data
          console.log('===TreasurerPage Debug: Falling back to mock data===');
          const mockLeague = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(mockLeague || null);
        }

        let treasurerData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'treasurer') {
            // Convert User to Staff format
            treasurerData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.TREASURER,
              positionAr: 'أمين مال الرابطة',
              bioAr: 'أمين مال الرابطة الولائية للجودو',
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
        
        // If no current user, try to find treasurer by leagueId
        if (!treasurerData && leagueData) {
          try {
            // Try to find treasurer by leagueId
            // Since getStaffMemberByLeagueAndPosition doesn't exist, we'll use a different approach
            // For now, we'll fall back to mock data
            console.log('===TreasurerPage Debug: getStaffMemberByLeagueAndPosition not available, using fallback===');
          } catch (e) {
            // ignore and fallback below
          }
        }

        // Fallback to mock by wilayaId if Firestore didn't yield a treasurer
        if (!treasurerData) {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          if (league) {
            treasurerData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.TREASURER
            ) || null;
          }
        }

        if (mounted) setTreasurer(treasurerData);
      } catch (e) {
        console.error('Error loading league treasurer:', e);
        // Fallback to mock data on error
        try {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(league || null);
          let treasurerData: Staff | null = null;
          if (league) {
            treasurerData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.TREASURER
            ) || null;
          }
          if (mounted) setTreasurer(treasurerData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات أمين مال الرابطة');
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

  // Use the treasurer data from state or fallback to mock data
  const finalTreasurerData = treasurer || treasurerData;

  return <LeagueTreasurerDashboard treasurer={finalTreasurerData} league={league} />;
};

export default TreasurerPage;
