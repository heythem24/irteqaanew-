import React, { useState, useEffect, useRef } from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import { wilayas } from '../../data/wilayas';
import { ClubsService, LeaguesService } from '../../services/firestoreService';
import DynamicAdminDashboard from '../admin/DynamicAdminDashboard';

import logo from '../../logo.png';
interface NavbarProps {
  variant?: 'main' | 'league' | 'club';
  currentLeague?: {
    id: string;
    wilayaId: number;
    wilayaName: string;
    wilayaNameAr: string;
  };
  currentClub?: {
    id: string;
    name: string;
    nameAr: string;
  };
  onReloadClubs?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'main', currentLeague, currentClub }) => {
  const location = useLocation();
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [dynamicClubs, setDynamicClubs] = useState<Array<{ id: string; nameAr: string; name: string }>>([]);
  const [resolvedLeague, setResolvedLeague] = useState<NavbarProps['currentLeague'] | undefined>(currentLeague);
  // For club navbar: resolve league wilayaId from current club -> league
  const [leagueWilayaId, setLeagueWilayaId] = useState<string | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve league from props or by route param if not provided
  useEffect(() => {
    const resolve = async () => {
      try {
        if (currentLeague) {
          setResolvedLeague(currentLeague);
          return;
        }
        if (variant === 'league' && wilayaId) {
          const league = await LeaguesService.getLeagueByWilayaId(parseInt(wilayaId, 10));
          if (league) {
            setResolvedLeague({
              id: league.id,
              wilayaId: league.wilayaId,
              wilayaName: league.wilayaName,
              wilayaNameAr: league.wilayaNameAr
            });
          } else {
            setResolvedLeague(undefined);
          }
        }
      } catch (e) {
        console.error('Navbar resolve league error:', e);
        setResolvedLeague(undefined);
      }
    };
    resolve();
  }, [currentLeague, variant, wilayaId]);

  // Resolve league wilayaId for club variant
  useEffect(() => {
    const resolveClubLeague = async () => {
      try {
        if (variant === 'club' && currentClub?.id) {
          const club = await ClubsService.getClubById(currentClub.id);
          if (club?.leagueId) {
            const league = await LeaguesService.getLeagueById(club.leagueId);
            if (league?.wilayaId != null) setLeagueWilayaId(String(league.wilayaId));
          }
        } else {
          setLeagueWilayaId(null);
        }
      } catch (e) {
        console.warn('Navbar: failed to resolve club->league wilayaId', e);
        setLeagueWilayaId(null);
      }
    };
    resolveClubLeague();
  }, [variant, currentClub?.id]);

  // Load dynamic clubs for current league
  const fetchClubsForNav = async () => {
    console.log('===Navbar Debug: Starting clubs fetch for league===');
    console.log('CurrentLeague (prop):', currentLeague);
    console.log('ResolvedLeague (effective):', resolvedLeague);
    console.log('Reload trigger count:', showAdminDashboard);
    
    try {
      if (resolvedLeague) {
        console.log('===Navbar Debug: Fetching clubs for specific league===');
        console.log('League ID:', resolvedLeague.id);
        let clubs = await ClubsService.getClubsByLeagueFlexible(resolvedLeague.id, resolvedLeague.wilayaId);
        console.log('===Navbar Debug: Clubs fetched from Firestore==>');
        console.log('Raw clubs data:', clubs);
        console.log('Formatted clubs count:', clubs.length);

        // Only use fallback if we have no clubs at all
        if (clubs.length === 0) {
          console.warn('===Navbar Debug: No clubs by leagueId. Falling back to getAllClubs()+client filter===');
          try {
            const all = await ClubsService.getAllClubs();
            const filtered = all.filter((c: any) =>
              c.leagueId === resolvedLeague.id ||
              c.leagueId === resolvedLeague.wilayaId ||
              String(c.leagueId) === String(resolvedLeague.wilayaId)
            );
            console.log('===Navbar Debug: Client-filtered clubs count===', filtered.length);
            clubs = filtered as any;
          } catch (e) {
            console.error('===Navbar Debug: Fallback getAllClubs failed===', e);
          }
        }
        
        // The clubs are already filtered by getClubsByLeagueFlexible, so we don't need additional filtering
        // This was causing all clubs to be filtered out
        console.log('===Navbar Debug: Using filtered clubs without additional filtering===', clubs.length);
        
        const formattedClubs = clubs.map(c => ({ id: c.id, name: c.name, nameAr: c.nameAr }));
        console.log('Formatted clubs for navigation:', formattedClubs);
        
        setDynamicClubs(formattedClubs);
        console.log('===Navbar Debug: Clubs state updated successfully===');
      } else {
        console.log('===Navbar Debug: No current league, fetching all clubs===');
        try {
          const allClubs = await ClubsService.getAllClubs();
          console.log('===Navbar Debug: All clubs fetched from Firestore==>');
          console.log('Raw all clubs data:', allClubs);
          console.log('All clubs count:', allClubs.length);
          
          const formattedClubs = allClubs.map(c => ({ id: c.id, name: c.name, nameAr: c.nameAr }));
          console.log('Formatted all clubs for navigation:', formattedClubs);
          
          setDynamicClubs(formattedClubs);
          console.log('===Navbar Debug: All clubs state updated successfully===');
        } catch (error) {
          console.error('===Navbar Debug: Error fetching all clubs for navigation===:', error);
          setDynamicClubs([]);
        }
      }
    } catch (error) {
      console.error('===Navbar Debug: Error fetching clubs for navigation===:', error);
      setDynamicClubs([]);
    }
  };

  useEffect(() => {
    fetchClubsForNav();
  }, [resolvedLeague, showAdminDashboard]); // Reload when admin dashboard closes

  // Listen for club created event
  useEffect(() => {
    const handleClubCreated = (event: CustomEvent) => {
      console.log('===Navbar Debug: Club created event received===', event.detail);
      // Only refresh if the created club belongs to the current league
      if (resolvedLeague &&
          (event.detail.leagueId === resolvedLeague.id ||
           event.detail.wilayaId === resolvedLeague.wilayaId)) {
        console.log('===Navbar Debug: Refreshing clubs list for current league===');
        fetchClubsForNav();
      }
    };

    window.addEventListener('clubCreated', handleClubCreated as EventListener);
    
    return () => {
      window.removeEventListener('clubCreated', handleClubCreated as EventListener);
    };
  }, [resolvedLeague]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    clickCountRef.current += 1;
    
    // Clear previous timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // Set new timer
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 3) {
        // Triple click detected - show admin dashboard
        setShowAdminDashboard(true);
      } else if (clickCountRef.current === 1) {
        // Single click - navigate to home
        window.location.href = '/';
      }
      clickCountRef.current = 0;
    }, 400); // 400ms window for detecting multiple clicks
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMainNavbar = () => (
    <>
      <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="shadow fixed-top py-2" style={{ top: 0, left: 0, right: 0, zIndex: 1030 }}>
        <Container className="d-flex align-items-center">
          <BootstrapNavbar.Brand 
            as={Link} 
            to="/" 
            className="fw-bold d-flex align-items-center" 
            onClick={handleLogoClick}
            style={{ cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <img 
              src={logo} 
              height="32" 
              className="me-2"
              style={{ marginTop: 0, filter: 'invert(1) brightness(1.8)' }}
            />
            IRTEQAA
          </BootstrapNavbar.Brand>
          
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={isActive('/') ? 'active' : ''}
              >
                الرئيسية
              </Nav.Link>
              
              <NavDropdown title="الرابطات" id="leagues-dropdown">
                {wilayas.map(wilaya => (
                  <NavDropdown.Item
                    key={wilaya.id}
                    as={Link}
                    to={`/league/${wilaya.id}`}
                  >
                    رابطة {wilaya.nameAr}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
              
              <Nav.Link 
                as={Link}
                to="/competitions"
                className={isActive('/competitions') ? 'active' : ''}
              >
                البطولات والمنافسات
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/about" 
                className={isActive('/about') ? 'active' : ''}
              >
                من نحن
              </Nav.Link>
              
              <Nav.Link
                as={Link}
                to="/contact"
                className={isActive('/contact') ? 'active' : ''}
              >
                اتصل بنا
              </Nav.Link>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
      
      <DynamicAdminDashboard 
        show={showAdminDashboard} 
        onHide={() => setShowAdminDashboard(false)} 
      />
    </>
  );

  const renderLeagueNavbar = () => (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow fixed-top py-2" style={{ top: 0, left: 0, right: 0, zIndex: 1030 }}>
      <Container className="d-flex align-items-center">
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
          رابطة {resolvedLeague?.wilayaNameAr} للجودو
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="league-navbar-nav" />
        <BootstrapNavbar.Collapse id="league-navbar-nav">
          <Nav className="me-auto d-flex align-items-center flex-nowrap gap-2">
            <Nav.Link 
              as={Link} 
              to="/"
              className={isActive('/') ? 'active' : ''}
            >
              الرئيسية
            </Nav.Link>
            
            <NavDropdown title="الطاقم الفني" id="staff-dropdown">
              <NavDropdown.Item
                as={Link}
                to={`/league/${resolvedLeague?.wilayaId}/staff/president`}
              >
                رئيس الرابطة
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/league/${resolvedLeague?.wilayaId}/staff/technical-director`}
              >
                المدير التقني
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/league/${resolvedLeague?.wilayaId}/staff/general-secretary`}
              >
                الكاتب العام
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/league/${resolvedLeague?.wilayaId}/staff/treasurer`}
              >
                أمين المال
              </NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown 
              title="النوادي التابعة" 
              id="clubs-dropdown" 
              className="clubs-dropdown-custom"
              style={{ 
                minWidth: '320px',
                maxWidth: '400px'
              }}
            >
              <div className="dropdown-header-custom bg-primary text-white p-3 rounded-top">
                <h6 className="mb-0 text-center">
                  <i className="fas fa-building me-2"></i>
                  نوادي رابطة {resolvedLeague?.wilayaNameAr}
                </h6>
              </div>
              
              {/* Dynamic clubs from localStorage */}
              {dynamicClubs.length > 0 ? (
                <div className="clubs-list-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {dynamicClubs.map((club, index) => (
                    <NavDropdown.Item
                      key={club.id}
                      as={Link}
                      to={`/club/${club.id}`}
                      className="club-item-custom"
                      style={{ 
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        padding: '12px 20px',
                        lineHeight: '1.5',
                        borderBottom: index < dynamicClubs.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem',
                        color: '#2c3e50',
                        backgroundColor: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e3f2fd';
                        e.currentTarget.style.borderRight = '4px solid #007bff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderRight = 'none';
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="club-icon me-3">
                          <i className="fas fa-shield-alt text-primary"></i>
                        </div>
                        <div>
                          <div className="club-name fw-bold" style={{ color: '#2c3e50' }}>
                            {club.nameAr}
                          </div>
                          <small className="text-muted">
                            النادي الرياضي
                          </small>
                        </div>
                      </div>
                    </NavDropdown.Item>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="fas fa-exclamation-triangle text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mb-3">
                    لا توجد نوادي مسجلة حالياً
                  </p>
                  <small className="text-muted">
                    يرجى إنشاء النوادي من لوحة التحكم
                  </small>
                </div>
              )}
            </NavDropdown>
            
          </Nav>
          
          {/* Removed right-side actions to avoid confusing toggling across pages */}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );

  const renderClubNavbar = () => (
    <BootstrapNavbar bg="success" variant="dark" expand="lg" className="shadow fixed-top py-2" style={{ top: 0, left: 0, right: 0, zIndex: 1030 }}>
      <Container className="d-flex align-items-center">
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
          {currentClub?.nameAr || 'النادي'}
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="club-navbar-nav" />
        <BootstrapNavbar.Collapse id="club-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to={leagueWilayaId ? `/league/${leagueWilayaId}` : '/'}
              className={leagueWilayaId ? (isActive(`/league/${leagueWilayaId}`) ? 'active' : '') : (isActive('/') ? 'active' : '')}
            >
              الرئيسية
            </Nav.Link>

            <NavDropdown title="الطاقم الفني" id="club-staff-dropdown">
              <NavDropdown.Item
                as={Link}
                to={`/club/${currentClub?.id}/staff/president`}
              >
                <i className="fas fa-crown me-2"></i>
                رئيس النادي
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                as={Link}
                to={`/login?role=coach&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-user-graduate me-2"></i>
                المدرب
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/login?role=coach&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                لوحة تحكم المدرب
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/login?role=physical_trainer&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-dumbbell me-2"></i>
                المحضر البدني
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/login?role=medical_staff&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-briefcase-medical me-2"></i>
                الطاقم الطبي
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/login?role=technical_director&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-cogs me-2"></i>
                المدير التقني
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                as={Link}
                to={`/login?role=club_general_secretary&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-file-alt me-2"></i>
                الكاتب العام
              </NavDropdown.Item>
              <NavDropdown.Item
                as={Link}
                to={`/login?role=club_treasurer&clubId=${currentClub?.id}`}
              >
                <i className="fas fa-calculator me-2"></i>
                أمين المال
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              as={Link}
              to={`/club/${currentClub?.id}/athlete/login?clubId=${currentClub?.id}`}
              className={isActive(`/club/${currentClub?.id}/athlete/login`) ? 'active' : ''}
            >
              <i className="fas fa-users me-2"></i>
              الرياضيون
            </Nav.Link>

            {/* Future features - Athletes and News will be added later */}
          </Nav>

          {/* Removed right-side 'Back to Home' to avoid persisting button across pages */}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );

  if (variant === 'main') return renderMainNavbar();
  if (variant === 'league') return renderLeagueNavbar();
  if (variant === 'club') return renderClubNavbar();
  return renderMainNavbar();
};

export default Navbar;
