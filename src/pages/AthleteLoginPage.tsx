import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link, useParams, useNavigate } from 'react-router-dom';

import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { UsersService } from '../services/firestoreService';
import { ClubsService } from '../services/firestoreService';

const AthleteLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [club, setClub] = useState<any>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ clubId: string }>();
  const searchParams = new URLSearchParams(location.search);
  const clubId = params.clubId || searchParams.get('clubId') || undefined;

  useEffect(() => {
    const fetchClub = async () => {
      if (clubId) {
        try {
          const clubData = await ClubsService.getClubById(clubId);
          setClub(clubData);
        } catch (err) {
          console.error('Error fetching club:', err);
        }
      }
    };

    fetchClub();
  }, [clubId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('===AthleteLogin Debug: Attempting login===', { username, clubId });

      // Check if user is logged in
      const currentUser = UsersService.getCurrentUser();
      if (currentUser) {
        // If user is already logged in, check if they are an athlete
        if (currentUser.role === 'athlete' && currentUser.clubId === clubId) {
          console.log('===AthleteLogin Debug: User already logged in as athlete for this club===');
          // Redirect to athlete page
          navigate(`/club/${clubId}/athlete/${currentUser.id}`, { replace: true });
          return;
        } else {
          // Logout current user if not an athlete for this club
          UsersService.logout();
        }
      }

      // Attempt login
      const user = await UsersService.login(username, password, 'athlete', clubId);

      if (user) {
        console.log('===AthleteLogin Debug: Login successful===', user);

        // Check if user is an athlete and belongs to the specified club
        if (user.role === 'athlete' && user.clubId === clubId) {
          console.log('===AthleteLogin Debug: User is athlete for this club===');
          // Redirect to athlete page
          navigate(`/club/${clubId}/athlete/${user.id}`, { replace: true });
        } else {
          console.error('===AthleteLogin Debug: User is not an athlete for this club===');
          UsersService.logout();
          setError('غير مصرح لك بالوصول. هذه الصفحة مخصصة للرياضيين في هذا النادي فقط.');
        }
      } else {
        console.error('===AthleteLogin Debug: Login failed===');
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('===AthleteLogin Debug: Login error===', err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  if (!clubId) {
    return (
      <Container className="py-5">
        <Alert variant="danger">معرف النادي مفقود</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg">
            <Card.Header className="bg-success text-white text-center py-3">
              <h4 className="mb-0">تسجيل دخول الرياضي</h4>
              <p className="mb-0">{club?.nameAr || 'النادي'}</p>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>اسم المستخدم</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
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
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-2">ليس لديك حساب؟</p>
                <p className="text-muted">تواصل مع مدرب النادي لإنشاء حسابك</p>
              </div>

              <div className="text-center mt-3">
                <Link to={`/club/${clubId}`} className="btn btn-outline-secondary">
                  العودة للنادي
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AthleteLoginPage;