import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { LeaguesService, UsersService } from '../../services/firestoreService';
import { StaffService } from '../../services/mockDataService';
import { leagues as mockLeagues, staff as mockStaff } from '../../data/mockData';
import type { Staff, League, User } from '../../types';
import { StaffPosition } from '../../types';

import LeaguePresidentDashboard from '../../components/league/LeaguePresidentDashboard';

const LeaguePresidentPage: React.FC = () => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [president, setPresident] = useState<Staff | null>(null);
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

        console.log('===LeaguePresidentPage Debug: Fetching league data===', wilayaId);
        
        // Fetch league from Firestore first
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
        console.log('===LeaguePresidentPage Debug: League data from Firestore===', leagueData);
        
        if (leagueData) {
          setLeague(leagueData);
        } else {
          // Fallback to mock data
          console.log('===LeaguePresidentPage Debug: Falling back to mock data===');
          const mockLeague = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(mockLeague || null);
        }

        let presidentData: Staff | null = null;
        
        // First try to get the current logged-in user
        try {
          const currentUser = UsersService.getCurrentUser();
          if (currentUser && currentUser.role === 'league_president') {
            // Convert User to Staff format
            presidentData = {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              firstNameAr: currentUser.firstNameAr || currentUser.firstName,
              lastNameAr: currentUser.lastNameAr || currentUser.lastName,
              position: StaffPosition.LEAGUE_PRESIDENT,
              positionAr: 'رئيس الرابطة',
              bioAr: 'رئيس الرابطة الولائية للجودو',
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
        
        // If no current user, try to get by presidentId
        if (!presidentData && leagueData && leagueData.presidentId) {
          try {
            const staffMember = await StaffService.getStaffMemberById(leagueData.presidentId);
            presidentData = (staffMember as unknown) as Staff | null;
          } catch (e) {
            // ignore and fallback below
          }
        }

        // Fallback to mock by wilayaId if Firestore didn't yield a president
        if (!presidentData) {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          if (league) {
            presidentData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.LEAGUE_PRESIDENT
            ) || null;
          }
        }

        if (mounted) setPresident(presidentData);
      } catch (e) {
        console.error('Error loading league president:', e);
        // Fallback to mock data on error
        try {
          const league = mockLeagues.find(l => l.wilayaId.toString() === wilayaId);
          setLeague(league || null);
          let presidentData: Staff | null = null;
          if (league) {
            presidentData = mockStaff.find(s =>
              s.leagueId === league.id && s.position === StaffPosition.LEAGUE_PRESIDENT
            ) || null;
          }
          if (mounted) setPresident(presidentData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات رئيس الرابطة');
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

  if (!president) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">لم يتم العثور على بيانات رئيس الرابطة.</Alert>
      </Container>
    );
  }

  return <LeaguePresidentDashboard president={president} league={league} />;
};

export default LeaguePresidentPage;
