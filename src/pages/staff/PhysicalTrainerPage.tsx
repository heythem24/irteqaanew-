import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import PhysicalTrainerDashboard from '../../components/physical-trainer/PhysicalTrainerDashboard';
import { clubs as mockClubs, staff as mockStaff } from '../../data/mockData';
import { StaffPosition } from '../../types';
import { ClubsService, UsersService } from '../../services/firestoreService';
import type { Club, Staff, User } from '../../types';

// Mock data for the physical trainer as fallback
const physicalTrainerData = {
  id: 'pt-001',
  firstName: 'Karim',
  lastName: 'Bensalah',
  firstNameAr: 'كريم',
  lastNameAr: 'بن صالح',
  firstNameEn: 'Karim',
  lastNameEn: 'Bensalah',
  position: StaffPosition.PHYSICAL_TRAINER,
  positionAr: 'المحضر البدني',
  positionEn: 'Physical Trainer',
  email: 'trainer@club.dz',
  phone: '+213 555 789 012',
  bioAr: 'محضر بدني متخصص في تدريب الرياضيين على الجودو، مع خبرة واسعة في تطوير برامج التدريب البدني وتحسين الأداء الرياضي.',
  bioEn: 'Physical trainer specializing in judo athlete training, with extensive experience in developing physical training programs and improving athletic performance.',
  image: '/images/staff/physical-trainer.jpg',
  isActive: true,
  createdAt: new Date()
};

const PhysicalTrainerPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [physicalTrainer, setPhysicalTrainer] = useState<Staff | null>(null);
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

        console.log('===PhysicalTrainerPage Debug: Fetching club data===', clubId);
        
        // Fetch current user data
        const userData = await UsersService.getCurrentUserWithDetails();
        console.log('===PhysicalTrainerPage Debug: Current user data===', userData);
        if (mounted) setCurrentUser(userData);
        
        // Fetch club from Firestore first
        const clubData = await ClubsService.getClubById(clubId);
        console.log('===PhysicalTrainerPage Debug: Club data from Firestore===', clubData);
        
        if (clubData) {
          setClub(clubData);
        } else {
          // Fallback to mock data
          console.log('===PhysicalTrainerPage Debug: Falling back to mock data===');
          const mockClub = mockClubs.find(c => c.id === clubId);
          setClub(mockClub || null);
        }

        // Use current user data if they are a physical trainer
        let trainerData: Staff | null = null;
        if (userData && userData.role === 'physical_trainer') {
          console.log('===PhysicalTrainerPage Debug: Using current user as physical trainer===');
          trainerData = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            firstNameAr: userData.firstName,
            lastNameAr: userData.lastName,
            position: StaffPosition.PHYSICAL_TRAINER,
            positionAr: 'المحضر البدني',
            email: userData.email,
            phone: userData.phone,
            bioAr: 'محضر بدني متخصص في تدريب الرياضيين على الجودو، مع خبرة واسعة في تطوير برامج التدريب البدني وتحسين الأداء الرياضي.',
            image: userData.image,
            isActive: true,
            createdAt: new Date()
          };
        } else {
          // Fallback to mock by clubId if current user is not a physical trainer
          console.log('===PhysicalTrainerPage Debug: Current user is not a physical trainer, using fallback===');
          const club = mockClubs.find(c => c.id === clubId);
          if (club) {
            trainerData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.PHYSICAL_TRAINER
            ) || null;
          }
        }

        if (mounted) setPhysicalTrainer(trainerData);
      } catch (e) {
        console.error('Error loading club physical trainer:', e);
        // Fallback to mock data on error
        try {
          const club = mockClubs.find(c => c.id === clubId);
          setClub(club || null);
          
          // Try to get current user as fallback
          const userData = await UsersService.getCurrentUserWithDetails();
          if (mounted) setCurrentUser(userData);
          
          let trainerData: Staff | null = null;
          if (userData && userData.role === 'physical_trainer') {
            trainerData = {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              firstNameAr: userData.firstName,
              lastNameAr: userData.lastName,
              position: StaffPosition.PHYSICAL_TRAINER,
              positionAr: 'المحضر البدني',
              email: userData.email,
              phone: userData.phone,
              bioAr: 'محضر بدني متخصص في تدريب الرياضيين على الجودو، مع خبرة واسعة في تطوير برامج التدريب البدني وتحسين الأداء الرياضي.',
              image: userData.image,
              isActive: true,
              createdAt: new Date()
            };
          } else if (club) {
            trainerData = mockStaff.find(s =>
              s.clubId === club.id && s.position === StaffPosition.PHYSICAL_TRAINER
            ) || null;
          }
          if (mounted) setPhysicalTrainer(trainerData);
        } catch {
          if (mounted) setError('حدث خطأ أثناء تحميل بيانات المحضر البدني');
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

  // Use the trainer data from state or fallback to mock data
  const finalTrainerData = physicalTrainer || physicalTrainerData;

  return (
    <div>
      <PhysicalTrainerDashboard
        physicalTrainer={finalTrainerData}
        club={club}
      />
    </div>
  );
};

export default PhysicalTrainerPage;
