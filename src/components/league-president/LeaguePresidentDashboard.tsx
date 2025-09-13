import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Nav, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { StaffService } from '../../services/mockDataService';
import type { Staff } from '../../types';
import { StaffPosition } from '../../types';
import StaffMemberPage from '../staff/StaffMemberPage';
import CompetitionManagement from '../admin/CompetitionManagement';

interface LeaguePresidentDashboardProps {
  leagueId: string;
}

const LeaguePresidentDashboard: React.FC<LeaguePresidentDashboardProps> = ({ leagueId }) => {
  const [president, setPresident] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const staff = await StaffService.getStaffByLeague(leagueId);
        const p = staff.find((s) => s.position === StaffPosition.LEAGUE_PRESIDENT) || null;
        if (mounted) setPresident(p);
      } catch (e) {
        console.error(e);
        if (mounted) setError('حدث خطأ أثناء تحميل بيانات رئيس الرابطة');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [leagueId]);

  const additionalInfo = useMemo(() => ({
    responsibilities: [
      'التمثيل الرسمي للرابطة',
      'الإشراف العام على الخطط والبرامج',
      'متابعة التقارير المالية والإدارية',
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

  if (!president) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="text-end" dir="rtl">
          لا توجد بيانات لرئيس الرابطة حالياً.
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-success text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center mb-3">
                <Link to={`/league/${leagueId}`} className="btn btn-outline-light me-3">
                  <i className="fas fa-arrow-right me-2"></i>
                  العودة للرابطة
                </Link>
              </div>
              <h1 className="h3 mb-0" dir="rtl">
                <i className="fas fa-crown me-3"></i>
                لوحة رئيس الرابطة - {president.firstNameAr} {president.lastNameAr}
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
              <Nav.Link active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} className="mx-2 fw-bold mb-2">
                <i className="fas fa-landmark me-2"></i>
                الحوكمة والقرارات
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} className="mx-2 fw-bold mb-2">
                <i className="fas fa-trophy me-2"></i>
                إدارة المنافسات
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
            <StaffMemberPage staff={president} leagueId={leagueId} additionalInfo={additionalInfo} />
          )}

          {activeTab === 'competitions' && (
            <CompetitionManagement 
              organizerId={leagueId}
              organizerType="provincial"
            />
          )}

          {activeTab === 'governance' && (
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0 text-center" dir="rtl">
                  <i className="fas fa-landmark me-2"></i>
                  الحوكمة والقرارات
                </h4>
              </Card.Header>
              <Card.Body className="p-4 text-center text-muted">
                <i className="fas fa-tools fa-3x mb-3"></i>
                <h5>قيد التطوير</h5>
                <p>ستُضاف إدارة القرارات ومحاضر الاجتماعات قريباً.</p>
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
                <p>ستُضاف إدارة الجلسات والمهام والمتابعة قريباً.</p>
              </Card.Body>
            </Card>
          )}
        </Container>
      </section>
    </div>
  );
};

export default LeaguePresidentDashboard;