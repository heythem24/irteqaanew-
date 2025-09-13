import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Components
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';

// Pages
import HomePage from './pages/HomePage';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AchievementsListPage from './pages/AchievementsListPage';
import AchievementDetailPage from './pages/AchievementDetailPage';
import FeaturedLeaguesListPage from './pages/FeaturedLeaguesListPage';
import LeaguesListPage from './pages/LeaguesListPage';
import LeaguePage from './pages/LeaguePage';
import ClubPage from './pages/ClubPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CompetitionsPage from './pages/CompetitionsPage';
import CompetitionDetailPage from './pages/CompetitionDetailPage';
import CreateClubPage from './pages/admin/CreateClubPage';
import ComprehensiveClubDashboard from './pages/admin/ComprehensiveClubDashboard';
import UserLoginPage from './pages/UserLoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Staff Pages
import LeaguePresidentPage from './pages/staff/LeaguePresidentPage';
import TechnicalDirectorPage from './pages/staff/TechnicalDirectorPage';
import GeneralSecretaryPage from './pages/staff/GeneralSecretaryPage';
import TreasurerPage from './pages/staff/TreasurerPage';
import CoachPage from './pages/staff/CoachPage';
import PhysicalTrainerPage from './pages/staff/PhysicalTrainerPage';
import ClubPresidentPage from './pages/staff/ClubPresidentPage';
import ClubMedicalDashboard from './components/club/ClubMedicalDashboard';
import ClubTechnicalDirectorPage from './pages/staff/ClubTechnicalDirectorPage';
import ClubGeneralSecretaryPage from './pages/staff/ClubGeneralSecretaryPage';
import ClubTreasurerPage from './pages/staff/ClubTreasurerPage';

// Coach Pages
import CoachCompetitionsPage from './pages/coach/CoachCompetitionsPage';
import CoachChatPage from './pages/coach/CoachChatPage';
import AthleteChatPage from './pages/athlete/AthleteChatPage';

// Other Pages
import AthletePage from './pages/AthletesPage';
import AthletesListPage from './pages/AthletesListPage';
import AthleteLoginPage from './pages/AthleteLoginPage';

// Data
import { LeaguesService, ClubsService } from './services/firestoreService';
import type { League, Club } from './types';
import { auth } from './config/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Layout wrapper for league pages
const LeagueLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [league, setLeague] = React.useState<League | null>(null);
  const [reloadTrigger, setReloadTrigger] = React.useState(0); // Trigger for data reload

  React.useEffect(() => {
    const fetchLeague = async () => {
      if (wilayaId) {
        const leagueData = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
        setLeague(leagueData);
      }
    };
    fetchLeague();
  }, [wilayaId, reloadTrigger]); // Reload when trigger changes

  // Handle admin dashboard close event
  React.useEffect(() => {
    const handleAdminDashboardClose = () => {
      setReloadTrigger(prev => prev + 1); // Increment trigger to reload data
    };

    // Add event listener for admin dashboard close
    window.addEventListener('adminDashboardClosed', handleAdminDashboardClose);
    
    return () => {
      window.removeEventListener('adminDashboardClosed', handleAdminDashboardClose);
    };
  }, []);

  return (
    <>
      <Navbar
        variant="league"
        currentLeague={league ? {
          id: league.id,
          wilayaId: league.wilayaId,
          wilayaName: league.wilayaName,
          wilayaNameAr: league.wilayaNameAr
        } : undefined}
        onReloadClubs={() => setReloadTrigger(prev => prev + 1)} // Pass reload function to Navbar
      />
      {children}
    </>
  );
};

// Layout wrapper for club pages
const ClubLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = React.useState<Club | null>();

  React.useEffect(() => {
    const fetchClub = async () => {
      if (clubId) {
        console.log('=== DEBUG: Fetching club data ===');
        console.log('Club ID:', clubId);
        try {
          const clubData = await ClubsService.getClubById(clubId);
          console.log('Club data fetched:', clubData);
          setClub(clubData);
        } catch (error) {
          console.error('Error fetching club data:', error);
        }
      }
    };
    fetchClub();
  }, [clubId]);

  return (
    <>
      <Navbar
        variant="club"
        currentClub={club ? {
          id: club.id,
          name: club.name,
          nameAr: club.nameAr
        } : undefined}
      />
      {children}
    </>
  );
};

// Wrapper for medical staff route to inject clubId
const ClubMedicalDashboardRoute: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  return (
    <ClubLayout>
      <main className="flex-grow-1">
        {/* clubId is required by ClubMedicalDashboard */}
        <ClubMedicalDashboard clubId={clubId || ''} />
      </main>
    </ClubLayout>
  );
};

function App() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((e) => console.warn('Anonymous sign-in failed', e));
      }
    });
    return () => unsub();
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Routes>
          {/* Main routes with main navbar */}
          <Route path="/" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <HomePage />
              </main>
            </>
          } />

          {/* News list & detail */}
          <Route path="/news" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <NewsListPage />
              </main>
            </>
          } />
          <Route path="/news/:newsId" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <NewsDetailPage />
              </main>
            </>
          } />

          {/* Achievements list & detail */}
          <Route path="/achievements" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <AchievementsListPage />
              </main>
            </>
          } />
          <Route path="/achievement/:achievementId" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <AchievementDetailPage />
              </main>
            </>
          } />

          {/* Leagues list */}
          <Route path="/leagues" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <LeaguesListPage />
              </main>
            </>
          } />

          {/* Featured leagues list */}
          <Route path="/featured-leagues" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <FeaturedLeaguesListPage />
              </main>
            </>
          } />

          <Route path="/about" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <AboutPage />
              </main>
            </>
          } />

          <Route path="/contact" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <ContactPage />
              </main>
            </>
          } />

          {/* Competitions page */}
          <Route path="/competitions" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <CompetitionsPage />
              </main>
            </>
          } />
          <Route path="/competitions/:competitionId" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <CompetitionDetailPage />
              </main>
            </>
          } />

          {/* Login Route */}
          <Route path="/login" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <UserLoginPage />
              </main>
            </>
          } />

          {/* Admin Routes */}
          <Route path="/admin/create-club" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <CreateClubPage />
              </main>
            </>
          } />
          <Route path="/admin/club/dashboard" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <ComprehensiveClubDashboard />
              </main>
            </>
          } />
          <Route path="/admin/club/dashboard/:clubId" element={
            <>
              <Navbar variant="main" />
              <main className="flex-grow-1">
                <ComprehensiveClubDashboard />
              </main>
            </>
          } />

          {/* League routes with league navbar */}
          <Route path="/league/:wilayaId" element={
            <LeagueLayout>
              <main className="flex-grow-1">
                <LeaguePage />
              </main>
            </LeagueLayout>
          } />

          {/* League Staff Routes */}
          <Route path="/league/:wilayaId/staff/president" element={
            <LeagueLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="league_president">
                  <LeaguePresidentPage />
                </ProtectedRoute>
              </main>
            </LeagueLayout>
          } />

          <Route path="/league/:wilayaId/staff/technical-director" element={
            <LeagueLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="technical_director">
                  <TechnicalDirectorPage />
                </ProtectedRoute>
              </main>
            </LeagueLayout>
          } />

          <Route path="/league/:wilayaId/staff/general-secretary" element={
            <LeagueLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="general_secretary">
                  <GeneralSecretaryPage />
                </ProtectedRoute>
              </main>
            </LeagueLayout>
          } />

          <Route path="/league/:wilayaId/staff/treasurer" element={
            <LeagueLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="treasurer">
                  <TreasurerPage />
                </ProtectedRoute>
              </main>
            </LeagueLayout>
          } />

          {/* Club Staff Routes */}
          <Route path="/club/:clubId/staff/president" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="club_president" requiredClubId=":clubId">
                  <ClubPresidentPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/coach" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="coach" requiredClubId=":clubId">
                  <CoachPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          {/* Coach Chat Route */}
          <Route path="/club/:clubId/staff/coach/chat" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="coach" requiredClubId=":clubId">
                  <CoachChatPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/coach/competitions" element={            <>              <Navbar variant="main" />              <main className="flex-grow-1">                <ProtectedRoute requiredRole="coach">                  <CoachCompetitionsPage />                </ProtectedRoute>              </main>            </>          } />

          <Route path="/club/:clubId/coach/dashboard" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="coach" requiredClubId=":clubId">
                  <CoachPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/physical-trainer" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="physical_trainer" requiredClubId=":clubId">
                  <PhysicalTrainerPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/medical" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="medical_staff" requiredClubId=":clubId">
                  <ClubMedicalDashboardRoute />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/technical-director" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="technical_director" requiredClubId=":clubId">
                  <ClubTechnicalDirectorPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/general-secretary" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="club_general_secretary" requiredClubId=":clubId">
                  <ClubGeneralSecretaryPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          <Route path="/club/:clubId/staff/treasurer" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="club_treasurer" requiredClubId=":clubId">
                  <ClubTreasurerPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          {/* Athletes List Route */}
          <Route path="/club/:clubId/athlete" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <AthletesListPage />
              </main>
            </ClubLayout>
          } />
          
          {/* Athletes Login Route */}
          <Route path="/club/:clubId/athlete/login" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <AthleteLoginPage />
              </main>
            </ClubLayout>
          } />
          
          {/* Individual Athlete Route */}
          <Route path="/club/:clubId/athlete/:athleteId" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="athlete" requiredClubId=":clubId">
                  <AthletePage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          {/* Athlete Chat Route */}
          <Route path="/club/:clubId/athlete/:athleteId/chat" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ProtectedRoute requiredRole="athlete" requiredClubId=":clubId">
                  <AthleteChatPage />
                </ProtectedRoute>
              </main>
            </ClubLayout>
          } />

          {/* Club routes with club navbar */}
          {/* مسارات البطولات محذوفة مؤقتاً */}

          <Route path="/club/:clubId" element={
            <ClubLayout>
              <main className="flex-grow-1">
                <ClubPage />
              </main>
            </ClubLayout>
          } />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
