import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import './MedicalDashboard.css';
import DailyWellnessForm from './DailyWellnessForm';
import InjuryReportForm from './InjuryReportForm';
import WellnessChart from './WellnessChart';

interface Props {
  athleteId: string;
  athleteName: string;
}

const DynamicMedicalDashboard: React.FC<Props> = ({ athleteId, athleteName }) => {
  const [todayWellness, setTodayWellness] = useState<any>(null);
  const [recentWellness, setRecentWellness] = useState<any[]>([]);
  const [activeInjuries, setActiveInjuries] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // تحميل البيانات
  const loadDashboardData = () => {
    // بيانات تجريبية
    const mockData = {
      todayWellness: {
        id: '1',
        athleteId,
        date: new Date(),
        wellnessScore: 4.2,
        sleepQuality: 4,
        fatigueLevel: 2,
        muscleSoreness: 3,
        stressLevel: 2,
        mood: 4
      },
      recentWellness: [
        { date: new Date(Date.now() - 86400000), wellnessScore: 4.0 },
        { date: new Date(Date.now() - 172800000), wellnessScore: 3.8 },
        { date: new Date(Date.now() - 259200000), wellnessScore: 4.1 }
      ],
      activeInjuries: [
        {
          id: '1',
          injuryLocation: 'الركبة اليسرى',
          status: 'ACTIVE',
          painLevel: 5,
          reportDate: new Date(Date.now() - 86400000 * 3)
        }
      ],
      alerts: [
        {
          id: '1',
          message: 'انخفاض في جودة النوم',
          severity: 'MEDIUM',
          triggeredDate: new Date()
        }
      ]
    };

    setTodayWellness(mockData.todayWellness);
    setRecentWellness(mockData.recentWellness);
    setActiveInjuries(mockData.activeInjuries);
    setAlerts(mockData.alerts);
  };

  useEffect(() => {
    loadDashboardData();
  }, [athleteId]);

  const handleWellnessSubmit = (wellness: any) => {
    setTodayWellness(wellness);
  };

  const handleInjurySubmit = (injury: any) => {
    setActiveInjuries([...activeInjuries, injury]);
  };

  const getHealthColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    return 'danger';
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>المركز الصحي الذكي - {athleteName}</h2>
          <p className="text-muted">تقييم ديناميكي يومي لصحتك وأدائك</p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
            <Tab eventKey="overview" title="نظرة عامة">
              <Row>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>مؤشر الصحة اليومي</h5>
                      <h2 className={`text-${getHealthColor(todayWellness?.wellnessScore || 0)}`}>
                        {todayWellness?.wellnessScore || '--'}
                      </h2>
                      <small>من 5.0</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>الإصابات النشطة</h5>
                      <h2 className="text-danger">
                        {activeInjuries.length}
                      </h2>
                      <small>تحت المتابعة</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>التنبيهات</h5>
                      <h2 className="text-warning">
                        {alerts.length}
                      </h2>
                      <small>تتطلب الانتباه</small>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h5>جودة النوم</h5>
                      <h2 className={`text-${getHealthColor(todayWellness?.sleepQuality || 0)}`}>
                        {todayWellness?.sleepQuality || '--'}
                      </h2>
                      <small>من 5.0</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey="wellness" title="الرفاهية اليومية">
              <Row>
                <Col md={6}>
                  <DailyWellnessForm
                    athleteId={athleteId}
                    onSubmit={handleWellnessSubmit}
                    onCancel={() => console.log('Wellness form cancelled')}
                  />
                </Col>
                <Col md={6}>
                  <WellnessChart data={recentWellness} />
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey="injuries" title="الإصابات">
              <Row>
                <Col md={6}>
                  <InjuryReportForm
                    athleteId={athleteId}
                    onSubmit={handleInjurySubmit}
                    onCancel={() => console.log('Injury report cancelled')}
                  />
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>الإصابات النشطة</Card.Header>
                    <Card.Body>
                      {activeInjuries.length > 0 ? (
                        activeInjuries.map((injury) => (
                          <div key={injury.id} className="mb-3 p-3 border rounded">
                            <h6>{injury.injuryLocation}</h6>
                            <p className="mb-1">المستوى: {injury.painLevel}/10</p>
                            <small className="text-muted">
                              منذ {Math.floor((Date.now() - injury.reportDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
                            </small>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">لا توجد إصابات نشطة</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default DynamicMedicalDashboard;