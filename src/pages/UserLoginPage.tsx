import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { UsersService, ClubsService } from '../services/firestoreService';
import { Link } from 'react-router-dom';

interface AvailableAccount {
  id: string;
  role: string;
  clubId?: string;
  leagueId?: string;
  isActive: boolean;
}

const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    'general_secretary': 'الكاتب العام للرابطة',
    'club_general_secretary': 'الكاتب العام للنادي',
    'league_president': 'رئيس الرابطة',
    'club_president': 'رئيس النادي',
    'coach': 'المدرب',
    'physical_trainer': 'المحضر البدني',
    'treasurer': 'أمين المال للرابطة',
    'club_treasurer': 'أمين المال للنادي',
    'technical_director': 'المدير الفني',
    'medical_staff': 'الطاقم الطبي',
    'athlete': 'رياضي',
    'admin': 'مدير النظام'
  };
  return roleNames[role] || role;
};

const UserLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>('');
  const [currentUserMismatch, setCurrentUserMismatch] = useState<{ hasUser: boolean; mismatch: boolean; currentRole?: string; currentClubId?: string }>({ hasUser: false, mismatch: false });
  const [availableAccounts, setAvailableAccounts] = useState<AvailableAccount[]>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const state = location.state as { from?: Location; error?: string };
    if (state?.error) {
      setError(state.error);
    }
  }, [location]);

  useEffect(() => {
    const state = location.state as { error?: string };
    if (state?.error) {
      return;
    }

    // If arriving with intent to login for a specific role/club, do NOT auto-redirect
    try {
      const sp = new URLSearchParams(location.search);
      const roleParam = sp.get('role');
      const clubParam = sp.get('clubId');
      if (roleParam || clubParam) {
        return;
      }
    } catch {}

    const checkAndRedirect = async () => {
      if (UsersService.isAuthenticated()) {
        const currentUser = UsersService.getCurrentUser();
        if (currentUser) {
          await redirectToUserPage(currentUser);
        }
      }
    };

    checkAndRedirect();
  }, [navigate, location.state, location.search]);

  // Read role, clubId, leagueId from query params
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const roleParam = sp.get('role');
      const clubParam = sp.get('clubId');
      const leagueParam = sp.get('leagueId');
      const wilayaParam = sp.get('wilayaId');
      if (roleParam) setSelectedRole(roleParam);
      if (clubParam) setSelectedClubId(clubParam);
      if (leagueParam) setSelectedLeagueId(leagueParam);
      if (wilayaParam) setSelectedWilayaId(wilayaParam);
      // If already logged in, check mismatch with intent
      const cu = UsersService.getCurrentUser();
      if (cu) {
        const desiredRole = roleParam || undefined;
        const desiredClub = clubParam || undefined;
        const desiredLeague = leagueParam || undefined;
        const mismatch = (!!desiredRole && cu.role !== desiredRole) || 
                        (!!desiredClub && cu.clubId !== desiredClub) ||
                        (!!desiredLeague && cu.leagueId !== desiredLeague);
        setCurrentUserMismatch({ hasUser: true, mismatch: Boolean(mismatch), currentRole: cu.role, currentClubId: cu.clubId });
      } else {
        setCurrentUserMismatch({ hasUser: false, mismatch: false });
      }
    } catch {}
  }, [location.search]);

  const handleLogoutAndSwitch = () => {
    try {
      UsersService.logout();
    } catch {}
    // Stay on the same login page with intent params; no redirect
    setCurrentUserMismatch({ hasUser: false, mismatch: false });
  };

  const redirectToUserPage = async (user: any) => {
    const { role, clubId, leagueId } = user;

    const clubRoles = [
      'club_president', 'coach', 'physical_trainer', 'club_general_secretary', 
      'club_treasurer', 'medical_staff', 'athlete', 'technical_director'
    ];

    if (clubRoles.includes(role) && !clubId) {
      setError(`خطأ: المستخدم له دور "${role}" ولكنه غير مرتبط بنادٍ. يرجى التواصل مع المسؤول.`);
      console.error("User object is missing clubId for a club-based role:", user);
      return;
    }

    try {
      if (clubId) {
        console.log('===Login Debug: Checking club existence for clubId===', clubId);
        
        try {
          const clubExists = await ClubsService.getClubById(clubId);
          if (!clubExists) {
            setError('النادي المرتبط بحسابك لم يعد موجودًا. يرجى التواصل مع المسؤول.');
            return;
          }
        } catch (clubError) {
          setError('حدث خطأ أثناء التحقق من وجود النادي. يرجى التواصل مع المسؤول.');
          return;
        }
        
        let path = '';
        switch (role) {
          case 'club_president': path = `/club/${clubId}/staff/president`; break;
          case 'coach': path = `/club/${clubId}/staff/coach`; break;
          case 'physical_trainer': path = `/club/${clubId}/staff/physical-trainer`; break;
          case 'club_general_secretary': path = `/club/${clubId}/staff/general-secretary`; break;
          case 'club_treasurer': path = `/club/${clubId}/staff/treasurer`; break;
          case 'medical_staff': path = `/club/${clubId}/staff/medical`; break;
          case 'technical_director': path = `/club/${clubId}/staff/technical-director`; break;
          case 'athlete': path = `/club/${clubId}`; break;
          default: setError('دور النادي غير معروف.'); return;
        }
        navigate(path);
      } else {
        // استخدام wilayaId من الـ URL أو من بيانات المستخدم
        const wilayaId = selectedWilayaId || '01';
        let path = '';
        switch (role) {
          case 'league_president': path = `/league/${wilayaId}/staff/president`; break;
          case 'technical_director': path = `/league/${wilayaId}/staff/technical-director`; break;
          case 'league_technical_director': path = `/league/${wilayaId}/staff/technical-director`; break;
          case 'general_secretary': path = `/league/${wilayaId}/staff/general-secretary`; break;
          case 'treasurer': path = `/league/${wilayaId}/staff/treasurer`; break;
          case 'admin': navigate('/'); return;
          default: setError('دور المستخدم غير معروف أو غير مرتبط بكيان.'); return;
        }
        navigate(path);
      }
    } catch (err) {
      console.error("Redirection error:", err);
      setError("حدث خطأ أثناء إعادة التوجيه.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('===Login Debug: Attempting login===', { username, selectedRole, selectedClubId, selectedLeagueId });
      const user = await UsersService.login(
        username,
        password,
        selectedRole || undefined,
        selectedClubId || undefined,
        selectedLeagueId || undefined
      );
      console.log('===Login Debug: Login result===', user);

      if (user) {
        console.log('===Login Debug: User found, checking details===', {
          username: user.username,
          role: user.role,
          clubId: user.clubId,
          isActive: user.isActive
        });
        
        if (!user.isActive) {
          setError('حسابك غير نشط. يرجى التواصل مع المسؤول');
          setIsLoading(false);
          return;
        }

        const state = location.state as { from?: Location };
        if (state?.from?.pathname) {
          navigate(state.from.pathname);
        } else {
          await redirectToUserPage(user);
        }
      } else {
        console.warn('===Login Debug: No user found with provided credentials===');
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login exception:', err);
      if (err instanceof Error && err.message === 'MULTIPLE_ACCOUNTS') {
        // عرض قائمة الحسابات المتاحة للاختيار
        const accounts = localStorage.getItem('available_accounts');
        if (accounts) {
          setAvailableAccounts(JSON.parse(accounts));
          setShowAccountSelector(true);
          localStorage.removeItem('available_accounts');
        }
      } else {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = async (account: AvailableAccount) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await UsersService.login(username, password, account.role, account.clubId, account.leagueId);
      if (user) {
        setShowAccountSelector(false);
        await redirectToUserPage(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <Image 
                  src="/vite.svg" 
                  alt="Logo" 
                  width="80" 
                  height="80" 
                  className="mb-3"
                />
                <h2 className="fw-bold">تسجيل الدخول</h2>
                <p className="text-muted">مرحباً بك في منصة الجودو</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {currentUserMismatch.hasUser && currentUserMismatch.mismatch && (
                <Alert variant="warning" className="mb-3" dir="rtl">
                  أنت مسجل الدخول حالياً بدور "{currentUserMismatch.currentRole}".
                  طلبت الدخول كـ "{selectedRole || '—'}" لنادي {selectedClubId || '—'}.
                  <div className="mt-2 d-flex gap-2">
                    <Button variant="outline-warning" size="sm" onClick={handleLogoutAndSwitch}>
                      تسجيل الخروج والمتابعة بهذا الدور
                    </Button>
                  </div>
                </Alert>
              )}



              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>اسم المستخدم</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>كلمة المرور</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  <Link to="/">العودة للصفحة الرئيسية</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLoginPage;