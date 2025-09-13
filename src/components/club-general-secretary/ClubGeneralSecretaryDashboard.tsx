import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { StaffService } from '../../services/mockDataService';
import type { Staff } from '../../types';
import { StaffPosition } from '../../types';
import StaffMemberPage from '../staff/StaffMemberPage';

interface ClubGeneralSecretaryDashboardProps {
  clubId: string;
}

const ClubGeneralSecretaryDashboard: React.FC<ClubGeneralSecretaryDashboardProps> = ({ clubId }) => {
  const [secretary, setSecretary] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const staff = await StaffService.getStaffByClub(clubId);
        const s = staff.find((m) => m.position === StaffPosition.GENERAL_SECRETARY) || null;
        if (mounted) setSecretary(s);
      } catch (e) {
        console.error(e);
        if (mounted) setError('حدث خطأ أثناء تحميل بيانات الكاتب العام للنادي');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clubId]);

  const additionalInfo = useMemo(() => ({
    responsibilities: [
      'إدارة المراسلات والمستندات',
      'تنظيم الاجتماعات ومحاضرها',
      'التنسيق الإداري داخل النادي',
    ],
    socialMedia: {},
  }), []);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="text-end" dir="rtl">{error}</Alert>
      </Container>
    );
  }

  if (!secretary) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="text-end" dir="rtl">
          لا توجد بيانات للكاتب العام حالياً.
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-warning text-dark py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center mb-3">
                <Link to={`/club/${clubId}`} className="btn btn-outline-dark me-3">
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للنادي
                </Link>
              </div>
              <h1 className="h3 mb-0" dir="rtl">
                <i className="fas fa-file-alt me-3"></i>
                لوحة الكاتب العام - {secretary.firstNameAr} {secretary.lastNameAr}
              </h1>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation */}
      <section className="bg-light py-3">
        <Container>
          <Nav variant="pills" className="justify-content-center flex-wrap">
            <Nav.Item>
              <Nav.Link active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} className="mx-2 fw-bold mb-2">
                <i className="fas fa-id-badge me-2"></i>
                الملف الشخصي
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} className="mx-2 fw-bold mb-2">
                <i className="fas fa-folder-open me-2"></i>
                الوثائق والمراسلات
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={activeTab === 'meetings'} onClick={() => setActiveTab('meetings')} className="mx-2 fw-bold mb-2">
                <i className="fas fa-handshake me-2"></i>
                الاجتماعات
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </section>

      {/* Content */}
      <section className="py-4">
        <Container>
          {activeTab === 'profile' && (
            <StaffMemberPage staff={secretary} clubId={clubId} additionalInfo={additionalInfo} />
          )}

          {activeTab === 'documents' && (
            <Card className="shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h4 className="mb-0 text-center" dir="rtl">
                  <i className="fas fa-folder-open me-2"></i>
                  الوثائق والمراسلات
                </h4>
              </Card.Header>
              <Card.Body className="p-4 text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>ستُضاف إدارة الملفات والمراسلات قريباً.</p>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'meetings' && (
            <Card className="shadow-sm">
              <Card.Header className="bg-info text-white">
                <h4 className="mb-0 text-center" dir="rtl">
                  <i className="fas fa-handshake me-2"></i>
                  اجتماعات المكتب
                </h4>
              </Card.Header>
              <Card.Body className="p-4 text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>ستُضاف إدارة الجلسات والمتابعة قريباً.</p>
              </Card.Body>
            </Card>
          )}
        </Container>
      </section>
    </div>
  );
};

export default ClubGeneralSecretaryDashboard;
