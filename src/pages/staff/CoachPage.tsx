import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import CoachDashboard from '../../components/coach/CoachDashboard';
import { UsersService as UserService, ClubsService } from '../../services/firestoreService';
import { clubs as mockClubs } from '../../data/mockData';
import type { Staff, Club, User } from '../../types';

const CoachPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) {
        setLoading(false);
        return;
      }

      try {
        console.log('===CoachPage Debug: Fetching club with ID===', clubId);
        
        // Fetch current user data
        const userData = await UserService.getCurrentUserWithDetails();
        console.log('===CoachPage Debug: Current user data===', userData);
        setCurrentUserData(userData);
        
        // First try to get the club from Firestore
        const firestoreClub = await ClubsService.getClubById(clubId);
        
        if (firestoreClub) {
          console.log('===CoachPage Debug: Club found in Firestore===', firestoreClub);
          setClub(firestoreClub);
        } else {
          console.log('===CoachPage Debug: Club not found in Firestore, checking mock data===');
          // Fallback to mock data
          const mockClub = mockClubs.find(c => c.id === clubId) || null;
          setClub(mockClub);
        }
      } catch (error) {
        console.error('===CoachPage Debug: Error fetching club===', error);
        // Fallback to mock data
        const mockClub = mockClubs.find(c => c.id === clubId) || null;
        setClub(mockClub);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  // Listen to user updates to refresh avatar live
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const fresh = await UserService.getCurrentUserWithDetails();
        setCurrentUserData(fresh);
      } catch {}
    };
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        const local = UserService.getCurrentUser();
        if (!detail?.userId || (local && detail.userId === local.id)) {
          refreshUser();
        }
      } catch {
        refreshUser();
      }
    };
    window.addEventListener('userUpdated', handler as EventListener);
    return () => window.removeEventListener('userUpdated', handler as EventListener);
  }, []);

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

  // Prefer fresh user data from Firestore; fallback to localStorage snapshot
  const currentUser = currentUserData || UserService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'coach') {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>غير مصرح لك بالوصول</h2>
          <p className="text-muted">يجب أن تكون مدرباً للوصول إلى هذه الصفحة</p>
        </div>
      </Container>
    );
  }

  // Create coach object from current user
  const coach: Staff = {
    id: currentUser.id,
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    firstNameAr: currentUser.firstName || '',
    lastNameAr: currentUser.lastName || '',
    position: 'coach',
    positionAr: 'المدرب الرئيسي',
    clubId: currentUser.clubId || club.id,
    image: currentUser?.image,
    email: currentUser.email,
    phone: currentUser.phone,
    isActive: currentUser.isActive,
    createdAt: new Date()
  };



  return (
    <>
      <div className="container mt-4" dir="rtl">
        <div className="d-flex justify-content-end mb-3">
          <Link to={`/club/${club.id}/staff/coach/chat`} className="btn btn-outline-primary">
            <i className="fas fa-comments me-2"></i>
            الدردشة
          </Link>
        </div>
      </div>
      <CoachDashboard
        coach={coach}
        club={club}
      />
    </>
  );
};

export default CoachPage;
