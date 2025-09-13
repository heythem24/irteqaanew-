import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { clubs as mockClubs, staff as mockStaff } from '../../data/mockData';
import type { Staff, Club, User } from '../../types';
import { StaffPosition } from '../../types';
import { ClubsService, UsersService } from '../../services/firestoreService';
import ClubGeneralSecretaryDashboard from '../../components/club/ClubGeneralSecretaryDashboard';

// Mock data for the general secretary as fallback
const generalSecretaryData = {
  id: 'gs-001',
  firstName: 'Said',
  lastName: 'Bennacer',
  firstNameAr: 'سعيد',
  lastNameAr: 'بن ناصر',
  firstNameEn: 'Said',
  lastNameEn: 'Bennacer',
  position: StaffPosition.GENERAL_SECRETARY,
  positionAr: 'الكاتب العام',
  positionEn: 'General Secretary',
  email: 'secretary@club.dz',
  phone: '+213 555 234 567',
  bioAr: 'كاتب عام للنادي بخبرة في الإدارة والتنظيم، متخصص في إدارة الشؤون الإدارية والمالية للنادي.',
  bioEn: 'General Secretary of the club with experience in administration and organization, specialized in managing the administrative and financial affairs of the club.',
  image: '/images/staff/general-secretary.jpg',
  isActive: true,
  createdAt: new Date()
};

const ClubGeneralSecretaryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [generalSecretary, setGeneralSecretary] = useState<Staff | null>(null);
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

        console.log('===ClubGeneralSecretaryPage Debug: Fetching club data===', clubId);
        
        // Fetch current user data
        const userData = await UsersService.getCurrentUserWithDetails();
        console.log('===ClubGeneralSecretaryPage Debug: Current user data===', userData);
        if (mounted) setCurrentUser(userData);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===ClubGeneralSecretaryPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===ClubGeneralSecretaryPage Debug: Falling back to mock data===');
          const mockClub = mockClubs.find(c => c.id === clubId);
          setClub(mockClub || null);
        }

        // Use current user data if they are a general secretary
        let secretaryData: Staff | null = null;
        if (userData && userData.role === 'club_general_secretary') {
          console.log('===ClubGeneralSecretaryPage Debug: Using current user as general secretary===');
          secretaryData = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            firstNameAr: userData.firstName,
            lastNameAr: userData.lastName,
            position: StaffPosition.GENERAL_SECRETARY,
            positionAr: 'الكاتب العام',
            email: userData.email,
            phone: userData.phone,
            bioAr: 'كاتب عام للنادي بخبرة في الإدارة والتنظيم، متخصص في إدارة الشؤون الإدارية والمالية للنادي.',
            image: userData.image,
            isActive: true,
            createdAt: new Date()
          };
        } else {
          // Fallback to mock by clubId if current user is not a general secretary
          console.log('===ClubGeneralSecretaryPage Debug: Current user is not a general secretary, using fallback===');
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            secretaryData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.GENERAL_SECRETARY
            ) || null;
          }
        }

        if (mounted) setGeneralSecretary(secretaryData);
      } catch (e) {
        console.error('Error loading club general secretary:', e);
        // Fallback to mock data on error
        try {
          const club = mockClubs.find(c => c.id === clubId);
          setClub(club || null);
          
          // Try to get current user as fallback
          const userData = await UsersService.getCurrentUserWithDetails();
          if (mounted) setCurrentUser(userData);
          
          let secretaryData: Staff | null = null;
          if (userData && userData.role === 'club_general_secretary') {
            secretaryData = {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              firstNameAr: userData.firstName,
              lastNameAr: userData.lastName,
              position: StaffPosition.GENERAL_SECRETARY,
              positionAr: 'الكاتب العام',
              email: userData.email,
              phone: userData.phone,
              bioAr: 'كاتب عام للنادي بخبرة في الإدارة والتنظيم، متخصص في إدارة الشؤون الإدارية والمالية للنادي.',
              image: userData.image,
              isActive: true,
              createdAt: new Date()
            };
          } else if (club) {
            secretaryData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.GENERAL_SECRETARY
            ) || null;
          }
          if (mounted) setGeneralSecretary(secretaryData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات الكاتب العام');
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

  // Use the secretary data from state or fallback to mock data
  const finalSecretaryData = generalSecretary || generalSecretaryData;

  return <ClubGeneralSecretaryDashboard secretary={finalSecretaryData} club={club} />;

};

export default ClubGeneralSecretaryPage;
