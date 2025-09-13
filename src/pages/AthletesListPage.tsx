import React, { useState, useEffect } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { UsersService } from '../services/firestoreService';
import { ClubsService } from '../services/firestoreService';

const AthletesListPage: React.FC = () => {
  // Check if user is logged in
  const currentUser = UsersService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has authorized role
  const authorizedRoles = ['coach', 'athlete', 'club_president', 'club_general_secretary', 'club_treasurer'];
  if (!authorizedRoles.includes(currentUser.role)) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>غير مصرح بالوصول</h2>
          <p className="text-muted">هذه الصفحة مخصصة للطاقم الفني والرياضيين فقط</p>
        </div>
      </Container>
    );
  }

  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId) {
        setError('معرف النادي مفقود');
        setLoading(false);
        return;
      }

      try {
        // Fetch club data
        const clubData = await ClubsService.getClubById(clubId);
        setClub(clubData);

        // Fetch athletes for this club
        const athletesData = await UsersService.getAthletesByClub(clubId);
        setAthletes(athletesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  if (loading) {
    return (
      <Container className="py-5 d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
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

  return (
    <div>
      {/* Header Section */}
      <section className="bg-success text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center mb-3">
                <Link
                  to={`/club/${clubId}`}
                  className="btn btn-outline-light me-3"
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للنادي
                </Link>
              </div>
              <h1 className="display-5 fw-bold mb-3" dir="rtl">
                الرياضيون
              </h1>
              <p className="lead mb-3" dir="rtl">
                قائمة الرياضيين في {club.nameAr}
              </p>
              <Button variant="light" className="me-2">
                <i className="fas fa-plus me-2"></i>
                إضافة رياضي
              </Button>
              <Button
                variant="outline-light"
                onClick={() => window.location.href = `/club/${clubId}/athlete/login?clubId=${clubId}`}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                تسجيل الدخول كرياضي
              </Button>
            </Col>
            <Col lg={4} className="text-center">
              <img
                src={club.image || '/images/default-club.jpg'}
                alt={club.nameAr}
                className="img-fluid rounded-circle shadow"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        {athletes.length > 0 ? (
          <Card className="shadow-lg">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0 text-center" dir="rtl">قائمة الرياضيين</h4>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-center">#</th>
                    <th className="text-end">الاسم</th>
                    <th className="text-center">الحزام</th>
                    <th className="text-center">الوزن</th>
                    <th className="text-center">الطول</th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((athlete, index) => (
                    <tr key={athlete.id}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <div>
                            <div className="fw-bold">{`${athlete.firstNameAr} ${athlete.lastNameAr}`}</div>
                            <small className="text-muted">{athlete.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary">
                          {athlete.belt || 'أبيض'}
                        </span>
                      </td>
                      <td className="text-center">{athlete.weight || '-'}</td>
                      <td className="text-center">{athlete.height || '-'}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => window.location.href = `/club/${clubId}/athlete/${athlete.id}`}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <Card.Body className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">لا يوجد رياضيون مسجلون</h4>
              <p className="text-muted">لم يتم تسجيل أي رياضي في هذا النادي بعد</p>
              <Button variant="success">
                <i className="fas fa-plus me-2"></i>
                إضافة رياضي
              </Button>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AthletesListPage;