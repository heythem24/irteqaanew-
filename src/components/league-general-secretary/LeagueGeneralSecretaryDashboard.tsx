import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TransferRequestForm from './TransferRequestForm';
import BasicLaw from './BasicLaw';
import InternalRegulations from './InternalRegulations';
import DisciplinarySystem from './DisciplinarySystem';
import FoundingMembersList from './FoundingMembersList';
import ExecutiveBoardList from './ExecutiveBoardList';
import HandoverReport from './HandoverReport';
import TrainingContract from './TrainingContract';

interface LeagueGeneralSecretaryDashboardProps {
  leagueId?: string;
}

const LeagueGeneralSecretaryDashboard: React.FC<LeagueGeneralSecretaryDashboardProps> = ({ leagueId }) => {
  const { wilayaId } = useParams<{ wilayaId: string }>();
  const [activeKey, setActiveKey] = useState('overview');

  // Statistics data (mock data)
  const stats = {
    totalTransferRequests: 24,
    pendingRequests: 8,
    approvedRequests: 15,
    rejectedRequests: 1,
    totalClubs: 12,
    totalAthletes: 186
  };

  const recentRequests = [
    {
      id: 1,
      athleteName: 'أحمد بن علي',
      fromClub: 'نادي النصر',
      toClub: 'نادي الوداد',
      date: '2024-08-05',
      status: 'pending'
    },
    {
      id: 2,
      athleteName: 'فاطمة محمد',
      fromClub: 'نادي الشباب',
      toClub: 'نادي الأمل',
      date: '2024-08-03',
      status: 'approved'
    },
    {
      id: 3,
      athleteName: 'محمد الأمين',
      fromClub: 'نادي الفجر',
      toClub: 'نادي النصر',
      date: '2024-08-01',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'موافق عليه';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      default: return 'غير محدد';
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-end" dir="rtl">
          <i className="fas fa-file-alt me-3"></i>
          لوحة تحكم الكاتب العام للرابطة
        </h2>
      </div>

      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || 'overview')}>
        <Row>
          <Col lg={3}>
            <Card className="shadow-sm">
              <Card.Header className="bg-warning text-white">
                <h5 className="mb-0 text-end" dir="rtl">
                  <i className="fas fa-bars me-2"></i>
                  القائمة الرئيسية
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-chart-bar me-2"></i>
                      نظرة عامة
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="transfer-request" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-exchange-alt me-2"></i>
                      طلب تحويل جديد
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="requests-management" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-list me-2"></i>
                      إدارة طلبات التحويل
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="reports" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-file-alt me-2"></i>
                      التقارير
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="documents" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-folder-open me-2"></i>
                      الوثائق الرسمية
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="basic-law" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-book me-2"></i>
                      القانون الأساسي
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="internal-regulations" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-gavel me-2"></i>
                      النظام الداخلي
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="disciplinary-system" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-balance-scale me-2"></i>
                      النظام التأديبي
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="founding-members" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-users me-2"></i>
                      قائمة الأعضاء المؤسسين
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="executive-board" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-user-tie me-2"></i>
                      قائمة أعضاء المكتب التنفيذي
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="handover-report" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-file-signature me-2"></i>
                      محضر تسليم واستلام المهام
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="training-contract" className="text-end border-0 rounded-0" dir="rtl">
                      <i className="fas fa-file-contract me-2"></i>
                      عقد تدريب
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            <Tab.Content>
              {/* نظرة عامة */}
              <Tab.Pane eventKey="overview">
                <Row className="mb-4">
                  <Col md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body className="text-center">
                        <div className="text-primary mb-3">
                          <i className="fas fa-exchange-alt fa-3x"></i>
                        </div>
                        <h3 className="text-primary">{stats.totalTransferRequests}</h3>
                        <p className="text-muted mb-0" dir="rtl">إجمالي طلبات التحويل</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body className="text-center">
                        <div className="text-warning mb-3">
                          <i className="fas fa-clock fa-3x"></i>
                        </div>
                        <h3 className="text-warning">{stats.pendingRequests}</h3>
                        <p className="text-muted mb-0" dir="rtl">طلبات قيد المراجعة</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body className="text-center">
                        <div className="text-success mb-3">
                          <i className="fas fa-check-circle fa-3x"></i>
                        </div>
                        <h3 className="text-success">{stats.approvedRequests}</h3>
                        <p className="text-muted mb-0" dir="rtl">طلبات موافق عليها</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body className="text-center">
                        <div className="text-info mb-3">
                          <i className="fas fa-home fa-3x"></i>
                        </div>
                        <h3 className="text-info">{stats.totalClubs}</h3>
                        <p className="text-muted mb-0" dir="rtl">إجمالي النوادي</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body className="text-center">
                        <div className="text-secondary mb-3">
                          <i className="fas fa-user-ninja fa-3x"></i>
                        </div>
                        <h3 className="text-secondary">{stats.totalAthletes}</h3>
                        <p className="text-muted mb-0" dir="rtl">إجمالي الرياضيين</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* الطلبات الأخيرة */}
                <Card className="shadow-sm">
                  <Card.Header className="bg-warning text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                      <i className="fas fa-clock me-2"></i>
                      طلبات التحويل الأخيرة
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {recentRequests.map((request) => (
                      <div key={request.id} className="border-bottom pb-3 mb-3">
                        <Row className="align-items-center">
                          <Col md={8}>
                            <h6 className="mb-1 text-end" dir="rtl">
                              <strong>{request.athleteName}</strong>
                            </h6>
                            <p className="mb-1 text-muted text-end" dir="rtl">
                              من: <strong>{request.fromClub}</strong> إلى: <strong>{request.toClub}</strong>
                            </p>
                            <small className="text-muted">{request.date}</small>
                          </Col>
                          <Col md={4} className="text-end">
                            <Button
                              variant={`outline-${getStatusColor(request.status)}`}
                              size="sm"
                              className="me-2"
                            >
                              {getStatusText(request.status)}
                            </Button>
                            <Button variant="outline-primary" size="sm">
                              <i className="fas fa-eye"></i>
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* طلب تحويل جديد */}
              <Tab.Pane eventKey="transfer-request">
                <Card className="shadow-sm">
                  <Card.Header className="bg-warning text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                      <i className="fas fa-plus-circle me-2"></i>
                      إنشاء طلب تحويل جديد
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <TransferRequestForm leagueId={wilayaId} />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* إدارة طلبات التحويل */}
              <Tab.Pane eventKey="requests-management">
                <Card className="shadow-sm">
                  <Card.Header className="bg-warning text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                      <i className="fas fa-list me-2"></i>
                      إدارة جميع طلبات التحويل
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info" className="text-end" dir="rtl">
                      <i className="fas fa-info-circle me-2"></i>
                      هذا القسم قيد التطوير. سيتم إضافة وظائف إدارة طلبات التحويل قريباً.
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* التقارير */}
              <Tab.Pane eventKey="reports">
                <Card className="shadow-sm">
                  <Card.Header className="bg-warning text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                      <i className="fas fa-chart-line me-2"></i>
                      التقارير والإحصائيات
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info" className="text-end" dir="rtl">
                      <i className="fas fa-info-circle me-2"></i>
                      قسم التقارير قيد التطوير. سيتم إضافة تقارير مفصلة حول حركة انتقالات الرياضيين.
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* الوثائق الرسمية */}
              <Tab.Pane eventKey="documents">
                <Card className="shadow-sm">
                  <Card.Header className="bg-warning text-white">
                    <h5 className="mb-0 text-end" dir="rtl">
                      <i className="fas fa-folder-open me-2"></i>
                      الوثائق والنماذج الرسمية
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info" className="text-end" dir="rtl">
                      <i className="fas fa-info-circle me-2"></i>
                      قسم الوثائق الرسمية قيد التطوير. سيتم إضافة النماذج والوثائق المطلوبة.
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* القانون الأساسي */}
              <Tab.Pane eventKey="basic-law">
                <BasicLaw />
              </Tab.Pane>

              {/* النظام الداخلي */}
              <Tab.Pane eventKey="internal-regulations">
                <InternalRegulations />
              </Tab.Pane>

              {/* النظام التأديبي */}
              <Tab.Pane eventKey="disciplinary-system">
                <DisciplinarySystem />
              </Tab.Pane>

              {/* قائمة الأعضاء المؤسسين */}
              <Tab.Pane eventKey="founding-members">
                <FoundingMembersList />
              </Tab.Pane>

              {/* قائمة أعضاء المكتب التنفيذي */}
              <Tab.Pane eventKey="executive-board">
                <ExecutiveBoardList />
              </Tab.Pane>

              {/* محضر تسليم واستلام المهام */}
              <Tab.Pane eventKey="handover-report">
                <HandoverReport />
              </Tab.Pane>

              {/* عقد تدريب */}
              <Tab.Pane eventKey="training-contract">
                <TrainingContract />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default LeagueGeneralSecretaryDashboard;
