import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { clubs as mockClubs, staff as mockStaff } from '../../data/mockData';
import type { Staff, Club, User } from '../../types';
import { StaffPosition } from '../../types';
import { ClubsService, UsersService } from '../../services/firestoreService';
import ClubTreasurerDashboard from '../../components/club/ClubTreasurerDashboard';

// Mock data for the treasurer as fallback
const treasurerData = {
  id: 'tr-001',
  firstName: 'Rachid',
  lastName: 'Kaci',
  firstNameAr: 'رشيد',
  lastNameAr: 'قاسي',
  firstNameEn: 'Rachid',
  lastNameEn: 'Kaci',
  position: StaffPosition.TREASURER,
  positionAr: 'أمين المال',
  positionEn: 'Treasurer',
  email: 'treasurer@club.dz',
  phone: '+213 555 345 678',
  bioAr: 'أمين مال للنادي بخبرة في الإدارة المالية والمحاسبة، متخصص في إدارة الميزانية والموارد المالية للنادي.',
  bioEn: 'Treasurer of the club with experience in financial management and accounting, specialized in managing the budget and financial resources of the club.',
  image: '/images/staff/treasurer.jpg',
  isActive: true,
  createdAt: new Date()
};

const ClubTreasurerPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [treasurer, setTreasurer] = useState<Staff | null>(null);
  const [club, setClub] = useState<Club | null>(null);
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

        console.log('===ClubTreasurerPage Debug: Fetching club data===', clubId);
        
        // Fetch current user data
        const userData = await UsersService.getCurrentUserWithDetails();
        console.log('===ClubTreasurerPage Debug: Current user data===', userData);
        if (mounted) setCurrentUser(userData);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===ClubTreasurerPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===ClubTreasurerPage Debug: Falling back to mock data===');
          const mockClub = mockClubs.find(c => c.id === clubId);
          setClub(mockClub || null);
        }

        // Use current user data if they are a treasurer
        let treasurerData: Staff | null = null;
        if (userData && userData.role === 'club_treasurer') {
          console.log('===ClubTreasurerPage Debug: Using current user as treasurer===');
          treasurerData = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            firstNameAr: userData.firstName,
            lastNameAr: userData.lastName,
            position: StaffPosition.TREASURER,
            positionAr: 'أمين المال',
            email: userData.email,
            phone: userData.phone,
            bioAr: 'أمين مال للنادي بخبرة في الإدارة المالية والمحاسبة، متخصص في إدارة الميزانية والموارد المالية للنادي.',
            image: userData.image,
            isActive: true,
            createdAt: new Date()
          };
        } else {
          // Fallback to mock by clubId if current user is not a treasurer
          console.log('===ClubTreasurerPage Debug: Current user is not a treasurer, using fallback===');
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            treasurerData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.TREASURER
            ) || null;
          }
        }

        if (mounted) setTreasurer(treasurerData);
      } catch (e) {
        console.error('Error loading club treasurer:', e);
        // Fallback to mock data on error
        try {
          const club = mockClubs.find(c => c.id === clubId);
          setClub(club || null);
          
          // Try to get current user as fallback
          const userData = await UsersService.getCurrentUserWithDetails();
          if (mounted) setCurrentUser(userData);
          
          let treasurerData: Staff | null = null;
          if (userData && userData.role === 'club_treasurer') {
            treasurerData = {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              firstNameAr: userData.firstName,
              lastNameAr: userData.lastName,
              position: StaffPosition.TREASURER,
              positionAr: 'أمين المال',
              email: userData.email,
              phone: userData.phone,
              bioAr: 'أمين مال للنادي بخبرة في الإدارة المالية والمحاسبة، متخصص في إدارة الميزانية والموارد المالية للنادي.',
              image: userData.image,
              isActive: true,
              createdAt: new Date()
            };
          } else if (club) {
            treasurerData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.TREASURER
            ) || null;
          }
          if (mounted) setTreasurer(treasurerData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات أمين المال');
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

  // Use the treasurer data from state or fallback to mock data
  const finalTreasurerData = treasurer || treasurerData;

  return <ClubTreasurerDashboard treasurer={finalTreasurerData} club={club} />;
};

export default ClubTreasurerPage;
