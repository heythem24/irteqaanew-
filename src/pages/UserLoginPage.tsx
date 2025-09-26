import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { UsersService, ClubsService } from '../services/firestoreService';
import { Link } from 'react-router-dom';

const UserLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [currentUserMismatch, setCurrentUserMismatch] = useState<{ hasUser: boolean; mismatch: boolean; currentRole?: string; currentClubId?: string }>({ hasUser: false, mismatch: false });
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

  // Read role and clubId from query params, prefill and optionally hide selector
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const roleParam = sp.get('role');
      const clubParam = sp.get('clubId');
      if (roleParam) setSelectedRole(roleParam);
      if (clubParam) setSelectedClubId(clubParam);
      // If already logged in, check mismatch with intent
      const cu = UsersService.getCurrentUser();
      if (cu) {
        const desiredRole = roleParam || undefined;
        const desiredClub = clubParam || undefined;
        const mismatch = (!!desiredRole && cu.role !== desiredRole) || (!!desiredClub && cu.clubId !== desiredClub);
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
    const { role, clubId } = user;

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
        console.log('===Login Debug: User details===', { username, role, clubId });
        
        try {
          const clubExists = await ClubsService.getClubById(clubId);
          console.log('===Login Debug: Club existence check result===', clubExists);
          
          if (!clubExists) {
            console.error('===Login Debug: Club not found for user===', { username, role, clubId });
            setError('النادي المرتبط بحسابك لم يعد موجودًا. يرجى التواصل مع المسؤول.');
            return;
          }
          
          console.log('===Login Debug: Club found, proceeding with login===', clubExists);
        } catch (clubError) {
          console.error('===Login Debug: Error checking club existence===', clubError);
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
        let path = '';
        switch (role) {
          case 'league_president': path = '/league/01/staff/president'; break;
          case 'technical_director': path = '/league/01/staff/technical-director'; break;
          case 'league_technical_director': path = '/league/01/staff/technical-director'; break;
          case 'general_secretary': path = '/league/01/staff/general-secretary'; break;
          case 'treasurer': path = '/league/01/staff/treasurer'; break;
          case 'admin': navigate('/'); break; // Admin goes to homepage for now
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
      console.log('===Login Debug: Attempting login for username===', username);
      const user = await UsersService.login(
        username,
        password,
        selectedRole || undefined,
        selectedClubId || undefined
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

                {(!selectedRole) && (
                  <Form.Group className="mb-4" controlId="role">
                    <Form.Label>الدور (اختياري)</Form.Label>
                    <Form.Select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="">— بدون تحديد —</option>
                      <option value="club_president">رئيس النادي</option>
                      <option value="coach">المدرب</option>
                      <option value="physical_trainer">المحضر البدني</option>
                      <option value="club_general_secretary">الكاتب العام للنادي</option>
                      <option value="club_treasurer">أمين مال النادي</option>
                      <option value="medical_staff">الطاقم الطبي</option>
                      <option value="athlete">رياضي</option>
                      <option value="league_president">رئيس الرابطة</option>
                      <option value="league_technical_director">المدير التقني للرابطة</option>
                      <option value="technical_director">المدير التقني</option>
                      <option value="general_secretary">الكاتب العام للرابطة</option>
                      <option value="treasurer">أمين مال الرابطة</option>
                      <option value="admin">مسؤول النظام</option>
                    </Form.Select>
                    <Form.Text className="text-muted">اختر الدور إذا كان اسم المستخدم مستخدماً لأكثر من حساب.</Form.Text>
                  </Form.Group>
                )}

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